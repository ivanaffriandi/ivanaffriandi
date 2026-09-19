'use client';

import React, { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InstagramStoryTemplate, StoryPostData } from './InstagramStoryTemplate';
import { captureElementToPng, shareOrDownloadStory, ShareResult } from '@/utils/shareStory';

export interface InstagramShareButtonProps {
  post: StoryPostData;
  className?: string;
  variant?: 'mobile-circle' | 'dock-icon' | 'default';
  label?: string;
  themeOverride?: 'stone' | 'ink';
  onShareComplete?: (result: ShareResult) => void;
  onError?: (error: unknown) => void;
}

/**
 * Minimalist iOS-style Share Button for Mobile
 * Matches the existing header/dock circular buttons 1:1 using explicit inline styles.
 */
export const InstagramShareButton: React.FC<InstagramShareButtonProps> = ({
  post,
  className = '',
  variant = 'mobile-circle',
  label,
  themeOverride,
  onShareComplete,
  onError,
}) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      const targetEl = storyRef.current;
      if (!targetEl) throw new Error('Story canvas not mounted');

      // 1. Capture off-screen template into crisp high-res PNG Data URL
      const dataUrl = await captureElementToPng(targetEl);

      // 2. Share via Web Share API or download fallback
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const result = await shareOrDownloadStory(dataUrl, post.title, slug || 'story');

      // 3. Feedback notification for sticker
      if (result.copied && !result.shared) {
        showToast('Sticker disalin! Buka IG Story lalu paste & geser sesuka kamu.');
      } else if (result.downloaded) {
        showToast(result.message || 'Sticker tersimpan! Kamu bisa paste & geser di IG Story.');
      } else if (result.shared) {
        showToast(result.message || 'Sticker siap! Bisa kamu geser & atur di IG Story.');
      }

      onShareComplete?.(result);
    } catch (err: unknown) {
      console.error('Failed to generate or share Instagram story:', err);
      showToast('Could not generate story image.');
      onError?.(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const activePostData: StoryPostData = {
    ...post,
    theme: themeOverride || post.theme || 'ink',
  };

  // Explicit inline styles matching mobile-search-btn or dock-icon-btn perfectly
  const isDock = variant === 'dock-icon';
  const size = isDock ? '28px' : '30px';

  return (
    <>
      {/* ── Hidden Off-Screen Story Template (Pre-rendered for Snapshot) ── */}
      <InstagramStoryTemplate ref={storyRef} post={activePostData} />

      {/* ── Seamless Circular Share Button (Matching Search / Dock Button 1:1) ── */}
      <button
        type="button"
        onClick={handleShare}
        disabled={isGenerating}
        title="Share to Instagram Story"
        aria-label="Share to Instagram Story"
        className={`${isDock ? 'dock-icon-btn' : 'mobile-search-btn'} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          boxSizing: 'border-box',
          backgroundColor: '#1c1c1e',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          borderRadius: '50%',
          padding: 0,
          cursor: isGenerating ? 'wait' : 'pointer',
          lineHeight: 1,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: 'none',
          opacity: isGenerating ? 0.6 : 1,
          transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
          flexShrink: 0,
        }}
      >
        {isGenerating ? (
          <svg
            style={{
              animation: 'spin 1s linear infinite',
              width: '12px',
              height: '12px',
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          /* Simple, clean iOS share icon with stroke identical to search icon */
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
      </button>

      {/* ── Native iOS-like Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '16px',
              right: '16px',
              maxWidth: '380px',
              margin: '0 auto',
              zIndex: 99999,
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(28, 28, 30, 0.95)',
                color: '#FAF8F5',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(48, 209, 88, 0.2)',
                  color: '#30D158',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.35, fontWeight: 500, flex: 1 }}>
                {toastMessage}
              </p>

              <button
                type="button"
                onClick={() => setToastMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
