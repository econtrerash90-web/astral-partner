import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Lock, Crown, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ResultShareButtons from "@/components/ResultShareButtons";
import { type ReadingType, getLimit, isLocked, READING_META, CATEGORIES } from "@/lib/reading-limits";
import { useSubscription } from "@/hooks/useSubscription";

interface ReadingScreenProps {
  type: ReadingType;
}

const ReadingScreen = ({ type }: ReadingScreenProps) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const meta = READING_META[type];
  const { isPremium } = useSubscription();

  const [chartData, setChartData] = useState<{ sun_sign_name: string; moon_sign: string; ascendant: string } | null>(null);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [usedToday, setUsedToday] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const limit = getLimit(type, isPremium);
  const locked = isLocked(type, isPremium);
  const remaining = Math.max(0, limit - usedToday);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: chart } = await supabase
        .from("astral_charts")
        .select("sun_sign_name, moon_sign, ascendant")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (chart) setChartData(chart);

      const today = format(new Date(), "yyyy-MM-dd");
      const { data: limits } = await supabase
        .from("daily_limits")
        .select("*")
        .eq("user_id", user.id)
        .eq("limit_date", today)
        .maybeSingle();

      if (limits) {
        const countField = `${type}_count` as keyof typeof limits;
        setUsedToday((limits[countField] as number) || 0);
      }

      const { data: lastReading } = await supabase
        .from("daily_readings")
        .select("content")
        .eq("user_id", user.id)
        .eq("reading_date", today)
        .eq("reading_type", type)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReading?.content) {
        setResult(lastReading.content);
      }

      setPageLoading(false);
    };
    load();
  }, [user, type]);

  const performReading = useCallback(async () => {
    if (!chartData || !user || !category) return;
    if (remaining <= 0) {
      toast.error("Has alcanzado tu límite de tiradas para hoy");
      return;
    }

    setIsRevealing(true);
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 2000));
    setIsRevealing(false);

    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${url}/functions/v1/astral-readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          type,
          category,
          question: category === "other" ? question : undefined,
          ...chartData,
        }),
      });
      if (!res.ok) throw new Error("Error al generar la lectura");
      const data = await res.json();
      setResult(data);

      const today = format(new Date(), "yyyy-MM-dd");
      await supabase.from("daily_readings").insert({
        user_id: user.id,
        reading_date: today,
        reading_type: type,
        content: data,
      });

      await supabase.rpc("increment_reading_count", {
        p_user_id: user.id,
        p_date: today,
        p_type: type,
      });

      setUsedToday(prev => prev + 1);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo generar la lectura. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [chartData, user, category, question, type, remaining]);

  const newReading = () => {
    setResult(null);
    setCategory("");
    setQuestion("");
    setShowShare(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground font-body text-sm">Cargando...</span>
        </div>
      </div>
    );
  }

  // Locked for free users
  if (locked) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-20 max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <h1 className="font-display text-2xl text-foreground mb-2">{meta.emoji} {meta.label}</h1>
            <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
              Esta funcionalidad está disponible con Premium+.{" "}
              <Link to="/premium" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Conoce los planes y elige el tuyo →
              </Link>
            </p>
            <div className="flex gap-3">
              <Link to="/premium" className="flex-1 btn-gold py-3 text-center">
                Ver planes
              </Link>
              <button onClick={() => navigate("/")} className="flex-1 btn-glass py-3">
                Volver
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-20 max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
            <h1 className="font-display text-2xl text-foreground mb-3">{meta.emoji} {meta.label}</h1>
            <p className="text-muted-foreground font-body text-sm mb-6">Primero necesitas crear tu perfil personal.</p>
            <Link to="/" className="btn-gold inline-flex items-center gap-2">
              Crear Mi Perfil
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-6 sm:py-8 max-w-lg mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
            {meta.emoji} {meta.label}
          </h1>
          <span className="pill-tag text-[11px]">
            {usedToday}/{limit}
          </span>
        </motion.div>

        {/* Reveal animation */}
        <AnimatePresence>
          {isRevealing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
            >
              <div className="flex gap-5">
                {(type === "tarot" ? [0, 1, 2] : [0]).map(i => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 0, scale: 0.8 }}
                    animate={{
                      rotateY: [0, 180, 360],
                      scale: [0.8, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                    className="w-20 h-32 sm:w-24 sm:h-36 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.15))",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      boxShadow: "0 0 40px hsl(var(--primary) / 0.15)",
                    }}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-muted-foreground font-body text-sm"
              >
                Revelando tu lectura...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        {result && !isRevealing ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Disclaimer */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
              <span className="text-xs">ⓘ</span>
              <p className="text-muted-foreground text-[11px] font-body">
                Interpretación con fines de entretenimiento y reflexión personal. No constituye asesoría profesional.
              </p>
            </div>
            {/* Tarot: 3 cards */}
            {type === "tarot" && result.cards && (
              <div className="space-y-3">
                {result.cards.map((card: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="feature-icon rounded-2xl shrink-0">
                        <span className="text-xl">{card.emoji || "🃏"}</span>
                      </div>
                      <div className="flex-1">
                        <p className="section-label mb-1">
                          {card.position === "Pasado" ? "🌙" : card.position === "Presente" ? "✨" : "☀️"} {card.position}
                        </p>
                        <h3 className="font-display text-base text-foreground font-semibold mb-2">{card.name}</h3>
                        <p className="text-foreground/70 text-sm font-body leading-relaxed">{card.meaning}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Secret */}
            {type === "secret" && (
              <div className="glass-card p-6 text-center">
                <span className="text-4xl block mb-3">{result.emoji || "🌟"}</span>
                <h2 className="font-display text-xl text-foreground font-semibold mb-4">{result.title}</h2>
                <div className="glass-card-elevated p-4 mb-4 border-primary/15">
                  <p className="text-sm font-body text-primary italic">"{result.affirmation}"</p>
                </div>
                <p className="text-foreground/80 text-sm font-body leading-relaxed mb-4">{result.message}</p>
                <div className="bg-accent/8 border border-accent/15 rounded-xl p-4 mb-3">
                  <p className="section-label mb-1">🎯 Acción del día</p>
                  <p className="text-sm font-body text-foreground/80">{result.action}</p>
                </div>
                {result.mantra && (
                  <div className="bg-muted/20 rounded-xl p-3 border border-border/20">
                    <p className="section-label mb-1">🧘 Mantra</p>
                    <p className="text-sm font-body text-foreground/90 italic">"{result.mantra}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Angels */}
            {type === "angels" && (
              <div className="glass-card p-6 text-center">
                <span className="text-4xl block mb-3">{result.emoji || "👼"}</span>
                <p className="section-label mb-1">{result.angelName}</p>
                <h2 className="font-display text-xl text-foreground font-semibold mb-4">{result.title}</h2>
                <p className="text-foreground/80 text-sm font-body leading-relaxed mb-4">{result.message}</p>
                <div className="bg-accent/8 border border-accent/15 rounded-xl p-4 mb-3">
                  <p className="section-label mb-1">🙏 Oración sugerida</p>
                  <p className="text-sm font-body text-foreground/80 italic">{result.prayer}</p>
                </div>
                <div className="bg-muted/20 rounded-xl p-4 border border-border/20">
                  <p className="section-label mb-1">🕯️ Ritual opcional</p>
                  <p className="text-sm font-body text-foreground/80">{result.ritual}</p>
                </div>
              </div>
            )}

            {/* Oracle */}
            {type === "oracle" && (
              <div className="glass-card p-6 text-center">
                <span className="text-4xl block mb-3">{result.emoji || "🎴"}</span>
                <h2 className="font-display text-xl text-foreground font-semibold mb-2">{result.title}</h2>
                <p className="text-xs font-body text-primary mb-4">{result.element} · {result.symbol}</p>
                <p className="text-foreground/80 text-sm font-body leading-relaxed mb-4">{result.message}</p>
                <div className="glass-card-elevated p-4 mb-3 border-primary/15">
                  <p className="section-label mb-1">✨ Revelación</p>
                  <p className="text-sm font-body text-foreground/80">{result.revelation}</p>
                </div>
                {result.power && (
                  <div className="bg-muted/20 rounded-xl p-3 border border-border/20">
                    <p className="section-label mb-1">⚡ Poder activado</p>
                    <p className="text-sm font-body text-primary font-medium">{result.power}</p>
                  </div>
                )}
              </div>
            )}

            {/* Synthesis (tarot) */}
            {type === "tarot" && result.synthesis && (
              <div className="glass-card p-5">
                <p className="section-label mb-2">💭 Reflexión final</p>
                <p className="text-foreground/85 text-sm font-body leading-relaxed">{result.synthesis}</p>
                {result.advice && (
                  <div className="mt-3 glass-card-elevated p-3 border-primary/15">
                    <p className="text-sm font-body text-primary/90 italic">💫 {result.advice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={newReading}
                disabled={remaining <= 0}
                className="flex-1 btn-glass flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Nueva ({remaining})
              </button>
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex-1 btn-glass flex items-center justify-center gap-2 py-3.5"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>

            {showShare && chartData && (
              <ExtraShareCard
                type="luckyNumber"
                title={`Mi lectura de ${meta.label}`}
                mainContent={type === "tarot" ? (result.cards?.[1]?.name || meta.label) : (result.title || meta.label)}
                subtitle={type === "tarot" ? (result.synthesis?.slice(0, 100) || "") : (result.message?.slice(0, 100) || "")}
                chartData={chartData}
              />
            )}
          </motion.div>
        ) : !isRevealing && !isLoading ? (
          /* Category selection */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="glass-card p-5">
              <p className="section-label mb-3">Tu pregunta o intención</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-3 px-3 rounded-xl font-body text-sm transition-all border ${
                      category === cat.id
                        ? "bg-primary/15 border-primary/30 text-foreground"
                        : "bg-muted/15 border-border/20 text-muted-foreground hover:bg-muted/25 hover:border-border/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {category === "other" && (
                <textarea
                  placeholder="Describe tu pregunta..."
                  maxLength={200}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  className="input-modern mt-3 resize-none"
                  rows={3}
                />
              )}
            </div>

            <button
              onClick={performReading}
              disabled={!category || isLoading || remaining <= 0}
              className="w-full btn-gold flex items-center justify-center gap-2 py-4"
            >
              <span className="text-lg">{meta.emoji}</span>
              {remaining <= 0 ? "Sin tiradas disponibles" : `Revelar ${meta.label}`}
            </button>

            {remaining <= 0 && !isPremium && (
              <div className="glass-card p-5 text-center">
                <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-body text-foreground/80 mb-1">¡Ya usaste tu tirada de hoy!</p>
                <p className="text-xs font-body text-muted-foreground mb-3">
                  Con Premium+ obtienes hasta {getLimit(type, true)} tiradas diarias
                </p>
                <Link to="/premium" className="text-primary text-sm font-body underline underline-offset-2 hover:text-primary/80">
                  Conoce los planes y elige el tuyo →
                </Link>
              </div>
            )}
          </motion.div>
        ) : isLoading && !isRevealing ? (
          <div className="flex items-center gap-3 py-16 justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm font-body">Preparando tu lectura...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReadingScreen;
