import React, { useState } from 'react';
import { Search, ShieldAlert, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Header({ currentRoute, onNavigate, onOpenSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'predictions', label: 'Predictions' },
    { id: 'markets', label: 'Markets' },
    { id: 'ladder', label: 'Ladder Ledger' },
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
    <header className="bg-pitch-900/90 border-b border-pitch-800 sticky top-0 md:relative z-30">
      {/* Top utility ticker: Demo watermark & Last updated */}
      <div className="bg-pitch-950/80 border-b border-pitch-800/60 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded text-[10px]">
            <ShieldAlert className="w-3 h-3" />
            DEMONSTRATION PROTOTYPE
          </span>
          <span className="hidden sm:inline text-slate-500">&bull;</span>
          <span className="hidden sm:inline text-slate-400">
            Realistic sample data for validation
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">
            <span className="text-emerald-400 font-mono">●</span> Updated 12m ago
          </span>
          <span className="text-slate-500 hidden xs:inline">&bull;</span>
          <span className="text-slate-400 font-mono hidden xs:inline">
            WAT / EAT Timezone
          </span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNav('home')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-pitch-950 text-xl shadow-md shadow-emerald-950/60 group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                BRYME
              </span>
              <span className="text-xs uppercase font-bold tracking-widest px-1.5 py-0.5 bg-pitch-800 border border-pitch-700 text-brand-green rounded">
                PREDICTIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Transparent Football Records &amp; Ladder
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                    : 'hover:text-white hover:bg-pitch-800/80'
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
            className="flex items-center gap-2 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search match, punter, code...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden md:inline-block bg-pitch-950 text-slate-500 font-mono text-[10px] px-1.5 py-0.5 rounded border border-pitch-800">
              /
            </kbd>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-pitch-850 border border-pitch-750 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-pitch-950/98 border-b border-pitch-800 px-4 py-4 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                    isActive
                      ? 'bg-brand-green/20 text-brand-green border border-brand-green/40'
                      : 'bg-pitch-850 text-slate-300 hover:bg-pitch-800'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-pitch-800/80 flex items-center justify-between text-xs text-slate-400">
            <button 
              onClick={() => handleNav('editorial-policy')} 
              className="hover:text-emerald-400"
            >
              Editorial Policy
            </button>
            <span>&bull;</span>
            <button 
              onClick={() => handleNav('responsible-gambling')} 
              className="hover:text-emerald-400"
            >
              18+ Responsible Gambling
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
