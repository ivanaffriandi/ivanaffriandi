'use client';

import React, { forwardRef } from 'react';

export interface StoryPostData {
  title: string;
  coverImage?: string;
  excerpt?: string;
  category?: string;
  chapter?: string;
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
 * - Proportional, compact floating sticker card in dead-center
 * - No empty void or stretched dead space
 * - Background Top Center: Subtle Chapter capsule
 * - Center: Compact 760px rounded sticker card (Photo + Date + Title + Author)
 * - Background Bottom Center: blog.ivanaffriandi.com link capsule
 */
export const InstagramStoryTemplate = forwardRef<HTMLDivElement, InstagramStoryTemplateProps>(
  ({ post }, ref) => {
    // Resolve cover image and route external images through our CORS proxy
    const rawCover = post.coverImage || '/nature_hero.png';
    const proxiedCover =
      rawCover.startsWith('http://') || rawCover.startsWith('https://')
        ? `/api/proxy-image?url=${encodeURIComponent(rawCover)}`
        : rawCover;

    const chapterText = post.chapter || post.category || 'CHAPTER 07';

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
            backgroundColor: '#08090B',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '160px 80px 140px 80px',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif',
            userSelect: 'none',
            color: '#FFFFFF',
          }}
        >
          {/* ── BACKGROUND LAYER: SMOOTH AMBIENT BLUR PHOTO GLOW ── */}
          <div
            style={{
              position: 'absolute',
              inset: '-60px',
              backgroundImage: `url(${proxiedCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(80px) saturate(1.6) brightness(0.28)',
              opacity: 0.72,
              transform: 'scale(1.15)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Dark Radial Contrast Scrim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(8,9,11,0.25) 0%, rgba(8,9,11,0.85) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* ── ZONE 1: BACKGROUND TOP CENTER (CHAPTER CAPSULE) ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.92)',
                }}
              >
                {chapterText}
              </span>
            </div>
          </div>

          {/* ── ZONE 2: CENTER STAGE - COMPACT PROPORTIONAL STICKER CARD ── */}
          <div
            id="sticker-card"
            style={{
              position: 'relative',
              zIndex: 10,
              width: '760px',
              maxWidth: '760px',
              height: 'auto',
              flexShrink: 0,
              flexGrow: 0,
              backgroundColor: '#16171B',
              borderRadius: '34px',
              border: '1.5px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.4)',
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 1. COVER PHOTO FRAME */}
            <div
              style={{
                position: 'relative',
                width: '720px',
                height: '380px',
                borderRadius: '22px',
                overflow: 'hidden',
                backgroundColor: '#101113',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flexShrink: 0,
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
              {/* Subtle film gradient overlay on photo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* 2. CARD CONTENT AREA (COMPACT & PROPORTIONAL) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 8px 4px 8px',
                boxSizing: 'border-box',
              }}
            >
              {/* DATE & READING TIME (NO CHAPTER INSIDE CARD) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.55)',
                }}
              >
                <span>{post.publishedDate || 'RECENT'}</span>
                <span style={{ opacity: 0.35 }}>&bull;</span>
                <span>{post.readingTime || '4 MIN READ'}</span>
              </div>

              {/* POST TITLE (CLEAN 2 LINES CLAMP) */}
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  lineHeight: '1.24',
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  margin: '8px 0 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {post.title}
              </h2>

              {/* BLOG CONTENT EXCERPT (3 LINES OF CONTENT) */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: '17px',
                    fontWeight: 400,
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.78)',
                    margin: '10px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* 3. CARD FOOTER ROW: AUTHOR & READ ESSAY */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Author Monogram & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '9999px',
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                    }}
                  >
                    IA
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      color: '#FFFFFF',
                    }}
                  >
                    {post.author || 'Ivan Affriandi'}
                  </span>
                </div>

                {/* Tactile White Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    READ ESSAY
                  </span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── ZONE 3: BACKGROUND BOTTOM CENTER (LINK: blog.ivanaffriandi.com) ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>

              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                }}
              >
                blog.ivanaffriandi.com
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InstagramStoryTemplate.displayName = 'InstagramStoryTemplate';
