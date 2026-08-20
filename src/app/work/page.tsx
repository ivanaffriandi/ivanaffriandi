'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'skills';

// Clean Minimal Social Icons
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('9:55 PM (WIB)');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      setLiveTime(`${timeStr} (WIB)`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const row1 = [
    { num: '01', title: 'Next.js 16' },
    { num: '02', title: 'React 19' },
    { num: '03', title: 'TypeScript' },
    { num: '04', title: 'Tailwind CSS' },
    { num: '05', title: 'Framer Motion' },
    { num: '06', title: 'Figma Systems' },
  ];

  const row2 = [
    { num: '07', title: 'Three.js 3D' },
    { num: '08', title: 'WebGL 2.0' },
    { num: '09', title: 'GLSL Shaders' },
    { num: '10', title: '3D Configurator' },
    { num: '11', title: 'Web Audio API' },
    { num: '12', title: 'Blender 3D' },
  ];

  const row3 = [
    { num: '13', title: 'Oracle Cloud VM' },
    { num: '14', title: 'AWS SES Relay' },
    { num: '15', title: 'Docker Compose' },
    { num: '16', title: 'PostgreSQL' },
    { num: '17', title: 'Redis Cache' },
    { num: '18', title: 'Cloudflare SSL' },
  ];

  const row4 = [
    { num: '19', title: 'Italian Leather' },
    { num: '20', title: 'Pattern Drafting' },
    { num: '21', title: 'Saddle Stitching' },
    { num: '22', title: 'Solid 925 Silver' },
    { num: '23', title: 'Edge Burnishing' },
    { num: '24', title: 'Journal Binding' },
  ];

  return (
    <div className={styles.portfolioViewport}>
      <div className={styles.portfolioContainer}>
        {/* ── 1. CLEAN TOP HEADER ── */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <a href="https://ivanaffriandi.com" className={styles.brandTitle}>
              Ivan&apos;s Work<sup>®</sup>
            </a>
            <span className={styles.headerClock}>{liveTime}</span>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.socialsGroup}>
              <a
                href="https://instagram.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://github.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title="GitHub"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                href="https://x.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title="X (Twitter)"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
              <a
                href="mailto:hello@ivanaffriandi.com"
                className={styles.socialLink}
                title="Email"
                aria-label="Email"
              >
                <MailIcon />
              </a>
            </div>
          </div>
        </header>

        {/* ── 2. HERO IDENTITY: NATURAL SEAMLESS PORTRAIT ON BACKGROUND + BIG NAME ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroIdentityRow}>
            {/* Seamless portrait directly on background (NO grey box, NO borders) */}
            <div className={styles.seamlessPortraitWrapper}>
              <img
                src="/ivan-head.png"
                alt="Affriandi, Ivan"
                className={styles.seamlessPortraitImg}
              />
            </div>

            <div className={styles.heroTextCol}>
              <h1 className={styles.heroNameTitle}>
                <span className={styles.nameLine}>Affriandi,</span>
                <span className={styles.nameLine}>Ivan</span>
              </h1>
              <p className={styles.heroBioLead}>
                Software engineer by trade, UI/UX designer by obsession, bespoke leather artisan by night, and wild mushroom forager when I need to get away from screens. I build fast digital tools and stitch real physical goods in my studio.
              </p>
            </div>
          </div>

          {/* ── 3. METADATA INFO STRIP ── */}
          <div className={styles.metaInfoStrip}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Timeline</span>
              <span className={styles.metaValue}>2020 — Present</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Focus</span>
              <span className={styles.metaValue}>Code, Pixels &amp; Leather</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Output</span>
              <span className={styles.metaValue}>Digital Apps &amp; Physical Goods</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Base</span>
              <span className={styles.metaValue}>Tangerang, Indonesia</span>
            </div>
          </div>

          {/* ── 4. NAVIGATION BAR (LOCKED TABS CANNOT BE OPENED) ── */}
          <nav className={styles.navBar} aria-label="Portfolio Navigation">
            <div className={styles.navTrack}>
              {/* Active Tab: About */}
              <button
                onClick={() => setActiveTab('about')}
                className={`${styles.navTabBtn} ${activeTab === 'about' ? styles.navTabActive : ''}`}
                type="button"
              >
                About
                {activeTab === 'about' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className={styles.activeUnderline}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {/* Active Tab: Skills */}
              <button
                onClick={() => setActiveTab('skills')}
                className={`${styles.navTabBtn} ${activeTab === 'skills' ? styles.navTabActive : ''}`}
                type="button"
              >
                Skills
                {activeTab === 'skills' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className={styles.activeUnderline}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {/* Locked Tabs (Cannot be clicked or opened) */}
              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabDisabled}`}
                type="button"
                title="Coming Soon"
              >
                Projects <span className={styles.soonPill}>Soon</span>
              </button>

              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabDisabled}`}
                type="button"
                title="Coming Soon"
              >
                Process <span className={styles.soonPill}>Soon</span>
              </button>

              <button
                disabled
                className={`${styles.navTabBtn} ${styles.navTabDisabled}`}
                type="button"
                title="Coming Soon"
              >
                Services &amp; Log <span className={styles.soonPill}>Soon</span>
              </button>
            </div>
          </nav>
        </section>

        {/* ── 5. MAIN CONTENT AREA ── */}
        <main className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {/* ── 1. ABOUT VIEW ── */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.contentWrap}
              >
                {/* SECTION 01: WHO I AM */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>01 · WHO I AM</span>
                    <h2 className={styles.sectionTitle}>The Strange Mix</h2>
                  </div>

                  <div className={styles.proseGrid}>
                    <p className={styles.proseParagraph}>
                      Look, I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying. Some days I am deep in VS Code tuning Next.js performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over letter spacing and layout tokens, or hand-stitching a vegetable-tanned leather journal with hot tea getting cold next to me.
                    </p>
                    <p className={styles.proseParagraph}>
                      I just love building things from scratch. Whether it is a web app with zero dependencies, a private email server I probably didn&apos;t need to self-host, or a leather wallet built to outlive all of us. The contrast between glowing screen pixels and raw tactile leather is what keeps my brain happy.
                    </p>
                  </div>
                </section>

                {/* SECTION 02: WHAT I DO */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>02 · WHAT I DO</span>
                    <h2 className={styles.sectionTitle}>Six Areas of Focus</h2>
                  </div>

                  <div className={styles.sixCardsGrid}>
                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>01 · DESIGN</span>
                      <h3 className={styles.cardHeading}>Product &amp; UI/UX</h3>
                      <p className={styles.cardBodyText}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spacing, hierarchy, and micro-interactions that feel snappy and effortless to use. No cluttered junk.
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Figma Systems</span>
                        <span className={styles.miniTag}>Typography</span>
                        <span className={styles.miniTag}>Interaction Design</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>02 · CODE</span>
                      <h3 className={styles.cardHeading}>Software Engineering</h3>
                      <p className={styles.cardBodyText}>
                        Full-stack web applications built with Next.js 16, React 19, and TypeScript. Fast, lightweight code without bloated npm dependencies. If a page takes more than a second to load, it hurts my soul.
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Next.js 16</span>
                        <span className={styles.miniTag}>React 19</span>
                        <span className={styles.miniTag}>TypeScript</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>03 · INFRA</span>
                      <h3 className={styles.cardHeading}>Self-Hosted &amp; Freedom</h3>
                      <p className={styles.cardBodyText}>
                        Running my own cloud VMs, configuring private SMTP/DKIM mail servers, and building tools I actually own. The internet is way more fun when you run your own infrastructure.
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Self-Hosted</span>
                        <span className={styles.miniTag}>Cloud VMs</span>
                        <span className={styles.miniTag}>Private Mail</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>04 · ATELIER</span>
                      <h3 className={styles.cardHeading}>Bespoke Leathercraft</h3>
                      <p className={styles.cardBodyText}>
                        Handcrafting luxury leather goods through SHŪ / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 sterling silver charms. No machines, just needles and patience.
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Italian Leather</span>
                        <span className={styles.miniTag}>Saddle Stitch</span>
                        <span className={styles.miniTag}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>05 · EXPERIMENTS</span>
                      <h3 className={styles.cardHeading}>Creative Tech &amp; 3D</h3>
                      <p className={styles.cardBodyText}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built purely because &quot;what if I try to code this tonight?&quot;
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Three.js</span>
                        <span className={styles.miniTag}>WebGL 2.0</span>
                        <span className={styles.miniTag}>GLSL Shaders</span>
                      </div>
                    </div>

                    <div className={styles.disciplineCard}>
                      <span className={styles.cardIndexNum}>06 · VISUALS</span>
                      <h3 className={styles.cardHeading}>Visual Essays &amp; Notes</h3>
                      <p className={styles.cardBodyText}>
                        Documentary snapshots of daily studio work, analog textures, architectural forms, and field notes from quiet mushroom walks out in the wild.
                      </p>
                      <div className={styles.cardTags}>
                        <span className={styles.miniTag}>Visual Notes</span>
                        <span className={styles.miniTag}>Analog Textures</span>
                        <span className={styles.miniTag}>Field Notes</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 03: THE OTHER 50% */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>03 · THE OTHER 50%</span>
                    <h2 className={styles.sectionTitle}>When I Am Not Staring at Code</h2>
                  </div>

                  <div className={styles.sixCardsGrid}>
                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>01 · Wild Mushrooms &amp; Fungi</h3>
                      <p className={styles.hobbyText}>
                        Wandering damp trails with field guides, spotting weird fungi, taking macro photos, and appreciating nature&apos;s wildest procedural geometry.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>02 · Crochet &amp; Fiber Arts</h3>
                      <p className={styles.hobbyText}>
                        Yarn, needles, and tension control. Making physical everyday goods with my own hands when typing on a keyboard gets tiring.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>03 · Hot Tea &amp; Quiet Desks</h3>
                      <p className={styles.hobbyText}>
                        Loose-leaf green tea before 8 AM while the city is quiet, sketching out random software ideas in blank paper notebooks.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>04 · Non-Fiction &amp; Old Books</h3>
                      <p className={styles.hobbyText}>
                        Hoarding books on design history, architecture, philosophy, human psychology, and obscure historical rabbit holes on my Kindle.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>05 · Wandering Quiet Museums</h3>
                      <p className={styles.hobbyText}>
                        Strolling through empty galleries, inspecting ancient physical artifacts, and geeking out over how craftspeople worked centuries ago.
                      </p>
                    </div>

                    <div className={styles.hobbyCard}>
                      <h3 className={styles.hobbyHeading}>06 · Studio Plants</h3>
                      <p className={styles.hobbyText}>
                        Propagating cuttings and watching green foliage quietly take over my studio terrace in Tangerang without any rush.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 04: WORKING PHILOSOPHY */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>04 · WORKING PHILOSOPHY</span>
                    <h2 className={styles.sectionTitle}>My Rules of Thumb</h2>
                  </div>

                  <div className={styles.philosophyGrid}>
                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Build it yourself first.</h3>
                      <p className={styles.philosophyBody}>
                        If something sounds interesting, I want to take it apart, understand the engine, and build my own version. That is how real learning happens.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Cut the noise.</h3>
                      <p className={styles.philosophyBody}>
                        Good design is about deleting stuff until only what matters remains. If an interface feels dead simple, a lot of hard thinking went into making it that way.
                      </p>
                    </div>

                    <div className={styles.philosophyCard}>
                      <h3 className={styles.philosophyHeadline}>Pixels and physical craft belong together.</h3>
                      <p className={styles.philosophyBody}>
                        Designing UI makes me a sharper leather artisan, and hand-stitching leather makes me write cleaner code. Cross-pollination keeps work honest.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 05: CURRENT STATUS BOARD */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>05 · STATUS BOARD</span>
                    <h2 className={styles.sectionTitle}>What Is On My Desk</h2>
                  </div>

                  <div className={styles.statusGrid}>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Reading</span>
                      <span className={styles.statusVal}>Design history, old essays &amp; sci-fi</span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Making</span>
                      <span className={styles.statusVal}>Next.js web apps &amp; bespoke leather journals</span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Learning</span>
                      <span className={styles.statusVal}>Spanish, Dutch &amp; 3D shader mathematics</span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Exploring</span>
                      <span className={styles.statusVal}>Wild mycology &amp; macro photography</span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Tinkering</span>
                      <span className={styles.statusVal}>Self-hosted servers &amp; private mail infrastructure</span>
                    </div>
                    <div className={styles.statusItem}>
                      <span className={styles.statusLabel}>Thinking About</span>
                      <span className={styles.statusVal}>What cool project to hack on next</span>
                    </div>
                  </div>
                </section>

                {/* SECTION 06: SMALL THINGS I LIKE */}
                <section className={styles.editorialSection}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNumber}>06 · SMALL THINGS I LIKE</span>
                    <h2 className={styles.sectionTitle}>Stuff I Genuinely Love</h2>
                  </div>

                  <div className={styles.likesWrap}>
                    <span className={styles.likePill}>Crisp typography</span>
                    <span className={styles.likePill}>Quiet museums</span>
                    <span className={styles.likePill}>Fresh hot green tea</span>
                    <span className={styles.likePill}>Vegetable-tanned patina</span>
                    <span className={styles.likePill}>Monospace fonts</span>
                    <span className={styles.likePill}>Wild forest mushrooms</span>
                    <span className={styles.likePill}>Zero-dependency code</span>
                    <span className={styles.likePill}>Fast loading websites</span>
                    <span className={styles.likePill}>Deep technical rabbit holes</span>
                    <span className={styles.likePill}>Blank analog notebooks</span>
                    <span className={styles.likePill}>Building things just for fun</span>
                  </div>
                </section>

                {/* SECTION 07: GET IN TOUCH BANNER */}
                <div className={styles.contactBanner}>
                  <div className={styles.contactTextCol}>
                    <h3 className={styles.contactTitle}>Got a cool idea or weird project?</h3>
                    <p className={styles.contactDesc}>
                      Whether it is a strange technical puzzle, a high-craft interface, or bespoke atelier goods, I am always down to chat about interesting work.
                    </p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com" className={styles.contactActionBtn}>
                    Say Hello ↗
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 2. SKILLS VIEW ── */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.contentWrap}
              >
                <div className={styles.skillsPillarGrid}>
                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>01 · FRONTEND</h3>
                    <p className={styles.pillarDesc}>Snappy, beautiful interfaces that feel great to use.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Next.js 16</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> React 19 &amp; TypeScript</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Framer Motion</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Tailwind CSS</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Figma Systems</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>02 · 3D &amp; AUDIO</h3>
                    <p className={styles.pillarDesc}>Interactive WebGL 3D models and procedural sound.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Three.js &amp; WebGL</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> GLSL Shaders</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> 3D Customizers</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Web Audio API</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Blender 3D</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>03 · BACKEND</h3>
                    <p className={styles.pillarDesc}>Fast cloud servers, containers, and secure APIs.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Node.js &amp; Python</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Oracle Cloud &amp; AWS SES</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Docker Compose</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> PostgreSQL &amp; Redis</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Cloudflare SSL</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarCard}>
                    <h3 className={styles.pillarCategoryTitle}>04 · ATELIER</h3>
                    <p className={styles.pillarDesc}>Traditional bespoke leather goods crafted by hand.</p>
                    <div className={styles.pillarSkillList}>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Italian Leather</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Saddle Stitching</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Solid 925 Silver</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Edge Burnishing</span>
                      <span className={styles.pillarSkillItem}><span className={styles.pillarSkillDot} /> Pattern Drafting</span>
                    </div>
                  </div>
                </div>

                {/* Kinetic Marquee Stream */}
                <div className={styles.skillsPureTypographyWrapper}>
                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...row1, ...row1, ...row1].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...row2, ...row2, ...row2].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...row3, ...row3, ...row3].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticRowTrack}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...row4, ...row4, ...row4].map((item, idx) => (
                        <div key={idx} className={styles.pureTextItem}>
                          <span className={styles.pureTextIndex}>{item.num}</span>
                          <span>{item.title}</span>
                          <span className={styles.pureTextBullet}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── 6. FOOTER ── */}
        <footer className={styles.pageFooter}>
          <span className={styles.footerCopyright}>
            © {new Date().getFullYear()} Affriandi, Ivan · All Rights Reserved
          </span>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.footerAtelierLink}
          >
            Visit SHŪ / EN Atelier →
          </a>
        </footer>
      </div>
    </div>
  );
}
