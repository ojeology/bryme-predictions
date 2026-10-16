import React from 'react';
import { PUNTERS } from '../data/punters';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import { 
  ArrowLeft, ExternalLink, ShieldAlert, Users, Award, 
  TrendingUp, CheckCircle, XCircle, Clock 
} from 'lucide-react';

export default function PunterProfilePage({ punterId, onNavigate }) {
  const punter = PUNTERS.find(p => p.id === punterId) || PUNTERS[0];
  const punterTickets = TICKETS.filter(t => t.punterId === punter.id);

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('punters')}
          className="inline-flex items-center gap-1.5 text-xs text-brand-green hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Punters Directory</span>
        </button>
      </div>

      {/* Punter Profile Header Card */}
      <div className="bg-brand-card border border-brand-cardBorder rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pitch-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-green/20 border-2 border-brand-green/40 flex items-center justify-center font-black text-brand-green text-lg shadow-lg">
              {punter.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {punter.displayName}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pitch-850 text-slate-300 border border-pitch-750">
                  {punter.region}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span className="text-brand-green">{punter.handle}</span>
                <span>&bull;</span>
                <span>Platform: {punter.originalPlatform}</span>
              </div>
            </div>
          </div>

          <a
            href={punter.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Original Profile Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {punter.bio}
        </p>

        {/* BRYME Verification and Tracked Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Tracked</span>
            <span className="text-lg font-bold text-slate-200">{punter.stats.totalTracked} Tickets</span>
          </div>

          <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Won / Lost Tracked</span>
            <span className="text-lg font-bold text-slate-200">
              <span className="text-emerald-400">{punter.stats.won}W</span> / <span className="text-rose-400">{punter.stats.lost}L</span>
            </span>
          </div>

          <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Avg Odds Picked</span>
            <span className="text-lg font-bold text-brand-green">{punter.stats.avgOdds}x</span>
          </div>

          <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Last Active</span>
            <span className="text-xs font-mono font-bold text-slate-300 mt-1 block">{punter.stats.lastActive}</span>
          </div>
        </div>

        {/* Legal Non-Affiliation Disclaimer */}
        <div className="bg-pitch-950/70 p-3 rounded-xl border border-pitch-850 text-[11px] text-slate-400">
          <strong>Notice:</strong> {punter.verifiedDisclaimer} Win/loss tracking is maintained solely by BRYME editorial systems.
        </div>
      </div>

      {/* Punter's Logged Tickets */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-green" />
          Tracked Tickets for {punter.displayName} ({punterTickets.length})
        </h2>

        {punterTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {punterTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-pitch-850 p-8 rounded-xl border border-pitch-800 text-center text-xs text-slate-400">
            No active tickets currently tracked for this punter this weekend. Check back shortly.
          </div>
        )}
      </div>

    </div>
  );
}
