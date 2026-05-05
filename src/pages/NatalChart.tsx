import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import NatalChartWheel from "@/components/NatalChartWheel";
import NatalChartTable from "@/components/NatalChartTable";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { NatalChartData } from "@/lib/natal-chart-types";
import { getSignTrait, ELEMENT_FRIENDLY, PLANET_FRIENDLY } from "@/lib/sign-descriptions";
import { formatAIText } from "@/lib/format-ai-text";
import CompatibilitySection from "@/components/CompatibilitySection";
import ZodiacKnightCard from "@/components/ZodiacKnightCard";
import ResultShareButtons from "@/components/ResultShareButtons";
import type { SignName } from "@/lib/compatibility";

interface AstralChartRow {
  full_name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  sun_sign_name: string;
  sun_sign_element: string;
  sun_sign_planet: string;
  sun_sign_symbol: string;
  moon_sign: string;
  ascendant: string;
  analysis: string | null;
}

const NatalChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [astralChart, setAstralChart] = useState<AstralChartRow | null>(null);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const knightRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchAndCache = async (chart: AstralChartRow) => {
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

      if (user) {
        await supabase.from("astral_extras" as any).upsert(
          { user_id: user.id, type: "natalChart", result: data, created_at: new Date().toISOString() },
          { onConflict: "user_id,type" }
        );
      }
      return true;
    } catch (e: any) {
      console.error("Error loading natal chart:", e);
      return false;
    }
  };

  const loadChart = async (forceRegenerate = false) => {
    if (!user) return;

    const { data: chart } = await supabase
      .from("astral_charts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!chart) {
      setLoading(false);
      return;
    }

    setAstralChart(chart as AstralChartRow);

    // Try cached first — show immediately, then refresh in background
    let hasCached = false;
    if (!forceRegenerate) {
      const { data: cached } = await supabase
        .from("astral_extras" as any)
        .select("result")
        .eq("user_id", user.id)
        .eq("type", "natalChart")
        .maybeSingle();
      if (cached && (cached as any).result) {
        setChartData((cached as any).result as NatalChartData);
        setLoading(false);
        hasCached = true;
        return; // cache is valid (trigger clears it on birth data change)
      }
    }

    if (!hasCached) {
      const ok = await fetchAndCache(chart as AstralChartRow);
      if (!ok) toast.error("No pudimos generar tu carta natal. Intenta de nuevo.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, [user]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 pb-6">
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
            {astralChart && (
              <p className="text-muted-foreground text-xs font-body mt-1">
                {astralChart.birth_date} · {astralChart.birth_time} · {astralChart.birth_place}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm font-body">Calculando tu carta natal...</p>
            </div>
          ) : !astralChart ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground font-body">
                Necesitas completar tus datos de nacimiento para ver tu carta natal.
              </p>
            </div>
          ) : chartData ? (
            <>
              {/* Chart wheel */}
              <div>
                <div ref={wheelRef} className="glass-card p-4 rounded-2xl">
                  <NatalChartWheel data={chartData} size={380} />
                </div>
                <div className="mt-3">
                  <ResultShareButtons
                    captureRef={wheelRef}
                    filename="carta-natal-rueda"
                    shareText={`Mi carta natal ✨ ${astralChart.sun_sign_name}`}
                  />
                </div>
              </div>

              {/* Zodiac Knight (above profile) */}
              <div>
                <div ref={knightRef}>
                  <ZodiacKnightCard
                    sign={astralChart.sun_sign_name}
                    signSymbol={astralChart.sun_sign_symbol}
                  />
                </div>
                <div className="mt-3">
                  <ResultShareButtons
                    captureRef={knightRef}
                    filename="caballero-zodiacal"
                    shareText={`Mi Caballero del Zodiaco ⚔️ ${astralChart.sun_sign_name}`}
                  />
                </div>
              </div>

              {/* ─── Tu Perfil Astral ─── */}
              <div>
                <motion.div
                  ref={profileRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 sm:p-6"
                >
                <div className="flex items-center gap-2 mb-4">
                  <div className="feature-icon w-8 h-8 rounded-xl">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="font-display text-base text-foreground tracking-wide">Tu Perfil Astral</h2>
                </div>

                <div className="glass-card-elevated p-4 rounded-xl mb-3 border-primary/10">
                  <p className="section-label mb-1">Tu signo</p>
                  <p className="text-foreground text-xl font-display font-semibold flex items-center gap-2">
                    <span className="text-2xl">{astralChart.sun_sign_symbol}</span>
                    {astralChart.sun_sign_name}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                      <span className="text-muted-foreground text-xs font-body">Tu energía</span>
                      <span className="text-primary font-medium text-xs font-body">{ELEMENT_FRIENDLY[astralChart.sun_sign_element] || astralChart.sun_sign_element}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                      <span className="text-muted-foreground text-xs font-body">Tu impulso</span>
                      <span className="text-primary font-medium text-xs font-body">{PLANET_FRIENDLY[astralChart.sun_sign_planet] || astralChart.sun_sign_planet}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="section-label mb-1">Tus emociones</p>
                    <p className="text-foreground font-display font-semibold">{astralChart.moon_sign}</p>
                    <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">{getSignTrait(astralChart.moon_sign, "moon")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                    <p className="section-label mb-1">Cómo te ven</p>
                    <p className="text-foreground font-display font-semibold">{astralChart.ascendant}</p>
                    <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">{getSignTrait(astralChart.ascendant, "asc")}</p>
                  </div>
                </div>

                {astralChart.analysis && (
                  <div className="mt-4">
                    <button
                      onClick={() => setAnalysisExpanded((v) => !v)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/15 hover:bg-muted/20 transition-all"
                    >
                      <span className="text-sm font-body font-medium text-foreground/90 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Tu personalidad según las estrellas
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${analysisExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {analysisExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 px-1 text-foreground/80 text-sm font-body leading-relaxed">
                            {formatAIText(astralChart.analysis)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                </motion.div>
                <div className="mt-3">
                  <ResultShareButtons
                    captureRef={profileRef}
                    filename="perfil-astral"
                    shareText={`Mi Perfil Astral ✨ ${astralChart.sun_sign_name} · Luna en ${astralChart.moon_sign} · Asc. ${astralChart.ascendant}`}
                  />
                </div>
              </div>

              {/* Positions table */}
              <NatalChartTable data={chartData} />

              {/* Compatibility */}
              <CompatibilitySection userSign={astralChart.sun_sign_name as SignName} />


              {/* Recalculate */}
              <div className="text-center">
                <button
                  onClick={() => loadChart(true)}
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
                onClick={() => loadChart(true)}
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
