"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function GlobalProtector() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check" })
        });
        const data = await res.json();
        setIsAdmin(data.authenticated === true);
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) return; // Completely bypass all protections if the user is an admin

    const logSuspiciousActivity = async (type: string) => {
      try {
        await fetch("/api/log-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type })
        });
      } catch (e) {}
    };

    const handleScreenshotAttempt = (type: string) => {
      setShowWarning(true);
      logSuspiciousActivity(type);
      setTimeout(() => setShowWarning(false), 5000);
    };

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
        handleScreenshotAttempt("PrintScreen Shortcut");
      }
      
      // Mac Screenshot Shortcuts: Cmd + Shift + 3/4/5
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault();
        handleScreenshotAttempt("Mac Screenshot Shortcut");
      }

      // Windows Snipping Tool: Win + Shift + S
      if (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleScreenshotAttempt("Windows Snipping Tool Shortcut");
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
  }, [isAdmin]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#000000",
          zIndex: 999999,
          display: isBlurred && !isAdmin ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "1.2rem"
        }}
      >
        Content is protected.
      </div>
      
      {/* Intangible Warning Modal */}
      <div
        style={{
          position: "fixed",
          top: showWarning ? "24px" : "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(220, 38, 38, 0.95)",
          color: "#ffffff",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(220, 38, 38, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 9999999,
          transition: "top 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          minWidth: "300px"
        }}
      >
        <h3 style={{ margin: "0 0 6px 0", fontSize: "1rem", fontWeight: 800, letterSpacing: "0.02em" }}>🚨 SECURITY ALERT 🚨</h3>
        <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.4 }}>
          Screenshot attempts are strictly prohibited.<br/>
          <strong>Your IP Address has been logged.</strong>
        </p>
      </div>
    </>,
    document.body
  );
}
