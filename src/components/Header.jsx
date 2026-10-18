import React from 'react';
import { Search, Flame, Clock, Sparkles, ShieldCheck, Menu, Trophy, Users, BarChart2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch, onOpenSidebar }) {
  const topNav = [
    { id: 'home', label: '🔥 ₦1K → ₦1M Ladder', action: () => onNavigate('home'), isHook: true },
    { id: 'predictions', label: '📋 BRYME Code Hub', action: () => onNavigate('predictions'), badge: 'Daily' },
    { id: 'articles', label: '📚 Academy (Arbing)', action: () => onNavigate('articles'), badge: 'Guides' },
    { id: 'punters', label: '👑 Punters Hub', action: () => onNavigate('punters'), badge: 'Codes' },
    { id: 'markets', label: '📂 35+ Markets DB', action: () => onNavigate('markets') },
    { id: 'results', label: '📊 Results (77% Won)', action: () => onNavigate('results'), isResults: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070D1E] text-white border-b border-blue-950/60 shadow-xl transition-colors">
      
      {/* Brand Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Sidebar Trigger */}
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            title="Open Menu Sidebar"
            aria-label="Open Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo and Tagline */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E41B13] via-red-600 to-blue-600 text-white flex items-center justify-center font-display font-black text-xl shadow-lg border border-red-400/40 flex-shrink-0">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white">
                  BRYME
                </span>
                <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-[#E41B13] text-white rounded shadow-sm">
                  18-STEP ROLLOVER
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium tracking-tight mt-0.5 hidden xs:block">
                Africa's #1 Daily ₦1K &rarr; ₦1M Rollover Ladder &bull; 02:00 AM WAT Drop
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Admin Button, Drop Indicator, Search, Theme Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Quick Results Link Button (Visible on all devices) */}
          <button
            onClick={() => onNavigate('results')}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              currentRoute === 'results'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
            }`}
            title="View Verified Results Ledger"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] hidden sm:inline">Results</span>
          </button>

          {/* Admin Management Button */}
          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              currentRoute === 'admin'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                : 'bg-white/10 hover:bg-white/15 text-cyan-300 border-cyan-400/30'
            }`}
            title="Admin Deck: Add Booking Codes & Manage Ladder"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] hidden sm:inline">Admin</span>
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
          {topNav.map((item, idx) => {
            const isSelected = currentRoute === item.id;

            return (
              <button
                key={idx}
                onClick={item.action}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  item.isHook && currentRoute === 'home'
                    ? 'bg-[#E41B13] text-white shadow-sm ring-1 ring-red-400/50'
                    : item.isResults && isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                    : isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                    : item.isResults
                    ? 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
}
