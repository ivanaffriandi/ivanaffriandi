'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Star, Clock, SendHorizontal, FileText, Tag, Archive, AlertOctagon, Trash2,
  Camera, LogOut, SquarePen, Sparkles, BadgeCheck, Globe,
  Github, Linkedin, ExternalLink, Copy, Check
} from 'lucide-react';
import { Folder, Message } from '@/types/mail';

// Official Medium SVG Icon
const MediumIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

// Official X (Twitter) SVG Icon
const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SidebarProps {
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onOpenCompose: (toEmail?: string) => void;
  userEmail: string;
  onSignOut?: () => void;
  selectedMessage?: Message | null;
  onReplyCurrentMessage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenCompose,
  userEmail,
  onSignOut,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<'tags' | 'profile' | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('custom_avatar_url');
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      } else {
        const defaultAvatar = 'https://github.com/ivanaffriandi.png';
        setAvatarUrl(defaultAvatar);
        localStorage.setItem('custom_avatar_url', defaultAvatar);
      }
    }
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarUrl(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('custom_avatar_url', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyEmail = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(userEmail || 'hello@ivanaffriandi.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const inboxFolder = folders.find((f) => f.type === 'inbox');
  const sentFolder = folders.find((f) => f.type === 'sent');
  const draftsFolder = folders.find((f) => f.type === 'drafts');
  const archiveFolder = folders.find((f) => f.type === 'archive');
  const spamFolder = folders.find((f) => f.type === 'spam');
  const trashFolder = folders.find((f) => f.type === 'trash');

  const isInboxActive = activeFolderId === (inboxFolder?.id || 'inbox');
  const isStarredActive = activeFolderId === 'starred';
  const isSnoozedActive = activeFolderId === 'snoozed';
  const isSentActive = activeFolderId === (sentFolder?.id || 'sent');
  const isDraftsActive = activeFolderId === (draftsFolder?.id || 'drafts');

  const socialLinks = [
    {
      name: 'Medium',
      handle: '@ivanaffriandi',
      url: 'https://medium.com/@ivanaffriandi',
      icon: <MediumIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Articles & Writings',
      bgClass: 'hover:bg-emerald-500/10 hover:border-emerald-500/30'
    },
    {
      name: 'GitHub',
      handle: '@ivanaffriandi',
      url: 'https://github.com/ivanaffriandi',
      icon: <Github className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />,
      badge: 'Open Source',
      bgClass: 'hover:bg-neutral-500/10 hover:border-neutral-500/30'
    },
    {
      name: 'Website',
      handle: 'ivanaffriandi.com',
      url: 'https://ivanaffriandi.com',
      icon: <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      badge: 'Portfolio',
      bgClass: 'hover:bg-blue-500/10 hover:border-blue-500/30'
    },
    {
      name: 'X / Twitter',
      handle: '@ivanaffriandi',
      url: 'https://x.com/ivanaffriandi',
      icon: <XIcon className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />,
      badge: 'Updates',
      bgClass: 'hover:bg-neutral-500/10 hover:border-neutral-500/30'
    },
    {
      name: 'LinkedIn',
      handle: 'Ivan Affriandi',
      url: 'https://linkedin.com/in/ivanaffriandi',
      icon: <Linkedin className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      badge: 'Professional',
      bgClass: 'hover:bg-sky-500/10 hover:border-sky-500/30'
    },
  ];

  return (
    <div className="relative h-full select-none font-sans z-40 flex flex-col items-center justify-center" ref={popoverRef}>
      {/* ── Compact Floating Pill Bar Dock (iOS / macOS Sequoia aesthetic) ── */}
      <aside className="w-[62px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-full py-3.5 px-1.5 shadow-xl shadow-black/5 flex flex-col items-center gap-2 shrink-0 relative z-30 ring-1 ring-black/5 dark:ring-white/5">
        
        {/* 1. TOP: User Profile Avatar */}
        <div className="relative shrink-0">
          <button
            onClick={() => setActiveMenu(activeMenu === 'profile' ? null : 'profile')}
            className={`group relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs transition-all duration-200 cursor-pointer ${
              activeMenu === 'profile'
                ? 'ring-3 ring-blue-500 scale-105 shadow-md'
                : 'ring-2 ring-black/10 dark:ring-white/20 hover:scale-105 active:scale-95 shadow-2xs'
            }`}
            title="Profile & Social Links"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Ivan Affriandi" className="w-full h-full object-cover" />
            ) : (
              'IA'
            )}
            
            {/* Online Pulse Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-xs"></span>

            {/* iOS Style Tooltip */}
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Ivan Affriandi • Profile & Socials
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-5 h-[1px] bg-neutral-200 dark:bg-neutral-800 shrink-0 my-0.5"></div>

        {/* 2. CENTER: Folder Navigation Icons Stack (iOS SF Symbols Style) */}
        <div className="flex flex-col items-center gap-2">
          
          {/* INBOX (Apple Mail Envelope) */}
          <button
            onClick={() => {
              if (inboxFolder) onSelectFolder(inboxFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isInboxActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-500 scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Mail className="w-[18px] h-[18px] stroke-[2.2]" />
            {inboxFolder && inboxFolder.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#ff3b30] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-neutral-900">
                {inboxFolder.unread_count}
              </span>
            )}
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Inbox
            </span>
          </button>

          {/* STARRED (Apple VIP / Star) */}
          <button
            onClick={() => {
              onSelectFolder('starred');
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isStarredActive
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 border border-amber-400 scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Star className={`w-[18px] h-[18px] stroke-[2.2] ${isStarredActive ? 'fill-current' : ''}`} />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Starred
            </span>
          </button>

          {/* SNOOZED / REMIND LATER */}
          <button
            onClick={() => {
              onSelectFolder('snoozed');
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isSnoozedActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 border border-purple-500 scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Clock className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Snoozed
            </span>
          </button>

          {/* SENT (Clean Horizontal Outgoing Arrow - No slanted arrow!) */}
          <button
            onClick={() => {
              if (sentFolder) onSelectFolder(sentFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isSentActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-500 scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <SendHorizontal className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Sent
            </span>
          </button>

          {/* DRAFTS */}
          <button
            onClick={() => {
              if (draftsFolder) onSelectFolder(draftsFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isDraftsActive
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <FileText className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Drafts
            </span>
          </button>

          {/* MORE FOLDERS (Archive, Spam, Trash) */}
          <button
            onClick={() => setActiveMenu(activeMenu === 'tags' ? null : 'tags')}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeMenu === 'tags'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-105'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Tag className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              More Folders
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-5 h-[1px] bg-neutral-200 dark:bg-neutral-800 shrink-0 my-0.5"></div>

        {/* 3. BOTTOM: Apple Mail Signature Compose Button (Square Pen) */}
        <div className="shrink-0 flex flex-col items-center">
          <button
            onClick={() => onOpenCompose()}
            className="group relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 border border-white/20 apple-transition cursor-pointer"
            title="Compose New Message"
          >
            <SquarePen className="w-[18px] h-[18px] stroke-[2.3]" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-neutral-900/95 dark:bg-neutral-800/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg shadow-xl whitespace-nowrap z-[100] border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-[-4px] group-hover:translate-x-0">
              Compose Email
            </span>
          </button>
        </div>
      </aside>

      {/* ── POP-OVERS ── */}

      {/* 1. MORE FOLDERS FLOATING POPOVER */}
      {activeMenu === 'tags' && (
        <div className="absolute left-[76px] top-1/2 -translate-y-1/2 w-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-3 shadow-2xl z-[100] animate-scale-up font-sans flex flex-col gap-1.5 backdrop-blur-xl">
          <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Other Mail Folders
          </div>

          {archiveFolder && (
            <button
              onClick={() => {
                onSelectFolder(archiveFolder.id);
                setActiveMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                activeFolderId === archiveFolder.id ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
              {archiveFolder.unread_count > 0 && (
                <span className="ml-auto text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full font-bold">
                  {archiveFolder.unread_count}
                </span>
              )}
            </button>
          )}

          {spamFolder && (
            <button
              onClick={() => {
                onSelectFolder(spamFolder.id);
                setActiveMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                activeFolderId === spamFolder.id ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Spam / Junk</span>
            </button>
          )}

          {trashFolder && (
            <button
              onClick={() => {
                onSelectFolder(trashFolder.id);
                setActiveMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                activeFolderId === trashFolder.id ? 'bg-blue-600 text-white font-bold shadow-xs' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
              {trashFolder.unread_count > 0 && (
                <span className="ml-auto text-[10px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full font-bold">
                  {trashFolder.unread_count}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* 2. RICH PROFILE & SOCIAL MEDIA CARD POPOVER */}
      {activeMenu === 'profile' && (
        <div className="absolute left-[76px] top-1/2 -translate-y-1/2 w-80 max-w-[calc(100vw-96px)] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 shadow-2xl z-[100] animate-scale-up font-sans flex flex-col gap-4 backdrop-blur-2xl">
          
          {/* User Profile Header */}
          <div className="flex items-start gap-3.5 pb-3 border-b border-[var(--border-subtle)]">
            <div className="relative group shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-blue-500/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Ivan Affriandi" className="w-full h-full object-cover" />
                ) : (
                  'IA'
                )}
              </div>
              <label
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer apple-transition text-white"
                title="Change Photo"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-bold">Edit</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                  Ivan Affriandi
                </p>
                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" fill="#007aff" color="#ffffff" />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 truncate">
                Software Engineer & Designer
              </p>
              
              {/* Copyable Email Pill */}
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[11px] text-[var(--text-secondary)] font-mono truncate max-w-[145px]">
                  {userEmail || 'hello@ivanaffriandi.com'}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status & Mailbox Health Pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Mail Server Connected</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">mail.ivanaffriandi.com</span>
          </div>

          {/* Social Profiles & Channels Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Social Profiles & Writings
              </span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            <div className="flex flex-col gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-transparent text-xs text-[var(--text-secondary)] font-medium transition-all group cursor-pointer ${social.bgClass}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {social.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
                        {social.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight truncate">
                        {social.handle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                    <span className="text-[9px] font-semibold text-[var(--text-muted)] hidden sm:inline">
                      {social.badge}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => {
                onOpenCompose();
                setActiveMenu(null);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 apple-transition cursor-pointer"
            >
              <SquarePen className="w-4 h-4" />
              <span>Compose New Message</span>
            </button>

            {onSignOut && (
              <button
                onClick={() => {
                  setActiveMenu(null);
                  onSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-500/10 apple-transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
