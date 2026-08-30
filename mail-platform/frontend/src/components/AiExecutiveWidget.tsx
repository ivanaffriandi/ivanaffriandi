'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  MailCheck,
  Zap,
  Clock,
  Send,
  FileText,
  Inbox,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MessageSummary, MessageDetail } from '@/types/mail';
import { analyzeEmailWithAi, generateUnreadDigest } from '@/lib/ai';

interface AiExecutiveWidgetProps {
  selectedMessage?: MessageDetail | null;
  messages?: MessageSummary[];
  onSelectMessage?: (id: string) => void;
  onUseSuggestedReply?: (draftBody: string) => void;
}

export const AiExecutiveWidget: React.FC<AiExecutiveWidgetProps> = ({
  selectedMessage,
  messages = [],
  onSelectMessage,
  onUseSuggestedReply,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Active email intelligence
  const emailInsight = useMemo(() => {
    if (!selectedMessage) return null;
    return analyzeEmailWithAi(selectedMessage);
  }, [selectedMessage]);

  // Unread mailbox digest overview
  const unreadDigests = useMemo(() => {
    if (selectedMessage) return [];
    return generateUnreadDigest(messages);
  }, [messages, selectedMessage]);

  const handleCopyDraft = (text: string, index: number) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden font-sans">
      {/* ── MODE 1: ACTIVE EMAIL EXECUTIVE COPILOT ── */}
      {selectedMessage && emailInsight ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto space-y-3 pr-0.5 animate-fade-in">
          {/* AI Header & Urgency Badge */}
          <div className="flex items-center justify-between shrink-0 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-black text-[var(--text-primary)] tracking-tight">
                AI Copilot Briefing
              </span>
            </div>

            {/* Urgency Pill */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs border ${
                emailInsight.urgency === 'high'
                  ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30'
                  : emailInsight.urgency === 'medium'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : emailInsight.urgency === 'low'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {emailInsight.urgency === 'high' ? (
                <AlertCircle className="w-3 h-3" />
              ) : emailInsight.needsReply ? (
                <Zap className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>{emailInsight.urgencyLabel}</span>
            </span>
          </div>

          {/* Action Recommendation Box */}
          <div className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--card-border)] space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Recommendation
            </div>
            <p className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
              {emailInsight.actionReason}
            </p>
          </div>

          {/* Executive TL;DR Bullets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-500" />
              <span>Executive Summary</span>
            </div>
            <div className="space-y-1 bg-[var(--bg-secondary)]/60 rounded-2xl p-2.5 border border-[var(--card-border)]">
              {emailInsight.summary.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Reply Drafts (1-Click Action) */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3 text-blue-500" />
                <span>Smart Reply Drafts</span>
              </span>
              <span className="text-[9px] text-blue-500 font-bold">1-Click Insert</span>
            </div>

            <div className="space-y-2">
              {emailInsight.suggestedReplies.map((reply, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/40 shadow-2xs transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {reply.title}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {reply.tone}
                    </span>
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2 italic">
                    &ldquo;{reply.body.split('\n\n')[1] || reply.body.slice(0, 80)}...&rdquo;
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    {onUseSuggestedReply && (
                      <button
                        onClick={() => onUseSuggestedReply(reply.body)}
                        className="flex-1 py-1 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                      >
                        <MailCheck className="w-3 h-3" />
                        <span>Use Reply Draft</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyDraft(reply.body, idx)}
                      className="p-1 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
                      title="Copy draft to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── MODE 2: UNREAD INBOX BRIEFING DIGEST (When no email is selected) ── */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-black text-[var(--text-primary)] tracking-tight">
                AI Inbox Briefing
              </span>
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {unreadDigests.length} Highlights
            </span>
          </div>

          {/* Cards Stream */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {unreadDigests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 border border-emerald-500/20 shadow-2xs">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <p className="text-xs font-bold text-[var(--text-primary)]">Inbox Zero</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  All unread emails are caught up.
                </p>
              </div>
            ) : (
              unreadDigests.map((digest) => (
                <div
                  key={digest.id}
                  onClick={() => onSelectMessage && onSelectMessage(digest.id)}
                  className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-500/40 shadow-2xs transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-[var(--text-primary)] truncate max-w-[130px]">
                      {digest.sender}
                    </span>

                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 border ${
                        digest.priority === 'urgent'
                          ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30'
                          : digest.priority === 'action'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : digest.priority === 'newsletter'
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {digest.priorityLabel}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-[var(--text-primary)] truncate leading-tight">
                    {digest.subject}
                  </p>

                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                    {digest.summary}
                  </p>

                  <div className="flex items-center justify-between pt-0.5 text-[9px] text-[var(--text-muted)]">
                    <span>
                      {new Date(digest.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-purple-500 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Read Brief</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
