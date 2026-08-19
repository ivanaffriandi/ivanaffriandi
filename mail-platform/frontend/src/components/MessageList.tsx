'use client';

import React, { useState } from 'react';
import {
  Star, Paperclip, Inbox, Check, Mail, MailOpen, Archive, Trash2, X,
  Loader2, ArrowDown
} from 'lucide-react';
import { MessageSummary } from '@/types/mail';
import { getBrandOrAvatarUrl } from '@/lib/avatar';
import { sound } from '@/lib/sound';

interface MessageListProps {
  messages: MessageSummary[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onToggleStar?: (id: string, e: React.MouseEvent) => void;
  onRefresh?: () => void;
  onBatchAction?: (action: 'read' | 'unread' | 'star' | 'archive' | 'delete', ids: string[]) => void;
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

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  onToggleStar,
  onRefresh,
  onBatchAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pullDist, setPullDist] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'starred') return m.is_starred;
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

  const executeBatch = (action: 'read' | 'unread' | 'star' | 'archive' | 'delete') => {
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
      className="w-full h-full bg-[var(--card-bg)] border-0 md:border border-[var(--card-border)] rounded-none md:rounded-3xl flex flex-col overflow-hidden select-none shrink-0 shadow-none md:shadow-card apple-transition font-sans relative"
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
            <button
              onClick={() => executeBatch('archive')}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-500/15 apple-transition apple-active-scale cursor-pointer"
              title="Archive Selected"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => executeBatch('delete')}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 apple-transition apple-active-scale cursor-pointer"
              title="Delete Selected"
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
        <div className="px-3.5 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]/50 gap-2">
          {/* iOS Floating Pill Style Filter Control */}
          <div className="flex items-center bg-[var(--card-bg)]/90 backdrop-blur-xl p-1 rounded-full border border-[var(--card-border)] shadow-xs ring-1 ring-black/5 dark:ring-white/10 gap-0.5 relative shrink-0">
            {(['all', 'unread', 'starred'] as const).map((tabKey) => {
              const isActive = filter === tabKey;
              const label = tabKey === 'all' ? 'All' : tabKey === 'unread' ? 'Unread' : 'Starred';
              return (
                <button
                  key={tabKey}
                  onClick={() => setFilter(tabKey)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold apple-transition apple-active-scale cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold pr-1 font-sans shrink-0 whitespace-nowrap">
            {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
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
                className={`w-full text-left px-3.5 py-2.5 h-[84px] rounded-2xl transition-colors duration-100 group relative border cursor-pointer box-border flex items-center shrink-0 ${
                  isChecked
                    ? 'bg-blue-500/10 border-blue-500/40 text-[var(--text-primary)]'
                    : isSelected
                    ? 'bg-blue-600 dark:bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)]'
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
                      <span className={`text-xs font-bold truncate leading-tight ${
                        isSelected ? 'text-white' : !msg.is_read ? 'text-[var(--text-primary)] font-extrabold' : 'text-[var(--text-secondary)]'
                      }`}>
                        {displayName}
                      </span>
                      <span className={`text-[10px] shrink-0 font-medium ${
                        isSelected ? 'text-blue-100' : 'text-[var(--text-muted)]'
                      }`}>
                        {formatTime(msg.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs truncate font-medium leading-tight ${
                        isSelected ? 'text-white font-bold' : !msg.is_read ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'
                      }`}>
                        {msg.subject || '(No Subject)'}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate leading-tight ${
                      isSelected ? 'text-blue-100' : 'text-[var(--text-muted)]'
                    }`}>
                      {msg.snippet || '\u00A0'}
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
