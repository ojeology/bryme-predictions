import React, { useState } from 'react';
import { Search, ShieldAlert, Zap, Menu, X, Flame } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'predictions', label: 'Predictions' },
    { id: 'ladder', label: 'Ladder' },
    { id: 'markets', label: 'Markets' },
    { id: 'punters', label: 'Punters' },
    { id: 'editor-picks', label: "Editor's Picks" },
    { id: 'results', label: 'Results' },
    { id: 'bookmakers', label: 'Bookmakers' }
  ];

  const handleNav = (routeId) => {
    onNavigate(routeId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 dark:bg-[#070D1A]/95 border-b border-slate-200 dark:border-[#182847] sticky top-0 md:relative z-30 transition-colors backdrop-blur-md">
      
      {/* Live Marquee Ticker */}
      <div className="bg-slate-950 text-slate-200 border-b border-slate-800 overflow-hidden py-1 text-[11px] font-mono">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-8">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE: LADDER CHALLENGE #50 IN PROGRESS
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-amber-300 font-bold">
            TODAY'S 1.50 CODE: B9J-LAD-50-D3
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">
            🇳🇬 NIGERIA NPFL &bull; 🇰🇪 KENYA FKF &bull; 🇬🇭 GHANA GPL &bull; 🇿🇦 SOUTH AFRICA PSL
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300">
            18+ STRICTLY ENFORCED &bull; WAGER RESPONSIBLY
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-emerald-400">
            TRANSPARENT ARCHIVE: 100% OF LOSSES LOGGED
          </span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-display font-black text-slate-950 text-xl shadow-sm group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                BRYME
              </span>
              <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                PREDICTIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Pan-African Sports Intelligence
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-display font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-2.5 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121E36]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Controls: Theme Toggle & Search & Mobile Menu */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle (Sun/Moon) */}
          <ThemeToggle />

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0C1527] hover:bg-slate-200 dark:hover:bg-[#121E36] border border-slate-200 dark:border-[#1E3258] text-slate-700 dark:text-slate-300 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors"
            title="Search matches and codes"
          >
            <Search className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#0C1527] border border-slate-200 dark:border-[#1E3258] text-slate-700 dark:text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#050A14] border-b border-slate-200 dark:border-[#182847] px-4 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0C1527] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#121E36] border border-slate-200 dark:border-[#182847]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <ThemeToggle showLabel={true} />
            <button 
              onClick={() => handleNav('responsible-gambling')} 
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium text-[11px]"
            >
              18+ Responsible Gambling
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
