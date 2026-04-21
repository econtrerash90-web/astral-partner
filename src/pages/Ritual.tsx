import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, RefreshCw, Star, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ResultShareButtons from "@/components/ResultShareButtons";

interface RitualData {
  candleColor: string;
  title: string;
  description: string;
  bestTime: string;
}

const Ritual = () => {
  const { user } = useAuth();
  const resultRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<{ sun_sign_name: string; moon_sign: string; ascendant: string } | null>(null);
  const [data, setData] = useState<RitualData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

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

      const { data: cached } = await supabase
        .from("astral_extras" as any)
        .select("result")
        .eq("user_id", user.id)
        .eq("type", "ritual")
        .maybeSingle();
      if (cached) setData((cached as any).result);

      setPageLoading(false);
    };
    load();
  }, [user]);

  const generate = async () => {
    if (!chartData || !user) return;
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("astral-extras", {
        body: { type: "ritual", ...chartData },
      });
      if (error) throw error;
      if ((result as any)?.error) throw new Error((result as any).error);
      setData(result);

      await supabase.from("astral_extras" as any).upsert(
        { user_id: user.id, type: "ritual", result, created_at: new Date().toISOString() },
        { onConflict: "user_id,type" }
      );
    } catch {
      toast.error("No se pudo generar tu ritual sugerido");
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10 animate-pulse text-muted-foreground font-body">Cargando...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-16 max-w-lg mx-auto text-center">
          <Flame className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-3">Ritual Sugerido</h1>
          <p className="text-muted-foreground font-body mb-6">Primero necesitas generar tu carta astral para recibir un ritual personalizado.</p>
          <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity">
            Generar Carta Astral
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-lg mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-2" style={{ backgroundImage: "var(--gradient-title)" }}>
            Ritual Sugerido
          </h1>
          <p className="text-muted-foreground text-sm font-body">Ritual con velas alineado a tu carta astral y los astros actuales</p>
        </motion.header>

        {data ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div ref={resultRef} className="glass-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground font-semibold mb-1">{data.title}</h2>
                <p className="text-primary text-sm font-body">🕯️ Vela {data.candleColor} · {data.bestTime}</p>
              </div>
              <div className="bg-muted/30 p-5 rounded-xl border border-border">
                <p className="text-foreground/80 text-base font-body leading-relaxed">{data.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={generate} disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-body text-sm font-medium bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Generando..." : "Nuevo Ritual"}
              </button>
              <button onClick={() => setShowShare(!showShare)} className="flex-1 py-3.5 rounded-xl font-body text-sm font-medium bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
            {showShare && (
              <ResultShareButtons
                captureRef={resultRef}
                filename="ritual"
                shareText={`✨ Mi ritual del día: ${data.title}`}
              />
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
            <Star className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-body mb-6">Recibe un ritual personalizado con velas según tu energía astral</p>
            <button onClick={generate} disabled={isLoading} className="px-8 py-3.5 rounded-xl font-body text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto disabled:opacity-50">
              <Flame className="w-4 h-4" />
              {isLoading ? "Preparando tu ritual..." : "Revelar Mi Ritual"}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Ritual;
