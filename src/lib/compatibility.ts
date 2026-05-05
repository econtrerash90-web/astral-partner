// Compatibility matrix: scores 1-10 for love, friendship, work
// Based on classic elemental compatibility (Fire/Air harmony, Earth/Water harmony)

export const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fuego" },
  { name: "Tauro", symbol: "♉", element: "Tierra" },
  { name: "Géminis", symbol: "♊", element: "Aire" },
  { name: "Cáncer", symbol: "♋", element: "Agua" },
  { name: "Leo", symbol: "♌", element: "Fuego" },
  { name: "Virgo", symbol: "♍", element: "Tierra" },
  { name: "Libra", symbol: "♎", element: "Aire" },
  { name: "Escorpio", symbol: "♏", element: "Agua" },
  { name: "Sagitario", symbol: "♐", element: "Fuego" },
  { name: "Capricornio", symbol: "♑", element: "Tierra" },
  { name: "Acuario", symbol: "♒", element: "Aire" },
  { name: "Piscis", symbol: "♓", element: "Agua" },
] as const;

export type SignName = typeof ZODIAC_SIGNS[number]["name"];

const ELEMENTS: Record<SignName, string> = Object.fromEntries(
  ZODIAC_SIGNS.map((s) => [s.name, s.element])
) as Record<SignName, string>;

export interface CompatibilityResult {
  love: number;
  friendship: number;
  work: number;
  overall: number;
  summary: string;
  strengths: string;
  challenges: string;
}

const ELEMENT_AFFINITY: Record<string, Record<string, number>> = {
  Fuego: { Fuego: 8, Aire: 9, Tierra: 5, Agua: 4 },
  Aire: { Aire: 8, Fuego: 9, Tierra: 4, Agua: 5 },
  Tierra: { Tierra: 8, Agua: 9, Fuego: 5, Aire: 4 },
  Agua: { Agua: 8, Tierra: 9, Fuego: 4, Aire: 5 },
};

const SUMMARIES: Record<string, { strengths: string; challenges: string }> = {
  "Fuego-Fuego": {
    strengths: "Pasión, energía y aventura constantes. Se motivan mutuamente y nunca se aburren.",
    challenges: "Choques de ego y discusiones intensas. Necesitan aprender a ceder.",
  },
  "Fuego-Aire": {
    strengths: "Química explosiva y mucha diversión. Las ideas y la acción se complementan a la perfección.",
    challenges: "Pueden faltar momentos de calma y profundidad emocional.",
  },
  "Fuego-Tierra": {
    strengths: "El fuego inspira, la tierra estabiliza. Forman un equipo equilibrado a largo plazo.",
    challenges: "Diferentes ritmos: uno quiere volar, el otro construir paso a paso.",
  },
  "Fuego-Agua": {
    strengths: "Atracción magnética por ser opuestos. Aprenden mucho el uno del otro.",
    challenges: "El fuego puede sentir al agua demasiado sensible; el agua siente al fuego brusco.",
  },
  "Aire-Aire": {
    strengths: "Conexión mental brillante. Conversaciones infinitas y libertad mutua.",
    challenges: "Pueden quedarse en lo intelectual y evitar lo emocional.",
  },
  "Aire-Tierra": {
    strengths: "El aire trae ideas frescas, la tierra las hace realidad. Buen equilibrio práctico.",
    challenges: "Distintos estilos: uno improvisa, el otro planea todo.",
  },
  "Aire-Agua": {
    strengths: "Sensibilidad y creatividad combinadas. Mucha empatía y comunicación.",
    challenges: "El aire puede parecer frío; el agua, demasiado intenso.",
  },
  "Tierra-Tierra": {
    strengths: "Estabilidad, lealtad y metas compartidas. Construyen algo sólido juntos.",
    challenges: "Pueden caer en la rutina y resistirse a los cambios.",
  },
  "Tierra-Agua": {
    strengths: "Conexión profunda, cuidado mutuo y crecimiento emocional. Pareja muy unida.",
    challenges: "A veces demasiado serios; necesitan inyectar diversión y espontaneidad.",
  },
  "Agua-Agua": {
    strengths: "Empatía total y conexión emocional muy intensa. Se entienden sin palabras.",
    challenges: "Pueden absorber el ánimo del otro y perder objetividad.",
  },
};

export function getCompatibility(signA: SignName, signB: SignName): CompatibilityResult {
  const elA = ELEMENTS[signA];
  const elB = ELEMENTS[signB];
  const baseLove = ELEMENT_AFFINITY[elA][elB];

  // Same sign: very strong understanding
  const sameSign = signA === signB;
  // Opposite signs (6 apart in zodiac order) often strong attraction
  const idxA = ZODIAC_SIGNS.findIndex((s) => s.name === signA);
  const idxB = ZODIAC_SIGNS.findIndex((s) => s.name === signB);
  const distance = Math.abs(idxA - idxB);
  const isOpposite = distance === 6;
  const isTrine = distance === 4 || distance === 8; // same element but different sign

  let love = baseLove;
  let friendship = baseLove;
  let work = baseLove;

  if (sameSign) {
    love = Math.min(10, baseLove + 1);
    friendship = 10;
    work = 7;
  } else if (isTrine) {
    love = Math.min(10, baseLove + 1);
    friendship = Math.min(10, baseLove + 1);
    work = baseLove;
  } else if (isOpposite) {
    love = Math.min(10, baseLove + 2);
    friendship = baseLove;
    work = Math.max(3, baseLove - 1);
  }

  const overall = Math.round((love + friendship + work) / 3);

  const key = [elA, elB].sort().join("-").replace(/Aire-Fuego/, "Fuego-Aire")
    .replace(/Tierra-Fuego/, "Fuego-Tierra")
    .replace(/Agua-Fuego/, "Fuego-Agua")
    .replace(/Tierra-Aire/, "Aire-Tierra")
    .replace(/Agua-Aire/, "Aire-Agua")
    .replace(/Agua-Tierra/, "Tierra-Agua");

  const info = SUMMARIES[key] || SUMMARIES["Fuego-Fuego"];

  let summary: string;
  if (overall >= 8) summary = "Conexión muy fuerte ✨";
  else if (overall >= 6) summary = "Buena compatibilidad 💫";
  else if (overall >= 4) summary = "Compatibilidad moderada 🌙";
  else summary = "Requiere esfuerzo y comprensión 🌑";

  return { love, friendship, work, overall, summary, ...info };
}
