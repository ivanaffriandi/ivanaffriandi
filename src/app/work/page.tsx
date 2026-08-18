'use client';

import React, { useState } from 'react';
import styles from './work.module.css';

export default function WorkPortfolioPage() {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ATELIER' | 'SYSTEMS' | 'WRITING'>('ALL');

  const projects = [
    {
      id: 'shuen',
      category: 'ATELIER',
      categoryLabel: 'Physical Craft × Generative 3D',
      title: 'SHŪ / EN Studio · Bespoke Leather Goods',
      description: 'An artisanal leather atelier and luxury e-commerce experience powered by real-time 3D WebGL customization engine, responsive pricing matrix, and dedicated logistics pipeline.',
      techStack: ['Three.js', 'WebGL', 'Next.js 16', 'PostgreSQL', 'DOKU Engine', 'Biteship Logistics'],
      primaryLink: { label: 'Storefront', url: 'https://shuenstudio.com' },
      secondaryLink: { label: '3D Configurator', url: 'https://shuenstudio.com/po' },
    },
    {
      id: 'mail',
      category: 'SYSTEMS',
      categoryLabel: 'Distributed Infrastructure',
      title: 'Private Email Engine & SES Platform',
      description: 'A custom-engineered mail platform with automated DKIM 2048-bit RSA key rotation, SES deliverability monitor (99.98% inbox rate), and macOS-inspired web client.',
      techStack: ['AWS SES', 'DKIM 2048-bit', 'Docker', 'Oracle Cloud VM', 'Next.js 16', 'Tailwind CSS'],
      primaryLink: { label: 'Open Webmail', url: 'https://mail.ivanaffriandi.com' },
      secondaryLink: null,
    },
    {
      id: 'essays',
      category: 'WRITING',
      categoryLabel: 'Design & Engineering Writing',
      title: 'Essays on Modern Craft & Computation',
      description: 'Longform writings and critical reflections on Swiss minimalist design, spatial computing paradigms, web performance, and the synergy of digital code with physical leathercraft.',
      techStack: ['Swiss Typography', 'Design Systems', 'Editorial Layout', 'Minimalism'],
      primaryLink: { label: 'Read Essays', url: 'https://ivanaffriandi.com' },
      secondaryLink: { label: 'Ask AI', url: 'https://ivanaffriandi.com/ask' },
    },
    {
      id: 'book',
      category: 'SYSTEMS',
      categoryLabel: 'Interactive Multimedia Core',
      title: 'Multi-Sensory Book & Reader Analytics',
      description: 'An experimental digital reading platform featuring ambient soundscapes, neural text-to-speech audio narration, and real-time reader session analytics.',
      techStack: ['Web Audio API', 'TTS Synthesis', 'Realtime Telemetry', 'Next.js'],
      primaryLink: { label: 'Explore Interactive Book', url: 'https://ivanaffriandi.com/x' },
      secondaryLink: null,
    },
  ];

  const filteredProjects = projects.filter(p => filterCategory === 'ALL' || p.category === filterCategory);

  const timelineItems = [
    {
      date: 'AUG 2026',
      title: 'SHŪ / EN Studio v2.6 Launch',
      description: 'Shipped real-time 3D leather configurator, DOKU payment integration, and Biteship courier tracking engine.',
    },
    {
      date: 'JUL 2026',
      title: 'Private Mail Platform & DKIM 2048-bit Infrastructure',
      description: 'Built and deployed self-hosted mail platform with high deliverability scoring on Oracle Cloud VM.',
    },
    {
      date: 'MAY 2026',
      title: 'Apple visionOS Spatial Web Experiments',
      description: 'Authored spatial glass interface concepts with high-depth specular refraction and fluid tactile responsiveness.',
    },
    {
      date: '2025 – 2026',
      title: 'Bespoke Atelier Leathercraft Inception',
      description: 'Established the physical leather workshop in Tangerang, developing trifold patterns, cord finishes, and custom charm hardware.',
    },
  ];

  return (
    <div className={styles.spatialViewport}>
      <div className={styles.spatialContainer}>
        {/* ── TOP VISION OS SPATIAL NAVBAR ── */}
        <header className={styles.spatialNav}>
          <a href="https://ivanaffriandi.com" className={styles.spatialNavBrand}>
            <div className={styles.navAvatar}>
              <img src="/profile.jpg" alt="Ivan Affriandi" onError={(e) => { (e.target as HTMLImageElement).src = 'https://github.com/ivanaffriandi.png'; }} />
            </div>
            <div>
              <div className={styles.navBrandTitle}>Ivan Affriandi</div>
              <div className={styles.navBrandRole}>work.ivanaffriandi.com</div>
            </div>
          </a>

          {/* Filter Segmented Pills */}
          <div className={styles.navSegmentedPills}>
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`${styles.navPillBtn} ${filterCategory === 'ALL' ? styles.navPillBtnActive : ''}`}
            >
              All Works
            </button>
            <button
              onClick={() => setFilterCategory('ATELIER')}
              className={`${styles.navPillBtn} ${filterCategory === 'ATELIER' ? styles.navPillBtnActive : ''}`}
            >
              Atelier
            </button>
            <button
              onClick={() => setFilterCategory('SYSTEMS')}
              className={`${styles.navPillBtn} ${filterCategory === 'SYSTEMS' ? styles.navPillBtnActive : ''}`}
            >
              Systems
            </button>
            <button
              onClick={() => setFilterCategory('WRITING')}
              className={`${styles.navPillBtn} ${filterCategory === 'WRITING' ? styles.navPillBtnActive : ''}`}
            >
              Writing
            </button>
          </div>

          <div className={styles.navRightActions}>
            <a href="https://ivanaffriandi.com" className={styles.btnVisionAction}>
              <span>Personal Space</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </header>

        {/* ── SPATIAL HERO IDENTITY PANEL ── */}
        <section className={styles.spatialHeroPanel}>
          <div className={styles.heroLeftContent}>
            <div className={styles.spatialBadgeLive}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span>ACTIVE CREATIVE TECHNOLOGIST &amp; ATELIER FOUNDER</span>
            </div>

            <h1 className={styles.heroMainHeading}>
              Engineering digital systems &amp; crafting physical objects.
            </h1>

            <p className={styles.heroBioText}>
              I build spatial interfaces, robust distributed platforms, and bespoke physical leather goods. Founder of <strong>SHŪ / EN Studio</strong>. Dedicated to uncompromising minimalism, tactile excellence, and ultra-high performance.
            </p>

            <div className={styles.heroTagGrid}>
              <span className={styles.spatialSkillTag}>Spatial Web Design</span>
              <span className={styles.spatialSkillTag}>Three.js &amp; WebGL</span>
              <span className={styles.spatialSkillTag}>Next.js 16</span>
              <span className={styles.spatialSkillTag}>AWS SES &amp; Distributed Mail</span>
              <span className={styles.spatialSkillTag}>Physical Atelier Craft</span>
              <span className={styles.spatialSkillTag}>PostgreSQL &amp; Cloudflare</span>
            </div>
          </div>

          <div className={styles.heroRightAvatarCard}>
            <img src="/profile.jpg" alt="Ivan Affriandi" onError={(e) => { (e.target as HTMLImageElement).src = 'https://github.com/ivanaffriandi.png'; }} />
          </div>
        </section>

        {/* ── SELECTED PROJECTS SECTION ── */}
        <div>
          <div className={styles.sectionHeaderBox}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Works &amp; Ventures</h2>
              <span className={styles.sectionSubtitle}>Selected commercial products, open engines &amp; physical atelier creations</span>
            </div>
          </div>

          <div className={styles.spatialProjectGrid} style={{ marginTop: '20px' }}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={styles.spatialCardLarge}>
                <div>
                  <div className={styles.cardTopRow}>
                    <span className={styles.cardCategoryBadge}>{project.categoryLabel}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>

                  <h3 className={styles.cardTitle}>{project.title}</h3>
                  <p className={styles.cardDescription}>{project.description}</p>

                  <div className={styles.cardTechStackRow}>
                    {project.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className={styles.cardTechPill}>{tech}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardActionLinksRow}>
                  {project.primaryLink && (
                    <a
                      href={project.primaryLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.btnCardLink}
                    >
                      <span>{project.primaryLink.label}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  )}

                  {project.secondaryLink && (
                    <a
                      href={project.secondaryLink.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${styles.btnCardLink} ${styles.btnCardLinkSecondary}`}
                    >
                      <span>{project.secondaryLink.label}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTIVITIES & MILESTONES SECTION ── */}
        <div>
          <div className={styles.sectionHeaderBox}>
            <div>
              <h2 className={styles.sectionTitle}>Activities &amp; Engineering Chronicle</h2>
              <span className={styles.sectionSubtitle}>Timeline of launches, infrastructure milestones &amp; atelier experiments</span>
            </div>
          </div>

          <div className={styles.timelineGlassContainer} style={{ marginTop: '20px' }}>
            {timelineItems.map((item, idx) => (
              <div key={idx} className={styles.timelineItem}>
                <div className={styles.timelineDateBadge}>{item.date}</div>
                <div className={styles.timelineContent}>
                  <h4 className={styles.timelineTitle}>{item.title}</h4>
                  <p className={styles.timelineDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SPATIAL FOOTER ── */}
        <footer className={styles.spatialFooter}>
          <div>
            © 2026 Ivan Affriandi. All rights reserved.
          </div>
          <div className={styles.footerLinks}>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.footerLinkItem}>
              SHŪ / EN Studio ↗
            </a>
            <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.footerLinkItem}>
              Mail Platform ↗
            </a>
            <a href="https://ivanaffriandi.com/about" target="_blank" rel="noreferrer" className={styles.footerLinkItem}>
              About ↗
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
