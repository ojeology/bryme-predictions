import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { SUPPORTED_BOOKMAKERS } from '../data/catalogueCodes';
import { 
  ShieldCheck, Key, Plus, Trash2, Save, RefreshCw, Check, 
  Copy, ArrowLeft, Trophy, Flame, Layers, Lock, Unlock, Sparkles, 
  CheckCircle2, AlertCircle, LogOut, Edit2, Zap, BookOpen, Clock
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
  'Corners Over 9.5',
  'Custom Market'
];

export default function AdminPage({ onNavigate }) {
  const { 
    ladder, 
    tickets, 
    codeCatalogue,
    updateTicketCode, 
    updateTicket, 
    addTicket, 
    deleteTicket, 
    updateLadder, 
    addCatalogueCode,
    updateCatalogueCode,
    deleteCatalogueCode,
    resetToDefaults 
  } = usePredictions();

  // Authentication Lock state (persisted in sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bryme_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue', 'edit-slips', 'ladder', 'new-ticket', 'export'
  const [saveNotification, setSaveNotification] = useState(null);

  // ── 1. CATALOGUE FORM STATE ──
  const [catalogueForm, setCatalogueForm] = useState({
    bookmaker: 'sportybet',
    code: '',
    title: '',
    odds: '2.10',
    eventsCount: 3,
    category: 'banker',
    categoryName: '🎯 2.00x Banker',
    highlightMatch: '',
    author: 'BRYME Official'
  });

  // ── 2. PREDICTIONS HUB TICKET EDITOR STATE ──
  const [editingTicketId, setEditingTicketId] = useState(tickets[0]?.id || 'ticket-2-odds-banker');
  const activeEditingTicket = tickets.find(t => t.id === editingTicketId) || tickets[0] || {};

  const [ticketEditForm, setTicketEditForm] = useState({
    title: activeEditingTicket.title || '',
    totalOdds: activeEditingTicket.totalOdds || 2.08,
    badge: activeEditingTicket.badge || 'SIGNATURE 2.00 ODDS',
    category: activeEditingTicket.category || 'banker',
    status: activeEditingTicket.status || 'pending',
    sportyCode: activeEditingTicket.codes?.sportybet || '',
    bet9jaCode: activeEditingTicket.codes?.bet9ja || '',
    onexbetCode: activeEditingTicket.codes?.onexbet || '',
    betkingCode: activeEditingTicket.codes?.betking || '',
    highlightMatch: activeEditingTicket.selections?.[0]?.match || ''
  });

  // Sync ticket form when selecting different ticket
  const handleSelectTicketToEdit = (tId) => {
    setEditingTicketId(tId);
    const sel = tickets.find(t => t.id === tId);
    if (sel) {
      setTicketEditForm({
        title: sel.title || '',
        totalOdds: sel.totalOdds || 2.00,
        badge: sel.badge || 'VERIFIED SLIP',
        category: sel.category || 'banker',
        status: sel.status || 'pending',
        sportyCode: sel.codes?.sportybet || sel.bookingCode || '',
        bet9jaCode: sel.codes?.bet9ja || '',
        onexbetCode: sel.codes?.onexbet || '',
        betkingCode: sel.codes?.betking || '',
        highlightMatch: sel.selections?.[0]?.match || ''
      });
    }
  };

  // ── 3. LADDER FORM STATE ──
  const [ladderForm, setLadderForm] = useState({
    currentDay: ladder.currentDay || 4,
    currentBalance: ladder.currentBalance || 3375,
    nextPotentialBalance: ladder.nextPotentialBalance || 5062,
    dailyOdds: ladder.dailyOdds || 1.50,
    todaysCode: ladder.todaysCode || 'B9J-LAD-50-D4',
    sportyCode: ladder.sportyCode || 'BC4-LAD50-D4',
    status: ladder.status || 'active'
  });

  // ── 4. MULTI-GAME SLIP BUILDER STATE ──
  const [newSlipForm, setNewSlipForm] = useState({
    title: '',
    badge: 'BANKER ACCA',
    category: 'accumulator',
    sportyCode: '',
    bet9jaCode: '',
    onexbetCode: '',
    betkingCode: '',
    betwayCode: '',
    description: '',
    confidence: '90% Model Rating',
    selections: [
      { id: 1, match: '', league: 'Premier League', kickoff: 'Today 17:30 WAT', pick: 'Over 1.5 Goals', odds: 1.25 },
      { id: 2, match: '', league: 'Bundesliga', kickoff: 'Today 19:30 WAT', pick: '1X & Over 1.5 Goals', odds: 1.30 }
    ]
  });

  const showToast = (message) => {
    setSaveNotification(message);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // ── AUTHENTICATION HANDLERS ──
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === MASTER_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('bryme_admin_authed', 'true');
      setPinError(false);
      showToast('Admin Deck Unlocked. Welcome, Commander.');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bryme_admin_authed');
    setPinInput('');
  };

  // ── SAVE CATALOGUE CODE ──
  const handleAddCatalogueCode = (e) => {
    e.preventDefault();
    if (!catalogueForm.code.trim() || !catalogueForm.title.trim()) {
      alert('Please provide at least a Booking Code and Title.');
      return;
    }

    const bookieObj = SUPPORTED_BOOKMAKERS.find(b => b.id === catalogueForm.bookmaker);
    addCatalogueCode({
      ...catalogueForm,
      odds: parseFloat(catalogueForm.odds) || 2.00,
      eventsCount: parseInt(catalogueForm.eventsCount, 10) || 3,
      bookmakerName: bookieObj ? bookieObj.name : catalogueForm.bookmaker,
      dropTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT'
    });

    setCatalogueForm({
      bookmaker: 'sportybet',
      code: '',
      title: '',
      odds: '2.10',
      eventsCount: 3,
      category: 'banker',
      categoryName: '🎯 2.00x Banker',
      highlightMatch: '',
      author: 'BRYME Official'
    });

    showToast('Code successfully added to the global Catalogue!');
  };

  // ── SAVE PREDICTIONS HUB TICKET EDITS ──
  const handleSaveTicketEdits = (e) => {
    e.preventDefault();
    updateTicket(editingTicketId, {
      title: ticketEditForm.title,
      totalOdds: parseFloat(ticketEditForm.totalOdds) || 2.00,
      badge: ticketEditForm.badge,
      category: ticketEditForm.category,
      status: ticketEditForm.status,
      codes: {
        sportybet: ticketEditForm.sportyCode,
        bet9ja: ticketEditForm.bet9jaCode,
        onexbet: ticketEditForm.onexbetCode,
        betking: ticketEditForm.betkingCode
      }
    });

    showToast(`Slip "${ticketEditForm.title}" updated successfully!`);
  };

  // ── SAVE LADDER SETTINGS ──
  const handleSaveLadder = (e) => {
    e.preventDefault();
    updateLadder({
      currentDay: parseInt(ladderForm.currentDay, 10),
      currentBalance: parseInt(ladderForm.currentBalance, 10),
      nextPotentialBalance: Math.round(parseInt(ladderForm.currentBalance, 10) * parseFloat(ladderForm.dailyOdds)),
      dailyOdds: parseFloat(ladderForm.dailyOdds),
      todaysCode: ladderForm.todaysCode,
      sportyCode: ladderForm.sportyCode,
      status: ladderForm.status
    });
    showToast('Ladder Challenge state updated across the entire website!');
  };

  // ── ADD ROW TO NEW SLIP ──
  const handleAddSelectionRow = () => {
    setNewSlipForm(prev => ({
      ...prev,
      selections: [
        ...prev.selections,
        {
          id: Date.now(),
          match: '',
          league: 'Premier League',
          kickoff: 'Today 18:00 WAT',
          pick: 'Over 1.5 Goals',
          odds: 1.25
        }
      ]
    }));
  };

  const handleRemoveSelectionRow = (id) => {
    if (newSlipForm.selections.length <= 1) {
      alert('A slip must have at least one match.');
      return;
    }
    setNewSlipForm(prev => ({
      ...prev,
      selections: prev.selections.filter(s => s.id !== id)
    }));
  };

  const handleSelectionChange = (id, field, value) => {
    setNewSlipForm(prev => ({
      ...prev,
      selections: prev.selections.map(s => {
        if (s.id === id) {
          return { ...s, [field]: field === 'odds' ? parseFloat(value) || 1.0 : value };
        }
        return s;
      })
    }));
  };

  // Calculated compound odds
  const calculatedTotalOdds = newSlipForm.selections.reduce((acc, s) => {
    return acc * (parseFloat(s.odds) || 1.0);
  }, 1.0).toFixed(2);

  const handleCreateMultiGameTicket = (e) => {
    e.preventDefault();
    if (!newSlipForm.title.trim()) {
      alert('Please enter a slip title.');
      return;
    }

    const ticketId = `ticket-${Date.now()}`;
    const newTicket = {
      id: ticketId,
      title: newSlipForm.title,
      badge: newSlipForm.badge,
      category: newSlipForm.category,
      riskLevel: parseFloat(calculatedTotalOdds) > 5.0 ? 'High Risk' : 'Medium Risk',
      totalOdds: parseFloat(calculatedTotalOdds),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      dropTime: '02:00 AM WAT',
      confidence: '92% Model Rating',
      description: newSlipForm.description || `Verified ${newSlipForm.selections.length}-game accumulator slip.`,
      codes: {
        sportybet: newSlipForm.sportyCode || 'BC4-' + Math.floor(1000 + Math.random() * 9000),
        bet9ja: newSlipForm.bet9jaCode || 'B9J-' + Math.floor(1000 + Math.random() * 9000),
        onexbet: newSlipForm.onexbetCode,
        betking: newSlipForm.betkingCode,
        betway: newSlipForm.betwayCode
      },
      selections: newSlipForm.selections.map(s => ({
        match: s.match || 'Selected Match',
        league: s.league,
        kickoff: s.kickoff,
        pick: s.pick,
        odds: s.odds
      }))
    };

    addTicket(newTicket);

    // Also auto-add to the code catalogue so punters can pick & bounce
    addCatalogueCode({
      bookmaker: 'sportybet',
      bookmakerName: 'SportyBet',
      code: newSlipForm.sportyCode || 'BC4-' + Math.floor(1000 + Math.random() * 9000),
      title: newSlipForm.title,
      odds: parseFloat(calculatedTotalOdds),
      eventsCount: newSlipForm.selections.length,
      category: newSlipForm.category,
      categoryName: newSlipForm.badge,
      highlightMatch: newSlipForm.selections[0]?.match || '',
      author: 'Admin'
    });

    showToast(`New ${newSlipForm.selections.length}-Game Ticket Published & added to Codes Catalogue!`);
    
    // Reset slip form
    setNewSlipForm({
      title: '',
      badge: 'BANKER ACCA',
      category: 'accumulator',
      sportyCode: '',
      bet9jaCode: '',
      onexbetCode: '',
      betkingCode: '',
      betwayCode: '',
      description: '',
      confidence: '90% Model Rating',
      selections: [
        { id: 1, match: '', league: 'Premier League', kickoff: 'Today 17:30 WAT', pick: 'Over 1.5 Goals', odds: 1.25 },
        { id: 2, match: '', league: 'Bundesliga', kickoff: 'Today 19:30 WAT', pick: '1X & Over 1.5 Goals', odds: 1.30 }
      ]
    });
  };

  // ── PIN AUTHENTICATION GATE SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-6 sm:p-8 shadow-2xl text-center space-y-5">
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E41B13] to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              BRYME Admin Operations Deck
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Restricted Area. Please enter the Owner PIN to manage booking codes, catalogue, and ladder.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-400 mb-1">
                Enter Master Security PIN:
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                placeholder="Enter PIN (e.g. bryme2026)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#E41B13]"
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
              className="w-full py-3 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Deck</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Owner PIN: <code className="bg-slate-100 dark:bg-[#162238] px-1.5 py-0.5 rounded text-[#E41B13] dark:text-rose-400 font-mono">bryme2026</code></span>
            <button
              onClick={() => onNavigate('home')}
              className="text-[#E41B13] dark:text-rose-400 font-bold hover:underline"
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
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#1a2336] to-[#0A0F1D] text-white p-5 rounded-2xl border border-[#E41B13]/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping"></span>
            <span className="text-[10px] font-mono uppercase font-black text-[#00FF66] tracking-wider">
              Unlocked &bull; Owner Master Mode
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#E41B13]" />
            <span>BRYME Operations Suite</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage the Catalogue of Codes, edit Predictions Hub slips, publish multi-game accas, and control the 18-step Rollover.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('convert')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>View Catalogue</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
            title="Lock Deck"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="p-3.5 rounded-xl bg-[#00C250] text-black font-display font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'catalogue', label: '📚 Catalogue of Codes (Vault)', icon: '📚' },
          { id: 'edit-slips', label: '✏️ Edit Predictions Hub Slips', icon: '📝' },
          { id: 'new-ticket', label: '➕ Multi-Game Builder', icon: '⚽' },
          { id: 'ladder', label: '🪜 18-Step Rollover & Savings Plan', icon: '🪜' },
          { id: 'export', label: '💾 Backup & Reset', icon: '💾' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#E41B13] text-white shadow-md ring-2 ring-red-400/40'
                : 'bg-white dark:bg-[#0E1626] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: CATALOGUE OF CODES (VAULT) ── */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          
          {/* Add to Catalogue Form */}
          <form onSubmit={handleAddCatalogueCode} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E41B13]" />
                  <span>Add Code to Global Catalogue</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add codes for any bookmaker (SportyBet, Bet9ja, 1xBet, BetKing, MSport, Betway). Shows in the public catalogue &amp; converter feed!
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#00C250]">
                {codeCatalogue.length} Codes in Vault
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  1. Bookmaker
                </label>
                <select
                  value={catalogueForm.bookmaker}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, bookmaker: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {SUPPORTED_BOOKMAKERS.map(b => (
                    <option key={b.id} value={b.id}>{b.badge}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  2. Booking Code String
                </label>
                <input
                  type="text"
                  required
                  value={catalogueForm.code}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BC4-98421, B9J-772"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  3. Total Odds
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={catalogueForm.odds}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, odds: e.target.value })}
                  placeholder="e.g. 2.15"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  4. Slip Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={catalogueForm.title}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, title: e.target.value })}
                  placeholder="e.g. European 5-Fold Over 1.5 Goals Evening Acca"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  5. Number of Events / Legs
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={catalogueForm.eventsCount}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, eventsCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  6. Highlight Key Match (Optional)
                </label>
                <input
                  type="text"
                  value={catalogueForm.highlightMatch}
                  onChange={(e) => setCatalogueForm({ ...catalogueForm, highlightMatch: e.target.value })}
                  placeholder="e.g. Real Madrid vs Dortmund (Over 2.5)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  7. Category Tag
                </label>
                <select
                  value={catalogueForm.category}
                  onChange={(e) => {
                    const catMap = {
                      ladder: '🪜 Rollover Ladder',
                      banker: '🎯 2.00x Banker',
                      accumulator: '🛡️ 5.00x Acca',
                      goals: '⚽ Over 1.5 Radar',
                      mega: '🚀 10.00x Mega'
                    };
                    setCatalogueForm({
                      ...catalogueForm,
                      category: e.target.value,
                      categoryName: catMap[e.target.value] || 'Verified'
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="ladder">🪜 Rollover Ladder</option>
                  <option value="banker">🎯 2.00x Banker</option>
                  <option value="accumulator">🛡️ 5.00x Acca</option>
                  <option value="goals">⚽ Over 1.5 Radar</option>
                  <option value="mega">🚀 10.00x Mega</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Catalogue Vault</span>
            </button>
          </form>

          {/* List of All Catalogue Codes */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              All {codeCatalogue.length} Booking Codes in Catalogue
            </h3>

            <div className="space-y-2">
              {codeCatalogue.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-display font-black uppercase ${
                      c.bookmaker === 'sportybet'
                        ? 'bg-[#E41B13] text-white'
                        : c.bookmaker === 'bet9ja'
                        ? 'bg-[#00C250] text-black'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {c.bookmakerName || c.bookmaker}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {c.code}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-500">
                          {c.odds}x
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({c.eventsCount} Legs)
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {c.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        showToast(`Copied ${c.code}!`);
                      }}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete code ${c.code} from catalogue?`)) {
                          deleteCatalogueCode(c.id);
                          showToast(`Code ${c.code} deleted.`);
                        }
                      }}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors"
                      title="Delete code"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: EDIT PREDICTIONS HUB SLIPS ── */}
      {activeTab === 'edit-slips' && (
        <div className="space-y-6">
          
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Fast Punter Flow:</strong> Slips in the Predictions Hub are optimized so punters can pick codes and bounce to SportyBet/Bet9ja to edit legs. You can update titles, odds, and codes for any slip below!
            </p>
          </div>

          {/* Ticket Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
              Select Ticket to Edit:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {tickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicketToEdit(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
                    editingTicketId === t.id
                      ? 'bg-[#E41B13] text-white shadow-md'
                      : 'bg-white dark:bg-[#0E1626] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {t.title.slice(0, 24)}...
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Edit Form */}
          <form onSubmit={handleSaveTicketEdits} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#E41B13]" />
                <span>Editing: {ticketEditForm.title}</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">ID: {editingTicketId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Ticket Title
                </label>
                <input
                  type="text"
                  required
                  value={ticketEditForm.title}
                  onChange={(e) => setTicketEditForm({ ...ticketEditForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Total Odds
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ticketEditForm.totalOdds}
                  onChange={(e) => setTicketEditForm({ ...ticketEditForm, totalOdds: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  🔴 SportyBet Code
                </label>
                <input
                  type="text"
                  value={ticketEditForm.sportyCode}
                  onChange={(e) => setTicketEditForm({ ...ticketEditForm, sportyCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. BC4-EUR-2ODDS"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  🟢 Bet9ja Code
                </label>
                <input
                  type="text"
                  value={ticketEditForm.bet9jaCode}
                  onChange={(e) => setTicketEditForm({ ...ticketEditForm, bet9jaCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. B9J-2OD-SAT01"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={ticketEditForm.status}
                  onChange={(e) => setTicketEditForm({ ...ticketEditForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="pending">Active / In Play</option>
                  <option value="won">Won ✅</option>
                  <option value="lost">Lost ❌</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Ticket Changes</span>
            </button>
          </form>

        </div>
      )}

      {/* ── TAB 3: DYNAMIC MULTI-GAME BUILDER ── */}
      {activeTab === 'new-ticket' && (
        <form onSubmit={handleCreateMultiGameTicket} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#E41B13]" />
              <span>Create Multi-Game Accumulator Slip</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add unlimited games with market presets (Over/Under, BTTS, 1X2, Corners). Odds calculate automatically!
            </p>
          </div>

          {/* Header Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Ticket Title
              </label>
              <input
                type="text"
                required
                value={newSlipForm.title}
                onChange={(e) => setNewSlipForm({ ...newSlipForm, title: e.target.value })}
                placeholder="e.g. European 5-Fold Over 1.5 Goals Mega Acca"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newSlipForm.category}
                onChange={(e) => setNewSlipForm({ ...newSlipForm, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="banker">🎯 2.00x Banker</option>
                <option value="ladder">🪜 Rollover Step</option>
                <option value="accumulator">🛡️ 5.00x Acca</option>
                <option value="goals">⚽ Over 1.5 Goals Radar</option>
                <option value="mega">🚀 10.00x Mega Value</option>
              </select>
            </div>
          </div>

          {/* Bookmaker Codes Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 block">
              Multi-Bookmaker Booking Codes (Optional - Or enter at least SportyBet):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-[#E41B13] font-bold block">SportyBet</label>
                <input
                  type="text"
                  value={newSlipForm.sportyCode}
                  onChange={(e) => setNewSlipForm({ ...newSlipForm, sportyCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. BC4-9842"
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#00C250] font-bold block">Bet9ja</label>
                <input
                  type="text"
                  value={newSlipForm.bet9jaCode}
                  onChange={(e) => setNewSlipForm({ ...newSlipForm, bet9jaCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. B9J-7721"
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-blue-500 font-bold block">1xBet</label>
                <input
                  type="text"
                  value={newSlipForm.onexbetCode}
                  onChange={(e) => setNewSlipForm({ ...newSlipForm, onexbetCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. 1XB-551"
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-amber-500 font-bold block">BetKing</label>
                <input
                  type="text"
                  value={newSlipForm.betkingCode}
                  onChange={(e) => setNewSlipForm({ ...newSlipForm, betkingCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. BK-994"
                  className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Match Selections Dynamic Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-slate-700 dark:text-slate-300">
                Match Selections ({newSlipForm.selections.length} Games)
              </span>
              <button
                type="button"
                onClick={handleAddSelectionRow}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display font-black text-xs uppercase flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Game</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {newSlipForm.selections.map((sel, idx) => (
                <div 
                  key={sel.id} 
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                      Game #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectionRow(sel.id)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700"
                    >
                      Remove ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        required
                        value={sel.match}
                        onChange={(e) => handleSelectionChange(sel.id, 'match', e.target.value)}
                        placeholder="e.g. Real Madrid vs Dortmund"
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <select
                        value={sel.pick}
                        onChange={(e) => handleSelectionChange(sel.id, 'pick', e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        {MARKET_PRESETS.map((p, pIdx) => (
                          <option key={pIdx} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        required
                        value={sel.odds}
                        onChange={(e) => handleSelectionChange(sel.id, 'odds', e.target.value)}
                        placeholder="Odds e.g. 1.25"
                        className="w-full p-2 rounded-lg bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slip Summary & Publish */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Combined Accumulator Odds:</span>
              <span className="text-2xl font-mono font-black text-amber-400">{calculatedTotalOdds}x Odds</span>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Publish Slip to Hub &rarr;
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 4: 18-STEP ROLLOVER & SAVINGS PLAN ── */}
      {activeTab === 'ladder' && (
        <form onSubmit={handleSaveLadder} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>18-Step Rollover &amp; Capital Savings Safety Plan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control the active day, bankroll pot, and today's 1-tap SportyBet &amp; Bet9ja codes for the 18-step climb.
            </p>
          </div>

          {/* Capital Savings Plan Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <strong className="font-bold uppercase tracking-wide block">
              🛡️ The Capital Savings Safety Plan:
            </strong>
            <p>
              The ladder consists of <strong>18 basic steps</strong>. The savings mechanism at <strong>Day 6 (bank ₦5,695 cash)</strong> and <strong>Day 12 (bank ₦32,434 cash)</strong> is engineered so punters withdraw their initial stake plus pure profit into their bank account, ensuring they never lose it all and play the rest on house money!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Current Active Day (1 to 18)
              </label>
              <input
                type="number"
                min="1"
                max="18"
                value={ladderForm.currentDay}
                onChange={(e) => setLadderForm({ ...ladderForm, currentDay: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Current Bankroll Purse (₦ NGN)
              </label>
              <input
                type="number"
                step="1"
                value={ladderForm.currentBalance}
                onChange={(e) => setLadderForm({ ...ladderForm, currentBalance: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                🔴 Today's SportyBet Ladder Code
              </label>
              <input
                type="text"
                value={ladderForm.sportyCode}
                onChange={(e) => setLadderForm({ ...ladderForm, sportyCode: e.target.value.toUpperCase() })}
                placeholder="e.g. BC4-LAD50-D4"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                🟢 Today's Bet9ja Ladder Code
              </label>
              <input
                type="text"
                value={ladderForm.todaysCode}
                onChange={(e) => setLadderForm({ ...ladderForm, todaysCode: e.target.value.toUpperCase() })}
                placeholder="e.g. B9J-LAD-50-D4"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Ladder Settings</span>
          </button>
        </form>
      )}

      {/* ── TAB 5: BACKUP & RESET ── */}
      {activeTab === 'export' && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
            System Data &amp; Reset
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export all tickets, ladder state, and codes catalogue as JSON, or reset back to system defaults.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                const data = { ladder, tickets, codeCatalogue };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bryme-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                showToast('JSON backup downloaded!');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Export JSON Backup
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all tickets, catalogue, and ladder back to factory defaults?')) {
                  resetToDefaults();
                  showToast('Reset to original sample data.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
