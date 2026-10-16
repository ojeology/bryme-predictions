import React, { useState } from 'react';
import { TICKETS, LEAGUES_DATA } from '../data/tickets';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import SportyMatchRow from '../components/SportyMatchRow';
import VisibleLadder from '../components/VisibleLadder';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  Trophy, ArrowRight, TrendingUp, ChevronRight, Zap, 
  Copy, Check, Target, Award, ShieldCheck, Flame
} from 'lucide-react';

export default function HomePage({ onNavigate, onSelectOdd, selectedOdds = [], activeLeague = 'all', onSelectLeague }) {
  const [selectedLeagueTab, setSelectedLeagueTab] = useState(activeLeague || 'all');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Flatten match selections for the match list
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
          leagueId: ticket.leagueId || (ticket.region === 'nigeria' || ticket.region === 'kenya' || ticket.region === 'south-africa' || ticket.region === 'ghana' ? 'africa' : ticket.region),
          region: ticket.region,
          bookingCode: ticket.bookingCode,
          sportyCode: ticket.sportyCode,
          status: sel.status,
          odds1: sel.odds1 || (sel.odds * 0.95).toFixed(2),
          oddsX: sel.oddsX || '3.25',
          odds2: sel.odds2 || (sel.odds * 1.35).toFixed(2),
        });
      });
    }
  });

  // Filter matches based on selected tab
  const displayedMatches = allMatches.filter(m => {
    if (selectedLeagueTab === 'all') return true;
    return m.leagueId === selectedLeagueTab || m.region === selectedLeagueTab;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      
      {/* ── 1. MATURE HERO BANNER: THE LADDER CHALLENGE ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#132347] to-[#0A1020] text-white p-4 sm:p-5 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-blue-600/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-600/30 border border-blue-400/40 text-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Rollover Challenge #50
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              ₦1,000 &rarr; ₦1,000,000 Target (50% Banking at Day 6)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white leading-tight">
                Step 3 of 18 &bull; Current Purse: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                European Selection: <strong className="font-mono text-white underline">{ACTIVE_CHALLENGE.todaysCode}</strong> (Arsenal 1X + Bayern vs Stuttgart O2.5)
              </p>
            </div>

            {/* Quick Copy Code Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => handleCopyCode(ACTIVE_CHALLENGE.todaysCode)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 border border-blue-400/30"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={() => onNavigate('ladder')}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10"
              >
                Full Ladder &rarr;
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full" style={{ width: '16.7%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Day 6 Safe Haven: Bank 50% (₦5,695)</span>
              <span>European Fixture Accuracy &bull; 18 Wins Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TOP SIX EUROPEAN LEAGUES QUICK ACCESS GRID ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', id: 'epl' },
          { label: 'Spanish La Liga', icon: '🇪🇸', id: 'laliga' },
          { label: 'Italian Serie A', icon: '🇮🇹', id: 'seriea' },
          { label: 'Bundesliga', icon: '🇩🇪', id: 'bundesliga' },
          { label: 'French Ligue 1', icon: '🇫🇷', id: 'ligue1' },
          { label: 'African Leagues', icon: '🌍', id: 'africa' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedLeagueTab(item.id)}
            className={`rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
              selectedLeagueTab === item.id
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/30'
                : 'bg-white dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-[#162032]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-display font-bold text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── 3. TOP MATCHES TABLE (1 X 2 Odds Grid) ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden shadow-sm">
        
        {/* Table Filter Tabs */}
        <div className="bg-slate-50 dark:bg-[#0E1626] border-b border-slate-200 dark:border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {LEAGUES_DATA.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedLeagueTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                  selectedLeagueTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                    : 'bg-white dark:bg-[#162032] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="mr-1">{tab.flag}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Odds Column Headers (1 | X | 2) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            <span className="w-16 text-center">1 (Home)</span>
            <span className="w-16 text-center">X (Draw)</span>
            <span className="w-16 text-center">2 (Away)</span>
          </div>
        </div>

        {/* Matches Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {displayedMatches.map((m, idx) => (
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
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              🪜
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                The Visible 18-Step Rollover Ladder
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1,000 NGN &rarr; 1,000,000 NGN with 50% Banking at Day 6 &amp; Day 12
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Full Ledger &amp; History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Top Betting Partner Slot (18+ Gamble Responsibly)" />
    </div>
  );
}
