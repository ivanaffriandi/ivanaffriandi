'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

export default function WorkScandinavianPortfolioPage() {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [timezones, setTimezones] = useState({
    jakarta: '--:--',
    copenhagen: '--:--',
    tokyo: '--:--',
    newyork: '--:--',
    london: '--:--',
  });

  // Real-time world clocks
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

  const projects = [
    {
      id: 'shuen',
      name: 'SHŪ / EN STUDIO',
      disciplines: ['BESPOKE LEATHER', '3D WEBGL ENGINE', 'COMMERCE'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'configurator',
      name: '3D ATELIER CONFIGURATOR',
      disciplines: ['THREE.JS', 'PROCEDURAL TEXTURING', 'WEBGL'],
      year: '2026',
      url: 'https://shuenstudio.com/po',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'mail',
      name: 'PRIVATE MAIL PLATFORM',
      disciplines: ['CLOUD INFRASTRUCTURE', 'DKIM 2048-BIT', 'SES ENGINE'],
      year: '2026',
      url: 'https://mail.ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'book',
      name: 'INTERACTIVE BOOK CORE',
      disciplines: ['AUDIO WEB API', 'TTS SYNTHESIS', 'TELEMETRY'],
      year: '2026',
      url: 'https://ivanaffriandi.com/x',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'essays',
      name: 'ESSAYS & DESIGN ARCHIVE',
      disciplines: ['SWISS MINIMALISM', 'PUBLICATIONS', 'EDITORIAL'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const chronicles = [
    { date: '18.08.2026', title: 'SHŪ / EN Studio v2.6 with Bespoke 3D WebGL Configurator Deployed', url: 'https://shuenstudio.com/po' },
    { date: '02.08.2026', title: 'Self-Hosted Mail Infrastructure with Automated DKIM 2048-bit Signing', url: 'https://mail.ivanaffriandi.com' },
    { date: '15.07.2026', title: 'Spatial UI Interaction Models & Ambient Audio Soundscape Lab', url: 'https://ivanaffriandi.com/x' },
    { date: '28.05.2026', title: 'The Architecture of Cyber-Artisanal Craft (Publication)', url: 'https://ivanaffriandi.com' },
    { date: '10.03.2026', title: 'Tangerang Leather Atelier Custom Patternmaking System', url: 'https://shuenstudio.com' },
  ];

  return (
    <div className={styles.scandinavianViewport}>
      {/* Top Discipline Tag */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.topDisciplinePill}
      >
        Spatial Systems / Bespoke Leather / WebGL / Distributed Mail / Scandinavian Architecture
      </motion.div>

      {/* Main Scandinavian White Canvas */}
      <motion.main 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={styles.whiteCanvas}
      >
        {/* ── HEADER ROW ── */}
        <header className={styles.headerRow}>
          <div className={styles.brandLogoBox}>
            <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
              Ivan Affriandi — Studio
            </a>
            <span className={styles.brandLogoSub}>Creative Technologist &amp; Founder</span>
          </div>

          <nav className={styles.navLinksGroup}>
            <a href="#about" className={styles.navLinkItem}>About us</a>
            <a href="#projects" className={styles.navLinkItem}>Projects</a>
            <a href="#services" className={styles.navLinkItem}>Services</a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.navLinkItem}>Atelier ↗</a>
            <a href="#contact" className={styles.navLinkItem}>Contacts</a>
          </nav>
        </header>

        {/* ── HERO HEADLINE & INTRO ── */}
        <section id="about" className={styles.heroIntroSection}>
          <h1 className={styles.heroMainHeadline}>
            <span className={styles.headlineBullet}>●</span>
            Creative technology &amp; bespoke atelier studio
          </h1>

          {/* Locations & Socials Row */}
          <div className={styles.locationsRow}>
            <div className={styles.socialIconsRow}>
              <a href="https://github.com/ivanaffriandi" target="_blank" rel="noreferrer" className={styles.socialIconBtn} title="GitHub">
                GH
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialIconBtn} title="Instagram">
                IG
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialIconBtn} title="LinkedIn">
                IN
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className={styles.socialIconBtn} title="X / Twitter">
                X
              </a>
            </div>

            <div className={styles.locationTimeGroup}>
              <div className={styles.locationCol}>
                <span className={styles.locationHeader}>ATELIER HQ</span>
                <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.locationLink}>
                  JAKARTA / TANGERANG ↗
                </a>
              </div>
              <div className={styles.locationCol}>
                <span className={styles.locationHeader}>GLOBAL SERVERS</span>
                <span className={styles.locationLink}>
                  FRANKFURT · TOKYO · US-EAST
                </span>
              </div>
            </div>
          </div>

          {/* Hero Architectural Visual Banner */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.4 }}
            className={styles.heroVisualContainer}
          >
            <img 
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=80" 
              alt="Scandinavian Architectural Pavilion" 
            />
          </motion.div>

          <p className={styles.heroStatementText}>
            We are curious and work holistically, creating the setting for transformative digital systems and physical bespoke craft to flourish.
          </p>
        </section>

        {/* ── PROJECTS INTERACTIVE TABLE ── */}
        <section id="projects">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.headlineBullet} style={{ fontSize: '20px' }}>●</span>
              Projects
            </h2>
            <span className={styles.sectionSubtitle}>
              It all begins with curiosity. Nothing is more essential.
            </span>
          </div>

          <div className={styles.projectsTable}>
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className={styles.projectRow}
              >
                <div className={styles.projectNameCluster}>
                  <h3 className={styles.projectNameTitle}>{project.name}</h3>
                </div>

                <div className={styles.projectCategoryPills}>
                  {project.disciplines.map((d, dIdx) => (
                    <span key={dIdx} className={styles.disciplinePill}>{d}</span>
                  ))}
                </div>

                <span className={styles.projectYear}>{project.year}</span>
                <span className={styles.projectArrow}>→</span>

                {/* Floating Hover Image Preview */}
                <AnimatePresence>
                  {hoveredProjectId === project.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={styles.floatingPreviewCard}
                    >
                      <img src={project.image} alt={project.name} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </a>
            ))}
          </div>
        </section>

        {/* ── SERVICES / DISCIPLINES BENTO GRID ── */}
        <section id="services">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.headlineBullet} style={{ fontSize: '20px' }}>●</span>
              Services &amp; Disciplines
            </h2>
            <span className={styles.sectionSubtitle}>
              We work in spatial computing, distributed backends, and bespoke physical leather craft.
            </span>
          </div>

          <div className={styles.servicesBentoGrid} style={{ marginTop: '16px' }}>
            {/* Card 1: Featured Architecture & 3D */}
            <div className={`${styles.bentoCard} ${styles.bentoCardFeatured}`}>
              <div className={styles.bentoFeaturedImgBox}>
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80" 
                  alt="Bespoke Leather Atelier" 
                />
              </div>
              <div className={styles.bentoFeaturedContent}>
                <span className={styles.bentoNumber}>01</span>
                <h3 className={styles.bentoTitle}>Spatial &amp; 3D Web Engineering</h3>
                <p className={styles.bentoDesc}>
                  Designing high-performance WebGL 3D configurators, custom shaders, and interactive spatial computing interfaces.
                </p>
              </div>
            </div>

            {/* Card 2: Physical Craft */}
            <div className={styles.bentoCard}>
              <div>
                <span className={styles.bentoNumber}>02</span>
                <h3 className={styles.bentoTitle}>Bespoke Atelier Leathercraft</h3>
                <p className={styles.bentoDesc}>
                  Artisanal patternmaking, full-grain Nero leather, custom cord binding, and solid silver hardware.
                </p>
              </div>
            </div>

            {/* Card 3: Distributed Systems */}
            <div className={styles.bentoCard}>
              <div>
                <span className={styles.bentoNumber}>03</span>
                <h3 className={styles.bentoTitle}>Cloud &amp; Distributed Infrastructure</h3>
                <p className={styles.bentoDesc}>
                  Automated DKIM 2048-bit mail engines, Docker containers, and PostgreSQL clusters on Oracle VM.
                </p>
              </div>
            </div>

            {/* Card 4: Design Systems */}
            <div className={styles.bentoCard}>
              <div>
                <span className={styles.bentoNumber}>04</span>
                <h3 className={styles.bentoTitle}>Design Systems &amp; Typography</h3>
                <p className={styles.bentoDesc}>
                  Swiss grid architecture, optical hierarchy, and high-contrast editorial layouts.
                </p>
              </div>
            </div>

            {/* Card 5: Research & Innovation */}
            <div className={styles.bentoCard}>
              <div>
                <span className={styles.bentoNumber}>05</span>
                <h3 className={styles.bentoTitle}>Multimedia Innovation &amp; Audio</h3>
                <p className={styles.bentoDesc}>
                  Web Audio soundscapes, neural speech synthesis, and real-time telemetry pipelines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHRONICLE / NEWS SECTION ── */}
        <section>
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.headlineBullet} style={{ fontSize: '20px' }}>●</span>
              Chronicle
            </h2>
            <span className={styles.sectionSubtitle}>
              To stay in the loop on projects, insights, and releases.
            </span>
          </div>

          <div className={styles.chronicleList}>
            {chronicles.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={styles.chronicleRow}
              >
                <span className={styles.chronicleDate}>{item.date}</span>
                <span className={styles.chronicleTitle}>{item.title}</span>
                <span className={styles.chronicleArrow}>↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── GET IN TOUCH MASSIVE LINK ── */}
        <section id="contact" className={styles.getInTouchBox}>
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.getInTouchLink}>
            Get in touch ↗
          </a>
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

        {/* ── SCANDINAVIAN FOOTER ── */}
        <footer className={styles.scandinavianFooter}>
          <div className={styles.newsletterCol}>
            <span style={{ fontWeight: 800, color: '#111111' }}>STAY IN THE KNOW. SUBSCRIBE TO OUR STUDIO NEWSLETTER</span>
            <div className={styles.newsletterInputBox}>
              <input type="email" placeholder="Your email address..." className={styles.newsletterInput} />
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800 }}>→</button>
            </div>
          </div>

          <div className={styles.footerLinksRow}>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.footerLink}>SHŪ / EN Studio ↗</a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.footerLink}>Mail Platform ↗</a>
            <a href="https://ivanaffriandi.com/about" target="_blank" rel="noreferrer" className={styles.footerLink}>About ↗</a>
          </div>
        </footer>
      </motion.main>
    </div>
  );
}
