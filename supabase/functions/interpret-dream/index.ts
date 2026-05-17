import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getUserLanguage, languageInstruction } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 1;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const dreamText = String(body?.dream_text ?? "").trim();
    if (dreamText.length < 10 || dreamText.length > 3000) {
      return new Response(
        JSON.stringify({ error: "El sueño debe tener entre 10 y 3000 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Daily limit check ---
    const today = new Date().toISOString().slice(0, 10);
    const { data: limitRow } = await supabase
      .from("daily_limits")
      .select("dream_count")
      .eq("user_id", userId)
      .eq("limit_date", today)
      .maybeSingle();

    if ((limitRow?.dream_count ?? 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: "limit_reached", message: "Ya interpretaste tu sueño de hoy. Vuelve mañana." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Gather context in parallel ---
    const [chartRes, extrasRes, journalRes, dreamsRes] = await Promise.all([
      supabase
        .from("astral_charts")
        .select("full_name, sun_sign_name, moon_sign, ascendant, sun_sign_element")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("astral_extras")
        .select("type, result, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("journal_entries")
        .select("content, mood, tags, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("dream_entries")
        .select("dream_text, symbols, mood, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const chart = chartRes.data;
    const langCode = await getUserLanguage(supabase, userId, "es");
    const langInstr = languageInstruction(langCode);

    // --- Build context block ---
    const ctxParts: string[] = [];
    if (chart) {
      ctxParts.push(
        `Personalidad: ${chart.sun_sign_name} (${chart.sun_sign_element ?? "—"}). Mundo emocional: ${chart.moon_sign}. Cómo se proyecta: ${chart.ascendant}.`
      );
    }

    const recentReadings = (extrasRes.data ?? [])
      .map((r: any) => {
        const res = r.result ?? {};
        if (r.type === "tarot" || r.type === "oracle" || r.type === "secret" || r.type === "angels") {
          const cards = Array.isArray(res?.cards) ? res.cards.map((c: any) => c?.name).filter(Boolean).join(", ") : "";
          const q = res?.question || res?.category || "";
          return `${r.type}${q ? ` (pregunta: ${q})` : ""}${cards ? `: ${cards}` : ""}`;
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 5);
    if (recentReadings.length) ctxParts.push(`Tiradas recientes: ${recentReadings.join(" | ")}`);

    const recentJournal = (journalRes.data ?? [])
      .map((j: any) => `${j.mood ?? "?"}: ${String(j.content ?? "").slice(0, 140)}`)
      .slice(0, 5);
    if (recentJournal.length) ctxParts.push(`Diario reciente: ${recentJournal.join(" | ")}`);

    const previousDreams = (dreamsRes.data ?? [])
      .map((d: any) => {
        const syms = Array.isArray(d.symbols) ? d.symbols.join(", ") : "";
        return `${String(d.dream_text ?? "").slice(0, 120)}${syms ? ` [símbolos: ${syms}]` : ""}`;
      })
      .slice(0, 5);
    if (previousDreams.length) ctxParts.push(`Sueños anteriores: ${previousDreams.join(" | ")}`);

    const contextBlock = ctxParts.join("\n") || "Sin contexto previo.";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `${langInstr}

Eres una guía cálida y sabia que une dos miradas: la psicología junguiana (símbolos, arquetipos, sombra, integración) y la sabiduría esotérica (energías personales, ciclos lunares, intuición, sincronicidades).

Reglas estrictas:
- NUNCA uses términos astrológicos técnicos (tránsito, casa, aspecto, conjunción). Habla en lenguaje cotidiano.
- Conecta el sueño con la personalidad del usuario, su mundo emocional, sus tiradas recientes y sus sueños anteriores cuando exista relación clara. Si no hay relación, no la inventes.
- Tono: cercano, claro, esperanzador. Como una amiga sabia que también es terapeuta.
- Devuelve SOLO JSON válido, sin markdown ni backticks.`;

    const userPrompt = `Contexto del usuario:
${contextBlock}

Sueño a interpretar:
"""
${dreamText}
"""

Devuelve este JSON exacto:
{
  "interpretation": "<interpretación de 4 a 6 párrafos cortos. Estructura: (1) qué siente el sueño en su totalidad, (2) símbolos clave y qué representan psicológicamente, (3) qué energía o tema personal toca según su personalidad/emociones, (4) conexión con tiradas o sueños anteriores si existe, (5) mensaje principal que está pidiendo atención, (6) un pequeño ritual o reflexión práctica para integrar el mensaje. Usa **negritas** para las 3-5 palabras clave más importantes.>",
  "symbols": ["<símbolo 1>", "<símbolo 2>", "<símbolo 3>", "<símbolo 4>"],
  "mood": "<una sola palabra que resuma el tono emocional del sueño: ej. revelador, ansioso, sanador, transformador, nostálgico, esperanzador, confuso>"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas consultas, intenta en un momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed: { interpretation: string; symbols: string[]; mood: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse dream JSON:", raw);
      return new Response(JSON.stringify({ error: "No pudimos interpretar el sueño, intenta de nuevo." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Persist + increment limit ---
    const { data: inserted, error: insErr } = await supabase
      .from("dream_entries")
      .insert({
        user_id: userId,
        dream_text: dreamText,
        interpretation: parsed.interpretation,
        symbols: Array.isArray(parsed.symbols) ? parsed.symbols.slice(0, 8) : [],
        mood: typeof parsed.mood === "string" ? parsed.mood.slice(0, 40) : null,
      })
      .select()
      .single();

    if (insErr) {
      console.error("dream insert error:", insErr);
      return new Response(JSON.stringify({ error: "No se pudo guardar el sueño." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.rpc("increment_reading_count", {
      p_user_id: userId,
      p_date: today,
      p_type: "dream",
    });

    return new Response(JSON.stringify({ dream: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interpret-dream error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
