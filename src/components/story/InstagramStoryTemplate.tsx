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
 * - Background: Dark ambient blurred cover photo glow (retained as requested)
 * - Background Top Center: CHAPTER label
 * - Center Stage: Floating tactile Sticker Card (Photo + Date/Time + Title + Excerpt + Author)
 * - Background Bottom Center: blog.ivanaffriandi.com link
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
            backgroundColor: '#090A0D',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '130px 80px 110px 80px',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif',
            userSelect: 'none',
            color: '#FFFFFF',
          }}
        >
          {/* ── BACKGROUND LAYER: AMBIENT BLURRED COVER PHOTO GLOW ── */}
          <div
            style={{
              position: 'absolute',
              inset: '-60px',
              backgroundImage: `url(${proxiedCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(90px) saturate(1.7) brightness(0.32)',
              opacity: 0.68,
              transform: 'scale(1.15)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Dark Vignette Overlay for Contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 45%, rgba(9,10,13,0.3) 0%, rgba(9,10,13,0.85) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* ── ZONE 1: BACKGROUND TOP CENTER (CHAPTER ONLY) ── */}
          <header
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 24px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }}
              />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                {chapterText}
              </span>
            </div>
          </header>

          {/* ── ZONE 2: CENTER STAGE - FLOATING STICKER CARD ── */}
          <main
            style={{
              position: 'relative',
              zIndex: 10,
              width: '100%',
              maxWidth: '840px',
              backgroundColor: 'rgba(22, 23, 27, 0.94)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '38px',
              border: '1.5px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.7), 0 4px 20px rgba(0, 0, 0, 0.4)',
              padding: '22px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateY(-6px)',
            }}
          >
            {/* 1. STICKER COVER PHOTO */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '460px',
                borderRadius: '26px',
                overflow: 'hidden',
                backgroundColor: '#121316',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* 2. STICKER CONTENT AREA */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 10px 8px 10px',
                boxSizing: 'border-box',
              }}
            >
              {/* POSTING TIME / DATE ROW (NO CHAPTER HERE) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
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

              {/* POST TITLE */}
              <h2
                style={{
                  fontSize: '34px',
                  fontWeight: 800,
                  lineHeight: '1.24',
                  letterSpacing: '-0.022em',
                  color: '#FFFFFF',
                  margin: '10px 0 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {post.title}
              </h2>

              {/* EXCERPT */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: '19px',
                    fontWeight: 400,
                    lineHeight: '1.48',
                    color: 'rgba(255, 255, 255, 0.72)',
                    margin: '12px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* STICKER FOOTER: AUTHOR & READ ON WEB */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Author Monogram & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9999px',
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                    }}
                  >
                    IA
                  </div>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: '#FFFFFF',
                    }}
                  >
                    {post.author || 'Ivan Affriandi'}
                  </span>
                </div>

                {/* Tactile Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    READ ESSAY
                  </span>
                  <svg
                    width="12"
                    height="12"
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
          </main>

          {/* ── ZONE 3: BACKGROUND BOTTOM CENTER (LINK: blog.ivanaffriandi.com) ── */}
          <footer
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              <svg
                width="14"
                height="14"
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
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                }}
              >
                blog.ivanaffriandi.com
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

InstagramStoryTemplate.displayName = 'InstagramStoryTemplate';
