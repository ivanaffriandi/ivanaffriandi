'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Reply, Forward, Star, Trash2, Archive,
  Paperclip, Download, MailOpen, FileText, X
} from 'lucide-react';
import { Message } from '@/types/mail';
import { getBrandOrAvatarUrl } from '@/lib/avatar';

interface MessageViewProps {
  message: Message | null;
  onReply?: () => void;
  onForward?: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onToggleStar: () => void;
  onMarkUnread?: () => void;
  onReplySuccess?: (info: { to: string; subject: string }) => void;
  onBack?: () => void;
}

const AVATAR_PALETTES = [
  ['#3b82f6', '#1d4ed8'],
  ['#6366f1', '#4338ca'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
  ['#f59e0b', '#b45309'],
  ['#8b5cf6', '#6d28d9'],
];

const getAvatarColors = (name: string) => {
  let hash = 0;
  for (let i = 0; i < (name || 'a').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
};

export const MessageView: React.FC<MessageViewProps> = ({
  message,
  onReply,
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
  onReplySuccess,
}) => {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [lightboxFilename, setLightboxFilename] = useState<string>('image.png');

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const imageAttachments = (message?.attachments || []).filter(
    (att) =>
      att.content_type.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
  );

  const otherAttachments = (message?.attachments || []).filter(
    (att) =>
      !att.content_type.startsWith('image/') &&
      !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
  );

  const handleOpenReply = () => {
    onReply?.();
  };

  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl shadow-none md:shadow-[0_12px_28px_rgba(0,0,0,0.06)] md:dark:shadow-[0_12px_28px_rgba(0,0,0,0.3)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 text-[var(--text-muted)] border border-[var(--card-border)] shadow-xs">
          <MailOpen className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="font-extrabold text-base text-[var(--text-primary)] mb-1 font-sans">
          No Message Selected
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-xs font-normal leading-relaxed font-sans">
          Select a message from the list to view its complete content and conversation thread.
        </p>
      </div>
    );
  }

  const displayName = message.sender_name || message.sender_address.split('@')[0];
  const [colorFrom, colorTo] = getAvatarColors(displayName);
  const initial = (displayName || 'U').charAt(0).toUpperCase();
  const brandAvatar = getBrandOrAvatarUrl(message.sender_address, message.sender_name);

  return (
    <div className="h-full flex flex-col min-h-0 relative">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. FULLSCREEN MINIMALIST FLOATING LIGHTBOX MODAL
          ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl"
            onClick={() => setLightboxPhoto(null)}
          >
            {/* Top Floating Controls */}
            <div className="absolute top-5 right-5 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
              <a
                href={lightboxPhoto}
                download={lightboxFilename}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Centered Image */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="max-w-[92vw] max-h-[88vh] flex items-center justify-center relative select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxPhoto}
                alt={lightboxFilename}
                className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MAIN EMAIL DETAIL CARD CONTAINER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl shadow-none md:shadow-[0_12px_28px_rgba(0,0,0,0.06)] md:dark:shadow-[0_12px_28px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden min-h-0 apple-transition ring-0 md:ring-1 md:ring-black/5 md:dark:ring-white/10 relative">
        
        {/* Desktop Sender Profile & Status Row */}
        <div className="hidden md:flex px-5 py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-secondary)]/40 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0 ring-1 ring-black/5 dark:ring-white/10 relative"
              style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
            >
              <span className="select-none">{initial}</span>
              {brandAvatar && (
                <img
                  src={brandAvatar}
                  alt={displayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-[var(--text-primary)] truncate leading-tight">
                {displayName}
              </span>
              <span className="text-xs text-[var(--text-muted)] truncate font-normal leading-tight">
                {message.sender_address}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[var(--text-muted)] font-medium font-sans">
              {new Date(message.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        {/* Email Subject Row - Clean & Proportional + Paper Mode Toggle (Icon-Only) */}
        <div className="px-4 md:px-6 py-2.5 md:py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--card-bg)] flex items-center justify-between gap-3">
          <h1 className="text-base md:text-lg font-black text-[var(--text-primary)] tracking-tight leading-snug truncate flex-1 min-w-0">
            {message.subject || '(No Subject)'}
          </h1>

        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            3. SCROLLABLE EMAIL BODY (No artificial gaps, smooth flow)
            ────────────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 md:px-6 py-3.5 md:py-4 pb-28 md:pb-28 bg-[var(--card-bg)] flex flex-col space-y-3">
          
          {/* Frameless Image Attachments (Clean, Top-Right Floating Download Icon, Lightbox Click) */}
          {imageAttachments.length > 0 && (
            <div className="space-y-3">
              {imageAttachments.map((imgAtt, idx) => {
                const downloadUrl = `/api/v1/messages/attachments/${imgAtt.id}/download`;
                return (
                  <motion.div
                    key={imgAtt.id || idx}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-[var(--card-border)] bg-[var(--bg-secondary)] shadow-sm max-w-2xl group cursor-pointer"
                    onClick={() => {
                      setLightboxPhoto(downloadUrl);
                      setLightboxFilename(imgAtt.filename);
                    }}
                  >
                    {/* Top-Right Minimalist Floating Download Icon */}
                    <a
                      href={downloadUrl}
                      download={imgAtt.filename}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 z-10"
                      title="Download Photo"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Frameless Image */}
                    <img
                      src={downloadUrl}
                      alt={imgAtt.filename}
                      className="w-full h-auto max-h-[420px] object-cover object-center select-none"
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Other File Attachments */}
          {otherAttachments.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-2">
                {otherAttachments.map((att) => {
                  const downloadUrl = `/api/v1/messages/attachments/${att.id}/download`;
                  return (
                    <motion.a
                      key={att.id}
                      href={downloadUrl}
                      download={att.filename}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-blue-500/40 text-xs font-semibold text-[var(--text-primary)] apple-transition shadow-2xs group cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500" />
                      <span className="truncate max-w-[160px]">{att.filename}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        ({(att.size_bytes / 1024).toFixed(0)} KB)
                      </span>
                      <Download className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 ml-0.5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email Message Content Body - Intelligent Adaptive Theme Engine */}
          <div className="mail-adaptive-sheet">
            {message.body_html ? (
              <div
                className="max-w-none font-sans leading-[1.75] mail-content-body text-[14.5px] antialiased tracking-[0.01em]"
                dangerouslySetInnerHTML={{ __html: message.body_html }}
              />
            ) : (
              <div className="text-[14.5px] font-sans whitespace-pre-wrap leading-[1.7] font-normal antialiased tracking-[0.01em]">
                {message.body_plain}
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            4. FLOATING ACTION DOCK (Symmetrical, Pixel-Perfect Centered)
            ────────────────────────────────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-4 inset-x-0 mx-auto flex justify-center z-40 px-3">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-[var(--card-bg)]/90 dark:bg-[#1c1c1f]/90 backdrop-blur-2xl border border-[var(--card-border)] rounded-full p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(0,0,0,0.22)] ring-1 ring-black/5 dark:ring-white/10"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenReply}
              className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reply</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onForward}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] apple-transition cursor-pointer"
              title="Forward"
            >
              <Forward className="w-4 h-4" />
            </motion.button>

            <div className="w-px h-4 bg-[var(--border-subtle)] my-auto opacity-70" />

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleStar}
              className={`w-8 h-8 flex items-center justify-center rounded-full apple-transition cursor-pointer ${
                message.is_starred
                  ? 'bg-yellow-500/15 text-yellow-400'
                  : 'text-[var(--text-muted)] hover:text-yellow-400 hover:bg-[var(--bg-secondary)]'
              }`}
              title="Star message"
            >
              <Star className={`w-4 h-4 ${message.is_starred ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onArchive}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] apple-transition cursor-pointer"
              title="Archive message"
            >
              <Archive className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onDelete}
              className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:bg-red-500/15 apple-transition cursor-pointer"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
