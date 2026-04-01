/**
 * Maps astrological sign names to human-readable personality traits.
 * Used to translate jargon into language anyone can understand.
 */

/** What your Sun sign says about your core personality */
export const SUN_TRAITS: Record<string, string> = {
  Aries: "Líder natural, valiente y con mucha energía",
  Tauro: "Persona estable, leal y con los pies en la tierra",
  Géminis: "Mente curiosa, comunicativa y versátil",
  Cáncer: "Persona sensible, protectora y muy intuitiva",
  Leo: "Personalidad magnética, generosa y segura",
  Virgo: "Detallista, organizada y con mente analítica",
  Libra: "Busca el equilibrio, diplomática y sociable",
  Escorpio: "Intensa, perceptiva y con gran determinación",
  Sagitario: "Aventurera, optimista y con espíritu libre",
  Capricornio: "Ambiciosa, responsable y muy disciplinada",
  Acuario: "Original, independiente y con visión de futuro",
  Piscis: "Empática, creativa y con gran sensibilidad",
};

/** What your Moon sign says about your emotional world */
export const MOON_TRAITS: Record<string, string> = {
  Aries: "Emociones intensas y reacciones rápidas",
  Tauro: "Necesita estabilidad emocional y comodidad",
  Géminis: "Procesa emociones hablando y pensando",
  Cáncer: "Emociones profundas y gran necesidad de cuidar",
  Leo: "Necesita sentirse valorado/a y querido/a",
  Virgo: "Analiza sus emociones antes de expresarlas",
  Libra: "Busca armonía emocional y evita los conflictos",
  Escorpio: "Siente todo con mucha profundidad e intensidad",
  Sagitario: "Optimista emocional, necesita libertad y aventura",
  Capricornio: "Reservado/a con sus emociones, pero muy leal",
  Acuario: "Procesa emociones de forma racional y única",
  Piscis: "Extremadamente empático/a y sensible al entorno",
};

/** What your Ascendant says about your first impression */
export const ASC_TRAITS: Record<string, string> = {
  Aries: "Das una primera impresión de seguridad y decisión",
  Tauro: "Te perciben como alguien tranquilo/a y confiable",
  Géminis: "Proyectas simpatía, curiosidad y agilidad mental",
  Cáncer: "Te ven como alguien cálido/a y acogedor/a",
  Leo: "Proyectas carisma, confianza y presencia",
  Virgo: "Te perciben como alguien ordenado/a y detallista",
  Libra: "Proyectas elegancia, amabilidad y equilibrio",
  Escorpio: "Das una impresión de misterio y profundidad",
  Sagitario: "Te ven como alguien alegre y aventurero/a",
  Capricornio: "Proyectas seriedad, madurez y profesionalismo",
  Acuario: "Te perciben como original y poco convencional",
  Piscis: "Proyectas sensibilidad, empatía y creatividad",
};

/** Friendly labels for elements */
export const ELEMENT_FRIENDLY: Record<string, string> = {
  Fuego: "🔥 Energía activa",
  Tierra: "🌿 Energía estable",
  Aire: "💨 Energía mental",
  Agua: "💧 Energía emocional",
};

/** Friendly labels for ruling planets */
export const PLANET_FRIENDLY: Record<string, string> = {
  Marte: "Impulso y acción",
  Venus: "Amor y belleza",
  Mercurio: "Comunicación e ideas",
  Luna: "Emociones e intuición",
  Sol: "Autoexpresión y vitalidad",
  Ceres: "Cuidado y nutrición",
  Júpiter: "Crecimiento y abundancia",
  Saturno: "Disciplina y estructura",
  Urano: "Innovación y cambio",
  Neptuno: "Imaginación y espiritualidad",
  Plutón: "Transformación profunda",
};

/** Get a short personality summary from a sign name */
export function getSignTrait(sign: string, type: "sun" | "moon" | "asc"): string {
  const map = type === "sun" ? SUN_TRAITS : type === "moon" ? MOON_TRAITS : ASC_TRAITS;
  return map[sign] || sign;
}

/** Friendly moon transit label (for daily horoscope) */
export function getMoonTransitLabel(moonSign: string): string {
  const moods: Record<string, string> = {
    Aries: "🌙 Energía activa hoy",
    Tauro: "🌙 Día de calma y disfrute",
    Géminis: "🌙 Mente ágil y curiosa",
    Cáncer: "🌙 Día emocional y sensible",
    Leo: "🌙 Día de brillo personal",
    Virgo: "🌙 Ideal para organizar",
    Libra: "🌙 Busca el equilibrio hoy",
    Escorpio: "🌙 Día de introspección",
    Sagitario: "🌙 Energía aventurera",
    Capricornio: "🌙 Día productivo",
    Acuario: "🌙 Ideas innovadoras",
    Piscis: "🌙 Día de intuición fuerte",
  };
  return moods[moonSign] || `🌙 ${moonSign}`;
}
