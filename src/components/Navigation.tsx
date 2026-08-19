"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePerformance } from "@/contexts/PerformanceContext";

const iosSpring = { type: "spring" as const, stiffness: 400, damping: 30 };

function SignOutButton() {
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <motion.button
      animate={{ scale: pressed ? 0.9 : 1, opacity: loading ? 0.5 : 1 }}
      transition={iosSpring}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={handleSignOut}
      title="Sign out"
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        border: "1px solid rgba(255, 59, 48, 0.4)",
        backgroundColor: "rgba(255, 59, 48, 0.2)",
        color: "#FF3B30",
        cursor: loading ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </motion.button>
  );
}

export default function Navigation() {
  const { lang, setLang, t } = useLanguage();
  const { lowPerfMode } = usePerformance();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic OS Dark / Light Mode Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (isDark: boolean) => {
      const targetTheme = isDark ? "dark" : "light";
      setThemeMode(targetTheme);
      document.documentElement.setAttribute("data-theme", targetTheme);
    };

    applyTheme(mediaQuery.matches);

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const cycleLang = () => {
    const langs: ("en" | "nl" | "zh" | "ar")[] = ["en", "nl", "zh", "ar"];
    const currIdx = langs.indexOf(lang as any);
    const nextLang = langs[(currIdx + 1) % langs.length];
    setLang(nextLang);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const [isBlogDomain, setIsBlogDomain] = useState(false);
  const [isWorkDomain, setIsWorkDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host.startsWith("blog.") || host.includes("blog.ivanaffriandi.com")) {
        setIsBlogDomain(true);
      }
      if (host.startsWith("work.") || host.includes("work.ivanaffriandi.com")) {
        setIsWorkDomain(true);
      }
    }
  }, []);

  // Hide navigation ONLY on /work
  if (pathname?.startsWith("/work") || isWorkDomain) {
    return null;
  }

  // Hide on main domain homepage (ivanaffriandi.com at "/") only if NOT on blog subdomain
  if (pathname === "/" && typeof window !== "undefined" && !window.location.hostname.startsWith("blog.") && !window.location.hostname.includes("blog.ivanaffriandi.com")) {
    return null;
  }

  const isAdminPage = pathname === "/admin" || pathname === "/hq-panel" || pathname === "/x";
  const isDark = themeMode === "dark";

  return (
    <>
      <style>{`
        /* ── DESKTOP VERTICAL SIDEBAR (100% TRANSPARENT WITH CRISP WHITE CONTRAST OVER PHOTO) ── */
        .desktop-nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 54px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 2.5rem 0;
          background: transparent !important;
          border-right: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-sizing: border-box;
          pointer-events: auto;
        }

        .desktop-nav-logo {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #FFFFFF !important;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9);
          text-decoration: none;
          font-family: var(--font-sans);
          text-transform: uppercase;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          cursor: default;
          user-select: none;
        }

        .desktop-nav-links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-side-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: rgba(255, 255, 255, 0.75) !important;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7));
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease, background 0.2s ease;
          background: none;
          border: none;
          padding: 0;
          border-radius: 8px;
        }
        .nav-side-icon:hover, .nav-side-icon.active {
          color: #FFFFFF !important;
          background: rgba(255, 255, 255, 0.16) !important;
        }

        /* ── MOBILE SPECIFIC HEADER (< 860px) ── */
        .mobile-header-bar {
          display: none;
        }

        @media (max-width: 860px) {
          .desktop-nav-bar {
            display: none !important;
          }

          .mobile-header-bar {
            display: flex !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 52px;
            z-index: 1000;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.25rem;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.35) !important;
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transition: background 0.3s ease, border 0.3s ease;
          }

          /* Completely disable and hide on blog / journal page */
          body:has(.pj-root) .mobile-header-bar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            pointer-events: none !important;
          }
        }
      `}</style>

      {/* ── DESKTOP NAVIGATION BAR (TRANSPARENT FLOATING) ── */}
      <header className="desktop-nav-bar">
        <span className="desktop-nav-logo">
          IVAN
        </span>

        <div className="desktop-nav-links">
          {/* 1. Blog / Journal Link (Feather Pen / Quill Icon in Crisp Pure White) */}
          <a
            href="https://blog.ivanaffriandi.com"
            className={`nav-side-icon${pathname.startsWith("/blog") || isBlogDomain ? " active" : ""}`}
            title="Blog & Journal"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
              <line x1="16" y1="8" x2="2" y2="22" />
              <line x1="17.5" x2="15" y1="15" y2="17.5" />
            </svg>
          </a>

          {/* 2. Ask Q&A Link */}
          <Link
            href="/ask"
            className={`nav-side-icon${pathname.startsWith("/ask") ? " active" : ""}`}
            title="Ask Q&A"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Link>

          {isAdminPage && <SignOutButton />}

          <span
            title="© 2026 Ivan Affriandi"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9)",
              opacity: 0.85,
              cursor: "default",
              fontFamily: "var(--font-sans)",
              marginTop: "0.5rem",
            }}
          >
            © IA · 26
          </span>
        </div>
      </header>

      {/* ── MOBILE DEDICATED TOP HEADER (NEVER SHOWN ON BLOG / JOURNAL) ── */}
      {(!pathname.startsWith("/blog") && !isBlogDomain && (typeof window === "undefined" || (!window.location.hostname.startsWith("blog.") && !window.location.hostname.includes("blog.ivanaffriandi.com")))) && (
      <div className="mobile-header-bar">
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#FFFFFF" }}>
          <span
            style={{
              fontFamily: "var(--font-sans, sans-serif)",
              fontWeight: 800,
              fontSize: "0.9rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            IVAN
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            onClick={cycleLang}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "14px",
              padding: "4px 9px",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#FFFFFF",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {lang.toUpperCase()}
          </button>

          {/* On blog page: show direct Q&A button instead of hamburger menu */}
          {pathname.startsWith("/blog") ? (
            <Link
              href="/ask"
              title="Ask Q&A"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "14px",
                padding: "4px 9px",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#FFFFFF",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Q&amp;A
            </Link>
          ) : (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Toggle Menu"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                border: "none",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              {isMenuOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                  <line x1="0" y1="2" x2="22" y2="2" />
                  <line x1="0" y1="10" x2="22" y2="10" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      )}

      {/* ── MOBILE FULLSCREEN DRAWER OVERLAY ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              background: isDark ? "rgba(8, 8, 8, 0.96)" : "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              color: isDark ? "#FFFFFF" : "#000000",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.2rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px))",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            {/* Top Bar */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: isDark ? "#FFFFFF" : "#000000" }}>
                IVAN™
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  cursor: "pointer",
                  padding: "6px",
                }}
              >
                <span>close</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation Links: ONLY Blog & Ask */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem", margin: "auto 0", width: "100%", alignItems: "center" }}>
              <a
                href="https://blog.ivanaffriandi.com"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: pathname.startsWith("/blog") ? (isDark ? "#FFFFFF" : "#000000") : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"),
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.02em",
                }}
              >
                Blog
              </a>
              <Link
                href="/ask"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: pathname.startsWith("/ask") ? (isDark ? "#FFFFFF" : "#000000") : (isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"),
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.02em",
                }}
              >
                Ask Q&amp;A
              </Link>

              {isAdminPage && <SignOutButton />}
            </div>

            {/* Bottom Controls */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.85rem", alignItems: "center", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", paddingTop: "1rem" }}>
              <button
                onClick={cycleLang}
                style={{
                  background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "14px",
                  padding: "4px 14px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: isDark ? "#FFFFFF" : "#000000",
                  cursor: "pointer",
                }}
              >
                LANGUAGE: {lang.toUpperCase()}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
