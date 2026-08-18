'use client';

import React from 'react';
import styles from './work.module.css';

export default function WorkEditorialPortfolioPage() {
  const works = [
    {
      index: '01',
      title: 'SHŪ / EN Studio',
      subtitle: 'Bespoke Leather Goods & Real-Time 3D WebGL Configurator',
      linkText: 'Explore Atelier',
      linkUrl: 'https://shuenstudio.com',
    },
    {
      index: '02',
      title: 'Private Mail Engine',
      subtitle: 'Self-Hosted High-Deliverability Infrastructure & DKIM 2048-bit',
      linkText: 'Open Webmail',
      linkUrl: 'https://mail.ivanaffriandi.com',
    },
    {
      index: '03',
      title: 'Interactive Book Core',
      subtitle: 'Multi-Sensory Digital Reader with Ambient Audio & Realtime Telemetry',
      linkText: 'Read Interactive Book',
      linkUrl: 'https://ivanaffriandi.com/x',
    },
    {
      index: '04',
      title: 'Essays & Architecture',
      subtitle: 'Publications on Swiss Minimalism, Spatial Computing & Software Craft',
      linkText: 'Read Publications',
      linkUrl: 'https://ivanaffriandi.com',
    },
  ];

  const services = [
    {
      index: '01',
      title: 'Spatial & Web Engineering',
      desc: 'Developing high-performance 3D WebGL configurators, fluid spatial interfaces, and next-generation Next.js applications with zero bloat.',
    },
    {
      index: '02',
      title: 'Bespoke Physical Atelier',
      desc: 'Crafting luxury leather goods, bespoke trifold journals, custom embossing, and silver hardware integration with artisanal precision.',
    },
    {
      index: '03',
      title: 'Cloud & Systems Architecture',
      desc: 'Architecting dedicated cloud instances, DKIM 2048-bit private mail relays, PostgreSQL clusters, and enterprise payment webhooks.',
    },
  ];

  return (
    <div className={styles.portfolioRoot}>
      <div className={styles.mainContainer}>
        {/* ── TOP EDITORIAL NAVBAR ── */}
        <header className={styles.topNav}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
            Ivan<span className={styles.brandLogoDot}>.</span>
          </a>

          <nav className={styles.navLinksGroup}>
            <a href="#works" className={styles.navLinkItem}>Works</a>
            <a href="#services" className={styles.navLinkItem}>Capabilities</a>
            <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.navLinkItem}>Atelier ↗</a>
            <a href="#contact" className={styles.navLinkItem}>Contact</a>
          </nav>
        </header>

        {/* ── 3-COLUMN EDITORIAL VISUAL SHOWCASE ── */}
        <section className={styles.visualShowcaseGrid}>
          {/* Card 1: 3D Atelier Object */}
          <div className={styles.showcaseCard}>
            <img 
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80" 
              alt="Bespoke Leather Atelier" 
            />
            <div className={styles.showcaseCardOverlay}>
              <span className={styles.showcaseBadge}>Physical Craft</span>
              <h4 className={styles.showcaseTitle}>SHŪ / EN Leather Goods</h4>
            </div>
          </div>

          {/* Card 2: Minimalist Hardware / Textures */}
          <div className={styles.showcaseCard}>
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80" 
              alt="Artisanal Texture" 
            />
            <div className={styles.showcaseCardOverlay}>
              <span className={styles.showcaseBadge}>Material Studio</span>
              <h4 className={styles.showcaseTitle}>Moire &amp; Nero Leather</h4>
            </div>
          </div>

          {/* Card 3: MacBook / 3D Configurator Stage */}
          <div className={styles.showcaseCard}>
            <img 
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80" 
              alt="High-Performance Computation" 
            />
            <div className={styles.showcaseCardOverlay}>
              <span className={styles.showcaseBadge}>Digital Engine</span>
              <h4 className={styles.showcaseTitle}>WebGL 3D Configurator</h4>
            </div>
          </div>
        </section>

        {/* ── MONUMENTAL EDITORIAL HERO HEADLINE ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroGreetingSub}>
            (HELLO, I&apos;M IVAN AFFRIANDI)
          </div>

          <h1 className={styles.monumentalHeadline}>
            CREATIVE <span className={styles.headlineSerifItalic}>end</span> TECHNOLOGIST
          </h1>

          <div className={styles.heroSplitRow}>
            <p className={styles.heroManifestoText}>
              I bridge the tangible world of bespoke physical leathercraft with the precision of spatial web engineering, distributed cloud systems, and uncompromising minimalist aesthetics.
            </p>

            <div className={styles.heroActionGroup}>
              <div className={styles.heroActionText}>
                Based in Indonesia. Available for creative direction, technical architecture, and bespoke commissions worldwide.
              </div>
              <a href="#contact" className={styles.btnDiscussPill}>
                <span>Let&apos;s discuss</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── FEATURED HERO RED MOCKUP STAGE ── */}
        <section className={styles.featuredHeroStage}>
          <div className={styles.stageHeader}>
            <h2 className={styles.stageTitle}>Featured Atelier Project</h2>
            <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'ui-monospace, monospace' }}>01 / 04</span>
          </div>

          <div className={styles.stageBanner}>
            <div>
              <span className={styles.stageBannerBadge}>LIVE FLAGSHIP VENTURE</span>
              <h3 className={styles.stageBannerHeading}>SHŪ / EN Studio</h3>
              <p className={styles.stageBannerSub}>
                Artisanal bespoke leather goods with real-time 3D WebGL customization, dynamic pricing calculations, DOKU payment gateway, and integrated courier tracking.
              </p>
            </div>

            <div className={styles.stageBannerLinks}>
              <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.btnBannerAction}>
                <span>Live Storefront</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
              <a href="https://shuenstudio.com/po" target="_blank" rel="noreferrer" className={styles.btnBannerAction} style={{ background: '#ffffff', color: '#000000' }}>
                <span>3D Configurator</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── WORKS & VENTURES LIST TABLE ── */}
        <section id="works" className={styles.worksTableSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              Selected Works &amp; Ventures
            </h2>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'ui-monospace, monospace' }}>
              (2025 — 2026)
            </span>
          </div>

          <div>
            {works.map((item) => (
              <a
                key={item.index}
                href={item.linkUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.worksTableRow}
              >
                <div className={styles.worksTableNameCluster}>
                  <span className={styles.worksTableIndex}>({item.index})</span>
                  <div>
                    <h3 className={styles.worksTableTitle}>{item.title}</h3>
                    <p className={styles.worksTableSub}>{item.subtitle}</p>
                  </div>
                </div>

                <div className={styles.worksTableAction}>
                  <span>{item.linkText}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── SERVICES / CAPABILITIES SECTION ── */}
        <section id="services">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              Capabilities &amp; Core Disciplines
            </h2>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'ui-monospace, monospace' }}>
              SERVICES
            </span>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((s) => (
              <div key={s.index} className={styles.serviceCard}>
                <div>
                  <span className={styles.serviceCardIndex}>({s.index})</span>
                  <h3 className={styles.serviceCardTitle}>{s.title}</h3>
                  <p className={styles.serviceCardDesc}>{s.desc}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginTop: '20px', fontFamily: 'ui-monospace, monospace' }}>
                  <span>EXPERTISE READY</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT & COMMISSION DESK ── */}
        <section id="contact" className={styles.contactSection}>
          <div>
            <h2 className={styles.contactTitle}>Let&apos;s start creating together.</h2>
            <p className={styles.contactSubtitle}>
              Open for bespoke leather commissions, spatial web engineering, and architecture consulting.
            </p>
          </div>

          <div className={styles.contactButtonsGroup}>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className={styles.btnContactLarge}>
              <span>WhatsApp Direct</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
            <a href="mailto:ivan@ivanaffriandi.com" className={`${styles.btnContactLarge} ${styles.btnContactSecondary}`}>
              <span>Email Me</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
