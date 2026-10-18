import React, { useEffect } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { ExternalLink } from 'lucide-react';

export default function AdBanner({ 
  slot = 'native', // 'native', '300x250', 'top-banner', 'affiliate'
  label = 'Sponsored Partner'
}) {
  const { adSettings } = usePredictions() || {};

  useEffect(() => {
    if (slot === 'native') {
      const scriptId = 'adsterra-native-invoke';
      if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.async = true;
        s.setAttribute('data-cfasync', 'false');
        s.src = 'https://pl31906596.profitableratecpmnetwork.com/ba5346dfe9401702b67d9eed042588a6/invoke.js';
        document.body.appendChild(s);
      }
    }
  }, [slot]);

  // If slot is 300x250 banner
  if (slot === '300x250') {
    return (
      <div className="w-full my-4 flex flex-col items-center justify-center">
        <span className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
          {label} &bull; 18+ Gamble Responsibly
        </span>
        <div className="w-[300px] h-[250px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0E1626] flex items-center justify-center shadow-lg">
          <iframe
            title="Adsterra 300x250 Banner"
            srcDoc="<!DOCTYPE html><html><head><style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:#0E1626;}</style></head><body><script>atOptions = {'key' : '11ac205462771f33be54f6bbe7b6c2b5','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};</script><script src='https://www.highrevenueformat.com/11ac205462771f33be54f6bbe7b6c2b5/invoke.js'></script></body></html>"
            width="300"
            height="250"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
          />
        </div>
      </div>
    );
  }

  // If slot is native banner
  if (slot === 'native') {
    return (
      <div className="w-full my-4 flex flex-col items-center justify-center">
        <span className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
          {label} &bull; 18+ Gamble Responsibly
        </span>
        <div className="w-full max-w-4xl min-h-[90px] rounded-2xl p-2 bg-white/40 dark:bg-[#0E1626]/80 border border-slate-200 dark:border-slate-800 flex justify-center items-center overflow-hidden">
          <div id="container-ba5346dfe9401702b67d9eed042588a6" className="w-full flex justify-center" />
        </div>
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
