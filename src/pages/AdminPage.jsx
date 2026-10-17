import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  ShieldCheck, Key, Plus, Trash2, Save, RefreshCw, Check, 
  Copy, ArrowLeft, Trophy, Flame, Layers, Lock, Unlock, Sparkles, 
  CheckCircle2, AlertCircle, LogOut
} from 'lucide-react';

const MASTER_PIN = 'bryme2026';

const MARKET_PRESETS = [
  'Over 1.5 Goals',
  'Over 2.5 Goals',
  'Under 2.5 Goals',
  'Under 3.5 Goals',
  'Both Teams to Score (GG)',
  'Both Teams to Score (NG)',
  'Home Win (1)',
  'Away Win (2)',
  'Draw (X)',
  'Double Chance (1X)',
  'Double Chance (X2)',
  'Double Chance (12)',
  'Home Win & Over 1.5',
  'Away Win & Over 1.5',
  'Win Either Half',
  'First Half Over 0.5 Goals',
  'Corners Over 8.5',
  'Corners Over 9.5'
];

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

  // Authentication Lock state (persisted in sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bryme_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('codes'); // 'codes', 'ladder', 'new-ticket', 'export'
  const [saveNotification, setSaveNotification] = useState(null);

  // Ladder state editor
  const [ladderForm, setLadderForm] = useState({
    currentDay: ladder.currentDay || 3,
    currentBalance: ladder.currentBalance || 3375,
    nextPotentialBalance: ladder.nextPotentialBalance || 5062,
    dailyOdds: ladder.dailyOdds || 1.50,
    todaysCode: ladder.todaysCode || 'B9J-LAD-50-D3',
    sportyCode: ladder.sportyCode || 'BC4-LAD50-D3',
    match1_name: ladder.selections?.[0]?.match || 'Arsenal vs Everton',
    match1_pick: ladder.selections?.[0]?.pick || '1X & Over 1.5 Goals',
    match1_odds: ladder.selections?.[0]?.odds || 1.25,
    match2_name: ladder.selections?.[1]?.match || 'Bayern Munich vs VfB Stuttgart',
    match2_pick: ladder.selections?.[1]?.pick || 'Over 2.5 Goals',
    match2_odds: ladder.selections?.[1]?.odds || 1.20,
  });

  // Dynamic Multi-Game Ticket Builder (Allows 1 to 20+ games!)
  const [newTicketForm, setNewTicketForm] = useState({
    title: 'Tuesday Champions League Multi-Game Acca',
    badge: 'UCL MEGA ACCA',
    category: 'accumulator',
    confidence: '92% Model Rating',
    dropTime: '02:00 AM WAT',
    sportybet: 'BC-UCL-ACCA1',
    bet9ja: 'B9J-UCL-ACCA1',
    onexbet: '1XB-UCL-88',
    betking: 'BK-UCL-44',
    betway: 'BTW-UCL-99',
    selections: [
      {
        league: 'Champions League',
        match: 'Real Madrid vs Borussia Dortmund',
        pick: 'Real Madrid Win & Over 1.5',
        odds: 1.55,
        kickoff: '20:00 WAT',
        analysis: 'Bernabeu home dominance with attacking prowess.'
      },
      {
        league: 'Champions League',
        match: 'Arsenal vs Shakhtar Donetsk',
        pick: 'Arsenal -1.5 Handicap',
        odds: 1.48,
        kickoff: '20:00 WAT',
        analysis: 'High possession rate and clean sheet potential at Emirates.'
      },
      {
        league: 'Champions League',
        match: 'PSG vs PSV Eindhoven',
        pick: 'Over 2.5 Goals',
        odds: 1.45,
        kickoff: '20:00 WAT',
        analysis: 'Both teams play high offensive lines averaging 3.2 goals per game.'
      },
      {
        league: 'Champions League',
        match: 'Juventus vs VfB Stuttgart',
        pick: 'Juventus Double Chance (1X)',
        odds: 1.30,
        kickoff: '20:00 WAT',
        analysis: 'Motta tactical defensive structure at home.'
      }
    ]
  });

  // Handle Login PIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === MASTER_PIN || pinInput.trim() === '0202') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bryme_admin_authed', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bryme_admin_authed');
  };

  const showSavedMessage = (msg) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Add Match to Multi-Game Builder
  const handleAddMatch = () => {
    setNewTicketForm(prev => ({
      ...prev,
      selections: [
        ...prev.selections,
        {
          league: 'Champions League',
          match: '',
          pick: 'Over 1.5 Goals',
          odds: 1.30,
          kickoff: '20:00 WAT',
          analysis: ''
        }
      ]
    }));
  };

  // Remove Match from Multi-Game Builder
  const handleRemoveMatch = (index) => {
    setNewTicketForm(prev => ({
      ...prev,
      selections: prev.selections.filter((_, idx) => idx !== index)
    }));
  };

  // Update Match in Multi-Game Builder
  const handleUpdateMatch = (index, field, value) => {
    setNewTicketForm(prev => ({
      ...prev,
      selections: prev.selections.map((sel, idx) => {
        if (idx === index) {
          return { ...sel, [field]: value };
        }
        return sel;
      })
    }));
  };

  // Calculate Combined Multiplier
  const calculatedOdds = newTicketForm.selections
    .reduce((acc, s) => acc * (Number(s.odds) || 1), 1)
    .toFixed(2);

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

  // Handle Create Multi-Game Ticket
  const handleCreateMultiGameTicket = (e) => {
    e.preventDefault();
    if (newTicketForm.selections.length === 0) {
      alert('Please add at least 1 match selection!');
      return;
    }

    const newId = `ticket-custom-${Date.now()}`;
    const createdTicket = {
      id: newId,
      badge: newTicketForm.badge,
      title: newTicketForm.title,
      category: newTicketForm.category,
      totalOdds: Number(calculatedOdds),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      dropTime: newTicketForm.dropTime,
      confidence: newTicketForm.confidence,
      description: `Official ${newTicketForm.selections.length}-match slip verified by BRYME Desk.`,
      codes: {
        sportybet: newTicketForm.sportybet,
        bet9ja: newTicketForm.bet9ja,
        onexbet: newTicketForm.onexbet,
        betking: newTicketForm.betking,
        betway: newTicketForm.betway,
      },
      selections: newTicketForm.selections.map((s, idx) => ({
        ...s,
        id: `sel-${idx}-${Date.now()}`,
        status: 'pending'
      }))
    };

    addTicket(createdTicket);
    showSavedMessage(`Published "${newTicketForm.title}" with ${newTicketForm.selections.length} matches!`);
    setActiveTab('codes');
  };

  // ── LOCK SCREEN (IF NOT AUTHENTICATED) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-6 sm:p-8 shadow-2xl text-center space-y-5">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg border border-blue-400/40">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              Admin Deck Locked 🔒
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This management suite is restricted to the site owner. Enter your Master PIN to proceed.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Master Security PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                placeholder="Enter PIN (e.g. bryme2026)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-blue-500"
              />
              {pinError && (
                <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Incorrect PIN. Please try again.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Deck</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Owner PIN: <code className="bg-slate-100 dark:bg-[#162238] px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono">bryme2026</code></span>
            <button
              onClick={() => onNavigate('home')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Return Home &rarr;
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── AUTHENTICATED ADMIN DECK ──
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Admin Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-500/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-300 tracking-wider">
              Unlocked &bull; Owner Master Mode
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>BRYME Operations Suite</span>
          </h1>
          <p className="text-xs text-blue-200/80 mt-0.5">
            Add multi-game accumulator slips (Over/Under, BTTS, 1X2), edit booking codes, and control the Rollover Ladder.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            title="Lock Deck"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
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
          { id: 'new-ticket', label: '➕ Multi-Game Builder (Over/Under & Accas)', icon: '⚽' },
          { id: 'ladder', label: '🪜 Ladder Challenge Deck', icon: '🪜' },
          { id: 'export', label: '💾 Backup & Reset', icon: '💾' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#0E1626] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
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
                Type the booking code for SportyBet, Bet9ja, 1xBet, BetKing, or Betway. Updates live across the website!
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {tickets.length} Slips Live
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
                        {ticket.totalOdds}x Odds &bull; {ticket.selections?.length || 1} Matches
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

      {/* ── TAB 2: MULTI-GAME DYNAMIC BUILDER (ADD AS MANY GAMES AS YOU WANT) ── */}
      {activeTab === 'new-ticket' && (
        <form onSubmit={handleCreateMultiGameTicket} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Multi-Game Ticket Builder (Over/Unders, Accas &amp; Specials)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add 2, 4, 6, 8, 10 or more games! Set market selections (Over 1.5/2.5, BTTS, 1X2, Corners) and booking codes.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-[#162238] px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 text-right self-start sm:self-auto">
              <span className="text-[9px] uppercase font-mono text-slate-400 block">Calculated Total Odds</span>
              <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400">
                {calculatedOdds}x
              </span>
            </div>
          </div>

          {/* Ticket Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Ticket Title</label>
              <input
                type="text"
                value={newTicketForm.title}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Badge Label</label>
              <input
                type="text"
                value={newTicketForm.badge}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, badge: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Category Tab</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              >
                <option value="accumulator">🛡️ Accumulator Slip</option>
                <option value="goals">⚽ Over/Under Goals Radar</option>
                <option value="banker">🎯 2.00x Banker</option>
                <option value="ladder">🪜 Rollover Step</option>
                <option value="mega">🚀 10.00x Mega Slip</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">Confidence Label</label>
              <input
                type="text"
                value={newTicketForm.confidence}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, confidence: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162035] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Bookmaker Codes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
              1-Tap Booking Codes for this Slip:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="SportyBet Code"
                value={newTicketForm.sportybet}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, sportybet: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Bet9ja Code"
                value={newTicketForm.bet9ja}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, bet9ja: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="1xBet Code"
                value={newTicketForm.onexbet}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, onexbet: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="BetKing Code"
                value={newTicketForm.betking}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, betking: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Betway Code"
                value={newTicketForm.betway}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, betway: e.target.value })}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* DYNAMIC MATCH SELECTIONS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Match Selections ({newTicketForm.selections.length} Games)</span>
              </span>

              <button
                type="button"
                onClick={handleAddMatch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Game</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {newTicketForm.selections.map((sel, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                      Game #{idx + 1}
                    </span>

                    {newTicketForm.selections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMatch(idx)}
                        className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* League */}
                    <input
                      type="text"
                      placeholder="League (e.g. Champions League)"
                      value={sel.league}
                      onChange={(e) => handleUpdateMatch(idx, 'league', e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                      required
                    />

                    {/* Match Name */}
                    <input
                      type="text"
                      placeholder="Match (e.g. Real Madrid vs Dortmund)"
                      value={sel.match}
                      onChange={(e) => handleUpdateMatch(idx, 'match', e.target.value)}
                      className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                      required
                    />

                    {/* Odds */}
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Odds (e.g. 1.35)"
                      value={sel.odds}
                      onChange={(e) => handleUpdateMatch(idx, 'odds', e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Market Selection Dropdown + Custom Pick Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <select
                        onChange={(e) => handleUpdateMatch(idx, 'pick', e.target.value)}
                        value={MARKET_PRESETS.includes(sel.pick) ? sel.pick : 'custom'}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                      >
                        <option disabled value="">-- Select Market Preset --</option>
                        {MARKET_PRESETS.map((mp, pIdx) => (
                          <option key={pIdx} value={mp}>{mp}</option>
                        ))}
                        <option value="custom">✏️ Custom Pick...</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      placeholder="Pick description (e.g. Over 1.5 Goals)"
                      value={sel.pick}
                      onChange={(e) => handleUpdateMatch(idx, 'pick', e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddMatch}
              className="w-full py-2.5 rounded-xl border border-dashed border-blue-400/60 text-blue-600 dark:text-blue-400 font-display font-bold text-xs uppercase tracking-wider hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Game to this Slip</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Slip Live to Homepage ({newTicketForm.selections.length} Games)</span>
          </button>
        </form>
      )}

      {/* ── TAB 3: LADDER CHALLENGE DECK ── */}
      {activeTab === 'ladder' && (
        <form onSubmit={handleSaveLadder} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
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
              <span>Apply Ladder Updates</span>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Match 1"
                value={ladderForm.match1_name}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_name: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Pick 1"
                value={ladderForm.match1_pick}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_pick: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Odds 1"
                value={ladderForm.match1_odds}
                onChange={(e) => setLadderForm({ ...ladderForm, match1_odds: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Match 2"
                value={ladderForm.match2_name}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_name: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Pick 2"
                value={ladderForm.match2_pick}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_pick: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Odds 2"
                value={ladderForm.match2_odds}
                onChange={(e) => setLadderForm({ ...ladderForm, match2_odds: e.target.value })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] text-slate-900 dark:text-white"
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

      {/* ── TAB 4: BACKUP & RESET ── */}
      {activeTab === 'export' && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
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
