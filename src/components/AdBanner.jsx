import React, { useEffect, useRef } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { Sparkles, ArrowRight, ShieldCheck, Flame, ExternalLink } from 'lucide-react';

export default function AdBanner({ 
  slot = 'in-feed', // 'top-banner', 'in-feed', 'sidebar'
  format = 'responsive',
  label = 'Sponsored Partner'
}) {
  const { adSettings } = usePredictions() || {};
  const containerRef = useRef(null);

  const customHtml = slot === 'top-banner' 
    ? adSettings?.adsterraTopBanner 
    : adSettings?.adsterraInFeedBanner;

  // If Admin has pasted a real Adsterra or Monetag script/HTML, inject it safely
  useEffect(() => {
    if (customHtml && containerRef.current) {
      containerRef.current.innerHTML = customHtml;
      // Execute any script tags inside the injected HTML
      const scripts = containerRef.current.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = document.createElement('script');
        if (scripts[i].src) {
          script.src = scripts[i].src;
        } else {
          script.text = scripts[i].text;
        }
        document.body.appendChild(script);
      }
    }
  }, [customHtml]);

  // If custom ad code is present, render container
  if (customHtml) {
    return (
      <div className="w-full my-4 flex flex-col items-center justify-center">
        <span className="text-[10px] font-mono uppercase text-slate-400 mb-1">
          {label} &bull; 18+ Gamble Responsibly
        </span>
        <div ref={containerRef} className="w-full max-w-4xl flex justify-center overflow-hidden" />
      </div>
    );
  }

  // High-converting affiliate default banner (SportyBet / 1xBet / Bet9ja)
  return (
    <div className="w-full my-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1222] via-[#141E36] to-[#0A0F1E] border border-amber-500/30 p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E41B13] to-amber-500 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-md">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                OFFICIAL SPONSOR
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                150% FIRST DEPOSIT BONUS
              </span>
            </div>
            <h4 className="font-display font-black text-sm sm:text-base text-white mt-0.5">
              Bet Today's Codes on SportyBet &amp; Bet9ja
            </h4>
            <p className="text-[11px] text-slate-400">
              Fastest withdrawals in Africa &bull; Instant cashout &bull; Code copy compatible
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <a
            href={adSettings?.sportyAffiliateUrl || 'https://www.sportybet.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#E41B13] hover:bg-rose-600 text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md flex-1 sm:flex-initial justify-center active:scale-95"
          >
            <span>Claim Bonus</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
