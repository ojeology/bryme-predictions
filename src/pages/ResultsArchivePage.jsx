import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { TICKETS, LEAGUES_DATA } from '../data/tickets';
import { WEEKEND_2_ODDS_STATS, WEEKEND_ARCHIVE } from '../data/weekendArchive';
import { ACTIVE_CHALLENGE, PAST_CHALLENGES } from '../data/ladder';
import { SYNDICATE_ARCHIVE as DEFAULT_SYNDICATE_ARCHIVE, SYNDICATE_STATS } from '../data/syndicateArchive';
import StatusBadge from '../components/StatusBadge';
import AdBanner from '../components/AdBanner';
import { 
  CheckSquare, Filter, RotateCcw, Search, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, Clock, ShieldCheck, 
  Trophy, Flame, Zap, Copy, Check, ChevronDown, ChevronUp, Layers, Info, ExternalLink
} from 'lucide-react';

export default function ResultsArchivePage({ initialTab, onNavigate }) {
  const { syndicateArchive = DEFAULT_SYNDICATE_ARCHIVE } = usePredictions() || {};

  // Tab selection: defaults to syndicate-archive if specified, otherwise weekend-2-odds or syndicate
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab === 'syndicate' || initialTab === 'syndicate-archive' || initialTab === 'whale') {
      return 'syndicate-archive';
    }
    return 'syndicate-archive';
  });

  const [syndicateFilter, setSyndicateFilter] = useState('all'); // 'all' | 'won' | 'lost'
  const [weekendFilter, setWeekendFilter] = useState('all'); // 'all' | 'won' | 'lost' | 'pending'
  const [ladderFilter, setLadderFilter] = useState('all'); // 'all' | 'milestone' | 'lost' | 'active'
  const [copiedCode, setCopiedCode] = useState(null);

  // Copy helper
  const handleCopy = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Compute Syndicate metrics dynamically
  const syndicateRuns = syndicateArchive && syndicateArchive.length > 0 ? syndicateArchive : DEFAULT_SYNDICATE_ARCHIVE;
  const syndicateWonCount = syndicateRuns.filter(r => r.status === 'won').length;
  const syndicateLostCount = syndicateRuns.filter(r => r.status === 'lost').length;
  const syndicateTotalRuns = syndicateRuns.length;
  const syndicateHitRate = syndicateTotalRuns > 0 ? ((syndicateWonCount / syndicateTotalRuns) * 100).toFixed(1) : '85.7';

  // Filtered Syndicate Archive
  const filteredSyndicateRuns = useMemo(() => {
    return syndicateRuns.filter(item => {
      if (syndicateFilter === 'all') return true;
      return item.status === syndicateFilter;
    });
  }, [syndicateRuns, syndicateFilter]);

  // Filtered Weekend Archive
  const filteredWeekends = useMemo(() => {
    return WEEKEND_ARCHIVE.filter(item => {
      if (weekendFilter === 'all') return true;
      return item.status === weekendFilter;
    });
  }, [weekendFilter]);

  // Filtered Ladder History
  const filteredLadders = useMemo(() => {
    return PAST_CHALLENGES.filter(ch => {
      if (ladderFilter === 'all') return true;
      if (ladderFilter === 'milestone') return ch.outcome === 'milestone-secured' || ch.outcome === 'won';
      if (ladderFilter === 'lost') return ch.outcome === 'lost';
      return true;
    });
  }, [ladderFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      
      {/* ── 1. PAGE HEADER ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
                🐋
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                Historical Results &amp; Accuracy Ledger
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Transparent, permanent historical archive tracking our <strong>Whale 2-Odds Syndicate Runs</strong>, <strong>Weekend 2 Odds Accuracy</strong>, and <strong>BRYME Rollover Challenges</strong>. 100% verifiable with real full-time scores and zero deleted tickets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verifiable Ledger &bull; Real FT Scores</span>
            </span>
          </div>
        </div>

        {/* ── 2. FOUR MASTER TABS ── */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('syndicate-archive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'syndicate-archive'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400/50'
                : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>🐋</span>
            <span>Whale Syndicate Ledger ({syndicateHitRate}% Hit Rate)</span>
          </button>

          <button
            onClick={() => setActiveTab('weekend-2-odds')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'weekend-2-odds'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>🎯</span>
            <span>Weekend ~2 Odds Tracker ({WEEKEND_2_ODDS_STATS.accuracyRate}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('ladder-history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'ladder-history'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>🪜</span>
            <span>Rollover Challenges ({PAST_CHALLENGES.length + 1} Runs)</span>
          </button>

          <button
            onClick={() => setActiveTab('all-tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === 'all-tickets'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>📋</span>
            <span>All Fixtures Archive</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 0: WHALE SYNDICATE HISTORICAL LEDGER (WINS & LOSSES) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'syndicate-archive' && (
        <div className="space-y-4">
          
          {/* Performance Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#091512] via-[#0E201B] to-[#0A101C] text-white p-5 sm:p-6 border-2 border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-black tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    High-Roller Capital Tracking
                  </span>
                  <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ₦500k Flat Discipline
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
                  <span>🐋 Whale Syndicate Accuracy &amp; Settlement Ledger</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Historical tracking of high-stake syndicate bets placed by <strong>Lagos VIP Syndicate #04</strong>. Every single run is recorded with kickoffs, odds, and real full-time scores. Both wins and losses are permanently visible.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-display font-black text-xs">
                  <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>{SYNDICATE_STATS.currentStreak} Streak</span>
                </span>
              </div>
            </div>

            {/* Scorecard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/10 relative z-10">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">All-Time Accuracy</div>
                <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-0.5">
                  {syndicateHitRate}%
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5 font-mono">
                  {syndicateWonCount} Won &bull; {syndicateLostCount} Lost ({syndicateTotalRuns} Runs)
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Staked</div>
                <div className="text-xl sm:text-2xl font-display font-black text-amber-400 mt-0.5">
                  ₦{(syndicateTotalRuns * 500000).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5 font-mono">
                  ₦500,000 per entry
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Verified Payouts</div>
                <div className="text-xl sm:text-2xl font-display font-black text-[#00FF66] mt-0.5">
                  {SYNDICATE_STATS.totalPaidOutNGN}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5 font-mono">
                  Cashed at bookmakers
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Net Syndicate ROI</div>
                <div className="text-xl sm:text-2xl font-display font-black text-emerald-400 mt-0.5">
                  {SYNDICATE_STATS.netProfitNGN}
                </div>
                <div className="text-[10px] text-emerald-300 mt-0.5 font-mono">
                  +105.1% Pure Net Return
                </div>
              </div>
            </div>
          </div>

          {/* Educational Callout on Transparency & Staking Discipline */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-amber-100 text-xs flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-amber-500 dark:text-amber-300">
                Transparency &amp; Zero Deletions Commitment:
              </strong>
              <p className="text-[11px] leading-relaxed opacity-90 text-slate-600 dark:text-slate-300">
                Whale Syndicate bets are published exclusively with pre-match booking codes and early liquidity intel. In sports betting, no system wins 100% of the time. When a run loses (such as <strong>Run #05</strong> where Leverkusen conceded a 90th-minute penalty), it is retained permanently on this page. Punters can verify both the wins and the losses to measure real mathematical advantage.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: `All Syndicate Runs (${syndicateRuns.length})` },
                { id: 'won', label: `🏆 Won & Cashed (${syndicateWonCount})` },
                { id: 'lost', label: `🔴 Settled Losses (${syndicateLostCount})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSyndicateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                    syndicateFilter === f.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm ring-1 ring-amber-400'
                      : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Sorted newest to oldest
            </span>
          </div>

          {/* Syndicate Runs List */}
          <div className="space-y-4">
            {filteredSyndicateRuns.map((run) => (
              <div 
                key={run.id || run.runNumber}
                className={`rounded-3xl border-2 transition-all overflow-hidden shadow-sm ${
                  run.status === 'won'
                    ? 'border-emerald-500/40 bg-white dark:bg-[#0E1724]'
                    : 'border-rose-500/40 bg-white dark:bg-[#181014]'
                }`}
              >
                {/* Header Bar */}
                <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  run.status === 'won'
                    ? 'bg-emerald-50/50 dark:bg-[#0B1E19]/80 border-emerald-500/20'
                    : 'bg-rose-50/50 dark:bg-[#200D12]/80 border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm flex-shrink-0 ${
                      run.status === 'won'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    }`}>
                      #{run.runNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          {run.title}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 ${
                          run.status === 'won'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {run.status === 'won' ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>WON &bull; CASHED OUT</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>LOST &bull; SETTLED</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{run.date}</span>
                        <span>&bull;</span>
                        <span>Staker: <strong>{run.staker}</strong></span>
                        <span>&bull;</span>
                        <span>FT: <strong className="text-slate-900 dark:text-white">{run.settledScore}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Booking Codes */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    {run.sportyCode && (
                      <button
                        onClick={() => handleCopy(run.sportyCode, `sporty-${run.runNumber}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:border-amber-500 transition-colors"
                        title="Copy SportyBet verification code"
                      >
                        <span className="text-[10px] font-bold text-rose-500">Sporty:</span>
                        <strong className="font-bold">{run.sportyCode}</strong>
                        {copiedCode === `sporty-${run.runNumber}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    )}

                    {run.bet9jaCode && (
                      <button
                        onClick={() => handleCopy(run.bet9jaCode, `bet9ja-${run.runNumber}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition-colors"
                        title="Copy Bet9ja verification code"
                      >
                        <span className="text-[10px] font-bold text-emerald-500">Bet9ja:</span>
                        <strong className="font-bold">{run.bet9jaCode}</strong>
                        {copiedCode === `bet9ja-${run.runNumber}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#121B2B] border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        Confirmed Stake
                      </span>
                      <div className="text-lg sm:text-xl font-display font-black text-amber-500 mt-0.5">
                        {run.stakeAmount}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Syndicate Stake</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#121B2B] border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        Combined Odds
                      </span>
                      <div className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white mt-0.5">
                        {typeof run.totalOdds === 'number' ? run.totalOdds.toFixed(2) : run.totalOdds}x
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">2-Game Double</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#121B2B] border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        {run.status === 'won' ? 'Cashed Return' : 'Target Return'}
                      </span>
                      <div className={`text-lg sm:text-xl font-display font-black mt-0.5 ${
                        run.status === 'won' ? 'text-emerald-500' : 'text-slate-400 line-through'
                      }`}>
                        {run.potentialReturn}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {run.status === 'won' ? '100% Paid Out' : 'Did Not Land'}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      run.status === 'won'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}>
                      <span className="text-[10px] font-mono uppercase font-bold block text-slate-400">
                        Net Profit / Loss
                      </span>
                      <div className={`text-lg sm:text-xl font-display font-black mt-0.5 ${
                        run.status === 'won' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                      }`}>
                        {run.netProfit}
                      </div>
                      <span className="text-[10px] font-mono opacity-80">
                        {run.status === 'won' ? 'Net Cash Secured' : 'Total Loss on Stake'}
                      </span>
                    </div>
                  </div>

                  {/* Match Selections Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Verified Match Legs &amp; Official Full-Time Scores
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {run.matches?.map((m, idx) => (
                        <div 
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-colors space-y-1.5 ${
                            m.result === 'won'
                              ? 'bg-emerald-50/40 dark:bg-[#0D1C1B] border-emerald-500/30'
                              : 'bg-rose-50/40 dark:bg-[#1F1015] border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                              {m.league}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                {m.odds}x
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                                m.result === 'won'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-rose-600 text-white'
                              }`}>
                                {m.result === 'won' ? 'WON' : 'LOST'}
                              </span>
                            </div>
                          </div>

                          <div className="font-display font-black text-slate-900 dark:text-white text-sm flex items-center justify-between">
                            <span>{m.match}</span>
                            <span className="font-mono text-xs text-amber-500 font-black">
                              {m.score}
                            </span>
                          </div>

                          <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>Selection:</span>
                            <strong className="text-slate-900 dark:text-white">{m.pick}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Intel / Post-Match Debrief */}
                  {run.intel && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#121B2B] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500">
                        <span>💡 Syndicate Post-Match Debrief:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans text-xs">
                        {run.intel}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: WEEKEND 2 ODDS ACCURACY TRACKER ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'weekend-2-odds' && (
        <div className="space-y-4">
          
          {/* Performance Hero Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0F1E36] via-[#16274B] to-[#0A1224] text-white p-4 sm:p-5 border border-blue-900/40 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-display font-black tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                  Signature European System
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1">
                  Weekend 2.00x Odds Accuracy Scorecard
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Disciplined 2-game European double (EPL, La Liga, Serie A, Bundesliga) published every Thursday.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-display font-black text-xs">
                  <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>{WEEKEND_2_ODDS_STATS.currentStreak} Wins Streak</span>
                </span>
              </div>
            </div>

            {/* Scorecard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">All-Time Accuracy</div>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}%
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.won} Won &bull; {WEEKEND_2_ODDS_STATS.lost} Lost ({WEEKEND_2_ODDS_STATS.totalWeekends} total)
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Average Odds</div>
                <div className="text-2xl font-mono font-black text-white mt-0.5">
                  {WEEKEND_2_ODDS_STATS.averageOdds}x
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Banker 2-leg European doubles
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Cumulative ROI</div>
                <div className="text-2xl font-mono font-black text-amber-400 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.roiUnits}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Net stake units returned
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">African Simulated Return</div>
                <div className="text-lg sm:text-xl font-display font-black text-white mt-1">
                  +{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  (+{WEEKEND_2_ODDS_STATS.simulatedProfitKES} for Kenyan punters)
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: `All Weekends (${WEEKEND_ARCHIVE.length})` },
                { id: 'won', label: `Won (${WEEKEND_ARCHIVE.filter(w => w.status === 'won').length})` },
                { id: 'lost', label: `Lost (${WEEKEND_ARCHIVE.filter(w => w.status === 'lost').length})` },
                { id: 'pending', label: `Upcoming (${WEEKEND_ARCHIVE.filter(w => w.status === 'pending').length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setWeekendFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                    weekendFilter === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Sorted by latest weekend
            </span>
          </div>

          {/* Weekend Cards List */}
          <div className="space-y-3">
            {filteredWeekends.map((item) => (
              <div 
                key={item.weekendNumber}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden shadow-sm transition-all"
              >
                {/* Header */}
                <div className="bg-slate-50 dark:bg-[#0E1626] border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} size="sm" />
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2">
                        <span>{item.dateRange}</span>
                        <span>&bull;</span>
                        <span>Target Odds: <strong className="text-blue-600 dark:text-blue-400 font-black">{item.targetOdds}x</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.bookingCode && (
                      <button
                        onClick={() => handleCopy(item.bookingCode, `wk-${item.weekendNumber}`)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono bg-white dark:bg-[#1A2438] border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors"
                      >
                        <span>Code: <strong>{item.bookingCode}</strong></span>
                        {copiedCode === `wk-${item.weekendNumber}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Selections Breakdown */}
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.selections.map((sel, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {sel.league}
                          </span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {sel.odds}x
                          </span>
                        </div>
                        <div className="font-display font-bold text-slate-900 dark:text-white text-sm">
                          {sel.match}
                        </div>
                        <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                          <span>Pick: <strong>{sel.pick}</strong></span>
                          {sel.score && (
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              FT: <strong>{sel.score}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {item.recap && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-sans">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Weekend Recap:</span> {item.recap}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: PREVIOUS LADDER CHALLENGES HISTORY ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ladder-history' && (
        <div className="space-y-4">
          
          {/* Ladder Stats Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0F1E36] via-[#142342] to-[#091020] text-white p-4 sm:p-5 border border-blue-900/40 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-display font-black tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                  ₦1,000 &rarr; ₦1,000,000 Transparency Ledger
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white mt-1">
                  Historical Ladder Rollover Archive
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Every past run documented with exact fatal matches or banked milestones. No hidden busts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-600/30 border border-blue-400/30 px-3 py-1.5 rounded-xl text-blue-200">
                  50 Total Runs Recorded
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Current Run #50</div>
                <div className="text-xl font-mono font-black text-amber-400 mt-0.5">
                  Step 3 (₦3,375)
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">Active in progress</div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Day 6 Banking Hits</div>
                <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
                  14 Runs Banked
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">50% Capital Secured</div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Cash Secured</div>
                <div className="text-xl font-mono font-black text-white mt-0.5">
                  ₦1,185,000
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">KSh 118,500 equivalent</div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Longest Streak</div>
                <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
                  18 Days
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">Challenge #42 Hit Goal</div>
              </div>
            </div>
          </div>

          {/* Educational Callout: Why Day 6 Banking Saves African Punters */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold">The BRYME 50% Milestone Rule Explained:</strong>
              <p className="text-[11px] leading-relaxed opacity-90">
                Statistically, rolling 18 consecutive bets at 1.50 odds has a low raw probability ((1.5)^18 ≈ 1,477x). If you do not withdraw, one loss at Day 10 wipes out ₦57,000. Under BRYME rules, at <strong>Day 6 win (₦11,390)</strong>, exactly <strong>50% (₦5,695)</strong> is permanently banked. Even if Day 7 loses, you leave with a guaranteed net profit of +₦4,695 over your ₦1,000 start.
              </p>
            </div>
          </div>

          {/* List of Previous Ladder Runs */}
          <div className="space-y-3">
            
            {/* Active Run Card */}
            <div className="rounded-2xl border-2 border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Challenge #50 (Current Live Run)
                  </span>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                  Step 3 / 18
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Current Purse: <strong>₦3,375</strong> &bull; Started ₦1,000 &bull; Daily Target: 1.50x
              </p>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Today's Match: Arsenal 1X &amp; Over 1.5 Goals + Bayern vs Stuttgart Over 2.5 Goals (Bet9ja Code: {ACTIVE_CHALLENGE.todaysCode})
              </div>
            </div>

            {/* Past Historical Runs */}
            {PAST_CHALLENGES.map((ch) => (
              <div 
                key={ch.challengeNumber}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4 space-y-2.5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-base text-slate-900 dark:text-white">
                      Challenge #{ch.challengeNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      ch.outcome === 'milestone-secured'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {ch.outcome === 'milestone-secured' ? 'Milestone Banked 🟢' : 'Ended (Loss) 🔴'}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {ch.startDate} &rarr; {ch.endDate}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162032]">
                    <span className="text-[10px] text-slate-400 font-mono block">Step Reached</span>
                    <strong className="text-slate-900 dark:text-white font-mono">Day {ch.dayReached}</strong>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162032]">
                    <span className="text-[10px] text-slate-400 font-mono block">Banked Profit</span>
                    <strong className={`font-mono ${ch.bankedAmount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      ₦{ch.bankedAmount.toLocaleString()}
                    </strong>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162032]">
                    <span className="text-[10px] text-slate-400 font-mono block">Financial Outcome</span>
                    <strong className={`font-mono ${ch.netReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {ch.netReturn >= 0 ? `+₦${ch.netReturn.toLocaleString()}` : `-₦${Math.abs(ch.netReturn).toLocaleString()}`}
                    </strong>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#162032]">
                    <span className="text-[10px] text-slate-400 font-mono block">Final Code</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-[11px] truncate block">
                      {ch.finalCode}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Detailed Recap:</span> {ch.fatalMatch}
                </div>
              </div>
            ))}

          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TAB 3: ALL INDIVIDUAL MATCH TICKETS ARCHIVE ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'all-tickets' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-[#131C2E] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Archive of all published multi-game tickets across Premier League, La Liga, Serie A, and domestic African competitions.
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden">
            {TICKETS.map(t => (
              <div 
                key={t.id}
                onClick={() => onNavigate && onNavigate(`ticket/${t.id}`)}
                className="p-3.5 hover:bg-slate-50 dark:hover:bg-[#162032] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.status} size="xs" />
                    <span className="font-display font-bold text-slate-900 dark:text-white">
                      {t.title}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {t.totalOdds}x
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span>{t.publishedAt} &bull; {t.punterName}</span>
                  <span>Code: {t.bookingCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MID-PAGE 300x250 BANNER */}
      <AdBanner slot="300x250" label="Sponsored 300x250 Banner" />

      {/* BOTTOM NATIVE RECOMMENDATIONS */}
      <AdBanner slot="native" label="Recommended for You" />

    </div>
  );
}
