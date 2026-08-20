'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'projects' | 'skills' | 'process' | 'archive';

// Clean Minimal SVG Icons (Borderless, Avant-Garde Style)
const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('8:00 PM (WIB)');

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

  const tabsConfig: { id: TabType; label: string; badge?: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects', badge: 'Soon' },
    { id: 'skills', label: 'Skills' },
    { id: 'process', label: 'Process', badge: 'Soon' },
    { id: 'archive', label: 'Services & Log', badge: 'Soon' },
  ];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.masterPageContainer}>
        {/* ── 1. CLEAN TOP HEADER: BRAND + MINIMAL BARE SOCIALS ── */}
        <header className={styles.topHeaderBar}>
          <div className={styles.headerLeftBrand}>
            <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
              Ivan&apos;s Work<sup>®</sup>
            </a>
            <span className={styles.liveClockBadge}>{liveTime}</span>
          </div>

          <div className={styles.headerRightSocials}>
            <a
              href="https://instagram.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.minimalSocialIcon}
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://github.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.minimalSocialIcon}
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
            <a
              href="https://x.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.minimalSocialIcon}
              title="X (Twitter)"
              aria-label="X (Twitter)"
            >
              <XIcon />
            </a>
            <a
              href="mailto:hello@ivanaffriandi.com"
              className={styles.minimalSocialIcon}
              title="Send an Email"
              aria-label="Email Ivan"
            >
              <MailIcon />
            </a>
          </div>
        </header>

        {/* ── 2. HERO IDENTITY BLOCK: BIGGER PHOTO + PROPORTIONAL NAME + CHILL BIO ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroIdentityRow}>
            <div className={styles.portraitPhotoWrapper}>
              <img
                src="/ivan-head.png"
                alt="Affriandi, Ivan"
                className={styles.heroPortraitImg}
              />
            </div>

            <div className={styles.heroNameAndBioCol}>
              <h1 className={styles.heroNameTitle}>
                <span className={styles.namePart}>Affriandi,</span>
                <span className={styles.namePart}>Ivan</span>
              </h1>
              <p className={styles.heroTaglineParagraph}>
                Software engineer by trade, UI/UX designer by obsession, bespoke leather artisan by night, and wild mushroom forager when I need to get away from screens. I build fast digital tools and stitch real physical goods in my studio.
              </p>
            </div>
          </div>

          {/* ── 3. METADATA INFO STRIP ── */}
          <div className={styles.metaInfoStrip}>
            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Timeline</span>
              <span className={styles.metaValue}>2020 — Whenever</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Focus</span>
              <span className={styles.metaValue}>Code, Pixels &amp; Leather</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Output</span>
              <span className={styles.metaValue}>Digital Apps &amp; Physical Goods</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Base</span>
              <span className={styles.metaValue}>Tangerang, ID</span>
            </div>
          </div>

          {/* ── 4. REPOSITIONED NAVIGATION MENU (UNDER METADATA STRIP) ── */}
          <nav className={styles.repositionedNavBar} aria-label="Portfolio Navigation">
            <div className={styles.navTabsTrack}>
              {tabsConfig.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                    type="button"
                  >
                    <span className={styles.tabLabelText}>{tab.label}</span>
                    {tab.badge && (
                      <span className={`${styles.tabBadgePill} ${isActive ? styles.tabBadgePillActive : ''}`}>
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeUnderlineIndicator"
                        className={styles.activeUnderline}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </section>

        {/* ── 5. TAB VIEW CONTENTS ── */}
        <main className={styles.mainContentArea}>
          <AnimatePresence mode="wait">
            {/* ── 1. ABOUT TAB: ULTRA-CASUAL, RELAXED & WITTY (ZERO EMOJIS) ── */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={styles.editorialTabBlock}
              >
                {/* SECTION 01: WHO I AM */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>01 · WHO I AM</span>
                    <h2 className={styles.sectionTitle}>The Strange Mix</h2>
                  </div>

                  <div className={styles.proseGrid}>
                    <p className={styles.proseParagraph}>
                      Look, I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying. Some days I am deep in VS Code tuning Next.js performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over border radius and letter spacing, or hand-stitching a vegetable-tanned leather journal with hot tea getting cold next to me.
                    </p>
                    <p className={styles.proseParagraph}>
                      I just love building things from scratch. Whether it is a web app with zero dependencies, a private email server I probably didn&apos;t need to self-host, or a leather wallet designed to outlive all of us. The contrast between glowing screen pixels and raw tactile leather is what keeps my brain happy.
                    </p>
                  </div>
                </div>

                {/* SECTION 02: WHAT I DO (6 DISCIPLINE CARDS) */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>02 · WHAT I DO</span>
                    <h2 className={styles.sectionTitle}>The Stuff I Build</h2>
                  </div>

                  <div className={styles.sixCardsGrid}>
                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>01 · DESIGN</span>
                      <h3 className={styles.disciplineTitle}>Product &amp; UI/UX</h3>
                      <p className={styles.disciplineDesc}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spacing, hierarchy, and micro-interactions that feel snappy and effortless to use. No cluttered junk.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Figma Systems</span>
                        <span className={styles.miniPill}>Typography Obsession</span>
                        <span className={styles.miniPill}>Tactile UI</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>02 · CODE</span>
                      <h3 className={styles.disciplineTitle}>Software Engineering</h3>
                      <p className={styles.disciplineDesc}>
                        Full-stack web applications built with Next.js 16, React 19, and TypeScript. Fast, lightweight code without bloated npm packages. If a site takes more than a second to load, it hurts my soul.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Next.js 16</span>
                        <span className={styles.miniPill}>React 19</span>
                        <span className={styles.miniPill}>TypeScript</span>
                        <span className={styles.miniPill}>Clean Code</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>03 · INFRA</span>
                      <h3 className={styles.disciplineTitle}>Self-Hosted &amp; Freedom</h3>
                      <p className={styles.disciplineDesc}>
                        Running my own cloud VMs, configuring private SMTP/DKIM mail servers, and building tools I actually own. The internet is way more fun when you run your own infrastructure.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Self-Hosted</span>
                        <span className={styles.miniPill}>Cloud VMs</span>
                        <span className={styles.miniPill}>Private Mail</span>
                        <span className={styles.miniPill}>No Tracking</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>04 · ATELIER</span>
                      <h3 className={styles.disciplineTitle}>Bespoke Leathercraft</h3>
                      <p className={styles.disciplineDesc}>
                        Handcrafting luxury leather goods through SHŪ / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 sterling silver charms. No machines, just needles and patience.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Italian Leather</span>
                        <span className={styles.miniPill}>Saddle Stitch</span>
                        <span className={styles.miniPill}>Solid 925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>05 · EXPERIMENTS</span>
                      <h3 className={styles.disciplineTitle}>Creative Tech &amp; 3D</h3>
                      <p className={styles.disciplineDesc}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built purely because &quot;what if I try to code this tonight?&quot;
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Three.js</span>
                        <span className={styles.miniPill}>WebGL 2.0</span>
                        <span className={styles.miniPill}>GLSL Shaders</span>
                        <span className={styles.miniPill}>Web Audio</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>06 · VISUALS</span>
                      <h3 className={styles.disciplineTitle}>Visual Essays &amp; Notes</h3>
                      <p className={styles.disciplineDesc}>
                        Documentary snapshots of daily studio work, analog textures, architectural forms, and field notes from quiet mushroom walks out in the wild.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Visual Notes</span>
                        <span className={styles.miniPill}>Analog Textures</span>
                        <span className={styles.miniPill}>Field Notes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 03: THE OTHER 50% */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>03 · THE OTHER 50%</span>
                    <h2 className={styles.sectionTitle}>When I Am Not Staring at Code</h2>
                  </div>

                  <div className={styles.hobbiesGrid}>
                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>01 · Wild Mushrooms &amp; Fungi</h3>
                      <p className={styles.hobbyText}>
                        Wandering damp trails with field guides, spotting weird fungi, taking macro photos, and appreciating nature&apos;s wildest procedural geometry.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>02 · Crochet &amp; Fiber Arts</h3>
                      <p className={styles.hobbyText}>
                        Yarn, needles, and tension control. Making physical everyday goods with my own hands when typing on a keyboard gets tiring.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>03 · Hot Tea &amp; Quiet Desks</h3>
                      <p className={styles.hobbyText}>
                        Loose-leaf green tea before 8 AM while the city is quiet, sketching out random software ideas in blank paper notebooks.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>04 · Non-Fiction &amp; Old Books</h3>
                      <p className={styles.hobbyText}>
                        Hoarding books on design history, architecture, philosophy, human psychology, and obscure historical rabbit holes on my Kindle.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>05 · Wandering Quiet Museums</h3>
                      <p className={styles.hobbyText}>
                        Strolling through empty galleries, inspecting ancient physical artifacts, and geeking out over how craftspeople worked centuries ago.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>06 · Studio Plants</h3>
                      <p className={styles.hobbyText}>
                        Propagating cuttings and watching green foliage quietly take over my studio terrace in Tangerang without any rush.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 04: WORKING PHILOSOPHY */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>04 · WORKING PHILOSOPHY</span>
                    <h2 className={styles.sectionTitle}>My Rules of Thumb</h2>
                  </div>

                  <div className={styles.philosophyGrid}>
                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Build it yourself first.</h3>
                      <p className={styles.philosophyBody}>
                        If something sounds interesting, I want to take it apart, understand the engine, and build my own version. That is how real learning happens.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Cut the noise.</h3>
                      <p className={styles.philosophyBody}>
                        Good design is about deleting stuff until only what matters remains. If an interface feels dead simple, a lot of hard thinking went into making it that way.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Pixels and physical craft belong together.</h3>
                      <p className={styles.philosophyBody}>
                        Designing UI makes me a sharper leather artisan, and hand-stitching leather makes me write cleaner code. Cross-pollination keeps work honest.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 05: CURRENT STATUS BOARD */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>05 · STATUS BOARD</span>
                    <h2 className={styles.sectionTitle}>What Is On My Desk</h2>
                  </div>

                  <div className={styles.currentlyGrid}>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Reading</span>
                      <span className={styles.currentVal}>Design history, old essays &amp; sci-fi</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Making</span>
                      <span className={styles.currentVal}>Next.js web apps &amp; bespoke leather journals</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Learning</span>
                      <span className={styles.currentVal}>Spanish, Dutch &amp; 3D shader mathematics</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Exploring</span>
                      <span className={styles.currentVal}>Wild mycology &amp; macro photography</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Tinkering</span>
                      <span className={styles.currentVal}>Self-hosted servers &amp; private mail infrastructure</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Thinking About</span>
                      <span className={styles.currentVal}>What cool project to hack on next</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 06: SMALL THINGS I LIKE */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>06 · SMALL THINGS I LIKE</span>
                    <h2 className={styles.sectionTitle}>Stuff I Genuinely Love</h2>
                  </div>

                  <div className={styles.likesWrap}>
                    <span className={styles.likePill}>Crisp typography</span>
                    <span className={styles.likePill}>Quiet museums</span>
                    <span className={styles.likePill}>Fresh hot green tea</span>
                    <span className={styles.likePill}>Vegetable-tanned leather patina</span>
                    <span className={styles.likePill}>Monospace fonts</span>
                    <span className={styles.likePill}>Wild forest mushrooms</span>
                    <span className={styles.likePill}>Zero-dependency code</span>
                    <span className={styles.likePill}>Fast loading websites</span>
                    <span className={styles.likePill}>Deep technical rabbit holes</span>
                    <span className={styles.likePill}>Analog blank notebooks</span>
                    <span className={styles.likePill}>Building things just for fun</span>
                  </div>
                </div>

                {/* SECTION 07: CONTACT CTA */}
                <div className={styles.contactBannerWrap}>
                  <div className={styles.contactBannerLeft}>
                    <h3>Got a cool idea or weird project?</h3>
                    <p>Whether it is a strange technical puzzle, a high-craft interface, or bespoke atelier goods, I am always down to chat about interesting work.</p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com" className={styles.contactActionBtn}>
                    Say Hello ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 2. PROJECTS TAB: ULTRA-CASUAL COMING SOON VIEW ── */}
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={styles.comingSoonContainer}
              >
                <div className={styles.comingSoonHeaderBlock}>
                  <div className={styles.comingSoonBadgeRow}>
                    <span className={styles.comingSoonBadge}>01 · UNDER THE HOOD</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Curating Spring 2026</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>Selected Works &amp; Case Studies</h2>
                  <p className={styles.comingSoonSubtitle}>
                    I am currently compiling interactive breakdowns, live 3D demos, and code walk-throughs for my latest builds. Here is a quick sneak peek of what is cooking.
                  </p>
                </div>

                <div className={styles.comingSoonGrid}>
                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>CLOUD INFRA</span>
                      <span className={styles.cardStatusLabel}>Live in Production</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>Private Mail Platform</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Built my own private email server stack on an Oracle Cloud VM with AWS SES relay, automated DKIM keys, and a clean web client. Zero trackers, total data ownership.
                    </p>
                    <div className={styles.comingSoonCardFooter}>
                      <span className={styles.miniPill}>Next.js 16</span>
                      <span className={styles.miniPill}>AWS SES</span>
                      <span className={styles.miniPill}>Docker</span>
                      <span className={styles.miniPill}>Postfix</span>
                    </div>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>WEB AUDIO &amp; APP</span>
                      <span className={styles.cardStatusLabel}>Live at ivanaffriandi.com/x</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>Atmospheric Reader (/x)</h3>
                    <p className={styles.comingSoonCardDesc}>
                      A distraction-free digital reading space featuring real-time procedural sound synthesis, dual theme engines, and buttery spatial page transitions.
                    </p>
                    <div className={styles.comingSoonCardFooter}>
                      <span className={styles.miniPill}>Web Audio API</span>
                      <span className={styles.miniPill}>Framer Motion</span>
                      <span className={styles.miniPill}>Typography</span>
                    </div>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>ATELIER &amp; 3D</span>
                      <span className={styles.cardStatusLabel}>Live at shuenstudio.com</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>SHŪ / EN Atelier &amp; 3D Configurator</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Handcrafted Italian leather journals paired with a custom Three.js 3D WebGL configurator to preview textures and hot foil stamping in real-time.
                    </p>
                    <div className={styles.comingSoonCardFooter}>
                      <span className={styles.miniPill}>Three.js</span>
                      <span className={styles.miniPill}>Italian Leather</span>
                      <span className={styles.miniPill}>Solid 925 Silver</span>
                    </div>
                  </div>
                </div>

                <div className={styles.comingSoonActionRow}>
                  <a
                    href="https://shuenstudio.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.actionBtnSecondary}
                  >
                    Check Out SHŪ / EN ↗
                  </a>
                  <a
                    href="mailto:hello@ivanaffriandi.com?subject=Work%20Inquiry"
                    className={styles.actionBtnPrimary}
                  >
                    Drop Me a Line ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 3. SKILLS TAB: 4 PILLARS & MARQUEE ── */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={styles.skillsSectionWrapper}
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

            {/* ── 4. PROCESS TAB: ULTRA-CASUAL COMING SOON VIEW ── */}
            {activeTab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={styles.comingSoonContainer}
              >
                <div className={styles.comingSoonHeaderBlock}>
                  <div className={styles.comingSoonBadgeRow}>
                    <span className={styles.comingSoonBadge}>02 · HOW THE SAUSAGE GETS MADE</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Workflow Breakdown</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>My Build Workflow</h2>
                  <p className={styles.comingSoonSubtitle}>
                    How I go from a random shower thought to shipped software or a finished leather piece on my desk.
                  </p>
                </div>

                <div className={styles.processComingSoonGrid}>
                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 01</span>
                    <h3 className={styles.processPreviewHeading}>Brainstorm &amp; Figma Systems</h3>
                    <p className={styles.processPreviewText}>
                      Sketching messy ideas, structuring typographic scales, and obsessing over layout tokens before writing a single line of code.
                    </p>
                  </div>

                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 02</span>
                    <h3 className={styles.processPreviewHeading}>Hack, Code &amp; Stitch</h3>
                    <p className={styles.processPreviewText}>
                      Spinning up Next.js 16, testing buttery 60fps Framer Motion interactions, or grabbing the pricking irons and stitching leather.
                    </p>
                  </div>

                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 03</span>
                    <h3 className={styles.processPreviewHeading}>Ship It &amp; Optimize</h3>
                    <p className={styles.processPreviewText}>
                      Dockerize everything, wire up DNS and SSL with Cloudflare, deploy to cloud VMs, and make sure it loads lightning-fast.
                    </p>
                  </div>
                </div>

                <div className={styles.comingSoonActionRow}>
                  <a
                    href="mailto:hello@ivanaffriandi.com?subject=Project%20Workflow%20Chat"
                    className={styles.actionBtnPrimary}
                  >
                    Let&apos;s Build Something Together ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 5. SERVICES & LOG TAB: ULTRA-CASUAL COMING SOON VIEW ── */}
            {activeTab === 'archive' && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={styles.comingSoonContainer}
              >
                <div className={styles.comingSoonHeaderBlock}>
                  <div className={styles.comingSoonBadgeRow}>
                    <span className={styles.comingSoonBadge}>03 · WORK WITH ME</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Open for Projects</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>Services &amp; Project Archive</h2>
                  <p className={styles.comingSoonSubtitle}>
                    I take on selective freelance projects, full-stack consulting, and bespoke atelier commissions when the idea is exciting.
                  </p>
                </div>

                <div className={styles.comingSoonGrid}>
                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>SERVICE 01</span>
                      <span className={styles.cardStatusLabel}>Open for Inquiries</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>Full-Stack Web Engineering</h3>
                    <p className={styles.comingSoonCardDesc}>
                      High-speed Next.js web applications, custom SaaS tools, and fast APIs built with craftsmanship and zero bloat.
                    </p>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>SERVICE 02</span>
                      <span className={styles.cardStatusLabel}>Open for Inquiries</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>UI/UX &amp; Design Systems</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Modern interfaces, clean component systems in Figma, and micro-interactions that make people actually enjoy using your product.
                    </p>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>SERVICE 03</span>
                      <span className={styles.cardStatusLabel}>Open for Inquiries</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>Creative 3D &amp; Custom Atelier</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Interactive WebGL/Three.js 3D configurators, procedural shader effects, or custom bespoke leather goods from SHŪ / EN.
                    </p>
                  </div>
                </div>

                <div className={styles.contactBannerWrap} style={{ marginTop: '24px' }}>
                  <div className={styles.contactBannerLeft}>
                    <h3>Need something built or designed?</h3>
                    <p>Send me a quick note about what you are building, the timeline, and what you need help with.</p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com?subject=Project%20Commission" className={styles.contactActionBtn}>
                    Drop Me an Email ↗
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── 6. FOOTER BAR ── */}
        <footer className={styles.pageFooterBar}>
          <span className={styles.footerCopyrightText}>
            © {new Date().getFullYear()} Affriandi, Ivan · All Rights Reserved
          </span>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.footerAtelierLink}
          >
            Visit SHŪ / EN Atelier →
          </a>
        </footer>
      </div>
    </div>
  );
}
