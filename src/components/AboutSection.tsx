"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutSection() {
  const { t, lang } = useLanguage();
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

  const getAboutData = () => {
    if (lang === "ar") {
      return {
        archiveNo: "الأرشيف الشخصي // رقم ٠٠١",
        archiveSub: "المحفظة الإبداعية واليوميات",
        quote: "\"العمل عند الحدود الهشة بين الدقة الهيكلية الصارمة والجمال البطيء والملموس لعيوب الـوابي-سابي.\"",
        table: [
          { label: "الدور", val: "مصمم UI/UX ومهندس برمجيات متكامل" },
          { label: "الموقع", val: "جاكرتا، إندونيسيا (٦.٢٠٨٨° جنوباً، ١٠٦.٨٤٥٦° شرقاً)" },
          { label: "البريد الإلكتروني", val: "hello@ivanaffriandi.com", link: "mailto:hello@ivanaffriandi.com" },
          { label: "إنستغرام", val: "@ivanaffriandi", link: "https://instagram.com/ivanaffriandi" },
          { label: "تويتر", val: "@ivanaffriandi", link: "https://x.com/ivanaffriandi" },
          { label: "ويبو", val: "@ivanaffriandi", link: "https://weibo.com/u/7915776414" },
        ],
        principlesTitle: "مبادئ التصميم",
        principles: [
          "أنظمة شبكية صارمة وعملية",
          "ملمس تناظري في المساحات الرقمية",
          "مساحة سلبية بنمط وابي-سابي وتجربة مستخدم بطيئة",
        ],
        obsessionsTitle: "اهتمامات حالية",
        obsessions: [
          "الكروشيه والأشغال اليدوية البطيئة",
          "التدوين والتأملات اليومية",
          "طقوس إعداد الشاي والصباحات البطيئة",
          "علم الفطريات والبحث عنها في الغابات البرية",
          "التصوير التناظري الماكرو (فوجي فيلم)",
        ],
        bio: "إيفان أفرياندي مصمم UI/UX ومهندس برمجيات متكامل مقيم في جاكرتا، يصنع واجهات دقيقة وتجارب رقمية هادئة وأنظمة ويب متجاوبة.",
      };
    }
    if (lang === "zh") {
      return {
        archiveNo: "个人档案 // No. 001",
        archiveSub: "创意作品集与日记",
        quote: "\"在严苛的结构精准与侘寂残缺之美那缓慢而温润的质感之间，探索那脆弱的分界线。\"",
        table: [
          { label: "角色", val: "UI/UX 设计师与全栈工程师" },
          { label: "位置", val: "雅加达，印尼 (6.2088° S, 106.8456° E)" },
          { label: "电子邮件", val: "hello@ivanaffriandi.com", link: "mailto:hello@ivanaffriandi.com" },
          { label: "Instagram", val: "@ivanaffriandi", link: "https://instagram.com/ivanaffriandi" },
          { label: "Twitter", val: "@ivanaffriandi", link: "https://x.com/ivanaffriandi" },
          { label: "微博", val: "@ivanaffriandi", link: "https://weibo.com/u/7915776414" },
        ],
        principlesTitle: "设计原则",
        principles: [
          "严谨且实用的网格系统",
          "数字空间中的模拟触感",
          "侘寂留白与慢调用户体验",
        ],
        obsessionsTitle: "当前迷恋",
        obsessions: [
          "编织与慢调手工",
          "日记与每日反思",
          "茶道仪式与慢调清晨",
          "真菌学与野外森林采摘",
          "微距胶片摄影 (富士胶片)",
        ],
        bio: "胡宇轩伊万是一位居于雅加达的创意开发者、数字档案师和设计师，专注于构建沉浸式叙事空间、响应式网格系统和缓慢的数字作品。",
      };
    }
    if (lang === "nl") {
      return {
        archiveNo: "Persoonlijk Archief // Nr. 001",
        archiveSub: "Creatieve Portfolio & Dagboek",
        quote: "\"Opererend op de fragiele grens tussen strakke structurele precisie en de trage, tactiele schoonheid van wabi-sabi imperfectie.\"",
        table: [
          { label: "Rol", val: "UI/UX Designer & Full-Stack Engineer" },
          { label: "Locatie", val: "Jakarta, ID (6.2088° S, 106.8456° E)" },
          { label: "E-mail", val: "hello@ivanaffriandi.com", link: "mailto:hello@ivanaffriandi.com" },
          { label: "Instagram", val: "@ivanaffriandi", link: "https://instagram.com/ivanaffriandi" },
          { label: "Twitter", val: "@ivanaffriandi", link: "https://x.com/ivanaffriandi" },
          { label: "Weibo", val: "@ivanaffriandi", link: "https://weibo.com/u/7915776414" },
        ],
        principlesTitle: "Ontwerpprincipes",
        principles: [
          "Strakke, Functionele Rastersystemen",
          "Analoge Tactiliteit in Digitale Ruimtes",
          "Wabi-Sabi Negatieve Ruimte & Trage UX",
        ],
        obsessionsTitle: "Huidige obsessies",
        obsessions: [
          "Haken & Trage Handarbeid",
          "Dagboek & Dagelijkse Reflecties",
          "Theeceremonies & Trage Ochtenden",
          "Mycologie & Wild Plukken in het Bos",
          "Macro Analoge Fotografie (Fujifilm)",
        ],
        bio: "Ivan Affriandi is een Jakarta-gebaseerde creatieve ontwikkelaar, digitaal archivaris en ontwerper die meeslepende narratieve ruimtes, responsieve rastersystemen en langzame digitale artefacten maakt.",
      };
    }
    // Default: en
    return {
      archiveNo: "Personal Archive // No. 001",
      archiveSub: "Creative Portfolio & Journal",
      quote: "\"Operating at the fragile boundary between stark structural precision and the slow, tactile beauty of wabi-sabi imperfection.\"",
      table: [
        { label: "Role", val: "UI/UX Designer & Full-Stack Engineer" },
        { label: "Location", val: "Jakarta, ID (6.2088° S, 106.8456° E)" },
        { label: "Email", val: "hello@ivanaffriandi.com", link: "mailto:hello@ivanaffriandi.com" },
        { label: "Instagram", val: "@ivanaffriandi", link: "https://instagram.com/ivanaffriandi" },
        { label: "Twitter", val: "@ivanaffriandi", link: "https://x.com/ivanaffriandi" },
        { label: "Weibo", val: "@ivanaffriandi", link: "https://weibo.com/u/7915776414" },
      ],
      principlesTitle: "Design Principles",
      principles: [
        "Stark, Functional Grid Systems",
        "Analog Tactility in Digital Spaces",
        "Wabi-Sabi Negative Space & Slow UX",
      ],
      obsessionsTitle: "Current Obsessions",
      obsessions: [
        "Crochet & Slow Handcraft",
        "Journaling & Daily Reflections",
        "Teapot Tea Rituals & Slow Mornings",
        "Mycology & Wild Forest Foraging",
        "Macro Analog Photography (Fujifilm)",
      ],
      bio: "Ivan Affriandi is a Jakarta-based creative developer, digital archivist, and designer crafting immersive narrative spaces, responsive grid systems, and slow digital artifacts.",
    };
  };

  const aboutData = getAboutData();

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
          {t("name_full")}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
            {isOpen ? t("close") : t("about")}
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
                  <div>{aboutData.archiveNo}</div>
                  <div style={{ opacity: 0.7 }}>{aboutData.archiveSub}</div>
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
                    {aboutData.quote}
                  </p>
                </blockquote>

                <p style={{ fontSize: "1.05rem", fontWeight: "400", lineHeight: "1.6", color: "var(--text-secondary)", margin: 0, maxWidth: "680px" }}>
                  {aboutData.bio}
                </p>

                {/* Clean, Simple Table (No Brackets, Sans-serif) */}
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "680px", borderTop: "1px solid var(--grid-line)", paddingTop: "2rem" }}>
                  {aboutData.table.map((row) => (
                    <div key={row.label} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: "500", flexShrink: 0 }}>{row.label}</span>
                      <div style={{ flexGrow: 1, borderBottom: "1px dotted var(--grid-line)", height: "1px", opacity: 0.5 }} />
                      {row.link ? (
                        <a 
                          href={row.link} 
                          target={row.link.startsWith("mailto") ? undefined : "_blank"} 
                          rel={row.link.startsWith("mailto") ? undefined : "noopener noreferrer"} 
                          style={{ color: "var(--text-primary)", textDecoration: "none", borderBottom: "1px solid var(--text-primary)" }} 
                          className="minimal-link"
                        >
                          {row.val}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-primary)" }}>{row.val}</span>
                      )}
                    </div>
                  ))}
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
                      {aboutData.principlesTitle}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      {aboutData.principles.map((item) => (
                        <li key={item} style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ flex: "1 1 280px" }}>
                    <h4 style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                      {aboutData.obsessionsTitle}
                    </h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      {aboutData.obsessions.map((item) => (
                        <li key={item} style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "rgba(224, 60, 49, 0.75)" }}>•</span> {item}
                        </li>
                      ))}
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
