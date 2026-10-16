import React, { useState } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS, ANYBODY_WIN_TABS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { EDITOR_PICKS } from '../data/editorPicks';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Trophy, ArrowRight, Sparkles, TrendingUp, Users, CheckCircle, 
  Flame, ChevronRight, Layers, Info, ShieldCheck, Calendar 
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  // Anybody-Win tab selection state
  const [activeTab, setActiveTab] = useState('20-selections');

  // Filter tickets for Anybody-Win section based on active tab
  const anybodyWinTickets = TICKETS.filter(t => 
    t.marketId === 'anybody-win' && (t.anybodyWinTab === activeTab || (!t.anybodyWinTab && activeTab === 'todays-picks'))
  );

  // Tickets for market directory preview (1-2 per market)
  const getMarketPreviewTickets = (marketId) => {
    return TICKETS.filter(t => t.marketId === marketId).slice(0, 2);
  };

  // Recent completed results (Won/Lost/Void)
  const recentResults = TICKETS.filter(t => t.status !== 'pending').slice(0, 4);

  return (
    <div className="space-y-8 md:space-y-12">
      
      {/* HERO SECTION: Brief value proposition & mobile focus */}
      <section className="bg-gradient-to-b from-pitch-850 to-pitch-900 border border-pitch-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/15 border border-brand-green/30 text-brand-green text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest African Sports Intelligence &bull; Nigeria &amp; Kenya</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Daily Selections, Honest Records &amp; Public Ladder Challenge
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Most betting groups drop booking codes and delete losses. BRYME preserves every ticket in the public ledger — winning, losing and void. No false promises, no "sure odds" gimmicks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <button
              onClick={() => onNavigate('ladder')}
              className="px-4 py-2.5 bg-brand-green hover:bg-brand-greenDark text-pitch-950 font-bold rounded-xl transition-all shadow-md shadow-brand-green/20 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Explore Ladder Challenge (₦1K &rarr; ₦1M)</span>
            </button>
            <button
              onClick={() => onNavigate('predictions')}
              className="px-4 py-2.5 bg-pitch-800 hover:bg-pitch-750 text-slate-200 font-semibold rounded-xl border border-pitch-700 transition-colors flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Today's Selections</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: ANYBODY-WIN MARKET (Per section 3.2) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green"></span>
                Anybody-Win Market
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pitch-800 text-brand-greenLight border border-pitch-750">
                12 Double Chance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Selections where either club winning settles as Won (excludes draws). Popular for extensive accumulator builds.
            </p>
          </div>

          <button
            onClick={() => onNavigate('markets/anybody-win')}
            className="text-xs text-brand-green hover:text-brand-greenLight font-semibold flex items-center gap-1 self-start sm:self-auto group"
          >
            <span>Full Market Directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Anybody-Win Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ANYBODY_WIN_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-green text-pitch-950 shadow-md font-bold'
                    : 'bg-pitch-850 text-slate-300 hover:bg-pitch-800 border border-pitch-750'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-pitch-950/30 text-pitch-950' : 'bg-pitch-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {anybodyWinTickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
          {anybodyWinTickets.length === 0 && (
            <div className="col-span-full py-8 text-center bg-pitch-850/60 rounded-xl border border-pitch-800 text-xs text-slate-400">
              No tickets currently scheduled in this tab. Check back shortly for updated weekend slips.
            </div>
          )}
        </div>
      </section>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Primary Banner Slot" />

      {/* SECTION 3: BETTING MARKET DIRECTORIES PREVIEWS (Per section 3.3) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-pitch-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-green" />
              Betting Markets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific football wagering markets with verified tactical explanations and source codes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('markets')}
            className="text-xs text-brand-green hover:underline font-semibold flex items-center gap-1"
          >
            <span>All 8 Markets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MARKETS.slice(1, 7).map((market) => {
            const previewTickets = getMarketPreviewTickets(market.id);
            return (
              <div 
                key={market.id} 
                className="bg-brand-card border border-brand-cardBorder rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-pitch-800 text-brand-greenLight border border-pitch-750">
                      {market.badge}
                    </span>
                    <button
                      onClick={() => onNavigate(`markets/${market.slug}`)}
                      className="text-xs text-brand-green hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span>See all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 
                    onClick={() => onNavigate(`markets/${market.slug}`)}
                    className="font-bold text-slate-100 text-base cursor-pointer hover:text-brand-green transition-colors"
                  >
                    {market.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {market.description}
                  </p>
                </div>

                {/* Sub-tickets */}
                <div className="space-y-2 pt-2 border-t border-pitch-800/80">
                  {previewTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => onNavigate(`ticket/${ticket.id}`)}
                      className="p-2 rounded-lg bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-200 block truncate">{ticket.title}</span>
                        <span className="text-[10px] text-slate-400">{ticket.bookmaker} &bull; {ticket.selections.length} games</span>
                      </div>
                      <span className="font-mono font-bold text-brand-green text-xs px-1.5 py-0.5 bg-pitch-800 rounded">
                        {ticket.totalOdds}x
                      </span>
                    </div>
                  ))}
                  {previewTickets.length === 0 && (
                    <div className="text-[11px] text-slate-500 italic py-1">
                      New weekend fixtures loading for {market.shortName}...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: FAVORITE PUNTERS & WEEKEND HUB (Per section 3.4 & 6) */}
      <section className="bg-pitch-850/90 border border-pitch-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-green" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Favorite Punters Catalog
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking popular Twitter/X punters transparently. Independent BRYME verification &bull; No endorsement implied.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('weekend-hub')}
              className="px-3 py-1.5 bg-pitch-800 hover:bg-pitch-750 text-brand-green font-semibold text-xs rounded-lg border border-pitch-700 transition-colors flex items-center gap-1.5"
            >
              <span>Weekend Consensus Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('punters')}
              className="text-xs text-slate-300 hover:text-white underline font-semibold"
            >
              All Punters
            </button>
          </div>
        </div>

        {/* Punters Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PUNTERS.slice(0, 3).map((punter) => (
            <div
              key={punter.id}
              onClick={() => onNavigate(`punters/${punter.id}`)}
              className="bg-pitch-900 border border-pitch-800 hover:border-slate-600 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center font-bold text-brand-green text-xs">
                    {punter.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {punter.displayName}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {punter.handle} &bull; {punter.region}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {punter.bio}
                </p>
              </div>

              {/* Verified Transparent Stats */}
              <div className="bg-pitch-950 p-2 rounded-lg border border-pitch-800 text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Tracked Record</span>
                  <span className="font-mono text-slate-300">
                    <strong className="text-emerald-400">{punter.stats.won}W</strong> - <strong className="text-rose-400">{punter.stats.lost}L</strong> - {punter.stats.void}V
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] uppercase">Avg Odds</span>
                  <span className="font-mono text-brand-green font-bold">{punter.stats.avgOdds}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: EDITOR'S BEST PICK (Saturday & Sunday ~2 Odds) (Per section 3.5 & 7) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Editor's Best Pick (Saturday &amp; Sunday)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Disciplined 2-odds tickets assembled from our lowest-risk selections of the day with tactical reasoning.
            </p>
          </div>

          <button
            onClick={() => onNavigate('editor-picks')}
            className="text-xs text-brand-green hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full Editor Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Responsible Disclaimer Box */}
        <div className="bg-pitch-850/80 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Mandatory Honesty Standard:</strong> "{EDITOR_PICKS.disclaimer}" We track all outcomes honestly ({EDITOR_PICKS.trackedRecord.won} Won / {EDITOR_PICKS.trackedRecord.lost} Lost demo history).
          </div>
        </div>

        {/* Saturday & Sunday Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[EDITOR_PICKS.saturdayPick, EDITOR_PICKS.sundayPick].map((pick) => (
            <div 
              key={pick.id}
              className="bg-brand-card border border-brand-cardBorder rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-brand-green/15 text-brand-green border border-brand-green/30">
                      {pick.day} Special
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {pick.date}
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-brand-green bg-pitch-900 px-2 py-0.5 rounded border border-pitch-750">
                    {pick.targetOdds}x Odds
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-base">{pick.title}</h3>
                
                <div className="mt-3 space-y-2">
                  {pick.selections.map((sel, idx) => (
                    <div key={idx} className="bg-pitch-900 p-2.5 rounded-lg border border-pitch-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{sel.match}</span>
                        <span className="text-brand-green font-mono">{sel.odds}</span>
                      </div>
                      <div className="text-[11px] text-amber-300/90 mt-0.5">
                        Pick: {sel.pick} &bull; {sel.market}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        {sel.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-pitch-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">{pick.bookmaker}:</span>
                  <span className="font-mono font-bold text-slate-200">{pick.bookingCode}</span>
                </div>
                <button
                  onClick={() => onNavigate('editor-picks')}
                  className="text-xs text-brand-green hover:underline font-semibold"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: RECENT RESULTS (Won/Lost/Void/Pending) (Per section 3.6) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-pitch-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Recent Results Archive
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent outcomes tracked by BRYME. We never purge lost tickets.
            </p>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs text-brand-green hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentResults.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      </section>

      {/* BOTTOM RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Footer Leaderboard Slot" />

    </div>
  );
}
