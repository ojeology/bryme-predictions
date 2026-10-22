import React from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { ChevronRight } from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate }) {
  const { ladder } = usePredictions();
  const currentDay = ladder?.currentDay || 1;
  const currentBalance = ladder?.currentBalance || 1000;

  const navItems = [
    { id: 'friday', label: '🗓️ Friday: Weekend Top-5', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', badge: '15 Matches', isGreen: true },
    { id: 'thursday', label: '🗓️ Thursday: Europa & UECL', icon: '🟠', badge: '7/7 FT Won', isFeatured: true },
    { id: 'tuesday', label: '🗓️ Tuesday: Champions League', icon: '🔵', badge: '8 Matches' },
    { id: 'whynot', label: '🚫 Why NOT To Bet (Traps)', icon: '🛡️', badge: '6 Rules', isSpecial: true },
    { id: 'challenge', label: '💎 2.00x & 5.00x Value Slips', icon: '🎯', badge: '2.31x / 5.10x' },
    { id: 'ladder', label: '🪜 10-Step 2.00x Challenge', icon: '🪜', badge: `Day ${currentDay}` },
    { id: 'clubs', label: '📊 18 Studied Club Logs', icon: '📂', badge: '90.4% Hit' },
    { id: 'calculator', label: '🧮 Two-Team Calculator', icon: '🧮', badge: '109 Clubs' },
  ];

  return (
    <aside className="space-y-4">
      
      {/* ── 1. PERSONAL BOT SCORECARD & SCHEDULE WIDGET ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0D1829] via-[#132238] to-[#080E1A] border-2 border-emerald-500/40 p-4 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
            2-Team Bot Scorecard
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            v2 Self-Learning
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs">
          <div>
            <span className="text-[9px] text-slate-400 uppercase block">2-Team Today</span>
            <strong className="text-lg text-emerald-400 font-black">7/7 (100%)</strong>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block">1-Sided Today</span>
            <strong className="text-lg text-amber-300 font-black">5/7 (71.4%)</strong>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono space-y-1 text-slate-300">
          <div className="text-amber-300 font-bold uppercase text-[10px]">Automated Analysis Schedule:</div>
          <div>&bull; <strong className="text-white">Tuesday AM:</strong> Champions League</div>
          <div>&bull; <strong className="text-white">Thursday AM:</strong> Europa &amp; Conference</div>
          <div>&bull; <strong className="text-white">Friday AM:</strong> Top-5 Weekend Leagues</div>
        </div>

        <button
          onClick={() => onNavigate('whynot')}
          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <span>Study &quot;Why NOT To Bet&quot; Rules</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 2. RESEARCH LAB DIRECTORY ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-3 shadow-sm space-y-1">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2.5 py-1 block">
          Bot Study Navigation
        </span>

        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
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

      {/* ── 3. PERSONAL 2.00x CHALLENGE STATUS ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            2.00x Odds Challenge
          </span>
          <span className="text-emerald-500 font-mono font-bold">
            Day {currentDay}/10
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Active Stake: <strong className="text-white">₦{currentBalance.toLocaleString()}</strong> &rarr; Day {currentDay} Target: <strong className="text-emerald-400">₦{(currentBalance * 2).toLocaleString()}</strong>
        </div>
        <button
          onClick={() => onNavigate('ladder')}
          className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-amber-300"
        >
          Open 10-Step 2.00x Tracker &rarr;
        </button>
      </div>

    </aside>
  );
}
