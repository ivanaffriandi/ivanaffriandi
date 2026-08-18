'use client';

import React, { useState } from 'react';
import ShuenWorkspaceWidget from '@/components/ShuenWorkspaceWidget';
import styles from './work.module.css';

export default function WorkPage() {
  const [activeModule, setActiveModule] = useState<'shuen' | 'personal' | 'ventures'>('shuen');

  return (
    <div className={styles.workspaceApp}>
      {/* ── LEFT macOS SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          {/* User Profile */}
          <div className={styles.userProfileRow}>
            <div className={styles.userAvatar}>
              IA
              <span className={styles.onlinePulse} />
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>Ivan Affriandi</span>
              <span className={styles.userRole}>Master Operating Hub</span>
            </div>
          </div>

          {/* Navigation Section */}
          <div>
            <div className={styles.navSectionTitle}>Active Workspaces</div>
            <div className={styles.navList}>
              <button
                onClick={() => setActiveModule('shuen')}
                className={`${styles.navItem} ${activeModule === 'shuen' ? styles.navItemActive : ''}`}
              >
                <div className={styles.navItemLeading}>
                  <span style={{ fontSize: '15px' }}>🧵</span>
                  <span>SHŪ / EN Studio</span>
                </div>
                <span className={styles.navItemBadge}>LIVE</span>
              </button>

              <button
                onClick={() => setActiveModule('personal')}
                className={`${styles.navItem} ${activeModule === 'personal' ? styles.navItemActive : ''}`}
              >
                <div className={styles.navItemLeading}>
                  <span style={{ fontSize: '15px' }}>✍️</span>
                  <span>Personal Space</span>
                </div>
              </button>

              <button
                onClick={() => setActiveModule('ventures')}
                className={`${styles.navItem} ${activeModule === 'ventures' ? styles.navItemActive : ''}`}
              >
                <div className={styles.navItemLeading}>
                  <span style={{ fontSize: '15px' }}>🔮</span>
                  <span>Ventures</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className={styles.telemetryBox}>
          <div className={styles.telemetryRow}>
            <span className={styles.telemetryLabel}>PostgreSQL DB</span>
            <span className={styles.telemetryValue}>ONLINE (3ms)</span>
          </div>
          <div className={styles.telemetryRow}>
            <span className={styles.telemetryLabel}>DOKU Gateway</span>
            <span className={styles.telemetryValue}>HEALTHY</span>
          </div>
          <div className={styles.telemetryRow}>
            <span className={styles.telemetryLabel}>Logistics JNE/J&amp;T</span>
            <span className={styles.telemetryValue}>CONNECTED</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <main className={styles.workspaceMain}>
        {/* Top Command Bar */}
        <header className={styles.commandBar}>
          <div className={styles.commandLeft}>
            <span className={styles.commandTitle}>
              {activeModule === 'shuen' ? 'SHŪ / EN Studio' : activeModule === 'personal' ? 'Personal Space' : 'Ventures'}
              <span className={styles.badgePill}>v2.6 OS</span>
            </span>
            <span className={styles.commandSub}>work.ivanaffriandi.com</span>
          </div>

          <div className={styles.commandRight}>
            <a
              href="https://shuenstudio.com"
              target="_blank"
              rel="noreferrer"
              className={styles.btnActionApple}
            >
              Storefront ↗
            </a>
            <a
              href="https://shuenstudio.com/po"
              target="_blank"
              rel="noreferrer"
              className={styles.btnActionApple}
            >
              3D Configurator ↗
            </a>
            <a
              href="https://shuenstudio.com/admin"
              target="_blank"
              rel="noreferrer"
              className={`${styles.btnActionApple} ${styles.btnActionApplePrimary}`}
            >
              Open Studio Admin ↗
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        {activeModule === 'shuen' && (
          <ShuenWorkspaceWidget apiUrl="https://shuenstudio.com" apiKey="shuen_master_sec_2026_ivan_work_hub" />
        )}

        {activeModule === 'personal' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0 }}>Ivan Affriandi — Personal Blog &amp; Thoughts</h3>
            <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '13px' }}>Manage essays, daily journals, reader book analytics, and feedback.</p>
            <a href="https://ivanaffriandi.com" target="_blank" rel="noreferrer" className={`${styles.btnActionApple} ${styles.btnActionApplePrimary}`}>
              Open ivanaffriandi.com ↗
            </a>
          </div>
        )}

        {activeModule === 'ventures' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', color: '#ffffff', margin: 0 }}>Ventures &amp; Creative Labs</h3>
            <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '13px' }}>Upcoming products, startups, and creative projects will populate here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
