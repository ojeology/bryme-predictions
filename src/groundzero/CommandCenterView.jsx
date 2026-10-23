import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Calendar, UserCheck } from 'lucide-react';
import { safeText, resolveClub } from './utils';

function formatMoney(n) {
  return '₦' + Number(n || 0).toLocaleString();
}

export default function CommandCenterView({ data, navigate }) {
  const [selectedDay, setSelectedDay] = useState('friday');
  const [showSkipped, setShowSkipped] = useState(false);

  const rollover = data?.rollover || {};
  const steps = rollover.steps || [];
  const fridayTicket = rollover.fridayLiveTicket || { legs: [] };
  const satShortlist = (rollover.saturdayShortlist || []).slice(0, 6);
  const sunShortlist = (rollover.sundayShortlist || []).slice(0, 6);
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
            Four calm steps using corners, fouls, and cards verified across both teams and the match referee. Tap any step below to view that day’s picks.
          </p>
        </div>

        {/* 4 CLEAN STEP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {steps.map((s) => {
            const isStep1 = s.step === 1;
            const dayKey = s.step === 1 ? 'friday' : s.step === 2 ? 'saturday' : s.step === 3 ? 'sunday' : 'friday';
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setSelectedDay(dayKey)}
                className={`text-left rounded-xl p-4 border transition-all ${
                  isStep1
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/25'
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
                    {isStep1 ? 'Live Today' : s.step === 2 ? 'Saturday' : s.step === 3 ? 'Sunday' : 'Midweek'}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-slate-500">{formatMoney(s.stake)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 translate-y-0.5" />
                  <span className="text-xl font-extrabold text-slate-900">{formatMoney(s.returnAmount)}</span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5">
                  Odds: <strong className="text-slate-900">{safeText(s.odds)}x</strong> • {safeText(s.day)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SIMPLE DAILY TICKET CARD (FRIDAY LIVE / BEST SATURDAY / BEST SUNDAY) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {selectedDay === 'friday'
                  ? 'Step 1 Ticket — Friday 23 Oct (Placed on 22Bet)'
                  : selectedDay === 'saturday'
                  ? 'Step 2 Shortlist — Best Saturday 24 Oct Picks (Target 3.00x)'
                  : 'Step 3 Shortlist — Best Sunday 25 Oct Picks (Target 3.00x)'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Click any club name to open its dedicated team page, season match log, and backtest numbers.
              </p>
            </div>

            {/* SIMPLE 3-BUTTON DAY SWITCHER */}
            <div className="inline-flex rounded-xl bg-slate-200/80 p-1 self-start">
              {[
                { id: 'friday', label: 'Friday Ticket (3.04x)' },
                { id: 'saturday', label: 'Saturday 3.00x' },
                { id: 'sunday', label: 'Sunday 3.00x' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDay(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
              <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                Total Odds: {safeText(fridayTicket.totalOdds)}x
              </span>
            </div>
          )}
        </div>

        {/* FRIDAY PLACED TICKET LEGS */}
        {selectedDay === 'friday' && (
          <div className="divide-y divide-slate-200">
            {(fridayTicket.legs || []).map((leg, idx) => {
              const parts = safeText(leg.match).split(/\s+vs\s+/i);
              const homeName = parts[0] || '';
              const awayName = parts[1] || '';

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
                        <p className="text-xs text-slate-500">
                          Two-team combined record: <strong>{safeText(leg.twoSided)}</strong> ({safeText(leg.buffer)})
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-[300px] bg-emerald-50/75 border border-emerald-200 rounded-xl px-4 py-3.5 flex sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 shrink-0">
                      <div className="lg:text-right">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                          Exact 22Bet Market
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

        {/* SATURDAY OR SUNDAY SHORTLIST LEGS */}
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
                        <span>{safeText(m.dayLabel)} • {safeText(m.kickoff)}</span>
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
                            Referee: <strong>{safeText(m.referee.name)}</strong> • {m.referee.avg_yellows} yellows/g • {m.referee.avg_fouls} fouls/g
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:w-[340px] bg-emerald-50/75 border border-emerald-200 rounded-xl px-4 py-3.5 shrink-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                      #1 Top Pure OVER Pick
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {safeText(m.bestPick1)}
                    </div>
                    {m.projection ? (
                      <div className="text-xs text-slate-600 mt-1">
                        Model pre-match projection: <strong>{m.projection.corners} corners</strong>, <strong>{m.projection.fouls} fouls</strong>, <strong>{m.projection.cards} cards</strong>
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
                Why we rejected {skippedTraps.length} risky bookmaker trap lines (click to read)
              </span>
              {showSkipped ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSkipped && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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

      {/* 3. SIMPLE NAVIGATION CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/leagues')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">22 Leagues • 120 Games</div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>Weekend Matches by League</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Read each league’s behaviour summary, referee stats on every game, and the #1 Over pick per match.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/vault')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">Unbroken Streaks & Team Logs</div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>100% Vault & 307 Club Pages</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Every club with a 100% season record linked straight to its full game-by-game log and blind tests.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/ledger')}
          className="text-left bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700">16/18 UCL Won • 197 Referees</div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center justify-between">
            <span>Past Results & Auto-Retraining</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Full 54-match graded ledger, searchable referee card averages, and Tue/Thu/Sun auto-retraining.
          </p>
        </button>
      </section>
    </div>
  );
}
