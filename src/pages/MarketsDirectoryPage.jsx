import React, { useState, useMemo } from 'react';
import { MARKETS, MARKET_CATEGORIES } from '../data/markets';
import { TICKETS } from '../data/tickets';
import { Layers, ArrowRight, ShieldCheck, Search, Filter, Percent, Zap, TrendingUp, Sparkles } from 'lucide-react';

export default function MarketsDirectoryPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMarkets = useMemo(() => {
    return MARKETS.filter(m => {
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = m.name.toLowerCase().includes(q);
        const inDesc = m.description.toLowerCase().includes(q);
        const inTip = m.tacticalTip && m.tacticalTip.toLowerCase().includes(q);
        if (!inName && !inDesc && !inTip) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#E41B13] dark:text-rose-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Comprehensive Football Betting Markets Database
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Complete African &amp; European betting markets encyclopaedia across SportyBet, Bet9ja, 1xBet &amp; BetKing. Inspect tactical statistics, typical odds ranges, hit rates, and active slip strategies.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 35+ betting markets (e.g. Over 1.5, Double Chance, BTTS, Corners, Handicap)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E41B13]"
          />
        </div>

        {/* Category Pills Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MARKET_CATEGORIES.map(cat => (
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

      </div>

      {/* Result Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
        <span>Showing {filteredMarkets.length} of {MARKETS.length} Markets in Database</span>
        <span className="text-[#00C250] font-bold">● High Hit Rate Database Verified</span>
      </div>

      {/* Markets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMarkets.map((market) => {
          const ticketsInMarket = TICKETS.filter(t => t.marketId === market.id);

          return (
            <div
              key={market.id}
              onClick={() => onNavigate(`market/${market.id}`)}
              className="bg-white dark:bg-[#0E1626] hover:border-[#E41B13]/60 dark:hover:border-[#E41B13]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-[#E41B13] dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                    {market.badge}
                  </span>
                  
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

                {/* Key Metrics Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block uppercase">Typical Odds:</span>
                    <strong className="text-slate-900 dark:text-white">{market.typicalOddsRange || '1.30 - 2.10'}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block uppercase">Risk Level:</span>
                    <strong className={market.riskLevel?.includes('Low') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                      {market.riskLevel || 'Medium'}
                    </strong>
                  </div>
                </div>

                {/* Tactical Tip Preview */}
                {market.tacticalTip && (
                  <div className="mt-3 bg-slate-50 dark:bg-[#121B2F] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <strong className="text-[#E41B13] dark:text-rose-400 block uppercase tracking-wide text-[9px] mb-0.5 font-bold">
                      Tactical Foundation:
                    </strong>
                    <p className="line-clamp-2">{market.tacticalTip}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {market.presets && market.presets.slice(0, 2).map((p, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 rounded font-mono">
                      {p}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Market</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
