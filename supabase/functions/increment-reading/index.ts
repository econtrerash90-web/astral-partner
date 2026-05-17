import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = ["tarot", "secret", "angels", "oracle", "dream"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const type = String(body?.type ?? "");
    if (!ALLOWED_TYPES.includes(type as any)) {
      return new Response(JSON.stringify({ error: `Invalid type: ${type}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date().toISOString().slice(0, 10);
    const column = `${type}_count`;

    // Upsert row, then increment via raw SQL via PostgREST not available;
    // use select-then-update pattern instead.
    await admin
      .from("daily_limits")
      .upsert({ user_id: userId, limit_date: today }, { onConflict: "user_id,limit_date" });

    const { data: row } = await admin
      .from("daily_limits")
      .select(column)
      .eq("user_id", userId)
      .eq("limit_date", today)
      .single();

    const current = (row as any)?.[column] ?? 0;
    const { error: updErr } = await admin
      .from("daily_limits")
      .update({ [column]: current + 1 })
      .eq("user_id", userId)
      .eq("limit_date", today);

    if (updErr) {
      console.error("increment-reading update error:", updErr);
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, count: current + 1 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("increment-reading error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
