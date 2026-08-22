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

// Rounded Envelope Email Icon
const RoundedEmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="4" ry="4" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
  "Here is my full technical & craft matrix:",
  "Tap my head again :)",
];

// Ultra-dense matrix dataset for continuous running rows
const MATRIX_ROWS = [
  "UI/UX DESIGN • NEXT.JS 16 • TYPESCRIPT • THREE.JS • ITALIAN LEATHER • FIGMA TOKENS • WEBGL 2.0 • REACT 19 • ",
  "INDONESIAN (NATIVE) • ENGLISH (FLUENT) • DUTCH (NEDERLANDS) • SUNDANESE • TYPOGRAPHY SYSTEMS • ",
  "SHŪ / EN STUDIO ATELIER • SADDLE STITCHING • 925 STERLING SILVER • TOKONOLE BURNISHING • PATTERN DRAFTING • ",
  "GLSL PROCEDURAL SHADERS • WEB AUDIO API • BLENDER 3D • FRAMER MOTION • TAILWIND CSS • ZERO BLOAT • ",
  "ORACLE CLOUD VM • DOCKER COMPOSE • POSTGRESQL • REDIS CACHE • AWS SES RELAYS • CLOUDFLARE SSL • ",
  "WILD MUSHROOM FORAGING • MYCOLOGY FIELD NOTES • MACRO PHOTOGRAPHY • ANALOG TEXTURES • LOOSE-LEAF TEA • ",
  "FIBER ARTS • HAND CROCHET • SADDLE STITCHED JOURNALS • ARCHITECTURAL ESSAYS • SPATIAL 3D • ",
  "ZERO BLOAT COMPUTING • MINIMALIST SOFTWARE ARCHITECTURES • SELF-HOSTED SERVICES • LINUX SYSADMIN • ",
  "INTERACTION DESIGN • SPATIAL LAYOUT • MICRO-INTERACTIONS • DESIGN SYSTEM TOKENS • ACCESSIBILITY A11Y • ",
  "TUSCAN VEGETABLE TANNED LEATHER • JAPANESE MOIRE SILK LINING • BESPOKE JOURNAL COVERS • WAXED THREAD • ",
  "NEXT.JS APP ROUTER • REACT SERVER COMPONENTS • JAVASCRIPT ES2026 • RUST AXUM • EDGE WORKERS • ",
  "CREATIVE WRITING • TECH ESSAYS • PRODUCT STRATEGY • SWISS MINIMALISM • HIGH FIDELITY PROTOTYPING • ",
  "USER EXPERIENCE RESEARCH • WIREFRAMING • COMPONENT LIBRARIES • BRAND IDENTITY • EDITORIAL CURATION • ",
  "FULL STACK ARCHITECTURE • DATABASE INDEXING • REST & GRAPHQL • PRISMA ORM • BASH SCRIPTING • ",
  "HAND CUT LEATHER PATTERNS • PRICKING IRONS • BEESWAX EDGE POLISH • HERITAGE CRAFTSMANSHIP • ",
  "FOREST TRAIL NAVIGATION • FUNGI SPORE PRINTS • BOTANICAL SKETCHING • BOTANICAL WATERCOLORS • ",
  "DARK MODE SPECIALIST • MICRO-ANIMATIONS • PERFORMANCE OPTIMIZATION • WEB VITALS 100/100 • ",
  "DISTRIBUTED SYSTEMS • DOCKER CONTAINERIZATION • NGINX REVERSE PROXY • SYSTEMD SERVICES • ",
  "UI/UX DESIGN • NEXT.JS 16 • TYPESCRIPT • THREE.JS • ITALIAN LEATHER • FIGMA TOKENS • WEBGL 2.0 • REACT 19 • ",
  "INDONESIAN (NATIVE) • ENGLISH (FLUENT) • DUTCH (NEDERLANDS) • SUNDANESE • TYPOGRAPHY SYSTEMS • ",
  "SHŪ / EN STUDIO ATELIER • SADDLE STITCHING • 925 STERLING SILVER • TOKONOLE BURNISHING • PATTERN DRAFTING • ",
  "GLSL PROCEDURAL SHADERS • WEB AUDIO API • BLENDER 3D • FRAMER MOTION • TAILWIND CSS • ZERO BLOAT • ",
  "ORACLE CLOUD VM • DOCKER COMPOSE • POSTGRESQL • REDIS CACHE • AWS SES RELAYS • CLOUDFLARE SSL • ",
  "WILD MUSHROOM FORAGING • MYCOLOGY FIELD NOTES • MACRO PHOTOGRAPHY • ANALOG TEXTURES • LOOSE-LEAF TEA • ",
  "FIBER ARTS • HAND CROCHET • SADDLE STITCHED JOURNALS • ARCHITECTURAL ESSAYS • SPATIAL 3D • ",
  "ZERO BLOAT COMPUTING • MINIMALIST SOFTWARE ARCHITECTURES • SELF-HOSTED SERVICES • LINUX SYSADMIN • ",
];

export default function AvantGardeHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const headControls = useAnimation();

  const currentFullText = FUN_PHRASES[phraseIndex];
  const isMarqueeActive = phraseIndex === 6; // State right before "Tap my head again :)"

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
      {/* ── ULTRA-DENSE FULL-SCREEN HARDWARE-ACCELERATED RUNNING WALL MATRIX (26 ROWS) ── */}
      <AnimatePresence>
        {isMarqueeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={styles.marqueeWallBackground}
          >
            {MATRIX_ROWS.map((text, idx) => {
              const isEven = idx % 2 === 0;
              const duration = 18 + (idx % 5) * 2.5;
              const repeatText = `${text} ${text} ${text} ${text} `;

              return (
                <div key={idx} className={styles.marqueeRowWrap}>
                  <motion.div
                    className={styles.marqueeRowContent}
                    animate={{
                      x: isEven ? [0, -900] : [-900, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      ease: 'linear',
                      duration,
                    }}
                  >
                    <span>{repeatText}</span>
                    <span>{repeatText}</span>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.mainContainer}>
        {/* ── 1. CLEAN TOP NAVBAR (CIRCULAR IA ON LEFT, SLEEK EXPANDABLE MENU ON RIGHT) ── */}
        <header className={styles.topNavbarRow}>
          {/* Left: Standalone Circular IA Button */}
          <Link href="/" className={styles.circularLogoIsland} title="Ivan Affriandi">
            IA
          </Link>

          {/* Right: Expandable Menu Group with Horizontal Smooth Transition */}
          <div className={styles.menuExpanderGroup}>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.92 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={styles.floatingMenuPillsRow}
                >
                  <a
                    href="https://blog.ivanaffriandi.com"
                    className={styles.menuPillLink}
                    title="Blog & Journal"
                  >
                    <FeatherPenIcon />
                    <span>Blog</span>
                  </a>
                  <Link
                    href="/ask"
                    className={styles.menuPillLink}
                    title="Ask Anonymous"
                  >
                    <AskChatIcon />
                    <span>Ask</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={styles.circularMenuIslandBtn}
              title="Toggle Menu"
              aria-label="Toggle Menu"
            >
              <span
                className={styles.menuBarEqual}
                style={{
                  transform: isMenuOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none',
                }}
              />
              <span
                className={styles.menuBarEqual}
                style={{
                  transform: isMenuOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none',
                }}
              />
            </button>
          </div>
        </header>

        {/* ── 2. CENTER HERO STAGE (DEAD-CENTER FOCAL POINT) ── */}
        <main
          className={styles.centerHeroStage}
          onClick={() => {
            if (isMenuOpen) setIsMenuOpen(false);
          }}
        >
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

          {/* Send Email Button with Rounded Envelope Icon */}
          <a
            href="mailto:hello@ivanaffriandi.com"
            className={styles.sendEmailCtaBtn}
            title="Send Email"
          >
            <RoundedEmailIcon />
            <span>Send Email</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
