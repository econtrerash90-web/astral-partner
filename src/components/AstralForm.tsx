import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Clock, Lock, Sparkles, Building2, Map, Globe, Settings2, ChevronDown } from "lucide-react";
import { normalizeBirthFields } from "@/lib/normalize-text";
import { useI18n } from "@/hooks/useI18n";
import {
  guessTimezoneFromCountry,
  listCommonTimezones,
  localToUTC,
  formatOffset,
  isValidUtcISO,
} from "@/lib/timezone";

interface FormData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  /** Optional: IANA timezone selected/overridden in expert mode. */
  birthTimezone?: string;
  /** Optional: ISO UTC instant override from expert mode. */
  birthUtc?: string;
}

interface AstralFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

interface InternalFormData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
}

const AstralForm = ({ onSubmit, isLoading }: AstralFormProps) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<InternalFormData>({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
  });
  const [error, setError] = useState("");

  // ─── Expert mode state ───
  const [expertOpen, setExpertOpen] = useState(false);
  const [tzOverride, setTzOverride] = useState<string>("");
  const [utcOverride, setUtcOverride] = useState<string>("");
  const [utcEdited, setUtcEdited] = useState(false);

  const tzOptions = useMemo(() => listCommonTimezones(), []);

  // Resolved timezone: explicit override → guess from country → browser fallback.
  const resolvedTz =
    tzOverride ||
    guessTimezoneFromCountry(formData.birthCountry) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";

  // Effective time (default 12:00 if empty).
  const effectiveTime = formData.birthTime?.trim() ? formData.birthTime : "12:00";

  // Computed UTC preview from local date/time + tz.
  const computed = useMemo(() => {
    if (!formData.birthDate) return null;
    try {
      return localToUTC({ date: formData.birthDate, time: effectiveTime, timezone: resolvedTz });
    } catch {
      return null;
    }
  }, [formData.birthDate, effectiveTime, resolvedTz]);

  // Auto-fill UTC override field when computed changes and user hasn't edited.
  const displayedUtc = utcEdited ? utcOverride : (computed?.utcISO ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return setError(t("form.errName"));
    if (!formData.birthDate) return setError(t("form.errDate"));
    if (!formData.birthCity.trim()) return setError(t("form.errCity"));
    if (!formData.birthState.trim()) return setError(t("form.errState"));
    if (!formData.birthCountry.trim()) return setError(t("form.errCountry"));

    // Validate manual UTC if user edited it.
    if (utcEdited && utcOverride.trim()) {
      if (!isValidUtcISO(utcOverride.trim())) {
        return setError(t("form.errUtc"));
      }
    }

    const normalized = normalizeBirthFields({
      fullName: formData.fullName,
      birthCity: formData.birthCity,
      birthState: formData.birthState,
      birthCountry: formData.birthCountry,
    });

    onSubmit({
      fullName: normalized.fullName,
      birthDate: formData.birthDate,
      birthTime: effectiveTime,
      birthPlace: normalized.birthPlace,
      birthTimezone: resolvedTz,
      birthUtc: utcEdited && utcOverride.trim() ? utcOverride.trim() : computed?.utcISO,
    });
  };

  const fields = [
    { name: "fullName", label: t("form.fullName"), icon: User, type: "text", placeholder: "María Elena García López", autoComplete: "name", maxLength: 100 },
    { name: "birthDate", label: t("form.birthDate"), icon: Calendar, type: "date", max: new Date().toISOString().split("T")[0] },
    { name: "birthTime", label: `${t("form.birthTime")} (${t("common.optional")})`, icon: Clock, type: "time", hint: t("form.birthTimeHint") },
    { name: "birthCity", label: t("form.city"), icon: Building2, type: "text", placeholder: "Ciudad de México", maxLength: 80 },
    { name: "birthState", label: t("form.state"), icon: Map, type: "text", placeholder: "CDMX", maxLength: 80 },
    { name: "birthCountry", label: t("form.country"), icon: Globe, type: "text", placeholder: "México", autoComplete: "country-name", maxLength: 80 },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-6">
        <Lock className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-muted-foreground text-xs font-body">
          Tus datos están protegidos y nunca se comparten sin tu consentimiento.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-5 text-destructive text-sm font-body"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {fields.map((field, i) => {
          const optional = field.name === "birthTime";
          const hint = "hint" in field ? (field as { hint?: string }).hint : undefined;
          return (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
                <field.icon className="w-3.5 h-3.5 text-primary" />
                {field.label} {!optional && <span className="text-destructive">*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof InternalFormData]}
                onChange={handleChange}
                required={!optional}
                className="input-modern"
                {...("placeholder" in field ? { placeholder: field.placeholder } : {})}
                {...("autoComplete" in field ? { autoComplete: field.autoComplete } : {})}
                {...("max" in field ? { max: field.max } : {})}
                {...("maxLength" in field ? { maxLength: field.maxLength } : {})}
              />
              {hint && (
                <p className="mt-1.5 text-xs text-muted-foreground/80 font-body italic">
                  {hint}
                </p>
              )}
            </motion.div>
          );
        })}

        {/* ─── Expert mode toggle ─── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setExpertOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-muted/15 border border-border/15 hover:border-primary/30 transition-all text-foreground/85"
          >
            <span className="flex items-center gap-2 text-sm font-body">
              <Settings2 className="w-4 h-4 text-primary" />
              Modo experto: zona horaria y UTC
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expertOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {expertOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 rounded-xl bg-muted/10 border border-border/15 space-y-4">
                  {/* Timezone select */}
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-1.5">
                      Zona horaria IANA
                    </label>
                    <select
                      value={tzOverride || resolvedTz}
                      onChange={(e) => setTzOverride(e.target.value)}
                      className="input-modern"
                    >
                      {!tzOptions.includes(resolvedTz) && (
                        <option value={resolvedTz}>{resolvedTz}</option>
                      )}
                      {tzOptions.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-muted-foreground/70 font-body">
                      {tzOverride
                        ? "Zona horaria definida manualmente."
                        : "Detectada a partir del país. Cambia si necesitas otra."}
                    </p>
                  </div>

                  {/* Computed offset + UTC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background/40 border border-border/15">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-body mb-1">
                        Desfase
                      </p>
                      <p className="text-sm font-body text-foreground">
                        {computed ? formatOffset(computed.offsetMinutes) : "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/40 border border-border/15">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 font-body mb-1">
                        Hora local
                      </p>
                      <p className="text-sm font-body text-foreground">
                        {formData.birthDate || "—"} {effectiveTime}
                      </p>
                    </div>
                  </div>

                  {/* UTC override */}
                  <div>
                    <label className="block text-xs font-body text-muted-foreground mb-1.5">
                      Instante UTC (ISO 8601)
                    </label>
                    <input
                      type="text"
                      value={displayedUtc}
                      onChange={(e) => {
                        setUtcOverride(e.target.value);
                        setUtcEdited(true);
                      }}
                      placeholder="2020-03-15T20:30:00Z"
                      className="input-modern font-mono text-sm"
                    />
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-muted-foreground/70 font-body">
                        Calculado automáticamente; edítalo solo si conoces el UTC exacto.
                      </p>
                      {utcEdited && (
                        <button
                          type="button"
                          onClick={() => { setUtcEdited(false); setUtcOverride(""); }}
                          className="text-[11px] text-primary hover:text-primary/80 font-body"
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold w-full py-4 flex items-center justify-center gap-3 text-base"
        >
          <Sparkles className="w-5 h-5" />
          Descubrir Mi Perfil
        </button>
      </form>
    </motion.div>
  );
};

export default AstralForm;
