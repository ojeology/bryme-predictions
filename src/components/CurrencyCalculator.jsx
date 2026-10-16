import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

const AFRICAN_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigeria (Naira)', defaultStake: 1000 },
  { code: 'KES', symbol: 'KSh', name: 'Kenya (Shilling)', defaultStake: 100 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghana (Cedi)', defaultStake: 20 },
  { code: 'UGX', symbol: 'USh', name: 'Uganda (Shilling)', defaultStake: 5000 },
  { code: 'ZAR', symbol: 'R', name: 'South Africa (Rand)', defaultStake: 50 },
];

export default function CurrencyCalculator() {
  const [selectedCurrency, setSelectedCurrency] = useState(AFRICAN_CURRENCIES[0]);
  const [stake, setStake] = useState(selectedCurrency.defaultStake);
  const [odds, setOdds] = useState(1.50);

  const potentialReturn = Math.round(stake * odds);
  const potentialProfit = Math.max(0, potentialReturn - stake);

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    setStake(curr.defaultStake);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
              Pan-African Odds &amp; Payout Calculator
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Calculate returns in your local African currency
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
          {selectedCurrency.code}
        </span>
      </div>

      {/* Currency Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {AFRICAN_CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => handleCurrencyChange(c)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedCurrency.code === c.code
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-[#070D1A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
            }`}
          >
            {c.symbol} {c.code}
          </button>
        ))}
      </div>

      {/* Stake & Odds Inputs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 mb-1">
            Stake ({selectedCurrency.symbol})
          </label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 dark:bg-[#070D1A] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 mb-1">
            Odds (Decimal)
          </label>
          <input
            type="number"
            step="0.05"
            value={odds}
            onChange={(e) => setOdds(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-50 dark:bg-[#070D1A] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Payout Display */}
      <div className="bg-slate-50 dark:bg-[#070D1A] rounded-xl p-3 border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">
            Potential Return
          </span>
          <span className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400">
            {selectedCurrency.symbol}{potentialReturn.toLocaleString()}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">
            Net Profit
          </span>
          <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
            +{selectedCurrency.symbol}{potentialProfit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
