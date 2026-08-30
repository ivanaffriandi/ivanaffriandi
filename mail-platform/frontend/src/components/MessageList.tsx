'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Paperclip, Inbox, Check, CheckCheck, Mail, MailOpen, Archive, Trash2, X,
  Loader2, ArrowDown, Sparkles, User, Layers, RotateCcw
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
  const text = `${m.sender_address || ''} ${m.sender_name || ''} ${m.subject || ''} ${m.snippet || ''}`.toLowerCase();
  return /digest|newsletter|promo|update|marketing|offer|no-reply|noreply|billing|receipt|support|daily|alert|announcement|linear\.app|stripe|github|medium|marginalian|google|resend|producthunt|biteship|the conversation|cloudflare/i.test(text);
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessageId,
  activeFolderType,
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

  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Auto fallback to 'all' if all messages are read and user was on 'unread'
  useEffect(() => {
    if (unreadCount === 0 && filter === 'unread') {
      setFilter('all');
    }
  }, [unreadCount, filter]);

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'personal') return !isPromotionMessage(m);
    if (filter === 'promotions') return isPromotionMessage(m);
    return true;
  });

  const isTrashOrSpam = activeFolderType === 'trash' || activeFolderType === 'spam';

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
        <div
          className="w-full flex items-center justify-center gap-2 overflow-hidden bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all duration-200"
          style={{ height: `${Math.max(pullDist, isPullRefreshing ? 42 : 0)}px` }}
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
        </div>
      )}

      {/* Header: Normal Filter Tabs OR Batch Action Toolbar */}
      {selectedIds.size > 0 ? (
        <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-blue-500/10 apple-transition">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="p-1 rounded-lg hover:bg-blue-500/10 apple-transition flex items-center cursor-pointer"
              title={isAllSelected ? 'Deselect All' : 'Select All'}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center apple-transition ${
                isAllSelected ? 'bg-blue-600 text-white shadow-2xs' : 'border-2 border-blue-600 bg-transparent'
              }`}>
                {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {selectedIds.size} selected
            </span>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-1">
            {isTrashOrSpam && (
              <button
                onClick={() => executeBatch('inbox')}
                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 apple-transition apple-active-scale cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Restore to Inbox"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Inbox</span>
              </button>
            )}
            <button
              onClick={() => executeBatch('read')}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 apple-transition apple-active-scale cursor-pointer"
              title="Mark as Read"
            >
              <MailOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => executeBatch('unread')}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 apple-transition apple-active-scale cursor-pointer"
              title="Mark as Unread"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            {!isTrashOrSpam && (
              <button
                onClick={() => executeBatch('archive')}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 apple-transition apple-active-scale cursor-pointer"
                title="Archive Selected"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => executeBatch('delete')}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 apple-transition apple-active-scale cursor-pointer"
              title={isTrashOrSpam ? "Delete Permanently" : "Delete Selected"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearSelection}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-bg)] apple-transition apple-active-scale ml-1 cursor-pointer"
              title="Cancel Selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-2.5 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]/50 gap-1.5 overflow-x-auto no-scrollbar">
          {/* Category Tabs Bar with Icons */}
          <div className="flex items-center bg-[var(--card-bg)]/90 backdrop-blur-xl p-0.5 rounded-full border border-[var(--card-border)] shadow-xs ring-1 ring-black/5 dark:ring-white/10 gap-0.5 relative shrink-0">
            {/* 1. ALL */}
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold apple-transition apple-active-scale cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
              title="All Messages"
            >
              <Layers className="w-3 h-3 stroke-[2.2]" />
              <span>All</span>
            </button>

            {/* 2. PERSONAL */}
            <button
              onClick={() => setFilter('personal')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold apple-transition apple-active-scale cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'personal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
              title="Personal Messages"
            >
              <User className="w-3 h-3 stroke-[2.2]" />
              <span>Personal</span>
            </button>

            {/* 3. PROMOTIONS */}
            <button
              onClick={() => setFilter('promotions')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold apple-transition apple-active-scale cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === 'promotions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
              title="Newsletters & Promotions"
            >
              <Sparkles className="w-3 h-3 stroke-[2.2]" />
              <span>Promotions</span>
            </button>

            {/* 4. UNREAD (Only rendered if unreadCount > 0) */}
            {unreadCount > 0 && (
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold apple-transition apple-active-scale cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
                title="Unread Messages"
              >
                <Mail className="w-3 h-3 stroke-[2.2]" />
                <span>Unread</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  filter === 'unread' ? 'bg-white/20 text-white' : 'bg-blue-500/15 text-blue-500'
                }`}>
                  {unreadCount}
                </span>
              </button>
            )}
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-semibold pr-1 font-sans shrink-0 whitespace-nowrap ml-auto">
            {filteredMessages.length}
          </span>
        </div>
      )}

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)] font-sans">No messages</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Your mailbox is empty</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = msg.id === selectedMessageId;
            const isChecked = selectedIds.has(msg.id);
            const isUnread = !msg.is_read;
            const displayName = msg.sender_name || msg.sender_address.split('@')[0];
            const initial = displayName.charAt(0).toUpperCase();
            const [colorFrom, colorTo] = getAvatarColors(displayName);
            const brandUrl = getBrandOrAvatarUrl(msg.sender_address, msg.sender_name);

            return (
              <button
                key={msg.id}
                onClick={() => {
                  if (selectedIds.size > 0) {
                    toggleSelectOne(msg.id, { stopPropagation: () => {} } as any);
                  } else {
                    onSelectMessage(msg.id);
                  }
                }}
                className={`w-full text-left px-3.5 py-2.5 h-[84px] rounded-2xl transition-all duration-100 group relative border cursor-pointer box-border flex items-center shrink-0 ${
                  isChecked
                    ? 'bg-blue-500/10 border-blue-500/40 text-[var(--text-primary)]'
                    : isSelected
                    ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-md ring-1 ring-white/20'
                    : isUnread
                    ? 'bg-blue-500/[0.05] dark:bg-[#171b24] border-blue-500/20 dark:border-blue-500/30 hover:bg-blue-500/[0.09] dark:hover:bg-[#1c222e] shadow-2xs'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="w-full flex items-center gap-3 min-w-0">
                  {/* Circular Avatar / Selection Checkbox Toggle */}
                  <div
                    onClick={(e) => toggleSelectOne(msg.id, e)}
                    className="w-9 h-9 shrink-0 relative cursor-pointer flex items-center justify-center"
                    title={isChecked ? 'Deselect' : 'Select'}
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
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Metadata (Fixed 3-line vertical flow for uniform card height) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {isUnread && (
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isSelected
                                ? 'bg-white shadow-xs'
                                : 'bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]'
                            }`}
                            title="Unread message"
                          />
                        )}
                        <span
                          className={`text-xs truncate leading-tight ${
                            isSelected
                              ? 'text-white font-bold'
                              : isUnread
                              ? 'text-[var(--text-primary)] font-black tracking-tight'
                              : 'text-[var(--text-secondary)] font-semibold'
                          }`}
                        >
                          {displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {msg.sender_address?.includes('ivanaffriandi.com') && (
                          msg.is_opened ? (
                            <span
                              className={`inline-flex items-center ${
                                isSelected ? 'text-emerald-200' : 'text-emerald-500 dark:text-emerald-400'
                              }`}
                              title={`Read by recipient (Opened ${msg.open_count || 1}x)`}
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center ${
                                isSelected ? 'text-blue-200' : 'text-[var(--text-muted)]'
                              }`}
                              title="Delivered"
                            >
                              <Check className="w-3 h-3" />
                            </span>
                          )
                        )}
                        <span
                          className={`text-[10px] shrink-0 ${
                            isSelected
                              ? 'text-blue-100 font-medium'
                              : isUnread
                              ? 'text-blue-600 dark:text-blue-400 font-black'
                              : 'text-[var(--text-muted)] font-medium'
                          }`}
                        >
                          {formatTime(msg.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-xs truncate leading-tight ${
                          isSelected
                            ? 'text-white font-bold'
                            : isUnread
                            ? 'text-[var(--text-primary)] font-bold'
                            : 'text-[var(--text-secondary)] font-normal'
                        }`}
                      >
                        {msg.subject || '(No Subject)'}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] truncate leading-tight ${
                        isSelected
                          ? 'text-blue-100'
                          : isUnread
                          ? 'text-[var(--text-secondary)] font-medium'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {msg.snippet
                        ? msg.snippet
                            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim() || '\u00A0'
                        : '\u00A0'}
                    </p>
                  </div>

                  {/* Actions & Icons - Fixed 24px slot so layout never shifts */}
                  <div className="w-6 flex flex-col items-center justify-center gap-1.5 shrink-0">
                    {msg.has_attachments && (
                      <Paperclip className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                    )}
                    {onToggleStar && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(msg.id, e);
                        }}
                        className={`p-1 rounded-full cursor-pointer transition-colors duration-100 ${
                          msg.is_starred
                            ? 'text-yellow-400 opacity-100'
                            : isSelected
                            ? 'text-blue-200 hover:text-white opacity-100'
                            : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-yellow-400'
                        }`}
                        title="Star message"
                      >
                        <Star className={`w-3.5 h-3.5 ${msg.is_starred ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
