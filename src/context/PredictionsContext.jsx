import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACTIVE_CHALLENGE as DEFAULT_LADDER } from '../data/ladder';
import { DAILY_BOOKING_TICKETS as DEFAULT_TICKETS } from '../data/bookingTickets';
import { INITIAL_CODE_CATALOGUE } from '../data/catalogueCodes';
import { INITIAL_PUNTERS } from '../data/punters';
import { MARKETS as DEFAULT_MARKETS } from '../data/markets';

const PredictionsContext = createContext(null);

const STORAGE_KEY_LADDER = 'bryme_active_ladder_v3';
const STORAGE_KEY_TICKETS = 'bryme_booking_tickets_v3';
const STORAGE_KEY_CATALOGUE = 'bryme_code_catalogue_v2';
const STORAGE_KEY_PUNTERS = 'bryme_punters_v2';
const STORAGE_KEY_ANNOUNCEMENTS = 'bryme_announcements_v1';
const STORAGE_KEY_MARKETS = 'bryme_markets_v2';
const STORAGE_KEY_WHALE = 'bryme_whale_slip_v1';
const STORAGE_KEY_ADS = 'bryme_ad_settings_v1';

export const DEFAULT_WHALE_SLIP = {
  id: 'whale-2-odds-today',
  title: "Today's Whale 2-Odds Syndicate Lock",
  staker: 'Lagos VIP Syndicate #04',
  stakeAmount: '₦500,000',
  totalOdds: 2.18,
  potentialReturn: '₦1,090,000',
  confidence: '94%',
  status: 'live', // live, won, lost
  sportyCode: 'BC4-WHALE',
  bet9jaCode: 'B9J-WHALE',
  kickoffTime: '20:00 WAT Today',
  punterCount: 4210,
  volumeStaked: '₦18,450,000',
  intel: 'Syndicate placed ₦500k after sharp line movements in Madrid & Munich. Over 1.5 Team Goals line dropped 18% on early European exchange liquidity.',
  matches: [
    {
      id: 'm1',
      match: 'Real Madrid vs Sevilla',
      league: 'Spanish La Liga',
      kickoff: '20:00 WAT',
      pick: 'Real Madrid Over 1.5 Team Goals',
      odds: 1.45,
      analysis: 'Madrid averages 2.6 goals at the Bernabéu; scored 2+ in 9 of last 10 home fixtures.'
    },
    {
      id: 'm2',
      match: 'Bayern Munich vs RB Leipzig',
      league: 'German Bundesliga',
      kickoff: '17:30 WAT',
      pick: 'Over 2.5 Total Goals',
      odds: 1.50,
      analysis: 'Both attacks rank top 2 in expected goals (xG); last 6 head-to-heads averaged 4.1 goals.'
    }
  ]
};

export const DEFAULT_AD_SETTINGS = {
  monetagScript: '',
  adsterraTopBanner: '',
  adsterraInFeedBanner: '',
  adsterraPopunder: '',
  sportyAffiliateUrl: 'https://www.sportybet.com/',
  bet9jaAffiliateUrl: 'https://register.bet9ja.com/',
  oneXBetAffiliateUrl: 'https://1xbet.ng/'
};

export function PredictionsProvider({ children }) {
  // 1. Ladder State
  const [ladder, setLadderState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LADDER);
      return saved ? JSON.parse(saved) : DEFAULT_LADDER;
    } catch (e) {
      return DEFAULT_LADDER;
    }
  });

  // 2. Booking Tickets State
  const [tickets, setTicketsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      return saved ? JSON.parse(saved) : DEFAULT_TICKETS;
    } catch (e) {
      return DEFAULT_TICKETS;
    }
  });

  // 3. Code Catalogue / Code Hub State
  const [codeCatalogue, setCodeCatalogueState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOGUE);
      return saved ? JSON.parse(saved) : INITIAL_CODE_CATALOGUE;
    } catch (e) {
      return INITIAL_CODE_CATALOGUE;
    }
  });

  // 4. Punters & Daily Codes State
  const [punters, setPuntersState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUNTERS);
      return saved ? JSON.parse(saved) : INITIAL_PUNTERS;
    } catch (e) {
      return INITIAL_PUNTERS;
    }
  });

  // 5. Site Announcements State
  const [announcements, setAnnouncementsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      return saved ? JSON.parse(saved) : {
        tickerText: '★ TUESDAY UCL SPECIAL: Real Madrid vs Dortmund • 2.45x Banker Live',
        dropTimeWAT: '02:00 AM WAT',
        showUclBanner: true
      };
    } catch (e) {
      return {
        tickerText: '★ TUESDAY UCL SPECIAL: Real Madrid vs Dortmund • 2.45x Banker Live',
        dropTimeWAT: '02:00 AM WAT',
        showUclBanner: true
      };
    }
  });

  // 6. Markets Encyclopaedia State (Fully Editable via Admin)
  const [markets, setMarketsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MARKETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_MARKETS;
    } catch (e) {
      return DEFAULT_MARKETS;
    }
  });

  // 7. Whale 2-Odds Slip State
  const [whaleSlip, setWhaleSlipState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WHALE);
      return saved ? JSON.parse(saved) : DEFAULT_WHALE_SLIP;
    } catch (e) {
      return DEFAULT_WHALE_SLIP;
    }
  });

  // 8. Ad Network & Monetization Settings
  const [adSettings, setAdSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADS);
      return saved ? JSON.parse(saved) : DEFAULT_AD_SETTINGS;
    } catch (e) {
      return DEFAULT_AD_SETTINGS;
    }
  });

  // Global Copy Success Modal State (High CTR & Viral Share)
  const [copyModal, setCopyModal] = useState({
    isOpen: false,
    code: '',
    bookmaker: '',
    title: '',
    odds: ''
  });

  const triggerCopyModal = (code, bookmaker = 'SportyBet', title = 'Banker Slip', odds = '') => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopyModal({
        isOpen: true,
        code,
        bookmaker,
        title,
        odds
      });
    }
  };

  const closeCopyModal = () => {
    setCopyModal(prev => ({ ...prev, isOpen: false }));
  };

  const [isHydrated, setIsHydrated] = useState(false);

  // Initial fetch from Cloudflare Edge API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchEdgeState = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            const remote = json.data;
            if (remote.ladder) setLadderState(remote.ladder);
            if (remote.tickets) setTicketsState(remote.tickets);
            if (remote.codeCatalogue) setCodeCatalogueState(remote.codeCatalogue);
            if (remote.punters) setPuntersState(remote.punters);
            if (remote.announcements) setAnnouncementsState(remote.announcements);
            if (remote.markets) setMarketsState(remote.markets);
            if (remote.whaleSlip) setWhaleSlipState(remote.whaleSlip);
            if (remote.adSettings) setAdSettingsState(remote.adSettings);
          }
        }
      } catch (err) {
        // Fallback to localStorage or default seeds
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };

    fetchEdgeState();
    return () => { isMounted = false; };
  }, []);

  // Save changes to Cloudflare Edge
  const syncToCloudflare = async (fullPayload) => {
    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': 'bryme2026'
        },
        body: JSON.stringify(fullPayload)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Debounced auto-sync to Cloudflare Edge KV whenever state is updated
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      syncToCloudflare({
        ladder,
        tickets,
        codeCatalogue,
        punters,
        announcements,
        markets,
        whaleSlip,
        adSettings
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [ladder, tickets, codeCatalogue, punters, announcements, markets, whaleSlip, adSettings, isHydrated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LADDER, JSON.stringify(ladder));
    } catch (e) {}
  }, [ladder]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    } catch (e) {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATALOGUE, JSON.stringify(codeCatalogue));
    } catch (e) {}
  }, [codeCatalogue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PUNTERS, JSON.stringify(punters));
    } catch (e) {}
  }, [punters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch (e) {}
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(markets));
    } catch (e) {}
  }, [markets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WHALE, JSON.stringify(whaleSlip));
    } catch (e) {}
  }, [whaleSlip]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADS, JSON.stringify(adSettings));
    } catch (e) {}
  }, [adSettings]);

  // ── WHALE SLIP ACTIONS ──
  const updateWhaleSlip = (newSlip) => {
    setWhaleSlipState(prev => ({ ...prev, ...newSlip }));
  };

  // ── AD SETTINGS ACTIONS ──
  const updateAdSettings = (newSettings) => {
    setAdSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  // ── MARKET CRUD ACTIONS ──
  const addMarket = (newMarket) => {
    setMarketsState(prev => [newMarket, ...prev]);
  };

  const updateMarket = (id, updatedMarket) => {
    setMarketsState(prev => prev.map(m => (m.id === id ? { ...m, ...updatedMarket } : m)));
  };

  const deleteMarket = (id) => {
    setMarketsState(prev => prev.filter(m => m.id !== id));
  };

  // ── TICKET ACTIONS ──
  const updateTicketCode = (ticketId, bookmaker, newCode) => {
    setTicketsState(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          bookingCode: newCode,
          codes: {
            ...(t.codes || {}),
            [bookmaker.toLowerCase()]: newCode
          }
        };
      }
      return t;
    }));
  };

  const updateTicket = (ticketId, updatedFields) => {
    setTicketsState(prev => prev.map(t => t.id === ticketId ? { ...t, ...updatedFields } : t));
  };

  const addTicket = (newTicket) => {
    setTicketsState(prev => [newTicket, ...prev]);
  };

  const deleteTicket = (ticketId) => {
    setTicketsState(prev => prev.filter(t => t.id !== ticketId));
  };

  // ── LADDER ACTIONS ──
  const updateLadder = (updatedLadder) => {
    setLadderState(updatedLadder);
  };

  // ── CODE CATALOGUE ACTIONS ──
  const addCatalogueCode = (newEntry) => {
    setCodeCatalogueState(prev => [newEntry, ...prev]);
  };

  const updateCatalogueCode = (id, updatedFields) => {
    setCodeCatalogueState(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const deleteCatalogueCode = (id) => {
    setCodeCatalogueState(prev => prev.filter(item => item.id !== id));
  };

  // ── PUNTERS ACTIONS ──
  const addPunter = (newPunter) => {
    setPuntersState(prev => [...prev, newPunter]);
  };

  const updatePunter = (punterId, updatedFields) => {
    setPuntersState(prev => prev.map(p => p.id === punterId ? { ...p, ...updatedFields } : p));
  };

  const deletePunter = (punterId) => {
    setPuntersState(prev => prev.filter(p => p.id !== punterId));
  };

  const addPunterCode = (punterId, codeObj) => {
    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId) {
        return {
          ...p,
          todayCodes: [codeObj, ...(p.todayCodes || [])]
        };
      }
      return p;
    }));
  };

  const deletePunterCode = (punterId, codeIndex) => {
    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId && p.todayCodes) {
        return {
          ...p,
          todayCodes: p.todayCodes.filter((_, idx) => idx !== codeIndex)
        };
      }
      return p;
    }));
  };

  // ── ANNOUNCEMENTS ACTIONS ──
  const updateAnnouncements = (newAnnouncements) => {
    setAnnouncementsState(newAnnouncements);
  };

  // ── SIMULATED CODE CONVERTER ──
  const convertBetCode = (sourceCode, fromBookie, toBookie) => {
    const prefixes = {
      sportybet: 'BC4-',
      bet9ja: 'B9J-',
      '1xbet': '1XB-',
      betking: 'BKG-',
      msport: 'MSP-'
    };
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const targetPrefix = prefixes[toBookie?.toLowerCase()] || 'BRY-';
    return `${targetPrefix}${randomSuffix}`;
  };

  // ── RESET TO DEFAULTS ──
  const resetToDefaults = () => {
    setLadderState(DEFAULT_LADDER);
    setTicketsState(DEFAULT_TICKETS);
    setCodeCatalogueState(INITIAL_CODE_CATALOGUE);
    setPuntersState(INITIAL_PUNTERS);
    setMarketsState(DEFAULT_MARKETS);
    setWhaleSlipState(DEFAULT_WHALE_SLIP);
    setAdSettingsState(DEFAULT_AD_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_LADDER);
    localStorage.removeItem(STORAGE_KEY_TICKETS);
    localStorage.removeItem(STORAGE_KEY_CATALOGUE);
    localStorage.removeItem(STORAGE_KEY_PUNTERS);
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEY_MARKETS);
    localStorage.removeItem(STORAGE_KEY_WHALE);
    localStorage.removeItem(STORAGE_KEY_ADS);
  };

  return (
    <PredictionsContext.Provider value={{
      ladder,
      tickets,
      codeCatalogue,
      punters,
      announcements,
      markets,
      whaleSlip,
      adSettings,
      updateWhaleSlip,
      updateAdSettings,
      addMarket,
      updateMarket,
      deleteMarket,
      copyModal,
      triggerCopyModal,
      closeCopyModal,
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
      convertBetCode,
      syncToCloudflare,
      resetToDefaults
    }}>
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const context = useContext(PredictionsContext);
  if (!context) {
    throw new Error('usePredictions must be used within a PredictionsProvider');
  }
  return context;
}
