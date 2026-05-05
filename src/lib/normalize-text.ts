// Text normalization utilities used before persisting birth data so that
// the recalculate_astral_chart trigger sees consistent values regardless
// of how the user typed them (extra spaces, mixed case, decomposed accents).

/** Collapse whitespace, NFC-normalize accents and trim. */
export const normalizeBasic = (raw: string): string =>
  raw.normalize("NFC").replace(/\s+/g, " ").trim();

const LOWER_WORDS = new Set([
  "de", "del", "la", "las", "los", "y", "e", "da", "do", "das", "dos",
  "van", "von", "der", "den", "el",
]);

/** Title Case respetando partículas comunes en español/portugués. */
export const toTitleCase = (raw: string): string => {
  const base = normalizeBasic(raw).toLocaleLowerCase("es");
  if (!base) return "";
  return base
    .split(" ")
    .map((word, i) => {
      if (i > 0 && LOWER_WORDS.has(word)) return word;
      // Handle hyphens (e.g. "jean-paul") and apostrophes (e.g. "d'arco")
      return word
        .split(/([-'])/)
        .map((part) =>
          part === "-" || part === "'"
            ? part
            : part.charAt(0).toLocaleUpperCase("es") + part.slice(1)
        )
        .join("");
    })
    .join(" ");
};

export interface NormalizedBirth {
  fullName: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  birthPlace: string;
}

export const normalizeBirthFields = (input: {
  fullName: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
}): NormalizedBirth => {
  const fullName = toTitleCase(input.fullName);
  const birthCity = toTitleCase(input.birthCity);
  const birthState = toTitleCase(input.birthState);
  const birthCountry = toTitleCase(input.birthCountry);
  return {
    fullName,
    birthCity,
    birthState,
    birthCountry,
    birthPlace: `${birthCity}, ${birthState}, ${birthCountry}`,
  };
};
