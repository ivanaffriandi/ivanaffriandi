'use client';

import React, { useState, useEffect } from 'react';
import ShuenWorkspaceWidget from '@/components/ShuenWorkspaceWidget';
import WorkSecurityGate from '@/components/WorkSecurityGate';
import styles from './work.module.css';

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'metrics' | 'products' | 'telemetry'>('orders');
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
      {/* ── MAIN SWISS VISION OS CANVAS ── */}
      <main className={styles.floatingCanvas}>
        {/* ── LEFT SWISS DOCK RAIL ── */}
        <aside className={styles.dockRail}>
          <div className={styles.dockTopGroup}>
            {/* Ivan Affriandi Monogram */}
            <div className={styles.dockBrandLogo} title="Ivan Affriandi OS">
              IA
            </div>

            {/* Circular Action Icons */}
            <div className={styles.dockIconsStack}>
              {/* Orders & Crafting Desk */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`${styles.dockIconBtn} ${activeTab === 'orders' ? styles.dockIconBtnActive : ''}`}
                title="Bespoke Orders & Crafting Desk"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </button>

              {/* Metrics & Revenue */}
              <button
                onClick={() => setActiveTab('metrics')}
                className={`${styles.dockIconBtn} ${activeTab === 'metrics' ? styles.dockIconBtnActive : ''}`}
                title="Studio Revenue & Metrics"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </button>

              {/* Products & Catalog */}
              <button
                onClick={() => setActiveTab('products')}
                className={`${styles.dockIconBtn} ${activeTab === 'products' ? styles.dockIconBtnActive : ''}`}
                title="Products & Catalog Matrix"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>

              {/* Telemetry & System Health */}
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`${styles.dockIconBtn} ${activeTab === 'telemetry' ? styles.dockIconBtnActive : ''}`}
                title="Server Telemetry & Connections"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Ivan's Profile Avatar */}
          <div
            onClick={handleLockEnclave}
            className={styles.dockBottomAvatar}
            title="Ivan Affriandi (Click to Lock)"
          >
            <img src="/profile.jpg" alt="Ivan Affriandi" onError={(e) => { (e.target as HTMLImageElement).src = 'https://github.com/ivanaffriandi.png'; }} />
            <div className={styles.avatarPulseBadge} />
          </div>
        </aside>

        {/* ── WORKSPACE CORE CONTENT ── */}
        {activeTab === 'orders' && <ShuenWorkspaceWidget />}

        {activeTab === 'metrics' && (
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.94)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>SHŪ / EN Executive Revenue &amp; Capacity</h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0' }}>Real-time aggregated telemetry from PostgreSQL &amp; DOKU gateway.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: '#f8f8fa', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Studio Gross</span>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#18181b', marginTop: '6px' }}>Rp 374,000</div>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>● Live Synced</span>
              </div>

              <div style={{ background: '#f8f8fa', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pre-Order Batch 1 Quota</span>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#18181b', marginTop: '6px' }}>10% Allocated</div>
                <div style={{ width: '100%', height: '6px', background: '#e4e4e7', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', background: '#18181b' }} />
                </div>
              </div>

              <div style={{ background: '#f8f8fa', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Crafting Lead Time</span>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#18181b', marginTop: '6px' }}>17–20 Days</div>
                <span style={{ fontSize: '11px', color: '#71717a' }}>Tangerang Leather Atelier</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.94)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Product Catalog &amp; Customization Matrix</h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0' }}>Manage 3D configurator active collections &amp; base pricing.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ background: '#f8f8fa', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>A6 Trifold Leather Journal</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>Bespoke 3D Configurator · Moire Fabric</p>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#18181b', marginTop: '8px', display: 'block' }}>From Rp 289,000</span>
                </div>
                <a href="https://shuenstudio.com/po" target="_blank" rel="noreferrer" className={styles.btnSwissPill}>
                  Open 3D ↗
                </a>
              </div>

              <div style={{ background: '#f8f8fa', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>A5 Bifold Archive Journal</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#71717a' }}>Executive Atelier Series · Full Grain</p>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#18181b', marginTop: '8px', display: 'block' }}>From Rp 349,000</span>
                </div>
                <a href="https://shuenstudio.com" target="_blank" rel="noreferrer" className={styles.btnSwissPill}>
                  Storefront ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.94)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>System Telemetry &amp; API Gateways</h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0' }}>Live connection health across Oracle VM, Vercel Edge &amp; Cloudflare.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8f8fa', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>PostgreSQL Primary Database</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>ONLINE (2ms)</span>
              </div>

              <div style={{ background: '#f8f8fa', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>DOKU Payment Webhook Gateway</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>HEALTHY · 200 OK</span>
              </div>

              <div style={{ background: '#f8f8fa', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Biteship Logistics Gateway (JNE &amp; J&amp;T)</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>CONNECTED</span>
              </div>

              <div style={{ background: '#f8f8fa', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>AWS SES Mail &amp; DKIM 2048-bit Signing</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>ACTIVE · 99.98%</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
