"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [igMedia, setIgMedia] = useState<any[]>([]);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data) => {
        if (data.media && data.media.length > 0) setIgMedia(data.media);
      })
      .catch(() => {});
  }, []);

  const fallbackImages = [
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
    "/nature_hero.png",
  ];

  const displayImages: string[] =
    igMedia.length > 0
      ? igMedia.map((m: any) => m.media_url || m.thumbnail_url || "/nature_hero.png")
      : fallbackImages;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setNewsletterMsg("You're in — quiet dispatches incoming.");
        setNewsletterEmail("");
      } else {
        setNewsletterMsg(data.error || "Something went wrong.");
      }
    } catch {
      setNewsletterMsg("Something went wrong.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const projects = [
    {
      num: "01",
      title: "Full-Stack Web Engineering",
      desc: "Building high-performance Next.js & React web applications, custom Axum/Rust API microservices, and clean serverless architecture.",
      tags: ["Next.js 15", "React 19", "Rust / Axum", "PostgreSQL", "TypeScript"],
    },
    {
      num: "02",
      title: "UI/UX & Design Systems",
      desc: "Designing minimal digital products, tactile interaction details, cohesive typography design systems, and intuitive user experiences.",
      tags: ["Figma", "Design Systems", "Micro-Interactions", "Accessibility"],
    },
    {
      num: "03",
      title: "SHŪ / EN Studio",
      desc: "Architectural & interior 3D visualization studio crafting photorealistic light simulations, spatial renders, and material studies.",
      tags: ["Blender 3D", "Spatial Lighting", "Ray-Tracing", "Architectural"],
    },
    {
      num: "04",
      title: "KVR Objects",
      desc: "Industrial hardware design, tactile desk objects, and precision-machined aluminum accessories for minimal workspaces.",
      tags: ["Industrial Design", "CNC Aluminum", "Ergonomics", "Physical Objects"],
    },
    {
      num: "05",
      title: "Equilibriumians",
      desc: "An independent publication & digital culture collective exploring software engineering, minimalist aesthetics, and visual arts.",
      tags: ["Publication", "Essays", "Minimalist Philosophy", "Digital Culture"],
    },
  ];

  const techStack = [
    "TypeScript",
    "Rust",
    "Next.js 15",
    "React 19",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "Figma",
    "Blender 3D",
    "Linux Systems",
  ];

  return (
    <div className="about-root">
      <style>{`
        /* ── ABOUT PAGE ROOT ── */
        .about-root {
          display: flex;
          flex-direction: row;
          margin-left: 54px;
          width: calc(100vw - 54px);
          min-height: 100vh;
          background: #FAFAFA;
          color: #111111;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          overflow-x: hidden;
          box-sizing: border-box;
        }

        /* ── LEFT COLUMN: STICKY 3x3 B&W INSTAGRAM GRID ── */
        .about-left-col {
          position: sticky;
          top: 0;
          left: 0;
          align-self: flex-start;
          flex-shrink: 0;
          width: clamp(380px, 35vw, 520px);
          height: 100vh;
          background: #000000;
          overflow: hidden;
          box-sizing: border-box;
          border-right: 1px solid rgba(0, 0, 0, 0.08);
        }

        .about-ig-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          width: 100%;
          height: 100%;
          gap: 2px;
          background: #000000;
        }

        .about-ig-cell {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #111111;
          cursor: zoom-in;
        }

        /* 100% PURE MONOCHROME B&W FILTER WITH MICRO INTERACTIONS */
        .about-ig-cell img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          filter: grayscale(100%) contrast(1.15) brightness(0.92) !important;
          -webkit-filter: grayscale(100%) contrast(1.15) brightness(0.92) !important;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease !important;
        }

        .about-ig-cell:hover img {
          transform: scale(1.08) !important;
          filter: grayscale(100%) contrast(1.22) brightness(1.0) !important;
          -webkit-filter: grayscale(100%) contrast(1.22) brightness(1.0) !important;
        }

        /* ── RIGHT COLUMN: EDITORIAL SHOWCASE ── */
        .about-right-col {
          flex: 1;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          padding: 3.5rem 4.5rem 4rem 4.5rem;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #FAFAFA;
        }

        .about-right-col::-webkit-scrollbar { width: 5px; }
        .about-right-col::-webkit-scrollbar-track { background: transparent; }
        .about-right-col::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 4px; }

        .about-label-header {
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888888;
          display: block;
          margin-bottom: 1.4rem;
        }

        /* ── NOVEL DROP CAP BIO STATEMENT ── */
        .novel-drop-cap {
          float: left;
          font-size: 3rem;
          line-height: 0.78;
          padding-top: 0.04rem;
          margin-right: 0.3rem;
          font-family: var(--font-serif, Georgia, serif);
          font-weight: 700;
          color: #111111;
        }

        .novel-paragraph {
          font-size: clamp(1rem, 1.25vw, 1.18rem);
          line-height: 1.7;
          color: #111111;
          margin: 0 0 2.5rem 0;
          font-family: var(--font-sans);
          letter-spacing: -0.012em;
          max-width: 820px;
        }

        .serif-italic {
          font-family: var(--font-serif, Georgia, serif);
          font-style: italic;
          color: #8C2A0F;
          font-weight: 600;
        }

        /* ── TECH STACK CAPSULE ROW ── */
        .about-tech-dock {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-bottom: 2.5rem;
        }

        .about-tech-chip {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #333333;
          transition: all 0.2s ease;
        }

        .about-tech-chip:hover {
          background: #111111;
          color: #FFFFFF;
          border-color: #111111;
          transform: translateY(-1px);
        }

        /* ── 3-COLUMN PROJECT ROWS (01 TO 05) ── */
        .about-steps-list {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 3rem;
        }

        .about-step-row {
          display: grid;
          grid-template-columns: 50px 1.4fr 1.2fr;
          gap: 1.4rem;
          align-items: start;
          padding: 1.4rem 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          box-sizing: border-box;
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-step-row:hover {
          background: rgba(0, 0, 0, 0.025);
          transform: translateX(4px);
        }

        .about-step-row:last-child {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .about-step-num {
          font-size: 0.72rem;
          font-weight: 800;
          color: #888888;
          letter-spacing: 0.05em;
          font-family: var(--font-serif, Georgia, serif);
          padding-top: 0.15rem;
        }

        .about-step-title {
          font-size: clamp(1.1rem, 1.4vw, 1.38rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #111111;
          margin: 0 0 0.4rem 0;
          line-height: 1.25;
          font-family: var(--font-sans);
        }

        .about-step-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin-top: 0.45rem;
        }

        .about-step-tag {
          font-size: 0.58rem;
          font-weight: 700;
          background: rgba(140, 42, 15, 0.08);
          color: #8C2A0F;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .about-step-desc {
          font-size: 0.8rem;
          line-height: 1.62;
          color: #555555;
          margin: 0;
          font-family: var(--font-sans);
        }

        /* ── 2-COLUMN PHILOSOPHY & REFLECTIONS SECTION ── */
        .about-newsletter-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: stretch;
          margin-bottom: 4rem;
        }

        .about-nl-card {
          background: #8C2A0F;
          color: #FFFFFF;
          border-radius: 18px;
          padding: 1.8rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 14px 40px rgba(140, 42, 15, 0.22);
          box-sizing: border-box;
        }

        /* ─────────────────────────────────────────────────
           PREMIUM MOBILE LAYOUT FOR /about PAGE
           ───────────────────────────────────────────────── */
        @media (max-width: 920px) {
          .about-root {
            flex-direction: column;
            margin-left: 0;
            width: 100%;
            min-height: 100dvh;
            padding-top: 54px;
          }

          .about-left-col {
            position: relative;
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            min-width: unset;
            height: 60vw;
            min-height: 260px;
            max-height: 380px;
            flex-shrink: 0;
            border-right: none;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .about-ig-grid {
            width: 100% !important;
          }

          .about-right-col {
            padding: 2.2rem 1.4rem 5rem;
            height: auto;
            overflow-y: visible;
          }

          .about-step-row {
            grid-template-columns: 40px 1fr;
            gap: 0.85rem;
            padding: 1.1rem 0.5rem;
          }

          .about-step-desc {
            grid-column: 2;
            margin-top: 0.4rem;
          }

          .about-newsletter-wrap {
            grid-template-columns: 1fr;
            gap: 1.8rem;
          }
        }
      `}</style>

      {/* ── LEFT COLUMN: STICKY 3x3 B&W INSTAGRAM GRID ── */}
      <div className="about-left-col">
        <div className="about-ig-grid">
          {displayImages.slice(0, 9).map((imgSrc, idx) => (
            <div
              key={idx}
              className="about-ig-cell"
              onClick={() => setActivePhotoModal(imgSrc)}
              title="Click to view full photo"
            >
              <img src={imgSrc} alt={`Moment ${idx + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN: EDITORIAL SHOWCASE ── */}
      <div className="about-right-col">
        {/* TOP LABEL */}
        <span className="about-label-header">ABOUT &amp; PROFILE</span>

        {/* NOVEL DROP CAP BIO STATEMENT */}
        <p className="novel-paragraph">
          <span className="novel-drop-cap">I</span>&apos;m Ivan—a{" "}
          <span className="serif-italic">Full-Stack Web Engineer</span> &amp;{" "}
          <span className="serif-italic">UI/UX Designer</span> based in Jakarta.
          I craft high-performance web applications, minimal design systems, 3D architectural
          renders, and tactile physical desk objects.
        </p>

        {/* TECH STACK CHIPS */}
        <div className="about-tech-dock">
          {techStack.map((tech) => (
            <span key={tech} className="about-tech-chip">
              {tech}
            </span>
          ))}
        </div>

        {/* 01 TO 05 PROJECTS */}
        <div className="about-steps-list">
          {projects.map((item) => (
            <div key={item.num} className="about-step-row">
              <span className="about-step-num">{item.num}</span>
              <div>
                <h3 className="about-step-title">{item.title}</h3>
                <div className="about-step-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="about-step-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="about-step-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 2-COLUMN PHILOSOPHY & REFLECTIONS SECTION */}
        <div className="about-newsletter-wrap">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.2rem" }}>
            <div>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888888", display: "block", marginBottom: "0.6rem" }}>
                DESIGN PHILOSOPHY &amp; REFLECTIONS
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 400, fontFamily: "var(--font-serif, Georgia, serif)", lineHeight: 1.35, margin: "0 0 0.8rem 0", color: "#111111" }}>
                “The best software feels weightless—tactile in detail, quiet in presence.”
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#555555", lineHeight: 1.65, margin: "0 0 1.4rem 0", fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic" }}>
                Whether designing digital web apps, machining physical desk accessories, or rendering 3D spatial light, I strive for clarity over complexity. When every distraction is stripped away, only intentional craft remains.
              </p>

              <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", gap: "0.4rem", maxWidth: "380px" }}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address..."
                  disabled={isSubscribing || subscribed}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.9rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.78rem",
                    outline: "none",
                    background: "#FFFFFF",
                    color: "#111111",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubscribing || subscribed || !newsletterEmail}
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "12px",
                    border: "none",
                    background: "#111111",
                    color: "#FFFFFF",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  {isSubscribing ? "..." : subscribed ? "Joined" : "Subscribe"}
                </button>
              </form>
              {newsletterMsg && (
                <p style={{ fontSize: "0.72rem", color: "#8C2A0F", marginTop: "0.5rem", fontWeight: 600 }}>
                  {newsletterMsg}
                </p>
              )}
            </div>
          </div>

          <div className="about-nl-card">
            <div>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, display: "block", marginBottom: "0.5rem" }}>
                LATE NIGHT NOTES
              </span>
              <h3 style={{ fontSize: "1.45rem", fontWeight: 700, margin: "0 0 0.6rem 0", letterSpacing: "-0.02em" }}>
                Crafting Across Media
              </h3>
              <p style={{ fontSize: "0.8rem", lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                Notes on code architecture, physical material studies, typography experiments, and lessons from building enduring products.
              </p>
            </div>

            <div style={{ paddingTop: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                WEB ARCHITECTURE
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>
                Read Notes →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR INSTAGRAM MOMENTS */}
      <AnimatePresence>
        {activePhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhotoModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(16px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              cursor: "zoom-out",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "85vh",
                overflow: "hidden",
                borderRadius: "20px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "#111111",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhotoModal}
                alt="Enlarged Moment"
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  display: "block",
                  filter: "grayscale(100%) contrast(1.15)",
                }}
              />
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
