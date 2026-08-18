'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'skills' | 'process' | 'archive';

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [liveTime, setLiveTime] = useState('5:28 PM (WIB)');

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
      headline: 'Creative Direction & Studio Ethos',
      narrative:
        'Bridging physical bespoke leathercraft with real-time 3D WebGL environments and distributed cloud infrastructure. A hybrid studio practice merging tactile atelier materials with fluid generative motion and precision software engineering.',
      duration: '2025 — Present',
      client: 'Independent Studio',
      artDirection: 'Physical & Digital Systems',
    },
    projects: {
      headline: 'Spatial Systems & Bespoke Craft',
      narrative:
        'Exploring the intersection of physical bespoke leathercraft, procedural 3D WebGL environments, and distributed cloud email infrastructure. Built with uncompromising craft, fluid generative motion, and minimalist systems.',
      duration: '2025 — 2026',
      client: 'SHŪ / EN & Personal Labs',
      artDirection: 'Digital Systems & Physical Goods',
    },
    skills: {
      headline: 'Core Capabilities & Technical Disciplines',
      narrative:
        'A kinetic masonry wall of engineering proficiencies, distributed cloud infrastructure, bespoke leather craftsmanship, real-time 3D shaders, and automated logistics engineered across dozens of production disciplines.',
      duration: 'Comprehensive Mastery',
      client: 'Full Stack & Atelier',
      artDirection: 'Multidisciplinary Engineering',
    },
    process: {
      headline: 'Craft & Engineering Methodology',
      narrative:
        'From hand-drafting pattern geometries and cutting vegetable-tanned hides in our Tangerang workshop to writing GLSL procedural normal shaders, Three.js camera projection, and deploying high-throughput email relays on Oracle Cloud VM.',
      duration: 'Iterative Practice',
      client: 'Direct to Collector',
      artDirection: 'Atelier Architecture',
    },
    archive: {
      headline: 'Systems Archive & Changelog',
      narrative:
        'A chronological repository of launched full-stack web applications, cross-platform Flutter mobile clients, atmospheric digital reading engines, and automated Telegram concierge bots engineered across 2025 and 2026.',
      duration: '2025 — 2026',
      client: 'Ecosystem Catalog',
      artDirection: 'Full Architecture',
    },
  };

  const current = tabHeaders[activeTab];

  // Brick Wall Marquee Rows
  const row1 = [
    { tag: '01 / ENGINE', name: 'Next.js 16 (Turbopack)' },
    { tag: '02 / REACT', name: 'React 19 Server Components' },
    { tag: '03 / LANGUAGE', name: 'TypeScript Strict Mode' },
    { tag: '04 / ARCHITECTURE', name: 'App Router Proxies' },
    { tag: '05 / ACTION', name: 'Next.js Server Actions' },
    { tag: '06 / CSS', name: 'Vanilla CSS Modules' },
    { tag: '07 / MOTION', name: 'Framer Motion Springs' },
    { tag: '08 / SPEED', name: 'SSR & SSG Hybrid Caching' },
  ];

  const row2 = [
    { tag: '09 / 3D WEBGL', name: 'Three.js 3D Engine' },
    { tag: '10 / GRAPHICS', name: 'WebGL 2.0 Viewports' },
    { tag: '11 / SHADER', name: 'GLSL Procedural Shaders' },
    { tag: '12 / TEXTURE', name: 'Normal Map Generation' },
    { tag: '13 / PROJECTION', name: 'Raycasting & Camera Rigs' },
    { tag: '14 / CUSTOMIZER', name: 'Real-time 3D Configurator' },
    { tag: '15 / AUDIO', name: 'Web Audio API Synthesis' },
    { tag: '16 / SOUNDSCAPE', name: 'Generative Ambient Noise' },
  ];

  const row3 = [
    { tag: '17 / CLOUD', name: 'Oracle Cloud OCI Compute VM' },
    { tag: '18 / RELAY', name: 'AWS SES Outbound Engine' },
    { tag: '19 / PROTOCOL', name: 'DKIM 2048-bit RSA Keys' },
    { tag: '20 / SECURITY', name: 'SPF Strict Records' },
    { tag: '21 / COMPLIANCE', name: 'DMARC Policy Enforcement' },
    { tag: '22 / IDENTITY', name: 'BIMI Certificate Architecture' },
    { tag: '23 / SERVER', name: 'Postfix & Node SMTP Daemons' },
    { tag: '24 / ROUTING', name: 'Custom Envelope Return-Path' },
  ];

  const row4 = [
    { tag: '25 / ATELIER', name: 'Bespoke Leather Pattern Drafting' },
    { tag: '26 / LEATHER', name: 'Italian Vegetable-Tanned Nero Hides' },
    { tag: '27 / PRICKING', name: 'French Pricking Iron Stitching' },
    { tag: '28 / SEWING', name: 'Hand Saddle-Stitch Linen Thread' },
    { tag: '29 / FINISHING', name: 'Wax Burnished Edge Creasing' },
    { tag: '30 / LINING', name: 'Japanese Moire Silk Fabric' },
    { tag: '31 / HARDWARE', name: 'Solid 925 Sterling Silver Casting' },
    { tag: '32 / BINDING', name: 'Custom Cord Journal Binding' },
  ];

  const row5 = [
    { tag: '33 / MOBILE', name: 'Flutter SDK & Engine' },
    { tag: '34 / DART', name: 'Dart Multiplatform Architecture' },
    { tag: '35 / CLIENT', name: 'iOS & Android Native Integration' },
    { tag: '36 / CACHE', name: 'SQLite Offline-First Sync' },
    { tag: '37 / BOT', name: 'Telegram Bot API Concierge' },
    { tag: '38 / LOGISTICS', name: 'Biteship Airway Bill Tracking' },
    { tag: '39 / PAYOUT', name: 'DOKU Settlement Engine' },
    { tag: '40 / STRIPE', name: 'Stripe Payment Webhooks' },
  ];

  const row6 = [
    { tag: '41 / 3D CAD', name: 'Blender Industrial Modeling' },
    { tag: '42 / FABRICATION', name: 'Rapid 3D Prototyping' },
    { tag: '43 / CONTAINERS', name: 'Docker & Docker Compose' },
    { tag: '44 / LINUX', name: 'Ubuntu Server & systemd Daemons' },
    { tag: '45 / PROXY', name: 'Cloudflare SSL Edge Proxy' },
    { tag: '46 / MEMORY', name: 'Redis In-Memory Cache' },
    { tag: '47 / DATABASE', name: 'PostgreSQL & Prisma ORM' },
    { tag: '48 / TYPOGRAPHY', name: 'Minimalist Swiss Editorial Design' },
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
            Archive
          </button>
        </div>

        <div className={styles.headerCol3}>
          <span className={styles.locationOnlyText}>Tangerang, Indonesia</span>
          <span className={styles.liveClockHeader}>{liveTime}</span>
        </div>

        {/* ── ROW 2: HERO TITLE & NARRATIVE (EXACT INDENT AT COL 2) ── */}
        <div className={styles.heroCol1}>
          <span className={styles.overviewLabel}>
            → {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </div>

        <div className={styles.heroCol23}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
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
          <span className={styles.metaLabel}>Services &amp; Info</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Duration</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Client / Studio</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Art Direction</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: DYNAMIC TAB VIEW CONTENTS ── */}

        {/* 1. PROJECTS TAB VIEW */}
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
                <span>Private Mail Engine</span>
                <span>Oracle VM + SES ↗</span>
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
                alt="Atmospheric Digital Reader Chapter 02"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Chapter 02: Unconscious</span>
                <span>Digital Reader /x ↗</span>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol3}
            >
              <img
                src="/work-showcase/reader-dark-fire.png"
                alt="Atmospheric Digital Reader Chapter 05"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Chapter 05: Embers</span>
                <span>Voice Audio &amp; Reader ↗</span>
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
                  Handcrafted bespoke leather journals made from Italian vegetable-tanned Nero hides, Japanese Moire linings, and solid 925 silver charms.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Full-Grain Nero Hide</span>
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
                  Real-time procedural normal maps, live Three.js camera projection, leather texture switching, and gold foil embossing customizer.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>WebGL 2.0</span>
                  <span className={styles.miniPill}>GLSL Shaders</span>
                </div>
              </a>

              <a
                href="https://shuenstudio.com"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  shuen-bot Logistics &amp; Concierge <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Automated dispatch webhooks, Biteship courier airway bill sync, Telegram order concierge, and DOKU/Stripe payment settlement.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Node.js</span>
                  <span className={styles.miniPill}>Telegram API</span>
                  <span className={styles.miniPill}>Webhooks</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* 2. SKILLS TAB: KINETIC MULTI-ROW BRICK WALL MARQUEE */}
        {activeTab === 'skills' && (
          <div className={styles.skillsBrickWallWrapper}>
            {/* Row 1: Left */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeLeft}>
                {[...row1, ...row1, ...row1].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Right */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeRight}>
                {[...row2, ...row2, ...row2].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Left */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeLeft}>
                {[...row3, ...row3, ...row3].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Right */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeRight}>
                {[...row4, ...row4, ...row4].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 5: Left */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeLeft}>
                {[...row5, ...row5, ...row5].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 6: Right */}
            <div className={styles.brickRowTrack}>
              <div className={styles.brickMarqueeRight}>
                {[...row6, ...row6, ...row6].map((b, idx) => (
                  <div key={idx} className={styles.brickPill}>
                    <span className={styles.brickCodeTag}>{b.tag}</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. PROCESS TAB VIEW */}
        {activeTab === 'process' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.processStepGrid}>
              <div className={styles.processCard}>
                <span className={styles.processNum}>01</span>
                <h3 className={styles.processTitle}>Material &amp; Architecture Discovery</h3>
                <p className={styles.processText}>
                  Selecting vegetable-tanned hides from Tuscany and drafting geometric patterns alongside Next.js component system architecture.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>02</span>
                <h3 className={styles.processTitle}>Precision Atelier &amp; Shader Engineering</h3>
                <p className={styles.processText}>
                  Hand saddle-stitching leather journals while compiling procedural Three.js GLSL shaders for real-time 3D customizer previewing.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>03</span>
                <h3 className={styles.processTitle}>Cloud Deployment &amp; Collector Delivery</h3>
                <p className={styles.processText}>
                  Configuring high-throughput AWS SES email relays, DKIM keys, and shipping physical bespoke leather journals worldwide.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. OVERVIEW TAB VIEW */}
        {activeTab === 'overview' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.secondaryProjectsRow}>
              <div className={styles.secondaryProjectCard}>
                <h3 className={styles.secondaryProjectTitle}>Cross-Disciplinary Studio Ethos</h3>
                <p className={styles.secondaryProjectDesc}>
                  We believe true luxury lies in the tension between the physical and digital. A handcrafted leather journal gains timeless character with age, while a high-performance web system provides frictionless utility.
                </p>
              </div>
              <div className={styles.secondaryProjectCard}>
                <h3 className={styles.secondaryProjectTitle}>Software Philosophy</h3>
                <p className={styles.secondaryProjectDesc}>
                  Minimalist, self-hosted, and uncompromising. We avoid bloated corporate dependencies in favor of clean Linux infrastructure, strict type safety, and International Typographic Style aesthetics.
                </p>
              </div>
              <div className={styles.secondaryProjectCard}>
                <h3 className={styles.secondaryProjectTitle}>Direct Collector Engagement</h3>
                <p className={styles.secondaryProjectDesc}>
                  Operating from our Tangerang atelier, every leather item is cut, stitched, and finished individually with full transparency into production telemetry and delivery tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. ARCHIVE TAB VIEW */}
        {activeTab === 'archive' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.archiveTable}>
              <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                <div className={styles.archiveLeftCol}>
                  <h3 className={styles.archiveItemTitle}>Private Mail Engine</h3>
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
                  <p className={styles.archiveItemSubtitle}>High-contrast reading interface with Web Audio ambient generative wind synthesis.</p>
                </div>
                <div className={styles.archivePillStack}>
                  <span className={styles.miniPill}>Web Audio API</span>
                  <span className={styles.miniPill}>Typography</span>
                </div>
                <span className={styles.archiveYearLabel}>2026</span>
              </a>

              <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                <div className={styles.archiveLeftCol}>
                  <h3 className={styles.archiveItemTitle}>SHŪ / EN Bespoke Leather Atelier</h3>
                  <p className={styles.archiveItemSubtitle}>Handcrafted trifold leather goods with vegetable-tanned Nero hides and silver charms.</p>
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
