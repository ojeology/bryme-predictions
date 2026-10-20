import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { isTodayCode, formatCodeDateBadge } from '../utils/codeDates';
import { 
  Copy, Check, Zap, Flame, ShieldCheck, ChevronRight, 
  Share2, ArrowRight, Trophy, Sparkles, Search, Layers, Clock, ExternalLink, Calendar, Plus, X
} from 'lucide-react';

export default function BookingCodesHub({ onNavigate }) {
  const { codeCatalogue, markets, punters, addCatalogueCode, addMarketCode, addMarket, triggerCopyModal } = usePredictions();
  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputLoadCode, setInputLoadCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [activeColumnTab, setActiveColumnTab] = useState('both'); // 'both' | 'today' | 'yesterday'
  const [showAddForm, setShowAddForm] = useState(false);

  // New Code Form State
  const [newCodeForm, setNewCodeForm] = useState({
    bookmaker: 'sportybet',
    customBookmaker: '',
    code: '',
    marketId: 'match-assist',
    customMarket: '',
    odds: '',
    gamesCount: '',
    punterId: 'punter-tallman',
    customPunter: ''
  });

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

  const handlePublishCode = (e) => {
    e.preventDefault();
    if (!newCodeForm.code.trim()) return;

    const rawCode = newCodeForm.code.trim().toUpperCase();
    const isCustomBookie = newCodeForm.bookmaker === 'custom';
    const bookmakerName = isCustomBookie 
      ? (newCodeForm.customBookmaker.trim() || 'Custom Bookmaker')
      : (newCodeForm.bookmaker === 'footballcom' ? 'Football.com' 
        : newCodeForm.bookmaker === 'bet9ja' ? 'Bet9ja'
        : newCodeForm.bookmaker === '1xbet' ? '1xBet'
        : newCodeForm.bookmaker === '22bet' ? '22Bet'
        : newCodeForm.bookmaker === 'betking' ? 'BetKing'
        : newCodeForm.bookmaker === 'msport' ? 'MSport'
        : 'SportyBet');
    const bookmakerKey = isCustomBookie
      ? bookmakerName.toLowerCase().replace(/[^a-z0-9]/g, '')
      : newCodeForm.bookmaker;

    // Market resolution
    const isCustomMarket = newCodeForm.marketId === 'custom';
    let targetMarketId = newCodeForm.marketId;
    let targetMarketName = 'Verified Market Slip';

    if (isCustomMarket) {
      const cMktName = newCodeForm.customMarket.trim() || 'Custom Market';
      targetMarketId = cMktName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      targetMarketName = cMktName;

      // Register new market type if not in list
      if (!markets.some(m => m.id === targetMarketId || m.slug === targetMarketId)) {
        addMarket({
          id: targetMarketId,
          slug: targetMarketId,
          name: cMktName,
          shortName: cMktName,
          category: 'specials',
          badge: 'Verified Model',
          riskLevel: 'Medium Risk',
          typicalOddsRange: newCodeForm.odds.trim() ? `${newCodeForm.odds.trim()}x` : '1.50 - 2.50',
          averageHitRate: '75%',
          bestLeagues: ['English Premier League', 'Spanish La Liga', 'German Bundesliga'],
          bookmakerSupport: ['SportyBet', 'Football.com', 'Bet9ja', '1xBet', '22Bet', 'BetKing'],
          description: `${cMktName} betting line.`,
          tacticalTip: `Statistical edge on ${cMktName}.`,
          presets: ['Standard Acca', 'Rollover'],
          howItWorks: `Wager settled on ${cMktName} conditions.`
        });
      }
    } else {
      const foundM = markets.find(m => m.id === targetMarketId || m.slug === targetMarketId);
      if (foundM) targetMarketName = foundM.name;
    }

    // Punter resolution
    const isCustomPunter = newCodeForm.punterId === 'custom';
    const targetPunterName = isCustomPunter
      ? (newCodeForm.customPunter.trim() || 'BRYME Desk')
      : (punters.find(p => p.id === newCodeForm.punterId)?.displayName || 'BRYME Desk');

    // Odds: optional, no forced 2.00
    const rawOdds = newCodeForm.odds.trim();
    const cleanOdds = rawOdds ? (parseFloat(rawOdds) || rawOdds) : null;

    // Games count: optional, strict
    const rawGames = newCodeForm.gamesCount.trim();
    const cleanGames = rawGames ? (parseInt(rawGames, 10) || null) : null;

    const payload = {
      code: rawCode,
      bookmaker: bookmakerKey,
      bookmakerName,
      title: `${targetPunterName} ${cleanOdds ? cleanOdds + 'x ' : ''}Slip (${bookmakerName})`,
      odds: cleanOdds,
      totalOdds: cleanOdds,
      eventsCount: cleanGames,
      gamesCount: cleanGames,
      categoryName: targetMarketName,
      marketId: targetMarketId,
      status: 'active',
      author: targetPunterName,
      punterName: targetPunterName,
      punterId: isCustomPunter ? null : newCodeForm.punterId,
      assignedDate: '2026-10-20',
      dropTime: 'Today, Oct 20',
      formattedDate: 'Today, Oct 20',
      isToday: true,
      isNew: true
    };

    // Add to Code Hub and to Market Codes
    addCatalogueCode(payload);
    addMarketCode(payload);

    setNewCodeForm({
      bookmaker: 'sportybet',
      customBookmaker: '',
      code: '',
      marketId: 'match-assist',
      customMarket: '',
      odds: '',
      gamesCount: '',
      punterId: 'punter-tallman',
      customPunter: ''
    });
    setShowAddForm(false);
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
        if (selectedBookmaker === 'msport' && b !== 'msport') return false;
        if (selectedBookmaker === 'other' && ['sportybet', 'footballcom', 'bet9ja', '1xbet', '22bet', 'betking', 'msport'].includes(b)) return false;
      }

      if (selectedMarketFilter !== 'all') {
        const target = selectedMarketFilter.toLowerCase();
        const cat = (item.categoryName || '').toLowerCase();
        const mId = (item.marketId || '').toLowerCase();
        const tit = (item.title || '').toLowerCase();
        if (!cat.includes(target) && !mId.includes(target) && !tit.includes(target)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCode = item.code?.toLowerCase().includes(q);
        const inTitle = item.title?.toLowerCase().includes(q);
        const inCategory = item.categoryName?.toLowerCase().includes(q);
        const inAuthor = item.author?.toLowerCase().includes(q) || item.punterName?.toLowerCase().includes(q);
        const inBookie = item.bookmakerName?.toLowerCase().includes(q) || item.bookmaker?.toLowerCase().includes(q);
        if (!inCode && !inTitle && !inCategory && !inAuthor && !inBookie) return false;
      }
      return true;
    });
  }, [codeCatalogue, selectedBookmaker, selectedMarketFilter, searchQuery]);

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
      
      {/* ── 1. SPORTYBET-STYLE SEARCH & LOAD CODE BAR + ADD SLIP TOGGLE ── */}
      <div className="rounded-2xl border-2 border-[#E41B13]/30 dark:border-[#E41B13]/40 bg-gradient-to-r from-slate-900 via-[#1a2336] to-[#0A0F1D] p-3.5 sm:p-4 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping"></span>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
              BRYME CODE HUB &bull; QUICK LOAD &bull; TOTAL CONTROL
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
              📅 Today: Oct 20, 2026
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? 'Cancel Form' : '➕ Drop Code to Hub'}</span>
            </button>
          </div>
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

      {/* ── 1.B INLINE FORM: ADD CODE DIRECTLY TO CODE HUB & MARKETS ── */}
      {showAddForm && (
        <form 
          onSubmit={handlePublishCode}
          className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-white dark:bg-[#0E1626] shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Drop New Code into BRYME Code Hub &amp; Markets</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly published to the top of Today's codes column, attached to market, and duplicated to Football.com if SportyBet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Bookmaker */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                1. Bookmaker
              </label>
              <select
                value={newCodeForm.bookmaker}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, bookmaker: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                <option value="sportybet">🔴 SportyBet (+Football.com)</option>
                <option value="footballcom">🟢 Football.com</option>
                <option value="22bet">🟢 22Bet (Affiliate)</option>
                <option value="bet9ja">🟡 Bet9ja</option>
                <option value="1xbet">🔵 1xBet</option>
                <option value="betking">👑 BetKing</option>
                <option value="msport">⚡ MSport</option>
                <option value="custom">✏️ Other Bookmaker (Type Any)</option>
              </select>
              {newCodeForm.bookmaker === 'custom' && (
                <input
                  type="text"
                  required
                  placeholder="Type bookmaker name..."
                  value={newCodeForm.customBookmaker}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, customBookmaker: e.target.value })}
                  className="mt-2 w-full p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-emerald-500 text-slate-900 dark:text-white font-bold text-xs"
                />
              )}
            </div>

            {/* Booking Code */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                2. Booking Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PZ6US6, 5WGQPQ3"
                value={newCodeForm.code}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-sm tracking-wider uppercase"
              />
            </div>

            {/* Market */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                3. Market Type
              </label>
              <select
                value={newCodeForm.marketId}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, marketId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {(markets || []).map(m => (
                  <option key={m.id || m.slug} value={m.id || m.slug}>
                    {m.name}
                  </option>
                ))}
                <option value="custom">✏️ Other Market (Type Any)</option>
              </select>
              {newCodeForm.marketId === 'custom' && (
                <input
                  type="text"
                  required
                  placeholder="Type any market name (e.g. Match Assist)..."
                  value={newCodeForm.customMarket}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, customMarket: e.target.value })}
                  className="mt-2 w-full p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-emerald-500 text-slate-900 dark:text-white font-bold text-xs"
                />
              )}
            </div>

            {/* Total Odds */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                4. Total Odds (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 3.45, 10000, or leave blank"
                value={newCodeForm.odds}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, odds: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
              />
            </div>

            {/* Games Count */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                5. Games Count (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 12 (leave blank to omit)"
                value={newCodeForm.gamesCount}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, gamesCount: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            {/* Punter / Source */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                6. Dropped By (Punter)
              </label>
              <select
                value={newCodeForm.punterId}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, punterId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              >
                {(punters || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.pinned ? '📌 ' : ''}{p.displayName} ({p.handle || p.specialty || 'Analyst'})
                  </option>
                ))}
                <option value="custom">✏️ Other Punter / Source</option>
              </select>
              {newCodeForm.punterId === 'custom' && (
                <input
                  type="text"
                  required
                  placeholder="Type punter name..."
                  value={newCodeForm.customPunter}
                  onChange={(e) => setNewCodeForm({ ...newCodeForm, customPunter: e.target.value })}
                  className="mt-2 w-full p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-emerald-500 text-slate-900 dark:text-white font-bold text-xs"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-display font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Publish to Code Hub &amp; Markets</span>
            </button>
          </div>
        </form>
      )}

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
            { id: 'msport', label: '⚡ MSport' },
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

      {/* ── 2.B DYNAMIC MARKET FILTER PILLS (UNRESTRICTED) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex-shrink-0">
          Market Filter:
        </span>
        {[
          { id: 'all', label: 'All Markets' },
          { id: 'assist', label: '👟 Match Assist' },
          { id: 'goalscorer', label: '🎯 Anytime Goalscorer' },
          { id: 'shots', label: '🎯 Shots on Target' },
          { id: '1.5', label: '⚽ Over 1.5' },
          { id: '2.5', label: '🔥 Over 2.5' },
          { id: 'btts', label: '⚔️ Both Teams (GG)' },
          { id: 'double', label: '🛡️ Double Chance' },
          { id: 'corner', label: '🚩 Corners' },
          { id: 'tackle', label: '🛡️ Tackles' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMarketFilter(m.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
              selectedMarketFilter === m.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
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
