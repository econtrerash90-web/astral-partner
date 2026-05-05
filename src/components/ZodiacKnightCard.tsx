import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { getKnightForSign } from "@/lib/zodiac-knights";

interface ZodiacKnightCardProps {
  sign: string;
}

const ZodiacKnightCard = ({ sign }: ZodiacKnightCardProps) => {
  const knight = getKnightForSign(sign);
  if (!knight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 sm:p-6 relative overflow-hidden"
    >
      {/* Gold glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, hsl(var(--primary) / 0.4), transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="feature-icon w-8 h-8 rounded-xl">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display text-base text-foreground tracking-wide">
            Tu Caballero del Zodíaco
          </h2>
        </div>

        <div className="glass-card-elevated p-5 rounded-xl border-primary/20 text-center">
          <div className="text-5xl mb-2 drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)]">
            {knight.emoji}
          </div>
          <p className="font-display text-xl text-foreground font-semibold">
            {knight.name}
          </p>
          <p className="text-primary text-xs font-body uppercase tracking-wider mt-1">
            {knight.cloth}
          </p>

          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20">
            <p className="section-label mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              Técnica Legendaria
            </p>
            <p className="text-foreground font-display text-sm">
              {knight.signature}
            </p>
          </div>

          <p className="text-foreground/80 text-sm font-body leading-relaxed mt-4">
            {knight.description}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary text-xs font-body font-medium">
              ✨ {knight.virtue}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ZodiacKnightCard;
