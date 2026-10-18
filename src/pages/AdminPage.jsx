import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { SUPPORTED_BOOKMAKERS } from '../data/catalogueCodes';
import { 
  ShieldCheck, Key, Plus, Trash2, Save, RefreshCw, Check, 
  Copy, ArrowLeft, Trophy, Flame, Layers, Lock, Unlock, Sparkles, 
  CheckCircle2, AlertCircle, LogOut, Edit2, Zap, BookOpen, Clock, Users, Megaphone
} from 'lucide-react';

const MASTER_PIN = 'bryme2026';

const MARKET_PRESETS = [
  'Over 1.5 Goals High-Frequency Radar',
  'Over 2.5 Total Goals',
  'Under 2.5 Defensive Structure',
  'Under 3.5 Goals Shield',
  'Both Teams to Score (GG)',
  'Both Teams to Score (NG)',
  '1X2 Full-Time Home Win',
  'Double Chance (1X - Home Win or Draw)',
  'Double Chance (X2 - Away Win or Draw)',
  'Double Chance (12 - Anybody Win)',
  '1X & Over 1.5 Goals Combo',
  'Home Win & Over 2.5 Goals',
  'Draw No Bet (DNB)',
  'To Win Either Half',
  'First Half Over 0.5 Goals',
  'Total Corners Over 8.5',
  'Total Corners Over 9.5',
  'Total Cards Over 3.5'
];

export default function AdminPage({ onNavigate }) {
  const { 
    ladder, 
    tickets, 
    codeCatalogue,
    punters,
    announcements,
    updateTicketCode, 
    updateTicket, 
    addTicket, 
    deleteTicket, 
    updateLadder, 
    addCatalogueCode,
    updateCatalogueCode,
    deleteCatalogueCode,
    addPunter,
    updatePunter,
    deletePunter,
    addPunterCode,
    deletePunterCode,
    updateAnnouncements,
    resetToDefaults 
  } = usePredictions();

  // Authentication Lock state (persisted in sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bryme_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab: 'code-hub', 'punters-mgr', 'slips-editor', 'ladder-plan', 'announcements', 'backup'
  const [activeTab, setActiveTab] = useState('code-hub');
  const [saveNotification, setSaveNotification] = useState(null);

  const showToast = (message) => {
    setSaveNotification(message);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // ── 1. CODE HUB FORM STATE ──
  const [hubCodeForm, setHubCodeForm] = useState({
    bookmaker: 'sportybet',
    code: '',
    marketType: 'Over 1.5 Goals High-Frequency Radar',
    gamesCount: 4,
    totalOdds: '2.40',
    title: '',
    author: 'BRYME Official'
  });

  // ── 2. NEW PUNTER FORM STATE ──
  const [newPunterForm, setNewPunterForm] = useState({
    displayName: '',
    handle: '',
    region: 'Nigeria',
    countryCode: 'NG',
    specialty: 'European 2.00x Banker Doubles'
  });

  // ── 3. ASSIGN CODE TO PUNTER FORM STATE ──
  const [punterCodeForm, setPunterCodeForm] = useState({
    punterId: punters[0]?.id || 'punter-femi',
    bookmaker: 'sportybet',
    code: '',
    marketType: 'Over 1.5 Goals Radar',
    gamesCount: 3,
    totalOdds: '2.15'
  });

  // ── 4. PREDICTIONS HUB TICKET EDITOR STATE ──
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
    betkingCode: activeEditingTicket.codes?.betking || ''
  });

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
        betkingCode: sel.codes?.betking || ''
      });
    }
  };

  // ── 5. LADDER FORM STATE ──
  const [ladderForm, setLadderForm] = useState({
    currentDay: ladder.currentDay || 4,
    currentBalance: ladder.currentBalance || 3375,
    dailyOdds: ladder.dailyOdds || 1.50,
    todaysCode: ladder.todaysCode || 'B9J-LAD-50-D4',
    sportyCode: ladder.sportyCode || 'BC4-LAD50-D4',
    status: ladder.status || 'active'
  });

  // ── 6. ANNOUNCEMENTS FORM STATE ──
  const [announcementsForm, setAnnouncementsForm] = useState({
    tickerText: announcements.tickerText || '★ TUESDAY UCL SPECIAL: Real Madrid vs Dortmund • 2.45x Banker Live',
    dropTimeWAT: announcements.dropTimeWAT || '02:00 AM WAT',
    showUclBanner: announcements.showUclBanner ?? true
  });

  // ── AUTHENTICATION ──
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === MASTER_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('bryme_admin_authed', 'true');
      setPinError(false);
      showToast('Admin Master Deck Unlocked.');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bryme_admin_authed');
    setPinInput('');
  };

  // ── HANDLERS ──
  const handleAddHubCode = (e) => {
    e.preventDefault();
    if (!hubCodeForm.code.trim()) {
      alert('Please enter a booking code string.');
      return;
    }

    const bookieObj = SUPPORTED_BOOKMAKERS.find(b => b.id === hubCodeForm.bookmaker);
    addCatalogueCode({
      bookmaker: hubCodeForm.bookmaker,
      bookmakerName: bookieObj ? bookieObj.name : hubCodeForm.bookmaker,
      code: hubCodeForm.code.toUpperCase(),
      categoryName: hubCodeForm.marketType,
      title: hubCodeForm.title.trim() || `${hubCodeForm.marketType} (${hubCodeForm.gamesCount} Games)`,
      odds: parseFloat(hubCodeForm.totalOdds) || 2.00,
      eventsCount: parseInt(hubCodeForm.gamesCount, 10) || 3,
      author: hubCodeForm.author || 'Admin Desk'
    });

    setHubCodeForm({
      bookmaker: 'sportybet',
      code: '',
      marketType: 'Over 1.5 Goals High-Frequency Radar',
      gamesCount: 4,
      totalOdds: '2.40',
      title: '',
      author: 'BRYME Official'
    });

    showToast('Code successfully published to SportyBet Code Hub & Catalogue!');
  };

  const handleCreatePunter = (e) => {
    e.preventDefault();
    if (!newPunterForm.displayName.trim() || !newPunterForm.handle.trim()) {
      alert('Please provide punter name and handle.');
      return;
    }

    addPunter({
      ...newPunterForm,
      countryCode: newPunterForm.region === 'Nigeria' ? 'NG' : newPunterForm.region === 'Kenya' ? 'KE' : 'ZA'
    });

    setNewPunterForm({
      displayName: '',
      handle: '',
      region: 'Nigeria',
      countryCode: 'NG',
      specialty: 'European 2.00x Banker Doubles'
    });

    showToast(`Punter "${newPunterForm.displayName}" added to directory!`);
  };

  const handleAssignPunterCode = (e) => {
    e.preventDefault();
    if (!punterCodeForm.code.trim()) {
      alert('Please enter booking code.');
      return;
    }

    addPunterCode(punterCodeForm.punterId, {
      bookmaker: punterCodeForm.bookmaker,
      code: punterCodeForm.code.toUpperCase(),
      marketType: punterCodeForm.marketType,
      gamesCount: parseInt(punterCodeForm.gamesCount, 10) || 3,
      totalOdds: parseFloat(punterCodeForm.totalOdds) || 2.00
    });

    setPunterCodeForm({
      ...punterCodeForm,
      code: ''
    });

    showToast('Daily booking code assigned to punter & mirrored to Code Hub!');
  };

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

    showToast(`Ticket "${ticketEditForm.title}" updated live!`);
  };

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
    showToast('18-Step Ladder & Savings Plan updated live!');
  };

  const handleSaveAnnouncements = (e) => {
    e.preventDefault();
    updateAnnouncements({
      tickerText: announcementsForm.tickerText,
      dropTimeWAT: announcementsForm.dropTimeWAT,
      showUclBanner: announcementsForm.showUclBanner
    });
    showToast('Site Announcements & Top Marquee updated!');
  };

  // ── PIN AUTHENTICATION GATE SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E41B13] text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              BRYME Master Control Deck
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Restricted to site owner. Enter PIN to manage codes, punters, and slips.
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
              <span>Unlock Master Deck</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Owner PIN: <code className="bg-slate-100 dark:bg-[#162238] px-1.5 py-0.5 rounded text-[#E41B13] font-mono">bryme2026</code></span>
            <button onClick={() => onNavigate('home')} className="text-[#E41B13] font-bold hover:underline">
              Return Home &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED MASTER DECK ──
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#1a2336] to-[#0A0F1D] text-white p-5 rounded-2xl border border-[#E41B13]/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping"></span>
            <span className="text-[10px] font-mono uppercase font-black text-[#00FF66] tracking-wider">
              Unlocked &bull; Owner Full Access Mode
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#E41B13]" />
            <span>BRYME Master Control Deck</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Full site ownership: Add SportyBet codes with event numbers, manage punters &amp; punters daily games, and control all sections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
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
          { id: 'code-hub', label: '🔴 SportyBet Code Hub', icon: '⚡' },
          { id: 'punters-mgr', label: '👑 Punters & Punters Games', icon: '👥' },
          { id: 'slips-editor', label: '📝 Edit Predictions Slips', icon: '📋' },
          { id: 'ladder-plan', label: '🪜 18-Step Rollover & Savings', icon: '🪜' },
          { id: 'announcements', label: '📢 Ticker & Announcements', icon: '📢' },
          { id: 'backup', label: '💾 Backup & Reset', icon: '💾' },
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

      {/* ── TAB 1: SPORTYBET CODE HUB & EVENT NUMBERS ── */}
      {activeTab === 'code-hub' && (
        <div className="space-y-6">
          
          <form onSubmit={handleAddHubCode} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E41B13]" />
                  <span>Publish Code to SportyBet Code Hub</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Per your specification: only the code, market type, and number of games are shown so punters pick and bounce.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#00C250]">
                {codeCatalogue.length} Codes Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  1. Bookmaker
                </label>
                <select
                  value={hubCodeForm.bookmaker}
                  onChange={(e) => setHubCodeForm({ ...hubCodeForm, bookmaker: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {SUPPORTED_BOOKMAKERS.map(b => (
                    <option key={b.id} value={b.id}>{b.badge}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  2. Booking Code
                </label>
                <input
                  type="text"
                  required
                  value={hubCodeForm.code}
                  onChange={(e) => setHubCodeForm({ ...hubCodeForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BC4-98421, B9J-7721"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black tracking-wider uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  3. Number of Games (Events Count)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={hubCodeForm.gamesCount}
                  onChange={(e) => setHubCodeForm({ ...hubCodeForm, gamesCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  4. Market Type
                </label>
                <select
                  value={hubCodeForm.marketType}
                  onChange={(e) => setHubCodeForm({ ...hubCodeForm, marketType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {MARKET_PRESETS.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  5. Total Odds
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={hubCodeForm.totalOdds}
                  onChange={(e) => setHubCodeForm({ ...hubCodeForm, totalOdds: e.target.value })}
                  placeholder="e.g. 2.45"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Publish to Code Hub</span>
            </button>
          </form>

          {/* List of Codes in Hub */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              Active Codes in Hub ({codeCatalogue.length})
            </h3>

            <div className="space-y-2">
              {codeCatalogue.map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-display font-black uppercase ${
                      c.bookmaker === 'sportybet' ? 'bg-[#E41B13] text-white' : c.bookmaker === 'bet9ja' ? 'bg-[#00C250] text-black font-black' : 'bg-blue-600 text-white'
                    }`}>
                      {c.bookmakerName || c.bookmaker}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {c.code}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-500">
                          {c.odds}x Odds
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          &bull; {c.eventsCount} Games
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {c.categoryName || c.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        showToast(`Copied ${c.code}`);
                      }}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-[#162238] text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete code ${c.code}?`)) {
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

      {/* ── TAB 2: PUNTERS & PUNTERS DAILY GAMES MANAGER ── */}
      {activeTab === 'punters-mgr' && (
        <div className="space-y-6">
          
          {/* Section A: Add New Punter */}
          <form onSubmit={handleCreatePunter} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users className="w-4 h-4 text-[#E41B13]" />
              <span>1. Add New Tracked African Punter</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Punter Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newPunterForm.displayName}
                  onChange={(e) => setNewPunterForm({ ...newPunterForm, displayName: e.target.value })}
                  placeholder="e.g. Chief Punter Femi"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Social Handle / Channel
                </label>
                <input
                  type="text"
                  required
                  value={newPunterForm.handle}
                  onChange={(e) => setNewPunterForm({ ...newPunterForm, handle: e.target.value })}
                  placeholder="e.g. @femipicks_ng"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Country / Region
                </label>
                <select
                  value={newPunterForm.region}
                  onChange={(e) => setNewPunterForm({ ...newPunterForm, region: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Nigeria">🇳🇬 Nigeria</option>
                  <option value="Kenya">🇰🇪 Kenya</option>
                  <option value="Ghana">🇬🇭 Ghana</option>
                  <option value="South Africa">🇿🇦 South Africa</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Specialty Market
                </label>
                <input
                  type="text"
                  value={newPunterForm.specialty}
                  onChange={(e) => setNewPunterForm({ ...newPunterForm, specialty: e.target.value })}
                  placeholder="e.g. Over 1.5 Goals Radar"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] text-white font-display font-black text-xs uppercase tracking-wider transition-all"
            >
              + Save Punter to Directory
            </button>
          </form>

          {/* Section B: Assign Daily Booking Code to a Punter */}
          <form onSubmit={handleAssignPunterCode} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-[#E41B13]" />
              <span>2. Add Daily Booking Code for a Punter</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Select Punter
                </label>
                <select
                  value={punterCodeForm.punterId}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, punterId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {punters.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName} ({p.region})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bookmaker
                </label>
                <select
                  value={punterCodeForm.bookmaker}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, bookmaker: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="sportybet">🔴 SportyBet</option>
                  <option value="bet9ja">🟢 Bet9ja</option>
                  <option value="1xbet">🔵 1xBet</option>
                  <option value="betking">👑 BetKing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Booking Code
                </label>
                <input
                  type="text"
                  required
                  value={punterCodeForm.code}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BC4-FEMI-2OD"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Market Type
                </label>
                <input
                  type="text"
                  required
                  value={punterCodeForm.marketType}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, marketType: e.target.value })}
                  placeholder="e.g. Over 1.5 Goals Radar"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Number of Games (Legs)
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  required
                  value={punterCodeForm.gamesCount}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, gamesCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
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
                  value={punterCodeForm.totalOdds}
                  onChange={(e) => setPunterCodeForm({ ...punterCodeForm, totalOdds: e.target.value })}
                  placeholder="e.g. 2.15"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Code to Punter Profile</span>
            </button>
          </form>

          {/* Section C: List of All Punters and Active Codes */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              All Punters &amp; Daily Slips ({punters.length})
            </h3>

            <div className="space-y-3">
              {punters.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                        {p.displayName}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {p.handle} &bull; {p.region}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete punter ${p.displayName}?`)) {
                          deletePunter(p.id);
                          showToast(`Punter ${p.displayName} removed.`);
                        }
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                    >
                      Delete Punter ✕
                    </button>
                  </div>

                  {/* Punter's Daily Slips */}
                  <div className="space-y-1.5">
                    {p.dailyCodes && p.dailyCodes.length > 0 ? (
                      p.dailyCodes.map(codeItem => (
                        <div
                          key={codeItem.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#162238] font-mono font-bold text-[10px] uppercase">
                              {codeItem.bookmaker}
                            </span>
                            <span className="font-mono font-black text-slate-900 dark:text-white">
                              {codeItem.code}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              &bull; {codeItem.marketType} ({codeItem.gamesCount} Games @ {codeItem.totalOdds}x)
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              deletePunterCode(p.id, codeItem.id);
                              showToast('Code deleted from punter.');
                            }}
                            className="text-[10px] text-rose-500 font-bold hover:underline"
                          >
                            Remove Code ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No codes currently attached to this punter.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 3: EDIT PREDICTIONS HUB SLIPS ── */}
      {activeTab === 'slips-editor' && (
        <div className="space-y-6">
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
              <span>Save Slip Updates</span>
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 4: 18-STEP ROLLOVER & CAPITAL SAVINGS PLAN ── */}
      {activeTab === 'ladder-plan' && (
        <form onSubmit={handleSaveLadder} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>18-Step Rollover &amp; Capital Savings Safety Plan</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The ladder is 18 basic steps. The savings mechanism at Day 6 &amp; Day 12 secures pure cash so you never lose it all.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#E41B13] text-white px-2.5 py-1 rounded-lg">
              Day {ladderForm.currentDay} / 18
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Active Step (1 to 18)
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
                Current Pot Balance (₦ NGN)
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

      {/* ── TAB 5: TICKER & ANNOUNCEMENTS ── */}
      {activeTab === 'announcements' && (
        <form onSubmit={handleSaveAnnouncements} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Megaphone className="w-4 h-4 text-[#E41B13]" />
            <span>Top Marquee Ticker &amp; Midnight Drop Control</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Marquee Ticker Text (Shown live at the top of every page)
              </label>
              <input
                type="text"
                value={announcementsForm.tickerText}
                onChange={(e) => setAnnouncementsForm({ ...announcementsForm, tickerText: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Midnight Drop Time
                </label>
                <input
                  type="text"
                  value={announcementsForm.dropTimeWAT}
                  onChange={(e) => setAnnouncementsForm({ ...announcementsForm, dropTimeWAT: e.target.value })}
                  placeholder="e.g. 02:00 AM WAT"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  UCL Feature Banner
                </label>
                <select
                  value={announcementsForm.showUclBanner ? 'yes' : 'no'}
                  onChange={(e) => setAnnouncementsForm({ ...announcementsForm, showUclBanner: e.target.value === 'yes' })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="yes">Visible (Active)</option>
                  <option value="no">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Announcements</span>
          </button>
        </form>
      )}

      {/* ── TAB 6: BACKUP & FACTORY RESET ── */}
      {activeTab === 'backup' && (
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
            Full System Backup &amp; Reset
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export a complete JSON snapshot of all your custom punters, booking codes, catalogue, and ladder settings.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                const data = { ladder, tickets, codeCatalogue, punters, announcements };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bryme-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                showToast('Full backup downloaded!');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Export JSON Backup
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset everything back to factory defaults?')) {
                  resetToDefaults();
                  showToast('Reset to original sample data.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs uppercase rounded-xl transition-colors"
            >
              Reset All to Factory Defaults
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
