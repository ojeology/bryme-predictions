import React from 'react';
import { Search, ShieldCheck, Menu, BarChart2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ currentRoute, onNavigate, onOpenSearch, onOpenSidebar }) {
  const topNav = [
    { id: 'friday', label: '🔥 Day 1 Fri & 3.04x Live', action: () => onNavigate('friday'), badge: 'LIVE 18:00' },
    { id: 'ladder', label: '🪜 3.00x Rollover Board', action: () => onNavigate('ladder'), badge: '₦1K→₦82K' },
    { id: 'vault', label: '🔒 100% Pure OVER Vault', action: () => onNavigate('vault'), badge: '117 Locks' },
    { id: 'ledger', label: '📋 54-Match UEFA Ledger', action: () => onNavigate('ledger'), badge: '49/54' },
    { id: 'whynot', label: '🚫 Trap & Line Rules', action: () => onNavigate('whynot'), badge: '14 Rules' },
    { id: 'tuesday', label: '🔵 Tue & Wed UCL', action: () => onNavigate('tuesday'), badge: '16/18' },
    { id: 'thursday', label: '🟠 Thu UEL/UECL', action: () => onNavigate('thursday'), badge: '36 FT' },
    { id: 'clubs', label: '📊 18 Club Logs', action: () => onNavigate('clubs') },
    { id: 'calculator', label: '🧮 Calculator', action: () => onNavigate('calculator') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070D1E] text-white border-b border-blue-950/60 shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            title="Open Menu Sidebar"
            aria-label="Open Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('friday')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 text-slate-950 flex items-center justify-center font-display font-black text-xl shadow-lg border border-emerald-400/40 flex-shrink-0">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white">
                  BRYME BOT LAB
                </span>
                <span className="text-[9px] uppercase font-display font-black tracking-wider px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded shadow-sm">
                  3.00x PURE OVER ENGINE
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium tracking-tight mt-0.5 hidden xs:block">
                Strict Pure OVER Match Behaviour &bull; Real 22Bet &amp; SportyBet Lines &bull; Zero Unders &bull; Zero Goal Bets
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('whynot')}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              currentRoute === 'whynot'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40'
            }`}
            title="Real Bookmaker Line & Trap Rules"
          >
            <BarChart2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] hidden sm:inline">Line &amp; Trap Rules</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-mono font-bold ${
              currentRoute === 'admin'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-white/10 hover:bg-white/15 text-cyan-300 border-cyan-400/30'
            }`}
            title="Admin Deck"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
            title="Search clubs and matches"
          >
            <Search className="w-4 h-4" />
          </button>

          <ThemeToggle />
        </div>
      </div>

      <div className="bg-[#050914] border-t border-white/[0.06] overflow-x-auto scrollbar-none px-3 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5">
          {topNav.map((item, idx) => {
            const isSelected = currentRoute === item.id || (currentRoute === 'home' && item.id === 'friday');
            return (
              <button
                key={idx}
                onClick={item.action}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-black">
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
