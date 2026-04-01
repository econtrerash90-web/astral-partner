import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, BookOpen, Hash, Flame, Gem, Sun, Moon, ArrowUp, Heart, Briefcase, Activity, Palette, Clock, AlertTriangle, ChevronRight, RefreshCw, Layers, Crown, Feather, SquareAsterisk, Lock, Map, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import AstralForm from "@/components/AstralForm";
import AstralLoading from "@/components/AstralLoading";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import {
  getZodiacSign,
  getMoonSign,
  getAscendant,
  type AstralData,
} from "@/lib/astral-calculations";
import { formatAIText } from "@/lib/format-ai-text";

interface DailyHoroscope {
  general: string;
  energy: number;
  love: number;
  work: number;
  health: number;
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
  const { isPremium } = useSubscription();
  const [chartData, setChartData] = useState<ChartRow | null>(null);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHoroscope, setIsLoadingHoroscope] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
      }
      setIsLoading(false);
    };
    load();
  }, [user]);

  const generateHoroscope = useCallback(async () => {
    if (!user || !chartData) return;
    setIsLoadingHoroscope(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/daily-horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({
          sunSign: chartData.sun_sign_name,
          moonSign: chartData.moon_sign,
          ascendant: chartData.ascendant,
        }),
      });

      if (!response.ok) throw new Error("Error al generar horóscopo");
      const data = await response.json();
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
      toast.error("No se pudo generar el horóscopo. Intenta de nuevo.");
    } finally {
      setIsLoadingHoroscope(false);
    }
  }, [user, chartData]);

  useEffect(() => {
    if (chartData && !horoscope && !isLoading && !isLoadingHoroscope) {
      generateHoroscope();
    }
  }, [chartData, horoscope, isLoading]);

  const handleSubmit = async (formData: { fullName: string; birthDate: string; birthTime: string; birthPlace: string }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const birthDate = new Date(formData.birthDate + "T" + formData.birthTime);
      const sunSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
      const moonSign = getMoonSign(birthDate);
      const ascendant = getAscendant(birthDate.getHours());

      let analysis = "";
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/astral-analysis`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
          body: JSON.stringify({ sunSign: sunSign.name, moonSign, ascendant, birthPlace: formData.birthPlace }),
        });
        if (res.ok) {
          const data = await res.json();
          analysis = data.analysis || "";
        }
      } catch {}

      await supabase.from("astral_charts").upsert({
        user_id: user.id,
        full_name: formData.fullName,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        birth_place: formData.birthPlace,
        sun_sign_name: sunSign.name,
        sun_sign_element: sunSign.element,
        sun_sign_planet: sunSign.planet,
        sun_sign_symbol: sunSign.symbol,
        moon_sign: moonSign,
        ascendant,
        analysis,
      });

      const { data: chart } = await supabase
        .from("astral_charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (chart) setChartData(chart);
      setShowForm(false);
      toast.success("¡Tu perfil astral está listo!");
    } catch (err) {
      console.error(err);
      toast.error("No pudimos crear tu perfil. Intenta de nuevo.");
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
              Genera Tu Carta Astral
            </h1>
            <p className="text-muted-foreground text-sm font-body">Cuéntanos cuándo y dónde naciste para crear tu perfil</p>
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
            {format(today, "EEEE, d 'de' MMMM", { locale: es })}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
            Hola, {displayName}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <SignPill icon={<Sun className="w-3 h-3 text-primary" />} label={chartData.sun_sign_name} />
            <SignPill icon={<Moon className="w-3 h-3 text-accent" />} label={chartData.moon_sign} />
            <SignPill icon={<ArrowUp className="w-3 h-3 text-nebula" />} label={chartData.ascendant} />
          </div>
        </motion.div>

        {/* ─── Transits ─── */}
        {horoscope && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 flex-wrap">
            {horoscope.currentMoonSign && (
             <span className="pill-tag">🌙 Luna en {horoscope.currentMoonSign}</span>
            )}
            {horoscope.mercuryRetrograde && (
              <span className="pill-tag-danger pill-tag">
                <AlertTriangle className="w-3 h-3" /> Energía en pausa ☿
              </span>
            )}
            {horoscope.luckyColor && (
              <span className="pill-tag"><Palette className="w-3 h-3" /> {horoscope.luckyColor}</span>
            )}
            {horoscope.luckyHour && (
              <span className="pill-tag"><Clock className="w-3 h-3" /> {horoscope.luckyHour}</span>
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
                Tu Día de Hoy
              </h2>
            </div>
            <button onClick={generateHoroscope} disabled={isLoadingHoroscope}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Regenerar">
              <RefreshCw className={`w-4 h-4 ${isLoadingHoroscope ? "animate-spin" : ""}`} />
            </button>
          </div>

          {isLoadingHoroscope && !horoscope ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm font-body">Preparando tu lectura...</p>
            </div>
          ) : horoscope ? (
            <div className="space-y-5">
              <p className="text-foreground/85 text-sm sm:text-base font-body leading-relaxed">
                {horoscope.general}
              </p>

              {/* Energy meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <EnergyBar icon={<Sparkles className="w-3.5 h-3.5" />} label="Energía" value={horoscope.energy} />
                <EnergyBar icon={<Heart className="w-3.5 h-3.5" />} label="Amor" value={horoscope.love} />
                <EnergyBar icon={<Briefcase className="w-3.5 h-3.5" />} label="Trabajo" value={horoscope.work} />
                <EnergyBar icon={<Activity className="w-3.5 h-3.5" />} label="Salud" value={horoscope.health} />
              </div>

              {/* Expandable details */}
              <div className="space-y-1.5">
                <DetailRow label="💕 Amor" text={horoscope.loveDetail} id="love" expanded={expandedSection} toggle={setExpandedSection} />
                <DetailRow label="💼 Trabajo" text={horoscope.workDetail} id="work" expanded={expandedSection} toggle={setExpandedSection} />
                <DetailRow label="🌿 Salud" text={horoscope.healthDetail} id="health" expanded={expandedSection} toggle={setExpandedSection} />
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

        {/* ─── Journal Prompt ─── */}
        {horoscope?.journalPrompt && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/diario" className="glass-card p-4 flex items-center gap-4 group hover:border-primary/20 transition-all block">
              <div className="feature-icon feature-icon-accent rounded-2xl">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="section-label mb-1">Prompt del día</p>
                <p className="text-sm font-body text-foreground/80 leading-relaxed line-clamp-2">
                  "{horoscope.journalPrompt}"
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          </motion.div>
        )}

        {/* ─── Premium Banner ─── */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Link to="/premium" className="glass-card-elevated p-4 flex items-center gap-4 group hover:border-primary/25 transition-all block border-primary/15">
              <div className="feature-icon rounded-2xl">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-body text-sm font-semibold">Astrelle Premium+</p>
                <p className="text-muted-foreground text-xs font-body">Tiradas ilimitadas, Sky Map, IA avanzada desde $4.99/mes</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
            </Link>
          </motion.div>
        )}

        {/* ─── Tiradas ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p className="section-label mb-3 px-1">🔮 Lecturas</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAccessCard to="/tarot" icon={<Layers className="w-5 h-5" />} label="Tarot" color="primary" badge={isPremium ? "Sin límites" : "1/día"} />
            <QuickAccessCard to="/el-secreto" icon={<Crown className="w-5 h-5" />} label="El Secreto" color="accent" badge={isPremium ? "Sin límites" : "Premium"} locked={!isPremium} />
            <QuickAccessCard to="/angeles" icon={<Feather className="w-5 h-5" />} label="Ángeles" color="nebula" badge={isPremium ? "Sin límites" : "Premium"} locked={!isPremium} />
            <QuickAccessCard to="/oraculo" icon={<SquareAsterisk className="w-5 h-5" />} label="Oráculo" color="primary" badge={isPremium ? "Sin límites" : "Premium"} locked={!isPremium} />
          </div>
        </motion.div>

        {/* ─── Consultas ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="section-label mb-3 px-1">✨ Consultas</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAccessCard to="/diario" icon={<BookOpen className="w-5 h-5" />} label="Diario Astral" color="accent" />
            <QuickAccessCard to="/numero-suerte" icon={<Hash className="w-5 h-5" />} label="Número" color="primary" />
            <QuickAccessCard to="/ritual" icon={<Flame className="w-5 h-5" />} label="Ritual" color="nebula" />
            <QuickAccessCard to="/sky-map" icon={<Map className="w-5 h-5" />} label="Sky Map" color="accent" badge={isPremium ? "" : "Premium"} locked={!isPremium} />
          </div>
        </motion.div>

        {/* ─── Natal Chart Summary ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="feature-icon w-8 h-8 rounded-xl">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-base text-foreground tracking-wide">Tu Perfil Astral</h2>
            </div>
            <button onClick={() => setShowForm(true)} className="text-xs font-body text-primary hover:text-primary/80 transition-colors">
              Recalcular
            </button>
          </div>

          {/* Sun sign featured */}
          <div className="glass-card-elevated p-4 rounded-xl mb-3 border-primary/10">
            <p className="section-label mb-1">Tu signo</p>
            <p className="text-foreground text-xl font-display font-semibold flex items-center gap-2">
              <span className="text-2xl">{chartData.sun_sign_symbol}</span>
              {chartData.sun_sign_name}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                 <span className="text-muted-foreground text-xs font-body">Energía</span>
                <span className="text-primary font-medium text-xs font-body">{chartData.sun_sign_element}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-muted/20 rounded-lg">
                <span className="text-muted-foreground text-xs font-body">Influencia</span>
                <span className="text-primary font-medium text-xs font-body">{chartData.sun_sign_planet}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
              <p className="section-label mb-1">Emociones</p>
              <p className="text-foreground font-display font-semibold">{chartData.moon_sign}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
              <p className="section-label mb-1">Cómo te ven</p>
              <p className="text-foreground font-display font-semibold">{chartData.ascendant}</p>
            </div>
          </div>

          {/* Birth data */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-lg bg-muted/10 border border-border/10 text-center">
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-wider mb-0.5">Nacimiento</p>
              <p className="text-foreground text-xs font-body font-medium">{chartData.birth_date}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/10 border border-border/10 text-center">
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-wider mb-0.5">Hora</p>
              <p className="text-foreground text-xs font-body font-medium">{chartData.birth_time}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/10 border border-border/10 text-center">
              <p className="text-muted-foreground text-[10px] font-body uppercase tracking-wider mb-0.5">Lugar</p>
              <p className="text-foreground text-xs font-body font-medium truncate">{chartData.birth_place}</p>
            </div>
          </div>

          {/* Analysis - generated once, saved and displayed */}
          {chartData.analysis && (
            <div className="mt-4">
              <button
                onClick={() => setExpandedSection(expandedSection === "analysis" ? null : "analysis")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/15 hover:bg-muted/20 transition-all"
              >
                <span className="text-sm font-body font-medium text-foreground/90 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Lo que dicen tus estrellas
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedSection === "analysis" ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {expandedSection === "analysis" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 px-1 text-foreground/80 text-sm font-body leading-relaxed">
                      {formatAIText(chartData.analysis)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <p className="text-center text-muted-foreground/30 text-[11px] mt-4 font-body">
          Las lecturas son para entretenimiento y reflexión personal, no sustituyen asesoría profesional.
        </p>
      </div>
    </div>
  );
};

// ─── Sub-components ───

const SignPill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="pill-tag">
    {icon}
    <span>{label}</span>
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
