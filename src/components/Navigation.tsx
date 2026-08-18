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
        border: "1px solid rgba(255, 59, 48, 0.25)",
        backgroundColor: "rgba(255, 59, 48, 0.12)",
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
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = (localStorage.getItem("ivan_theme") as "light" | "dark") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "dark");
      setThemeMode(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("ivan_theme", nextTheme);
  };

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
    if (!isMenuOpen) {
      setIsProfileExpanded(false);
    }
  }, [isMenuOpen]);

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

  const [isWorkDomain, setIsWorkDomain] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hostname.startsWith("work.") || window.location.pathname.startsWith("/work")) {
        setIsWorkDomain(true);
      }
    }
  }, []);
  if (pathname?.startsWith("/work") || isWorkDomain) {
    return null;
  }

  const isAdminPage = pathname === "/admin" || pathname === "/hq-panel" || pathname === "/x";

  const mobileTabs = [
    {
      id: "home",
      label: t("nav_home") || "Home",
      href: "/",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          {!active && <polyline points="9 22 9 12 15 12 15 22" />}
        </svg>
      ),
    },
    {
      id: "ask",
      label: t("nav_ask") || "Ask",
      href: "/ask",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        /* ── DESKTOP VERTICAL SIDEBAR ── */
        .desktop-nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 54px;
          z-index: 500;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 2.5rem 0;
          background: transparent;
          box-sizing: border-box;
          border-right: none;
          transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .desktop-nav-logo {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #FFFFFF;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
          text-decoration: none;
          font-family: var(--font-sans);
          text-transform: uppercase;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        .desktop-nav-links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-side-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          transition: color 0.2s ease, transform 0.2s ease;
          background: none;
          border: none;
          padding: 0;
        }
        .nav-side-icon:hover, .nav-side-icon.active {
          color: #FFFFFF;
        }

        /* ── MOBILE SPECIFIC LAYOUT (< 860px) ── */
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
            height: 54px;
            z-index: 1000;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.25rem;
            box-sizing: border-box;
            transition: background-color 0.3s ease;
          }
        }

        /* ── Fullscreen Overlay Mobile Drawer ── */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #080808;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          box-sizing: border-box;
          overflow-y: auto;
        }
      `}</style>

      {/* ── DESKTOP NAVIGATION BAR ── */}
      <header
        className="desktop-nav-bar"
        style={{
          background: pathname === "/" ? "transparent" : pathname === "/about" ? "#8C2A0F" : "rgba(10, 10, 10, 0.95)",
          transition: "background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span className="desktop-nav-logo" style={{ cursor: "default", userSelect: "none" }}>
          IVAN
        </span>

        <div className="desktop-nav-links">
          <Link href="/" className={`nav-side-icon${pathname === "/" ? " active" : ""}`} title="Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
          <Link href="/ask" className={`nav-side-icon${pathname === "/ask" ? " active" : ""}`} title="Ask Q&A">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Link>
          <Link href="/about" className={`nav-side-icon${pathname === "/about" ? " active" : ""}`} title="About Ivan">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <span
            title="© 2026 Ivan Affriandi"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              opacity: 0.9,
              cursor: "default",
              fontFamily: "var(--font-sans)",
            }}
          >
            © IA · 26
          </span>
        </div>
      </header>

      {/* ── MOBILE DEDICATED TOP HEADER ── */}
      <div
        className="mobile-header-bar"
        style={{
          background: pathname === "/" ? "transparent" : "#080808",
          borderBottom: pathname === "/" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {pathname !== "/" ? (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: "#FFFFFF" }}>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.12em", fontWeight: 700, textTransform: "uppercase", color: "#FFFFFF" }}>
              PREVIOUS
            </span>
          </Link>
        ) : (
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-sans, sans-serif)",
                fontWeight: 800,
                fontSize: "0.95rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#FFFFFF",
                textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              }}
            >
              Ivan
            </span>
          </Link>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Subpages show lang pill if needed, Homepage HAS NO LANG BUTTON AT ALL */}
          {pathname !== "/" && (
            <button
              onClick={cycleLang}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
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
          )}

          {/* Minimalist Double Parallel Horizontal Line Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Toggle Menu"
            style={{
              background: isMenuOpen ? "#FFFFFF" : "transparent",
              color: isMenuOpen ? "#000000" : "#FFFFFF",
              border: "none",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "all 0.2s ease",
            }}
          >
            {isMenuOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <line x1="0" y1="2" x2="22" y2="2" />
                <line x1="0" y1="10" x2="22" y2="10" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE FULLSCREEN DRAWER OVERLAY ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-drawer-overlay"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              background: "#080808",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.2rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px))",
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            {/* Top Bar: Brand Logo & Close X Button */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#FFFFFF" }}>
                IVAN™
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
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

            {/* Center Main Navigation Links (Clean Elegant Centered Font like Image 1 & 2) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", margin: "auto 0", width: "100%", alignItems: "center" }}>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: pathname === "/" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                Home
              </Link>
              <Link
                href="/ask"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: pathname === "/ask" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                Ask Q&amp;A
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: pathname === "/about" ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                About Ivan
              </Link>
              <Link
                href="/about#prologue"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans, sans-serif)",
                  color: "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                Prologue
              </Link>

              {/* Search Bar / Hairline Input inside Menu (like Image 1) */}
              <div style={{ width: "80%", maxWidth: "280px", margin: "1.2rem 0 0.5rem 0", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "0.4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <input
                  type="text"
                  placeholder="Search journal..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const query = e.currentTarget.value;
                      setIsMenuOpen(false);
                      if (query) window.location.href = `/?search=${encodeURIComponent(query)}`;
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FFFFFF",
                    fontSize: "0.8rem",
                    width: "85%",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Manifesto Quote (like Image 1) */}
              <p style={{ fontSize: "0.74rem", lineHeight: 1.6, color: "rgba(255,255,255,0.45)", maxWidth: "260px", margin: "0 auto", fontStyle: "italic", fontFamily: "var(--font-serif, Georgia, serif)" }}>
                Crafting high-performance web applications and thoughtful digital experiences in a human dimension.
              </p>
            </div>

            {/* Bottom Controls & Footer Metadata */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.85rem", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
              <button
                onClick={cycleLang}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "14px",
                  padding: "4px 14px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                {lang.toUpperCase()}
              </button>

              {isAdminPage && (
                <div style={{ margin: "0.2rem 0" }}>
                  <SignOutButton />
                </div>
              )}

              <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                JAKARTA, INDONESIA · © 2026 IVAN AFFRIANDI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

