import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, BookOpen, TrendingUp, Lock, LogOut, Pencil, Calendar, Clock, MapPin, AlertTriangle, Loader2, Download, Trash2, Shield, ChevronRight, Building2, Map, Globe, Languages } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { LanguageCode } from "@/lib/i18n/languages";
import { supabase } from "@/integrations/supabase/client";
import { normalizeBirthFields } from "@/lib/normalize-text";
import elfawaLogo from "@/assets/elfawa-logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageSeo } from "@/components/PageSeo";

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
  const { language, setLanguage, supported, t } = useI18n();
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
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
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
    // Try to split saved birth_place "City, State, Country"
    const parts = (chart.birth_place || "").split(",").map((p) => p.trim());
    setEditCity(parts[0] || "");
    setEditState(parts[1] || "");
    setEditCountry(parts[2] || parts[1] || "");
    setConfirmStep(false);
    setEditOpen(true);
  };

  const normalizedEdit = normalizeBirthFields({
    fullName: "",
    birthCity: editCity,
    birthState: editState,
    birthCountry: editCountry,
  });
  const composedPlace = normalizedEdit.birthPlace;
  const hasChanges = chart && (
    editDate !== chart.birth_date ||
    editTime !== chart.birth_time ||
    composedPlace !== chart.birth_place
  );
  const placeComplete = editCity.trim() && editState.trim() && editCountry.trim();

  const handleSaveChart = async () => {
    if (!chart || !hasChanges) return;
    if (!placeComplete) {
      toast.error(t("profile.errPlaceFields"));
      return;
    }

    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("astral_charts")
      .update({ birth_date: editDate, birth_time: editTime, birth_place: composedPlace })
      .eq("id", chart.id);

    if (error) {
      toast.error(t("profile.errUpdate"));
    } else {
      try {
        await supabase.functions.invoke("recalculate-chart", { body: {} });
      } catch (e) {
        console.error("recalculate-chart failed:", e);
      }
      toast.success(t("profile.updated"));
      setEditOpen(false);
      await loadData();
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error(t("profile.errPwdMin"));
    if (newPassword !== confirmPassword) return toast.error(t("profile.errPwdMatch"));
    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    if (error) toast.error(error);
    else { toast.success(t("profile.pwdUpdated")); setNewPassword(""); setConfirmPassword(""); }
    setChangingPassword(false);
  };

  const localeMap: Record<string, string> = { es: "es-ES", en: "en-US", de: "de-DE", pl: "pl-PL", pt: "pt-BR" };
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(localeMap[language] || "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "—";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen relative">
      <PageSeo title="Mi perfil | Astrelle" description="Gestiona tus datos de nacimiento, idioma y preferencias." path="/perfil" />
      <StarField />
      <div className="relative z-10 px-4 py-8 sm:py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-display text-xl font-bold">
            {initials}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide bg-clip-text text-transparent mb-1" style={{ backgroundImage: "var(--gradient-title)" }}>
            {t("profile.title")}
          </h1>
          <p className="text-muted-foreground text-sm font-body">{t("profile.memberSince")} {memberSince}</p>
        </motion.div>

        <div className="space-y-4">
          {/* Personal info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{t("profile.info")}</h2>
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

          {/* Preferred language */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t("profile.language")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {supported.map((lng) => (
                <button
                  key={lng.code}
                  onClick={async () => {
                    await setLanguage(lng.code as LanguageCode);
                    toast.success(t("profile.languageSaved"));
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all font-body text-sm ${
                    language === lng.code
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg">{lng.flag}</span>
                  <span>{lng.nativeLabel}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-body">{t("profile.languageHelp")}</p>
          </motion.div>


          {chart && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("profile.yourChart")}</h2>
                <button
                  onClick={openEditDialog}
                  className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors font-body"
                >
                  <Pencil className="w-3 h-3" />
                  {t("profile.editData")}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {[
                  { emoji: chart.sun_sign_symbol, label: t("profile.sun"), value: chart.sun_sign_name },
                  { emoji: "🌙", label: t("profile.moon"), value: chart.moon_sign },
                  { emoji: "⬆️", label: t("profile.ascendant"), value: chart.ascendant },
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
                  <span>{new Date(chart.birth_date + "T00:00:00").toLocaleDateString(localeMap[language] || "en-US", { day: "numeric", month: "long", year: "numeric" })}</span>
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
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{t("profile.statistics")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-accent/60" />
                <div>
                  <p className="text-foreground text-xl font-display font-bold">{stats.entries}</p>
                  <p className="text-muted-foreground text-xs font-body">{t("profile.entries")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <TrendingUp className="w-5 h-5 text-accent/60" />
                <div>
                  <p className="text-foreground text-xl font-display font-bold">{stats.predictions}</p>
                  <p className="text-muted-foreground text-xs font-body">{t("profile.predictions")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Change password */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{t("profile.changePassword")}</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Lock className="w-3 h-3 text-primary/60" /> {t("profile.newPassword")}
                </label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="input-modern" placeholder={t("profile.pwdMinPlaceholder")} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Lock className="w-3 h-3 text-primary/60" /> {t("profile.confirmPassword")}
                </label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-modern" placeholder={t("profile.pwdRepeatPlaceholder")} />
              </div>
              <button type="submit" disabled={changingPassword} className="btn-gold py-2.5">
                {changingPassword ? t("profile.updating") : t("profile.updateBtn")}
              </button>
            </form>
          </motion.div>

          {/* Data management (ARCO) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{t("profile.arcoTitle")}</h2>
            <p className="text-muted-foreground text-xs font-body mb-4 leading-relaxed">
              {t("profile.arcoDesc")}
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
                    toast.success(t("profile.exportSuccess"));
                  } catch {
                    toast.error(t("profile.exportError"));
                  }
                  setExporting(false);
                }}
                disabled={exporting}
                className="w-full btn-glass flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {t("profile.exportBtn")}
              </button>

              <button
                onClick={() => { setDeleteOpen(true); setDeleteConfirmText(""); }}
                className="w-full btn-glass-destructive flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {t("profile.deleteBtn")}
              </button>
            </div>
          </motion.div>

          {/* Seguridad / Legal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="glass-card p-5">
            <h2 className="font-body text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary/70" /> {t("profile.legalTitle")}
            </h2>
            <div className="space-y-1">
              {[
                { to: "/terminos", label: t("profile.linkTerms") },
                { to: "/privacidad", label: t("profile.linkPrivacy") },
                { to: "/cookies", label: t("profile.linkCookies") },
                { to: "/descargo", label: t("profile.linkDisclaimer") },
                { to: "/reembolso", label: t("profile.linkRefund") },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group"
                >
                  <span className="text-sm font-body text-foreground/80 group-hover:text-foreground">
                    {link.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>


          <button
            onClick={signOut}
            className="w-full btn-glass flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            {t("profile.signOut")}
          </button>

          {/* Powered by Elfawa AI Technologies */}
          <div className="pt-6 pb-2 flex flex-col items-center gap-2">
            <a
              href="https://elfawa-ai-technologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img
                src={elfawaLogo}
                alt="Elfawa AI Technologies"
                className="w-full max-w-[260px] h-auto rounded-lg"
              />
              <span className="text-[10px] font-body text-muted-foreground/60">{t("profile.poweredBy")}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> {t("profile.deleteDialogTitle")}
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              {t("profile.deleteDialogDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="font-body text-sm text-foreground/90 space-y-1">
                <p className="font-medium">{t("profile.willDelete")}</p>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>{t("profile.willDelete1")}</li>
                  <li>{t("profile.willDelete2")}</li>
                  <li>{t("profile.willDelete3")}</li>
                  <li>{t("profile.willDelete4")}</li>
                  <li>{t("profile.willDelete5")}</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="text-foreground/80 font-body text-sm mb-2 block">
                {t("profile.typeToConfirm")}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-modern"
                placeholder={t("profile.deleteWord")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteOpen(false)}
              className="btn-glass px-4 py-2 text-sm"
              disabled={deleting}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={async () => {
                if (deleteConfirmText !== t("profile.deleteWord") || !session?.access_token) return;
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
                  toast.success(t("profile.deleted"));
                  setDeleteOpen(false);
                  await signOut();
                  navigate("/");
                } catch {
                  toast.error(t("profile.deleteError"));
                }
                setDeleting(false);
              }}
              disabled={deleting || deleteConfirmText !== t("profile.deleteWord")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 text-sm rounded-xl font-body font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? t("profile.deleting") : t("profile.deletePermanent")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chart Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setConfirmStep(false); }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{t("profile.editChartTitle")}</DialogTitle>
            <DialogDescription className="font-body text-sm">
              {t("profile.editChartDesc")}
            </DialogDescription>
          </DialogHeader>

          {!confirmStep ? (
            <div className="space-y-4 py-2">
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t("form.birthDate")}
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
                  {t("form.birthTime")}
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
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {t("form.city")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  required
                  maxLength={80}
                  className="input-modern"
                  placeholder={t("profile.cityPh")}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Map className="w-3.5 h-3.5 text-primary" />
                  {t("form.state")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  required
                  maxLength={80}
                  className="input-modern"
                  placeholder={t("profile.statePh")}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  {t("form.country")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  required
                  maxLength={80}
                  autoComplete="country-name"
                  className="input-modern"
                  placeholder={t("profile.countryPh")}
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm text-foreground/90 space-y-2">
                  <p className="font-medium">{t("profile.areYouSure")}</p>
                  <p className="text-muted-foreground text-xs">
                    {t("profile.areYouSureDesc")}
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
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSaveChart}
              disabled={saving || !hasChanges}
              className="btn-gold px-4 py-2 text-sm flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("profile.saving")}
                </>
              ) : confirmStep ? (
                t("profile.confirmChanges")
              ) : (
                t("profile.saveBtn")
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
