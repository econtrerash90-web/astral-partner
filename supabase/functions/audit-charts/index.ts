import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIELDS = [
  "sun_sign_name",
  "sun_sign_element",
  "sun_sign_planet",
  "sun_sign_symbol",
  "moon_sign",
  "ascendant",
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Create run record
  const { data: run, error: runErr } = await supabase
    .from("chart_audit_runs")
    .insert({})
    .select()
    .single();
  if (runErr || !run) {
    return new Response(JSON.stringify({ error: runErr?.message ?? "run_create_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch all charts in pages of 1000
    const charts: any[] = [];
    let from = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await supabase
        .from("astral_charts")
        .select("id,user_id,birth_date,birth_time,sun_sign_name,sun_sign_element,sun_sign_planet,sun_sign_symbol,moon_sign,ascendant")
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      charts.push(...data);
      if (data.length < PAGE) break;
      from += PAGE;
    }

    let mismatches = 0;
    const logRows: any[] = [];

    for (const c of charts) {
      // Parse date/time
      let m: number, d: number, h: number;
      try {
        const date = new Date(c.birth_date);
        m = date.getUTCMonth() + 1;
        d = date.getUTCDate();
        h = parseInt((c.birth_time ?? "00:00").split(":")[0], 10) || 0;
      } catch {
        continue;
      }

      // Call canonical SQL functions
      const [zodiacRes, moonRes, ascRes] = await Promise.all([
        supabase.rpc("calculate_zodiac_sign", { p_month: m, p_day: d }),
        supabase.rpc("calculate_moon_sign", { p_birth_date: c.birth_date }),
        supabase.rpc("calculate_ascendant", { p_hour: h }),
      ]);

      const zodiac = Array.isArray(zodiacRes.data) ? zodiacRes.data[0] : null;
      if (!zodiac) continue;

      const expected: Record<string, string> = {
        sun_sign_name: zodiac.sign_name,
        sun_sign_element: zodiac.sign_element,
        sun_sign_planet: zodiac.sign_planet,
        sun_sign_symbol: zodiac.sign_symbol,
        moon_sign: moonRes.data ?? "",
        ascendant: ascRes.data ?? "",
      };

      for (const f of FIELDS) {
        const stored = (c as any)[f] ?? "";
        const exp = expected[f] ?? "";
        const match = stored === exp;
        if (!match) mismatches++;
        logRows.push({
          run_id: run.id,
          chart_id: c.id,
          user_id: c.user_id,
          field_name: f,
          stored_value: stored,
          expected_value: exp,
          status: match ? "ok" : "mismatch",
        });
      }
    }

    // Insert log rows in batches of 500
    for (let i = 0; i < logRows.length; i += 500) {
      const batch = logRows.slice(i, i + 500);
      const { error } = await supabase.from("chart_audit_log").insert(batch);
      if (error) throw error;
    }

    await supabase.from("chart_audit_runs").update({
      finished_at: new Date().toISOString(),
      total_charts: charts.length,
      total_mismatches: mismatches,
    }).eq("id", run.id);

    return new Response(JSON.stringify({
      run_id: run.id,
      total_charts: charts.length,
      total_mismatches: mismatches,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("chart_audit_runs").update({
      finished_at: new Date().toISOString(),
      notes: `error: ${msg}`,
    }).eq("id", run.id);
    return new Response(JSON.stringify({ error: msg, run_id: run.id }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
