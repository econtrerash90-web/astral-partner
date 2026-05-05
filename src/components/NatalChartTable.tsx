import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { NatalChartData } from "@/lib/natal-chart-types";
import { ZODIAC_GLYPHS } from "@/lib/natal-chart-types";

interface NatalChartTableProps {
  data: NatalChartData;
}

const ASPECT_LABELS: Record<string, string> = {
  "trígono": "Armonía",
  "sextil": "Oportunidad",
  "cuadratura": "Tensión",
  "oposición": "Contraste",
  "conjunción": "Fusión",
  "quincuncio": "Ajuste",
  "semisextil": "Conexión sutil",
};

const ASPECT_COLORS: Record<string, string> = {
  "trígono": "text-blue-400",
  "sextil": "text-blue-300",
  "cuadratura": "text-red-400",
  "oposición": "text-red-300",
  "conjunción": "text-primary",
  "quincuncio": "text-green-400",
  "semisextil": "text-green-300",
};

const MeaningCombo = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/15 hover:bg-muted/20 transition-all"
      >
        <span className="text-xs sm:text-sm font-body font-medium text-foreground/90 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          ¿Qué Significa Tu Resultado?
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3 px-1 text-foreground/80 text-xs sm:text-sm font-body leading-relaxed space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NatalChartTable = ({ data }: NatalChartTableProps) => {
  return (
    <div className="space-y-4">
      {/* Planets table */}
      <div>
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display text-sm text-foreground mb-3">Posiciones Planetarias</h3>
          <div className="space-y-1.5">
            {data.planets.map((planet) => (
              <div key={planet.name}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{planet.symbol}</span>
                  <span className="text-foreground font-medium truncate">{planet.name}</span>
                  {planet.retrograde && (
                    <span className="text-destructive text-[10px] font-bold">Rx</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <span>{ZODIAC_GLYPHS[planet.sign]} {planet.sign}</span>
                  <span className="font-mono text-[11px]">{planet.degree}°{String(planet.minute).padStart(2, "0")}'</span>
                  <span className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">Casa {planet.house}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <MeaningCombo>
          <p>
            Cada planeta refleja una parte de ti: el <strong className="text-primary">Sol</strong> es tu esencia, la <strong className="text-primary">Luna</strong> tus emociones, <strong className="text-primary">Mercurio</strong> cómo piensas y comunicas, <strong className="text-primary">Venus</strong> cómo amas y disfrutas, y <strong className="text-primary">Marte</strong> cómo actúas.
          </p>
          <p>
            El <strong>signo</strong> indica el estilo con el que se expresa esa energía, y la <strong>casa</strong> el área de vida donde se nota más (relaciones, trabajo, hogar, etc.).
          </p>
          <p className="text-muted-foreground/80">
            La marca <strong className="text-destructive">Rx</strong> significa que ese planeta está en una fase de revisión: invita a mirar hacia adentro antes de avanzar.
          </p>
        </MeaningCombo>
      </div>

      {/* Key points */}
      <div>
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display text-sm text-foreground mb-3">Puntos Clave</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 p-2.5 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ascendente (AC)</p>
              <p className="text-foreground text-sm font-medium mt-0.5">
                {ZODIAC_GLYPHS[data.ascendant.sign]} {data.ascendant.sign} {data.ascendant.degree}°{String(data.ascendant.minute).padStart(2, "0")}'
              </p>
            </div>
            <div className="bg-muted/30 p-2.5 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Medio Cielo (MC)</p>
              <p className="text-foreground text-sm font-medium mt-0.5">
                {ZODIAC_GLYPHS[data.midheaven.sign]} {data.midheaven.sign} {data.midheaven.degree}°{String(data.midheaven.minute).padStart(2, "0")}'
              </p>
            </div>
          </div>
        </div>
        <MeaningCombo>
          <p>
            El <strong className="text-primary">Ascendente (AC)</strong> es la primera impresión que das: cómo te ven los demás cuando te conocen y la forma natural en que enfrentas la vida.
          </p>
          <p>
            El <strong className="text-primary">Medio Cielo (MC)</strong> habla de tu camino público: tu vocación, tus metas y la huella que quieres dejar en el mundo.
          </p>
        </MeaningCombo>
      </div>

      {/* Aspects */}
      {data.aspects.length > 0 && (
        <div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-display text-sm text-foreground mb-3">Conexiones entre Planetas</h3>
            <div className="space-y-1.5">
              {data.aspects.map((aspect, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-foreground">{aspect.planet1}</span>
                    <span className={ASPECT_COLORS[aspect.type]}>—</span>
                    <span className="text-foreground">{aspect.planet2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${ASPECT_COLORS[aspect.type]} text-[11px]`}>
                      {ASPECT_LABELS[aspect.type] || aspect.type}
                    </span>
                    <span className="text-muted-foreground/50 text-[10px]">{aspect.orb.toFixed(1)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <MeaningCombo>
            <p>Las conexiones muestran cómo dialogan las distintas energías dentro de ti:</p>
            <ul className="space-y-1 pl-1">
              <li><strong className="text-primary">Fusión:</strong> dos energías se mezclan y se potencian.</li>
              <li><strong className="text-blue-400">Armonía:</strong> fluye con facilidad, son tus dones naturales.</li>
              <li><strong className="text-blue-300">Oportunidad:</strong> talentos que se activan cuando los trabajas.</li>
              <li><strong className="text-red-400">Tensión:</strong> retos que te impulsan a crecer.</li>
              <li><strong className="text-red-300">Contraste:</strong> opuestos que buscan equilibrio.</li>
              <li><strong className="text-green-400">Ajuste:</strong> pide adaptación y aprendizaje.</li>
            </ul>
            <p className="text-muted-foreground/80">Cuanto menor sea el número de grados, más intensa es la conexión.</p>
          </MeaningCombo>
        </div>
      )}
    </div>
  );
};

export default NatalChartTable;
