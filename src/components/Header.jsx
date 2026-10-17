import React from 'react';
import { Search, Flame, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch }) {
  const topNav = [
    { id: 'home', label: '🔥 Daily Codes Hub', action: () => onNavigate('home') },
    { id: 'ladder', label: '🪜 Rollover Ladder', action: () => onNavigate('ladder') },
    { id: 'weekend2', label: '🎯 Weekend 2 Odds', action: () => onNavigate('editor-picks') },
    { id: 'results', label: '📊 Verified Results', action: () => onNavigate('results') },
    { id: 'punters', label: '👑 Top Punters', action: () => onNavigate('punters') },
    { id: 'markets', label: '📂 Market Directory', action: () => onNavigate('markets') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070D1E] text-white border-b border-blue-950/60 shadow-xl transition-colors">
      
      {/* Brand Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Logo and Tagline */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-display font-black text-xl shadow-lg border border-cyan-400/40">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-black text-xl tracking-tight text-white">
                BRYME
              </span>
              <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded">
                PREDICTIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-300/80 font-medium tracking-tight mt-0.5">
              African Sports Intelligence &bull; Midnight Drop at 02:00 AM WAT
            </p>
          </div>
        </div>

        {/* Controls: Admin Button, Drop Indicator, Search, Theme Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Admin Management Button */}
          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono font-bold ${
              currentRoute === 'admin'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                : 'bg-white/10 hover:bg-white/15 text-cyan-300 border-cyan-400/30'
            }`}
            title="Admin Deck: Add Booking Codes & Manage Ladder"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Admin Deck</span>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
            title="Search tickets and codes"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

        </div>
      </div>

      {/* Horizontal Shortcuts Ribbon */}
      <div className="bg-[#050914] border-t border-white/[0.06] overflow-x-auto scrollbar-none px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          {topNav.map((item) => {
            const isSelected = 
              (item.id === 'home' && currentRoute === 'home') ||
              (item.id === 'ladder' && currentRoute === 'ladder') ||
              (item.id === 'weekend2' && currentRoute === 'editor-picks') ||
              (item.id === 'results' && currentRoute === 'results') ||
              (item.id === 'punters' && currentRoute === 'punters') ||
              (item.id === 'markets' && currentRoute === 'markets');

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
}
