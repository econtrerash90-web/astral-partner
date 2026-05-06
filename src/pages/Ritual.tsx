import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { supabase } from "@/integrations/supabase/client";
import ResultShareButtons from "@/components/ResultShareButtons";

interface RitualData {
  candleColor: string;
  title: string;
  description: string;
  bestTime: string;
  _date?: string;
}

const Ritual = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const resultRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<{ sun_sign_name: string; moon_sign: string; ascendant: string } | null>(null);
  const [data, setData] = useState<RitualData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");

    const load = async () => {
      const { data: chart } = await supabase
        .from("astral_charts")
        .select("sun_sign_name, moon_sign, ascendant")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!chart) {
        setPageLoading(false);
        return;
      }
      setChartData(chart);

      const { data: cached } = await supabase
        .from("astral_extras" as any)
        .select("result")
        .eq("user_id", user.id)
        .eq("type", "ritual")
        .maybeSingle();

      const cachedResult = (cached as any)?.result as RitualData | undefined;
      if (cachedResult && cachedResult._date === today) {
        setData(cachedResult);
        setPageLoading(false);
        return;
      }

      setGenerating(true);
      setPageLoading(false);
      try {
        const { data: result, error } = await supabase.functions.invoke("astral-extras", {
          body: { type: "ritual", ...chart },
        });
        if (error) throw error;
        if ((result as any)?.error) throw new Error((result as any).error);
        const stamped = { ...(result as RitualData), _date: today };
        setData(stamped);
        await supabase.from("astral_extras" as any).upsert(
          { user_id: user.id, type: "ritual", result: stamped, created_at: new Date().toISOString() },
          { onConflict: "user_id,type" }
        );
      } catch {
        toast.error(t("ritual.error"));
      } finally {
        setGenerating(false);
      }
    };
    load();
  }, [user]);

  if (pageLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10 animate-pulse text-muted-foreground font-body">{t("common.loading")}</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-16 max-w-lg mx-auto text-center">
          <Flame className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-3">{t("ritual.title")}</h1>
          <p className="text-muted-foreground font-body mb-6">{t("ritual.needChart")}</p>
          <Link to="/" className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity">
            {t("ritual.generateChart")}
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
            {t("ritual.title")}
          </h1>
          <p className="text-muted-foreground text-sm font-body">{t("ritual.subtitle")}</p>
        </motion.header>

        {generating && !data ? (
          <div className="glass-card p-8 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground font-body text-sm">{t("ritual.preparing")}</p>
          </div>
        ) : data ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div ref={resultRef} className="glass-card p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground font-semibold mb-1">{data.title}</h2>
                <p className="text-primary text-sm font-body">🕯️ {t("ritual.candle")} {data.candleColor} · {data.bestTime}</p>
              </div>
              <div className="bg-muted/30 p-5 rounded-xl border border-border">
                <p className="text-foreground/80 text-base font-body leading-relaxed">{data.description}</p>
              </div>
            </div>
            <button onClick={() => setShowShare(!showShare)} className="w-full py-3.5 rounded-xl font-body text-sm font-medium bg-accent/15 text-accent border border-accent/20 hover:bg-accent/25 transition-all flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              {t("common.share")}
            </button>
            {showShare && (
              <ResultShareButtons
                captureRef={resultRef}
                filename="ritual"
                shareText={`✨ Mi ritual de hoy: ${data.title}`}
              />
            )}
            <p className="text-center text-muted-foreground/50 text-[11px] font-body">
              {t("ritual.renewsDaily")}
            </p>
          </motion.div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground font-body">{t("ritual.errorGeneral")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ritual;
