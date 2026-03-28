import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Star, BookOpen, TrendingUp, Calendar, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, signOut, updatePassword } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; created_at: string } | null>(null);
  const [chart, setChart] = useState<{ sun_sign_name: string; sun_sign_symbol: string; moon_sign: string; ascendant: string } | null>(null);
  const [stats, setStats] = useState({ entries: 0, predictions: 0 });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, chartRes, entriesRes, predictionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, created_at").eq("id", user.id).single(),
        supabase.from("astral_charts").select("sun_sign_name, sun_sign_symbol, moon_sign, ascendant").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("weekly_predictions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (chartRes.data) setChart(chartRes.data);
      setStats({ entries: entriesRes.count ?? 0, predictions: predictionsRes.count ?? 0 });
    };
    load();
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error("Mínimo 8 caracteres");
    if (newPassword !== confirmPassword) return toast.error("Las contraseñas no coinciden");
    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    if (error) toast.error(error);
    else { toast.success("Contraseña actualizada"); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
  };

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "";
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "—";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen relative">
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-display text-xl font-bold">
            {initials}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-1" style={{ backgroundImage: "var(--gradient-title)" }}>
            Mi Perfil
          </h1>
          <p className="text-muted-foreground text-sm font-body">Miembro desde {memberSince}</p>
        </motion.div>

        <div className="space-y-4">
          {/* Personal info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Información</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary/60" />
                <span className="text-foreground font-body">{displayName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary/60" />
                <span className="text-foreground font-body text-sm">{user?.email}</span>
              </div>
            </div>
          </motion.div>

          {/* Chart summary */}
          {chart && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Tu Carta Astral</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { emoji: chart.sun_sign_symbol, label: "Sol", value: chart.sun_sign_name },
                  { emoji: "🌙", label: "Luna", value: chart.moon_sign },
                  { emoji: "⬆️", label: "Ascendente", value: chart.ascendant },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/30 rounded-xl p-3">
                    <p className="text-2xl mb-1">{item.emoji}</p>
                    <p className="text-muted-foreground text-xs font-body uppercase tracking-wider">{item.label}</p>
                    <p className="text-foreground font-body text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Estadísticas</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-accent/60" />
                <div>
                  <p className="text-foreground text-xl font-display font-bold">{stats.entries}</p>
                  <p className="text-muted-foreground text-xs font-body">Entradas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-accent/60" />
                <div>
                  <p className="text-foreground text-xl font-display font-bold">{stats.predictions}</p>
                  <p className="text-muted-foreground text-xs font-body">Predicciones</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Change password */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Cambiar Contraseña</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Lock className="w-3 h-3 text-primary/60" /> Nueva Contraseña
                </label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="input-modern" placeholder="Mínimo 8 caracteres" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Lock className="w-3 h-3 text-primary/60" /> Confirmar
                </label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-modern" placeholder="Repite tu contraseña" />
              </div>
              <button type="submit" disabled={changingPassword} className="btn-gold py-2.5">
                {changingPassword ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          </motion.div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full btn-glass-destructive flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
