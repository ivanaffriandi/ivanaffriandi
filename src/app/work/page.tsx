'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'process' | 'archive';

export default function WorkFluxDesignExactMasterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [liveTime, setLiveTime] = useState('12:42 PM (CET)');

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
        'Bridging tangible bespoke leathercraft with real-time 3D WebGL environments and distributed cloud infrastructure. A multidisciplinary practice focused on fluid generative motion, precision engineering, and timeless minimalism.',
      duration: 'May–Present, 2026',
      client: 'Independent Studio',
      artDirection: 'Physical & Digital Systems',
    },
    projects: {
      headline: 'Virtual Worlds',
      narrative:
        'Exploring immersive digital landscapes where reality blurs with the imagined. Virtual Worlds invites viewers into luminous environments of shifting forms, fluid light, and human presence redefined through layered, generative motion and dreamlike textures.',
      duration: 'May–August, 2026',
      client: 'Aster Studio',
      artDirection: 'Digital Design',
    },
    process: {
      headline: 'Craft & Engineering',
      narrative:
        'From hand-drafting pattern geometries and cutting vegetable-tanned hides in our workshop to writing GLSL procedural normal shaders, Three.js camera projection, and deploying high-throughput email relays on Oracle Cloud VM.',
      duration: 'Iterative Practice',
      client: 'Direct to Collector',
      artDirection: 'Atelier Architecture',
    },
    archive: {
      headline: 'Systems Archive',
      narrative:
        'A comprehensive repository of launched full-stack applications, cross-platform Flutter mobile clients, ambient soundscape reading engines, and automated Telegram concierge bots engineered across 2025 and 2026.',
      duration: '2025 — 2026',
      client: 'Ecosystem Catalog',
      artDirection: 'Full Architecture',
    },
  };

  const current = tabData[activeTab];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.masterGridContainer}>
        {/* ── ROW 1: HEADER (ALIGNED PRECISELY ACROSS 3 COLUMNS) ── */}
        <div className={styles.headerCol1}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
            FluxDesign<sup>®</sup>
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
            <span>Sofia, Bulgaria</span>
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

        {/* ── ROW 4: THE 3 PANORAMIC IMAGES (EXACT MATCH & ALIGNMENT) ── */}
        <div className={styles.imageCardCol1}>
          <img
            src="/work-showcase/flux_denim.jpg"
            alt="Denim Silhouette Motion"
          />
        </div>

        <div className={styles.imageCardCol2}>
          <img
            src="/work-showcase/flux_hand.jpg"
            alt="Hand Sky Light Refraction"
          />
        </div>

        <div className={styles.imageCardCol3}>
          <img
            src="/work-showcase/flux_portrait.jpg"
            alt="Ethereal Portrait Windblown"
          />
        </div>

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
