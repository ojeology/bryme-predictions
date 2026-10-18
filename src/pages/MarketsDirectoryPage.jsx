import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { MARKETS as FALLBACK_MARKETS, MARKET_CATEGORIES } from '../data/markets';
import { TICKETS } from '../data/tickets';
import { 
  Layers, ArrowRight, ShieldCheck, Search, Filter, Percent, 
  Zap, TrendingUp, Sparkles, LayoutGrid, List, ArrowUpDown, ChevronRight, BarChart2, Users
} from 'lucide-react';

export default function MarketsDirectoryPage({ onNavigate }) {
  const { markets } = usePredictions();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hitRate'); // 'hitRate', 'oddsAsc', 'risk', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'dense'

  // Bulletproof fallback ensuring an array always exists
  const marketList = Array.isArray(markets) && markets.length > 0 ? markets : FALLBACK_MARKETS;

  // Filter & Sort
  const processedMarkets = useMemo(() => {
    const list = Array.isArray(marketList) ? [...marketList] : [...FALLBACK_MARKETS];
    let result = list.filter(m => {
      if (!m) return false;
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = m.name?.toLowerCase().includes(q);
        const inDesc = m.description?.toLowerCase().includes(q);
        const inTip = m.tacticalTip && m.tacticalTip.toLowerCase().includes(q);
        const inCategory = m.category?.toLowerCase().includes(q);
        if (!inName && !inDesc && !inTip && !inCategory) return false;
      }
      return true;
    });

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'hitRate') {
        const rateA = parseFloat(a?.averageHitRate) || 0;
        const rateB = parseFloat(b?.averageHitRate) || 0;
        return rateB - rateA;
      }
      if (sortBy === 'name') {
        return (a?.name || '').localeCompare(b?.name || '');
      }
      if (sortBy === 'oddsAsc') {
        const oddsA = parseFloat(a?.typicalOddsRange) || 1.5;
        const oddsB = parseFloat(b?.typicalOddsRange) || 1.5;
        return oddsA - oddsB;
      }
      if (sortBy === 'risk') {
        const riskOrder = { 'Lowest Risk': 1, 'Low Risk': 2, 'Low-Medium Risk': 3, 'Medium Risk': 4, 'Medium-High Risk': 5, 'High Risk': 6 };
        return (riskOrder[a?.riskLevel] || 3) - (riskOrder[b?.riskLevel] || 3);
      }
      return 0;
    });

    return result;
  }, [marketList, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 0. MARKETS & PUNTERS TOP NAVIGATION BAR ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200 dark:bg-[#0E1626] border border-slate-300 dark:border-slate-800">
        <button
          onClick={() => {}}
          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#162238] text-slate-900 dark:text-white font-display font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
        >
          <Layers className="w-4 h-4 text-[#E41B13]" />
          <span>35+ Football Markets</span>
        </button>

        <button
          onClick={() => onNavigate('punters')}
          className="flex-1 py-2 px-3 rounded-xl bg-transparent hover:bg-white/50 dark:hover:bg-[#162238]/60 text-slate-600 dark:text-slate-300 font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>👑 Punters Hub &amp; Daily Codes</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono font-bold">HOT</span>
        </button>
      </div>

      {/* ── 1. CATALOGUE HEADER ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#E41B13] text-white text-[10px] font-display font-black uppercase tracking-wider">
                BETTING ENCYCLOPAEDIA
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {marketList.length} Markets Catalogued
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              Football Betting Markets Catalogue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Complete index of sports betting markets across SportyBet, Bet9ja, 1xBet &amp; BetKing. Inspect tactical statistics, win probabilities, typical odds, and settlement rules.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('punters')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Punters Hub</span>
            </button>

            <button
              onClick={() => onNavigate('predictions')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Slips Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PUNTERS SPOTLIGHT CALLOUT IN MARKETS ── */}
      <div 
        onClick={() => onNavigate('punters')}
        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500/60 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
            👑
          </div>
          <div>
            <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
              <span>Tracked African Punters Hub &bull; Active Daily Codes</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">1-TAP LOAD</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Looking for top African analysts using Over 1.5, Double Chance &amp; Corner markets today? Open the Punters Hub directory with verified daily booking codes.
            </p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-amber-500 text-slate-950 group-hover:translate-x-1 transition-transform flex-shrink-0">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* ── 2. CATALOGUE CONTROLS & FILTER BAR ── */}
      <div className="space-y-3 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Top Control Bar: Search + Sort + View Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 35+ markets (e.g. Over 1.5, Double Chance, BTTS, Corners)..."
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
              <option value="hitRate">Highest Hit Rate %</option>
              <option value="risk">Lowest Risk Profile First</option>
              <option value="oddsAsc">Lowest Odds First (Safer)</option>
              <option value="name">Alphabetical (A - Z)</option>
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
              title="Grid View"
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
              title="Dense List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          {MARKET_CATEGORIES.map(cat => {
            const count = cat.id === 'all' 
              ? marketList.length 
              : marketList.filter(m => m.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#E41B13] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedCategory === cat.id ? 'bg-black/30 text-white' : 'bg-white dark:bg-[#121B2F] text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Catalogue Meta Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono px-1">
        <span>Catalogued: {processedMarkets.length} of {marketList.length} Markets</span>
        <span className="text-[#00C250] font-bold">● High Hit Rate Index Verified</span>
      </div>

      {/* ── 3. CATALOGUE ITEMS (GRID VIEW) ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedMarkets.map((market, idx) => {
            const ticketsInMarket = TICKETS.filter(t => t.marketId === market.id);

            return (
              <div
                key={market.id}
                onClick={() => onNavigate(`market/${market.id}`)}
                className="bg-white dark:bg-[#0E1626] hover:border-[#E41B13]/60 dark:hover:border-[#E41B13]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-3"
              >
                <div>
                  {/* Top Catalogue Tag Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-[#162238] px-1.5 py-0.5 rounded">
                        #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-[#E41B13] dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                        {market.badge}
                      </span>
                    </div>
                    
                    {market.averageHitRate && (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        Hit: {market.averageHitRate}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-display font-black text-slate-900 dark:text-white group-hover:text-[#E41B13] dark:group-hover:text-rose-400 transition-colors">
                    {market.name}
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {market.description}
                  </p>

                  {/* Catalogue Specs Grid */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase">Typical Odds:</span>
                      <strong className="text-slate-900 dark:text-white font-black">{market.typicalOddsRange || '1.30 - 2.10'}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase">Risk Profile:</span>
                      <strong className={market.riskLevel?.includes('Low') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                        {market.riskLevel || 'Medium'}
                      </strong>
                    </div>
                  </div>

                  {/* Tactical Tip Preview */}
                  {market.tacticalTip && (
                    <div className="mt-3 bg-slate-50 dark:bg-[#121B2F] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                      <strong className="text-[#E41B13] dark:text-rose-400 block uppercase tracking-wide text-[9px] mb-0.5 font-bold">
                        Statistical Angle:
                      </strong>
                      <p className="line-clamp-2">{market.tacticalTip}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ticketsInMarket.length} Active {ticketsInMarket.length === 1 ? 'Slip' : 'Slips'}
                  </span>

                  <span className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect Market</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. CATALOGUE ITEMS (DENSE LIST VIEW) ── */}
      {viewMode === 'dense' && (
        <div className="space-y-2">
          {processedMarkets.map((market, idx) => (
            <div
              key={market.id}
              onClick={() => onNavigate(`market/${market.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-[#E41B13] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 dark:bg-[#162238] px-2 py-1 rounded">
                  #{idx + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white group-hover:text-[#E41B13] transition-colors">
                      {market.name}
                    </h3>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#162238] text-slate-500">
                      {market.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {market.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                <div className="text-right text-xs font-mono">
                  <span className="text-[#00C250] font-black">{market.averageHitRate || '70%'} Hit</span>
                  <span className="text-slate-400 block text-[10px]">{market.typicalOddsRange || '1.30x'}</span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#162238] text-[#E41B13] group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
