"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LangCode, TransKeys, getTranslation, translations } from "@/lib/i18n";
import { LANG_STORAGE_KEY } from "@/components/LanguageSwitcher";

interface LanguageContextType {
  lang: LangCode;
  t: (key: TransKeys, variables?: Record<string, any>) => any;
  setLang: (newLang: LangCode) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Keep RTL state clean
  const isRtl = lang === "ar";

  useEffect(() => {
    // Read preference on client mount
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && saved in translations) {
      setLangState(saved as LangCode);
    }

    // Handle custom event from switcher
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && customEvent.detail in translations) {
        setLangState(customEvent.detail as LangCode);
      }
    };

    window.addEventListener("ivan-lang-change", handleLangChange);
    return () => {
      window.removeEventListener("ivan-lang-change", handleLangChange);
    };
  }, []);

  // Dynamically update document dir and lang on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dir = "ltr"; // Always keep LTR layout structure
      document.documentElement.lang = lang;
      document.documentElement.setAttribute("data-lang", lang);
    }
  }, [lang]);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    window.dispatchEvent(new CustomEvent("ivan-lang-change", { detail: newLang }));
  };

  const t = (key: TransKeys, variables?: Record<string, any>) => {
    return getTranslation(key, lang, variables);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
