'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, User, Phone, MapPin } from 'lucide-react';
import { Contact } from './ContactDetailModal';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    onAddContact({
      name: name.trim() || email.trim().split('@')[0],
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      addedAt: new Date().toISOString(),
    });

    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs apple-transition"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden p-6 select-none animate-toast apple-transition font-sans z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">Add New Contact</h2>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">Save person to your address book</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 my-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <User className="w-3 h-3 text-[var(--text-muted)]" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[var(--text-muted)]" /> Email Address
            </label>
            <input
              type="email"
              placeholder="sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[var(--text-muted)]" /> Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+62 812 3456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[var(--text-muted)]" /> Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Jakarta, Indonesia"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-color)] apple-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg apple-transition apple-active-scale"
            >
              Save Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
