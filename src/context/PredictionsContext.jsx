import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACTIVE_CHALLENGE as DEFAULT_LADDER } from '../data/ladder';
import { DAILY_BOOKING_TICKETS as DEFAULT_TICKETS } from '../data/bookingTickets';

const PredictionsContext = createContext(null);

const STORAGE_KEY_LADDER = 'bryme_active_ladder_v1';
const STORAGE_KEY_TICKETS = 'bryme_booking_tickets_v1';

export function PredictionsProvider({ children }) {
  // Load ladder state
  const [ladder, setLadderState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LADDER);
      return saved ? JSON.parse(saved) : DEFAULT_LADDER;
    } catch (e) {
      return DEFAULT_LADDER;
    }
  });

  // Load booking tickets state
  const [tickets, setTicketsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      return saved ? JSON.parse(saved) : DEFAULT_TICKETS;
    } catch (e) {
      return DEFAULT_TICKETS;
    }
  });

  // Save changes to localStorage
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

  // Update a booking code for a specific ticket
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

  // Update an entire ticket
  const updateTicket = (ticketId, ticketUpdates) => {
    setTicketsState(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, ...ticketUpdates };
      }
      return t;
    }));
  };

  // Add a new ticket
  const addTicket = (newTicket) => {
    setTicketsState(prev => [newTicket, ...prev]);
  };

  // Delete a ticket
  const deleteTicket = (ticketId) => {
    setTicketsState(prev => prev.filter(t => t.id !== ticketId));
  };

  // Update ladder
  const updateLadder = (ladderUpdates) => {
    setLadderState(prev => ({
      ...prev,
      ...ladderUpdates
    }));
  };

  // Reset to original defaults
  const resetToDefaults = () => {
    setLadderState(DEFAULT_LADDER);
    setTicketsState(DEFAULT_TICKETS);
    localStorage.removeItem(STORAGE_KEY_LADDER);
    localStorage.removeItem(STORAGE_KEY_TICKETS);
  };

  return (
    <PredictionsContext.Provider value={{
      ladder,
      tickets,
      updateTicketCode,
      updateTicket,
      addTicket,
      deleteTicket,
      updateLadder,
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
