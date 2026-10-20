import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACTIVE_CHALLENGE as DEFAULT_LADDER } from '../data/ladder';
import { DAILY_BOOKING_TICKETS as DEFAULT_TICKETS } from '../data/bookingTickets';
import { INITIAL_CODE_CATALOGUE } from '../data/catalogueCodes';
import { INITIAL_PUNTERS } from '../data/punters';
import { MARKETS as DEFAULT_MARKETS } from '../data/markets';
import { INITIAL_MARKET_CODES } from '../data/marketCodes';
import { SYNDICATE_ARCHIVE as DEFAULT_SYNDICATE_ARCHIVE } from '../data/syndicateArchive';

const PredictionsContext = createContext(null);

const STORAGE_KEY_LADDER = 'bryme_active_ladder_v3';
const STORAGE_KEY_TICKETS = 'bryme_booking_tickets_v3';
const STORAGE_KEY_CATALOGUE = 'bryme_code_catalogue_v3';
const STORAGE_KEY_PUNTERS = 'bryme_punters_v4';
const STORAGE_KEY_ANNOUNCEMENTS = 'bryme_announcements_v1';
const STORAGE_KEY_MARKETS = 'bryme_markets_v2';
const STORAGE_KEY_WHALE = 'bryme_whale_slip_v1';
const STORAGE_KEY_ADS = 'bryme_ad_settings_v1';
const STORAGE_KEY_MARKET_CODES = 'bryme_market_codes_v2';
const STORAGE_KEY_SYNDICATE = 'bryme_syndicate_archive_v1';

export const DEFAULT_WHALE_SLIP = {
  id: 'whale-2-odds-today',
  title: "Today's Whale 2-Odds Syndicate Lock",
  staker: 'Lagos VIP Syndicate #04',
  stakeAmount: '₦500,000',
  totalOdds: 2.18,
  potentialReturn: '₦1,090,000',
  confidence: '94%',
  status: 'won', // WON & CASHED OUT
  payoutStatus: 'PAID OUT (₦1,090,000 CASHED)',
  sportyCode: 'Q7S287',
  bet9jaCode: '5WGQKM6',
  kickoffTime: 'Settled & Won (Full Time)',
  punterCount: 4210,
  volumeStaked: '₦18,450,000',
  intel: 'SYNDICATE BET WON & PAID OUT! Both Real Madrid Over 1.5 Team Goals (2-1 FT) and Bayern Munich vs RB Leipzig Over 2.5 Goals (3-2 FT) cashed cleanly before full time delivering ₦1,090,000 total payout. Next Whale 2-Odds game drops for the next match cycle.',
  matches: [
    {
      id: 'm1',
      match: 'Real Madrid vs Sevilla (2-1 FT)',
      league: 'Spanish La Liga',
      kickoff: 'Full Time',
      pick: 'Real Madrid Over 1.5 Team Goals',
      odds: 1.45,
      status: 'won',
      resultScore: '2-1 FT (WON)',
      analysis: 'Madrid dominated with 18 shots; 2-1 final score crossed the 1.5 team goal mark in minute 64.'
    },
    {
      id: 'm2',
      match: 'Bayern Munich vs RB Leipzig (3-2 FT)',
      league: 'German Bundesliga',
      kickoff: 'Full Time',
      pick: 'Over 2.5 Total Goals',
      odds: 1.50,
      status: 'won',
      resultScore: '3-2 FT (WON)',
      analysis: 'Explosive 5-goal thriller sealed the Over 2.5 line by the 52nd minute.'
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
  oneXBetAffiliateUrl: 'https://1xbet.ng/',
  msportAffiliateUrl: 'https://www.msport.com/',
  betkingAffiliateUrl: 'https://www.betking.com/',
  twentyTwoBetAffiliateUrl: 'https://che.fluxbrox.com/redirect.aspx?pid=199669&bid=1488&lpid=25'
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'punter-mrbanks')) {
          return parsed;
        }
      }
      return INITIAL_PUNTERS;
    } catch (e) {
      return INITIAL_PUNTERS;
    }
  });

  // 5. Market Specific Booking Codes State (Slips attached to Over 1.5, Double Chance, etc.)
  const [marketCodes, setMarketCodesState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MARKET_CODES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_MARKET_CODES;
    } catch (e) {
      return INITIAL_MARKET_CODES;
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

  // 9. Historical Whale Syndicate Archive
  const [syndicateArchive, setSyndicateArchiveState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYNDICATE);
      return saved ? JSON.parse(saved) : DEFAULT_SYNDICATE_ARCHIVE;
    } catch (e) {
      return DEFAULT_SYNDICATE_ARCHIVE;
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
            if (remote.punters && Array.isArray(remote.punters) && remote.punters.some(p => p.id === 'punter-mrbanks')) {
              setPuntersState(remote.punters);
            } else {
              setPuntersState(INITIAL_PUNTERS);
            }
            if (remote.announcements) setAnnouncementsState(remote.announcements);
            if (remote.markets) setMarketsState(remote.markets);
            if (remote.marketCodes && Array.isArray(remote.marketCodes)) {
              setMarketCodesState(remote.marketCodes);
            }
            if (remote.whaleSlip) setWhaleSlipState(remote.whaleSlip);
            if (remote.adSettings) setAdSettingsState(remote.adSettings);
            if (remote.syndicateArchive && Array.isArray(remote.syndicateArchive) && remote.syndicateArchive.length > 0) {
              setSyndicateArchiveState(remote.syndicateArchive);
            }
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
        marketCodes,
        whaleSlip,
        adSettings,
        syndicateArchive
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [ladder, tickets, codeCatalogue, punters, announcements, markets, marketCodes, whaleSlip, adSettings, syndicateArchive, isHydrated]);

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MARKET_CODES, JSON.stringify(marketCodes));
    } catch (e) {}
  }, [marketCodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SYNDICATE, JSON.stringify(syndicateArchive));
    } catch (e) {}
  }, [syndicateArchive]);

  // ── MARKET BOOKING CODES CRUD ACTIONS ──
  const addMarketCode = (newEntry) => {
    const timestamp = Date.now();
    const todayDateStr = '2026-10-20';
    const isSporty = newEntry.bookmaker?.toLowerCase() === 'sportybet';

    const entry = {
      ...newEntry,
      id: newEntry.id || `mcode-${timestamp}-${(newEntry.code || '').toLowerCase()}`,
      assignedDate: newEntry.assignedDate || todayDateStr,
      isToday: true,
      dropTime: newEntry.dropTime || 'Today, Oct 20',
      formattedDate: 'Today, Oct 20',
      createdAt: timestamp
    };

    if (isSporty) {
      const fbTwin = {
        ...entry,
        id: `${entry.id}-fb`,
        bookmaker: 'footballcom',
        bookmakerName: 'Football.com',
        title: `${entry.title?.replace('SportyBet', 'Football.com') || 'Football.com Twin'}`,
        createdAt: timestamp + 1
      };
      setMarketCodesState(prev => [entry, fbTwin, ...prev]);

      // Mirror into Code Hub
      setCodeCatalogueState(prev => {
        const hasMain = prev.some(c => c.code === entry.code && c.bookmaker === entry.bookmaker);
        const toAdd = [];
        if (!hasMain) {
          toAdd.push({
            id: `cat-${entry.id}`,
            code: entry.code,
            bookmaker: entry.bookmaker,
            bookmakerName: entry.bookmakerName,
            title: entry.title,
            odds: entry.odds,
            totalOdds: entry.odds,
            eventsCount: entry.eventsCount || entry.gamesCount,
            gamesCount: entry.eventsCount || entry.gamesCount,
            categoryName: entry.title || 'Market Slip',
            status: 'active',
            assignedDate: todayDateStr,
            dropTime: 'Today, Oct 20',
            formattedDate: 'Today, Oct 20',
            createdAt: timestamp,
            isToday: true
          });
          toAdd.push({
            id: `cat-${entry.id}-fb`,
            code: entry.code,
            bookmaker: 'footballcom',
            bookmakerName: 'Football.com',
            title: `${entry.title?.replace('SportyBet', 'Football.com') || 'Football.com Twin'}`,
            odds: entry.odds,
            totalOdds: entry.odds,
            eventsCount: entry.eventsCount || entry.gamesCount,
            gamesCount: entry.eventsCount || entry.gamesCount,
            categoryName: 'Football.com Twin',
            status: 'active',
            assignedDate: todayDateStr,
            dropTime: 'Today, Oct 20',
            formattedDate: 'Today, Oct 20',
            createdAt: timestamp + 1,
            isToday: true
          });
        }
        return [...toAdd, ...prev];
      });
    } else {
      setMarketCodesState(prev => [entry, ...prev]);

      // Mirror into Code Hub
      setCodeCatalogueState(prev => {
        const hasMain = prev.some(c => c.code === entry.code && c.bookmaker === entry.bookmaker);
        if (hasMain) return prev;
        return [{
          id: `cat-${entry.id}`,
          code: entry.code,
          bookmaker: entry.bookmaker,
          bookmakerName: entry.bookmakerName,
          title: entry.title,
          odds: entry.odds,
          totalOdds: entry.odds,
          eventsCount: entry.eventsCount || entry.gamesCount,
          gamesCount: entry.eventsCount || entry.gamesCount,
          categoryName: entry.title || 'Market Slip',
          status: 'active',
          assignedDate: todayDateStr,
          dropTime: 'Today, Oct 20',
          formattedDate: 'Today, Oct 20',
          createdAt: timestamp,
          isToday: true
        }, ...prev];
      });
    }
  };

  const updateMarketCode = (id, updatedFields) => {
    setMarketCodesState(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const deleteMarketCode = (id) => {
    setMarketCodesState(prev => prev.filter(item => item.id !== id));
  };

  // ── WHALE SLIP ACTIONS ──
  const updateWhaleSlip = (newSlip) => {
    setWhaleSlipState(prev => ({ ...prev, ...newSlip }));
  };

  // ── SYNDICATE ARCHIVE CRUD ACTIONS ──
  const addSyndicateRun = (newRun) => {
    setSyndicateArchiveState(prev => [newRun, ...prev]);
  };

  const updateSyndicateRun = (id, updatedFields) => {
    setSyndicateArchiveState(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const deleteSyndicateRun = (id) => {
    setSyndicateArchiveState(prev => prev.filter(item => item.id !== id));
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
    const timestamp = Date.now();
    const todayDateStr = '2026-10-20';
    const entry = {
      ...newEntry,
      id: newEntry.id || `code-cat-${timestamp}`,
      createdAt: timestamp,
      status: newEntry.status || 'active',
      assignedDate: newEntry.assignedDate || todayDateStr,
      isToday: true,
      dropTime: newEntry.dropTime || 'Today, Oct 20',
      formattedDate: 'Today, Oct 20'
    };

    // If marketId is provided, also add to marketCodes!
    if (newEntry.marketId) {
      setMarketCodesState(prev => [{
        id: `mcode-${timestamp}-${entry.code.toLowerCase()}`,
        marketId: newEntry.marketId,
        code: entry.code,
        odds: entry.odds,
        bookmaker: entry.bookmaker,
        bookmakerName: entry.bookmakerName,
        title: entry.title,
        eventsCount: entry.eventsCount || entry.gamesCount,
        status: 'active',
        assignedDate: todayDateStr,
        dropTime: 'Today, Oct 20',
        formattedDate: 'Today, Oct 20',
        createdAt: timestamp,
        isToday: true
      }, ...prev]);
    }

    // Rule: New codes are placed ahead of all other codes!
    // For every sportybet code create a football.com duplicate ahead as well
    if (newEntry.bookmaker === 'sportybet') {
      const fbTwin = {
        ...entry,
        id: `code-cat-${timestamp}-fb`,
        bookmaker: 'footballcom',
        bookmakerName: 'Football.com',
        title: entry.title?.replace('SportyBet', 'Football.com') || `${entry.title} (Football.com)`,
        createdAt: timestamp + 1
      };
      setCodeCatalogueState(prev => [entry, fbTwin, ...prev]);

      if (newEntry.marketId) {
        setMarketCodesState(prev => [{
          id: `mcode-${timestamp}-${entry.code.toLowerCase()}-fb`,
          marketId: newEntry.marketId,
          code: entry.code,
          odds: entry.odds,
          bookmaker: 'footballcom',
          bookmakerName: 'Football.com',
          title: `${entry.title?.replace('SportyBet', 'Football.com') || 'Football.com Twin'}`,
          eventsCount: entry.eventsCount || entry.gamesCount,
          status: 'active',
          assignedDate: todayDateStr,
          dropTime: 'Today, Oct 20',
          formattedDate: 'Today, Oct 20',
          createdAt: timestamp + 1,
          isToday: true
        }, ...prev]);
      }
    } else {
      setCodeCatalogueState(prev => [entry, ...prev]);
    }
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
    // 1. Add to punter's dailyCodes at the very beginning (ahead of all others)
    setPuntersState(prev => prev.map(p => {
      if (p.id === punterId) {
        return {
          ...p,
          dailyCodes: [codeObj, ...(p.dailyCodes || [])],
          todayCodes: [codeObj, ...(p.todayCodes || [])]
        };
      }
      return p;
    }));

    // 2. Mirror directly into the Code Hub (codeCatalogue) ahead of all other codes!
    const targetPunter = punters.find(p => p.id === punterId);
    const pName = targetPunter ? targetPunter.displayName : 'Verified Punter';
    const timestamp = Date.now();
    const todayDateStr = '2026-10-20';
    const isSporty = codeObj.bookmaker === 'sportybet';
    const cleanOdds = codeObj.totalOdds !== undefined && codeObj.totalOdds !== null && codeObj.totalOdds !== '' 
      ? (parseFloat(codeObj.totalOdds) || codeObj.totalOdds) 
      : null;

    const catEntry = {
      id: `code-cat-punter-${timestamp}`,
      bookmaker: codeObj.bookmaker,
      bookmakerName: codeObj.bookmaker === 'footballcom' ? 'Football.com' : codeObj.bookmaker === 'bet9ja' ? 'Bet9ja' : codeObj.bookmaker === '1xbet' ? '1xBet' : codeObj.bookmaker === '22bet' ? '22Bet' : codeObj.bookmaker === 'betking' ? 'BetKing' : 'SportyBet',
      code: codeObj.code.toUpperCase(),
      title: `${pName} ${codeObj.marketType || 'Special Slip'}`,
      odds: cleanOdds,
      totalOdds: cleanOdds,
      eventsCount: codeObj.gamesCount ? (parseInt(codeObj.gamesCount, 10) || null) : null,
      gamesCount: codeObj.gamesCount ? (parseInt(codeObj.gamesCount, 10) || null) : null,
      category: 'mega',
      categoryName: codeObj.marketType || 'Punter Pick',
      status: 'active',
      highlightMatch: `${pName} Daily Selection`,
      assignedDate: todayDateStr,
      dropTime: 'Today, Oct 20',
      formattedDate: 'Today, Oct 20',
      author: pName,
      createdAt: timestamp,
      isToday: true
    };

    if (isSporty) {
      const fbTwin = {
        ...catEntry,
        id: `code-cat-punter-${timestamp}-fb`,
        bookmaker: 'footballcom',
        bookmakerName: 'Football.com',
        title: `${pName} ${codeObj.marketType || 'Special Slip'} (Football.com)`,
        createdAt: timestamp + 1
      };
      setCodeCatalogueState(prev => [catEntry, fbTwin, ...prev]);
    } else {
      setCodeCatalogueState(prev => [catEntry, ...prev]);
    }
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
    const f = fromBookie?.toLowerCase();
    const t = toBookie?.toLowerCase();

    // SportyBet and Football.com share the exact same booking codes!
    if ((f === 'sportybet' && t === 'footballcom') || (f === 'footballcom' && t === 'sportybet')) {
      return sourceCode ? sourceCode.trim().toUpperCase() : 'Q7S287';
    }

    // Check if target bookmaker has an existing verified slip matching this odds tier
    const matchingTarget = codeCatalogueState.find(c => c.bookmaker === t);
    if (matchingTarget?.code) return matchingTarget.code;

    // Realistic African bookmaker code formats (never mock BC4- or B9J-)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randChars = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    if (t === 'sportybet' || t === 'footballcom') return randChars(6);
    if (t === 'bet9ja') return `5W${randChars(5)}`;
    if (t === '1xbet' || t === '22bet') return randChars(5);
    if (t === 'betking') return `BK${randChars(5)}`;
    return randChars(6);
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
    localStorage.removeItem(STORAGE_KEY_MARKET_CODES);
  };

  return (
    <PredictionsContext.Provider value={{
      ladder,
      tickets,
      codeCatalogue,
      punters,
      announcements,
      markets,
      marketCodes,
      addMarketCode,
      updateMarketCode,
      deleteMarketCode,
      whaleSlip,
      adSettings,
      syndicateArchive,
      addSyndicateRun,
      updateSyndicateRun,
      deleteSyndicateRun,
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
