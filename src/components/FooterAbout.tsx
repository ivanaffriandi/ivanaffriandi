"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FooterAbout() {
  const [isOpen, setIsOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync system dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const SLIDES = [
    {
      title: "Hey There!",
      content: "I'm Ivan, a UI/UX designer and developer who loves building cool, clean, and interactive websites. Welcome to my little corner of the internet!"
    },
    {
      title: "What I Do",
      content: "By day, I code fast websites using Next.js and React, making sure everything looks sleek, clean, and super satisfying to click."
    },
    {
      title: "My Style",
      content: "I'm all about minimalist designs. For me, keeping things simple and using clean typography makes websites feel so much better."
    },
    {
      title: "Behind The Lens",
      content: "When I'm off the screen, you'll probably find me wandering into city forests, hunting for wild mushrooms, and taking close-up nature photos."
    },
    {
      title: "Random Thoughts",
      content: "I also love writing down cozy journals about design, minimal lifestyle, or just reflections on daily life. Feel free to read them!"
    },
    {
      title: "Let's Hang!",
      content: "Fluent in English and Indonesian. Hit me up if you want to chat about cool projects, share music, or grab a warm cup of coffee!"
    }
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ 
          backgroundColor: isOpen ? "var(--text-primary)" : "rgba(150, 150, 150, 0.12)",
          borderColor: isOpen ? "transparent" : "rgba(150, 150, 150, 0.25)"
        }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{ 
          background: "none", 
          border: isOpen ? "1px solid transparent" : "1px solid rgba(150, 150, 150, 0.16)", 
          color: isOpen ? "var(--bg-color)" : "var(--text-primary)", 
          fontWeight: "600", 
          cursor: "pointer", 
          padding: "6px 14.5px",
          backgroundColor: isOpen ? "var(--text-primary)" : "rgba(150, 150, 150, 0.05)",
          borderRadius: "30px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.76rem",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          transition: "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease"
        }}
      >
        About
        <motion.svg 
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <polyline points="6 15 12 9 18 15"></polyline>
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, x: "-50%", scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.96, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              opacity: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
              filter: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
            }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              left: "50%",
              width: "310px",
              maxWidth: "calc(100vw - 32px)",
              backgroundColor: isDark ? "rgba(22, 21, 20, 0.95)" : "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "22px",
              padding: "1.15rem",
              boxShadow: isDark 
                ? "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" 
                : "0 20px 45px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
              zIndex: 300,
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              cursor: "default"
            }}
          >
            {/* Header section with Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", backgroundColor: "rgba(150,150,150,0.1)", border: "1px solid rgba(150,150,150,0.2)" }}>
                <img 
                  src="/profile.jpg" 
                  alt="Ivan Affriandi" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }}
                  onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Ivan+A&background=random"; }}
                />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}>
                  Ivan Affriandi
                </h4>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)", marginTop: "1px" }}>
                  Designer & Developer
                </p>
              </div>
            </div>
            
            {/* Dynamic Sliding Bio */}
            <div style={{ minHeight: "80px", position: "relative" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                    opacity: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] },
                    filter: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  style={{ position: "absolute", top: 0, left: 0, right: 0 }}
                >
                  <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "-0.01em", fontFamily: "var(--font-sans)", opacity: 0.8, display: "block", marginBottom: "3px" }}>
                    {SLIDES[slide].title}
                  </span>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.55", fontFamily: "var(--font-sans)" }}>
                    {SLIDES[slide].content}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.95rem" }}>
              {/* Ultra-minimal Dash Page Indicators */}
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {SLIDES.map((_, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      width: slide === i ? "12px" : "4px", 
                      height: "3px", 
                      borderRadius: "1.5px", 
                      backgroundColor: slide === i ? "var(--text-primary)" : "rgba(150,150,150,0.25)", 
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" 
                    }} 
                  />
                ))}
              </div>
              
              {/* Sleek Arrow Nav Buttons */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <motion.button 
                  onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}
                  whileHover={{ color: "var(--text-primary)" }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    padding: 0,
                    width: "20px", 
                    height: "20px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer", 
                    color: "var(--text-secondary)"
                  }}
                  title="Previous slide"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </motion.button>
                <motion.button 
                  onClick={() => setSlide(s => (s + 1) % SLIDES.length)}
                  whileHover={{ color: "var(--text-primary)" }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    padding: 0,
                    width: "20px", 
                    height: "20px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: "pointer", 
                    color: "var(--text-secondary)"
                  }}
                  title="Next slide"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Works Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "-0.01em", fontFamily: "var(--font-sans)", opacity: 0.8 }}>
                Works
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {[
                  { label: "shuenstudio.com", url: "https://shuenstudio.com" },
                  { label: "kvr-objects.com", url: "https://kvr-objects.com" }
                ].map((work) => (
                  <a key={work.label} href={work.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: "0.68rem",
                    fontWeight: "500",
                    backgroundColor: "rgba(150,150,150,0.04)",
                    border: "1px solid rgba(150,150,150,0.1)",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    boxShadow: "var(--shadow-inset)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.08)";
                    e.currentTarget.style.borderColor = "rgba(150,150,150,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.04)";
                    e.currentTarget.style.borderColor = "rgba(150,150,150,0.1)";
                  }}
                  >
                    {work.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Interests Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-secondary)", letterSpacing: "-0.01em", fontFamily: "var(--font-sans)", opacity: 0.8 }}>
                Interests
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {["Minimal Design", "Vintage Layout", "Mushroom Hunting", "Nature Photo"].map((interest) => (
                  <span key={interest} style={{
                    fontSize: "0.68rem",
                    fontWeight: "500",
                    backgroundColor: "rgba(150,150,150,0.04)",
                    border: "1px solid rgba(150,150,150,0.1)",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-inset)"
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "0.2rem" }}>
              <a href="mailto:hello@ivanaffriandi.com" style={{ 
                flex: 1, 
                padding: "8px 10px", 
                backgroundColor: "var(--text-primary)", 
                color: "var(--bg-color)", 
                textAlign: "center", 
                borderRadius: "10px", 
                textDecoration: "none", 
                fontSize: "0.76rem", 
                fontWeight: "600", 
                fontFamily: "var(--font-sans)",
                transition: "opacity 0.2s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
              >
                Send Email
              </a>
              <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" style={{ 
                padding: "8px 10px", 
                backgroundColor: "rgba(150,150,150,0.08)", 
                color: "var(--text-primary)", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                transition: "background-color 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.08)"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="https://x.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" style={{ 
                padding: "8px 10px", 
                backgroundColor: "rgba(150,150,150,0.08)", 
                color: "var(--text-primary)", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                transition: "background-color 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(150,150,150,0.08)"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
