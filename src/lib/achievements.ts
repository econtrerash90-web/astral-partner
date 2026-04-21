export type AchievementCategory = "constancia" | "modulos" | "diario" | "exploracion";

export interface AchievementDef {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** Numeric goal for progress display (e.g., 7 days, 10 readings) */
  goal: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Constancia diaria (rachas de horóscopo)
  { code: "streak_3", title: "Primer Ciclo", description: "Consulta tu horóscopo 3 días seguidos", icon: "🌒", category: "constancia", goal: 3 },
  { code: "streak_7", title: "Semana Estelar", description: "Consulta tu horóscopo 7 días seguidos", icon: "🌕", category: "constancia", goal: 7 },
  { code: "streak_30", title: "Luna Llena de Constancia", description: "Consulta tu horóscopo 30 días seguidos", icon: "🌟", category: "constancia", goal: 30 },

  // Uso de módulos místicos
  { code: "tarot_1", title: "Primera Tirada", description: "Realiza tu primera lectura de Tarot", icon: "🃏", category: "modulos", goal: 1 },
  { code: "tarot_10", title: "Maestro del Tarot", description: "Completa 10 tiradas de Tarot", icon: "🎴", category: "modulos", goal: 10 },
  { code: "oracle_5", title: "Voz del Oráculo", description: "Recibe 5 mensajes del Oráculo", icon: "🔮", category: "modulos", goal: 5 },
  { code: "angels_5", title: "Guía Angelical", description: "Conecta con los Ángeles 5 veces", icon: "👼", category: "modulos", goal: 5 },
  { code: "secret_5", title: "Manifestador", description: "Usa El Secreto 5 veces", icon: "✨", category: "modulos", goal: 5 },

  // Diario astral
  { code: "journal_1", title: "Primera Página", description: "Escribe tu primera entrada en el diario", icon: "📖", category: "diario", goal: 1 },
  { code: "journal_10", title: "Cronista Astral", description: "Escribe 10 entradas en el diario", icon: "📚", category: "diario", goal: 10 },
  { code: "journal_1000_words", title: "Mil Palabras", description: "Acumula 1000 palabras en tu diario", icon: "✍️", category: "diario", goal: 1000 },

  // Exploración completa
  { code: "explore_natal", title: "Conócete", description: "Genera tu Carta Natal completa", icon: "🌌", category: "exploracion", goal: 1 },
  { code: "explore_skymap", title: "Viajero del Cielo", description: "Explora el Sky Map por primera vez", icon: "🗺️", category: "exploracion", goal: 1 },
  { code: "explore_lucky", title: "Suerte en tus Manos", description: "Descubre tu número de la suerte", icon: "🍀", category: "exploracion", goal: 1 },
  { code: "explore_ritual", title: "Ritual Sagrado", description: "Recibe tu primer ritual sugerido", icon: "🕯️", category: "exploracion", goal: 1 },
  { code: "explore_amulet", title: "Amuleto Personal", description: "Obtén tu amuleto de la suerte", icon: "🧿", category: "exploracion", goal: 1 },
  { code: "explore_dates", title: "Mapa del Destino", description: "Agrega una fecha importante al Sky Map", icon: "📅", category: "exploracion", goal: 1 },
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  constancia: "Constancia Diaria",
  modulos: "Módulos Místicos",
  diario: "Diario Astral",
  exploracion: "Exploración",
};
