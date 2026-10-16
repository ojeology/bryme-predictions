import React, { useState } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS, ANYBODY_WIN_TABS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { EDITOR_PICKS } from '../data/editorPicks';
import { ACTIVE_CHALLENGE, LADDER_AGGREGATE_STATS } from '../data/ladder';
import VisibleLadder from '../components/VisibleLadder';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Trophy, ArrowRight, Sparkles, TrendingUp, Users, CheckCircle, 
  Flame, ChevronRight, Layers, Info, ShieldCheck, Calendar, Zap 
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
      
      {/* 1. HERO SECTION: Modern Stadium Visual Atmosphere */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F1E38] via-[#0A1528] to-[#070D1A] border-2 border-[#1E3258] p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-fortegreen-neon/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fortegreen-neon/15 border border-fortegreen-neon text-fortegreen-neon text-xs font-display font-black tracking-wider uppercase shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Honest African Sports Intelligence &bull; Nigeria &bull; Kenya</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-tight">
            Transparent Football Selections &amp; The Public Ladder
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Most betting groups drop booking codes and silently delete losses. BRYME preserves every ticket in the public ledger — winning, losing and void. No fake promises, no "sure odds" scams.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ladder')}
              className="px-5 py-3 bg-fortegreen-neon hover:bg-[#00c853] text-pitch-950 font-display font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-glow-green flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              <span>Explore The Ladder (₦1K &rarr; ₦1M)</span>
            </button>
            <button
              onClick={() => onNavigate('predictions')}
              className="px-5 py-3 bg-[#121E36] hover:bg-[#182847] text-white font-display font-bold text-sm uppercase tracking-wider rounded-2xl border border-[#1E3258] transition-colors flex items-center gap-2"
            >
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Today's Selections</span>
            </button>
          </div>

          {/* Key Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#182847]">
            <div className="bg-[#050A14]/70 p-2.5 rounded-xl border border-[#182847]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Challenges Run</span>
              <span className="text-base font-display font-black text-white">{LADDER_AGGREGATE_STATS.challengesStarted} Total</span>
            </div>
            <div className="bg-[#050A14]/70 p-2.5 rounded-xl border border-[#182847]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Day 6 Banked</span>
              <span className="text-base font-display font-black text-fortegreen-neon">{LADDER_AGGREGATE_STATS.milestonesSecuredDay6} Times</span>
            </div>
            <div className="bg-[#050A14]/70 p-2.5 rounded-xl border border-[#182847]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Banked</span>
              <span className="text-base font-display font-black text-amber-400">₦{LADDER_AGGREGATE_STATS.totalBankedNGN.toLocaleString()}</span>
            </div>
            <div className="bg-[#050A14]/70 p-2.5 rounded-xl border border-[#182847]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Honest Archive</span>
              <span className="text-base font-display font-black text-white">0 Deleted</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SIGNATURE VISIBLE LADDER ARENA (Per User Directive) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3258] pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-fortegreen-neon fill-fortegreen-neon" />
              Signature Feature: The Rollover Ladder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A visible physical progression. Follow each step from ₦1,000 launch to the ₦1,000,000 peak.
            </p>
          </div>

          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Ledger Table</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* The Visible Ladder Graphic Component */}
        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Primary Banner Slot" />

      {/* 3. ANYBODY-WIN MARKET (Per section 3.2) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3258] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-fortegreen-neon shadow-[0_0_8px_#00E676]"></span>
                Anybody-Win Market
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#121E36] text-fortegreen-neon border border-[#1E3258]">
                12 Double Chance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Selections where either club winning settles as Won (excludes draws). Popular for extensive accumulator slips.
            </p>
          </div>

          <button
            onClick={() => onNavigate('markets/anybody-win')}
            className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Market Directory</span>
            <ArrowRight className="w-4 h-4" />
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
                className={`px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-fortegreen-neon text-pitch-950 font-black shadow-glow-green scale-[1.02]'
                    : 'bg-[#0C1527] text-slate-300 hover:bg-[#121E36] border border-[#1E3258]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-pitch-950 text-fortegreen-neon font-black' : 'bg-[#182847] text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anybodyWinTickets.map((ticket) => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onNavigate={onNavigate} 
            />
          ))}
          {anybodyWinTickets.length === 0 && (
            <div className="col-span-full py-8 text-center bg-[#0C1527] rounded-2xl border border-[#1E3258] text-xs text-slate-400">
              No tickets currently scheduled in this tab. Check back shortly for updated weekend slips.
            </div>
          )}
        </div>
      </section>

      {/* 4. BETTING MARKET DIRECTORIES PREVIEWS (Per section 3.3) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1E3258] pb-3">
          <div>
            <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-fortegreen-neon" />
              Football Betting Markets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific football wagering markets with verified tactical explanations and source codes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('markets')}
            className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>All 8 Markets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MARKETS.slice(1, 7).map((market) => {
            const previewTickets = getMarketPreviewTickets(market.id);
            return (
              <div 
                key={market.id} 
                className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#121E36] text-fortegreen-neon border border-[#1E3258]">
                      {market.badge}
                    </span>
                    <button
                      onClick={() => onNavigate(`markets/${market.slug}`)}
                      className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                    >
                      <span>See all</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 
                    onClick={() => onNavigate(`markets/${market.slug}`)}
                    className="font-display font-black text-white text-lg cursor-pointer hover:text-fortegreen-neon transition-colors"
                  >
                    {market.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {market.description}
                  </p>
                </div>

                {/* Sub-tickets */}
                <div className="space-y-2 pt-2 border-t border-[#182847]">
                  {previewTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => onNavigate(`ticket/${ticket.id}`)}
                      className="p-3 rounded-xl bg-[#070D1A] hover:bg-[#121E36] border border-[#182847] cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-100 block truncate">{ticket.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ticket.bookmaker} &bull; {ticket.selections.length} games</span>
                      </div>
                      <span className="font-mono font-black text-fortegreen-neon text-xs px-2 py-1 bg-[#121E36] rounded-lg border border-fortegreen-neon/30">
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

      {/* 5. FAVORITE PUNTERS & WEEKEND HUB (Per section 3.4 & 6) */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3258] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-fortegreen-neon" />
              <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                Favorite Punters Catalog
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking Twitter/X sports punters transparently. Independent BRYME verification &bull; No endorsement implied.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('weekend-hub')}
              className="px-4 py-2 bg-fortegreen-neon hover:bg-[#00c853] text-pitch-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow-green flex items-center gap-1.5"
            >
              <span>Consensus Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('punters')}
              className="text-xs text-slate-300 hover:text-white font-display font-bold uppercase tracking-wider underline"
            >
              All Punters
            </button>
          </div>
        </div>

        {/* Punters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PUNTERS.slice(0, 3).map((punter) => (
            <div
              key={punter.id}
              onClick={() => onNavigate(`punters/${punter.id}`)}
              className="bg-[#070D1A] border border-[#182847] hover:border-fortegreen-neon/60 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-fortegreen-neon/20 border border-fortegreen-neon/40 flex items-center justify-center font-display font-black text-fortegreen-neon text-sm shadow-inner">
                    {punter.avatar}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-100 group-hover:text-fortegreen-neon transition-colors">
                      {punter.displayName}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {punter.handle} &bull; {punter.region}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {punter.bio}
                </p>
              </div>

              {/* Verified Transparent Stats */}
              <div className="bg-[#050A14] p-2.5 rounded-xl border border-[#121E36] text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">BRYME Tracked</span>
                  <span className="font-mono text-slate-200">
                    <strong className="text-fortegreen-neon">{punter.stats.won}W</strong> - <strong className="text-rose-400">{punter.stats.lost}L</strong> - {punter.stats.void}V
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] uppercase font-mono">Avg Odds</span>
                  <span className="font-mono text-fortegreen-neon font-black">{punter.stats.avgOdds}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. EDITOR'S BEST PICK (Saturday & Sunday ~2 Odds) (Per section 3.5 & 7) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3258] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-display font-black text-white">
                Editor's Best Pick (Saturday &amp; Sunday)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Disciplined 2-odds tickets assembled from our lowest-risk selections of the day with tactical reasoning.
            </p>
          </div>

          <button
            onClick={() => onNavigate('editor-picks')}
            className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Editor Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsible Disclaimer Box */}
        <div className="bg-[#0C1527] border border-amber-900/50 rounded-2xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
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
              className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs uppercase px-2.5 py-1 rounded-full bg-fortegreen-neon/15 text-fortegreen-neon border border-fortegreen-neon/40">
                      {pick.day} Special
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {pick.date}
                    </span>
                  </div>
                  <span className="font-mono font-black text-base text-fortegreen-neon bg-[#070D1A] px-2.5 py-1 rounded-xl border border-[#182847]">
                    {pick.targetOdds}x Odds
                  </span>
                </div>

                <h3 className="font-display font-black text-white text-lg">{pick.title}</h3>
                
                <div className="mt-3 space-y-2.5">
                  {pick.selections.map((sel, idx) => (
                    <div key={idx} className="bg-[#070D1A] p-3 rounded-xl border border-[#182847] text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-100">
                        <span>{sel.match}</span>
                        <span className="text-fortegreen-neon font-mono font-bold">{sel.odds}</span>
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

              <div className="pt-3 border-t border-[#182847] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">{pick.bookmaker}:</span>
                  <span className="font-mono font-black text-fortegreen-neon">{pick.bookingCode}</span>
                </div>
                <button
                  onClick={() => onNavigate('editor-picks')}
                  className="text-xs font-display font-bold text-fortegreen-neon hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. RECENT RESULTS (Won/Lost/Void/Pending) (Per section 3.6) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3258] pb-3">
          <div>
            <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-fortegreen-neon" />
              Recent Results Archive
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent outcomes tracked by BRYME. We never purge lost tickets.
            </p>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-fortegreen-neon hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Archive</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
