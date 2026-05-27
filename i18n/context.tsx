import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import en from "./locales/en";
import zh from "./locales/zh";

export type Locale = "en" | "zh";
export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, zh };

function getDefaultLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useLocalStorage<Locale>(
    "settings:locale",
    getDefaultLocale(),
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: translations[locale],
    }),
    [locale, setLocale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslation must be used within LocaleProvider");
  return ctx;
}
