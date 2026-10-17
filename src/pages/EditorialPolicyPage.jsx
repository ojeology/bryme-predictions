import React from 'react';
import { EDITORIAL_POLICY } from '../data/compliance';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function EditorialPolicyPage({ onNavigate }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Editorial &amp; Verification Policy
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last revised: {EDITORIAL_POLICY.lastUpdated} &bull; Our binding code of transparency.
        </p>
      </div>

      {/* Tenets */}
      <div className="space-y-4">
        {EDITORIAL_POLICY.coreTenets.map((tenet, idx) => (
          <div key={idx} className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm">
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{tenet.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
              {tenet.description}
            </p>
          </div>
        ))}
      </div>

      {/* How corrections are handled */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Community Corrections Protocol</h3>
        <p>
          If a booking code, kickoff time, or match outcome is recorded incorrectly in the public ledger, any user can submit a correction notice to our desk. All audited corrections are logged within 2 hours with an editor note.
        </p>
      </div>

    </div>
  );
}
