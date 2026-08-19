'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { loginUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email] = useState('hello@ivanaffriandi.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState('Good evening, Ivan');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning, Ivan');
    else if (hour >= 12 && hour < 18) setGreeting('Good afternoon, Ivan');
    else if (hour >= 18 && hour < 22) setGreeting('Good evening, Ivan');
    else setGreeting('Good night, Ivan');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(null);
    setIsLoading(true);

    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col justify-between items-center p-6 select-none relative font-sans">
      <div className="flex-1" />

      {/* Main Apple Clean Login Card */}
      <main className="relative z-10 max-w-sm w-full py-4 animate-modal-in">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] space-y-6">
          {/* Header Greeting */}
          <div className="space-y-3 text-center flex flex-col items-center">
            {/* Minimalist Rounded Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Mail className="w-7 h-7 stroke-[2]" />
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {greeting}
            </h1>

            {/* Centered Email Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs font-bold text-[var(--text-primary)]">
              <Lock className="w-3 h-3 text-blue-500" />
              <span>{email}</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Password"
                  className="w-full bg-[var(--bg-color)] border border-[var(--card-border)] rounded-2xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 apple-transition text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 apple-transition apple-active-scale disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unlocking Mailbox...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <div className="flex-1" />

      {/* Modern English Copyright Footer */}
      <footer className="relative z-10 text-center text-[11px] text-[var(--text-muted)] font-medium pb-4">
        <span>© 2026 Ivan Affriandi. All rights reserved.</span>
      </footer>
    </div>
  );
}
