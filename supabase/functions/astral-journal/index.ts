import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, sunSign, moonSign, ascendant, entryText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const gateway = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const headers = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" };

    const handleError = (resp: Response) => {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return null;
    };

    if (type === "prompts") {
      const resp = await fetch(gateway, {
        method: "POST", headers,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Eres un coach de bienestar que genera preguntas de reflexión personal. NUNCA uses términos astrológicos técnicos. Responde SOLO con las 3 preguntas, una por línea, sin numeración, sin introducción, sin conclusión." },
            { role: "user", content: `Genera 3 preguntas de reflexión para alguien con personalidad tipo ${sunSign}, emociones tipo ${moonSign} y que proyecta energía de ${ascendant}. Las preguntas deben ayudarle a entenderse mejor, reflexionar sobre su crecimiento personal y explorar sus emociones. No uses jerga astrológica, habla en lenguaje cotidiano.` },
          ],
        }),
      });

      if (!resp.ok) { const err = handleError(resp); if (err) return err; throw new Error(`AI error: ${resp.status}`); }
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || "";
      const prompts = text.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 10);
      return new Response(JSON.stringify({ prompts: prompts.slice(0, 3) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (type === "mood") {
      const resp = await fetch(gateway, {
        method: "POST", headers,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Eres un coach emocional experto. NUNCA uses términos astrológicos técnicos. Responde en español con lenguaje cotidiano." },
            { role: "user", content: `Analiza esta entrada de diario de alguien con personalidad tipo ${sunSign}. Proporciona: 1) Estado emocional predominante (1-2 palabras), 2) Un mensaje breve y alentador (2-3 líneas, sin jerga astrológica), 3) Una afirmación positiva personalizada, 4) Sugiere 2-3 tags temáticos relevantes (una palabra cada uno, ej: gratitud, ansiedad, amor). Entrada: "${entryText?.slice(0, 500)}"` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "analyze_mood",
              description: "Return structured mood analysis",
              parameters: {
                type: "object",
                properties: {
                  mood: { type: "string", description: "1-2 word emotional state" },
                  insight: { type: "string", description: "2-3 line encouraging insight" },
                  affirmation: { type: "string", description: "Personalized positive affirmation" },
                  suggested_tags: { type: "array", items: { type: "string" }, description: "2-3 thematic tags" },
                },
                required: ["mood", "insight", "affirmation", "suggested_tags"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "analyze_mood" } },
        }),
      });

      if (!resp.ok) { const err = handleError(resp); if (err) return err; throw new Error(`AI error: ${resp.status}`); }
      const data = await resp.json();
      
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ structured: true, ...parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      // Fallback to plain text
      const analysis = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ structured: false, analysis }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("astral-journal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
