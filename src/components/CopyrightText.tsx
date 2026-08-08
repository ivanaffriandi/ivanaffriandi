"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const GOTHIC_THEME_KEY = "ivan_gothic_horror_theme";

export default function CopyrightText() {
  const { t } = useLanguage();

  useEffect(() => {
    window.localStorage.removeItem(GOTHIC_THEME_KEY);
    document.documentElement.classList.remove("gothic-horror-theme");
    document.body.classList.remove("gothic-horror-theme");
  }, []);

  return (
    <span
      className="copyright-text"
      style={{
        fontSize: "0.58rem",
        color: "rgba(155,0,0,0.45)",
        fontWeight: "700",
        fontFamily: "monospace",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {t("copyright")}
    </span>
  );
}
