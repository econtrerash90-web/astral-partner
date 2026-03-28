// Astronomical calculations for the Sky Map feature

export interface SkyMapData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  datetime: Date;
  celestialObjects: {
    sun: CelestialBody;
    moon: CelestialBody;
    planets: Planet[];
    stars: StarObj[];
  };
  moonPhase: number;
}

export interface CelestialBody {
  name: string;
  azimuth: number;
  altitude: number;
  visible: boolean;
  x: number;
  y: number;
}

export interface StarObj {
  name: string;
  magnitude: number;
  x: number;
  y: number;
  size: number;
}

export interface Planet extends CelestialBody {
  symbol: string;
}

const celestialToCartesian = (
  azimuth: number,
  altitude: number,
  radius: number = 380
): { x: number; y: number } => {
  const azRad = (azimuth * Math.PI) / 180;
  const altRad = (altitude * Math.PI) / 180;
  const r = radius * (1 - altRad / (Math.PI / 2));
  const x = r * Math.sin(azRad);
  const y = -r * Math.cos(azRad);
  return { x: x + 400, y: y + 400 };
};

const calculateSunPosition = (
  date: Date,
  latitude: number,
  _longitude: number
): CelestialBody => {
  const hour = date.getHours() + date.getMinutes() / 60;
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const hourAngle = (hour - 12) * 15;
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const altitude =
    Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
        Math.cos(latRad) * Math.cos(decRad) * Math.cos((hourAngle * Math.PI) / 180)
    ) *
    (180 / Math.PI);
  const azimuth = (180 + hourAngle + 360) % 360;
  const visible = altitude > 0;
  const { x, y } = celestialToCartesian(azimuth, Math.max(0, altitude));
  return { name: "Sol", azimuth, altitude, visible, x, y };
};

export const calculateMoonPhase = (date: Date): number => {
  const knownNewMoon = new Date("2000-01-06").getTime();
  const currentTime = date.getTime();
  const daysSince = (currentTime - knownNewMoon) / (1000 * 60 * 60 * 24);
  return (daysSince % 29.53) / 29.53;
};

const calculateMoonPosition = (
  date: Date,
  latitude: number,
  _longitude: number
): CelestialBody => {
  const hour = date.getHours() + date.getMinutes() / 60;
  const phase = calculateMoonPhase(date);
  const offset = phase * 360;
  const azimuth = (hourAngleToAz(hour) + offset + 180) % 360;
  const altitude = 25 + 35 * Math.sin(((hour + phase * 12) * Math.PI) / 12);
  const visible = altitude > 0;
  const { x, y } = celestialToCartesian(azimuth, Math.max(0, altitude));
  return { name: "Luna", azimuth, altitude, visible, x, y };
};

const hourAngleToAz = (hour: number) => ((hour - 6) * 15 + 360) % 360;

const calculatePlanetPositions = (
  date: Date,
  _latitude: number,
  _longitude: number
): Planet[] => {
  const planetDefs = [
    { name: "Mercurio", symbol: "☿", period: 87.97, offset: 48 },
    { name: "Venus", symbol: "♀", period: 224.7, offset: 120 },
    { name: "Marte", symbol: "♂", period: 687, offset: 200 },
    { name: "Júpiter", symbol: "♃", period: 4333, offset: 310 },
    { name: "Saturno", symbol: "♄", period: 10759, offset: 60 },
  ];

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const hour = date.getHours() + date.getMinutes() / 60;

  return planetDefs.map((p) => {
    const angle = ((dayOfYear / p.period) * 360 + p.offset) % 360;
    const azimuth = (angle + hour * 5) % 360;
    const altitude = 15 + 50 * Math.abs(Math.sin((angle * Math.PI) / 180));
    const visible = altitude > 5;
    const { x, y } = celestialToCartesian(azimuth, altitude);
    return { name: p.name, symbol: p.symbol, azimuth, altitude, visible, x, y };
  });
};

const generateStarField = (date: Date): StarObj[] => {
  const stars: StarObj[] = [];
  const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear();

  const brightStars = [
    { name: "Sirio", mag: -1.46 },
    { name: "Canopus", mag: -0.72 },
    { name: "Arturo", mag: -0.05 },
    { name: "Vega", mag: 0.03 },
    { name: "Rigel", mag: 0.13 },
    { name: "Betelgeuse", mag: 0.5 },
    { name: "Aldebarán", mag: 0.85 },
    { name: "Antares", mag: 1.09 },
    { name: "Espiga", mag: 1.04 },
    { name: "Pólux", mag: 1.14 },
  ];

  brightStars.forEach((s, i) => {
    const a = ((i * 36 + seed * 7) % 360) * (Math.PI / 180);
    const r = 120 + ((i * 37 + seed) % 250);
    stars.push({
      name: s.name,
      magnitude: s.mag,
      x: 400 + r * Math.cos(a),
      y: 400 + r * Math.sin(a),
      size: Math.max(2, 6 - s.mag),
    });
  });

  // Background stars
  const pseudoRandom = (n: number) => {
    const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 300; i++) {
    const a = pseudoRandom(i) * Math.PI * 2;
    const r = pseudoRandom(i + 1000) * 390;
    const mag = 2 + pseudoRandom(i + 2000) * 4;
    stars.push({
      name: "",
      magnitude: mag,
      x: 400 + r * Math.cos(a),
      y: 400 + r * Math.sin(a),
      size: Math.max(0.5, 3.5 - mag),
    });
  }

  return stars;
};

export const generateSkyMap = (
  date: Date,
  latitude: number,
  longitude: number,
  locationName: string
): SkyMapData => {
  return {
    location: { latitude, longitude, name: locationName },
    datetime: date,
    moonPhase: calculateMoonPhase(date),
    celestialObjects: {
      sun: calculateSunPosition(date, latitude, longitude),
      moon: calculateMoonPosition(date, latitude, longitude),
      planets: calculatePlanetPositions(date, latitude, longitude),
      stars: generateStarField(date),
    },
  };
};

export const getMoonPhaseDescription = (phase: number): string => {
  if (phase < 0.05) return "Luna Nueva 🌑";
  if (phase < 0.25) return "Creciente 🌒";
  if (phase < 0.3) return "Cuarto Creciente 🌓";
  if (phase < 0.45) return "Creciente Gibosa 🌔";
  if (phase < 0.55) return "Luna Llena 🌕";
  if (phase < 0.7) return "Menguante Gibosa 🌖";
  if (phase < 0.75) return "Cuarto Menguante 🌗";
  return "Menguante 🌘";
};
