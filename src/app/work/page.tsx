'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'overview' | 'projects' | 'process' | 'archive';

export default function WorkFluxDesignPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderBoxRef = useRef<HTMLDivElement>(null);

  const [timezones, setTimezones] = useState({
    jakarta: '--:--',
    copenhagen: '--:--',
    tokyo: '--:--',
    newyork: '--:--',
    london: '--:--',
  });

  // Real-time world clocks ticker
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTime = (tz: string) => {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now);
      };

      setTimezones({
        jakarta: formatTime('Asia/Jakarta'),
        copenhagen: formatTime('Europe/Copenhagen'),
        tokyo: formatTime('Asia/Tokyo'),
        newyork: formatTime('America/New_York'),
        london: formatTime('Europe/London'),
      });
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSliderMove = (clientX: number) => {
    if (!sliderBoxRef.current) return;
    const rect = sliderBoxRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const tabContents = {
    overview: {
      title: 'Work & Disciplines',
      bio: 'Bridging physical bespoke leathercraft with real-time 3D WebGL environments and distributed cloud infrastructure. A hybrid practice merging tangible atelier materials with minimalist software engineering.',
      services: 'Art Direction & Engineering',
      duration: '2025 — Present',
      client: 'Independent Studio',
      direction: 'Physical & Digital Systems',
    },
    projects: {
      title: 'Work',
      bio: 'Exploring the intersection of physical bespoke leathercraft, procedural 3D WebGL environments, and distributed cloud email infrastructure. Built with uncompromising craft, fluid generative motion, and minimalist systems.',
      services: 'Creative Technology & Atelier',
      duration: 'August, 2026',
      client: 'SHŪ / EN & Personal Labs',
      direction: 'Digital Systems & Leather Goods',
    },
    process: {
      title: 'Craft & Engineering Process',
      bio: 'From pattern drafting and vegetable-tanned leather cutting in our Tangerang atelier to GLSL shader optimization, Three.js camera projection, and high-throughput AWS SES relay deployment on Oracle Cloud.',
      services: 'Prototyping & Production',
      duration: 'Continuous Iteration',
      client: 'Direct to Collector',
      direction: 'Bespoke Atelier Workflow',
    },
    archive: {
      title: 'Systems Archive',
      bio: 'A curated index of launched web applications, cross-platform Flutter mobile clients, Telegram concierge bots, and multi-sensory digital reading engines developed across 2025 and 2026.',
      services: 'Full Architecture Index',
      duration: '2025 — 2026',
      client: 'Ecosystem Archive',
      direction: 'Next.js 16 & Flutter',
    },
  };

  const currentContent = tabContents[activeTab];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.editorialContainer}>
        {/* ── TOP HEADER (FLUXDESIGN EXACT LAYOUT) ── */}
        <header className={styles.headerRow}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
            Ivan Affriandi<span className={styles.registeredSymbol}>®</span>
          </a>

          {/* Center Nav Tabs */}
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

          {/* Location & Live Clock */}
          <div className={styles.headerLocationClock}>
            <span className={styles.locationText}>Tangerang, Indonesia</span>
            <span className={styles.clockTimeText}>{timezones.jakarta} (WIB)</span>
          </div>

          {/* Start a Project Link */}
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.startProjectLink}>
            Start a Project
          </a>
        </header>

        {/* ── HERO SHOWCASE SECTION (FLUXDESIGN HERO) ── */}
        <section className={styles.heroShowcaseSection}>
          <div className={styles.sideOverviewLabel}>
            → {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={styles.heroContentCluster}
            >
              <h1 className={styles.projectMainHeading}>
                {currentContent.title}
              </h1>

              <p className={styles.projectNarrativeBio}>
                {currentContent.bio}
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── 4-COLUMN METADATA BAR (FLUXDESIGN METADATA) ── */}
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
              <span className={styles.metaColVal}>{currentContent.services}</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Duration</span>
              <span className={styles.metaColVal}>{currentContent.duration}</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Ventures</span>
              <span className={styles.metaColVal}>{currentContent.client}</span>
            </div>

            <div className={styles.metaColItem}>
              <span className={styles.metaColLabel}>Art Direction</span>
              <span className={styles.metaColVal}>{currentContent.direction}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── 3-COLUMN PANORAMIC VISUAL CARDS ── */}
        <motion.div 
          layout
          className={styles.panoramicVisualGrid}
        >
          {/* Card 1: Private Mail Engine with Interactive Dark/Light Drag Slider */}
          <div className={styles.panoramicCard}>
            <div
              ref={sliderBoxRef}
              className={styles.panoramicMediaBox}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={(e) => {
                if (isDraggingSlider) handleSliderMove(e.clientX);
              }}
              onClick={(e) => handleSliderMove(e.clientX)}
              onTouchMove={(e) => {
                if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
              }}
            >
              <div className={styles.sliderWrapperBox}>
                {/* Background: Dark Mode Image */}
                <img
                  src="/work-showcase/mail-dark.png"
                  alt="Private Mail Engine Dark Mode"
                  className={styles.sliderImgDark}
                />

                {/* Clipped: Light Mode Image */}
                <div
                  className={styles.sliderClipLight}
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src="/work-showcase/mail-light.png"
                    alt="Private Mail Engine Light Mode"
                    className={styles.sliderImgLight}
                    style={{ width: sliderBoxRef.current?.clientWidth || 400 }}
                  />
                </div>

                {/* Divider Line & Thumb */}
                <div
                  className={styles.sliderDividerLine}
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className={styles.sliderHandleBubble}>
                    ↔
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cardFooterCaption}>
              <h3 className={styles.cardFooterTitle}>
                Private Mail Engine <span>↗</span>
              </h3>
              <p className={styles.cardFooterSub}>
                Self-hosted infrastructure with AWS SES &amp; automated 2048-bit DKIM. Drag slider to compare Dark/Light modes.
              </p>
            </div>
          </div>

          {/* Card 2: Atmospheric Digital Reader (/x) */}
          <a
            href="https://ivanaffriandi.com/x"
            target="_blank"
            rel="noreferrer"
            className={styles.panoramicCard}
          >
            <div className={styles.panoramicMediaBox}>
              <img
                src="/work-showcase/reader-dark-woods.png"
                alt="Atmospheric Digital Reader"
              />
            </div>

            <div className={styles.cardFooterCaption}>
              <h3 className={styles.cardFooterTitle}>
                Atmospheric Digital Reader <span>↗</span>
              </h3>
              <p className={styles.cardFooterSub}>
                Multi-sensory digital reading with procedural wind ambient soundscape synthesis and neural TTS audio.
              </p>
            </div>
          </a>

          {/* Card 3: SHŪ / EN Studio & 3D Configurator */}
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.panoramicCard}
          >
            <div className={styles.panoramicMediaBox}>
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                alt="SHU / EN Bespoke Leather Goods"
              />
            </div>

            <div className={styles.cardFooterCaption}>
              <h3 className={styles.cardFooterTitle}>
                SHŪ / EN Studio · Leathercraft <span>↗</span>
              </h3>
              <p className={styles.cardFooterSub}>
                Handcrafted bespoke trifold journals, vegetable-tanned Nero hides, solid silver hardware &amp; 3D WebGL customizer.
              </p>
            </div>
          </a>
        </motion.div>

        {/* ── BOTTOM SEE MORE ACTION ── */}
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

        {/* ── WORLD CLOCKS & FOOTER BAR ── */}
        <footer className={styles.bottomStudioFooter}>
          <div className={styles.worldClocksGroup}>
            <div className={styles.clockItem}>
              <span className={styles.clockItemTime}>{timezones.copenhagen}</span>
              <span className={styles.clockItemCity}>Copenhagen</span>
            </div>
            <div className={styles.clockItem}>
              <span className={styles.clockItemTime}>{timezones.tokyo}</span>
              <span className={styles.clockItemCity}>Tokyo</span>
            </div>
            <div className={styles.clockItem}>
              <span className={styles.clockItemTime}>{timezones.newyork}</span>
              <span className={styles.clockItemCity}>New York</span>
            </div>
            <div className={styles.clockItem}>
              <span className={styles.clockItemTime}>{timezones.london}</span>
              <span className={styles.clockItemCity}>London</span>
            </div>
          </div>

          <div className={styles.socialFooterLinks}>
            <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>GitHub ↗</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>Instagram ↗</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>LinkedIn ↗</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className={styles.socialFooterLink}>X.com ↗</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
