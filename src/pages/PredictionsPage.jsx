import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { MARKETS } from '../data/markets';
import TicketCard from '../components/TicketCard';
import { 
  Filter, X, RotateCcw, Flame, Zap, ArrowRight, Copy, Check, 
  Search, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, ChevronRight
} from 'lucide-react';

export default function PredictionsPage({ onNavigate }) {
  const { tickets, codeCatalogue, triggerCopyModal } = usePredictions();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oddsDesc', 'oddsAsc', 'legsAsc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'dense'
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCode = (e, code, id, bookmaker = 'SportyBet', odds = '2.00', title = 'Banker Slip') => {
    e.stopPropagation();
    if (code) {
      if (triggerCopyModal) {
        triggerCopyModal(code, bookmaker, title, odds);
      } else {
        navigator.clipboard.writeText(code);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredTickets = useMemo(() => {
    let result = tickets.filter(t => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory && t.marketId !== selectedCategory) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      
      if (selectedBookmaker !== 'all') {
        const hasCode = t.codes && t.codes[selectedBookmaker];
        const matchesBookmaker = t.bookmaker && t.bookmaker.toLowerCase().includes(selectedBookmaker.toLowerCase());
        if (!hasCode && !matchesBookmaker) return false;
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'oddsDesc') {
        return (parseFloat(b.totalOdds) || 0) - (parseFloat(a.totalOdds) || 0);
      }
      if (sortBy === 'oddsAsc') {
        return (parseFloat(a.totalOdds) || 0) - (parseFloat(b.totalOdds) || 0);
      }
      if (sortBy === 'legsAsc') {
        const legsA = a.selections?.length || a.eventsCount || 3;
        const legsB = b.selections?.length || b.eventsCount || 3;
        return legsA - legsB;
      }
      return 0; // default latest
    });

    return result;
  }, [tickets, selectedCategory, selectedBookmaker, selectedStatus, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBookmaker('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBookmaker !== 'all' || selectedStatus !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 1. CATALOGUE HEADER ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E41B13] animate-ping"></span>
              <span className="text-[10px] font-mono uppercase font-black text-[#E41B13] dark:text-rose-400 tracking-wider">
                BRYME CODE HUB &bull; MIDNIGHT DROP 02:00 AM WAT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              BRYME Code Hub &amp; Daily Slips
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Curated daily slips catalogued by odds tier and bookmaker. Pick your booking code in 1 tap, bounce to SportyBet or Bet9ja, and edit your legs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('punters')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>👑 Punters Hub &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. CATALOGUE CONTROLS & FILTER BAR ── */}
      <div className="space-y-3 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Top Control Bar: Search + Sort + View Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search slip by team (e.g. Liverpool, Arsenal), odds, or code..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E41B13]"
            />
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex-shrink-0">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-display font-bold text-xs focus:outline-none"
            >
              <option value="latest">Latest Drop First</option>
              <option value="oddsDesc">Highest Odds (Mega First)</option>
              <option value="oddsAsc">Lowest Odds (Safer First)</option>
              <option value="legsAsc">Fewest Legs (Singles &amp; Doubles)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#E41B13] text-white border-[#E41B13]'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('dense')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'dense'
                  ? 'bg-[#E41B13] text-white border-[#E41B13]'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title="Quick-Copy Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tier & Bookmaker Filter Ribbon */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5 flex-wrap">
          
          {/* Odds Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Slips' },
              { id: 'banker', label: '🎯 2.00x Banker' },
              { id: 'ladder', label: '🪜 1.50x Rollover' },
              { id: 'accumulator', label: '🛡️ 5.00x Acca' },
              { id: 'goals', label: '⚽ Over 1.5 Radar' },
              { id: 'mega', label: '🚀 10.00x Mega' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#E41B13] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Bookmaker Fast Selector */}
          <div className="flex items-center gap-1 text-xs">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1 font-bold mr-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
            >
              <option value="all">All Bookmakers</option>
              <option value="sportybet">🔴 SportyBet</option>
              <option value="bet9ja">🟢 Bet9ja</option>
              <option value="onexbet">🔵 1xBet</option>
              <option value="betking">👑 BetKing</option>
            </select>
          </div>

        </div>

      </div>

      {/* Catalogue Meta Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
        <span>Displaying {filteredTickets.length} Catalogued Slips</span>
        <span className="text-[#00C250] font-bold">● 1-Tap Pick &amp; Bounce Ready</span>
      </div>

      {/* ── 3. CATALOGUE ITEMS (GRID VIEW) ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      )}

      {/* ── 4. CATALOGUE ITEMS (DENSE QUICK-COPY TABLE VIEW) ── */}
      {viewMode === 'dense' && (
        <div className="space-y-2">
          {filteredTickets.map((ticket, idx) => {
            const sportyCode = ticket.codes?.sportybet || ticket.bookingCode || 'BC4-9921';
            const bet9jaCode = ticket.codes?.bet9ja || 'B9J-4412';

            return (
              <div
                key={ticket.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-[#E41B13] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-[#162238] px-2 py-1 rounded">
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                        {ticket.title}
                      </span>
                      <span className="text-xs font-mono font-black text-amber-500 flex-shrink-0">
                        {typeof ticket.totalOdds === 'number' ? ticket.totalOdds.toFixed(2) : ticket.totalOdds}x Odds
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {ticket.selections?.[0]?.match ? `Highlight: ${ticket.selections[0].match}` : 'Multi-Game Accumulator'} &bull; {ticket.selections?.length || 3} Legs
                    </div>
                  </div>
                </div>

                {/* 1-Tap Codes Bar */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  {/* Sporty Code */}
                  <button
                    onClick={(e) => handleCopyCode(e, sportyCode, `${ticket.id}-sporty`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all ${
                      copiedId === `${ticket.id}-sporty`
                        ? 'bg-[#00C250] text-black ring-2 ring-emerald-300'
                        : 'bg-[#E41B13]/10 dark:bg-[#E41B13]/20 hover:bg-[#E41B13] text-[#E41B13] dark:text-rose-400 hover:text-white border border-[#E41B13]/30'
                    }`}
                    title="Copy SportyBet Code"
                  >
                    <span>Sporty: {sportyCode}</span>
                    {copiedId === `${ticket.id}-sporty` ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Bet9ja Code */}
                  <button
                    onClick={(e) => handleCopyCode(e, bet9jaCode, `${ticket.id}-bet9ja`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all ${
                      copiedId === `${ticket.id}-bet9ja`
                        ? 'bg-[#00C250] text-black ring-2 ring-emerald-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#00C250] text-emerald-700 dark:text-emerald-400 hover:text-black border border-emerald-500/30'
                    }`}
                    title="Copy Bet9ja Code"
                  >
                    <span>Bet9ja: {bet9jaCode}</span>
                    {copiedId === `${ticket.id}-bet9ja` ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* View Details */}
                  <button
                    onClick={() => onNavigate(`ticket/${ticket.id}`)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                    title="View Ticket Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No betting slips match your current filter criteria in the catalogue.
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
