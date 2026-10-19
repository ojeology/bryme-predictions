import React, { useState } from 'react';
import { usePredictions, DEFAULT_WHALE_SLIP, DEFAULT_AD_SETTINGS } from '../context/PredictionsContext';
import { SUPPORTED_BOOKMAKERS } from '../data/catalogueCodes';
import { MARKETS as DEFAULT_MARKETS } from '../data/markets';
import { 
  ShieldCheck, Key, Plus, Trash2, Save, RefreshCw, Check, 
  Copy, ArrowLeft, Trophy, Flame, Layers, Lock, Unlock, Sparkles, 
  CheckCircle2, AlertCircle, LogOut, Edit2, Zap, BookOpen, Clock, Users, Megaphone,
  Search, ExternalLink
} from 'lucide-react';

const getStoredMasterPin = () => {
  return localStorage.getItem('bryme_master_pin') || 'bryme2026';
};

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
    whaleSlip,
    updateWhaleSlip,
    adSettings,
    updateAdSettings,
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
    markets,
    addMarket,
    updateMarket,
    deleteMarket,
    marketCodes,
    addMarketCode,
    updateMarketCode,
    deleteMarketCode,
    resetToDefaults 
  } = usePredictions();

  // Authentication Lock state (persisted in sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bryme_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('whale-mgr');
  const [saveNotification, setSaveNotification] = useState(null);

  const [whaleForm, setWhaleForm] = useState(whaleSlip || DEFAULT_WHALE_SLIP);
  const [adForm, setAdForm] = useState(adSettings || DEFAULT_AD_SETTINGS);

  const showToast = (message) => {
    setSaveNotification(message);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // ── MARKETS FORM STATE ──
  const [marketForm, setMarketForm] = useState({
    name: '',
    shortName: '',
    category: 'goals',
    badge: 'High Hit Rate (78%)',
    riskLevel: 'Low Risk',
    typicalOddsRange: '1.25 - 1.45',
    averageHitRate: '78%',
    description: '',
    tacticalTip: ''
  });
  const [editingMarketId, setEditingMarketId] = useState(null);
  const [marketSearch, setMarketSearch] = useState('');

  const handleMarketSubmit = (e) => {
    e.preventDefault();
    if (!marketForm.name.trim()) return;

    if (editingMarketId) {
      updateMarket(editingMarketId, marketForm);
      showToast('Market successfully updated in 35+ Catalogue!');
      setEditingMarketId(null);
    } else {
      const slug = marketForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      addMarket({
        ...marketForm,
        slug,
        id: slug
      });
      showToast('New market published to 35+ Catalogue!');
    }

    setMarketForm({
      name: '',
      shortName: '',
      category: 'goals',
      badge: 'High Hit Rate (78%)',
      riskLevel: 'Low Risk',
      typicalOddsRange: '1.25 - 1.45',
      averageHitRate: '78%',
      description: '',
      tacticalTip: ''
    });
  };

  const handleStartEditMarket = (market) => {
    setEditingMarketId(market.id || market.slug);
    setMarketForm({
      name: market.name,
      shortName: market.shortName || market.name,
      category: market.category || 'goals',
      badge: market.badge || 'Popular Market',
      riskLevel: market.riskLevel || 'Medium Risk',
      typicalOddsRange: market.typicalOddsRange || '1.30 - 1.80',
      averageHitRate: market.averageHitRate || '70%',
      description: market.description || '',
      tacticalTip: market.tacticalTip || ''
    });
    window.scrollTo({ top: 400, behavior: 'smooth' });
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
    punterId: punters[0]?.id || 'punter-mrbanks',
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
    if (pinInput.trim() === getStoredMasterPin()) {
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

  const [showChangePin, setShowChangePin] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');

  const handleChangePin = (e) => {
    e.preventDefault();
    if (!newMasterPin.trim()) return;
    localStorage.setItem('bryme_master_pin', newMasterPin.trim());
    showToast('Master Security PIN successfully changed!');
    setNewMasterPin('');
    setShowChangePin(false);
  };

  // ── MARKET BOOKING CODES FORM STATE ──
  const [selectedMarketForCode, setSelectedMarketForCode] = useState('over-15-goals');
  const [marketCodeFilter, setMarketCodeFilter] = useState('all');
  const [marketCodeForm, setMarketCodeForm] = useState({
    code: '',
    odds: '47.00',
    bookmaker: 'sportybet',
    title: '',
    eventsCount: 8
  });

  const handleAddMarketBookingCode = (e) => {
    e.preventDefault();
    if (!marketCodeForm.code.trim()) return;

    const bNameMap = {
      sportybet: 'SportyBet',
      bet9ja: 'Bet9ja',
      '1xbet': '1xBet',
      msport: 'MSport',
      betking: 'BetKing'
    };

    const targetMarket = (markets || []).find(m => m.id === selectedMarketForCode || m.slug === selectedMarketForCode);
    const newEntry = {
      id: `mcode-${Date.now()}`,
      marketId: selectedMarketForCode,
      code: marketCodeForm.code.trim().toUpperCase(),
      odds: parseFloat(marketCodeForm.odds) || 2.00,
      bookmaker: marketCodeForm.bookmaker,
      bookmakerName: bNameMap[marketCodeForm.bookmaker] || marketCodeForm.bookmaker,
      title: marketCodeForm.title.trim() || `${targetMarket?.name || 'Market'} Value Slip`,
      eventsCount: parseInt(marketCodeForm.eventsCount, 10) || 4,
      status: 'active',
      dropTime: 'Today'
    };

    addMarketCode(newEntry);
    showToast(`Code ${newEntry.code} (${newEntry.odds}x) added to ${targetMarket?.name || 'market'}!`);
    setMarketCodeForm({
      code: '',
      odds: '2.50',
      bookmaker: 'sportybet',
      title: '',
      eventsCount: 4
    });
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
                placeholder="••••••••"
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
            <span className="flex items-center gap-1 text-[11px] font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Encrypted Owner Access</span>
            </span>
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
            onClick={() => setShowChangePin(!showChangePin)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Change PIN</span>
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

      {/* Change PIN Panel Modal */}
      {showChangePin && (
        <form onSubmit={handleChangePin} className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/60 bg-[#0E1626] text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Update Master Security PIN</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowChangePin(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Set a new private PIN for the owner deck. This updates your browser's encrypted lock immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="password"
              required
              value={newMasterPin}
              onChange={(e) => setNewMasterPin(e.target.value)}
              placeholder="Enter new private PIN..."
              className="flex-1 p-2.5 rounded-xl bg-[#162238] border border-slate-700 text-white font-mono text-sm tracking-wider"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Save New PIN
            </button>
          </div>
        </form>
      )}

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
          { id: 'whale-mgr', label: '🐋 Whale 2-Odds', icon: '🐋' },
          { id: 'ads-mgr', label: '💰 Ads & Monetization', icon: '💰' },
          { id: 'code-hub', label: '📋 BRYME Code Hub', icon: '⚡' },
          { id: 'markets-mgr', label: '📂 35+ Markets Manager', icon: '📂' },
          { id: 'punters-mgr', label: '👑 Punters & Punters Games', icon: '👥' },
          { id: 'slips-editor', label: '📝 Edit Predictions Slips', icon: '📋' },
          { id: 'ladder-plan', label: '🪜 18-Step Rollover & Savings', icon: '🪜' },
          { id: 'announcements', label: '📢 Ticker & Announcements', icon: '📢' },
          { id: 'backup', label: '💾 Cloudflare Sync & Backup', icon: '💾' },
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

      {/* ── TAB 0A: WHALE 2-ODDS MANAGER ── */}
      {activeTab === 'whale-mgr' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          updateWhaleSlip(whaleForm);
          showToast('🐋 Whale 2-Odds Slip updated successfully!');
        }} className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-2xl">🐋</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Daily Whale 2-Odds Syndicate Manager
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure the primary gambler fishhook: verified high-roller stake proof, 2.0+ odds double, and syndicate intel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Slip Title
              </label>
              <input
                type="text"
                value={whaleForm.title}
                onChange={(e) => setWhaleForm({ ...whaleForm, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Tracked Staker / Syndicate Name
              </label>
              <input
                type="text"
                value={whaleForm.staker}
                onChange={(e) => setWhaleForm({ ...whaleForm, staker: e.target.value })}
                placeholder="e.g. Lagos VIP Syndicate #04"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Confirmed Stake Amount
              </label>
              <input
                type="text"
                value={whaleForm.stakeAmount}
                onChange={(e) => setWhaleForm({ ...whaleForm, stakeAmount: e.target.value })}
                placeholder="e.g. ₦500,000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-amber-500 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Total Odds
              </label>
              <input
                type="number"
                step="0.01"
                value={whaleForm.totalOdds}
                onChange={(e) => setWhaleForm({ ...whaleForm, totalOdds: parseFloat(e.target.value) || 2.0 })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Potential Return / Payout
              </label>
              <input
                type="text"
                value={whaleForm.potentialReturn}
                onChange={(e) => setWhaleForm({ ...whaleForm, potentialReturn: e.target.value })}
                placeholder="e.g. ₦1,090,000"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-emerald-400 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={whaleForm.status}
                onChange={(e) => setWhaleForm({ ...whaleForm, status: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs"
              >
                <option value="live">🟢 Live &amp; In Play</option>
                <option value="won">🏆 Won (Green)</option>
                <option value="lost">🔴 Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                SportyBet Booking Code
              </label>
              <input
                type="text"
                value={whaleForm.sportyCode}
                onChange={(e) => setWhaleForm({ ...whaleForm, sportyCode: e.target.value })}
                placeholder="e.g. BC4-WHALE"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Bet9ja Booking Code
              </label>
              <input
                type="text"
                value={whaleForm.bet9jaCode}
                onChange={(e) => setWhaleForm({ ...whaleForm, bet9jaCode: e.target.value })}
                placeholder="e.g. B9J-WHALE"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Kickoff Time
              </label>
              <input
                type="text"
                value={whaleForm.kickoffTime}
                onChange={(e) => setWhaleForm({ ...whaleForm, kickoffTime: e.target.value })}
                placeholder="e.g. 20:00 WAT Today"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Whale Market Intel (Rationale)
            </label>
            <textarea
              rows={2}
              value={whaleForm.intel}
              onChange={(e) => setWhaleForm({ ...whaleForm, intel: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-xs leading-relaxed"
            />
          </div>

          {/* Matches on the slip */}
          <div className="space-y-3 pt-2">
            <h4 className="font-display font-black text-xs uppercase text-slate-700 dark:text-slate-300">
              Matches on the Whale Slip (2 Legs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(whaleForm.matches || []).map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-500">
                    Leg {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m.match}
                    onChange={(e) => {
                      const updated = [...whaleForm.matches];
                      updated[idx].match = e.target.value;
                      setWhaleForm({ ...whaleForm, matches: updated });
                    }}
                    placeholder="Match: e.g. Real Madrid vs Sevilla"
                    className="w-full p-2 rounded-lg bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={m.pick}
                      onChange={(e) => {
                        const updated = [...whaleForm.matches];
                        updated[idx].pick = e.target.value;
                        setWhaleForm({ ...whaleForm, matches: updated });
                      }}
                      placeholder="Pick: e.g. Over 1.5 Goals"
                      className="w-full p-2 rounded-lg bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={m.odds}
                      onChange={(e) => {
                        const updated = [...whaleForm.matches];
                        updated[idx].odds = parseFloat(e.target.value) || 1.4;
                        setWhaleForm({ ...whaleForm, matches: updated });
                      }}
                      placeholder="Odds: e.g. 1.45"
                      className="w-full p-2 rounded-lg bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Whale 2-Odds Slip</span>
          </button>
        </form>
      )}

      {/* ── TAB 0B: AD NETWORK & MONETIZATION ── */}
      {activeTab === 'ads-mgr' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          updateAdSettings(adForm);
          showToast('💰 Ad network settings saved and broadcasted to Edge!');
        }} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Ad Networks (Monetag &amp; Adsterra) &amp; Affiliate Monetization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste your Monetag MultiTag script, Adsterra banner tags, or custom affiliate links to start earning immediately.
              </p>
            </div>
          </div>

          {/* Quick Setup Guide Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/20 via-[#10192E] to-[#0A0F1D] border border-blue-500/30 text-xs space-y-2">
            <h4 className="font-display font-black text-white flex items-center gap-1.5">
              <span>⚡ Quick Monetization Setup</span>
            </h4>
            <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px] font-sans">
              <li><strong>Monetag:</strong> Register on <a href="https://monetag.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">Monetag.com</a> &rarr; Add your domain (<code>predictions.thebryme.com</code>) &rarr; Get <strong>MultiTag</strong> &rarr; Paste in the Global Header Script field below.</li>
              <li><strong>Adsterra:</strong> Register on <a href="https://adsterra.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">Adsterra.com</a> &rarr; Create 728x90 or Social Bar ad &rarr; Paste script below.</li>
              <li><strong>Bookmaker Affiliates:</strong> Paste your referral links for SportyBet, Bet9ja, or 1xBet to earn 20-35% revenue share on punters.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Global Header Script (Monetag MultiTag / Adsterra Popunder)
              </label>
              <textarea
                rows={3}
                value={adForm.monetagScript}
                onChange={(e) => setAdForm({ ...adForm, monetagScript: e.target.value })}
                placeholder="<script src='https://alwingulla.com/...' async></script>"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400">Injected into site &lt;head&gt; across all pages.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Top Leaderboard Banner Code (Adsterra 728x90 / Native)
                </label>
                <textarea
                  rows={3}
                  value={adForm.adsterraTopBanner}
                  onChange={(e) => setAdForm({ ...adForm, adsterraTopBanner: e.target.value })}
                  placeholder="Paste Adsterra banner HTML / iframe code..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  In-Feed / Content Banner Code (Adsterra 300x250 / Native)
                </label>
                <textarea
                  rows={3}
                  value={adForm.adsterraInFeedBanner}
                  onChange={(e) => setAdForm({ ...adForm, adsterraInFeedBanner: e.target.value })}
                  placeholder="Paste Adsterra in-feed banner code..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  SportyBet Affiliate URL
                </label>
                <input
                  type="text"
                  value={adForm.sportyAffiliateUrl || ''}
                  onChange={(e) => setAdForm({ ...adForm, sportyAffiliateUrl: e.target.value })}
                  placeholder="https://www.sportybet.com/?ref=YOUR_CODE"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bet9ja Affiliate URL
                </label>
                <input
                  type="text"
                  value={adForm.bet9jaAffiliateUrl || ''}
                  onChange={(e) => setAdForm({ ...adForm, bet9jaAffiliateUrl: e.target.value })}
                  placeholder="https://register.bet9ja.com/?promocode=YOUR_CODE"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  1xBet Affiliate URL
                </label>
                <input
                  type="text"
                  value={adForm.oneXBetAffiliateUrl || ''}
                  onChange={(e) => setAdForm({ ...adForm, oneXBetAffiliateUrl: e.target.value })}
                  placeholder="https://1xbet.ng/?bf=YOUR_CODE"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  MSport Affiliate URL
                </label>
                <input
                  type="text"
                  value={adForm.msportAffiliateUrl || ''}
                  onChange={(e) => setAdForm({ ...adForm, msportAffiliateUrl: e.target.value })}
                  placeholder="https://www.msport.com/?ref=YOUR_CODE"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  BetKing Affiliate URL
                </label>
                <input
                  type="text"
                  value={adForm.betkingAffiliateUrl || ''}
                  onChange={(e) => setAdForm({ ...adForm, betkingAffiliateUrl: e.target.value })}
                  placeholder="https://www.betking.com/?aff=YOUR_CODE"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Ad Settings &amp; Broadcast</span>
          </button>
        </form>
      )}

      {/* ── TAB 1: BRYME CODE HUB & EVENT NUMBERS ── */}
      {activeTab === 'code-hub' && (
        <div className="space-y-6">
          
          <form onSubmit={handleAddHubCode} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E41B13]" />
                  <span>Publish Code to BRYME Code Hub</span>
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

      {/* ── TAB: 35+ MARKETS ENCYCLOPAEDIA MANAGER ── */}
      {activeTab === 'markets-mgr' && (
        <div className="space-y-6">
          
          {/* Section 1: ATTACH LIVE BOOKING CODES TO MARKETS */}
          <form onSubmit={handleAddMarketBookingCode} className="p-5 sm:p-6 rounded-2xl border-2 border-[#E41B13]/40 bg-white dark:bg-[#0E1626] shadow-md space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
                  <span>1. Add Live Booking Slip to Football Market</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Attach active codes (e.g. YEYEY, 47 Odds, SportyBet) directly to Over 1.5 Goals, Double Chance, or any market.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs border border-emerald-500/30 self-start sm:self-auto">
                Total Attached: {marketCodes?.length || 0} Slips
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Target Football Market
                </label>
                <select
                  value={selectedMarketForCode}
                  onChange={(e) => setSelectedMarketForCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {(markets || []).map(m => (
                    <option key={m.id || m.slug} value={m.id || m.slug}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Bookmaker
                </label>
                <select
                  value={marketCodeForm.bookmaker}
                  onChange={(e) => setMarketCodeForm({ ...marketCodeForm, bookmaker: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="sportybet">🔴 SportyBet</option>
                  <option value="1xbet">🔵 1xBet</option>
                  <option value="msport">🟢 MSport</option>
                  <option value="bet9ja">🟡 Bet9ja</option>
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
                  value={marketCodeForm.code}
                  onChange={(e) => setMarketCodeForm({ ...marketCodeForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. YEYEY"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black uppercase text-base tracking-wider"
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
                  value={marketCodeForm.odds}
                  onChange={(e) => setMarketCodeForm({ ...marketCodeForm, odds: e.target.value })}
                  placeholder="e.g. 47.00"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black"
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
                  value={marketCodeForm.eventsCount}
                  onChange={(e) => setMarketCodeForm({ ...marketCodeForm, eventsCount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Slip Title / Notes
                </label>
                <input
                  type="text"
                  value={marketCodeForm.title}
                  onChange={(e) => setMarketCodeForm({ ...marketCodeForm, title: e.target.value })}
                  placeholder="e.g. Weekend High-Odds Over 1.5 Goals Wave"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-mono text-slate-500">
                Punters can click &amp; copy this code on the Market Detail page.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Attach Code to Market</span>
              </button>
            </div>
          </form>

          {/* Section 2: LIST OF ATTACHED MARKET CODES */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  2. Active Market Slips Catalogue ({marketCodes?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage or remove codes attached to specific football markets.
                </p>
              </div>

              {/* Filter by market */}
              <select
                value={marketCodeFilter}
                onChange={(e) => setMarketCodeFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="all">View All Markets ({marketCodes?.length || 0})</option>
                {(markets || []).map(m => (
                  <option key={m.id || m.slug} value={m.id || m.slug}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(marketCodes || [])
                .filter(c => marketCodeFilter === 'all' || c.marketId === marketCodeFilter)
                .map(codeItem => {
                  const mObj = (markets || []).find(m => m.id === codeItem.marketId || m.slug === codeItem.marketId);
                  return (
                    <div
                      key={codeItem.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121B2F] flex flex-col justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-slate-200 dark:bg-[#162238] text-slate-900 dark:text-white">
                            {codeItem.bookmaker}
                          </span>
                          <span className="font-mono font-bold text-amber-500">
                            {codeItem.odds}x Odds
                          </span>
                        </div>

                        <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                          {codeItem.code}
                        </div>

                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {mObj?.name || codeItem.marketId}
                        </div>

                        <div className="text-[10px] text-slate-400">
                          {codeItem.title || 'Market Slip'} &bull; {codeItem.eventsCount || 4} Games
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(codeItem.code);
                            showToast(`Copied ${codeItem.code}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#162238] font-bold text-slate-700 dark:text-slate-300 hover:text-white"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove code ${codeItem.code}?`)) {
                              deleteMarketCode(codeItem.id);
                              showToast(`Code ${codeItem.code} removed.`);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 font-bold"
                        >
                          Delete ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section 3: Add / Edit Market Form */}
          <form onSubmit={handleMarketSubmit} className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#E41B13]" />
                  <span>{editingMarketId ? `Edit Market: ${marketForm.name}` : '3. Add or Edit Football Market Profile'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Full control over hit rates, tactical tips, risk profiles, and typical odds across the 35+ betting markets database.
                </p>
              </div>

              {editingMarketId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMarketId(null);
                    setMarketForm({
                      name: '',
                      shortName: '',
                      category: 'goals',
                      badge: 'High Hit Rate (78%)',
                      riskLevel: 'Low Risk',
                      typicalOddsRange: '1.25 - 1.45',
                      averageHitRate: '78%',
                      description: '',
                      tacticalTip: ''
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 text-xs font-bold font-mono"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Market Full Name
                </label>
                <input
                  type="text"
                  required
                  value={marketForm.name}
                  onChange={(e) => setMarketForm({ ...marketForm, name: e.target.value })}
                  placeholder="e.g. 1st Half Over 0.5 Goals"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={marketForm.category}
                  onChange={(e) => setMarketForm({ ...marketForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="goals">⚽ Goals &amp; Totals</option>
                  <option value="outcomes">🛡️ 1X2 &amp; Double Chance</option>
                  <option value="btts">🎯 Both Teams to Score (GG/NG)</option>
                  <option value="combos">⚡ Combos &amp; Multi-Lines</option>
                  <option value="halves">⏱️ Half-Time &amp; Intervals</option>
                  <option value="specials">🚩 Corners &amp; Cards</option>
                  <option value="handicaps">⚖️ Handicaps &amp; Spreads</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Average Hit Rate %
                </label>
                <input
                  type="text"
                  required
                  value={marketForm.averageHitRate}
                  onChange={(e) => setMarketForm({ ...marketForm, averageHitRate: e.target.value })}
                  placeholder="e.g. 78.5%"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Typical Odds Range
                </label>
                <input
                  type="text"
                  required
                  value={marketForm.typicalOddsRange}
                  onChange={(e) => setMarketForm({ ...marketForm, typicalOddsRange: e.target.value })}
                  placeholder="e.g. 1.25 - 1.45"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Risk Level
                </label>
                <select
                  value={marketForm.riskLevel}
                  onChange={(e) => setMarketForm({ ...marketForm, riskLevel: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Lowest Risk">Lowest Risk</option>
                  <option value="Low Risk">Low Risk</option>
                  <option value="Low-Medium Risk">Low-Medium Risk</option>
                  <option value="Medium Risk">Medium Risk</option>
                  <option value="Medium-High Risk">Medium-High Risk</option>
                  <option value="High Risk">High Risk</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Badge / Tagline
                </label>
                <input
                  type="text"
                  value={marketForm.badge}
                  onChange={(e) => setMarketForm({ ...marketForm, badge: e.target.value })}
                  placeholder="e.g. High Hit Rate (79%), Core Rollover Bedrock"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Tactical Tip / Statistical Angle
                </label>
                <textarea
                  rows={2}
                  value={marketForm.tacticalTip}
                  onChange={(e) => setMarketForm({ ...marketForm, tacticalTip: e.target.value })}
                  placeholder="e.g. Best leveraged on teams averaging over 2.8 match goals with high-pressing transitions."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Description &amp; Settlement Rules
                </label>
                <textarea
                  rows={2}
                  value={marketForm.description}
                  onChange={(e) => setMarketForm({ ...marketForm, description: e.target.value })}
                  placeholder="Explain exactly how the bet is settled as WIN or LOSS in 90 minutes."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>{editingMarketId ? 'Save Market Changes' : 'Publish Market to 35+ Catalogue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Section B: All Catalogued Markets with Search, Edit & Delete */}
          <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  All Catalogued Football Markets ({markets?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click 'Edit' to update hit rates, odds ranges, or tips. Changes apply platform-wide immediately.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  placeholder="Search markets..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {(Array.isArray(markets) && markets.length > 0 ? markets : DEFAULT_MARKETS)
                .filter(m => {
                  if (!marketSearch.trim()) return true;
                  const q = marketSearch.toLowerCase();
                  return m.name?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q);
                })
                .map((m, idx) => {
                  const attachedCount = (marketCodes || []).filter(c => c.marketId === m.id || c.marketId === m.slug).length;
                  return (
                    <div
                      key={m.id || m.slug || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121B2F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                            {m.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                            {m.category}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black border ${
                            attachedCount > 0 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-700/40'
                          }`}>
                            {attachedCount} {attachedCount === 1 ? 'Slip' : 'Slips'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30">
                            {m.averageHitRate || '70%'} Hit
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Odds: {m.typicalOddsRange || '1.30 - 1.80'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                          {m.description || m.tacticalTip}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMarketForCode(m.id || m.slug);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                            showToast(`Selected "${m.name}". Enter code and odds in form above.`);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <span>➕ Add Code</span>
                        </button>

                        <button
                          onClick={() => handleStartEditMarket(m)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onNavigate(`market/${m.id || m.slug}`)}
                          className="p-1.5 rounded-xl bg-slate-200 dark:bg-[#1A2438] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          title="View Public Market Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete market "${m.name}"?`)) {
                              deleteMarket(m.id || m.slug);
                              showToast(`Market "${m.name}" deleted.`);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                          title="Delete Market"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updatePunter(p.id, { pinned: !p.pinned });
                          showToast(`${p.displayName} ${!p.pinned ? '📌 Pinned to top' : 'Unpinned'}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                          p.pinned 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>📌 {p.pinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete punter ${p.displayName}?`)) {
                            deletePunter(p.id);
                            showToast(`Punter ${p.displayName} removed.`);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Delete ✕
                      </button>
                    </div>
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

      {/* ── TAB 6: BACKUP, CLOUDFLARE SYNC & RESET ── */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          {/* Cloudflare Edge Cloud Sync Module */}
          <div className="p-5 sm:p-6 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/20 via-[#0E1626] to-[#0A0F1D] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Cloudflare Edge Cloud Sync &amp; Database
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Broadcast your ladder, punters, and codes across all 330+ Cloudflare edge nodes globally so all users on <code>predictions.thebryme.com</code> see live updates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                onClick={async () => {
                  try {
                    const data = { ladder, tickets, codeCatalogue, punters, announcements, markets, whaleSlip, adSettings };
                    const res = await fetch('/api/state', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Admin-Pin': 'bryme2026'
                      },
                      body: JSON.stringify(data)
                    });
                    const json = await res.json();
                    if (json.success) {
                      showToast('⚡ Successfully synced to Cloudflare Edge!');
                    } else {
                      showToast('Sync response: ' + (json.error || json.warning || 'Ready'));
                    }
                  } catch (e) {
                    showToast('Sync request completed locally.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>⚡ Sync All to Cloudflare Edge</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/health');
                    const json = await res.json();
                    const bindingsMsg = json.bindingsFound?.length ? ` [Bindings: ${json.bindingsFound.join(', ')}]` : '';
                    showToast(`API: ${json.status.toUpperCase()} (KV: ${json.kvConnected ? 'Connected' : 'Pending'})${bindingsMsg}`);
                  } catch (e) {
                    showToast('Local Edge ready. Connect in Cloudflare Dashboard.');
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                Test Edge Connection
              </button>
            </div>
          </div>

          {/* Backup & Factory Reset Card */}
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
                const data = { ladder, tickets, codeCatalogue, punters, announcements, markets, whaleSlip, adSettings };
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
        </div>
      )}

    </div>
  );
}
