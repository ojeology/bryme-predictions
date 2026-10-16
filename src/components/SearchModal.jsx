import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-pitch-950/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fadeIn">
      <div className="bg-pitch-900 border border-pitch-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-pitch-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams (Arsenal, Bayern), punter (@NaijaTactician), codes, markets..."
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:text-white text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded bg-pitch-800 text-slate-300 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!query ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>Type any club name, league, market, or punter handle to search.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Arsenal', 'Over 2.5', '@NaijaTactician', 'Double Chance', 'Anybody-Win'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded text-slate-300 text-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Tickets match */}
              {filtered.tickets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Tickets ({filtered.tickets.length})
                  </h4>
                  <div className="space-y-2">
                    {filtered.tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          onNavigate(`ticket/${ticket.id}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-100">{ticket.title}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{ticket.bookmaker}</span>
                            <span>&bull;</span>
                            <span className="text-brand-green font-mono">{ticket.totalOdds}x</span>
                            <span>&bull;</span>
                            <span>{ticket.punterName}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Punters match */}
              {filtered.punters.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Punters ({filtered.punters.length})
                  </h4>
                  <div className="space-y-2">
                    {filtered.punters.map(punter => (
                      <div
                        key={punter.id}
                        onClick={() => {
                          onNavigate(`punters/${punter.id}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-100">{punter.displayName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{punter.handle} &bull; {punter.region}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Markets match */}
              {filtered.markets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                    Markets ({filtered.markets.length})
                  </h4>
                  <div className="space-y-2">
                    {filtered.markets.map(market => (
                      <div
                        key={market.slug}
                        onClick={() => {
                          onNavigate(`markets/${market.slug}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-100">{market.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{market.description}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.tickets.length === 0 && filtered.punters.length === 0 && filtered.markets.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p>No results found for "{query}".</p>
                  <p className="text-slate-500 mt-1">Try searching for generic terms like "Premier League", "Over 1.5", or "SportyBet".</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
