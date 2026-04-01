// Types for the natal chart data
export interface PlanetPosition {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  sign: string;
  degree: number;
  minute: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: "conjunción" | "sextil" | "cuadratura" | "trígono" | "oposición" | "quincuncio" | "semisextil";
  orb: number;
}

export interface PointPosition {
  sign: string;
  degree: number;
  minute: number;
}

export interface NatalChartData {
  planets: PlanetPosition[];
  houses: HousePosition[];
  ascendant: PointPosition;
  midheaven: PointPosition;
  aspects: AspectData[];
  interpretations: Record<string, string>;
  coordinates: { latitude: number; longitude: number };
}

// Zodiac sign order for angle calculation
export const ZODIAC_SIGNS = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

export const ZODIAC_GLYPHS: Record<string, string> = {
  "Aries": "♈", "Tauro": "♉", "Géminis": "♊", "Cáncer": "♋",
  "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Escorpio": "♏",
  "Sagitario": "♐", "Capricornio": "♑", "Acuario": "♒", "Piscis": "♓"
};

// Convert sign + degree + minute to absolute ecliptic longitude (0-360)
export function toEclipticLongitude(sign: string, degree: number, minute: number): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + minute / 60;
}

// Convert ecliptic longitude to chart angle (SVG coordinates, 0° = left/AC)
export function eclipticToAngle(longitude: number, ascendantLongitude: number): number {
  // In a natal chart, Ascendant is at 9 o'clock (180° in SVG)
  // Zodiac goes counter-clockwise
  return (180 - (longitude - ascendantLongitude) + 360) % 360;
}
