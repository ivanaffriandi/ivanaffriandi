'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, Users, AlertCircle, Sparkles } from 'lucide-react';
import { Contact } from './ContactDetailModal';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (contacts: Contact[]) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [previewContacts, setPreviewContacts] = useState<Contact[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const results: Contact[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header row if it contains Name or Email
      if (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('first name'))) {
        continue;
      }

      // Format 1: "John Doe", "john@example.com" or John Doe,john@example.com
      const parts = line.split(/[,;\t]/).map(p => p.replace(/^["']|["']$/g, '').trim());
      
      let email = '';
      let name = '';

      for (const part of parts) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
          email = part.toLowerCase();
        } else if (!name && part.length > 1) {
          name = part;
        }
      }

      // Format 2: John Doe <john@example.com>
      const angleMatch = line.match(/^([^<]+)<([^>]+)>$/);
      if (angleMatch) {
        name = angleMatch[1].trim();
        email = angleMatch[2].trim().toLowerCase();
      }

      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.push({
          name: name || email.split('@')[0],
          email,
          addedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  };

  const parseVCF = (text: string): Contact[] => {
    const cards = text.split(/BEGIN:VCARD/i).filter(Boolean);
    const results: Contact[] = [];

    for (const card of cards) {
      let name = '';
      let email = '';

      const fnMatch = card.match(/\nFN:(.+)/i) || card.match(/\nN:(.+)/i);
      if (fnMatch) name = fnMatch[1].replace(/;/g, ' ').trim();

      const emailMatch = card.match(/\nEMAIL[^:]*:(.+)/i);
      if (emailMatch) email = emailMatch[1].trim().toLowerCase();

      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.push({
          name: name || email.split('@')[0],
          email,
          addedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      let parsed: Contact[] = [];
      if (file.name.endsWith('.vcf') || file.name.endsWith('.vcard')) {
        parsed = parseVCF(content);
      } else {
        parsed = parseCSV(content);
      }

      if (parsed.length > 0) {
        setPreviewContacts(parsed);
        setImportStatus(`Found ${parsed.length} valid contacts from ${file.name}`);
      } else {
        setImportStatus('No valid contacts found in file. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPasteText(val);
    if (!val.trim()) {
      setPreviewContacts([]);
      return;
    }
    const parsed = parseCSV(val);
    setPreviewContacts(parsed);
  };

  const handleImportCommit = () => {
    if (previewContacts.length === 0) return;
    onImportSuccess(previewContacts);
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
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-float overflow-hidden p-6 select-none animate-toast apple-transition font-sans z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">Import Contacts</h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Google Contacts CSV, vCard (.vcf), or Paste list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] apple-transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="space-y-4 my-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer apple-transition ${
              dragActive
                ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-light)]'
                : 'border-[var(--card-border)] hover:bg-[var(--bg-color)] bg-[var(--bg-color)]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.vcf,.vcard,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <Upload className="w-6 h-6 text-[var(--accent-blue)] mx-auto mb-2" />
            <p className="text-xs font-bold text-[var(--text-primary)]">Click to upload or drag & drop contact file</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Supports .CSV (Google Contacts) and .VCF (Apple/Google vCard)</p>
          </div>

          {/* Or Paste text */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--text-muted)]">Or Paste Contacts (Name & Email)</label>
            <textarea
              value={pasteText}
              onChange={handlePasteChange}
              placeholder="e.g. John Doe, john@example.com&#10;Alice Smith, alice@gmail.com"
              rows={3}
              className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
            />
          </div>

          {/* Preview list */}
          {previewContacts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to import {previewContacts.length} contacts
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 bg-[var(--bg-color)] p-2 rounded-2xl border border-[var(--card-border)]">
                {previewContacts.slice(0, 10).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[150px]">{c.name}</span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">{c.email}</span>
                  </div>
                ))}
                {previewContacts.length > 10 && (
                  <p className="text-center text-[10px] text-[var(--text-muted)] font-medium pt-1">
                    +{previewContacts.length - 10} more contacts
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-color)] apple-transition"
          >
            Cancel
          </button>
          <button
            disabled={previewContacts.length === 0}
            onClick={handleImportCommit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed apple-transition apple-active-scale"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import {previewContacts.length > 0 ? `(${previewContacts.length})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
