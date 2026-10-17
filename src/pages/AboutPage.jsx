import React from 'react';
import { Sparkles, Target, ShieldCheck, HeartHandshake, Layers } from 'lucide-react';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
          About BRYME Predictions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sports intelligence, honest bookkeeping, and disciplined betting analytics for African markets.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
        <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">Why BRYME Was Built</h2>
        <p>
          Football wagering is huge across Nigeria, Kenya, Ghana and Uganda. Every weekend, social media groups circulate hundreds of booking codes. But almost none of these groups maintain accountability: when a code loses, the post is deleted or forgotten, creating an illusion of effortless wins.
        </p>
        <p>
          <strong className="text-slate-950 dark:text-white">BRYME Predictions changes that.</strong> We act as a neutral sports record keeper. Every ticket entered into the platform — whether our Editor's Best Pick, an Anybody-Win accumulator, or a tracked punter slip — remains permanently in our archive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-blue-600 dark:text-blue-400 font-display font-bold block text-sm">1. Mobile-First</span>
          <p className="text-slate-500 dark:text-slate-400">Designed primarily for fast loading on Android and mobile networks across Lagos, Nairobi, and Accra.</p>
        </div>
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-emerald-600 dark:text-emerald-400 font-display font-bold block text-sm">2. Zero Hype</span>
          <p className="text-slate-500 dark:text-slate-400">Strictly no "fixed games" scams or percentage win guarantees. Only mathematical odds and transparency.</p>
        </div>
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-amber-500 font-display font-bold block text-sm">3. Public Ledger</span>
          <p className="text-slate-500 dark:text-slate-400">Our signature Ladder Challenge logs every day, every stake, and every termination without deletion.</p>
        </div>
      </div>
    </div>
  );
}
