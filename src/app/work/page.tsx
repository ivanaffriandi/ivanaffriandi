'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'work' | 'atelier' | 'archive';

export default function WorkIvanAffriandiStudioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('work');
  const [liveTime, setLiveTime] = useState('4:46 PM (WIB)');

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

  const tabData = {
    overview: {
      headline: 'Creative Direction & Engineering',
      narrative:
        'A dual practice rooted in Tangerang, Indonesia. Pattern-cutting vegetable-tanned hides and solid 925 silver binding on the physical workbench, while engineering high-throughput SES mail relays, procedural Three.js shaders, and multi-sensory digital readers.',
      services: 'Bespoke Atelier & Software Engineering',
      duration: '2025 — Present',
      ventures: 'Ivan Affriandi Ecosystem',
      direction: 'Physical Goods & Digital Systems',
    },
    work: {
      headline: 'Cyber-Artisanal Craft',
      narrative:
        'Bridging tangible bespoke leathercraft with real-time 3D WebGL configurators and self-hosted cloud email infrastructure. Built at SHŪ / EN Studio with uncompromising craftsmanship, fluid generative motion, and minimalist distributed systems.',
      services: 'Artisanal Atelier & Full-Stack Tech',
      duration: 'May–August, 2026',
      ventures: 'SHŪ / EN Studio · Mail Engine · /x Reader',
      direction: 'Spatial Luxury & Next.js 16',
    },
    atelier: {
      headline: 'Physical Workbench & 3D WebGL',
      narrative:
        'Every leather journal is hand-skived from Italian Nero hides, saddle-stitched with bonded thread, and fitted with custom solid silver charms. Complemented by real-time Three.js 3D configurators for custom bespoke orders.',
      services: 'Leather Atelier & Three.js Customizers',
      duration: 'Continuous Craft',
      ventures: 'SHŪ / EN Atelier & 3D WebGL',
      direction: 'Bespoke Hardware & GLSL Shaders',
    },
    archive: {
      headline: 'Distributed Cloud & Mobile Systems',
      narrative:
        'Self-hosted private email platform deployed on Oracle Cloud VM with automated 2048-bit DKIM, atmospheric digital readers with neural voice narration, and automated Telegram concierge webhook bots.',
      services: 'Infrastructure & Mobile Automation',
      duration: '2025 — 2026',
      ventures: 'Mail Engine, Flutter & Telegram Bots',
      direction: 'Cloud Architecture & Webhooks',
    },
  };

  const current = tabData[activeTab];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.masterGridContainer}>
        {/* ── ROW 1: HEADER (ALIGNED PRECISELY ACROSS 3 COLUMNS) ── */}
        <div className={styles.headerCol1}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
            Ivan Affriandi<sup>®</sup>
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
            onClick={() => setActiveTab('work')}
            className={`${styles.navItemBtn} ${activeTab === 'work' ? styles.navItemActive : ''}`}
          >
            Work
          </button>
          <button
            onClick={() => setActiveTab('atelier')}
            className={`${styles.navItemBtn} ${activeTab === 'atelier' ? styles.navItemActive : ''}`}
          >
            Atelier
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`${styles.navItemBtn} ${activeTab === 'archive' ? styles.navItemActive : ''}`}
          >
            Archive
          </button>
        </div>

        <div className={styles.headerCol3}>
          <div className={styles.locationClockBox}>
            <span>Tangerang, Indonesia</span>
            <span>{liveTime}</span>
          </div>

          <a href="mailto:ivan@ivanaffriandi.com" className={styles.startProjectBtn}>
            Start a Project
          </a>
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

        {/* ── ROW 3: METADATA ROW (ALIGNED PRECISELY WITH EACH COLUMN) ── */}
        <div className={styles.metaCol1}>
          <span className={styles.metaLabel}>Services &amp; Disciplines</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Timeline</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Ventures</span>
            <span className={styles.metaValue}>{current.ventures}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Art Direction</span>
          <span className={styles.metaValue}>{current.direction}</span>
        </div>

        {/* ── ROW 4: THE 3 PANORAMIC IMAGES (EXACT MATCH & ALIGNMENT) ── */}
        <a
          href="https://shuenstudio.com"
          target="_blank"
          rel="noreferrer"
          className={styles.imageCardCol1}
        >
          <img
            src="/work-showcase/flux_denim.jpg"
            alt="Physical Atelier & Motion Light"
          />
        </a>

        <a
          href="https://shuenstudio.com/po"
          target="_blank"
          rel="noreferrer"
          className={styles.imageCardCol2}
        >
          <img
            src="/work-showcase/flux_hand.jpg"
            alt="3D WebGL Configurator Light Refraction"
          />
        </a>

        <a
          href="https://ivanaffriandi.com/x"
          target="_blank"
          rel="noreferrer"
          className={styles.imageCardCol3}
        >
          <img
            src="/work-showcase/flux_portrait.jpg"
            alt="Atmospheric Digital Reader"
          />
        </a>

        {/* ── ROW 5: SEE MORE LINK (RIGHT-ALIGNED UNDER COLUMN 3) ── */}
        <div className={styles.seeMoreWrapper}>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.seeMoreLink}
          >
            See More →
          </a>
        </div>
      </div>
    </div>
  );
}
