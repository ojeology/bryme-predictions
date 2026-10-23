import React from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { ChevronRight } from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate }) {
  const { ladder } = usePredictions();
  const currentDay = ladder?.currentDay || 1;
  const currentBalance = ladder?.currentBalance || 1000;
  const dailyOdds = ladder?.dailyOdds || 3.036;

  const navItems = [
    { id: 'friday', label: '🔥 Day 1 Fri 3.036x + Global Overs', icon: '🟢', badge: 'LIVE 18:00', isGreen: true },
    { id: 'ladder', label: '🪜 3.00x Rollover (₦1K → ₦81.9K)', icon: '🪜', badge: `Step ${currentDay}/4`, isGreen: true },
    { id: 'vault', label: '🔒 100% Pure OVER Specialist Vault', icon: '🔒', badge: '117 Locks' },
    { id: 'ledger', label: '📋 54-Match Graded UEFA Ledger', icon: '📋', badge: '16/18 UCL' },
    { id: 'whynot', label: '🚫 Real Line & Trap Rules', icon: '🛡️', badge: 'Filter #4 Off', isSpecial: true },
    { id: 'tuesday', label: '🔵 Tue & Wed Champions League', icon: '🔵', badge: '88.9% Won' },
    { id: 'thursday', label: '🟠 Thursday Europa & UECL', icon: '🟠', badge: '36 Graded' },
    { id: 'clubs', label: '📊 18 Studied Club Match Logs', icon: '📂', badge: '90.4% Hit' },
    { id: 'calculator', label: '🧮 Custom 2-Team Calculator', icon: '🧮', badge: '109 Clubs' },
  ];

  return (
    <aside className="space-y-4">
      {/* ── 1. LIVE SCORECARD & STANDING RULES WIDGET ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0D1829] via-[#132238] to-[#080E1A] border-2 border-emerald-500/40 p-4 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
            LIVE DAY 1 TICKET
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            22Bet &bull; 3.036x
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase block">Tue+Wed UCL</span>
            <strong className="text-lg text-emerald-400 font-black">16/18 (88.9%)</strong>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block">54-Match Alt</span>
            <strong className="text-lg text-amber-300 font-black">49/54 (90.7%)</strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono space-y-1 text-slate-300">
          <div className="text-emerald-400 font-bold uppercase text-[10px]">Active Engine Rules:</div>
          <div>&bull; <strong className="text-white">ONLY Pure OVER</strong> Behaviour Markets</div>
          <div>&bull; <strong className="text-white">ZERO</strong> Under &amp; Goal Markets</div>
          <div>&bull; <strong className="text-white">Real 22Bet / SportyBet</strong> Lines Only</div>
          <div>&bull; <strong className="text-amber-300">Tonight 21:45 WAT:</strong> Auto-Grade FT</div>
        </div>

        <button
          onClick={() => onNavigate('ladder')}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <span>View Placed 3.036x Ticket</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 2. NAVIGATION DIRECTORY ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-3 shadow-sm space-y-1">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2.5 py-1 block">
          Bot Research Navigation
        </span>

        {navItems.map((item) => {
          const isActive = currentRoute === item.id || (currentRoute === 'home' && item.id === 'friday');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-display font-bold transition-all text-left ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162032] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isActive
                    ? 'bg-black/20 text-slate-950'
                    : item.isGreen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.isSpecial
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-100 dark:bg-[#1A2438] text-amber-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. LIVE 3.00x ROLLOVER STATUS ── */}
      <div className="rounded-2xl border border-emerald-500/40 bg-[#131C2E] p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-black text-white uppercase tracking-wider text-[11px]">
            3.00x Pure OVER Rollover
          </span>
          <span className="text-emerald-400 font-mono font-bold">
            Step {currentDay}/4
          </span>
        </div>
        <div className="text-xs font-mono text-slate-300">
          Stake: <strong className="text-white">₦{currentBalance.toLocaleString()}</strong> &rarr; Tonight: <strong className="text-emerald-400">₦{Math.round(currentBalance * dailyOdds).toLocaleString()}</strong>
        </div>
        <div className="text-[11px] font-mono text-amber-300">
          Step 4 Goal: <strong>₦81,972</strong> (+₦51,972 Profit)
        </div>
      </div>
    </aside>
  );
}
