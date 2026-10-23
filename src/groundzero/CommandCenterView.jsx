import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Calendar, UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { safeText, resolveClub } from './utils';

function formatMoney(n) {
  return '₦' + Number(n || 0).toLocaleString();
}

export default function CommandCenterView({ data, navigate }) {
  const [selectedDay, setSelectedDay] = useState('friday');
  const [showSkipped, setShowSkipped] = useState(false);

  const rollover = data?.rollover || {};
  const meta = data?.meta || {};
  const steps = rollover.steps || [];
  const fridayTicket = rollover.fridayLiveTicket || { legs: [] };
  const satShortlist = (rollover.saturdayShortlist || []).slice(0, 8);
  const sunShortlist = (rollover.sundayShortlist || []).slice(0, 8);
  const skippedTraps = rollover.rejectedTodayTraps || [];

  const openClubByName = (rawName, explicitSlug) => {
    if (explicitSlug) {
      navigate(`/team/${explicitSlug}`);
      return;
    }
    const found = resolveClub(data?.clubs || [], rawName);
    if (found?.slug) navigate(`/team/${found.slug}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. ONLY LADDER ON THE ENTIRE SITE: 4-STEP 3.00x ROLLOVER */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="pb-5 border-b border-slate-100">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pure OVER Match Behaviours Only • Zero Goal Bets • Zero Unders
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            4-Step 3.00x Rollover Plan (₦1,000 → ₦81,972)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-3xl">
            Four calm steps around <strong>3.00x odds</strong> backed by two-team season + venue box scores and assigned referee numbers across {meta.totalClubs || 360} clubs in {meta.totalLeagues || 20} competitions.
          </p>
        </div>

        {/* 4 CLEAN STEP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {steps.map((s) => {
            const isStep1 = s.step === 1;
            const handleClick = () => {
              if (s.step === 1) setSelectedDay('friday');
              else if (s.step === 2) setSelectedDay('saturday');
              else if (s.step === 3) setSelectedDay('sunday');
              else navigate('/leagues/midweek');
            };
            const activeCard =
              (s.step === 1 && selectedDay === 'friday') ||
              (s.step === 2 && selectedDay === 'saturday') ||
              (s.step === 3 && selectedDay === 'sunday');

            return (
              <button
                key={s.step}
                type="button"
                onClick={handleClick}
                className={`text-left rounded-xl p-4 border transition-all ${
                  activeCard
                    ? 'bg-emerald-50/75 border-emerald-500 ring-1 ring-emerald-500/25'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Step {s.step} of 4
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isStep1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {safeText(s.status || s.day)}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-slate-500">{formatMoney(s.stake)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 translate-y-0.5" />
                  <span className="text-xl font-extrabold text-slate-900">{formatMoney(s.returnAmount)}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5">
                  Target: <strong className="text-slate-900">{safeText(s.odds)}x</strong> • {safeText(s.day)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. DAILY 3.00x TICKET & BACKTESTED SHORTLIST */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {selectedDay === 'friday'
                  ? 'Step 1 Placed Ticket — Friday 23 Oct (Live Tracker • 3.036x)'
                  : selectedDay === 'saturday'
                  ? 'Step 2 Backtested Shortlist — Best Saturday 24 Oct Locks (Target 3.00x)'
                  : 'Step 3 Backtested Shortlist — Best Sunday 25 Oct Locks (Target 3.00x)'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {selectedDay === 'friday'
                  ? 'All 6 legs verified on 22Bet with 90%–100% pre-match floors. Live match stats update below.'
                  : 'Every pick below hit 90%–100% across BOTH full season AND home/away venue splits. Combine your top 4–5 legs once 22Bet lines match the Max Safe Line badge.'}
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200/80 p-1 self-start overflow-x-auto max-w-full">
              {[
                { id: 'friday', label: 'Friday Ticket (Live)' },
                { id: 'saturday', label: 'Saturday 3.00x' },
                { id: 'sunday', label: 'Sunday 3.00x' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDay(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedDay === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {selectedDay === 'friday' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <span>
                  Bookmaker: <strong className="text-slate-900">{safeText(fridayTicket.bookmaker)}</strong>
                </span>
                <span>
                  Events: <strong className="text-slate-900">{(fridayTicket.legs || []).length} Pure OVER legs</strong>
                </span>
                <span>
                  Stake: <strong className="text-slate-900">₦1,000 → ₦3,036</strong>
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                22BET VERIFIED • {safeText(fridayTicket.totalOdds)}x
              </span>
            </div>
          )}
        </div>

        {/* FRIDAY PLACED TICKET LEGS WITH LIVE SCORE / STAT TRACKING */}
        {selectedDay === 'friday' && (
          <div className="divide-y divide-slate-200">
            {(fridayTicket.legs || []).map((leg, idx) => {
              const parts = safeText(leg.match).split(/\s+vs\s+/i);
              const homeName = parts[0] || '';
              const awayName = parts[1] || '';
              const isWon = String(leg.liveStatus || '').includes('WON') || String(leg.liveStatus || '').includes('CASHED');

              return (
                <div key={leg.num || idx} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-3.5 max-w-2xl">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {leg.num || idx + 1}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{safeText(leg.league)}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {safeText(leg.kickoff)}
                          </span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            22BET VERIFIED LINE
                          </span>
                        </div>

                        <div className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openClubByName(homeName)}
                            className="hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                          >
                            {homeName}
                          </button>
                          <span className="text-slate-400 font-normal text-sm">vs</span>
                          <button
                            type="button"
                            onClick={() => openClubByName(awayName)}
                            className="hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                          >
                            {awayName}
                          </button>
                        </div>

                        <p className="text-sm text-slate-700">
                          <strong>Model expects {safeText(leg.modelProj)}</strong> — {safeText(leg.teamFloor)}.
                        </p>

                        {/* LIVE / FT TRACKER LINE */}
                        {leg.liveDetail && (
                          <div
                            className={`inline-flex flex-wrap items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                              isWon
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-sky-50 text-sky-900 border-sky-200'
                            }`}
                          >
                            <span>{safeText(leg.liveStatus)}</span>
                            <span>•</span>
                            <span>{safeText(leg.liveDetail)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:w-[300px] bg-emerald-50/75 border border-emerald-200 rounded-xl px-4 py-3.5 flex sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 shrink-0">
                      <div className="lg:text-right">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                          Placed Selection
                        </div>
                        <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                          {safeText(leg.betSlipLabel)}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-lg">
                        @{safeText(leg.odds)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BACKTESTED SATURDAY & SUNDAY 90%–100% LOCKS WITH MAX SAFE LINE GUARDRAILS */}
        {selectedDay !== 'friday' && (
          <div className="divide-y divide-slate-200">
            {(selectedDay === 'saturday' ? satShortlist : sunShortlist).map((m, idx) => (
              <div key={m.id || idx} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{safeText(m.compName)}</span>
                        <span>•</span>
                        <span>
                          {safeText(m.dayLabel)} • {safeText(m.kickoff)}
                        </span>
                        {m.venue ? <span>• {safeText(m.venue)}</span> : null}
                      </div>

                      <div className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openClubByName(m.homeName, m.homeSlug)}
                          className="inline-flex items-center gap-1.5 hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                        >
                          {m.homeBadge ? <img src={m.homeBadge} alt="" className="w-5 h-5 object-contain" /> : null}
                          <span>{safeText(m.homeName)}</span>
                        </button>
                        <span className="text-slate-400 font-normal text-sm">vs</span>
                        <button
                          type="button"
                          onClick={() => openClubByName(m.awayName, m.awaySlug)}
                          className="inline-flex items-center gap-1.5 hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                        >
                          {m.awayBadge ? <img src={m.awayBadge} alt="" className="w-5 h-5 object-contain" /> : null}
                          <span>{safeText(m.awayName)}</span>
                        </button>
                      </div>

                      {m.referee?.name ? (
                        <div className="inline-flex flex-wrap items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-slate-800 px-3 py-1 rounded-lg">
                          <UserCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>
                            Referee: <strong>{safeText(m.referee.name)}</strong>
                            {m.referee.avg_yellows != null ? ` • ${m.referee.avg_yellows} yellows/g` : ''}
                            {m.referee.avg_fouls != null ? ` • ${m.referee.avg_fouls} fouls/g` : ''}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:w-[375px] bg-emerald-50/75 border border-emerald-200 rounded-xl p-4 shrink-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                        90%+ Two-Sided Lock
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        {safeText(m.lineSafetyBadge)}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-slate-900">
                      {safeText(m.bestPick1)}
                    </div>

                    {m.pickMeta ? (
                      <div className="text-xs text-slate-600">
                        Pre-match model expects <strong>{m.pickMeta.modelProj}</strong> ({m.pickMeta.modelExact}) • Buffer: <strong>+{m.pickMeta.buffer}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COLLAPSIBLE BOOKMAKER TRAPS */}
        {skippedTraps.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-5 sm:px-6 py-4">
            <button
              type="button"
              onClick={() => setShowSkipped(!showSkipped)}
              className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <span>
                Why we rejected {skippedTraps.length} popular traps — including Orenburg Fouls & Stuttgart Away Fouls
              </span>
              {showSkipped ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSkipped && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {skippedTraps.map((t, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
                    <div className="font-bold text-slate-900">{safeText(t.match)}</div>
                    <div className="text-xs font-semibold text-rose-700 mt-0.5">
                      Rejected: {safeText(t.rejectedBet)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {safeText(t.whyRejected)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. SIMPLE NAVIGATION SHORTCUTS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/leagues')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">
            {meta.totalLeagues || 20} Competitions • Weekend & Midweek Europe
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>Matches Batched by League</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Includes Premier League, Top 5, Russia, 2. Bundesliga, Poland, Sweden, plus Champions & Europa League.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/vault')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">
            {meta.vaultCount || 166} Unbroken Streaks • {meta.clubsWithFullLogs || 360}/{meta.totalClubs || 360} Logs
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>100% Vault & All 360 Club Pages</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Every single club page is 100% populated with full chronological 2026–27 game logs and blind tests.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/ledger')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">
            16/18 UCL Won • {meta.refereeCount || 418} Referees Tracked
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>Results Ledger & Referees</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Full 54-match graded UEFA table, searchable referee database, and automatic post-matchweek retraining.
          </p>
        </button>
      </section>
    </div>
  );
}
