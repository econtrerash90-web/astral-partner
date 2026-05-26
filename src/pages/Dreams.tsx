import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Loader2, ChevronDown, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatAIText } from "@/lib/format-ai-text";
import { PageSeo } from "@/components/PageSeo";

interface DreamEntry {
  id: string;
  dream_text: string;
  interpretation: string;
  symbols: string[] | null;
  mood: string | null;
  created_at: string;
}

const Dreams = () => {
  const { user } = useAuth();
  const [dreamText, setDreamText] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<DreamEntry | null>(null);
  const [history, setHistory] = useState<DreamEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [usedToday, setUsedToday] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("dream_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory((data as DreamEntry[]) ?? []);
  };

  const checkLimit = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_limits")
      .select("dream_count")
      .eq("user_id", user.id)
      .eq("limit_date", today)
      .maybeSingle();
    setUsedToday((data?.dream_count ?? 0) >= 1);
  };

  useEffect(() => {
    loadHistory();
    checkLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleInterpret = async () => {
    const text = dreamText.trim();
    if (text.length < 10) {
      toast.error("Cuéntanos un poco más sobre tu sueño.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("interpret-dream", {
        body: { dream_text: text },
      });
      if (error) {
        const msg = (error as any)?.context?.message || error.message || "Error";
        toast.error(msg);
        return;
      }
      if (data?.error) {
        toast.error(data.message || data.error);
        if (data.error === "limit_reached") setUsedToday(true);
        return;
      }
      setCurrent(data.dream as DreamEntry);
      setDreamText("");
      setUsedToday(true);
      loadHistory();
    } catch (e) {
      toast.error("No pudimos interpretar tu sueño, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar este sueño?")) return;
    const { error } = await supabase.from("dream_entries").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo borrar.");
      return;
    }
    setHistory((h) => h.filter((d) => d.id !== id));
    if (current?.id === id) setCurrent(null);
    if (openId === id) setOpenId(null);
  };

  return (
    <div className="min-h-screen relative">
      <PageSeo title="Interpretación de sueños | Astrelle" description="Cuenta tu sueño y recibe una interpretación basada en tu carta astral." path="/suenos" />
      <StarField />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{
              background: "radial-gradient(circle at 30% 25%, hsl(var(--mystic-gold) / 0.3), hsl(var(--cosmic-purple) / 0.4))",
              border: "1px solid hsl(var(--mystic-gold) / 0.3)",
            }}>
            <Moon className="w-7 h-7 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(var(--mystic-gold) / 0.6))" }} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">
            Interpreta Tus Sueños
          </h1>
          <p className="text-muted-foreground text-sm font-body max-w-md mx-auto">
            Une la sabiduría de las estrellas con la psicología profunda para entender el mensaje detrás de tu sueño.
          </p>
        </div>

        {/* Input card */}
        <div className="glass-card p-5 mb-6">
          <label className="block text-xs font-display tracking-widest text-muted-foreground mb-3">
            CUÉNTANOS TU SUEÑO
          </label>
          <textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="Anoche soñé que..."
            rows={6}
            maxLength={3000}
            disabled={loading || usedToday}
            className="w-full bg-background/40 border border-border/40 rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-muted-foreground/60 font-body">
              {dreamText.length}/3000
            </span>
            <button
              onClick={handleInterpret}
              disabled={loading || usedToday || dreamText.trim().length < 10}
              className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Interpretando...
                </>
              ) : usedToday ? (
                "Vuelve Mañana"
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Interpretar
                </>
              )}
            </button>
          </div>
          {usedToday && !current && (
            <p className="text-[11px] text-muted-foreground/70 font-body mt-3 text-center">
              Ya interpretaste tu sueño de hoy. Mañana podrás compartir uno nuevo.
            </p>
          )}
        </div>

        {/* Current interpretation */}
        <AnimatePresence>
          {current && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card-elevated p-6 mb-8 border-primary/20"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Interpretación</p>
                {current.mood && (
                  <span className="text-[11px] font-body text-primary/80 px-2 py-1 rounded-full border border-primary/20">
                    {current.mood}
                  </span>
                )}
              </div>
              <div className="text-foreground/85 text-sm font-body leading-relaxed">
                {formatAIText(current.interpretation)}
              </div>
              {current.symbols && current.symbols.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border/20">
                  <p className="text-[11px] font-display tracking-widest text-muted-foreground mb-2">SÍMBOLOS CLAVE</p>
                  <div className="flex flex-wrap gap-2">
                    {current.symbols.map((s, i) => (
                      <span key={i} className="text-[11px] font-body px-2.5 py-1 rounded-full bg-primary/10 text-primary/90 border border-primary/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="font-display text-lg tracking-wide text-foreground mb-4">Sueños Anteriores</h2>
            <div className="space-y-3">
              {history.map((d) => {
                const open = openId === d.id;
                const date = new Date(d.created_at).toLocaleDateString("es-ES", {
                  day: "numeric", month: "short", year: "numeric",
                });
                return (
                  <div key={d.id} className="glass-card overflow-hidden">
                    <button
                      onClick={() => setOpenId(open ? null : d.id)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-muted-foreground/70 font-body mb-1">{date}{d.mood ? ` · ${d.mood}` : ""}</p>
                        <p className="text-sm text-foreground/80 font-body truncate">{d.dream_text}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 border-t border-border/20">
                            <p className="text-[11px] font-display tracking-widest text-muted-foreground mb-2 mt-3">EL SUEÑO</p>
                            <p className="text-sm text-foreground/75 font-body italic mb-4 whitespace-pre-wrap">{d.dream_text}</p>
                            <p className="text-[11px] font-display tracking-widest text-muted-foreground mb-2">INTERPRETACIÓN</p>
                            <div className="text-sm text-foreground/85 font-body leading-relaxed">
                              {formatAIText(d.interpretation)}
                            </div>
                            {d.symbols && d.symbols.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {d.symbols.map((s, i) => (
                                  <span key={i} className="text-[11px] font-body px-2.5 py-1 rounded-full bg-primary/10 text-primary/90 border border-primary/20">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-destructive font-body transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Borrar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dreams;
