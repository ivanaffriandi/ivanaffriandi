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
      headline: 'Product Designer, Full-Stack Engineer & Atelier Founder',
      narrative:
        'I design intuitive digital products, build fast web applications, and craft physical leather goods. Bridging clean software engineering with tactile physical craft from Tangerang, Indonesia.',
      duration: '2025 — Present',
      client: 'Independent Practice',
      artDirection: 'Digital Products & Bespoke Goods',
    },
    projects: {
      headline: 'Featured Works & Live Systems',
      narrative:
        'A curated selection of live web applications, interactive 3D configurators, and bespoke physical products built with clean code and high attention to detail.',
      duration: '2025 — 2026',
      client: 'Selected Projects',
      artDirection: 'Software & Interactive Media',
    },
    skills: {
      headline: 'Technical Stack & Capabilities',
      narrative:
        'Core technologies and disciplines organized across four key areas: Frontend & UI, 3D & Creative Tech, Backend & Cloud Infrastructure, and Physical Leather Craft.',
      duration: 'Comprehensive Mastery',
      client: 'Multidisciplinary',
      artDirection: 'Engineering & Craft',
    },
    process: {
      headline: 'How I Work & Build',
      narrative:
        'A straightforward three-phase approach to designing, developing, and delivering high-quality digital products and bespoke atelier goods.',
      duration: 'End-to-End Workflow',
      client: 'Direct Collaboration',
      artDirection: 'Design & Engineering',
    },
    archive: {
      headline: 'Services & Project Archive',
      narrative:
        'Available for select full-stack web development, UI/UX product design, interactive 3D WebGL experiences, and bespoke studio commissions.',
      duration: '2025 — 2026',
      client: 'Available for Hire',
      artDirection: 'Full Portfolio',
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
          <span className={styles.metaLabel}>Focus &amp; Role</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Timeline</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Discipline</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Output</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: DYNAMIC TAB VIEW CONTENTS ── */}

        {/* 1. OVERVIEW TAB: 3 CLEAR CORE DISCIPLINES + PRINCIPLES */}
        {activeTab === 'overview' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.overviewCardsGrid}>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>01 · DESIGN</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Product Design</h3>
                <p className={styles.overviewFocusDesc}>
                  I create clean, minimalist interfaces with strong typography, intuitive navigation, and high-fidelity Figma design systems tailored for web and mobile.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Figma</span>
                  <span className={styles.miniPill}>Design Systems</span>
                  <span className={styles.miniPill}>Prototyping</span>
                  <span className={styles.miniPill}>Micro-interactions</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>02 · CODE</span>
                <h3 className={styles.overviewFocusTitle}>Full-Stack Web Engineering</h3>
                <p className={styles.overviewFocusDesc}>
                  I build fast, responsive, and secure web applications using Next.js 16, TypeScript, Tailwind, and scalable cloud backends with zero bloat.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Next.js 16</span>
                  <span className={styles.miniPill}>TypeScript</span>
                  <span className={styles.miniPill}>React 19</span>
                  <span className={styles.miniPill}>Docker &amp; Cloud</span>
                </div>
              </div>

              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>03 · CRAFT</span>
                <h3 className={styles.overviewFocusTitle}>3D WebGL &amp; Physical Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Founder of SHŪ / EN Studio. I handcraft bespoke leather journals while building real-time 3D Three.js product configurators with custom shaders.
                </p>
                <div className={styles.overviewFocusTags}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>WebGL</span>
                  <span className={styles.miniPill}>Leathercraft</span>
                  <span className={styles.miniPill}>925 Silver</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Banner */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Have a project in mind or need a custom build?</h4>
                <p>Available for freelance projects, technical consulting, and bespoke studio commissions.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Get in Touch ↗
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
                <span>Oracle Cloud + Next.js ↗</span>
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
                <span>Web Audio &amp; Editorial ↗</span>
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
                  Handcrafted bespoke leather journals made with Italian vegetable-tanned Nero leather, Japanese Moire lining, and solid 925 sterling silver charms.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Full-Grain Nero Leather</span>
                  <span className={styles.miniPill}>Solid 925 Silver</span>
                  <span className={styles.miniPill}>Handcrafted in Tangerang</span>
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
                  Real-time interactive 3D product customizer with live Three.js camera controls, leather texture switching, and custom gold foil embossing preview.
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
                  Custom email infrastructure deployed on Oracle Cloud VM with AWS SES relay, automated DKIM 2048-bit authentication, and a clean web client.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Oracle Cloud VM</span>
                  <span className={styles.miniPill}>AWS SES</span>
                  <span className={styles.miniPill}>DKIM &amp; DMARC</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* 3. SKILLS TAB: 4 CLEAR DISCIPLINE PILLARS + CLEAN MARQUEE */}
        {activeTab === 'skills' && (
          <div className={styles.skillsSectionWrapper}>
            <div className={styles.skillsPillarGrid}>
              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>01 · Frontend &amp; UI</h3>
                <p className={styles.pillarDesc}>Modern, high-performance web interfaces with clean typography and smooth animations.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Next.js 16 (App Router)</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> React 19 &amp; TypeScript</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Framer Motion Animations</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Vanilla CSS &amp; Tailwind</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Figma Design Systems</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>02 · 3D &amp; Creative</h3>
                <p className={styles.pillarDesc}>Interactive 3D WebGL experiences, custom shaders, and spatial audio synthesis.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Three.js &amp; WebGL 2.0</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> GLSL Procedural Shaders</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> 3D Product Configurators</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Web Audio API Synthesis</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Blender 3D Modeling</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>03 · Backend &amp; Cloud</h3>
                <p className={styles.pillarDesc}>Reliable cloud servers, automated APIs, containerization, and email infrastructure.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Node.js &amp; Python APIs</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Oracle Cloud (OCI) &amp; AWS SES</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Docker &amp; Docker Compose</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> PostgreSQL &amp; Redis Cache</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Cloudflare Edge Security</span>
                </div>
              </div>

              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>04 · Physical Craft</h3>
                <p className={styles.pillarDesc}>Traditional bespoke leather goods handcrafted with premium imported materials.</p>
                <div className={styles.pillarSkillList}>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Leather Pattern Drafting</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Italian Vegetable-Tanned Hides</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Hand Saddle-Stitching</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Solid 925 Silver Casting</span>
                  <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Wax Burnished Edges</span>
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

        {/* 4. PROCESS TAB: 3 CLEAR WORKFLOW PHASES */}
        {activeTab === 'process' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.processStepGrid}>
              <div className={styles.processCard}>
                <span className={styles.processNum}>01</span>
                <h3 className={styles.processTitle}>Discovery &amp; Architecture</h3>
                <p className={styles.processText}>
                  We define clear project goals, establish user requirements, design wireframes in Figma, and plan the underlying system architecture for scalability.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>02</span>
                <h3 className={styles.processTitle}>Design, Code &amp; Prototyping</h3>
                <p className={styles.processText}>
                  Writing clean, strictly-typed Next.js and TypeScript code, implementing fluid micro-interactions, crafting shaders, and testing responsiveness.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>03</span>
                <h3 className={styles.processTitle}>Deployment &amp; Handover</h3>
                <p className={styles.processText}>
                  Deploying to optimized cloud servers (OCI, Cloudflare, Vercel), ensuring strict security (SSL, DKIM), and delivering complete documentation.
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
                  Custom web applications, portfolio platforms, and SaaS tools built with Next.js 16, TypeScript, and modern backend APIs.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>SERVICE · 02</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Design Systems</h3>
                <p className={styles.overviewFocusDesc}>
                  User interface design, Figma component libraries, responsive web design, and interactive click-through prototypes.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>SERVICE · 03</span>
                <h3 className={styles.overviewFocusTitle}>3D Web &amp; Custom Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Real-time Three.js 3D WebGL product customizers and bespoke handcrafted leather goods from SHŪ / EN Studio.
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
                    <p className={styles.archiveItemSubtitle}>Minimalist editorial reading interface with Web Audio ambient wind sound synthesis.</p>
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

            {/* Contact CTA */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Ready to start a project together?</h4>
                <p>Send an inquiry with your timeline and requirements, and I will reply within 24 hours.</p>
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
