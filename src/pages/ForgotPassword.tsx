import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa tu email");
    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) toast.error(error);
    else setSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4 glass-card p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-foreground mb-1">
            Recuperar Contraseña
          </h1>
          <p className="text-muted-foreground font-body text-sm">Te enviaremos un enlace de recuperación</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8" />
            </div>
            <p className="text-foreground font-body">Revisa tu bandeja de entrada</p>
            <p className="text-muted-foreground font-body text-sm">Te enviamos un enlace para restablecer tu contraseña.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline font-body text-sm">
              <ArrowLeft className="w-4 h-4" /> Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Enviando..." : "Enviar Enlace"}
            </button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm font-body transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver al login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
