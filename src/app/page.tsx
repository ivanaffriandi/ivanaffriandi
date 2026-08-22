'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './homepage.module.css';

const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function Homepage() {
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);

  return (
    <div className={styles.viewportRoot}>
      <div className={styles.compactContainer}>
        {/* ── 1. TOP NAVBAR (IA LOGO & EXPANDABLE SOCIAL BUTTON) ── */}
        <header className={styles.topNavbar}>
          <Link href="/" className={styles.logoMonogram} title="Home">
            IA
          </Link>

          <div className={styles.socialExpandWrap}>
            <AnimatePresence>
              {isSocialExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={styles.expandedSocialIcons}
                >
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.microSocialBtn}
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="https://github.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.microSocialBtn}
                    title="GitHub"
                    aria-label="GitHub"
                  >
                    <GithubIcon />
                  </a>
                  <a
                    href="https://x.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.microSocialBtn}
                    title="X"
                    aria-label="X"
                  >
                    <XIcon />
                  </a>
                  <a
                    href="mailto:hello@ivanaffriandi.com"
                    className={styles.microSocialBtn}
                    title="Email"
                    aria-label="Email"
                  >
                    <MailIcon />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setIsSocialExpanded((prev) => !prev)}
              className={styles.socialToggleBtn}
              title="Social Media Links"
              aria-label="Toggle Social Links"
            >
              <span>Socials</span>
              <motion.span
                animate={{ rotate: isSocialExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-block', fontSize: '0.65rem' }}
              >
                ▾
              </motion.span>
            </button>
          </div>
        </header>

        {/* ── 2. MAIN CENTER HERO (SEAMLESS LARGE HEAD & BOLD PROFILE) ── */}
        <main className={styles.heroCenterContent}>
          <div className={styles.seamlessHeadWrap}>
            <img
              src="/ivan-head.png"
              alt="Ivan Affriandi"
              className={styles.seamlessHeadImg}
            />
          </div>

          <div className={styles.heroHeadingBlock}>
            <h1 className={styles.heroBigName}>Ivan Affriandi</h1>
            <p className={styles.heroRoleSubtitle}>Software Engineer &amp; Bespoke Leather Artisan</p>
          </div>

          <p className={styles.heroBioParagraph}>
            Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. I build high-performance web systems with zero bloat and craft tactile physical goods by hand in my studio.
          </p>

          <div className={styles.disciplinePillsRow}>
            <span className={styles.disciplinePill}>Next.js 16</span>
            <span className={styles.disciplinePill}>TypeScript</span>
            <span className={styles.disciplinePill}>Three.js</span>
            <span className={styles.disciplinePill}>Italian Leather</span>
            <span className={styles.disciplinePill}>SHU / EN Atelier</span>
          </div>
        </main>

        {/* ── 3. FOOTER (EMAIL CTA BUTTON & COPYRIGHT) ── */}
        <footer className={styles.compactFooter}>
          <a href="mailto:hello@ivanaffriandi.com" className={styles.emailCtaButton}>
            <span>hello@ivanaffriandi.com</span>
            <span>Send an Email ↗</span>
          </a>

          <div className={styles.copyrightLine}>
            <span>&copy; {new Date().getFullYear()} Ivan Affriandi</span>
            <span>Tangerang, Indonesia</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
