'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './work.module.css';

type TabType = 'about' | 'skills' | 'philosophy';

export default function WorkEditorialPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  return (
    <div className={styles.fullDesktopViewport}>
      <div className={styles.editorialContainer}>
        {/* ── 1. CLEAN EDITORIAL HEADER ── */}
        <header className={styles.topEditorialNav}>
          <Link href="/" className={styles.navBrandLink}>
            <span className={styles.navStatusDot} />
            <span>Ivan Affriandi</span>
          </Link>

          <div className={styles.navRightLinks}>
            <Link href="/" className={styles.navLinkItem}>
              Home
            </Link>
            <Link href="/ask" className={styles.navLinkItem}>
              Ask
            </Link>
            <a href="mailto:hello@ivanaffriandi.com" className={styles.navLinkItem}>
              Contact
            </a>
          </div>
        </header>

        {/* ── 2. INTRO EDITORIAL STATEMENT & METADATA ── */}
        <section className={styles.heroIntroBlock}>
          <h1 className={styles.largeStatementText}>
            Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. Building lightweight digital systems and crafting heirloom physical goods.
          </h1>

          <div className={styles.metadataStripRow}>
            <div className={styles.metaItemCol}>
              <span className={styles.metaColLabel}>Base</span>
              <span className={styles.metaColValue}>Tangerang, ID</span>
            </div>

            <div className={styles.metaItemCol}>
              <span className={styles.metaColLabel}>Discipline</span>
              <span className={styles.metaColValue}>Full-Stack &amp; Atelier</span>
            </div>

            <div className={styles.metaItemCol}>
              <span className={styles.metaColLabel}>Core Stack</span>
              <span className={styles.metaColValue}>Next.js &amp; TypeScript</span>
            </div>

            <div className={styles.metaItemCol}>
              <span className={styles.metaColLabel}>Status</span>
              <span className={styles.metaColValue}>Available for Projects</span>
            </div>
          </div>
        </section>

        {/* ── 3. ICONIC POSTER HEADLINE: I V [SEAMLESS HEAD] N ── */}
        <section className={styles.heroPosterWrap} aria-label="Ivan">
          <div className={styles.heroPosterNameRow}>
            <span className={styles.hugeLetter}>I</span>
            <span className={styles.hugeLetter}>V</span>

            {/* Seamless Head Cutout replacing letter A */}
            <div className={styles.headLetterWrapper} title="Ivan">
              <img
                src="/ivan-head.png"
                alt="Ivan"
                className={styles.headImageCutout}
              />
            </div>

            <span className={styles.hugeLetter}>N</span>
          </div>
        </section>

        {/* ── 4. SEGMENTED TABS ── */}
        <nav className={styles.tabFilterRow} aria-label="Portfolio Views">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`${styles.editorialTabBtn} ${activeTab === 'about' ? styles.editorialTabBtnActive : ''}`}
          >
            About &amp; Craft
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`${styles.editorialTabBtn} ${activeTab === 'skills' ? styles.editorialTabBtnActive : ''}`}
          >
            Capabilities &amp; Stack
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('philosophy')}
            className={`${styles.editorialTabBtn} ${activeTab === 'philosophy' ? styles.editorialTabBtnActive : ''}`}
          >
            Studio Philosophy
          </button>
        </nav>

        {/* ── 5. DYNAMIC TAB CONTENT ── */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                {/* THE STRANGE MIX */}
                <section className={styles.contentBlock}>
                  <div className={styles.contentBlockTitleRow}>
                    <h2 className={styles.contentBlockTitle}>The Strange Mix</h2>
                    <span className={styles.contentBlockTag}>Personal Note</span>
                  </div>

                  <div className={styles.twoColProse}>
                    <p>
                      I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying a long time ago. Some days I am deep in VS Code tuning Next.js rendering performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over spatial tokens, or saddle-stitching an Italian vegetable-tanned leather notebook cover with hot tea getting cold next to me.
                    </p>
                    <p>
                      For me, the fun has always been building things from scratch. Whether it is an interactive web tool with zero bloated dependencies or a physical leather wallet designed to outlive all of us, the contrast between glowing screen pixels and raw tangible materials is what keeps my mind sharp and happy.
                    </p>
                  </div>
                </section>

                {/* SIX DISCIPLINES */}
                <section className={styles.contentBlock}>
                  <div className={styles.contentBlockTitleRow}>
                    <h2 className={styles.contentBlockTitle}>Areas of Focus</h2>
                    <span className={styles.contentBlockTag}>Disciplines</span>
                  </div>

                  <div className={styles.disciplineGrid}>
                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Product &amp; UI/UX</h3>
                        <span className={styles.disciplinePill}>Design</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spatial balance, visual hierarchy, and micro-interactions that feel snappy and effortless to use.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Figma</span>
                        <span className={styles.tagItem}>Typography</span>
                        <span className={styles.tagItem}>Interaction</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Software Engineering</h3>
                        <span className={styles.disciplinePill}>Code</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Full-stack web applications built with Next.js, React, and TypeScript. Fast, maintainable, and lightweight code without dependency bloat.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Next.js</span>
                        <span className={styles.tagItem}>React</span>
                        <span className={styles.tagItem}>TypeScript</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Self-Hosted Systems</h3>
                        <span className={styles.disciplinePill}>Infra</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Running private cloud VMs, configuring dedicated SMTP mail relays, and building digital tools I actually control from end to end.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Cloud VMs</span>
                        <span className={styles.tagItem}>Docker</span>
                        <span className={styles.tagItem}>Private Relays</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Bespoke Leathercraft</h3>
                        <span className={styles.disciplinePill}>Atelier</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Handcrafting heirloom leather goods through SHU / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 silver charms.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Italian Leather</span>
                        <span className={styles.tagItem}>Saddle Stitch</span>
                        <span className={styles.tagItem}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Creative Tech &amp; 3D</h3>
                        <span className={styles.disciplinePill}>Shaders</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built out of late-night technical curiosity.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Three.js</span>
                        <span className={styles.tagItem}>WebGL 2.0</span>
                        <span className={styles.tagItem}>GLSL Shaders</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <div className={styles.disciplineCardHead}>
                        <h3 className={styles.disciplineCardTitle}>Visual Notes</h3>
                        <span className={styles.disciplinePill}>Archive</span>
                      </div>
                      <p className={styles.disciplineText}>
                        Documentary snapshots of daily studio work, analog textures, architectural geometry, and field notes from quiet walks out in nature.
                      </p>
                      <div className={styles.tagRow}>
                        <span className={styles.tagItem}>Studio Notes</span>
                        <span className={styles.tagItem}>Textures</span>
                        <span className={styles.tagItem}>Field Archive</span>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={styles.skillsListBlock}
              >
                <div className={styles.skillGroupCard}>
                  <h3 className={styles.skillGroupHeading}>Frontend Engineering &amp; Design Systems</h3>
                  <div className={styles.skillPillsFlex}>
                    {['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Figma Design Tokens', 'Server Components', 'Micro-interactions', 'Vanilla CSS Architecture'].map((s) => (
                      <span key={s} className={styles.skillPillBadge}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillGroupCard}>
                  <h3 className={styles.skillGroupHeading}>Creative Tech, 3D &amp; Canvas</h3>
                  <div className={styles.skillPillsFlex}>
                    {['Three.js', 'WebGL 2.0', 'GLSL Custom Shaders', '3D Product Configurator', 'Web Audio API', 'Blender 3D Modeling', 'Procedural Textures'].map((s) => (
                      <span key={s} className={styles.skillPillBadge}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillGroupCard}>
                  <h3 className={styles.skillGroupHeading}>Cloud, Infrastructure &amp; Backend</h3>
                  <div className={styles.skillPillsFlex}>
                    {['Oracle Cloud VM', 'AWS SES SMTP Relays', 'Docker & Compose', 'PostgreSQL', 'Redis Cache', 'Cloudflare Edge SSL', 'Firebase Realtime DB'].map((s) => (
                      <span key={s} className={styles.skillPillBadge}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillGroupCard}>
                  <h3 className={styles.skillGroupHeading}>Physical Atelier &amp; Leathercraft</h3>
                  <div className={styles.skillPillsFlex}>
                    {['Italian Vegetable-Tanned Leather', 'Precision Pattern Drafting', 'Traditional Hand Saddle Stitching', 'Tokonole Edge Burnishing', 'Solid 925 Sterling Silver Hardware', 'Bespoke Journal Binding'].map((s) => (
                      <span key={s} className={styles.skillPillBadge}>{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'philosophy' && (
              <motion.div
                key="philosophy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div className={styles.twoColProse} style={{ background: 'var(--w-card-bg)', padding: '24px', borderRadius: '18px', border: '1px solid var(--w-border)' }}>
                  <div>
                    <h3 className={styles.disciplineCardTitle} style={{ marginBottom: '10px' }}>Zero Bloat, Maximum Speed</h3>
                    <p style={{ margin: 0 }}>
                      Every kilobyte sent over the wire should justify its existence. I prefer writing clean, handcrafted CSS and modular TypeScript over downloading massive component libraries. If an interaction can be done with simple CSS or native browser APIs, it stays that way.
                    </p>
                  </div>
                  <div>
                    <h3 className={styles.disciplineCardTitle} style={{ marginBottom: '10px' }}>Tactility in Code &amp; Craft</h3>
                    <p style={{ margin: 0 }}>
                      Working with physical leather teaches you patience: one misplaced punch hole ruins an entire evening of work. That same obsession with craftsmanship carries over into digital interfaces, from easing curves to spatial rhythm.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
