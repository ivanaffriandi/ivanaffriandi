"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function GlobalProtector() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [userIP, setUserIP] = useState("");

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
        setIsBlocked(data.blocked === true);
        if (data.ip) setUserIP(data.ip);
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) return; // Bypass all protections if the user is an admin

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
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard?.writeText("Screenshots are disabled.");
        handleScreenshotAttempt("PrintScreen Shortcut");
      }
      
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault();
        handleScreenshotAttempt("Mac Screenshot Shortcut");
      }

      if (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleScreenshotAttempt("Windows Snipping Tool Shortcut");
      }

      if (e.key === "F12" || (e.metaKey && e.altKey && e.key === "i")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Listen to Window Blur and Visibility Change (for mobile app switchers/backgrounding)
    const handleBlur = () => {
      setIsBlurred(true);
      // Even if OS intercepts keyboard shortcut, snipping tools cause window to lose focus
      handleScreenshotAttempt("Snipping Tool / Focus Lost");
    };
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        setIsBlurred(false);
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Copy Poisoning
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "This content is strictly protected and copyrighted by Ivan Affriandi. Unauthorized copying is logged.");
        handleScreenshotAttempt("Unauthorized Copy Attempt");
      }
    };
    document.addEventListener("copy", handleCopy);

    // 5. DevTools Detection (Booby Trap)
    // We check if window size discrepancy is large (meaning devtools is docked)
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    window.addEventListener("resize", checkDevTools);
    checkDevTools();

    // Global CSS injection for unselectable content
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        
        -webkit-touch-callout: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      ::selection {
        background: transparent;
      }
      ::-moz-selection {
        background: transparent;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", checkDevTools);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isAdmin]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Blackout overlay for Blur or DevTools */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#000000",
          zIndex: 999999,
          display: ((isBlurred || isDevToolsOpen) && !isAdmin) ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "1.2rem",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <span>{isDevToolsOpen ? "Security Override Detected." : "Content is protected."}</span>
        {isDevToolsOpen && <span style={{ fontSize: "0.8rem", color: "#ff4444" }}>Please close Developer Tools.</span>}
      </div>

      {/* Invisible Global Watermark Overlay (Defeats camera pictures of monitor) */}
      {!isAdmin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 999998, // Just below the blackout screen
            opacity: 0.03, // Extremely faint, almost invisible to human eye, but caught by cameras/screenshots
            backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><text x=\"10\" y=\"50\" fill=\"white\" font-size=\"14\" font-family=\"sans-serif\" transform=\"rotate(-45 50 50)\">IVAN AFFRIANDI</text></svg>')",
            backgroundRepeat: "repeat",
            mixBlendMode: "difference"
          }}
        />
      )}
      
      {/* Intangible Warning Modal */}
      <div
        style={{
          position: "fixed",
          top: showWarning ? "24px" : "-200px",
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
          Unauthorized access attempt blocked.<br/>
          <strong>Your IP Address has been logged.</strong>
        </p>
      </div>

      {/* Permanent IP Block Blackout Screen */}
      {isBlocked && !isAdmin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#0a0a0a",
            zIndex: 9999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontFamily: "var(--font-sans)",
            flexDirection: "column",
            gap: "1.5rem",
            textAlign: "center",
            padding: "2rem"
          }}
        >
          <div style={{
            fontSize: "4rem",
            lineHeight: 1
          }}>
            🚫
          </div>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            margin: 0,
            color: "#ef4444",
            letterSpacing: "-0.02em"
          }}>
            Access Denied
          </h1>
          <p style={{
            fontSize: "0.95rem",
            color: "#a3a3a3",
            maxWidth: "460px",
            lineHeight: 1.6,
            margin: 0
          }}>
            Your connection has been permanently restricted due to suspicious or abusive activity. If you believe this is an error, please contact the administrator.
          </p>
          <div style={{
            fontSize: "0.8rem",
            color: "#ef4444",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            fontFamily: "monospace",
            marginTop: "0.5rem"
          }}>
            Blocked IP: {userIP || "Resolving..."}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
