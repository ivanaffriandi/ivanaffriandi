'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
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

// Rounded Envelope Email Icon
const RoundedEmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="4" ry="4" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// Minimal Close (✕) Icon
const MinimalCloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Casual, easy-to-understand English phrases
const FUN_PHRASES = [
  "Hi, I'm Ivan! A UI/UX designer & writer based in Jakarta.",
  "Here are a few recent stories from my journal:",
  "I also handcraft bespoke leather goods in my studio.",
  "Probably foraging wild mushrooms in the forest right now.",
  "Here is my full technical & craft matrix:",
  "Tap my head to loop back :)",
];

function extractCoverImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  url = url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
  return url;
}

// Ultra-dense matrix dataset for 34 continuous running rows
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
  "INTERACTION DESIGN • SPATIAL LAYOUT • MICRO-INTERACTIONS • DESIGN SYSTEM TOKENS • ACCESSIBILITY A11Y • ",
  "TUSCAN VEGETABLE TANNED LEATHER • JAPANESE MOIRE SILK LINING • BESPOKE JOURNAL COVERS • WAXED THREAD • ",
  "NEXT.JS APP ROUTER • REACT SERVER COMPONENTS • JAVASCRIPT ES2026 • RUST AXUM • EDGE WORKERS • ",
  "CREATIVE WRITING • TECH ESSAYS • PRODUCT STRATEGY • SWISS MINIMALISM • HIGH FIDELITY PROTOTYPING • ",
  "USER EXPERIENCE RESEARCH • WIREFRAMING • COMPONENT LIBRARIES • BRAND IDENTITY • EDITORIAL CURATION • ",
  "FULL STACK ARCHITECTURE • DATABASE INDEXING • REST & GRAPHQL • PRISMA ORM • BASH SCRIPTING • ",
  "HAND CUT LEATHER PATTERNS • PRICKING IRONS • BEESWAX EDGE POLISH • HERITAGE CRAFTSMANSHIP • ",
  "FOREST TRAIL NAVIGATION • FUNGI SPORE PRINTS • BOTANICAL SKETCHING • BOTANICAL WATERCOLORS • ",
];

// Enhanced authentic vintage mechanical typewriter sound engine via Web Audio API
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playTypewriterClick = (isSpace = false) => {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const randomSeed = Math.random();

    // 1. PRIMARY MECHANICAL HAMMER CLACK (Crisp metal-on-platen strike)
    const bufferSize = Math.floor(ctx.sampleRate * 0.028);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.006));
      output[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const strikeFreq = isSpace ? 1100 + randomSeed * 200 : 2800 + (randomSeed - 0.5) * 600;
    filter.frequency.setValueAtTime(strikeFreq, now);
    filter.Q.setValueAtTime(isSpace ? 2.5 : 4.5, now);

    const noiseGain = ctx.createGain();
    const strikeVol = isSpace ? 0.14 : 0.18 + (randomSeed - 0.5) * 0.04;
    noiseGain.gain.setValueAtTime(strikeVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.028);

    // 2. LEVER LINKAGE SNAP (Mechanical linkage micro-click)
    if (!isSpace) {
      const snapOsc = ctx.createOscillator();
      snapOsc.type = 'square';
      const snapFreq = 1600 + (randomSeed - 0.5) * 400;
      snapOsc.frequency.setValueAtTime(snapFreq, now);
      snapOsc.frequency.exponentialRampToValueAtTime(snapFreq * 0.3, now + 0.012);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.06, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.012);
    }

    // 3. TYPEBAR METALLIC RESONANCE / CHASSIS THUD
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = isSpace ? 'sine' : 'triangle';
    const bodyFreq = isSpace ? 210 + (randomSeed - 0.5) * 30 : 680 + (randomSeed - 0.5) * 120;
    bodyOsc.frequency.setValueAtTime(bodyFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.7, now + 0.035);

    const bodyGain = ctx.createGain();
    const bodyVol = isSpace ? 0.1 : 0.07;
    bodyGain.gain.setValueAtTime(bodyVol, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.035);
  } catch {
    // Audio safe fallback
  }
};

export default function AvantGardeHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const headControls = useAnimation();

  const currentFullText = FUN_PHRASES[phraseIndex];
  const isMarqueeActive = phraseIndex === 4; // State for "Here is my full technical & craft matrix:"

  // Fetch latest blog posts for compact preview
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setLatestPosts(data.posts.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const fallbackPosts = [
    {
      id: "nature-hero",
      title: "A Quiet Corner on the Internet",
      published: "2026-08-20T00:00:00.000Z",
      content: '<img src="/nature_hero.png" />',
    },
    {
      id: "minimalism-matters",
      title: "Why Minimalism Matters in Modern UI",
      published: "2026-08-15T00:00:00.000Z",
      content: '<img src="/leather_banner.png" />',
    },
    {
      id: "swiss-design",
      title: "The Essence of Swiss Design & Craftsmanship",
      published: "2026-08-10T00:00:00.000Z",
      content: '<img src="/tea_banner.png" />',
    },
  ];

  const displayPosts = latestPosts.length > 0 ? latestPosts : fallbackPosts;

  // Lock body & html scrolling completely on iPhone / Mobile browsers
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Letter-by-Letter Typing Effect with Synced Typewriter Audio
  useEffect(() => {
    let charIndex = 0;
    setDisplayText('');

    const interval = setInterval(() => {
      if (charIndex < currentFullText.length) {
        const nextChar = currentFullText[charIndex];
        setDisplayText(currentFullText.slice(0, charIndex + 1));
        playTypewriterClick(nextChar === ' ');
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [currentFullText]);

  // Head Tap Reaction
  const handleHeadTap = () => {
    getAudioContext();
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
    <div
      className={styles.homepageViewport}
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* ── ULTRA-DENSE FULL-SCREEN HARDWARE-ACCELERATED RUNNING WALL MATRIX (34 ROWS) ── */}
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
              const repeatText = `${text} ${text} ${text} `;

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
        {/* ── ZONE 1: TOP NAVBAR (PERFECT 1:1 CENTER ALIGNMENT) ── */}
        <header className={styles.topNavbarRow}>
          {/* Left: "AFFRIANDI, IVAN" Uppercase No Period */}
          <Link href="/" className={styles.textLogoIsland} title="Ivan Affriandi">
            AFFRIANDI, IVAN
          </Link>

          {/* Right: Circular Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={styles.circularMenuIslandBtn}
            title="Open Menu"
            aria-label="Open Menu"
          >
            <span className={styles.menuBarEqual} />
            <span className={styles.menuBarEqual} />
          </button>
        </header>

        {/* ── ZONE 2: CENTER HERO STAGE (DEAD-CENTER: 50%, 50%) ── */}
        <main className={styles.centerHeroStage}>
          {/* Radial Contrast Scrim only when running text is active */}
          {isMarqueeActive && <div className={styles.heroContrastScrim} />}

          <motion.div
            animate={headControls}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleHeadTap}
            className={`${styles.bigHeadTapWrap}${phraseIndex === 1 ? ` ${styles.bigHeadTapWrapCompact}` : ''}`}
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

          {/* COMPACT RECENT 3 BLOGS WIDGET (APPEARS ON PHRASE 1) */}
          <AnimatePresence>
            {phraseIndex === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={styles.compactBlogsContainer}
              >
                {displayPosts.slice(0, 3).map((post, idx) => {
                  const cover = extractCoverImage(post.content) || (idx === 0 ? "/nature_hero.png" : idx === 1 ? "/leather_banner.png" : "/tea_banner.png");
                  const dateStr = post.published ? new Date(post.published).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent";
                  
                  return (
                    <a
                      key={post.id || idx}
                      href="https://blog.ivanaffriandi.com"
                      className={styles.compactBlogItem}
                      title={post.title}
                    >
                      <div className={styles.compactBlogThumbWrap}>
                        <img src={cover} alt={post.title} className={styles.compactBlogThumbImg} />
                      </div>
                      <div className={styles.compactBlogInfo}>
                        <h4 className={styles.compactBlogTitle}>{post.title}</h4>
                        <span className={styles.compactBlogMeta}>Chapter 0{3 - idx} · {dateStr}</span>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={styles.compactBlogChevron}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <span className={styles.tapHintText} onClick={handleHeadTap} style={{ cursor: 'pointer' }}>
            Tap head for more
          </span>
        </main>

        {/* ── ZONE 3: BOTTOM ACTION BAR (BOTTOM: 14PX) ── */}
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

      {/* ── NATIVE IOS SLIDE MENU OVERLAY (ZERO-FLICKER SLIDE SHEET) ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            className={styles.fullScreenMenuOverlay}
          >
            {/* Header: Close Button on Top-Right (No brand name) */}
            <div className={styles.fullScreenMenuHeader}>
              <div />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className={styles.fullScreenCloseBtn}
                title="Close Menu"
                aria-label="Close Menu"
              >
                <MinimalCloseIcon />
              </button>
            </div>

            {/* Navigation List: Blog, Work (Soon), Ask */}
            <div className={styles.fullScreenNavList}>
              <a
                href="https://blog.ivanaffriandi.com"
                className={styles.fullScreenNavItem}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.navItemDot} />
                <span>Blog</span>
              </a>

              {/* Work (Disabled / Soon) */}
              <div
                className={`${styles.fullScreenNavItem} ${styles.navItemDisabled}`}
                title="Work portfolio coming soon"
              >
                <span className={styles.navItemDot} />
                <span>Work</span>
                <span className={styles.soonBadge}>Soon</span>
              </div>

              <Link
                href="/ask"
                className={styles.fullScreenNavItem}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.navItemDot} />
                <span>Ask</span>
              </Link>
            </div>

            {/* Bottom Space */}
            <div style={{ height: '16px' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
