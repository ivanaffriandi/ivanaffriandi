'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, Star, Clock, SendHorizontal, FileText, Tag, Archive, AlertOctagon, Trash2,
  Camera, LogOut, Feather, Globe, Instagram,
  Github, Copy, Check
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
  const [activeMenu, setActiveMenu] = useState<'tags' | 'profile' | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load avatar from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_custom_avatar');
      if (saved) setAvatarUrl(saved);
      else setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    }
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        localStorage.setItem('user_custom_avatar', base64);
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
      name: 'Instagram',
      url: 'https://instagram.com/ivanaffriandi',
      icon: <Instagram className="w-4 h-4 text-pink-500" />,
      hoverClass: 'hover:bg-pink-500/10 hover:border-pink-500/30 text-pink-500',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/ivanaffriandi',
      icon: <Github className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />,
      hoverClass: 'hover:bg-neutral-500/10 hover:border-neutral-500/30 text-neutral-800 dark:text-neutral-200',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/ivanaffriandi',
      icon: <XIcon className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />,
      hoverClass: 'hover:bg-neutral-500/10 hover:border-neutral-500/30 text-neutral-900 dark:text-neutral-100',
    },
    {
      name: 'Medium',
      url: 'https://medium.com/@ivanaffriandi',
      icon: <MediumIcon className="w-4 h-4 text-emerald-500" />,
      hoverClass: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-500',
    },
    {
      name: 'Website',
      url: 'https://ivanaffriandi.com',
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      hoverClass: 'hover:bg-blue-500/10 hover:border-blue-500/30 text-blue-500',
    },
  ];

  return (
    <div className="relative h-full w-full select-none font-sans z-50 flex flex-col items-center justify-between py-2 overflow-visible" ref={popoverRef}>
      {/* 1. PALING ATAS: User Profile Avatar */}
      <div className="relative shrink-0 overflow-visible">
        <button
          onClick={() => setActiveMenu(activeMenu === 'profile' ? null : 'profile')}
          className={`group relative w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs transition-all duration-200 cursor-pointer overflow-visible ${
            activeMenu === 'profile'
              ? 'ring-3 ring-blue-500 scale-105 shadow-md'
              : 'ring-2 ring-black/10 dark:ring-white/20 hover:scale-105 active:scale-95 shadow-2xs'
          }`}
          title="Profile & Social Links"
        >
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Ivan Affriandi" className="w-full h-full object-cover" />
            ) : (
              'IA'
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-xs"></span>
          <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
            Ivan Affriandi • Profile
          </span>
        </button>
      </div>

      {/* 2. TENGAH: Compact Floating Pill Bar Dock (Folder navigation only) */}
      <aside className="w-[58px] bg-white/95 dark:bg-[#14161a]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-full py-3 px-1.5 shadow-xl shadow-black/5 dark:shadow-black/40 flex flex-col items-center gap-2 shrink-0 relative z-50 ring-1 ring-black/5 dark:ring-white/5 overflow-visible my-auto">
        <div className="flex flex-col items-center gap-2 overflow-visible">
          <button
            onClick={() => {
              if (inboxFolder) onSelectFolder(inboxFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              isInboxActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-500 scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Mail className="w-[18px] h-[18px] stroke-[2.2]" />
            {inboxFolder && inboxFolder.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#ff3b30] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-neutral-900">
                {inboxFolder.unread_count}
              </span>
            )}
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Inbox
            </span>
          </button>

          <button
            onClick={() => {
              onSelectFolder('starred');
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              isStarredActive
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 border border-amber-400 scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Star className={`w-[18px] h-[18px] stroke-[2.2] ${isStarredActive ? 'fill-current' : ''}`} />
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Starred
            </span>
          </button>

          <button
            onClick={() => {
              onSelectFolder('snoozed');
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              isSnoozedActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 border border-purple-500 scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Clock className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Snoozed
            </span>
          </button>

          <button
            onClick={() => {
              if (sentFolder) onSelectFolder(sentFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              isSentActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-500 scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <SendHorizontal className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Sent
            </span>
          </button>

          <button
            onClick={() => {
              if (draftsFolder) onSelectFolder(draftsFolder.id);
              setActiveMenu(null);
            }}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              isDraftsActive
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <FileText className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Drafts
            </span>
          </button>

          <button
            onClick={() => setActiveMenu(activeMenu === 'tags' ? null : 'tags')}
            className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer overflow-visible ${
              activeMenu === 'tags'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-105'
                : 'bg-neutral-100 dark:bg-[#1d2026] text-neutral-700 dark:text-neutral-200 border border-neutral-200/80 dark:border-white/10 shadow-2xs hover:bg-neutral-200 dark:hover:bg-[#252830] hover:text-neutral-900 dark:hover:text-white hover:scale-105 active:scale-95'
            }`}
          >
            <Tag className="w-[18px] h-[18px] stroke-[2.2]" />
            <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
              Other Folders
            </span>
          </button>
        </div>
      </aside>

      {/* 3. PALING BAWAH: Compose Button */}
      <div className="relative shrink-0 overflow-visible">
        <button
          onClick={() => onOpenCompose()}
          className="group relative w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 border border-white/20 apple-transition cursor-pointer overflow-visible"
          title="Compose New Message"
        >
          <Feather className="w-5 h-5 stroke-[2.2]" />
          <span className="pointer-events-none absolute left-full ml-3.5 px-3 py-1.5 bg-neutral-950/95 dark:bg-neutral-900/95 backdrop-blur-xl text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-nowrap z-[9999] border border-white/15 dark:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-150 transform -translate-x-1.5 group-hover:translate-x-0">
            Compose Email
          </span>
        </button>
      </div>

      {/* POP-OVERS */}
      {activeMenu === 'tags' && (
        <div className="absolute left-[70px] top-1/2 -translate-y-1/2 w-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-3 shadow-2xl z-[100] animate-scale-up font-sans flex flex-col gap-1.5 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Other Folders</div>
          {archiveFolder && (
            <button
              onClick={() => { onSelectFolder(archiveFolder.id); setActiveMenu(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold ${activeFolderId === archiveFolder.id ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-secondary)]'}`}
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
          )}
          {spamFolder && (
            <button
              onClick={() => { onSelectFolder(spamFolder.id); setActiveMenu(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold ${activeFolderId === spamFolder.id ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-secondary)]'}`}
            >
              <AlertOctagon className="w-4 h-4" /> Spam
            </button>
          )}
          {trashFolder && (
            <button
              onClick={() => { onSelectFolder(trashFolder.id); setActiveMenu(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold ${activeFolderId === trashFolder.id ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-secondary)]'}`}
            >
              <Trash2 className="w-4 h-4" /> Trash
            </button>
          )}
        </div>
      )}

      {/* 2. SIMPLE & CLEAN PROFILE & SOCIAL MEDIA CARD POPOVER (ANCHORED AT TOP) */}
      {activeMenu === 'profile' && (
        <div className="absolute left-[70px] top-0 w-72 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 shadow-2xl z-[100] animate-scale-up font-sans flex flex-col gap-3.5 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10">
          
          {/* User Profile Header (Circle Photo) */}
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-blue-500/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Ivan Affriandi" className="w-full h-full object-cover" />
                ) : (
                  'IA'
                )}
              </div>
              <label
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center cursor-pointer apple-transition text-white"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5 mb-0.5" />
                <span className="text-[7px] font-bold">Edit</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight truncate">
                Ivan Affriandi
              </p>
              
              {/* Copyable Email */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-[var(--text-muted)] font-normal truncate max-w-[155px]">
                  {userEmail || 'hello@ivanaffriandi.com'}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 rounded-md hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition cursor-pointer shrink-0"
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

          {/* Social Media Circular Icon Buttons Row */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Connect & Social
            </span>

            <div className="flex items-center justify-between gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--card-border)] flex items-center justify-center transition-all duration-150 group hover:scale-110 active:scale-95 cursor-pointer shadow-2xs ${social.hoverClass}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
