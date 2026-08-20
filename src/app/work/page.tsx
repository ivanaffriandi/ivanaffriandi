'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'skills';

// Clean Minimal Swiss SVG Icons
const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('9:40 PM (WIB)');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      setLiveTime(`${timeStr} (WIB)`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const row1 = [
    { num: '01', title: 'Next.js 16' },
    { num: '02', title: 'React 19' },
    { num: '03', title: 'TypeScript' },
    { num: '04', title: 'Tailwind CSS' },
    { num: '05', title: 'Framer Motion' },
    { num: '06', title: 'Figma Systems' },
  ];

  const row2 = [
    { num: '07', title: 'Three.js 3D' },
    { num: '08', title: 'WebGL 2.0' },
    { num: '09', title: 'GLSL Shaders' },
    { num: '10', title: '3D Configurator' },
    { num: '11', title: 'Web Audio API' },
    { num: '12', title: 'Blender 3D' },
  ];

  const row3 = [
    { num: '13', title: 'Oracle Cloud VM' },
    { num: '14', title: 'AWS SES Relay' },
    { num: '15', title: 'Docker Compose' },
    { num: '16', title: 'PostgreSQL' },
    { num: '17', title: 'Redis Cache' },
    { num: '18', title: 'Cloudflare SSL' },
  ];

  const row4 = [
    { num: '19', title: 'Italian Leather' },
    { num: '20', title: 'Pattern Drafting' },
    { num: '21', title: 'Saddle Stitching' },
    { num: '22', title: 'Solid 925 Silver' },
    { num: '23', title: 'Edge Burnishing' },
    { num: '24', title: 'Journal Binding' },
  ];

  return (
    <div className={styles.swissViewport}>
      <div className={styles.swissContainer}>
        {/* ── 1. SWISS HEADER: MINIMAL BRAND & GRID META ── */}
        <header className={styles.swissHeader}>
          <div className={styles.headerLeft}>
            <a href="https://ivanaffriandi.com" className={styles.brandTitle}>
              IVAN AFFRIANDI
            </a>
            <span className={styles.headerArchiveCode}>[ ARCHIVE / 2026 ]</span>
          </div>

          <div className={styles.headerRight}>
            <span className={styles.headerClock}>{liveTime}</span>
            <div className={styles.socialIconsRow}>
              <a
                href="https://instagram.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://github.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                title="GitHub"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                href="https://x.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                title="X (Twitter)"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
              <a
                href="mailto:hello@ivanaffriandi.com"
                className={styles.socialIcon}
                title="Email"
                aria-label="Email"
              >
                <MailIcon />
              </a>
            </div>
          </div>
        </header>

        {/* ── 2. HERO STRUCTURE: ARCHITECTURAL 2-COLUMN GRID ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid}>
            {/* Left: Framed Architectural Portrait Cell */}
            <div className={styles.portraitFrameCol}>
              <div className={styles.portraitFrame}>
                <img
                  src="/ivan-head.png"
                  alt="Ivan Affriandi"
                  className={styles.portraitImg}
                />
              </div>
              <div className={styles.portraitCaption}>
                <span className={styles.captionIndex}>FIG. 01</span>
                <span className={styles.captionText}>FOUNDER · STUDIO &amp; LAB</span>
              </div>
            </div>

            {/* Right: Bold Typographic Identity & Statement */}
            <div className={styles.identityCol}>
              <div className={styles.identityHeaderWrap}>
                <span className={styles.identityIndex}>00 / PROFILE</span>
                <h1 className={styles.heroName}>
                  AFFRIANDI, IVAN
                </h1>
              </div>

              <p className={styles.manifestoLead}>
                Software engineer by trade, UI/UX designer by obsession, bespoke leather artisan by night, and wild mushroom forager when I need to get away from screens.
              </p>

              <p className={styles.manifestoSub}>
                I design clean interfaces in Figma, write fast Next.js applications, manage self-hosted server infrastructure, and hand-stitch vegetable-tanned leather goods in my studio in Tangerang.
              </p>
            </div>
          </div>

          {/* ── 3. TECHNICAL SPEC MATRIX (SWISS 4-COLUMN DATA GRID) ── */}
          <div className={styles.specMatrix}>
            <div className={styles.specCell}>
              <span className={styles.specKey}>01 / TIMELINE</span>
              <span className={styles.specValue}>2020 — PRESENT</span>
            </div>

            <div className={styles.specCell}>
              <span className={styles.specKey}>02 / FOCUS</span>
              <span className={styles.specValue}>CODE, PIXELS &amp; LEATHER</span>
            </div>

            <div className={styles.specCell}>
              <span className={styles.specKey}>03 / OUTPUT</span>
              <span className={styles.specValue}>DIGITAL APPS &amp; PHYSICAL GOODS</span>
            </div>

            <div className={styles.specCell}>
              <span className={styles.specKey}>04 / BASE</span>
              <span className={styles.specValue}>TANGERANG, INDONESIA</span>
            </div>
          </div>

          {/* ── 4. SWISS TAB NAVIGATION (LOCKED TABS CANNOT BE OPENED) ── */}
          <nav className={styles.navBar} aria-label="Portfolio Sections">
            <div className={styles.navTrack}>
              {/* 1. ABOUT TAB (ACTIVE & ACCESSIBLE) */}
              <button
                onClick={() => setActiveTab('about')}
                className={`${styles.navTabBtn} ${activeTab === 'about' ? styles.navTabActive : ''}`}
                type="button"
              >
                <span className={styles.tabNum}>01</span>
                <span className={styles.tabName}>ABOUT</span>
                {activeTab === 'about' && (
                  <motion.div
                    layoutId="activeSwissUnderline"
                    className={styles.activeUnderline}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* 2. SKILLS TAB (ACTIVE & ACCESSIBLE) */}
              <button
                onClick={() => setActiveTab('skills')}
                className={`${styles.navTabBtn} ${activeTab === 'skills' ? styles.navTabActive : ''}`}
                type="button"
              >
                <span className={styles.tabNum}>02</span>
                <span className={styles.tabName}>SKILLS</span>
                {activeTab === 'skills' && (
                  <motion.div
                    layoutId="activeSwissUnderline"
                    className={styles.activeUnderline}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* 3. PROJECTS TAB (LOCKED - CANNOT BE OPENED) */}
              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabLocked}`}
                type="button"
                title="Curating case studies · Releasing Q2 2026"
              >
                <span className={styles.tabNum}>03</span>
                <span className={styles.tabName}>PROJECTS</span>
                <span className={styles.lockBadge}>
                  <LockIcon /> SOON
                </span>
              </button>

              {/* 4. PROCESS TAB (LOCKED - CANNOT BE OPENED) */}
              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabLocked}`}
                type="button"
                title="Workflow documentation in progress · Releasing Q2 2026"
              >
                <span className={styles.tabNum}>04</span>
                <span className={styles.tabName}>PROCESS</span>
                <span className={styles.lockBadge}>
                  <LockIcon /> SOON
                </span>
              </button>

              {/* 5. SERVICES & LOG TAB (LOCKED - CANNOT BE OPENED) */}
              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabLocked}`}
                type="button"
                title="Commission slots & studio archive opening soon"
              >
                <span className={styles.tabNum}>05</span>
                <span className={styles.tabName}>SERVICES &amp; LOG</span>
                <span className={styles.lockBadge}>
                  <LockIcon /> SOON
                </span>
              </button>
            </div>
          </nav>
        </section>

        {/* ── 5. ACCESSIBLE CONTENT AREA ── */}
        <main className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {/* ── 1. ABOUT VIEW (SWISS EDITORIAL LAYOUT) ── */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={styles.tabContentBlock}
              >
                {/* SECTION 01: WHO I AM */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 01 / BACKGROUND</span>
                    <h2 className={styles.sectionTitle}>The Strange Mix</h2>
                  </div>

                  <div className={styles.proseGrid}>
                    <p className={styles.proseLead}>
                      Look, I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying. Some days I am deep in VS Code tuning Next.js performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over letter spacing and layout tokens, or hand-stitching a vegetable-tanned leather journal with hot tea getting cold beside me.
                    </p>
                    <p className={styles.proseBody}>
                      I just love building things from scratch. Whether it is a web app with zero dependencies, a private email server I probably didn&apos;t need to self-host, or a leather wallet built to outlive all of us. The contrast between glowing screen pixels and tactile raw leather keeps my brain happy.
                    </p>
                  </div>
                </section>

                {/* SECTION 02: SIX AREAS OF FOCUS */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 02 / DISCIPLINES</span>
                    <h2 className={styles.sectionTitle}>Six Areas of Focus</h2>
                  </div>

                  <div className={styles.swissGrid3}>
                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>01</span>
                        <span className={styles.cardTag}>DESIGN</span>
                      </div>
                      <h3 className={styles.cardTitle}>Product &amp; UI/UX</h3>
                      <p className={styles.cardText}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spacing, hierarchy, and micro-interactions that feel snappy and effortless to use. No cluttered junk.
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Figma Systems</span>
                        <span className={styles.tokenPill}>Typography</span>
                        <span className={styles.tokenPill}>Interaction Design</span>
                      </div>
                    </div>

                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>02</span>
                        <span className={styles.cardTag}>CODE</span>
                      </div>
                      <h3 className={styles.cardTitle}>Software Engineering</h3>
                      <p className={styles.cardText}>
                        Full-stack web applications built with Next.js 16, React 19, and TypeScript. Fast, lightweight code without bloated npm dependencies. If a page takes more than a second to load, it hurts my soul.
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Next.js 16</span>
                        <span className={styles.tokenPill}>React 19</span>
                        <span className={styles.tokenPill}>TypeScript</span>
                      </div>
                    </div>

                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>03</span>
                        <span className={styles.cardTag}>INFRA</span>
                      </div>
                      <h3 className={styles.cardTitle}>Self-Hosted &amp; Freedom</h3>
                      <p className={styles.cardText}>
                        Running my own cloud VMs, configuring private SMTP/DKIM mail servers, and building tools I actually own. The internet is way more fun when you run your own infrastructure.
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Self-Hosted</span>
                        <span className={styles.tokenPill}>Cloud VMs</span>
                        <span className={styles.tokenPill}>Private Mail</span>
                      </div>
                    </div>

                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>04</span>
                        <span className={styles.cardTag}>ATELIER</span>
                      </div>
                      <h3 className={styles.cardTitle}>Bespoke Leathercraft</h3>
                      <p className={styles.cardText}>
                        Handcrafting luxury leather goods through SHŪ / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 sterling silver charms. No machines, just needles and patience.
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Italian Leather</span>
                        <span className={styles.tokenPill}>Saddle Stitch</span>
                        <span className={styles.tokenPill}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>05</span>
                        <span className={styles.cardTag}>EXPERIMENTS</span>
                      </div>
                      <h3 className={styles.cardTitle}>Creative Tech &amp; 3D</h3>
                      <p className={styles.cardText}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built purely because &quot;what if I try to code this tonight?&quot;
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Three.js</span>
                        <span className={styles.tokenPill}>WebGL 2.0</span>
                        <span className={styles.tokenPill}>GLSL Shaders</span>
                      </div>
                    </div>

                    <div className={styles.swissCard}>
                      <div className={styles.cardIndexBar}>
                        <span className={styles.cardNum}>06</span>
                        <span className={styles.cardTag}>VISUALS</span>
                      </div>
                      <h3 className={styles.cardTitle}>Visual Essays &amp; Notes</h3>
                      <p className={styles.cardText}>
                        Documentary snapshots of daily studio work, analog textures, architectural forms, and field notes from quiet mushroom walks out in the wild.
                      </p>
                      <div className={styles.cardFooterTags}>
                        <span className={styles.tokenPill}>Visual Notes</span>
                        <span className={styles.tokenPill}>Analog Textures</span>
                        <span className={styles.tokenPill}>Field Notes</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 03: THE OTHER 50% */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 03 / TACTILE &amp; FIELDWORK</span>
                    <h2 className={styles.sectionTitle}>When I Am Not Staring at Code</h2>
                  </div>

                  <div className={styles.swissGrid3}>
                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>01 / MYCOLOGY</span>
                      <h3 className={styles.hobbyHeading}>Wild Mushrooms &amp; Fungi</h3>
                      <p className={styles.hobbyDesc}>
                        Wandering damp trails with field guides, spotting weird fungi, taking macro photos, and appreciating nature&apos;s wildest procedural geometry.
                      </p>
                    </div>

                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>02 / FIBER</span>
                      <h3 className={styles.hobbyHeading}>Crochet &amp; Fiber Arts</h3>
                      <p className={styles.hobbyDesc}>
                        Yarn, needles, and tension control. Making physical everyday goods with my own hands when typing on a keyboard gets tiring.
                      </p>
                    </div>

                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>03 / RITUAL</span>
                      <h3 className={styles.hobbyHeading}>Hot Tea &amp; Quiet Desks</h3>
                      <p className={styles.hobbyDesc}>
                        Loose-leaf green tea before 8 AM while the city is quiet, sketching out random software ideas in blank paper notebooks.
                      </p>
                    </div>

                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>04 / READING</span>
                      <h3 className={styles.hobbyHeading}>Non-Fiction &amp; Old Books</h3>
                      <p className={styles.hobbyDesc}>
                        Hoarding books on design history, architecture, philosophy, human psychology, and obscure historical rabbit holes on my Kindle.
                      </p>
                    </div>

                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>05 / ARCHIVE</span>
                      <h3 className={styles.hobbyHeading}>Wandering Quiet Museums</h3>
                      <p className={styles.hobbyDesc}>
                        Strolling through empty galleries, inspecting ancient physical artifacts, and geeking out over how craftspeople worked centuries ago.
                      </p>
                    </div>

                    <div className={styles.minimalHobbyCell}>
                      <span className={styles.hobbyIndex}>06 / BOTANY</span>
                      <h3 className={styles.hobbyHeading}>Studio Plants</h3>
                      <p className={styles.hobbyDesc}>
                        Propagating cuttings and watching green foliage quietly take over my studio terrace in Tangerang without any rush.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 04: WORKING PHILOSOPHY */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 04 / PRINCIPLES</span>
                    <h2 className={styles.sectionTitle}>My Rules of Thumb</h2>
                  </div>

                  <div className={styles.philosophyRowGrid}>
                    <div className={styles.philosophyBox}>
                      <span className={styles.ruleNum}>RULE 01</span>
                      <h3 className={styles.ruleTitle}>Build it yourself first.</h3>
                      <p className={styles.ruleText}>
                        If something sounds interesting, I want to take it apart, understand the engine, and build my own version. That is how real learning happens.
                      </p>
                    </div>

                    <div className={styles.philosophyBox}>
                      <span className={styles.ruleNum}>RULE 02</span>
                      <h3 className={styles.ruleTitle}>Cut the noise.</h3>
                      <p className={styles.ruleText}>
                        Good design is about deleting stuff until only what matters remains. If an interface feels dead simple, a lot of hard thinking went into making it that way.
                      </p>
                    </div>

                    <div className={styles.philosophyBox}>
                      <span className={styles.ruleNum}>RULE 03</span>
                      <h3 className={styles.ruleTitle}>Pixels and craft belong together.</h3>
                      <p className={styles.ruleText}>
                        Designing UI makes me a sharper leather artisan, and hand-stitching leather makes me write cleaner code. Cross-pollination keeps work honest.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 05: CURRENT STATUS TABLE */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 05 / STATUS MATRIX</span>
                    <h2 className={styles.sectionTitle}>What Is On My Desk</h2>
                  </div>

                  <div className={styles.statusMatrixGrid}>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>READING</span>
                      <span className={styles.statusVal}>Design history, old essays &amp; sci-fi</span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>MAKING</span>
                      <span className={styles.statusVal}>Next.js web apps &amp; bespoke leather journals</span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>LEARNING</span>
                      <span className={styles.statusVal}>Spanish, Dutch &amp; 3D shader mathematics</span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>EXPLORING</span>
                      <span className={styles.statusVal}>Wild mycology &amp; macro photography</span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>TINKERING</span>
                      <span className={styles.statusVal}>Self-hosted servers &amp; private mail infrastructure</span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusKey}>THINKING</span>
                      <span className={styles.statusVal}>What cool project to hack on next</span>
                    </div>
                  </div>
                </section>

                {/* SECTION 06: HUMAN INDEX (DETAILS) */}
                <section className={styles.contentSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIndex}>SECTION 06 / HUMAN INDEX</span>
                    <h2 className={styles.sectionTitle}>Stuff I Genuinely Love</h2>
                  </div>

                  <div className={styles.tokensWrap}>
                    <span className={styles.swissToken}>01 / CRISP TYPOGRAPHY</span>
                    <span className={styles.swissToken}>02 / QUIET MUSEUMS</span>
                    <span className={styles.swissToken}>03 / FRESH HOT GREEN TEA</span>
                    <span className={styles.swissToken}>04 / VEGETABLE-TANNED PATINA</span>
                    <span className={styles.swissToken}>05 / MONOSPACE FONTS</span>
                    <span className={styles.swissToken}>06 / WILD FOREST MUSHROOMS</span>
                    <span className={styles.swissToken}>07 / ZERO-DEPENDENCY CODE</span>
                    <span className={styles.swissToken}>08 / FAST WEBSITES</span>
                    <span className={styles.swissToken}>09 / DEEP TECH RABBIT HOLES</span>
                    <span className={styles.swissToken}>10 / BLANK NOTEBOOKS</span>
                  </div>
                </section>

                {/* SECTION 07: DIRECT INQUIRY CTA */}
                <div className={styles.inquiryBanner}>
                  <div className={styles.inquiryTextCol}>
                    <span className={styles.inquiryTag}>GET IN TOUCH</span>
                    <h3 className={styles.inquiryTitle}>Got a cool idea or weird project?</h3>
                    <p className={styles.inquiryDesc}>
                      Whether it is a strange technical puzzle, a high-craft interface, or bespoke atelier goods, I am always down to chat about interesting work.
                    </p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com" className={styles.inquiryActionBtn}>
                    SAY HELLO ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 2. SKILLS VIEW (ACCESSIBLE TAB) ── */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={styles.tabContentBlock}
              >
                <div className={styles.skillsPillarGrid}>
                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>01 · FRONTEND</h3>
                    <p className={styles.pillarDesc}>Snappy, beautiful interfaces that feel great to use.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Next.js 16</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> React 19 &amp; TypeScript</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Framer Motion</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Tailwind CSS</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Figma Systems</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>02 · 3D &amp; AUDIO</h3>
                    <p className={styles.pillarDesc}>Interactive WebGL 3D models and procedural sound.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Three.js &amp; WebGL</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> GLSL Shaders</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> 3D Customizers</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Web Audio API</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Blender 3D</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>03 · BACKEND</h3>
                    <p className={styles.pillarDesc}>Fast cloud servers, containers, and secure APIs.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Node.js &amp; Python</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Oracle Cloud &amp; AWS SES</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Docker Compose</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> PostgreSQL &amp; Redis</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Cloudflare SSL</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>04 · ATELIER</h3>
                    <p className={styles.pillarDesc}>Traditional bespoke leather goods crafted by hand.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Italian Leather</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Saddle Stitching</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Solid 925 Silver</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Edge Burnishing</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Pattern Drafting</span>
                    </div>
                  </div>
                </div>

                {/* Kinetic Marquee Stream */}
                <div className={styles.skillsPureTypographyWrapper}>
                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...row1, ...row1, ...row1].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...row2, ...row2, ...row2].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...row3, ...row3, ...row3].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...row4, ...row4, ...row4].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── 6. SWISS FOOTER: REFINED RULE & SIGNATURE ── */}
        <footer className={styles.swissFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.footerCopyright}>
              © {new Date().getFullYear()} AFFRIANDI, IVAN · ALL RIGHTS RESERVED
            </span>
            <span className={styles.footerLocationCode}>[ 6.1783° S, 106.6319° E ]</span>
          </div>

          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.footerAtelierLink}
          >
            VISIT SHŪ / EN ATELIER →
          </a>
        </footer>
      </div>
    </div>
  );
}
