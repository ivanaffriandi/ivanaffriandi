'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'projects' | 'skills' | 'process' | 'archive';

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('5:40 PM (WIB)');

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

  const tabHeaders = {
    about: {
      headline: 'Ivan Affriandi',
      narrative:
        'Designer, full-stack engineer, and atelier founder crafting clean digital products and physical goods in Tangerang, Indonesia.',
      duration: '2025 — Present',
      client: 'Independent Studio',
      artDirection: 'Digital & Physical',
    },
    projects: {
      headline: 'Selected Works',
      narrative:
        'A collection of live web applications, 3D configurators, and handcrafted physical goods.',
      duration: '2025 — 2026',
      client: 'Recent Projects',
      artDirection: 'Web & Atelier',
    },
    skills: {
      headline: 'Tools & Stack',
      narrative:
        'The technologies, frameworks, and workshop tools I use daily to build products.',
      duration: 'Daily Stack',
      client: 'Engineering & Craft',
      artDirection: 'Full Stack',
    },
    process: {
      headline: 'How I Work',
      narrative:
        'A simple three-step approach to turning ideas into fast, finished products.',
      duration: 'Workflow',
      client: 'Direct Collaboration',
      artDirection: 'Plan → Build → Ship',
    },
    archive: {
      headline: 'Services & Log',
      narrative:
        'Available services for hire and a complete chronological record of launched projects.',
      duration: 'Open for Hire',
      client: 'Clients & Studio',
      artDirection: 'Full Archive',
    },
  };

  const current = tabHeaders[activeTab];

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

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.masterGridContainer}>
        {/* ── ROW 1: HEADER (ALIGNED PRECISELY ACROSS 3 COLUMNS) ── */}
        <div className={styles.headerCol1}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
            Ivan&apos;s Work<sup>®</sup>
          </a>
        </div>

        <div className={styles.headerCol2}>
          <button
            onClick={() => setActiveTab('about')}
            className={`${styles.navItemBtn} ${activeTab === 'about' ? styles.navItemActive : ''}`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`${styles.navItemBtn} ${activeTab === 'projects' ? styles.navItemActive : ''}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`${styles.navItemBtn} ${activeTab === 'skills' ? styles.navItemActive : ''}`}
          >
            Skills
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`${styles.navItemBtn} ${activeTab === 'process' ? styles.navItemActive : ''}`}
          >
            Process
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`${styles.navItemBtn} ${activeTab === 'archive' ? styles.navItemActive : ''}`}
          >
            Services &amp; Log
          </button>
        </div>

        <div className={styles.headerCol3}>
          <span className={styles.locationOnlyText}>Tangerang, Indonesia</span>
          <span className={styles.liveClockHeader}>{liveTime}</span>
        </div>

        {/* ── ROW 2: HERO TITLE & NARRATIVE (EXACT INDENT AT COL 2) ── */}
        <div className={styles.heroCol1}>
          <span className={styles.overviewLabel}>
            → {activeTab === 'archive' ? 'Services & Log' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </div>

        <div className={styles.heroCol23}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <h1 className={styles.mainTitleHeading}>
                {current.headline}
              </h1>

              <p className={styles.narrativeParagraph}>
                {current.narrative}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── ROW 3: METADATA ROW ── */}
        <div className={styles.metaCol1}>
          <span className={styles.metaLabel}>Discipline</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Timeline</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Focus</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Output</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: DYNAMIC TAB VIEW CONTENTS ── */}

        {/* 1. ABOUT TAB: SEAMLESS CUTOUT PORTRAIT + 3 DISCIPLINE CARDS */}
        {activeTab === 'about' && (
          <div className={styles.fullWidthTabBlock}>
            {/* Seamless Head Cutout & Intro */}
            <div className={styles.aboutHeroSection}>
              <img
                src="/ivan-head.png"
                alt="Ivan Affriandi"
                className={styles.aboutHeadPortrait}
              />
              <div className={styles.aboutHeroBioWrap}>
                <h3 className={styles.aboutHeroBioHeadline}>
                  Building digital products &amp; bespoke physical craft.
                </h3>
                <p className={styles.aboutHeroBioText}>
                  I specialize in building fast, lightweight web applications with Next.js, designing intuitive user interfaces in Figma, and handcrafting leather journals from my studio in Tangerang.
                </p>
              </div>
            </div>

            {/* 3 Focus Cards */}
            <div className={styles.overviewCardsGrid}>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>01 · DESIGN</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Product Design</h3>
                <p className={styles.overviewFocusDesc}>
                  Clean, minimalist interfaces and design systems built in Figma with high attention to typography and micro-interactions.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Figma</span>
                  <span className={styles.miniPill}>UI/UX</span>
                  <span className={styles.miniPill}>Design Systems</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>02 · CODE</span>
                <h3 className={styles.overviewFocusTitle}>Full-Stack Web Engineering</h3>
                <p className={styles.overviewFocusDesc}>
                  Fast, modern web applications built with Next.js 16, TypeScript, React, and lightweight cloud servers.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Next.js 16</span>
                  <span className={styles.miniPill}>TypeScript</span>
                  <span className={styles.miniPill}>Cloud Server</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>03 · CRAFT</span>
                <h3 className={styles.overviewFocusTitle}>3D Web &amp; Leather Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Founder of SHŪ / EN Studio. Handcrafted bespoke leather journals and real-time Three.js 3D web customizers.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>Leathercraft</span>
                  <span className={styles.miniPill}>925 Silver</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Banner */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Have a project in mind?</h4>
                <p>Available for freelance web projects, design systems, and custom studio builds.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Get in Touch ↗
              </a>
            </div>
          </div>
        )}

        {/* 2. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <>
            <a
              href="https://mail.ivanaffriandi.com"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol1}
            >
              <img
                src="/work-showcase/mail-dark.png"
                alt="Private Mail Platform"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Private Mail Platform</span>
                <span>Self-Hosted Cloud ↗</span>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol2}
            >
              <img
                src="/work-showcase/reader-dark-woods.png"
                alt="Atmospheric Digital Reader"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Atmospheric Reader (/x)</span>
                <span>Web Audio &amp; Books ↗</span>
              </div>
            </a>

            <a
              href="https://shuenstudio.com"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol3}
            >
              <img
                src="/work-showcase/reader-dark-fire.png"
                alt="SHU / EN Leather Atelier"
              />
              <div className={styles.cardOverlayInfo}>
                <span>SHŪ / EN Leather Goods</span>
                <span>Bespoke Atelier ↗</span>
              </div>
            </a>

            {/* Secondary Project Cards Strip */}
            <div className={styles.secondaryProjectsRow}>
              <a
                href="https://shuenstudio.com"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  SHŪ / EN Leather Goods Atelier <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Bespoke trifold journals handcrafted from Italian vegetable-tanned Nero leather, Japanese Moire lining, and solid 925 silver.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Full-Grain Leather</span>
                  <span className={styles.miniPill}>Solid 925 Silver</span>
                  <span className={styles.miniPill}>Tangerang Atelier</span>
                </div>
              </a>

              <a
                href="https://shuenstudio.com/po"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  3D WebGL Configurator Engine <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Interactive 3D product customizer with live Three.js camera controls, leather texture switching, and gold foil stamping.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>WebGL 2.0</span>
                  <span className={styles.miniPill}>GLSL Shaders</span>
                </div>
              </a>

              <a
                href="https://mail.ivanaffriandi.com"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  Private Mail Server Stack <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Personal self-hosted email infrastructure on Oracle Cloud VM with AWS SES relay, automated DKIM keys, and zero tracking.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Oracle Cloud VM</span>
                  <span className={styles.miniPill}>AWS SES</span>
                  <span className={styles.miniPill}>DKIM Keys</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* 3. SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className={styles.skillsSectionWrapper}>
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
          </div>
        )}

        {/* 4. PROCESS TAB */}
        {activeTab === 'process' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.processStepGrid}>
              <div className={styles.processCard}>
                <span className={styles.processNum}>01</span>
                <h3 className={styles.processTitle}>Plan &amp; Sketch</h3>
                <p className={styles.processText}>
                  Define clear project goals, sketch simple user flows in Figma, and design the system architecture.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>02</span>
                <h3 className={styles.processTitle}>Build &amp; Refine</h3>
                <p className={styles.processText}>
                  Write clean Next.js and TypeScript code, polish animations, and test speed on mobile and desktop.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>03</span>
                <h3 className={styles.processTitle}>Ship &amp; Launch</h3>
                <p className={styles.processText}>
                  Deploy to fast cloud servers, configure custom domains with SSL, and launch live with zero hassle.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. ARCHIVE & SERVICES TAB */}
        {activeTab === 'archive' && (
          <div className={styles.fullWidthTabBlock}>
            {/* Services Grid */}
            <div className={styles.overviewCardsGrid}>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>01 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>Web &amp; App Development</h3>
                <p className={styles.overviewFocusDesc}>
                  Fast websites, SaaS platforms, and custom web apps built with Next.js 16 and TypeScript.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>02 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Design Systems</h3>
                <p className={styles.overviewFocusDesc}>
                  Clean user interfaces, Figma design systems, and responsive mobile-first layouts.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>03 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>3D Web &amp; Custom Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Interactive 3D Three.js product customizers and bespoke leather goods from SHŪ / EN Studio.
                </p>
              </div>
            </div>

            {/* Archive Project Table */}
            <div style={{ marginTop: '12px' }}>
              <span className={styles.metaLabel} style={{ display: 'block', marginBottom: '12px' }}>
                Complete Project Archive
              </span>

              <div className={styles.archiveTable}>
                <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>Private Mail Platform</h3>
                    <p className={styles.archiveItemSubtitle}>Self-hosted Oracle Cloud VM, AWS SES relay, automated DKIM keys.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Next.js 16</span>
                    <span className={styles.miniPill}>AWS SES</span>
                    <span className={styles.miniPill}>Docker</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>Atmospheric Digital Reader (/x)</h3>
                    <p className={styles.archiveItemSubtitle}>Minimalist digital reading app with Web Audio ambient sound synthesis.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Web Audio API</span>
                    <span className={styles.miniPill}>Framer Motion</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>SHŪ / EN Bespoke Leather Atelier</h3>
                    <p className={styles.archiveItemSubtitle}>Handcrafted trifold leather goods with vegetable-tanned Nero leather and 925 silver.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Leathercraft</span>
                    <span className={styles.miniPill}>925 Silver</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://shuenstudio.com/po" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>3D WebGL Configurator Engine</h3>
                    <p className={styles.archiveItemSubtitle}>Real-time procedural normal maps and gold foil embossing customizer.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Three.js</span>
                    <span className={styles.miniPill}>GLSL</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2025</span>
                </a>
              </div>
            </div>

            {/* Quick Contact CTA */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Ready to start a project?</h4>
                <p>Send an email with your timeline and requirements, and I will reply within 24 hours.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Send Email ↗
              </a>
            </div>
          </div>
        )}

        {/* ── ROW 5: SEE MORE LINK (RIGHT-ALIGNED UNDER COLUMN 3) ── */}
        <div className={styles.seeMoreWrapper}>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.seeMoreLink}
          >
            Visit SHŪ / EN Atelier →
          </a>
        </div>
      </div>
    </div>
  );
}
