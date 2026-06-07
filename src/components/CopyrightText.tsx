"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function CopyrightText() {
  const { t } = useLanguage();
  return (
    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500", fontFamily: "var(--font-sans)" }}>
      {t("copyright")}
    </div>
  );
}
