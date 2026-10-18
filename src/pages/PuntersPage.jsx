import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  Users, Copy, Check, ShieldCheck, ExternalLink, Zap, 
  ArrowRight, Sparkles, Filter, Search, Award
} from 'lucide-react';

export default function PuntersPage({ onNavigate }) {
  const { punters } = usePredictions();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (code, id) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    }
  };

  const filteredPunters = punters.filter(p => {
    if (selectedRegion !== 'all' && p.region?.toLowerCase() !== selectedRegion.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = p.displayName?.toLowerCase().includes(q);
      const inHandle = p.handle?.toLowerCase().includes(q);
      const inSpec = p.specialty?.toLowerCase().includes(q);
      if (!inName && !inHandle && !inSpec) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 1. HEADER ── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-[#E41B13] text-white text-[10px] font-display font-black uppercase tracking-wider">
                COMMUNITY DIRECTORY
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {punters.length} Analysts Tracked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              Tracked African Punters &amp; Daily Booking Codes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Transparent sports intelligence. We do not display arbitrary win claims—here is the verified list of top tracked African analysts and their ready-to-load daily booking codes.
            </p>
          </div>

          <button
            onClick={() => onNavigate('admin')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] text-white text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
          >
            <span>+ Add Punter in Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH CONTROLS ── */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'nigeria', label: '🇳🇬 Nigeria' },
            { id: 'kenya', label: '🇰🇪 Kenya' },
            { id: 'south africa', label: '🇿🇦 South Africa' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase whitespace-nowrap transition-all ${
                selectedRegion === r.id
                  ? 'bg-[#E41B13] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search punter by name or handle..."
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E41B13]"
          />
        </div>

      </div>

      {/* ── 3. PUNTERS CARDS LIST WITH DAILY BOOKING CODES ── */}
      <div className="space-y-4">
        {filteredPunters.map((punter) => (
          <div
            key={punter.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-sm space-y-3"
          >
            {/* Punter Profile Header Bar */}
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#121B30] border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-[#1a2336] to-[#0A0F1D] border border-slate-700 text-white flex items-center justify-center font-display font-black text-sm shadow-md">
                  {punter.avatar || punter.displayName.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      {punter.displayName}
                    </h2>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {punter.handle}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#162238] font-bold text-slate-700 dark:text-slate-300">
                      {punter.region}
                    </span>
                    <span>&bull;</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {punter.specialty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#00C250] font-black border border-emerald-500/20">
                  {punter.dailyCodes?.length || 0} Slips Live Today
                </span>
              </div>

            </div>

            {/* Punter's Daily Booking Codes List (No Wall of Matches - Codes Only!) */}
            <div className="p-4 sm:p-5 space-y-3">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 block tracking-wider">
                Today's Ready-to-Load Codes from {punter.displayName}:
              </span>

              {punter.dailyCodes && punter.dailyCodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {punter.dailyCodes.map((codeItem) => {
                    const isSporty = codeItem.bookmaker === 'sportybet';
                    const isBet9ja = codeItem.bookmaker === 'bet9ja';

                    return (
                      <div
                        key={codeItem.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#121B2F] flex flex-col justify-between space-y-2.5 shadow-sm"
                      >
                        {/* Slip Line Info */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-display font-black uppercase ${
                              isSporty 
                                ? 'bg-[#E41B13] text-white' 
                                : isBet9ja 
                                ? 'bg-[#00C250] text-black font-black' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {codeItem.bookmaker?.toUpperCase()}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                              {codeItem.gamesCount} Games
                            </span>
                          </div>

                          <span className="text-xs font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-[#162238] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {codeItem.totalOdds}x Odds
                          </span>
                        </div>

                        {/* Market Type */}
                        <div className="text-xs font-display font-bold text-slate-800 dark:text-slate-200">
                          {codeItem.marketType}
                        </div>

                        {/* Booking Code Bar & 1-Tap Copy */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 font-mono font-black text-xs text-slate-900 dark:text-white tracking-wider">
                            {codeItem.code}
                          </div>

                          <button
                            onClick={() => handleCopy(codeItem.code, codeItem.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              copiedCodeId === codeItem.id
                                ? 'bg-[#00C250] text-black font-bold ring-2 ring-emerald-300'
                                : isSporty
                                ? 'bg-[#E41B13] hover:bg-[#D01710] text-white shadow-sm'
                                : 'bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] text-white'
                            }`}
                          >
                            {copiedCodeId === codeItem.id ? (
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
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-mono text-center">
                  No codes logged for today yet. Midnight drop at 02:00 AM WAT.
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
