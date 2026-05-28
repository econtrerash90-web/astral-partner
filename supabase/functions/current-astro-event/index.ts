import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getUserLanguage, languageInstruction } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Sun seasons in everyday language
const SUN_SEASONS: Array<{
  sign: string;
  from: [number, number];
  to: [number, number];
}> = [
  { sign: "Capricornio", from: [12, 22], to: [1, 19] },
  { sign: "Acuario", from: [1, 20], to: [2, 18] },
  { sign: "Piscis", from: [2, 19], to: [3, 20] },
  { sign: "Aries", from: [3, 21], to: [4, 19] },
  { sign: "Tauro", from: [4, 20], to: [5, 20] },
  { sign: "Géminis", from: [5, 21], to: [6, 20] },
  { sign: "Cáncer", from: [6, 21], to: [7, 22] },
  { sign: "Leo", from: [7, 23], to: [8, 22] },
  { sign: "Virgo", from: [8, 23], to: [9, 22] },
  { sign: "Libra", from: [9, 23], to: [10, 22] },
  { sign: "Escorpio", from: [10, 23], to: [11, 21] },
  { sign: "Sagitario", from: [11, 22], to: [12, 21] },
];

const MERCURY_RX: Array<[[number, number], [number, number]]> = [
  [[1, 25], [2, 14]],
  [[5, 19], [6, 11]],
  [[9, 17], [10, 9]],
];

function inRange(m: number, d: number, from: [number, number], to: [number, number]) {
  const [fm, fd] = from, [tm, td] = to;
  if (fm <= tm) {
    return (m > fm || (m === fm && d >= fd)) && (m < tm || (m === tm && d <= td));
  }
  // wraps year
  return (m > fm || (m === fm && d >= fd)) || (m < tm || (m === tm && d <= td));
}

function fmt(m: number, d: number) {
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

function detectEvent(today: Date) {
  const m = today.getMonth() + 1;
  const d = today.getDate();

  // Mercury retrograde first if active
  for (const [from, to] of MERCURY_RX) {
    if (inRange(m, d, from, to)) {
      return {
        kind: "mercury_retrograde",
        startLabel: fmt(from[0], from[1]),
        endLabel: fmt(to[0], to[1]),
        signContext: null as string | null,
      };
    }
  }

  // Sun season
  const season = SUN_SEASONS.find((s) => inRange(m, d, s.from, s.to))!;
  return {
    kind: "sun_season",
    startLabel: fmt(season.from[0], season.from[1]),
    endLabel: fmt(season.to[0], season.to[1]),
    signContext: season.sign,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const langCode = await getUserLanguage(supabaseAuth, userData.user.id, "es");
    const langInstruction = languageInstruction(langCode);

    const { sunSign, moonSign, ascendant } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date();
    const event = detectEvent(today);

    // Validity: until end of detected window
    const [endDay, endMonth] = event.endLabel.split("/").map(Number);
    const year = today.getFullYear();
    let validUntil = new Date(year, endMonth - 1, endDay);
    if (validUntil < today) validUntil = new Date(year + 1, endMonth - 1, endDay);

    const contextLine = event.kind === "mercury_retrograde"
      ? `Energía cósmica actual: una etapa para revisar decisiones, ir con calma, releer mensajes antes de enviarlos y replantear lo que no fluye. (Del ${event.startLabel} al ${event.endLabel}).`
      : `Energía cósmica actual: temporada de ${event.signContext}. (Del ${event.startLabel} al ${event.endLabel}).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: langInstruction },
          {
            role: "system",
            content:
              "Eres un coach de vida que traduce la energía cósmica en consejos cotidianos. NUNCA uses jerga astrológica: prohibido 'tránsito', 'aspecto', 'casa', 'conjunción', 'cuadratura', 'trígono', 'nodo', 'retorno solar'. Habla de emociones, decisiones, relaciones, trabajo y bienestar. Responde SOLO con JSON válido sin markdown ni backticks.",
          },
          {
            role: "user",
            content: `${contextLine}

Persona: personalidad ${sunSign}, emociones ${moonSign}, energía exterior ${ascendant}.

Devuelve EXACTAMENTE este JSON:
{
  "eventName": "<nombre del evento en lenguaje cotidiano, máx 5 palabras>",
  "dateRange": "Del ${event.startLabel} al ${event.endLabel}",
  "whatItIs": "<1-2 frases que expliquen qué energía vivimos ahora, sin jerga>",
  "howItAffectsYou": "<2-3 frases personalizadas para esta persona usando su personalidad, emociones y energía exterior; concreto y cercano>",
  "reflectionPrompt": "<una pregunta breve y poderosa para escribir en el diario>",
  "tips": ["<consejo práctico 1>", "<consejo práctico 2>", "<consejo práctico 3>"]
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const result = {
      ...parsed,
      eventKind: event.kind,
      validUntil: validUntil.toISOString().slice(0, 10),
      generatedAt: today.toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("current-astro-event error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
