import React, { useState } from 'react';
import { Search, ShieldAlert, Zap, Menu, X, Flame } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch, betCount = 0, onOpenBetslip }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sportsNav = [
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'ladder', label: 'Ladder', icon: '🪜' },
    { id: 'npfl', label: 'Nigeria NPFL', icon: '🇳🇬' },
    { id: 'fkf', label: 'Kenya FKF', icon: '🇰🇪' },
    { id: 'gpl', label: 'Ghana GPL', icon: '🇬🇭' },
    { id: 'psl', label: 'South Africa', icon: '🇿🇦' },
    { id: 'caf', label: 'CAF Champions', icon: '🏆' },
    { id: 'epl', label: 'Premier League', icon: '🇪🇺' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-sporty-red text-white shadow-md transition-colors">
      
      {/* SportyBet Brand Top Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Logo and Tagline */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-white text-sporty-red flex items-center justify-center font-display font-black text-xl shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-black text-lg tracking-tight text-white">
                BRYME
              </span>
              <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-black/20 text-white rounded">
                PREDICTIONS
              </span>
            </div>
            <p className="text-[10px] text-white/80 font-medium tracking-tight">
              SportyBet Prototype &bull; Pan-African Sports
            </p>
          </div>
        </div>

        {/* Controls: Search, Theme Toggle, Betslip Pill */}
        <div className="flex items-center gap-2">
          
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-black/15 hover:bg-black/25 text-white transition-colors"
            title="Search matches"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Floating Betslip Button */}
          <button
            onClick={onOpenBetslip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-sporty-red font-display font-black text-xs uppercase rounded-xl shadow-sm hover:bg-slate-100 transition-colors"
          >
            <span>Betslip</span>
            {betCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-sporty-red text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {betCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SportyBet Horizontal Sports & Leagues Strip */}
      <div className="bg-[#B7151C] border-t border-black/10 overflow-x-auto scrollbar-none px-3 py-1.5">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {sportsNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'ladder') onNavigate('ladder');
                else onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-white text-xs font-display font-bold uppercase whitespace-nowrap transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

    </header>
  );
}
