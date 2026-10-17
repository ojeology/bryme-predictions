import React, { useState, useEffect } from 'react';
import { 
  Trophy, Sparkles, Clock, Flame, ArrowRight, Copy, Check, Zap, Shield 
} from 'lucide-react';

export default function ChampionsLeagueBanner({ onNavigate }) {
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);

  // Countdown timer to Tuesday UCL Night (20:00 WAT)
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 14, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'sporty') {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2000);
    } else {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#060B1E] via-[#0A1638] to-[#040817] border-2 border-cyan-500/40 p-4 sm:p-6 shadow-2xl text-white">
      
      {/* Background Starball & Stadium Atmosphere Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl" />
      
      {/* Starball decorative emblem background */}
      <div className="absolute right-3 top-3 opacity-10 pointer-events-none text-8xl font-black font-display">
        ★
      </div>

      <div className="relative z-10 space-y-4">
        
        {/* Top Badges & Live Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 font-display font-black text-xs uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              ★ UEFA Champions League Launch Night
            </span>

            <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Super Tuesday Kickoff
            </span>
          </div>

          {/* Live Countdown Clock */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-cyan-500/30 self-start sm:self-auto font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-slate-300">Tuesday Kickoff in:</span>
            <span className="font-black text-cyan-300 tracking-wider">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>

        {/* Feature Headline */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
            <span>Tuesday Champions League Mega Banker (2.45x)</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
            The biggest European night of the week. Real Madrid Wembley rematch against Borussia Dortmund &amp; Arsenal hosting Shakhtar. Ready to load with 1-tap.
          </p>
        </div>

        {/* The 2 Feature Matches (Sleek Champions League Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Match 1: Real Madrid vs Dortmund */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 backdrop-blur-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 uppercase">
              <span>★ UCL Matchday 3 &bull; Santiago Bernabéu</span>
              <span>20:00 WAT</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-black text-sm sm:text-base text-white">
                Real Madrid vs Borussia Dortmund
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs border border-cyan-400/40">
                1.55x
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-slate-300">
              <span>Verified Selection:</span>
              <span className="font-bold text-amber-300">Real Madrid Win &amp; Over 1.5</span>
            </div>
          </div>

          {/* Match 2: Arsenal vs Shakhtar */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 backdrop-blur-sm transition-all space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 uppercase">
              <span>★ UCL Matchday 3 &bull; Emirates Stadium</span>
              <span>20:00 WAT</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-black text-sm sm:text-base text-white">
                Arsenal vs Shakhtar Donetsk
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-black text-xs border border-cyan-400/40">
                1.48x
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-slate-300">
              <span>Verified Selection:</span>
              <span className="font-bold text-amber-300">Arsenal Win &amp; Under 4.5</span>
            </div>
          </div>

        </div>

        {/* 1-Tap Booking Codes Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-bold text-cyan-200 uppercase tracking-wider">
              Tuesday Booking Codes:
            </span>

            {/* SportyBet */}
            <button
              onClick={() => handleCopy('BC-UCL-TUE1', 'sporty')}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
            >
              {copiedSporty ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white/80" />}
              <span>Sporty: BC-UCL-TUE1</span>
            </button>

            {/* Bet9ja */}
            <button
              onClick={() => handleCopy('B9J-UCL-TUE1', 'bet9ja')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
            >
              {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white/80" />}
              <span>Bet9ja: B9J-UCL-TUE1</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('ticket/ticket-2-odds-banker')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <span>Full UCL Tactical Breakdown &rarr;</span>
          </button>
        </div>

      </div>
    </div>
  );
}
