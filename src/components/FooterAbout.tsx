"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";

/* ─── Social icon SVGs ──────────────────────────────────────────────────── */
function EmailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function WeiboIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M10.878 1.093a4.23 4.23 0 0 1 4.031 1.305 4.225 4.225 0 0 1 .886 4.14v.001a.612.612 0 0 1-1.166-.377 3.01 3.01 0 0 0-3.495-3.873.611.611 0 1 1-.256-1.196Z"/>
      <path fillRule="evenodd" d="M3.753 9.465c.548-1.11 1.972-1.74 3.233-1.411 1.304.338 1.971 1.568 1.437 2.764-.541 1.221-2.095 1.875-3.416 1.449-1.271-.411-1.812-1.67-1.254-2.802Zm2.658.567c.16.066.365-.009.458-.168.088-.16.03-.34-.129-.397-.156-.062-.353.013-.446.168-.09.154-.041.333.117.397Zm-1.607 1.314c.413.188.963.009 1.219-.4.252-.413.12-.883-.296-1.062-.41-.172-.94.005-1.194.402-.256.4-.135.874.271 1.06Z"/>
      <path fillRule="evenodd" d="m12.014 7.238.005.001c.919.285 1.941.974 1.939 2.188 0 2.007-2.895 4.535-7.246 4.535C3.393 13.962 0 12.352 0 9.708c0-1.385.876-2.985 2.384-4.493C4.4 3.199 6.751 2.28 7.634 3.165c.39.392.427 1.065.177 1.87-.132.405.38.182.38.182 1.63-.682 3.051-.722 3.57.02.278.397.252.951-.004 1.594-.116.293.035.34.257.407Zm-10.4 3.101c.172 1.738 2.46 2.936 5.109 2.674 2.647-.26 4.656-1.883 4.482-3.623-.17-1.738-2.458-2.937-5.107-2.674-2.647.263-4.656 1.883-4.484 3.623Z"/>
      <path d="M13.295 3.855a2.056 2.056 0 0 0-1.962-.634.526.526 0 1 0 .219 1.031 1.008 1.008 0 0 1 1.17 1.296.528.528 0 0 0 1.005.325 2.062 2.062 0 0 0-.432-2.018Z"/>
    </svg>
  );
}

/* ─── Arrow button for carousels ────────────────────────────────────────── */
function ArrowBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "var(--bg-secondary, rgba(150,150,150,0.08))",
        border: "1px solid var(--border-color)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", flexShrink: 0,
        color: "var(--text-secondary)",
      }}
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {dir === "prev"
          ? <polyline points="15,18 9,12 15,6" />
          : <polyline points="9,18 15,12 9,6" />}
      </svg>
    </button>
  );
}

/* ─── Card with carousel header ─────────────────────────────────────────── */
interface InfoCardProps {
  labels: string[]; // dynamic labels matching slides
  slides: React.ReactNode[];
}

function InfoCard({ labels, slides }: InfoCardProps) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(total - 1, i + 1));

  return (
    <div style={{
      border: "1px solid var(--accent-color)",
      borderRadius: "8px",
      overflow: "hidden",
      background: "var(--bg-secondary, rgba(150,150,150,0.04))",
      marginBottom: "0.6rem",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.5rem 0.75rem",
        borderBottom: "1px solid var(--border-color)",
      }}>
        {/* Card Header dynamically displays the label for the active slide index */}
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text-primary)", textTransform: "uppercase" }}>
          {labels[idx] || ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {/* Dots */}
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                width: i === idx ? 12 : 4, height: 4,
                borderRadius: 2,
                background: i === idx ? "var(--text-primary)" : "var(--border-color)",
                transition: "all 0.2s ease",
              }} />
            ))}
          </div>
          <ArrowBtn dir="prev" onClick={prev} />
          <ArrowBtn dir="next" onClick={next} />
        </div>
      </div>
      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ padding: "0.65rem 0.75rem" }}
        >
          {slides[idx]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Skill & Work Tags components ───────────────────────────────────────── */
function SkillTag({ text }: { text: string }) {
  const match = text.match(/^(.*?)\s*(\d+%)$/);
  if (match) {
    const [, name, percent] = match;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 8px",
          borderRadius: 20,
          background: "var(--bg-secondary, rgba(150,150,150,0.07))",
          border: "1px solid var(--border-color)",
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {name}
        <span
          style={{
            fontSize: "0.62rem",
            fontWeight: 700,
            background: "rgba(128,128,128,0.18)",
            padding: "1px 5px",
            borderRadius: 8,
            color: "var(--text-secondary)",
          }}
        >
          {percent}
        </span>
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 9px",
        borderRadius: 20,
        background: "var(--bg-secondary, rgba(150,150,150,0.07))",
        border: "1px solid var(--border-color)",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: "var(--text-primary)",
      }}
    >
      {text}
    </span>
  );
}

function WorkTag({ label, link }: { label: string; link?: string }) {
  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "4px 9px",
          borderRadius: 20,
          background: "var(--bg-secondary, rgba(150,150,150,0.07))",
          border: "1px solid var(--border-color)",
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          textDecoration: "none",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--border-color)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg-secondary, rgba(150,150,150,0.07))";
        }}
      >
        {label}
      </a>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 9px",
        borderRadius: 20,
        background: "var(--bg-secondary, rgba(150,150,150,0.07))",
        border: "1px solid var(--border-color)",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: "var(--text-primary)",
      }}
    >
      {label}
    </span>
  );
}

function TagGrid({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
      {tags.map((tag) => (
        <SkillTag key={tag} text={tag} />
      ))}
    </div>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/* ─── Main FooterAbout component ─────────────────────────────────────────── */
export default function FooterAbout() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Brand hovers
  const [emailHover, setEmailHover] = useState(false);
  const [instagramHover, setInstagramHover] = useState(false);
  const [xHover, setXHover] = useState(false);
  const [weiboHover, setWeiboHover] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Lock body scroll when panel open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const close = useCallback(() => setIsOpen(false), []);

  /* ── Multilingual slide-specific titles ── */
  const titles = (() => {
    if (lang === "nl") return {
      bio: "Bio",
      freeTime: "Vrije Tijd",
      writing: "Schrijven",
      languages: "Talen",
      works: "Projecten",
      design: "Ontwerp",
      frontend: "Frontend",
      backend: "Backend",
      tooling: "Tooling",
    };
    if (lang === "ar") return {
      bio: "السيرة الذاتية",
      freeTime: "وقت الفراغ",
      writing: "الكتابة",
      languages: "اللغات",
      works: "المشاريع",
      design: "التصميم",
      frontend: "واجهة أمامية",
      backend: "واجهة خلفية",
      tooling: "الأدوات",
    };
    if (lang === "zh") return {
      bio: "简介",
      freeTime: "消遣",
      writing: "写作",
      languages: "语言",
      works: "作品",
      design: "设计",
      frontend: "前端",
      backend: "后端",
      tooling: "工具",
    };
    return {
      bio: "Bio",
      freeTime: "Free Time",
      writing: "Writing",
      languages: "Languages",
      works: "Works",
      design: "Design",
      frontend: "Frontend",
      backend: "Backend",
      tooling: "Tooling",
    };
  })();

  const content = (() => {
    if (lang === "nl") return {
      subtitle: "SYSTEM METRICS & ARCHIVE",
      intro: "Deze ruimte dient als een digitaal archief en logboek, dat essays en Q&A-berichten in de loop van de tijd bijhoudt.",
      freeTime: "Ik hou ervan om mezelf te verliezen in een goed boek, de perfecte theepot thee te zetten, langzame bewuste wandelingen te maken door het stadsbos, en vredige avonden door te brengen met het haken van ingewikkelde kleine stukjes, waarbij ik creativiteit en warmte steek voor steek handweef.",
    };
    if (lang === "ar") return {
      subtitle: "نظام المقاييس والأرشيف",
      intro: "هذه المساحة تعمل كأرشيف رقمي وسجل يومي، لتتبع المقالات والأسئلة والأجوبة بمرور الوقت.",
      freeTime: "أحب الضياع في كتاب جيد، وتحضير الشاي المثالي، والمشي البطيء والمتعمد في غابة المدينة، وقضاء أمسيات هادئة في حياكة قطع صغيرة معقدة بالكروشيه، لنسج الإبداع والدفء غرزة بغرزة.",
    };
    if (lang === "zh") return {
      subtitle: "系统指标与归档",
      intro: "本空间为一个数字归档和日志，记录随笔与问答。",
      freeTime: "我喜欢沉浸在好书中、冲泡一壶完美的茶、在城市森林中慢步慢走，以及度过宁静的夜晚，用钩针编织精致的小物件，一步一步编织创意与温暖。",
    };
    return {
      subtitle: "SYSTEM METRICS & ARCHIVE",
      intro: "This space serves as a digital archive and logbook, tracking essays, reads, and moments over time.",
      freeTime: "I love getting lost in a good book, brewing the perfect teapot tea, taking slow intentional walks through the city forest, and spending peaceful evenings crocheting intricate small pieces, hand-weaving creativity and warmth stitch by stitch.",
    };
  })();

  const worksList = [
    { label: "SHÜ / EN Studio ↗", link: "https://shuenstudio.com" },
    { label: "KVR Objects ↗", link: "https://kvr-objects.com" },
    { label: "Full-Stack Consulting" },
    { label: "Digital Product Design" },
    { label: "Analog Photography Archive" },
  ];

  /* ─── INTRODUCTION slides ─── */
  const personalSlides = [
    // Slide 1: Bio
    <div key="bio">
      <p style={{ fontSize: "0.78rem", lineHeight: "1.52", color: "var(--text-secondary)", margin: 0 }}>
        {content.intro}
      </p>
    </div>,

    // Slide 2: Free Time
    <div key="free">
      <p style={{ fontSize: "0.78rem", lineHeight: "1.52", color: "var(--text-secondary)", margin: 0 }}>
        {content.freeTime}
      </p>
    </div>,

    // Slide 3: Writing
    <div key="writing">
      <TagGrid tags={["Design Notes", "Minimal Living", "Daily Reflections", "Slow Essays", "Observations"]} />
    </div>,

    // Slide 4: Languages
    <div key="lang">
      <TagGrid tags={["Indonesian 100%", "English 92%", "Dutch 85%", "Arabic 55%", "Hebrew 38%", "Chinese 22%"]} />
    </div>,
  ];

  /* ─── WORKS slides ─── */
  const professionalSlides = [
    // Slide 1: Works
    <div key="works">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {worksList.map((w) => (
          <WorkTag key={w.label} label={w.label} link={w.link} />
        ))}
      </div>
    </div>,

    // Slide 2: Design
    <div key="design">
      <TagGrid tags={["UI/UX Design", "Figma", "Typography", "Design Systems", "Motion & Animation", "Brand Identity", "Prototyping", "Design Engineering", "Print & Packaging", "Spatial Design"]} />
    </div>,

    // Slide 3: Frontend
    <div key="frontend">
      <TagGrid tags={["React & Next.js", "TypeScript", "HTML5 & Semantic CSS", "Tailwind CSS", "Framer Motion", "WebGL / Three.js", "CSS Modules", "Responsive Web", "State Management", "Performance Optimization"]} />
    </div>,

    // Slide 4: Backend
    <div key="backend">
      <TagGrid tags={["Node.js & Express", "Go / Python", "Firebase Firestore & RTDB", "RESTful APIs", "GraphQL", "PostgreSQL / Prisma", "Sanity / Headless CMS", "Serverless Functions", "Caching & Redis", "System Design"]} />
    </div>,

    // Slide 5: Tooling
    <div key="tooling">
      <TagGrid tags={["Git & GitHub", "Docker & Kubernetes", "Vite & Turbopack", "ESLint & Prettier", "CI/CD Actions", "Vercel / AWS", "Webpack & Babel", "Testing (Jest/Playwright)", "Shell Scripting", "Core Web Vitals"]} />
    </div>,
  ];

  return (
    <>
      {/* Trigger button — minimal monospace text link */}
      <button
        id="footer-about-toggle"
        className={isOpen ? "open" : ""}
        onClick={() => setIsOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: isOpen ? "#9b0000" : "var(--text-muted)",
          fontWeight: 700,
          cursor: "pointer",
          padding: "4px 8px",
          fontFamily: "monospace",
          fontSize: "0.58rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#9b0000"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = isOpen ? "#9b0000" : "var(--text-muted)"; }}
      >
        [ ABOUT ]
      </button>

      {/* Portal — fixed bottom sheet */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="fa-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={close}
                style={{
                  position: "fixed", inset: 0, zIndex: 8000,
                  background: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(3px)",
                  WebkitBackdropFilter: "blur(3px)",
                }}
              />

              {/* Bottom sheet panel container */}
              <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 8001,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                pointerEvents: "none",
                padding: "12px",
              }}>
                <motion.div
                  key="fa-panel"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "105%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 38, mass: 0.85 }}
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    maxHeight: "82vh",
                    background: "#070709",
                    borderRadius: "4px",
                    border: "1px solid rgba(155,0,0,0.6)",
                    boxShadow: "0 -12px 60px rgba(155,0,0,0.08), 0 -4px 20px rgba(0,0,0,0.4)",
                    padding: "1.1rem 1.1rem calc(1.3rem + env(safe-area-inset-bottom, 0px))",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    pointerEvents: "auto",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {/* Profile & Close Button row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <img
                        src="/profile.jpg"
                        alt="System"
                        onError={(e) => { e.currentTarget.src = "/nature_hero.png"; }}
                        style={{
                          width: 50, height: 50, borderRadius: "10px",
                          objectFit: "cover", flexShrink: 0,
                          border: "2px solid var(--accent-color)",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                          INDEX INFO
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 1 }}>
                          {content.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Close 'X' Button */}
                    <button
                      onClick={close}
                      title="Close About Panel"
                      style={{
                        background: "var(--bg-secondary, rgba(150,150,150,0.08))",
                        border: "1px solid var(--border-color)",
                        cursor: "pointer",
                        color: "var(--text-primary)",
                        width: 30, height: 30,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--border-color)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-secondary, rgba(150,150,150,0.08))";
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Social buttons row */}
                  <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.85rem", flexWrap: "wrap" }}>
                    {/* Email primary pill */}
                    <a
                      href="mailto:hello@ivanaffriandi.com"
                      title="Email"
                      onMouseEnter={() => setEmailHover(true)}
                      onMouseLeave={() => setEmailHover(false)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 20,
                        background: emailHover ? "var(--accent-color-hover)" : "var(--accent-color)",
                        color: "#FFFFFF",
                        fontSize: "0.72rem", fontWeight: 700, border: "none",
                        cursor: "pointer", flexShrink: 0,
                        transition: "all 0.25s ease",
                        textDecoration: "none",
                      }}
                    >
                      <EmailIcon />
                      Email
                    </a>

                    {/* Instagram Link */}
                    <a
                      href="https://instagram.com/ivanaffriandi"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      onMouseEnter={() => setInstagramHover(true)}
                      onMouseLeave={() => setInstagramHover(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: instagramHover ? "#E1306C" : "var(--bg-secondary, rgba(150,150,150,0.07))",
                        border: "1px solid var(--border-color)",
                        color: instagramHover ? "#fff" : "var(--text-secondary)",
                        textDecoration: "none",
                        flexShrink: 0,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <InstagramIcon />
                    </a>

                    {/* X / Twitter Link */}
                    <a
                      href="https://x.com/ivanaffriandi"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="X / Twitter"
                      onMouseEnter={() => setXHover(true)}
                      onMouseLeave={() => setXHover(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: xHover ? "#1DA1F2" : "var(--bg-secondary, rgba(150,150,150,0.07))",
                        border: "1px solid var(--border-color)",
                        color: xHover ? "#fff" : "var(--text-secondary)",
                        textDecoration: "none",
                        flexShrink: 0,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <XIcon />
                    </a>

                    {/* Weibo Link */}
                    <a
                      href="https://weibo.com/u/7915776414"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Weibo"
                      onMouseEnter={() => setWeiboHover(true)}
                      onMouseLeave={() => setWeiboHover(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: weiboHover ? "#E6162D" : "var(--bg-secondary, rgba(150,150,150,0.07))",
                        border: "1px solid var(--border-color)",
                        color: weiboHover ? "#fff" : "var(--text-secondary)",
                        textDecoration: "none",
                        flexShrink: 0,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <WeiboIcon />
                    </a>
                  </div>

                  {/* Two Main Cards: Introduction and Works (Dynamic headers match slide index!) */}
                  <InfoCard
                    labels={[titles.bio, titles.freeTime, titles.writing, titles.languages]}
                    slides={personalSlides}
                  />
                  <InfoCard
                    labels={[titles.works, titles.design, titles.frontend, titles.backend, titles.tooling]}
                    slides={professionalSlides}
                  />
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
