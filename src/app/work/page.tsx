'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './work.module.css';

export default function WorkEditorialMagazinePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className={styles.fullDesktopViewport}>
      <div className={styles.magazineCardsContainer}>
        {/* ── CARD 01: THE EDITORIAL HOOK & ESSAY ── */}
        <article className={styles.editorialMonographCard}>
          {/* Card Top Nav */}
          <div className={styles.cardTopNavRow}>
            <Link href="/" className={styles.geometricLogoMark} title="Ivan Affriandi">
              <span className={styles.logoCircleSolid} />
              <span className={styles.logoSemiCircle} />
            </Link>

            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className={styles.hamburgerIconBtn}
              title="Navigation Menu"
              aria-label="Navigation Menu"
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>

          {/* Big Editorial Quote / Hook */}
          <h1 className={styles.editorialHeadlineText}>
            Software engineer by day, bespoke leather artisan by night, building zero-bloat digital tools and heirloom tangible goods.
          </h1>

          {/* Dual Author/Studio Avatars */}
          <div className={styles.authorAvatarsRow}>
            <img
              src="/ivan-head.png"
              alt="Ivan Affriandi"
              className={styles.authorAvatarThumb}
            />
            <img
              src="/nature_hero.png"
              alt="Studio Texture"
              className={styles.authorAvatarThumb}
            />
          </div>

          {/* Body Prose */}
          <div className={styles.editorialBodyProse}>
            <p>
              I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying a long time ago. Some days I am deep in VS Code tuning Next.js rendering performance and spinning up self-hosted cloud containers.
            </p>
            <p>
              Other days I am in Figma obsessing over spatial layout tokens, or saddle-stitching an Italian vegetable-tanned leather notebook cover with hot tea getting cold next to me.
            </p>
            <p>
              For me, the fun has always been building things from scratch. Whether it is an interactive web tool with zero bloated dependencies or a physical leather wallet designed to outlive all of us, the contrast between glowing pixels and raw tangible materials keeps my mind sharp and happy.
            </p>
          </div>
        </article>

        {/* ── CARD 02: DIALOGUE & MONOGRAPH VISUAL WITH AMBIENT GLOW ── */}
        <article className={styles.editorialMonographCard}>
          {/* Card Top Nav */}
          <div className={styles.cardTopNavRow}>
            <Link href="/" className={styles.geometricLogoMark} title="Ivan Affriandi">
              <span className={styles.logoCircleSolid} />
              <span className={styles.logoSemiCircle} />
            </Link>

            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className={styles.hamburgerIconBtn}
              title="Navigation Menu"
              aria-label="Navigation Menu"
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>

          {/* Speaker Dialogue / Focus Metadata */}
          <div className={styles.dialogueList}>
            <div className={styles.dialogueItem}>
              <span className={styles.dialogueSpeaker}>DIR:</span>
              <span className={styles.dialogueContent}>
                How do you balance high-performance software engineering with traditional leathercraft?
              </span>
            </div>

            <div className={styles.dialogueItem}>
              <span className={styles.dialogueSpeaker}>IA:</span>
              <span className={styles.dialogueContent}>
                They rely on the exact same discipline. In code, every extra kilobyte slows down the system. In leather, one misplaced stitch hole ruins the entire hide. Both require extreme patience and zero tolerance for bloat.
              </span>
            </div>
          </div>

          {/* Portrait Visual With Ambient Orange Fade */}
          <div className={styles.portraitVisualWrap}>
            <img
              src="/nature_hero.png"
              alt="Ivan Affriandi Atelier"
              className={styles.portraitGraphicImg}
            />
            <div className={styles.ambientVermilionGlow} />
          </div>
        </article>

        {/* ── CARD 03: THE FORMULA / TECHNICAL BLUEPRINT & [02] INDEX ── */}
        <article className={styles.editorialMonographCard}>
          {/* Card Top Nav */}
          <div className={styles.cardTopNavRow}>
            <div className={styles.formulaHeader}>
              <span className={styles.formulaTitle}>Ivan Atelier</span>
              <span className={styles.formulaSubtitle}>Formula &amp; Systems</span>
            </div>

            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className={styles.hamburgerIconBtn}
              title="Navigation Menu"
              aria-label="Navigation Menu"
            >
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
              <span className={styles.hamburgerLine} />
            </button>
          </div>

          {/* Architectural Chemical / Vector Schematic Diagram */}
          <div className={styles.formulaDiagramWrap}>
            <svg
              className={styles.formulaDiagramSvg}
              width="240"
              height="110"
              viewBox="0 0 240 110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Chemical / System Blueprint Lines */}
              <path d="M40 30 L65 30 L80 50 L105 50 L120 25 L145 25 L160 50 L185 50 L200 30" />
              <path d="M80 50 L80 80 L105 100 L130 80 L130 50" />
              <path d="M160 50 L160 80 L185 95 L210 80 L210 50" />
              <circle cx="120" cy="20" r="3.5" strokeWidth="1.8" />
              
              {/* Formula Text Labels */}
              <text x="18" y="24" fill="#f5f5f7" fontSize="10" fontWeight="700" fontFamily="monospace" stroke="none">Next.js</text>
              <text x="18" y="44" fill="#f5f5f7" fontSize="10" fontWeight="700" fontFamily="monospace" stroke="none">React 19</text>
              <text x="192" y="24" fill="#f5f5f7" fontSize="10" fontWeight="700" fontFamily="monospace" stroke="none">TS</text>
              <text x="195" y="105" fill="#f5f5f7" fontSize="10" fontWeight="700" fontFamily="monospace" stroke="none">SHU/EN</text>
            </svg>
          </div>

          {/* Big Monograph Index Number */}
          <div className={styles.indexBigMarker}>[02]</div>

          {/* Technical Index Prose */}
          <div className={styles.formulaProse}>
            <p>
              <strong>Core Engineering Stack:</strong> Next.js 16 (App Router), React 19, TypeScript, Framer Motion, Three.js 3D WebGL, PostgreSQL, and self-hosted cloud infrastructure.
            </p>
            <p>
              <strong>Atelier Craft:</strong> Vegetable-tanned Italian hides from Tuscany, traditional double-needle saddle stitching, Japanese moire silk lining, and cast solid 925 sterling silver hardware.
            </p>
            <p>
              Based in Tangerang, Indonesia. Available for select software engineering projects and bespoke leather commissions.
            </p>
          </div>
        </article>
      </div>

      {/* ── INTERACTIVE NAV OVERLAY MODAL ── */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.navMenuModal}
            onClick={() => setIsNavOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              className={styles.navMenuCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 850, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a1a1aa' }}>
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setIsNavOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              <Link href="/" className={styles.navModalLink} onClick={() => setIsNavOpen(false)}>
                <span>Home</span>
                <span>›</span>
              </Link>
              <Link href="/ask" className={styles.navModalLink} onClick={() => setIsNavOpen(false)}>
                <span>Ask Anonymous</span>
                <span>›</span>
              </Link>
              <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className={styles.navModalLink}>
                <span>Instagram</span>
                <span>↗</span>
              </a>
              <a href="https://github.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className={styles.navModalLink}>
                <span>GitHub</span>
                <span>↗</span>
              </a>
              <a href="mailto:hello@ivanaffriandi.com" className={styles.navModalLink}>
                <span>Email Ivan</span>
                <span>↗</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
