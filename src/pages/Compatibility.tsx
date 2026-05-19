import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Briefcase, Baby, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import CompatibilitySection from "@/components/CompatibilitySection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getZodiacSign } from "@/lib/astral-calculations";
import type { SignName } from "@/lib/compatibility";
import { formatAIText } from "@/lib/format-ai-text";
import { useI18n } from "@/hooks/useI18n";

interface ChartRow {
  full_name: string;
  sun_sign_name: string;
  moon_sign: string;
  ascendant: string;
}

type RelType = "amor" | "laboral" | "amistad" | "paternidad" | "especial";

const REL_KEY: Record<RelType, string> = {
  amor: "compat.optAmor",
  laboral: "compat.optLaboral",
  amistad: "compat.optAmistad",
  paternidad: "compat.optPaternidad",
  especial: "compat.optEspecial",
};
const REL_ICONS: Record<RelType, any> = {
  amor: Heart,
  laboral: Briefcase,
  amistad: Users,
  paternidad: Baby,
  especial: Sparkles,
};
const REL_TYPES: RelType[] = ["amor", "laboral", "amistad", "paternidad", "especial"];

interface AnalysisResult {
  overall: number;
  summary: string;
  strengths: string;
  challenges: string;
  advice: string;
  dynamics?: { label: string; score: number; note: string }[];
}

const Compatibility = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [chart, setChart] = useState<ChartRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"simple" | "full">("simple");

  // Full form state
  const [partnerName, setPartnerName] = useState("");
  const [partnerDate, setPartnerDate] = useState("");
  const [partnerTime, setPartnerTime] = useState("");
  const [partnerPlace, setPartnerPlace] = useState("");
  const [relType, setRelType] = useState<RelType>("amor");
  const [specialDetail, setSpecialDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("astral_charts")
        .select("full_name, sun_sign_name, moon_sign, ascendant")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setChart(data as ChartRow);
      setLoading(false);
    })();
  }, [user]);

  const handleAnalyze = async () => {
    setError("");
    if (!partnerName.trim()) return setError(t("compat.errName"));
    if (!partnerDate) return setError(t("compat.errDate"));
    if (relType === "especial" && !specialDetail.trim())
      return setError(t("compat.errType"));
    if (!chart) return;

    setSubmitting(true);
    setResult(null);
    try {
      const d = new Date(partnerDate + "T" + (partnerTime || "12:00"));
      const partnerSign = getZodiacSign(d.getMonth() + 1, d.getDate()).name;

      const { data, error: fnErr } = await supabase.functions.invoke("compatibility-analysis", {
        body: {
          userName: chart.full_name,
          userSign: chart.sun_sign_name,
          userMoon: chart.moon_sign,
          userAsc: chart.ascendant,
          partnerName: partnerName.trim(),
          partnerBirthDate: partnerDate,
          partnerBirthTime: partnerTime || undefined,
          partnerBirthPlace: partnerPlace.trim() || undefined,
          partnerSign,
          type: relType,
          specialDetail: relType === "especial" ? specialDetail.trim() : undefined,
        },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as AnalysisResult);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || t("compat.errAnalysis"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <Loader2 className="w-6 h-6 text-primary animate-spin relative z-10" />
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="min-h-screen relative">
        <StarField />
        <div className="relative z-10 px-4 py-16 max-w-lg mx-auto text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-3">{t("compat.title")}</h1>
          <p className="text-muted-foreground font-body mb-6">
            {t("compat.needProfile")}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity"
          >
            {t("compat.createProfile")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-10 max-w-2xl mx-auto space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1
            className="font-display text-3xl font-bold tracking-wide bg-clip-text text-transparent mb-1"
            style={{ backgroundImage: "var(--gradient-title)" }}
          >
            {t("compat.title")}
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {t("compat.subtitle")}
          </p>
        </motion.header>

        {/* Tabs */}
        <div className="glass-card p-1 grid grid-cols-2 gap-1 rounded-xl">
          {(
            [
              { id: "simple", labelKey: "compat.simple" },
              { id: "full", labelKey: "compat.full" },
            ] as const
          ).map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`py-2 rounded-lg font-body text-sm transition-all ${
                tab === tabItem.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        {tab === "simple" ? (
          <CompatibilitySection userSign={chart.sun_sign_name as SignName} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 sm:p-6 space-y-4"
          >
            <p className="text-muted-foreground text-xs font-body">
              {t("compat.intro")}
            </p>

            <div className="space-y-3">
              <FieldInput
                label={t("compat.fullName")}
                value={partnerName}
                onChange={setPartnerName}
                placeholder={t("compat.partnerNamePh")}
              />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput
                  label={t("compat.birthDate")}
                  type="date"
                  value={partnerDate}
                  onChange={setPartnerDate}
                  max={new Date().toISOString().split("T")[0]}
                />
                <FieldInput
                  label={t("compat.timeOptional")}
                  type="time"
                  value={partnerTime}
                  onChange={setPartnerTime}
                />
              </div>
              <FieldInput
                label={t("compat.placeOptional")}
                value={partnerPlace}
                onChange={setPartnerPlace}
                placeholder={t("compat.placePh")}
              />
            </div>

            <div>
              <label className="text-foreground/80 font-body text-sm font-medium mb-2 block">
                {t("compat.typeLabel")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REL_TYPES.map((id) => {
                  const Icon = REL_ICONS[id];
                  const active = relType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRelType(id)}
                      className={`flex items-center gap-1.5 p-2.5 rounded-xl border transition-all text-xs font-body ${
                        active
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted/15 border-border/15 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{t(REL_KEY[id])}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {relType === "especial" && (
              <FieldInput
                label={t("compat.specifyType")}
                value={specialDetail}
                onChange={setSpecialDetail}
                placeholder={t("compat.specialPh")}
              />
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm font-body">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={submitting}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("compat.analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> {t("compat.analyze")}
                </>
              )}
            </button>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-3"
                >
                  <div className="glass-card-elevated p-4 rounded-xl border-primary/15 text-center">
                    <p className="text-xs text-muted-foreground font-body mb-1">
                      {chart.full_name.split(" ")[0]}{" "}
                      <span className="text-primary mx-1">×</span>{" "}
                      {partnerName.split(" ")[0]}
                    </p>
                    <p className="font-display text-3xl text-foreground font-semibold">
                      {result.overall}/10
                    </p>
                    <p className="text-xs text-primary font-body mt-1">{result.summary}</p>
                  </div>

                  {result.dynamics && result.dynamics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {result.dynamics.map((d, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-muted/15 border border-border/15"
                        >
                          <p className="section-label mb-1">{d.label}</p>
                          <p className="font-display text-lg text-foreground font-semibold">
                            {d.score}/10
                          </p>
                          <p className="text-[11px] text-muted-foreground font-body leading-snug">
                            {d.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="glass-card-elevated p-3 rounded-xl border-primary/10">
                    <p className="section-label mb-1">{t("compat.strengths")}</p>
                    <div className="text-xs font-body text-foreground/80 leading-relaxed">
                      {formatAIText(result.strengths)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/15 border border-border/15">
                    <p className="section-label mb-1">{t("compat.challenges")}</p>
                    <div className="text-xs font-body text-muted-foreground leading-relaxed">
                      {formatAIText(result.challenges)}
                    </div>
                  </div>

                  <div className="glass-card-elevated p-3 rounded-xl border-accent/15">
                    <p className="section-label mb-1">{t("compat.advice")}</p>
                    <div className="text-xs font-body text-foreground/85 leading-relaxed">
                      {formatAIText(result.advice)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  max?: string;
}) => {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className="text-foreground/80 font-body text-sm font-medium mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        max={max}
        className="input-modern"
      />
    </div>
  );
};

export default Compatibility;
