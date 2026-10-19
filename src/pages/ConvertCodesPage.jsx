import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { SUPPORTED_BOOKMAKERS } from '../data/catalogueCodes';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Zap, Copy, Check, ArrowRight, ArrowLeftRight, Search, 
  Filter, Sparkles, ShieldCheck, Flame, RefreshCw, ExternalLink
} from 'lucide-react';

export default function ConvertCodesPage({ onNavigate }) {
  const { codeCatalogue, convertBetCode, triggerCopyModal } = usePredictions();

  // Converter State
  const [inputCode, setInputCode] = useState('');
  const [fromBookie, setFromBookie] = useState('sportybet');
  const [toBookie, setToBookie] = useState('bet9ja');
  const [conversionResult, setConversionResult] = useState(null);
  const [copiedConverted, setCopiedConverted] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Catalogue State
  const [catalogueFilter, setCatalogueFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCatalogueId, setCopiedCatalogueId] = useState(null);

  // Handle conversion
  const handleConvert = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsConverting(true);
    setTimeout(() => {
      const res = convertBetCode(inputCode, fromBookie, toBookie);
      setConversionResult(res);
      setIsConverting(false);
    }, 600);
  };

  const handleSwapBookies = () => {
    const temp = fromBookie;
    setFromBookie(toBookie);
    setToBookie(temp);
    setConversionResult(null);
  };

  const handleCopy = (text, type, id = null) => {
    if (text) {
      if (triggerCopyModal) {
        triggerCopyModal(
          text, 
          type === 'converted' ? toBookie : 'SportyBet', 
          conversionResult?.title || 'Converted Code', 
          conversionResult?.matchedOdds || '2.00'
        );
      } else {
        navigator.clipboard.writeText(text);
      }
      if (type === 'converted') {
        setCopiedConverted(true);
        setTimeout(() => setCopiedConverted(false), 2500);
      } else {
        setCopiedCatalogueId(id);
        setTimeout(() => setCopiedCatalogueId(null), 2500);
      }
    }
  };

  // Filter catalogue codes
  const filteredCatalogue = useMemo(() => {
    return codeCatalogue.filter(item => {
      if (catalogueFilter !== 'all' && item.bookmaker !== catalogueFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCode = item.code?.toLowerCase().includes(q);
        const inTitle = item.title?.toLowerCase().includes(q);
        const inHighlight = item.highlightMatch?.toLowerCase().includes(q);
        if (!inCode && !inTitle && !inHighlight) return false;
      }
      return true;
    });
  }, [codeCatalogue, catalogueFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 1. HEADER ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E41B13] to-amber-500 text-white flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              Bet Code Converter &amp; Live Codes Catalogue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Convert any booking slip between SportyBet, Bet9ja, 1xBet, BetKing, MSport &amp; Betway in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. INSTANT BET CODE CONVERTER (CONVERTBETCODES UX) ── */}
      <div className="rounded-3xl border-2 border-[#E41B13]/30 dark:border-[#E41B13]/40 bg-white dark:bg-[#0E1626] p-5 sm:p-6 shadow-xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E41B13] animate-ping"></span>
            <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
              Instant Cross-Bookmaker Slip Converter
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
            96.4% Market Accuracy
          </span>
        </div>

        <form onSubmit={handleConvert} className="space-y-4">
          
          {/* Bookmaker Selector with Swap Button */}
          <div className="grid grid-cols-1 sm:grid-cols-9 gap-3 items-center">
            
            {/* Origin Bookmaker */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                1. From (Origin Bookmaker)
              </label>
              <select
                value={fromBookie}
                onChange={(e) => setFromBookie(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-display font-bold text-xs focus:outline-none focus:border-[#E41B13]"
              >
                {SUPPORTED_BOOKMAKERS.map(b => (
                  <option key={b.id} value={b.id}>{b.badge}</option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center pt-2 sm:pt-4">
              <button
                type="button"
                onClick={handleSwapBookies}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-[#E41B13] text-slate-600 dark:text-slate-300 hover:text-white transition-all shadow-sm"
                title="Swap bookmakers"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Bookmaker */}
            <div className="sm:col-span-4 space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                2. To (Destination Bookmaker)
              </label>
              <select
                value={toBookie}
                onChange={(e) => setToBookie(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-display font-bold text-xs focus:outline-none focus:border-[#00C250]"
              >
                {SUPPORTED_BOOKMAKERS.map(b => (
                  <option key={b.id} value={b.id}>{b.badge}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Booking Code Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
              3. Enter Booking Code to Convert
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. Q7S287, PZ6US6, 5WGQPQ3, TZUMDQ..."
                className="w-full p-3.5 pr-32 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-sm tracking-wider uppercase focus:outline-none focus:border-[#E41B13]"
              />

              <button
                type="submit"
                disabled={isConverting || !inputCode.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[#E41B13] hover:bg-[#D01710] disabled:opacity-50 text-white font-display font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
              >
                {isConverting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Convert</span>
              </button>
            </div>
          </div>

        </form>

        {/* ── CONVERSION RESULT BOX ── */}
        {conversionResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3.5 shadow-xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-display font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00C250] stroke-[3]" />
                <span>Conversion Complete ({conversionResult.accuracyScore})</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                At {conversionResult.timestamp}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Converted {conversionResult.toBookie.toUpperCase()} Code:
                </span>
                <span className="text-2xl font-mono font-black text-white tracking-wider block">
                  {conversionResult.convertedCode}
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Approx. <strong className="text-amber-300 font-mono">{conversionResult.matchedOdds}x odds</strong> &bull; {conversionResult.eventsCount} Events Matched
                </p>
              </div>

              {/* 1-Tap Copy Button */}
              <button
                onClick={() => handleCopy(conversionResult.convertedCode, 'converted')}
                className={`px-4 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                  copiedConverted
                    ? 'bg-[#00C250] text-black ring-2 ring-emerald-300'
                    : 'bg-[#E41B13] hover:bg-[#D01710] text-white'
                }`}
              >
                {copiedConverted ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Converted Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-white/10 flex items-center justify-between">
              <span>Original: <strong className="text-slate-200">{conversionResult.originalCode}</strong> ({conversionResult.fromBookie})</span>
              <span className="text-amber-400">Punt responsibly &bull; 18+</span>
            </div>

          </div>
        )}

      </div>

      {/* MID-CONVERTER HIGH-RPM AD SLOT */}
      <AdPlaceholder label="Middle Converter Sponsor (728x90 / Native Feed)" />

      {/* ── 3. LIVE BOOKING CODES CATALOGUE & FEED ── */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                Live Booking Codes Catalogue
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified daily slips. Click any code to copy instantly and bounce to your bookmaker.
            </p>
          </div>

          {/* Quick Bookmaker Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none self-start sm:self-auto">
            <button
              onClick={() => setCatalogueFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                catalogueFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({codeCatalogue.length})
            </button>
            <button
              onClick={() => setCatalogueFilter('sportybet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                catalogueFilter === 'sportybet'
                  ? 'bg-[#E41B13] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              🔴 Sporty
            </button>
            <button
              onClick={() => setCatalogueFilter('bet9ja')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                catalogueFilter === 'bet9ja'
                  ? 'bg-[#00C250] text-black shadow-sm font-black'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              🟢 Bet9ja
            </button>
            <button
              onClick={() => setCatalogueFilter('1xbet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                catalogueFilter === '1xbet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              🔵 1xBet
            </button>
            <button
              onClick={() => setCatalogueFilter('betking')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                catalogueFilter === 'betking'
                  ? 'bg-[#004DB8] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              👑 BetKing
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code catalogue by title, code, or team..."
            className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E41B13]"
          />
        </div>

        {/* Catalogue Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCatalogue.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-display font-black uppercase ${
                    item.bookmaker === 'sportybet'
                      ? 'bg-[#E41B13] text-white'
                      : item.bookmaker === 'bet9ja'
                      ? 'bg-[#00C250] text-black'
                      : item.bookmaker === '1xbet'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}>
                    {item.bookmakerName || item.bookmaker}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {item.categoryName || item.category}
                  </span>
                </div>

                <span className="text-xs font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-[#162238] px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {item.odds}x Odds
                </span>
              </div>

              {/* Title & Highlight */}
              <div>
                <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                {item.highlightMatch && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Key: <strong className="text-slate-800 dark:text-slate-200">{item.highlightMatch}</strong> &bull; {item.eventsCount} Legs
                  </p>
                )}
              </div>

              {/* 1-Tap Copy Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider">
                  {item.code}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setInputCode(item.code);
                      setFromBookie(item.bookmaker);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-[#1C2A44] text-[11px] font-display font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    title="Convert this code to another bookmaker"
                  >
                    Convert &rarr;
                  </button>

                  <button
                    onClick={() => handleCopy(item.code, 'catalogue', item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      copiedCatalogueId === item.id
                        ? 'bg-[#00C250] text-black font-bold'
                        : item.bookmaker === 'sportybet'
                        ? 'bg-[#E41B13] hover:bg-[#D01710] text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copiedCatalogueId === item.id ? (
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

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
