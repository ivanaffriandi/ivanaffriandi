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
  theme?: 'stone' | 'ink'; // 'stone' = wabi-sabi warm off-white, 'ink' = dark sumi charcoal
}

interface InstagramStoryTemplateProps {
  post: StoryPostData;
}

/**
 * 1080 x 1920 Instagram Story Template
 * High-fashion editorial aesthetic with wabi-sabi minimalism, generous whitespace,
 * high-res photograph hero framing, elegant serif typography, and tactile pill badge.
 * Rendered off-screen for crisp DOM-to-PNG capture.
 */
export const InstagramStoryTemplate = forwardRef<HTMLDivElement, InstagramStoryTemplateProps>(
  ({ post }, ref) => {
    const isInk = post.theme === 'ink';

    // Color tokens
    const bg = isInk ? '#141413' : '#F7F5F0';
    const textPrimary = isInk ? '#F4F3EE' : '#1A1918';
    const textSecondary = isInk ? '#A8A69E' : '#5C5955';
    const textMuted = isInk ? '#6E6B65' : '#8E8B84';
    const borderSubtle = isInk ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    const pillBg = isInk ? '#201F1E' : '#FFFFFF';
    const pillBorder = isInk ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)';
    const pillShadow = isInk
      ? '0 12px 30px rgba(0, 0, 0, 0.5)'
      : '0 12px 30px rgba(0, 0, 0, 0.06)';

    // Safely route external image through CORS proxy so html-to-image never taints canvas
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
          className="relative flex flex-col justify-between w-[1080px] h-[1920px] box-border select-none overflow-hidden"
          style={{
            width: '1080px',
            height: '1920px',
            backgroundColor: bg,
            color: textPrimary,
            padding: '90px 90px 80px 90px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Playfair Display", "Lora", Georgia, serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle Inset Frame (Wabi-Sabi Craftsmanship) */}
          <div
            className="absolute inset-[30px] pointer-events-none"
            style={{
              border: `1px solid ${borderSubtle}`,
            }}
          />

          {/* ── ZONE 1: TOP EDITORIAL MASTHEAD ── */}
          <header
            className="relative z-10 flex items-center justify-between w-full border-b pb-7 shrink-0"
            style={{ borderColor: borderSubtle }}
          >
            {/* Author / Brand Seal */}
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center border font-mono text-[16px] font-bold tracking-wider"
                style={{
                  borderColor: textPrimary,
                  color: textPrimary,
                }}
              >
                IA
              </div>
              <div className="flex flex-col">
                <span
                  className="font-mono text-[15px] font-bold tracking-[0.25em] uppercase leading-tight"
                  style={{ color: textPrimary }}
                >
                  {post.author || 'IVAN AFFRIANDI'}
                </span>
                <span
                  className="font-mono text-[12px] tracking-[0.2em] uppercase leading-tight mt-1"
                  style={{ color: textMuted }}
                >
                  ATELIER &bull; JOURNAL
                </span>
              </div>
            </div>

            {/* Issue / Date / Reading Meta */}
            <div className="flex flex-col items-end">
              <span
                className="font-mono text-[13px] font-bold tracking-[0.2em] uppercase"
                style={{ color: textPrimary }}
              >
                {post.category || 'ESSAY'}
              </span>
              <span
                className="font-mono text-[12px] tracking-[0.14em] uppercase mt-1"
                style={{ color: textMuted }}
              >
                {post.publishedDate || 'AUTUMN 2026'} &bull; {post.readingTime || '4 MIN READ'}
              </span>
            </div>
          </header>

          {/* ── ZONE 2: EDITORIAL PHOTOGRAPH + HEADLINE (CENTER HERO) ── */}
          <main className="relative z-10 flex flex-col justify-center my-auto w-full">
            {/* High-Fashion Hero Photograph Frame */}
            <div
              className="relative w-full h-[760px] rounded-2xl overflow-hidden mb-10 shrink-0"
              style={{
                border: `1px solid ${borderSubtle}`,
                backgroundColor: isInk ? '#1C1C1B' : '#ECE8E1',
              }}
            >
              <img
                src={proxiedCover}
                alt={post.title}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Editorial Frame Watermark */}
              <div
                className="absolute bottom-5 left-6 px-3.5 py-1.5 rounded-full font-mono text-[11px] font-bold tracking-[0.2em] uppercase backdrop-blur-md"
                style={{
                  backgroundColor: isInk ? 'rgba(20,20,19,0.75)' : 'rgba(255,255,255,0.85)',
                  color: textPrimary,
                  border: `1px solid ${borderSubtle}`,
                }}
              >
                FIGURE 01 &bull; {post.category || 'JOURNAL'}
              </div>
            </div>

            {/* Minimalist Chop Mark / Ornament */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[2px]" style={{ backgroundColor: textPrimary }} />
              <span
                className="font-mono text-[13px] font-bold tracking-[0.25em] uppercase"
                style={{ color: textMuted }}
              >
                ESSAY
              </span>
            </div>

            {/* High-Fashion Literary Serif Title */}
            <h1
              className="text-[54px] font-normal leading-[1.16] tracking-tight mb-5"
              style={{
                color: textPrimary,
                fontFamily: '"Playfair Display", "Lora", Georgia, serif',
                wordBreak: 'break-word',
                maxHeight: '190px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {post.title}
            </h1>

            {/* Subtle Divider Rule */}
            <div className="w-16 h-[2px] mb-5" style={{ backgroundColor: borderSubtle }} />

            {/* Poetic Excerpt */}
            {post.excerpt && (
              <p
                className="text-[25px] font-light leading-[1.6] tracking-normal mb-0"
                style={{
                  color: textSecondary,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                &ldquo;{post.excerpt}&rdquo;
              </p>
            )}
          </main>

          {/* ── ZONE 3: STYLIZED 'READ ON WEB' PILL & FOOTER ── */}
          <footer
            className="relative z-10 flex flex-col items-center gap-7 w-full pt-7 border-t shrink-0"
            style={{ borderColor: borderSubtle }}
          >
            {/* Stylized Interactive Pill Badge */}
            <div
              className="flex items-center justify-between w-full max-w-[620px] px-8 py-5 rounded-full"
              style={{
                backgroundColor: pillBg,
                border: `1.5px solid ${pillBorder}`,
                boxShadow: pillShadow,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3.5 h-3.5 rounded-full animate-pulse"
                  style={{ backgroundColor: isInk ? '#50E3C2' : '#10B981' }}
                />
                <span
                  className="font-mono text-[15px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: textPrimary }}
                >
                  READ COMPLETE ESSAY
                </span>
              </div>

              {/* Minimal Slanted Arrow Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: textPrimary,
                  color: bg,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Bottom Meta & URL Label */}
            <div
              className="flex items-center justify-between w-full font-mono text-[13px] tracking-[0.2em] uppercase"
              style={{ color: textMuted }}
            >
              <span>LINK IN BIO / STORIES</span>
              <span>{post.url ? post.url.replace(/^https?:\/\//, '') : 'ivanaffriandi.com/blog'}</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }
);

InstagramStoryTemplate.displayName = 'InstagramStoryTemplate';
