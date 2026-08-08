"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LANGS = [
  { code: "en", label: "English",    short: "EN", rtl: false },
  { code: "nl", label: "Nederlands", short: "NL", rtl: false },
  { code: "ar", label: "العربية",    short: "AR", rtl: true  },
  { code: "zh", label: "中文",        short: "ZH", rtl: false },
];

export const LANG_STORAGE_KEY = "ivan_lang_pref";

export default function LanguageSwitcher() {
  const [langIdx, setLangIdx]   = useState(0);
  const [mounted, setMounted]   = useState(false);
  const [cycling, setCycling]   = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved) {
      const idx = LANGS.findIndex(l => l.code === saved);
      if (idx !== -1) setLangIdx(idx);
    }
  }, []);

  const cycleLang = () => {
    if (cycling) return;
    setCycling(true);
    const next = (langIdx + 1) % LANGS.length;
    setLangIdx(next);
    localStorage.setItem(LANG_STORAGE_KEY, LANGS[next].code);
    // Broadcast so AI and other components can react
    window.dispatchEvent(new CustomEvent("ivan-lang-change", { detail: LANGS[next].code }));
    setTimeout(() => setCycling(false), 350);
  };

  if (!mounted) {
    return (
      <span style={{
        fontFamily: "monospace",
        fontSize: "0.58rem",
        fontWeight: "700",
        letterSpacing: "0.1em",
        color: "rgba(155,0,0,0.4)",
        textTransform: "uppercase",
      }}>
        EN
      </span>
    );
  }

  const current = LANGS[langIdx];

  return (
    <button
      onClick={cycleLang}
      title={`Language: ${current.label} — click to switch`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 0",
        outline: "none",
      }}
    >
      {/* Globe icon */}
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(155,0,0,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>

      {/* Animated label */}
      <div style={{ position: "relative", overflow: "hidden", height: "1rem" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={current.code}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              display: "inline-block",
              fontFamily: "monospace",
              fontSize: "0.58rem",
              fontWeight: "700",
              letterSpacing: "0.1em",
              color: "rgba(155,0,0,0.5)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              direction: current.rtl ? "rtl" : "ltr",
            }}
          >
            {current.short}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}
