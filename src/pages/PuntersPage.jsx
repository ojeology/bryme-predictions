import React from 'react';
import { PUNTERS } from '../data/punters';
import { TICKETS } from '../data/tickets';
import { Award, ArrowRight, ShieldCheck, TrendingUp, Info } from 'lucide-react';

export default function PuntersPage({ onNavigate }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Tracked African Sports Punters
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Catalog of popular independent tipsters across Nigeria, Kenya, and Ghana. Transparent Won, Lost, and Void records.
        </p>
      </div>

      {/* Hard Content Rule Transparency Card */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
        <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 uppercase tracking-wide text-[10px]">
          Transparency Standard:
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
              onClick={() => onNavigate(`punter/${punter.id}`)}
              className="bg-white dark:bg-[#0E1626] hover:border-blue-500/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm shadow-inner">
                      {punter.avatar}
                    </div>
                    <div>
                      <h2 className="text-base font-display font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {punter.displayName}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>{punter.handle}</span>
                        <span>&bull;</span>
                        <span className="text-slate-700 dark:text-slate-300">{punter.region}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {punter.originalPlatform}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {punter.bio}
                </p>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {punter.primaryMarkets.map((m, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* BRYME-Tracked Record Bar */}
              <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono font-medium">
                    Tracked by BRYME
                  </span>
                  <div className="font-mono text-xs font-bold space-x-2 mt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400">{punter.stats.won} Won</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-rose-500">{punter.stats.lost} Lost</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-amber-500">{punter.stats.winRate}% Hit</span>
                  </div>
                </div>

                <span className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
