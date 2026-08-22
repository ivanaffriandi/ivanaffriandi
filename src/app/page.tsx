'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

// Ultra-dense matrix dataset for 26 continuous running rows
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

// Comprehensive Site-Wide Search Index
interface SearchItem {
  id: string;
  title: string;
  category: 'BLOG' | 'ASK' | 'CRAFT' | 'PORTFOLIO' | 'LINK';
  description: string;
  url: string;
  isExternal?: boolean;
}

const SEARCH_DATABASE: SearchItem[] = [
  {
    id: 'b-1',
    title: 'Designing with Zero Bloat',
    category: 'BLOG',
    description: 'Why minimalist interfaces and ultra-fast architectures always win.',
    url: 'https://blog.ivanaffriandi.com',
    isExternal: true,
  },
  {
    id: 'b-2',
    title: 'Reflections on Saddle Stitching & Code',
    category: 'BLOG',
    description: 'Parallels between traditional leather craft and software architecture.',
    url: 'https://blog.ivanaffriandi.com',
    isExternal: true,
  },
  {
    id: 'b-3',
    title: 'Mycology Field Notes & Forest Trails',
    category: 'BLOG',
    description: 'Foraging wild fungi and appreciating natural algorithms.',
    url: 'https://blog.ivanaffriandi.com',
    isExternal: true,
  },
  {
    id: 'a-1',
    title: 'Ask Anonymous Portal',
    category: 'ASK',
    description: 'Ask me anything anonymously or view answered letters and reflections.',
    url: '/ask',
  },
  {
    id: 'c-1',
    title: 'SHŪ / EN Studio Atelier',
    category: 'CRAFT',
    description: 'Bespoke leather goods handcrafted in Tuscan vegetable-tanned leather.',
    url: 'https://instagram.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'c-2',
    title: 'Solid 925 Sterling Silver & Moire Silk',
    category: 'CRAFT',
    description: 'Custom jewelry accents and vintage kimono silk linings for journals.',
    url: 'https://instagram.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'p-1',
    title: 'UI/UX Design Systems & Spatial Tokens',
    category: 'PORTFOLIO',
    description: 'Component architecture, micro-interactions, and Figma design tokens.',
    url: 'mailto:hello@ivanaffriandi.com',
  },
  {
    id: 'p-2',
    title: 'Next.js 16 & High Performance Web',
    category: 'PORTFOLIO',
    description: 'Full-stack web engineering, React 19, TypeScript, and server components.',
    url: 'https://github.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'l-1',
    title: 'GitHub Repositories',
    category: 'LINK',
    description: 'Open source experiments, systems, and web projects.',
    url: 'https://github.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'l-2',
    title: 'Instagram Visual Journal',
    category: 'LINK',
    description: 'Daily atelier snapshots, photography moments, and studio craft.',
    url: 'https://instagram.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'l-3',
    title: 'X (Twitter) Feed',
    category: 'LINK',
    description: 'Thoughts on design, technology, and engineering.',
    url: 'https://x.com/ivanaffriandi',
    isExternal: true,
  },
  {
    id: 'l-4',
    title: 'Email Inquiry & Collaborations',
    category: 'LINK',
    description: 'Get in touch for design projects, writing, or bespoke commissions.',
    url: 'mailto:hello@ivanaffriandi.com',
  },
];

export default function AvantGardeHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phraseIndex, setPhraseIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const headControls = useAnimation();

  const currentFullText = FUN_PHRASES[phraseIndex];
  const isMarqueeActive = phraseIndex === 6; // State right before "Tap my head again :)"

  // Keyboard Shortcut (⌘K and / to open search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Filtered Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return SEARCH_DATABASE;
    const q = searchQuery.toLowerCase();
    return SEARCH_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
        {/* ── 1. UNIFIED SINGLE PILL NAVBAR WITH SEARCH IN THE MIDDLE ── */}
        <header className={styles.topNavbar}>
          {/* Left: IA Monogram */}
          <Link href="/" className={styles.logoMonogram} title="Ivan Affriandi">
            IA
          </Link>

          {/* Center: Search Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={styles.centerSearchBtn}
            title="Search ivanaffriandi.com (⌘K)"
          >
            <div className={styles.searchIconTextWrap}>
              <SearchIcon />
              <span>Search...</span>
            </div>
            <span className={styles.searchKbdBadge}>⌘K</span>
          </button>

          {/* Right: Expandable Menu Group */}
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

            {/* 2-Line Minimalist Hamburger Button */}
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

        {/* ── 2. CENTER HERO STAGE (DEAD-CENTER FOCAL POINT) ── */}
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

      {/* ── 4. SITE-WIDE SEARCH ENGINE MODAL (COMMAND PALETTE) ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className={styles.searchModalOverlay}
          >
            <motion.div
              initial={{ scale: 0.95, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className={styles.searchModalCard}
            >
              <div className={styles.searchModalHeader}>
                <SearchIcon />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search blog, ask, craft, moments & links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchModalInput}
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className={styles.searchCloseKeyBtn}
                >
                  ESC
                </button>
              </div>

              <div className={styles.searchResultsList}>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      className={styles.searchResultItem}
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div className={styles.searchResultLeft}>
                        <span className={styles.searchResultTitle}>{item.title}</span>
                        <span className={styles.searchResultSub}>{item.description}</span>
                      </div>
                      <span className={styles.searchResultBadge}>{item.category}</span>
                    </a>
                  ))
                ) : (
                  <div className={styles.searchEmptyState}>
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
