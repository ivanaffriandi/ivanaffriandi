'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'skills';

// Clean Minimal Social Icons
const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('10:15 PM WIB');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      setLiveTime(`${timeStr} WIB`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const skillRow1 = ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Figma Systems'];
  const skillRow2 = ['Three.js 3D', 'WebGL 2.0', 'GLSL Shaders', '3D Configurator', 'Web Audio API', 'Blender 3D'];
  const skillRow3 = ['Oracle Cloud VM', 'AWS SES Relay', 'Docker Compose', 'PostgreSQL', 'Redis Cache', 'Cloudflare SSL'];
  const skillRow4 = ['Italian Leather', 'Pattern Drafting', 'Saddle Stitching', 'Solid 925 Silver', 'Edge Burnishing', 'Journal Binding'];

  return (
    <div className={styles.fullDesktopViewport}>
      <div className={styles.widePageContainer}>
        {/* ── 1. TOP NAVBAR ── */}
        <header className={styles.topNavbar}>
          <div className={styles.navBrandBlock}>
            <a href="https://ivanaffriandi.com" className={styles.brandHeading}>
              Ivan&apos;s Work<sup>®</sup>
            </a>
            <span className={styles.liveTimePill}>{liveTime}</span>
          </div>

          <div className={styles.navActionsBlock}>
            <div className={styles.socialIconLinks}>
              <a
                href="https://instagram.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cleanSocialBtn}
                title="Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://github.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cleanSocialBtn}
                title="GitHub"
                aria-label="GitHub"
              >
                <GithubIcon />
              </a>
              <a
                href="https://x.com/ivanaffriandi"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cleanSocialBtn}
                title="X (Twitter)"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
              <a
                href="mailto:hello@ivanaffriandi.com"
                className={styles.cleanSocialBtn}
                title="Email Ivan"
                aria-label="Email Ivan"
              >
                <MailIcon />
              </a>
            </div>
          </div>
        </header>

        {/* ── 2. HERO IDENTITY (CASUAL, CRISP, ENGAGING) ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroRowLayout}>
            {/* Portrait avatar */}
            <div className={styles.heroPortraitWrap}>
              <img
                src="/ivan-head.png"
                alt="Affriandi, Ivan"
                className={styles.heroPortraitImg}
              />
            </div>

            <div className={styles.heroIntroContent}>
              <h1 className={styles.heroMainName}>
                <span className={styles.nameWord}>Affriandi,</span>
                <span className={styles.nameWord}>Ivan</span>
              </h1>
              <p className={styles.heroBioText}>
                Software engineer by day, bespoke leather artisan by night, and wild mushroom forager when I need to get away from screens. I build fast digital tools with zero bloat and craft tactile physical goods in my studio.
              </p>
            </div>
          </div>

          {/* ── 3. METADATA SPEC STRIP ── */}
          <div className={styles.metadataWideBar}>
            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Timeline</span>
              <span className={styles.metaStatValue}>2020 — Present</span>
            </div>

            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Focus</span>
              <span className={styles.metaStatValue}>Code, Pixels &amp; Leather</span>
            </div>

            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Output</span>
              <span className={styles.metaStatValue}>Digital Apps &amp; Physical Goods</span>
            </div>

            <div className={styles.metaStatItem}>
              <span className={styles.metaStatLabel}>Location</span>
              <span className={styles.metaStatValue}>Tangerang, Indonesia</span>
            </div>
          </div>

          {/* ── 4. NAVIGATION TABS ── */}
          <nav className={styles.navigationTabSection} aria-label="Portfolio Tabs">
            <div className={styles.tabTrackContainer}>
              <button
                onClick={() => setActiveTab('about')}
                className={`${styles.tabLinkItem} ${activeTab === 'about' ? styles.tabLinkActive : ''}`}
                type="button"
              >
                About
                {activeTab === 'about' && (
                  <motion.div
                    layoutId="activeTabUnderlineIndicator"
                    className={styles.activeTabUnderline}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`${styles.tabLinkItem} ${activeTab === 'skills' ? styles.tabLinkActive : ''}`}
                type="button"
              >
                Skills
                {activeTab === 'skills' && (
                  <motion.div
                    layoutId="activeTabUnderlineIndicator"
                    className={styles.activeTabUnderline}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                disabled
                className={`${styles.tabLinkItem} ${styles.tabLinkDisabled}`}
                type="button"
                title="Projects archive is coming soon"
              >
                Projects <span className={styles.comingSoonTag}>Soon</span>
              </button>

              <button
                disabled
                className={`${styles.tabLinkItem} ${styles.tabLinkDisabled}`}
                type="button"
                title="Process workflow is coming soon"
              >
                Process <span className={styles.comingSoonTag}>Soon</span>
              </button>

              <button
                disabled
                className={`${styles.tabLinkItem} ${styles.tabLinkDisabled}`}
                type="button"
                title="Services & Archive log are coming soon"
              >
                Services &amp; Log <span className={styles.comingSoonTag}>Soon</span>
              </button>
            </div>
          </nav>
        </section>

        {/* ── 5. MAIN CONTENT AREA ── */}
        <main className={styles.mainContentContainer}>
          <AnimatePresence mode="wait">
            {/* ── 1. ABOUT VIEW ── */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={styles.aboutEditorialBody}
              >
                {/* SECTION 01: WHO I AM */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>The Strange Mix</h2>
                    <span className={styles.sectionCategoryTag}>Who I Am</span>
                  </div>

                  <div className={styles.proseTwoColumnGrid}>
                    <p className={styles.proseTextParagraph}>
                      I never really figured out how to fit into a single corporate job title, and honestly, I stopped trying a long time ago. Some days I am deep in VS Code tuning Next.js rendering performance and spinning up self-hosted cloud containers. Other days I am in Figma obsessing over letter spacing and layout tokens, or saddle-stitching an Italian vegetable-tanned leather notebook cover with hot tea getting cold next to me.
                    </p>
                    <p className={styles.proseTextParagraph}>
                      For me, the fun has always been building things from scratch. Whether it is an interactive web tool with zero bloated dependencies or a physical leather wallet designed to outlive all of us, the contrast between glowing screen pixels and raw tangible materials is what keeps my mind sharp and happy.
                    </p>
                  </div>
                </section>

                {/* SECTION 02: SIX AREAS OF FOCUS */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>Six Areas of Focus</h2>
                    <span className={styles.sectionCategoryTag}>What I Do</span>
                  </div>

                  <div className={styles.cardsThreeColGrid}>
                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Product &amp; UI/UX</h3>
                        <span className={styles.cardCategoryPill}>Design</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Clean interfaces, sharp typography, and generous whitespace. I obsess over spatial balance, visual hierarchy, and micro-interactions that feel snappy and effortless to use. No cluttered junk.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Figma Systems</span>
                        <span className={styles.softPillTag}>Typography</span>
                        <span className={styles.softPillTag}>Interaction Design</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Software Engineering</h3>
                        <span className={styles.cardCategoryPill}>Code</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Full-stack web applications built with Next.js, React, and TypeScript. Fast, maintainable, and lightweight code without dependency bloat. If a page takes more than a second to load, it physically bothers me.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Next.js</span>
                        <span className={styles.softPillTag}>React</span>
                        <span className={styles.softPillTag}>TypeScript</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Self-Hosted &amp; Freedom</h3>
                        <span className={styles.cardCategoryPill}>Infrastructure</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Running my own cloud VMs, configuring private SMTP mail servers, and building digital tools I actually control. The internet is way more interesting when you run your own infrastructure.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Self-Hosted</span>
                        <span className={styles.softPillTag}>Cloud VMs</span>
                        <span className={styles.softPillTag}>Private Mail</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Bespoke Leathercraft</h3>
                        <span className={styles.cardCategoryPill}>Atelier</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Handcrafting luxury leather goods through SHU / EN Studio using Italian vegetable-tanned hides, Japanese moire lining, and solid 925 sterling silver charms. No machines, just needles and patience.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Italian Leather</span>
                        <span className={styles.softPillTag}>Saddle Stitch</span>
                        <span className={styles.softPillTag}>925 Silver</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Creative Tech &amp; 3D</h3>
                        <span className={styles.cardCategoryPill}>Experiments</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, and Web Audio synthesizers built purely out of late-night technical curiosity.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Three.js</span>
                        <span className={styles.softPillTag}>WebGL 2.0</span>
                        <span className={styles.softPillTag}>GLSL Shaders</span>
                      </div>
                    </div>

                    <div className={styles.disciplineFeatureCard}>
                      <div className={styles.cardHeaderArea}>
                        <h3 className={styles.cardPrimaryTitle}>Visual Essays &amp; Notes</h3>
                        <span className={styles.cardCategoryPill}>Photography</span>
                      </div>
                      <p className={styles.cardDescriptionText}>
                        Documentary snapshots of daily studio work, analog textures, architectural forms, and field notes from quiet mushroom walks out in the wild.
                      </p>
                      <div className={styles.cardTagPillsRow}>
                        <span className={styles.softPillTag}>Visual Notes</span>
                        <span className={styles.softPillTag}>Analog Textures</span>
                        <span className={styles.softPillTag}>Field Notes</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 03: THE OTHER 50% */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>When I Am Not Staring at Code</h2>
                    <span className={styles.sectionCategoryTag}>The Other 50%</span>
                  </div>

                  <div className={styles.cardsThreeColGrid}>
                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Wild Mushrooms &amp; Fungi</h3>
                      <p className={styles.hobbyCardDescription}>
                        Wandering damp trails with field guides, spotting weird fungi species, taking macro photos, and appreciating nature&apos;s wildest procedural geometry.
                      </p>
                    </div>

                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Crochet &amp; Fiber Arts</h3>
                      <p className={styles.hobbyCardDescription}>
                        Working with yarn, hooks, and tension control. Making physical everyday goods with my own hands when typing on a keyboard gets tiring.
                      </p>
                    </div>

                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Hot Tea &amp; Quiet Desks</h3>
                      <p className={styles.hobbyCardDescription}>
                        Steeping loose-leaf green tea early in the morning while everything is quiet, sketching out software architectures and product concepts in plain paper notebooks.
                      </p>
                    </div>

                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Non-Fiction &amp; Old Books</h3>
                      <p className={styles.hobbyCardDescription}>
                        Reading deep books on design history, architecture, human psychology, and obscure historical rabbit holes on my Kindle.
                      </p>
                    </div>

                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Wandering Quiet Museums</h3>
                      <p className={styles.hobbyCardDescription}>
                        Strolling through empty galleries, inspecting ancient physical artifacts, and geeking out over how craftspeople worked centuries ago.
                      </p>
                    </div>

                    <div className={styles.hobbyDetailCard}>
                      <h3 className={styles.hobbyCardTitle}>Studio Plants</h3>
                      <p className={styles.hobbyCardDescription}>
                        Propagating cuttings and watching green foliage quietly take over my studio terrace in Tangerang without any rush.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 04: WORKING PHILOSOPHY */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>How I Approach Making</h2>
                    <span className={styles.sectionCategoryTag}>Working Philosophy</span>
                  </div>

                  <div className={styles.philosophyColumnsGrid}>
                    <div className={styles.philosophyItemBlock}>
                      <h3 className={styles.philosophyItemHeading}>Build it yourself first.</h3>
                      <p className={styles.philosophyItemBody}>
                        If something sounds interesting, I want to take it apart, understand the engine, and build my own version. That is where real understanding happens.
                      </p>
                    </div>

                    <div className={styles.philosophyItemBlock}>
                      <h3 className={styles.philosophyItemHeading}>Cut the noise.</h3>
                      <p className={styles.philosophyItemBody}>
                        Good design is about deleting stuff until only what matters remains. If an interface feels effortless and simple, a lot of hard thinking went into making it that way.
                      </p>
                    </div>

                    <div className={styles.philosophyItemBlock}>
                      <h3 className={styles.philosophyItemHeading}>Pixels and physical craft belong together.</h3>
                      <p className={styles.philosophyItemBody}>
                        Designing UI makes me a sharper leather artisan, and hand-stitching leather makes me write cleaner code. Cross-pollination keeps work honest and grounded.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 05: STATUS BOARD */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>What Is On My Desk</h2>
                    <span className={styles.sectionCategoryTag}>Currently</span>
                  </div>

                  <div className={styles.statusGridWide}>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Reading</span>
                      <span className={styles.statusActivityValue}>Design history, old essays &amp; sci-fi</span>
                    </div>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Making</span>
                      <span className={styles.statusActivityValue}>Next.js web apps &amp; bespoke leather journals</span>
                    </div>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Learning</span>
                      <span className={styles.statusActivityValue}>Spanish, Dutch &amp; 3D shader mathematics</span>
                    </div>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Exploring</span>
                      <span className={styles.statusActivityValue}>Wild mycology &amp; macro photography</span>
                    </div>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Tinkering</span>
                      <span className={styles.statusActivityValue}>Self-hosted servers &amp; private mail infrastructure</span>
                    </div>
                    <div className={styles.statusGridCell}>
                      <span className={styles.statusActivityLabel}>Thinking About</span>
                      <span className={styles.statusActivityValue}>What curious project to build next</span>
                    </div>
                  </div>
                </section>

                {/* SECTION 06: HUMAN DETAILS */}
                <section className={styles.contentSectionBlock}>
                  <div className={styles.sectionHeaderRow}>
                    <h2 className={styles.sectionHeadingTitle}>Stuff I Genuinely Love</h2>
                    <span className={styles.sectionCategoryTag}>Human Details</span>
                  </div>

                  <div className={styles.likesPillsContainer}>
                    <span className={styles.humanLikePill}>Crisp typography</span>
                    <span className={styles.humanLikePill}>Quiet museums</span>
                    <span className={styles.humanLikePill}>Fresh hot green tea</span>
                    <span className={styles.humanLikePill}>Vegetable-tanned patina</span>
                    <span className={styles.humanLikePill}>Clean sans-serif fonts</span>
                    <span className={styles.humanLikePill}>Wild forest mushrooms</span>
                    <span className={styles.humanLikePill}>Zero-dependency code</span>
                    <span className={styles.humanLikePill}>Fast loading websites</span>
                    <span className={styles.humanLikePill}>Deep technical rabbit holes</span>
                    <span className={styles.humanLikePill}>Blank analog notebooks</span>
                    <span className={styles.humanLikePill}>Building things just for fun</span>
                  </div>
                </section>

                {/* SECTION 07: GET IN TOUCH BANNER */}
                <div className={styles.fullWidthContactBanner}>
                  <div className={styles.contactBannerLeftCol}>
                    <h3 className={styles.contactBannerTitle}>Got an interesting idea or curious project?</h3>
                    <p className={styles.contactBannerDescription}>
                      Whether it is a technical puzzle, a high-craft interface, or bespoke atelier goods, I am always down to chat about interesting work.
                    </p>
                  </div>
                  <a href="mailto:hello@ivanaffriandi.com" className={styles.contactBannerActionBtn}>
                    Say Hello
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── 2. SKILLS VIEW ── */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={styles.aboutEditorialBody}
              >
                <div className={styles.skillsPillarsWideGrid}>
                  <div className={styles.skillPillarWideCard}>
                    <div className={styles.skillPillarHeader}>
                      <span className={styles.pillarStepBadge}>01</span>
                      <h3 className={styles.pillarMainTitle}>Frontend</h3>
                    </div>
                    <p className={styles.pillarDescriptionText}>Snappy, beautiful interfaces that feel great to use.</p>
                    <div className={styles.pillarItemList}>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Next.js</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> React &amp; TypeScript</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Framer Motion</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Tailwind CSS</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Figma Systems</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarWideCard}>
                    <div className={styles.skillPillarHeader}>
                      <span className={styles.pillarStepBadge}>02</span>
                      <h3 className={styles.pillarMainTitle}>3D &amp; Audio</h3>
                    </div>
                    <p className={styles.pillarDescriptionText}>Interactive WebGL 3D models and procedural sound.</p>
                    <div className={styles.pillarItemList}>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Three.js &amp; WebGL</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> GLSL Shaders</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> 3D Customizers</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Web Audio API</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Blender 3D</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarWideCard}>
                    <div className={styles.skillPillarHeader}>
                      <span className={styles.pillarStepBadge}>03</span>
                      <h3 className={styles.pillarMainTitle}>Backend</h3>
                    </div>
                    <p className={styles.pillarDescriptionText}>Fast cloud servers, containers, and secure APIs.</p>
                    <div className={styles.pillarItemList}>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Node.js &amp; Python</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Oracle Cloud &amp; AWS SES</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Docker Compose</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> PostgreSQL &amp; Redis</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Cloudflare SSL</span>
                    </div>
                  </div>

                  <div className={styles.skillPillarWideCard}>
                    <div className={styles.skillPillarHeader}>
                      <span className={styles.pillarStepBadge}>04</span>
                      <h3 className={styles.pillarMainTitle}>Atelier</h3>
                    </div>
                    <p className={styles.pillarDescriptionText}>Traditional bespoke leather goods crafted by hand.</p>
                    <div className={styles.pillarItemList}>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Italian Leather</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Saddle Stitching</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Solid 925 Silver</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Edge Burnishing</span>
                      <span className={styles.pillarSkillBullet}><span className={styles.bulletDot} /> Pattern Drafting</span>
                    </div>
                  </div>
                </div>

                {/* Kinetic Typography Marquee */}
                <div className={styles.kineticStreamWrapper}>
                  <div className={styles.kineticTrackRow}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...skillRow1, ...skillRow1, ...skillRow1].map((item, idx) => (
                        <div key={idx} className={styles.streamPillItem}>
                          <span>{item}</span>
                          <span className={styles.streamSlash}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticTrackRow}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...skillRow2, ...skillRow2, ...skillRow2].map((item, idx) => (
                        <div key={idx} className={styles.streamPillItem}>
                          <span>{item}</span>
                          <span className={styles.streamSlash}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticTrackRow}>
                    <div className={styles.kineticMarqueeLeft}>
                      {[...skillRow3, ...skillRow3, ...skillRow3].map((item, idx) => (
                        <div key={idx} className={styles.streamPillItem}>
                          <span>{item}</span>
                          <span className={styles.streamSlash}>/</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.kineticTrackRow}>
                    <div className={styles.kineticMarqueeRight}>
                      {[...skillRow4, ...skillRow4, ...skillRow4].map((item, idx) => (
                        <div key={idx} className={styles.streamPillItem}>
                          <span>{item}</span>
                          <span className={styles.streamSlash}>/</span>
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
        <footer className={styles.widePageFooter}>
          <span className={styles.footerCopyrightNote}>
            © {new Date().getFullYear()} Affriandi, Ivan · All Rights Reserved
          </span>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.footerStudioLink}
          >
            Visit SHU / EN Atelier →
          </a>
        </footer>
      </div>
    </div>
  );
}
