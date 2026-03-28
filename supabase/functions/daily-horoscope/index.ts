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
    const { sunSign, moonSign, ascendant } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date();
    const dateStr = today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    // Calculate approximate moon sign for today (simplified)
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const moonSigns = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    const currentMoonSign = moonSigns[Math.floor((dayOfYear * 12) / 365) % 12];

    // Check for Mercury retrograde (approximate periods for 2026)
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const isMercuryRetrograde = (month === 1 && day >= 25) || (month === 2 && day <= 14) ||
      (month === 5 && day >= 19) || (month === 6 && day <= 11) ||
      (month === 9 && day >= 17) || (month === 10 && day <= 9);

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
            content: "Eres un astrólogo experto. Respondes SOLO en formato JSON válido sin markdown ni backticks. Tono místico pero accesible, en español latino."
          },
          {
            role: "user",
            content: `Fecha: ${dateStr}
Luna actual en: ${currentMoonSign}
${isMercuryRetrograde ? "⚠️ Mercurio está retrógrado" : ""}

Para una persona con Sol en ${sunSign}, Luna en ${moonSign} y Ascendente en ${ascendant}, genera en formato JSON exacto:

{
  "general": "<horóscopo general del día en 3-4 oraciones, personalizado>",
  "energy": <nivel de energía del 1 al 10>,
  "love": <nivel de amor del 1 al 10>,
  "work": <nivel de trabajo del 1 al 10>,
  "health": <nivel de salud del 1 al 10>,
  "loveDetail": "<detalle sobre amor hoy, 1-2 oraciones>",
  "workDetail": "<detalle sobre trabajo hoy, 1-2 oraciones>",
  "healthDetail": "<detalle sobre salud hoy, 1-2 oraciones>",
  "luckyColor": "<color de la suerte hoy>",
  "luckyHour": "<hora más favorable del día>",
  "advice": "<consejo del día en 1-2 oraciones, motivador y personalizado>",
  "currentMoonSign": "${currentMoonSign}",
  "mercuryRetrograde": ${isMercuryRetrograde},
  "journalPrompt": "<pregunta reflexiva para journaling basada en las energías del día y la carta natal, 1 oración>"
}`
          }
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
    const horoscope = JSON.parse(cleaned);

    return new Response(JSON.stringify(horoscope), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-horoscope error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
