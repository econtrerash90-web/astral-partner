export type ReadingType = "tarot" | "secret" | "angels" | "oracle";

const DAILY_LIMITS: Record<string, Record<ReadingType, number>> = {
  free: { tarot: 1, secret: 0, angels: 0, oracle: 0 },
  premium: { tarot: 99, secret: 99, angels: 99, oracle: 99 },
};

export const getLimit = (type: ReadingType, isPremium: boolean): number =>
  DAILY_LIMITS[isPremium ? "premium" : "free"][type];

export const isLocked = (type: ReadingType, isPremium: boolean): boolean =>
  getLimit(type, isPremium) === 0;

export const READING_META: Record<ReadingType, { label: string; emoji: string; color: string }> = {
  tarot: { label: "Tarot", emoji: "🔮", color: "primary" },
  secret: { label: "El Secreto", emoji: "🌟", color: "accent" },
  angels: { label: "Ángeles", emoji: "👼", color: "nebula-pink" },
  oracle: { label: "Oráculo", emoji: "🎴", color: "primary" },
};

export const CATEGORIES = [
  { id: "love", label: "💕 Amor" },
  { id: "work", label: "💼 Trabajo" },
  { id: "money", label: "💰 Finanzas" },
  { id: "health", label: "🏥 Salud" },
  { id: "spiritual", label: "✨ Espiritualidad" },
  { id: "other", label: "❓ Otra" },
];
