import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, BookOpen, Hash, Flame, Gem, Sun, Moon, ArrowUp, Heart, Briefcase, Activity, Palette, Clock, AlertTriangle, ChevronRight, RefreshCw, Layers, Crown, Feather, SquareAsterisk, Lock, Map, ChevronDown, Share2, Orbit, Feather as FeatherIcon, PenLine } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es as esLocale, enUS, de as deLocale, pl as plLocale, pt as ptLocale } from "date-fns/locale";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import AstralForm from "@/components/AstralForm";
import AstralLoading from "@/components/AstralLoading";
import DailyShareCard from "@/components/DailyShareCard";
import ResultShareButtons from "@/components/ResultShareButtons";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import {
  getZodiacSign,
  getMoonSign,
  getAscendant,
  type AstralData,
} from "@/lib/astral-calculations";
import { formatAIText } from "@/lib/format-ai-text";
import { getSignTrait, getMoonTransitLabel, ELEMENT_FRIENDLY, PLANET_FRIENDLY } from "@/lib/sign-descriptions";

const dateLocales: Record<string, any> = { es: esLocale, en: enUS, de: deLocale, pl: plLocale, pt: ptLocale };
const dateFormatByLang: Record<string, string> = {
  es: "EEEE, d 'de' MMMM",
  en: "EEEE, MMMM d",
  de: "EEEE, d. MMMM",
  pl: "EEEE, d MMMM",
  pt: "EEEE, d 'de' MMMM",
};

interface DailyHoroscope {
  general: string;
  energy: number;
  love: number;
  work: number;
  health: number;
  energyDetail?: string;
  loveDetail: string;
  workDetail: string;
  healthDetail: string;
  luckyColor: string;
  luckyHour: string;
  advice: string;
  currentMoonSign: string;
  mercuryRetrograde: boolean;
  journalPrompt: string;
}

interface AstroEvent {
  eventName: string;
  dateRange: string;
  whatItIs: string;
  howItAffectsYou: string;
  reflectionPrompt: string;
  tips: string[];
  eventKind?: string;
  validUntil?: string;
  generatedAt?: string;
}

interface ChartRow {
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
  created_at: string;
}

const Index = () => {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const { isPremium } = useSubscription();
  const [chartData, setChartData] = useState<ChartRow | null>(null);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: chart } = await supabase
        .from("astral_charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (chart) {
        setChartData(chart);
        const today = format(new Date(), "yyyy-MM-dd");
        const { data: reading } = await supabase
          .from("daily_readings")
          .select("content")
          .eq("user_id", user.id)
          .eq("reading_date", today)
          .eq("reading_type", "horoscope")
          .maybeSingle();

        if (reading?.content) {
          setHoroscope(reading.content as unknown as DailyHoroscope);
        }

        // Load cached lucky number
        const { data: cached } = await supabase
          .from("astral_extras" as any)
          .select("result")
          .eq("user_id", user.id)
          .eq("type", "luckyNumber")
          .maybeSingle();
        if (cached && (cached as any).result?.number) {
          setLuckyNumber((cached as any).result.number);
        } else {
          // Generate silently
          try {
            const { data: result } = await supabase.functions.invoke("astral-extras", {
              body: {
                type: "luckyNumber",
                sun_sign_name: chart.sun_sign_name,
                moon_sign: chart.moon_sign,
                ascendant: chart.ascendant,
              },
            });
            if ((result as any)?.number) {
              setLuckyNumber((result as any).number);
              await supabase.from("astral_extras" as any).upsert(
                { user_id: user.id, type: "luckyNumber", result, created_at: new Date().toISOString() },
                { onConflict: "user_id,type" }
              );
            }
          } catch {}
        }
      }
      setIsLoading(false);
    };
    load();
  }, [user]);

  const generateHoroscope = useCallback(async () => {
    if (!user || !chartData) return;
    setIsLoadingHoroscope(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-horoscope", {
        body: {
          sunSign: chartData.sun_sign_name,
          moonSign: chartData.moon_sign,
          ascendant: chartData.ascendant,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setHoroscope(data);

      const today = format(new Date(), "yyyy-MM-dd");
      await supabase.from("daily_readings").upsert({
        user_id: user.id,
        reading_date: today,
        reading_type: "horoscope",
        content: data,
      }, { onConflict: "user_id,reading_date,reading_type" });
    } catch (e) {
      console.error("Horoscope error:", e);
      toast.error(t("home.errorHoroscope"));
    } finally {
      setIsLoadingHoroscope(false);
    }
  }, [user, chartData]);

  useEffect(() => {
    if (chartData && !horoscope && !isLoading && !isLoadingHoroscope) {
      generateHoroscope();
    }
  }, [chartData, horoscope, isLoading]);

  const handleSubmit = async (formData: { fullName: string; birthDate: string; birthTime: string; birthPlace: string; birthTimezone?: string; birthUtc?: string }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const birthDate = new Date(formData.birthDate + "T" + formData.birthTime);
      const sunSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
      const moonSign = getMoonSign(birthDate);
      const ascendant = getAscendant(birthDate.getHours());

      let analysis = "";
      try {
        const { data, error } = await supabase.functions.invoke("astral-analysis", {
          body: { sunSign: sunSign.name, moonSign, ascendant, birthPlace: formData.birthPlace },
        });
        if (!error && data) {
          analysis = (data as any).analysis || "";
        }
      } catch {}

      await supabase.from("astral_charts").upsert({
        user_id: user.id,
        full_name: formData.fullName,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        birth_place: formData.birthPlace,
        birth_timezone: formData.birthTimezone ?? null,
        birth_utc: formData.birthUtc ?? null,
        sun_sign_name: sunSign.name,
        sun_sign_element: sunSign.element,
        sun_sign_planet: sunSign.planet,
        sun_sign_symbol: sunSign.symbol,
        moon_sign: moonSign,
        ascendant,
        analysis,
      } as any);

      const { data: chart } = await supabase
        .from("astral_charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (chart) setChartData(chart);
      setShowForm(false);
      toast.success(t("home.profileReady"));
    } catch (err) {
      console.error(err);
      toast.error(t("home.errorProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <AstralLoading />
        </div>
      </div>
    );
  }

  if (!chartData || showForm) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto">
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-2" style={{ backgroundImage: "var(--gradient-title)" }}>
              {t("home.createProfileTitle")}
            </h1>
            <p className="text-muted-foreground text-sm font-body">{t("home.createProfileSub")}</p>
          </motion.header>
          <AstralForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  const today = new Date();
  const displayName = chartData.full_name.split(" ")[0];

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-6 sm:py-8 max-w-2xl mx-auto space-y-6">

        {/* ─── Greeting ─── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
          <p className="text-muted-foreground text-xs font-body mb-1 tracking-wide">
            {format(today, dateFormatByLang[language] ?? dateFormatByLang.es, { locale: dateLocales[language] ?? esLocale })}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
            {t("home.hello")}, {displayName}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <SignPill icon={<Sun className="w-3 h-3 text-primary" />} label={chartData.sun_sign_name} tooltip={getSignTrait(chartData.sun_sign_name, "sun")} />
            <SignPill icon={<Moon className="w-3 h-3 text-accent" />} label={chartData.moon_sign} tooltip={getSignTrait(chartData.moon_sign, "moon")} />
            <SignPill icon={<ArrowUp className="w-3 h-3 text-nebula" />} label={chartData.ascendant} tooltip={getSignTrait(chartData.ascendant, "asc")} />
          </div>
        </motion.div>

        {/* ─── Transits ─── */}
        {horoscope && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap">
            {horoscope.currentMoonSign && (
             <span className="pill-tag">{getMoonTransitLabel(horoscope.currentMoonSign)}</span>
            )}
            {horoscope.mercuryRetrograde && (
              <span className="pill-tag-danger pill-tag">
                <AlertTriangle className="w-3 h-3" /> {t("home.energyPause")} ☿
              </span>
            )}
            {horoscope.luckyColor && (
              <span className="pill-tag"><Palette className="w-3 h-3" /> {horoscope.luckyColor}</span>
            )}
            {horoscope.luckyHour && (
              <span className="pill-tag"><Clock className="w-3 h-3" /> {horoscope.luckyHour}</span>
            )}
            {luckyNumber !== null && (
              <span className="pill-tag"><Hash className="w-3 h-3" /> {t("home.luckyNumberToday")}: {luckyNumber}</span>
            )}
          </motion.div>
        )}

        {/* ─── Daily Horoscope ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="feature-icon w-8 h-8 rounded-xl">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-base text-foreground tracking-wide">
                {t("home.todaysReading")}
              </h2>
            </div>
            <button onClick={generateHoroscope} disabled={isLoadingHoroscope}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title={t("home.regenerate")}>
              <RefreshCw className={`w-4 h-4 ${isLoadingHoroscope ? "animate-spin" : ""}`} />
            </button>
          </div>

          {isLoadingHoroscope && !horoscope ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm font-body">{t("home.preparingReading")}</p>
            </div>
          ) : horoscope ? (
            <div className="space-y-5">
              <p className="text-foreground/85 text-sm sm:text-base font-body leading-relaxed">
                {horoscope.general}
              </p>

              {/* Energy meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <EnergyBar icon={<Sparkles className="w-3.5 h-3.5" />} label={t("home.energy")} value={horoscope.energy} />
                <EnergyBar icon={<Heart className="w-3.5 h-3.5" />} label={t("home.love")} value={horoscope.love} />
                <EnergyBar icon={<Briefcase className="w-3.5 h-3.5" />} label={t("home.work")} value={horoscope.work} />
                <EnergyBar icon={<Activity className="w-3.5 h-3.5" />} label={t("home.health")} value={horoscope.health} />
              </div>

              {/* Expandable details */}
              <div className="space-y-1.5">
                <DetailRow label={`✨ ${t("home.energy")}`} text={horoscope.energyDetail || horoscope.general} id="energy" expanded={expandedSection} toggle={setExpandedSection} />
                <DetailRow label={`💕 ${t("home.love")}`} text={horoscope.loveDetail} id="love" expanded={expandedSection} toggle={setExpandedSection} />
                <DetailRow label={`💼 ${t("home.work")}`} text={horoscope.workDetail} id="work" expanded={expandedSection} toggle={setExpandedSection} />
                <DetailRow label={`🌿 ${t("home.health")}`} text={horoscope.healthDetail} id="health" expanded={expandedSection} toggle={setExpandedSection} />
              </div>

              {/* Advice */}
              {horoscope.advice && (
                <div className="glass-card-elevated p-4 border-primary/15">
                  <p className="text-sm font-body text-foreground/90 italic leading-relaxed">
                    💫 {horoscope.advice}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>

        {/* ─── Share My Day ─── */}
        {horoscope && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
            {!showShareCard ? (
              <button
                onClick={() => setShowShareCard(true)}
                className="w-full glass-card p-4 flex items-center justify-center gap-2 hover:border-primary/30 transition-all text-foreground/85 hover:text-foreground"
              >
                <Share2 className="w-4 h-4 text-primary" />
                <span className="font-body text-sm">{t("home.shareDay")}</span>
              </button>
            ) : (
              <div className="glass-card p-4 space-y-4">
                <p className="font-body text-xs text-muted-foreground text-center">
                  {t("home.shareCardReady")}
                </p>
                <ResultShareButtons
                  captureRef={shareCardRef}
                  filename={`dia-${format(today, "yyyy-MM-dd")}`}
                  shareText={`${t("home.shareCardCaption")} ✨ ${chartData.sun_sign_name}`}
                  buttons={["download", "more"]}
                />
                <button
                  onClick={() => setShowShareCard(false)}
                  className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground font-body"
                >
                  {t("common.close")}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Hidden share card for image generation */}
        {horoscope && (
          <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }} aria-hidden>
            <DailyShareCard
              ref={shareCardRef}
              name={displayName}
              sunSign={chartData.sun_sign_name}
              sunSymbol={chartData.sun_sign_symbol}
              general={horoscope.general}
              luckyNumber={luckyNumber}
              luckyColor={horoscope.luckyColor}
              advice={horoscope.advice}
            />
          </div>
        )}

        <p className="text-center text-muted-foreground/30 text-[11px] mt-4 font-body">
          {t("home.disclaimer")}
        </p>
      </div>
    </div>
  );
};

// ─── Sub-components ───

const SignPill = ({ icon, label, tooltip }: { icon: React.ReactNode; label: string; tooltip?: string }) => (
  <span className="pill-tag group relative cursor-default">
    {icon}
    <span>{label}</span>
    {tooltip && (
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-body text-foreground/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
        {tooltip}
      </span>
    )}
  </span>
);

const EnergyBar = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="p-3 rounded-xl bg-muted/15 border border-border/15">
    <div className="flex items-center gap-1.5 mb-2.5">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-body text-muted-foreground">{label}</span>
      <span className="ml-auto text-xs font-body text-foreground font-semibold">{value}</span>
    </div>
    <div className="energy-track">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="energy-fill"
      />
    </div>
  </div>
);

const DetailRow = ({ label, text, id, expanded, toggle }: { label: string; text: string; id: string; expanded: string | null; toggle: (id: string | null) => void }) => (
  <button
    onClick={() => toggle(expanded === id ? null : id)}
    className="w-full text-left p-3 rounded-xl transition-all hover:bg-muted/15 border border-transparent hover:border-border/15"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-body text-foreground/80">{label}</span>
      <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${expanded === id ? "rotate-90" : ""}`} />
    </div>
    <AnimatePresence>
      {expanded === id && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs font-body text-muted-foreground leading-relaxed mt-2"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  </button>
);

const colorMap: Record<string, { icon: string; text: string }> = {
  accent: { icon: "feature-icon-accent", text: "text-accent" },
  primary: { icon: "feature-icon", text: "text-primary" },
  nebula: { icon: "feature-icon-nebula", text: "text-nebula" },
};

const QuickAccessCard = ({ to, icon, label, color, badge, locked }: { to: string; icon: React.ReactNode; label: string; color: string; badge?: string; locked?: boolean }) => {
  const c = colorMap[color] || colorMap.primary;
  return (
    <Link to={to} className={`glass-card p-4 text-center group hover:border-primary/20 transition-all block relative ${locked ? "opacity-60" : ""}`}>
      {locked && (
        <div className="absolute top-2.5 right-2.5">
          <Lock className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
      <div className={`w-11 h-11 rounded-2xl ${c.icon} flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
        <span className={c.text}>{icon}</span>
      </div>
      <p className="text-xs font-body font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</p>
      {badge && (
        <span className={`text-[10px] font-body mt-1.5 inline-block px-2 py-0.5 rounded-full ${locked ? "bg-muted/30 text-muted-foreground/60" : "pill-tag-accent"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

export default Index;
