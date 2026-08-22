'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './homepage.module.css';

// Feather Pen / Quill Icon for Blog
const FeatherPenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="15" y2="17.5" />
  </svg>
);

// Minimalist Message / Ask Icon
const AskChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

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

const SendMailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Casual, easy-to-understand English phrases
const FUN_PHRASES = [
  "Hi, I'm Ivan!",
  "UI/UX Designer & Writer.",
  "I design clean apps and write about stuff.",
  "Big fan of minimalism and fast websites.",
  "I also handcraft leather goods in my studio.",
  "Probably foraging wild mushrooms right now.",
  "Tap my head again :)",
];

export default function AvantGardeHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const headControls = useAnimation();

  const currentFullText = FUN_PHRASES[phraseIndex];

  // Letter-by-Letter Typing Effect
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
    }, 42);

    return () => clearInterval(interval);
  }, [currentFullText]);

  // Head Tap Reaction
  const handleHeadTap = () => {
    headControls.start({
      scale: [1, 0.86, 1.16, 0.94, 1.04, 1],
      rotate: [0, -12, 10, -5, 2, 0],
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    });

    try {
      confetti({
        particleCount: 26,
        spread: 55,
        origin: { y: 0.5 },
        colors: ['#111113', '#55555e', '#888894', '#e8e8e4', '#ff4500'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }

    setPhraseIndex((prev) => (prev + 1) % FUN_PHRASES.length);
  };

  return (
    <div className={styles.homepageViewport}>
      <div className={styles.mainContainer}>
        {/* ── 1. TOP NAVBAR (IA LOGO & CLEAN NO-CIRCLE 2-LINE MENU) ── */}
        <header className={styles.topNavbar}>
          <Link href="/" className={styles.logoMonogram} title="Ivan Affriandi">
            IA
          </Link>

          <div className={styles.navRightExpandWrap}>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={styles.expandedNavPills}
                >
                  <a
                    href="https://blog.ivanaffriandi.com"
                    className={styles.navActionPill}
                    title="Blog & Journal"
                  >
                    <FeatherPenIcon />
                    <span>Blog</span>
                  </a>
                  <Link
                    href="/ask"
                    className={styles.navActionPill}
                    title="Ask Anonymous"
                  >
                    <AskChatIcon />
                    <span>Ask</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2-Line Minimalist Button (Clean, NO Circle Background) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={styles.cleanTwoLineBtn}
              title="Toggle Menu"
              aria-label="Toggle Navigation Menu"
            >
              <span
                className={styles.equalMenuBar}
                style={{
                  transform: isMenuOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none',
                }}
              />
              <span
                className={styles.equalMenuBar}
                style={{
                  transform: isMenuOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none',
                }}
              />
            </button>
          </div>
        </header>

        {/* ── 2. CENTER HERO STAGE (STICKER OUTLINE HEAD IN DARK MODE) ── */}
        <main className={styles.centerHeroStage}>
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

        {/* ── 3. BOTTOM BAR (SOCIAL ICONS & EMAIL CTA BUTTON) ── */}
        <footer className={styles.bottomActionBar}>
          {/* Social Media Links */}
          <div className={styles.socialIconsGroup}>
            <a
              href="https://instagram.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCircleBtn}
              title="Instagram"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://github.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCircleBtn}
              title="GitHub"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>

            <a
              href="https://x.com/ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCircleBtn}
              title="X (Twitter)"
              aria-label="X"
            >
              <XIcon />
            </a>
          </div>

          {/* Send Email Button */}
          <a
            href="mailto:hello@ivanaffriandi.com"
            className={styles.sendEmailCtaBtn}
            title="Send Email"
          >
            <SendMailIcon />
            <span>Send Email</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
