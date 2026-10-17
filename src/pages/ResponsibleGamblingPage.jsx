import React from 'react';
import { RESPONSIBLE_GAMBLING } from '../data/compliance';
import { ShieldAlert, Phone, HeartHandshake, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ResponsibleGamblingPage({ onNavigate }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            18+ Responsible Gambling &amp; Player Protection
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sports betting should only ever be treated as a form of adult entertainment. We actively promote harm prevention and strict bankroll discipline.
        </p>
      </div>

      {/* Primary Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-5 space-y-2">
        <h2 className="text-sm font-display font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Core Responsibility Commitment</span>
        </h2>
        <p className="text-xs sm:text-sm text-amber-950 dark:text-slate-200 leading-relaxed">
          {RESPONSIBLE_GAMBLING.warningFull}
        </p>
      </div>

      {/* Helplines Nigeria & Kenya */}
      <div className="space-y-4">
        <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-500" />
          <span>Free &amp; Confidential Support Contacts</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nigeria */}
          <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇳🇬</span>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Nigeria</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">National Regulatory Helpline:</span>
                <a href="tel:0800000000" className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  {RESPONSIBLE_GAMBLING.helplineNigeria}
                </a>
              </div>
              <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Support Body:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{RESPONSIBLE_GAMBLING.helplineNigeriaOrg}</span>
              </div>
            </div>
          </div>

          {/* Kenya */}
          <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇰🇪</span>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Kenya</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">BCLB National Helpline:</span>
                <a href="tel:0800723253" className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  {RESPONSIBLE_GAMBLING.helplineKenya}
                </a>
              </div>
              <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Support Body:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{RESPONSIBLE_GAMBLING.helplineKenyaOrg}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Principles of Healthy Betting */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-500" />
          <span>Rules of Sustainable Play</span>
        </h3>
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Treat every bet as an entertainment expense:</strong> Never bet money intended for living expenses, rent, school fees, or utility bills.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Never chase losses:</strong> Attempting to win back lost money by increasing stakes is the fastest path to significant harm.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Set strict time and deposit limits:</strong> Decide before you start how much you can afford to lose and how long you will play.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span><strong>Do not bet under the influence:</strong> Alcohol, fatigue, and emotional distress impair risk assessment and discipline.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
