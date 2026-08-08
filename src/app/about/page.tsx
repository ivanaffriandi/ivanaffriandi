"use client";

import React, { useState, useEffect } from "react";

export default function AboutPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [igMedia, setIgMedia] = useState<any[]>([]);

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

  const displayImages: string[] = igMedia.length > 0
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
    },
    {
      num: "02",
      title: "UI/UX & Design Systems",
      desc: "Designing minimal digital products, tactile interaction details, cohesive typography design systems, and intuitive user experiences.",
    },
    {
      num: "03",
      title: "SHŪ / EN Studio",
      desc: "Architectural & interior 3D visualization studio crafting photorealistic light simulations, spatial renders, and material studies.",
    },
    {
      num: "04",
      title: "KVR Objects",
      desc: "Industrial hardware design, tactile desk objects, and precision-machined aluminum accessories for minimal workspaces.",
    },
    {
      num: "05",
      title: "Equilibriumians",
      desc: "An independent publication & digital culture collective exploring software engineering, minimalist aesthetics, and visual arts.",
    },
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

        /* ── LEFT COLUMN: STICKY 3x3 B&W INSTAGRAM GRID (SLIGHTLY WIDER: 400px - 500px) ── */
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
        }

        /* 100% PURE MONOCHROME B&W FILTER */
        .about-ig-cell img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          filter: grayscale(100%) contrast(1.15) brightness(0.92) !important;
          -webkit-filter: grayscale(100%) contrast(1.15) brightness(0.92) !important;
          transition: transform 0.5s ease !important;
        }

        .about-ig-cell:hover img {
          transform: scale(1.06) !important;
          filter: grayscale(100%) contrast(1.22) brightness(1.0) !important;
          -webkit-filter: grayscale(100%) contrast(1.22) brightness(1.0) !important;
        }

        /* ── RIGHT COLUMN: EDITORIAL SHOWCASE (HOMEPAGE TYPOGRAPHY STYLE) ── */
        .about-right-col {
          flex: 1;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          padding: 3.5rem 4rem 0 4rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .about-right-col::-webkit-scrollbar { width: 4px; }
        .about-right-col::-webkit-scrollbar-track { background: transparent; }
        .about-right-col::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 4px; }

        .about-label-header {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #888888;
          display: block;
          margin-bottom: 1.4rem;
        }

        /* ── NOVEL DROP CAP BIO STATEMENT ── */
        .novel-drop-cap {
          float: left;
          font-size: 2.8rem;
          line-height: 0.78;
          padding-top: 0.04rem;
          margin-right: 0.2rem;
          font-family: var(--font-serif, Georgia, serif);
          font-weight: 700;
          color: #111111;
        }

        .novel-paragraph {
          font-size: clamp(0.95rem, 1.2vw, 1.15rem);
          line-height: 1.65;
          color: #111111;
          margin: 0 0 2.2rem 0;
          font-family: var(--font-sans);
          letter-spacing: -0.012em;
          max-width: 780px;
        }

        .serif-italic {
          font-family: var(--font-serif, Georgia, serif);
          font-style: italic;
          color: #8C2A0F;
          font-weight: 600;
        }

        /* ── 3-COLUMN PROJECT ROWS (01 TO 05) ── */
        .about-steps-list {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 2.5rem;
        }

        .about-step-row {
          display: grid;
          grid-template-columns: 50px 1.4fr 1fr;
          gap: 1.25rem;
          align-items: center;
          padding: 1.1rem 0;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
        }

        .about-step-row:last-child {
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .about-step-num {
          font-size: 0.7rem;
          font-weight: 700;
          color: #888888;
          letter-spacing: 0.05em;
          font-family: var(--font-serif, Georgia, serif);
        }

        .about-step-title {
          font-size: clamp(1.05rem, 1.35vw, 1.35rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #111111;
          margin: 0;
          line-height: 1.2;
          font-family: var(--font-sans);
          word-break: keep-all;
        }

        .about-step-desc {
          font-size: 0.75rem;
          line-height: 1.55;
          color: #555555;
          margin: 0;
          font-family: var(--font-sans);
        }

        /* ── 2-COLUMN NEWSLETTER SECTION ── */
        .about-newsletter-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.2rem;
          align-items: stretch;
          margin-bottom: 3.5rem;
        }

        .about-nl-card {
          background: #8C2A0F;
          color: #FFFFFF;
          border-radius: 14px;
          padding: 1.6rem 1.8rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(140, 42, 15, 0.18);
          box-sizing: border-box;
        }

        /* ── FLUSH TERRACOTTA RED FOOTER BAR ── */
        .about-terracotta-footer {
          background: #8C2A0F;
          color: #FFFFFF;
          padding: 2.5rem 4rem;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1.2fr 1.1fr;
          gap: 1.8rem;
          margin-left: -4rem;
          margin-right: -4rem;
          margin-bottom: 0;
          width: calc(100% + 8rem);
          box-sizing: border-box;
        }

        /* ─────────────────────────────────────────────────
           PREMIUM MOBILE LAYOUT FOR /about PAGE
           ───────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .about-root {
            flex-direction: column;
            margin-left: 0;
            width: 100%;
            min-height: 100dvh;
          }

          .about-left-col {
            position: relative;
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            min-width: unset;
            height: 55vw;
            min-height: 240px;
            max-height: 340px;
            flex-shrink: 0;
          }

          .about-ig-grid {
            width: 100% !important;
          }

          .about-right-col {
            padding: 1.75rem 1.25rem 4rem;
            height: auto;
            overflow-y: visible;
          }

          /* Section header rows */
          .about-step-row {
            grid-template-columns: 46px 1fr;
            gap: 0.85rem;
          }

          .about-step-desc {
            grid-column: 2;
            margin-top: 0.35rem;
          }

          /* Newsletter stays single-column */
          .about-newsletter-wrap {
            grid-template-columns: 1fr;
          }

          /* Terracotta footer adjusts */
          .about-terracotta-footer {
            grid-template-columns: 1fr 1fr;
            padding: 1.75rem 1.25rem;
            margin-left: -1.25rem;
            margin-right: -1.25rem;
            width: calc(100% + 2.5rem);
          }

          /* Profile hero card stacks nicely */
          .about-profile-hero-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.35rem 1.25rem;
            gap: 1rem;
          }

          .about-hero-name {
            font-size: 1.25rem !important;
          }

          /* Grid cards go single column */
          .about-grid-cards {
            grid-template-columns: 1fr !important;
          }

          /* Works grid stays full width */
          .about-works-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 430px) {
          .about-left-col {
            height: 52vw;
          }

          .about-right-col {
            padding: 1.5rem 1rem 4rem;
          }

          .about-terracotta-footer {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>

      {/* ── LEFT COLUMN: STICKY 3x3 B&W INSTAGRAM GRID (WIDER: 400px - 500px, FULL HEIGHT) ── */}
      <div className="about-left-col">
        <div className="about-ig-grid">
          {Array.from({ length: 9 }).map((_, idx) => {
            const imgSrc = displayImages[idx % displayImages.length];
            return (
              <div key={idx} className="about-ig-cell">
                <img src={imgSrc} alt={`Moment ${idx + 1}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT COLUMN: EDITORIAL SHOWCASE ── */}
      <div className="about-right-col">
        {/* TOP LABEL */}
        <span className="about-label-header">ABOUT</span>

        {/* NOVEL DROP CAP BIO STATEMENT (EXACT USER CONTENT, ENHANCED TYPOGRAPHY) */}
        <p className="novel-paragraph">
          <span className="novel-drop-cap">I</span>&apos;m Ivan—a <span className="serif-italic">Full-Stack Web Engineer</span> &amp; <span className="serif-italic">UI/UX Designer</span> based in Jakarta. I craft high-performance web applications, minimal design systems, 3D architectural renders, and tactile physical desk objects.
        </p>

        {/* 01 TO 05 PROJECTS */}
        <div className="about-steps-list">
          {projects.map((item) => (
            <div key={item.num} className="about-step-row">
              <span className="about-step-num">{item.num}</span>
              <h3 className="about-step-title">{item.title}</h3>
              <p className="about-step-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 2-COLUMN PHILOSOPHY & REFLECTIONS SECTION */}
        <div className="about-newsletter-wrap">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.2rem" }}>
            <div>
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888888", display: "block", marginBottom: "0.6rem" }}>
                DESIGN PHILOSOPHY &amp; REFLECTIONS
              </span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 400, fontFamily: "var(--font-serif, Georgia, serif)", lineHeight: 1.35, margin: "0 0 0.8rem 0", color: "#111111" }}>
                “The best software feels weightless—tactile in detail, quiet in presence.”
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#555555", lineHeight: 1.62, margin: "0 0 1.2rem 0", fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic" }}>
                Whether designing digital web apps, machining physical desk accessories, or rendering 3D spatial light, I strive for clarity over complexity. When every distraction is stripped away, only intentional craft remains.
              </p>

              <form onSubmit={handleNewsletterSubmit} style={{ display: "flex", gap: "0.4rem", maxWidth: "360px" }}>
                <input
                  type="email"
                  required
                  placeholder="Join quiet dispatches..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.95rem",
                    fontSize: "0.72rem",
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.18)",
                    background: "#FFFFFF",
                    color: "#111111",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  style={{
                    padding: "0.55rem 1.1rem",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    borderRadius: "20px",
                    border: "none",
                    background: "#8C2A0F",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 16px rgba(140, 42, 15, 0.3)",
                  }}
                >
                  {isSubscribing ? "JOINING..." : subscribed ? "JOINED ✓" : "SUBSCRIBE"}
                </button>
              </form>
              {newsletterMsg && (
                <span style={{ fontSize: "0.64rem", color: "#059669", display: "block", marginTop: "0.4rem", fontWeight: 600 }}>
                  {newsletterMsg}
                </span>
              )}
            </div>
          </div>

          <div className="about-nl-card">
            <div>
              <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", display: "block", marginBottom: "0.4rem" }}>
                LATE NIGHT NOTES
              </span>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.75rem 0", fontFamily: "var(--font-sans)" }}>
                Crafting Across Media
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <div>
                  <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", display: "block" }}>WEB ARCHITECTURE</span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.95)", lineHeight: 1.4 }}>Next.js, Axum microservices &amp; minimal component design systems</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", display: "block" }}>SPATIAL &amp; OBJECTS</span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.95)", lineHeight: 1.4 }}>3D lighting renders, precision desk accessories &amp; physical products</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "0.6rem", marginTop: "0.85rem" }}>
              <span style={{ fontSize: "0.62rem", fontStyle: "italic", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-serif, Georgia, serif)" }}>
                Quiet writing dispatched directly to your inbox.
              </span>
            </div>
          </div>
        </div>

        {/* FLUSH TERRACOTTA RED FOOTER BAR WITH LANGUAGES & SKILLS */}
        <div className="about-terracotta-footer">
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 0.2rem 0", letterSpacing: "0.02em", color: "#FFFFFF", fontFamily: "var(--font-sans)" }}>
              IVAN AFFRIANDI
            </h3>
            <span style={{ fontSize: "0.6rem", fontStyle: "italic", color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-serif, Georgia, serif)" }}>
              Full-Stack Web Engineer &amp; UI/UX Designer
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.35rem" }}>
              LANGUAGES
            </span>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.9)", display: "block", lineHeight: 1.4 }}>
              Bahasa Indonesia (Native)<br />English (Fluent)
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.35rem" }}>
              TECH &amp; SKILLS
            </span>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.9)", display: "block", lineHeight: 1.4 }}>
              Rust · Axum · Next.js<br />React · TypeScript · UI/UX · 3D
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.35rem" }}>
              GET IN TOUCH
            </span>
            <a
              href="mailto:hello@ivanaffriandi.com"
              style={{ fontSize: "0.68rem", color: "#FFFFFF", textDecoration: "underline", display: "block" }}
            >
              hello@ivanaffriandi.com
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.5rem" }}>
              <a href="mailto:hello@ivanaffriandi.com" title="Email" style={{ color: "rgba(255,255,255,0.85)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </a>
              <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: "rgba(255,255,255,0.85)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://x.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ color: "rgba(255,255,255,0.85)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://github.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: "rgba(255,255,255,0.85)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
