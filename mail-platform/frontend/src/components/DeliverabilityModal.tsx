'use client';

import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DeliverabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverabilityModal: React.FC<DeliverabilityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--sidebar)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold">Deliverability & Domain Reputation</h2>
              <p className="text-xs text-[var(--muted)] font-mono">mail.ivanaffriandi.com (IP Reverse PTR Aligned)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--sidebar)]">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase">SPF Alignment</span>
              <p className="font-serif text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">100%</p>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--sidebar)]">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase">DKIM 2048-bit</span>
              <p className="font-serif text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Active</p>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--sidebar)]">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase">DMARC Policy</span>
              <p className="font-serif text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">quarantine</p>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--sidebar)]">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase">Bounce Rate</span>
              <p className="font-serif text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">0.0%</p>
            </div>
          </div>

          {/* DNS Alignment Audit Table */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-3">
              DNS Authentication Record Audit
            </h3>
            <div className="border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] text-xs font-mono">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-[var(--foreground)]">MX Record:</span>
                    <span className="ml-2 text-[var(--muted)]">10 mail.ivanaffriandi.com</span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">PASS</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-[var(--foreground)]">TXT SPF:</span>
                    <span className="ml-2 text-[var(--muted)]">v=spf1 ip4:YOUR_SERVER_IP ~all</span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">PASS</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-[var(--foreground)]">TXT DKIM (202608mail):</span>
                    <span className="ml-2 text-[var(--muted)]">v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9...</span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">PASS</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-[var(--foreground)]">PTR / rDNS:</span>
                    <span className="ml-2 text-[var(--muted)]">IP ↔ mail.ivanaffriandi.com</span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">PASS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
