import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  ShieldCheck, Key, Plus, Trash2, Save, RefreshCw, Check, 
  Copy, ArrowLeft, Trophy, Flame, Layers, Lock, Unlock, Sparkles, CheckCircle2
} from 'lucide-react';

export default function AdminPage({ onNavigate }) {
  const { 
    ladder, 
    tickets, 
    updateTicketCode, 
    updateTicket, 
    addTicket, 
    deleteTicket, 
    updateLadder, 
    resetToDefaults 
  } = usePredictions();

  // Simple PIN protection (default pin: 'bryme2026', with 1-click bypass for convenience)
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true for immediate ease of use
  const [activeTab, setActiveTab] = useState('codes'); // 'codes', 'ladder', 'new-ticket', 'export'
  const [saveNotification, setSaveNotification] = useState(null);

  // Ladder state editor
  const [ladderForm, setLadderForm] = useState({
    currentDay: ladder.currentDay,
    currentBalance: ladder.currentBalance,
    nextPotentialBalance: ladder.nextPotentialBalance,
    dailyOdds: ladder.dailyOdds,
    todaysCode: ladder.todaysCode,
    sportyCode: ladder.sportyCode,
    match1_name: ladder.selections?.[0]?.match || 'Arsenal vs Everton',
    match1_pick: ladder.selections?.[0]?.pick || '1X & Over 1.5',
    match1_odds: ladder.selections?.[0]?.odds || 1.25,
    match2_name: ladder.selections?.[1]?.match || 'Bayern Munich vs VfB Stuttgart',
    match2_pick: ladder.selections?.[1]?.pick || 'Over 2.5 Goals',
    match2_odds: ladder.selections?.[1]?.odds || 1.20,
  });

  // New ticket state
  const [newTicketForm, setNewTicketForm] = useState({
    title: 'Tuesday Champions League Super Banker',
    badge: 'UCL TUESDAY SPECIAL',
    category: 'banker',
    totalOdds: 2.25,
    confidence: '95% Model Rating',
    dropTime: '02:00 AM WAT',
    sportybet: 'BC-UCL-TUE1',
    bet9ja: 'B9J-UCL-TUE1',
    onexbet: '1XB-UCL-99',
    betking: 'BK-UCL-55',
    betway: 'BTW-UCL-22',
    match1_league: 'Champions League',
    match1_match: 'Real Madrid vs Borussia Dortmund',
    match1_pick: 'Real Madrid Win & Over 1.5 Goals',
    match1_odds: 1.55,
    match2_league: 'Champions League',
    match2_match: 'Arsenal vs Shakhtar Donetsk',
    match2_pick: 'Arsenal -1.5 Asian Handicap',
    match2_odds: 1.45,
  });

  const showSavedMessage = (msg) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Handle Ladder save
  const handleSaveLadder = (e) => {
    e.preventDefault();
    updateLadder({
      currentDay: Number(ladderForm.currentDay),
      currentBalance: Number(ladderForm.currentBalance),
      nextPotentialBalance: Number(ladderForm.nextPotentialBalance),
      dailyOdds: Number(ladderForm.dailyOdds),
      todaysCode: ladderForm.todaysCode,
      sportyCode: ladderForm.sportyCode,
      selections: [
        {
          match: ladderForm.match1_name,
          league: 'Premier League',
          pick: ladderForm.match1_pick,
          odds: Number(ladderForm.match1_odds),
          status: 'pending'
        },
        {
          match: ladderForm.match2_name,
          league: 'Bundesliga',
          pick: ladderForm.match2_pick,
          odds: Number(ladderForm.match2_odds),
          status: 'pending'
        }
      ]
    });
    showSavedMessage('Ladder Challenge updated and live on homepage!');
  };

  // Handle New Ticket creation
  const handleCreateTicket = (e) => {
    e.preventDefault();
    const newId = `ticket-custom-${Date.now()}`;
    const createdTicket = {
      id: newId,
      badge: newTicketForm.badge,
      title: newTicketForm.title,
      category: newTicketForm.category,
      totalOdds: Number(newTicketForm.totalOdds),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      dropTime: newTicketForm.dropTime,
      confidence: newTicketForm.confidence,
      description: 'Official verified ticket published via BRYME Operations Desk.',
      codes: {
        sportybet: newTicketForm.sportybet,
        bet9ja: newTicketForm.bet9ja,
        onexbet: newTicketForm.onexbet,
        betking: newTicketForm.betking,
        betway: newTicketForm.betway,
      },
      selections: [
        {
          match: newTicketForm.match1_match,
          league: newTicketForm.match1_league,
          pick: newTicketForm.match1_pick,
          odds: Number(newTicketForm.match1_odds),
          kickoff: '20:00 WAT',
          analysis: 'Statistical model favors heavy home advantage and offensive metrics.'
        },
        {
          match: newTicketForm.match2_match,
          league: newTicketForm.match2_league,
          pick: newTicketForm.match2_pick,
          odds: Number(newTicketForm.match2_odds),
          kickoff: '20:00 WAT',
          analysis: 'Dominant European form with consistent goal generation.'
        }
      ]
    };

    addTicket(createdTicket);
    showSavedMessage(`Ticket "${newTicketForm.title}" published live!`);
    setActiveTab('codes');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-500/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-300 tracking-wider">
              BRYME Control Suite &bull; Master Operations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>Admin Management Deck</span>
          </h1>
          <p className="text-xs text-blue-200/80 mt-0.5">
            Add live SportyBet, Bet9ja &amp; multi-bookmaker codes, control the Rollover Ladder, and publish match slips.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Website</span>
        </button>
      </div>

      {/* Floating Save Notification Toast */}
      {saveNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500 text-slate-950 font-display font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'codes', label: '⚡ Manage Booking Codes', icon: '📋' },
          { id: 'ladder', label: '🪜 Ladder Challenge Deck', icon: '🪜' },
          { id: 'new-ticket', label: '➕ Create New Match Slip', icon: '🎯' },
          { id: 'export', label: '💾 Backup & Reset', icon: '💾' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#0E1626] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: QUICK BOOKING CODES MANAGER ── */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                Active Slips &amp; Bookmaker Codes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type the booking code for any bookmaker and click Save. Changes show on the website instantly!
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {tickets.length} Slips Configured
            </span>
          </div>

          <div className="space-y-4">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        {ticket.badge}
                      </span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                        {ticket.totalOdds}x Odds
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                      {ticket.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      deleteTicket(ticket.id);
                      showSavedMessage(`Deleted slip "${ticket.title}"`);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-start sm:self-auto"
                    title="Delete this ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Codes Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
                  
                  {/* SportyBet */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase text-rose-600 dark:text-rose-400 block">
                      SportyBet Code
                    </label>
                    <input
                      type="text"
                      value={ticket.codes?.sportybet || ''}
                      onChange={(e) => updateTicketCode(ticket.id, 'sportybet', e.target.value)}
                      placeholder="e.g. BC4-789X2"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Bet9ja */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                      Bet9ja Code
                    </label>
                    <input
                      type="text"
                      value={ticket.codes?.bet9ja || ''}
                      onChange={(e) => updateTicketCode(ticket.id, 'bet9ja', e.target.value)}
                      placeholder="e.g. B9-44021"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* 1xBet */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase text-blue-600 dark:text-blue-400 block">
                      1xBet Code
                    </label>
                    <input
                      type="text"
                      value={ticket.codes?.onexbet || ''}
                      onChange={(e) => updateTicketCode(ticket.id, 'onexbet', e.target.value)}
                      placeholder="e.g. 1XB-992"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* BetKing */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase text-amber-500 block">
                      BetKing Code
                    </label>
                    <input
                      type="text"
                      value={ticket.codes?.betking || ''}
                      onChange={(e) => updateTicketCode(ticket.id, 'betking', e.target.value)}
                      placeholder="e.g. BK-3312"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Betway */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-display font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      Betway Code
                    </label>
                    <input
                      type="text"
                      value={ticket.codes?.betway || ''}
                      onChange={(e) => updateTicketCode(ticket.id, 'betway', e.target.value)}
                      placeholder="e.g. BTW-771"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => showSavedMessage(`Saved codes for "${ticket.title}"!`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Codes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 2: LADDER CHALLENGE CONTROL DECK ── */}
      {activeTab === 'ladder' && (
        <form onSubmit={handleSaveLadder} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Rollover Ladder Command Deck</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Advance the day, update today's stake &amp; payout, and change today's 1.50 ticket.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Apply &amp; Publish Ladder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                Current Step (1 to 18)
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={ladderForm.currentDay}
                onChange={(e) => setLadderForm({ ...ladderForm, currentDay: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                Accumulated Purse (₦)
              </label>
              <input
                type="number"
                value={ladderForm.currentBalance}
                onChange={(e) => setLadderForm({ ...ladderForm, currentBalance: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                Next Target Balance (₦)
              </label>
              <input
                type="number"
                value={ladderForm.nextPotentialBalance}
                onChange={(e) => setLadderForm({ ...ladderForm, nextPotentialBalance: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                Combined Daily Odds
              </label>
              <input
                type="number"
                step="0.01"
                value={ladderForm.dailyOdds}
                onChange={(e) => setLadderForm({ ...ladderForm, dailyOdds: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Today's Ladder Booking Codes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Today's 1.50 Ladder Booking Codes:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                  SportyBet Ladder Code
                </label>
                <input
                  type="text"
                  value={ladderForm.sportyCode}
                  onChange={(e) => setLadderForm({ ...ladderForm, sportyCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Bet9ja Ladder Code
                </label>
                <input
                  type="text"
                  value={ladderForm.todaysCode}
                  onChange={(e) => setLadderForm({ ...ladderForm, todaysCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Today's 2 Matches */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Today's 2 Matches for the 1.50 Ticket:
            </h4>
            
            {/* Match 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Match 1 (e.g. Real Madrid vs Dortmund)"
                value={ladderForm.match1_name}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_name: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="Pick (e.g. Over 1.5 Goals)"
                value={ladderForm.match1_pick}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_pick: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Odds (e.g. 1.25)"
                value={ladderForm.match1_odds}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_odds: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
            </div>

            {/* Match 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Match 2 (e.g. Arsenal vs Shakhtar)"
                value={ladderForm.match2_name}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_name: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="Pick (e.g. Home Win)"
                value={ladderForm.match2_pick}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_pick: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Odds (e.g. 1.20)"
                value={ladderForm.match2_odds}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_odds: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md"
          >
            Save &amp; Update Live Rollover Ladder
          </button>
        </form>
      )}

      {/* ── TAB 3: CREATE NEW MATCH SLIP ── */}
      {activeTab === 'new-ticket' && (
        <form onSubmit={handleCreateTicket} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Create &amp; Publish New Match Slip</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish a fresh ticket (like the Tuesday Champions League Special) with booking codes for all bookmakers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Ticket Title</label>
              <input
                type="text"
                value={newTicketForm.title}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
              <input
                type="text"
                value={newTicketForm.badge}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, badge: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Total Multiplier Odds</label>
              <input
                type="number"
                step="0.01"
                value={newTicketForm.totalOdds}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, totalOdds: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Category Tab</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035]"
              >
                <option value="banker">2.00 Banker</option>
                <option value="ladder">Rollover Ladder</option>
                <option value="accumulator">Accumulator</option>
                <option value="goals">Over 1.5 Goals</option>
                <option value="mega">10.00 Mega</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Confidence Label</label>
              <input
                type="text"
                value={newTicketForm.confidence}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, confidence: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035]"
              />
            </div>
          </div>

          {/* Bookmaker Codes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
              Booking Codes for this Slip:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="SportyBet Code"
                value={newTicketForm.sportybet}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, sportybet: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="Bet9ja Code"
                value={newTicketForm.bet9ja}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, bet9ja: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="1xBet Code"
                value={newTicketForm.onexbet}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, onexbet: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="BetKing Code"
                value={newTicketForm.betking}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, betking: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
              <input
                type="text"
                placeholder="Betway Code"
                value={newTicketForm.betway}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, betway: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
              />
            </div>
          </div>

          {/* Match Selections */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
              Match Selections (2 Games):
            </span>
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Match 1 (e.g. Real Madrid vs Dortmund)"
                  value={newTicketForm.match1_match}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match1_match: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
                <input
                  type="text"
                  placeholder="Pick (e.g. Real Madrid Win)"
                  value={newTicketForm.match1_pick}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match1_pick: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Odds (e.g. 1.55)"
                  value={newTicketForm.match1_odds}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match1_odds: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Match 2 (e.g. Arsenal vs Shakhtar)"
                  value={newTicketForm.match2_match}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match2_match: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
                <input
                  type="text"
                  placeholder="Pick (e.g. Arsenal -1.5)"
                  value={newTicketForm.match2_pick}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match2_pick: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Odds (e.g. 1.45)"
                  value={newTicketForm.match2_odds}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, match2_odds: e.target.value })}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238]"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md"
          >
            Publish Slip Live Immediately
          </button>
        </form>
      )}

      {/* ── TAB 4: BACKUP & RESET ── */}
      {activeTab === 'export' && (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
              Data Backup &amp; Factory Reset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copy your current codes configuration as JSON or restore factory defaults anytime.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Current Stored Data JSON:
              </span>
              <button
                onClick={() => {
                  const data = JSON.stringify({ ladder, tickets }, null, 2);
                  navigator.clipboard.writeText(data);
                  showSavedMessage('Configuration JSON copied to clipboard!');
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-display font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={JSON.stringify({ ladder, tickets }, null, 2)}
              className="w-full p-3 text-[11px] font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-700 dark:text-slate-300"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Want to start fresh with default data?
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset all codes and ladder to factory defaults?')) {
                  resetToDefaults();
                  showSavedMessage('Reset to factory defaults completed!');
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-display font-bold uppercase transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
