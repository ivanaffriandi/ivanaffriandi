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
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            z-index: 990;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.25rem;
            background: rgba(13, 13, 13, 0.88);
            backdrop-filter: blur(24px) saturate(1.8);
            -webkit-backdrop-filter: blur(24px) saturate(1.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            box-sizing: border-box;
          }

          html[data-theme="light"] .mobile-header-bar {
            background: rgba(246, 246, 244, 0.88);
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          }
        }

        /* ── Fullscreen Overlay Mobile Drawer ── */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0D0D0D;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
          box-sizing: border-box;
          overflow-y: auto;
        }

        html[data-theme="light"] .mobile-drawer-overlay {
          background: #F6F6F4;
          color: #121212;
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
          background: themeMode === "dark" ? "#0A0A0A" : "#F6F6F4",
          borderBottom: themeMode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              Ivan Affriandi
            </span>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10B981",
                marginLeft: "6px",
                boxShadow: "0 0 8px #10B981",
                display: "inline-block",
              }}
            />
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* Quick Lang Switcher Pill */}
          <button
            onClick={cycleLang}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border-color)",
              borderRadius: "14px",
              padding: "4px 9px",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--text-primary)",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {lang.toUpperCase()}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleThemeMode}
            title="Toggle theme"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border-color)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {themeMode === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Mobile Full Side Menu Drawer Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: isMenuOpen ? "var(--text-primary)" : "rgba(255,255,255,0.08)",
              color: isMenuOpen ? "var(--bg-color)" : "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {isMenuOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Drawer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.1rem", fontWeight: 600 }}>
                Ivan Affriandi
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation Big Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "2rem 0" }}>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.2rem",
                  fontFamily: "var(--font-serif)",
                  color: pathname === "/" ? "var(--accent-color, #FFFFFF)" : "var(--text-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{t("nav_home") || "Home"}</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.4 }}>01</span>
              </Link>
              <Link
                href="/ask"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.2rem",
                  fontFamily: "var(--font-serif)",
                  color: pathname === "/ask" ? "var(--accent-color, #FFFFFF)" : "var(--text-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{t("nav_ask") || "Ask Q&A"}</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.4 }}>02</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: "2.2rem",
                  fontFamily: "var(--font-serif)",
                  color: pathname === "/about" ? "var(--accent-color, #FFFFFF)" : "var(--text-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>About</span>
                <span style={{ fontSize: "0.8rem", opacity: 0.4 }}>03</span>
              </Link>
            </div>

            {/* Controls & Footer Info */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Appearance</span>
                <button
                  onClick={toggleThemeMode}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  {themeMode.toUpperCase()} MODE
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>Language</span>
                <button
                  onClick={cycleLang}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              </div>

              {isAdminPage && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#FF3B30" }}>Admin Session</span>
                  <SignOutButton />
                </div>
              )}

              <div style={{ marginTop: "1rem", fontSize: "0.7rem", opacity: 0.4, textAlign: "center" }}>
                © 2026 IVAN AFFRIANDI · ALL RIGHTS RESERVED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

