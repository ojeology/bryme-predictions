import React, { useState, useMemo } from 'react';
import {
  STUDIED_TEAMS,
  TOP5_OPPONENT_PROFILES,
  WEEKEND_TOP5_FIXTURES,
  THURSDAY_UEFA_MATCHES,
  TUESDAY_UCL_FIXTURES,
  PATTERN_DISCOVERY_RULES
} from '../data/behaviourMachineData';
import {
  OFFICIAL_3X_ROLLOVER,
  FRIDAY_23_OCT_REEVALUATION,
  FRIDAY_GLOBAL_OVER_HIGHLIGHTS,
  SPECIALIST_100_VAULT,
  UEFA_54_LEDGER_SUMMARY,
  TWELVE_SELF_LEARNING_RULES
} from '../data/fridayRolloverAndVaultData';
import {
  ChevronDown, ChevronUp, ShieldAlert, ArrowRight
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
  const [activeTab, setActiveTab] = useState(initialTab || 'friday');
  const [fridaySubTab, setFridaySubTab] = useState('tonight'); // 'tonight' | 'global61' | 'sat_sun'
  const [globalStatFilter, setGlobalStatFilter] = useState('ALL');
  const [vaultClubFilter, setVaultClubFilter] = useState('ALL');
  const [vaultCatFilter, setVaultCatFilter] = useState('ALL');
  const [ledgerFilter, setLedgerFilter] = useState('ALL'); // 'ALL' | 'UCL' | 'UEL_UECL' | 'WON' | 'LOST'

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [expandedFixtureId, setExpandedFixtureId] = useState('fri-leg-1');
  const [weekendLeagueFilter, setWeekendLeagueFilter] = useState('All');
  const [thursdayWaveFilter, setThursdayWaveFilter] = useState('all');
  const [expandedTeamSlug, setExpandedTeamSlug] = useState('bournemouth');

  // Calculator state
  const [calcHome, setCalcHome] = useState('AFC Bournemouth');
  const [calcAway, setCalcAway] = useState('AC Milan');
  const [calcMarket, setCalcMarket] = useState('fouls');
  const [calcLine, setCalcLine] = useState('20.5');
  const [calcOverOdds, setCalcOverOdds] = useState('1.35');
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

  const filteredGlobalHighlights = useMemo(() => {
    return (FRIDAY_GLOBAL_OVER_HIGHLIGHTS || []).filter(g =>
      globalStatFilter === 'ALL' || g.stat.toLowerCase() === globalStatFilter.toLowerCase()
    );
  }, [globalStatFilter]);

  const vaultClubsList = useMemo(() => {
    const s = new Set((SPECIALIST_100_VAULT.pureOverClubLocks || []).map(x => x.club));
    return ['ALL', ...Array.from(s)];
  }, []);

  const filteredVaultLocks = useMemo(() => {
    return (SPECIALIST_100_VAULT.pureOverClubLocks || []).filter(lk => {
      const cOk = vaultClubFilter === 'ALL' || lk.club === vaultClubFilter;
      const mOk = vaultCatFilter === 'ALL' || lk.category.toLowerCase().includes(vaultCatFilter.toLowerCase());
      return cOk && mOk;
    });
  }, [vaultClubFilter, vaultCatFilter]);

  const filteredLedgerRows = useMemo(() => {
    return (UEFA_54_LEDGER_SUMMARY.rows || []).filter(r => {
      if (ledgerFilter === 'WON') return r.grade === 'WON';
      if (ledgerFilter === 'LOST') return r.grade === 'LOST';
      if (ledgerFilter === 'UCL') return r.date === '2026-10-20' || r.date === '2026-10-21';
      if (ledgerFilter === 'UEL_UECL') return r.date === '2026-10-22';
      return true;
    });
  }, [ledgerFilter]);

  const getStudiedClubsForFixture = (slugs = []) => {
    if (!Array.isArray(slugs) || slugs.length === 0) return [];
    return STUDIED_TEAMS.filter(t => slugs.includes(t.slug));
  };

  const calcResult = useMemo(() => {
    const homeObj = TOP5_OPPONENT_PROFILES.find(c => c.team === calcHome) || TOP5_OPPONENT_PROFILES[0];
    const awayObj = TOP5_OPPONENT_PROFILES.find(c => c.team === calcAway) || TOP5_OPPONENT_PROFILES[1];
    const refMult = parseFloat(calcRefFactor) || 1.0;
    const lineNum = parseFloat(calcLine) || 20.5;
    const oOdds = parseFloat(calcOverOdds) || 1.35;

    let homeExp = 0;
    let awayExp = 0;
    if (calcMarket === 'fouls') {
      homeExp = ((homeObj.foulsFor + awayObj.foulsAgainst) / 2) * refMult;
      awayExp = ((awayObj.foulsFor + homeObj.foulsAgainst) / 2) * refMult;
    } else if (calcMarket === 'cards') {
      homeExp = homeObj.yellowFor * 0.98 * refMult;
      awayExp = awayObj.yellowFor * 1.06 * refMult;
    } else if (calcMarket === 'corners') {
      homeExp = ((homeObj.cornersFor + awayObj.cornersAgainst) / 2) * 1.05;
      awayExp = ((awayObj.cornersFor + homeObj.cornersAgainst) / 2) * 0.95;
    } else {
      homeExp = homeObj.tacklesFor * 0.98;
      awayExp = awayObj.tacklesFor * 1.02;
    }

    const totalLambda = homeExp + awayExp;
    const probOver = poissonOverProb(lineNum, totalLambda);
    const implied = oOdds > 1 ? 1 / oOdds : 0.7;
    return {
      homeExp,
      awayExp,
      totalLambda,
      probOver: probOver * 100,
      edgeOver: (probOver - implied) * 100
    };
  }, [calcHome, calcAway, calcMarket, calcLine, calcOverOdds, calcRefFactor]);

  const renderEmbeddedTeamLogs = (slugs = []) => {
    const clubs = getStudiedClubsForFixture(slugs);
    if (clubs.length === 0) return null;
    return (
      <div className="space-y-4 pt-3 border-t border-slate-800">
        {clubs.map(club => (
          <div key={club.slug} className="rounded-xl bg-[#070C18] border border-slate-800 p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <span className="font-display font-black text-sm text-white">{club.name}</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  {club.record}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">{club.summary}</p>
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex gap-3">
                <span>Fouls: <strong>{club.foulsAvg}</strong></span>
                <span>Corners: <strong>{club.cornersAvg}</strong></span>
                <span>Cards: <strong>{club.cardsAvg}</strong></span>
                <span>Tackles: <strong>{club.tacklesAvg}</strong></span>
              </div>
            </div>

            {Array.isArray(club.matches) && club.matches.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-1.5">Date</th>
                      <th className="p-1.5">Comp</th>
                      <th className="p-1.5">Opponent</th>
                      <th className="p-1.5">Venue</th>
                      <th className="p-1.5">Score</th>
                      <th className="p-1.5">Fouls</th>
                      <th className="p-1.5">Corners</th>
                      <th className="p-1.5">Cards</th>
                      <th className="p-1.5">Tackles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {club.matches.map((m, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="p-1.5 text-slate-400">{m.date}</td>
                        <td className="p-1.5">{m.comp}</td>
                        <td className="p-1.5 font-bold text-white">{m.opponent}</td>
                        <td className="p-1.5">{m.venue}</td>
                        <td className="p-1.5 font-bold text-emerald-400">{m.score}</td>
                        <td className="p-1.5 text-amber-300">{m.totalFouls} ({m.teamFouls}+{m.oppFouls})</td>
                        <td className="p-1.5 text-cyan-300">{m.totalCorners} ({m.teamCorners}+{m.oppCorners})</td>
                        <td className="p-1.5 text-rose-300">{m.totalCards} ({m.teamCards}+{m.oppCards})</td>
                        <td className="p-1.5">{m.totalTackles} ({m.teamTackles}+{m.oppTackles})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── 1. COMMAND HEADER SCOREBOARD ── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1324] via-[#0F1B33] to-[#070B16] border-2 border-emerald-500/40 p-5 sm:p-6 text-white shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider">
                3.00x PURE OVER ROLLOVER ENGINE &bull; REAL BOOKIE LINE AUDIT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                Day 1 Placed on 22Bet: 6 Events @ 3.036x (₦1,000 &rarr; ₦3,036 Tonight!)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Two-Team Pure OVER Behaviour Lab &amp; Self-Learning Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Strictly <strong>OVER Match Behaviour</strong> (Corners, Fouls, Yellow Cards, Tackles &amp; SOT) audited against live <strong>22Bet</strong> &amp; <strong>SportyBet</strong> lines. <strong>Zero Under markets. Zero Goal markets. Zero sugar-coating.</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 flex-shrink-0 font-mono text-center">
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">Day 1 Live</span>
              <strong className="text-xl text-emerald-400 font-black">3.036x</strong>
              <span className="text-[10px] text-emerald-300 block">₦1K &rarr; ₦3,036</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">UCL Strict</span>
              <strong className="text-xl text-cyan-400 font-black">16/18</strong>
              <span className="text-[10px] text-slate-300 block">88.9% Won FT</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">4-Win Goal</span>
              <strong className="text-xl text-amber-300 font-black">₦81,972</strong>
              <span className="text-[10px] text-slate-300 block">+₦51.9K Net</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          {[
            { id: 'friday', label: '🔥 Day 1 Fri 3.036x + Global Overs' },
            { id: 'vault', label: '🔒 100% Pure OVER Vault (117 Locks)' },
            { id: 'ledger', label: '📋 54-Match Graded UEFA Ledger' },
            { id: 'whynot', label: '🚫 Real Line & Trap Rules (Filter #4 Deleted)' },
            { id: 'tuesday', label: '🔵 Tue & Wed UCL Hub' },
            { id: 'thursday', label: '🟠 Thu UEL & UECL Hub' },
            { id: 'clubs', label: '📊 18 Club Season Logs' },
            { id: 'calculator', label: '🧮 Custom 2-Team Calculator' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================================
          TAB 1: FRIDAY 23 OCT LIVE 3.036x TICKET + TWO-TEAM RE-EVALUATION + 61 GLOBAL OVERS
         ========================================================================================= */}
      {activeTab === 'friday' && (
        <div className="space-y-5">
          {/* Official Day 1 Placed Ticket Spotlight */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-[#0B1222] p-4 sm:p-5 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                    OFFICIAL PLACED DAY 1 ROLLOVER TICKET (22BET)
                  </span>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    6 Pure OVER Legs &bull; 3.036x Combined &bull; Stake ₦1,000 &rarr; Return ₦3,036 Tonight!
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-display font-black mt-1">
                  Step 1 of 4 Live Tonight (18:00–19:45 WAT) &bull; Every Single Leg Carries a 90%–100% Season/Venue Floor
                </h2>
              </div>

              <button
                onClick={() => onNavigate('ladder')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 self-start sm:self-center"
              >
                <span>Open 4-Step ₦81,972 Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
              {OFFICIAL_3X_ROLLOVER.day1Ticket22Bet.legs.map((leg) => (
                <div key={leg.num} className="p-3 rounded-xl bg-[#070C18] border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">#{leg.num} &bull; {leg.kickoff}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">{leg.odds.toFixed(2)}</span>
                  </div>
                  <div className="font-display font-black text-white text-sm">{leg.match}</div>
                  <div className="text-amber-300 font-bold">{leg.betSlipLabel}</div>
                  <div className="text-[11px] text-emerald-400">Model: {leg.modelProj} &bull; {leg.twoSided}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{leg.buffer}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Switch Inside Friday Hub */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'tonight', label: '🔍 Tonight (23 Oct): Full Two-Team Match Logs & Trap Audit' },
              { id: 'global61', label: `🌍 All ${FRIDAY_GLOBAL_OVER_HIGHLIGHTS.length} Global 100% Venue Pure OVER Locks Today` },
              { id: 'sat_sun', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Sat & Sun Top-5 Weekend Slate (Day 2 & Day 3 Queue)' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setFridaySubTab(st.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  fridaySubTab === st.id
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#0E1626] border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* SUB-TAB A: TONIGHT'S DEEP TWO-TEAM RE-EVALUATION + REJECTED TRAPS */}
          {fridaySubTab === 'tonight' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(FRIDAY_23_OCT_REEVALUATION.ranked_legs || []).map((leg, idx) => {
                  const cardId = `fri-leg-${idx + 1}`;
                  const isOpen = expandedFixtureId === cardId;
                  return (
                    <div
                      key={cardId}
                      className={`rounded-2xl border overflow-hidden transition-all ${
                        isOpen ? 'border-2 border-emerald-500 bg-[#0B1222]' : 'border-slate-800 bg-[#0E1626]'
                      }`}
                    >
                      <div
                        onClick={() => toggleFixtureExpand(cardId)}
                        className="cursor-pointer p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px]">
                              RANK #{leg.rank}
                            </span>
                            <span className="text-xs font-mono text-cyan-300 font-bold">
                              {leg.competition} &bull; {leg.kickoff_wat}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                              Venue: {leg.venue_two_sided} | Season: {leg.season_two_sided}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-display font-black text-white">{leg.match}</h3>
                          <div className="text-xs font-mono text-emerald-400 font-bold">
                            ✅ {leg.pick} ({leg.confirmed_odds})
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end lg:self-center font-mono text-xs">
                          <div className="px-3 py-2 rounded-xl bg-black/50 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">2-Team Model</span>
                            <strong className="text-white text-sm">{leg.walk_forward_model} ({leg.walk_forward_exact})</strong>
                          </div>
                          <button type="button" className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold flex items-center gap-1">
                            <span>{isOpen ? 'Hide Logs' : 'Season Logs'}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-6 pt-3 border-t border-slate-800 bg-[#080D1A] space-y-3 text-xs font-mono">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-[#0E1626] border border-cyan-500/30 space-y-1">
                              <span className="text-[10px] uppercase text-cyan-400 font-bold block">
                                Team 2026–27 Game-by-Game Sequence
                              </span>
                              <div className="text-white font-bold break-words">{JSON.stringify(leg.team_seq_2627)}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-[#0E1626] border border-amber-500/30 space-y-1">
                              <span className="text-[10px] uppercase text-amber-300 font-bold block">
                                Opponent 2026–27 Game-by-Game Sequence
                              </span>
                              <div className="text-white font-bold break-words">{JSON.stringify(leg.opp_seq_2627)}</div>
                            </div>
                          </div>
                          {leg.same_season_h2h && (
                            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-cyan-200">
                              📌 <strong>Same-Season H2H / Referee Check:</strong> {leg.same_season_h2h}
                            </div>
                          )}
                          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 leading-relaxed font-sans">
                            <strong>Verdict:</strong> {leg.verdict}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explicit Rejected Trap Audit Box */}
              <div className="rounded-2xl border border-rose-500/40 bg-[#0E1626] p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-display font-black text-sm uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Trap Bets Strictly Rejected Today (Real Bookmaker Line Audit)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {OFFICIAL_3X_ROLLOVER.rejectedTodayTraps.map((t, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 space-y-1">
                      <div className="font-mono font-bold text-white">{t.match}</div>
                      <div className="font-mono text-rose-300 font-bold">❌ {t.rejectedBet}</div>
                      <p className="text-slate-300 leading-relaxed">{t.whyRejected}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB B: ALL 61 GLOBAL 100% VENUE PURE OVER LOCKS ACROSS 29 MATCHES TODAY */}
          {fridaySubTab === 'global61' && (
            <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-4 sm:p-5 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-black">
                    🌍 Global 29-Fixture Pure OVER Scan (100% Venue Agreement + &ge;88.5% Full Season)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Important: Always check your bookmaker&apos;s published main/alt line before backing high-mean fouling leagues!
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
                  {['ALL', 'corners', 'fouls', 'tackles', 'yellowcards', 'shots-total'].map(st => (
                    <button
                      key={st}
                      onClick={() => setGlobalStatFilter(st)}
                      className={`px-2.5 py-1 rounded-lg uppercase font-bold ${
                        globalStatFilter === st ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-2">Time</th>
                      <th className="p-2">League</th>
                      <th className="p-2">Match</th>
                      <th className="p-2">Pure OVER Floor</th>
                      <th className="p-2">Venue</th>
                      <th className="p-2">2-Sided Season</th>
                      <th className="p-2">2026–27 Arrays</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredGlobalHighlights.map((g, i) => (
                      <tr key={i} className="hover:bg-white/[0.03]">
                        <td className="p-2 text-slate-400">{g.kickoff}</td>
                        <td className="p-2 text-cyan-300">{g.comp}</td>
                        <td className="p-2 font-bold text-white">{g.match}</td>
                        <td className="p-2 font-bold text-amber-300">{g.market}</td>
                        <td className="p-2 text-emerald-400 font-bold">{g.venue} (100%)</td>
                        <td className="p-2 text-white">{g.twoSided} ({g.combPct}%)</td>
                        <td className="p-2 text-[10px] text-slate-400 max-w-xs truncate">
                          [{g.homeSeq.join(',')}] / [{g.awaySeq.join(',')}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB C: SATURDAY & SUNDAY TOP-5 WEEKEND SLATE */}
          {fridaySubTab === 'sat_sun' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].map(lg => (
                  <button
                    key={lg}
                    onClick={() => setWeekendLeagueFilter(lg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase ${
                      weekendLeagueFilter === lg ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-[#0E1626] text-slate-300'
                    }`}
                  >
                    {lg}
                  </button>
                ))}
              </div>

              {filteredWeekendFixtures.map(fix => {
                const isExpanded = expandedFixtureId === fix.id;
                return (
                  <div key={fix.id} className="rounded-2xl border border-slate-800 bg-[#0E1626] overflow-hidden">
                    <div
                      onClick={() => toggleFixtureExpand(fix.id)}
                      className="cursor-pointer p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-mono text-cyan-300">{fix.league} &bull; {fix.kickoff}</span>
                        <h3 className="text-lg font-display font-black text-white">{fix.match}</h3>
                        <p className="text-xs text-slate-400">{fix.h2hRecord}</p>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                          <div className="font-black text-white">{fix.smallLock.pick} @ {fix.smallLock.odds}</div>
                          <div className="text-[10px] text-amber-300">Value: {fix.valueBet.pick} @ {fix.valueBet.odds}</div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-[#080D1A] space-y-3 text-xs">
                        <p className="text-slate-200"><strong>Home:</strong> {fix.homeProfile}</p>
                        <p className="text-slate-200"><strong>Away:</strong> {fix.awayProfile}</p>
                        <p className="text-rose-300"><strong>🚫 Trap Check:</strong> {fix.whyNotBet}</p>
                        {renderEmbeddedTeamLogs(fix.studiedTeamSlugs)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================================
          TAB 2: 100% PURE OVER SPECIALIST CLUB VAULT (117 VERIFIED CLUB OVER LOCKS)
         ========================================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-emerald-500/40 p-5 text-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  STRICT PURE OVER VAULT &bull; 2026–27 FULL SEASON LOGS
                </span>
                <h2 className="text-xl font-display font-black mt-1">
                  117 Club-Specific Pure OVER Specialist Locks (Zero Under Lines Shown)
                </h2>
                <p className="text-xs text-slate-300">
                  Every row below comes from complete 2026–27 competitive match logs across Corners, Fouls, Tackles, Cards &amp; Shots on Target. Always cross-check against the live opponent&apos;s log + published bookie line before adding to a 3.00x slip.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap font-mono text-xs">
                <select
                  value={vaultClubFilter}
                  onChange={e => setVaultClubFilter(e.target.value)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {vaultClubsList.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All 18 Clubs' : c}</option>)}
                </select>
                <select
                  value={vaultCatFilter}
                  onChange={e => setVaultCatFilter(e.target.value)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {['ALL', 'Fouls', 'Corners', 'Tackles', 'Cards', 'SOT'].map(cat => (
                    <option key={cat} value={cat}>{cat === 'ALL' ? 'All Behaviour Markets' : cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-2">Club</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Pure OVER Lock</th>
                    <th className="p-2">Record</th>
                    <th className="p-2">Hit %</th>
                    <th className="p-2">Min / Avg / Max</th>
                    <th className="p-2">Full 2026–27 Match Sequence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredVaultLocks.map((lk, i) => (
                    <tr key={i} className="hover:bg-white/[0.03]">
                      <td className="p-2 font-bold text-white">{lk.club}</td>
                      <td className="p-2 text-cyan-300">{lk.category}</td>
                      <td className="p-2 font-bold text-amber-300">{lk.market}</td>
                      <td className="p-2 text-white">{lk.wins}/{lk.games}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          lk.hitRate === 100 ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {lk.hitRate}%
                        </span>
                      </td>
                      <td className="p-2 text-slate-300">{lk.min} / {lk.avg} / {lk.max}</td>
                      <td className="p-2 text-[10px] text-slate-400">[{lk.seasonArray.join(', ')}]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 3: COMPLETE 54-MATCH GRADED UEFA EVALUATION LEDGER (model_evaluation_ledger.csv)
         ========================================================================================= */}
      {activeTab === 'ledger' && (
        <div className="rounded-2xl bg-[#0E1626] border border-cyan-500/40 p-5 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                PERMANENT SELF-LEARNING AUDIT LEDGER &bull; 54 GRADED UEFA MATCHES
              </span>
              <h2 className="text-xl font-display font-black mt-1">
                UCL (16/18 = 88.9% Strict #1 Lock) &bull; All 54 Matches Primary-or-Alt: {UEFA_54_LEDGER_SUMMARY.eitherWon}/{UEFA_54_LEDGER_SUMMARY.totalMatches} ({UEFA_54_LEDGER_SUMMARY.eitherPct}%)
              </h2>
              <p className="text-xs text-slate-300">
                Strict #1 Pick Across All 54 Matches: <strong>{UEFA_54_LEDGER_SUMMARY.totalWon}/{UEFA_54_LEDGER_SUMMARY.totalMatches} ({UEFA_54_LEDGER_SUMMARY.accuracyPct}%)</strong> &bull; Zero blank rows &bull; Tonight&apos;s 6 Friday legs append automatically at 21:45 WAT.
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap font-mono text-xs">
              {[
                { id: 'ALL', label: 'All 54' },
                { id: 'UCL', label: 'Tue+Wed UCL (16/18)' },
                { id: 'UEL_UECL', label: 'Thu UEL/UECL (36)' },
                { id: 'WON', label: '✅ Strict WON (42)' },
                { id: 'LOST', label: '❌ Losses Studied (12)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLedgerFilter(f.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold ${
                    ledgerFilter === f.id ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2">Date</th>
                  <th className="p-2">Comp</th>
                  <th className="p-2">Match (FT)</th>
                  <th className="p-2">Pre-Match Primary Pick</th>
                  <th className="p-2">Actual FT Box Score</th>
                  <th className="p-2">Grade</th>
                  <th className="p-2">Error Audit &amp; Lesson Retained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredLedgerRows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="p-2 text-slate-400 whitespace-nowrap">{r.date}</td>
                    <td className="p-2 text-cyan-300">{r.competition}</td>
                    <td className="p-2 font-bold text-white whitespace-nowrap">{r.home} vs {r.away} ({r.score_ft})</td>
                    <td className="p-2 text-amber-300">{r.primary_market}</td>
                    <td className="p-2 text-slate-200">{r.actual_stat}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        r.grade === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="p-2 text-[11px] text-slate-400 max-w-sm">{r.error_analysis_and_learning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 4: REAL BOOKMAKER LINE RULES, FILTER #4 DELETION & PATTERN DISCOVERY LAB
         ========================================================================================= */}
      {activeTab === 'whynot' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#0E1626] border border-rose-500/40 p-5 text-white space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-mono font-black text-[10px] uppercase">
              ACTIVE ENGINE CONSTITUTION &bull; FILTER #4 DELETED &bull; REAL BOOKIE LINES ONLY
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black">
              14 Self-Learning Rules Governing Every 3.00x Pure OVER Rollover Ticket
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...TWELVE_SELF_LEARNING_RULES, ...(PATTERN_DISCOVERY_RULES || [])].map(rule => (
              <div key={rule.id} className="rounded-2xl bg-[#0E1626] border border-slate-800 p-5 space-y-3 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                  {rule.badge}
                </span>
                <h3 className="text-base font-display font-black text-white">{rule.title}</h3>
                <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  📌 {rule.example}
                </div>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40">
                  <div className="font-mono font-bold text-rose-400 uppercase text-[10px] mb-1">❌ Public Trap:</div>
                  <p className="text-rose-100 leading-relaxed">{rule.whatPublicSees}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                  <div className="font-mono font-bold text-emerald-400 uppercase text-[10px] mb-1">✅ Machine Action:</div>
                  <p className="text-emerald-100 leading-relaxed">{rule.whatMachineSees} — <strong>{rule.howToProfit}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================================
          TAB 5: TUESDAY & WEDNESDAY CHAMPIONS LEAGUE HUB
         ========================================================================================= */}
      {activeTab === 'tuesday' && (
        <div className="space-y-3">
          {(TUESDAY_UCL_FIXTURES || []).map(fix => {
            const isExpanded = expandedFixtureId === fix.id;
            return (
              <div key={fix.id} className="rounded-2xl border border-slate-800 bg-[#0E1626] overflow-hidden">
                <div
                  onClick={() => toggleFixtureExpand(fix.id)}
                  className="cursor-pointer p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-mono text-blue-300">{fix.day} &bull; {fix.kickoff}</span>
                    <h3 className="text-lg font-display font-black text-white">{fix.match}</h3>
                    <p className="text-xs text-slate-400">{fix.refereeNote}</p>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30">
                      <div className="font-black text-white">{fix.smallLock.pick} @ {fix.smallLock.odds}</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 bg-[#080D1A] space-y-2 text-xs">
                    <p className="text-slate-200">{fix.whyPick}</p>
                    <p className="text-rose-300">🚫 {fix.whyNotBet}</p>
                    {renderEmbeddedTeamLogs(fix.studiedTeamSlugs)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================================
          TAB 6: THURSDAY EUROPA & CONFERENCE LEAGUE HUB
         ========================================================================================= */}
      {activeTab === 'thursday' && (
        <div className="space-y-3">
          <div className="flex gap-1.5 flex-wrap font-mono text-xs">
            {[
              { id: 'all', label: 'All Graded Matches' },
              { id: 'finished_1645', label: '16:45 Early Wave (7/7 Won)' },
              { id: 'locked_2000_orig', label: '20:00 Original Studied' },
              { id: 'fresh_2000', label: '20:00 Unseen Wave' }
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setThursdayWaveFilter(w.id)}
                className={`px-3 py-1.5 rounded-xl font-bold ${
                  thursdayWaveFilter === w.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#0E1626] text-slate-300'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {filteredThursdayMatches.map(m => {
            const isExpanded = expandedFixtureId === m.id;
            return (
              <div key={m.id} className="rounded-2xl border border-slate-800 bg-[#0E1626] overflow-hidden">
                <div
                  onClick={() => toggleFixtureExpand(m.id)}
                  className="cursor-pointer p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-mono text-amber-300">{m.comp} &bull; {m.waveLabel}</span>
                    <h3 className="text-lg font-display font-black text-white">{m.match}</h3>
                    <div className="text-xs font-mono text-emerald-400">{m.twoTeamPick}</div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
                    {m.actualBoxScore && (
                      <span>FT {m.actualBoxScore.score} | Fouls {m.actualBoxScore.fouls} | Corners {m.actualBoxScore.corners}</span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 bg-[#080D1A] space-y-2 text-xs">
                    <p className="text-slate-200">{m.whyPick}</p>
                    <p className="text-rose-300">🚫 {m.whyNotBet}</p>
                    {renderEmbeddedTeamLogs(m.studiedTeamSlugs)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================================
          TAB 7: ALL 18 STUDIED CLUB LOGS
         ========================================================================================= */}
      {activeTab === 'clubs' && (
        <div className="space-y-3">
          {(STUDIED_TEAMS || []).map(club => {
            const isOpen = expandedTeamSlug === club.slug;
            return (
              <div key={club.slug} className="rounded-2xl bg-[#0E1626] border border-slate-800 overflow-hidden">
                <div
                  onClick={() => setExpandedTeamSlug(isOpen ? null : club.slug)}
                  className="cursor-pointer p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-display font-black text-base text-white">{club.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      {club.record}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{club.summary}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono text-white">
                    {isOpen ? 'Close' : 'View Log'}
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
          TAB 8: TWO-TEAM PURE OVER CALCULATOR (ZERO GOAL MARKETS)
         ========================================================================================= */}
      {activeTab === 'calculator' && (
        <div className="rounded-2xl bg-[#0E1626] border border-slate-800 p-5 text-white space-y-4">
          <h3 className="text-lg font-display font-black">
            🧮 Live Two-Team Pure OVER Behaviour Calculator (109 Clubs — Behaviour Markets Only)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Home Team</label>
              <select value={calcHome} onChange={e => setCalcHome(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white">
                {TOP5_OPPONENT_PROFILES.map(c => <option key={c.team} value={c.team}>{c.team}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Away Team</label>
              <select value={calcAway} onChange={e => setCalcAway(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white">
                {TOP5_OPPONENT_PROFILES.map(c => <option key={c.team} value={c.team}>{c.team}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Pure OVER Market</label>
              <select value={calcMarket} onChange={e => setCalcMarket(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white">
                <option value="fouls">Match Total Fouls OVER</option>
                <option value="corners">Match Total Corners OVER</option>
                <option value="cards">Match Total Yellow Cards OVER</option>
                <option value="tackles">Match Total Tackles OVER</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Real Bookie Line</label>
              <input type="number" step="0.5" value={calcLine} onChange={e => setCalcLine(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Live OVER Odds</label>
              <input type="number" step="0.01" value={calcOverOdds} onChange={e => setCalcOverOdds(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Referee Mult</label>
              <input type="number" step="0.05" value={calcRefFactor} onChange={e => setCalcRefFactor(e.target.value)} className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <span className="text-slate-400 block">2-Team Model Expectation:</span>
              <strong className="text-xl text-white font-black">{Math.round(calcResult.totalLambda)} ({calcResult.totalLambda.toFixed(1)})</strong>
              <span className="text-slate-400 block mt-0.5">{calcHome}: {calcResult.homeExp.toFixed(1)} + {calcAway}: {calcResult.awayExp.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">OVER {calcLine} Probability:</span>
              <strong className="text-xl text-emerald-400 font-black">{calcResult.probOver.toFixed(1)}%</strong>
              <span className="text-slate-400 block mt-0.5">Buffer vs Line: {(calcResult.totalLambda - parseFloat(calcLine || 0)).toFixed(1)} units</span>
            </div>
            <div>
              <span className="text-slate-400 block">3.00x Rollover Qualification:</span>
              <strong className={`text-xl font-black ${calcResult.probOver >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calcResult.probOver >= 85 ? `✅ QUALIFIED OVER ${calcLine}` : '🚫 REJECT — LINE TOO HIGH'}
              </strong>
              <span className="text-slate-400 block mt-0.5">Edge vs Bookie: {calcResult.edgeOver >= 0 ? `+${calcResult.edgeOver.toFixed(1)}%` : `${calcResult.edgeOver.toFixed(1)}%`}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
