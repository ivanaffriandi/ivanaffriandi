'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, ArrowRight, Mail } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
  isIncomingMail?: boolean;
  sender?: string;
  subject?: string;
  snippet?: string;
  onClick?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

const cleanTextSnippet = (raw?: string) => {
  if (!raw) return '';
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length > 0) {
      playNotificationChime();
    }
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none font-sans">
      {toasts.map((toast) => {
        if (toast.isIncomingMail) {
          const previewText = cleanTextSnippet(toast.snippet || toast.text) || 'New message arrived';
          const senderInitial = (toast.sender || 'M').charAt(0).toUpperCase();

          return (
            <div
              key={toast.id}
              onClick={() => {
                if (toast.onClick) toast.onClick();
                onDismiss(toast.id);
              }}
              className="pointer-events-auto w-80 sm:w-96 bg-[var(--card-bg)]/95 dark:bg-[#16161a]/95 border border-black/10 dark:border-white/15 rounded-[24px] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl animate-toast apple-transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(37,99,235,0.25)] cursor-pointer group select-none relative ring-1 ring-black/5 dark:ring-white/10 space-y-2.5"
              title="Click to view email"
            >
              {/* Header: Sender Avatar, Name & Timestamp */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                    {senderInitial}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-[var(--text-primary)] block truncate">
                      {toast.sender || 'New Message'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Just now
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(toast.id);
                    }}
                    className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] apple-transition"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subject & Seamless Email Preview */}
              <div className="space-y-1 pl-1">
                <p className="text-[13px] font-extrabold text-blue-600 dark:text-blue-400 truncate">
                  {toast.subject || '(No Subject)'}
                </p>
                <p className="text-xs font-normal text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {previewText}
                </p>
              </div>

              {/* Action Hint */}
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] group-hover:text-blue-500 apple-transition pt-1 border-t border-[var(--border-subtle)]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-500" /> Tap to read full email
                </span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] transform group-hover:translate-x-1 apple-transition" />
              </div>
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-2xl text-xs font-semibold animate-toast apple-transition bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 border border-white/10 dark:border-black/10"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 dark:text-red-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />}

            <span className="max-w-[280px] leading-relaxed">{toast.text}</span>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
