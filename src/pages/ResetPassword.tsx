import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setIsRecovery(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Mínimo 8 caracteres");
    if (password !== confirm) return toast.error("Las contraseñas no coinciden");
    setIsSubmitting(true);
    const { error } = await updatePassword(password);
    if (error) toast.error(error);
    else {
      toast.success("¡Contraseña actualizada!");
      navigate("/");
    }
    setIsSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <p className="text-foreground font-body text-lg">Enlace inválido o expirado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4 bg-card/60 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-mystic-gold/30"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="text-center mb-8">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold tracking-[0.1em] bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-title)" }}>
            Nueva Contraseña
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-primary font-display text-xs tracking-wide mb-2">
              <Lock className="w-4 h-4" /> Nueva Contraseña
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cosmic-deep/60 border-2 border-mystic-gold/30 rounded-xl text-foreground font-body text-lg transition-all outline-none focus:border-primary focus:shadow-[0_0_20px_hsl(var(--mystic-gold)/0.3)] placeholder:text-foreground/30"
              placeholder="Mínimo 8 caracteres" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-primary font-display text-xs tracking-wide mb-2">
              <Lock className="w-4 h-4" /> Confirmar
            </label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-cosmic-deep/60 border-2 border-mystic-gold/30 rounded-xl text-foreground font-body text-lg transition-all outline-none focus:border-primary focus:shadow-[0_0_20px_hsl(var(--mystic-gold)/0.3)] placeholder:text-foreground/30"
              placeholder="Repite tu contraseña" />
          </div>
          <motion.button type="submit" disabled={isSubmitting} whileHover={{ y: -2 }} whileTap={{ y: 0 }}
            className="w-full py-4 rounded-xl font-display text-base font-semibold tracking-wide text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}>
            {isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
