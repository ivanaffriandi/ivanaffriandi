'use client';

import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  X,
  Search,
  Mail,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { MessageSummary, SubscriptionItem } from '@/types/mail';

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: MessageSummary[];
  onFilterSender: (senderEmail: string) => void;
  onToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const NEWSLETTER_KEYWORDS = [
  'newsletter', 'digest', 'daily', 'weekly', 'monthly', 'updates', 'dispatch',
  'substack', 'theconversation', 'medium', 'github', 'producthunt', 'tldr',
  'morningbrew', 'hackernews', 'news', 'edition', 'bulletin', 'no-reply', 'noreply'
];

export const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  isOpen,
  onClose,
  messages,
  onFilterSender,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [unsubscribedMap, setUnsubscribedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mail_unsubscribed_senders');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return {};
  });

  const subscriptions = useMemo<SubscriptionItem[]>(() => {
    const grouped: Record<string, {
      sender_name: string;
      sender_address: string;
      latest_subject: string;
      latest_date: string;
      total_emails: number;
    }> = {};

    messages.forEach((msg) => {
      const email = msg.sender_address.toLowerCase();
      const name = msg.sender_name || email.split('@')[0];
      const isCandidate =
        NEWSLETTER_KEYWORDS.some((kw) => email.includes(kw) || name.toLowerCase().includes(kw) || msg.subject.toLowerCase().includes(kw)) ||
        messages.filter((m) => m.sender_address.toLowerCase() === email).length >= 1;

      if (!isCandidate) return;

      if (!grouped[email]) {
        grouped[email] = {
          sender_name: name,
          sender_address: msg.sender_address,
          latest_subject: msg.subject,
          latest_date: msg.date,
          total_emails: 1,
        };
      } else {
        grouped[email].total_emails += 1;
        if (new Date(msg.date) > new Date(grouped[email].latest_date)) {
          grouped[email].latest_date = msg.date;
          grouped[email].latest_subject = msg.subject;
        }
      }
    });

    return Object.values(grouped).map((item) => {
      const isUnsub = !!unsubscribedMap[item.sender_address.toLowerCase()];
      return {
        id: item.sender_address,
        sender_name: item.sender_name,
        sender_address: item.sender_address,
        latest_subject: item.latest_subject,
        latest_date: item.latest_date,
        total_emails: item.total_emails,
        is_unsubscribed: isUnsub,
        frequency: (item.total_emails > 5 ? 'daily' : item.total_emails > 2 ? 'weekly' : 'occasional') as 'daily' | 'weekly' | 'occasional',
      };
    }).sort((a, b) => new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime());
  }, [messages, unsubscribedMap]);

  const handleToggleUnsubscribe = (senderAddress: string) => {
    const key = senderAddress.toLowerCase();
    const current = !!unsubscribedMap[key];
    const updated = { ...unsubscribedMap, [key]: !current };
    setUnsubscribedMap(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('mail_unsubscribed_senders', JSON.stringify(updated));
    }

    if (!current) {
      onToast('success', `✓ Unsubscribed from ${senderAddress}`);
    } else {
      onToast('info', `Subscription reactivated for ${senderAddress}`);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const q = searchQuery.toLowerCase();
    return subscriptions.filter(
      (s) =>
        s.sender_name.toLowerCase().includes(q) ||
        s.sender_address.toLowerCase().includes(q) ||
        s.latest_subject.toLowerCase().includes(q)
    );
  }, [subscriptions, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Compact Popover anchored at bottom left beside calendar / sidebar */}
      <div
        className="fixed bottom-4 left-3 md:left-[270px] lg:left-[280px] z-50 w-76 sm:w-88 bg-[var(--card-bg)] text-[var(--text-primary)] rounded-2xl border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col max-h-[460px] animate-scale-up font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--card-bg)]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold tracking-tight">Subscriptions ({subscriptions.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini Search */}
        <div className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-color)] shrink-0">
          <div className="relative w-full">
            <Search className="w-3 h-3 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-blue-500/30 apple-transition"
            />
          </div>
        </div>

        {/* Compact Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[140px] max-h-[300px]">
          {filteredSubscriptions.length === 0 ? (
            <div className="h-24 flex flex-col items-center justify-center text-center p-3">
              <p className="text-[11px] font-bold text-[var(--text-muted)]">No subscriptions found</p>
            </div>
          ) : (
            filteredSubscriptions.map((sub) => {
              const initial = sub.sender_name.charAt(0).toUpperCase();
              return (
                <div
                  key={sub.id}
                  className={`p-2 rounded-xl border apple-transition flex items-center justify-between gap-2 ${
                    sub.is_unsubscribed
                      ? 'bg-[var(--bg-secondary)]/30 border-[var(--card-border)] opacity-60'
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs">
                      {initial}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                          {sub.sender_name}
                        </span>
                        {sub.is_unsubscribed && (
                          <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/10 text-amber-500">
                            Muted
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono truncate">
                        {sub.sender_address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onFilterSender(sub.sender_address);
                        onClose();
                      }}
                      className="p-1 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-[var(--text-primary)] text-[10px] font-medium apple-transition cursor-pointer"
                      title="View all emails from this publisher"
                    >
                      <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleUnsubscribe(sub.sender_address)}
                      className={`px-2 py-0.8 rounded-md text-[10px] font-bold apple-transition flex items-center gap-0.5 cursor-pointer ${
                        sub.is_unsubscribed
                          ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white'
                          : 'bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white'
                      }`}
                    >
                      {sub.is_unsubscribed ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Re-sub</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-2.5 h-2.5" />
                          <span>Unsub</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
