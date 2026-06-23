import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { computeNatalChart } from "../_shared/swiss-ephemeris.ts";
import { resolveTimezone, localToUTC } from "../_shared/timezone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data: chart, error: chartErr } = await admin
      .from("astral_charts")
      .select("id, birth_date, birth_time, birth_place, birth_timezone, birth_utc")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (chartErr || !chart) {
      return new Response(JSON.stringify({ error: "chart_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chart.birth_date || !chart.birth_place) {
      return new Response(JSON.stringify({ error: "missing_birth_data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Geocode birth place via Nominatim
    let latitude = 40.4168;
    let longitude = -3.7038;
    let country: string | undefined;
    let displayName: string | undefined;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          chart.birth_place,
        )}&format=json&limit=1&addressdetails=1`,
        { headers: { "User-Agent": "AstrelleGuide/1.0" } },
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
    latitude = Math.max(-90, Math.min(90, Math.round(latitude * 10000) / 10000));
    longitude = Math.max(-180, Math.min(180, Math.round(longitude * 10000) / 10000));

    const birthTime =
      chart.birth_time && /^\d{2}:\d{2}/.test(chart.birth_time)
        ? chart.birth_time.slice(0, 5)
        : "12:00";

    const timezone =
      (chart.birth_timezone && chart.birth_timezone.trim()) ||
      resolveTimezone({ latitude, longitude, country, displayName });

    let utcISO: string;
    if (chart.birth_utc && /Z$/.test(chart.birth_utc) && !Number.isNaN(Date.parse(chart.birth_utc))) {
      utcISO = new Date(chart.birth_utc).toISOString();
    } else {
      const calc = localToUTC({ date: chart.birth_date, time: birthTime, timezone });
      utcISO = calc.utcISO;
    }

    const calc = await computeNatalChart({ utcISO, latitude, longitude });
    const sun = calc.planets.find((p) => p.name === "Sol");
    const moon = calc.planets.find((p) => p.name === "Luna");
    if (!sun || !moon) throw new Error("planets_missing");

    const { error: updErr } = await admin
      .from("astral_charts")
      .update({
        sun_sign_name: sun.sign,
        moon_sign: moon.sign,
        ascendant: calc.ascendant.sign,
        birth_timezone: timezone,
        birth_utc: utcISO,
        analysis: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chart.id);

    if (updErr) throw updErr;

    return new Response(
      JSON.stringify({
        ok: true,
        sun: { sign: sun.sign, degree: sun.degree, minute: sun.minute },
        moon: { sign: moon.sign, degree: moon.degree, minute: moon.minute },
        ascendant: calc.ascendant,
        midheaven: calc.midheaven,
        timezone,
        utc: utcISO,
        ephemerisVersion: calc.ephemerisVersion,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("recalculate-chart error:", e);
    return new Response(JSON.stringify({ error: "recalculate_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
