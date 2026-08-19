"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import momentsData from "./moments-data.json";

// Crisp Minimal Inline SVG Icons for Top-Right Navigation
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

interface MomentPhoto {
  id: string;
  image: string;
  date: string;
  caption?: string;
}

const ROLES_LIST = [
  { label: "UI/UX DESIGNER", href: "/work" },
  { label: "SOFTWARE ENGINEER", href: "/work" },
  { label: "FOUNDER · SHŪ / EN STUDIO", href: "https://shuenstudio.com", external: true },
  { label: "PRODUCT DESIGNER · KVR", href: "/work" },
  { label: "WRITER", href: "/blog" },
];

export default function AvantGardeHomepage() {
  const [moments] = useState<MomentPhoto[]>(momentsData as MomentPhoto[]);
  // Start at index 3 for balanced 3 on left, 1 active center, 3+ on right
  const [activeIndex, setActiveIndex] = useState<number>(3);
  
  // Real-time responsive window width initialized immediately
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 1280;
  });
  
  // Real-time reactive OS dark/light mode state
  const [isDark, setIsDark] = useState<boolean>(true);

  // 1. Strict OS Dark/Light Mode Synchronization
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);
    document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 2. Responsive Window Resize Listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Keyboard Navigation (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : moments.length - 1));
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev < moments.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moments.length]);

  const isMobile = windowWidth < 768;
  const thumbSize = isMobile ? 68 : 104;
  const activeSize = isMobile ? 190 : 224;
  const gap = isMobile ? 10 : 16;

  // Exact Center Calculation: pins the active card dead in the horizontal middle of the viewport
  const calculateTrackOffset = () => {
    let offsetBefore = 0;
    for (let i = 0; i < activeIndex; i++) {
      offsetBefore += thumbSize + gap;
    }
    const centerOfActive = offsetBefore + activeSize / 2;
    return windowWidth / 2 - centerOfActive;
  };

  const activePhoto = moments[activeIndex] || moments[0];

  // Clean single-line caption without raw newlines
  const cleanCaption = activePhoto.caption
    ? activePhoto.caption.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
    : "";

  // Dynamic Theme Tokens
  const bg = isDark ? "#000000" : "#FFFFFF";
  const fg = isDark ? "#FFFFFF" : "#000000";
  const textMuted = isDark ? "#8E8E93" : "#666666";
  const frameBorderActive = isDark ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(0,0,0,0.22)";
  const frameBorderThumb = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)";
  const shadowActive = isDark ? "0 25px 60px rgba(0,0,0,0.95)" : "0 18px 45px rgba(0,0,0,0.12)";
  const thumbBg = isDark ? "#111113" : "#E4E4E7";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: bg,
        color: fg,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isMobile ? "16px 18px 18px 18px" : "24px 48px 24px 48px",
        boxSizing: "border-box",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: "none",
        overflow: "hidden",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* ─── 1. TOP BAR ────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          zIndex: 20,
          margin: 0,
          padding: 0,
        }}
      >
        {/* TOP LEFT: WORK · BLOG (Accessible everywhere via Next.js Link) */}
        <nav style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px" }}>
          <Link
            href="/work"
            style={{
              fontSize: isMobile ? "11px" : "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: fg,
              textDecoration: "none",
              transition: "opacity 0.15s ease",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            WORK
          </Link>
          <span style={{ fontSize: "11px", color: textMuted, lineHeight: 1 }}>·</span>
          <Link
            href="/blog"
            style={{
              fontSize: isMobile ? "11px" : "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: fg,
              textDecoration: "none",
              transition: "opacity 0.15s ease",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            BLOG
          </Link>
        </nav>

        {/* TOP CENTER: 1-Line Simple Title (Desktop Only) */}
        {!isMobile && (
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: textMuted,
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            DESIGNER &amp; DEVELOPER
          </div>
        )}

        {/* TOP RIGHT: Social & Email Icons */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: isMobile ? "12px" : "14px",
            lineHeight: 1,
          }}
        >
          <a
            href="https://instagram.com/ivanaffriandi"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            style={{ color: fg, display: "flex", alignItems: "center", textDecoration: "none", transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <InstagramIcon />
          </a>
          <a
            href="https://github.com/ivanaffriandi"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            style={{ color: fg, display: "flex", alignItems: "center", textDecoration: "none", transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <GithubIcon />
          </a>
          <a
            href="https://x.com/ivanaffriandi"
            target="_blank"
            rel="noopener noreferrer"
            title="X / Twitter"
            style={{ color: fg, display: "flex", alignItems: "center", textDecoration: "none", transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <XIcon />
          </a>
          <a
            href="mailto:hello@ivanaffriandi.com"
            title="Email"
            style={{ color: fg, display: "flex", alignItems: "center", textDecoration: "none", transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <MailIcon />
          </a>
        </div>
      </header>

      {/* ─── 2. CENTER STAGE (DEAD CENTERED HORIZONTALLY AND VERTICALLY) ─ */}
      <main
        style={{
          position: "relative",
          width: "100%",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          margin: "auto 0",
        }}
      >
        <motion.div
          animate={{ x: calculateTrackOffset() }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          drag="x"
          dragConstraints={{ left: -3000, right: 3000 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -30) {
              setActiveIndex((prev) => (prev < moments.length - 1 ? prev + 1 : 0));
            } else if (info.offset.x > 30) {
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : moments.length - 1));
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: `${gap}px`,
            position: "absolute",
            left: 0,
            cursor: "grab",
          }}
        >
          {moments.map((item, idx) => {
            const isActive = idx === activeIndex;
            const currentSize = isActive ? activeSize : thumbSize;

            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {/* ACTIVE TOP LABEL (Date of Post) */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 12px)",
                      left: 0,
                      fontSize: isMobile ? "10px" : "10.5px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: fg,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.date}
                  </motion.div>
                )}

                {/* SQUARE PHOTO FRAME (100% Physical Grayscale files + strict aspect ratio) */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  style={{
                    width: `${currentSize}px`,
                    height: `${currentSize}px`,
                    minWidth: `${currentSize}px`,
                    minHeight: `${currentSize}px`,
                    maxWidth: `${currentSize}px`,
                    maxHeight: `${currentSize}px`,
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    backgroundColor: thumbBg,
                    position: "relative",
                    boxShadow: isActive ? shadowActive : "none",
                    border: isActive ? frameBorderActive : frameBorderThumb,
                    opacity: isActive ? 1 : 0.9,
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.opacity = "0.9";
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.date}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </motion.div>

                {/* ACTIVE BOTTOM LABEL (Real Instagram Caption strictly 1 line with ellipsis, ONLY if exists) */}
                {isActive && cleanCaption.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      left: 0,
                      width: `${activeSize}px`,
                      maxWidth: `${activeSize}px`,
                      fontSize: isMobile ? "9.5px" : "10px",
                      fontWeight: 500,
                      color: textMuted,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={cleanCaption}
                  >
                    {cleanCaption}
                  </motion.div>
                )}
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* ─── 3. BOTTOM BAR (TITLE "AFFRIANDI, IVAN" + ROLES LIST) ──── */}
      <footer
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "space-between",
          width: "100%",
          gap: isMobile ? "12px" : "24px",
          zIndex: 10,
        }}
      >
        {/* BOTTOM LEFT: Big Title "AFFRIANDI, IVAN" */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <h1
            style={{
              fontSize: isMobile ? "18px" : "24px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: fg,
              margin: 0,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            AFFRIANDI, IVAN
          </h1>
        </div>

        {/* Stacked Vertical Static List of Roles at Bottom Right (Both Desktop & Mobile) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2.5px",
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {ROLES_LIST.map((item, idx) => (
            <span
              key={idx}
              style={{
                fontSize: isMobile ? "8px" : "9.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: textMuted,
                lineHeight: 1.25,
                transition: "color 0.2s ease",
              }}
            >
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = fg)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = fg)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  {item.label}
                </Link>
              )}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
