import React, { useState } from 'react';
import { 
  Flame, ShieldCheck, Copy, Check, TrendingUp, Sparkles, 
  ExternalLink, ArrowRight, Clock, Users, DollarSign, Award, ChevronDown, ChevronUp
} from 'lucide-react';

export default function Whale2OddsCard({ whaleSlip, onNavigate }) {
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [showIntel, setShowIntel] = useState(true);

  // Safe defaults if whaleSlip is not fully provided
  const slip = whaleSlip || {
    id: 'whale-2-odds-today',
    title: "Today's Whale 2-Odds Syndicate Lock",
    staker: 'Lagos VIP Syndicate #04',
    stakeAmount: '₦500,000',
    totalOdds: 2.18,
    potentialReturn: '₦1,090,000',
    confidence: '94%',
    status: 'live',
    sportyCode: 'BC4-WHALE',
    bet9jaCode: 'B9J-WHALE',
    kickoffTime: '20:00 WAT Today',
    punterCount: 4210,
    volumeStaked: '₦18,450,000',
    intel: 'Syndicate placed ₦500k after sharp line movements in Madrid & Munich. Over 1.5 Team Goals line dropped 18% on early European exchange liquidity.',
    matches: [
      {
        id: 'm1',
        match: 'Real Madrid vs Sevilla',
        league: 'Spanish La Liga',
        kickoff: '20:00 WAT',
        pick: 'Real Madrid Over 1.5 Team Goals',
        odds: 1.45,
        analysis: 'Madrid averages 2.6 goals at the Bernabéu; scored 2+ in 9 of last 10 home fixtures.'
      },
      {
        id: 'm2',
        match: 'Bayern Munich vs RB Leipzig',
        league: 'German Bundesliga',
        kickoff: '17:30 WAT',
        pick: 'Over 2.5 Total Goals',
        odds: 1.50,
        analysis: 'Both attacks rank top 2 in expected goals (xG); last 6 head-to-heads averaged 4.1 goals.'
      }
    ]
  };

  const handleCopy = (code, type) => {
    if (code) {
      navigator.clipboard.writeText(code);
      if (type === 'sporty') {
        setCopiedSporty(true);
        setTimeout(() => setCopiedSporty(false), 2200);
      } else {
        setCopiedBet9ja(true);
        setTimeout(() => setCopiedBet9ja(false), 2200);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-[#0B0F1D] via-[#10172B] to-[#080C18] p-5 sm:p-7 shadow-2xl text-white space-y-5">
      
      {/* Background Gold Ambient Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header Tag Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25 flex-shrink-0 animate-bounce">
            🐋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                WHALE 2-ODDS SYNDICATE
              </span>
              {slip.status === 'won' ? (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center gap-1 shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>WON &amp; PAID OUT (₦1,090,000)</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE &bull; {slip.confidence} EDGE
                </span>
              )}
            </div>
            <h3 className="font-display font-black text-lg sm:text-2xl text-white mt-1">
              {slip.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Tracked Staker: <strong className="text-amber-300">{slip.staker}</strong>
          </span>
        </div>
      </div>

      {/* Stake & Return Hero Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 font-bold block">
            Confirmed Stake
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-amber-400 mt-0.5 flex items-center gap-1">
            <span>{slip.stakeAmount}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">Real Cash on Board</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#16223B]/80 border border-slate-700">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            Total Slip Odds
          </span>
          <div className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
            {typeof slip.totalOdds === 'number' ? slip.totalOdds.toFixed(2) : slip.totalOdds}x
          </div>
          <span className="text-[10px] text-slate-400 font-sans">2 Banker Legs</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 col-span-2 sm:col-span-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300/80 font-bold block">
            Target Payout
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-emerald-400 mt-0.5 flex items-center justify-between">
            <span>{slip.potentialReturn}</span>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">
              +118% Net ROI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            🔥 {slip.punterCount?.toLocaleString() || '4,210'} punters riding ({slip.volumeStaked || '₦18.4M'} total volume)
          </span>
        </div>
      </div>

      {/* Match Selections Breakdown */}
      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between text-xs font-display font-black uppercase tracking-wider text-slate-400 px-1">
          <span>Syndicate Match Selections</span>
          <span className="text-amber-400 font-mono text-[11px]">Kickoff: {slip.kickoffTime}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {slip.matches?.map((m, idx) => (
            <div 
              key={m.id || idx}
              className="p-3.5 rounded-2xl bg-[#0E1626]/90 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                  {m.league} &bull; {m.kickoff}
                </span>
                <span className="font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/15 text-xs">
                  {m.odds}x
                </span>
              </div>
              <h4 className="font-display font-black text-white text-sm sm:text-base">
                {m.match}
              </h4>
              <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Pick: {m.pick}
              </div>
              {m.analysis && (
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1 border-t border-slate-800/80">
                  {m.analysis}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Whale Intel Note */}
      {slip.intel && (
        <div className={`p-3.5 rounded-2xl ${
          slip.status === 'won' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200' 
            : 'bg-amber-500/5 border border-amber-500/20 text-slate-300'
        } text-xs relative z-10 space-y-1`}>
          <div className="flex items-center gap-1.5 font-display font-black text-xs uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slip.status === 'won' ? 'Syndicate Payout Verified' : 'Whale Market Intel'}</span>
          </div>
          <p className="leading-relaxed text-[11px] font-sans">
            {slip.intel}
          </p>
        </div>
      )}

      {/* 1-Tap Booking Action Bar */}
      {slip.status === 'won' ? (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/40 text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-display font-black text-sm uppercase tracking-wider">
            <span>🎉 ₦1,090,000 Payout Cashed Successfully</span>
          </div>
          <p className="text-xs text-slate-300">
            Both legs landed cleanly before full time. The next high-stake Whale 2-Odds syndicate lock is compiling and will drop before next kickoff.
          </p>
        </div>
      ) : (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <button
            onClick={() => handleCopy(slip.sportyCode, 'sporty')}
            className={`flex-1 w-full py-3 px-4 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              copiedSporty
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-[#E41B13] to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-900/40 active:scale-[0.98]'
            }`}
          >
            {copiedSporty ? (
              <>
                <Check className="w-4 h-4" />
                <span>SportyBet Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy SportyBet Code: {slip.sportyCode}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy(slip.bet9jaCode, 'bet9ja')}
            className={`flex-1 w-full py-3 px-4 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              copiedBet9ja
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-900/40 active:scale-[0.98]'
            }`}
          >
            {copiedBet9ja ? (
              <>
                <Check className="w-4 h-4" />
                <span>Bet9ja Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Bet9ja Code: {slip.bet9jaCode}</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
