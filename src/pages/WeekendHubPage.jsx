import React, { useState } from 'react';
import { TICKETS } from '../data/tickets';
import { PUNTERS } from '../data/punters';
import { 
  Users, ArrowRight, ShieldCheck, Flame, Trophy, 
  Sparkles, CheckCircle2, TrendingUp, Info 
} from 'lucide-react';

export default function WeekendHubPage({ onNavigate }) {
  const [selectedLeague, setSelectedLeague] = useState('all');

  // Aggregate selections across active tickets
  const activeTickets = TICKETS.filter(t => t.status === 'pending');
  
  // Extract all selections
  const allSelections = [];
  activeTickets.forEach(ticket => {
    ticket.selections.forEach(sel => {
      allSelections.push({
        ...sel,
        punterName: ticket.punterName,
        punterId: ticket.punterId,
        ticketId: ticket.id,
        bookmaker: ticket.bookmaker,
        ticketTitle: ticket.title
      });
    });
  });

  // Group by match name
  const matchMap = {};
  allSelections.forEach(s => {
    if (!matchMap[s.match]) {
      matchMap[s.match] = {
        match: s.match,
        league: s.league,
        kickoff: s.kickoff,
        picks: []
      };
    }
    matchMap[s.match].picks.push(s);
  });

  const groupedMatches = Object.values(matchMap);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Punters Consensus &amp; Weekend Clash Hub
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Compare selections across tracked independent African punters. When multiple analysts agree on the same fixture, high market consensus is formed.
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 shadow-sm">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white">Consensus Intelligence:</strong> When 2 or 3 independent punters identify the same fixture (e.g. Leverkusen Over Goals or Tottenham Double Chance), it reveals widespread market interest. No game is guaranteed.
        </div>
      </div>

      {/* Match Listings Grid */}
      <div className="space-y-3">
        {groupedMatches.map((m, idx) => {
          const isHighConsensus = m.picks.length >= 2;

          return (
            <div 
              key={idx}
              className={`bg-white dark:bg-[#0E1626] border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
                isHighConsensus ? 'border-emerald-500/50 dark:border-emerald-500/40' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {m.match}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
                    {m.league}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{m.kickoff}</span>
                  {isHighConsensus && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
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
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] hover:bg-blue-50/50 dark:hover:bg-[#16223C] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span className="text-blue-600 dark:text-blue-400 truncate font-bold">{pick.punterName}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{pick.odds}x</span>
                      </div>
                      <div className="font-display font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {pick.pick}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        In: {pick.ticketTitle}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] font-display font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span>Inspect Slip</span>
                      <ArrowRight className="w-3 h-3" />
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
