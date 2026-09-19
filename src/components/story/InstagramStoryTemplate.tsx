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
 * Movable Instagram Story Sticker
 * A compact, high-fashion iOS-style sticker on a TRANSPARENT background.
 * Can be dragged, rotated, and resized freely in Instagram Stories on top of any photo or video.
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
          backgroundColor: 'transparent',
          padding: '30px', // Cushion for drop-shadow capture
        }}
      >
        {/* ── THE MOVABLE STICKER CARD ── */}
        <div
          ref={ref}
          id="instagram-story-sticker"
          style={{
            position: 'relative',
            width: '540px',
            backgroundColor: 'rgba(22, 23, 26, 0.96)',
            borderRadius: '32px',
            border: '1.5px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.35)',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Inter, sans-serif',
            color: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          {/* 1. STICKER HERO COVER PHOTO */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '310px',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#111215',
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
            {/* Subtle bottom gradient on image */}
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
              padding: '16px 8px 4px 8px',
              boxSizing: 'border-box',
            }}
          >
            {/* Category & Reading Time Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.55)',
              }}
            >
              <span>{post.category || 'ESSAY'}</span>
              <span style={{ opacity: 0.35 }}>&bull;</span>
              <span>{post.readingTime || '4 MIN READ'}</span>
            </div>

            {/* Post Title */}
            <h2
              style={{
                fontSize: '24px',
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

            {/* 3. STICKER FOOTER: AUTHOR & CALL TO ACTION */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Author Monogram & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  IA
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {post.author || 'Ivan Affriandi'}
                </span>
              </div>

              {/* Minimal Web Link Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
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
                  READ ON WEB
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
      </div>
    );
  }
);

InstagramStoryTemplate.displayName = 'InstagramStoryTemplate';
