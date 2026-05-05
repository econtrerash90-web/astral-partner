import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { getKnightForSign } from "@/lib/zodiac-knights";
import { getKnightImage } from "@/lib/knight-images";

interface ZodiacKnightCardProps {
  sign: string;
  signSymbol?: string;
}

const ZodiacKnightCard = ({ sign, signSymbol }: ZodiacKnightCardProps) => {
  const knight = getKnightForSign(sign);
  const image = getKnightImage(sign);
  if (!knight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 sm:p-6 relative overflow-hidden"
    >
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

        <div className="glass-card-elevated p-4 rounded-xl border-primary/20">
          {image && (
            <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 mb-3">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
              <img
                src={image}
                alt={`${knight.name} - ${knight.cloth}`}
                loading="lazy"
                decoding="async"
                width={512}
                height={512}
                className="relative w-full h-full object-cover rounded-full border-2 border-primary/40 shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
              />
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-background/80 backdrop-blur border border-primary/40 flex items-center justify-center text-lg font-display">
                {signSymbol || knight.emoji}
              </div>
            </div>
          )}

          <p className="font-display text-xl text-foreground font-semibold text-center">
            {knight.name}
          </p>
          <p className="text-primary text-xs font-body uppercase tracking-wider mt-1 text-center">
            {knight.cloth}
          </p>

          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
            <p className="section-label mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              Técnica Legendaria
            </p>
            <p className="text-foreground font-display text-sm">
              {knight.signature}
            </p>
          </div>

          <p className="text-foreground/80 text-sm font-body leading-relaxed mt-4 text-center">
            {knight.description}
          </p>

          <div className="mt-3 flex justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-primary text-xs font-body font-medium">
                ✨ {knight.virtue}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ZodiacKnightCard;
