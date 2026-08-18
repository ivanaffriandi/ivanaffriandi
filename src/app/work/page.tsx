'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './work.module.css';

export default function WorkSpatialStudioPortfolioPage() {
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

  const miniArchives = [
    {
      name: 'SHŪ / EN Mobile App',
      tag: 'FLUTTER / DART',
      desc: 'Mobile studio application for bespoke artisan queues and client order tracking.',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'shuen-bot Concierge',
      tag: 'TELEGRAM & WA',
      desc: 'Automated order dispatch and real-time courier airway bill webhook updates.',
      url: 'https://shuenstudio.com',
    },
    {
      name: 'KVR Objects & 3D Prototyping',
      tag: 'BLENDER CAD',
      desc: 'Industrial CAD modeling, 3D printing fabrication, and custom solid metal hardware.',
      url: 'https://ivanaffriandi.com',
    },
  ];

  return (
    <div className={styles.scandinavianViewport}>
      <div className={styles.editorialContainer}>
        {/* ── TOP REFINED SWISS BAR ── */}
        <header className={styles.headerRow}>
          <div className={styles.brandLogoBox}>
            <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
              Ivan Affriandi
            </a>
            <span className={styles.brandLogoSub}>Studio · Tangerang / Worldwide</span>
          </div>

          <nav className={styles.navLinksGroup}>
            <a href="#mail-card" className={styles.navLinkItem}>01 / Mail</a>
            <a href="#reader-card" className={styles.navLinkItem}>02 / Reader</a>
            <a href="#atelier-card" className={styles.navLinkItem}>03 / Atelier</a>
            <a href="#config-card" className={styles.navLinkItem}>04 / 3D WebGL</a>
            <a href="#contact" className={styles.navLinkItem}>Contact ↗</a>
          </nav>
        </header>

        {/* ── COMPACT HERO STATEMENT & SPLIT BIO ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeftCluster}>
            <span className={styles.heroStatusBadge}>● OPEN FOR COMMISSIONS &amp; CODE PROJECTS</span>
            <h1 className={styles.heroMainHeadline}>
              Crafting bespoke physical leather goods &amp; engineering high-performance digital tools.
            </h1>
          </div>

          <div className={styles.heroRightCluster}>
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

        {/* ── 2-COLUMN MULTI-DIMENSIONAL SPATIAL CANVAS ── */}
        <main className={styles.spatialWorkGrid}>
          {/* ════ LEFT COLUMN ════ */}
          <div className={styles.columnStack}>
            {/* Card 1: Private Mail Engine with Comparison Slider */}
            <article id="mail-card" className={styles.spatialCard}>
              <div className={styles.cardHeaderBar}>
                <span className={styles.cardTag}>01 / CLOUD &amp; MAIL INFRA</span>
                <h2 className={styles.cardTitle}>Private Mail Engine</h2>
              </div>

              {/* Interactive Comparison Slider */}
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
                <img
                  src="/work-showcase/mail-dark.png"
                  alt="Mail Platform Dark Mode"
                  className={styles.comparisonImageDark}
                />

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

                <div
                  className={styles.comparisonDividerLine}
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className={styles.comparisonHandleThumb}>
                    ↔
                  </div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.cardDesc}>
                  Self-hosted personal email system built with Docker on Oracle Cloud VM, AWS SES relay, and automated DKIM 2048-bit RSA rotation with 99.98% deliverability. Slide to check both themes.
                </p>
                <div className={styles.cardMetaRow}>
                  <div className={styles.pillGroup}>
                    <span className={styles.miniPill}>AWS SES</span>
                    <span className={styles.miniPill}>DKIM 2048</span>
                    <span className={styles.miniPill}>Docker</span>
                  </div>
                  <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.cardActionLink}>
                    Open Mail Platform ↗
                  </a>
                </div>
              </div>
            </article>

            {/* Card 2: SHŪ / EN Bespoke Atelier */}
            <article id="atelier-card" className={styles.spatialCard}>
              <div className={styles.cardHeaderBar}>
                <span className={styles.cardTag}>03 / BESPOKE LEATHER ATELIER</span>
                <h2 className={styles.cardTitle}>SHŪ / EN Studio</h2>
              </div>

              <div className={styles.cardMediaHero}>
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
                  alt="Bespoke Leather Craft"
                />
              </div>

              <div className={styles.cardBody}>
                <p className={styles.cardDesc}>
                  Artisanal physical leathercraft studio based in Tangerang. Crafting trifold journals with full-grain vegetable-tanned Nero hides, custom cord binding, and Solid 925 silver hardware.
                </p>
                <div className={styles.cardMetaRow}>
                  <div className={styles.pillGroup}>
                    <span className={styles.miniPill}>Nero Leather</span>
                    <span className={styles.miniPill}>Solid Silver</span>
                    <span className={styles.miniPill}>DOKU Gateway</span>
                  </div>
                  <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.cardActionLink}>
                    Explore Atelier ↗
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className={styles.columnStack}>
            {/* Card 3: Atmospheric Digital Reader with 2 Chapters */}
            <article id="reader-card" className={styles.spatialCard}>
              <div className={styles.cardHeaderBar}>
                <span className={styles.cardTag}>02 / DIGITAL READING LAB</span>
                <h2 className={styles.cardTitle}>Atmospheric Digital Reader</h2>
              </div>

              {/* 2-Chapter Visual Cards */}
              <div className={styles.readerMiniGrid}>
                <a
                  href="https://ivanaffriandi.com/x"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.readerMiniItem}
                >
                  <div className={styles.readerMiniThumb}>
                    <img src="/work-showcase/reader-dark-woods.png" alt="Chapter 2" />
                  </div>
                  <div className={styles.readerMiniInfo}>
                    <h3 className={styles.readerMiniTitle}>
                      Ch. 02: Unconscious <span>↗</span>
                    </h3>
                    <p className={styles.readerMiniSub}>Wind soundscape synthesis</p>
                  </div>
                </a>

                <a
                  href="https://ivanaffriandi.com/x"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.readerMiniItem}
                >
                  <div className={styles.readerMiniThumb}>
                    <img src="/work-showcase/reader-dark-fire.png" alt="Chapter 5" />
                  </div>
                  <div className={styles.readerMiniInfo}>
                    <h3 className={styles.readerMiniTitle}>
                      Ch. 05: Embers <span>↗</span>
                    </h3>
                    <p className={styles.readerMiniSub}>Amber typography &amp; TTS voice</p>
                  </div>
                </a>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.cardDesc}>
                  Experimental web reading experience integrating Web Audio ambient soundscapes with neural voice synthesis and live reader telemetry.
                </p>
                <div className={styles.cardMetaRow}>
                  <div className={styles.pillGroup}>
                    <span className={styles.miniPill}>Web Audio API</span>
                    <span className={styles.miniPill}>Neural TTS</span>
                    <span className={styles.miniPill}>Next.js 16</span>
                  </div>
                  <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.cardActionLink}>
                    Launch Reader ↗
                  </a>
                </div>
              </div>
            </article>

            {/* Card 4: 3D WebGL Configurator */}
            <article id="config-card" className={styles.spatialCard}>
              <div className={styles.cardHeaderBar}>
                <span className={styles.cardTag}>04 / 3D GRAPHICS &amp; WEBGL</span>
                <h2 className={styles.cardTitle}>3D WebGL Configurator</h2>
              </div>

              <div className={styles.cardMediaHero}>
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                  alt="3D Configurator Engine"
                />
              </div>

              <div className={styles.cardBody}>
                <p className={styles.cardDesc}>
                  Real-time procedural 3D customizer built with Three.js. Clients preview custom leather textures, cord colors, dynamic hardware finishes, and gold foil embossing with fluid camera controls.
                </p>
                <div className={styles.cardMetaRow}>
                  <div className={styles.pillGroup}>
                    <span className={styles.miniPill}>Three.js</span>
                    <span className={styles.miniPill}>WebGL 2.0</span>
                    <span className={styles.miniPill}>GLSL Shaders</span>
                  </div>
                  <a href="https://shuenstudio.com/po" target="_blank" rel="noreferrer" className={styles.cardActionLink}>
                    Open 3D Configurator ↗
                  </a>
                </div>
              </div>
            </article>
          </div>
        </main>

        {/* ── BOTTOM ARCHIVE STRIP (3-COLUMN CLEAN GRID) ── */}
        <section className={styles.archiveSection}>
          <div className={styles.archiveHeader}>
            <h3 className={styles.archiveHeaderTitle}>Selected Systems &amp; Experiments</h3>
            <span style={{ fontSize: '11px', color: '#88888e', fontFamily: 'ui-monospace, monospace' }}>INDEX 2025 — 2026</span>
          </div>

          <div className={styles.archiveGrid}>
            {miniArchives.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.archiveMiniCard}
              >
                <h4 className={styles.archiveMiniName}>
                  {item.name} <span>↗</span>
                </h4>
                <p className={styles.archiveMiniDesc}>{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ── TOUCHPOINT BANNER ── */}
        <section id="contact" className={styles.touchpointGrid}>
          <div>
            <h3 className={styles.touchHeadline}>
              Have an idea, bespoke inquiry, or want to collaborate?
            </h3>
          </div>

          <div className={styles.touchActionsRow}>
            <a href="mailto:ivan@ivanaffriandi.com" className={styles.touchBtnPrimary}>
              Send an Email ↗
            </a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.touchBtnSecondary}>
              Visit Atelier ↗
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
