import React, { useState } from 'react';
import { Search, ShieldAlert, Zap, Menu, X, Flame } from 'lucide-react';

export default function Header({ currentRoute, onNavigate, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'predictions', label: 'Predictions' },
    { id: 'ladder', label: 'Visible Ladder' },
    { id: 'markets', label: 'Markets' },
    { id: 'punters', label: 'Punters' },
    { id: 'editor-picks', label: "Editor's Picks" },
    { id: 'results', label: 'Results Archive' },
    { id: 'bookmakers', label: 'Bookmakers' }
  ];

  const handleNav = (routeId) => {
    onNavigate(routeId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#070D1A]/95 border-b border-[#182847] sticky top-0 md:relative z-30">
      
      {/* Live Marquee Ticker (Inspired by Fortebet Portal) */}
      <div className="bg-[#030712] border-b border-[#121E36] overflow-hidden py-1 text-[11px] text-slate-300 font-mono">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-8">
          <span className="flex items-center gap-1.5 text-fortegreen-neon font-bold">
            <span className="w-2 h-2 rounded-full bg-fortegreen-neon animate-ping"></span>
            LIVE: LADDER CHALLENGE #50 IN PROGRESS
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-amber-300 font-bold">
            TODAY'S 1.50 CODE: B9J-LAD-50-D3
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-300">
            18+ STRICTLY ENFORCED &bull; BET RESPONSIBLY
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-emerald-400">
            TRANSPARENT ARCHIVE: 100% OF LOSSES LOGGED
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-400">
            LAGOS &bull; NAIROBI &bull; ACCRA &bull; KAMPALA
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="flex items-center gap-1.5 text-fortegreen-neon font-bold">
            <span className="w-2 h-2 rounded-full bg-fortegreen-neon animate-ping"></span>
            LIVE: LADDER CHALLENGE #50 IN PROGRESS
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-amber-300 font-bold">
            TODAY'S 1.50 CODE: B9J-LAD-50-D3
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-300">
            18+ STRICTLY ENFORCED &bull; BET RESPONSIBLY
          </span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fortegreen-neon via-fortegreen-dark to-[#004D1B] flex items-center justify-center font-display font-black text-pitch-950 text-2xl shadow-glow-green group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-fortegreen-neon transition-colors">
                BRYME
              </span>
              <span className="text-[10px] uppercase font-display font-black tracking-widest px-2 py-0.5 bg-[#0F1E38] border border-fortegreen-neon/40 text-fortegreen-neon rounded-md">
                PREDICTIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Official Sports Records &amp; Public Ladder
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-display font-bold text-slate-300 uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-fortegreen-neon text-pitch-950 font-black shadow-glow-green'
                    : 'hover:text-white hover:bg-[#121E36]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Search & Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#0C1527] hover:bg-[#121E36] border border-[#1E3258] text-slate-300 px-3 py-2 rounded-xl text-xs font-medium transition-colors shadow-sm"
          >
            <Search className="w-4 h-4 text-fortegreen-neon" />
            <span className="hidden sm:inline">Search match, punter, code...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden md:inline-block bg-[#050A14] text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#182847]">
              /
            </kbd>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#0C1527] border border-[#1E3258] text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#050A14] border-b border-[#182847] px-4 py-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-3.5 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-between ${
                    isActive
                      ? 'bg-fortegreen-neon text-pitch-950 font-black shadow-glow-green'
                      : 'bg-[#0C1527] text-slate-300 hover:bg-[#121E36] border border-[#182847]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-pitch-950"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#182847] flex items-center justify-between text-xs text-slate-400">
            <button 
              onClick={() => handleNav('editorial-policy')} 
              className="hover:text-fortegreen-neon"
            >
              Editorial Policy
            </button>
            <span>&bull;</span>
            <button 
              onClick={() => handleNav('responsible-gambling')} 
              className="hover:text-fortegreen-neon"
            >
              18+ Responsible Gambling
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
