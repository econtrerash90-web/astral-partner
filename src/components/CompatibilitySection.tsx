import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Briefcase, Sparkles } from "lucide-react";
import { ZODIAC_SIGNS, getCompatibility, type SignName } from "@/lib/compatibility";

interface CompatibilitySectionProps {
  userSign: SignName;
}

const CompatibilitySection = ({ userSign }: CompatibilitySectionProps) => {
  const [partnerSign, setPartnerSign] = useState<SignName | null>(null);
  const result = partnerSign ? getCompatibility(userSign, partnerSign) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="feature-icon w-8 h-8 rounded-xl">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display text-base text-foreground tracking-wide">
          Compatibilidad
        </h2>
      </div>

      <p className="text-muted-foreground text-xs font-body mb-3">
        Descubre tu conexión con otra persona según su signo.
      </p>

      <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 mb-4">
        {ZODIAC_SIGNS.map((s) => (
          <button
            key={s.name}
            onClick={() => setPartnerSign(s.name)}
            className={`p-2 rounded-xl border transition-all text-center ${
              partnerSign === s.name
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-muted/10 border-border/15 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
            }`}
          >
            <div className="text-lg leading-none">{s.symbol}</div>
            <div className="text-[9px] font-body mt-1 truncate">{s.name}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result && partnerSign && (
          <motion.div
            key={partnerSign}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="glass-card-elevated p-4 rounded-xl border-primary/10 text-center">
              <p className="text-xs text-muted-foreground font-body mb-1">
                {userSign} <span className="text-primary mx-1">×</span> {partnerSign}
              </p>
              <p className="font-display text-2xl text-foreground font-semibold">
                {result.overall}/10
              </p>
              <p className="text-xs text-primary font-body mt-1">{result.summary}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ScoreCard icon={<Heart className="w-3.5 h-3.5" />} label="Amor" value={result.love} />
              <ScoreCard icon={<Users className="w-3.5 h-3.5" />} label="Amistad" value={result.friendship} />
              <ScoreCard icon={<Briefcase className="w-3.5 h-3.5" />} label="Trabajo" value={result.work} />
            </div>

            <div className="glass-card-elevated p-3 rounded-xl border-primary/10">
              <p className="section-label flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3 h-3 text-primary" /> Fortalezas
              </p>
              <p className="text-xs font-body text-foreground/80 leading-relaxed">{result.strengths}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/10 border border-border/15">
              <p className="section-label mb-1">⚠️ Retos</p>
              <p className="text-xs font-body text-muted-foreground leading-relaxed">{result.challenges}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScoreCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="p-3 rounded-xl bg-muted/15 border border-border/15">
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-body text-muted-foreground">{label}</span>
    </div>
    <div className="energy-track">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="energy-fill"
      />
    </div>
    <p className="text-xs font-body text-foreground font-semibold mt-1.5 text-right">{value}/10</p>
  </div>
);

export default CompatibilitySection;
