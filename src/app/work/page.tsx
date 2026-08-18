'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

export default function WorkScandinavianPortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ATELIER' | 'WEBGL' | 'CLOUD' | 'MOBILE'>('ALL');
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
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

  const projects = [
    {
      id: 'shuen',
      category: 'ATELIER',
      name: 'SHŪ / EN Studio · Bespoke Leather Goods',
      shortDesc: 'Artisanal physical leather atelier & luxury e-commerce with real-time checkout & logistics dispatch.',
      disciplines: ['BESPOKE LEATHER', 'PHYSICAL ATELIER', 'COMMERCE'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'configurator',
      category: 'WEBGL',
      name: 'SHŪ / EN 3D WebGL Configurator',
      shortDesc: 'Real-time 3D procedural texturing engine with live leather finishes, custom cords & foil emboss preview.',
      disciplines: ['THREE.JS', 'WEBGL', 'PROCEDURAL SHADERS'],
      year: '2026',
      url: 'https://shuenstudio.com/po',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'mobile',
      category: 'MOBILE',
      name: 'SHŪ / EN Atelier Mobile App',
      shortDesc: 'Cross-platform mobile application for bespoke order crafting queues and client VIP concierge.',
      disciplines: ['FLUTTER', 'DART', 'IOS & ANDROID SDK'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'mail',
      category: 'CLOUD',
      name: 'Private Mail Engine & SES Infrastructure',
      shortDesc: 'Dedicated self-hosted email infrastructure with automated DKIM 2048-bit RSA keys & 99.98% deliverability.',
      disciplines: ['AWS SES', 'DKIM 2048-BIT', 'DOCKER', 'ORACLE CLOUD'],
      year: '2026',
      url: 'https://mail.ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'universe',
      category: 'WEBGL',
      name: 'Ivan Affriandi Universe & Gemini AI',
      shortDesc: 'Personal brand ecosystem with multilingual support (EN/NL/ZH/AR) and Google Gemini AI Q&A.',
      disciplines: ['NEXT.JS 16', 'GEMINI 2.5 AI', 'TURBOPACK'],
      year: '2026',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'book',
      category: 'WEBGL',
      name: 'Multi-Sensory Interactive Book Core',
      shortDesc: 'Experimental digital reader integrating Web Audio ambient soundscapes and neural TTS narration.',
      disciplines: ['WEB AUDIO API', 'TTS SYNTHESIS', 'TELEMETRY'],
      year: '2026',
      url: 'https://ivanaffriandi.com/x',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'bot',
      category: 'CLOUD',
      name: 'shuen-bot Automated Concierge',
      shortDesc: 'Telegram and WhatsApp bot integrations for automated order status notifications & courier airway bills.',
      disciplines: ['NODE.JS', 'TELEGRAM API', 'BITESHIP WEBHOOKS'],
      year: '2026',
      url: 'https://shuenstudio.com',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'kvr',
      category: 'ATELIER',
      name: 'KVR Objects & Industrial 3D Modeling',
      shortDesc: 'CAD industrial product design, 3D printing prototyping, and physical hardware fabrication.',
      disciplines: ['BLENDER', 'CAD MODELING', 'HARDWARE FABRICATION'],
      year: '2025',
      url: 'https://ivanaffriandi.com',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const filteredProjects = projects.filter(
    (p) => activeFilter === 'ALL' || p.category === activeFilter
  );

  const skillsMatrix = [
    {
      number: '01',
      title: 'Physical Leather Atelier & Craft',
      desc: 'Bespoke patternmaking, vegetable tanned Nero & Moire leathercraft, cord stitching, custom solid silver hardware, and gold foil embossing.',
      tags: ['Pattern Drafting', 'Full-Grain Leather', 'Atelier Craft', 'Silver Hardware', 'Custom Emboss'],
    },
    {
      number: '02',
      title: 'Real-Time 3D & WebGL Systems',
      desc: 'Building responsive 3D WebGL configurators, Three.js shaders, lighting rigs, procedural textures, and fluid interaction physics.',
      tags: ['Three.js', 'WebGL', 'GLSL Shaders', '3D Configurator', 'Blender CAD'],
    },
    {
      number: '03',
      title: 'Frontend & UI Engineering',
      desc: 'Next.js 16 App Router, React 19, Turbopack, Tailwind CSS, Framer Motion, and Swiss minimalist optical typography.',
      tags: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    },
    {
      number: '04',
      title: 'Cross-Platform Mobile (Flutter)',
      desc: 'Developing native-performing iOS and Android applications with Flutter & Dart for bespoke customer queues and live studio telemetry.',
      tags: ['Flutter', 'Dart', 'iOS & Android SDK', 'State Management', 'Mobile UX'],
    },
    {
      number: '05',
      title: 'Distributed Cloud & Mail Engine',
      desc: 'Self-hosted Dockerized mail platforms with AWS SES, automated DKIM 2048-bit key rotation, PostgreSQL databases, and Cloudflare DNS.',
      tags: ['AWS SES', 'DKIM 2048-bit', 'Docker', 'PostgreSQL', 'Oracle Cloud VM'],
    },
    {
      number: '06',
      title: 'Generative AI & Audio Synthesis',
      desc: 'Multi-modal LLM integrations (Google Gemini 2.5), Web Audio API ambient sound synthesis, and automated neural TTS narration.',
      tags: ['Google Gemini 2.5', 'Web Audio API', 'Neural TTS', 'Realtime Telemetry', 'Python'],
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
            <a href="#projects" className={styles.navLinkItem}>Projects</a>
            <a href="#disciplines" className={styles.navLinkItem}>Disciplines</a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.navLinkItem}>Atelier ↗</a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.navLinkItem}>Mail Engine ↗</a>
            <a href="#contact" className={styles.navLinkItem}>Contact</a>
          </nav>
        </header>

        {/* ── CASUAL INTERACTIVE HERO HEADLINE ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroTagRow}>
            <span>●</span>
            <span>CREATIVE ENGINEERING · PHYSICAL ATELIER · DISTRIBUTED SYSTEMS</span>
          </div>

          <h1 className={styles.heroMainHeadline}>
            What Ivan builds, designs &amp; <span className={styles.highlightUnderline}>obsesses over</span>.
          </h1>

          <p className={styles.heroBioText}>
            I bridge the tactile world of physical bespoke leathercraft with real-time 3D WebGL engines, distributed cloud infrastructure, and uncompromising minimalist software design. Founder of <strong>SHŪ / EN Studio</strong>.
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

            <div style={{ fontSize: '12px', color: '#777777', fontWeight: 600 }}>
              BASED IN INDONESIA · COMMISSIONS WORLDWIDE
            </div>
          </div>

          {/* Hero Visual Architectural Pavilion */}
          <div className={styles.heroVisualContainer}>
            <img 
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=80" 
              alt="Scandinavian Minimalist Architecture" 
            />
          </div>
        </section>

        {/* ── ALL PROJECTS WITH LIVE HOVER PREVIEWS & FILTER TABS ── */}
        <section id="projects">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Selected Projects &amp; Ventures
            </h2>
            <span className={styles.sectionSubtitle}>
              Interactive catalogue of physical goods, 3D engines &amp; cloud systems
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

        {/* ── COMPLETE SKILLS & DISCIPLINES MATRIX ── */}
        <section id="disciplines">
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Core Disciplines &amp; Technical Capabilities
            </h2>
            <span className={styles.sectionSubtitle}>
              Full architectural depth across physical crafting and digital engineering
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

        {/* ── CHRONICLE & NEWS SECTION ── */}
        <section>
          <div className={styles.sectionHeaderBox}>
            <h2 className={styles.sectionTitle}>
              <span>●</span>
              Chronicle &amp; Releases
            </h2>
            <span className={styles.sectionSubtitle}>
              A record of launched products, systems &amp; writings
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
          <span className={styles.getInTouchHeading}>HAVE AN IDEA OR BESPOKE INQUIRY?</span>
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
