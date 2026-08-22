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

export default function AvantGardeHomepage() {
  const [moments] = useState<MomentPhoto[]>(momentsData as MomentPhoto[]);
  const [currentIndex, setCurrentIndex] = useState<number>(2); // Start at index 2 (16 JAN 2026)
  const [viewMode, setViewMode] = useState<'gallery' | 'profile'>('gallery');

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

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'profile') {
        if (e.key === 'Escape') setViewMode('gallery');
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, moments.length]);

  return (
    <div className={styles.homepageViewport}>
      <div className={styles.mainContainer}>
        {/* ── 1. TOP NAVBAR ── */}
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

        {/* ── 2. DYNAMIC IN-PAGE VIEW TRANSITION ── */}
        <AnimatePresence mode="wait">
          {viewMode === 'gallery' ? (
            <motion.div
              key="gallery-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
            >
              {/* CENTER MOMENTS GALLERY */}
              <main className={styles.galleryStageArea}>
                {/* Date Label */}
                <span className={styles.momentDateLabel}>{activeMoment.date}</span>

                {/* Photographic Filmstrip */}
                <div className={styles.carouselFilmStrip}>
                  {/* Left Side Previews */}
                  <div className={`${styles.sideThumbContainer} ${styles.sideThumbContainerLeft}`}>
                    <div
                      className={styles.sidePreviewPhoto}
                      onClick={() => setCurrentIndex((prev) => (prev - 2 + moments.length) % moments.length)}
                      title="Earlier moment"
                    >
                      <img
                        src={prevPrevMoment.image}
                        alt="Earlier moment"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      className={styles.sidePreviewPhoto}
                      onClick={handlePrev}
                      title="Previous moment"
                    >
                      <img
                        src={prevMoment.image}
                        alt="Previous moment"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  {/* Center Active Photo */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMoment.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
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
                      title="Next moment"
                    >
                      <img
                        src={nextMoment.image}
                        alt="Next moment"
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

              {/* BOTTOM LEFT TRIGGER (HEAD + NAME) */}
              <footer className={styles.bottomActionBar}>
                <button
                  type="button"
                  onClick={() => setViewMode('profile')}
                  className={styles.bottomLeftTriggerBtn}
                  title="View Ivan's Profile"
                  aria-label="View Ivan's Profile"
                >
                  <img
                    src="/ivan-head.png"
                    alt="Ivan"
                    className={styles.triggerHeadImg}
                  />
                  <span className={styles.triggerNameLabel}>Ivan Affriandi</span>
                </button>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={styles.fullProfileViewArea}
            >
              {/* Top Back Action */}
              <div className={styles.profileTopActions}>
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className={styles.backToGalleryBtn}
                  title="Back to Moments"
                >
                  <span>✕</span>
                  <span>Close</span>
                </button>
              </div>

              {/* Center Profile Body */}
              <div className={styles.profileCenterBody}>
                <div className={styles.profileLargeHeadWrap}>
                  <img
                    src="/ivan-head.png"
                    alt="Ivan Affriandi"
                    className={styles.profileLargeHeadImg}
                  />
                </div>

                <div className={styles.profileHeadingGroup}>
                  <h1 className={styles.profileBigName}>Ivan Affriandi</h1>
                  <p className={styles.profileRoleSubtitle}>Software Engineer &amp; Bespoke Leather Artisan</p>
                </div>

                <p className={styles.profileBioText}>
                  Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. I build high-performance web systems with zero bloat and craft tactile physical goods by hand in my studio.
                </p>

                <div className={styles.disciplinePillsWrap}>
                  <span className={styles.disciplinePillItem}>Next.js 16</span>
                  <span className={styles.disciplinePillItem}>TypeScript</span>
                  <span className={styles.disciplinePillItem}>Three.js</span>
                  <span className={styles.disciplinePillItem}>Italian Leather</span>
                  <span className={styles.disciplinePillItem}>SHU / EN Atelier</span>
                </div>
              </div>

              {/* Bottom Email CTA */}
              <a
                href="mailto:hello@ivanaffriandi.com"
                className={styles.profileEmailCtaBtn}
                title="Send Email"
              >
                <span>hello@ivanaffriandi.com</span>
                <span>Send an Email ↗</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
