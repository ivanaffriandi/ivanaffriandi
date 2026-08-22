'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './work.module.css';

type TabType = 'about' | 'skills' | 'philosophy';

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  return (
    <div className={styles.fullDesktopViewport}>
      <div className={styles.widePageContainer}>
        {/* ── 1. MODERN FLOATING NAVBAR ── */}
        <header className={styles.topNavbar}>
          <div className={styles.navBrandBlock}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src="/ivan-head.png" alt="Ivan" className={styles.navAvatarImg} />
              <span className={styles.brandHeading}>Ivan Affriandi</span>
            </Link>
            <span className={styles.statusPill}>
              <span className={styles.statusDot} />
              <span>Available</span>
            </span>
          </div>

          <div className={styles.navActionsBlock}>
            <Link href="/" className={styles.cleanSocialBtn} title="Home">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <Link href="/ask" className={styles.cleanSocialBtn} title="Ask Me">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </Link>
            <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className={styles.cleanSocialBtn} title="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://github.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className={styles.cleanSocialBtn} title="GitHub">
              <GithubIcon />
            </a>
            <a href="https://x.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className={styles.cleanSocialBtn} title="X">
              <XIcon />
            </a>
            <a href="mailto:hello@ivanaffriandi.com" className={styles.cleanSocialBtn} title="Email">
              <MailIcon />
            </a>
          </div>
        </header>

        {/* ── 2. HERO PROFILE SECTION ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroRowLayout}>
            <div className={styles.heroPortraitWrap}>
              <img src="/ivan-head.png" alt="Ivan Affriandi" className={styles.heroPortraitImg} />
            </div>

            <div className={styles.heroIntroContent}>
              <h1 className={styles.heroMainName}>Ivan Affriandi</h1>
              <p className={styles.heroRoleTagline}>Software Engineer &amp; Bespoke Leather Artisan</p>
              <p className={styles.heroBioText}>
                Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. I build high-performance web systems with zero bloat and craft tactile physical goods by hand in my studio.
              </p>
            </div>
          </div>

          {/* Quick Facts Bento Strip */}
          <div className={styles.metadataWideBar}>
            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Timeline</span>
              <span className={styles.metaStatValue}>2020 — Present</span>
            </div>
            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Disciplines</span>
              <span className={styles.metaStatValue}>Full-Stack &amp; Atelier</span>
            </div>
            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Studio Base</span>
              <span className={styles.metaStatValue}>Tangerang, Indonesia</span>
            </div>
            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Current Status</span>
              <span className={styles.metaStatValue}>Deep in Code &amp; Leather</span>
            </div>
          </div>
        </section>

        {/* ── 3. SEGMENTED TABS ── */}
        <nav className={styles.tabBarWrap} aria-label="Portfolio Sections">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`${styles.tabBtn} ${activeTab === 'about' ? styles.tabBtnActive : ''}`}
          >
            {activeTab === 'about' && (
              <motion.div
                layoutId="activeWorkTabPill"
                className={styles.tabActiveIndicator}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span>About</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
          >
            {activeTab === 'skills' && (
              <motion.div
                layoutId="activeWorkTabPill"
                className={styles.tabActiveIndicator}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span>Capabilities &amp; Stack</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('philosophy')}
            className={`${styles.tabBtn} ${activeTab === 'philosophy' ? styles.tabBtnActive : ''}`}
          >
            {activeTab === 'philosophy' && (
              <motion.div
                layoutId="activeWorkTabPill"
                className={styles.tabActiveIndicator}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span>Philosophy</span>
          </button>
        </nav>

        {/* ── 4. DYNAMIC TAB CONTENT ── */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                {/* THE STRANGE MIX */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>The Strange Mix</h2>
                    <span className={styles.sectionCategoryTag}>Who I Am</span>
                  </div>

                  <div className={styles.proseCard}>
                    <p className={styles.proseTextParagraph}>
                      I never figured out how to fit into a single corporate job title, and honestly, I stopped trying a long time ago. Some days I am deep in VS Code tuning Next.js rendering performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over spatial tokens, or saddle-stitching an Italian vegetable-tanned leather notebook cover with hot tea getting cold next to me.
                    </p>
                    <p className={styles.proseTextParagraph}>
                      For me, the joy has always been in building things from scratch. Whether it is a lightweight web tool with zero bloated dependencies or a physical leather wallet designed to outlive all of us, the contrast between glowing screen pixels and tangible raw materials keeps my mind sharp and creative.
                    </p>
                  </div>
                </section>

                {/* SIX AREAS OF FOCUS */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>Areas of Focus</h2>
                    <span className={styles.sectionCategoryTag}>Disciplines</span>
                  </div>

                  <div className={styles.cardsThreeColGrid}>
                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Product &amp; UI/UX</h3>
                        <span className={styles.cardCategoryPill}>Design</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spatial balance, visual hierarchy, and micro-interactions that feel snappy and effortless.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Figma Systems</span>
                        <span className={styles.softPillTag}>Typography</span>
                        <span className={styles.softPillTag}>Interaction</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Software Engineering</h3>
                        <span className={styles.cardCategoryPill}>Code</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Full-stack web applications built with Next.js, React, and TypeScript. Fast, maintainable, and lightweight code without dependency bloat.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Next.js</span>
                        <span className={styles.softPillTag}>React</span>
                        <span className={styles.softPillTag}>TypeScript</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Self-Hosted Systems</h3>
                        <span className={styles.cardCategoryPill}>Infra</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Running private cloud VMs, configuring dedicated SMTP mail relays, and building digital tools I actually control from end to end.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Cloud VMs</span>
                        <span className={styles.softPillTag}>Docker</span>
                        <span className={styles.softPillTag}>Private Relays</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Bespoke Leathercraft</h3>
                        <span className={styles.cardCategoryPill}>Atelier</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Handcrafting heirloom leather goods through SHU / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 silver charms.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Italian Leather</span>
                        <span className={styles.softPillTag}>Saddle Stitch</span>
                        <span className={styles.softPillTag}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Creative Tech &amp; 3D</h3>
                        <span className={styles.cardCategoryPill}>Shaders</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built out of late-night technical curiosity.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Three.js</span>
                        <span className={styles.softPillTag}>WebGL 2.0</span>
                        <span className={styles.softPillTag}>GLSL Shaders</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Visual Notes</h3>
                        <span className={styles.cardCategoryPill}>Archive</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Documentary snapshots of daily studio work, analog textures, architectural geometry, and field notes from quiet walks out in nature.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Studio Notes</span>
                        <span className={styles.softPillTag}>Textures</span>
                        <span className={styles.softPillTag}>Field Archive</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* BEYOND SCREENS */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>Beyond the Screen</h2>
                    <span className={styles.sectionCategoryTag}>Off-Hours</span>
                  </div>

                  <div className={styles.cardsThreeColGrid}>
                    <div className={styles.disciplineFeatureCard}>
                      <h3 className={styles.cardPrimaryTitle}>Wild Mushrooms &amp; Fungi</h3>
                      <p className={styles.cardDescriptionText}>
                        Wandering damp trails with field guides, spotting weird fungi species, taking macro photos, and appreciating nature&apos;s wildest procedural geometry.
                      </p>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <h3 className={styles.cardPrimaryTitle}>Fiber Arts &amp; Crochet</h3>
                      <p className={styles.cardDescriptionText}>
                        Working with yarn, hooks, and tension control. Making physical everyday goods with my hands when typing on a keyboard gets tiring.
                      </p>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <h3 className={styles.cardPrimaryTitle}>Loose-Leaf Tea &amp; Desks</h3>
                      <p className={styles.cardDescriptionText}>
                        Steeping green tea early in the morning while everything is quiet, sketching software architectures and product concepts in paper notebooks.
                      </p>
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
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div className={styles.skillMatrixBlock}>
                  <h3 className={styles.skillCategoryHeading}>Frontend Engineering &amp; Design Systems</h3>
                  <div className={styles.skillPillGroup}>
                    {['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Figma Design Tokens', 'Server Components', 'Micro-interactions', 'Vanilla CSS Architecture'].map((skill) => (
                      <span key={skill} className={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillMatrixBlock}>
                  <h3 className={styles.skillCategoryHeading}>Creative Tech, 3D &amp; Canvas</h3>
                  <div className={styles.skillPillGroup}>
                    {['Three.js', 'WebGL 2.0', 'GLSL Custom Shaders', '3D Product Configurator', 'Web Audio API', 'Blender 3D Modeling', 'Procedural Textures'].map((skill) => (
                      <span key={skill} className={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillMatrixBlock}>
                  <h3 className={styles.skillCategoryHeading}>Cloud, Infrastructure &amp; Backend</h3>
                  <div className={styles.skillPillGroup}>
                    {['Oracle Cloud VM', 'AWS SES SMTP Relays', 'Docker & Docker Compose', 'PostgreSQL', 'Redis In-Memory Cache', 'Cloudflare Edge SSL', 'Firebase Realtime DB'].map((skill) => (
                      <span key={skill} className={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.skillMatrixBlock}>
                  <h3 className={styles.skillCategoryHeading}>Physical Atelier &amp; Leathercraft</h3>
                  <div className={styles.skillPillGroup}>
                    {['Italian Vegetable-Tanned Leather', 'Precision Pattern Drafting', 'Traditional Hand Saddle Stitching', 'Tokonole Edge Burnishing', 'Solid 925 Sterling Silver Hardware', 'Bespoke Journal Binding'].map((skill) => (
                      <span key={skill} className={styles.skillBadge}>{skill}</span>
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
                <div className={styles.proseCard}>
                  <div>
                    <h3 className={styles.cardPrimaryTitle} style={{ marginBottom: '10px' }}>Zero Bloat, Maximum Speed</h3>
                    <p className={styles.proseTextParagraph}>
                      Every kilobyte sent over the wire should justify its existence. I prefer writing clean, handcrafted CSS and modular TypeScript over downloading massive component libraries. If an interaction can be done with simple CSS or native browser APIs, it stays that way.
                    </p>
                  </div>
                  <div>
                    <h3 className={styles.cardPrimaryTitle} style={{ marginBottom: '10px' }}>Tactility in Code &amp; Craft</h3>
                    <p className={styles.proseTextParagraph}>
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
