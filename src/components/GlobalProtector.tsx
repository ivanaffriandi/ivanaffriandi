"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function GlobalProtector() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Prevent Right-Click Globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. Prevent Keyboard Shortcuts for Screenshots/DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard?.writeText("Screenshots are disabled.");
      }
      
      // Mac Screenshot Shortcuts: Cmd + Shift + 3/4/5
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault();
      }

      // Windows Snipping Tool: Win + Shift + S
      if (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
      }

      // Prevent DevTools (F12, Cmd+Option+I) just in case
      if (e.key === "F12" || (e.metaKey && e.altKey && e.key === "i")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Listen to Window Blur (Snipping Tool takes focus away from window)
    const handleBlur = () => {
      setIsBlurred(true);
    };
    const handleFocus = () => {
      setIsBlurred(false);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Global CSS injection for unselectable content
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        zIndex: 999999,
        display: isBlurred ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "1.2rem"
      }}
    >
      Content is protected.
    </div>,
    document.body
  );
}
