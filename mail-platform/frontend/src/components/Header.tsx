'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Settings, RefreshCw, X, ShieldCheck, Trash2, Upload, Download,
  Volume2, LogOut, HardDrive, CheckCircle2, ArrowRight, Users, Menu, ChevronLeft, Star
} from 'lucide-react';
import { emptyTrash } from '@/lib/api';
import { MessageSummary, MessageDetail } from '@/types/mail';
import { Contact, ContactDetailModal } from './ContactDetailModal';
import { getAvatarGradient, getBrandOrAvatarUrl } from '@/lib/avatar';

interface HeaderProps {
  activeFolderName: string;
  totalMessagesCount: number;
  messages?: MessageSummary[];
  selectedMessage?: MessageDetail | null;
  onBack?: () => void;
  onSearch: (query: string) => void;
  onSelectMessage?: (id: string) => void;
  onComposeContact?: (email: string) => void;
  userEmail: string;
  onSignOut: () => void;
  onRefresh?: () => void;
  onOpenImportContacts?: () => void;
  onToggleMobileSidebar?: () => void;
}

const DEFAULT_CONTACTS: Contact[] = [
  { name: 'Sarah Connor', email: 'sarah.connor@linear.app' },
  { name: 'Support / Resend', email: 'delivered@resend.dev' },
  { name: 'Ivan (Personal)', email: 'ivanaffriandi.2018@gmail.com' },
];

export const Header: React.FC<HeaderProps> = ({
  activeFolderName,
  totalMessagesCount,
  messages = [],
  selectedMessage,
  onBack,
  onSearch,
  onSelectMessage,
  onComposeContact,
  userEmail,
  onSignOut,
  onRefresh,
  onOpenImportContacts,
  onToggleMobileSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isPurgingTrash, setIsPurgingTrash] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [selectedContactModal, setSelectedContactModal] = useState<Contact | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mail_sound_enabled') !== 'false';
    }
    return true;
  });

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const handleOpenSearch = () => {
    setIsSearchFocused(true);
    setTimeout(() => {
      mobileInputRef.current?.focus();
      desktopInputRef.current?.focus();
    }, 50);
  };

  const handleCloseSearch = () => {
    setIsSearchFocused(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContacts = localStorage.getItem('mail_contacts_list');
      if (savedContacts) {
        try {
          setContacts(JSON.parse(savedContacts));
        } catch { /* use default */ }
      }
    }
  }, [showSettingsMenu, isSearchFocused]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
    desktopInputRef.current?.focus();
    mobileInputRef.current?.focus();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mail_sound_enabled', String(next));
    }
  };

  const handleEmptyTrash = async () => {
    setIsPurgingTrash(true);
    try {
      await emptyTrash();
      setPurgeSuccess(true);
      if (onRefresh) onRefresh();
      setTimeout(() => setPurgeSuccess(false), 2500);
    } catch (err) {
      console.error('Empty trash failed:', err);
    } finally {
      setIsPurgingTrash(false);
    }
  };

  const handleExportContacts = () => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('mail_contacts_list');
      if (!raw) return;
      const contactsList = JSON.parse(raw);
      let vcf = '';
      for (const c of contactsList) {
        vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nEMAIL:${c.email}\n${c.phone ? `TEL:${c.phone}\n` : ''}${c.address ? `ADR:;;${c.address};;;;\n` : ''}END:VCARD\n`;
      }
      const blob = new Blob([vcf], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.vcf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDeleteContact = (emailToDelete: string) => {
    const updated = contacts.filter(c => c.email !== emailToDelete);
    setContacts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mail_contacts_list', JSON.stringify(updated));
    }
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    const updated = contacts.map((c) => (c.email === updatedContact.email ? updatedContact : c));
    setContacts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mail_contacts_list', JSON.stringify(updated));
    }
  };

  // Robust click outside handler for both desktop and mobile search containers & settings menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(target);
      const insideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearchFocused(false);
      }

      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setShowSettingsMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const displayContacts = cleanQuery
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery)
      )
    : contacts;

  const searchResults = cleanQuery
    ? messages
        .filter(
          (m) =>
            m.subject.toLowerCase().includes(cleanQuery) ||
            (m.sender_name || '').toLowerCase().includes(cleanQuery) ||
            m.sender_address.toLowerCase().includes(cleanQuery) ||
            (m.snippet || '').toLowerCase().includes(cleanQuery)
        )
        .slice(0, 5)
    : [];

  const senderName = selectedMessage?.sender_name || selectedMessage?.sender_address.split('@')[0] || '';
  const [colorFrom, colorTo] = selectedMessage ? getAvatarGradient(selectedMessage.sender_address) : ['#3b82f6', '#1d4ed8'];
  const brandAvatar = selectedMessage ? getBrandOrAvatarUrl(selectedMessage.sender_address, selectedMessage.sender_name) : null;
  const initial = (senderName || 'U').charAt(0).toUpperCase();

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────────
          1. MOBILE VIEW: WHEN MESSAGE IS OPEN (< md screen)
          ────────────────────────────────────────────────────────────────────────── */}
      {selectedMessage && (
        <header className="md:hidden h-14 px-3.5 flex items-center justify-between shrink-0 select-none relative z-30 font-sans border-b border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] apple-transition shrink-0"
                title="Back to Inbox"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-2xs shrink-0 ring-1 ring-black/5 dark:ring-white/10 relative"
                style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
              >
                <span className="select-none">{initial}</span>
                {brandAvatar && (
                  <img
                    src={brandAvatar}
                    alt={senderName}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-[var(--text-primary)] truncate leading-tight">
                  {senderName}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] truncate font-normal leading-tight">
                  {selectedMessage.sender_address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {new Date(selectedMessage.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            {selectedMessage.is_starred && (
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
            )}
          </div>
        </header>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MOBILE VIEW: HOME / LIST VIEW (< md screen, when no message selected)
          ────────────────────────────────────────────────────────────────────────── */}
      {!selectedMessage && (
        <header className="md:hidden h-14 px-3.5 flex items-center justify-between shrink-0 select-none relative z-30 font-sans border-b border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-2xs">
          <div ref={mobileSearchRef} className="w-full flex items-center justify-between gap-2.5 relative">
            {!isSearchFocused ? (
              <>
                <div className="flex items-center gap-2.5 shrink-0 animate-fade-in">
                  {onToggleMobileSidebar && (
                    <button
                      onClick={onToggleMobileSidebar}
                      className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] apple-transition shrink-0"
                      title="Open Menu"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                  )}
                  <h1 className="font-extrabold text-lg text-[var(--text-primary)] tracking-tight capitalize font-sans">
                    {activeFolderName || 'Inbox'}
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleOpenSearch}
                    className="p-1.5 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
                    title="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Expanded Mobile Search Input */
              <div className="w-full flex items-center gap-2 animate-fade-in">
                <div className="relative flex-1 flex items-center">
                  <input
                    ref={mobileInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search sender, subject, content..."
                    className="w-full bg-[var(--bg-secondary)] border border-blue-500/50 rounded-full pl-9 pr-8 py-1.5 text-xs font-medium focus:outline-none ring-2 ring-blue-500/20 text-[var(--text-primary)]"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-muted)] pointer-events-none" />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2.5 p-0.5 rounded-full text-[var(--text-muted)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCloseSearch}
                  className="text-xs font-bold text-blue-600 px-2 py-1 shrink-0"
                >
                  Cancel
                </button>

                {/* Mobile Search Dropdown */}
                <div className="absolute left-0 right-0 top-full mt-2 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl z-50 p-3 space-y-2 max-h-[70vh] overflow-y-auto">
                  {displayContacts.length > 0 && (
                    <div className="bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl p-2">
                      <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" /> Contacts ({displayContacts.length})
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
                        {displayContacts.map((c, i) => {
                          const brandImg = getBrandOrAvatarUrl(c.email, c.name);
                          const [from, to] = getAvatarGradient(c.email || c.name);
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedContactModal(c);
                                handleCloseSearch();
                              }}
                              className="flex flex-col items-center w-12 shrink-0 text-center"
                            >
                              <div
                                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs text-white shadow-xs relative"
                                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                              >
                                <span>{c.name.charAt(0).toUpperCase()}</span>
                                {brandImg && <img src={brandImg} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />}
                              </div>
                              <span className="text-[9px] font-semibold text-[var(--text-primary)] truncate max-w-full block mt-1">
                                {c.name.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {cleanQuery && searchResults.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                        Messages ({searchResults.length})
                      </div>
                      {searchResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            if (onSelectMessage) onSelectMessage(m.id);
                            handleCloseSearch();
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-[var(--bg-color)] flex items-center justify-between"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{m.sender_name || m.sender_address}</span>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{m.subject || '(No Subject)'}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. DESKTOP HEADER (Always shown on Desktop screen >= md)
             - Left: Clean Folder Name (Inbox) without count badge
             - Right: Search Input + Results Dropdown (w-80) + Refresh + Settings
          ────────────────────────────────────────────────────────────────────────── */}
      <header className="hidden md:flex h-13 px-3 items-center justify-between shrink-0 select-none relative z-30 font-sans bg-transparent">
        {/* Left: Folder Name Only */}
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="font-extrabold text-xl text-[var(--text-primary)] tracking-tight capitalize font-sans">
            {activeFolderName || 'Inbox'}
          </h1>
        </div>

        {/* Right: Search Bar + Refresh + Settings */}
        <div className="flex items-center gap-2.5">
          <div ref={desktopSearchRef} className="relative">
            <div
              className={`relative transition-all duration-200 ease-out ${
                isSearchFocused ? 'w-80' : 'w-56'
              }`}
            >
              <input
                ref={desktopInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={handleSearchChange}
                placeholder="Search sender, subject, content..."
                className={`w-full bg-[var(--card-bg)] border rounded-full pl-9 pr-8 py-1.5 text-xs font-medium focus:outline-none apple-transition placeholder:text-[var(--text-muted)] text-[var(--text-primary)] font-sans ${
                  isSearchFocused
                    ? 'border-blue-500/50 shadow-[0_8px_25px_rgba(37,99,235,0.15)] ring-2 ring-blue-500/20'
                    : 'border-[var(--card-border)] shadow-2xs hover:border-[var(--text-muted)]/40'
                }`}
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)] pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-[var(--bg-color)] text-[var(--text-muted)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Desktop Search Results Dropdown - Exactly matches w-80 width */}
            {isSearchFocused && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden p-3 animate-toast apple-transition space-y-2.5">
                {displayContacts.length > 0 && (
                  <div className="bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl p-2 shadow-2xs">
                    <div className="px-1 pb-1.5 text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-blue-500" />
                        Contacts ({displayContacts.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth">
                      {displayContacts.map((contact, idx) => {
                        const [gradFrom, gradTo] = getAvatarGradient(contact.email || contact.name);
                        const brandImg = getBrandOrAvatarUrl(contact.email, contact.name);
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedContactModal(contact);
                              setIsSearchFocused(false);
                            }}
                            className="flex flex-col items-center justify-center w-12 shrink-0 apple-transition text-center group cursor-pointer"
                            title={`${contact.name} (${contact.email})`}
                          >
                            <div
                              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-black text-white shrink-0 mb-1 shadow-xs group-hover:scale-105 group-hover:shadow-md apple-transition relative ring-1 ring-black/5 dark:ring-white/10"
                              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                            >
                              <span className="select-none">{contact.name.charAt(0).toUpperCase()}</span>
                              {brandImg && (
                                <img
                                  src={brandImg}
                                  alt={contact.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              )}
                            </div>
                            <span className="text-[9px] font-semibold text-[var(--text-primary)] truncate max-w-full block leading-tight">
                              {contact.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cleanQuery && (
                  <div className="space-y-1">
                    <div className="px-1 py-1 text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                      Messages ({searchResults.length})
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            if (onSelectMessage) onSelectMessage(m.id);
                            setIsSearchFocused(false);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-[var(--bg-color)] apple-transition flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                {m.sender_name || m.sender_address}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-[var(--text-secondary)] truncate">
                              {m.subject || '(No Subject)'}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 apple-transition shrink-0" />
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-[var(--text-muted)] font-medium">
                        No matching messages found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-full hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
              title="Refresh Mailbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Desktop Settings Menu Button */}
          <div ref={settingsMenuRef} className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-2 rounded-full apple-transition ${
                showSettingsMenu
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl z-50 p-2 animate-toast space-y-1 font-sans">
                <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Signed In As</span>
                  <span className="text-xs font-black text-[var(--text-primary)] truncate block">{userEmail}</span>
                </div>

                <button
                  onClick={handleToggleSound}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-primary)] apple-transition"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    Sound Effects
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${soundEnabled ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                {onOpenImportContacts && (
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onOpenImportContacts();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-primary)] apple-transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-500" />
                    Import Contacts (.vcf / .csv)
                  </button>
                )}

                <button
                  onClick={handleExportContacts}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[var(--bg-color)] text-[var(--text-primary)] apple-transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  Export Contacts (.vcf)
                </button>

                <button
                  onClick={handleEmptyTrash}
                  disabled={isPurgingTrash}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-500/10 text-red-500 apple-transition"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    Empty Trash
                  </span>
                  {purgeSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </button>

                <div className="border-t border-[var(--border-subtle)] my-1 pt-1" />

                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-red-500 hover:bg-red-500/10 apple-transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Selected Contact Modal */}
      {selectedContactModal && (
        <ContactDetailModal
          isOpen={!!selectedContactModal}
          contact={selectedContactModal}
          onClose={() => setSelectedContactModal(null)}
          onCompose={(email) => {
            if (onComposeContact) onComposeContact(email);
            setSelectedContactModal(null);
          }}
          onDelete={handleDeleteContact}
          onUpdateContact={handleUpdateContact}
        />
      )}
    </>
  );
};
