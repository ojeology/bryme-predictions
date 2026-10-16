import React, { useState } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS, ANYBODY_WIN_TABS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { EDITOR_PICKS } from '../data/editorPicks';
import { ACTIVE_CHALLENGE, LADDER_AGGREGATE_STATS } from '../data/ladder';
import VisibleLadder from '../components/VisibleLadder';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import RegionSelector from '../components/RegionSelector';
import CurrencyCalculator from '../components/CurrencyCalculator';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Trophy, ArrowRight, Sparkles, TrendingUp, Users, CheckCircle, 
  Flame, ChevronRight, Layers, Info, ShieldCheck, Calendar, Zap, 
  Copy, Check, Target, Award, Globe
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMarketTab, setSelectedMarketTab] = useState('all-markets');
  const [anybodyTab, setAnybodyTab] = useState('20-selections');

  // Filter tickets by selected region and market
  const currentTickets = TICKETS.filter(t => {
    if (selectedRegion !== 'all' && t.region !== selectedRegion) return false;
    if (selectedMarketTab === 'all-markets') return true;
    if (selectedMarketTab === 'anybody-win') {
      return t.marketId === 'anybody-win' && (t.anybodyWinTab === anybodyTab || !t.anybodyWinTab);
    }
    return t.marketId === selectedMarketTab;
  });

  const recentResults = TICKETS.filter(t => t.status !== 'pending').slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ── 1. WELCOME HERO (Clean Light & Dark Mode) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 text-white p-5 sm:p-7 shadow-lg">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/[0.08] blur-2xl pointer-events-none" />
        <div className="absolute right-10 -bottom-10 w-36 h-36 rounded-full bg-amber-400/[0.1] blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/[0.12] border border-white/[0.2] rounded-md px-2.5 py-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-white">
              Official Pan-African Sports Intelligence &bull; 18+
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white leading-tight">
            BRYME Predictions <span className="text-amber-300">&amp; The Rollover Ladder</span>
          </h1>

          <p className="text-white/85 text-xs sm:text-sm max-w-xl leading-relaxed">
            Covering Nigeria (NPFL), Kenya (FKF), Ghana (GPL), South Africa (PSL), and CAF Champions League with 100% verified bookkeeping. Zero deleted losses.
          </p>

          {/* Ladder Quick Progress Meter */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Rollover Progress: <strong>Step 3 of 18</strong></span>
              </span>
              <span className="text-amber-300 font-bold font-mono">
                Purse: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </span>
            </div>

            <div className="h-2 w-full bg-white/[0.15] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full" style={{ width: '16.7%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TWO PRIMARY ACTION TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tile 1: The Ladder */}
        <div 
          onClick={() => onNavigate('ladder')}
          className="rounded-2xl border border-emerald-500/30 hover:border-emerald-500 bg-white dark:bg-[#0E172A] p-4 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-sm">The Rollover Ladder</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">₦1,000 &rarr; ₦1M · Step 3 Active</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Tile 2: Editor's Picks */}
        <div 
          onClick={() => onNavigate('editor-picks')}
          className="rounded-2xl border border-amber-500/30 hover:border-amber-500 bg-white dark:bg-[#0E172A] p-4 flex items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-sm">Editor's Best Pick</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Weekend 2.00 Odds · Form Analysis</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* ── 3. SIGNATURE FEATURE: THE VISIBLE LADDER ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-display font-bold text-xs">
              🪜
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
              The Visible Rollover Ladder
            </h2>
          </div>
          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

      {/* ── 4. PAN-AFRICAN REGIONAL LEAGUE SELECTIONS ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-display font-bold text-xs">
              🌍
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
              Pan-African League Selections
            </h2>
          </div>
          <button
            onClick={() => onNavigate('predictions')}
            className="text-xs font-display font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* African Region Selector Chips */}
        <RegionSelector 
          selectedRegion={selectedRegion} 
          onSelectRegion={setSelectedRegion} 
        />

        {/* Slips List */}
        <div className="space-y-3">
          {currentTickets.slice(0, 3).map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}

          {currentTickets.length === 0 && (
            <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#0A1224] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-500">
              No tickets currently scheduled for this African league. Check back before kickoff.
            </div>
          )}
        </div>
      </section>

      {/* ── 5. CURRENCY & PAYOUT CALCULATOR ── */}
      <section className="space-y-3">
        <CurrencyCalculator />
      </section>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Featured Placement Slot" />

      {/* ── 6. FAVORITE PUNTERS & CONSENSUS ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-display font-bold text-xs">
              👥
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
              Favorite Punters Catalog
            </h2>
          </div>
          <button
            onClick={() => onNavigate('weekend-hub')}
            className="text-xs font-display font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Consensus Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Punter Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PUNTERS.slice(0, 4).map((punter) => (
            <div
              key={punter.id}
              onClick={() => onNavigate(`punters/${punter.id}`)}
              className="rounded-2xl border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 bg-white dark:bg-[#0E172A] p-3.5 cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-display font-black text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
                  {punter.avatar}
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {punter.displayName}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {punter.handle} &bull; {punter.region}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {punter.stats.won}W - {punter.stats.lost}L ({punter.stats.avgOdds}x avg)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. RECENT RESULTS ARCHIVE ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-display font-bold text-xs">
              📜
            </div>
            <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
              Recent Tracked Results (African &amp; Global)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentResults.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onNavigate(`ticket/${ticket.id}`)}
              className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-[#0E172A] p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors shadow-sm"
            >
              <div className="truncate pr-2">
                <span className="font-display font-bold text-xs text-slate-900 dark:text-white block truncate">
                  {ticket.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {ticket.punterName} &bull; {ticket.totalOdds}x &bull; {ticket.date}
                </span>
              </div>
              <StatusBadge status={ticket.status} size="xs" />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
