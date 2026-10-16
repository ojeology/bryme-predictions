import React, { useState } from 'react';
import { X, Copy, Check, Trash2, ArrowUpRight, DollarSign, ChevronUp } from 'lucide-react';

export default function SportyBetslipDrawer({ isOpen, onClose, selectedBets, onRemoveBet, onClearAll }) {
  const [stake, setStake] = useState(1000);
  const [currency, setCurrency] = useState('₦');
  const [copied, setCopied] = useState(false);

  // Calculate total odds multiplier
  const totalOdds = selectedBets.reduce((acc, bet) => acc * Number(bet.oddsValue || 1.50), 1).toFixed(2);
  const potentialPayout = Math.round(stake * Number(totalOdds));

  const handleShare = () => {
    const slipText = `BRYME Selections Slip (${selectedBets.length} matches @ ${totalOdds}x):\n` +
      selectedBets.map(b => `${b.match.match || (b.match.homeTeam + ' vs ' + b.match.awayTeam)}: ${b.pickKey} @ ${b.oddsValue}`).join('\n') +
      `\nPotential Return: ${currency}${potentialPayout.toLocaleString()}`;
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#131C2E] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header - Mature Midnight Navy */}
        <div className="bg-[#0B132B] dark:bg-[#070D1E] text-white p-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-display font-black text-xs">
              B
            </div>
            <span className="font-display font-black text-sm uppercase tracking-wider">
              BRYME Selections Betslip
            </span>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
              {selectedBets.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {selectedBets.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                title="Clear slip"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Betslip Selections List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-white/[0.06]">
          {selectedBets.length > 0 ? (
            selectedBets.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-slate-900 dark:text-white truncate">
                    {item.match.match || `${item.match.homeTeam} vs ${item.match.awayTeam}`}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Pick: <strong className="text-blue-600 dark:text-blue-400 font-bold">{item.pickKey}</strong> &bull; {item.match.league}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-[#1A2438] px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    {item.oddsValue}
                  </span>
                  <button 
                    onClick={() => onRemoveBet(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>Your accumulator slip is empty.</p>
              <p className="mt-1">Tap any odds box on a European or African fixture to add it!</p>
            </div>
          )}
        </div>

        {/* Payout & Stake Calculator Footer */}
        {selectedBets.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-[#0B1328] border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">Total Odds Multiplier:</span>
              <span className="text-base font-mono font-black text-blue-600 dark:text-blue-400">
                {totalOdds}x
              </span>
            </div>

            {/* Stake Input */}
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs rounded-xl p-2 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="₦">₦ (NGN)</option>
                <option value="KSh">KSh (KES)</option>
                <option value="GH₵">GH₵ (GHS)</option>
                <option value="USh">USh (UGX)</option>
                <option value="R">R (ZAR)</option>
              </select>

              <div className="relative flex-1">
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                  placeholder="Stake amount"
                  className="w-full bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Potential Return */}
            <div className="flex items-center justify-between bg-white dark:bg-[#162032] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase font-semibold">Estimated Payout:</span>
              <span className="text-lg font-display font-black text-emerald-600 dark:text-emerald-400">
                {currency}{potentialPayout.toLocaleString()}
              </span>
            </div>

            {/* Share / Copy Slip Button */}
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Slip Copied to Clipboard!' : 'Copy / Share Bet Slip'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
