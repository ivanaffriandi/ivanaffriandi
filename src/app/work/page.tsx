'use client';

import React, { useState, useEffect } from 'react';
import ShuenWorkspaceWidget from '@/components/ShuenWorkspaceWidget';
import WorkSecurityGate from '@/components/WorkSecurityGate';
import styles from './work.module.css';

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'star' | 'clock' | 'send' | 'draft' | 'tag'>('inbox');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLockEnclave = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ignore
    } finally {
      setIsAuthenticated(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100dvh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', gap: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
        <div style={{ width: '20px', height: '20px', border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid #d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Authenticating Security Enclave...</span>
      </div>
    );
  }

  // If not authenticated, render military-grade Apple Security Gate
  if (!isAuthenticated) {
    return <WorkSecurityGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={styles.workspaceRoot}>
      {/* ── MAIN FLOATING CANVAS CONTAINER ── */}
      <main className={styles.floatingCanvas}>
        {/* ── LEFT FLOATING DOCK / RAIL ── */}
        <aside className={styles.dockRail}>
          <div className={styles.dockTopGroup}>
            {/* Brand / Grid Logo */}
            <div className={styles.dockBrandLogo} title="Workspace Grid">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>

            {/* Circular Action Icons Stack */}
            <div className={styles.dockIconsStack}>
              {/* Inbox (Active Dark Pill) */}
              <button
                onClick={() => setActiveTab('inbox')}
                className={`${styles.dockIconBtn} ${activeTab === 'inbox' ? styles.dockIconBtnActive : ''}`}
                title="Inbox & Orders"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </button>

              {/* Star */}
              <button
                onClick={() => setActiveTab('star')}
                className={`${styles.dockIconBtn} ${activeTab === 'star' ? styles.dockIconBtnActive : ''}`}
                title="Starred"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>

              {/* Clock */}
              <button
                onClick={() => setActiveTab('clock')}
                className={`${styles.dockIconBtn} ${activeTab === 'clock' ? styles.dockIconBtnActive : ''}`}
                title="Snoozed / Scheduled"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>

              {/* Send / Paper Plane */}
              <button
                onClick={() => setActiveTab('send')}
                className={`${styles.dockIconBtn} ${activeTab === 'send' ? styles.dockIconBtnActive : ''}`}
                title="Sent & Dispatched"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>

              {/* Drafts */}
              <button
                onClick={() => setActiveTab('draft')}
                className={`${styles.dockIconBtn} ${activeTab === 'draft' ? styles.dockIconBtnActive : ''}`}
                title="Drafts"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </button>

              {/* Tag / Category */}
              <button
                onClick={() => setActiveTab('tag')}
                className={`${styles.dockIconBtn} ${activeTab === 'tag' ? styles.dockIconBtnActive : ''}`}
                title="Labels & Tags"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Avatar with Lock action on click */}
          <div
            onClick={handleLockEnclave}
            className={styles.dockBottomAvatar}
            title="Ivan Affriandi (Click to Lock)"
          >
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Ivan Affriandi" />
          </div>
        </aside>

        {/* ── WORKSPACE CORE: MIDDLE CARDS + RIGHT READING PANE ── */}
        <ShuenWorkspaceWidget />
      </main>
    </div>
  );
}
