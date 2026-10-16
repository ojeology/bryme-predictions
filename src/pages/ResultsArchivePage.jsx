import React, { useState, useMemo } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import RegionSelector from '../components/RegionSelector';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import { 
  CheckSquare, Filter, RotateCcw, Search, ShieldAlert, 
  CheckCircle, XCircle, AlertCircle, Clock, Globe 
} from 'lucide-react';

export default function ResultsArchivePage({ onNavigate }) {
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');

  const filteredTickets = useMemo(() => {
    return TICKETS.filter(t => {
      if (outcomeFilter !== 'all' && t.status !== outcomeFilter) return false;
      if (selectedRegion !== 'all' && t.region !== selectedRegion) return false;
      if (marketFilter !== 'all' && t.marketId !== marketFilter) return false;

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
  }, [outcomeFilter, selectedRegion, marketFilter, teamSearch]);

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
    setSelectedRegion('all');
    setMarketFilter('all');
    setTeamSearch('');
  };

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-display font-black text-slate-900 dark:text-white">
            Pan-African Results &amp; Ticket Archive
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Every ticket logged across Nigeria (NPFL), Kenya (FKF), Ghana (GPL), South Africa (PSL), and CAF continental ties is permanently preserved.
        </p>
      </div>

      {/* African Region Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 font-bold block">
          Filter by African League / Region:
        </span>
        <RegionSelector 
          selectedRegion={selectedRegion} 
          onSelectRegion={setSelectedRegion} 
        />
      </div>

      {/* Outcome Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          { id: 'all', label: 'All Records', count: counts.all, color: 'text-slate-900 dark:text-white' },
          { id: 'won', label: 'Won', count: counts.won, color: 'text-emerald-600 dark:text-emerald-400' },
          { id: 'lost', label: 'Lost', count: counts.lost, color: 'text-rose-600 dark:text-rose-400' },
          { id: 'void', label: 'Void', count: counts.void, color: 'text-amber-600 dark:text-amber-400' },
          { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-blue-600 dark:text-blue-400' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setOutcomeFilter(item.id)}
            className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
              outcomeFilter === item.id
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                : 'bg-white dark:bg-[#0E172A] border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className={`text-lg font-black font-display ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <input
          type="text"
          value={teamSearch}
          onChange={(e) => setTeamSearch(e.target.value)}
          placeholder="Search African clubs (Enyimba, Gor Mahia, Kotoko, Sundowns, Al Ahly, Arsenal)..."
          className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
        />
        {teamSearch && (
          <button 
            onClick={() => setTeamSearch('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-1"
          >
            &times;
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Found <strong>{filteredTickets.length}</strong> matching tickets</span>
        {(outcomeFilter !== 'all' || selectedRegion !== 'all' || teamSearch) && (
          <button
            onClick={resetFilters}
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-white/[0.08] p-8 rounded-2xl text-center space-y-2">
          <p className="text-slate-900 dark:text-white font-display font-bold text-sm">
            No archived tickets found matching current query
          </p>
          <p className="text-xs text-slate-500">
            Try switching regions or clearing your search query.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-display font-bold rounded-xl text-xs mt-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
