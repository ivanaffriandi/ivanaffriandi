'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './work.module.css';

export default function WorkOrganizedSwissPortfolioPage() {
  // Interactive Dark/Light Slider Position (0 to 100%)
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareBoxRef = useRef<HTMLDivElement>(null);

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
          hour12: false,
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

  // Comparison slider mouse/touch drag handlers
  const handleSliderMove = (clientX: number) => {
    if (!compareBoxRef.current) return;
    const rect = compareBoxRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const archives = [
    {
      name: 'SHŪ / EN Mobile App',
      desc: 'Cross-platform Flutter & Dart mobile experience for workshop queues & client VIP orders.',
      stack: ['Flutter', 'Dart', 'iOS & Android'],
      year: '2026',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'shuen-bot Concierge',
      desc: 'Automated Telegram & WhatsApp dispatcher for instant order tracking & courier airway bills.',
      stack: ['Node.js', 'Telegram API', 'Webhooks'],
      year: '2026',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'KVR Objects & 3D Fabrication',
      desc: 'CAD industrial product modeling, 3D printing prototyping, and custom solid metal hardware.',
      stack: ['Blender CAD', '3D Prototyping', 'Hardware'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
    },
    {
      name: 'Equilibrium Academy Engine',
      desc: 'Interactive digital learning environment and creative engineering curriculum.',
      stack: ['TypeScript', 'Next.js', 'Education'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
    },
  ];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.editorialContainer}>
        {/* ── TOP SWISS BAR ── */}
        <header className={styles.headerRow}>
          <div className={styles.brandLogoBox}>
            <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
              Ivan Affriandi
            </a>
            <span className={styles.brandLogoSub}>Studio · Tangerang / Worldwide</span>
          </div>

          <nav className={styles.navLinksGroup}>
            <a href="#mail-engine" className={styles.navLinkItem}>01 / Mail</a>
            <a href="#reader-core" className={styles.navLinkItem}>02 / Reader</a>
            <a href="#atelier-3d" className={styles.navLinkItem}>03 / Atelier &amp; 3D</a>
            <a href="#archive" className={styles.navLinkItem}>04 / Archive</a>
            <a href="#contact" className={styles.navLinkItem}>05 / Contact</a>
          </nav>
        </header>

        {/* ── SWISS CHAOS HERO STATEMENT ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroTagRow}>
            <span className={styles.statusIndicator}>● OPEN FOR SELECT COMMISSIONS &amp; CODE PROJECTS</span>
            <span>INDEX 2025 — 2026</span>
          </div>

          <h1 className={styles.heroMainHeadline}>
            Handmade leather goods in the physical world. High-performance software in the digital one.
          </h1>

          <div className={styles.heroSplitGrid}>
            <p className={styles.heroBioText}>
              Hey, I&apos;m Ivan. I run <strong>SHŪ / EN Studio</strong> where I design bespoke leather journals, pattern cut raw vegetable-tanned hides, and build real-time 3D WebGL customizers. When I step away from the workbench, I deploy private self-hosted email infrastructure and tinker with multi-sensory reading experiences.
            </p>

            <div className={styles.heroQuickLinksBox}>
              <span className={styles.atelierStamp}>CONNECT &amp; EXPLORE ↗</span>
              <div className={styles.socialRow}>
                <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.socialPill}>
                  GitHub
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                  Instagram
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                  LinkedIn
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                  X.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE #1: PRIVATE MAIL PLATFORM (INTERACTIVE COMPARISON SLIDER) ── */}
        <section id="mail-engine" className={styles.comparisonSection}>
          <div className={styles.sectionHeaderBox}>
            <div className={styles.sectionTitleCluster}>
              <span className={styles.sectionIndexNum}>01</span>
              <h2 className={styles.sectionTitle}>Private Mail Engine — Dark vs Light</h2>
            </div>
            <span className={styles.sectionSubtitle}>
              Drag slider to inspect interface · Self-hosted on Oracle Cloud
            </span>
          </div>

          {/* Interactive Slide Comparison Box */}
          <div
            ref={compareBoxRef}
            className={styles.comparisonBox}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onMouseMove={(e) => {
              if (isDraggingSlider) handleSliderMove(e.clientX);
            }}
            onClick={(e) => handleSliderMove(e.clientX)}
            onTouchMove={handleTouchMove}
          >
            {/* Background: Dark Mode Image */}
            <img
              src="/work-showcase/mail-dark.png"
              alt="Mail Platform Dark Mode"
              className={styles.comparisonImageDark}
            />

            {/* Clipped Foreground: Light Mode Image */}
            <div
              className={styles.comparisonClipContainer}
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src="/work-showcase/mail-light.png"
                alt="Mail Platform Light Mode"
                className={styles.comparisonImageLight}
                style={{ width: compareBoxRef.current?.clientWidth || '100%' }}
              />
            </div>

            {/* Draggable Divider Line & Handle */}
            <div
              className={styles.comparisonDividerLine}
              style={{ left: `${sliderPos}%` }}
            >
              <div className={styles.comparisonHandleThumb}>
                ↔
              </div>
            </div>
          </div>

          <div className={styles.comparisonMetaRow}>
            <div className={styles.modeBadgeGroup}>
              <span className={styles.modeBadge}>LIGHT MODE ({Math.round(sliderPos)}%)</span>
              <span className={styles.modeBadge}>DARK MODE ({100 - Math.round(sliderPos)}%)</span>
            </div>
            <span>AWS SES Relay · DKIM 2048-bit RSA · 99.98% Deliverability · Docker</span>
          </div>
        </section>

        {/* ── FEATURE #2: ATMOSPHERIC DIGITAL READER (2-POSTER GRID) ── */}
        <section id="reader-core">
          <div className={styles.sectionHeaderBox}>
            <div className={styles.sectionTitleCluster}>
              <span className={styles.sectionIndexNum}>02</span>
              <h2 className={styles.sectionTitle}>Atmospheric Digital Reader</h2>
            </div>
            <span className={styles.sectionSubtitle}>
              Multi-sensory digital reading with soundscape audio synthesis
            </span>
          </div>

          <div className={styles.readerGrid}>
            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerImageWrap}>
                <img
                  src="/work-showcase/reader-dark-woods.png"
                  alt="Chapter 2: The Unconscious"
                />
              </div>
              <div className={styles.readerCardBody}>
                <span className={styles.readerCardTag}>CHAPTER 02 · AUDIO-FIRST EXPERIMENT</span>
                <h3 className={styles.readerCardHeadline}>
                  The Unconscious <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  High-contrast Swiss editorial reader paired with generative wind audio synthesis for immersive nocturnal reading sessions.
                </p>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerImageWrap}>
                <img
                  src="/work-showcase/reader-dark-fire.png"
                  alt="Chapter 5: Embers in the Woods"
                />
              </div>
              <div className={styles.readerCardBody}>
                <span className={styles.readerCardTag}>CHAPTER 05 · VOICE SYNTHESIS</span>
                <h3 className={styles.readerCardHeadline}>
                  Embers in the Woods <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  Warm amber dark mode typography integrated with real-time reader telemetry and neural text-to-speech narration.
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* ── FEATURE #3: ASYMMETRIC BENTO (ATELIER & 3D WEBGL ENGINE) ── */}
        <section id="atelier-3d">
          <div className={styles.sectionHeaderBox}>
            <div className={styles.sectionTitleCluster}>
              <span className={styles.sectionIndexNum}>03</span>
              <h2 className={styles.sectionTitle}>Bespoke Atelier &amp; 3D Configurator</h2>
            </div>
            <span className={styles.sectionSubtitle}>
              Physical leather goods paired with real-time Three.js shaders
            </span>
          </div>

          <div className={styles.bentoGridRow}>
            {/* Left Bento: Physical Atelier */}
            <a
              href="https://shuenstudio.com"
              target="_blank"
              rel="noreferrer"
              className={styles.bentoCard}
            >
              <div className={styles.bentoHeaderRow}>
                <h3 className={styles.bentoCardTitle}>SHŪ / EN Studio</h3>
                <span className={styles.bentoCardTag}>ATELIER COMMERCE ↗</span>
              </div>
              <p className={styles.bentoCardDesc}>
                Handcrafted bespoke leather journals, vegetable-tanned Nero hides, Japanese Moire fabric linings, custom cord bindings, and solid 925 silver charms crafted at our Tangerang workshop.
              </p>
              <div className={styles.bentoPillsWrap}>
                <span className={styles.bentoMiniPill}>Vegetable Tanned</span>
                <span className={styles.bentoMiniPill}>Solid Silver</span>
                <span className={styles.bentoMiniPill}>Custom Emboss</span>
                <span className={styles.bentoMiniPill}>DOKU Gateway</span>
              </div>
            </a>

            {/* Right Bento: 3D WebGL Configurator */}
            <a
              href="https://shuenstudio.com/po"
              target="_blank"
              rel="noreferrer"
              className={styles.bentoCard}
            >
              <div className={styles.bentoHeaderRow}>
                <h3 className={styles.bentoCardTitle}>3D WebGL Customizer</h3>
                <span className={styles.bentoCardTag}>THREE.JS SHADERS ↗</span>
              </div>
              <p className={styles.bentoCardDesc}>
                Procedural 3D normal mapping engine letting clients customize leather textures, cord colors, and gold foil embossing with live interactive camera rigs.
              </p>
              <div className={styles.bentoPillsWrap}>
                <span className={styles.bentoMiniPill}>Three.js</span>
                <span className={styles.bentoMiniPill}>WebGL 2.0</span>
                <span className={styles.bentoMiniPill}>GLSL Shaders</span>
                <span className={styles.bentoMiniPill}>Live Pricing</span>
              </div>
            </a>
          </div>
        </section>

        {/* ── COMPACT SWISS ARCHIVE TABLE ── */}
        <section id="archive">
          <div className={styles.sectionHeaderBox}>
            <div className={styles.sectionTitleCluster}>
              <span className={styles.sectionIndexNum}>04</span>
              <h2 className={styles.sectionTitle}>Selected Systems &amp; Experiments</h2>
            </div>
            <span className={styles.sectionSubtitle}>
              Mobile apps, automation bots &amp; CAD engineering
            </span>
          </div>

          <div className={styles.archiveTable}>
            {archives.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.archiveRow}
              >
                <div className={styles.archiveColName}>
                  <h3 className={styles.archiveTitle}>{item.name}</h3>
                  <p className={styles.archiveDesc}>{item.desc}</p>
                </div>

                <div className={styles.archiveColStack}>
                  {item.stack.map((s, sIdx) => (
                    <span key={sIdx} className={styles.archiveStackBadge}>{s}</span>
                  ))}
                </div>

                <span className={styles.archiveYear}>{item.year}</span>
                <span className={styles.archiveArrow}>→</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── MASSIVE SWISS TOUCHPOINT FOOTER ── */}
        <section id="contact" className={styles.contactTouchBox}>
          <h2 className={styles.contactHeadline}>
            Have an idea, want to commission bespoke leatherwork, or talk engineering?
          </h2>

          <div className={styles.contactDirectRow}>
            <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactBtnDark}>
              Send an Email ↗
            </a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.contactBtnOutline}>
              Visit SHŪ / EN Studio ↗
            </a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.contactBtnOutline}>
              Open Mail Platform ↗
            </a>
          </div>
        </section>

        {/* ── WORLD CLOCKS TICKER ROW ── */}
        <section className={styles.worldClocksGrid}>
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>{timezones.jakarta}</div>
            <div className={styles.clockCity}>JAKARTA (WIB)</div>
          </div>
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>{timezones.copenhagen}</div>
            <div className={styles.clockCity}>COPENHAGEN</div>
          </div>
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>{timezones.tokyo}</div>
            <div className={styles.clockCity}>TOKYO</div>
          </div>
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>{timezones.newyork}</div>
            <div className={styles.clockCity}>NEW YORK</div>
          </div>
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>{timezones.london}</div>
            <div className={styles.clockCity}>LONDON</div>
          </div>
        </section>

        {/* ── SWISS MINIMAL FOOTER ── */}
        <footer className={styles.scandinavianFooter}>
          <div>
            © 2026 IVAN AFFRIANDI. ALL RIGHTS RESERVED.
          </div>
          <div className={styles.footerLinksRow}>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.footerLink}>SHŪ / EN Studio</a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.footerLink}>Mail Platform</a>
            <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.footerLink}>Digital Reader</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
