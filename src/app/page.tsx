'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import styles from './homepage.module.css';
import momentsData from './moments-data.json';

interface MomentPhoto {
  id: string;
  image: string;
  date: string;
  caption?: string;
}

export default function CleanMomentsHomepage() {
  const [moments] = useState<MomentPhoto[]>(momentsData as MomentPhoto[]);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Start at index 0 (09 FEB 2026)

  const activeMoment = moments[currentIndex] || moments[0];
  const prevMoment = moments[(currentIndex - 1 + moments.length) % moments.length];
  const prevPrevMoment = moments[(currentIndex - 2 + moments.length) % moments.length];
  const nextMoment = moments[(currentIndex + 1) % moments.length];

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
        {/* ── 1. TOP NAVBAR (IA & BLOG / ASK) ── */}
        <header className={styles.topNavbar}>
          <Link href="/" className={styles.logoMonogram} title="Ivan Affriandi">
            IA
          </Link>

          <nav className={styles.navLinksGroup}>
            <a
              href="https://blog.ivanaffriandi.com"
              className={styles.navLinkPill}
              title="Blog"
            >
              Blog
            </a>
            <Link href="/ask" className={styles.navLinkPill} title="Ask Anonymous">
              Ask
            </Link>
          </nav>
        </header>

        {/* ── 2. CENTER MOMENTS GALLERY ── */}
        <main className={styles.galleryStageArea}>
          {/* Moment Date Label */}
          <span className={styles.momentDateLabel}>{activeMoment.date}</span>

          {/* Filmstrip with Seamless Swap Animation */}
          <div className={styles.carouselFilmStrip}>
            {/* Left Side Previews */}
            <div className={`${styles.sideThumbContainer} ${styles.sideThumbContainerLeft}`}>
              <div
                className={styles.sidePreviewPhoto}
                onClick={() => setCurrentIndex((prev) => (prev - 2 + moments.length) % moments.length)}
                title="Earlier photo"
              >
                <img
                  src={prevPrevMoment.image}
                  alt="Earlier photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div
                className={styles.sidePreviewPhoto}
                onClick={handlePrev}
                title="Previous photo"
              >
                <img
                  src={prevMoment.image}
                  alt="Previous photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Center Active Photo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMoment.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={styles.activePhotoFrame}
                onClick={handleNext}
                title="Click for next photo"
              >
                <img
                  src={activeMoment.image}
                  alt={activeMoment.caption || 'Moment'}
                  className={styles.activePhotoImg}
                />
              </motion.div>
            </AnimatePresence>

            {/* Right Side Preview */}
            <div className={`${styles.sideThumbContainer} ${styles.sideThumbContainerRight}`}>
              <div
                className={styles.sidePreviewPhoto}
                onClick={handleNext}
                title="Next photo"
              >
                <img
                  src={nextMoment.image}
                  alt="Next photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className={styles.momentCaptionText}>
            {activeMoment.caption ? activeMoment.caption.slice(0, 85) : ''}
          </p>
        </main>

        {/* ── 3. BOTTOM EDITORIAL SIGNATURE (HEAD & NAME TITLE, NON-BUTTON) ── */}
        <footer className={styles.bottomSignatureArea}>
          <div className={styles.signatureHeadWrap}>
            <img
              src="/ivan-head.png"
              alt="Ivan"
              className={styles.signatureHeadImg}
            />
          </div>

          <div className={styles.signatureTextBlock}>
            <h1 className={styles.signatureName}>Ivan Affriandi</h1>
            <p className={styles.signatureRole}>Software Engineer &amp; Bespoke Leather Artisan</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
