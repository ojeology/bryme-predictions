import React, { useState } from 'react';
import { Search, Flame, Menu, X, Shield, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch, betCount = 0, onOpenBetslip, activeLeague = 'all', onSelectLeague }) {
  const leaguesNav = [
    { id: 'all', label: 'All Top Fixtures', icon: '🔥' },
    { id: 'epl', label: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'laliga', label: 'La Liga', icon: '🇪🇸' },
    { id: 'seriea', label: 'Serie A', icon: '🇮🇹' },
    { id: 'bundesliga', label: 'Bundesliga', icon: '🇩🇪' },
    { id: 'ligue1', label: 'Ligue 1', icon: '🇫🇷' },
    { id: 'ucl', label: 'Champions League', icon: '🇪🇺' },
    { id: 'africa', label: 'African Leagues', icon: '🌍' },
    { id: 'ladder', label: 'Ladder Challenge', icon: '🪜' },
    { id: 'weekend2', label: 'Weekend 2 Odds', icon: '🎯' },
    { id: 'results', label: 'Results & Accuracy', icon: '📊' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B132B] dark:bg-[#070D1E] text-white border-b border-blue-950/60 shadow-lg transition-colors">
      
      {/* Brand Top Bar */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Logo and Tagline */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-display font-black text-xl shadow-md border border-blue-400/30">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-black text-xl tracking-tight text-white">
                BRYME
              </span>
              <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded">
                INTELLIGENCE
              </span>
            </div>
            <p className="text-[10px] text-slate-300/80 font-medium tracking-tight mt-0.5">
              Europe Top 6 Leagues &bull; For African Punters (₦ / KSh)
            </p>
          </div>
        </div>

        {/* Controls: Search, Theme Toggle, Betslip Button */}
        <div className="flex items-center gap-2">
          
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
            title="Search matches"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Selections / Betslip Drawer Button */}
          <button
            onClick={onOpenBetslip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-bold text-xs uppercase rounded-xl shadow-md transition-all border border-blue-400/30"
          >
            <span>Selections</span>
            {betCount > 0 ? (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] flex items-center justify-center font-mono font-black animate-pulse">
                {betCount}
              </span>
            ) : (
              <span className="text-[10px] text-blue-200/70 font-mono">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Leagues & Shortcuts Ribbon */}
      <div className="bg-[#080E20] dark:bg-[#050914] border-t border-white/[0.06] overflow-x-auto scrollbar-none px-3 py-1.5">
        <div className="max-w-5xl mx-auto flex items-center gap-1.5">
          {leaguesNav.map((item) => {
            const isRouteMatch = (item.id === 'ladder' && currentRoute === 'ladder') ||
                                 (item.id === 'weekend2' && currentRoute === 'editor-picks') ||
                                 (item.id === 'results' && currentRoute === 'results');
            const isLeagueMatch = activeLeague === item.id;
            const isSelected = isRouteMatch || (currentRoute === 'home' && isLeagueMatch);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'ladder') onNavigate('ladder');
                  else if (item.id === 'weekend2') onNavigate('editor-picks');
                  else if (item.id === 'results') onNavigate('results');
                  else {
                    if (onSelectLeague) onSelectLeague(item.id);
                    onNavigate('home');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
}
