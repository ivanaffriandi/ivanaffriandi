'use client';

import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  ExternalLink,
  Ban,
  CheckCircle2,
  Search,
  Mail,
  Calendar,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { MessageSummary, SubscriptionItem } from '@/types/mail';

interface SubscriptionsViewProps {
  messages: MessageSummary[];
  onFilterSender: (senderEmail: string) => void;
  onRefresh: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

// Known newsletter patterns / signatures
const NEWSLETTER_KEYWORDS = [
  'newsletter', 'digest', 'daily', 'weekly', 'monthly', 'updates', 'dispatch',
  'substack', 'theconversation', 'medium', 'github', 'producthunt', 'tldr',
  'morningbrew', 'hackernews', 'news', 'edition', 'bulletin', 'no-reply', 'noreply'
];

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  messages,
  onFilterSender,
  onRefresh,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [unsubscribedMap, setUnsubscribedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mail_unsubscribed_senders');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch { /* ignore */ }
      }
    }
    return {};
  });

  // Extract / group subscriptions from messages
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
      const isNewsletterCandidate =
        NEWSLETTER_KEYWORDS.some((kw) => email.includes(kw) || name.toLowerCase().includes(kw) || msg.subject.toLowerCase().includes(kw)) ||
        messages.filter(m => m.sender_address.toLowerCase() === email).length >= 1;

      if (!isNewsletterCandidate) return;

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
      onToast('success', `✓ Successfully unsubscribed from ${senderAddress}. New emails will be auto-muted.`);
    } else {
      onToast('info', `Subscription reactivated for ${senderAddress}`);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.sender_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.latest_subject.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterTab === 'active') return !sub.is_unsubscribed;
      if (filterTab === 'unsubscribed') return sub.is_unsubscribed;
      return true;
    });
  }, [subscriptions, searchQuery, filterTab]);

  const activeCount = subscriptions.filter(s => !s.is_unsubscribed).length;
  const unsubCount = subscriptions.filter(s => s.is_unsubscribed).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden shadow-card apple-transition font-sans">
      {/* ── Top Header Bar ── */}
      <div className="p-4 md:p-6 border-b border-[var(--border-subtle)] flex flex-col gap-4 bg-[var(--card-bg)] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Subscriptions &amp; Newsletters
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Manage your recurring newsletters, publications, and mailing list subscriptions in one place.
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] apple-transition shrink-0 cursor-pointer"
            title="Rescan Mailbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── Summary Metric Pills ── */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={() => setFilterTab('all')}
            className={`p-3 rounded-2xl border text-left apple-transition cursor-pointer ${
              filterTab === 'all'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                : 'bg-[var(--bg-color)] border-[var(--card-border)] text-[var(--text-secondary)] hover:border-blue-500/20'
            }`}
          >
            <span className="text-[11px] font-semibold block text-[var(--text-muted)]">Total Discovered</span>
            <span className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-0.5 block">{subscriptions.length}</span>
          </button>

          <button
            onClick={() => setFilterTab('active')}
            className={`p-3 rounded-2xl border text-left apple-transition cursor-pointer ${
              filterTab === 'active'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                : 'bg-[var(--bg-color)] border-[var(--card-border)] text-[var(--text-secondary)] hover:border-emerald-500/20'
            }`}
          >
            <span className="text-[11px] font-semibold block text-[var(--text-muted)]">Active Subscriptions</span>
            <span className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-0.5 block">{activeCount}</span>
          </button>

          <button
            onClick={() => setFilterTab('unsubscribed')}
            className={`p-3 rounded-2xl border text-left apple-transition cursor-pointer ${
              filterTab === 'unsubscribed'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-[var(--bg-color)] border-[var(--card-border)] text-[var(--text-secondary)] hover:border-amber-500/20'
            }`}
          >
            <span className="text-[11px] font-semibold block text-[var(--text-muted)]">Unsubscribed / Muted</span>
            <span className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-0.5 block">{unsubCount}</span>
          </button>
        </div>

        {/* ── Search Input ── */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search newsletters, publishers, or domains..."
            className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl pl-9 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 apple-transition"
          />
        </div>
      </div>

      {/* ── Scrollable Subscription Cards List ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 min-h-0 bg-[var(--bg-color)]">
        {filteredSubscriptions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)]">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] mb-3">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">No subscriptions found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
              {searchQuery ? 'Try adjusting your search query.' : 'As you receive newsletters and recurring dispatches, they will automatically appear here.'}
            </p>
          </div>
        ) : (
          filteredSubscriptions.map((sub) => {
            const initial = sub.sender_name.charAt(0).toUpperCase();
            return (
              <div
                key={sub.id}
                className={`p-4 md:p-5 rounded-3xl border apple-transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  sub.is_unsubscribed
                    ? 'bg-[var(--card-bg)]/50 border-[var(--card-border)] opacity-60'
                    : 'bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs hover:border-blue-500/30'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                    {initial}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-[var(--text-primary)] truncate tracking-tight">
                        {sub.sender_name}
                      </h3>
                      {sub.is_unsubscribed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                        {sub.total_emails} {sub.total_emails === 1 ? 'edition' : 'editions'}
                      </span>
                    </div>

                    <span className="text-xs text-[var(--text-muted)] font-mono truncate mt-0.5">
                      {sub.sender_address}
                    </span>

                    <p className="text-xs text-[var(--text-secondary)] truncate mt-1.5 font-sans">
                      <span className="font-semibold text-[var(--text-primary)]">Latest:</span> {sub.latest_subject}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => onFilterSender(sub.sender_address)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--card-border)] text-[var(--text-primary)] text-xs font-semibold apple-transition flex items-center gap-1.5 cursor-pointer"
                    title="View all emails from this publisher"
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>View Issues</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleUnsubscribe(sub.sender_address)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold apple-transition flex items-center gap-1.5 cursor-pointer ${
                      sub.is_unsubscribed
                        ? 'bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-500/20'
                        : 'bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/20'
                    }`}
                    title={sub.is_unsubscribed ? 'Reactivate subscription' : 'Unsubscribe from this newsletter'}
                  >
                    {sub.is_unsubscribed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Re-subscribe</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Unsubscribe</span>
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
  );
};
