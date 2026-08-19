'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'skills' | 'process' | 'archive';

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
    overview: {
      headline: "Hey, I'm Ivan. I design digital stuff and handcraft leather goods.",
      narrative:
        "I love building snappy web apps, designing clean interfaces that feel great to use, and handcrafting leather journals in my Tangerang workshop. Simple, fast, and made with care.",
      duration: '2025 — Present',
      client: 'Independent Studio',
      artDirection: 'Code, Design & Leathercraft',
    },
    projects: {
      headline: "Things I've Built & Shipped",
      narrative:
        "A mix of live web apps, 3D interactive toys, private cloud servers, and physical leather products. Click on any card to explore them live.",
      duration: 'Recent Works',
      client: 'Personal Labs & Studio',
      artDirection: 'Web Apps, 3D & Physical Goods',
    },
    skills: {
      headline: 'My Toolbox & Everyday Stack',
      narrative:
        'The tech, frameworks, and studio tools I use to bring ideas to life — from Next.js on my screen to stitching chisels on my workshop bench.',
      duration: 'Daily Stack',
      client: 'Tech & Atelier',
      artDirection: 'Full-Stack & Craft',
    },
    process: {
      headline: 'How Ideas Become Real Things',
      narrative:
        'No boring meetings or corporate fluff. Just a straightforward 3-step way I brainstorm, code, polish, and ship products.',
      duration: 'Quick & Iterative',
      client: 'Direct Collaboration',
      artDirection: 'Idea → Code → Launch',
    },
    archive: {
      headline: "Let's Build Something Cool Together",
      narrative:
        "Need a fresh website, a custom web app, or a bespoke leather journal? Here is what I can do for you, plus the full log of everything I've built.",
      duration: 'Open for Projects',
      client: 'Clients & Collectors',
      artDirection: 'Services & Archive',
    },
  };

  const current = tabHeaders[activeTab];

  // Pure Typography Stream Rows for Skills Marquee
  const row1 = [
    { num: '01', title: 'Next.js 16 (Turbopack)' },
    { num: '02', title: 'React 19 Server Components' },
    { num: '03', title: 'TypeScript Strict Mode' },
    { num: '04', title: 'App Router & Server Actions' },
    { num: '05', title: 'Vanilla CSS Modules & Tailwind' },
    { num: '06', title: 'Framer Motion Springs' },
  ];

  const row2 = [
    { num: '07', title: 'Three.js 3D Engine' },
    { num: '08', title: 'WebGL 2.0 Viewports' },
    { num: '09', title: 'GLSL Procedural Shaders' },
    { num: '10', title: 'Interactive 3D Configurator' },
    { num: '11', title: 'Web Audio API Synthesis' },
    { num: '12', title: 'Blender 3D Modeling' },
  ];

  const row3 = [
    { num: '13', title: 'Oracle Cloud OCI Compute VM' },
    { num: '14', title: 'AWS SES & Outbound Mail' },
    { num: '15', title: 'Docker & Docker Compose' },
    { num: '16', title: 'PostgreSQL & Prisma ORM' },
    { num: '17', title: 'Redis Cache & Cloudflare SSL' },
    { num: '18', title: 'Linux Ubuntu & systemd' },
  ];

  const row4 = [
    { num: '19', title: 'Bespoke Leather Pattern Drafting' },
    { num: '20', title: 'Italian Vegetable-Tanned Leather' },
    { num: '21', title: 'Hand Saddle-Stitch Linen Thread' },
    { num: '22', title: 'Solid 925 Sterling Silver Casting' },
    { num: '23', title: 'Wax Burnished Edge Creasing' },
    { num: '24', title: 'Custom Trifold Journal Binding' },
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
            onClick={() => setActiveTab('overview')}
            className={`${styles.navItemBtn} ${activeTab === 'overview' ? styles.navItemActive : ''}`}
          >
            Overview
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
            Services &amp; Archive
          </button>
        </div>

        <div className={styles.headerCol3}>
          <span className={styles.locationOnlyText}>Tangerang, Indonesia</span>
          <span className={styles.liveClockHeader}>{liveTime}</span>
        </div>

        {/* ── ROW 2: HERO TITLE & NARRATIVE (EXACT INDENT AT COL 2) ── */}
        <div className={styles.heroCol1}>
          <span className={styles.overviewLabel}>
            → {activeTab === 'archive' ? 'Services & Archive' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
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
          <span className={styles.metaLabel}>What I Focus On</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Timeline</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Vibe &amp; Role</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Output</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: DYNAMIC TAB VIEW CONTENTS ── */}

        {/* 1. OVERVIEW TAB: 3 CASUAL & CLEAR SPECIALIZATION CARDS */}
        {activeTab === 'overview' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.overviewCardsGrid}>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>01 · THE DESIGN SIDE</span>
                <h3 className={styles.overviewFocusTitle}>Clean Interfaces &amp; Figma Systems</h3>
                <p className={styles.overviewFocusDesc}>
                  I design screens that look sharp, feel natural, and don&apos;t overwhelm people. Clean typography, generous whitespace, and subtle animations that make clicking around fun.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Figma</span>
                  <span className={styles.miniPill}>UI/UX Design</span>
                  <span className={styles.miniPill}>Design Systems</span>
                  <span className={styles.miniPill}>Motion &amp; Feel</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>02 · THE CODE SIDE</span>
                <h3 className={styles.overviewFocusTitle}>Fast Next.js &amp; Full-Stack Apps</h3>
                <p className={styles.overviewFocusDesc}>
                  I write clean, modern code with Next.js 16, React, and TypeScript. Zero bloated libraries — just snappy, reliable web apps that load in a blink.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Next.js 16</span>
                  <span className={styles.miniPill}>TypeScript</span>
                  <span className={styles.miniPill}>Tailwind / CSS</span>
                  <span className={styles.miniPill}>Cloud Servers</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>03 · THE ATELIER SIDE</span>
                <h3 className={styles.overviewFocusTitle}>3D WebGL &amp; Handcrafted Leather</h3>
                <p className={styles.overviewFocusDesc}>
                  Founder of SHŪ / EN Studio. When I&apos;m not coding, I handcraft leather journals from Italian hides and build 3D WebGL customizers so people can customize them online.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Three.js 3D</span>
                  <span className={styles.miniPill}>WebGL Shaders</span>
                  <span className={styles.miniPill}>Italian Leather</span>
                  <span className={styles.miniPill}>925 Silver</span>
                </div>
              </div>
            </div>

            {/* Casual Contact Banner */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Got a cool idea or want to build something together?</h4>
                <p>I&apos;m always open to freelance web projects, design systems, and creative experiments.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Say Hello ↗
              </a>
            </div>
          </div>
        )}

        {/* 2. PROJECTS TAB: 3 VISUAL SHOWCASES + 3 DETAILED CARDS */}
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
                <span>Self-Hosted Cloud VM ↗</span>
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
                <span>Ambient Wind &amp; Books ↗</span>
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
                <span>Handmade Atelier ↗</span>
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
                  Bespoke trifold journals handcrafted from Italian vegetable-tanned Nero leather, Japanese Moire lining, and solid 925 sterling silver charms.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Full-Grain Nero Leather</span>
                  <span className={styles.miniPill}>Solid 925 Silver</span>
                  <span className={styles.miniPill}>Handmade in Tangerang</span>
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
                  Spin, flip, and customize leather journal colors and gold foil embossing in real-time 3D right inside your mobile or desktop browser.
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
                  Private Self-Hosted Mail Server <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  My own personal email system running on Oracle Cloud VM with AWS SES relay, automated DKIM keys, zero spam tracking, and a minimal web client.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Oracle Cloud VM</span>
                  <span className={styles.miniPill}>AWS SES</span>
                  <span className={styles.miniPill}>Zero Tracking</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* 3. SKILLS TAB: 4 CLEAR CREATIVE PILLARS + CLEAN MARQUEE */}
        {activeTab === 'skills' && (
          <div className={styles.skillsSectionWrapper}>
            <div className={styles.skillsPillarGrid}>
              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>01 · SCREEN &amp; FEEL</h3>
                <p className={styles.pillarDesc}>Making web interfaces look gorgeous, sharp, and effortless to use.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Next.js 16 (App Router)</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> React 19 &amp; TypeScript</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Framer Motion Animations</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Vanilla CSS &amp; Tailwind</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Figma Design Systems</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>02 · 3D &amp; EXPERIMENTS</h3>
                <p className={styles.pillarDesc}>Interactive 3D WebGL models, custom shaders, and spatial audio.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Three.js &amp; WebGL 2.0</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> GLSL Procedural Shaders</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> 3D Product Customizers</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Web Audio API Soundscapes</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Blender 3D Prototyping</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>03 · ENGINE &amp; CLOUD</h3>
                <p className={styles.pillarDesc}>Fast servers, secure APIs, and cloud infrastructure running 24/7.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Node.js &amp; Python APIs</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Oracle Cloud &amp; AWS SES</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Docker &amp; Docker Compose</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> PostgreSQL &amp; Redis</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Cloudflare Edge Security</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>04 · HANDS &amp; ATELIER</h3>
                <p className={styles.pillarDesc}>Traditional leathercraft and physical products made with patience.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Italian Vegetable-Tanned Hides</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Hand Saddle-Stitching</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Solid 925 Silver Casting</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Wax Edge Burnishing</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Custom Pattern Drafting</span>
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

        {/* 4. PROCESS TAB: 3 CASUAL WORKFLOW STEPS */}
        {activeTab === 'process' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.processStepGrid}>
              <div className={styles.processCard}>
                <span className={styles.processNum}>01</span>
                <h3 className={styles.processTitle}>Brainstorm &amp; Sketch</h3>
                <p className={styles.processText}>
                  We figure out what actually matters, strip away the fluff, sketch clean user flows in Figma, and pick the best tech stack for the job.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>02</span>
                <h3 className={styles.processTitle}>Code &amp; Polish</h3>
                <p className={styles.processText}>
                  Writing clean Next.js and TypeScript code, tweaking animations until they feel just right, and making sure the app is super fast on phones.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>03</span>
                <h3 className={styles.processTitle}>Ship &amp; Launch</h3>
                <p className={styles.processText}>
                  Deploying to lightning-fast cloud servers, setting up custom domains and security, and handing over a project that works flawlessly.
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
                <span className={styles.overviewFocusNumber}>SERVICE · 01</span>
                <h3 className={styles.overviewFocusTitle}>Web &amp; App Development</h3>
                <p className={styles.overviewFocusDesc}>
                  Fast websites, portfolio platforms, and SaaS web apps built with Next.js 16, TypeScript, and clean cloud backends.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>SERVICE · 02</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Design Systems</h3>
                <p className={styles.overviewFocusDesc}>
                  Minimalist interfaces, Figma design systems, interactive prototypes, and mobile-first responsive layouts.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>SERVICE · 03</span>
                <h3 className={styles.overviewFocusTitle}>3D Web &amp; Custom Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Interactive 3D Three.js product customizers and custom bespoke leather goods from SHŪ / EN Studio.
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
                    <p className={styles.archiveItemSubtitle}>Self-hosted Oracle Cloud VM, AWS SES relay, automated DKIM 2048-bit keys.</p>
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
                    <p className={styles.archiveItemSubtitle}>Minimalist editorial reading app with Web Audio ambient wind sound synthesis.</p>
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

            {/* Casual Contact CTA */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Ready to start a project or just want to say hi?</h4>
                <p>Drop me an email with what you&apos;re thinking, and I&apos;ll get back to you quickly.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Send an Email ↗
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
