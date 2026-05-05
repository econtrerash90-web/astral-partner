import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getUserLanguage, languageInstruction } from "../_shared/language.ts";
import { resolveTimezone, localToUTC } from "../_shared/timezone.ts";
import { computeNatalChart, computeAspects } from "../_shared/swiss-ephemeris.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const __LANG_CODE__ = await getUserLanguage(supabaseAuth, userData.user.id, "es");
    const __LANG_INSTRUCTION__ = languageInstruction(__LANG_CODE__);

    const body = await req.json();
    const { birthDate, birthPlace, birthTimezone: tzOverride, birthUtc: utcOverride } = body;
    let { birthTime } = body;
    let timeEstimated = false;

    if (!birthDate || !birthPlace) {
      return new Response(JSON.stringify({ error: "Faltan datos de nacimiento" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Default to noon when birth time is missing.
    if (!birthTime || typeof birthTime !== "string" || !/^\d{2}:\d{2}/.test(birthTime)) {
      birthTime = "12:00";
      timeEstimated = true;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Geocode birth place using Nominatim (decimal coords).
    let latitude = 40.4168;
    let longitude = -3.7038;
    let country: string | undefined;
    let displayName: string | undefined;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(birthPlace)}&format=json&limit=1&addressdetails=1`,
        { headers: { "User-Agent": "AstrelleGuide/1.0" } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
          country = geoData[0]?.address?.country;
          displayName = geoData[0]?.display_name;
        }
      }
    } catch (e) {
      console.error("Geocoding error:", e);
    }
    // Validate decimal ranges and round to 4-decimal precision.
    latitude = Math.max(-90, Math.min(90, Math.round(latitude * 10000) / 10000));
    longitude = Math.max(-180, Math.min(180, Math.round(longitude * 10000) / 10000));

    // Step 1b: Resolve IANA timezone (with historical DST) and convert to UTC.
    // Expert mode: honor client-provided timezone and UTC overrides when present.
    const timezone = (typeof tzOverride === "string" && tzOverride.trim())
      ? tzOverride.trim()
      : resolveTimezone({ latitude, longitude, country, displayName });

    let utcISO: string;
    let offsetMinutes: number;
    if (typeof utcOverride === "string" && /Z$/.test(utcOverride) && !Number.isNaN(Date.parse(utcOverride))) {
      utcISO = new Date(utcOverride).toISOString();
      // Recompute the offset for the given UTC instant in the resolved zone.
      const local = localToUTC({ date: birthDate, time: birthTime, timezone });
      offsetMinutes = local.offsetMinutes;
    } else {
      const calc = localToUTC({ date: birthDate, time: birthTime, timezone });
      utcISO = calc.utcISO;
      offsetMinutes = calc.offsetMinutes;
    }
    const offsetHours = offsetMinutes / 60;
    const offsetLabel = `UTC${offsetHours >= 0 ? "+" : ""}${offsetHours}`;

    // Step 2: Compute the natal chart with Swiss Ephemeris (Moshier mode).
    let chartData: {
      planets: Array<{ name:string; symbol:string; sign:string; degree:number; minute:number; house:number; retrograde:boolean }>;
      houses: Array<{ number:number; sign:string; degree:number; minute:number }>;
      ascendant: { sign:string; degree:number; minute:number };
      midheaven: { sign:string; degree:number; minute:number };
      aspects: Array<{ planet1:string; planet2:string; type:string; orb:number }>;
      ephemerisVersion?: string;
      julianDay?: number;
    };
    try {
      const calc = await computeNatalChart({ utcISO, latitude, longitude });
      chartData = {
        planets: calc.planets.map((p) => ({
          name: p.name, symbol: p.symbol, sign: p.sign,
          degree: p.degree, minute: p.minute, house: p.house, retrograde: p.retrograde,
        })),
        houses: calc.houses.map((h) => ({
          number: h.number, sign: h.sign, degree: h.degree, minute: h.minute,
        })),
        ascendant: { sign: calc.ascendant.sign, degree: calc.ascendant.degree, minute: calc.ascendant.minute },
        midheaven: { sign: calc.midheaven.sign, degree: calc.midheaven.degree, minute: calc.midheaven.minute },
        aspects: computeAspects(calc.planets),
        ephemerisVersion: calc.ephemerisVersion,
        julianDay: calc.julianDay,
      };
    } catch (e) {
      console.error("Swiss Ephemeris error:", e);
      return new Response(JSON.stringify({ error: "No se pudo calcular la carta natal." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: Generate interpretations for each planet
    const interpretResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: __LANG_INSTRUCTION__ },
          {
            role: "system",
            content: "Eres un coach de vida. Explica conceptos de personalidad en lenguaje simple y cotidiano. NUNCA uses jerga astrológica. Responde SOLO con JSON válido sin markdown."
          },
          {
            role: "user",
            content: `Para cada planeta en esta carta natal, genera una interpretación breve (1-2 oraciones) en lenguaje cotidiano explicando qué significa para la persona. NO uses términos astrológicos.

Planetas: ${JSON.stringify(chartData.planets.map((p: any) => ({ name: p.name, sign: p.sign, house: p.house })))}

Formato de respuesta (JSON, sin markdown):
{
  "interpretations": {
    "Sol": "Tu esencia es...",
    "Luna": "Tus emociones...",
    ...
  }
}`
          }
        ],
      }),
    });

    let interpretations: Record<string, string> = {};
    if (interpretResponse.ok) {
      const interpData = await interpretResponse.json();
      const interpText = interpData.choices?.[0]?.message?.content || "";
      try {
        const cleanedInterp = interpText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleanedInterp);
        interpretations = parsed.interpretations || {};
      } catch (e) {
        console.error("Failed to parse interpretations:", e);
      }
    }

    return new Response(JSON.stringify({
      ...chartData,
      interpretations,
      coordinates: { latitude, longitude },
      timezone,
      utc: utcISO,
      offsetMinutes,
      timeEstimated,
      houseSystem: "Placidus",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("natal-chart error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
