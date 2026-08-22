'use client';

import React from 'react';
import Link from 'next/link';
import styles from './homepage.module.css';

// Feather Pen / Quill Icon matching the Blog page exactly
const FeatherPenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="15" y2="17.5" />
  </svg>
);

// Minimalist Message / Ask Icon
const AskChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function AvantGardeHeadHomepage() {
  return (
    <div className={styles.homepageViewport}>
      <div className={styles.mainContainer}>
        {/* ── 1. TOP NAVBAR (HEAD ON LEFT, FEATHER & ASK ON RIGHT) ── */}
        <header className={styles.topNavbar}>
          <Link href="/" className={styles.navAvatarLink} title="Ivan Affriandi">
            <img
              src="/ivan-head.png"
              alt="Ivan"
              className={styles.navAvatarImg}
            />
          </Link>

          <nav className={styles.navIconsGroup}>
            <a
              href="https://blog.ivanaffriandi.com"
              className={styles.navIconBtn}
              title="Blog & Journal"
              aria-label="Blog"
            >
              <FeatherPenIcon />
            </a>
            <Link
              href="/ask"
              className={styles.navIconBtn}
              title="Ask Anonymous"
              aria-label="Ask Anonymous"
            >
              <AskChatIcon />
            </Link>
          </nav>
        </header>

        {/* ── 2. CENTER ICONIC BIG HEAD CANVAS ── */}
        <main className={styles.centerHeadStage}>
          <div className={styles.bigCenterHeadWrap} title="Ivan Affriandi">
            <img
              src="/ivan-head.png"
              alt="Ivan Affriandi"
              className={styles.bigCenterHeadImg}
            />
          </div>
        </main>

        {/* ── 3. BOTTOM CLEAN SPACER ── */}
        <footer className={styles.bottomEmptyBar} />
      </div>
    </div>
  );
}
