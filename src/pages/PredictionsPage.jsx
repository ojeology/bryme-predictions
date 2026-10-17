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
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Today's Predictions &amp; Weekend Slips
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Filter betting slips by market, source, bookmaker, and outcome.
        </p>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-display font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Filter Predictions</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Markets</option>
              {MARKETS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Analyst</label>
            <select
              value={selectedPunter}
              onChange={(e) => setSelectedPunter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Analysts</option>
              {PUNTERS.map(p => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Bookmaker</label>
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Bookmakers</option>
              {BOOKMAKERS.map(b => (
                <option key={b.id} value={b.name.toLowerCase()}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Outcome</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Outcomes</option>
              <option value="pending">Active (Pending)</option>
              <option value="won">Won Only</option>
              <option value="lost">Lost Only</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team, match, league, or booking code..."
            className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
        <span>Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}</span>
        {hasActiveFilters && <span>(Filtered)</span>}
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No tickets match your filter criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase rounded-xl transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
