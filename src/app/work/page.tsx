'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './work.module.css';

type TabType = 'about' | 'projects' | 'skills' | 'process' | 'archive';

export default function WorkIvanPortfolioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [liveTime, setLiveTime] = useState('5:40 PM (WIB)');

  // Real-time Indonesian WIB clock ticker
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

  const tabHeaders = {
    about: {
      headline: 'Affriandi, Ivan',
      narrative:
        'I build digital software, teach physics, craft leather goods, and occasionally disappear into a mushroom field.',
      duration: '2025 — Present',
      client: 'Studio & Lab',
      artDirection: 'Digital & Physical',
    },
    projects: {
      headline: 'Selected Works',
      narrative:
        'A collection of live web applications, 3D configurators, and handcrafted physical goods.',
      duration: '2025 — 2026',
      client: 'Recent Projects',
      artDirection: 'Web & Atelier',
    },
    skills: {
      headline: 'Tools & Stack',
      narrative:
        'The technologies, frameworks, and workshop tools I use daily to build products.',
      duration: 'Daily Stack',
      client: 'Engineering & Craft',
      artDirection: 'Full Stack',
    },
    process: {
      headline: 'How I Work',
      narrative:
        'A simple three-step approach to turning ideas into fast, finished products.',
      duration: 'Workflow',
      client: 'Direct Collaboration',
      artDirection: 'Plan → Build → Ship',
    },
    archive: {
      headline: 'Services & Log',
      narrative:
        'Available services for hire and a complete chronological record of launched projects.',
      duration: 'Open for Hire',
      client: 'Clients & Studio',
      artDirection: 'Full Archive',
    },
  };

  const current = tabHeaders[activeTab];

  // Pure Typography Stream Rows for Skills Marquee
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
    <div className={styles.scandinavianViewport}>
      <div className={styles.masterGridContainer}>
        {/* ── ROW 1: HEADER (ALIGNED PRECISELY ACROSS 3 COLUMNS) ── */}
        <div className={styles.headerCol1}>
          <a href="https://ivanaffriandi.com" className={styles.brandLogo}>
            Ivan&apos;s Work<sup>®</sup>
          </a>
        </div>

        <div className={styles.headerCol2}>
          <button
            onClick={() => setActiveTab('about')}
            className={`${styles.navItemBtn} ${activeTab === 'about' ? styles.navItemActive : ''}`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`${styles.navItemBtn} ${activeTab === 'projects' ? styles.navItemActive : ''}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`${styles.navItemBtn} ${activeTab === 'skills' ? styles.navItemActive : ''}`}
          >
            Skills
          </button>
          <button
            onClick={() => setActiveTab('process')}
            className={`${styles.navItemBtn} ${activeTab === 'process' ? styles.navItemActive : ''}`}
          >
            Process
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`${styles.navItemBtn} ${activeTab === 'archive' ? styles.navItemActive : ''}`}
          >
            Services &amp; Log
          </button>
        </div>

        <div className={styles.headerCol3}>
          <span className={styles.locationOnlyText}>Tangerang, Indonesia</span>
          <span className={styles.liveClockHeader}>{liveTime}</span>
        </div>

        {/* ── ROW 2: HERO TITLE & NARRATIVE (EXACT INDENT AT COL 2) ── */}
        <div className={styles.heroCol1}>
          <span className={styles.overviewLabel}>
            → {activeTab === 'archive' ? 'Services & Log' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>

          {activeTab === 'about' && (
            <img
              src="/ivan-head.png"
              alt="Affriandi, Ivan"
              className={styles.aboutCol1Photo}
            />
          )}
        </div>

        <div className={styles.heroCol23}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <h1 className={styles.mainTitleHeading}>
                {current.headline}
              </h1>

              <p className={styles.narrativeParagraph}>
                {current.narrative}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── ROW 3: METADATA ROW ── */}
        <div className={styles.metaCol1}>
          <span className={styles.metaLabel}>Discipline</span>
        </div>

        <div className={styles.metaCol2}>
          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Timeline</span>
            <span className={styles.metaValue}>{current.duration}</span>
          </div>

          <div className={styles.metaItemCluster}>
            <span className={styles.metaLabel}>Focus</span>
            <span className={styles.metaValue}>{current.client}</span>
          </div>
        </div>

        <div className={styles.metaCol3}>
          <span className={styles.metaLabel}>Output</span>
          <span className={styles.metaValue}>{current.artDirection}</span>
        </div>

        {/* ── ROW 4: DYNAMIC TAB VIEW CONTENTS ── */}

        {/* 1. MASTER ABOUT TAB: FULL EDITORIAL STUDIO ARCHIVE (ZERO EMOJIS) */}
        {activeTab === 'about' && (
          <div className={styles.fullWidthTabBlock}>
            {/* SECTION 01: WHO I AM PROSE */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>01 · WHO I AM</span>
              <h3 className={styles.aboutSectionTitle}>The Strange Mix</h3>
            </div>

            <div className={styles.aboutProseGrid}>
              <p className={styles.aboutProseParagraph}>
                My work sits somewhere between pure physics education, software engineering, UI/UX design, physical leather craftsmanship, and running servers I probably didn&apos;t need to self-host. I am not interested in being boxed into a single corporate identity.
              </p>
              <p className={styles.aboutProseParagraph}>
                I can spend part of my day explaining classical mechanics to olympiad students, another part designing an interface in Figma, another writing Next.js code, and another hand-stitching a trifold leather journal with tea getting cold beside me. That contrast is the whole point: curiosity → learning → making → teaching → documenting.
              </p>
            </div>

            {/* SECTION 02: WHAT I DO (6 CORE DISCIPLINE CARDS) */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>02 · WHAT I DO</span>
              <h3 className={styles.aboutSectionTitle}>Six Areas of Focus</h3>
            </div>

            <div className={styles.aboutSixCardsGrid}>
              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>01 · ACADEMIC</span>
                <h4 className={styles.aboutDisciplineTitle}>Physics &amp; Mentoring</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Founder of Equilibrium Academy. Physics tutor and olympiad trainer helping ambitious high-school students translate abstract mathematics into intuitive physical models.
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Pure Physics</span>
                  <span className={styles.miniPill}>Olympiad / OSN</span>
                  <span className={styles.miniPill}>Cambridge &amp; IB</span>
                </div>
              </div>

              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>02 · DESIGN</span>
                <h4 className={styles.aboutDisciplineTitle}>Product &amp; UI/UX</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Clean, typography-driven interfaces, Figma design systems, generous whitespace, and obsessing over spacing, hierarchy, and micro-interactions that feel tactile.
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Figma Systems</span>
                  <span className={styles.miniPill}>Typography</span>
                  <span className={styles.miniPill}>Interaction Design</span>
                </div>
              </div>

              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>03 · CODE</span>
                <h4 className={styles.aboutDisciplineTitle}>Software Engineering</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Full-stack web applications built with Next.js 16, React 19, TypeScript, and modern APIs. Fast, lightweight code without bloated dependencies.
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Next.js 16</span>
                  <span className={styles.miniPill}>TypeScript</span>
                  <span className={styles.miniPill}>React 19</span>
                </div>
              </div>

              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>04 · INFRA</span>
                <h4 className={styles.aboutDisciplineTitle}>Digital Independence</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Self-hosted cloud VMs, private email servers (SMTP, Postfix, DKIM), and personal digital tools. The internet as something you build and inhabit, not just consume.
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Self-Hosted</span>
                  <span className={styles.miniPill}>Cloud VM</span>
                  <span className={styles.miniPill}>Private Mail</span>
                </div>
              </div>

              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>05 · ATELIER</span>
                <h4 className={styles.aboutDisciplineTitle}>Physical Craft (SHŪ / EN)</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Bespoke leather journals handcrafted from Italian vegetable-tanned hides, Japanese Moire lining, bookbinding, and solid 925 sterling silver charms.
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Italian Leather</span>
                  <span className={styles.miniPill}>Saddle Stitch</span>
                  <span className={styles.miniPill}>925 Silver</span>
                </div>
              </div>

              <div className={styles.aboutDisciplineCard}>
                <span className={styles.aboutDisciplineNumber}>06 · EXPERIMENTS</span>
                <h4 className={styles.aboutDisciplineTitle}>Creative Labs &amp; 3D</h4>
                <p className={styles.aboutDisciplineDesc}>
                  Real-time Three.js 3D WebGL configurators, GLSL procedural shaders, Web Audio sound synthesis, and tools built simply because &quot;I wonder if I can build that myself.&quot;
                </p>
                <div className={styles.aboutDisciplineTags}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>GLSL Shaders</span>
                  <span className={styles.miniPill}>Web Audio</span>
                </div>
              </div>
            </div>

            {/* SECTION 03: THE OTHER 50% (HOBBIES & HANDS - ZERO EMOJIS) */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>03 · THE OTHER 50%</span>
              <h3 className={styles.aboutSectionTitle}>Observation &amp; Tactile Making</h3>
            </div>

            <div className={styles.aboutHobbiesGrid}>
              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>01 · Mushrooms &amp; Mycology</h4>
                <p className={styles.aboutHobbyText}>
                  Finding wild fungi, photographing them in the wild, reading field guides, taking notes, and slowly building an understanding of how they grow.
                </p>
              </div>

              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>02 · Crochet &amp; Embroidery</h4>
                <p className={styles.aboutHobbyText}>
                  Fiber work, thread tension, and tactile patience. The satisfaction of making physical everyday objects with needles and yarn.
                </p>
              </div>

              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>03 · Tea &amp; Quiet Mornings</h4>
                <p className={styles.aboutHobbyText}>
                  Hot green tea, quiet studio desks before the world wakes up, and sitting with difficult scientific questions until they finally make sense.
                </p>
              </div>

              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>04 · Non-Fiction &amp; Kindle</h4>
                <p className={styles.aboutHobbyText}>
                  Collecting questions over answers. Books on intellectual history, religion, philosophy, society, physics, and human knowledge systems.
                </p>
              </div>

              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>05 · Museums &amp; Galleries</h4>
                <p className={styles.aboutHobbyText}>
                  Wandering quiet historical archives, art museums, and observing how different eras constructed tools, typography, and visual culture.
                </p>
              </div>

              <div className={styles.aboutHobbyCard}>
                <h4 className={styles.aboutHobbyTitle}>06 · Plants &amp; Gardening</h4>
                <p className={styles.aboutHobbyText}>
                  Watching soil, foliage, and cuttings grow slowly on the studio terrace in Tangerang without any rush.
                </p>
              </div>
            </div>

            {/* SECTION 04: HOW I THINK (PHILOSOPHY) */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>04 · WORKING PHILOSOPHY</span>
              <h3 className={styles.aboutSectionTitle}>How I Approach Making</h3>
            </div>

            <div className={styles.aboutPhilosophyGrid}>
              <div className={styles.aboutPhilosophyCard}>
                <h4 className={styles.aboutPhilosophyHeadline}>Make things yourself.</h4>
                <p className={styles.aboutPhilosophyBody}>
                  If something interests me, I want to understand how it works under the hood and rebuild a version myself. Learning and creating are the exact same process.
                </p>
              </div>

              <div className={styles.aboutPhilosophyCard}>
                <h4 className={styles.aboutPhilosophyHeadline}>Teach what you understand.</h4>
                <p className={styles.aboutPhilosophyBody}>
                  Teaching forces abstract ideas to become clear. If you can&apos;t explain a physics model simply, you haven&apos;t truly understood the underlying assumptions yet.
                </p>
              </div>

              <div className={styles.aboutPhilosophyCard}>
                <h4 className={styles.aboutPhilosophyHeadline}>Boundaries are artificial.</h4>
                <p className={styles.aboutPhilosophyBody}>
                  Physics informs design, design informs code, and leather craft informs digital products. The contrast between pixels and physical materials is where the fun lives.
                </p>
              </div>
            </div>

            {/* SECTION 05: CURRENTLY (STATUS BOARD) */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>05 · STATUS BOARD</span>
              <h3 className={styles.aboutSectionTitle}>Currently</h3>
            </div>

            <div className={styles.aboutCurrentlyGrid}>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Reading</span>
                <span className={styles.aboutCurrentVal}>Non-fiction, intellectual history &amp; physics</span>
              </div>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Making</span>
                <span className={styles.aboutCurrentVal}>Next.js tools + handcrafted leather journals</span>
              </div>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Learning</span>
                <span className={styles.aboutCurrentVal}>Spanish, Dutch &amp; GLSL shader mathematics</span>
              </div>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Exploring</span>
                <span className={styles.aboutCurrentVal}>Wild mycology, photography &amp; fiber craft</span>
              </div>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Building</span>
                <span className={styles.aboutCurrentVal}>Independent personal web infrastructure</span>
              </div>
              <div className={styles.aboutCurrentItem}>
                <span className={styles.aboutCurrentLabel}>Thinking About</span>
                <span className={styles.aboutCurrentVal}>What to build and understand next</span>
              </div>
            </div>

            {/* SECTION 06: SMALL THINGS I LIKE */}
            <div className={styles.aboutSectionHeader}>
              <span className={styles.aboutSectionNumber}>06 · SMALL THINGS I LIKE</span>
              <h3 className={styles.aboutSectionTitle}>Human Details</h3>
            </div>

            <div className={styles.aboutLikesWrap}>
              <span className={styles.aboutLikePill}>Good typography</span>
              <span className={styles.aboutLikePill}>Quiet museums</span>
              <span className={styles.aboutLikePill}>Old non-fiction books</span>
              <span className={styles.aboutLikePill}>Leather patina</span>
              <span className={styles.aboutLikePill}>Notebooks &amp; paper</span>
              <span className={styles.aboutLikePill}>Hot tea</span>
              <span className={styles.aboutLikePill}>Wild mushrooms</span>
              <span className={styles.aboutLikePill}>Clean interfaces</span>
              <span className={styles.aboutLikePill}>Weird technical rabbit holes</span>
              <span className={styles.aboutLikePill}>Learning something complicated just for fun</span>
            </div>

            {/* SECTION 07: CONTACT CTA */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Have an interesting problem or project?</h4>
                <p>If you have a strange idea, an interesting challenge, or a project that sits between disciplines, I&apos;m probably interested.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Say Hello ↗
              </a>
            </div>
          </div>
        )}

        {/* 2. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <>
            <a
              href="https://mail.ivanaffriandi.com"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol1}
            >
              <img
                src="/work-showcase/mail-dark.png"
                alt="Private Mail Platform"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Private Mail Platform</span>
                <span>Self-Hosted Cloud ↗</span>
              </div>
            </a>

            <a
              href="https://ivanaffriandi.com/x"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol2}
            >
              <img
                src="/work-showcase/reader-dark-woods.png"
                alt="Atmospheric Digital Reader"
              />
              <div className={styles.cardOverlayInfo}>
                <span>Atmospheric Reader (/x)</span>
                <span>Web Audio &amp; Books ↗</span>
              </div>
            </a>

            <a
              href="https://shuenstudio.com"
              target="_blank"
              rel="noreferrer"
              className={styles.imageCardCol3}
            >
              <img
                src="/work-showcase/reader-dark-fire.png"
                alt="SHU / EN Leather Atelier"
              />
              <div className={styles.cardOverlayInfo}>
                <span>SHŪ / EN Leather Goods</span>
                <span>Bespoke Atelier ↗</span>
              </div>
            </a>

            {/* Secondary Project Cards Strip */}
            <div className={styles.secondaryProjectsRow}>
              <a
                href="https://shuenstudio.com"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  SHŪ / EN Leather Goods Atelier <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Bespoke trifold journals handcrafted from Italian vegetable-tanned Nero leather, Japanese Moire lining, and solid 925 silver.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Full-Grain Leather</span>
                  <span className={styles.miniPill}>Solid 925 Silver</span>
                  <span className={styles.miniPill}>Tangerang Atelier</span>
                </div>
              </a>

              <a
                href="https://shuenstudio.com/po"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  3D WebGL Configurator Engine <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Interactive 3D product customizer with live Three.js camera controls, leather texture switching, and gold foil stamping.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Three.js</span>
                  <span className={styles.miniPill}>WebGL 2.0</span>
                  <span className={styles.miniPill}>GLSL Shaders</span>
                </div>
              </a>

              <a
                href="https://mail.ivanaffriandi.com"
                target="_blank"
                rel="noreferrer"
                className={styles.secondaryProjectCard}
              >
                <h3 className={styles.secondaryProjectTitle}>
                  Private Mail Server Stack <span>↗</span>
                </h3>
                <p className={styles.secondaryProjectDesc}>
                  Personal self-hosted email infrastructure on Oracle Cloud VM with AWS SES relay, automated DKIM keys, and zero tracking.
                </p>
                <div className={styles.secondaryProjectPills}>
                  <span className={styles.miniPill}>Oracle Cloud VM</span>
                  <span className={styles.miniPill}>AWS SES</span>
                  <span className={styles.miniPill}>DKIM Keys</span>
                </div>
              </a>
            </div>
          </>
        )}

        {/* 3. SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className={styles.skillsSectionWrapper}>
            <div className={styles.skillsPillarGrid}>
              <div className={styles.skillPillarCard}>
                <h3 className={styles.pillarCategoryTitle}>01 · FRONTEND</h3>
                <p className={styles.pillarDesc}>Clean, fast web interfaces with smooth interactions.</p>
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
                <p className={styles.pillarDesc}>Interactive 3D WebGL models and procedural audio.</p>
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
                <p className={styles.pillarDesc}>Cloud servers, containerization, and secure APIs.</p>
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
                <p className={styles.pillarDesc}>Traditional bespoke leather goods made by hand.</p>
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
          </div>
        )}

        {/* 4. PROCESS TAB */}
        {activeTab === 'process' && (
          <div className={styles.fullWidthTabBlock}>
            <div className={styles.processStepGrid}>
              <div className={styles.processCard}>
                <span className={styles.processNum}>01</span>
                <h3 className={styles.processTitle}>Plan &amp; Sketch</h3>
                <p className={styles.processText}>
                  Define clear project goals, sketch simple user flows in Figma, and design the system architecture.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>02</span>
                <h3 className={styles.processTitle}>Build &amp; Refine</h3>
                <p className={styles.processText}>
                  Write clean Next.js and TypeScript code, polish animations, and test speed on mobile and desktop.
                </p>
              </div>
              <div className={styles.processCard}>
                <span className={styles.processNum}>03</span>
                <h3 className={styles.processTitle}>Ship &amp; Launch</h3>
                <p className={styles.processText}>
                  Deploy to fast cloud servers, configure custom domains with SSL, and launch live with zero hassle.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. ARCHIVE & SERVICES TAB */}
        {activeTab === 'archive' && (
          <div className={styles.fullWidthTabBlock}>
            {/* Services Grid */}
            <div className={styles.overviewCardsGrid}>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>01 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>Web &amp; App Development</h3>
                <p className={styles.overviewFocusDesc}>
                  Fast websites, SaaS platforms, and custom web apps built with Next.js 16 and TypeScript.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>02 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>UI/UX &amp; Design Systems</h3>
                <p className={styles.overviewFocusDesc}>
                  Clean user interfaces, Figma design systems, and responsive mobile-first layouts.
                </p>
              </div>
              <div className={styles.overviewFocusCard}>
                <span className={styles.overviewFocusNumber}>03 · SERVICE</span>
                <h3 className={styles.overviewFocusTitle}>3D Web &amp; Custom Atelier</h3>
                <p className={styles.overviewFocusDesc}>
                  Interactive 3D Three.js product customizers and bespoke leather goods from SHŪ / EN Studio.
                </p>
              </div>
            </div>

            {/* Archive Project Table */}
            <div style={{ marginTop: '12px' }}>
              <span className={styles.metaLabel} style={{ display: 'block', marginBottom: '12px' }}>
                Complete Project Archive
              </span>

              <div className={styles.archiveTable}>
                <a href="https://mail.ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>Private Mail Platform</h3>
                    <p className={styles.archiveItemSubtitle}>Self-hosted Oracle Cloud VM, AWS SES relay, automated DKIM keys.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Next.js 16</span>
                    <span className={styles.miniPill}>AWS SES</span>
                    <span className={styles.miniPill}>Docker</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://ivanaffriandi.com/x" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>Atmospheric Digital Reader (/x)</h3>
                    <p className={styles.archiveItemSubtitle}>Minimalist digital reading app with Web Audio ambient sound synthesis.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Web Audio API</span>
                    <span className={styles.miniPill}>Framer Motion</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>SHŪ / EN Bespoke Leather Atelier</h3>
                    <p className={styles.archiveItemSubtitle}>Handcrafted trifold leather goods with vegetable-tanned Nero leather and 925 silver.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Leathercraft</span>
                    <span className={styles.miniPill}>925 Silver</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2026</span>
                </a>

                <a href="https://shuenstudio.com/po" target="_blank" rel="noreferrer" className={styles.archiveRowItem}>
                  <div className={styles.archiveLeftCol}>
                    <h3 className={styles.archiveItemTitle}>3D WebGL Configurator Engine</h3>
                    <p className={styles.archiveItemSubtitle}>Real-time procedural normal maps and gold foil embossing customizer.</p>
                  </div>
                  <div className={styles.archivePillStack}>
                    <span className={styles.miniPill}>Three.js</span>
                    <span className={styles.miniPill}>GLSL</span>
                  </div>
                  <span className={styles.archiveYearLabel}>2025</span>
                </a>
              </div>
            </div>

            {/* Quick Contact CTA */}
            <div className={styles.contactBannerWrap}>
              <div className={styles.contactBannerLeft}>
                <h4>Have an interesting problem or project?</h4>
                <p>If you have a strange idea, an interesting challenge, or a project that sits between disciplines, I&apos;m probably interested.</p>
              </div>
              <a href="mailto:ivan@ivanaffriandi.com" className={styles.contactActionBtn}>
                Say Hello ↗
              </a>
            </div>
          </div>
        )}

        {/* ── ROW 5: SEE MORE LINK (RIGHT-ALIGNED UNDER COLUMN 3) ── */}
        <div className={styles.seeMoreWrapper}>
          <a
            href="https://shuenstudio.com"
            target="_blank"
            rel="noreferrer"
            className={styles.seeMoreLink}
          >
            Visit SHŪ / EN Atelier →
          </a>
        </div>
      </div>
    </div>
  );
}
