import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { MARKETS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { BOOKMAKERS } from '../data/bookmakers';
import TicketCard from '../components/TicketCard';
import { Filter, X, RotateCcw, Flame, Zap, ArrowRight, Copy, Check } from 'lucide-react';

export default function PredictionsPage({ onNavigate }) {
  const { tickets } = usePredictions();
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (selectedMarket !== 'all' && t.marketId !== selectedMarket && t.category !== selectedMarket) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      
      if (selectedBookmaker !== 'all') {
        const hasBookmakerCode = t.codes && t.codes[selectedBookmaker];
        const matchesBookmaker = t.bookmaker && t.bookmaker.toLowerCase().includes(selectedBookmaker.toLowerCase());
        if (!hasBookmakerCode && !matchesBookmaker) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesCode = t.bookingCode?.toLowerCase().includes(q) || 
          (t.codes && Object.values(t.codes).some(c => c?.toLowerCase().includes(q)));
        const matchesSelection = t.selections && t.selections.some(s => 
          s.match?.toLowerCase().includes(q) || s.pick?.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCode && !matchesSelection) return false;
      }

      return true;
    });
  }, [tickets, selectedMarket, selectedBookmaker, selectedStatus, searchQuery]);

  const resetFilters = () => {
    setSelectedMarket('all');
    setSelectedBookmaker('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedMarket !== 'all' || selectedBookmaker !== 'all' || selectedStatus !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E41B13] animate-ping"></span>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              Predictions Hub &bull; 1-Tap Booking Slips
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grab booking codes for SportyBet &amp; Bet9ja and bounce. Edit and customize your legs inside your bookmaker.
          </p>
        </div>

        <button
          onClick={() => onNavigate('convert')}
          className="px-3 py-1.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Convert Any Bet Code &rarr;</span>
        </button>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-display font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-[#E41B13] dark:text-rose-400" />
            <span>Fast Filter Slips</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Category</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-[#E41B13]"
            >
              <option value="all">All Categories</option>
              <option value="banker">🎯 2.00x Banker</option>
              <option value="ladder">🪜 Rollover Ladder</option>
              <option value="accumulator">🛡️ 5.00x Acca</option>
              <option value="goals">⚽ Over 1.5 Radar</option>
              <option value="mega">🚀 10.00x Mega Value</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Bookmaker</label>
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-[#E41B13]"
            >
              <option value="all">All Bookmakers</option>
              <option value="sportybet">🔴 SportyBet</option>
              <option value="bet9ja">🟢 Bet9ja</option>
              <option value="onexbet">🔵 1xBet</option>
              <option value="betking">👑 BetKing</option>
              <option value="betway">⚪ Betway</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Outcome</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2 text-xs focus:outline-none focus:border-[#E41B13]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Active / Pending</option>
              <option value="won">Won Only ✅</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team (e.g. Liverpool, Real Madrid), odds, or booking code..."
            className="w-full bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#E41B13]"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
        <span>Showing {filteredTickets.length} ready {filteredTickets.length === 1 ? 'slip' : 'slips'}</span>
        <span className="text-[#00C250] font-bold">● Fast 1-Tap Copy Active</span>
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
            No betting slips match your current filter criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-bold text-xs uppercase rounded-xl transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
