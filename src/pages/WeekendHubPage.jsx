import React from 'react';
import { TICKETS } from '../data/tickets';
import { PUNTERS } from '../data/punters';
import { ArrowLeft, Users, Flame, CheckCircle, TrendingUp, Info } from 'lucide-react';

export default function WeekendHubPage({ onNavigate }) {
  // Aggregate matches from all tickets
  const matchMap = {};

  TICKETS.forEach(ticket => {
    if (!ticket.selections) return;
    ticket.selections.forEach(sel => {
      const key = sel.match.toLowerCase().trim();
      if (!matchMap[key]) {
        matchMap[key] = {
          match: sel.match,
          league: sel.league,
          kickoff: sel.kickoff,
          picks: []
        };
      }
      matchMap[key].picks.push({
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        punterName: ticket.punterName || ticket.source,
        pick: sel.pick,
        market: sel.market,
        odds: sel.odds,
        status: sel.status
      });
    });
  });

  const groupedMatches = Object.values(matchMap).sort((a, b) => b.picks.length - a.picks.length);

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('punters')}
          className="inline-flex items-center gap-1.5 text-xs text-brand-green hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Punters Directory</span>
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-green" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Weekend Consensus Hub
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Every weekend fixture grouped across all tracked punters. See which matches have multiple punters taking positions.
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-pitch-850 border border-pitch-800 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
        <div>
          <strong>Consensus Intelligence:</strong> When 2 or 3 independent punters identify the same fixture (e.g. Leverkusen Over Goals or Tottenham Double Chance), it reveals widespread market interest. No game is guaranteed.
        </div>
      </div>

      {/* Match Listings Grid */}
      <div className="space-y-3">
        {groupedMatches.map((m, idx) => {
          const isHighConsensus = m.picks.length >= 2;

          return (
            <div 
              key={idx}
              className={`bg-brand-card border rounded-xl p-4 transition-all ${
                isHighConsensus ? 'border-brand-green/40 shadow-sm' : 'border-brand-cardBorder'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-sm sm:text-base text-slate-100">
                    {m.match}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-pitch-850 text-slate-400 font-mono border border-pitch-750">
                    {m.league}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{m.kickoff}</span>
                  {isHighConsensus && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green text-[10px] font-bold border border-brand-green/40 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {m.picks.length} Punters Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Individual Punters Picks for this game */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {m.picks.map((pick, pIdx) => (
                  <div 
                    key={pIdx}
                    onClick={() => onNavigate(`ticket/${pick.ticketId}`)}
                    className="p-2.5 rounded-lg bg-pitch-950 hover:bg-pitch-900 border border-pitch-800 cursor-pointer transition-colors text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                        <span className="text-brand-greenLight truncate">{pick.punterName}</span>
                        <span className="font-mono text-slate-400">{pick.odds}</span>
                      </div>
                      <div className="font-bold text-slate-100 text-xs">
                        {pick.pick}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {pick.market}
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-green hover:underline mt-2 flex items-center justify-between">
                      <span>View Ticket</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
