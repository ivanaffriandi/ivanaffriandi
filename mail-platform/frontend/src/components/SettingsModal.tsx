'use client';

import React, { useState } from 'react';
import {
  X, User, ShieldCheck, Server, Trash2, Volume2, Upload, Download,
  LogOut, CheckCircle2, AlertCircle, RefreshCw, Key, HardDrive, Bell,
  Sliders, Globe, Mail, Check, Sun, Moon, Monitor
} from 'lucide-react';
import { emptyTrash } from '@/lib/api';
import { getStoredTheme, applyTheme, ThemeMode } from '@/lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSignOut: () => void;
  onOpenImportContacts?: () => void;
  onRefreshMailbox?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSignOut,
  onOpenImportContacts,
  onRefreshMailbox,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'server' | 'storage' | 'audio'>('general');
  const [isClosing, setIsClosing] = useState(false);
  const [isPurgingTrash, setIsPurgingTrash] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getStoredTheme());

  const handleSelectTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode);
    applyTheme(mode);
  };

  if (!isOpen && !isClosing) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleEmptyTrash = async () => {
    setIsPurgingTrash(true);
    try {
      await emptyTrash();
      setPurgeSuccess(true);
      if (onRefreshMailbox) onRefreshMailbox();
      setTimeout(() => setPurgeSuccess(false), 3000);
    } catch (err) {
      console.error('Empty trash failed:', err);
    } finally {
      setIsPurgingTrash(false);
    }
  };

  const handleExportContacts = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('mail_contacts_list');
    if (!raw) return;
    const contacts = JSON.parse(raw);
    let vcf = '';
    for (const c of contacts) {
      vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nEMAIL:${c.email}\n${c.phone ? `TEL:${c.phone}\n` : ''}${c.address ? `ADR:;;${c.address};;;;\n` : ''}END:VCARD\n`;
    }
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-0 z-[950] flex items-center justify-center p-4 select-none font-sans ${isClosing ? 'animate-fade-out opacity-0' : 'animate-fade-in'}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs apple-transition"
        onClick={triggerClose}
      />

      {/* Main Elevated Modal Card */}
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-[0_28px_70px_rgba(0,0,0,0.3)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.75)] overflow-hidden z-10 apple-transition ring-1 ring-black/10 dark:ring-white/15 animate-modal-in flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">
              Settings & Preferences
            </h2>
          </div>
          <button
            onClick={triggerClose}
            className="w-8 h-8 rounded-full bg-[var(--card-bg)] hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center apple-transition border border-[var(--card-border)] shadow-2xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pillbar */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-1 bg-[var(--bg-color)] p-1 rounded-full border border-[var(--card-border)] shadow-2xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold apple-transition whitespace-nowrap ${
                activeTab === 'general'
                  ? 'bg-[var(--accent-blue)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('server')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold apple-transition whitespace-nowrap ${
                activeTab === 'server'
                  ? 'bg-[var(--accent-blue)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Server & Security
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold apple-transition whitespace-nowrap ${
                activeTab === 'storage'
                  ? 'bg-[var(--accent-blue)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Storage & Data
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold apple-transition whitespace-nowrap ${
                activeTab === 'audio'
                  ? 'bg-[var(--accent-blue)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Audio & Alerts
            </button>
          </div>
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fade-in">
              {/* Profile Card */}
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-3">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Account Profile
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm ring-2 ring-blue-500/20 shrink-0">
                    IA
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[var(--text-primary)]">Ivan Affriandi</p>
                    <p className="text-xs text-[var(--text-muted)] font-mono truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Appearance / Theme Mode Card */}
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-3">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Appearance & Dark Mode
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleSelectTheme('system')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl border font-bold text-xs apple-transition apple-active-scale cursor-pointer ${
                      currentTheme === 'system'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Auto (OS)</span>
                  </button>
                  <button
                    onClick={() => handleSelectTheme('light')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl border font-bold text-xs apple-transition apple-active-scale cursor-pointer ${
                      currentTheme === 'light'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => handleSelectTheme('dark')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl border font-bold text-xs apple-transition apple-active-scale cursor-pointer ${
                      currentTheme === 'dark'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              {/* Contacts Management Card */}
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-3">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Contacts & Data Portability
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {onOpenImportContacts && (
                    <button
                      onClick={() => {
                        triggerClose();
                        onOpenImportContacts();
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-[var(--card-bg)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold border border-[var(--card-border)] shadow-2xs apple-transition apple-active-scale"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-500" />
                      <span>Import (.vcf / .csv)</span>
                    </button>
                  )}
                  <button
                    onClick={handleExportContacts}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-[var(--card-bg)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold border border-[var(--card-border)] shadow-2xs apple-transition apple-active-scale"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Export Contacts (.vcf)</span>
                  </button>
                </div>
              </div>

              {/* Sign Out Card */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    triggerClose();
                    onSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold border border-red-500/20 apple-transition apple-active-scale shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Server & Security */}
          {activeTab === 'server' && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-2.5">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Live Mail Protocols & Ports
                </span>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-blue-500" /> SMTP Submission
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Port 587 (STARTTLS Active)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" /> IMAPS Protocol
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Port 993 (SSL/TLS Active)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-500" /> Inbound Daemon
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Port 25 (Postfix 3.8.6)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-2.5">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  DNS Security & Deliverability
                </span>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> DKIM Signature
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold">2048-bit RSA Valid</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SPF Authorization
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold">Passed (v=spf1)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> DMARC Policy
                    </span>
                    <span className="font-mono text-[11px] text-emerald-500 font-bold">Quarantine / Strict</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Storage & Data */}
          {activeTab === 'storage' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-3">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Automated Data Retention & Trash
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Messages in the Trash mailbox are preserved for 30 days before being automatically purged permanently from PostgreSQL and disk storage.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleEmptyTrash}
                    disabled={isPurgingTrash}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold border border-red-500/20 apple-transition apple-active-scale"
                  >
                    {isPurgingTrash ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : purgeSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{purgeSuccess ? 'Trash Purged Successfully!' : 'Empty Trash Now (Permanent Purge)'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-2">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  PostgreSQL Database Engine
                </span>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-1">
                  <span>Backend Storage:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">PostgreSQL 16 (Relational Virtual Mailbox)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>In-Memory Cache:</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">Redis 7 (Rate Limit & Ephemeral State)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Audio & Alerts */}
          {activeTab === 'audio' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[var(--bg-color)] rounded-2xl p-4 border border-[var(--card-border)] space-y-3">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Sound Effects & Notification Tones
                </span>
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" /> Inbound Email Chime
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> Outbound Dispatch Whoosh
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
