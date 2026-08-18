'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/work/work.module.css';

interface SpatialProjectGridProps {
  onSelectProject: (projectId: string) => void;
  onLockSession: () => void;
}

export default function SpatialProjectGrid({
  onSelectProject,
  onLockSession,
}: SpatialProjectGridProps) {
  const [timeString, setTimeString] = useState('');
  const [activeTab, setActiveTab] = useState<'rooms' | 'dashboard'>('rooms');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Jakarta',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/work/hub', { cache: 'no-store' });
      setSyncToast('Telemetry Synced');
      setTimeout(() => setSyncToast(null), 2500);
    } catch {
      setSyncToast('Sync Error');
      setTimeout(() => setSyncToast(null), 2500);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setShowCreateModal(false);
    onSelectProject('kvr');
  };

  return (
    <div className={styles.launcherWrapper}>
      {/* ── TOP FLOATING BAR & DYNAMIC ISLAND ── */}
      <header className={styles.topFloatingBar}>
        {/* Left Side Controls */}
        <div className={styles.topBarLeft}>
          <div className={styles.userSquircle} title="Ivan Affriandi">
            IA
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={styles.pillToggle}
            title={isDarkMode ? "Day Mode" : "Dark Ambient Mode"}
            style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(37, 99, 235, 0.85)',
            }}
          >
            <div
              className={styles.pillToggleDot}
              style={{
                transform: isDarkMode ? 'translateX(12px)' : 'translateX(0)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className={styles.btnGlassPill}
          >
            Settings
          </button>
        </div>

        {/* Center Dynamic Island Pill */}
        <div
          onClick={() => onSelectProject('shuen')}
          className={styles.dynamicIslandPill}
          title="Open SHŪ / EN Studio Live Hub"
        >
          <div className={styles.dynamicAvatar}>SE</div>
          <div className={styles.dynamicTitle}>
            SHŪ / EN Studio · Bespoke Production Active
          </div>
          <div className={styles.dynamicBadge}>
            {timeString || '14:15'} WIB
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </div>

        {/* Right Side Switcher & Search */}
        <div className={styles.topBarRight}>
          <div className={styles.segmentedHeaderPill}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${styles.segmentedHeaderItem} ${
                activeTab === 'dashboard' ? styles.segmentedHeaderItemActive : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`${styles.segmentedHeaderItem} ${
                activeTab === 'rooms' ? styles.segmentedHeaderItemActive : ''
              }`}
            >
              Rooms
            </button>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className={styles.searchCircleBtn}
            title="Spotlight Search (⌘K)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── TAB 1: ROOMS GRID VIEW (DEFAULT) ── */}
      {activeTab === 'rooms' && (
        <main className={styles.spatialGridWrapper}>
          <div className={styles.spatialGrid}>
            {/* Card 1: Create a room */}
            <div
              onClick={() => setShowCreateModal(true)}
              className={`${styles.spatialCard} ${styles.cardThemeCreate}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '-0.01em' }}>Create a room</span>
            </div>

            {/* Card 2: SHŪ / EN Studio */}
            <div
              onClick={() => onSelectProject('shuen')}
              className={`${styles.spatialCard} ${styles.cardThemeWhite}`}
            >
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className={styles.cardTitle}>SHŪ / EN Studio</h3>
                  <span style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 800, letterSpacing: '0.04em' }}>ACTIVE</span>
                </div>
                <p className={styles.cardSubtitle}>Bespoke Atelier &amp; Tailoring Hub</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.soloAvatarBadge}>IA</div>
                <span className={styles.cardBadgePill}>9</span>
              </div>
            </div>

            {/* Card 3: KVR Objects */}
            <div
              onClick={() => onSelectProject('kvr')}
              className={`${styles.spatialCard} ${styles.cardThemeWhite}`}
            >
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className={styles.cardTitle}>KVR Objects</h3>
                  <span style={{ fontSize: '9.5px', color: '#2563eb', fontWeight: 800, letterSpacing: '0.04em' }}>DESIGN</span>
                </div>
                <p className={styles.cardSubtitle}>Design Studio &amp; Physical Artifacts</p>
              </div>

              {/* Soundwave / Visual telemetry */}
              <div className={styles.cardBodyVisual}>
                {[8, 14, 22, 12, 18, 24, 18, 10, 16, 22, 14, 8, 18, 12, 20, 15, 8, 12].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      className={styles.waveBar}
                      style={{ height: `${h}px` }}
                    />
                  )
                )}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.soloAvatarBadge}>IA</div>
                <span className={styles.cardBadgePill}>4</span>
              </div>
            </div>

            {/* Card 4: Personal Space */}
            <div
              onClick={() => onSelectProject('personal')}
              className={`${styles.spatialCard} ${styles.cardThemeFrostedGlass}`}
            >
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className={styles.cardTitle}>Personal Space</h3>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4b5563' }}>
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
                <p className={styles.cardSubtitle}>ivanaffriandi.com · Writing &amp; Drafts</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.soloAvatarBadge} style={{ background: '#ffffff', color: '#111827' }}>IA</div>
                <span className={styles.cardBadgePill}>12</span>
              </div>
            </div>
          </div>

          {/* Centered Pagination Dots */}
          <div className={styles.gridPaginationDots}>
            <div className={`${styles.paginationDot} ${styles.paginationDotActive}`} />
            <div className={styles.paginationDot} />
            <div className={styles.paginationDot} />
          </div>
        </main>
      )}

      {/* ── TAB 2: EXECUTIVE DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <main className={styles.spatialGridWrapper} style={{ maxWidth: '820px' }}>
          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(40px) saturate(200%)',
              borderRadius: '28px',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Executive Hub Telemetry</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Real-time business and studio operations</p>
              </div>
              <button
                onClick={() => setActiveTab('rooms')}
                className={styles.btnGlassPill}
              >
                Back to Rooms
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>SHŪ / EN Studio</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>9 Orders</div>
                <span style={{ fontSize: '11px', color: '#10b981' }}>Lead time: 17–20d</span>
              </div>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>KVR Objects</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>4 Releases</div>
                <span style={{ fontSize: '11px', color: '#2563eb' }}>Casting in progress</span>
              </div>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Database / APIs</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>3ms Online</div>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Postgres &amp; DOKU</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── BOTTOM FLOATING DOCK (SOLO IVAN AFFRIANDI) ── */}
      <footer className={styles.bottomFloatingDock}>
        {/* Left Solo User Avatar */}
        <div className={styles.soloAvatarBadge} style={{ width: '34px', height: '34px' }}>
          IA
        </div>

        {/* Center Dock Pill */}
        <div className={styles.dockCenterPill}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Ivan Affriandi
          </span>
          <span
            style={{
              fontSize: '11px',
              color: '#6b7280',
            }}
          >
            · Workspace OS v2.6
          </span>
          {syncToast && (
            <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 700, marginLeft: '6px' }}>
              ✓ {syncToast}
            </span>
          )}
        </div>

        {/* Right Action Circle Buttons */}
        <div className={styles.dockActions}>
          <button
            onClick={handleRefresh}
            className={styles.dockBtnCircle}
            title="Refresh Live Data"
            style={{
              transform: isSyncing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.6s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            onClick={onLockSession}
            className={`${styles.dockBtnCircle} ${styles.dockBtnCircleRed}`}
            title="Lock Session"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        </div>
      </footer>

      {/* ── MODAL 1: SETTINGS MODAL ── */}
      {showSettings && (
        <div className={styles.modalBackdrop} onClick={() => setShowSettings(false)}>
          <div className={styles.visionModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Workspace Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f9fafb', padding: '14px 16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Account</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>Ivan Affriandi</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>ivan@ivanaffriandi.com</div>
              </div>

              <div style={{ background: '#f9fafb', padding: '14px 16px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Active Projects</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => { setShowSettings(false); onSelectProject('shuen'); }} className={styles.btnGlassPill}>SHŪ / EN Studio</button>
                  <button onClick={() => { setShowSettings(false); onSelectProject('kvr'); }} className={styles.btnGlassPill}>KVR Objects</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowSettings(false); onLockSession(); }}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Sign Out &amp; Lock
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SPOTLIGHT SEARCH (CMD+K) ── */}
      {showSearch && (
        <div className={styles.modalBackdrop} onClick={() => setShowSearch(false)}>
          <div className={styles.visionModalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f3f4f6', padding: '10px 14px', borderRadius: '16px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Jump to project, order, or setting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '13.5px',
                  color: '#111827',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                onClick={() => { setShowSearch(false); onSelectProject('shuen'); }}
                style={{ padding: '10px 12px', borderRadius: '12px', background: '#f9fafb', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>SHŪ / EN Studio</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Open live orders &amp; tailoring queue</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>↵</span>
              </div>

              <div
                onClick={() => { setShowSearch(false); onSelectProject('kvr'); }}
                style={{ padding: '10px 12px', borderRadius: '12px', background: '#f9fafb', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>KVR Objects</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Open design studio &amp; artifacts</div>
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>↵</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CREATE ROOM MODAL ── */}
      {showCreateModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
          <div className={styles.visionModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Create a Workspace Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. KVR Objects Lab, AI Engine..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    marginTop: '6px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                Create Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
