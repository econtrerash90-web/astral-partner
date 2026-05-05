// Shared helper: resolve user's preferred language and build an instruction line for AI prompts.

const LANG_FULL: Record<string, string> = {
  es: "Spanish (Español)",
  en: "English",
  de: "German (Deutsch)",
  pl: "Polish (Polski)",
  pt: "Portuguese (Português)",
};

export async function getUserLanguage(
  supabaseClient: any,
  userId: string,
  fallback = "es"
): Promise<string> {
  try {
    const { data } = await supabaseClient
      .from("profiles")
      .select("preferred_language")
      .eq("id", userId)
      .maybeSingle();
    const lang = (data?.preferred_language as string | undefined) ?? fallback;
    return LANG_FULL[lang] ? lang : fallback;
  } catch {
    return fallback;
  }
}

export function languageInstruction(langCode: string): string {
  const full = LANG_FULL[langCode] ?? LANG_FULL.es;
  return `IMPORTANT: Respond ENTIRELY in ${full}. Do not use any other language. All names, terms, headings, lists and explanations must be in ${full}.`;
}

export function languageFullName(langCode: string): string {
  return LANG_FULL[langCode] ?? LANG_FULL.es;
}
