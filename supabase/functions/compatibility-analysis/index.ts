import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserLanguage, languageInstruction } from "../_shared/language.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  userName?: string;
  userSign: string;
  userMoon?: string;
  userAsc?: string;
  partnerName: string;
  partnerBirthDate: string;
  partnerBirthTime?: string;
  partnerBirthPlace?: string;
  partnerSign?: string;
  type: "amor" | "laboral" | "amistad" | "paternidad" | "especial";
  specialDetail?: string;
}

const TYPE_LABEL: Record<Body["type"], string> = {
  amor: "Amor / Pareja romántica",
  laboral: "Laboral / Compañeros de trabajo o socios",
  amistad: "Amistad",
  paternidad: "Paternidad / Vínculo padre/madre-hijo",
  especial: "Acompañamiento Especial",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const __LANG_CODE__ = await getUserLanguage(supabaseAuth, userData.user.id, "es");
    const __LANG_INSTRUCTION__ = languageInstruction(__LANG_CODE__);

    const body = (await req.json()) as Body;
    if (!body?.userSign || !body?.partnerName || !body?.partnerBirthDate || !body?.type) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input validation to prevent prompt injection / abuse
    const VALID_TYPES = ["amor", "laboral", "amistad", "paternidad", "especial"];
    const sanitize = (v: unknown, max: number): string =>
      typeof v === "string" ? v.replace(/[\r\n`]+/g, " ").slice(0, max).trim() : "";
    if (!VALID_TYPES.includes(body.type)) {
      return new Response(JSON.stringify({ error: "Tipo inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.partnerBirthDate)) {
      return new Response(JSON.stringify({ error: "Fecha inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.partnerBirthTime && !/^\d{2}:\d{2}$/.test(body.partnerBirthTime)) {
      return new Response(JSON.stringify({ error: "Hora inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    body.userName = sanitize(body.userName, 100);
    body.partnerName = sanitize(body.partnerName, 100);
    body.partnerBirthPlace = sanitize(body.partnerBirthPlace, 200);
    body.userSign = sanitize(body.userSign, 30);
    body.userMoon = sanitize(body.userMoon, 30);
    body.userAsc = sanitize(body.userAsc, 30);
    body.partnerSign = sanitize(body.partnerSign, 30);
    body.specialDetail = sanitize(body.specialDetail, 500);
    if (!body.partnerName) {
      return new Response(JSON.stringify({ error: "Nombre inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeLabel = TYPE_LABEL[body.type];
    const specialNote =
      body.type === "especial" && body.specialDetail
        ? `\nDetalle del acompañamiento especial: ${body.specialDetail}`
        : "";

    const userBlock = `Persona A:
- Nombre: ${body.userName || "Tú"}
- Personalidad tipo: ${body.userSign}${body.userMoon ? `\n- Emociones tipo: ${body.userMoon}` : ""}${body.userAsc ? `\n- Energía que proyecta: ${body.userAsc}` : ""}`;

    const partnerBlock = `Persona B:
- Nombre: ${body.partnerName}
- Fecha de nacimiento: ${body.partnerBirthDate}${body.partnerBirthTime ? `\n- Hora de nacimiento: ${body.partnerBirthTime}` : ""}${body.partnerBirthPlace ? `\n- Lugar de nacimiento: ${body.partnerBirthPlace}` : ""}${body.partnerSign ? `\n- Personalidad tipo: ${body.partnerSign}` : ""}`;

    const prompt = `Analiza la compatibilidad entre estas dos personas.

${userBlock}

${partnerBlock}

Tipo de relación a analizar: ${typeLabel}${specialNote}

IMPORTANTE: Responde en español, en lenguaje cotidiano, sin términos astrológicos técnicos (no uses tránsitos, casas, aspectos, conjunciones, etc.). Habla como un coach de vida cálido.

Devuelve SOLO JSON exacto (sin markdown, sin backticks):
{
  "overall": <número 1-10 de compatibilidad general>,
  "summary": "<resumen breve de 1-2 oraciones>",
  "strengths": "<3-4 oraciones sobre lo que funciona muy bien entre ellos>",
  "challenges": "<3-4 oraciones sobre los retos a trabajar>",
  "advice": "<2-3 consejos prácticos para potenciar la relación, separados por punto>",
  "dynamics": [
    { "label": "<aspecto clave 1>", "score": <1-10>, "note": "<una frase>" },
    { "label": "<aspecto clave 2>", "score": <1-10>, "note": "<una frase>" },
    { "label": "<aspecto clave 3>", "score": <1-10>, "note": "<una frase>" }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: __LANG_INSTRUCTION__ },
          {
            role: "system",
            content:
              "Eres un coach de vida y guía de relaciones. Hablas en español con tono cálido. Nunca uses jerga astrológica técnica. Responde SOLO con el JSON pedido.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas consultas, intenta en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    try {
      const parsed = JSON.parse(cleaned);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      console.error("Compatibility parse error:", text);
      return new Response(JSON.stringify({ error: "Respuesta no válida" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("compatibility-analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
