export type LanguageCode = "es" | "en" | "de" | "pl" | "pt";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string; flag: string }[] = [
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", flag: "🇵🇱" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇵🇹" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "es";

export function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);
  for (const raw of candidates) {
    const code = raw.toLowerCase().split("-")[0];
    if (SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
      return code as LanguageCode;
    }
  }
  return DEFAULT_LANGUAGE;
}

export function languageFullName(code: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    es: "Spanish (Español)",
    en: "English",
    de: "German (Deutsch)",
    pl: "Polish (Polski)",
    pt: "Portuguese (Português)",
  };
  return map[code] ?? "Spanish (Español)";
}
