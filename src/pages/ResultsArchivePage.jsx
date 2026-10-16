import React, { useState, useMemo } from 'react';
import { TICKETS, LEAGUES_DATA } from '../data/tickets';
import { WEEKEND_2_ODDS_STATS, WEEKEND_ARCHIVE } from '../data/weekendArchive';
import { ACTIVE_CHALLENGE, PAST_CHALLENGES } from '../data/ladder';
import StatusBadge from '../components/StatusBadge';
import { 
  CheckSquare, Filter, RotateCcw, Search, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, Clock, ShieldCheck, 
  Trophy, Flame, Zap, Copy, Check, ChevronDown, ChevronUp, Layers, Info
} from 'lucide-react';

export default function ResultsArchivePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('weekend-2-odds'); // 'weekend-2-odds' | 'ladder-history' | 'all-tickets'
  const [weekendFilter, setWeekendFilter] = useState('all'); // 'all' | 'won' | 'lost' | 'pending'
  const [ladderFilter, setLadderFilter] = useState('all'); // 'all' | 'milestone' | 'lost' | 'active'
  const [copiedCode, setCopiedCode] = useState(null);

  // Copy helper
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                📊
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                Historical Results &amp; Accuracy Ledger
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Transparent, timestamped archive tracking our <strong>Weekend 2 Odds Accuracy</strong> and <strong>Previous Ladder Rollover Challenges</strong>. Primarily European top-flight fixtures tailored for African punters (₦ / KSh).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Verifiable &bull; Zero Deletions</span>
            </span>
          </div>
        </div>

        {/* ── 2. THREE MASTER TABS ── */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-1">
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
            <span>Previous Ladder Challenges ({PAST_CHALLENGES.length + 1} Runs)</span>
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

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Win Accuracy</div>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}%
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.won} Won / {WEEKEND_2_ODDS_STATS.lost} Lost
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Average Odds</div>
                <div className="text-2xl font-mono font-black text-blue-400 mt-0.5">
                  {WEEKEND_2_ODDS_STATS.avgOdds}x
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  Low-variance threshold
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
            <div className="flex items-center gap-1.5">
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
                          <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                            {sel.league} &bull; {sel.kickoff}
                          </span>
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            sel.result === 'won' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400' 
                              : sel.result === 'lost' 
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {sel.score}
                          </span>
                        </div>

                        <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {sel.match}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            Selection: {sel.pick}
                          </span>
                          <span className="font-mono font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1A2438] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-[11px]">
                            {sel.odds}x
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          "{sel.tacticalReason}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Post-match verdict */}
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-200 flex items-center justify-between">
                    <span><strong>Record Verdict:</strong> {item.postMatchVerdict}</span>
                    <span className="font-mono font-bold text-xs">{item.status === 'won' ? '+1.06u' : item.status === 'lost' ? '-1.00u' : 'Active'}</span>
                  </div>
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
                onClick={() => onNavigate(`ticket/${t.id}`)}
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

    </div>
  );
}
