'use client';

import React, { useState } from 'react';
import ShuenWorkspaceWidget from '@/components/ShuenWorkspaceWidget';
import styles from './work.module.css';

export default function WorkPage() {
  const [activeProject, setActiveProject] = useState<'shuen' | 'personal' | 'ventures'>('shuen');

  return (
    <div className={styles.workspaceRoot}>
      {/* ── TOP EXECUTIVE APP BAR ── */}
      <header className={styles.headerBar}>
        <div className={styles.brandCluster}>
          <div className={styles.brandAvatar}>
            IA
          </div>
          <div>
            <h1 className={styles.brandTitle}>
              Ivan Affriandi
              <span className={styles.badgePill}>
                Workspace Hub
              </span>
            </h1>
            <p className={styles.brandSub}>work.ivanaffriandi.com</p>
          </div>
        </div>

        {/* Project Selector Pills */}
        <div className={styles.navPills}>
          <button
            onClick={() => setActiveProject('shuen')}
            className={`${styles.navPillBtn} ${activeProject === 'shuen' ? styles.navPillBtnActiveGold : ''}`}
          >
            SHŪ / EN Studio
          </button>
          <button
            onClick={() => setActiveProject('personal')}
            className={`${styles.navPillBtn} ${activeProject === 'personal' ? styles.navPillBtnActive : ''}`}
          >
            Personal Space
          </button>
          <button
            onClick={() => setActiveProject('ventures')}
            className={`${styles.navPillBtn} ${activeProject === 'ventures' ? styles.navPillBtnActive : ''}`}
          >
            Ventures
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className={styles.mainContainer}>
        {activeProject === 'shuen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '1px', color: '#d4af37', margin: '0 0 6px 0', fontWeight: 700 }}>
                  E-Commerce &amp; Bespoke Leather Atelier
                </p>
                <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>
                  SHŪ / EN Studio Control Center
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="https://shuenstudio.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnSecondary}
                >
                  Live Storefront ↗
                </a>
                <a
                  href="https://shuenstudio.com/po"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.btnSecondary}
                >
                  3D Configurator ↗
                </a>
              </div>
            </div>

            {/* Live Interactive SH-EN Management Widget */}
            <ShuenWorkspaceWidget apiUrl="https://shuenstudio.com" apiKey="shuen_master_sec_2026_ivan_work_hub" />
          </div>
        )}

        {activeProject === 'personal' && (
          <div className={styles.studioHeroCard} style={{ textAlign: 'center', padding: '60px 20px', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Ivan Affriandi — Personal Space &amp; Archive</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '12px auto' }}>
              Main portfolio, daily reflections, philosophical essays, and interactive visitor analytics.
            </p>
            <div style={{ marginTop: '16px' }}>
              <a href="https://ivanaffriandi.com" target="_blank" rel="noreferrer" className={styles.btnPrimary}>
                Open ivanaffriandi.com ↗
              </a>
            </div>
          </div>
        )}

        {activeProject === 'ventures' && (
          <div className={styles.studioHeroCard} style={{ textAlign: 'center', padding: '60px 20px', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Upcoming Projects &amp; Ventures</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '12px auto' }}>
              Connected microservices and business ventures will populate here automatically.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
