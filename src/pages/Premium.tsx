import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Star, Sparkles, Loader2, Settings, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { useI18n } from "@/hooks/useI18n";
import { PageSeo } from "@/components/PageSeo";

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/20 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left gap-3">
        <span className="text-sm font-body font-medium text-foreground">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pb-4">
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  );
};

const Premium = () => {
  const { isPremium, loading, subscriptionEnd, checkout, openPortal, checkSubscription } = useSubscription();
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();

  const freeBenefits = [
    t("premium.freeBenefit1"),
    t("premium.freeBenefit2"),
    t("premium.freeBenefit3"),
    t("premium.freeBenefit4"),
  ];
  const premiumBenefits = [
    t("premium.benefit1"),
    t("premium.benefit2"),
    t("premium.benefit3"),
    t("premium.benefit4"),
    t("premium.benefit5"),
    t("premium.benefit6"),
  ];
  const faqs = [
    { q: t("premium.faq1q"), a: t("premium.faq1a") },
    { q: t("premium.faq2q"), a: t("premium.faq2a") },
    { q: t("premium.faq3q"), a: t("premium.faq3a") },
    { q: t("premium.faq4q"), a: t("premium.faq4a") },
    { q: t("premium.faq5q"), a: t("premium.faq5a") },
    { q: t("premium.faq6q"), a: t("premium.faq6a") },
  ];

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success(t("premium.welcomeToast"));
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast.info(t("premium.canceledToast"));
    }
  }, [searchParams]);

  const localeMap: Record<string, string> = { es: "es-ES", en: "en-US", de: "de-DE", pl: "pl-PL", pt: "pt-BR" };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-2" style={{ backgroundImage: "var(--gradient-title)" }}>
            Astrelle Premium+
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {isPremium ? t("premium.activeMsg") : t("premium.upgradeMsg")}
          </p>
        </motion.div>

        {isPremium && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-5 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg text-foreground tracking-wide">{t("premium.activePlanTitle")}</h2>
            </div>
            <p className="text-muted-foreground text-sm font-body mb-4">
              {t("premium.renewsOn")} {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString(localeMap[language] || "en-US", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
            <button onClick={openPortal}
              className="flex items-center gap-2 text-sm font-body text-primary hover:text-primary/80 transition-colors">
              <Settings className="w-4 h-4" /> {t("premium.manageSub")}
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground">{t("premium.freePlanTitle")}</h3>
            </div>
            <p className="text-muted-foreground text-xs font-body mb-4">{t("premium.freePlanDesc")}</p>
            <div className="space-y-3">
              {freeBenefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm font-body text-foreground/80">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(var(--border) / 0.2)" }}>
              <p className="text-center text-muted-foreground text-xs font-body">{t("premium.currentPlan")}</p>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 border-primary/30 ring-1 ring-primary/20 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1 rounded-full">
              {t("premium.recommended")}
            </span>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg text-foreground">{t("premium.premiumPlanTitle")}</h3>
            </div>
            <p className="text-muted-foreground text-xs font-body mb-4">{t("premium.premiumPlanDesc")}</p>
            <div className="space-y-3">
              {premiumBenefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-body text-foreground/80">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="space-y-4" id="planes">
            <h2 className="font-display text-center text-lg text-foreground tracking-wide">{t("premium.choose")}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["monthly", "annual"] as const).map((key) => {
                const plan = PLANS[key];
                const isAnnual = key === "annual";
                return (
                  <div key={key}
                    className={`glass-card p-5 relative ${isAnnual ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                    {isAnnual && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1 rounded-full">
                        {t("premium.savePrefix")} {"savings" in plan ? plan.savings : ""}
                      </span>
                    )}
                    <h3 className="font-display text-lg text-foreground mb-1">{plan.label}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-display font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm font-body">/{plan.interval}</span>
                    </div>
                    <p className="text-muted-foreground/60 text-[10px] font-body text-center mt-2 leading-snug">
                      {t("premium.disclaimer")}
                    </p>
                    <button
                      onClick={() => checkout(key)}
                      disabled={loading}
                      className={`w-full py-3 rounded-xl font-body text-sm font-semibold transition-all mt-3 ${
                        isAnnual
                          ? "btn-gold"
                          : "bg-muted/50 text-foreground border border-border hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("premium.subscribeBtn")}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg text-foreground tracking-wide">{t("premium.faqTitle")}</h2>
          </div>
          <div className="divide-y-0">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Premium;
