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

const NatalChartTable = ({ data }: NatalChartTableProps) => {
  return (
    <div className="space-y-4">
      {/* Planets table */}
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

      {/* Key points */}
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

      {/* Aspects */}
      {data.aspects.length > 0 && (
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
      )}
    </div>
  );
};

export default NatalChartTable;
