'use client';

import React from 'react';
import Link from 'next/link';
import styles from './work.module.css';

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkSeamlessPortfolioPage() {
  return (
    <div className={styles.fullViewport}>
      <div className={styles.pageContainer}>
        {/* ── 1. CLEAN TOP NAVBAR ── */}
        <header className={styles.topNavbar}>
          {/* Top Left: Minimalist IA Monogram */}
          <Link href="/" className={styles.logoMonogram} title="Ivan Affriandi">
            IA
          </Link>

          {/* Top Right: Social Media Icons */}
          <div className={styles.navRightGroup}>
            <a
              href="https://instagram.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://github.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>

            <a
              href="https://x.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              title="X"
              aria-label="X"
            >
              <XIcon />
            </a>

            <a
              href="mailto:hello@ivanaffriandi.com"
              className={styles.socialBtn}
              title="Email Ivan"
              aria-label="Email"
            >
              <MailIcon />
            </a>
          </div>
        </header>

        {/* ── 2. HERO PROFILE (SEAMLESS LARGE HEAD ON PAGE) ── */}
        <section className={styles.heroProfileBlock}>
          <div className={styles.heroTopRow}>
            {/* Seamless Cutout Head */}
            <div className={styles.heroSeamlessHeadWrap}>
              <img
                src="/ivan-head.png"
                alt="Ivan Affriandi"
                className={styles.heroHeadImg}
              />
            </div>

            <div className={styles.heroInfoTextGroup}>
              <h1 className={styles.heroName}>Ivan Affriandi</h1>
              <p className={styles.heroRole}>Software Engineer &amp; Bespoke Leather Artisan</p>
            </div>
          </div>

          <p className={styles.heroBio}>
            Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. I build high-performance web systems with zero bloat and craft tactile physical goods by hand in my studio.
          </p>
        </section>

        {/* ── 3. FEATURED WORKS (SEAMLESS LIST, NO BOX CARDS) ── */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Featured Projects</h2>
            <span className={styles.sectionTag}>Selected Works</span>
          </div>

          <div className={styles.projectsList}>
            <div className={styles.projectRowItem}>
              <div className={styles.projectRowTop}>
                <h3 className={styles.projectName}>SHU / EN Studio Atelier</h3>
                <span className={styles.projectBadge}>Craft &amp; Web</span>
              </div>
              <p className={styles.projectDesc}>
                Handcrafted bespoke leather goods atelier paired with an interactive 3D product showcase. Built with Italian vegetable-tanned hides and custom Next.js e-commerce architecture.
              </p>
              <div className={styles.projectTagsGroup}>
                <span className={styles.projectTagItem}>Next.js</span>
                <span className={styles.projectTagItem}>Three.js</span>
                <span className={styles.projectTagItem}>Italian Leather</span>
                <span className={styles.projectTagItem}>925 Silver</span>
              </div>
            </div>

            <div className={styles.projectRowItem}>
              <div className={styles.projectRowTop}>
                <h3 className={styles.projectName}>Spatial 3D &amp; Shader Experiments</h3>
                <span className={styles.projectBadge}>Creative Tech</span>
              </div>
              <p className={styles.projectDesc}>
                Real-time procedural GLSL shaders, 3D interactive mesh configurators, and Web Audio synthesizers exploring tactile digital interactions.
              </p>
              <div className={styles.projectTagsGroup}>
                <span className={styles.projectTagItem}>WebGL 2.0</span>
                <span className={styles.projectTagItem}>GLSL Shaders</span>
                <span className={styles.projectTagItem}>Web Audio API</span>
                <span className={styles.projectTagItem}>Blender 3D</span>
              </div>
            </div>

            <div className={styles.projectRowItem}>
              <div className={styles.projectRowTop}>
                <h3 className={styles.projectName}>Self-Hosted Infrastructure &amp; Relays</h3>
                <span className={styles.projectBadge}>Systems</span>
              </div>
              <p className={styles.projectDesc}>
                Private cloud VMs, automated Docker microservices, dedicated SMTP relay clusters, and privacy-first web telemetry engines.
              </p>
              <div className={styles.projectTagsGroup}>
                <span className={styles.projectTagItem}>Oracle Cloud</span>
                <span className={styles.projectTagItem}>Docker</span>
                <span className={styles.projectTagItem}>PostgreSQL</span>
                <span className={styles.projectTagItem}>Cloudflare Edge</span>
              </div>
            </div>

            <div className={styles.projectRowItem}>
              <div className={styles.projectRowTop}>
                <h3 className={styles.projectName}>Minimalist Q&amp;A Engine</h3>
                <span className={styles.projectBadge}>Web App</span>
              </div>
              <p className={styles.projectDesc}>
                Interactive anonymous question-and-answer platform featuring real-time Firebase syncing, security IP firewall controls, and instant email dispatch.
              </p>
              <div className={styles.projectTagsGroup}>
                <span className={styles.projectTagItem}>Next.js 16</span>
                <span className={styles.projectTagItem}>React 19</span>
                <span className={styles.projectTagItem}>Firebase Realtime</span>
                <span className={styles.projectTagItem}>Framer Motion</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. CAPABILITIES & STACK ── */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>Capabilities &amp; Stack</h2>
            <span className={styles.sectionTag}>Technical Specs</span>
          </div>

          <div className={styles.skillsCategoriesGrid}>
            <div className={styles.skillGroup}>
              <span className={styles.skillGroupLabel}>Frontend &amp; Systems</span>
              <div className={styles.skillPillsFlex}>
                {['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Figma Tokens'].map((s) => (
                  <span key={s} className={styles.skillPillItem}>{s}</span>
                ))}
              </div>
            </div>

            <div className={styles.skillGroup}>
              <span className={styles.skillGroupLabel}>Creative Tech &amp; 3D</span>
              <div className={styles.skillPillsFlex}>
                {['Three.js', 'WebGL 2.0', 'GLSL Shaders', '3D Configurator', 'Web Audio API', 'Blender'].map((s) => (
                  <span key={s} className={styles.skillPillItem}>{s}</span>
                ))}
              </div>
            </div>

            <div className={styles.skillGroup}>
              <span className={styles.skillGroupLabel}>Cloud &amp; Infrastructure</span>
              <div className={styles.skillPillsFlex}>
                {['Oracle Cloud VM', 'Docker & Compose', 'PostgreSQL', 'Redis Cache', 'Cloudflare Edge SSL'].map((s) => (
                  <span key={s} className={styles.skillPillItem}>{s}</span>
                ))}
              </div>
            </div>

            <div className={styles.skillGroup}>
              <span className={styles.skillGroupLabel}>Physical Atelier &amp; Leather</span>
              <div className={styles.skillPillsFlex}>
                {['Italian Vegetable Leather', 'Pattern Drafting', 'Hand Saddle Stitching', 'Edge Burnishing', '925 Silver'].map((s) => (
                  <span key={s} className={styles.skillPillItem}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. BACKGROUND / ESSAY ── */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <h2 className={styles.sectionTitle}>The Strange Mix</h2>
            <span className={styles.sectionTag}>Background</span>
          </div>

          <div className={styles.editorialProse}>
            <p>
              I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying a long time ago. Some days I am deep in VS Code tuning Next.js rendering performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over spatial layout tokens, or saddle-stitching an Italian vegetable-tanned leather notebook cover with hot tea getting cold next to me.
            </p>
            <p>
              For me, the fun has always been building things from scratch. Whether it is an interactive web tool with zero bloated dependencies or a physical leather wallet designed to outlive all of us, the contrast between glowing pixels and raw tangible materials keeps my mind sharp and happy.
            </p>
          </div>
        </section>

        {/* ── 6. FOOTER WITH LARGE EMAIL BUTTON & COPYRIGHT ── */}
        <footer className={styles.footerArea}>
          <div className={styles.emailCtaRow}>
            <span className={styles.emailCtaLabel}>Have a project in mind?</span>
            <a href="mailto:hello@ivanaffriandi.com" className={styles.emailCtaBtn}>
              <span>hello@ivanaffriandi.com</span>
              <span>Send an Email ↗</span>
            </a>
          </div>

          <div className={styles.copyrightRow}>
            <span>&copy; {new Date().getFullYear()} Ivan Affriandi</span>
            <span>Tangerang, Indonesia</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
