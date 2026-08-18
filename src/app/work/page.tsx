'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './work.module.css';

export default function WorkClaireEditorialPortfolioPage() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const mailCardRef = useRef<HTMLDivElement>(null);

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

  const handleSliderMove = (clientX: number) => {
    if (!mailCardRef.current) return;
    const rect = mailCardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  return (
    <div className={styles.scandinavianViewport}>
      {/* ── TOP HEADER ── */}
      <header className={styles.topNavBar}>
        <a href="https://ivanaffriandi.com" className={styles.navBrandLogo}>
          IVAN AFFRIANDI
        </a>

        <nav className={styles.navMenuLinks}>
          <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.navLink}>STORIES</a>
          <a href="#gallery" className={styles.navLink}>PROJECTS</a>
          <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.navLink}>ATELIER</a>
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.navLink}>CONTACT</a>
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.menuHamburger}>☰</a>
        </nav>
      </header>

      {/* ── MAIN HORIZONTAL EDITORIAL STAGE ── */}
      <main id="gallery" className={styles.editorialStage}>
        {/* Vertical Left Title Column */}
        <aside className={styles.verticalTitleColumn}>
          <h1 className={styles.verticalRotatedText}>
            Ivan Affriandi is an Indonesian based creative technologist &amp; founder, displaying artisanal craft &amp; digital systems.
          </h1>
        </aside>

        {/* Horizontal Staggered Gallery Strip */}
        <div className={styles.galleryStrip}>
          {/* ── COLUMN 01: PRIVATE MAIL ENGINE (HIGH) ── */}
          <div className={`${styles.staggerCardCol} ${styles.staggerOffsetHigh}`}>
            <span className={styles.columnNumeral}>01</span>

            <div
              ref={mailCardRef}
              className={styles.portraitImageWrap}
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
              {/* Background: Dark Mode */}
              <img
                src="/work-showcase/mail-dark.png"
                alt="Mail Platform Dark Mode"
                className={styles.mailDarkImg}
              />

              {/* Clipped: Light Mode */}
              <div
                className={styles.mailLightClip}
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="/work-showcase/mail-light.png"
                  alt="Mail Platform Light Mode"
                  className={styles.mailLightImg}
                />
              </div>

              {/* Divider Handle */}
              <div
                className={styles.sliderDivider}
                style={{ left: `${sliderPos}%` }}
              >
                <div className={styles.sliderThumbIcon}>
                  ↔
                </div>
              </div>
            </div>

            <div className={styles.captionBlock}>
              <h2 className={styles.captionTitle}>
                Private Mail Platform · Dark &amp; Light
              </h2>
              <p className={styles.captionSub}>
                Self-hosted infrastructure on Oracle Cloud with AWS SES &amp; automated 2048-bit DKIM. Drag slider to compare.
              </p>
              <span className={styles.captionDate}>18.8.2026</span>
            </div>
          </div>

          {/* ── COLUMN 02: SHŪ / EN ATELIER (LOW / STAGGERED) ── */}
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={`${styles.staggerCardCol} ${styles.staggerOffsetLow}`}
          >
            <span className={styles.columnNumeral}>02</span>

            <div className={styles.portraitImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                alt="SHU / EN Leather Atelier"
              />
            </div>

            <div className={styles.captionBlock}>
              <h2 className={styles.captionTitle}>
                SHŪ / EN Studio · Bespoke Leather Goods
              </h2>
              <p className={styles.captionSub}>
                Handcrafted bespoke trifold journals, full-grain Nero leather, Japanese Moire linings &amp; solid 925 silver charms.
              </p>
              <span className={styles.captionDate}>15.8.2026</span>
            </div>
          </a>

          {/* ── COLUMN 03: DIGITAL READER CHAPTER 02 (HIGH) ── */}
          <a
            href="https://ivanaffriandi.com/x"
            target="_blank"
            rel="noreferrer"
            className={`${styles.staggerCardCol} ${styles.staggerOffsetHigh}`}
          >
            <span className={styles.columnNumeral}>03</span>

            <div className={styles.portraitImageWrap}>
              <img
                src="/work-showcase/reader-dark-woods.png"
                alt="Chapter 02: The Unconscious"
              />
            </div>

            <div className={styles.captionBlock}>
              <h2 className={styles.captionTitle}>
                Chapter 02: The Unconscious · Digital Reader
              </h2>
              <p className={styles.captionSub}>
                Minimalist high-contrast reading layout paired with generative wind ambient soundscapes.
              </p>
              <span className={styles.captionDate}>12.8.2026</span>
            </div>
          </a>

          {/* ── COLUMN 04: 3D WEBGL CONFIGURATOR (LOW / STAGGERED) ── */}
          <a
            href="https://shuenstudio.com/po"
            target="_blank"
            rel="noreferrer"
            className={`${styles.staggerCardCol} ${styles.staggerOffsetLow}`}
          >
            <span className={styles.columnNumeral}>04</span>

            <div className={styles.portraitImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                alt="3D WebGL Configurator"
              />
            </div>

            <div className={styles.captionBlock}>
              <h2 className={styles.captionTitle}>
                Three.js 3D WebGL Configurator Engine
              </h2>
              <p className={styles.captionSub}>
                Real-time procedural normal maps, live camera rigs, leather textures &amp; gold foil stamping.
              </p>
              <span className={styles.captionDate}>08.8.2026</span>
            </div>
          </a>

          {/* ── COLUMN 05: DIGITAL READER CHAPTER 05 (HIGH) ── */}
          <a
            href="https://ivanaffriandi.com/x"
            target="_blank"
            rel="noreferrer"
            className={`${styles.staggerCardCol} ${styles.staggerOffsetHigh}`}
          >
            <span className={styles.columnNumeral}>05</span>

            <div className={styles.portraitImageWrap}>
              <img
                src="/work-showcase/reader-dark-fire.png"
                alt="Chapter 05: Embers in the Woods"
              />
            </div>

            <div className={styles.captionBlock}>
              <h2 className={styles.captionTitle}>
                Chapter 05: Embers in the Woods
              </h2>
              <p className={styles.captionSub}>
                Warm amber dark mode typography with neural voice narration and reader telemetry.
              </p>
              <span className={styles.captionDate}>02.8.2026</span>
            </div>
          </a>
        </div>
      </main>

      {/* ── BOTTOM CLOCKS & TOUCH FOOTER ── */}
      <footer className={styles.bottomEditorialFooter}>
        <div className={styles.worldClocksInline}>
          <div className={styles.clockUnit}>
            <span className={styles.clockUnitTime}>{timezones.jakarta}</span>
            <span className={styles.clockUnitCity}>Jakarta (WIB)</span>
          </div>
          <div className={styles.clockUnit}>
            <span className={styles.clockUnitTime}>{timezones.copenhagen}</span>
            <span className={styles.clockUnitCity}>Copenhagen</span>
          </div>
          <div className={styles.clockUnit}>
            <span className={styles.clockUnitTime}>{timezones.tokyo}</span>
            <span className={styles.clockUnitCity}>Tokyo</span>
          </div>
          <div className={styles.clockUnit}>
            <span className={styles.clockUnitTime}>{timezones.newyork}</span>
            <span className={styles.clockUnitCity}>New York</span>
          </div>
          <div className={styles.clockUnit}>
            <span className={styles.clockUnitTime}>{timezones.london}</span>
            <span className={styles.clockUnitCity}>London</span>
          </div>
        </div>

        <div className={styles.footerTouchLinks}>
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.footerTouchLink}>Send an Email ↗</a>
          <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.footerTouchLink}>SHŪ / EN Atelier ↗</a>
          <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.footerTouchLink}>Mail Platform ↗</a>
          <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.footerTouchLink}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
