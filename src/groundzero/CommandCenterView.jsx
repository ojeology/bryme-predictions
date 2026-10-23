import React, { useState } from 'react';
import { Flame, CheckCircle2, Lock, ShieldAlert, ArrowUpRight, Sparkles, Clock } from 'lucide-react';
import { safeText, toSlug } from './utils';

export default function CommandCenterView({ data, onNavigate }) {
  const { rollover, meta } = data;
  const [daySlipTab, setDaySlipTab] = useState('friday'); // 'friday' | 'saturday' | 'sunday'
  const [bookieTab, setBookieTab] = useState('22bet'); // '22bet' | 'sporty'
  const [openLegIdx, setOpenLegIdx] = useState(0);

  const openClub = (matchStr, sideIdx = 0) => {
    const parts = String(matchStr || '').split(' vs ');
    const target = parts[sideIdx] || parts[0] || '';
    onNavigate(`team/${toSlug(target)}`);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. THE ONLY ODDS LADDER: STRICT 4-STEP 3.00x PURE OVER ROLLOVER ── */}
      <section className="rounded-3xl border-2 border-emerald-500/70 bg-gradient-to-br from-[#0B1426] via-[#09101E] to-[#050912] p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                GROUND ZERO &bull; OFFICIAL 4-STEP 3.00x ROLLOVER
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 font-mono text-[11px] font-bold">
                STRICTPURE OVER BEHAVIOUR ONLY &bull; ZERO UNDERS &bull; ZERO GOALS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              ₦1,000 &rarr; ₦3,036 &rarr; ₦9,108 &rarr; ₦27,324 &rarr; <span className="text-emerald-400">₦81,972</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              The <strong>only</strong> rollover ladder on Ground Zero: <strong>4 consecutive ~3.00x wins</strong> turn ₦1,000 into <strong>₦81,972</strong> — covering an entire 30-day month of ₦1,000 tries (₦30,000) plus <strong className="text-amber-300">+₦51,972 net profit</strong>, then resets cleanly back to Step 1.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 font-mono text-center lg:min-w-[290px]">
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">Active Rung</span>
              <strong className="text-xl text-emerald-400 font-black">Step 1 / 4</strong>
              <span className="text-[10px] text-emerald-300 block">3.036x Placed</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-400/40">
              <span className="text-[10px] text-slate-400 uppercase block">Step 4 Summit</span>
              <strong className="text-xl text-amber-300 font-black">₦81,972</strong>
              <span className="text-[10px] text-slate-300 block">+₦51,972 Profit</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">Weekend Indexed</span>
              <strong className="text-xl text-cyan-300 font-black">{meta.totalWeekendMatches}</strong>
              <span className="text-[10px] text-slate-300 block">Sat {meta.saturdayMatches} &bull; Sun {meta.sundayMatches}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-purple-500/40">
              <span className="text-[10px] text-slate-400 uppercase block">UCL Strict FT</span>
              <strong className="text-xl text-purple-300 font-black">{meta.uclStrictRecord.split(' ')[0]}</strong>
              <span className="text-[10px] text-slate-300 block">88.9% Verified</span>
            </div>
          </div>
        </div>

        {/* 4 Rungs Horizontal/Grid Tracker — STOPS STRICTLY AT STEP 4 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {rollover.steps.map((s) => {
            const isStep1 = s.step === 1;
            const isGoal = s.step === 4;
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (s.step === 1) setDaySlipTab('friday');
                  if (s.step === 2) setDaySlipTab('saturday');
                  if (s.step === 3) setDaySlipTab('sunday');
                }}
                className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between gap-2.5 ${
                  isStep1
                    ? 'bg-emerald-950/40 border-2 border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : isGoal
                    ? 'bg-amber-950/25 border border-amber-400/60 hover:border-amber-300'
                    : 'bg-[#0D1628] border-slate-800 hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase ${
                    isStep1 ? 'bg-emerald-400 text-slate-950' : isGoal ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    STEP {s.step} OF 4
                  </span>
                  {isStep1 ? (
                    <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-400">{s.day}</div>
                  <div className="font-bold text-sm text-white mt-0.5">{s.title.split('—')[1] || s.title}</div>
                </div>

                <div className="pt-2 border-t border-white/10 font-mono flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">₦{s.stake.toLocaleString()} &times; {s.odds}x</span>
                  <strong className={`text-base font-black ${isGoal ? 'text-amber-300' : 'text-emerald-400'}`}>
                    ₦{s.returnAmount.toLocaleString()}
                  </strong>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">{s.summary}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2. DAILY 3.00x BUILDER TABS: FRIDAY LIVE | BEST SATURDAY 3x | BEST SUNDAY 3x ── */}
      <section className="rounded-3xl border border-slate-800 bg-[#0B1222] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'friday', label: '🟢 Friday 23 Oct — 3.036x LIVE TICKET (Placed)' },
              { id: 'saturday', label: `⚡ Best Saturday 24 Oct 3.00x (${meta.saturdayMatches} Matches Indexed)` },
              { id: 'sunday', label: `🔥 Best Sunday 25 Oct 3.00x (${meta.sundayMatches} Matches Indexed)` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDaySlipTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all ${
                  daySlipTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('leagues')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Browse All 22 League Batches</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* FRIDAY LIVE TICKET */}
        {daySlipTab === 'friday' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBookieTab('22bet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                    bookieTab === '22bet' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  Official Placed 22Bet Slip (6 Events &bull; 3.036x)
                </button>
                <button
                  onClick={() => setBookieTab('sporty')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                    bookieTab === 'sporty' ? 'bg-rose-600 text-white font-black' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  SportyBet 4-Leg Alternative (3.17x)
                </button>
              </div>
              <span className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Auto-grades tonight at 21:45 WAT &rarr; Advances directly to Step 2 (₦3,036)
              </span>
            </div>

            {bookieTab === '22bet' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                {(rollover.fridayLiveTicket?.legs || []).map((leg) => (
                  <div key={leg.num} className="p-4 rounded-2xl bg-[#070C18] border border-emerald-500/30 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">#{leg.num} &bull; {leg.kickoff} &bull; {leg.league}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">{leg.odds.toFixed(2)}</span>
                      </div>
                      <div className="font-sans font-black text-base text-white mt-1">{leg.match}</div>
                      <div className="text-amber-300 font-bold mt-1">{leg.betSlipLabel}</div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800/80">
                      <div className="text-emerald-400 font-bold">Model: {leg.modelProj} &bull; {leg.twoSided}</div>
                      <div className="text-[11px] text-slate-300 leading-snug">{leg.teamFloor}</div>
                      <div className="text-[10px] text-slate-400 leading-snug">{leg.oppFloor}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => openClub(leg.match, 0)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 text-[10px] font-bold"
                      >
                        {leg.match.split(' vs ')[0]} Page &rarr;
                      </button>
                      <button
                        onClick={() => openClub(leg.match, 1)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-300 text-[10px] font-bold"
                      >
                        {leg.match.split(' vs ')[1]} Page &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                {(rollover.fridayAltSportyTicket?.legs || []).map((txt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#070C18] border border-rose-500/30 text-white font-bold">
                    #{idx + 1} &bull; {txt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SATURDAY 24 OCT 3.00x STAGE */}
        {daySlipTab === 'saturday' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-mono font-black text-cyan-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Step 2 Queue — Saturday 24 October 2026 (Stake ₦3,036 &rarr; Target ₦9,108)</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  All <strong>{meta.saturdayMatches} Saturday matches</strong> + official referees &amp; club crests are already indexed below and in <strong>Weekend Leagues</strong>. Next step immediately runs the full game-by-game 5-market walk-forward &amp; live 22Bet/SportyBet line scan across all {meta.saturdayMatches} games to lock the highest-floor 3.00x Saturday slip!
                </p>
              </div>
              <button
                onClick={() => onNavigate('leagues/sat')}
                className="px-3.5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-mono font-black whitespace-nowrap self-start sm:self-center"
              >
                Open All {meta.saturdayMatches} Sat Matches &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
              {(rollover.saturdayShortlist || []).map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-[#070C18] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-cyan-300">
                    <span>{m.compName} &bull; {m.kickoff}</span>
                    {m.referee && <span className="text-amber-300">Ref: {m.referee.name}</span>}
                  </div>
                  <div className="font-sans font-black text-sm text-white">{m.homeName} vs {m.awayName}</div>
                  <div className="text-emerald-400 font-bold">{m.bestPick1}</div>
                  <div className="text-[11px] text-slate-400">{m.bestPick2}</div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onNavigate(`team/${m.homeSlug}`)} className="px-2 py-1 rounded bg-white/5 text-cyan-300 text-[10px]">
                      {m.homeName} Log &rarr;
                    </button>
                    <button onClick={() => onNavigate(`team/${m.awaySlug}`)} className="px-2 py-1 rounded bg-white/5 text-amber-300 text-[10px]">
                      {m.awayName} Log &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUNDAY 25 OCT 3.00x STAGE */}
        {daySlipTab === 'sunday' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-mono font-black text-amber-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Step 3 Queue — Sunday 25 October 2026 (Stake ₦9,108 &rarr; Target ₦27,324)</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  All <strong>{meta.sundayMatches} Sunday matches</strong> (including clubs returning from Thursday UEL/UECL action) + assigned referees are pre-indexed and ready for the deep Sunday 3.00x walk-forward scan.
                </p>
              </div>
              <button
                onClick={() => onNavigate('leagues/sun')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-mono font-black whitespace-nowrap self-start sm:self-center"
              >
                Open All {meta.sundayMatches} Sun Matches &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
              {(rollover.sundayShortlist || []).map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-[#070C18] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-amber-300">
                    <span>{m.compName} &bull; {m.kickoff}</span>
                    {m.referee && <span className="text-cyan-300">Ref: {m.referee.name}</span>}
                  </div>
                  <div className="font-sans font-black text-sm text-white">{m.homeName} vs {m.awayName}</div>
                  <div className="text-emerald-400 font-bold">{m.bestPick1}</div>
                  <div className="text-[11px] text-slate-400">{m.bestPick2}</div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => onNavigate(`team/${m.homeSlug}`)} className="px-2 py-1 rounded bg-white/5 text-cyan-300 text-[10px]">
                      {m.homeName} Log &rarr;
                    </button>
                    <button onClick={() => onNavigate(`team/${m.awaySlug}`)} className="px-2 py-1 rounded bg-white/5 text-amber-300 text-[10px]">
                      {m.awayName} Log &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 3. DEEP 2-TEAM MATCH-BY-MATCH RE-EVALUATION + DISQUALIFIED BOOKMAKER TRAPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Pre-Match Two-Team Sequence Verification (Tap Any Match)</span>
          </h2>
          {(rollover.fridayDeepAudit || []).map((leg, i) => {
            const isOpen = openLegIdx === i;
            return (
              <div key={i} className="rounded-2xl border border-slate-800 bg-[#0B1222] overflow-hidden">
                <div
                  onClick={() => setOpenLegIdx(isOpen ? -1 : i)}
                  className="cursor-pointer p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-mono text-cyan-300">
                      #{leg.rank} &bull; {safeText(leg.competition)} &bull; {safeText(leg.kickoff_wat)}
                    </span>
                    <h3 className="text-base font-black text-white">{safeText(leg.match)}</h3>
                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      {safeText(leg.pick)} ({safeText(leg.confirmed_odds)})
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Venue Floor</span>
                    <strong className="text-amber-300">{safeText(leg.venue_two_sided)}</strong>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 pt-3 border-t border-slate-800 bg-[#070B16] space-y-2 text-xs font-mono">
                    <div className="text-cyan-300"><strong>Team 2026–27:</strong> {safeText(leg.team_seq_2627)}</div>
                    <div className="text-amber-300"><strong>Opponent 2026–27:</strong> {safeText(leg.opp_seq_2627)}</div>
                    {leg.same_season_h2h && <div className="text-emerald-300"><strong>H2H / Ref Audit:</strong> {safeText(leg.same_season_h2h)}</div>}
                    <p className="text-slate-300 font-sans pt-1">{safeText(leg.verdict)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-base sm:text-lg font-black text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span>Disqualified Bookmaker Line Traps</span>
          </h2>
          {(rollover.rejectedTodayTraps || []).map((t, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/35 space-y-1.5 text-xs">
              <div className="font-mono font-bold text-white">{t.match}</div>
              <div className="font-mono text-rose-300 font-bold">🚫 Rejected: {t.rejectedBet}</div>
              <p className="text-slate-300 leading-relaxed">{t.whyRejected}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
