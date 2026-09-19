'use client';

import React, { forwardRef } from 'react';

export interface StoryPostData {
  title: string;
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
 * elegant serif typography, and tactile pill badge.
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
            padding: '120px 100px 110px 100px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Playfair Display", "Lora", Georgia, serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle Inset Frame (Wabi-Sabi Craftsmanship) */}
          <div
            className="absolute inset-[36px] pointer-events-none"
            style={{
              border: `1px solid ${borderSubtle}`,
            }}
          />

          {/* ── ZONE 1: TOP EDITORIAL MASTHEAD ── */}
          <header className="relative z-10 flex items-center justify-between w-full border-b pb-8" style={{ borderColor: borderSubtle }}>
            {/* Author / Brand Seal */}
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border font-mono text-[15px] font-bold tracking-wider"
                style={{
                  borderColor: textPrimary,
                  color: textPrimary,
                }}
              >
                IA
              </div>
              <div className="flex flex-col">
                <span
                  className="font-mono text-[14px] font-bold tracking-[0.25em] uppercase leading-tight"
                  style={{ color: textPrimary }}
                >
                  {post.author || 'IVAN AFFRIANDI'}
                </span>
                <span
                  className="font-mono text-[12px] tracking-[0.18em] uppercase leading-tight mt-1"
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
                style={{ color: textMuted }}
              >
                {post.category || 'ESSAY'}
              </span>
              <span
                className="font-mono text-[12px] tracking-[0.12em] uppercase mt-1"
                style={{ color: textMuted }}
              >
                {post.publishedDate || 'AUTUMN 2026'} &bull; {post.readingTime || '4 MIN READ'}
              </span>
            </div>
          </header>

          {/* ── ZONE 2: MAIN EDITORIAL CONTENT (CENTER HERO) ── */}
          <main className="relative z-10 flex flex-col justify-center my-auto py-12 max-w-[880px]">
            {/* Minimalist Ornamental Chop Mark */}
            <div className="flex items-center gap-3 mb-10">
              <span className="w-8 h-[1.5px]" style={{ backgroundColor: textPrimary }} />
              <span className="font-mono text-[12px] font-bold tracking-[0.3em] uppercase" style={{ color: textMuted }}>
                DISPATCH NO. 08
              </span>
            </div>

            {/* High-Fashion Literary Serif Title */}
            <h1
              className="text-[64px] font-normal leading-[1.12] tracking-tight mb-8"
              style={{
                color: textPrimary,
                fontFamily: '"Playfair Display", "Lora", Georgia, serif',
                wordBreak: 'break-word',
              }}
            >
              {post.title}
            </h1>

            {/* Subtle Divider Rule */}
            <div className="w-16 h-[2px] mb-8" style={{ backgroundColor: borderSubtle }} />

            {/* Poetic & Spacious Excerpt */}
            {post.excerpt && (
              <p
                className="text-[28px] font-light leading-[1.65] tracking-normal mb-0"
                style={{
                  color: textSecondary,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                &ldquo;{post.excerpt}&rdquo;
              </p>
            )}
          </main>

          {/* ── ZONE 3: STYLIZED 'READ ON WEB' PILL & FOOTER ── */}
          <footer className="relative z-10 flex flex-col items-center gap-8 w-full pt-8 border-t" style={{ borderColor: borderSubtle }}>
            {/* Spotify / NGL Vibe Stylized Interactive Pill Badge */}
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
                  className="w-3 h-3 rounded-full animate-pulse"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </div>

            {/* Bottom Meta & URL Label */}
            <div className="flex items-center justify-between w-full font-mono text-[13px] tracking-[0.2em] uppercase" style={{ color: textMuted }}>
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
