import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Clock, MapPin, Lock, Sparkles, Building2, Map, Globe } from "lucide-react";
import { normalizeBirthFields } from "@/lib/normalize-text";

interface FormData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
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
  const [formData, setFormData] = useState<InternalFormData>({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return setError("Por favor ingresa tu nombre completo");
    if (!formData.birthDate) return setError("Por favor ingresa tu fecha de nacimiento");
    if (!formData.birthTime) return setError("Por favor ingresa tu hora de nacimiento");
    if (!formData.birthCity.trim()) return setError("Por favor ingresa tu ciudad de nacimiento");
    if (!formData.birthState.trim()) return setError("Por favor ingresa tu estado o provincia");
    if (!formData.birthCountry.trim()) return setError("Por favor ingresa tu país de nacimiento");

    const normalized = normalizeBirthFields({
      fullName: formData.fullName,
      birthCity: formData.birthCity,
      birthState: formData.birthState,
      birthCountry: formData.birthCountry,
    });
    onSubmit({
      fullName: normalized.fullName,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: normalized.birthPlace,
    });
  };

  const fields = [
    { name: "fullName", label: "Nombre Completo", icon: User, type: "text", placeholder: "María Elena García López", autoComplete: "name", maxLength: 100 },
    { name: "birthDate", label: "Fecha de Nacimiento", icon: Calendar, type: "date", max: new Date().toISOString().split("T")[0] },
    { name: "birthTime", label: "Hora de Nacimiento", icon: Clock, type: "time" },
    { name: "birthCity", label: "Ciudad", icon: Building2, type: "text", placeholder: "Ciudad de México", maxLength: 80 },
    { name: "birthState", label: "Estado o Provincia", icon: Map, type: "text", placeholder: "CDMX", maxLength: 80 },
    { name: "birthCountry", label: "País", icon: Globe, type: "text", placeholder: "México", autoComplete: "country-name", maxLength: 80 },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 sm:p-8"
    >
      {/* Security notice */}
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
        {fields.map((field, i) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <label className="flex items-center gap-2 text-foreground/80 font-body text-sm font-medium mb-2">
              <field.icon className="w-3.5 h-3.5 text-primary" />
              {field.label} <span className="text-destructive">*</span>
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof InternalFormData]}
              onChange={handleChange}
              required
              className="input-modern"
              {...("placeholder" in field ? { placeholder: field.placeholder } : {})}
              {...("autoComplete" in field ? { autoComplete: field.autoComplete } : {})}
              {...("max" in field ? { max: field.max } : {})}
              {...("maxLength" in field ? { maxLength: field.maxLength } : {})}
            />
          </motion.div>
        ))}

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
