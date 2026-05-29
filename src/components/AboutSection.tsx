"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(false);

  // Sync event listener so navigation click automatically opens the dropdown
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-about", handleOpen);
      
      // If initial hash is #about, open it on load
      if (window.location.hash === "#about") {
        setIsOpen(true);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-about", handleOpen);
      }
    };
  }, []);

  return (
    <div id="about" style={{ borderTop: "1px solid var(--grid-line)", marginTop: "6rem", paddingTop: "4rem", paddingBottom: "4rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-primary)",
          transition: "opacity 0.2s"
        }}
        className="about-toggle-btn"
      >
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "600", margin: 0, letterSpacing: "-0.04em", lineHeight: "1" }}>
          Ivan Affriandi
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            {isOpen ? "Close" : "About"}
          </span>
          <motion.svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </motion.svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: "3rem" }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem" }} className="about-dropdown-grid">
              {/* Left Column: Simple Archive Labels and Hanko Seal */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5rem" }}>
                <div style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-secondary)" }}>
                  <div>Personal Archive // No. 001</div>
                  <div style={{ opacity: 0.7 }}>Creative Portfolio & Journal</div>
                </div>
                
                {/* Hanko Archival Seal Stamp */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%", maxWidth: "150px", aspectRatio: "1/1" }}>
                  <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: "rotate(-8deg)", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.05))" }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(224, 60, 49, 0.75)" strokeWidth="1.5" strokeDasharray="3 1 1 1 2 1" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(224, 60, 49, 0.75)" strokeWidth="0.75" />
                    <text x="50" y="55" fill="rgba(224, 60, 49, 0.85)" fontSize="15" fontFamily="var(--font-playfair, 'Playfair Display', Georgia, serif)" fontWeight="800" textAnchor="middle" letterSpacing="0.05em">
                      IVAN
                    </text>
                    <path id="circlePath" d="M 22,50 A 28,28 0 1,1 78,50 A 28,28 0 1,1 22,50" fill="none" />
                    <text fill="rgba(224, 60, 49, 0.55)" fontSize="4.8" fontFamily="monospace" letterSpacing="0.1em">
                      <textPath href="#circlePath" startOffset="0%">
                        CREATIVE ARCHIVE • EST. 2026 • CREATIVE ARCHIVE • EST. 2026 •
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right Column: Editorial statement & Clean Parameter Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                {/* Breathtaking Editorial Statement */}
                <blockquote style={{ margin: 0, padding: 0, border: "none" }}>
                  <p style={{ 
                    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)", 
                    fontSize: "clamp(1.25rem, 3.5vw, 1.8rem)", 
                    fontWeight: "500", 
                    fontStyle: "italic", 
                    lineHeight: "1.4", 
                    color: "var(--text-primary)", 
                    letterSpacing: "-0.01em",
                    maxWidth: "680px"
                  }}>
                    "Operating at the fragile boundary between stark structural precision and the slow, tactile beauty of wabi-sabi imperfection."
                  </p>
                </blockquote>

                <p style={{ fontSize: "1.05rem", fontWeight: "400", lineHeight: "1.6", color: "var(--text-secondary)", margin: 0, maxWidth: "680px" }}>
                  Ivan Affriandi is a Jakarta-based creative developer, digital archivist, and designer crafting immersive narrative spaces, responsive grid systems, and slow digital artifacts.
                </p>

                {/* Clean, Simple Table (No Brackets, Sans-serif) */}
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "680px", borderTop: "1px solid var(--grid-line)", paddingTop: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Role</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <span style={{ color: "var(--text-primary)" }}>Creative Developer & Archivist</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Location</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <span style={{ color: "var(--text-primary)" }}>Jakarta, ID (6.2088° S, 106.8456° E)</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Email</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <a href="mailto:hello@example.com" style={{ color: "var(--text-primary)", textDecoration: "none", borderBottom: "1px solid var(--text-primary)" }} className="minimal-link">hello@example.com</a>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Instagram</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "none", borderBottom: "1px solid var(--text-primary)" }} className="minimal-link">@ivanaffriandi</a>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Twitter</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "none", borderBottom: "1px solid var(--text-primary)" }} className="minimal-link">@ivanaffriandi</a>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>Weibo</span>
                    <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                    <a href="https://weibo.com/u/7915776414" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "none", borderBottom: "1px solid var(--text-primary)" }} className="minimal-link">@ivanaffriandi</a>
                  </div>
                </div>

                {/* Creative Philosophy Section */}
                <div style={{ 
                  borderTop: "1px solid var(--grid-line)", 
                  paddingTop: "2rem", 
                  marginTop: "2rem",
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "2.5rem", 
                  maxWidth: "680px" 
                }}>
                  <div style={{ flex: "1 1 280px" }}>
                    <h4 style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                      Design Principles
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Stark, Functional Grid Systems</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Analog Tactility in Digital Spaces</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Wabi-Sabi Negative Space & Slow UX</li>
                    </ul>
                  </div>
                  <div style={{ flex: "1 1 280px" }}>
                    <h4 style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                      Current Obsessions
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Crochet & Slow Handcraft</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Journaling & Daily Reflections</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Teapot Tea Rituals & Slow Mornings</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Mycology & Wild Forest Foraging</li>
                      <li style={{ display: "flex", gap: "8px" }}><span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> Macro Analog Photography (Fujifilm)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
