import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to get their ID
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action } = await req.json();
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const userId = user.id;

    if (action === "export") {
      // Export all user data
      const [profile, charts, readings, limits, extras, journal, predictions, dates] = await Promise.all([
        adminClient.from("profiles").select("*").eq("id", userId),
        adminClient.from("astral_charts").select("*").eq("user_id", userId),
        adminClient.from("daily_readings").select("*").eq("user_id", userId),
        adminClient.from("daily_limits").select("*").eq("user_id", userId),
        adminClient.from("astral_extras").select("*").eq("user_id", userId),
        adminClient.from("journal_entries").select("*").eq("user_id", userId),
        adminClient.from("weekly_predictions").select("*").eq("user_id", userId),
        adminClient.from("important_dates").select("*").eq("user_id", userId),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        profile: profile.data,
        astral_charts: charts.data,
        daily_readings: readings.data,
        daily_limits: limits.data,
        astral_extras: extras.data,
        journal_entries: journal.data,
        weekly_predictions: predictions.data,
        important_dates: dates.data,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      // Delete all user data from all tables
      await Promise.all([
        adminClient.from("daily_readings").delete().eq("user_id", userId),
        adminClient.from("daily_limits").delete().eq("user_id", userId),
        adminClient.from("astral_extras").delete().eq("user_id", userId),
        adminClient.from("journal_entries").delete().eq("user_id", userId),
        adminClient.from("weekly_predictions").delete().eq("user_id", userId),
        adminClient.from("important_dates").delete().eq("user_id", userId),
        adminClient.from("astral_charts").delete().eq("user_id", userId),
      ]);

      // Delete profile
      await adminClient.from("profiles").delete().eq("id", userId);

      // Delete auth user
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error("Error deleting auth user:", deleteError);
        return new Response(JSON.stringify({ error: "Error al eliminar la cuenta" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
