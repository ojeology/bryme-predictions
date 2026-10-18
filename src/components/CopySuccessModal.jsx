import React from 'react';
import { Check, Copy, ExternalLink, Share2, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function CopySuccessModal({ isOpen, onClose, code, bookmaker, title, odds }) {
  if (!isOpen || !code) return null;

  const bookieName = bookmaker?.toLowerCase().includes('sporty') 
    ? 'SportyBet' 
    : bookmaker?.toLowerCase().includes('bet9ja') 
    ? 'Bet9ja' 
    : bookmaker || 'Bookmaker';

  const bookieUrl = bookmaker?.toLowerCase().includes('sporty')
    ? 'https://www.sportybet.com/ng/'
    : bookmaker?.toLowerCase().includes('bet9ja')
    ? 'https://sports.bet9ja.com/'
    : 'https://1xbet.ng/';

  const shareText = `🔥 BRYME PREDICTIONS: Verified ${bookieName} Code Dropped!
🎟️ Booking Code: ${code}
🎯 Target Odds: ${odds ? odds + 'x' : '1.50x Banker'}
👉 Open full ladder & daily codes: https://predictions.thebryme.com`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://predictions.thebryme.com')}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0E1626] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 text-white shadow-2xl z-10 space-y-4 overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-md">
            ✓
          </span>
          <div>
            <h3 className="font-display font-black text-lg text-white">
              Booking Code Copied!
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Ready to paste in your {bookieName} app
            </p>
          </div>
        </div>

        {/* Big Monospace Code Display */}
        <div className="p-4 rounded-2xl bg-black/70 border border-white/15 text-center space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
            {bookieName} Active Slip
          </span>
          <div className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-[#00FF66] select-all">
            {code}
          </div>
          {odds && (
            <span className="text-xs font-mono text-amber-300 font-bold block">
              Total Odds: {odds}x
            </span>
          )}
        </div>

        {/* Action Buttons: Open Bookie & WhatsApp Share */}
        <div className="space-y-2 pt-1">
          <a
            href={bookieUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E41B13] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Load Slip on {bookieName} App</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>📲 Share Slip to WhatsApp Status</span>
          </button>
        </div>

        {/* HIGH VALUE AD / AFFILIATE SPONSOR SLOT */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border border-amber-500/30 text-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase">
            <span>Sponsored Bonus</span>
            <span>Verified 18+</span>
          </div>
          <p className="text-[11px] text-slate-300">
            New to {bookieName}? Get up to <strong>300% Welcome Deposit Bonus</strong> on your first stake.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors text-center"
        >
          Close &bull; Continue Browsing
        </button>

      </div>
    </div>
  );
}
