'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

export default function WorkScandinavianPortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ATELIER' | 'WEBGL' | 'CLOUD' | 'MOBILE'>('ALL');
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  
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

  const projects = [
    {
      id: 'shuen',
      category: 'ATELIER',
      name: 'SHŪ / EN Studio',
      shortDesc: 'Handcrafted bespoke leather atelier & luxury e-commerce with real-time checkout.',
      disciplines: ['Leather Atelier', 'Full-Grain', 'Commerce'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'configurator',
      category: 'WEBGL',
      name: 'SHŪ / EN 3D WebGL Configurator',
      shortDesc: 'Interactive 3D procedural texturing tool with custom cords, leather swatches & foil embossing.',
      disciplines: ['Three.js', 'WebGL', 'Procedural 3D'],
      year: '2026',
      url: 'https://shuenstudio.com/po',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'mail',
      category: 'CLOUD',
      name: 'Private Mail Platform & SES Engine',
      shortDesc: 'Self-hosted email platform with automated DKIM 2048-bit RSA keys & 99.98% delivery rate.',
      disciplines: ['AWS SES', 'DKIM 2048', 'Dark & Light Mode', 'Docker'],
      year: '2026',
      url: 'https://mail.ivanaffriandi.com',
      image: '/work-showcase/mail-dark.png',
    },
    {
      id: 'book',
      category: 'WEBGL',
      name: 'Multi-Sensory Interactive Book Core',
      shortDesc: 'Experimental digital reader featuring ambient soundscapes and neural voice narration.',
      disciplines: ['Web Audio API', 'Neural TTS', 'Next.js 16'],
      year: '2026',
      url: 'https://ivanaffriandi.com/x',
      image: '/work-showcase/reader-dark-woods.png',
    },
    {
      id: 'mobile',
      category: 'MOBILE',
      name: 'SHŪ / EN Atelier Mobile App',
      shortDesc: 'Cross-platform mobile app for artisan order queues, customer CRM & VIP order tracking.',
      disciplines: ['Flutter', 'Dart', 'iOS & Android'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'bot',
      category: 'CLOUD',
      name: 'shuen-bot Automated Dispatcher',
      shortDesc: 'Telegram and WhatsApp bot integrations for instant order tracking and airway bill alerts.',
      disciplines: ['Node.js', 'Telegram API', 'Courier Webhooks'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'kvr',
      category: 'ATELIER',
      name: 'KVR Objects & Industrial 3D',
      shortDesc: 'CAD industrial product modeling, 3D printing prototypes & custom solid metal hardware.',
      disciplines: ['Blender CAD', '3D Prototyping', 'Hardware'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'equilibrium',
      category: 'WEBGL',
      name: 'Equilibrium Academy Engine',
      shortDesc: 'Interactive learning platform and curriculum for modern creative engineering.',
      disciplines: ['TypeScript', 'System Design', 'Education'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'essays',
      category: 'ATELIER',
      name: 'Cyber-Artisanal Craft & Design Theory',
      shortDesc: 'Essays on merging traditional leather crafting techniques with interactive 3D web code.',
      disciplines: ['Editorial', 'Design Theory', 'Minimalism'],
      year: '2025 – 2026',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const filteredProjects = projects.filter(
    (p) => activeFilter === 'ALL' || p.category === activeFilter
  );

  const skillsMatrix = [
    {
      number: '01',
      title: 'Physical Leather Craft',
      desc: 'Bespoke pattern drafting, vegetable tanned Nero & Moire leather, custom cord binding, solid 925 silver charms, and gold foil embossing.',
      tags: ['Pattern Drafting', 'Full-Grain Leather', 'Atelier Craft', 'Solid Silver', 'Embossing'],
    },
    {
      number: '02',
      title: 'Real-Time 3D & WebGL',
      desc: 'Building responsive 3D WebGL product configurators, procedural shaders, studio lighting rigs, and smooth interaction physics.',
      tags: ['Three.js', 'WebGL', 'GLSL Shaders', '3D Configurator', 'Blender CAD'],
    },
    {
      number: '03',
      title: 'Frontend & UI Engineering',
      desc: 'Crafting clean, responsive web apps using Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, and Framer Motion.',
      tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
    {
      number: '04',
      title: 'Mobile Apps (Flutter)',
      desc: 'Developing snappy iOS and Android mobile apps with Flutter & Dart for workshop queue management and client VIP concierge.',
      tags: ['Flutter', 'Dart', 'iOS & Android SDK', 'State Management', 'Mobile UI'],
    },
    {
      number: '05',
      title: 'Cloud Infrastructure & Mail',
      desc: 'Self-hosted Dockerized mail platform with AWS SES, automated DKIM 2048-bit keys, PostgreSQL databases, and Cloudflare DNS.',
      tags: ['AWS SES', 'DKIM 2048-bit', 'Docker', 'PostgreSQL', 'Oracle Cloud VM'],
    },
    {
      number: '06',
      title: 'AI & Audio Synthesis',
      desc: 'Multi-modal LLM integrations with Google Gemini, Web Audio API soundscapes, and neural text-to-speech audio synthesis.',
      tags: ['Google Gemini', 'Web Audio API', 'Neural TTS', 'Live Telemetry', 'Python'],
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
      <div className={styles.editorialContainer}>
        {/* ── TOP HEADER ROW ── */}
        <header className={styles.headerRow}>
          <div className={styles.brandLogoBox}>
            <a href="https://ivanaffriandi.com" className={styles.brandLogoTitle}>
              Ivan Affriandi — Studio
            </a>
            <span className={styles.brandLogoSub}>Creative Technologist &amp; Founder</span>
          </div>

          <nav className={styles.navLinksGroup}>
            <a href="#mail-showcase" className={styles.navLinkItem}>Mail Engine ↗</a>
            <a href="#reader-showcase" className={styles.navLinkItem}>Reader Core ↗</a>
            <a href="#projects" className={styles.navLinkItem}>Projects</a>
            <a href="#disciplines" className={styles.navLinkItem}>Disciplines</a>
            <a href="#contact" className={styles.navLinkItem}>Contact</a>
          </nav>
        </header>

        {/* ── CASUAL HERO SECTION ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroTagRow}>
            <span>●</span>
            <span>AVAILABLE FOR SELECT COMMISSIONS &amp; ENGINEERING PROJECTS</span>
          </div>

          <h1 className={styles.heroMainHeadline}>
            Things I make, tinker with, and care about.
          </h1>

          <p className={styles.heroBioText}>
            I spend my time between two worlds: handcrafting bespoke leather goods in my studio, and engineering fast, beautiful web apps and cloud systems on my laptop. Founder of <strong>SHŪ / EN Studio</strong>.
          </p>

          <div className={styles.heroMetaRow}>
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
                X / Twitter ↗
              </a>
            </div>

            <div style={{ fontSize: '11.5px', color: '#88888e', fontWeight: 600 }}>
              BASED IN INDONESIA · COMMISSIONS WORLDWIDE
            </div>
          </div>
        </section>

        {/* ── SPOTLIGHT #1: PRIVATE MAIL PLATFORM (INTERACTIVE DARK / LIGHT SLIDER) ── */}
        <section id="mail-showcase" className={styles.comparisonWrapper}>
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Private Mail Platform · UI Comparison
            </h2>
            <span className={styles.sectionSubtitle}>
              Drag the slider to compare Dark &amp; Light modes
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

          <div className={styles.comparisonFooterMeta}>
            <div className={styles.modeBadgeGroup}>
              <span className={styles.modeBadgeLight}>◧ Light Mode ({Math.round(sliderPos)}%)</span>
              <span className={styles.modeBadgeDark}>◨ Dark Mode ({100 - Math.round(sliderPos)}%)</span>
            </div>
            <span>Self-hosted email interface running on Oracle Cloud VM &amp; AWS SES relay</span>
          </div>
        </section>

        {/* ── SPOTLIGHT #2: INTERACTIVE DIGITAL BOOK READER (2 CHAPTER CARDS) ── */}
        <section id="reader-showcase">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Interactive Digital Reader &amp; Soundscapes
            </h2>
            <span className={styles.sectionSubtitle}>
              Two visual explorations from my interactive book project
            </span>
          </div>

          <div className={styles.readerGrid}>
            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerImageWrapper}>
                <img
                  src="/work-showcase/reader-dark-woods.png"
                  alt="Chapter 2: The Unconscious"
                />
              </div>
              <div className={styles.readerCardContent}>
                <h3 className={styles.readerCardTitle}>
                  Chapter 2: The Unconscious <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  Minimalist high-contrast reading layout with procedural wind ambient soundscape synthesis.
                </p>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.readerCard}
            >
              <div className={styles.readerImageWrapper}>
                <img
                  src="/work-showcase/reader-dark-fire.png"
                  alt="Chapter 5: Embers in the Woods"
                />
              </div>
              <div className={styles.readerCardContent}>
                <h3 className={styles.readerCardTitle}>
                  Chapter 5: Embers in the Woods <span>↗</span>
                </h3>
                <p className={styles.readerCardDesc}>
                  Warm amber typography mode with audio narration and live reader telemetry tracking.
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* ── ALL PROJECTS WITH LIVE HOVER PREVIEWS & FILTER TABS ── */}
        <section id="projects">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Featured Projects &amp; Products
            </h2>
            <span className={styles.sectionSubtitle}>
              A quick look at the main things I&apos;ve built recently
            </span>
          </div>

          {/* Filter Category Pills */}
          <div className={styles.filterTabsRow}>
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`${styles.filterTabBtn} ${activeFilter === 'ALL' ? styles.filterTabBtnActive : ''}`}
            >
              All Works ({projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('ATELIER')}
              className={`${styles.filterTabBtn} ${activeFilter === 'ATELIER' ? styles.filterTabBtnActive : ''}`}
            >
              Physical Atelier
            </button>
            <button
              onClick={() => setActiveFilter('WEBGL')}
              className={`${styles.filterTabBtn} ${activeFilter === 'WEBGL' ? styles.filterTabBtnActive : ''}`}
            >
              WebGL &amp; 3D Web
            </button>
            <button
              onClick={() => setActiveFilter('CLOUD')}
              className={`${styles.filterTabBtn} ${activeFilter === 'CLOUD' ? styles.filterTabBtnActive : ''}`}
            >
              Cloud &amp; Mail
            </button>
            <button
              onClick={() => setActiveFilter('MOBILE')}
              className={`${styles.filterTabBtn} ${activeFilter === 'MOBILE' ? styles.filterTabBtnActive : ''}`}
            >
              Mobile (Flutter)
            </button>
          </div>

          {/* Projects Interactive Table */}
          <div className={styles.projectsTable}>
            {filteredProjects.map((project) => (
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
                  <p className={styles.projectDescShort}>{project.shortDesc}</p>
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
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.18 }}
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

        {/* ── COMPLETE SKILLS & DISCIPLINES MATRIX ── */}
        <section id="disciplines">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              What I actually do day-to-day
            </h2>
            <span className={styles.sectionSubtitle}>
              Across physical crafting and software engineering
            </span>
          </div>

          <div className={styles.skillsSectionGrid}>
            {skillsMatrix.map((skill) => (
              <div key={skill.number} className={styles.skillCard}>
                <div className={styles.skillCardHeader}>
                  <h3 className={styles.skillCardTitle}>{skill.title}</h3>
                  <span className={styles.skillCardNumber}>{skill.number}</span>
                </div>

                <p className={styles.skillCardDesc}>{skill.desc}</p>

                <div className={styles.skillPillsWrap}>
                  {skill.tags.map((tag, tIdx) => (
                    <span key={tIdx} className={styles.techMiniPill}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHRONICLE & RELEASES ── */}
        <section>
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Recent Chronicle &amp; Releases
            </h2>
            <span className={styles.sectionSubtitle}>
              A quick timeline of things I&apos;ve shipped
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

        {/* ── GET IN TOUCH SECTION (WARM & CASUAL) ── */}
        <section id="contact" className={styles.getInTouchBox}>
          <span className={styles.getInTouchHeading}>HAVE AN IDEA OR WANT TO COMMISSION A PIECE?</span>
          <a href="mailto:ivan@ivanaffriandi.com" className={styles.getInTouchLink}>
            Let&apos;s get in touch ↗
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

        {/* ── FOOTER ── */}
        <footer className={styles.scandinavianFooter}>
          <div>
            © 2026 Ivan Affriandi. All rights reserved.
          </div>
          <div className={styles.footerLinksRow}>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.footerLink}>SHŪ / EN Studio ↗</a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.footerLink}>Mail Platform ↗</a>
            <a href="https://ivanaffriandi.com/about" target="_blank" rel="noreferrer" className={styles.footerLink}>About ↗</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
