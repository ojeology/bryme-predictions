import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { TICKETS } from '../data/tickets';
import { PUNTERS } from '../data/punters';
import { MARKETS } from '../data/markets';

export default function SearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { tickets: [], punters: [], markets: [] };

    const matchingTickets = TICKETS.filter(t => {
      const inTitle = t.title.toLowerCase().includes(q);
      const inCode = t.bookingCode && t.bookingCode.toLowerCase().includes(q);
      const inPunter = t.punterName && t.punterName.toLowerCase().includes(q);
      const inSelections = t.selections && t.selections.some(s => 
        s.match.toLowerCase().includes(q) || 
        s.league.toLowerCase().includes(q) || 
        s.pick.toLowerCase().includes(q)
      );
      return inTitle || inCode || inPunter || inSelections;
    });

    const matchingPunters = PUNTERS.filter(p => 
      p.displayName.toLowerCase().includes(q) || 
      p.handle.toLowerCase().includes(q)
    );

    const matchingMarkets = MARKETS.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q)
    );

    return {
      tickets: matchingTickets.slice(0, 5),
      punters: matchingPunters.slice(0, 3),
      markets: matchingMarkets.slice(0, 3)
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-white/[0.1] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-100 dark:border-white/[0.08] flex items-center gap-3">
          <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams (Enyimba, Gor Mahia, Arsenal), punters, codes..."
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3.5 overflow-y-auto space-y-3">
          {!query ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <p>Type any African club, league, market, or code to search.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                {['Enyimba', 'Gor Mahia', 'Sundowns', 'Over 1.5', 'NPFL', 'Mashemeji'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-[#070D1A] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-700 dark:text-slate-300 text-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {filtered.tickets.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                    Tickets ({filtered.tickets.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filtered.tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          onNavigate(`ticket/${ticket.id}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] hover:bg-slate-100 dark:hover:bg-[#121E36] border border-slate-200 dark:border-white/[0.06] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{ticket.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {ticket.bookmaker} &bull; <strong className="text-emerald-500">{ticket.totalOdds}x</strong> &bull; {ticket.punterName}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.punters.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                    Punters ({filtered.punters.length})
                  </h4>
                  <div className="space-y-1.5">
                    {filtered.punters.map(punter => (
                      <div
                        key={punter.id}
                        onClick={() => {
                          onNavigate(`punters/${punter.id}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070D1A] hover:bg-slate-100 dark:hover:bg-[#121E36] border border-slate-200 dark:border-white/[0.06] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{punter.displayName}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{punter.handle} &bull; {punter.region}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.tickets.length === 0 && filtered.punters.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <p>No results found for "{query}".</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
