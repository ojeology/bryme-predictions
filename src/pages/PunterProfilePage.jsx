import React from 'react';
import { PUNTERS } from '../data/punters';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import { ArrowLeft, ShieldAlert, Award, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

export default function PunterProfilePage({ punterId, onNavigate }) {
  const punter = PUNTERS.find(p => p.id === punterId) || PUNTERS[0];
  const punterTickets = TICKETS.filter(t => t.punterId === punter.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('punters')}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Punters Catalog</span>
        </button>
      </div>

      {/* Punter Profile Header Card */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-xl shadow-inner">
              {punter.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  {punter.displayName}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {punter.originalPlatform}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {punter.handle} &bull; {punter.region}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {punter.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-medium">Tracked Win Rate</span>
            <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">{punter.stats.winRate}%</span>
          </div>
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-medium">Total Won</span>
            <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400">{punter.stats.won}</span>
          </div>
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-medium">Total Lost</span>
            <span className="text-xl font-mono font-black text-rose-500">{punter.stats.lost}</span>
          </div>
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-medium">Average Odds</span>
            <span className="text-xl font-mono font-black text-amber-500">{punter.stats.avgOdds}x</span>
          </div>
        </div>
      </div>

      {/* Tickets from this punter */}
      <div className="space-y-4">
        <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Active &amp; Archived Slips by {punter.displayName}</span>
        </h2>

        {punterTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {punterTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0E1626] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No active tickets logged for this profile right now. Fresh selections drop at 02:00 AM WAT.
          </div>
        )}
      </div>

    </div>
  );
}
