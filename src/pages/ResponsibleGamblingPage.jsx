import React from 'react';
import { RESPONSIBLE_GAMBLING } from '../data/compliance';
import { ShieldAlert, Phone, HeartHandshake, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ResponsibleGamblingPage({ onNavigate }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            18+ Responsible Gambling &amp; Player Protection
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Sports betting should only ever be treated as a form of adult entertainment. We actively promote harm prevention and strict bankroll discipline.
        </p>
      </div>

      {/* Primary Notice */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-5 space-y-2">
        <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Core Responsibility Commitment</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {RESPONSIBLE_GAMBLING.warningFull}
        </p>
      </div>

      {/* Helplines Nigeria & Kenya */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-brand-green" />
          Free &amp; Confidential Support Contacts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nigeria */}
          <div className="bg-brand-card border border-brand-cardBorder rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇳🇬</span>
              <h3 className="font-bold text-slate-100 text-sm">Nigeria Support Resources</h3>
            </div>
            {RESPONSIBLE_GAMBLING.helplines.nigeria.map((org, idx) => (
              <div key={idx} className="bg-pitch-950 p-3 rounded-lg border border-pitch-800 space-y-1 text-xs">
                <span className="font-bold text-emerald-400 block">{org.name}</span>
                <p className="text-[11px] text-slate-400">{org.description}</p>
                {org.contact && (
                  <div className="text-slate-200 font-mono font-bold pt-1">
                    Hotline: {org.contact}
                  </div>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-brand-green hover:underline text-[10px] block">
                    {org.website}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Kenya */}
          <div className="bg-brand-card border border-brand-cardBorder rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇰🇪</span>
              <h3 className="font-bold text-slate-100 text-sm">Kenya Support Resources</h3>
            </div>
            {RESPONSIBLE_GAMBLING.helplines.kenya.map((org, idx) => (
              <div key={idx} className="bg-pitch-950 p-3 rounded-lg border border-pitch-800 space-y-1 text-xs">
                <span className="font-bold text-emerald-400 block">{org.name}</span>
                <p className="text-[11px] text-slate-400">{org.description}</p>
                {org.contact && (
                  <div className="text-slate-200 font-mono font-bold pt-1">
                    Hotline: {org.contact}
                  </div>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-brand-green hover:underline text-[10px] block">
                    {org.website}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning signs of problem gambling */}
      <div className="bg-pitch-850 border border-pitch-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          Warning Signs of Problem Gambling
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {RESPONSIBLE_GAMBLING.signsOfProblemGambling.map((sign, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Golden rules */}
      <div className="bg-pitch-850 border border-pitch-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          BRYME Golden Rules for Punters
        </h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {RESPONSIBLE_GAMBLING.goldenRules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green mt-0.5 flex-shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
