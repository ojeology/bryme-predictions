import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { isTodayCode, formatCodeDateBadge } from '../utils/codeDates';
import { 
  Copy, Check, Zap, Flame, ShieldCheck, ChevronRight, 
  Share2, ArrowRight, Trophy, Sparkles, Search, Layers, Clock, ExternalLink, Calendar
} from 'lucide-react';

export default function BookingCodesHub({ onNavigate }) {
  const { codeCatalogue, triggerCopyModal } = usePredictions();
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputLoadCode, setInputLoadCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeColumnTab, setActiveColumnTab] = useState('both'); // 'both' | 'today' | 'yesterday'

  const handleCopy = (code, id, bookmaker = 'SportyBet', odds = '', title = 'Banker Acca') => {
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

  const handleLoadCode = (e) => {
    e.preventDefault();
    if (!inputLoadCode.trim()) return;
    const cleanCode = inputLoadCode.trim().toUpperCase();
    handleCopy(cleanCode, 'manual-load', 'SportyBet', '', 'Manual Loaded Slip');
    setInputLoadCode('');
  };

  const filteredCodes = useMemo(() => {
    return (codeCatalogue || []).filter(item => {
      if (selectedBookmaker !== 'all') {
        const b = (item.bookmaker || '').toLowerCase();
        if (selectedBookmaker === 'sportybet' && b !== 'sportybet') return false;
        if (selectedBookmaker === 'footballcom' && b !== 'footballcom') return false;
        if (selectedBookmaker === 'bet9ja' && b !== 'bet9ja') return false;
        if (selectedBookmaker === '1xbet' && b !== '1xbet') return false;
        if (selectedBookmaker === '22bet' && b !== '22bet') return false;
        if (selectedBookmaker === 'betking' && b !== 'betking') return false;
        if (selectedBookmaker === 'other' && ['sportybet', 'footballcom', 'bet9ja', '1xbet', '22bet', 'betking'].includes(b)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCode = item.code?.toLowerCase().includes(q);
        const inTitle = item.title?.toLowerCase().includes(q);
        const inCategory = item.categoryName?.toLowerCase().includes(q);
        const inAuthor = item.author?.toLowerCase().includes(q);
        if (!inCode && !inTitle && !inCategory && !inAuthor) return false;
      }
      return true;
    });
  }, [codeCatalogue, selectedBookmaker, searchQuery]);

  const todayCodes = useMemo(() => filteredCodes.filter(isTodayCode), [filteredCodes]);
  const yesterdayCodes = useMemo(() => filteredCodes.filter(c => !isTodayCode(c)), [filteredCodes]);

  const renderCodeCard = (item, isArchived = false) => {
    const isSporty = item.bookmaker === 'sportybet';
    const isBet9ja = item.bookmaker === 'bet9ja';
    const isFootball = item.bookmaker === 'footballcom';
    const is22Bet = item.bookmaker === '22bet';
    const dateBadge = formatCodeDateBadge(item);
    const hasOdds = item.odds !== null && item.odds !== undefined && item.odds !== '';

    return (
      <div
        key={item.id}
        className={`p-4 rounded-2xl border ${
          isArchived 
            ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0c1220] opacity-90' 
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626]'
        } hover:border-[#E41B13]/60 dark:hover:border-[#E41B13]/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group`}
      >
        {/* Card Top: Bookmaker, Date Badge & Odds */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[10px] font-display font-black uppercase tracking-wider ${
              isSporty 
                ? 'bg-[#E41B13] text-white shadow-sm'
                : isFootball
                ? 'bg-[#008751] text-white shadow-sm'
                : is22Bet
                ? 'bg-teal-600 text-white font-bold'
                : isBet9ja
                ? 'bg-[#00C250] text-black font-black'
                : 'bg-blue-600 text-white'
            }`}>
              {item.bookmakerName || item.bookmaker}
            </span>

            {/* Prominent Assigned Date Badge */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${dateBadge.badgeClass}`}>
              {dateBadge.label}
            </span>

            {item.eventsCount ? (
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-[#162238] px-2 py-0.5 rounded">
                {item.eventsCount} Games
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            {hasOdds ? (
              <span className="font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-[#162238] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {item.odds}{typeof item.odds === 'number' ? 'x' : ''}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-[#162238] px-2 py-0.5 rounded">
                Open Odds
              </span>
            )}
          </div>
        </div>

        {/* Market Type / Title */}
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
            Market: {item.categoryName || 'Verified Market Line'}
          </span>

          <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#E41B13] dark:group-hover:text-rose-400 transition-colors">
            {item.title}
          </h3>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
            <span>By {item.author || item.punterName || 'BRYME Desk'}</span>
            <span>&bull;</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{item.dropTime || dateBadge.label}</span>
          </p>
        </div>

        {/* ── THE BOOKING CODE & 1-TAP LOAD ACTION ── */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider">
            {item.code}
          </div>

          <button
            onClick={() => handleCopy(item.code, item.id, item.bookmakerName || item.bookmaker, item.odds, item.title)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
              copiedId === item.id
                ? 'bg-[#00C250] text-black ring-2 ring-emerald-300'
                : isSporty
                ? 'bg-[#E41B13] hover:bg-[#D01710] text-white'
                : 'bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] text-white'
            }`}
          >
            {copiedId === item.id ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      
      {/* ── 1. SPORTYBET-STYLE SEARCH & LOAD CODE BAR ── */}
      <div className="rounded-2xl border-2 border-[#E41B13]/30 dark:border-[#E41B13]/40 bg-gradient-to-r from-slate-900 via-[#1a2336] to-[#0A0F1D] p-3.5 sm:p-4 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping"></span>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
              BRYME CODE HUB &bull; QUICK LOAD
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            📅 Active Date: Tuesday, Oct 20, 2026
          </span>
        </div>

        {/* Load Slip Input */}
        <form onSubmit={handleLoadCode} className="relative flex items-center">
          <input
            type="text"
            value={inputLoadCode}
            onChange={(e) => setInputLoadCode(e.target.value.toUpperCase())}
            placeholder="Paste any booking code (e.g. TZUMDQ, PZ6US6, 5WGQPQ3)..."
            className="w-full pl-4 pr-32 py-3 rounded-xl bg-black/60 border border-slate-700 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase placeholder-slate-500 focus:outline-none focus:border-[#E41B13]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-md"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Load Slip</span>
          </button>
        </form>
      </div>

      {/* ── 2. FAST BOOKMAKER FILTER TABS ── */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Slips' },
            { id: 'sportybet', label: '🔴 SportyBet' },
            { id: 'footballcom', label: '⚽ Football.com' },
            { id: '22bet', label: '🟢 22Bet (Affiliate)' },
            { id: 'bet9ja', label: '🟢 Bet9ja' },
            { id: '1xbet', label: '🔵 1xBet' },
            { id: 'betking', label: '👑 BetKing' },
            { id: 'other', label: '⚡ Other Books' }
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBookmaker(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase whitespace-nowrap transition-all ${
                selectedBookmaker === b.id
                  ? 'bg-[#E41B13] text-white shadow-md'
                  : 'bg-white dark:bg-[#111A2E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Column Filter Toggle on Mobile */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-slate-400">View:</span>
          <button
            onClick={() => setActiveColumnTab('both')}
            className={`px-2 py-0.5 rounded ${activeColumnTab === 'both' ? 'bg-[#E41B13] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Both
          </button>
          <button
            onClick={() => setActiveColumnTab('today')}
            className={`px-2 py-0.5 rounded ${activeColumnTab === 'today' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Today ({todayCodes.length})
          </button>
          <button
            onClick={() => setActiveColumnTab('yesterday')}
            className={`px-2 py-0.5 rounded ${activeColumnTab === 'yesterday' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Yesterday ({yesterdayCodes.length})
          </button>
        </div>
      </div>

      {/* ── 3. TWO-COLUMN SPLIT: TODAY CODES VS YESTERDAY CODES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        
        {/* ── COLUMN 1: TODAY'S CODES (FRESH DROPS) ── */}
        {(activeColumnTab === 'both' || activeColumnTab === 'today') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b-2 border-emerald-500/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  🟢 Today's Codes ({todayCodes.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Oct 20, 2026 &bull; Live
              </span>
            </div>

            {todayCodes.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  No new codes dropped today for this filter yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCodes.map(c => renderCodeCard(c, false))}
              </div>
            )}
          </div>
        )}

        {/* ── COLUMN 2: YESTERDAY & EARLIER CODES (ARCHIVED / OUTDATED NOTICE) ── */}
        {(activeColumnTab === 'both' || activeColumnTab === 'yesterday') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b-2 border-amber-500/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  🕒 Yesterday &amp; Earlier Slips ({yesterdayCodes.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Oct 19 &amp; Earlier &bull; Archive
              </span>
            </div>

            {yesterdayCodes.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  No yesterday slips in this filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {yesterdayCodes.map(c => renderCodeCard(c, true))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
