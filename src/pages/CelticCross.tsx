import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import StarField from "@/components/StarField";
import { PageSeo } from "@/components/PageSeo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getTarotImage } from "@/lib/tarot-images";

// ─── Position metadata (matches the edge function) ────────────────────────
interface PositionMeta { id: number; name: string; short: string; emoji: string; gridArea: string; }
const POSITIONS: PositionMeta[] = [
  { id: 1,  name: "La situación presente",            short: "Presente",   emoji: "✨", gridArea: "p1" },
  { id: 2,  name: "Lo que influye ahora",             short: "Influencia", emoji: "🌀", gridArea: "p2" },
  { id: 3,  name: "La raíz del asunto",               short: "Raíz",       emoji: "🌱", gridArea: "p3" },
  { id: 4,  name: "Lo que ha quedado atrás",          short: "Atrás",      emoji: "🍂", gridArea: "p4" },
  { id: 5,  name: "Lo que puede aspirar",             short: "Aspiración", emoji: "⭐", gridArea: "p5" },
  { id: 6,  name: "Lo que se aproxima",               short: "Aproxima",   emoji: "🌅", gridArea: "p6" },
  { id: 7,  name: "Su perspectiva actual",            short: "Tú",         emoji: "🪞", gridArea: "p7" },
  { id: 8,  name: "Cómo lo percibe el entorno",       short: "Entorno",    emoji: "👁️", gridArea: "p8" },
  { id: 9,  name: "Lo que espera o teme",             short: "Interior",   emoji: "🌙", gridArea: "p9" },
  { id: 10, name: "Hacia dónde se dirige la energía", short: "Horizonte",  emoji: "🌟", gridArea: "p10" },
];

interface CardResult {
  id: number;
  name: string;
  arcana: "major" | "minor";
  suit: string | null;
  isReversed: boolean;
  position: string;
  weight: string;
  archetype: string;
  interpretation: string;
}
interface CelticResult {
  cards: CardResult[];
  synthesis: { title: string; body: string };
  patterns: { majorCount: number; reversedCount: number; dominantSuit: string };
}

const SUIT_EMOJI: Record<string, string> = {
  wands: "🔥", cups: "💧", swords: "⚔️", pentacles: "🪙",
};

const CelticCross = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);

  const [chart, setChart] = useState<{ sun_sign_name: string; moon_sign: string; ascendant: string } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState<CelticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [revealedUpTo, setRevealedUpTo] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const limit = 2;
  const remaining = Math.max(0, limit - usedToday);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase
        .from("astral_charts")
        .select("sun_sign_name, moon_sign, ascendant")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (c) setChart(c);

      const today = format(new Date(), "yyyy-MM-dd");
      const { data: limits } = await supabase
        .from("daily_limits")
        .select("celtic_count")
        .eq("user_id", user.id)
        .eq("limit_date", today)
        .maybeSingle();
      if (limits) setUsedToday((limits as any).celtic_count ?? 0);

      const { data: last } = await supabase
        .from("daily_readings")
        .select("content")
        .eq("user_id", user.id)
        .eq("reading_date", today)
        .eq("reading_type", "celtic")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last?.content) {
        setResult(last.content as unknown as CelticResult);
        setRevealedUpTo(10);
      }
      setPageLoading(false);
    })();
  }, [user]);

  // Sequential card reveal animation when a fresh result lands
  useEffect(() => {
    if (!result || revealedUpTo >= 10) return;
    const t = setTimeout(() => setRevealedUpTo(n => n + 1), 280);
    return () => clearTimeout(t);
  }, [result, revealedUpTo]);

  const performReading = useCallback(async () => {
    if (!chart || !user) return;
    if (remaining <= 0) {
      toast.info("Ya hiciste tu Cruz Celta de hoy. Vuelve mañana para una nueva lectura.");
      return;
    }
    setIsLoading(true);
    setResult(null);
    setRevealedUpTo(0);
    try {
      const { data, error } = await supabase.functions.invoke("celtic-cross", {
        body: { focus: focus.trim() || undefined, ...chart },
      });
      if (error) throw error;
      if ((data as any)?.error) {
        const msg = (data as any).message || "No se pudo generar la lectura. Intenta de nuevo.";
        toast.error(msg);
        return;
      }
      setResult(data as CelticResult);
      const today = format(new Date(), "yyyy-MM-dd");
      await supabase.from("daily_readings").upsert({
        user_id: user.id,
        reading_date: today,
        reading_type: "celtic",
        content: data as any,
      }, { onConflict: "user_id,reading_date,reading_type" });
      setUsedToday(n => n + 1);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo generar la lectura. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [chart, user, focus, remaining]);

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

  if (!chart) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-20 max-w-lg mx-auto text-center">
          <div className="glass-card p-8">
            <h1 className="font-display text-2xl text-foreground mb-3">🃏 Cruz Celta</h1>
            <p className="text-muted-foreground font-body text-sm mb-6">Primero necesitas crear tu perfil personal.</p>
            <Link to="/" className="btn-gold inline-flex items-center gap-2">Crear Mi Perfil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageSeo
        title="Cruz Celta — Lectura de 10 cartas | Astrelle"
        description="Recibe una lectura profunda de Cruz Celta con 10 cartas, interpretadas según tu carta astral. Una mirada simbólica para reflexionar sobre tu momento actual."
        path="/cruz-celta"
      />
      <div className="min-h-screen relative overflow-x-hidden w-full max-w-full" style={{ background: "linear-gradient(180deg, hsl(234 45% 6%) 0%, hsl(234 45% 4%) 100%)" }}>
        <StarField />
        <div className="relative z-10 px-4 py-6 sm:py-8 max-w-2xl mx-auto w-full">


          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <button onClick={() => navigate(-1)} aria-label="Volver" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg font-bold tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
              🃏 Cruz Celta
            </h1>
            <span className="pill-tag text-[11px]">{usedToday}/{limit}</span>
          </motion.div>

          {/* Top disclaimer (Capa 2 of doc) */}
          <p className="text-center font-display italic text-[12px] mb-5" style={{ color: "hsl(var(--mystic-gold))" }}>
            “Esta lectura es un espejo, no un mapa. Las cartas reflejan energías; tú decides el camino.”
          </p>

          {!result && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
              <div>
                <p className="section-label mb-2">Sobre qué quieres reflexionar</p>
                <textarea
                  value={focus}
                  onChange={e => setFocus(e.target.value.slice(0, 240))}
                  placeholder="Una situación, una pregunta abierta, un área de tu vida... (opcional)"
                  className="w-full bg-muted/15 border border-border/30 rounded-xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none"
                  rows={3}
                  maxLength={240}
                />
                <p className="text-[11px] text-muted-foreground/60 mt-1 text-right font-body">{focus.length}/240</p>
              </div>
              <button
                onClick={performReading}
                disabled={remaining <= 0}
                className="btn-gold w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {remaining > 0 ? "Revelar mi Cruz Celta" : "Disponible mañana"}
              </button>
              <p className="text-[11px] text-muted-foreground/60 font-body text-center">
                Una lectura por día · 10 cartas barajeadas con entropía criptográfica
              </p>
            </motion.div>
          )}

          {isLoading && (
            <div className="glass-card p-8 text-center space-y-4">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsl(var(--mystic-gold))" }}
                  />
                ))}
              </div>
              <p className="font-body text-sm text-muted-foreground">Barajeando las 78 cartas y leyendo tu cruz...</p>
            </div>
          )}

          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

              {/* Pattern pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="pill-tag text-[11px]">Mayores {result.patterns.majorCount}/10</span>
                <span className="pill-tag text-[11px]">Invertidas {result.patterns.reversedCount}/10</span>
                {result.patterns.dominantSuit !== "equilibrio" && (
                  <span className="pill-tag text-[11px]">
                    {SUIT_EMOJI[result.patterns.dominantSuit] ?? "•"} dominante
                  </span>
                )}
              </div>

              {/* The 10-card cross + staff layout */}
              <div className="celtic-grid">
                {POSITIONS.map((pos, idx) => {
                  const card = result.cards.find(c => c.id === pos.id)!;
                  const revealed = idx < revealedUpTo;
                  return (
                    <CelticCard
                      key={pos.id}
                      pos={pos}
                      card={card}
                      revealed={revealed}
                      isCrossing={pos.id === 2}
                      onOpen={() => revealed && setActiveCard(pos.id)}
                    />
                  );
                })}
              </div>

              {/* Synthesis */}
              {revealedUpTo >= 10 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--mystic-gold))" }} />
                    <h2 className="font-display text-base tracking-wide" style={{ color: "hsl(var(--mystic-gold))" }}>
                      {result.synthesis.title}
                    </h2>
                  </div>
                  <p className="font-body text-sm text-foreground/85 leading-relaxed">
                    {result.synthesis.body}
                  </p>
                </motion.div>
              )}

              {/* Bottom disclaimer */}
              <p className="text-center text-[11px] font-body text-muted-foreground/70 leading-relaxed">
                Las interpretaciones de Astrelle son simbólicas y tienen fines de reflexión personal.
                No constituyen predicciones, diagnósticos ni asesoramiento de ningún tipo.
              </p>

              <button
                onClick={() => { setResult(null); setFocus(""); setRevealedUpTo(0); }}
                className="btn-glass w-full py-3 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {remaining > 0 ? "Nueva lectura" : "Hacer una nueva mañana"}
              </button>
            </motion.div>
          )}

          {/* Card detail modal */}
          <AnimatePresence>
            {activeCard !== null && result && (() => {
              const pos = POSITIONS.find(p => p.id === activeCard)!;
              const card = result.cards.find(c => c.id === activeCard)!;
              const img = card.arcana === "major" ? getTarotImage(card.name) : undefined;
              return (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setActiveCard(null)}
                  className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
                >
                  <motion.div
                    initial={{ y: 40, scale: 0.97, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="glass-card-elevated p-5 sm:p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
                  >
                    <p className="section-label mb-2">{pos.emoji} {pos.name}</p>
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                          width: 90, height: 150,
                          background: "linear-gradient(160deg, hsl(var(--primary)/0.18), hsl(var(--accent)/0.12))",
                          border: "1px solid hsl(var(--mystic-gold)/0.3)",
                          transform: card.isReversed ? "rotate(180deg)" : undefined,
                        }}
                      >
                        {img ? (
                          <img src={img} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">{card.suit ? SUIT_EMOJI[card.suit] : "🃏"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-foreground font-semibold">{card.name}</h3>
                        {card.isReversed && (
                          <p className="text-[11px] font-body mt-1" style={{ color: "hsl(var(--mystic-gold))" }}>
                            Aparece invertida — energía en proceso de integrarse
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 font-body mt-1">
                          Arquetipo: {card.archetype}
                        </p>
                      </div>
                    </div>
                    <p className="font-body text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                      {card.interpretation}
                    </p>
                    <button onClick={() => setActiveCard(null)} className="btn-glass w-full py-2.5 mt-5 text-sm">
                      Cerrar
                    </button>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

        </div>
      </div>

      <style>{`
        .celtic-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          grid-template-areas:
            ".  p5  .  p7 p7"
            "p4 p1  p6 p8 p8"
            ".  p3  .  p9 p9"
            ".  .   .  p10 p10";
          padding: 6px;
        }
        @media (max-width: 520px) {
          .celtic-grid { gap: 6px; }
        }
        .celtic-grid > * { grid-area: var(--ga); }
      `}</style>
    </>
  );
};

// ─── Single card component with flip ──────────────────────────────────────
interface CardProps { pos: PositionMeta; card: CardResult; revealed: boolean; isCrossing: boolean; onOpen: () => void; }
const CelticCard = ({ pos, card, revealed, isCrossing, onOpen }: CardProps) => {
  const img = card.arcana === "major" ? getTarotImage(card.name) : undefined;
  return (
    <button
      onClick={onOpen}
      style={{ ["--ga" as any]: pos.gridArea } as React.CSSProperties}
      className="relative aspect-[2/3] focus:outline-none group"
      aria-label={`${pos.name}: ${revealed ? card.name : "carta oculta"}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: `${revealed ? "rotateY(180deg)" : "rotateY(0deg)"} ${isCrossing ? "rotate(8deg)" : ""}`,
        }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 rounded-lg flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, hsl(248 35% 14%), hsl(258 40% 10%))",
            border: "1px solid hsl(var(--mystic-gold) / 0.25)",
            boxShadow: "0 4px 14px hsl(0 0% 0% / 0.5)",
          }}
        >
          <div className="text-base opacity-60" style={{ color: "hsl(var(--mystic-gold))" }}>✦</div>
        </div>
        {/* Front */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: `rotateY(180deg) ${card.isReversed ? "rotate(180deg)" : ""}`,
            background: "linear-gradient(160deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.12))",
            border: `1px solid hsl(var(--mystic-gold) / ${card.isReversed ? 0.5 : 0.3})`,
            boxShadow: "0 4px 14px hsl(0 0% 0% / 0.45), 0 0 16px hsl(var(--primary)/0.1)",
          }}
        >
          {img ? (
            <img src={img} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-1">
              <span className="text-2xl mb-1">{card.suit ? SUIT_EMOJI[card.suit] : "🃏"}</span>
              <span className="text-[8px] text-center font-body text-foreground/80 leading-tight px-1">
                {card.name}
              </span>
            </div>
          )}
        </div>
      </div>
      {revealed && (
        <span
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.08em] font-display whitespace-nowrap"
          style={{ color: "hsl(var(--mystic-gold) / 0.85)" }}
        >
          {pos.emoji} {pos.short}
        </span>
      )}
    </button>
  );
};

export default CelticCross;
