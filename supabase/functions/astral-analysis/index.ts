import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sunSign, moonSign, ascendant, birthPlace } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

    // Generate analysis
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "Eres un coach de vida y guía de bienestar personal. Ayudas a las personas a entenderse mejor a sí mismas. NUNCA uses términos astrológicos técnicos como tránsitos, aspectos, casas astrológicas, conjunciones, oposiciones, trígonos, retornos, nodos, etc. Habla en lenguaje cotidiano sobre personalidad, emociones y comportamiento. Responde siempre en español con un tono cálido y cercano."
          },
          {
            role: "user",
            content: `Haz un análisis de personalidad para alguien con estas características:
- Personalidad tipo: ${sunSign} (su esencia)
- Mundo emocional tipo: ${moonSign} (cómo siente)
- Imagen que proyecta: ${ascendant} (cómo lo ven los demás)
- Lugar de origen: ${birthPlace}

Incluye:
1. ¿Cómo es esta persona en su día a día? Sus rasgos más fuertes
2. ¿Cómo maneja sus emociones y relaciones?
3. ¿En qué es buena y en qué puede mejorar?
4. ¿Cómo se combinan estos tres aspectos de su personalidad?

NO uses jerga astrológica. Habla como si le explicaras a un amigo quién es esta persona.
Usa emojis para hacer el texto más visual (💪🧠❤️✨🌟).`
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de consultas excedido, intenta de nuevo en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (analysisResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis = analysisData.choices?.[0]?.message?.content || "Análisis no disponible.";

    // Generate weekly prediction
    const predictionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "Eres un coach de vida que da consejos semanales personalizados. Tono positivo, motivador y cercano. NUNCA uses términos astrológicos técnicos. Responde en español."
          },
          {
            role: "user",
            content: `Genera consejos para esta semana para alguien con:
- Personalidad tipo: ${sunSign}
- Emociones tipo: ${moonSign}
- Imagen que proyecta: ${ascendant}

NO uses jerga astrológica. Habla en lenguaje cotidiano sobre la vida real.

Los consejos deben cubrir:
- 💕 Amor y relaciones: cómo le irá con su pareja, familia o amigos
- 💼 Trabajo y dinero: qué oportunidades o retos puede esperar
- 🌿 Salud y bienestar: cómo cuidarse esta semana
- 💫 Consejo de la semana: algo práctico y motivador

Usa emojis y formato claro con secciones.`
          }
        ],
      }),
    });

    let prediction = "Predicción semanal en proceso...";
    if (predictionResponse.ok) {
      const predictionData = await predictionResponse.json();
      prediction = predictionData.choices?.[0]?.message?.content || prediction;
    }

    // Generate lucky number, ritual, and amulet
    const extrasResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "Eres un guía de bienestar y energía positiva. NUNCA uses términos astrológicos técnicos. Respondes en español con tono cálido. Debes responder SOLO en el formato JSON solicitado, sin texto adicional."
          },
          {
            role: "user",
            content: `Fecha actual: ${dateStr}

Para alguien con personalidad tipo ${sunSign}, emociones tipo ${moonSign} y que proyecta energía de ${ascendant}, genera en formato JSON exacto (sin markdown, sin backticks):

No uses jerga astrológica. Habla en lenguaje cotidiano.

{
  "luckyNumber": {
    "number": <número de la suerte del 1 al 99 para hoy>,
    "reason": "<por qué este número es especial para esta persona hoy, máximo 2 oraciones, sin jerga>"
  },
  "ritual": {
    "candleColor": "<color de vela recomendado para esta persona>",
    "title": "<nombre corto del ritual, máximo 5 palabras>",
    "description": "<pasos sencillos del ritual enfocado en relajación y bienestar, máximo 4 oraciones>",
    "bestTime": "<mejor momento del día para hacerlo>"
  },
  "amulet": {
    "stone": "<piedra o cristal recomendado para esta persona>",
    "emoji": "<emoji que represente la piedra>",
    "properties": "<beneficios para el bienestar emocional y mental, máximo 2 oraciones>",
    "howToUse": "<cómo usar el amuleto en el día a día, máximo 2 oraciones>"
  }
}`
          }
        ],
      }),
    });

    let extras = { luckyNumber: null, ritual: null, amulet: null };
    if (extrasResponse.ok) {
      const extrasData = await extrasResponse.json();
      const extrasText = extrasData.choices?.[0]?.message?.content || "";
      try {
        // Try to parse JSON, handling potential markdown wrapping
        const cleaned = extrasText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        extras = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse extras JSON:", e, extrasText);
      }
    }

    return new Response(JSON.stringify({ analysis, prediction, ...extras }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("astral-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
