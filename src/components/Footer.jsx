import React from 'react';
import { ShieldAlert, HeartHandshake, FileText, Phone, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-100 dark:bg-[#070D1E] border-t border-slate-200 dark:border-blue-950/60 text-slate-600 dark:text-slate-400 mt-12 pt-8 pb-20 md:pb-8 transition-colors">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        
        {/* Responsible Gambling Mandatory Banner (18+) */}
        <div className="bg-white dark:bg-[#0E172A] border border-amber-300 dark:border-amber-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
              18+
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Strictly 18+ &bull; Responsible Gambling Notice
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Betting involves financial risk. You can lose money. Only bet what you can afford to lose.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-[#070D1A] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#182847] text-slate-700 dark:text-slate-300">
              NG: GambleAlert <strong>+234 915 767 7777</strong>
            </div>
            <div className="bg-slate-50 dark:bg-[#070D1A] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#182847] text-slate-700 dark:text-slate-300">
              KE: BCLB <strong>+254 703 038 000</strong>
            </div>
          </div>
        </div>

        {/* Directory Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Platform
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-500 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('predictions')} className="hover:text-emerald-500 transition-colors">
                  Predictions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ladder')} className="hover:text-emerald-500 transition-colors">
                  Ladder Ledger
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('markets')} className="hover:text-emerald-500 transition-colors">
                  Markets
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              African Hubs
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-emerald-500 transition-colors">
                  Nigeria NPFL
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-emerald-500 transition-colors">
                  Kenya FKF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-emerald-500 transition-colors">
                  Ghana Premier League
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-emerald-500 transition-colors">
                  South Africa PSL
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Community
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('punters')} className="hover:text-emerald-500 transition-colors">
                  Tracked Punters
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('weekend-hub')} className="hover:text-emerald-500 transition-colors">
                  Consensus Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookmakers')} className="hover:text-emerald-500 transition-colors">
                  Bookmakers Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('editor-picks')} className="hover:text-emerald-500 transition-colors">
                  Editor's Best Pick
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Legal &amp; Desk
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('editorial-policy')} className="hover:text-emerald-500 transition-colors">
                  Editorial Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('responsible-gambling')} className="hover:text-emerald-500 transition-colors">
                  Responsible Gaming
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-500 transition-colors">
                  Corrections Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline transition-colors flex items-center gap-1">
                  <span>⚡ Admin Operations Deck</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-500 transition-colors">
                  About BRYME
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} BRYME Predictions. Pan-African Sports Intelligence &bull; 18+ Only.
          </p>
          <p className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
            Notice: All records and tickets are demonstration sample data. Zero guaranteed outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}
