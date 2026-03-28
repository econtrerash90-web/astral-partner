import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const buildPrompt = (req: ReadingRequest, dateStr: string): string => {
  const base = `Fecha actual: ${dateStr}\nPersona con Sol en ${req.sun_sign_name}, Luna en ${req.moon_sign}, Ascendente en ${req.ascendant}.\nCategoría: ${req.category}${req.question ? `\nPregunta: ${req.question}` : ""}`;

  switch (req.type) {
    case "tarot": {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      return `${base}

Realiza una tirada de tarot de 3 cartas: Pasado, Presente y Futuro.
Las cartas seleccionadas son: ${selected.join(", ")}.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "cards": [
    { "name": "${selected[0]}", "position": "Pasado", "emoji": "<emoji representativo>", "meaning": "<interpretación de 2-3 oraciones para esta posición>" },
    { "name": "${selected[1]}", "position": "Presente", "emoji": "<emoji representativo>", "meaning": "<interpretación de 2-3 oraciones para esta posición>" },
    { "name": "${selected[2]}", "position": "Futuro", "emoji": "<emoji representativo>", "meaning": "<interpretación de 2-3 oraciones para esta posición>" }
  ],
  "synthesis": "<síntesis general de la lectura, 3-4 oraciones conectando las tres cartas>",
  "advice": "<consejo práctico basado en la lectura, 1-2 oraciones>"
}`;
    }

    case "secret":
      return `${base}

Genera una lectura tipo "El Secreto" (Ley de Atracción) con una afirmación poderosa, un mensaje del universo y una acción concreta para hoy.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "title": "<título corto de la revelación, 3-5 palabras>",
  "emoji": "<emoji representativo>",
  "affirmation": "<afirmación poderosa en primera persona para repetir, 1-2 oraciones>",
  "message": "<mensaje del universo personalizado según la carta astral, 3-4 oraciones>",
  "action": "<acción concreta para hoy basada en la ley de atracción, 2-3 oraciones>",
  "mantra": "<mantra corto de 5-8 palabras para meditar>"
}`;

    case "angels":
      return `${base}

Genera un mensaje angelical con el nombre del ángel o arcángel que guía a esta persona hoy, su mensaje, una oración y un ritual opcional.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "angelName": "<nombre del ángel o arcángel>",
  "emoji": "<emoji representativo>",
  "title": "<título del mensaje, 3-5 palabras>",
  "message": "<mensaje angelical personalizado, 3-4 oraciones con tono amoroso y espiritual>",
  "prayer": "<oración sugerida para conectar con este ángel, 2-3 oraciones>",
  "ritual": "<ritual opcional sencillo con vela o incienso, 2-3 oraciones>",
  "color": "<color asociado al ángel>"
}`;

    case "oracle":
      return `${base}

Genera una carta de oráculo con un mensaje universal profundo, una revelación sobre el camino de vida y un símbolo de poder.

Responde en JSON exacto (sin markdown, sin backticks):
{
  "title": "<título de la carta oráculo, 2-4 palabras>",
  "emoji": "<emoji representativo>",
  "symbol": "<símbolo de poder: animal, elemento o arquetipo>",
  "message": "<mensaje del oráculo profundo y personalizado, 3-4 oraciones>",
  "revelation": "<revelación sobre el camino de vida, 2-3 oraciones>",
  "element": "<elemento asociado: Fuego, Agua, Tierra o Aire>",
  "power": "<cualidad o poder que se activa hoy, 1 frase corta>"
}`;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ReadingRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

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
            content: "Eres un oráculo místico, tarotista y guía espiritual experto. Respondes en español con tono místico, cálido y profundo. Debes responder SOLO en el formato JSON solicitado, sin texto adicional, sin markdown, sin backticks.",
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
