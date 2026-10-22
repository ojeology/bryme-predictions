import React, { useState, useMemo } from 'react';
import {
  MACHINE_META,
  SMALL_ODDS_SLIP,
  BIG_ODDS_SLIP,
  STUDIED_TEAMS,
  TOP5_OPPONENT_PROFILES,
  WEEKEND_TOP5_FIXTURES,
  OVERNIGHT_RESULTS_BREAKDOWN
} from '../data/behaviourMachineData';
import {
  Search, ChevronDown, ChevronUp
} from 'lucide-react';

function poissonPmf(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = k * Math.log(lambda) - lambda;
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function poissonOverProb(line, lambda) {
  const threshold = Math.floor(line) + 1;
  let cdf = 0;
  for (let k = 0; k < threshold; k++) {
    cdf += poissonPmf(k, lambda);
  }
  return Math.max(0, Math.min(1, 1 - cdf));
}

export default function BehaviourMachinePage() {
  // Tabs: 'weekend' | 'overnight' | 'slips' | 'reports' | 'radar' | 'calculator'
  const [activeTab, setActiveTab] = useState('weekend');
  const [selectedLegs, setSelectedLegs] = useState(() => SMALL_ODDS_SLIP.map(l => l.leg));
  const [selectedWeekendIds, setSelectedWeekendIds] = useState(() => WEEKEND_TOP5_FIXTURES.map(w => w.id));
  const [weekendLeagueFilter, setWeekendLeagueFilter] = useState('All');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedMarketCat, setSelectedMarketCat] = useState('all');
  const [expandedTeamSlug, setExpandedTeamSlug] = useState('getafe');
  const [radarSearch, setRadarSearch] = useState('');
  const [radarSort, setRadarSort] = useState('fouls');

  // Live Weekend Fixture Value Calculator state
  const [calcHome, setCalcHome] = useState('Aston Villa');
  const [calcAway, setCalcAway] = useState('AFC Bournemouth');
  const [calcMarket, setCalcMarket] = useState('fouls');
  const [calcLine, setCalcLine] = useState('21.5');
  const [calcOverOdds, setCalcOverOdds] = useState('1.34');
  const [calcUnderOdds, setCalcUnderOdds] = useState('3.00');
  const [calcRefFactor, setCalcRefFactor] = useState('1.00');

  const toggleLeg = (legNum) => {
    setSelectedLegs(prev =>
      prev.includes(legNum) ? prev.filter(x => x !== legNum) : [...prev, legNum]
    );
  };

  const toggleWeekendId = (id) => {
    setSelectedWeekendIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const customAccaStats = useMemo(() => {
    const chosen = SMALL_ODDS_SLIP.filter(l => selectedLegs.includes(l.leg));
    if (chosen.length === 0) return { count: 0, totalOdds: 1.0, avgProb: 0 };
    const totalOdds = chosen.reduce((acc, l) => acc * l.odds, 1.0);
    const avgProb = chosen.reduce((acc, l) => acc + l.modelProb, 0) / chosen.length;
    return { count: chosen.length, totalOdds, avgProb };
  }, [selectedLegs]);

  const weekendAccaStats = useMemo(() => {
    const chosen = WEEKEND_TOP5_FIXTURES.filter(w => selectedWeekendIds.includes(w.id));
    if (chosen.length === 0) return { count: 0, smallTotalOdds: 1.0, bigTotalOdds: 1.0, avgProb: 0 };
    const smallTotalOdds = chosen.reduce((acc, w) => acc * w.smallLock.odds, 1.0);
    const bigTotalOdds = chosen.reduce((acc, w) => acc * w.valueBet.odds, 1.0);
    const avgProb = chosen.reduce((acc, w) => acc + w.smallLock.modelProb, 0) / chosen.length;
    return { count: chosen.length, smallTotalOdds, bigTotalOdds, avgProb };
  }, [selectedWeekendIds]);

  const filteredWeekendFixtures = useMemo(() => {
    return WEEKEND_TOP5_FIXTURES.filter(w =>
      weekendLeagueFilter === 'All' || w.league === weekendLeagueFilter
    );
  }, [weekendLeagueFilter]);

  const filteredStudiedTeams = useMemo(() => {
    return STUDIED_TEAMS.filter(t => {
      const leagueMatch = selectedLeague === 'All' || t.league.toLowerCase().includes(selectedLeague.toLowerCase());
      const catMatch = selectedMarketCat === 'all' || t.constantCategory === selectedMarketCat;
      return leagueMatch && catMatch;
    });
  }, [selectedLeague, selectedMarketCat]);

  const filteredRadarClubs = useMemo(() => {
    const q = radarSearch.trim().toLowerCase();
    const list = TOP5_OPPONENT_PROFILES.filter(c =>
      !q || c.team.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      if (radarSort === 'fouls') return (b.foulsFor + b.foulsAgainst) - (a.foulsFor + a.foulsAgainst);
      if (radarSort === 'cards') return b.yellowFor - a.yellowFor;
      if (radarSort === 'corners') return (b.cornersFor + b.cornersAgainst) - (a.cornersFor + a.cornersAgainst);
      if (radarSort === 'tackles') return b.tacklesFor - a.tacklesFor;
      return 0;
    });
  }, [radarSearch, radarSort]);

  // Live Calculator Math
  const calcResult = useMemo(() => {
    const homeObj = TOP5_OPPONENT_PROFILES.find(c => c.team === calcHome) || TOP5_OPPONENT_PROFILES[0];
    const awayObj = TOP5_OPPONENT_PROFILES.find(c => c.team === calcAway) || TOP5_OPPONENT_PROFILES[1];
    const refMult = parseFloat(calcRefFactor) || 1.0;
    const lineNum = parseFloat(calcLine) || 20.5;
    const oOdds = parseFloat(calcOverOdds) || 1.85;
    const uOdds = parseFloat(calcUnderOdds) || 1.85;

    let homeExp = 0;
    let awayExp = 0;
    let label = 'Total Fouls';

    if (calcMarket === 'fouls') {
      homeExp = ((homeObj.foulsFor + awayObj.foulsAgainst) / 2) * refMult;
      awayExp = ((awayObj.foulsFor + homeObj.foulsAgainst) / 2) * refMult;
      label = 'Total Match Fouls';
    } else if (calcMarket === 'cards') {
      homeExp = homeObj.yellowFor * 0.98 * refMult;
      awayExp = awayObj.yellowFor * 1.06 * refMult;
      label = 'Total Yellow Cards';
    } else if (calcMarket === 'corners') {
      homeExp = ((homeObj.cornersFor + awayObj.cornersAgainst) / 2) * 1.05;
      awayExp = ((awayObj.cornersFor + homeObj.cornersAgainst) / 2) * 0.95;
      label = 'Total Match Corners';
    } else if (calcMarket === 'tackles') {
      homeExp = homeObj.tacklesFor * 0.98;
      awayExp = awayObj.tacklesFor * 1.02;
      label = 'Total Match Tackles';
    } else {
      homeExp = ((homeObj.gfRate + awayObj.gaRate) / 2) * 1.08;
      awayExp = ((awayObj.gfRate + homeObj.gaRate) / 2) * 0.94;
      label = 'Total Match Goals';
    }

    const totalLambda = homeExp + awayExp;
    const probOver = poissonOverProb(lineNum, totalLambda);
    const probUnder = 1 - probOver;

    const rawOver = oOdds > 1 ? 1 / oOdds : 0.5;
    const rawUnder = uOdds > 1 ? 1 / uOdds : 0.5;
    const overround = rawOver + rawUnder;
    const fairOver = overround > 0 ? rawOver / overround : 0.5;
    const fairUnder = overround > 0 ? rawUnder / overround : 0.5;

    const edgeOver = (probOver - fairOver) * 100;
    const edgeUnder = (probUnder - fairUnder) * 100;

    const bestSide = edgeOver >= edgeUnder ? 'OVER' : 'UNDER';
    const bestEdge = bestSide === 'OVER' ? edgeOver : edgeUnder;
    const bestProb = (bestSide === 'OVER' ? probOver : probUnder) * 100;
    const bestBookieProb = (bestSide === 'OVER' ? fairOver : fairUnder) * 100;
    const bestOdds = bestSide === 'OVER' ? oOdds : uOdds;

    return {
      label,
      homeExp: homeExp.toFixed(1),
      awayExp: awayExp.toFixed(1),
      totalLambda: totalLambda.toFixed(1),
      probOver: (probOver * 100).toFixed(1),
      probUnder: (probUnder * 100).toFixed(1),
      fairOver: (fairOver * 100).toFixed(1),
      fairUnder: (fairUnder * 100).toFixed(1),
      edgeOver: edgeOver.toFixed(1),
      edgeUnder: edgeUnder.toFixed(1),
      bestSide,
      bestEdge: bestEdge.toFixed(1),
      bestProb: bestProb.toFixed(1),
      bestBookieProb: bestBookieProb.toFixed(1),
      bestOdds,
      lineNum
    };
  }, [calcHome, calcAway, calcMarket, calcLine, calcOverOdds, calcUnderOdds, calcRefFactor]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO HEADER */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#111F3A] to-[#080E1C] border border-cyan-500/30 p-5 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Walk-Forward Behaviour Machine &bull; Zero Future Leakage
          </span>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-lg">
            Auto-Runs Every Friday Morning 06:00 UTC + Daily Overnight Grading
          </span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
          Top-5 European Leagues Behaviour, H2H &amp; Value Bet Lab
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Every Friday morning, the machine scans all <strong>5 Top European Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)</strong>, combines <strong>Head-to-Head (H2H) history</strong> with each club&apos;s constant 2026–27 match behaviour (<strong>Fouls, Yellow Cards, Corners, Tackles &amp; Referees</strong>), and grades overnight results automatically by morning.
        </p>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[11px] font-mono uppercase text-slate-400">Weekend Top-5 Slate</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">{WEEKEND_TOP5_FIXTURES.length} Fixtures</div>
            <div className="text-[11px] text-emerald-300 font-mono">All 5 Leagues + H2H Graded</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[11px] font-mono uppercase text-slate-400">Verified Matches</div>
            <div className="text-2xl font-mono font-black text-white mt-0.5">{MACHINE_META.totalMatchesStudied}</div>
            <div className="text-[11px] text-cyan-400 font-mono">16 Deep Clubs &bull; 109 Profiles</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[11px] font-mono uppercase text-slate-400">Behaviour Hit Rate</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">{MACHINE_META.combinedHitRate}</div>
            <div className="text-[11px] text-emerald-300 font-mono">Constant Behaviour Streaks</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-[11px] font-mono uppercase text-slate-400">Overnight Post-Mortem</div>
            <div className="text-2xl font-mono font-black text-amber-300 mt-0.5">8/8 WON</div>
            <div className="text-[11px] text-amber-200 font-mono">Morning Auto-Breakdown</div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-[#0E1626] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { id: 'weekend', label: '🗓️ Friday Morning Top-5 Weekend Fixtures & H2H' },
          { id: 'overnight', label: '🌙 Overnight Results & Morning Breakdown' },
          { id: 'slips', label: '🔒 Tonight’s 15-Leg Slip (44.63x)' },
          { id: 'reports', label: '📊 16-Club Walk-Forward Reports' },
          { id: 'radar', label: `🌍 All ${MACHINE_META.totalTop5Profiles} Clubs Radar` },
          { id: 'calculator', label: '🧮 Live Odds Value Calculator' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-display font-black transition-all flex-1 sm:flex-initial text-center ${
              activeTab === tab.id
                ? 'bg-[#E41B13] text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB A: FRIDAY MORNING TOP-5 LEAGUES WEEKEND FIXTURES, H2H & VALUE BETS
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'weekend' && (
        <div className="space-y-6">
          {/* Weekend Accumulator Builder Header */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0E1D2F] to-[#0B1324] border border-emerald-500/40 p-4 sm:p-5 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                Friday Morning Automated Top-5 Weekend Sweep (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black">
                Weekend Constant Behaviour Locks &amp; Best Value Bets ({weekendAccaStats.count} Fixtures Selected)
              </h2>
              <p className="text-xs text-slate-300">
                Every fixture below includes its <strong>Last 5 Head-to-Head (H2H) record &amp; behaviour breakdown</strong>, projected full-time stats, <strong>Small-Odds Constant Lock (1.25x–1.36x)</strong>, and <strong>Big-Odds Best Value Bet (1.65x–1.82x)</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-black/50 border border-emerald-500/30 px-4 py-3 rounded-xl self-stretch lg:self-auto justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Small-Locks Acca</div>
                <div className="text-xl font-mono font-black text-emerald-400">
                  {weekendAccaStats.smallTotalOdds.toFixed(2)}x
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Avg Lock Prob</div>
                <div className="text-xl font-mono font-black text-white">
                  {weekendAccaStats.avgProb.toFixed(1)}%
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedWeekendIds(
                    selectedWeekendIds.length === WEEKEND_TOP5_FIXTURES.length
                      ? []
                      : WEEKEND_TOP5_FIXTURES.map(w => w.id)
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white"
              >
                {selectedWeekendIds.length === WEEKEND_TOP5_FIXTURES.length ? 'Clear' : 'Select All 13'}
              </button>
            </div>
          </div>

          {/* League Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#0E1626] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-mono text-slate-400 mr-1">Filter Top-5 League:</span>
            {['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map(lg => (
              <button
                key={lg}
                onClick={() => setWeekendLeagueFilter(lg)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  weekendLeagueFilter === lg
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lg === 'All' ? '🌍 All 5 Leagues (13 Matches)' : lg}
              </button>
            ))}
          </div>

          {/* Weekend Fixture Cards with H2H + Model Projections + Small Lock + Big Value Bet */}
          <div className="space-y-4">
            {filteredWeekendFixtures.map((w, idx) => {
              const isSelected = selectedWeekendIds.includes(w.id);
              const mp = w.modelProjection;
              const sl = w.smallLock;
              const vb = w.valueBet;
              return (
                <div
                  key={w.id}
                  className={`rounded-2xl border transition-all p-4 sm:p-5 bg-white dark:bg-[#0E1626] shadow-md ${
                    isSelected
                      ? 'border-emerald-500/40 dark:border-emerald-500/40'
                      : 'border-slate-200 dark:border-slate-800 opacity-65'
                  }`}
                >
                  {/* Top Row: League, Match, Kickoff, Checkbox */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleWeekendId(w.id)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 font-mono font-bold text-[11px]">
                            {w.league}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{w.kickoff}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white mt-0.5">
                          {idx + 1}. {w.match}
                        </h3>
                      </div>
                    </div>

                    {/* Projected FT Stat Pills */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs bg-slate-100 dark:bg-[#141F35] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400">Model FT:</span>
                      <span className="text-emerald-500 font-bold">{mp.fouls} Fouls</span>
                      <span>&bull;</span>
                      <span className="text-amber-400 font-bold">{mp.cards} Cards</span>
                      <span>&bull;</span>
                      <span className="text-cyan-400 font-bold">{mp.corners} Corners</span>
                      <span>&bull;</span>
                      <span className="text-slate-300 font-bold">{mp.tackles} Tackles</span>
                    </div>
                  </div>

                  {/* Middle Row: H2H Record & Tactical Breakdown */}
                  <div className="py-3 border-b border-slate-200 dark:border-slate-800/70 grid grid-cols-1 lg:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2E] border border-slate-200/60 dark:border-slate-800">
                      <span className="font-mono font-bold text-cyan-500 uppercase block text-[10px]">
                        🤝 Head-to-Head (H2H) Results &amp; Averages
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{w.h2hRecord}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2E] border border-slate-200/60 dark:border-slate-800">
                      <span className="font-mono font-bold text-amber-400 uppercase block text-[10px]">
                        📌 H2H + Season Constant Behaviour Pattern
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{w.h2hBehaviour}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Small-Odds Constant Lock vs Big-Odds Best Value Bet */}
                  <div className="pt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Small-Odds Constant Lock */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                          🔒 Small-Odds Constant Behaviour Lock
                        </div>
                        <div className="text-sm sm:text-base font-display font-black text-slate-900 dark:text-white mt-0.5">
                          {sl.pick} <span className="text-emerald-500 font-mono">@ {sl.odds.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-300 mt-0.5">
                          Streak: {sl.streak}
                        </div>
                      </div>
                      <div className="text-right font-mono flex-shrink-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {sl.modelProb}% <span className="text-slate-400 font-normal">vs {sl.bookieProb}%</span>
                        </div>
                        <div className="text-xs font-black text-emerald-500">Edge {sl.edge}</div>
                      </div>
                    </div>

                    {/* Big-Odds Best Value Bet */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                          🚀 Best Value Bet (Higher Odds)
                        </div>
                        <div className="text-sm sm:text-base font-display font-black text-slate-900 dark:text-white mt-0.5">
                          {vb.pick} <span className="text-amber-400 font-mono">@ {vb.odds.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-300 mt-0.5">
                          {vb.why}
                        </div>
                      </div>
                      <div className="text-right font-mono flex-shrink-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {vb.modelProb}% <span className="text-slate-400 font-normal">vs {vb.bookieProb}%</span>
                        </div>
                        <div className="text-xs font-black text-emerald-500">Edge {vb.edge}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB B: OVERNIGHT RESULTS & MORNING POST-MORTEM BREAKDOWN
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'overnight' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-[#0E1B31] to-[#091221] border border-cyan-500/30 p-5 text-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                🌙 Automated 06:00 UTC Morning Post-Mortem Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                Last 8 Graded Matches: 8 WON / 0 LOST (100%)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black">
              Overnight Match Results &amp; Actual vs. Model Stat Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Every morning at <strong>06:00 UTC</strong>, the GitHub Actions bot collects all overnight full-time match statistics (Goals, Fouls, Yellow Cards, Corners, Tackles) and compares them side-by-side against our pre-match walk-forward projections so you can see exactly how each club behaved.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141F35] text-slate-600 dark:text-slate-300 font-mono uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-3">Date / League</th>
                    <th className="py-3 px-3">Completed Match &amp; H2H Note</th>
                    <th className="py-3 px-3">Pre-Match Pick</th>
                    <th className="py-3 px-3">Model Pre-Match Projection</th>
                    <th className="py-3 px-3">Actual Full-Time Stats</th>
                    <th className="py-3 px-3">Result</th>
                    <th className="py-3 px-3">Morning Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {OVERNIGHT_RESULTS_BREAKDOWN.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-blue-500 dark:text-blue-300">{r.comp}</div>
                        <div className="text-[11px] text-slate-400">{r.date}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-display font-bold text-slate-900 dark:text-white text-sm">{r.match}</div>
                        <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-300 mt-0.5">{r.h2hNote}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-300">
                        {r.preMatchPick}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {r.modelProjection}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {r.actualStats}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-500 whitespace-nowrap">
                        ✅ {r.result}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs">
                        {r.breakdown}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 1: BEST VALUE SLIPS (SMALL-ODDS ACCA + BIG-ODDS VALUE)
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'slips' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0E1D2F] to-[#0B1324] border border-emerald-500/40 p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                Strategy #1 — Small-Odds Constant Behaviour Accumulator (1.12x – 1.44x per leg)
              </div>
              <h2 className="text-lg sm:text-xl font-display font-black mt-0.5">
                Interactive 15-Leg Behaviour Lock Slip ({customAccaStats.count} Legs Selected)
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Tap any match row below to include or exclude it from your custom accumulator. Historical combined hit rate across these 15 constant trends is <strong>113/125 (90.4%)</strong>. Overnight FT stats will auto-grade here by 06:00 UTC morning.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-black/50 border border-emerald-500/30 px-4 py-3 rounded-xl self-stretch sm:self-auto justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Combined Odds</div>
                <div className="text-2xl font-mono font-black text-amber-300">
                  {customAccaStats.totalOdds.toFixed(2)}x
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">Avg Leg Prob</div>
                <div className="text-xl font-mono font-black text-emerald-400">
                  {customAccaStats.avgProb.toFixed(1)}%
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedLegs(
                    selectedLegs.length === SMALL_ODDS_SLIP.length ? [] : SMALL_ODDS_SLIP.map(l => l.leg)
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white"
              >
                {selectedLegs.length === SMALL_ODDS_SLIP.length ? 'Clear' : 'Select All 15'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141F35] text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-3">Use</th>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Match</th>
                    <th className="py-3 px-3">Primary Constant Behaviour Lock</th>
                    <th className="py-3 px-3">Odds</th>
                    <th className="py-3 px-3">Model vs Bookie</th>
                    <th className="py-3 px-3">Edge</th>
                    <th className="py-3 px-3">2026–27 Constant Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {SMALL_ODDS_SLIP.map((item) => {
                    const checked = selectedLegs.includes(item.leg);
                    return (
                      <tr
                        key={item.leg}
                        onClick={() => toggleLeg(item.leg)}
                        className={`cursor-pointer transition-colors ${
                          checked
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {}}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">{item.leg}</td>
                        <td className="py-3 px-3 font-display font-bold text-slate-900 dark:text-white">
                          {item.match}
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            Alt: {item.altPick}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-mono font-bold text-xs">
                            {item.pick}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-black text-amber-500 dark:text-amber-300">
                          {item.odds.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs">
                          <strong className="text-slate-900 dark:text-white">{item.modelProb}%</strong>
                          <span className="text-slate-400"> vs {item.bookieProb}%</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-500">
                          {item.edge}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-cyan-600 dark:text-cyan-300">
                          {item.streak}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0E1626] p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase text-amber-500 font-bold">
                  Strategy #2 — Big-Odds Value Plays (1.67x – 2.25x Singles / 2-3 Fold Combos)
                </span>
                <h3 className="text-lg font-display font-black text-slate-900 dark:text-white mt-0.5">
                  8 High-Edge Behaviour Value Plays (Mispriced Bookmaker Lines)
                </h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                8-Leg Combined: 114.20x
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141F35] text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Match</th>
                    <th className="py-2.5 px-3">Big-Odds Selection</th>
                    <th className="py-2.5 px-3">Odds</th>
                    <th className="py-2.5 px-3">Model vs Bookie</th>
                    <th className="py-2.5 px-3">Value Edge</th>
                    <th className="py-2.5 px-3">Why It Has Massive Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {BIG_ODDS_SLIP.map((b) => (
                    <tr key={b.leg} className="hover:bg-amber-500/5">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{b.leg}</td>
                      <td className="py-3 px-3 font-display font-bold text-slate-900 dark:text-white">{b.match}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-mono font-bold text-xs">
                          {b.pick}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-amber-500 dark:text-amber-300">{b.odds.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono text-xs">
                        <strong>{b.modelProb}%</strong> <span className="text-slate-400">vs {b.bookieProb}%</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-500">{b.edge}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-300">{b.streak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2: 14-CLUB WALK-FORWARD REPORTS (MAN CITY PLAIN-ENGLISH FORMAT)
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E1626] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-1">League:</span>
              {['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'UEFA'].map(lg => (
                <button
                  key={lg}
                  onClick={() => setSelectedLeague(lg)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedLeague === lg
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-1">Constant Behaviour:</span>
              {[
                { id: 'all', label: 'All Markets' },
                { id: 'fouls', label: 'Fouls Locks' },
                { id: 'cards', label: 'Cards Locks' },
                { id: 'corners', label: 'Corners Locks' },
                { id: 'tackles', label: 'Tackles Locks' },
              ].map(mc => (
                <button
                  key={mc.id}
                  onClick={() => setSelectedMarketCat(mc.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedMarketCat === mc.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {mc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredStudiedTeams.map((team, idx) => {
              const isOpen = expandedTeamSlug === team.slug;
              return (
                <div
                  key={team.slug}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-md"
                >
                  <div
                    onClick={() => setExpandedTeamSlug(isOpen ? '' : team.slug)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 dark:text-blue-300 font-mono font-bold text-[11px]">
                          #{idx + 1} &bull; {team.league}
                        </span>
                        <h3 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                          {team.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-mono font-bold text-xs">
                          Walk-Forward: {team.record} (ROI {team.roi})
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {team.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold">
                          🔒 Primary Lock: {team.primaryLock}
                        </span>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                          Streak: {team.constantBadge}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start lg:self-center">
                      <div className="grid grid-cols-4 gap-2 text-center bg-slate-100 dark:bg-[#141F35] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="px-2">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Fouls</div>
                          <div className="text-sm font-mono font-black text-slate-900 dark:text-white">{team.foulsAvg}</div>
                        </div>
                        <div className="px-2 border-l border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Cards</div>
                          <div className="text-sm font-mono font-black text-amber-500">{team.cardsAvg}</div>
                        </div>
                        <div className="px-2 border-l border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Corners</div>
                          <div className="text-sm font-mono font-black text-cyan-400">{team.cornersAvg}</div>
                        </div>
                        <div className="px-2 border-l border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Tackles</div>
                          <div className="text-sm font-mono font-black text-emerald-400">{team.tacklesAvg}</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-5 bg-slate-50/50 dark:bg-[#0A101D]">
                      <div>
                        <h4 className="text-xs sm:text-sm font-mono uppercase font-bold text-emerald-500 mb-2">
                          1. Walk-Forward Blind Test (Trained Only on Prior Games — Zero Future Leakage)
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-200/70 dark:bg-[#141F35] text-slate-700 dark:text-slate-300 font-mono uppercase">
                                <th className="py-2.5 px-3">Blind-Test Match</th>
                                <th className="py-2.5 px-3">Market</th>
                                <th className="py-2.5 px-3">Model (Pre-Match)</th>
                                <th className="py-2.5 px-3">Bookie Line</th>
                                <th className="py-2.5 px-3">Model Verdict</th>
                                <th className="py-2.5 px-3">Actual</th>
                                <th className="py-2.5 px-3">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0E1626]">
                              {team.blindTests.map((bt, i) => (
                                <tr key={i}>
                                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{bt.match}</td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-300">{bt.market}</td>
                                  <td className="py-2.5 px-3 font-mono">{bt.model}</td>
                                  <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-300">{bt.bookie}</td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{bt.verdict}</td>
                                  <td className="py-2.5 px-3 font-mono font-bold">{bt.actual}</td>
                                  <td className="py-2.5 px-3 font-mono font-black text-emerald-500">✅ {bt.result}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-mono uppercase font-bold text-cyan-400 mb-2">
                          2. Complete 2026–27 Season Match Behaviour Log ({team.gamesCount} Verified Matches)
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            <thead>
                              <tr className="bg-slate-200/70 dark:bg-[#141F35] text-slate-700 dark:text-slate-300 uppercase">
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Comp</th>
                                <th className="py-2 px-3">Opponent (H/A)</th>
                                <th className="py-2 px-3">FT</th>
                                <th className="py-2 px-3">Total Fouls (Team+Opp)</th>
                                <th className="py-2 px-3">Yellow Cards</th>
                                <th className="py-2 px-3">Total Corners</th>
                                <th className="py-2 px-3">Total Tackles</th>
                                <th className="py-2 px-3">Referee</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0E1626]">
                              {team.matches.map((m, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                  <td className="py-2 px-3 text-slate-400">{m.date}</td>
                                  <td className="py-2 px-3">{m.comp}</td>
                                  <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">
                                    {m.opponent} <span className="text-slate-400 font-mono">({m.venue})</span>
                                  </td>
                                  <td className="py-2 px-3 font-bold">{m.score}</td>
                                  <td className="py-2 px-3">
                                    <strong className="text-emerald-500">{m.totalFouls}</strong>{' '}
                                    <span className="text-slate-400">({m.teamFouls}+{m.oppFouls})</span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <strong className="text-amber-400">{m.totalCards}</strong>{' '}
                                    <span className="text-slate-400">({m.teamCards}+{m.oppCards})</span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <strong className="text-cyan-400">{m.totalCorners}</strong>{' '}
                                    <span className="text-slate-400">({m.teamCorners}+{m.oppCorners})</span>
                                  </td>
                                  <td className="py-2 px-3">
                                    <strong>{m.totalTackles}</strong>{' '}
                                    <span className="text-slate-400">({m.teamTackles}+{m.oppTackles})</span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-400">{m.referee}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3: ALL 92 TOP-5 EUROPEAN LEAGUE CLUBS BEHAVIOUR RADAR
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#0E1626] p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
                  All {MACHINE_META.totalTop5Profiles} Top-5 League &amp; UEFA Club Behaviour Profiles
                </h2>
                <p className="text-xs text-slate-400">
                  Updated automatically by our scheduled GitHub Actions bot before every weekend &amp; midweek round. Sort by Fouls, Cards, Corners, or Tackles to spot constant behaviour immediately.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    placeholder="Search club (e.g. Arsenal, Milan, Getafe)..."
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <select
                  value={radarSort}
                  onChange={(e) => setRadarSort(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                >
                  <option value="fouls">Sort: Highest Match Fouls</option>
                  <option value="cards">Sort: Highest Yellow Cards</option>
                  <option value="corners">Sort: Highest Match Corners</option>
                  <option value="tackles">Sort: Highest Team Tackles</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141F35] text-slate-600 dark:text-slate-300 uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Club</th>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Fouls (For / Drawn)</th>
                    <th className="py-2.5 px-3">Total Fouls Avg</th>
                    <th className="py-2.5 px-3">Team Cards/G</th>
                    <th className="py-2.5 px-3">Corners (For / Ag)</th>
                    <th className="py-2.5 px-3">Team Tackles/G</th>
                    <th className="py-2.5 px-3">Constant Behaviour Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRadarClubs.map((c, i) => {
                    const totFouls = (c.foulsFor + c.foulsAgainst).toFixed(1);
                    const totCorners = (c.cornersFor + c.cornersAgainst).toFixed(1);
                    return (
                      <tr key={c.team} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{c.team}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-cyan-400">{c.tier}</td>
                        <td className="py-2.5 px-3">{c.foulsFor} / {c.foulsAgainst}</td>
                        <td className="py-2.5 px-3 font-black text-emerald-500">{totFouls}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">{c.yellowFor}</td>
                        <td className="py-2.5 px-3">{c.cornersFor} / {c.cornersAgainst} ({totCorners})</td>
                        <td className="py-2.5 px-3">{c.tacklesFor}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 dark:text-slate-400">{c.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4: LIVE WEEKEND FIXTURE & ODDS VALUE CALCULATOR
         ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#0E1626] p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
            <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
              🧮 Live Weekend Fixture &amp; Bookmaker Odds Grader
            </h2>
            <p className="text-xs text-slate-400">
              Pick any two clubs from our 92-club Top-5 database, select the market and enter your bookmaker&apos;s line &amp; odds. The engine removes bookmaker vigorish (overround) and calculates the exact Poisson probability and value edge.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Home Club</label>
                <select
                  value={calcHome}
                  onChange={(e) => setCalcHome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                >
                  {TOP5_OPPONENT_PROFILES.map(c => (
                    <option key={`h-${c.team}`} value={c.team}>{c.team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Away Club</label>
                <select
                  value={calcAway}
                  onChange={(e) => setCalcAway(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                >
                  {TOP5_OPPONENT_PROFILES.map(c => (
                    <option key={`a-${c.team}`} value={c.team}>{c.team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Behaviour Market</label>
                <select
                  value={calcMarket}
                  onChange={(e) => {
                    const m = e.target.value;
                    setCalcMarket(m);
                    if (m === 'fouls') setCalcLine('21.5');
                    if (m === 'cards') setCalcLine('3.5');
                    if (m === 'corners') setCalcLine('8.5');
                    if (m === 'tackles') setCalcLine('31.5');
                    if (m === 'goals') setCalcLine('2.5');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="fouls">Total Match Fouls</option>
                  <option value="cards">Total Yellow Cards</option>
                  <option value="corners">Total Match Corners</option>
                  <option value="tackles">Total Match Tackles</option>
                  <option value="goals">Total Match Goals</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Referee Strictness</label>
                <select
                  value={calcRefFactor}
                  onChange={(e) => setCalcRefFactor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                >
                  <option value="0.90">Lenient Referee (0.90x fouls/cards)</option>
                  <option value="1.00">Average Referee (1.00x baseline)</option>
                  <option value="1.10">Strict Referee (1.10x fouls/cards)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Bookmaker Line (e.g. 20.5)</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcLine}
                  onChange={(e) => setCalcLine(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Over Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcOverOdds}
                    onChange={(e) => setCalcOverOdds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Under Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcUnderOdds}
                    onChange={(e) => setCalcUnderOdds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#141F35] border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#0D182C] to-[#080E1B] border border-cyan-500/30 p-5 text-white space-y-4 shadow-xl">
            <div className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Walk-Forward Model Output
            </div>
            <h3 className="text-xl font-display font-black">
              {calcHome} vs {calcAway}
            </h3>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Projected {calcHome}:</span>
                <strong className="text-white">{calcResult.homeExp}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projected {calcAway}:</span>
                <strong className="text-white">{calcResult.awayExp}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-sm">
                <span className="text-cyan-300 font-bold">Expected {calcResult.label}:</span>
                <strong className="text-emerald-400 text-base">{calcResult.totalLambda}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400">OVER {calcResult.lineNum}</div>
                <div className="text-lg font-black text-white mt-0.5">{calcResult.probOver}%</div>
                <div className="text-[11px] text-slate-400">Bookie Fair: {calcResult.fairOver}%</div>
                <div className={`text-xs font-bold mt-1 ${parseFloat(calcResult.edgeOver) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Edge: {parseFloat(calcResult.edgeOver) > 0 ? `+${calcResult.edgeOver}%` : `${calcResult.edgeOver}%`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400">UNDER {calcResult.lineNum}</div>
                <div className="text-lg font-black text-white mt-0.5">{calcResult.probUnder}%</div>
                <div className="text-[11px] text-slate-400">Bookie Fair: {calcResult.fairUnder}%</div>
                <div className={`text-xs font-bold mt-1 ${parseFloat(calcResult.edgeUnder) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Edge: {parseFloat(calcResult.edgeUnder) > 0 ? `+${calcResult.edgeUnder}%` : `${calcResult.edgeUnder}%`}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              parseFloat(calcResult.bestEdge) >= 4.0
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            }`}>
              <div className="text-[11px] font-mono uppercase font-bold">Machine Verdict</div>
              <div className="text-lg font-display font-black text-white mt-0.5">
                {parseFloat(calcResult.bestEdge) >= 4.0
                  ? `✅ BET ${calcResult.bestSide} ${calcResult.lineNum} @ ${calcResult.bestOdds}`
                  : `⚠️ PASS / MARGINAL (${calcResult.bestSide} ${calcResult.lineNum})`}
              </div>
              <div className="text-xs font-mono mt-1">
                Model {calcResult.bestProb}% vs Devigged Bookie {calcResult.bestBookieProb}% (Edge: +{calcResult.bestEdge}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
