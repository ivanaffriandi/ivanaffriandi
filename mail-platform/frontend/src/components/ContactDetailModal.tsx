'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Mail, Copy, Check, Trash2, Send, Phone, MapPin, User,
} from 'lucide-react';
import { getBrandOrAvatarUrl } from '@/lib/avatar';

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  note?: string;
  addedAt?: string;
}

interface ContactDetailModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onCompose: (email: string) => void;
  onDelete: (email: string) => void;
  onUpdateContact?: (updated: Contact) => void;
}

const COLORS = ['#3b82f6', '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];
const getColor = (s: string) => COLORS[(s || 'a').charCodeAt(0) % COLORS.length];

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  isOpen,
  contact,
  onClose,
  onCompose,
  onDelete,
  onUpdateContact,
}) => {
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Editable fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setAddress(contact.address || '');
    }
  }, [contact]);

  if (!isOpen && !isClosing) return null;
  if (!contact) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email || contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCurrentChanges = () => {
    const updated: Contact = {
      ...contact,
      name: name.trim() || contact.name,
      email: email.trim().toLowerCase() || contact.email,
      phone: phone.trim(),
      address: address.trim(),
    };
    if (onUpdateContact) {
      onUpdateContact(updated);
    }
    setEditingField(null);
  };

  const initial = (name || contact.email).charAt(0).toUpperCase();
  const color = getColor(email || contact.email);
  const brandAvatar = getBrandOrAvatarUrl(email || contact.email, name);

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 select-none font-sans ${isClosing ? 'animate-fade-out opacity-0' : 'animate-fade-in'}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs apple-transition"
        onClick={triggerClose}
      />

      {/* Main Container Wrapper */}
      <div className="relative w-full max-w-sm z-10 flex flex-col gap-3 animate-modal-in">
        {/* 1. Main Contact Profile Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden p-6 relative apple-transition">
          {/* Top Close Button */}
          <button
            onClick={triggerClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center apple-transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 100% Round Circular Avatar */}
          <div className="flex flex-col items-center text-center pt-2 pb-3">
            <div
              className="w-20 h-20 rounded-full overflow-hidden text-white flex items-center justify-center text-3xl font-black shadow-md ring-4 ring-black/5 dark:ring-white/10 mb-3"
              style={!brandAvatar ? { background: color } : { backgroundColor: 'var(--card-bg)' }}
            >
              {brandAvatar ? (
                <img src={brandAvatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>

            {/* Click to Edit Name */}
            {editingField === 'name' ? (
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onBlur={saveCurrentChanges}
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentChanges()}
                className="text-base font-extrabold text-center text-[var(--text-primary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-xl border border-blue-500/50 focus:outline-none w-full"
              />
            ) : (
              <h2
                onClick={() => setEditingField('name')}
                className="text-base font-extrabold text-[var(--text-primary)] tracking-tight cursor-pointer hover:bg-[var(--bg-secondary)] px-2 py-0.5 rounded-xl apple-transition"
                title="Click to edit name"
              >
                {name || contact.email.split('@')[0]}
              </h2>
            )}

            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              {email || contact.email}
            </p>
          </div>

          {/* Details Section (Clean Monochrome Icons, '-' for empty fields) */}
          <div className="bg-[var(--bg-color)] rounded-2xl p-3.5 space-y-2.5 my-2 border border-[var(--card-border)] text-xs">
            {/* Email Field */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-semibold shrink-0">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Email
              </span>
              {editingField === 'email' ? (
                <input
                  type="email"
                  value={email}
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={saveCurrentChanges}
                  onKeyDown={(e) => e.key === 'Enter' && saveCurrentChanges()}
                  className="font-medium text-right text-[var(--text-primary)] bg-[var(--card-bg)] px-2 py-0.5 rounded-lg border border-blue-500/50 focus:outline-none flex-1 max-w-[180px]"
                />
              ) : (
                <span
                  onClick={() => setEditingField('email')}
                  className="font-medium text-[var(--text-primary)] truncate max-w-[180px] cursor-pointer hover:underline"
                  title="Click to edit email"
                >
                  {email || '-'}
                </span>
              )}
            </div>

            {/* Phone Field */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-semibold shrink-0">
                <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Phone
              </span>
              {editingField === 'phone' ? (
                <input
                  type="tel"
                  value={phone}
                  autoFocus
                  placeholder="+62 812..."
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={saveCurrentChanges}
                  onKeyDown={(e) => e.key === 'Enter' && saveCurrentChanges()}
                  className="font-medium text-right text-[var(--text-primary)] bg-[var(--card-bg)] px-2 py-0.5 rounded-lg border border-blue-500/50 focus:outline-none flex-1 max-w-[180px]"
                />
              ) : (
                <span
                  onClick={() => setEditingField('phone')}
                  className="font-medium text-[var(--text-primary)] truncate max-w-[180px] cursor-pointer hover:underline"
                  title="Click to edit phone"
                >
                  {phone || '-'}
                </span>
              )}
            </div>

            {/* Address Field */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-semibold shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Address
              </span>
              {editingField === 'address' ? (
                <input
                  type="text"
                  value={address}
                  autoFocus
                  placeholder="Jakarta, Indonesia"
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={saveCurrentChanges}
                  onKeyDown={(e) => e.key === 'Enter' && saveCurrentChanges()}
                  className="font-medium text-right text-[var(--text-primary)] bg-[var(--card-bg)] px-2 py-0.5 rounded-lg border border-blue-500/50 focus:outline-none flex-1 max-w-[180px]"
                />
              ) : (
                <span
                  onClick={() => setEditingField('address')}
                  className="font-medium text-[var(--text-primary)] truncate max-w-[180px] cursor-pointer hover:underline"
                  title="Click to edit address"
                >
                  {address || '-'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Standalone Floating Action Buttons (Separate from card with premium floating effect) */}
        <div className="flex items-center gap-2 pt-1">
          {/* Send Email Pill Button */}
          <button
            onClick={() => {
              triggerClose();
              onCompose(email || contact.email);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-full text-xs shadow-[0_12px_28px_rgba(37,99,235,0.28)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.38)] apple-transition apple-active-scale ring-1 ring-white/10"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>

          {/* Copy Email Floating Button */}
          <button
            onClick={handleCopyEmail}
            className="flex items-center justify-center gap-1.5 bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold py-3 px-4 rounded-full text-xs border border-[var(--card-border)] shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)] apple-transition apple-active-scale"
            title="Copy Email Address"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Delete Contact Floating Circular Button */}
          <button
            onClick={() => {
              onDelete(contact.email);
              triggerClose();
            }}
            className="w-11 h-11 rounded-full bg-[var(--card-bg)] hover:bg-red-500 hover:text-white text-red-500 border border-[var(--card-border)] shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_36px_rgba(239,68,68,0.25)] flex items-center justify-center shrink-0 apple-transition apple-active-scale"
            title="Delete Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
