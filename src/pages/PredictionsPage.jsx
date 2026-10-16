import React, { useState, useMemo } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { BOOKMAKERS } from '../data/bookmakers';
import TicketCard from '../components/TicketCard';
import { Filter, X, RotateCcw, Flame } from 'lucide-react';

export default function PredictionsPage({ onNavigate }) {
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedPunter, setSelectedPunter] = useState('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = useMemo(() => {
    return TICKETS.filter(t => {
      if (selectedMarket !== 'all' && t.marketId !== selectedMarket) return false;
      if (selectedPunter !== 'all' && t.punterId !== selectedPunter) return false;
      if (selectedBookmaker !== 'all' && t.bookmaker.toLowerCase() !== selectedBookmaker.toLowerCase()) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesCode = t.bookingCode && t.bookingCode.toLowerCase().includes(q);
        const matchesSelection = t.selections && t.selections.some(s => 
          s.match.toLowerCase().includes(q) || s.pick.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCode && !matchesSelection) return false;
      }

      return true;
    });
  }, [selectedMarket, selectedPunter, selectedBookmaker, selectedStatus, searchQuery]);

  const resetFilters = () => {
    setSelectedMarket('all');
    setSelectedPunter('all');
    setSelectedBookmaker('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedMarket !== 'all' || selectedPunter !== 'all' || selectedBookmaker !== 'all' || selectedStatus !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-brand-green" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Today's Predictions &amp; Weekend Slips
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Explore multi-market betting slips from our editorial desk and tracked favorite punters across Nigeria, Kenya and African markets.
        </p>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-pitch-850/90 border border-pitch-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-brand-green" />
            <span>Filter Predictions</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-brand-green hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          
          {/* Market filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Markets</option>
              {MARKETS.map(m => (
                <option key={m.id} value={m.id}>{m.shortName}</option>
              ))}
            </select>
          </div>

          {/* Punter filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Punter / Source</label>
            <select
              value={selectedPunter}
              onChange={(e) => setSelectedPunter(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Sources</option>
              {PUNTERS.map(p => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </div>

          {/* Bookmaker filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Bookmaker</label>
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Bookmakers</option>
              {BOOKMAKERS.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-green"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>

        {/* Quick Search inside feed */}
        <div className="pt-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams (Arsenal, Bayern, PSV), league, or booking codes..."
            className="w-full bg-pitch-900 border border-pitch-750 text-slate-200 placeholder-slate-500 rounded-lg p-2 text-xs focus:outline-none focus:border-brand-green"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong>{filteredTickets.length}</strong> matching tickets</span>
        {hasActiveFilters && (
          <span className="text-[11px] text-amber-400">Filters applied</span>
        )}
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      ) : (
        /* Empty State (Per Section 10 requirement) */
        <div className="bg-pitch-850/80 border border-pitch-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-pitch-800 flex items-center justify-center mx-auto text-slate-500">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm sm:text-base">
            No predictions found matching your filters
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try loosening your filter criteria (e.g. switch status to "All Statuses" or clear the search text).
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-brand-green text-pitch-950 font-bold rounded-lg text-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
