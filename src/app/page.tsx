'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './homepage.module.css';

// Feather Pen / Quill Icon matching the Blog page
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

const FUN_PHRASES = [
  "Hi, I'm Ivan!",
  "Software engineer & leather craftsman.",
  "Building zero-bloat web systems.",
  "Handcrafting Italian leather atelier goods.",
  "Foraging wild mushrooms on weekends.",
  "Steeping green tea at 6 AM.",
  "Crafting pixels & tangible artifacts.",
];

export default function AvantGardeHomepage() {
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const headControls = useAnimation();

  const currentFullText = FUN_PHRASES[phraseIndex];

  // Typewriter Letter-by-Letter Animation Effect
  useEffect(() => {
    let charIndex = 0;
    setDisplayText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (charIndex < currentFullText.length) {
        setDisplayText(currentFullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 45); // Typing speed per character

    return () => clearInterval(interval);
  }, [currentFullText]);

  // Interactive Tap Action on Head
  const handleHeadTap = () => {
    // 1. Playful Spring Squash, Stretch & Wiggle Animation
    headControls.start({
      scale: [1, 0.85, 1.18, 0.94, 1.05, 1],
      rotate: [0, -14, 12, -6, 3, 0],
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    });

    // 2. Delicate Confetti Burst
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.52 },
        colors: ['#000000', '#444444', '#888888', '#e5e5e5', '#ff4500'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }

    // 3. Cycle to next phrase
    setPhraseIndex((prev) => (prev + 1) % FUN_PHRASES.length);
  };

  return (
    <div className={styles.homepageViewport}>
      <div className={styles.mainContainer}>
        {/* ── 1. TOP NAVBAR (HEAD AVATAR ON LEFT, FEATHER & ASK ON RIGHT) ── */}
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

        {/* ── 2. CENTER STAGE (BIG HEAD & HANDWRITING TYPING TEXT) ── */}
        <main className={styles.centerHeroStage}>
          {/* Big Head with Tap Transformation */}
          <motion.div
            animate={headControls}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleHeadTap}
            className={styles.bigHeadTapWrap}
            title="Tap me!"
          >
            <img
              src="/ivan-head.png"
              alt="Ivan Affriandi"
              className={styles.bigHeadTapImg}
            />
          </motion.div>

          {/* Letter-by-Letter Typing Animation */}
          <div className={styles.typewriterTextWrap} onClick={handleHeadTap}>
            <span className={styles.handwritingText}>
              {displayText}
              <span className={styles.typingCaret} />
            </span>
          </div>

          <span className={styles.tapHintText} onClick={handleHeadTap} style={{ cursor: 'pointer' }}>
            Tap head for more
          </span>
        </main>

        {/* ── 3. BOTTOM CLEAN SPACER ── */}
        <footer className={styles.bottomEmptyBar} />
      </div>
    </div>
  );
}
