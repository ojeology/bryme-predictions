import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { 
  Trophy, Flame, Sparkles, Clock, Copy, Check, ShieldCheck, 
  Send, ExternalLink, ChevronRight, Layers, BarChart2, Users, HeartHandshake
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'primary') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedAlt(true);
      setTimeout(() => setCopiedAlt(false), 2000);
    }
  };

  const navItems = [
    { id: 'home', label: '🔥 Daily Booking Codes', icon: '📋' },
    { id: 'ladder', label: '🪜 Rollover Ladder Ledger', icon: '🪜', badge: 'Step 3/18' },
    { id: 'editor-picks', label: '🎯 Weekend 2.00x Banker', icon: '🎯', badge: '76.9%' },
    { id: 'results', label: '📊 Verified Results Ledger', icon: '📈' },
    { id: 'weekend-hub', label: '🤝 Consensus Hub', icon: '👥' },
    { id: 'punters', label: '👑 Tracked African Punters', icon: '⭐' },
    { id: 'markets', label: '📂 Betting Markets Directory', icon: '🗂️' },
    { id: 'bookmakers', label: '📱 Bookmakers & Codes', icon: '🎰' },
    { id: 'admin', label: '⚡ Admin Control Deck', icon: '🛠️', badge: 'Owner' },
    { id: 'responsible-gambling', label: '🛡️ Responsible Gaming (18+)', icon: '🔒' }
  ];

  return (
    <aside className="space-y-4">
      
      {/* ── 1. SIGNATURE LADDER MINI-HERO WIDGET ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B1426] via-[#122244] to-[#080D1A] border-2 border-blue-500/40 p-4 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Signature Challenge
          </span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            02:00 AM Drop
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-300 font-medium">Challenge #50 &bull; Step 3 of 18</div>
          <div className="text-2xl font-mono font-black text-white mt-0.5">
            ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Target: ₦1,000,000 (Started ₦1,000)
          </div>
        </div>

        {/* 1.50 Daily Odds Code with 1-Tap Copy */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Today's 1.50x Ticket:</span>
            <span className="text-emerald-400 font-bold font-mono">1.50 Odds</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-xs font-mono bg-black/40 p-1.5 rounded-lg border border-white/10">
            <div className="min-w-0">
              <span className="text-[9px] text-rose-400 font-bold block uppercase">Sporty</span>
              <span className="font-black text-white truncate block">{ACTIVE_CHALLENGE.sportyCode}</span>
            </div>
            <button
              onClick={() => handleCopy(ACTIVE_CHALLENGE.sportyCode, 'primary')}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Copy SportyBet code"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 text-xs font-mono bg-black/40 p-1.5 rounded-lg border border-white/10">
            <div className="min-w-0">
              <span className="text-[9px] text-emerald-400 font-bold block uppercase">Bet9ja</span>
              <span className="font-black text-white truncate block">{ACTIVE_CHALLENGE.todaysCode}</span>
            </div>
            <button
              onClick={() => handleCopy(ACTIVE_CHALLENGE.todaysCode, 'alt')}
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Copy Bet9ja code"
            >
              {copiedAlt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ladder')}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 border border-blue-400/30"
        >
          <span>View 18-Step Mountain</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 2. QUICK NAVIGATION MENU ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-3 shadow-sm space-y-1">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2.5 py-1 block">
          Platform Directory
        </span>

        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-display font-bold transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#162032] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#1A2438] text-blue-600 dark:text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. 02:00 AM TELEGRAM / WHATSAPP VIP ALERT ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#134074] border border-blue-400/30 p-4 text-white space-y-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Send className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-wide">
              Midnight 02:00 AM Alert
            </h4>
            <p className="text-[10px] text-blue-200">
              Never miss the 1.50 Ladder code
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Codes drop daily at <strong>02:00 AM WAT</strong>. Join 45,000+ African punters receiving codes directly on Telegram.
        </p>

        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 bg-white text-slate-900 hover:bg-slate-100 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Join Free Telegram Channel</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ── 4. VERIFIED HIT RATE STATS ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Weekend 2.00x Accuracy
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            {WEEKEND_2_ODDS_STATS.accuracyRate}%
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${WEEKEND_2_ODDS_STATS.accuracyRate}%` }}></div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>{WEEKEND_2_ODDS_STATS.won} Won / {WEEKEND_2_ODDS_STATS.lost} Lost</span>
          <span>+{WEEKEND_2_ODDS_STATS.roiUnits} Units</span>
        </div>
      </div>

      {/* ── 5. RESPONSIBLE GAMBLING 18+ NOTICE ── */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Strictly 18+ Only</span>
        </div>
        <p className="text-[10px] opacity-90 leading-tight">
          Betting involves financial risk. Only wager discretionary funds you can afford to lose.
        </p>
      </div>

    </aside>
  );
}
