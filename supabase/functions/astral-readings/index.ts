import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReadingRequest {
  type: "tarot" | "secret" | "angels" | "oracle";
  category: string;
  question?: string;
  sun_sign_name: string;
  moon_sign: string;
  ascendant: string;
}

const TAROT_CARDS = [
  "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
  "El Hierofante", "Los Enamorados", "El Carro", "La Fuerza", "El Ermitaño",
  "La Rueda de la Fortuna", "La Justicia", "El Colgado", "La Muerte",
  "La Templanza", "El Diablo", "La Torre", "La Estrella", "La Luna",
  "El Sol", "El Juicio", "El Mundo"
];

// Server-side daily limits — must match client constants
const DAILY_LIMITS = {
  free: { tarot: 1, secret: 0, angels: 0, oracle: 0 },
  premium: { tarot: 99, secret: 99, angels: 99, oracle: 99 },
} as const;

const PREMIUM_TYPES = new Set(["secret", "angels", "oracle"]);

const buildPrompt = (req: ReadingRequest, dateStr: string): string => {
  const base = `Fecha actual: ${dateStr}\nPersona con personalidad tipo ${req.sun_sign_name}, emociones tipo ${req.moon_sign}, que proyecta energía de ${req.ascendant}.\nTema: ${req.category}${req.question ? `\nPregunta: ${req.question}` : ""}\n\nIMPORTANTE: No uses NINGÚN término astrológico técnico. Habla en lenguaje cotidiano sobre emociones, decisiones y situaciones de la vida real.`;

  switch (req.type) {
    case "tarot": {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      return `${base}

Realiza una lectura de 3 cartas: Lo que dejaste atrás, Tu momento actual, Lo que viene.
Las cartas son: ${selected.join(", ")}.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "cards": [
    { "name": "${selected[0]}", "position": "Lo que dejaste atrás", "emoji": "<emoji>", "meaning": "<qué significa esta carta para su pasado reciente, 2-3 oraciones en lenguaje simple>" },
    { "name": "${selected[1]}", "position": "Tu momento actual", "emoji": "<emoji>", "meaning": "<qué le dice esta carta sobre su situación actual, 2-3 oraciones>" },
    { "name": "${selected[2]}", "position": "Lo que viene", "emoji": "<emoji>", "meaning": "<qué puede esperar próximamente, 2-3 oraciones>" }
  ],
  "synthesis": "<resumen conectando las tres cartas en lenguaje cotidiano, 3-4 oraciones>",
  "advice": "<consejo práctico y accionable, 1-2 oraciones>"
}`;
    }

    case "secret":
      return `${base}

Genera un mensaje motivacional con una afirmación positiva, un mensaje de ánimo personalizado y una acción concreta para mejorar su día.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "title": "<título motivador corto, 3-5 palabras>",
  "emoji": "<emoji representativo>",
  "affirmation": "<frase positiva en primera persona para repetirse, 1-2 oraciones>",
  "message": "<mensaje de ánimo personalizado según su forma de ser, 3-4 oraciones>",
  "action": "<algo concreto que puede hacer hoy para sentirse mejor, 2-3 oraciones>",
  "mantra": "<frase corta de 5-8 palabras para recordar durante el día>"
}`;

    case "angels":
      return `${base}

Genera un mensaje de guía espiritual con el nombre del ángel o guía protector del día, un mensaje reconfortante y una práctica de bienestar.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "angelName": "<nombre del ángel o guía>",
  "emoji": "<emoji representativo>",
  "title": "<título del mensaje, 3-5 palabras>",
  "message": "<mensaje reconfortante y personalizado, 3-4 oraciones con tono cálido>",
  "prayer": "<meditación o reflexión sugerida, 2-3 oraciones>",
  "ritual": "<actividad sencilla de relajación con vela o incienso, 2-3 oraciones>",
  "color": "<color que representa esta guía>"
}`;

    case "oracle":
      return `${base}

Genera un mensaje de sabiduría con una revelación sobre su momento de vida actual y un símbolo que lo represente.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "title": "<título del mensaje, 2-4 palabras>",
  "emoji": "<emoji representativo>",
  "symbol": "<animal, elemento natural o figura que lo represente>",
  "message": "<mensaje de sabiduría personalizado sobre su vida actual, 3-4 oraciones>",
  "revelation": "<algo importante que debe tener en cuenta sobre su camino, 2-3 oraciones>",
  "element": "<elemento natural asociado: Fuego, Agua, Tierra o Aire>",
  "power": "<fortaleza que puede activar hoy, 1 frase corta>"
}`;
  }
};

const checkPremium = async (email: string): Promise<boolean> => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return false;
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) return false;
    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });
    return subs.data.length > 0;
  } catch (e) {
    console.error("Stripe premium check failed:", e);
    return false;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth check ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body: ReadingRequest = await req.json();
    if (!body?.type || !["tarot", "secret", "angels", "oracle"].includes(body.type)) {
      return new Response(JSON.stringify({ error: "Invalid reading type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Premium gating (server-side) ---
    let isPremium = false;
    if (PREMIUM_TYPES.has(body.type)) {
      isPremium = await checkPremium(user.email!);
      if (!isPremium) {
        return new Response(
          JSON.stringify({ error: "Esta lectura está disponible solo con Premium+." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For non-premium types, still need to know tier for limit calc
      isPremium = await checkPremium(user.email!);
    }

    // --- Daily limit enforcement (server-side) ---
    const tier = isPremium ? "premium" : "free";
    const limit = DAILY_LIMITS[tier][body.type];
    if (limit <= 0) {
      return new Response(
        JSON.stringify({ error: "Esta lectura no está disponible en tu plan." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to read counters (RLS only allows SELECT for the same user — service role bypasses)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const today = new Date().toISOString().slice(0, 10);
    const { data: limitRow } = await adminClient
      .from("daily_limits")
      .select("tarot_count, secret_count, angels_count, oracle_count")
      .eq("user_id", user.id)
      .eq("limit_date", today)
      .maybeSingle();

    const countField = `${body.type}_count` as const;
    const used = (limitRow?.[countField] as number | undefined) ?? 0;
    if (used >= limit) {
      return new Response(
        JSON.stringify({ error: "Has alcanzado tu límite diario para este tipo de lectura." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today2 = new Date();
    const dateStr = today2.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

    const prompt = buildPrompt(body, dateStr);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Eres un guía de bienestar emocional y coach de vida. Respondes en español con tono cálido, cercano y motivador. NUNCA uses términos astrológicos técnicos como tránsitos, aspectos, casas, conjunciones, retornos, nodos, etc. Habla como un amigo sabio que da consejos prácticos sobre la vida. Debes responder SOLO en el formato JSON solicitado, sin texto adicional, sin markdown, sin backticks.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido, intenta en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("astral-readings error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
