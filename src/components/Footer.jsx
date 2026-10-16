import React from 'react';
import { ShieldAlert, HeartHandshake, FileText, Phone, Mail, ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-pitch-950 border-t border-pitch-800 text-slate-400 mt-12 pt-8 pb-16 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Responsible Gambling Mandatory Banner (18+) */}
        <div className="bg-pitch-900 border border-amber-900/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0">
              18+
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Strictly 18+ &bull; Responsible Gambling Notice
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Betting involves financial risk. You can lose money. Only bet what you can afford to lose. Never treat betting as an income source.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-pitch-850 px-3 py-1.5 rounded-lg border border-pitch-750 text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Nigeria: GambleAlert <strong>+234 915 767 7777</strong></span>
            </div>
            <div className="bg-pitch-850 px-3 py-1.5 rounded-lg border border-pitch-750 text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>Kenya: BCLB <strong>+254 703 038 000</strong></span>
            </div>
          </div>
        </div>

        {/* Links and Site Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Platform
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('predictions')} className="hover:text-emerald-400 transition-colors">
                  Today's Predictions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('markets')} className="hover:text-emerald-400 transition-colors">
                  Betting Markets Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ladder')} className="hover:text-emerald-400 transition-colors">
                  The Ladder Ledger
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('editor-picks')} className="hover:text-emerald-400 transition-colors">
                  Editor's Best Pick
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Community &amp; Intel
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('punters')} className="hover:text-emerald-400 transition-colors">
                  Favorite Punters Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('weekend-hub')} className="hover:text-emerald-400 transition-colors">
                  Weekend Consensus Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-emerald-400 transition-colors">
                  Transparent Results Archive
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookmakers')} className="hover:text-emerald-400 transition-colors">
                  Bookmakers Guide (Bet9ja, SportyBet)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Integrity &amp; Policies
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('editorial-policy')} className="hover:text-emerald-400 transition-colors">
                  Editorial &amp; Verification Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('responsible-gambling')} className="hover:text-emerald-400 transition-colors">
                  Responsible Gambling Help
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">
                  About BRYME Predictions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  Contact &amp; Corrections Desk
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Market Regions
            </h5>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-center gap-1.5">
                <span className="text-base">🇳🇬</span> Nigeria (WAT, NGN ₦)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-base">🇰🇪</span> Kenya (EAT, KES)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-base">🇬🇭</span> Ghana (GMT, GHS)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-base">🇺🇬</span> Uganda (EAT, UGX)
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="border-t border-pitch-850 pt-6 text-[11px] text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} BRYME Predictions. Prototype built for static evaluation on GitHub Pages.
          </p>
          <p className="text-amber-400/90 font-mono text-[10px] text-center md:text-right">
            Notice: All records, punter stats, and tickets are demonstration sample data. Zero guaranteed outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}
