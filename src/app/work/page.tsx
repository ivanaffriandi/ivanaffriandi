'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'process' | 'archive';

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [liveTime, setLiveTime] = useState('12:42 PM (WIB)');

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
      headline: 'Creative Direction',
      narrative:
        'Bridging physical bespoke leathercraft with real-time 3D WebGL environments and distributed cloud infrastructure. A hybrid studio practice merging tactile atelier materials with fluid generative motion and precision software engineering.',
      duration: '2025 — Present',
      client: 'Independent Studio',
      artDirection: 'Physical & Digital Systems',
    },
    projects: {
      headline: "Ivan's Work",
      narrative:
        'Exploring the intersection of physical bespoke leathercraft, procedural 3D WebGL environments, and distributed cloud email infrastructure. Built with uncompromising craft, fluid generative motion, and minimalist systems.',
      duration: '2025 — 2026',
      client: 'SHŪ / EN & Personal Labs',
      artDirection: 'Digital Systems & Physical Goods',
    },
    process: {
      headline: 'Craft & Engineering',
      narrative:
        'From pattern drafting and vegetable-tanned leather cutting in our Tangerang atelier to GLSL shader optimization, Three.js camera projection, and high-throughput AWS SES relay deployment on Oracle Cloud VM.',
      duration: 'Continuous Iteration',
      client: 'Direct to Collector',
      artDirection: 'Atelier Architecture',
    },
    archive: {
      headline: 'Systems Archive',
      narrative:
        'A comprehensive repository of launched web applications, cross-platform Flutter mobile clients, atmospheric digital reading engines, and automated Telegram concierge bots engineered across 2025 and 2026.',
      duration: '2025 — 2026',
      client: 'Ecosystem Archive',
      artDirection: 'Next.js 16 & Flutter',
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
            onClick={() => setActiveTab('projects')}
            className={`${styles.navItemBtn} ${activeTab === 'projects' ? styles.navItemActive : ''}`}
          >
            Projects
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
          <span className={styles.metaLabel}>Services &amp; Info</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Duration</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Client</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Art Direction</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: THE 3 PANORAMIC IMAGES (MAIN WEB ASSETS) ── */}
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
