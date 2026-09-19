'use client';

import React, { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InstagramStoryTemplate, StoryPostData } from './InstagramStoryTemplate';
import { captureElementToPng, shareOrDownloadStory, ShareResult } from '@/utils/shareStory';

export interface InstagramShareButtonProps {
  post: StoryPostData;
  className?: string;
  variant?: 'default' | 'pill' | 'minimal' | 'icon-only';
  label?: string;
  themeOverride?: 'stone' | 'ink';
  onShareComplete?: (result: ShareResult) => void;
  onError?: (error: unknown) => void;
}

/**
 * Modern Instagram Story Share Button
 *
 * Renders an off-screen wabi-sabi editorial template, snaps it to a 1080x1920 PNG,
 * triggers native mobile Web Share sheet (or falls back to instant download),
 * and displays an editorial toast notification.
 */
export const InstagramShareButton: React.FC<InstagramShareButtonProps> = ({
  post,
  className = '',
  variant = 'default',
  label = 'Share to Story',
  themeOverride,
  onShareComplete,
  onError,
}) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  const handleShare = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      const targetEl = storyRef.current;
      if (!targetEl) {
        throw new Error('Story template container is not mounted.');
      }

      // 1. Capture off-screen template into crisp high-res PNG Data URL
      const dataUrl = await captureElementToPng(targetEl);

      // 2. Share via Web Share API or download fallback
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const result = await shareOrDownloadStory(dataUrl, post.title, slug || 'journal-story');

      // 3. If fallback download was triggered, display the requested toast message
      if (result.downloaded) {
        showToast(result.message || 'Image saved! You can now upload it to your IG Story.');
      } else if (result.shared) {
        showToast('Story ready to share on Instagram!');
      }

      onShareComplete?.(result);
    } catch (err: unknown) {
      console.error('Failed to generate or share Instagram story:', err);
      showToast('Could not generate story image. Please try again.');
      onError?.(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Determine active theme for template
  const activePostData: StoryPostData = {
    ...post,
    theme: themeOverride || post.theme || 'stone',
  };

  // Button styles based on variant
  const getButtonStyles = () => {
    const base =
      'group relative inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    switch (variant) {
      case 'pill':
        return `${base} px-5 py-2.5 rounded-full bg-[#181817] text-[#FAFAFA] dark:bg-[#F3F2EE] dark:text-[#181817] hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md`;
      case 'minimal':
        return `${base} px-3 py-1.5 border border-black/15 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-black/40 dark:hover:border-white/40 rounded-sm`;
      case 'icon-only':
        return `${base} w-9 h-9 rounded-full border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-neutral-700 dark:text-neutral-300`;
      case 'default':
      default:
        return `${base} px-4 py-2 gap-2.5 rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20`;
    }
  };

  return (
    <>
      {/* ── Hidden Off-Screen Story Template ── */}
      <InstagramStoryTemplate ref={storyRef} post={activePostData} />

      {/* ── Interactive Trigger Button ── */}
      <button
        type="button"
        onClick={handleShare}
        disabled={isGenerating}
        aria-label="Share to Instagram Stories"
        className={`${getButtonStyles()} ${className}`}
      >
        {isGenerating ? (
          <>
            {/* Spinning Indicator */}
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {variant !== 'icon-only' && <span>Crafting Story...</span>}
          </>
        ) : (
          <>
            {/* Editorial Instagram / Camera Glyphs */}
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            {variant !== 'icon-only' && <span>{label}</span>}
          </>
        )}
      </button>

      {/* ── Editorial Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm"
          >
            <div className="flex items-center gap-3.5 px-4 py-3 bg-[#181817] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181817] rounded-lg shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-md">
              {/* Checkmark Icon */}
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-emerald-600/20 dark:text-emerald-700 flex items-center justify-center shrink-0">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <p className="text-[13px] font-sans leading-snug font-normal pr-2">
                {toastMessage}
              </p>

              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="ml-auto opacity-60 hover:opacity-100 p-1 transition-opacity text-current"
                aria-label="Dismiss notification"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
