import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Star, Sparkles, BookOpen, Map, Brain, TrendingUp, Loader2, Settings, Lock } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useSubscription, PLANS } from "@/hooks/useSubscription";

/* ── What each plan includes ── */
const freeBenefits = [
  "1 lectura de Tarot al día",
  "Tu perfil astral personalizado",
  "Lectura diaria básica",
  "Acceso al diario de reflexión",
];

const premiumBenefits = [
  "Lecturas ilimitadas de Tarot, El Secreto, Ángeles y Oráculo",
  "Mapa estelar interactivo con tu cielo de nacimiento",
  "Análisis emocional profundo en tu diario",
  "Consejos semanales personalizados",
  "Preguntas de reflexión más profundas",
  "Acceso anticipado a nuevas funciones",
];

const Premium = () => {
  const { isPremium, loading, subscriptionEnd, checkout, openPortal, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("¡Bienvenido a Premium+ ✨!");
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Suscripción cancelada");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-2" style={{ backgroundImage: "var(--gradient-title)" }}>
            Astrelle Premium+
          </h1>
          <p className="text-muted-foreground text-sm font-body">
            {isPremium ? "Tu suscripción está activa" : "Lleva tu experiencia al siguiente nivel"}
          </p>
        </motion.div>

        {/* Active subscription banner */}
        {isPremium && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-5 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg text-foreground tracking-wide">Plan Activo</h2>
            </div>
            <p className="text-muted-foreground text-sm font-body mb-4">
              Tu suscripción se renueva el {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
            <button onClick={openPortal}
              className="flex items-center gap-2 text-sm font-body text-primary hover:text-primary/80 transition-colors">
              <Settings className="w-4 h-4" /> Gestionar suscripción
            </button>
          </motion.div>
        )}

        {/* ── Plan Comparison ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Free plan */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-lg text-foreground">Gratis</h3>
            </div>
            <p className="text-muted-foreground text-xs font-body mb-4">Para conocer las estrellas</p>
            <div className="space-y-3">
              {freeBenefits.map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm font-body text-foreground/80">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid hsl(var(--border) / 0.2)" }}>
              <p className="text-center text-muted-foreground text-xs font-body">Tu plan actual</p>
            </div>
          </div>

          {/* Premium plan */}
          <div className="glass-card p-5 sm:p-6 border-primary/30 ring-1 ring-primary/20 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1 rounded-full">
              Recomendado
            </span>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg text-foreground">Premium+</h3>
            </div>
            <p className="text-muted-foreground text-xs font-body mb-4">Todo sin límites</p>
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

        {/* ── Pricing cards ── */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="space-y-4">
            <h2 className="font-display text-center text-lg text-foreground tracking-wide">Elige tu plan Premium+</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["monthly", "annual"] as const).map((key) => {
                const plan = PLANS[key];
                const isAnnual = key === "annual";
                return (
                  <div key={key}
                    className={`glass-card p-5 relative ${isAnnual ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                    {isAnnual && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-body font-semibold px-3 py-1 rounded-full">
                        Ahorra {"savings" in plan ? plan.savings : ""}
                      </span>
                    )}
                    <h3 className="font-display text-lg text-foreground mb-1">{plan.label}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-display font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm font-body">/{plan.interval}</span>
                    </div>
                    <p className="text-muted-foreground/60 text-[10px] font-body text-center mt-2 leading-snug">
                      Al suscribirte, confirmas que Astrelle es un servicio de entretenimiento sin garantías de resultados.
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
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Suscribirme"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Premium;
