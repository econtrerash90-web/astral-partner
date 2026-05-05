import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_LANGUAGE, LanguageCode, SUPPORTED_LANGUAGES, detectBrowserLanguage } from "@/lib/i18n/languages";
import { dictionaries } from "@/lib/i18n/translations";

const STORAGE_KEY = "astrelle.language";

interface I18nCtx {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string) => string;
  supported: typeof SUPPORTED_LANGUAGES;
}

const Ctx = createContext<I18nCtx | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && dictionaries[stored]) return stored;
    return detectBrowserLanguage();
  });

  // Load preferred language from profile when user logs in
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      const stored = (data as any)?.preferred_language as LanguageCode | undefined;
      if (stored && dictionaries[stored]) {
        setLanguageState(stored);
        localStorage.setItem(STORAGE_KEY, stored);
      } else {
        // Persist current detected language to profile so it's used by edge functions
        const detected = (localStorage.getItem(STORAGE_KEY) as LanguageCode) || detectBrowserLanguage();
        await supabase
          .from("profiles")
          .update({ preferred_language: detected } as any)
          .eq("id", user.id);
      }
    })();
  }, [user]);

  // Reflect language on <html lang>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    const prev = language;
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    if (user && lang !== prev) {
      await supabase.from("profiles").update({ preferred_language: lang } as any).eq("id", user.id);
      // Invalidate AI-generated cached content so it regenerates in the new language
      try {
        await (supabase as any).rpc("invalidate_user_ai_cache");
      } catch (e) {
        console.warn("Language cache invalidation failed", e);
      }
    }
  }, [user, language]);

  const t = useCallback((key: string) => {
    return dictionaries[language]?.[key] ?? dictionaries[DEFAULT_LANGUAGE][key] ?? key;
  }, [language]);

  return (
    <Ctx.Provider value={{ language, setLanguage, t, supported: SUPPORTED_LANGUAGES }}>
      {children}
    </Ctx.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
