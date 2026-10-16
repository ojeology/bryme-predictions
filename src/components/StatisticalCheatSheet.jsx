import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Flame, BarChart3, CheckCircle, Award, Target } from 'lucide-react';

export default function StatisticalCheatSheet() {
  const [activeTab, setActiveTab] = useState('over15');

  const cheatSheetData = {
    over15: [
      { team: 'Bayern Munich', league: 'Bundesliga', hitRate: '100%', played: '6/6 Games', avgGoals: '3.8', status: 'Banker' },
      { team: 'Liverpool', league: 'Premier League', hitRate: '90%', played: '7/8 Games', avgGoals: '3.1', status: 'Banker' },
      { team: 'Eintracht Frankfurt', league: 'Bundesliga', hitRate: '100%', played: '6/6 Games', avgGoals: '3.5', status: 'High Trend' },
      { team: 'FC Barcelona', league: 'La Liga', hitRate: '89%', played: '8/9 Games', avgGoals: '3.4', status: 'Banker' },
      { team: 'Marseille', league: 'Ligue 1', hitRate: '86%', played: '6/7 Games', avgGoals: '3.0', status: 'High Trend' },
    ],
    fortress: [
      { team: 'Real Madrid', venue: 'Santiago Bernabéu', record: '14 Unbeaten (12W-2D)', metric: '92% Win Rate', pick: '1X Double Chance' },
      { team: 'Arsenal', venue: 'Emirates Stadium', record: '11 Unbeaten (9W-2D)', metric: '0.6 Conceded/Game', pick: '1X Double Chance' },
      { team: 'Inter Milan', venue: 'San Siro', record: '13 Unbeaten (10W-3D)', metric: '85% Win Rate', pick: '1X Double Chance' },
      { team: 'Borussia Dortmund', venue: 'Signal Iduna Park', record: '8 Straight Wins', metric: '100% Home Hit', pick: '1X Double Chance' },
    ],
    btts: [
      { fixture: 'Tottenham vs West Ham', league: 'Premier League', bttsRate: '80%', xGTotal: '3.45', forecast: 'BTTS - YES' },
      { fixture: 'Leverkusen vs Frankfurt', league: 'Bundesliga', bttsRate: '83%', xGTotal: '3.80', forecast: 'BTTS - YES' },
      { fixture: 'Montpellier vs Marseille', league: 'Ligue 1', bttsRate: '75%', xGTotal: '3.10', forecast: 'BTTS - YES' },
      { fixture: 'Roma vs Inter Milan', league: 'Serie A', bttsRate: '71%', xGTotal: '2.90', forecast: 'BTTS - YES' },
    ]
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            📊
          </div>
          <div>
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
              Mathematical Statistical Radars
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-frequency probability models inspired by leading European data engines
            </p>
          </div>
        </div>

        {/* Radar Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0E1626] p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'over15', label: 'Over 1.5 Radar' },
            { id: 'fortress', label: 'Home Fortress (1X)' },
            { id: 'btts', label: 'BTTS Trends' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Over 1.5 Radar Table */}
      {activeTab === 'over15' && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-400 pb-2 px-1">
            <span className="col-span-5 font-bold">Club / League</span>
            <span className="col-span-3 text-center">Season Hit Rate</span>
            <span className="col-span-2 text-center">Avg Goals</span>
            <span className="col-span-2 text-right">Rating</span>
          </div>

          {cheatSheetData.over15.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center py-2.5 px-1 text-xs">
              <div className="col-span-5">
                <div className="font-display font-bold text-slate-900 dark:text-white truncate">
                  {row.team}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {row.league}
                </div>
              </div>

              <div className="col-span-3 text-center">
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  {row.hitRate}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{row.played}</span>
              </div>

              <div className="col-span-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                {row.avgGoals}
              </div>

              <div className="col-span-2 text-right">
                <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Home Fortress Table */}
      {activeTab === 'fortress' && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-400 pb-2 px-1">
            <span className="col-span-5 font-bold">Club / Stadium</span>
            <span className="col-span-4 text-center">Home Unbeaten Run</span>
            <span className="col-span-3 text-right">Target Pick</span>
          </div>

          {cheatSheetData.fortress.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center py-2.5 px-1 text-xs">
              <div className="col-span-5">
                <div className="font-display font-bold text-slate-900 dark:text-white truncate">
                  {row.team}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {row.venue}
                </div>
              </div>

              <div className="col-span-4 text-center">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {row.record}
                </span>
                <span className="text-[10px] text-emerald-500 block font-mono font-bold mt-0.5">{row.metric}</span>
              </div>

              <div className="col-span-3 text-right">
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {row.pick}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BTTS Radar */}
      {activeTab === 'btts' && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="grid grid-cols-12 text-[10px] font-mono uppercase text-slate-400 pb-2 px-1">
            <span className="col-span-6 font-bold">Matchup</span>
            <span className="col-span-3 text-center">BTTS Hit Rate</span>
            <span className="col-span-3 text-right">Forecast</span>
          </div>

          {cheatSheetData.btts.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center py-2.5 px-1 text-xs">
              <div className="col-span-6">
                <div className="font-display font-bold text-slate-900 dark:text-white truncate">
                  {row.fixture}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {row.league} &bull; xG: {row.xGTotal}
                </div>
              </div>

              <div className="col-span-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                {row.bttsRate}
              </div>

              <div className="col-span-3 text-right">
                <span className="text-[10px] font-display font-black px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {row.forecast}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
