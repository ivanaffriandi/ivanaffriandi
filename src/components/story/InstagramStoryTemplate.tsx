'use client';

import React, { forwardRef } from 'react';

export interface StoryPostData {
  title: string;
  coverImage?: string;
  excerpt?: string;
  category?: string;
  publishedDate?: string;
  readingTime?: string;
  url?: string;
  author?: string;
  theme?: 'stone' | 'ink';
}

interface InstagramStoryTemplateProps {
  post: StoryPostData;
}

/**
 * 1080 x 1920 Instagram Story Template
 * Authentic Apple / iOS Minimalist Aesthetic (Dark Obsidian, Ambient Blur Glow, Floating iOS Card,
 * SF Pro typography, and iconic iOS Link Pill).
 * Uses 100% inline CSS so it is completely immune to missing stylesheets or Tailwind classes.
 */
export const InstagramStoryTemplate = forwardRef<HTMLDivElement, InstagramStoryTemplateProps>(
  ({ post }, ref) => {
    // Resolve cover image and route external images through our CORS proxy
    const rawCover = post.coverImage || '/nature_hero.png';
    const proxiedCover =
      rawCover.startsWith('http://') || rawCover.startsWith('https://')
        ? `/api/proxy-image?url=${encodeURIComponent(rawCover)}`
        : rawCover;

    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          pointerEvents: 'none',
          zIndex: -9999,
        }}
      >
        <div
          ref={ref}
          id="instagram-story-canvas"
          style={{
            position: 'relative',
            width: '1080px',
            height: '1920px',
            boxSizing: 'border-box',
            backgroundColor: '#090A0C',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '110px 80px 100px 80px',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif',
            userSelect: 'none',
            color: '#FFFFFF',
          }}
        >
          {/* ── BACKGROUND: AMBIENT COVER PHOTO BLUR GLOW (APPLE MUSIC STYLE) ── */}
          <div
            style={{
              position: 'absolute',
              inset: '-80px',
              backgroundImage: `url(${proxiedCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(100px) saturate(1.8) brightness(0.35)',
              opacity: 0.65,
              transform: 'scale(1.2)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Subtle Dark Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 40%, rgba(9,10,12,0.4) 0%, rgba(9,10,12,0.85) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* ── ZONE 1: TOP DYNAMIC CAPSULE (iOS HEADER) ── */}
          <header
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '920px',
            }}
          >
            {/* Dynamic Island Capsule */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 26px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '9999px',
                  backgroundColor: '#30D158', // iOS Green dot
                  boxShadow: '0 0 10px #30D158',
                }}
              />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                }}
              >
                {post.author || 'IVAN AFFRIANDI'}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '13px' }}>&bull;</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                JOURNAL
              </span>
            </div>

            {/* Reading Time Badge */}
            <div
              style={{
                padding: '12px 22px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.65)',
              }}
            >
              {post.readingTime || '4 MIN READ'}
            </div>
          </header>

          {/* ── ZONE 2: FLOATING iOS EDITORIAL CARD ── */}
          <main
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '920px',
              backgroundColor: 'rgba(26, 27, 31, 0.88)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '44px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 40px 100px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              padding: '40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Featured Photo Frame */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '700px',
                borderRadius: '32px',
                overflow: 'hidden',
                backgroundColor: '#151619',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={proxiedCover}
                alt={post.title}
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Subtle gradient scrim on bottom of photo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 45%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Content Below Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '32px' }}>
              {/* Category & Date Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.55)',
                }}
              >
                <span>{post.category || 'ESSAY'}</span>
                <span style={{ opacity: 0.4 }}>&bull;</span>
                <span>{post.publishedDate || 'AUTUMN 2026'}</span>
              </div>

              {/* iOS Bold Headline */}
              <h1
                style={{
                  fontSize: '46px',
                  fontWeight: 800,
                  lineHeight: '1.2',
                  letterSpacing: '-0.025em',
                  color: '#FFFFFF',
                  margin: '14px 0 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: '22px',
                    fontWeight: 400,
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.72)',
                    margin: '16px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.excerpt}
                </p>
              )}
            </div>
          </main>

          {/* ── ZONE 3: AUTHENTIC iOS PILL BADGE & FOOTER ── */}
          <footer
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              maxWidth: '920px',
            }}
          >
            {/* White iOS Action Capsule */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: '640px',
                height: '84px',
                padding: '0 28px 0 34px',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(255, 255, 255, 0.2)',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Safari / Compass Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  READ ON WEB
                </span>
              </div>

              {/* Slanted Arrow Inset Circle */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '9999px',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Sub-pill URL link text */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {post.url ? post.url.replace(/^https?:\/\//, '') : 'ivanaffriandi.com/blog'} &bull; TAP LINK IN BIO
            </span>
          </footer>
        </div>
      </div>
    );
  }
);

InstagramStoryTemplate.displayName = 'InstagramStoryTemplate';
