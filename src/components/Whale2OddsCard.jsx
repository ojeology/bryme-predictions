import React, { useState } from 'react';
import { 
  Flame, ShieldCheck, Copy, Check, TrendingUp, Sparkles, 
  ExternalLink, ArrowRight, Clock, Users, DollarSign, Award, 
  ChevronDown, ChevronUp, History, XCircle, CheckCircle
} from 'lucide-react';
import { SYNDICATE_ARCHIVE, SYNDICATE_STATS } from '../data/syndicateArchive';

export default function Whale2OddsCard({ whaleSlip, onNavigate }) {
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copied22Bet, setCopied22Bet] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Safe defaults if whaleSlip is not fully provided
  const slip = whaleSlip || {
    id: 'whale-2-odds-today',
    title: "Today's Whale 2-Odds Syndicate Lock",
    staker: 'Lagos VIP Syndicate #04',
    stakeAmount: '₦500,000',
    totalOdds: 2.02,
    potentialReturn: '₦1,010,000',
    confidence: '95%',
    status: 'pending',
    sportyCode: '7FPL3',
    twentyTwoBetCode: '7fpl3',
    bet9jaCode: '7fpl3',
    kickoffTime: 'Tonight 20:00 WAT',
    punterCount: 4320,
    volumeStaked: '₦19,200,000',
    intel: 'Syndicate placed ₦500k backing European target volume: Liverpool home target assault (O4.5 SOT @ 1.27), Barcelona away transition pace (O4.5 SOT @ 1.24), and Manchester City box siege (O6.5 SOT @ 1.28). Available on 22bet with booking code 7fpl3.',
    matches: [
      {
        id: 'm1',
        match: 'Liverpool vs Villarreal',
        league: 'European Top-Flight',
        kickoff: '20:00 WAT',
        pick: 'Liverpool Home Over 4.5 Shots on Target',
        odds: 1.27,
        analysis: 'Liverpool average 7.8 shots on target per home match under current tactical setup.'
      },
      {
        id: 'm2',
        match: 'PSG vs Barcelona',
        league: 'European Top-Flight',
        kickoff: '20:00 WAT',
        pick: 'Barcelona Away Over 4.5 Shots on Target',
        odds: 1.24,
        analysis: 'Barcelona transition attack tests opposition goalkeepers with high direct volume.'
      },
      {
        id: 'm3',
        match: 'Man City vs AEK Athens',
        league: 'European Top-Flight',
        kickoff: '20:00 WAT',
        pick: 'Man City Home Over 6.5 Shots on Target',
        odds: 1.28,
        analysis: 'Manchester City dominate box possession and average 9+ shots on target in home European clashes.'
      }
    ]
  };

  const handleCopy = (code, type) => {
    if (code) {
      navigator.clipboard.writeText(code);
      if (type === '22bet') {
        setCopied22Bet(true);
        setTimeout(() => setCopied22Bet(false), 2200);
      } else if (type === 'sporty') {
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
            <div className="flex items-center gap-2 flex-wrap">
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
                  LIVE &bull; {slip.confidence || '94%'} EDGE
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
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
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
            <span>🎉 {slip.potentialReturn || '₦1,010,000'} Payout Cashed Successfully</span>
          </div>
          <p className="text-xs text-slate-300">
            All legs landed cleanly. The next high-stake Whale 2-Odds syndicate lock is compiling and will drop before next kickoff.
          </p>
        </div>
      ) : (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          {(slip.twentyTwoBetCode || slip.twoTwoBetCode || slip.code) && (
            <button
              onClick={() => handleCopy(slip.twentyTwoBetCode || slip.twoTwoBetCode || slip.code, '22bet')}
              className={`flex-1 w-full py-3 px-4 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                copied22Bet
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-[#008575] to-teal-700 hover:from-[#007063] hover:to-teal-800 text-white shadow-teal-900/40 active:scale-[0.98]'
              }`}
            >
              {copied22Bet ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>22Bet Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy 22Bet Code: {slip.twentyTwoBetCode || slip.twoTwoBetCode || slip.code}</span>
                </>
              )}
            </button>
          )}

          {slip.sportyCode && (
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
          )}

          {slip.bet9jaCode && slip.bet9jaCode !== slip.twentyTwoBetCode && (
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
          )}
        </div>
      )}

      {/* ── HISTORICAL RESULTS AUDIT BAR & TOGGLE ── */}
      <div className="pt-3 border-t border-amber-500/20 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <History className="w-4 h-4" />
              <span>Syndicate Ledger:</span>
            </span>
            <span className="text-slate-300">
              <strong>{SYNDICATE_STATS.won} Wins</strong>, <strong className="text-rose-400">{SYNDICATE_STATS.lost} Loss</strong> &bull; <strong className="text-emerald-400">{SYNDICATE_STATS.hitRate} Hit Rate</strong> ({SYNDICATE_STATS.netProfitNGN} Net Profit)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 transition-all"
            >
              <span>{showHistory ? 'Hide Past Runs' : 'Check Historical Runs'}</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('results/syndicate')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 hover:bg-amber-400 transition-all shadow-md"
              >
                <span>Full Ledger &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Historical Drawer */}
        {showHistory && (
          <div className="rounded-2xl bg-black/60 border border-slate-800 p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-mono font-bold text-amber-400 uppercase">
                Past Syndicate Runs (Transparent Wins &amp; Losses)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Zero Deletions &bull; 100% Verifiable
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {SYNDICATE_ARCHIVE.map((run) => (
                <div 
                  key={run.id || run.runNumber}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    run.status === 'won'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        run.status === 'won' ? 'bg-emerald-500 text-black' : 'bg-rose-600 text-white'
                      }`}>
                        #{run.runNumber}
                      </span>
                      <strong className="text-white font-display">{run.title}</strong>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                      run.status === 'won' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
                    }`}>
                      {run.status === 'won' ? 'WON (CASHED)' : 'LOST (SETTLED)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] font-mono text-slate-300">
                    <div>Stake: <strong className="text-amber-400">{run.stakeAmount}</strong></div>
                    <div>Odds: <strong className="text-white">{run.totalOdds}x</strong></div>
                    <div>Return: <strong className={run.status === 'won' ? 'text-emerald-400' : 'text-slate-400 line-through'}>{run.potentialReturn}</strong></div>
                    <div>Outcome: <strong className={run.status === 'won' ? 'text-emerald-400' : 'text-rose-400'}>{run.netProfit}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-sans border-t border-slate-800/60 pt-1">
                    <span className="font-bold text-slate-300">Score &amp; Notes:</span> {run.settledScore} &bull; {run.intel}
                  </div>
                </div>
              ))}
            </div>

            {onNavigate && (
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  onClick={() => onNavigate('results/syndicate')}
                  className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Open Full Accuracy Scorecard &amp; Ledger with Booking Codes &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
