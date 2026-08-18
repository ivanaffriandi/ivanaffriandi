'use client';

import React, { useState } from 'react';

interface WorkSecurityGateProps {
  onAuthenticated: () => void;
}

export default function WorkSecurityGate({ onAuthenticated }: WorkSecurityGateProps) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-master-passcode', passcode }),
      });

      const data = await res.json();
      if (res.ok && data.authenticated) {
        onAuthenticated();
      } else {
        setError('Incorrect master security passcode');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100vw',
      backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      userSelect: 'none'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(18, 18, 20, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '28px',
        padding: '36px 32px',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        boxShadow: '0 24px 80px -20px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        transform: shake ? 'translateX(-8px)' : 'none',
        transition: shake ? 'transform 0.05s ease-in-out' : 'all 0.2s ease'
      }}>
        {/* Security Shield Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 8px 30px rgba(212, 175, 55, 0.25)',
          position: 'relative'
        }}>
          🛡️
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: '#34d399',
            border: '3px solid #121214'
          }} />
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0, color: '#ffffff' }}>
            Ivan Affriandi
          </h2>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', margin: '4px 0 0 0', fontFamily: 'ui-monospace, monospace' }}>
            Master Operating System · Restricted
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Enter Master Security Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.06)',
                border: error ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '14px 16px',
                fontSize: '14px',
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '3px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '11px', color: '#f87171', fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            style={{
              width: '100%',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: loading || !passcode ? 'not-allowed' : 'pointer',
              opacity: loading || !passcode ? 0.4 : 1,
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? 'Verifying Enclave...' : 'Unlock Workspace'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', width: '100%', paddingTop: '16px' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', margin: 0, fontFamily: 'ui-monospace, monospace' }}>
            🔒 End-to-End Encrypted Session · work.ivanaffriandi.com
          </p>
        </div>
      </div>
    </div>
  );
}
