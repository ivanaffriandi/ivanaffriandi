"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";


export default function FooterAbout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWeChatOpen, setIsWeChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bioSlide, setBioSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 80); // scroll slightly after height starts expanding so it's perfectly synchronized and smooth!
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isWeChatOpen) setIsWeChatOpen(false);
        else if (isOpen) setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isWeChatOpen]);

  const BIO_SLIDES: Array<{
    label: string;
    text?: string;
    pills?: string[];
    languages?: { name: string; level: string; pct: number }[];
  }> = [
    {
      label: "Introduction",
      text: "Hey, I'm Ivan. I am a designer and developer who builds clean, functional websites. I care deeply about both the technical execution of the code and the visual refinement of the user interface.",
    },
    {
      label: "In My Free Time",
      text: "I love getting lost in a good book, brewing the perfect teapot tea, taking slow intentional walks through the city forest, and spending peaceful evenings crocheting intricate small pieces, hand-weaving creativity and warmth stitch by stitch.",
    },
    {
      label: "Writing",
      pills: ["Design Notes", "Minimal Living", "Daily Reflections", "Slow Essays", "Observations"],
    },
    {
      label: "Languages",
      languages: [
        { name: "Indonesian", level: "Native",         pct: 100 },
        { name: "English",    level: "Fluent",          pct: 92  },
        { name: "Dutch",      level: "Fluent",          pct: 85  },
        { name: "Arabic",     level: "Conversational",  pct: 55  },
        { name: "Hebrew",     level: "Basic",           pct: 38  },
        { name: "Chinese",    level: "Basic",           pct: 22  },
      ],
    },
  ];

  const SKILL_GROUPS = [
    {
      label: "Works",
      isWorks: true,
      items: [
        { name: "SHŪ / EN Studio", url: "https://shuenstudio.com" },
        { name: "KVR Objects", url: "https://kvr-objects.com" },
        { name: "Full-Stack Consulting", url: null },
        { name: "Digital Product Design", url: null },
      ],
    },
    {
      label: "Design",
      tags: ["UI/UX Design", "Figma", "Typography", "Design Systems", "Motion & Animation", "Brand Identity", "Prototyping", "Design Engineering", "Print & Packaging", "Spatial Design"],
    },
    {
      label: "Frontend",
      tags: ["React & Next.js", "TypeScript", "HTML5 & Semantic CSS", "Tailwind CSS", "Framer Motion", "WebGL / Three.js", "CSS Modules", "Responsive Web", "State Management", "Performance Optimization"],
    },
    {
      label: "Backend",
      tags: ["Node.js & Express", "Go / Python", "Firebase Firestore & RTDB", "RESTful APIs", "GraphQL", "PostgreSQL / Prisma", "Sanity / Headless CMS", "Serverless Functions", "Caching & Redis", "System Design"],
    },
    {
      label: "Tooling",
      tags: ["Git & GitHub", "Docker & Kubernetes", "Vite & Turbopack", "ESLint & Prettier", "CI/CD Actions", "Vercel / AWS", "Webpack & Babel", "Testing (Jest/Playwright)", "Shell Scripting", "Core Web Vitals"],
    },
  ];

  const prevBio = () => setBioSlide((s) => (s - 1 + BIO_SLIDES.length) % BIO_SLIDES.length);
  const nextBio = () => setBioSlide((s) => (s + 1) % BIO_SLIDES.length);
  const prevTab = () => setActiveTab((t) => (t - 1 + SKILL_GROUPS.length) % SKILL_GROUPS.length);
  const nextTab = () => setActiveTab((t) => (t + 1) % SKILL_GROUPS.length);

  const CSS = `
    .fa-panel {
      width: 100%;
      background: var(--bg-color);
      border-top: none;
      padding: 0.4rem 4vw 0.8rem;
      --fa-card-bg: rgba(128,128,128,0.04);
      --fa-card-border: rgba(128,128,128,0.1);
      --fa-card-shadow:
        -5px -5px 14px rgba(255,255,255,0.7),
        5px 5px 14px rgba(160,175,190,0.18),
        0 10px 24px -10px rgba(0,0,0,0.03);
      --fa-card-shadow-hover:
        -7px -7px 18px rgba(255,255,255,0.85),
        7px 7px 18px rgba(160,175,190,0.28),
        0 18px 36px -12px rgba(0,0,0,0.07);
    }
    @media (prefers-color-scheme: dark) {
      .fa-panel {
        --fa-card-bg: rgba(255,255,255,0.03);
        --fa-card-border: rgba(255,255,255,0.07);
        --fa-card-shadow:
          -4px -4px 12px rgba(255,255,255,0.025),
          4px 4px 12px rgba(0,0,0,0.45),
          0 12px 32px -8px rgba(0,0,0,0.55);
        --fa-card-shadow-hover:
          -6px -6px 16px rgba(255,255,255,0.04),
          6px 6px 16px rgba(0,0,0,0.6),
          0 20px 42px -12px rgba(0,0,0,0.75);
      }
    }
    .fa-wrap {
      max-width: 640px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-family: var(--font-sans);
    }
    .fa-card, .fa-carousel-card {
      background: var(--fa-card-bg);
      border: 1px solid var(--fa-card-border);
      border-radius: 18px;
      box-shadow: var(--fa-card-shadow);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      overflow: hidden;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }
    .fa-card:hover { transform: translateY(-1px); box-shadow: var(--fa-card-shadow-hover); }

    /* Profile */
    .fa-profile-card { display: flex; align-items: center; gap: 0.5rem; padding: 6px 10px; }
    .fa-avatar {
      width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
      border: 1px solid var(--border-color); flex-shrink: 0;
      transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    .fa-avatar:hover { transform: scale(1.06) rotate(2deg); }
    .fa-avatar img {
      width: 100%; height: 100%; object-fit: cover;
      pointer-events: none; user-select: none;
      filter: grayscale(100%); transition: filter 0.3s ease;
    }
    .fa-avatar:hover img { filter: grayscale(0%); }
    .fa-profile-info { flex: 1; min-width: 0; }
    .fa-name { font-size: 0.92rem; font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary); margin: 0 0 1px; }
    .fa-role { font-size: 0.7rem; font-weight: 500; color: var(--text-secondary); }
    .fa-actions { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }

    /* WeChat pill */
    .fa-btn-wechat {
      padding: 0 11px; height: 28px; border-radius: 30px;
      background: var(--text-primary); color: var(--bg-color);
      border: 1px solid var(--text-primary);
      font-size: 0.68rem; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
      transition: all 0.22s ease; white-space: nowrap;
    }
    .fa-btn-wechat:hover, .fa-btn-wechat.active {
      background: #07c160; border-color: #07c160; color: #fff; transform: translateY(-1px);
    }
    /* Circular icon buttons */
    .fa-btn-icon {
      width: 28px; height: 28px; border-radius: 50%;
      background: transparent; color: var(--text-primary);
      border: 1px solid var(--border-color);
      display: inline-flex; align-items: center; justify-content: center;
      text-decoration: none; transition: all 0.2s ease; flex-shrink: 0; cursor: pointer;
    }
    .fa-btn-icon:hover { border-color: var(--text-primary); transform: translateY(-1px); }

    /* Carousel card shared header */
    .fa-car-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px 0;
    }
    .fa-car-label {
      font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-secondary);
    }
    .fa-car-nav { display: flex; align-items: center; gap: 5px; }
    .fa-nav-dots { display: flex; gap: 3.5px; align-items: center; }
    .fa-nav-dot {
      width: 3.5px; height: 3.5px; border-radius: 50%;
      background: var(--border-color); cursor: pointer; transition: all 0.24s ease;
    }
    .fa-nav-dot.on { background: var(--text-primary); transform: scale(1.3); }
    .fa-arr {
      width: 22px; height: 22px; border-radius: 50%;
      border: 1px solid var(--border-color); background: transparent;
      color: var(--text-primary);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.18s ease; flex-shrink: 0;
    }
    .fa-arr:hover { border-color: var(--text-primary); }

    /* Bio carousel body */
    .fa-bio-body { padding: 2px 10px 6px; min-height: 38px; }
    .fa-bio-text { font-size: 0.8rem; line-height: 1.4; color: var(--text-primary); margin: 0; font-weight: 400; }

    /* Skill / bio pills */
    .fa-pills { display: flex; flex-wrap: wrap; gap: 4px; }
    .fa-pill {
      font-size: 0.65rem; font-weight: 500;
      padding: 2.5px 7px; border-radius: 30px;
      border: 1px solid var(--fa-card-border);
      color: var(--text-secondary);
      background: rgba(128,128,128,0.045);
      letter-spacing: -0.01em; transition: all 0.18s ease;
    }
    .fa-pill:hover { color: var(--text-primary); border-color: var(--text-primary); }
    .fa-bio-pill { font-size: 0.7rem; padding: 3.5px 9px; cursor: default; }
    .fa-bio-pill:hover { color: var(--text-secondary); border-color: var(--fa-card-border); }
    .fa-pill-link {
      text-decoration: none; display: inline-flex; align-items: center; gap: 3px; cursor: pointer;
    }
    .fa-pill-link:hover {
      background: var(--text-primary) !important;
      color: var(--bg-color) !important;
      border-color: var(--text-primary) !important;
    }

    /* Skill carousel body */
    .fa-skill-body { padding: 4px 10px 6px; min-height: auto; }

    /* Language pills with clean percentage badges */
    .fa-lang-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: default;
    }
    .fa-lang-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    .fa-lang-pct {
      font-size: 0.62rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: rgba(128,128,128,0.08);
      padding: 1.5px 5px;
      border-radius: 6px;
      letter-spacing: 0.02em;
    }

    /* WeChat Modal — minimal frameless redesign */
    .fa-qr-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 1.5rem;
    }
    .fa-qr-close-float {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.2s, transform 0.2s; backdrop-filter: blur(8px);
      flex-shrink: 0;
    }
    .fa-qr-close-float:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
    .fa-qr-card {
      width: min(280px, 80vw);
      height: min(280px, 80vw);
      border-radius: 28px;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
      position: relative;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .fa-qr-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
      user-select: none;
    }

    @media (prefers-color-scheme: dark) {
      .fa-qr-card {
        background: #ffffff;
        border-color: rgba(255,255,255,0.15);
        box-shadow: 0 24px 64px rgba(0,0,0,0.7);
      }
    }

    @media (max-width: 600px) {
      .fa-wrap { gap: 0.875rem; }
      .fa-profile-card { flex-wrap: wrap; }
      .fa-actions { width: 100%; }
      .fa-btn-wechat { flex: 1; justify-content: center; }
    }
    #footer-about-toggle {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-weight: 500;
      cursor: pointer;
      padding: 3px 8px;
      background-color: rgba(128,128,128,0.07);
      border-radius: 30px;
      font-family: var(--font-sans);
      font-size: 0.65rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }
    #footer-about-toggle.open {
      background-color: rgba(128,128,128,0.15);
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <motion.button
        id="footer-about-toggle"
        className={isOpen ? "open" : ""}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03, opacity: 0.85 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        About
        <motion.svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>

      {mounted && typeof window !== "undefined" && document.body && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={panelRef}
              key="fa-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden", width: "100%" }}
            >
              <div className="fa-panel">
                <div className="fa-wrap">

                  {/* Profile */}
                  <div className="fa-card fa-profile-card">
                    <div className="fa-avatar">
                      <img
                        src="/profile.jpg?v=2"
                        alt="Ivan Affriandi"
                        draggable={false}
                        onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Ivan+A&background=random"; }}
                      />
                    </div>
                    <div className="fa-profile-info">
                      <h4 className="fa-name">Ivan Affriandi</h4>
                      <p className="fa-role">Full-Stack Developer &amp; Designer</p>
                    </div>
                    <div className="fa-actions">
                      <button onClick={() => setIsWeChatOpen(true)} className={`fa-btn-wechat${isWeChatOpen ? " active" : ""}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8.22 2c-4.14 0-7.5 3.03-7.5 6.78 0 2.2 1.15 4.14 2.92 5.37l-.76 2.28 2.59-1.29c.86.25 1.78.39 2.75.39.29 0 .58-.02.87-.04-.26-.87-.41-1.78-.41-2.73 0-4.04 3.51-7.32 7.84-7.32.74 0 1.45.1 2.14.28C17.29 3.86 13.16 2 8.22 2zm-2.81 4.5c.62 0 1.13.5 1.13 1.13S6.03 8.75 5.41 8.75s-1.12-.5-1.12-1.12.5-1.13 1.12-1.13zm5.63 0c.62 0 1.12.5 1.12 1.13s-.5 1.12-1.12 1.12-1.13-.5-1.13-1.12.5-1.13 1.13-1.13zM16.12 9.5c-3.6 0-6.52 2.64-6.52 5.9 0 3.26 2.92 5.9 6.52 5.9.84 0 1.64-.12 2.39-.34l2.25 1.13-.66-1.98C22.17 19.04 23 17.36 23 15.4c0-3.26-2.92-5.9-6.88-5.9zm-2.06 3.94c.48 0 .88.4.88.88s-.4.88-.88.88-.88-.4-.88-.88.4-.88.88-.88zm4.13 0c.48 0 .87.4.87.88s-.39.88-.87.88c-.49 0-.88-.4-.88-.88s.4-.88.88-.88z"/>
                        </svg>
                        WeChat
                      </button>
                      <a href="mailto:hello@ivanaffriandi.com" className="fa-btn-icon" title="Email">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                      </a>
                      <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="fa-btn-icon" title="Instagram">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                        </svg>
                      </a>
                      <a href="https://x.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="fa-btn-icon" title="X">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772"/>
                        </svg>
                      </a>
                      <a href="https://weibo.com/u/7915776414" target="_blank" rel="noopener noreferrer" className="fa-btn-icon" title="Weibo">
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M10.878 1.093a4.23 4.23 0 0 1 4.031 1.305 4.22 4.22 0 0 1 .886 4.14v.001a.612.612 0 0 1-1.166-.377 3.01 3.01 0 0 0-3.495-3.873.611.611 0 1 1-.256-1.196M3.753 9.465c.548-1.11 1.972-1.74 3.233-1.411 1.304.338 1.971 1.568 1.437 2.764-.541 1.221-2.095 1.875-3.416 1.449-1.271-.411-1.812-1.67-1.254-2.802m2.658.567c.16.066.365-.009.458-.168.088-.16.03-.34-.129-.397-.156-.062-.353.013-.446.168-.09.154-.041.333.117.397m-1.607 1.314c.413.188.963.009 1.219-.4.252-.413.12-.883-.296-1.062-.41-.172-.94.005-1.194.402-.256.4-.135.874.271 1.06"/>
                          <path d="m12.014 7.238.005.001c.919.285 1.941.974 1.939 2.188 0 2.007-2.895 4.535-7.246 4.535C3.393 13.962 0 12.352 0 9.708c0-1.385.876-2.985 2.384-4.493C4.4 3.199 6.751 2.28 7.634 3.165c.39.392.427 1.065.177 1.87-.132.405.38.182.38.182 1.63-.682 3.051-.722 3.57.02.278.397.252.951-.004 1.594-.116.293.035.34.257.407m-10.4 3.101c.172 1.738 2.46 2.936 5.109 2.674 2.647-.26 4.656-1.883 4.482-3.623-.17-1.738-2.458-2.937-5.107-2.674-2.647.263-4.656 1.883-4.484 3.623m11.681-6.484a2.06 2.06 0 0 0-1.962-.634.526.526 0 1 0 .219 1.031 1.008 1.008 0 0 1 1.17 1.296.528.528 0 0 0 1.005.325 2.06 2.06 0 0 0-.432-2.018"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Bio Carousel */}
                  <div className="fa-carousel-card">
                    <div className="fa-car-header">
                      <span className="fa-car-label">{BIO_SLIDES[bioSlide].label}</span>
                      <div className="fa-car-nav">
                        <div className="fa-nav-dots">
                          {BIO_SLIDES.map((_, i) => (
                            <div key={i} className={`fa-nav-dot${bioSlide === i ? " on" : ""}`} onClick={() => setBioSlide(i)} />
                          ))}
                        </div>
                        <button className="fa-arr" onClick={prevBio}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                        <button className="fa-arr" onClick={nextBio}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                      </div>
                    </div>
                    <div className="fa-bio-body">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={bioSlide}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.16 }}
                        >
                          {BIO_SLIDES[bioSlide].languages ? (
                            <div className="fa-pills">
                              {BIO_SLIDES[bioSlide].languages!.map((lang) => (
                                <div key={lang.name} className="fa-pill fa-lang-pill">
                                  <span className="fa-lang-name">{lang.name}</span>
                                  <span className="fa-lang-pct">{lang.pct}%</span>
                                </div>
                              ))}
                            </div>
                          ) : BIO_SLIDES[bioSlide].pills ? (
                            <div className="fa-pills">
                              {BIO_SLIDES[bioSlide].pills!.map((p) => (
                                <span key={p} className="fa-pill fa-bio-pill">{p}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="fa-bio-text">{BIO_SLIDES[bioSlide].text}</p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Skills Carousel */}
                  <div className="fa-carousel-card">
                    <div className="fa-car-header">
                      <span className="fa-car-label">{SKILL_GROUPS[activeTab].label}</span>
                      <div className="fa-car-nav">
                        <div className="fa-nav-dots">
                          {SKILL_GROUPS.map((_, i) => (
                            <div key={i} className={`fa-nav-dot${activeTab === i ? " on" : ""}`} onClick={() => setActiveTab(i)} />
                          ))}
                        </div>
                        <button className="fa-arr" onClick={prevTab}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                        <button className="fa-arr" onClick={nextTab}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                      </div>
                    </div>
                    <div className="fa-skill-body">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.16 }}
                        >
                          <div className="fa-pills">
                            {SKILL_GROUPS[activeTab].isWorks && SKILL_GROUPS[activeTab].items ? (
                              SKILL_GROUPS[activeTab].items!.map((item) =>
                                item.url ? (
                                  <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer" className="fa-pill fa-pill-link">
                                    {item.name}
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10M7 17L17 7"/></svg>
                                  </a>
                                ) : (
                                  <span key={item.name} className="fa-pill">{item.name}</span>
                                )
                              )
                            ) : (
                              SKILL_GROUPS[activeTab].tags?.map((t) => (
                                <span key={t} className="fa-pill">{t}</span>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                </div>

                {/* WeChat QR Modal */}
                <AnimatePresence>
                  {isWeChatOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fa-qr-backdrop"
                      onClick={() => setIsWeChatOpen(false)}
                    >
                      {/* Floating close button — outside the card */}
                      <motion.button
                        className="fa-qr-close-float"
                        onClick={() => setIsWeChatOpen(false)}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </motion.button>

                      {/* QR card — only the code, no header/footer */}
                      <motion.div
                        className="fa-qr-card"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src="/wechat_qr.png"
                          alt="WeChat QR"
                          className="fa-qr-image"
                          draggable={false}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
