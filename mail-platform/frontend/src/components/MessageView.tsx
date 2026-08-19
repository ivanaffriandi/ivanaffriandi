'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Reply, Forward, Star, Trash2, Archive,
  Paperclip, Download, MailOpen, FileText, X,
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon,
  RemoveFormatting, ArrowUp, Loader2, Maximize2, Check,
  CornerDownRight, CheckCircle2
} from 'lucide-react';
import { Message, MessageDetail } from '@/types/mail';
import { getBrandOrAvatarUrl } from '@/lib/avatar';
import { sendMessage } from '@/lib/api';
import { sound } from '@/lib/sound';

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

const SUGGESTED_WORDS = ['Thanks,', 'Sounds good,', 'Let me know', 'Best regards,', 'Looking forward to it'];

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

  // Inline Reply States
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyAttachments, setReplyAttachments] = useState<{ filename: string; content_type: string; data_base64: string; size_bytes: number }[]>([]);
  const [localThread, setLocalThread] = useState<MessageDetail[]>([]);

  const replyEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  // Synchronize local thread when message changes
  useEffect(() => {
    if (message) {
      if (message.thread_messages && message.thread_messages.length > 0) {
        const sorted = [...message.thread_messages].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setLocalThread(sorted);
      } else {
        setLocalThread([message]);
      }
    } else {
      setLocalThread([]);
    }
  }, [message?.id, message?.thread_messages]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFormatDoc = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    replyEditorRef.current?.focus();
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      handleFormatDoc('createLink', url);
    }
  };

  const insertWord = (word: string) => {
    if (!replyEditorRef.current) return;
    replyEditorRef.current.focus();
    document.execCommand('insertText', false, word + ' ');
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1] || '';
        setReplyAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content_type: file.type || 'application/octet-stream',
            data_base64: base64Data,
            size_bytes: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendInlineReply = async () => {
    if (!message || !replyEditorRef.current) return;
    const bodyHtml = replyEditorRef.current.innerHTML.trim();
    const bodyPlain = replyEditorRef.current.innerText.trim();
    if (!bodyPlain && !bodyHtml && replyAttachments.length === 0) return;

    setIsSendingReply(true);
    try {
      const cleanSub = (message.subject || '').trim();
      const subject = /^re:\s*/i.test(cleanSub) ? cleanSub : `Re: ${cleanSub}`;
      const toRecipient = message.sender_address;

      await sendMessage({
        to: [toRecipient],
        subject,
        body_plain: bodyPlain,
        body_html: bodyHtml || `<p>${bodyPlain}</p>`,
        in_reply_to: message.message_id_header || message.id,
        attachments: replyAttachments.map((a) => ({
          filename: a.filename,
          content_type: a.content_type,
          data_base64: a.data_base64,
        })),
      });

      // Optimistically append sent message to thread stream
      const optimisticMsg: MessageDetail = {
        id: 'opt_' + Date.now(),
        thread_id: message.thread_id,
        mailbox_id: message.mailbox_id,
        sender_name: 'Ivan Affriandi',
        sender_address: 'hello@ivanaffriandi.com',
        recipient_to: toRecipient,
        subject,
        date: new Date().toISOString(),
        body_plain: bodyPlain,
        body_html: bodyHtml || `<p>${bodyPlain}</p>`,
        is_read: true,
        is_starred: false,
        has_attachments: replyAttachments.length > 0,
        spam_score: 0.0,
        spam_status: 'ham',
        attachments: replyAttachments.map((a, idx) => ({
          id: 'att_' + idx,
          filename: a.filename,
          content_type: a.content_type,
          size_bytes: a.size_bytes,
          is_inline: false,
          checksum_sha256: '',
        })),
      };

      setLocalThread((prev) => [...prev, optimisticMsg]);

      // Reset editor
      if (replyEditorRef.current) replyEditorRef.current.innerHTML = '';
      setReplyAttachments([]);

      sound.playSend();
      if (onReplySuccess) {
        onReplySuccess({ to: toRecipient, subject });
      }

      setTimeout(() => {
        bottomScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to send inline reply:', err);
      alert(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
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

  const threadToDisplay = localThread.length > 0 ? localThread : [message];

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
      <div className="flex-1 bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl shadow-none md:shadow-[0_12px_28px_rgba(0,0,0,0.06)] md:dark:shadow-[0_12px_28px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden min-h-0 apple-transition ring-0 md:ring-1 md:ring-black/5 md:dark:ring-white/10 relative">
        
        {/* Email Subject Header Row */}
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--card-bg)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-black text-[var(--text-primary)] tracking-tight leading-snug truncate">
              {message.subject || '(No Subject)'}
            </h1>
            {threadToDisplay.length > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] shrink-0 border border-blue-500/20">
                {threadToDisplay.length} messages
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleStar}
              className={`p-1.5 rounded-lg apple-transition cursor-pointer ${
                message.is_starred ? 'text-yellow-400 bg-yellow-400/10' : 'text-[var(--text-muted)] hover:text-yellow-400'
              }`}
              title="Star"
            >
              <Star className={`w-4 h-4 ${message.is_starred ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onArchive}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] apple-transition cursor-pointer"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 apple-transition cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────────────
            3. SCROLLABLE CONVERSATION THREAD STREAM (Smooth Single Scroll)
            ────────────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 md:px-7 py-5 space-y-6">
          
          {threadToDisplay.map((item, index) => {
            const isMe = item.sender_address.toLowerCase().includes('ivanaffriandi') || item.sender_address.toLowerCase().includes('hello@ivanaffriandi.com');
            const itemDisplayName = item.sender_name || item.sender_address.split('@')[0];
            const [cFrom, cTo] = getAvatarColors(itemDisplayName);
            const itemInitial = (itemDisplayName || 'U').charAt(0).toUpperCase();
            const itemBrandAvatar = getBrandOrAvatarUrl(item.sender_address, item.sender_name);

            const itemImages = (item.attachments || []).filter(
              (att) => att.content_type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
            );
            const itemFiles = (item.attachments || []).filter(
              (att) => !att.content_type.startsWith('image/') && !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.filename)
            );

            return (
              <div
                key={item.id || index}
                className={`flex flex-col space-y-3 pb-5 ${
                  index !== threadToDisplay.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                }`}
              >
                {/* Sender Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0 relative"
                      style={{ background: `linear-gradient(135deg, ${cFrom}, ${cTo})` }}
                    >
                      <span className="select-none">{itemInitial}</span>
                      {itemBrandAvatar && (
                        <img
                          src={itemBrandAvatar}
                          alt={itemDisplayName}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                        {itemDisplayName}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400">
                          You
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)] font-mono truncate hidden sm:inline">
                        &lt;{item.sender_address}&gt;
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">
                    {new Date(item.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {/* Recipient info if multiple */}
                {item.recipient_to && (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    <span className="font-semibold">to:</span> {item.recipient_to}
                    {item.recipient_cc ? `, cc: ${item.recipient_cc}` : ''}
                  </div>
                )}

                {/* Image Attachments */}
                {itemImages.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {itemImages.map((imgAtt) => {
                      const downloadUrl = `/api/v1/messages/attachments/${imgAtt.id}/download`;
                      return (
                        <div
                          key={imgAtt.id}
                          className="relative rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--bg-secondary)] shadow-sm max-w-xl group cursor-pointer"
                          onClick={() => {
                            setLightboxPhoto(downloadUrl);
                            setLightboxFilename(imgAtt.filename);
                          }}
                        >
                          <a
                            href={downloadUrl}
                            download={imgAtt.filename}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 z-10"
                            title="Download Photo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <img
                            src={downloadUrl}
                            alt={imgAtt.filename}
                            className="w-full h-auto max-h-[360px] object-cover object-center select-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* File Attachments */}
                {itemFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {itemFiles.map((att) => {
                      const downloadUrl = `/api/v1/messages/attachments/${att.id}/download`;
                      return (
                        <a
                          key={att.id}
                          href={downloadUrl}
                          download={att.filename}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-blue-500/40 text-xs font-semibold text-[var(--text-primary)] apple-transition shadow-2xs group cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500" />
                          <span className="truncate max-w-[160px]">{att.filename}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            ({(att.size_bytes / 1024).toFixed(0)} KB)
                          </span>
                          <Download className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 ml-0.5" />
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* Email Body Content */}
                <div className="mail-adaptive-sheet pt-1">
                  {item.body_html ? (
                    <div
                      className="max-w-none font-sans leading-[1.75] mail-content-body text-[14.5px] antialiased tracking-[0.01em]"
                      dangerouslySetInnerHTML={{ __html: item.body_html }}
                    />
                  ) : (
                    <div className="text-[14.5px] font-sans whitespace-pre-wrap leading-[1.7] font-normal antialiased tracking-[0.01em]">
                      {item.body_plain}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomScrollRef} />

          {/* ──────────────────────────────────────────────────────────────────────────
              4. REFINED SEAMLESS INLINE REPLY COMPOSER (Slack/Apple Mail Style)
              ────────────────────────────────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
            <div className="w-full bg-[var(--bg-secondary)]/60 dark:bg-[#18181b]/90 border border-[var(--card-border)] rounded-2xl md:rounded-3xl p-3.5 md:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-3 apple-transition">
              
              {/* Header with Recipient & Maximize to Full Modal */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium truncate">
                  <CornerDownRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Replying to <span className="font-bold text-[var(--text-primary)]">{message.sender_name || message.sender_address}</span></span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={onReply}
                    className="p-1 rounded-lg hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
                    title="Pop out to floating composer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-0.5 text-[var(--text-secondary)] overflow-x-auto no-scrollbar pb-1 border-b border-[var(--border-subtle)]/70">
                <button
                  type="button"
                  onClick={() => handleFormatDoc('bold')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatDoc('italic')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatDoc('underline')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-[var(--border-subtle)] mx-1" />
                <button
                  type="button"
                  onClick={() => handleFormatDoc('insertUnorderedList')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatDoc('insertOrderedList')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Insert Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormatDoc('removeFormat')}
                  className="p-1.5 rounded-lg hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)] apple-transition"
                  title="Clear Formatting"
                >
                  <RemoveFormatting className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Contenteditable Rich Area */}
              <div
                ref={replyEditorRef}
                contentEditable
                role="textbox"
                aria-multiline="true"
                className="w-full min-h-[90px] md:min-h-[120px] max-h-[220px] overflow-y-auto p-2.5 text-xs text-[var(--text-primary)] focus:outline-none leading-relaxed font-sans bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] empty:before:content-['Write_your_reply_here...'] empty:before:text-[var(--text-muted)]"
              />

              {/* Attached Files Preview */}
              {replyAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {replyAttachments.map((a, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[11px] font-semibold text-[var(--text-primary)]"
                    >
                      <Paperclip className="w-3 h-3 text-blue-500" />
                      <span className="truncate max-w-[140px]">{a.filename}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-[var(--text-muted)] hover:text-red-500 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Smart Suggestion Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {SUGGESTED_WORDS.map((w, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => insertWord(w)}
                      className="px-2.5 py-1 rounded-full bg-[var(--card-bg)] hover:bg-blue-500/10 hover:text-blue-600 text-[var(--text-secondary)] text-[11px] font-semibold border border-[var(--card-border)] whitespace-nowrap shrink-0 apple-transition cursor-pointer"
                    >
                      {w}
                    </motion.button>
                  ))}
                </div>

                {/* Right controls: Attachment & Send */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAttachFiles}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--card-border)] apple-transition cursor-pointer"
                    title="Attach Files"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendInlineReply}
                    disabled={isSendingReply}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 apple-transition cursor-pointer"
                    title="Send Reply (Cmd+Enter)"
                  >
                    {isSendingReply ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Reply</span>
                        <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
