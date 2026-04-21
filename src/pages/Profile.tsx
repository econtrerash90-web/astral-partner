import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, BookOpen, TrendingUp, Lock, LogOut, Pencil, Calendar, Clock, MapPin, AlertTriangle, Loader2, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import AchievementsSection from "@/components/AchievementsSection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ChartData {
  id: string;
  sun_sign_name: string;
  sun_sign_symbol: string;
  moon_sign: string;
  ascendant: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
}

const Profile = () => {
  const { user, signOut, updatePassword, session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; created_at: string } | null>(null);
  const [chart, setChart] = useState<ChartData | null>(null);
  const [stats, setStats] = useState({ entries: 0, predictions: 0 });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Edit chart state
  const [editOpen, setEditOpen] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  // Account management state
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [profileRes, chartRes, entriesRes, predictionsRes] = await Promise.all([
      supabase.from("profiles").select("full_name, created_at").eq("id", user.id).single(),
      supabase.from("astral_charts").select("id, sun_sign_name, sun_sign_symbol, moon_sign, ascendant, birth_date, birth_time, birth_place").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("weekly_predictions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (chartRes.data) setChart(chartRes.data);
    setStats({ entries: entriesRes.count ?? 0, predictions: predictionsRes.count ?? 0 });
  };

  useEffect(() => { loadData(); }, [user]);

  const openEditDialog = () => {
    if (!chart) return;
    setEditDate(chart.birth_date);
    setEditTime(chart.birth_time);
    setEditPlace(chart.birth_place);
    setConfirmStep(false);
    setEditOpen(true);
  };

  const hasChanges = chart && (editDate !== chart.birth_date || editTime !== chart.birth_time || editPlace !== chart.birth_place);

  const handleSaveChart = async () => {
    if (!chart || !hasChanges) return;

    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("astral_charts")
      .update({ birth_date: editDate, birth_time: editTime, birth_place: editPlace })
      .eq("id", chart.id);

    if (error) {
      toast.error("Error al actualizar los datos");
    } else {
      toast.success("Datos actualizados. Tus signos han sido recalculados y tus lecturas se regenerarán.");
      setEditOpen(false);
      await loadData();
    }
    setSaving(false);
  };

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider">Tu Carta Astral</h2>
                <button
                  onClick={openEditDialog}
                  className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors font-body"
                >
                  <Pencil className="w-3 h-3" />
                  Editar datos
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
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
              <div className="space-y-1.5 text-xs text-muted-foreground font-body">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary/40" />
                  <span>{new Date(chart.birth_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary/40" />
                  <span>{chart.birth_time} hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary/40" />
                  <span>{chart.birth_place}</span>
                </div>
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

          {/* Achievements */}
          <AchievementsSection />

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

          {/* Data management (ARCO) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Mis Datos (Derechos ARCO)</h2>
            <p className="text-muted-foreground text-xs font-body mb-4 leading-relaxed">
              Conforme a la LFPDPPP, puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales.
            </p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (!session?.access_token) return;
                  setExporting(true);
                  try {
                    const url = import.meta.env.VITE_SUPABASE_URL;
                    const res = await fetch(`${url}/functions/v1/manage-account`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({ action: "export" }),
                    });
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `astrelle-datos-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success("Datos exportados exitosamente");
                  } catch {
                    toast.error("Error al exportar los datos");
                  }
                  setExporting(false);
                }}
                disabled={exporting}
                className="w-full btn-glass flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Exportar mis datos
              </button>

              <button
                onClick={() => { setDeleteOpen(true); setDeleteConfirmText(""); }}
                className="w-full btn-glass-destructive flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar mi cuenta y datos
              </button>
            </div>
          </motion.div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full btn-glass flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Eliminar Cuenta
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán todos tus datos: carta astral, lecturas, diario, predicciones, fechas importantes y tu cuenta de usuario.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="font-body text-sm text-foreground/90 space-y-1">
                <p className="font-medium">Se eliminarán permanentemente:</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Tu perfil y carta astral</li>
                  <li>Todas las lecturas y predicciones</li>
                  <li>Entradas del diario astral</li>
                  <li>Fechas importantes guardadas</li>
                  <li>Tu cuenta de usuario</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="text-foreground/80 font-body text-sm mb-2 block">
                Escribe <strong>"ELIMINAR"</strong> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-modern"
                placeholder="ELIMINAR"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteOpen(false)}
              className="btn-glass px-4 py-2 text-sm"
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (deleteConfirmText !== "ELIMINAR" || !session?.access_token) return;
                setDeleting(true);
                try {
                  const url = import.meta.env.VITE_SUPABASE_URL;
                  const res = await fetch(`${url}/functions/v1/manage-account`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ action: "delete" }),
                  });
                  if (!res.ok) throw new Error();
                  toast.success("Tu cuenta ha sido eliminada. Hasta pronto. ✨");
                  setDeleteOpen(false);
                  await signOut();
                  navigate("/");
                } catch {
                  toast.error("Error al eliminar la cuenta. Intenta de nuevo.");
                }
                setDeleting(false);
              }}
              disabled={deleting || deleteConfirmText !== "ELIMINAR"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 text-sm rounded-xl font-body font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? "Eliminando..." : "Eliminar permanentemente"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chart Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setConfirmStep(false); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Editar Datos de Nacimiento</DialogTitle>
            <DialogDescription className="font-body text-sm">
              Al cambiar estos datos, tus signos se recalcularán automáticamente y las lecturas actuales se regenerarán.
            </DialogDescription>
          </DialogHeader>

          {!confirmStep ? (
            <div className="space-y-4 py-2">
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="input-modern"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Hora de Nacimiento
                </label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="input-modern"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Lugar de Nacimiento
                </label>
                <input
                  type="text"
                  value={editPlace}
                  onChange={(e) => setEditPlace(e.target.value)}
                  className="input-modern"
                  placeholder="Ciudad, País"
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm text-foreground/90 space-y-2">
                  <p className="font-medium">¿Estás segura de que deseas continuar?</p>
                  <p className="text-muted-foreground text-xs">
                    Al modificar tus datos de nacimiento, se eliminarán tus lecturas diarias, predicciones semanales, límites y extras actuales. Se generarán nuevos contenidos basados en tu nueva configuración astral.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => { setEditOpen(false); setConfirmStep(false); }}
              className="btn-glass px-4 py-2 text-sm"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveChart}
              disabled={saving || !hasChanges}
              className="btn-gold px-4 py-2 text-sm flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : confirmStep ? (
                "Confirmar cambios"
              ) : (
                "Guardar"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
