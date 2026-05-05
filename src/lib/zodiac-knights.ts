// Caballeros Dorados del Zodíaco (Saint Seiya) por signo solar
export interface ZodiacKnight {
  name: string;
  cloth: string;
  emoji: string;
  signature: string;
  description: string;
  virtue: string;
}

export const ZODIAC_KNIGHTS: Record<string, ZodiacKnight> = {
  Aries: {
    name: "Mu de Aries",
    cloth: "Armadura Dorada de Aries",
    emoji: "♈",
    signature: "Revolución de las Estrellas",
    description: "Sabio y sereno, maestro reparador de armaduras. Te recuerda que la fuerza también vive en la paciencia y la mente clara.",
    virtue: "Sabiduría y serenidad",
  },
  Tauro: {
    name: "Aldebarán de Tauro",
    cloth: "Armadura Dorada de Tauro",
    emoji: "♉",
    signature: "Gran Cuerno",
    description: "Imponente y de corazón noble. Representa tu capacidad de proteger lo que amas con fuerza y lealtad inquebrantable.",
    virtue: "Fuerza y nobleza",
  },
  Géminis: {
    name: "Saga de Géminis",
    cloth: "Armadura Dorada de Géminis",
    emoji: "♊",
    signature: "Explosión de Galaxias",
    description: "Dueño de dos almas, refleja tu dualidad interna y el poder de transformar tus contradicciones en talento.",
    virtue: "Inteligencia y dualidad",
  },
  Cáncer: {
    name: "Máscara de la Muerte de Cáncer",
    cloth: "Armadura Dorada de Cáncer",
    emoji: "♋",
    signature: "Ondas Infernales",
    description: "Guardián entre mundos. Te enseña a reconocer tus emociones más profundas y honrar tu sensibilidad.",
    virtue: "Intuición profunda",
  },
  Leo: {
    name: "Aioria de Leo",
    cloth: "Armadura Dorada de Leo",
    emoji: "♌",
    signature: "Plasma Relámpago",
    description: "Valiente, leal y brillante como el sol. Encarna tu luz interior y tu poder natural para liderar.",
    virtue: "Valentía y liderazgo",
  },
  Virgo: {
    name: "Shaka de Virgo",
    cloth: "Armadura Dorada de Virgo",
    emoji: "♍",
    signature: "Tesoro del Cielo",
    description: "El hombre más cercano a los dioses. Representa tu búsqueda de perfección, equilibrio y conciencia plena.",
    virtue: "Pureza y conciencia",
  },
  Libra: {
    name: "Dohko de Libra",
    cloth: "Armadura Dorada de Libra",
    emoji: "♎",
    signature: "Cien Dragones de Rozan",
    description: "Maestro paciente y justo. Refleja tu don para mediar, equilibrar y mantener la armonía en tu mundo.",
    virtue: "Justicia y equilibrio",
  },
  Escorpio: {
    name: "Milo de Escorpio",
    cloth: "Armadura Dorada de Escorpio",
    emoji: "♏",
    signature: "Aguja Escarlata",
    description: "Apasionado, intenso y leal hasta el final. Encarna tu fuerza emocional y tu capacidad de transformación.",
    virtue: "Pasión y lealtad",
  },
  Sagitario: {
    name: "Aioros de Sagitario",
    cloth: "Armadura Dorada de Sagitario",
    emoji: "♐",
    signature: "Flecha Atómica",
    description: "Noble, justo y visionario. Representa tu espíritu libre y tu fe inquebrantable en un futuro mejor.",
    virtue: "Honor y visión",
  },
  Capricornio: {
    name: "Shura de Capricornio",
    cloth: "Armadura Dorada de Capricornio",
    emoji: "♑",
    signature: "Excalibur",
    description: "Disciplinado y leal a sus principios. Encarna tu determinación y tu capacidad de cortar lo que ya no sirve.",
    virtue: "Disciplina y honor",
  },
  Acuario: {
    name: "Camus de Acuario",
    cloth: "Armadura Dorada de Acuario",
    emoji: "♒",
    signature: "Ejecución Aurora",
    description: "Frío en apariencia, profundo en su interior. Representa tu mente brillante y tu lealtad silenciosa.",
    virtue: "Inteligencia y profundidad",
  },
  Piscis: {
    name: "Afrodita de Piscis",
    cloth: "Armadura Dorada de Piscis",
    emoji: "♓",
    signature: "Rosas Diabólicas Reales",
    description: "Bello y enigmático. Encarna tu sensibilidad artística y la fuerza oculta tras tu naturaleza soñadora.",
    virtue: "Belleza y misterio",
  },
};

export function getKnightForSign(sign: string): ZodiacKnight | null {
  return ZODIAC_KNIGHTS[sign] ?? null;
}
