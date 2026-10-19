import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { 
  Trophy, Flame, Sparkles, Clock, Copy, Check, ShieldCheck, 
  Send, ExternalLink, ChevronRight, Layers, BarChart2, Users, HeartHandshake, Shield
} from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate }) {
  const { ladder } = usePredictions();
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);

  const sportyCode = ladder?.sportyCode || 'BC4-LAD50-D4';
  const bet9jaCode = ladder?.todaysCode || 'B9J-LAD-50-D4';
  const currentDay = ladder?.currentDay || 4;
  const currentBalance = ladder?.currentBalance || 3375;

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'sporty') {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2000);
    } else {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2000);
    }
  };

  const navItems = [
    { id: 'home', label: '🔥 The 18-Step Ladder', icon: '🪜', badge: `Day ${currentDay}`, isFeatured: true },
    { id: 'predictions', label: '📋 BRYME Code Hub', icon: '📋', badge: 'Daily Codes', isFeatured: true },
    { id: 'articles', label: '📚 Betting Academy (Arbing)', icon: '📚', badge: 'Guides', isSpecial: true },
    { id: 'punters', label: '👑 Tracked African Punters', icon: '👑', badge: 'Hot', isSpecial: true },
    { id: 'results', label: '📊 Results & Hit Rate', icon: '📊', badge: '76.9% Won', isGreen: true },
    { id: 'markets', label: '📂 35+ Markets Database', icon: '🗂️' },
    { id: 'editor-picks', label: '🎯 Weekend 2.00x Banker', icon: '🎯' },
    { id: 'ladder', label: '🪜 18-Step Safe Havens', icon: '⛰️' },
    { id: 'weekend-hub', label: '🤝 Consensus Community Hub', icon: '👥' },
    { id: 'bookmakers', label: '📱 Bookmakers & Codes', icon: '🎰' },
    { id: 'admin', label: '⚡ Admin Control Deck', icon: '🛠️', badge: 'PIN Locked' },
    { id: 'responsible-gambling', label: '🛡️ Responsible Gaming (18+)', icon: '🔒' }
  ];

  return (
    <aside className="space-y-4">
      
      {/* ── 1. SIGNATURE SPORTYBET LADDER MINI-HERO WIDGET ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#121927] via-[#1a2336] to-[#0A0F1D] border-2 border-[#E41B13]/40 p-4 text-white shadow-xl space-y-3 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-[#E41B13]/20 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-black uppercase tracking-wider bg-[#E41B13] text-white px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping"></span>
            BRYME Rollover
          </span>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            Day {currentDay}/18
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-300 font-medium">Challenge #50 &bull; Active Pot</div>
          <div className="text-2xl font-mono font-black text-amber-300 mt-0.5">
            ₦{currentBalance.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Target: ₦1,000,000 (Started ₦1,000)
          </div>
        </div>

        {/* 1-Tap Booking Codes */}
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Today's 1.50x Codes:</span>
            <span className="text-[#00C250] font-bold font-mono">1.50 Odds</span>
          </div>

          {/* Sporty Code Pill */}
          <div className="flex items-center justify-between gap-1 text-xs font-mono bg-[#E41B13]/15 p-1.5 rounded-lg border border-[#E41B13]/30">
            <div className="min-w-0">
              <span className="text-[9px] text-rose-400 font-bold block uppercase leading-tight">SportyBet</span>
              <span className="font-black text-white truncate block">{sportyCode}</span>
            </div>
            <button
              onClick={() => handleCopy(sportyCode, 'sporty')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                copiedSporty ? 'bg-[#00C250] text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Copy SportyBet code"
            >
              {copiedSporty ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bet9ja Code Pill */}
          <div className="flex items-center justify-between gap-1 text-xs font-mono bg-[#00C250]/15 p-1.5 rounded-lg border border-[#00C250]/30">
            <div className="min-w-0">
              <span className="text-[9px] text-emerald-400 font-bold block uppercase leading-tight">Bet9ja</span>
              <span className="font-black text-white truncate block">{bet9jaCode}</span>
            </div>
            <button
              onClick={() => handleCopy(bet9jaCode, 'bet9ja')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${
                copiedBet9ja ? 'bg-[#00C250] text-black font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Copy Bet9ja code"
            >
              {copiedBet9ja ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
          className="w-full py-2 bg-gradient-to-r from-[#E41B13] to-[#B01009] hover:from-[#D01710] hover:to-[#9A0D07] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <span>Open Day {currentDay} Slip</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 2. PLATFORM DIRECTORY ── */}
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
                  : item.isFeatured
                  ? 'bg-rose-50 dark:bg-rose-950/20 text-[#E41B13] dark:text-rose-300 font-black hover:bg-rose-100 dark:hover:bg-rose-950/40'
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
                    ? 'bg-white/20 text-white' 
                    : item.isFeatured 
                    ? 'bg-[#E41B13] text-white' 
                    : item.isGreen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.isSpecial
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-100 dark:bg-[#1A2438] text-blue-600 dark:text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 3. 02:00 AM TELEGRAM ALERT ── */}
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
