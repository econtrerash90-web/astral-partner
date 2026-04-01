import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Star, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import NatalChartWheel from "@/components/NatalChartWheel";
import NatalChartTable from "@/components/NatalChartTable";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { NatalChartData } from "@/lib/natal-chart-types";

const NatalChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [birthInfo, setBirthInfo] = useState<{ date: string; time: string; place: string } | null>(null);

  const loadChart = async () => {
    if (!user) return;
    setLoading(true);

    // Get birth data from astral_charts
    const { data: chart } = await supabase
      .from("astral_charts")
      .select("birth_date, birth_time, birth_place")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!chart) {
      setLoading(false);
      return;
    }

    setBirthInfo({ date: chart.birth_date, time: chart.birth_time, place: chart.birth_place });

    try {
      const { data, error } = await supabase.functions.invoke("natal-chart", {
        body: {
          birthDate: chart.birth_date,
          birthTime: chart.birth_time,
          birthPlace: chart.birth_place,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setChartData(data as NatalChartData);
    } catch (e: any) {
      console.error("Error loading natal chart:", e);
      toast.error("No pudimos generar tu carta natal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, [user]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-foreground flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Tu Carta Natal
            </h1>
            {birthInfo && (
              <p className="text-muted-foreground text-xs font-body mt-1">
                {birthInfo.date} · {birthInfo.time} · {birthInfo.place}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm font-body">Calculando tu carta natal...</p>
            </div>
          ) : !birthInfo ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground font-body">
                Necesitas completar tus datos de nacimiento para ver tu carta natal.
              </p>
            </div>
          ) : chartData ? (
            <>
              {/* Chart wheel */}
              <div className="glass-card p-4 rounded-2xl">
                <NatalChartWheel data={chartData} size={380} />
              </div>

              {/* Positions table */}
              <NatalChartTable data={chartData} />

              {/* Recalculate */}
              <div className="text-center">
                <button
                  onClick={loadChart}
                  className="text-primary/60 text-xs font-body hover:text-primary transition-colors flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  Recalcular carta
                </button>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground font-body text-sm">
                No pudimos generar tu carta natal.
              </p>
              <button
                onClick={loadChart}
                className="mt-3 text-primary text-sm font-body hover:underline"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NatalChart;
