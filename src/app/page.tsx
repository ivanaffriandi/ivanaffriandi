'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './homepage.module.css';
import { MINIMALIST_NATURE_COVERS, getMinimalistNatureCover } from '@/utils/natureCover';

const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MediumIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
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
  "Hi, I'm Ivan!\nA UI/UX designer & writer based in Jakarta.",
  "Here are a few recent stories from my journal:",
  "I also craft bespoke leather, silver goods, & teach at my academy:",
  "Here is my full technical & craft matrix:",
  "Tap my head to loop back :)",
];

const CREATIVE_STUDIOS = [
  {
    name: "SHŪ / EN",
    url: "https://shuenstudio.com",
  },
  {
    name: "KVR Objects",
    url: "https://kvr-objects.com",
  },
  {
    name: "Equilibrium",
    url: "https://equilibriumians.com",
  },
];

const FALLBACK_JOURNAL_COVERS = MINIMALIST_NATURE_COVERS;

function extractCoverImage(html: string): string | null {
  if (!html) return null;
  const cleanHtml = html.replace(/<img[^>]*medium\.com\/_\/stat[^>]*>/gi, "");
  const match = cleanHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  if (url.includes("medium.com/_/stat") || url.includes("tracking")) return null;
  url = url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
  url = url.replace(/\/resize:fit:\d+\//, "/resize:fit:1600/");
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

// Pre-buffered instant Web Audio API mechanical typewriter sound engine
let audioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    if (!cachedNoiseBuffer && audioCtx.sampleRate) {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.035);
      cachedNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = cachedNoiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (audioCtx.sampleRate * 0.007));
        output[i] = (Math.random() * 2 - 1) * decay;
      }
    }
  }
  return audioCtx;
};

const playTypewriterClick = (char: string) => {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running' || !cachedNoiseBuffer) return;

    const now = ctx.currentTime;
    const isSpace = char === ' ';
    const isEnter = char === '\n';
    const randomSeed = Math.random();

    // 1. Primary Hammer Strike
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = cachedNoiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const strikeFreq = isEnter ? 850 : isSpace ? 1100 + randomSeed * 200 : 2700 + (randomSeed - 0.5) * 500;
    filter.frequency.setValueAtTime(strikeFreq, now);
    filter.Q.setValueAtTime(isSpace || isEnter ? 2.2 : 4.0, now);

    const noiseGain = ctx.createGain();
    const strikeVol = isEnter ? 0.22 : isSpace ? 0.13 : 0.17 + (randomSeed - 0.5) * 0.04;
    noiseGain.gain.setValueAtTime(strikeVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isEnter ? 0.04 : 0.025));

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);

    // 2. Typebar Linkage Snap
    if (!isSpace && !isEnter) {
      const snapOsc = ctx.createOscillator();
      snapOsc.type = 'square';
      const snapFreq = 1600 + (randomSeed - 0.5) * 350;
      snapOsc.frequency.setValueAtTime(snapFreq, now);
      snapOsc.frequency.exponentialRampToValueAtTime(snapFreq * 0.25, now + 0.01);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.05, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.01);
    }

    // 3. Chassis Thud
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = isEnter ? 'sawtooth' : isSpace ? 'sine' : 'triangle';
    const bodyFreq = isEnter ? 150 : isSpace ? 200 + (randomSeed - 0.5) * 20 : 620 + (randomSeed - 0.5) * 100;
    bodyOsc.frequency.setValueAtTime(bodyFreq, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.6, now + (isEnter ? 0.05 : 0.03));

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(isEnter ? 0.14 : isSpace ? 0.09 : 0.06, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + (isEnter ? 0.05 : 0.03));

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + (isEnter ? 0.05 : 0.03));
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
  const isMarqueeActive = phraseIndex === 3; // State for "Here is my full technical & craft matrix:"
  const isCompactHero = phraseIndex === 1;

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

  const processedPosts = useMemo(() => {
    return displayPosts.slice(0, 3).map((post, idx) => {
      const extracted = extractCoverImage(post.content);
      const cover = extracted || getMinimalistNatureCover(post.title || String(post.id || idx));
      const dateStr = post.published ? new Date(post.published).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent";
      const cleanTitle = (post.title || "").replace(/^Chapter\s*\d+\s*:\s*/i, "").trim();
      return {
        id: post.id || `post-${idx}`,
        title: cleanTitle,
        cover,
        dateStr,
      };
    });
  }, [displayPosts]);

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

  // Letter-by-Letter Typing Effect with Instant Synced Audio
  useEffect(() => {
    let charIndex = 0;
    setDisplayText('');

    let timer: NodeJS.Timeout;

    const typeNextChar = () => {
      if (charIndex < currentFullText.length) {
        const nextChar = currentFullText[charIndex];
        const updatedText = currentFullText.slice(0, charIndex + 1);
        setDisplayText(updatedText);
        playTypewriterClick(nextChar);
        charIndex++;

        // Natural snappy cadence: slightly pause on newline or punctuation
        const delay = nextChar === '\n' ? 140 : (nextChar === '.' || nextChar === '!' || nextChar === ':') ? 80 : 34;
        timer = setTimeout(typeNextChar, delay);
      }
    };

    timer = setTimeout(typeNextChar, 60);

    return () => clearTimeout(timer);
  }, [currentFullText]);

  // Head Tap Reaction
  const handleHeadTap = () => {
    getAudioContext();
    headControls.start({
      rotate: [0, -10, 8, -4, 2, 0],
      scale: [1, 0.90, 1.06, 0.98, 1],
      transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
    });

    try {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.48 },
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
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={styles.marqueeWallBackground}
          >
            {MATRIX_ROWS.map((text, idx) => {
              const isEven = idx % 2 === 0;
              const duration = 20 + (idx % 6) * 3;
              const repeatText = `${text} ${text} ${text} `;

              return (
                <div key={idx} className={styles.marqueeRowWrap}>
                  <div
                    className={isEven ? styles.marqueeRowContentLeft : styles.marqueeRowContentRight}
                    style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
                  >
                    <span>{repeatText}</span>
                    <span>{repeatText}</span>
                  </div>
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
        <motion.main
          layout
          transition={{
            layout: {
              type: "spring",
              stiffness: 280,
              damping: 28,
              mass: 0.8,
            },
          }}
          className={styles.centerHeroStage}
        >
          {/* Radial Contrast Scrim only when running text is active */}
          {isMarqueeActive && <div className={styles.heroContrastScrim} />}

          {/* HEAD WRAPPER WITH SILKY SMOOTH PHYSICAL SPRING SCALING */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              layout
              animate={{
                scale: isCompactHero ? 0.74 : 1,
                y: isCompactHero ? -4 : 0,
              }}
              transition={{
                layout: { type: "spring", stiffness: 280, damping: 28 },
                scale: { type: "spring", stiffness: 300, damping: 24, mass: 0.7 },
                y: { type: "spring", stiffness: 300, damping: 24, mass: 0.7 },
              }}
              whileTap={{ scale: (isCompactHero ? 0.74 : 1) * 0.92 }}
              onClick={handleHeadTap}
              className={styles.bigHeadTapWrap}
              title="Tap me!"
            >
              <motion.img
                animate={headControls}
                src="/ivan-head.png"
                alt="Ivan Affriandi"
                className={styles.bigHeadTapImg}
              />
            </motion.div>
          </div>

          <div className={styles.typewriterTextWrap} onClick={handleHeadTap}>
            {/* Ghost invisible span to reserve the exact layout bounds and eliminate all typing jitter */}
            <span className={styles.handwritingTextGhost} aria-hidden="true">
              {currentFullText}
            </span>
            <span className={styles.handwritingText}>
              {displayText}
              <span className={styles.typingCaret} />
            </span>
          </div>

          {/* COMPACT RECENT 3 BLOGS WIDGET (APPEARS ON PHRASE 1) */}
          <AnimatePresence initial={false}>
            {phraseIndex === 1 && (
              <motion.div
                key="blogs-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.compactBlogsContainer}
              >
                {processedPosts.map((post, idx) => (
                  <motion.a
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://blog.ivanaffriandi.com"
                    className={styles.compactBlogItem}
                    title={post.title}
                  >
                    <div className={styles.compactBlogThumbWrap}>
                      <img
                        src={post.cover}
                        alt={post.title}
                        loading="eager"
                        decoding="async"
                        className={styles.compactBlogThumbImg}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_JOURNAL_COVERS[(idx + 1) % FALLBACK_JOURNAL_COVERS.length];
                        }}
                      />
                    </div>
                    <div className={styles.compactBlogInfo}>
                      <h4 className={styles.compactBlogTitle}>{post.title}</h4>
                      <span className={styles.compactBlogMeta}>{post.dateStr}</span>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={styles.compactBlogChevron}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HORIZONTAL SIMPLE CREATIVE STUDIOS & ACADEMY LINKS */}
          <AnimatePresence initial={false}>
            {phraseIndex === 2 && (
              <motion.div
                key="studios-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.horizontalStudiosContainer}
              >
                {CREATIVE_STUDIOS.map((studio, idx) => (
                  <motion.a
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.97 }}
                    href={studio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.horizontalStudioItem}
                    title={studio.name}
                  >
                    <span>{studio.name}</span>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={styles.horizontalStudioChevron}>
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Dots Indicator */}
          <div className={styles.progressDotsRow} onClick={handleHeadTap}>
            {FUN_PHRASES.map((_, i) => (
              <motion.span
                key={i}
                className={styles.progressDot}
                animate={{
                  width: i === phraseIndex ? 16 : 4,
                  opacity: i === phraseIndex ? 0.9 : 0.22,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            ))}
          </div>

          <span className={styles.tapHintText} onClick={handleHeadTap} style={{ cursor: 'pointer' }}>
            Tap head for more
          </span>
        </motion.main>

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
              href="https://medium.com/@ivanaffriandi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCircleBtn}
              title="Medium"
              aria-label="Medium"
            >
              <MediumIcon />
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
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
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
