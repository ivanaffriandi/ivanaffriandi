'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Reply, Forward, Star, Trash2, Archive,
  Paperclip, Download, MailOpen, Mail, X,
  ArrowLeft, Inbox
} from 'lucide-react';
import { Message, MessageDetail } from '@/types/mail';
import { getBrandOrAvatarUrl } from '@/lib/avatar';

interface MessageViewProps {
  message: Message | null;
  activeFolderType?: string;
  onReply?: () => void;
  onForward?: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onToggleStar: () => void;
  onMarkUnread?: () => void;
  onMoveToInbox?: () => void;
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
  activeFolderType,
  onReply,
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
  onMarkUnread,
  onMoveToInbox,
  onBack,
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

  const threadToDisplay: MessageDetail[] =
    message.thread_messages && message.thread_messages.length > 0
      ? [...message.thread_messages].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [message];

  const isMe =
    message.sender_address.toLowerCase().includes('ivanaffriandi') ||
    message.sender_address.toLowerCase().includes('hello@ivanaffriandi.com');
  const mainDisplayName = message.sender_name || message.sender_address.split('@')[0];
  const [mainCFrom, mainCTo] = getAvatarColors(mainDisplayName);
  const mainInitial = (mainDisplayName || 'U').charAt(0).toUpperCase();
  const mainBrandAvatar = getBrandOrAvatarUrl(message.sender_address, message.sender_name);

  const cleanSub = (message.subject || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanHtml = (message.body_html || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanPlain = (message.body_plain || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const isSubjectInBody = cleanSub.length >= 4 && (cleanHtml.includes(cleanSub) || cleanPlain.includes(cleanSub));

  return (
    <div className="h-full flex flex-col min-h-0 relative font-sans">
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl"
            onClick={() => setLightboxPhoto(null)}
          >
            {/* Top Floating Controls */}
            <div className="absolute top-5 right-5 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
              <a
                href={lightboxPhoto}
                download={lightboxFilename}
                className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer"
                title="Download Photo"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer"
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
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
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
          2. MAIN EMAIL DETAIL CONTAINER
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl shadow-none md:shadow-[0_12px_28px_rgba(0,0,0,0.06)] md:dark:shadow-[0_12px_28px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden min-h-0 relative font-sans">
        
        {/* ────────────────────────────────────────────────────────────────────────
            1. TOP HEADER BAR: Clean 1-line metadata row (NO duplicate subject)
            ──────────────────────────────────────────────────────────────────────── */}
        <div className="px-5 md:px-7 py-3.5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--card-bg)] flex items-center justify-between gap-4 z-10">
          
          {/* Left: 1 Single Line for Avatar + Sender Name + Sender Email + To Recipient */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="md:hidden p-1.5 -ml-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] apple-transition shrink-0"
                title="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Sender Avatar */}
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-xs text-white shadow-2xs shrink-0 relative ring-1 ring-black/5 dark:ring-white/10"
              style={{ background: `linear-gradient(135deg, ${mainCFrom}, ${mainCTo})` }}
            >
              <span className="select-none">{mainInitial}</span>
              {mainBrandAvatar && (
                <img
                  src={mainBrandAvatar}
                  alt={mainDisplayName}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
            </div>

            {/* Single Line Metadata Stack */}
            <div className="flex items-center gap-2 min-w-0 truncate font-sans text-xs">
              <span className="font-extrabold text-sm text-[var(--text-primary)] tracking-tight truncate shrink-0">
                {mainDisplayName}
              </span>
              {isMe && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                  YOU
                </span>
              )}
              <span className="text-[var(--text-muted)] truncate hidden sm:inline">
                · {message.sender_address}
              </span>
              <span className="text-[var(--text-muted)] truncate hidden md:inline">
                <span className="font-semibold text-[var(--text-secondary)]">to:</span> {message.recipient_to || 'me'}
              </span>
              {message.recipient_cc && (
                <span className="text-[var(--text-muted)] truncate hidden lg:inline">
                  · cc: {message.recipient_cc}
                </span>
              )}
            </div>
          </div>

          <div suppressHydrationWarning className="text-xs font-semibold text-[var(--text-muted)] shrink-0 font-sans">
            {new Date(message.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            2. SCROLLABLE EMAIL CONTENT CANVAS
            ────────────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 md:px-5 py-3 md:py-3.5 relative space-y-4">
          <div className="max-w-4xl mx-auto space-y-4 pb-20">
            {threadToDisplay.map((item, index) => {
              const itemImages = (item.attachments || []).filter(
                (att) => att.content_type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
              );
              const itemFiles = (item.attachments || []).filter(
                (att) => !att.content_type.startsWith('image/') && !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
              );

              return (
                <div
                  key={item.id || index}
                  className="w-full rounded-2xl md:rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#181a20] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-4 md:p-6 space-y-4 md:space-y-5 min-w-0 max-w-full overflow-hidden transition-all duration-200"
                >
                {index > 0 && (
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 text-xs text-[var(--text-muted)] font-sans">
                    <span className="font-bold text-[var(--text-primary)]">{item.sender_name || item.sender_address}</span>
                    <span>{new Date(item.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                )}

                {index === 0 && message.subject && !isSubjectInBody && (
                  <div className="space-y-1.5 border-b border-black/5 dark:border-white/10 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug font-sans break-words selection:bg-blue-500/20">
                        {message.subject}
                      </h1>
                      {threadToDisplay.length > 1 && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 border border-blue-500/20 font-sans">
                          {threadToDisplay.length} messages
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {itemImages.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-sans">
                      Photos & Attachments ({itemImages.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {itemImages.map((imgAtt) => {
                        const downloadUrl = `/api/v1/messages/attachments/${imgAtt.id}/download`;
                        return (
                          <div
                            key={imgAtt.id}
                            className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--bg-secondary)] shadow-xs group cursor-pointer aspect-video"
                            onClick={() => {
                              setLightboxPhoto(downloadUrl);
                              setLightboxFilename(imgAtt.filename);
                            }}
                          >
                            <a
                              href={downloadUrl}
                              download={imgAtt.filename}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 z-10"
                              title="Download Photo"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <img
                              src={downloadUrl}
                              alt={imgAtt.filename}
                              className="w-full h-full object-cover object-center select-none group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {itemFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {itemFiles.map((att) => {
                      const downloadUrl = `/api/v1/messages/attachments/${att.id}/download`;
                      return (
                        <a
                          key={att.id}
                          href={downloadUrl}
                          download={att.filename}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-black/10 dark:border-white/10 hover:border-blue-500/40 text-xs font-semibold text-[var(--text-primary)] apple-transition shadow-2xs group cursor-pointer"
                        >
                          <Paperclip className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500" />
                          <span className="truncate max-w-[200px]">{att.filename}</span>
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            ({(att.size_bytes / 1024).toFixed(0)} KB)
                          </span>
                          <Download className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 ml-1" />
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="w-full min-w-0 max-w-full overflow-x-auto">
                  {item.body_html ? (
                    <div
                      className="mail-content-container max-w-full min-w-0 overflow-x-auto font-sans leading-relaxed text-[15px] antialiased"
                      dangerouslySetInnerHTML={{ __html: item.body_html }}
                    />
                  ) : (
                    <div className="text-[15px] font-sans whitespace-pre-wrap leading-relaxed font-normal antialiased text-[var(--text-primary)] min-w-0 max-w-full overflow-x-auto selection:bg-blue-500/20">
                      {item.body_plain}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FLOATING ACTION PILLBAR DOCK (ALWAYS PINNED / STAYS IN VIEW AT BOTTOM)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-5 inset-x-0 mx-auto flex justify-center z-40 px-3">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="pointer-events-auto relative bg-white/80 dark:bg-[#14161e]/85 backdrop-blur-3xl saturate-180 border border-black/10 dark:border-white/15 rounded-full p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_22px_45px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-white/10"
        >
          {/* Move to Inbox (strictly only for spam and trash folders) */}
          {onMoveToInbox && (activeFolderType === 'trash' || activeFolderType === 'spam') && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onMoveToInbox}
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 apple-transition cursor-pointer"
              title="Move to Inbox"
            >
              <Inbox className="w-4 h-4 stroke-[2.2]" />
            </motion.button>
          )}

          {/* Reply blue pill button */}
          {onReply && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onReply}
              className="h-8 px-4 flex items-center justify-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 border border-white/20 backdrop-blur-xs cursor-pointer"
              title="Reply"
            >
              <Reply className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Reply</span>
            </motion.button>
          )}

          {/* Forward button */}
          {onForward && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onForward}
              className="h-8 px-3.5 flex items-center justify-center gap-1.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-100 text-xs font-bold border border-black/5 dark:border-white/10 shadow-2xs backdrop-blur-md apple-transition cursor-pointer"
              title="Forward message"
            >
              <Forward className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Forward</span>
            </motion.button>
          )}

          <div className="w-px h-4 bg-black/10 dark:bg-white/15 my-auto" />

          {/* Mark unread */}
          {onMarkUnread && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onMarkUnread}
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 apple-transition cursor-pointer"
              title="Mark as unread"
            >
              <Mail className="w-4 h-4 stroke-[2.2]" />
            </motion.button>
          )}

          {/* Star */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggleStar}
            className={`w-8 h-8 flex items-center justify-center rounded-full apple-transition cursor-pointer ${
              message.is_starred
                ? 'bg-yellow-500/15 text-yellow-500'
                : 'text-neutral-700 hover:text-yellow-500 dark:text-neutral-200 dark:hover:text-yellow-400 hover:bg-black/5 dark:hover:bg-white/15'
            }`}
            title="Star message"
          >
            <Star className={`w-4 h-4 stroke-[2.2] ${message.is_starred ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Archive */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onArchive}
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 apple-transition cursor-pointer"
            title="Archive message"
          >
            <Archive className="w-4 h-4 stroke-[2.2]" />
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:text-red-500 dark:text-neutral-200 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 apple-transition cursor-pointer"
            title="Delete message"
          >
            <Trash2 className="w-4 h-4 stroke-[2.2]" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  </div>
  );
};
