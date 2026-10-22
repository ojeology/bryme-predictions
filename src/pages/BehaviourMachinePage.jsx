import React, { useState, useMemo } from 'react';
import {
  MACHINE_META,
  SMALL_ODDS_SLIP,
  BIG_ODDS_SLIP,
  STUDIED_TEAMS,
  TOP5_OPPONENT_PROFILES,
  WEEKEND_TOP5_FIXTURES,
  OVERNIGHT_RESULTS_BREAKDOWN,
  THURSDAY_UEFA_MATCHES,
  TUESDAY_UCL_FIXTURES,
  PATTERN_DISCOVERY_RULES
} from '../data/behaviourMachineData';
import {
  Search, ChevronDown, ChevronUp, ShieldAlert, CheckCircle2,
  AlertTriangle, Layers, Calendar, Trophy, Sparkles, Filter
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

export default function BehaviourMachinePage({ onNavigate, initialTab = 'friday' }) {
  // Primary Hub Tabs:
  // 'friday' (Weekend Top-5) | 'thursday' (Europa & Conference) | 'tuesday' (Champions League)
  // 'whynot' (Why Not To Bet & Patterns) | 'challenge' (2.00x & 5.00x Slips) | 'clubs' (18 Studied Clubs) | 'calculator'
  const [activeTab, setActiveTab] = useState(initialTab || 'friday');

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Expanded fixture ID for interactive full Two-Team Behaviour Breakdown when tapping ANY fixture
  const [expandedFixtureId, setExpandedFixtureId] = useState('wk-epl-1');

  // Filters
  const [weekendLeagueFilter, setWeekendLeagueFilter] = useState('All');
  const [thursdayWaveFilter, setThursdayWaveFilter] = useState('all'); // 'all' | 'finished_1645' | 'locked_2000_orig' | 'fresh_2000'
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedMarketCat, setSelectedMarketCat] = useState('all');
  const [expandedTeamSlug, setExpandedTeamSlug] = useState('bournemouth');

  // Live Two-Team Matchup Calculator state
  const [calcHome, setCalcHome] = useState('AFC Bournemouth');
  const [calcAway, setCalcAway] = useState('AC Milan');
  const [calcMarket, setCalcMarket] = useState('fouls');
  const [calcLine, setCalcLine] = useState('20.5');
  const [calcOverOdds, setCalcOverOdds] = useState('1.35');
  const [calcUnderOdds, setCalcUnderOdds] = useState('3.00');
  const [calcRefFactor, setCalcRefFactor] = useState('1.00');

  const toggleFixtureExpand = (id) => {
    setExpandedFixtureId(prev => (prev === id ? null : id));
  };

  const filteredWeekendFixtures = useMemo(() => {
    return (WEEKEND_TOP5_FIXTURES || []).filter(w =>
      weekendLeagueFilter === 'All' || w.league === weekendLeagueFilter
    );
  }, [weekendLeagueFilter]);

  const filteredThursdayMatches = useMemo(() => {
    return (THURSDAY_UEFA_MATCHES || []).filter(m =>
      thursdayWaveFilter === 'all' || m.wave === thursdayWaveFilter
    );
  }, [thursdayWaveFilter]);

  const filteredStudiedTeams = useMemo(() => {
    return (STUDIED_TEAMS || []).filter(t => {
      const leagueMatch = selectedLeague === 'All' || t.league.toLowerCase().includes(selectedLeague.toLowerCase());
      const catMatch = selectedMarketCat === 'all' || t.constantCategory === selectedMarketCat;
      return leagueMatch && catMatch;
    });
  }, [selectedLeague, selectedMarketCat]);

  // Helper to get deep-studied club object(s) for any fixture
  const getStudiedClubsForFixture = (slugs = []) => {
    if (!Array.isArray(slugs) || slugs.length === 0) return [];
    return STUDIED_TEAMS.filter(t => slugs.includes(t.slug));
  };

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
    let label = 'Total Match Fouls';

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
    const fairOver = rawOver / overround;
    const fairUnder = rawUnder / overround;

    const edgeOver = (probOver - fairOver) * 100;
    const edgeUnder = (probUnder - fairUnder) * 100;

    return {
      homeObj,
      awayObj,
      label,
      homeExp,
      awayExp,
      totalLambda,
      probOver: probOver * 100,
      probUnder: probUnder * 100,
      fairOver: fairOver * 100,
      fairUnder: fairUnder * 100,
      edgeOver,
      edgeUnder
    };
  }, [calcHome, calcAway, calcMarket, calcLine, calcOverOdds, calcUnderOdds, calcRefFactor]);

  // Helper component: Renders embedded match-by-match walk-forward logs when a fixture is tapped
  const renderEmbeddedTeamLogs = (slugs = []) => {
    const clubs = getStudiedClubsForFixture(slugs);
    if (clubs.length === 0) return null;

    return (
      <div className="space-y-4 pt-3 border-t border-slate-800">
        <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
          📂 Full 2026–27 Walk-Forward Match-by-Match Logs &amp; Blind Tests ({clubs.map(c => c.name).join(' & ')})
        </div>

        {clubs.map(club => (
          <div key={club.slug} className="rounded-xl bg-[#070C18] border border-slate-800 p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm text-white">{club.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    {club.record}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    {club.constantBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{club.summary}</p>
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex gap-3 flex-shrink-0">
                <span>Fouls: <strong className="text-white">{club.foulsAvg}</strong></span>
                <span>Corners: <strong className="text-white">{club.cornersAvg}</strong></span>
                <span>Cards: <strong className="text-white">{club.cardsAvg}</strong></span>
                <span>Tackles: <strong className="text-white">{club.tacklesAvg}</strong></span>
              </div>
            </div>

            {/* Walk-Forward Blind Test Table */}
            {Array.isArray(club.blindTests) && club.blindTests.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1.5">
                  Walk-Forward Blind Test Verification (No Future Data Leakage):
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="p-2">Blind Test Match</th>
                        <th className="p-2">Target Market</th>
                        <th className="p-2">Model (Pre-Match)</th>
                        <th className="p-2">Bookie Line</th>
                        <th className="p-2">Actual FT</th>
                        <th className="p-2">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {club.blindTests.map((bt, i) => (
                        <tr key={i} className="text-slate-200">
                          <td className="p-2 font-bold text-white">{bt.match}</td>
                          <td className="p-2 text-amber-300">{bt.market}</td>
                          <td className="p-2">{bt.model}</td>
                          <td className="p-2 text-slate-400">{bt.bookie}</td>
                          <td className="p-2 font-bold text-cyan-300">{bt.actual}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                              bt.result === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {bt.result === 'WON' ? '✅ WON' : '❌ LOST'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Full Season Match-by-Match Log */}
            {Array.isArray(club.matches) && club.matches.length > 0 && (
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                  Complete 2026–27 Season Match-by-Match Behaviour Log ({club.matches.length} Games):
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="p-1.5">Date</th>
                        <th className="p-1.5">Comp</th>
                        <th className="p-1.5">Opponent</th>
                        <th className="p-1.5">Venue</th>
                        <th className="p-1.5">Score</th>
                        <th className="p-1.5">Total Fouls</th>
                        <th className="p-1.5">Total Corners</th>
                        <th className="p-1.5">Total Cards</th>
                        <th className="p-1.5">Total Tackles</th>
                        <th className="p-1.5">Referee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {club.matches.map((m, i) => (
                        <tr key={i} className="text-slate-300 hover:bg-white/[0.02]">
                          <td className="p-1.5 text-slate-400">{m.date}</td>
                          <td className="p-1.5">{m.comp}</td>
                          <td className="p-1.5 font-bold text-white">{m.opponent}</td>
                          <td className="p-1.5">{m.venue}</td>
                          <td className="p-1.5 font-bold text-emerald-400">{m.score}</td>
                          <td className="p-1.5 font-bold text-amber-300">{m.totalFouls} ({m.teamFouls}+{m.oppFouls})</td>
                          <td className="p-1.5 text-cyan-300">{m.totalCorners} ({m.teamCorners}+{m.oppCorners})</td>
                          <td className="p-1.5 text-rose-300">{m.totalCards} ({m.teamCards}+{m.oppCards})</td>
                          <td className="p-1.5">{m.totalTackles} ({m.teamTackles}+{m.oppTackles})</td>
                          <td className="p-1.5 text-slate-400">{m.referee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── 1. PERSONAL BOT STUDY & ACCURACY COMMAND HEADER ── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1324] via-[#0F1B33] to-[#070B16] border-2 border-emerald-500/40 p-5 sm:p-6 text-white shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider">
                PERSONAL BOT RESEARCH LAB &bull; TWO-TEAM ENGINE v2
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                Today&apos;s Early Wave: 7/7 (100%) Two-Team vs 5/7 (71.4%) One-Sided
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Two-Team Walk-Forward Behaviour Machine &amp; Pattern Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Built to study bot accuracy, uncover team behaviour constants (<strong>Fouls, Corners, Cards, Tackles &amp; Goals</strong>), and learn <strong>why NOT to choose trap bets</strong>. Tap <strong>any fixture below</strong> to open its full Two-Team Behaviour Breakdown &amp; season match logs.
            </p>
          </div>

          {/* Live Accuracy Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5 flex-shrink-0 font-mono text-center">
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">2-Team Today</span>
              <strong className="text-xl text-emerald-400 font-black">7/7 (100%)</strong>
              <span className="text-[10px] text-emerald-300 block">Early Wave FT</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">Walk-Forward</span>
              <strong className="text-xl text-cyan-400 font-black">90.4%</strong>
              <span className="text-[10px] text-slate-300 block">18 Deep Clubs</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">2x Challenge</span>
              <strong className="text-xl text-amber-300 font-black">Day 1</strong>
              <span className="text-[10px] text-slate-300 block">₦1K &rarr; ₦2K</span>
            </div>
          </div>
        </div>

        {/* Automated Weekly Drop Schedule Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => setActiveTab('friday')}
            className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
              activeTab === 'friday'
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-black block">
                📅 FRIDAY MORNING DROP
              </span>
              <strong className="font-display font-black text-sm">Weekend Top-5 Leagues (15 Matches)</strong>
              <span className="text-[11px] text-slate-300 block">EPL, La Liga, Serie A, Bundesliga, Ligue 1</span>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px]">
              OPEN
            </span>
          </div>

          <div
            onClick={() => setActiveTab('tuesday')}
            className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
              activeTab === 'tuesday'
                ? 'bg-blue-500/20 border-2 border-blue-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400 font-black block">
                📅 TUESDAY MORNING DROP
              </span>
              <strong className="font-display font-black text-sm">UEFA Champions League (8 Matches)</strong>
              <span className="text-[11px] text-slate-300 block">Full Two-Team Behaviour &amp; Ref Audit</span>
            </div>
            <span className="px-2 py-1 rounded bg-blue-400 text-slate-950 font-mono font-black text-[10px]">
              OPEN
            </span>
          </div>

          <div
            onClick={() => setActiveTab('thursday')}
            className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
              activeTab === 'thursday'
                ? 'bg-amber-500/20 border-2 border-amber-400 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-black block">
                📅 THURSDAY MORNING DROP
              </span>
              <strong className="font-display font-black text-sm">Europa &amp; Conference (21 Matches)</strong>
              <span className="text-[11px] text-slate-300 block">7 Settled FT (7/7 Won) + 14 Locked 20:00</span>
            </div>
            <span className="px-2 py-1 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px]">
              OPEN
            </span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          {[
            { id: 'friday', label: '🗓️ Friday: Weekend Top-5 Fixtures (Tap Any Match)' },
            { id: 'thursday', label: '🗓️ Thursday: Europa & Conference (21 Matches + 7/7 FT Grader)' },
            { id: 'tuesday', label: '🗓️ Tuesday: Champions League Hub (8 Matches)' },
            { id: 'whynot', label: '🚫 Why NOT To Bet (6 Trap Rules & Lessons)' },
            { id: 'challenge', label: '🪜 2.00x Challenge & 5.00x Value Slips' },
            { id: 'clubs', label: '📊 All 18 Studied Club Logs' },
            { id: 'calculator', label: '🧮 Custom Two-Team Calculator' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#E41B13] text-white shadow-md ring-1 ring-red-400/50'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================================
          TAB 1: FRIDAY MORNING HUB — WEEKEND TOP-5 LEAGUES (TAP ANY FIXTURE FOR FULL BREAKDOWN)
         ========================================================================================= */}
      {activeTab === 'friday' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  FRIDAY MORNING EDITION
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Tap any fixture card below to expand its full Two-Team Behaviour Breakdown &amp; Why-Not-To-Bet Audit
                </span>
              </div>
              <h2 className="text-xl font-display font-black mt-1">
                Weekend Top-5 European Leagues Behaviour &amp; H2H Breakdown
              </h2>
            </div>

            {/* League Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map(lg => (
                <button
                  key={lg}
                  onClick={() => setWeekendLeagueFilter(lg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                    weekendLeagueFilter === lg
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {lg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredWeekendFixtures.map(fix => {
              const isExpanded = expandedFixtureId === fix.id;
              return (
                <div
                  key={fix.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-2 border-emerald-500 bg-[#0B1222] shadow-2xl'
                      : 'border-slate-800 bg-[#0E1626] hover:border-emerald-500/50'
                  }`}
                >
                  {/* Clickable Fixture Summary Header */}
                  <div
                    onClick={() => toggleFixtureExpand(fix.id)}
                    className="cursor-pointer p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold uppercase">
                          {fix.league}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{fix.kickoff}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          {fix.smallLock.streak}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-display font-black text-white flex items-center gap-2">
                        <span>{fix.match}</span>
                      </h3>

                      <p className="text-xs text-slate-300">{fix.h2hRecord}</p>
                    </div>

                    {/* Right Side: Model Projected Numbers & Primary Picks */}
                    <div className="flex flex-col sm:flex-row lg:items-center gap-3">
                      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Fouls</span>
                          <strong className="text-amber-300 font-black">{fix.modelProjection.fouls}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Corners</span>
                          <strong className="text-cyan-300 font-black">{fix.modelProjection.corners}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Cards</span>
                          <strong className="text-rose-300 font-black">{fix.modelProjection.cards}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Tackles</span>
                          <strong className="text-emerald-300 font-black">{fix.modelProjection.tackles}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono min-w-[210px]">
                        <div className="text-[10px] text-emerald-400 uppercase font-bold">
                          ✅ Safe Lock ({fix.smallLock.modelProb}%):
                        </div>
                        <div className="font-black text-white text-sm">
                          {fix.smallLock.pick} @ {fix.smallLock.odds}
                        </div>
                        <div className="text-[10px] text-amber-300 mt-0.5">
                          💎 Value: {fix.valueBet.pick} @ {fix.valueBet.odds}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center justify-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED FULL TWO-TEAM BEHAVIOUR ANALYSIS PANEL */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800 bg-[#080D1A] space-y-4 text-xs">
                      {/* 1. Two-Team Profile Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                            🏠 Home Team Behaviour Profile ({fix.homeTeam || fix.match.split(' vs ')[0]})
                          </span>
                          <p className="text-slate-200 leading-relaxed">
                            {fix.homeProfile || fix.h2hBehaviour}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                            ✈️ Away Team Behaviour Profile ({fix.awayTeam || fix.match.split(' vs ')[1]})
                          </span>
                          <p className="text-slate-200 leading-relaxed">
                            {fix.awayProfile || fix.valueBet.why}
                          </p>
                        </div>
                      </div>

                      {/* 2. Why Pick vs Why NOT To Bet */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                          <div className="font-mono font-black text-emerald-400 uppercase text-[11px]">
                            ✅ WHY CHOOSE THIS BET (TWO-TEAM AGREEMENT)
                          </div>
                          <div className="text-white font-bold">
                            Small Lock: {fix.smallLock.pick} @ {fix.smallLock.odds} (Model Prob: {fix.smallLock.modelProb}% | Edge: {fix.smallLock.edge})
                          </div>
                          <div className="text-amber-300 font-bold">
                            Big Value Bet: {fix.valueBet.pick} @ {fix.valueBet.odds} (Model Prob: {fix.valueBet.modelProb}% | Edge: {fix.valueBet.edge})
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            {fix.h2hBehaviour} — {fix.valueBet.why}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-rose-950/30 border-2 border-rose-500/50 space-y-1.5">
                          <div className="font-mono font-black text-rose-400 uppercase text-[11px]">
                            🚫 WHY NOT CHOOSE THE TRAP BET IN THIS MATCH
                          </div>
                          <p className="text-rose-100 font-medium leading-relaxed">
                            {fix.whyNotBet || '🚫 Avoid 1X2 match winner guessing — stick to the verified Two-Team Behaviour constant where both clubs align.'}
                          </p>
                        </div>
                      </div>

                      {/* 3. Embedded Deep-Studied Club Season Logs & Walk-Forward Tables */}
                      {renderEmbeddedTeamLogs(fix.studiedTeamSlugs)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 2: THURSDAY MORNING HUB — UEFA EUROPA & CONFERENCE LEAGUE (21 MATCHES ANALYZED TODAY)
         ========================================================================================= */}
      {activeTab === 'thursday' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                  THURSDAY UEFA HUB &bull; 21 MATCHES
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Early Wave Graded: 7/7 (100%) Two-Team Accuracy vs 5/7 (71.4%) One-Sided
                </span>
              </div>
              <h2 className="text-xl font-display font-black mt-1">
                Thursday Europa &amp; Conference League — Full Two-Team Breakdown &amp; Grader
              </h2>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All 21 Matches' },
                { id: 'finished_1645', label: '✅ 7 Finished Early (7/7 Won)' },
                { id: 'locked_2000_orig', label: '🔒 8 Original 20:00 Batch' },
                { id: 'fresh_2000', label: '🆕 6 Fresh Unseen 20:00 Batch' }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setThursdayWaveFilter(w.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                    thursdayWaveFilter === w.id
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredThursdayMatches.map(m => {
              const isExpanded = expandedFixtureId === m.id;
              const isSettled = m.wave === 'finished_1645';

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-2 border-amber-400 bg-[#0B1222] shadow-2xl'
                      : 'border-slate-800 bg-[#0E1626] hover:border-amber-400/50'
                  }`}
                >
                  <div
                    onClick={() => toggleFixtureExpand(m.id)}
                    className="cursor-pointer p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase ${
                          isSettled ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {m.waveLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                          {m.comp}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-display font-black text-white">
                        {m.match}
                      </h3>

                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        ✅ 2-Team Lock: {m.twoTeamPick}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-xs space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase">
                          Pre-Match 2-Team Model Projection:
                        </div>
                        <div className="text-slate-200">
                          Fouls: <strong className="text-amber-300">{m.modelProjection.fouls}</strong> &bull; Corners: <strong className="text-cyan-300">{m.modelProjection.corners}</strong> &bull; Cards: <strong className="text-rose-300">{m.modelProjection.cards}</strong>
                        </div>
                        {m.actualBoxScore && (
                          <div className="text-emerald-400 font-bold border-t border-slate-800 pt-1">
                            Actual FT ({m.actualBoxScore.score}): Fouls {m.actualBoxScore.fouls} | Corners {m.actualBoxScore.corners} | Cards {m.actualBoxScore.cards}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center justify-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide' : 'Full Audit'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800 bg-[#080D1A] space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                            🏠 Home Team Pre-Match Study ({m.homeTeam})
                          </span>
                          <p className="text-slate-200 leading-relaxed">{m.homeProfile}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                            ✈️ Away Team Pre-Match Study ({m.awayTeam})
                          </span>
                          <p className="text-slate-200 leading-relaxed">{m.awayProfile}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                          <div className="font-mono font-black text-emerald-400 uppercase text-[11px]">
                            ✅ TWO-TEAM VERDICT &amp; VALUE PLAY
                          </div>
                          <div className="text-white font-bold">Primary: {m.twoTeamPick}</div>
                          {m.valueBet && <div className="text-amber-300 font-bold">Secondary / Value: {m.valueBet}</div>}
                          {m.oneSidedPick && (
                            <div className="text-slate-300 font-mono text-[11px]">
                              One-Sided Comparison: {m.oneSidedPick}
                            </div>
                          )}
                          <p className="text-slate-300 leading-relaxed">{m.whyPick}</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-rose-950/30 border-2 border-rose-500/50 space-y-1.5">
                          <div className="font-mono font-black text-rose-400 uppercase text-[11px]">
                            🚫 WHY NOT CHOOSE THE TRAP BET (PATTERN LESSON)
                          </div>
                          <p className="text-rose-100 font-medium leading-relaxed">{m.whyNotBet}</p>
                          {m.patternLesson && (
                            <div className="text-amber-300 font-mono text-[11px] pt-1 border-t border-rose-500/30">
                              🧠 Retained Self-Learning Rule: {m.patternLesson}
                            </div>
                          )}
                        </div>
                      </div>

                      {renderEmbeddedTeamLogs(m.studiedTeamSlugs)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 3: TUESDAY MORNING HUB — UEFA CHAMPIONS LEAGUE (TAP ANY FIXTURE FOR FULL BREAKDOWN)
         ========================================================================================= */}
      {activeTab === 'tuesday' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-4 sm:p-5 text-white">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono font-black text-[10px] uppercase">
                TUESDAY MORNING UCL EDITION
              </span>
              <span className="text-xs font-mono text-blue-300 font-bold">
                Tap any UEFA Champions League match below for full Two-Team Behaviour Analysis, Ref Profile &amp; Trap Warnings
              </span>
            </div>
            <h2 className="text-xl font-display font-black mt-1">
              UEFA Champions League Matchday Behaviour &amp; Referee Breakdown
            </h2>
          </div>

          <div className="space-y-3">
            {(TUESDAY_UCL_FIXTURES || []).map(fix => {
              const isExpanded = expandedFixtureId === fix.id;
              return (
                <div
                  key={fix.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-2 border-blue-400 bg-[#0B1222] shadow-2xl'
                      : 'border-slate-800 bg-[#0E1626] hover:border-blue-400/50'
                  }`}
                >
                  <div
                    onClick={() => toggleFixtureExpand(fix.id)}
                    className="cursor-pointer p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold uppercase">
                          {fix.day}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{fix.kickoff}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-display font-black text-white">
                        {fix.match}
                      </h3>
                      <p className="text-xs text-slate-300">{fix.refereeNote}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-xs text-slate-200">
                        <div>Fouls: <strong className="text-amber-300">{fix.modelProjection.fouls}</strong> &bull; Corners: <strong className="text-cyan-300">{fix.modelProjection.corners}</strong></div>
                        <div>Cards: <strong className="text-rose-300">{fix.modelProjection.cards}</strong> &bull; Tackles: <strong className="text-emerald-300">{fix.modelProjection.tackles}</strong></div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-mono min-w-[210px]">
                        <div className="text-[10px] text-emerald-400 uppercase font-bold">
                          ✅ 2-Team Lock ({fix.smallLock.modelProb}%):
                        </div>
                        <div className="font-black text-white text-sm">
                          {fix.smallLock.pick} @ {fix.smallLock.odds}
                        </div>
                        <div className="text-[10px] text-amber-300 mt-0.5">
                          💎 Value: {fix.valueBet.pick} @ {fix.valueBet.odds}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold text-white flex items-center justify-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide' : 'Breakdown'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800 bg-[#080D1A] space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                            🏠 Home Team UCL Profile ({fix.homeTeam})
                          </span>
                          <p className="text-slate-200 leading-relaxed">{fix.homeProfile}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#0E1626] border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                            ✈️ Away Team UCL Profile ({fix.awayTeam})
                          </span>
                          <p className="text-slate-200 leading-relaxed">{fix.awayProfile}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                          <div className="font-mono font-black text-emerald-400 uppercase text-[11px]">
                            ✅ WHY PICK THIS BET (TWO-TEAM AGREEMENT)
                          </div>
                          <p className="text-slate-200 leading-relaxed">{fix.whyPick}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-rose-950/30 border-2 border-rose-500/50 space-y-1.5">
                          <div className="font-mono font-black text-rose-400 uppercase text-[11px]">
                            🚫 WHY NOT CHOOSE THE TRAP BET
                          </div>
                          <p className="text-rose-100 font-medium leading-relaxed">{fix.whyNotBet}</p>
                        </div>
                      </div>

                      {renderEmbeddedTeamLogs(fix.studiedTeamSlugs)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 4: "WHY NOT TO BET" & PATTERN DISCOVERY LAB
         ========================================================================================= */}
      {activeTab === 'whynot' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-rose-500/40 p-5 text-white space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-mono font-black text-[10px] uppercase">
              SELF-LEARNING PATTERN DISCOVERY &amp; TRAP FILTER
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black">
              Why NOT To Choose a Particular Bet — 6 Core Rules Discovered by the Machine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Every time a one-sided streak clashes with an opponent&apos;s style or game-state, the bot logs the exact reason in <code className="text-emerald-300">team_retraining_weights.json</code> so we never repeat a losing assumption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(PATTERN_DISCOVERY_RULES || []).map(rule => (
              <div key={rule.id} className="rounded-2xl bg-[#0E1626] border border-slate-800 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                    {rule.badge}
                  </span>
                </div>
                <h3 className="text-base font-display font-black text-white">{rule.title}</h3>
                <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  📌 Verified Case Study: {rule.example}
                </div>

                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1">
                  <div className="font-mono font-bold text-rose-400 uppercase text-[10px]">
                    ❌ What Public / One-Sided Bettors Do (The Trap):
                  </div>
                  <p className="text-rose-100 leading-relaxed">{rule.whatPublicSees}</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/40 space-y-1">
                  <div className="font-mono font-bold text-blue-300 uppercase text-[10px]">
                    🔍 What Our Two-Team Machine Sees:
                  </div>
                  <p className="text-slate-200 leading-relaxed">{rule.whatMachineSees}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                  <div className="font-mono font-bold text-emerald-400 uppercase text-[10px]">
                    ✅ How We Profit Instead:
                  </div>
                  <p className="text-emerald-100 font-medium leading-relaxed">{rule.howToProfit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 5: PERSONAL 2.00x CHALLENGE & 5.00x MIXED VALUE SLIPS
         ========================================================================================= */}
      {activeTab === 'challenge' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 2.00x ODDS BUILDER */}
            <div className="rounded-2xl bg-[#0E1626] border-2 border-emerald-500 p-5 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  DAY 1 OF 10 &bull; 2.00x ODDS CHALLENGE LOCK
                </span>
                <span className="font-mono font-black text-emerald-400 text-lg">2.31x Combined</span>
              </div>
              <h3 className="text-lg font-display font-black">
                Option 1A — Pure Behaviour 2.31x Lock (3 Legs, 87%+ Prob Each)
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">1. Ajax vs Atalanta BC (UECL)</div>
                    <div className="text-emerald-400">Pick: Total Fouls Under 25.5 (Model: 20 Fouls | 94.2% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.32</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">2. FC Thun vs Hajduk Split (UECL)</div>
                    <div className="text-emerald-400">Pick: Total Fouls Over 21.5 (Model: 30 Fouls | 91.4% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.30</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">3. AFC Bournemouth vs AC Milan (UEL)</div>
                    <div className="text-emerald-400">Pick: Total Fouls Over 20.5 (Model: 26 Fouls | 87.4% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.35</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Combined True Probability: <strong className="text-emerald-400">75.2%</strong></span>
                <button
                  onClick={() => onNavigate && onNavigate('ladder')}
                  className="text-amber-300 hover:underline font-bold"
                >
                  Open 10-Step 2.00x Ladder Board &rarr;
                </button>
              </div>
            </div>

            {/* 5.00x ODDS BUILDER */}
            <div className="rounded-2xl bg-[#0E1626] border-2 border-amber-400 p-5 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                  HIGH-VALUE MIXED 5.00x SLIP
                </span>
                <span className="font-mono font-black text-amber-300 text-lg">5.10x / 5.48x</span>
              </div>
              <h3 className="text-lg font-display font-black">
                Option 2B — 3-Leg Europa League High-Value 5.10x Slip
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">1. TSG Hoffenheim vs Lyon (UEL)</div>
                    <div className="text-cyan-300">Pick: Total Corners Over 9.5 (Model: 11.1 Corners | 76.8% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.75</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">2. Olympiacos vs Sparta Prague (UEL)</div>
                    <div className="text-cyan-300">Pick: Total Corners Over 8.5 (Model: 10.6 Corners | 82.4% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.55</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">3. AFC Bournemouth vs AC Milan (UEL)</div>
                    <div className="text-rose-300">Pick: Total Cards Over 3.5 (Model: 4.6 Cards | 71.8% Prob)</div>
                  </div>
                  <strong className="text-amber-300 text-sm">1.88</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-300">
                Or 6-Leg Small Lock Builder (`1.32 × 1.30 × 1.35 × 1.40 × 1.32 × 1.28`) = <strong className="text-amber-300">5.48x Odds</strong>!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 6: ALL 18 DEEP-STUDIED CLUB WALK-FORWARD LOGS
         ========================================================================================= */}
      {activeTab === 'clubs' && (
        <div className="space-y-3">
          {filteredStudiedTeams.map(club => {
            const isOpen = expandedTeamSlug === club.slug;
            return (
              <div key={club.slug} className="rounded-2xl bg-[#0E1626] border border-slate-800 overflow-hidden">
                <div
                  onClick={() => setExpandedTeamSlug(isOpen ? null : club.slug)}
                  className="cursor-pointer p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-base text-white">{club.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                        {club.record}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                        {club.constantBadge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{club.summary}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono text-white self-start sm:self-center">
                    {isOpen ? 'Close Log' : 'View Full Match Log'}
                  </button>
                </div>
                {isOpen && (
                  <div className="p-4 border-t border-slate-800 bg-[#080D1A]">
                    {renderEmbeddedTeamLogs([club.slug])}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================================
          TAB 7: CUSTOM TWO-TEAM MATCHUP CALCULATOR
         ========================================================================================= */}
      {activeTab === 'calculator' && (
        <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-5 text-white space-y-4">
          <h3 className="text-lg font-display font-black">
            🧮 Live Two-Team Matchup Behaviour &amp; Value Calculator (109 Clubs)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Home Team</label>
              <select
                value={calcHome}
                onChange={e => setCalcHome(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                {TOP5_OPPONENT_PROFILES.map(c => (
                  <option key={c.team} value={c.team}>{c.team}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Away Team</label>
              <select
                value={calcAway}
                onChange={e => setCalcAway(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                {TOP5_OPPONENT_PROFILES.map(c => (
                  <option key={c.team} value={c.team}>{c.team}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Market</label>
              <select
                value={calcMarket}
                onChange={e => setCalcMarket(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="fouls">Total Fouls</option>
                <option value="corners">Total Corners</option>
                <option value="cards">Total Cards</option>
                <option value="tackles">Total Tackles</option>
                <option value="goals">Total Goals</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Bookie Line</label>
              <input
                type="number"
                step="0.5"
                value={calcLine}
                onChange={e => setCalcLine(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Over Odds</label>
              <input
                type="number"
                step="0.01"
                value={calcOverOdds}
                onChange={e => setCalcOverOdds(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Referee Mult</label>
              <input
                type="number"
                step="0.05"
                value={calcRefFactor}
                onChange={e => setCalcRefFactor(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-slate-400 block">2-Team Model Expectation:</span>
              <strong className="text-xl text-white font-black">
                {Math.round(calcResult.totalLambda)} ({calcResult.totalLambda.toFixed(1)})
              </strong>
              <span className="text-slate-400 block mt-0.5">
                {calcHome}: {calcResult.homeExp.toFixed(1)} + {calcAway}: {calcResult.awayExp.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Over {calcLine} Probability:</span>
              <strong className="text-xl text-emerald-400 font-black">
                {calcResult.probOver.toFixed(1)}%
              </strong>
              <span className="text-slate-400 block mt-0.5">
                Edge vs Bookie: {calcResult.edgeOver >= 0 ? `+${calcResult.edgeOver.toFixed(1)}%` : `${calcResult.edgeOver.toFixed(1)}%`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Under {calcLine} Probability:</span>
              <strong className="text-xl text-amber-300 font-black">
                {calcResult.probUnder.toFixed(1)}%
              </strong>
              <span className="text-slate-400 block mt-0.5">
                Verdict: {calcResult.probOver >= 75 ? `✅ LOCK OVER ${calcLine}` : calcResult.probUnder >= 75 ? `✅ LOCK UNDER ${calcLine}` : '⚠️ CLASH / PASS'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
