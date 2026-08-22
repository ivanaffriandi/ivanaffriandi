'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './homepage.module.css';
import momentsData from './moments-data.json';

// Fountain Pen / Quill Nib Icon for Blog
const QuillPenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

// Minimalist Message / Ask Icon
const AskChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

interface MomentPhoto {
  id: string;
  image: string;
  date: string;
  caption?: string;
}

export default function LookbookMomentsHomepage() {
  const [moments] = useState<MomentPhoto[]>(momentsData as MomentPhoto[]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const activeMoment = moments[currentIndex] || moments[0];
  const prevMoment = moments[(currentIndex - 1 + moments.length) % moments.length];
  const prevPrevMoment = moments[(currentIndex - 2 + moments.length) % moments.length];
  const nextMoment = moments[(currentIndex + 1) % moments.length];
  const nextNextMoment = moments[(currentIndex + 2) % moments.length];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < moments.length - 1 ? prev + 1 : 0));
  };

  // Keyboard Left / Right Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moments.length]);

  return (
    <div className={styles.homepageViewport}>
      <div className={styles.mainContainer}>
        {/* ── 1. TOP NAVBAR (IA LOGO & PEN / ASK ICON BUTTONS) ── */}
        <header className={styles.topNavbar}>
          <Link href="/" className={styles.logoMonogram} title="Ivan Affriandi">
            IA
          </Link>

          <nav className={styles.navIconsGroup}>
            <a
              href="https://blog.ivanaffriandi.com"
              className={styles.navIconBtn}
              title="Blog & Essays"
              aria-label="Blog"
            >
              <QuillPenIcon />
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

        {/* ── 2. CENTER LOOKBOOK FILMSTRIP GALLERY ── */}
        <main className={styles.galleryStageArea}>
          {/* Date Label */}
          <span className={styles.momentDateHeader}>{activeMoment.date}</span>

          {/* Horizontal Filmstrip Viewport */}
          <div className={styles.filmstripViewport}>
            <div className={styles.filmstripTrack}>
              {/* Outer Left Preview */}
              <div
                className={`${styles.filmstripItem} ${styles.peekFilmstripItem}`}
                onClick={() => setCurrentIndex((prev) => (prev - 2 + moments.length) % moments.length)}
                title="Previous photo"
              >
                <img src={prevPrevMoment.image} alt="Lookbook thumbnail" />
              </div>

              {/* Inner Left Preview */}
              <div
                className={`${styles.filmstripItem} ${styles.peekFilmstripItem}`}
                onClick={handlePrev}
                title="Previous photo"
              >
                <img src={prevMoment.image} alt="Lookbook thumbnail" />
              </div>

              {/* Center Active Photo with Smooth Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMoment.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={`${styles.filmstripItem} ${styles.activeFilmstripItem}`}
                  onClick={handleNext}
                  title="Click to view next moment"
                >
                  <img
                    src={activeMoment.image}
                    alt={activeMoment.caption || 'Moment photo'}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Inner Right Preview */}
              <div
                className={`${styles.filmstripItem} ${styles.peekFilmstripItem}`}
                onClick={handleNext}
                title="Next photo"
              >
                <img src={nextMoment.image} alt="Lookbook thumbnail" />
              </div>

              {/* Outer Right Preview */}
              <div
                className={`${styles.filmstripItem} ${styles.peekFilmstripItem}`}
                onClick={() => setCurrentIndex((prev) => (prev + 2) % moments.length)}
                title="Next photo"
              >
                <img src={nextNextMoment.image} alt="Lookbook thumbnail" />
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className={styles.momentCaptionLabel}>
            {activeMoment.caption ? activeMoment.caption.slice(0, 80) : ''}
          </p>
        </main>

        {/* ── 3. BOTTOM EDITORIAL HEAD & BIG NAME ONLY (NO ROLES) ── */}
        <footer className={styles.bottomTitleBar}>
          <div className={styles.bigHeadCutoutWrap}>
            <img
              src="/ivan-head.png"
              alt="Ivan"
              className={styles.bigHeadCutoutImg}
            />
          </div>

          <h1 className={styles.bigNameHeading}>Ivan Affriandi</h1>
        </footer>
      </div>
    </div>
  );
}
