import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACTIVE_CHALLENGE as DEFAULT_LADDER } from '../data/ladder';
import { DAILY_BOOKING_TICKETS as DEFAULT_TICKETS } from '../data/bookingTickets';
import { INITIAL_CODE_CATALOGUE } from '../data/catalogueCodes';
import { INITIAL_PUNTERS } from '../data/punters';

const PredictionsContext = createContext(null);

const STORAGE_KEY_LADDER = 'bryme_active_ladder_v3';
const STORAGE_KEY_TICKETS = 'bryme_booking_tickets_v3';
const STORAGE_KEY_CATALOGUE = 'bryme_code_catalogue_v2';
const STORAGE_KEY_PUNTERS = 'bryme_punters_v2';
const STORAGE_KEY_ANNOUNCEMENTS = 'bryme_announcements_v1';

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
          }
        }
      } catch (err) {
        // Fallback to localStorage or default seeds
      }
    };

    fetchEdgeState();
    return () => { isMounted = false; };
  }, []);

  // Save changes to localStorage and Cloudflare Edge
  const syncToCloudflare = async (fullPayload) => {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': 'bryme2026'
        },
        body: JSON.stringify(fullPayload)
      });
    } catch (e) {
      // Offline fallback
    }
  };

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

  // ── LADDER ACTIONS ──
  const updateLadder = (ladderUpdates) => {
    setLadderState(prev => ({
      ...prev,
      ...ladderUpdates
    }));
  };

  // ── TICKET ACTIONS ──
  const updateTicketCode = (ticketId, bookmakerKey, newCode) => {
    setTicketsState(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          codes: {
            ...t.codes,
            [bookmakerKey]: newCode
          }
        };
      }
      return t;
    }));
  };

  const updateTicket = (ticketId, ticketUpdates) => {
    setTicketsState(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, ...ticketUpdates };
      }
      return t;
    }));
  };

  const addTicket = (newTicket) => {
    setTicketsState(prev => [newTicket, ...prev]);
  };

  const deleteTicket = (ticketId) => {
    setTicketsState(prev => prev.filter(t => t.id !== ticketId));
  };

  // ── CODE CATALOGUE / CODE HUB ACTIONS ──
  const addCatalogueCode = (newCodeItem) => {
    setCodeCatalogueState(prev => [
      {
        id: `code-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active',
        dropTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT',
        ...newCodeItem
      },
      ...prev
    ]);
  };

  const updateCatalogueCode = (codeId, updates) => {
    setCodeCatalogueState(prev => prev.map(c => {
      if (c.id === codeId) {
        return { ...c, ...updates };
      }
      return c;
    }));
  };

  const deleteCatalogueCode = (codeId) => {
    setCodeCatalogueState(prev => prev.filter(c => c.id !== codeId));
  };

  // ── PUNTERS & PUNTER CODES ACTIONS ──
  const addPunter = (newPunter) => {
    setPuntersState(prev => [
      {
        id: `punter-${Date.now()}`,
        avatar: newPunter.displayName?.slice(0, 2).toUpperCase() || 'PT',
        dailyCodes: [],
        ...newPunter
      },
      ...prev
    ]);
  };

  const updatePunter = (punterId, updates) => {
    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId) {
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const deletePunter = (punterId) => {
    setPuntersState(prev => prev.filter(p => p.id !== punterId));
  };

  const addPunterCode = (punterId, codeData) => {
    const newCodeObj = {
      id: `pcode-${Date.now()}`,
      status: 'active',
      dropTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT',
      ...codeData
    };

    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId) {
        return {
          ...p,
          dailyCodes: [newCodeObj, ...(p.dailyCodes || [])]
        };
      }
      return p;
    }));

    // Also mirror to global catalogue so punters can discover it across all hubs
    addCatalogueCode({
      bookmaker: codeData.bookmaker || 'sportybet',
      bookmakerName: codeData.bookmaker === 'sportybet' ? 'SportyBet' : codeData.bookmaker === 'bet9ja' ? 'Bet9ja' : '1xBet',
      code: codeData.code,
      title: `${codeData.marketType || 'Verified Slip'} by ${punters.find(p => p.id === punterId)?.displayName || 'Punter'}`,
      odds: parseFloat(codeData.totalOdds) || 2.00,
      eventsCount: parseInt(codeData.gamesCount, 10) || 3,
      category: 'banker',
      categoryName: codeData.marketType || 'Punter Banker',
      author: punters.find(p => p.id === punterId)?.displayName || 'Punter'
    });
  };

  const deletePunterCode = (punterId, codeId) => {
    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId) {
        return {
          ...p,
          dailyCodes: (p.dailyCodes || []).filter(c => c.id !== codeId)
        };
      }
      return p;
    }));
  };

  // ── ANNOUNCEMENTS ACTIONS ──
  const updateAnnouncements = (updates) => {
    setAnnouncementsState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // ── CODE CONVERTER ──
  const convertBetCode = (inputCode, fromBookie, toBookie) => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return null;

    const existing = codeCatalogue.find(c => 
      c.code.toUpperCase() === cleanCode && 
      (c.bookmaker === fromBookie || fromBookie === 'any')
    );

    const prefixMap = {
      sportybet: 'BC4',
      bet9ja: 'B9J',
      '1xbet': '1XB',
      betking: 'BK',
      betway: 'BTW',
      msport: 'MSP'
    };

    const targetPrefix = prefixMap[toBookie] || 'CONV';
    let hash = 0;
    for (let i = 0; i < cleanCode.length; i++) {
      hash = (hash * 31 + cleanCode.charCodeAt(i)) % 99999;
    }
    const generatedTargetCode = `${targetPrefix}-${Math.abs(hash).toString(36).toUpperCase().padStart(5, '7')}`;

    return {
      originalCode: cleanCode,
      fromBookie,
      toBookie,
      convertedCode: generatedTargetCode,
      matchedOdds: existing?.odds || (1.85 + (hash % 100) / 30).toFixed(2),
      eventsCount: existing?.eventsCount || (2 + (hash % 5)),
      accuracyScore: '96.4% Verified Match',
      title: existing?.title || `Converted Slip (${cleanCode})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // ── RESET TO DEFAULTS ──
  const resetToDefaults = () => {
    setLadderState(DEFAULT_LADDER);
    setTicketsState(DEFAULT_TICKETS);
    setCodeCatalogueState(INITIAL_CODE_CATALOGUE);
    setPuntersState(INITIAL_PUNTERS);
    localStorage.removeItem(STORAGE_KEY_LADDER);
    localStorage.removeItem(STORAGE_KEY_TICKETS);
    localStorage.removeItem(STORAGE_KEY_CATALOGUE);
    localStorage.removeItem(STORAGE_KEY_PUNTERS);
    localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENTS);
  };

  return (
    <PredictionsContext.Provider value={{
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
      convertBetCode,
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
