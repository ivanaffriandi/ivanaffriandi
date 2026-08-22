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
  const [currentIndex, setCurrentIndex] = useState<number>(2); // Start at index 2 for "16 JAN 2026"
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const activeMoment = moments[currentIndex] || moments[0];
  const prevMoment = moments[(currentIndex - 1 + moments.length) % moments.length];
  const nextMoment = moments[(currentIndex + 1) % moments.length];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < moments.length - 1 ? prev + 1 : 0));
  };

  // Keyboard Navigation (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProfileOpen) {
        if (e.key === 'Escape') setIsProfileOpen(false);
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen, moments.length]);

  return (
    <div className={styles.homepageViewport}>
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

      {/* ── 2. CENTER MOMENTS GALLERY (INSTAGRAM INTEGRATED) ── */}
      <main className={styles.galleryStageArea}>
        {/* Date Label */}
        <span className={styles.momentDateLabel}>{activeMoment.date}</span>

        {/* Photographic Filmstrip Carousel */}
        <div className={styles.carouselFilmStrip}>
          {/* Left Preview Photo */}
          <div
            className={`${styles.sidePreviewPhoto} ${styles.sidePreviewLeft}`}
            onClick={handlePrev}
            title="Previous Moment"
          >
            <img
              src={prevMoment.image}
              alt="Previous moment"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Active Center Photo with Smooth Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMoment.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={styles.activePhotoFrame}
              onClick={handleNext}
              title="Next Moment"
            >
              <img
                src={activeMoment.image}
                alt={activeMoment.caption || 'Ivan Moment'}
                className={styles.activePhotoImg}
              />
            </motion.div>
          </AnimatePresence>

          {/* Right Preview Photo */}
          <div
            className={`${styles.sidePreviewPhoto} ${styles.sidePreviewRight}`}
            onClick={handleNext}
            title="Next Moment"
          >
            <img
              src={nextMoment.image}
              alt="Next moment"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Caption */}
        <p className={styles.momentCaptionText}>
          {activeMoment.caption ? activeMoment.caption.slice(0, 75) : ''}
        </p>
      </main>

      {/* ── 3. BOTTOM TRIGGER BAR (AFFRIANDI, IVAN + EXPAND TRIGGER) ── */}
      <footer className={styles.bottomTriggerBar}>
        <span className={styles.bottomBrandName}>AFFRIANDI, IVAN</span>

        {/* Interactive Bottom-Right Profile Trigger Button */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className={styles.bottomProfileTriggerBtn}
          title="About Ivan"
          aria-label="Open Profile Details"
        >
          <img
            src="/ivan-head.png"
            alt="Ivan"
            className={styles.triggerHeadImg}
          />
          <span className={styles.triggerBtnLabel}>About</span>
        </button>
      </footer>

      {/* ── 4. EXPANDED FULL PROFILE MODAL / SHEET ── */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.profileExpandedOverlay}
            onClick={() => setIsProfileOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className={styles.profileExpandedCard}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className={styles.profileCardCloseBtn}
                title="Close"
                aria-label="Close Profile"
              >
                ✕
              </button>

              {/* Profile Head & Title */}
              <div className={styles.modalHeadRow}>
                <img
                  src="/ivan-head.png"
                  alt="Ivan Affriandi"
                  className={styles.modalHeadImg}
                />
                <div className={styles.modalTitleGroup}>
                  <h2 className={styles.modalBigName}>Ivan Affriandi</h2>
                  <p className={styles.modalRoleText}>Software Engineer &amp; Bespoke Leather Artisan</p>
                </div>
              </div>

              {/* Natural Bio */}
              <p className={styles.modalBioText}>
                Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to step away from screens. I build high-performance web systems with zero bloat and craft tactile physical goods by hand in my studio.
              </p>

              {/* Discipline Pills */}
              <div className={styles.modalPillsWrap}>
                <span className={styles.modalSkillPill}>Next.js 16</span>
                <span className={styles.modalSkillPill}>TypeScript</span>
                <span className={styles.modalSkillPill}>Three.js</span>
                <span className={styles.modalSkillPill}>Italian Leather</span>
                <span className={styles.modalSkillPill}>SHU / EN Atelier</span>
              </div>

              {/* Email CTA Button */}
              <a
                href="mailto:hello@ivanaffriandi.com"
                className={styles.modalEmailCta}
                title="Send Email"
              >
                <span>hello@ivanaffriandi.com</span>
                <span>Send an Email ↗</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
