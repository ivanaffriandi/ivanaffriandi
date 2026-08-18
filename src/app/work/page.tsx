'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'process' | 'archive';

export default function WorkFluxDesignExactPortfolioPage() {
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
      client: 'Independent Atelier',
      artDirection: 'Physical & Digital Systems',
    },
    projects: {
      headline: 'Virtual Worlds',
      narrative:
        'Exploring immersive digital landscapes where reality blurs with the imagined. Virtual Worlds invites viewers into luminous environments of shifting forms, fluid light, and human presence redefined through layered, generative motion and dreamlike textures.',
      duration: 'May–August, 2026',
      client: 'Aster Studio & Labs',
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
      <div className={styles.editorialContainer}>
        {/* ── TOP HEADER BAR (EXACT FLUXDESIGN MATCH) ── */}
        <header className={styles.headerRow}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
            Ivan Affriandi<span className={styles.registeredSymbol}>®</span>
          </a>

          {/* Center Navigation Tabs */}
          <nav className={styles.centerNavTabs}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`${styles.navTabBtn} ${activeTab === 'overview' ? styles.navTabBtnActive : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`${styles.navTabBtn} ${activeTab === 'projects' ? styles.navTabBtnActive : ''}`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`${styles.navTabBtn} ${activeTab === 'process' ? styles.navTabBtnActive : ''}`}
            >
              Process
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`${styles.navTabBtn} ${activeTab === 'archive' ? styles.navTabBtnActive : ''}`}
            >
              Archive
            </button>
          </nav>

          {/* Right Cluster: Location Clock + Start a Project */}
          <div className={styles.rightHeaderCluster}>
            <div className={styles.headerLocationClock}>
              <span>Tangerang, Indonesia</span>
              <span>{liveTime}</span>
            </div>

            <a href="mailto:ivan@ivanaffriandi.com" className={styles.startProjectLink}>
              Start a Project
            </a>
          </div>
        </header>

        {/* ── HERO SHOWCASE STAGE (EXACT 2-COLUMN SPLIT) ── */}
        <section className={styles.heroShowcaseStage}>
          <div className={styles.sideOverviewLabel}>
            → {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={styles.heroContentCluster}
            >
              <h1 className={styles.projectMainHeading}>
                {current.headline}
              </h1>

              <p className={styles.projectNarrativeBio}>
                {current.narrative}
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── EXACT 4-COLUMN METADATA BAR ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + '-meta'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={styles.metadataGridRow}
          >
            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Services &amp; Info</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Duration</span>
              <span className={styles.metaColVal}>{current.duration}</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Client</span>
              <span className={styles.metaColVal}>{current.client}</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Art Direction</span>
              <span className={styles.metaColVal}>{current.artDirection}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── EXACT 3-COLUMN PANORAMIC VISUAL GRID ── */}
        <motion.div 
          layout
          className={styles.panoramicVisualGrid}
        >
          {/* Card 1: Left Portrait (Atmospheric Motion & Denim Silhouette) */}
          <div className={styles.panoramicCard}>
            <div className={styles.portraitMediaBox}>
              <img
                src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=85"
                alt="Atmospheric Silhouette and Light Motion"
              />
            </div>
          </div>

          {/* Card 2: Center Portrait (Reaching Hand & Sky Refractions) */}
          <div className={styles.panoramicCard}>
            <div className={styles.portraitMediaBox}>
              <img
                src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop&q=85"
                alt="Hand Reaching Sky Prism Refraction"
              />
            </div>
          </div>

          {/* Card 3: Right Landscape (Filmic Ethereal Portrait with Windblown Hair) */}
          <div className={styles.panoramicCard}>
            <div className={styles.landscapeMediaBox}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85"
                alt="Cinematic Ethereal Portrait"
              />
            </div>
          </div>
        </motion.div>

        {/* ── EXACT SEE MORE LINK (BELOW CARD 3) ── */}
        <div className={styles.seeMoreRow}>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.seeMoreBtn}
          >
            See More →
          </a>
        </div>

        {/* ── COMPACT BOTTOM FOOTER ── */}
        <footer className={styles.bottomStudioFooter}>
          <div>
            © 2026 Ivan Affriandi. All rights reserved.
          </div>

          <div className={styles.socialFooterLinks}>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>SHŪ / EN Studio ↗</a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>Mail Platform ↗</a>
            <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>Digital Reader ↗</a>
            <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>GitHub ↗</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
