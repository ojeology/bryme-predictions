import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  ArrowLeft, Copy, Check, ExternalLink, Calendar, 
  CheckCircle2, Share2, Shield, Flame, Users, Sparkles, ArrowRight
} from 'lucide-react';

export default function PunterProfilePage({ punterId, onNavigate }) {
  const { punters, triggerCopyModal } = usePredictions();
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const punter = punters.find(p => p.id === punterId) || punters[0];
  const otherPunters = punters.filter(p => p.id !== punter.id).slice(0, 3);

  const handleCopy = (code, id, bookmaker, odds, title) => {
    if (code) {
      if (triggerCopyModal) {
        triggerCopyModal(code, bookmaker, title, odds);
      } else {
        navigator.clipboard.writeText(code);
      }
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2500);
    }
  };

  const handleShareProfile = () => {
    const text = `👑 Follow ${punter.displayName}'s daily SportyBet & Bet9ja booking codes on BRYME Predictions: https://predictions.thebryme.com/#/punter/${punter.id}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back button & Share */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('punters')}
          className="inline-flex items-center gap-1.5 text-xs text-[#E41B13] dark:text-rose-400 hover:underline font-display font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Punters Directory</span>
        </button>

        <button
          onClick={handleShareProfile}
          className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-[#25D366]/30 shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Profile</span>
        </button>
      </div>

      {/* TOP PROFILE AD (MONETIZATION) */}
      <AdPlaceholder label="Top Profile Sponsor (728x90 Leaderboard)" />

      {/* Punter Profile Header Card */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-display font-black text-2xl shadow-lg flex-shrink-0">
              {punter.avatar || 'PT'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  {punter.displayName}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                  VERIFIED AFRICAN ANALYST
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center gap-2">
                <span>{punter.handle}</span>
                <span>&bull;</span>
                <span className="text-amber-500 font-bold">{punter.region || 'Africa'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {punter.bio || 'Disciplined statistical sports analyst sharing high-probability accumulator slips and rollover bets.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Primary Specialty</span>
            <span className="font-display font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate block mt-0.5">
              {punter.specialty || 'European Banker Accas'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Slips Live Today</span>
            <span className="text-lg font-black text-[#00C250] block mt-0.5">
              {punter.dailyCodes?.length || 0} Slips
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Typical Odds</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 block mt-0.5">
              1.80x - 3.50x
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Tracked Region</span>
            <span className="text-lg font-black text-amber-500 block mt-0.5">
              {punter.region || 'Nigeria'}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Booking Codes from this punter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎟️</span>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
              Today's Ready-to-Load Codes by {punter.displayName}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Updated 02:00 AM WAT
          </span>
        </div>

        {punter.dailyCodes && punter.dailyCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {punter.dailyCodes.map((codeItem) => {
              const isSporty = codeItem.bookmaker === 'sportybet';
              const isBet9ja = codeItem.bookmaker === 'bet9ja';

              return (
                <div
                  key={codeItem.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-display font-black uppercase ${
                        isSporty 
                          ? 'bg-[#E41B13] text-white' 
                          : isBet9ja 
                          ? 'bg-[#00C250] text-black font-black' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {isSporty ? 'SportyBet' : isBet9ja ? 'Bet9ja' : codeItem.bookmaker?.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        {codeItem.gamesCount ? (
                          <>
                            <span className="text-slate-500">{codeItem.gamesCount} Games</span>
                            <span>&bull;</span>
                          </>
                        ) : null}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-black">{codeItem.totalOdds}x Odds</strong>
                      </div>
                    </div>

                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      {codeItem.marketType}
                    </h3>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider">
                      {codeItem.code}
                    </div>

                    <button
                      onClick={() => handleCopy(codeItem.code, codeItem.id, isSporty ? 'SportyBet' : isBet9ja ? 'Bet9ja' : '1xBet', codeItem.totalOdds, `${punter.displayName}'s ${codeItem.marketType}`)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                        copiedCodeId === codeItem.id
                          ? 'bg-[#00C250] text-black font-bold'
                          : isSporty
                          ? 'bg-[#E41B13] hover:bg-[#D01710] text-white'
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
          <div className="bg-white dark:bg-[#0E1626] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-mono">
            No active slips assigned for this analyst today. Midnight drop scheduled at 02:00 AM WAT.
          </div>
        )}
      </div>

      {/* MID CONTENT IN-FEED AD */}
      <AdPlaceholder label="Mid-Profile In-Feed Ad (300x250 Native Sponsor)" />

      {/* OTHER TRACKED AFRICAN PUNTERS TO EXPLORE (PAGEVIEWS MULTIPLIER) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Explore More Tracked African Analysts
            </h3>
          </div>

          <button
            onClick={() => onNavigate('punters')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All {punters.length}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {otherPunters.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate(`punter/${p.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121B2F] hover:border-amber-500 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-display font-black text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                {p.avatar || 'PT'}
              </div>
              <div className="min-w-0">
                <h4 className="font-display font-black text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                  {p.displayName}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {p.dailyCodes?.length || 0} Slips &bull; {p.region}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
