'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './work.module.css';

export default function WorkPureSwissPortfolioPage() {
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
      desc: 'Mobile studio application for bespoke artisan queues and client order tracking.',
      stack: ['Flutter', 'Dart', 'iOS & Android'],
      year: '2026',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'shuen-bot Concierge',
      desc: 'Automated order dispatch and real-time courier airway bill webhook updates.',
      stack: ['Node.js', 'Telegram API', 'Webhooks'],
      year: '2026',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'KVR Objects & 3D Fabrication',
      desc: 'Industrial CAD modeling, 3D printing fabrication, and custom solid metal hardware.',
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
          <div>
            <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
              Ivan Affriandi
            </a>
            <span className={styles.brandLogoSub}>Studio · Tangerang / Worldwide</span>
          </div>

          <nav className={styles.navLinksGroup}>
            <a href="#mail" className={styles.navLinkItem}>01 / Mail</a>
            <a href="#reader" className={styles.navLinkItem}>02 / Reader</a>
            <a href="#atelier" className={styles.navLinkItem}>03 / Atelier &amp; 3D</a>
            <a href="#archive" className={styles.navLinkItem}>04 / Archive</a>
            <a href="#contact" className={styles.navLinkItem}>Contact ↗</a>
          </nav>
        </header>

        {/* ── SWISS HERO SECTION ── */}
        <section className={styles.heroSection}>
          <div>
            <h1 className={styles.heroMainHeadline}>
              Bespoke physical leathercraft &amp; high-performance software engineering.
            </h1>
          </div>

          <div className={styles.heroBioCol}>
            <p className={styles.heroBioText}>
              Hey, I&apos;m Ivan. I run <strong>SHŪ / EN Studio</strong> where I pattern-cut vegetable tanned hides and code real-time 3D WebGL customizers. When away from the workbench, I deploy self-hosted email infrastructure and build experimental digital readers.
            </p>

            <div className={styles.socialRow}>
              <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.socialPill}>
                GitHub ↗
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                Instagram ↗
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                LinkedIn ↗
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className={styles.socialPill}>
                X.com ↗
              </a>
            </div>
          </div>
        </section>

        {/* ── FEATURE 01: PRIVATE MAIL PLATFORM (UNCROPPED BROWSER MOCKUP WITH SLIDER) ── */}
        <section id="mail" className={styles.mailShowcaseWrapper}>
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionIndexTitle}>
              <span>(01)</span> Private Mail Engine
            </h2>
            <span className={styles.sectionIndexTag}>
              DRAG SLIDER TO COMPARE DARK &amp; LIGHT MODES
            </span>
          </div>

          {/* Clean Browser Mockup Frame */}
          <div className={styles.browserFrame}>
            <div className={styles.browserTopBar}>
              <div className={styles.windowDots}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <div className={styles.browserUrlPill}>
                mail.ivanaffriandi.com
              </div>
              <div style={{ width: '40px' }} />
            </div>

            {/* Draggable Slider with Proper Uncropped Sizing */}
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
              {/* Background: Dark Mode */}
              <img
                src="/work-showcase/mail-dark.png"
                alt="Mail Platform Dark Mode"
                className={styles.comparisonImageDark}
              />

              {/* Clipped Foreground: Light Mode */}
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

              {/* Handle */}
              <div
                className={styles.comparisonDividerLine}
                style={{ left: `${sliderPos}%` }}
              >
                <div className={styles.comparisonHandleThumb}>
                  ↔
                </div>
              </div>
            </div>
          </div>

          <div className={styles.mailMetaRow}>
            <span>Self-hosted email platform running on Oracle Cloud VM &amp; AWS SES relay with automated DKIM 2048-bit keys.</span>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" style={{ color: '#111', fontWeight: 700, textDecoration: 'none' }}>
              Launch mail.ivanaffriandi.com ↗
            </a>
          </div>
        </section>

        {/* ── FEATURE 02: ATMOSPHERIC DIGITAL READER (2 EDITORIAL POSTERS) ── */}
        <section id="reader">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionIndexTitle}>
              <span>(02)</span> Atmospheric Digital Reader
            </h2>
            <span className={styles.sectionIndexTag}>
              EXPERIMENTS IN READING &amp; SOUNDSCAPES
            </span>
          </div>

          <div className={styles.readerGrid}>
            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerCardThumb}>
                <img src="/work-showcase/reader-dark-woods.png" alt="Chapter 2" />
              </div>
              <div className={styles.readerCardBody}>
                <span className={styles.readerCardTag}>CHAPTER 02 · AUDIO-FIRST READING</span>
                <h3 className={styles.readerCardHeadline}>
                  The Unconscious <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  High-contrast Swiss reading layout paired with generative wind ambient soundscapes.
                </p>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerCardThumb}>
                <img src="/work-showcase/reader-dark-fire.png" alt="Chapter 5" />
              </div>
              <div className={styles.readerCardBody}>
                <span className={styles.readerCardTag}>CHAPTER 05 · VOICE SYNTHESIS</span>
                <h3 className={styles.readerCardHeadline}>
                  Embers in the Woods <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  Warm amber dark mode typography with neural voice narration and reader telemetry.
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* ── FEATURE 03: PHYSICAL ATELIER & 3D CONFIGURATOR ── */}
        <section id="atelier">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionIndexTitle}>
              <span>(03)</span> Atelier Craft &amp; 3D Graphics
            </h2>
            <span className={styles.sectionIndexTag}>
              SHŪ / EN BESPOKE LEATHER GOODS &amp; THREE.JS
            </span>
          </div>

          <div className={styles.atelierGrid}>
            {/* Card Left: Physical Leather Atelier */}
            <a
              href="https://shuenstudio.com"
              target="_blank"
              rel="noreferrer"
              className={styles.editorialCard}
            >
              <div className={styles.editorialCardThumb}>
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                  alt="SHU / EN Leather Atelier"
                />
              </div>
              <div className={styles.editorialCardBody}>
                <h3 className={styles.editorialCardTitle}>
                  SHŪ / EN Studio — Bespoke Leather Atelier <span>↗</span>
                </h3>
                <p className={styles.editorialCardDesc}>
                  Handcrafted bespoke leather journals made with vegetable-tanned Nero hides, Japanese Moire fabric linings, custom cord binding, and Solid 925 silver charms.
                </p>
                <div className={styles.pillRow}>
                  <span className={styles.miniPill}>Full-Grain Leather</span>
                  <span className={styles.miniPill}>Solid Silver</span>
                  <span className={styles.miniPill}>Tangerang Atelier</span>
                </div>
              </div>
            </a>

            {/* Card Right: 3D WebGL Configurator */}
            <a
              href="https://shuenstudio.com/po"
              target="_blank"
              rel="noreferrer"
              className={styles.editorialCard}
            >
              <div className={styles.editorialCardThumb}>
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                  alt="3D WebGL Configurator"
                />
              </div>
              <div className={styles.editorialCardBody}>
                <h3 className={styles.editorialCardTitle}>
                  Real-Time 3D WebGL Configurator <span>↗</span>
                </h3>
                <p className={styles.editorialCardDesc}>
                  Procedural Three.js normal map shader tool allowing clients to preview custom leather textures, cord colors, hardware finishes, and gold foil embossing.
                </p>
                <div className={styles.pillRow}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>WebGL 2.0</span>
                  <span className={styles.miniPill}>GLSL Shaders</span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ── FEATURE 04: ARCHIVE & SYSTEMS TABLE ── */}
        <section id="archive">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionIndexTitle}>
              <span>(04)</span> Selected Systems &amp; Archive
            </h2>
            <span className={styles.sectionIndexTag}>
              MOBILE APPS &amp; AUTOMATION BOTS
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
                    <span key={sIdx} className={styles.miniPill}>{s}</span>
                  ))}
                </div>

                <span className={styles.archiveYear}>{item.year}</span>
                <span className={styles.archiveArrow}>→</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── TOUCHPOINT ── */}
        <section id="contact" className={styles.contactBox}>
          <h3 className={styles.contactHeadline}>
            Have an idea, bespoke inquiry, or want to collaborate?
          </h3>

          <div className={styles.contactActionsRow}>
            <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactBtnDark}>
              Send an Email ↗
            </a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.contactBtnOutline}>
              Visit SHŪ / EN Atelier ↗
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

        {/* ── FOOTER ── */}
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
