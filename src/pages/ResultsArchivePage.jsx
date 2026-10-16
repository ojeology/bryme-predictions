import React, { useState, useMemo } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import { 
  CheckSquare, Filter, RotateCcw, Search, ShieldAlert, 
  CheckCircle, XCircle, AlertCircle, Clock 
} from 'lucide-react';

export default function ResultsArchivePage({ onNavigate }) {
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [punterFilter, setPunterFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');

  const filteredTickets = useMemo(() => {
    return TICKETS.filter(t => {
      if (outcomeFilter !== 'all' && t.status !== outcomeFilter) return false;
      if (marketFilter !== 'all' && t.marketId !== marketFilter) return false;
      if (punterFilter !== 'all' && t.punterId !== punterFilter) return false;

      if (teamSearch.trim()) {
        const q = teamSearch.toLowerCase();
        const matchesTeam = t.selections && t.selections.some(s => 
          s.match.toLowerCase().includes(q) || 
          (s.homeTeam && s.homeTeam.toLowerCase().includes(q)) || 
          (s.awayTeam && s.awayTeam.toLowerCase().includes(q))
        );
        const matchesTitle = t.title.toLowerCase().includes(q);
        if (!matchesTeam && !matchesTitle) return false;
      }

      return true;
    });
  }, [outcomeFilter, marketFilter, punterFilter, teamSearch]);

  // Outcome aggregate counters
  const counts = useMemo(() => {
    return {
      all: TICKETS.length,
      won: TICKETS.filter(t => t.status === 'won').length,
      lost: TICKETS.filter(t => t.status === 'lost').length,
      void: TICKETS.filter(t => t.status === 'void').length,
      pending: TICKETS.filter(t => t.status === 'pending').length,
    };
  }, []);

  const resetFilters = () => {
    setOutcomeFilter('all');
    setMarketFilter('all');
    setPunterFilter('all');
    setTeamSearch('');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-brand-green" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Transparent Results &amp; Ticket Archive
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Every ticket logged by BRYME remains permanently in this archive. We believe sports analytics require documenting losses with the same rigor as wins.
        </p>
      </div>

      {/* Mandatory Demonstration Notice */}
      <div className="bg-pitch-850 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Demonstration Data Standard:</strong> All archived sample outcomes are labeled for prototype review. Historical performance does not indicate future results.
        </div>
      </div>

      {/* Outcome Metric Badges Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { id: 'all', label: 'All Records', count: counts.all, color: 'text-slate-200' },
          { id: 'won', label: 'Won', count: counts.won, color: 'text-emerald-400' },
          { id: 'lost', label: 'Lost', count: counts.lost, color: 'text-rose-400' },
          { id: 'void', label: 'Void', count: counts.void, color: 'text-amber-400' },
          { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-sky-400' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setOutcomeFilter(item.id)}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              outcomeFilter === item.id
                ? 'bg-pitch-800 border-brand-green shadow-md'
                : 'bg-pitch-900 border-pitch-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase font-mono text-slate-400">{item.label}</span>
            <span className={`text-lg font-black font-mono ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Team Search Controls */}
      <div className="bg-pitch-850/80 border border-pitch-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          
          {/* Team Search input */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Search by Team</label>
            <div className="relative">
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="e.g. Arsenal, Real Madrid, Juventus..."
                className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 placeholder-slate-500 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-green"
              />
              {teamSearch && (
                <button 
                  onClick={() => setTeamSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Market filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Market</label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Markets</option>
              {MARKETS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Punter / Source filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Punter / Source</label>
            <select
              value={punterFilter}
              onChange={(e) => setPunterFilter(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Sources</option>
              {PUNTERS.map(p => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        {(outcomeFilter !== 'all' || marketFilter !== 'all' || punterFilter !== 'all' || teamSearch) && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Found {filteredTickets.length} matching tickets
            </span>
            <button
              onClick={resetFilters}
              className="text-brand-green hover:underline flex items-center gap-1 font-semibold text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Archive Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-pitch-850 p-8 rounded-2xl border border-pitch-800 text-center space-y-2">
          <p className="text-slate-200 font-bold text-sm">
            No archived tickets found matching current query
          </p>
          <p className="text-xs text-slate-500">
            Try searching for another team name or clearing your status filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-brand-green text-pitch-950 font-bold rounded-lg text-xs mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
