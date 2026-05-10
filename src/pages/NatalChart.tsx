import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import NatalChartWheel from "@/components/NatalChartWheel";
import NatalChartTable from "@/components/NatalChartTable";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import type { NatalChartData } from "@/lib/natal-chart-types";
import { ZODIAC_GLYPHS } from "@/lib/natal-chart-types";
import { getSignTrait, ELEMENT_FRIENDLY, PLANET_FRIENDLY, SUN_TRAITS, MOON_TRAITS, ASC_TRAITS, MC_TRAITS } from "@/lib/sign-descriptions";
import { formatAIText, highlightAstralTerms } from "@/lib/format-ai-text";
import ZodiacKnightCard from "@/components/ZodiacKnightCard";
import ResultShareButtons from "@/components/ResultShareButtons";

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
  const { t } = useI18n();
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
          birthTimezone: (chart as any).birth_timezone ?? undefined,
          birthUtc: (chart as any).birth_utc ?? undefined,
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

        // Sync moon_sign and ascendant in astral_charts with the precise
        // Swiss Ephemeris values (DB trigger uses a simplified estimation).
        try {
          const moonPlanet = (data as NatalChartData).planets?.find((p) => p.name === "Luna");
          const ascSign = (data as NatalChartData).ascendant?.sign;
          const moonSign = moonPlanet?.sign;
          if (moonSign || ascSign) {
            const updates: Record<string, string> = {};
            if (moonSign && moonSign !== chart.moon_sign) updates.moon_sign = moonSign;
            if (ascSign && ascSign !== chart.ascendant) updates.ascendant = ascSign;
            if (Object.keys(updates).length > 0) {
              await supabase.from("astral_charts").update(updates).eq("user_id", user.id);
              setAstralChart((prev) => (prev ? { ...prev, ...updates } as AstralChartRow : prev));
            }
          }
        } catch (syncErr) {
          console.warn("Could not sync chart signs:", syncErr);
        }

        // Regenerate the personality analysis using the precise Swiss Ephemeris
        // signs (Sun/Moon/Ascendant + Midheaven) when missing or when stored
        // signs differ from the precise ones.
        try {
          const cd = data as NatalChartData;
          const sunPlanet = cd.planets?.find((p) => p.name === "Sol");
          const moonPlanet = cd.planets?.find((p) => p.name === "Luna");
          const sunSign = sunPlanet?.sign ?? chart.sun_sign_name;
          const moonSign = moonPlanet?.sign ?? chart.moon_sign;
          const ascSign = cd.ascendant?.sign ?? chart.ascendant;
          const mcSign = cd.midheaven?.sign;

          const needsRegen = !chart.analysis
            || (sunPlanet && sunPlanet.sign !== chart.sun_sign_name)
            || (moonPlanet && moonPlanet.sign !== chart.moon_sign)
            || (cd.ascendant && cd.ascendant.sign !== chart.ascendant);

          if (needsRegen) {
            const { data: ana } = await supabase.functions.invoke("astral-analysis", {
              body: {
                sunSign, moonSign, ascendant: ascSign, midheaven: mcSign,
                birthPlace: chart.birth_place,
              },
            });
            const newAnalysis = (ana as any)?.analysis;
            if (newAnalysis) {
              await supabase.from("astral_charts").update({ analysis: newAnalysis }).eq("user_id", user.id);
              setAstralChart((prev) => (prev ? { ...prev, analysis: newAnalysis } as AstralChartRow : prev));
            }
          }
        } catch (anaErr) {
          console.warn("Could not regenerate analysis:", anaErr);
        }
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
      if (!ok) toast.error(t("natal.errorRetry"));
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
              {t("natal.title")}
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
              <p className="text-muted-foreground text-sm font-body">{t("natal.calculating")}</p>
            </div>
          ) : !astralChart ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground font-body">
                {t("natal.needData")}
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

              {/* ─── Tu Perfil Astral (single unified piece) ─── */}
              <div>
                <motion.div
                  ref={profileRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.45) 100%)",
                    border: "1px solid hsl(var(--mystic-gold) / 0.18)",
                    boxShadow:
                      "0 10px 40px hsl(0 0% 0% / 0.35), inset 0 1px 0 hsl(var(--mystic-gold) / 0.12)",
                  }}
                >
                  {/* Decorative gold corner glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-40"
                    style={{
                      background:
                        "radial-gradient(circle, hsl(var(--mystic-gold) / 0.35), transparent 70%)",
                    }}
                  />

                  <div className="flex items-center gap-2 mb-4 relative">
                    <div className="feature-icon w-8 h-8 rounded-xl">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-display text-base text-foreground tracking-wide">
                      {t("natal.profile")}
                    </h2>
                  </div>

                  {(() => {
                    const sun = chartData?.planets?.find((p) => p.name === "Sol");
                    const moon = chartData?.planets?.find((p) => p.name === "Luna");
                    const sunSign = sun?.sign ?? astralChart.sun_sign_name;
                    const sunSymbol = sun ? (ZODIAC_GLYPHS[sun.sign] ?? astralChart.sun_sign_symbol) : astralChart.sun_sign_symbol;
                    const moonSign = moon?.sign ?? astralChart.moon_sign;
                    const ascSign = chartData?.ascendant?.sign ?? astralChart.ascendant;
                    const mcSign = chartData?.midheaven?.sign;

                    const fmt = (deg?: number, min?: number) =>
                      typeof deg === "number" ? `${deg}°${String(min ?? 0).padStart(2, "0")}′` : "";

                    return (
                      <div className="relative space-y-3">
                        {/* Hero: Sun sign */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, hsl(var(--mystic-gold) / 0.10), hsl(var(--cosmic-purple) / 0.10))",
                            border: "1px solid hsl(var(--mystic-gold) / 0.22)",
                          }}
                        >
                          <p className="section-label mb-1">{t("natal.yourSign")}</p>
                          <p className="text-foreground text-xl font-display font-semibold flex items-center gap-2">
                            <span className="text-2xl">{sunSymbol}</span>
                            {sunSign}
                            {sun && (
                              <span className="text-muted-foreground/70 text-xs font-body ml-1">
                                {fmt(sun.degree, sun.minute)}
                              </span>
                            )}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                              <span className="text-muted-foreground text-xs font-body">{t("natal.yourEnergy")}</span>
                              <span className="text-primary font-medium text-xs font-body">
                                {ELEMENT_FRIENDLY[astralChart.sun_sign_element] || astralChart.sun_sign_element}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                              <span className="text-muted-foreground text-xs font-body">{t("natal.yourDrive")}</span>
                              <span className="text-primary font-medium text-xs font-body">
                                {PLANET_FRIENDLY[astralChart.sun_sign_planet] || astralChart.sun_sign_planet}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trio: Moon / Asc / MC */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-muted/15 border border-border/20">
                            <p className="section-label mb-1">{t("natal.yourEmotions")}</p>
                            <p className="text-foreground font-display font-semibold">
                              {moonSign}
                              {moon && (
                                <span className="text-muted-foreground/70 text-xs font-body ml-1">
                                  {fmt(moon.degree, moon.minute)}
                                </span>
                              )}
                            </p>
                            <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">
                              {getSignTrait(moonSign, "moon")}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/15 border border-border/20">
                            <p className="section-label mb-1">{t("natal.howOthersSee")}</p>
                            <p className="text-foreground font-display font-semibold">
                              {ascSign}
                              {chartData?.ascendant && (
                                <span className="text-muted-foreground/70 text-xs font-body ml-1">
                                  {fmt(chartData.ascendant.degree, chartData.ascendant.minute)}
                                </span>
                              )}
                            </p>
                            <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">
                              {getSignTrait(ascSign, "asc")}
                            </p>
                          </div>
                          {chartData?.midheaven && (
                            <div className="p-3 rounded-xl bg-muted/15 border border-border/20">
                              <p className="section-label mb-1">{t("natal.yourPath")}</p>
                              <p className="text-foreground font-display font-semibold">
                                {chartData.midheaven.sign}
                                <span className="text-muted-foreground/70 text-xs font-body ml-1">
                                  {fmt(chartData.midheaven.degree, chartData.midheaven.minute)}
                                </span>
                              </p>
                              <p className="text-muted-foreground/60 text-[11px] font-body mt-0.5">
                                {getSignTrait(chartData.midheaven.sign, "mc")}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div
                          className="my-1 h-px"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, hsl(var(--mystic-gold) / 0.35), transparent)",
                          }}
                        />

                        {/* User Behavior — human translation of the combination */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "hsl(var(--cosmic-purple) / 0.10)",
                            border: "1px solid hsl(var(--border) / 0.25)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <h3 className="font-display text-sm tracking-wide text-foreground">
                              {t("natal.behavior")}
                            </h3>
                          </div>
                          <p className="text-muted-foreground/80 text-[12px] font-body mb-3">
                            {t("natal.behaviorIntro")}
                          </p>
                          <ul className="space-y-2.5">
                            <li className="flex gap-3">
                              <span className="text-base leading-none mt-0.5">☉</span>
                              <div>
                                <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">
                                  {t("natal.behaviorEssence")} · {sunSign}
                                </p>
                                <p className="text-foreground/90 text-sm font-body">
                                  {SUN_TRAITS[sunSign] || getSignTrait(sunSign, "sun")}
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-base leading-none mt-0.5">☾</span>
                              <div>
                                <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">
                                  {t("natal.behaviorEmotions")} · {moonSign}
                                </p>
                                <p className="text-foreground/90 text-sm font-body">
                                  {MOON_TRAITS[moonSign] || getSignTrait(moonSign, "moon")}
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-base leading-none mt-0.5">↑</span>
                              <div>
                                <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">
                                  {t("natal.behaviorImage")} · {ascSign}
                                </p>
                                <p className="text-foreground/90 text-sm font-body">
                                  {ASC_TRAITS[ascSign] || getSignTrait(ascSign, "asc")}
                                </p>
                              </div>
                            </li>
                            {mcSign && (
                              <li className="flex gap-3">
                                <span className="text-base leading-none mt-0.5">⌖</span>
                                <div>
                                  <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider">
                                    {t("natal.behaviorPurpose")} · {mcSign}
                                  </p>
                                  <p className="text-foreground/90 text-sm font-body">
                                    {MC_TRAITS[mcSign] || getSignTrait(mcSign, "mc")}
                                  </p>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Expanded AI personality analysis */}
                        {astralChart.analysis && (
                          <div>
                            <button
                              onClick={() => setAnalysisExpanded((v) => !v)}
                              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/15 hover:bg-muted/20 transition-all"
                            >
                              <span className="text-sm font-body font-medium text-foreground/90 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                {t("natal.personalityTitle")}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                                  analysisExpanded ? "rotate-180" : ""
                                }`}
                              />
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
                                    {formatAIText(
                                      highlightAstralTerms(astralChart.analysis, [
                                        t("natal.termAsc"),
                                        t("natal.termMc"),
                                        t("natal.termMoon"),
                                      ])
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                {t("natal.error")}
              </p>
              <button
                onClick={() => loadChart(true)}
                className="mt-3 text-primary text-sm font-body hover:underline"
              >
                {t("common.retry")}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NatalChart;
