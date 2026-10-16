import React, { useState, useEffect } from 'react';
import { Clock, Flame, Sparkles, Bell, Check, ShieldCheck } from 'lucide-react';

export default function MidnightDropBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(true); // Current codes are active!

  useEffect(() => {
    const calculateCountdown = () => {
      // Current time in UTC
      const now = new Date();
      // Target 02:00 UTC (which is 03:00 or 02:00 WAT depending on UTC+1)
      // Let's create the next 02:00 WAT (01:00 UTC)
      const target = new Date();
      // WAT is UTC+1. 02:00 WAT = 01:00 UTC
      target.setUTCHours(1, 0, 0, 0);

      // If already past 01:00 UTC today, target tomorrow's 01:00 UTC
      if (now.getTime() >= target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#142345] to-[#0A1020] text-white p-4 sm:p-5 border border-blue-900/40 shadow-lg relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute right-0 top-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Schedule & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-display font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              TODAY'S PICKS ARE LIVE
            </span>

            <span className="text-xs font-mono text-blue-300/90 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Drop at <strong>02:00 AM Midnight WAT</strong></span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white leading-tight">
            Daily Multi-Bookmaker Booking Codes Hub
          </h2>

          <p className="text-xs text-slate-300 max-w-xl">
            Verified tickets drop every midnight at <strong>02:00 AM WAT</strong>. Direct 1-tap copy codes for <strong>SportyBet</strong>, <strong>Bet9ja</strong>, <strong>1xBet</strong>, <strong>BetKing</strong> &amp; <strong>Betway</strong>.
          </p>
        </div>

        {/* Right: Live Countdown Clock to Next 02:00 AM Drop */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center min-w-[200px] shadow-md flex-shrink-0">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Next Drop In</span>
          </span>

          <div className="flex items-center gap-2 font-mono font-black text-xl sm:text-2xl text-white mt-1">
            <div className="flex flex-col items-center">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase text-slate-400 font-sans font-bold mt-0.5">Hours</span>
            </div>
            <span className="text-blue-400 -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase text-slate-400 font-sans font-bold mt-0.5">Mins</span>
            </div>
            <span className="text-blue-400 -mt-3">:</span>
            <div className="flex flex-col items-center">
              <span className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase text-slate-400 font-sans font-bold mt-0.5">Secs</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
