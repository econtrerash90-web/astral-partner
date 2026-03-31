import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";

const Register = () => {
  const { signUp, user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptSensitiveData, setAcceptSensitiveData] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) return toast.error("Completa todos los campos");
    if (password.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    if (password !== confirmPassword) return toast.error("Las contraseñas no coinciden");
    if (!acceptTerms) return toast.error("Debes aceptar los Términos y Condiciones");
    if (!acceptSensitiveData) return toast.error("Debes aceptar el tratamiento de datos sensibles para usar Astrelle");

    setIsSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      toast.error(error);
    } else {
      toast.success("¡Cuenta creada! Revisa tu email para confirmar tu cuenta.");
    }
    setIsSubmitting(false);
  };

  const fields = [
    { name: "fullName", label: "Nombre Completo", icon: User, type: "text", value: fullName, setter: setFullName, placeholder: "María Elena García" },
    { name: "email", label: "Email", icon: Mail, type: "email", value: email, setter: setEmail, placeholder: "tu@email.com" },
    { name: "password", label: "Contraseña", icon: Lock, type: "password", value: password, setter: setPassword, placeholder: "Mínimo 8 caracteres" },
    { name: "confirm", label: "Confirmar Contraseña", icon: Lock, type: "password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repite tu contraseña" },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4 glass-card p-8 sm:p-10 my-8"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-foreground mb-1">
            Crear Cuenta
          </h1>
          <p className="text-muted-foreground font-body text-sm">Comienza tu viaje astral</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                <field.icon className="w-3.5 h-3.5 text-primary" /> {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className="input-modern"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {/* Consent checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-border/30 bg-muted/20 text-primary focus:ring-primary/30"
              />
              <span className="text-foreground/70 text-xs font-body leading-relaxed">
                He leído y acepto los{" "}
                <Link to="/terminos" className="text-primary hover:underline" target="_blank">Términos y Condiciones</Link>,
                el{" "}
                <Link to="/privacidad" className="text-primary hover:underline" target="_blank">Aviso de Privacidad</Link>
                {" "}y la{" "}
                <Link to="/reembolso" className="text-primary hover:underline" target="_blank">Política de Reembolso</Link>.
                <span className="text-destructive"> *</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptSensitiveData}
                onChange={(e) => setAcceptSensitiveData(e.target.checked)}
                className="mt-1 rounded border-border/30 bg-muted/20 text-primary focus:ring-primary/30"
              />
              <span className="text-foreground/70 text-xs font-body leading-relaxed">
                Otorgo mi <strong>consentimiento expreso</strong> para el tratamiento de mis datos sensibles (fecha, hora y lugar de nacimiento) conforme al{" "}
                <Link to="/privacidad" className="text-primary hover:underline" target="_blank">Aviso de Privacidad</Link> y la LFPDPPP.
                <span className="text-destructive"> *</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptMarketing}
                onChange={(e) => setAcceptMarketing(e.target.checked)}
                className="mt-1 rounded border-border/30 bg-muted/20 text-primary focus:ring-primary/30"
              />
              <span className="text-foreground/70 text-xs font-body leading-relaxed">
                Deseo recibir novedades, contenido astrológico y promociones por correo electrónico. (Opcional)
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !acceptTerms || !acceptSensitiveData}
            className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 text-muted-foreground font-body">o regístrate con</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) toast.error("Error al registrarse con Google");
            }}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 text-foreground font-body text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={async () => {
              const { error } = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: window.location.origin,
              });
              if (error) toast.error("Error al registrarse con Apple");
            }}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-3 text-foreground font-body text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continuar con Apple
          </button>
        </div>

        <p className="mt-6 text-center text-muted-foreground text-sm font-body">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
