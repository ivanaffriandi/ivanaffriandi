'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Paperclip, Inbox, Check, Mail, MailOpen, Archive, Trash2, X,
  Loader2, ArrowDown, Tag, User, Layers, RotateCcw
} from 'lucide-react';
import { MessageSummary } from '@/types/mail';
import { getBrandOrAvatarUrl } from '@/lib/avatar';
import { sound } from '@/lib/sound';

interface MessageListProps {
  messages: MessageSummary[];
  selectedMessageId: string | null;
  activeFolderType?: string;
  onSelectMessage: (id: string) => void;
  onToggleStar?: (id: string, e: React.MouseEvent) => void;
  onRefresh?: () => void;
  onBatchAction?: (action: 'read' | 'unread' | 'star' | 'archive' | 'delete' | 'inbox', ids: string[]) => void;
}

const AVATAR_COLORS = [
  ['#3b82f6', '#1d4ed8'],
  ['#6366f1', '#4338ca'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
  ['#f59e0b', '#b45309'],
  ['#8b5cf6', '#6d28d9'],
  ['#ef4444', '#b91c1c'],
  ['#10b981', '#047857'],
];

function getAvatarColors(name: string) {
  const idx = (name || 'M').charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function isPromotionMessage(m: MessageSummary): boolean {
  const sender = (m.sender_address || '').toLowerCase();
  const name = (m.sender_name || '').toLowerCase();
  const subject = (m.subject || '').toLowerCase();
  const snippet = (m.snippet || '').toLowerCase();
  const fullText = `${sender} ${name} ${subject} ${snippet}`;

  // 1. Sender prefix triggers for automated / bulk / transactional
  const automatedPrefixes = /^(no-?reply|donotreply|notifications?|news(letter)?|marketing|promo(tions)?|updates?|billing|invoices?|support|alerts?|accounts?|security|digest|team|mailer|service|automated|orders?|shipping|system|deals?|offers?|contact|hello|info)@/i;
  if (automatedPrefixes.test(sender)) return true;

  // 2. Known service domains (tech, dev, media, fintech, commerce, social)
  const serviceDomains = /@(medium\.com|themarginalian\.org|github\.com|stripe\.com|google\.com|cloudflare\.com|producthunt\.com|biteship\.com|linear\.app|theconversation\.com|resend\.com|substack\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com|facebookmail\.com|instagram\.com|apple\.com|figma\.com|notion\.so|vercel\.com|amazon\.com|netflix\.com|spotify\.com|discord\.com|slack\.com|zoom\.us|openai\.com|anthropic\.com|canva\.com|loom\.com|grammarly\.com|coursera\.org|udemy\.com|duolingo\.com|dribbble\.com|behance\.net|pinterest\.com|reddit\.com|quora\.com|tiktok\.com|tokopedia\.com|shopee\.co\.id|gojek\.com|grab\.com|traveloka\.com|tiket\.com|blibli\.com|bukalapak\.com|bca\.co\.id|mandiri\.co\.id|bankjago\.com|jenius\.com|seabank\.co\.id|midtrans\.com|xendit\.co|mailerlite\.com|mailchimp\.com|sendgrid\.net|intercom-mail\.com|zendesk\.com)/i;
  if (serviceDomains.test(sender)) return true;

  // 3. Subject and Snippet Keywords for promotions, digests, system alerts, invoices, confirmations
  const promoKeywords = /\b(digest|newsletter|promo|promotions?|special offer|discount|coupon|voucher|sale|\d+%\s*off|limited time|free trial|webinar|weekly update|monthly update|release notes|receipt|invoice|order confirmation|tracking number|shipped|bank statement|verification code|security alert|reset password|sign-in|signed in|invitation to join|what's new|issue #\d+|edition #\d+|unsubscribe|manage preferences|view in browser|view online)\b/i;
  if (promoKeywords.test(subject) || promoKeywords.test(snippet)) return true;

  // 4. General match on full text
  return /digest|newsletter|promo|update|marketing|offer|no-reply|noreply|billing|receipt|support|daily|alert|announcement|linear\.app|stripe|github|medium|marginalian|google|resend|producthunt|biteship|the conversation|cloudflare/i.test(fullText);
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessageId,
  activeFolderType = 'inbox',
  onSelectMessage,
  onToggleStar,
  onRefresh,
  onBatchAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'personal' | 'promotions' | 'unread'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pullDist, setPullDist] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const isInbox = activeFolderType === 'inbox' || !activeFolderType;
  const isTrashOrSpam = activeFolderType === 'trash' || activeFolderType === 'spam';

  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Auto fallback to 'all' if all messages are read or if folder changes away from inbox while in personal/promotions
  useEffect(() => {
    if (unreadCount === 0 && filter === 'unread') {
      setFilter('all');
    }
    if (!isInbox && filter !== 'all') {
      setFilter('all');
    }
  }, [unreadCount, filter, isInbox]);

  const filteredMessages = messages.filter((m) => {
    if (!isInbox) return true;
    if (filter === 'unread') return !m.is_read;
    if (filter === 'personal') return !isPromotionMessage(m);
    if (filter === 'promotions') return isPromotionMessage(m);
    return true;
  });

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const executeBatch = (action: 'read' | 'unread' | 'star' | 'archive' | 'delete' | 'inbox') => {
    if (selectedIds.size === 0 || !onBatchAction) return;
    onBatchAction(action, Array.from(selectedIds));
    clearSelection();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startY) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) {
      const dampened = Math.min(diff * 0.45, 75);
      setPullDist(dampened);
    }
  };

  const handleTouchEnd = () => {
    if (pullDist > 45 && onRefresh && !isPullRefreshing) {
      setIsPullRefreshing(true);
      sound.playRefresh();
      onRefresh();
      setTimeout(() => {
        setIsPullRefreshing(false);
        setPullDist(0);
      }, 700);
    } else {
      setPullDist(0);
    }
    setStartY(0);
  };

  const isAllSelected = filteredMessages.length > 0 && selectedIds.size === filteredMessages.length;

  return (
    <div
      className="w-full h-full bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl flex flex-col overflow-hidden select-none shrink-0 shadow-none md:shadow-card apple-transition font-sans relative ring-1 ring-black/5 dark:ring-white/5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* iOS Pull-to-Refresh Indicator Banner */}
      {(pullDist > 0 || isPullRefreshing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: Math.max(pullDist, isPullRefreshing ? 42 : 0) }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full flex items-center justify-center gap-2 overflow-hidden bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all duration-200"
        >
          {isPullRefreshing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              <span>Refreshing mailbox...</span>
            </>
          ) : (
            <>
              <ArrowDown
                className={`w-4 h-4 transition-transform duration-200 stroke-[2.5] ${
                  pullDist > 45 ? 'rotate-180 text-blue-600' : 'text-blue-500'
                }`}
              />
              <span>{pullDist > 45 ? 'Release to refresh' : 'Pull down to refresh'}</span>
            </>
          )}
        </motion.div>
      )}

      {/* Header: Batch Action Toolbar OR Category Tabs (INBOX ONLY) */}
      <AnimatePresence mode="wait">
        {selectedIds.size > 0 ? (
          <motion.div
            key="batch-toolbar"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-blue-500/10"
          >
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSelectAll}
                className="p-1 rounded-lg hover:bg-blue-500/10 flex items-center cursor-pointer"
                title={isAllSelected ? 'Deselect All' : 'Select All'}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                  isAllSelected ? 'bg-blue-600 text-white shadow-2xs' : 'border-2 border-blue-600 bg-transparent'
                }`}>
                  {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </motion.button>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {selectedIds.size} selected
              </span>
            </div>

            {/* Batch Actions */}
            <div className="flex items-center gap-1">
              {isTrashOrSpam && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeBatch('inbox')}
                  className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Restore to Inbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Inbox</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => executeBatch('read')}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 cursor-pointer"
                title="Mark as Read"
              >
                <MailOpen className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => executeBatch('unread')}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 cursor-pointer"
                title="Mark as Unread"
              >
                <Mail className="w-3.5 h-3.5" />
              </motion.button>
              {!isTrashOrSpam && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => executeBatch('archive')}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 cursor-pointer"
                  title="Archive Selected"
                >
                  <Archive className="w-3.5 h-3.5" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => executeBatch('delete')}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 cursor-pointer"
                title={isTrashOrSpam ? "Delete Permanently" : "Delete Selected"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearSelection}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-bg)] ml-1 cursor-pointer"
                title="Cancel Selection"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        ) : isInbox ? (
          <motion.div
            key="category-toolbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-2.5 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]/50 gap-1.5 overflow-x-auto no-scrollbar"
          >
            {/* Category Segmented Controls (Inbox only) */}
            <div className="flex items-center bg-[var(--card-bg)]/90 backdrop-blur-xl p-0.5 rounded-full border border-[var(--card-border)] shadow-xs ring-1 ring-black/5 dark:ring-white/10 gap-0.5 relative shrink-0">
              
              {/* 1. ALL */}
              <button
                onClick={() => setFilter('all')}
                className={`relative px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shrink-0 z-10 transition-colors ${
                  filter === 'all' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="All Messages"
              >
                {filter === 'all' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Layers className="w-3 h-3 stroke-[2.2]" />
                <span>All</span>
              </button>

              {/* 2. PERSONAL */}
              <button
                onClick={() => setFilter('personal')}
                className={`relative px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shrink-0 z-10 transition-colors ${
                  filter === 'personal' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Personal Messages"
              >
                {filter === 'personal' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <User className="w-3 h-3 stroke-[2.2]" />
                <span>Personal</span>
              </button>

              {/* 3. PROMOTIONS with Tag icon */}
              <button
                onClick={() => setFilter('promotions')}
                className={`relative px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shrink-0 z-10 transition-colors ${
                  filter === 'promotions' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
                title="Newsletters & Promotions"
              >
                {filter === 'promotions' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-full shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Tag className="w-3 h-3 stroke-[2.2]" />
                <span>Promotions</span>
              </button>

              {/* 4. UNREAD (Only rendered if unreadCount > 0) */}
              {unreadCount > 0 && (
                <button
                  onClick={() => setFilter('unread')}
                  className={`relative px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shrink-0 z-10 transition-colors ${
                    filter === 'unread' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Unread Messages"
                >
                  {filter === 'unread' && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-blue-600 rounded-full shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Mail className="w-3 h-3 stroke-[2.2]" />
                  <span>Unread</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black transition-colors ${
                    filter === 'unread' ? 'bg-white/25 text-white' : 'bg-blue-500/15 text-blue-500'
                  }`}>
                    {unreadCount}
                  </span>
                </button>
              )}
            </div>

            <span className="text-[10px] text-[var(--text-muted)] font-semibold pr-1 font-sans shrink-0 whitespace-nowrap ml-auto">
              {filteredMessages.length}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {filteredMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)] font-sans">No messages</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">
              {filter === 'personal' ? 'No personal messages found' : filter === 'promotions' ? 'No promotions found' : 'Your mailbox is empty'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg, index) => {
              const isSelected = msg.id === selectedMessageId;
              const isChecked = selectedIds.has(msg.id);
              const isUnread = !msg.is_read;
              const displayName = msg.sender_name || msg.sender_address.split('@')[0];
              const initial = displayName.charAt(0).toUpperCase();
              const [colorFrom, colorTo] = getAvatarColors(displayName);
              const brandUrl = getBrandOrAvatarUrl(msg.sender_address, msg.sender_name);

              return (
                <motion.button
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.16, delay: Math.min(index * 0.02, 0.2) }}
                  whileHover={{ scale: 1.008 }}
                  whileTap={{ scale: 0.992 }}
                  onClick={() => {
                    if (selectedIds.size > 0) {
                      toggleSelectOne(msg.id, { stopPropagation: () => {} } as any);
                    } else {
                      onSelectMessage(msg.id);
                    }
                  }}
                  className={`w-full text-left px-3.5 py-2.5 h-[84px] rounded-2xl transition-colors group relative border cursor-pointer box-border flex items-center shrink-0 ${
                    isChecked
                      ? 'bg-blue-500/10 border-blue-500/40 text-[var(--text-primary)]'
                      : isSelected
                      ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-md ring-1 ring-white/20'
                      : isUnread
                      ? 'bg-[var(--card-bg)] border-[var(--card-border)] hover:bg-[var(--bg-secondary)] hover:border-black/10 dark:hover:border-white/10 text-[var(--text-primary)] shadow-2xs'
                      : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {/* Message Item Content */}
                  <div className="flex items-center gap-3 w-full min-w-0">
                    {/* Circular Avatar / Click-to-Select Toggle */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(msg.id, e);
                      }}
                      className="w-9 h-9 shrink-0 relative cursor-pointer flex items-center justify-center group/avatar"
                      title={isChecked ? 'Deselect message' : 'Select message'}
                    >
                      {isChecked ? (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm ring-2 ring-blue-500/30">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-xs text-white shadow-2xs ring-1 ring-black/5 dark:ring-white/10 relative"
                          style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
                        >
                          <span className="select-none">{initial}</span>
                          {brandUrl && (
                            <img
                              src={brandUrl}
                              alt={displayName}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                            />
                          )}
                          {/* Hover Checkmark Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        </div>
                      )}
                      {isUnread && !isChecked && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[var(--card-bg)] shadow-xs" />
                      )}
                    </div>

                    {/* Sender, Subject, Snippet */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate font-sans ${
                          isSelected ? 'text-white font-extrabold' : isUnread ? 'text-[var(--text-primary)] font-black' : 'text-[var(--text-primary)] font-semibold'
                        }`}>
                          {displayName}
                        </span>
                        <span className={`text-[10px] shrink-0 font-sans ${
                          isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'
                        }`}>
                          {formatTime(msg.date)}
                        </span>
                      </div>

                      <p className={`text-xs truncate font-sans leading-tight mb-0.5 ${
                        isSelected ? 'text-white/95 font-bold' : isUnread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)] font-normal'
                      }`}>
                        {msg.subject || '(No Subject)'}
                      </p>

                      <p className={`text-[11px] truncate font-sans leading-tight ${
                        isSelected ? 'text-white/70' : 'text-[var(--text-muted)]'
                      }`}>
                        {msg.snippet || 'No preview text'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
