'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { getMinimalistNatureCover } from '@/utils/natureCover';

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
 * - Background Top Center: Subtle Chapter capsule (No dot)
 * - Center: Crisp White 760px rounded sticker card (Photo + Date + Title + Excerpt + Author)
 * - Background Bottom Center: blog.ivanaffriandi.com link capsule
 */
export const InstagramStoryTemplate = forwardRef<HTMLDivElement, InstagramStoryTemplateProps>(
  ({ post }, ref) => {
    const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);

    // Resolve cover image and route external images through our CORS proxy
    const rawCover = post.coverImage || getMinimalistNatureCover(post.title);
    const proxiedCover =
      rawCover.startsWith('http://') || rawCover.startsWith('https://')
        ? `/api/proxy-image?url=${encodeURIComponent(rawCover)}`
        : rawCover;

    // Convert cover image into an inline base64 Data URL for 100% reliable canvas capture
    useEffect(() => {
      let isMounted = true;
      const loadCover = async () => {
        if (rawCover.startsWith('data:')) {
          if (isMounted) setCoverDataUrl(rawCover);
          return;
        }

        try {
          const res = await fetch(proxiedCover);
          if (!res.ok) throw new Error(`Image proxy status: ${res.status}`);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (isMounted && typeof reader.result === 'string') {
              setCoverDataUrl(reader.result);
            }
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          console.warn('Fallback to proxied cover:', err);
          if (isMounted) setCoverDataUrl(proxiedCover);
        }
      };

      loadCover();
      return () => {
        isMounted = false;
      };
    }, [rawCover, proxiedCover]);

    const displayCover = coverDataUrl || proxiedCover;
    const chapterText = post.chapter || post.category || 'CHAPTER 07';

    return (
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1080px',
          height: '1920px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -99999,
          overflow: 'hidden',
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
            backgroundColor: '#1C1E22',
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
          {/* ── BACKGROUND LAYER: VIBRANT LUMINOUS AMBIENT NATURE PHOTO GLOW ── */}
          <div
            style={{
              position: 'absolute',
              inset: '-40px',
              backgroundImage: `url(${displayCover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(36px) saturate(1.25) brightness(0.92)',
              opacity: 1,
              transform: 'scale(1.08)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* Soft Natural Ambient Light Overlay (Vibrant, Fresh, Never Muddy or Dark) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.04) 25%, rgba(0, 0, 0, 0.04) 75%, rgba(0, 0, 0, 0.26) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* ── ZONE 1: BACKGROUND TOP CENTER (CHAPTER CAPSULE - NO DOT) ── */}
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
                justifyContent: 'center',
                padding: '10px 24px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                }}
              >
                {chapterText}
              </span>
            </div>
          </div>

          {/* ── ZONE 2: CENTER STAGE - CRISP WHITE MINIMALIST EDITORIAL CARD ── */}
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
              backgroundColor: '#FFFFFF',
              borderRadius: '34px',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 28px 80px rgba(0, 0, 0, 0.22), 0 8px 24px rgba(0, 0, 0, 0.1)',
              padding: '22px',
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
                width: '716px',
                height: '380px',
                borderRadius: '22px',
                overflow: 'hidden',
                backgroundColor: '#F4F4F5',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                flexShrink: 0,
              }}
            >
              <img
                src={displayCover}
                alt={post.title}
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* 2. CARD CONTENT AREA (HIGH CONTRAST & CRYSTAL CLEAR) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '18px 8px 6px 8px',
                boxSizing: 'border-box',
              }}
            >
              {/* DATE & READING TIME */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#71717A',
                }}
              >
                <span>{post.publishedDate || 'RECENT'}</span>
                <span style={{ opacity: 0.45 }}>&bull;</span>
                <span>{post.readingTime || '4 MIN READ'}</span>
              </div>

              {/* POST TITLE (CLEAN 2 LINES CLAMP, SOLID CRISP BLACK) */}
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  lineHeight: '1.25',
                  letterSpacing: '-0.025em',
                  color: '#09090B',
                  margin: '10px 0 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {post.title}
              </h2>

              {/* BLOG CONTENT EXCERPT (3 LINES OF CONTENT, RICH CHARCOAL) */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: '17px',
                    fontWeight: 400,
                    lineHeight: '1.55',
                    letterSpacing: '-0.01em',
                    color: '#3F3F46',
                    margin: '12px 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                  }}
                >
                  {post.excerpt}
                </p>
              )}

              {/* 3. CARD FOOTER ROW: AUTHOR & READ ESSAY PILL */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Author Monogram & Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9999px',
                      backgroundColor: '#09090B',
                      color: '#FFFFFF',
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
                      letterSpacing: '0.02em',
                      color: '#09090B',
                    }}
                  >
                    {post.author || 'Ivan Affriandi'}
                  </span>
                </div>

                {/* Tactile Black Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    borderRadius: '9999px',
                    backgroundColor: '#09090B',
                    color: '#FFFFFF',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#FFFFFF',
                    }}
                  >
                    READ BLOG
                  </span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
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
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
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
