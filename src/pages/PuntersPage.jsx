import React from 'react';
import { PUNTERS } from '../data/punters';
import { TICKETS } from '../data/tickets';
import { Users, ArrowRight, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';

export default function PuntersPage({ onNavigate }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-green" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Favorite Punters Catalog
            </h1>
          </div>

          <button
            onClick={() => onNavigate('weekend-hub')}
            className="px-3.5 py-1.5 bg-brand-green text-pitch-950 font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-brand-greenDark transition-colors"
          >
            <span>Weekend Consensus Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Tracking Twitter/X sports punters from Nigeria and Kenya with 100% public accountability.
        </p>
      </div>

      {/* Hard Content Rule Transparency Card */}
      <div className="bg-pitch-850 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300">
        <strong className="text-brand-green block mb-0.5 uppercase tracking-wide text-[10px]">
          Transparency &amp; Legal Standard:
        </strong>
        BRYME Predictions tracks public sports tips independently. Punters featured here do not endorse BRYME, nor is there any paid placement. In accordance with platform integrity rules, prototype profiles use demonstration metrics.
      </div>

      {/* Punters Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PUNTERS.map((punter) => {
          const punterTickets = TICKETS.filter(t => t.punterId === punter.id);

          return (
            <div
              key={punter.id}
              onClick={() => onNavigate(`punters/${punter.id}`)}
              className="bg-brand-card hover:bg-pitch-800/90 border border-brand-cardBorder hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center justify-center font-bold text-brand-green text-sm shadow-inner">
                      {punter.avatar}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {punter.displayName}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span>{punter.handle}</span>
                        <span>&bull;</span>
                        <span className="text-slate-300">{punter.region}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pitch-900 text-slate-400 border border-pitch-800">
                    {punter.originalPlatform}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {punter.bio}
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {punter.primaryMarkets.map((m, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-pitch-900 text-slate-400 border border-pitch-800 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* BRYME-Tracked Record Bar */}
              <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">
                    Tracked by BRYME
                  </span>
                  <div className="font-mono text-xs font-bold space-x-2 mt-0.5">
                    <span className="text-emerald-400">{punter.stats.won} Won</span>
                    <span className="text-rose-400">{punter.stats.lost} Lost</span>
                    <span className="text-amber-400">{punter.stats.void} Void</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">
                    Active Slips
                  </span>
                  <span className="font-mono text-brand-green font-bold text-xs">
                    {punterTickets.length} Tickets
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
