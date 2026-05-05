// Swiss Ephemeris (WASM) wrapper for Supabase Edge Functions (Deno).
// Uses @fusionstrings/swiss-eph in Moshier mode (no .se1 files needed),
// providing accurate planetary positions and Placidus houses.

import { SwissEph, Constants } from "npm:@fusionstrings/swiss-eph@0.1.1";

const WASM_URL = "https://unpkg.com/@fusionstrings/swiss-eph@0.1.1/wasm/swiss_eph.wasm";

let ephPromise: Promise<SwissEph> | null = null;

async function getEph(): Promise<SwissEph> {
  if (!ephPromise) {
    ephPromise = (async () => {
      const res = await fetch(WASM_URL);
      if (!res.ok) throw new Error(`Failed to load Swiss Ephemeris WASM: ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const mod = new WebAssembly.Module(bytes);
      return new SwissEph(mod);
    })();
  }
  return ephPromise;
}

export const SIGNS_ES = [
  "Aries","Tauro","Géminis","Cáncer","Leo","Virgo",
  "Libra","Escorpio","Sagitario","Capricornio","Acuario","Piscis",
] as const;

export const SIGN_GLYPH: Record<string, string> = {
  "Aries":"♈","Tauro":"♉","Géminis":"♊","Cáncer":"♋","Leo":"♌","Virgo":"♍",
  "Libra":"♎","Escorpio":"♏","Sagitario":"♐","Capricornio":"♑","Acuario":"♒","Piscis":"♓",
};

export interface PlanetResult {
  name: string;
  symbol: string;
  sign: string;
  degree: number;     // 0–29
  minute: number;     // 0–59
  longitude: number;  // 0–360 absolute ecliptic longitude
  house: number;      // 1–12
  retrograde: boolean;
}

export interface HouseCusp {
  number: number;
  sign: string;
  degree: number;
  minute: number;
  longitude: number;
}

export interface PointResult {
  sign: string;
  degree: number;
  minute: number;
  longitude: number;
}

export interface NatalCalc {
  planets: PlanetResult[];
  houses: HouseCusp[];
  ascendant: PointResult;
  midheaven: PointResult;
  julianDay: number;
  ephemerisVersion: string;
  houseSystem: "Placidus";
}

const PLANET_DEFS: Array<{ name: string; symbol: string; id: number }> = [
  { name: "Sol",        symbol: "☉", id: Constants.SE_SUN },
  { name: "Luna",       symbol: "☽", id: Constants.SE_MOON },
  { name: "Mercurio",   symbol: "☿", id: Constants.SE_MERCURY },
  { name: "Venus",      symbol: "♀", id: Constants.SE_VENUS },
  { name: "Marte",      symbol: "♂", id: Constants.SE_MARS },
  { name: "Júpiter",    symbol: "♃", id: Constants.SE_JUPITER },
  { name: "Saturno",    symbol: "♄", id: Constants.SE_SATURN },
  { name: "Urano",      symbol: "♅", id: Constants.SE_URANUS },
  { name: "Neptuno",    symbol: "♆", id: Constants.SE_NEPTUNE },
  { name: "Plutón",     symbol: "♇", id: Constants.SE_PLUTO },
  { name: "Nodo Norte", symbol: "☊", id: Constants.SE_MEAN_NODE },
];

function splitLongitude(longitude: number): { sign: string; degree: number; minute: number } {
  const lon = ((longitude % 360) + 360) % 360;
  const signIdx = Math.floor(lon / 30);
  const within = lon - signIdx * 30;
  const degree = Math.floor(within);
  const minute = Math.round((within - degree) * 60);
  // Handle 60 minutes overflow.
  if (minute === 60) {
    return { sign: SIGNS_ES[signIdx], degree: degree + 1, minute: 0 };
  }
  return { sign: SIGNS_ES[signIdx], degree, minute };
}

function houseOfLongitude(longitude: number, cusps: number[]): number {
  // cusps[1..12] are house cusps in degrees (0–360). Determine which house contains longitude.
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 1; i <= 12; i++) {
    const start = cusps[i];
    const end = cusps[i === 12 ? 1 : i + 1];
    const s = ((start % 360) + 360) % 360;
    const e = ((end % 360) + 360) % 360;
    const inHouse = s <= e ? (lon >= s && lon < e) : (lon >= s || lon < e);
    if (inHouse) return i;
  }
  return 1;
}

export function utcToJulianDay(eph: SwissEph, utcISO: string): number {
  const d = new Date(utcISO);
  const hourFrac = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
  return eph.swe_julday(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    hourFrac,
    Constants.SE_GREG_CAL,
  );
}

export async function computeNatalChart(opts: {
  utcISO: string;
  latitude: number;   // decimal, -90..+90
  longitude: number;  // decimal, -180..+180 (positive east)
}): Promise<NatalCalc> {
  const eph = await getEph();
  const jd = utcToJulianDay(eph, opts.utcISO);

  // House cusps (Placidus). Note: longitude is positive east per Swiss Ephemeris.
  const housesRes = eph.swe_houses(jd, opts.latitude, opts.longitude, "P".charCodeAt(0));
  const cusps = housesRes.cusps; // length 13, indices 1..12 used
  const ascLon = housesRes.ascmc[0];
  const mcLon = housesRes.ascmc[1];

  // Planets (Moshier mode — no external .se1 files).
  const flag = Constants.SEFLG_MOSEPH | Constants.SEFLG_SPEED;
  const planets: PlanetResult[] = [];
  for (const p of PLANET_DEFS) {
    const r = eph.swe_calc_ut(jd, p.id, flag);
    if (r.error && r.error.length > 0) {
      console.warn(`[swe] ${p.name} warning: ${r.error}`);
    }
    const longitude = r.xx[0];
    const speed = r.xx[3];
    const sd = splitLongitude(longitude);
    planets.push({
      name: p.name,
      symbol: p.symbol,
      sign: sd.sign,
      degree: sd.degree,
      minute: sd.minute,
      longitude,
      house: houseOfLongitude(longitude, cusps),
      retrograde: speed < 0,
    });
  }

  const houseList: HouseCusp[] = [];
  for (let i = 1; i <= 12; i++) {
    const s = splitLongitude(cusps[i]);
    houseList.push({ number: i, sign: s.sign, degree: s.degree, minute: s.minute, longitude: cusps[i] });
  }

  const ascSplit = splitLongitude(ascLon);
  const mcSplit = splitLongitude(mcLon);

  return {
    planets,
    houses: houseList,
    ascendant: { sign: ascSplit.sign, degree: ascSplit.degree, minute: ascSplit.minute, longitude: ascLon },
    midheaven: { sign: mcSplit.sign, degree: mcSplit.degree, minute: mcSplit.minute, longitude: mcLon },
    julianDay: jd,
    ephemerisVersion: eph.swe_version(),
    houseSystem: "Placidus",
  };
}

// Compute simple major aspects between planets with reasonable orbs.
export function computeAspects(planets: PlanetResult[]): Array<{
  planet1: string; planet2: string;
  type: "conjunción"|"sextil"|"cuadratura"|"trígono"|"oposición";
  orb: number;
}> {
  const ASPECTS = [
    { angle: 0,   type: "conjunción" as const, orb: 8 },
    { angle: 60,  type: "sextil" as const,     orb: 4 },
    { angle: 90,  type: "cuadratura" as const, orb: 6 },
    { angle: 120, type: "trígono" as const,    orb: 6 },
    { angle: 180, type: "oposición" as const,  orb: 8 },
  ];
  const out: Array<{ planet1:string; planet2:string; type:any; orb:number }> = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i].longitude;
      const b = planets[j].longitude;
      let diff = Math.abs(a - b);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const delta = Math.abs(diff - asp.angle);
        if (delta <= asp.orb) {
          out.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: asp.type,
            orb: Math.round(delta * 10) / 10,
          });
          break;
        }
      }
    }
  }
  return out;
}
