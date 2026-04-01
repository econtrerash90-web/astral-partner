import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NatalChartData, PlanetPosition, AspectData } from "@/lib/natal-chart-types";
import { ZODIAC_SIGNS, ZODIAC_GLYPHS, toEclipticLongitude, eclipticToAngle } from "@/lib/natal-chart-types";

interface NatalChartWheelProps {
  data: NatalChartData;
  size?: number;
}

const ASPECT_COLORS: Record<string, string> = {
  "trígono": "hsl(210, 70%, 60%)",
  "sextil": "hsl(210, 60%, 50%)",
  "cuadratura": "hsl(0, 70%, 55%)",
  "oposición": "hsl(0, 60%, 50%)",
  "conjunción": "hsl(43, 72%, 52%)",
  "quincuncio": "hsl(140, 50%, 45%)",
  "semisextil": "hsl(140, 40%, 50%)",
};

const PLANET_COLORS: Record<string, string> = {
  "Sol": "hsl(43, 90%, 55%)",
  "Luna": "hsl(210, 20%, 85%)",
  "Mercurio": "hsl(180, 30%, 60%)",
  "Venus": "hsl(330, 60%, 65%)",
  "Marte": "hsl(0, 70%, 55%)",
  "Júpiter": "hsl(30, 60%, 55%)",
  "Saturno": "hsl(40, 30%, 50%)",
  "Urano": "hsl(190, 70%, 55%)",
  "Neptuno": "hsl(240, 50%, 60%)",
  "Plutón": "hsl(270, 40%, 45%)",
  "Nodo Norte": "hsl(150, 40%, 50%)",
  "Quirón": "hsl(60, 40%, 50%)",
};

const NatalChartWheel = ({ data, size = 380 }: NatalChartWheelProps) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const signR = outerR - 28;
  const houseR = signR - 20;
  const planetR = houseR - 30;
  const innerR = planetR - 30;
  const aspectR = innerR;

  const ascLong = toEclipticLongitude(data.ascendant.sign, data.ascendant.degree, data.ascendant.minute);

  const toXY = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  const planetAngle = (p: PlanetPosition) => {
    const long = toEclipticLongitude(p.sign, p.degree, p.minute);
    return eclipticToAngle(long, ascLong);
  };

  // Draw zodiac sign segments
  const signSegments = ZODIAC_SIGNS.map((sign, i) => {
    const startLong = i * 30;
    const startAngle = eclipticToAngle(startLong, ascLong);
    const endAngle = eclipticToAngle(startLong + 30, ascLong);
    const midAngle = eclipticToAngle(startLong + 15, ascLong);

    const s1 = toXY(startAngle, outerR);
    const s2 = toXY(startAngle, signR);
    const e1 = toXY(endAngle, outerR);
    const glyphPos = toXY(midAngle, (outerR + signR) / 2);

    // Arc path
    const largeArc = 0;
    const sweep = startAngle > endAngle ? 1 : 0;

    return (
      <g key={sign}>
        {/* Dividing line */}
        <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
          stroke="hsl(var(--primary) / 0.2)" strokeWidth={0.5} />
        {/* Glyph */}
        <text x={glyphPos.x} y={glyphPos.y}
          textAnchor="middle" dominantBaseline="central"
          fill="hsl(var(--primary) / 0.7)"
          fontSize={size > 340 ? 13 : 10}
          fontFamily="serif">
          {ZODIAC_GLYPHS[sign]}
        </text>
      </g>
    );
  });

  // Draw house cusps
  const houseCusps = data.houses.map((house) => {
    const long = toEclipticLongitude(house.sign, house.degree, house.minute);
    const angle = eclipticToAngle(long, ascLong);
    const p1 = toXY(angle, signR);
    const p2 = toXY(angle, innerR);
    const labelPos = toXY(angle, houseR + 8);

    const isCardinal = [1, 4, 7, 10].includes(house.number);

    return (
      <g key={`house-${house.number}`}>
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
          stroke={isCardinal ? "hsl(var(--primary) / 0.4)" : "hsl(var(--muted-foreground) / 0.15)"}
          strokeWidth={isCardinal ? 1 : 0.5}
          strokeDasharray={isCardinal ? "none" : "3,3"} />
        <text x={labelPos.x} y={labelPos.y}
          textAnchor="middle" dominantBaseline="central"
          fill="hsl(var(--muted-foreground) / 0.4)"
          fontSize={8}
          fontFamily="var(--font-body)">
          {house.number}
        </text>
      </g>
    );
  });

  // Draw AC and MC labels
  const acAngle = eclipticToAngle(ascLong, ascLong); // Should be 180°
  const mcLong = toEclipticLongitude(data.midheaven.sign, data.midheaven.degree, data.midheaven.minute);
  const mcAngle = eclipticToAngle(mcLong, ascLong);

  const acPos = toXY(acAngle, outerR + 6);
  const mcPos = toXY(mcAngle, outerR + 6);

  // Draw planets
  const planetElements = data.planets.map((planet) => {
    const angle = planetAngle(planet);
    const pos = toXY(angle, planetR);
    const color = PLANET_COLORS[planet.name] || "hsl(var(--foreground))";
    const isSelected = selectedPlanet?.name === planet.name;

    return (
      <g key={planet.name} className="cursor-pointer" onClick={() => setSelectedPlanet(isSelected ? null : planet)}>
        {/* Glow on selected */}
        {isSelected && (
          <circle cx={pos.x} cy={pos.y} r={14} fill={`${color}`} opacity={0.15} />
        )}
        {/* Dot */}
        <circle cx={pos.x} cy={pos.y} r={isSelected ? 5 : 4} fill={color} opacity={0.9} />
        {/* Symbol */}
        <text x={pos.x} y={pos.y - 10}
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize={isSelected ? 14 : 11}
          fontFamily="serif"
          style={{ transition: "font-size 0.2s" }}>
          {planet.symbol}
        </text>
        {/* Retrograde indicator */}
        {planet.retrograde && (
          <text x={pos.x + 10} y={pos.y - 8}
            textAnchor="middle" dominantBaseline="central"
            fill="hsl(0, 70%, 55%)" fontSize={7} fontFamily="var(--font-body)">
            Rx
          </text>
        )}
      </g>
    );
  });

  // Draw aspect lines
  const aspectLines = data.aspects.map((aspect, i) => {
    const p1 = data.planets.find(p => p.name === aspect.planet1);
    const p2 = data.planets.find(p => p.name === aspect.planet2);
    if (!p1 || !p2) return null;

    const a1 = planetAngle(p1);
    const a2 = planetAngle(p2);
    const pos1 = toXY(a1, aspectR - 5);
    const pos2 = toXY(a2, aspectR - 5);
    const color = ASPECT_COLORS[aspect.type] || "hsl(var(--muted-foreground))";
    const isTense = ["cuadratura", "oposición"].includes(aspect.type);

    return (
      <line key={`aspect-${i}`}
        x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y}
        stroke={color} strokeWidth={0.8} opacity={0.4}
        strokeDasharray={isTense ? "none" : "4,4"} />
    );
  });

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        className="mx-auto" style={{ maxWidth: "100%" }}>
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={outerR}
          fill="none" stroke="hsl(var(--primary) / 0.3)" strokeWidth={1} />
        {/* Sign ring inner */}
        <circle cx={cx} cy={cy} r={signR}
          fill="none" stroke="hsl(var(--primary) / 0.2)" strokeWidth={0.5} />
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerR}
          fill="none" stroke="hsl(var(--muted-foreground) / 0.1)" strokeWidth={0.5} />

        {/* Aspect lines (behind everything) */}
        {aspectLines}
        {/* Sign segments */}
        {signSegments}
        {/* House cusps */}
        {houseCusps}
        {/* Planets */}
        {planetElements}

        {/* AC label */}
        <text x={acPos.x} y={acPos.y}
          textAnchor={acAngle > 90 && acAngle < 270 ? "start" : "end"}
          dominantBaseline="central"
          fill="hsl(var(--primary))" fontSize={10} fontWeight="bold"
          fontFamily="var(--font-body)">
          AC
        </text>
        {/* MC label */}
        <text x={mcPos.x} y={mcPos.y}
          textAnchor="middle"
          dominantBaseline={mcAngle > 180 ? "hanging" : "auto"}
          fill="hsl(var(--primary) / 0.8)" fontSize={10} fontWeight="bold"
          fontFamily="var(--font-body)">
          MC
        </text>
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-0 left-0 right-0 mx-auto max-w-xs glass-card p-3 rounded-xl border border-border text-center"
          >
            <p className="text-foreground font-display text-sm font-semibold flex items-center justify-center gap-1.5">
              <span style={{ color: PLANET_COLORS[selectedPlanet.name] }}>{selectedPlanet.symbol}</span>
              {selectedPlanet.name}
              {selectedPlanet.retrograde && <span className="text-destructive text-xs">(Rx)</span>}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {ZODIAC_GLYPHS[selectedPlanet.sign]} {selectedPlanet.sign} {selectedPlanet.degree}°{selectedPlanet.minute}' — Casa {selectedPlanet.house}
            </p>
            {data.interpretations[selectedPlanet.name] && (
              <p className="text-muted-foreground/80 text-xs mt-1.5 leading-relaxed">
                {data.interpretations[selectedPlanet.name]}
              </p>
            )}
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-primary/60 text-xs mt-1.5 hover:text-primary transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NatalChartWheel;
