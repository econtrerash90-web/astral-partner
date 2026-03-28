import { motion } from "framer-motion";
import { Star, Sparkles, RotateCcw, Hash, Flame, Gem } from "lucide-react";
import type { AstralData } from "@/lib/astral-calculations";
import { formatAIText } from "@/lib/format-ai-text";
import AstralShareCard from "./AstralShareCard";

interface LuckyNumber {
  number: number;
  reason: string;
}

interface Ritual {
  candleColor: string;
  title: string;
  description: string;
  bestTime: string;
}

interface Amulet {
  stone: string;
  emoji: string;
  properties: string;
  howToUse: string;
}

interface AstralResultsProps {
  data: AstralData;
  weeklyPrediction: string;
  luckyNumber?: LuckyNumber | null;
  ritual?: Ritual | null;
  amulet?: Amulet | null;
  onReset: () => void;
}

const AstralResults = ({ data, weeklyPrediction, luckyNumber, ritual, amulet, onReset }: AstralResultsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Chart section */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-foreground flex items-center gap-2.5 mb-5 tracking-wide">
          <Star className="w-5 h-5 text-primary" />
          Tu Carta Astral
        </h2>

        {/* Sun sign - featured */}
        <div className="bg-muted/30 p-5 rounded-xl border border-border mb-4">
          <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-1">Sol en</p>
          <p className="text-foreground text-2xl font-display font-semibold flex items-center gap-3">
            <span className="text-3xl">{data.sunSign.symbol}</span>
            {data.sunSign.name}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground text-sm font-body">Elemento</span>
              <span className="text-primary font-medium text-sm font-body">{data.sunSign.element}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground text-sm font-body">Planeta</span>
              <span className="text-primary font-medium text-sm font-body">{data.sunSign.planet}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-1">Luna en</p>
            <p className="text-foreground text-lg font-display font-semibold">{data.moonSign}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-1">Ascendente en</p>
            <p className="text-foreground text-lg font-display font-semibold">{data.ascendant}</p>
          </div>
        </div>
      </div>

      {/* Lucky Number, Ritual & Amulet - 3 cards */}
      {(luckyNumber || ritual || amulet) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Lucky Number */}
          {luckyNumber && (
            <div className="glass-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-2">Tu Número de la Suerte</p>
              <p className="text-4xl font-display font-bold text-primary mb-2">{luckyNumber.number}</p>
              <p className="text-muted-foreground text-xs font-body leading-relaxed">{luckyNumber.reason}</p>
            </div>
          )}

          {/* Ritual */}
          {ritual && (
            <div className="glass-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-2">Ritual Sugerido</p>
              <p className="text-foreground text-sm font-display font-semibold mb-1">{ritual.title}</p>
              <p className="text-primary text-xs font-body mb-2">🕯️ Vela {ritual.candleColor} · {ritual.bestTime}</p>
              <p className="text-muted-foreground text-xs font-body leading-relaxed">{ritual.description}</p>
            </div>
          )}

          {/* Amulet */}
          {amulet && (
            <div className="glass-card p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Gem className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-xs font-body uppercase tracking-wider mb-2">Tu Amuleto de la Suerte</p>
              <p className="text-foreground text-lg font-display font-semibold mb-1">
                {amulet.emoji} {amulet.stone}
              </p>
              <p className="text-muted-foreground text-xs font-body leading-relaxed mb-1">{amulet.properties}</p>
              <p className="text-primary/80 text-xs font-body italic">{amulet.howToUse}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Analysis */}
      {data.analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 sm:p-8"
        >
          <h3 className="font-display text-lg text-foreground flex items-center gap-2 mb-4 tracking-wide">
            Análisis de tu Personalidad
          </h3>
          <div className="text-foreground/80 text-base leading-relaxed font-body">
            {formatAIText(data.analysis)}
          </div>
        </motion.div>
      )}

      {/* Weekly prediction */}
      {weeklyPrediction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 sm:p-8"
          style={{ background: "var(--gradient-prediction)" }}
        >
          <h2 className="font-display text-lg text-foreground flex items-center gap-2 mb-4 tracking-wide">
            <Sparkles className="w-5 h-5 text-primary" />
            Predicción Semanal
          </h2>
          <div className="text-foreground/80 text-base leading-relaxed font-body">
            {formatAIText(weeklyPrediction)}
          </div>
        </motion.div>
      )}

      {/* Share as image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AstralShareCard
          sunSign={data.sunSign}
          moonSign={data.moonSign}
          ascendant={data.ascendant}
          name={data.name}
          luckyNumber={luckyNumber}
          ritual={ritual}
          amulet={amulet}
        />
      </motion.div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-3.5 rounded-xl font-body text-sm font-medium bg-muted/50 text-muted-foreground border border-border hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Realizar Nueva Consulta
      </button>
    </motion.div>
  );
};

export default AstralResults;
