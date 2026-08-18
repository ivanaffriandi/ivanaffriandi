'use client';

import React, { useState } from 'react';

interface WorkSecurityGateProps {
  onAuthenticated: () => void;
}

export default function WorkSecurityGate({ onAuthenticated }: WorkSecurityGateProps) {
  const [email, setEmail] = useState('ivan@ivanaffriandi.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login-email',
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.authenticated) {
        onAuthenticated();
      } else {
        setError('Incorrect password. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="workSecurityGate"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 99999,
        backgroundColor: '#0c0d10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        color: '#111827',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", sans-serif',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Background VisionOS Spatial Wallpaper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/spatial_green_hills.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          filter: 'brightness(0.92) blur(16px)',
          transform: 'scale(1.06)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.25) 100%)',
          zIndex: 2,
        }}
      />

      {/* Main VisionOS Frosted Glass Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '32px',
          padding: '40px 36px 36px 36px',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 30px 90px -15px rgba(0, 0, 0, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          transform: shake ? 'translateX(-8px)' : 'none',
          transition: shake ? 'transform 0.05s ease-in-out' : 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Apple VisionOS Icon Squircle */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            color: '#ffffff',
            boxShadow: '0 10px 24px rgba(17, 24, 39, 0.18)',
          }}
        >
          ❖
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              color: '#111827',
            }}
          >
            VisionOS Workspace
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: '6px 0 0 0',
              lineHeight: 1.4,
            }}
          >
            Sign in with your email to access your projects and studios.
          </p>
        </div>

        {/* Email & Password Login Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left',
          }}
        >
          {/* Email Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#4b5563',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '14px',
                padding: '13px 16px',
                fontSize: '13.5px',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.16s ease',
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#4b5563',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password / Passcode
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                border: error ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '14px',
                padding: '13px 16px',
                fontSize: '13.5px',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.16s ease',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: '11.5px',
                color: '#ef4444',
                fontWeight: 600,
                margin: '2px 0 0 0',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              marginTop: '8px',
              width: '100%',
              background: '#111827',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '13px 20px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: loading || !password ? 0.4 : 1,
              boxShadow: '0 4px 14px rgba(17, 24, 39, 0.2)',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            width: '100%',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#9ca3af',
          }}
        >
          <span>Ivan Affriandi</span>
          <span>·</span>
          <span>work.ivanaffriandi.com</span>
        </div>
      </div>
    </div>
  );
}
