'use client';

import React, { useState } from 'react';
import ShuenWorkspaceWidget from '@/components/ShuenWorkspaceWidget';

export default function WorkPage() {
  const [activeProject, setActiveProject] = useState<'shuen' | 'personal' | 'ventures'>('shuen');

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white selection:bg-amber-500/30 selection:text-amber-200">
      {/* ── TOP EXECUTIVE APP BAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0d0f]/80 backdrop-blur-2xl px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-black text-xs shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            IA
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Ivan Affriandi
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                Workspace Hub
              </span>
            </h1>
            <p className="text-[11px] text-white/40 font-mono">work.ivanaffriandi.com</p>
          </div>
        </div>

        {/* Project Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveProject('shuen')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeProject === 'shuen'
                ? 'bg-amber-400 text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            SHŪ / EN Studio
          </button>
          <button
            onClick={() => setActiveProject('personal')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeProject === 'personal'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Personal Space
          </button>
          <button
            onClick={() => setActiveProject('ventures')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeProject === 'ventures'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Ventures
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {activeProject === 'shuen' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">E-Commerce &amp; Bespoke Atelier</p>
                <h2 className="text-3xl font-extrabold tracking-tight">SHŪ / EN Studio Control Center</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://shuenstudio.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
                >
                  Live Storefront ↗
                </a>
                <a
                  href="https://shuenstudio.com/po"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all"
                >
                  3D Configurator ↗
                </a>
              </div>
            </div>

            {/* Live Interactive SH-EN Management Widget */}
            <ShuenWorkspaceWidget apiUrl="https://shuenstudio.com" apiKey="shuen_master_sec_2026_ivan_work_hub" />
          </div>
        )}

        {activeProject === 'personal' && (
          <div className="p-12 rounded-[28px] bg-neutral-900/60 border border-white/10 text-center space-y-4">
            <h3 className="text-xl font-bold">Ivan Affriandi — Personal Blog &amp; Archive</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Main portfolio, daily reflections, book reading system, and interactive visitor analytics.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <a href="https://ivanaffriandi.com" target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all">
                Open ivanaffriandi.com ↗
              </a>
            </div>
          </div>
        )}

        {activeProject === 'ventures' && (
          <div className="p-12 rounded-[28px] bg-neutral-900/60 border border-white/10 text-center space-y-4">
            <h3 className="text-xl font-bold">Upcoming Projects &amp; Ventures</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Add more modules and workspaces here as your creative ecosystem expands.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
