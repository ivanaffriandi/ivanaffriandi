'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'projects' | 'skills' | 'process' | 'archive';

// Crisp Inline SVG Icons for Top-Right Header
const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('7:45 PM (WIB)');

  // Real-time Indonesian WIB clock ticker
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

  // Pure Typography Stream Rows for Skills Marquee
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
        {/* ── 1. TOP HEADER BAR: BRAND (LEFT) & SOCIALS + EMAIL (RIGHT) ── */}
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
              className={styles.socialIconLink}
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://github.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
            <a
              href="https://x.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="X (Twitter)"
              aria-label="X (Twitter)"
            >
              <XIcon />
            </a>
            <a
              href="mailto:hello@ivanaffriandi.com"
              className={styles.emailIconLink}
              title="Send an Email"
              aria-label="Email Ivan"
            >
              <MailIcon />
              <span className={styles.emailButtonText}>Email</span>
            </a>
          </div>
        </header>

        {/* ── 2. HERO IDENTITY BLOCK: ENLARGED PHOTO + PROPORTIONAL NAME + BIO ── */}
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
                I build digital software, design clean interfaces, craft leather goods, and occasionally disappear into a mushroom field.
              </p>
            </div>
          </div>

          {/* ── 3. METADATA INFO STRIP ── */}
          <div className={styles.metaInfoStrip}>
            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Timeline</span>
              <span className={styles.metaValue}>2020 — Present</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Focus</span>
              <span className={styles.metaValue}>Studio &amp; Lab</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Output</span>
              <span className={styles.metaValue}>Digital &amp; Physical</span>
            </div>

            <div className={styles.metaItemCluster}>
              <span className={styles.metaLabel}>Location</span>
              <span className={styles.metaValue}>Tangerang, ID</span>
            </div>
          </div>

          {/* ── 4. REPOSITIONED NAVIGATION MENU (BELOW METADATA STRIP) ── */}
          <nav className={styles.repositionedNavBar} aria-label="Portfolio Sections">
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
            {/* ── 1. ABOUT TAB: FULL EDITORIAL STUDIO ARCHIVE ── */}
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
                      My work sits somewhere between software engineering, clean UI/UX design, physical leather craftsmanship, and running servers I probably didn&apos;t need to self-host. I am not interested in being boxed into a single corporate identity.
                    </p>
                    <p className={styles.proseParagraph}>
                      I can spend part of my day designing an interface in Figma, another writing Next.js code, and another hand-stitching a trifold leather journal with tea getting cold beside me. That contrast between digital pixels and tactile physical materials is where the fun lives.
                    </p>
                  </div>
                </div>

                {/* SECTION 02: WHAT I DO (6 DISCIPLINE CARDS) */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>02 · WHAT I DO</span>
                    <h2 className={styles.sectionTitle}>Six Areas of Focus</h2>
                  </div>

                  <div className={styles.sixCardsGrid}>
                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>01 · DESIGN</span>
                      <h3 className={styles.disciplineTitle}>Product &amp; UI/UX</h3>
                      <p className={styles.disciplineDesc}>
                        Clean, typography-driven interfaces, Figma design systems, generous whitespace, and obsessing over spacing, hierarchy, and micro-interactions that feel tactile.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Figma Systems</span>
                        <span className={styles.miniPill}>Typography</span>
                        <span className={styles.miniPill}>Interaction Design</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>02 · CODE</span>
                      <h3 className={styles.disciplineTitle}>Software Engineering</h3>
                      <p className={styles.disciplineDesc}>
                        Full-stack web applications built with Next.js 16, React 19, TypeScript, and modern APIs. Fast, lightweight code without bloated dependencies.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Next.js 16</span>
                        <span className={styles.miniPill}>TypeScript</span>
                        <span className={styles.miniPill}>React 19</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>03 · INFRA</span>
                      <h3 className={styles.disciplineTitle}>Digital Independence</h3>
                      <p className={styles.disciplineDesc}>
                        Self-hosted cloud VMs, private email servers (SMTP, Postfix, DKIM), and personal digital tools. The internet as something you build and inhabit, not just consume.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Self-Hosted</span>
                        <span className={styles.miniPill}>Cloud VM</span>
                        <span className={styles.miniPill}>Private Mail</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>04 · ATELIER</span>
                      <h3 className={styles.disciplineTitle}>Physical Craft (SHŪ / EN)</h3>
                      <p className={styles.disciplineDesc}>
                        Bespoke leather journals handcrafted from Italian vegetable-tanned hides, Japanese Moire lining, bookbinding, and solid 925 sterling silver charms.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Italian Leather</span>
                        <span className={styles.miniPill}>Saddle Stitch</span>
                        <span className={styles.miniPill}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>05 · EXPERIMENTS</span>
                      <h3 className={styles.disciplineTitle}>Creative Labs &amp; 3D</h3>
                      <p className={styles.disciplineDesc}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, Web Audio sound synthesis, and tools built simply because &quot;I wonder if I can build that myself.&quot;
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Three.js</span>
                        <span className={styles.miniPill}>GLSL Shaders</span>
                        <span className={styles.miniPill}>Web Audio</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.disciplineNum}>06 · VISUALS</span>
                      <h3 className={styles.disciplineTitle}>Photography &amp; Notes</h3>
                      <p className={styles.disciplineDesc}>
                        Documenting architectural forms, natural textures, analog moments, and quiet visual essays that document the process behind the work.
                      </p>
                      <div className={styles.disciplineTags}>
                        <span className={styles.miniPill}>Visual Notes</span>
                        <span className={styles.miniPill}>Documentary</span>
                        <span className={styles.miniPill}>Texture Studies</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 03: THE OTHER 50% */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>03 · THE OTHER 50%</span>
                    <h2 className={styles.sectionTitle}>Observation &amp; Tactile Making</h2>
                  </div>

                  <div className={styles.hobbiesGrid}>
                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>01 · Mushrooms &amp; Mycology</h3>
                      <p className={styles.hobbyText}>
                        Finding wild fungi, photographing them in the wild, reading field guides, taking notes, and slowly building an understanding of how they grow.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>02 · Crochet &amp; Embroidery</h3>
                      <p className={styles.hobbyText}>
                        Fiber work, thread tension, and tactile patience. The satisfaction of making physical everyday objects with needles and yarn.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>03 · Tea &amp; Quiet Mornings</h3>
                      <p className={styles.hobbyText}>
                        Hot green tea, quiet studio desks before the world wakes up, and sitting with interesting creative ideas until they click.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>04 · Non-Fiction &amp; Kindle</h3>
                      <p className={styles.hobbyText}>
                        Collecting questions over answers. Books on design, architecture, intellectual history, culture, and human knowledge systems.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>05 · Museums &amp; Galleries</h3>
                      <p className={styles.hobbyText}>
                        Wandering quiet historical archives, art museums, and observing how different eras constructed tools, typography, and visual culture.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyTitle}>06 · Plants &amp; Gardening</h3>
                      <p className={styles.hobbyText}>
                        Watching soil, foliage, and cuttings grow slowly on the studio terrace in Tangerang without any rush.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 04: WORKING PHILOSOPHY */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>04 · WORKING PHILOSOPHY</span>
                    <h2 className={styles.sectionTitle}>How I Approach Making</h2>
                  </div>

                  <div className={styles.philosophyGrid}>
                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Make things yourself.</h3>
                      <p className={styles.philosophyBody}>
                        If something interests me, I want to understand how it works under the hood and rebuild a version myself. Learning and creating are the exact same process.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Simplify the complex.</h3>
                      <p className={styles.philosophyBody}>
                        Great design and clean code are about removing noise until only what matters is left. If an interface feels obvious, all the hard work happened behind the scenes.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Boundaries are artificial.</h3>
                      <p className={styles.philosophyBody}>
                        Digital design informs code, code informs user interactions, and leather craft informs physical aesthetics. The contrast between pixels and raw materials keeps the work honest.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION 05: CURRENTLY STATUS BOARD */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>05 · STATUS BOARD</span>
                    <h2 className={styles.sectionTitle}>Currently</h2>
                  </div>

                  <div className={styles.currentlyGrid}>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Reading</span>
                      <span className={styles.currentVal}>Design history, philosophy &amp; fiction</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Making</span>
                      <span className={styles.currentVal}>Next.js web apps + bespoke leather goods</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Learning</span>
                      <span className={styles.currentVal}>Spanish, Dutch &amp; GLSL shader mathematics</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Exploring</span>
                      <span className={styles.currentVal}>Wild mycology, photography &amp; fiber craft</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Building</span>
                      <span className={styles.currentVal}>Independent personal web infrastructure</span>
                    </div>
                    <div className={styles.currentItem}>
                      <span className={styles.currentLabel}>Thinking About</span>
                      <span className={styles.currentVal}>What to build and explore next</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 06: SMALL THINGS I LIKE */}
                <div className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>06 · SMALL THINGS I LIKE</span>
                    <h2 className={styles.sectionTitle}>Human Details</h2>
                  </div>

                  <div className={styles.likesWrap}>
                    <span className={styles.likePill}>Good typography</span>
                    <span className={styles.likePill}>Quiet museums</span>
                    <span className={styles.likePill}>Old non-fiction books</span>
                    <span className={styles.likePill}>Leather patina</span>
                    <span className={styles.likePill}>Notebooks &amp; paper</span>
                    <span className={styles.likePill}>Hot tea</span>
                    <span className={styles.likePill}>Wild mushrooms</span>
                    <span className={styles.likePill}>Clean interfaces</span>
                    <span className={styles.likePill}>Weird technical rabbit holes</span>
                    <span className={styles.likePill}>Learning something complicated just for fun</span>
                  </div>
                </div>

                {/* SECTION 07: CONTACT CTA */}
                <div className={styles.contactBannerWrap}>
                  <div className={styles.contactBannerLeft}>
                    <h3>Have an interesting problem or project?</h3>
                    <p>If you have a strange idea, an interesting challenge, or a project that sits between disciplines, I&apos;m probably interested.</p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com" className={styles.contactActionBtn}>
                    Say Hello ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 2. PROJECTS TAB: ULTRA-SLEEK COMING SOON VIEW ── */}
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
                    <span className={styles.comingSoonBadge}>01 · ARCHIVE IN PROGRESS</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Curating Spring 2026</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>Selected Works &amp; Case Studies</h2>
                  <p className={styles.comingSoonSubtitle}>
                    Detailed interactive case studies, live WebGL 3D configurators, and private cloud architecture breakdowns are currently being compiled.
                  </p>
                </div>

                {/* Preview Teaser Cards Strip */}
                <div className={styles.comingSoonGrid}>
                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>CLOUD INFRA</span>
                      <span className={styles.cardStatusLabel}>In Production · Writing Breakdown</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>Private Mail Platform</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Self-hosted Oracle Cloud VM, automated Postfix/DKIM setup, AWS SES relay, and custom multi-mailbox management without third-party tracking.
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
                    <h3 className={styles.comingSoonCardTitle}>Atmospheric Digital Reader (/x)</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Distraction-free reading space with procedural sound synthesis, dual theme engine, and smooth spatial page transitions.
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
                      Bespoke leather journals paired with a real-time Three.js 3D WebGL product customizer for texture switching and hot foil embossing.
                    </p>
                    <div className={styles.comingSoonCardFooter}>
                      <span className={styles.miniPill}>Three.js</span>
                      <span className={styles.miniPill}>Italian Leather</span>
                      <span className={styles.miniPill}>Solid 925 Silver</span>
                    </div>
                  </div>
                </div>

                {/* Quick CTA Actions */}
                <div className={styles.comingSoonActionRow}>
                  <a
                    href="https://shuenstudio.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.actionBtnSecondary}
                  >
                    Visit SHŪ / EN Atelier ↗
                  </a>
                  <a
                    href="mailto:hello@ivanaffriandi.com?subject=Work%20Inquiry%20from%20Portfolio"
                    className={styles.actionBtnPrimary}
                  >
                    Request Early Portfolio PDF ↗
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
                    <p className={styles.pillarDesc}>Clean, fast web interfaces with smooth interactions.</p>
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
                    <p className={styles.pillarDesc}>Interactive 3D WebGL models and procedural audio.</p>
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
                    <p className={styles.pillarDesc}>Cloud servers, containerization, and secure APIs.</p>
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
                    <p className={styles.pillarDesc}>Traditional bespoke leather goods made by hand.</p>
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

            {/* ── 4. PROCESS TAB: ULTRA-SLEEK COMING SOON VIEW ── */}
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
                    <span className={styles.comingSoonBadge}>02 · METHODOLOGY</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Framework Guide In Progress</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>Design Engineering Framework</h2>
                  <p className={styles.comingSoonSubtitle}>
                    Documenting the end-to-end framework from Figma wireframes and physical pattern drafting to full-stack Next.js deployment and private cloud operations.
                  </p>
                </div>

                <div className={styles.processComingSoonGrid}>
                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 01</span>
                    <h3 className={styles.processPreviewHeading}>Architecture &amp; System Tokens</h3>
                    <p className={styles.processPreviewText}>
                      Structuring typographic scale, modular components in Figma, database schema modeling, and zero-bloat state architecture.
                    </p>
                  </div>

                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 02</span>
                    <h3 className={styles.processPreviewHeading}>Code &amp; Tactile Prototyping</h3>
                    <p className={styles.processPreviewText}>
                      Fast iterative loops in Next.js 16 &amp; TypeScript, testing 60fps micro-animations, and hand-cutting leather prototypes in the atelier.
                    </p>
                  </div>

                  <div className={styles.processPreviewCard}>
                    <span className={styles.processPreviewStep}>STEP 03</span>
                    <h3 className={styles.processPreviewHeading}>Infrastructure &amp; Production Launch</h3>
                    <p className={styles.processPreviewText}>
                      Automated Docker containerization, edge CDN caching with Cloudflare, private DNS routing, and performance optimization.
                    </p>
                  </div>
                </div>

                <div className={styles.comingSoonActionRow}>
                  <a
                    href="mailto:hello@ivanaffriandi.com?subject=Design%20Engineering%20Workflow%20Inquiry"
                    className={styles.actionBtnPrimary}
                  >
                    Discuss a Project Workflow ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 5. SERVICES & LOG TAB: ULTRA-SLEEK COMING SOON VIEW ── */}
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
                    <span className={styles.comingSoonBadge}>03 · COMMISSIONS &amp; LOG</span>
                    <span className={styles.comingSoonDotLive} />
                    <span className={styles.comingSoonDateText}>Opening Q2 2026</span>
                  </div>
                  <h2 className={styles.comingSoonTitle}>Studio Services &amp; Public Log</h2>
                  <p className={styles.comingSoonSubtitle}>
                    Selective client commissioning slots, design engineering consulting, and a chronological release log are opening soon.
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
                      Fast, modern Next.js 16 web applications, custom platforms, and high-performance server architectures built with craftsmanship.
                    </p>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>SERVICE 02</span>
                      <span className={styles.cardStatusLabel}>Open for Inquiries</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>UI/UX &amp; Design Systems</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Precision interface design, Figma component libraries, responsive layouts, and tactile micro-interactions with generous whitespace.
                    </p>
                  </div>

                  <div className={styles.comingSoonCard}>
                    <div className={styles.cardHeaderStrip}>
                      <span className={styles.cardScopePill}>SERVICE 03</span>
                      <span className={styles.cardStatusLabel}>Open for Inquiries</span>
                    </div>
                    <h3 className={styles.comingSoonCardTitle}>3D WebGL &amp; Custom Atelier</h3>
                    <p className={styles.comingSoonCardDesc}>
                      Interactive Three.js 3D product configurators, procedural shaders, and bespoke leather commissions from SHŪ / EN Studio.
                    </p>
                  </div>
                </div>

                <div className={styles.contactBannerWrap} style={{ marginTop: '24px' }}>
                  <div className={styles.contactBannerLeft}>
                    <h3>Interested in commissioning a project or consulting?</h3>
                    <p>Send a brief note about what you are building, the timeline, and any initial requirements.</p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com?subject=Studio%20Commission%20Inquiry" className={styles.contactActionBtn}>
                    Inquire via Email ↗
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
