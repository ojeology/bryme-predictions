import React, { useState } from 'react';
import { TICKETS } from '../data/tickets';
import { MARKETS } from '../data/markets';
import { PUNTERS } from '../data/punters';
import { ACTIVE_CHALLENGE, LADDER_AGGREGATE_STATS } from '../data/ladder';
import SportyMatchRow from '../components/SportyMatchRow';
import VisibleLadder from '../components/VisibleLadder';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Trophy, ArrowRight, Sparkles, TrendingUp, Users, CheckCircle, 
  Flame, ChevronRight, Layers, Info, ShieldCheck, Calendar, Zap, 
  Copy, Check, Target, Award, Globe
} from 'lucide-react';

export default function HomePage({ onNavigate, onSelectOdd, selectedOdds = [] }) {
  const [selectedLeagueTab, setSelectedLeagueTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Flatten match selections for the SportyBet match list
  const allMatches = [];
  TICKETS.forEach(ticket => {
    if (ticket.selections) {
      ticket.selections.forEach(sel => {
        allMatches.push({
          id: sel.id,
          ticketId: ticket.id,
          match: sel.match,
          homeTeam: sel.homeTeam,
          awayTeam: sel.awayTeam,
          league: sel.league,
          kickoff: sel.kickoff,
          pick: sel.pick,
          odds: sel.odds,
          region: ticket.region,
          bookingCode: ticket.bookingCode,
          status: sel.status,
          odds1: (sel.odds * 0.95).toFixed(2),
          oddsX: '3.20',
          odds2: (sel.odds * 1.35).toFixed(2),
        });
      });
    }
  });

  // Filter matches based on selected tab
  const displayedMatches = allMatches.filter(m => {
    if (selectedLeagueTab === 'all') return true;
    return m.region === selectedLeagueTab;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* ── 1. SPORTYBET HERO BANNER: THE LADDER CHALLENGE ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#B7151C] via-[#E41B23] to-[#8E0E14] text-white p-4 sm:p-5 shadow-sporty-btn relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 bg-black/25 px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Live Rollover Challenge #50
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              ₦1,000 &rarr; ₦1,000,000 Target
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white leading-tight">
                Step 3 of 18 &bull; Current Purse: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </h1>
              <p className="text-xs text-white/90 mt-0.5">
                Today's 1.50 Code: <strong className="font-mono text-white underline">{ACTIVE_CHALLENGE.sportyCode}</strong> (Arsenal 1X + Bayern vs Stuttgart O2.5)
              </p>
            </div>

            {/* Quick Copy Code Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => handleCopyCode(ACTIVE_CHALLENGE.sportyCode)}
                className="px-3.5 py-2 bg-white text-sporty-red hover:bg-slate-100 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => onNavigate('ladder')}
                className="px-3.5 py-2 bg-black/25 hover:bg-black/40 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Ledger &rarr;
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-300 rounded-full" style={{ width: '16.7%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/80 font-mono">
              <span>Day 6 Safe Haven: Bank 50% (₦5,695)</span>
              <span>18 Wins Needed for ₦1M</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SPORTYBET SHORTCUTS GRID ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Rollover Ladder', icon: '🪜', action: () => onNavigate('ladder') },
          { label: 'Nigeria NPFL', icon: '🇳🇬', action: () => setSelectedLeagueTab('nigeria') },
          { label: 'Kenya FKF', icon: '🇰🇪', action: () => setSelectedLeagueTab('kenya') },
          { label: 'Ghana GPL', icon: '🇬🇭', action: () => setSelectedLeagueTab('ghana') },
          { label: 'South Africa', icon: '🇿🇦', action: () => setSelectedLeagueTab('south-africa') },
          { label: 'Results Archive', icon: '📜', action: () => onNavigate('results') },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="rounded-xl border border-slate-200 dark:border-sporty-border bg-white dark:bg-sporty-card hover:bg-slate-50 dark:hover:bg-sporty-oddsBox p-2.5 flex flex-col items-center justify-center gap-1 transition-all shadow-sm"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-display font-bold text-slate-800 dark:text-slate-200 text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── 3. SPORTYBET MATCHES TABLE (Iconic 1 X 2 Odds List) ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-sporty-border bg-white dark:bg-sporty-card overflow-hidden shadow-sm">
        
        {/* Table Header: Market & League Filter Tabs */}
        <div className="bg-slate-100 dark:bg-sporty-oddsBox border-b border-slate-200 dark:border-sporty-border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Matches' },
              { id: 'nigeria', label: '🇳🇬 NPFL' },
              { id: 'kenya', label: '🇰🇪 FKF' },
              { id: 'ghana', label: '🇬🇭 GPL' },
              { id: 'south-africa', label: '🇿🇦 PSL' },
              { id: 'north-africa-caf', label: '🏆 CAF' },
              { id: 'europe', label: '🇪🇺 Top Europe' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedLeagueTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  selectedLeagueTab === tab.id
                    ? 'bg-sporty-red text-white shadow-sm'
                    : 'bg-white dark:bg-sporty-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-sporty-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Odds Column Headers (1 | X | 2) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            <span className="w-16 text-center">1</span>
            <span className="w-16 text-center">X</span>
            <span className="w-16 text-center">2</span>
          </div>
        </div>

        {/* Matches Rows */}
        <div className="divide-y divide-slate-100 dark:divide-sporty-border">
          {displayedMatches.slice(0, 10).map((m, idx) => (
            <SportyMatchRow 
              key={m.id || idx}
              match={m}
              selectedOdds={selectedOdds}
              onSelectOdd={onSelectOdd}
              onNavigate={onNavigate}
            />
          ))}

          {displayedMatches.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No matches found for this league filter.
            </div>
          )}
        </div>
      </div>

      {/* ── 4. THE VISIBLE 18-STEP ROLLOVER LADDER ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sporty-red/10 text-sporty-red flex items-center justify-center font-bold text-xs">
              🪜
            </span>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
              The Visible 18-Step Rollover Ladder
            </h2>
          </div>
          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-sporty-red hover:underline flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="SportyBet Placement Slot" />

      {/* ── 5. RECENT RESULTS ARCHIVE (PAN-AFRICAN) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              📜
            </span>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
              Recent Tracked Results (African &amp; Global)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-sporty-red hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-sporty-border bg-white dark:bg-sporty-card divide-y divide-slate-100 dark:divide-sporty-border overflow-hidden">
          {TICKETS.filter(t => t.status !== 'pending').slice(0, 4).map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onNavigate(`ticket/${ticket.id}`)}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-sporty-oddsBox cursor-pointer transition-colors"
            >
              <div className="truncate pr-2">
                <span className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                  {ticket.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {ticket.punterName} &bull; {ticket.totalOdds}x &bull; {ticket.date}
                </span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-display font-black uppercase ${
                ticket.status === 'won' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
              }`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
