import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const prompts: Record<string, (sunSign: string, moonSign: string, ascendant: string, dateStr: string) => string> = {
  luckyNumber: (sunSign, moonSign, ascendant, dateStr) => `Fecha actual: ${dateStr}

Para una persona con personalidad tipo ${sunSign}, emociones tipo ${moonSign} y que proyecta energía de ${ascendant}, genera en formato JSON exacto (sin markdown, sin backticks):

IMPORTANTE: No uses términos astrológicos técnicos. Explica todo en lenguaje cotidiano.

{
  "number": <número de la suerte del 1 al 99 para hoy>,
  "reason": "<explicación sencilla de por qué este número es especial para esta persona hoy, máximo 3 oraciones, sin jerga técnica>"
}`,

  ritual: (sunSign, moonSign, ascendant, dateStr) => `Fecha actual: ${dateStr}

Para una persona con personalidad tipo ${sunSign}, emociones tipo ${moonSign} y que proyecta energía de ${ascendant}, genera un ritual relajante con velas en formato JSON exacto (sin markdown, sin backticks):

IMPORTANTE: No uses términos astrológicos. Describe el ritual como una actividad de bienestar personal.

{
  "candleColor": "<color de vela recomendado para esta persona hoy>",
  "title": "<nombre corto del ritual, máximo 5 palabras>",
  "description": "<pasos sencillos del ritual con la vela, enfocado en relajación y bienestar, máximo 5 oraciones>",
  "bestTime": "<mejor momento del día para hacerlo>"
}`,

  amulet: (sunSign, moonSign, ascendant, dateStr) => `Fecha actual: ${dateStr}

Para una persona con personalidad tipo ${sunSign}, emociones tipo ${moonSign} y que proyecta energía de ${ascendant}, genera un amuleto de la suerte en formato JSON exacto (sin markdown, sin backticks):

IMPORTANTE: No uses términos astrológicos. Habla de las propiedades de la piedra en términos de bienestar y energía positiva.

{
  "stone": "<nombre de la piedra o cristal recomendado para esta persona>",
  "emoji": "<emoji que represente la piedra>",
  "properties": "<beneficios de la piedra para el bienestar emocional y mental, máximo 3 oraciones>",
  "howToUse": "<cómo llevar o usar el amuleto en el día a día, máximo 3 oraciones>"
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, sun_sign_name, moon_sign, ascendant } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const promptFn = prompts[type];
    if (!promptFn) throw new Error(`Invalid type: ${type}`);

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

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
            content: "Eres un astrólogo y guía espiritual experto. Respondes en español con tono místico. Debes responder SOLO en el formato JSON solicitado, sin texto adicional, sin markdown, sin backticks."
          },
          {
            role: "user",
            content: promptFn(sun_sign_name, moon_sign, ascendant, dateStr),
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido, intenta de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Failed to parse JSON:", text);
      return new Response(JSON.stringify({ error: "Error al procesar la respuesta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("astral-extras error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
