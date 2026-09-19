'use client';

import React, { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { InstagramStoryTemplate, StoryPostData } from './InstagramStoryTemplate';
import { captureElementToPng, shareOrDownloadStory, ShareResult } from '@/utils/shareStory';

export interface InstagramShareButtonProps {
  post: StoryPostData;
  className?: string;
  variant?: 'mobile-circle' | 'dock-icon' | 'default' | 'pill' | 'minimal' | 'icon-only';
  label?: string;
  themeOverride?: 'stone' | 'ink';
  onShareComplete?: (result: ShareResult) => void;
  onError?: (error: unknown) => void;
}

/**
 * Native-feeling Share Button (Custom-tailored for Mobile)
 *
 * Captures the 1080x1920 editorial canvas (with hero photo and magazine typography)
 * and invokes navigator.share to open the Instagram Stories share sheet.
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
    setTimeout(() => setToastMessage(null), 4000);
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

      // 3. Fallback toast notification
      if (result.downloaded) {
        showToast(result.message || 'Image saved! You can now upload it to your IG Story.');
      } else if (result.shared) {
        showToast('Story ready to share on Instagram!');
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
    theme: themeOverride || post.theme || 'stone',
  };

  // Styles matching the app's existing mobile top navigation buttons & dock buttons
  const getButtonStyles = () => {
    switch (variant) {
      case 'mobile-circle':
        return 'inline-flex items-center justify-center w-[30px] h-[30px] min-w-[30px] min-h-[30px] rounded-full bg-[#1c1c1e] border border-white/15 text-white active:bg-[#111112] hover:border-white/30 transition-colors duration-150 cursor-pointer touch-manipulation select-none p-0';
      case 'dock-icon':
        return 'inline-flex items-center justify-center w-[28px] h-[28px] min-w-[28px] min-h-[28px] rounded-full bg-white dark:bg-white/10 text-neutral-900 dark:text-white border border-black/10 dark:border-white/10 shadow-sm active:scale-95 transition-all duration-150 cursor-pointer touch-manipulation select-none p-0';
      case 'pill':
        return 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider bg-[#181817] text-[#FAFAFA] dark:bg-[#F3F2EE] dark:text-[#181817] active:scale-98 transition-all cursor-pointer select-none';
      case 'minimal':
        return 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider border border-black/15 dark:border-white/15 text-neutral-800 dark:text-neutral-200 hover:border-black/40 cursor-pointer select-none';
      case 'icon-only':
      default:
        return 'inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#1c1c1e] text-white border border-white/15 hover:border-white/30 cursor-pointer select-none p-0';
    }
  };

  return (
    <>
      {/* ── Hidden Off-Screen Story Template (Pre-rendered for Snapshot) ── */}
      <InstagramStoryTemplate ref={storyRef} post={activePostData} />

      {/* ── Simple Share Icon Button ── */}
      <button
        type="button"
        onClick={handleShare}
        disabled={isGenerating}
        title="Share to Instagram Story"
        aria-label="Share to Instagram Story"
        className={`${getButtonStyles()} ${className}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {isGenerating ? (
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          /* Clean, standard iOS share icon matching the interface */
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        )}
        {label && <span className="ml-1.5">{label}</span>}
      </button>

      {/* ── Editorial Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 inset-x-4 mx-auto max-w-sm z-[99999] pointer-events-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-[#181817] text-[#FAF8F5] dark:bg-[#FAF8F5] dark:text-[#181817] rounded-xl shadow-2xl border border-white/10 dark:border-black/10 backdrop-blur-md">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 dark:bg-emerald-600/20 dark:text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <p className="text-[12px] font-sans leading-tight font-medium pr-1 flex-1">
                {toastMessage}
              </p>

              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="opacity-50 hover:opacity-100 p-1 text-current shrink-0"
                aria-label="Close"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
