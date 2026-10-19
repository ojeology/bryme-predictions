import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import AdBanner from '../components/AdBanner';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { LADDER_18_STEPS } from '../components/VisibleLadder';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target, Copy, Check, 
  BarChart2, ChevronDown, ChevronUp, Layers, Lock, Eye, Shield, 
  Users, BookOpen, ExternalLink, Award, AlertCircle, Gift, DollarSign,
  Smartphone, Wallet, ArrowUpRight, Star
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { 
    whaleSlip, 
    punters, 
    ladder, 
    marketCodes, 
    triggerCopyModal, 
    adSettings 
  } = usePredictions();

  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedBookieTab, setSelectedBookieTab] = useState('sporty'); // 'sporty' | 'bet9ja' | '1xbet'
  const [activeMarketFilter, setActiveMarketFilter] = useState('all');

  const currentStep = ladder?.currentDay || 4;
  const currentPot = ladder?.currentBalance || 3375;
  const dailyOdds = ladder?.dailyOdds || 1.54;
  const targetPot = Math.round(currentPot * dailyOdds);
  const sportyLadderCode = ladder?.sportyCode || 'Q7S287';
  const footballLadderCode = ladder?.footballCode || sportyLadderCode;
  const bet9jaLadderCode = ladder?.todaysCode || 'B9J-LAD-50-D4';
  const oneXBetLadderCode = '1XB-LAD50-D4';

  // Ensure Mr banks is strictly pinned first
  const sortedPunters = (punters || []).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleCopy = (code, bookmaker = 'SportyBet', title = 'Banker Slip', odds = '') => {
    if (triggerCopyModal) {
      triggerCopyModal(code, bookmaker, title, odds);
    } else {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getBookmakerUrl = (bName) => {
    const b = (bName || '').toLowerCase();
    if (b.includes('22bet')) return adSettings?.twentyTwoBetAffiliateUrl || 'https://che.fluxbrox.com/redirect.aspx?pid=199669&bid=1488&lpid=25';
    if (b.includes('1x')) return adSettings?.oneXBetAffiliateUrl || 'https://1xbet.ng/?bf=bryme';
    if (b.includes('msport')) return adSettings?.msportAffiliateUrl || 'https://www.msport.com/?ref=bryme';
    if (b.includes('bet9ja')) return adSettings?.bet9jaAffiliateUrl || 'https://register.bet9ja.com/?promocode=bryme';
    if (b.includes('king')) return adSettings?.betkingAffiliateUrl || 'https://www.betking.com/?aff=bryme';
    return adSettings?.sportyAffiliateUrl || 'https://www.sportybet.com/ng/';
  };

  // Emerging bookmakers bonus roster
  const emergingBookmakers = [
    {
      id: '22bet',
      name: '22Bet Nigeria',
      bonus: '100% Welcome Bonus',
      maxAmount: 'Up to ₦207,500',
      badge: 'TOP WELCOME PACK',
      badgeBg: 'bg-teal-600 text-white',
      accent: 'border-teal-500/50 hover:border-teal-400',
      description: 'Massive 100% sports welcome bonus up to ₦207,500 with high European odds, deep Asian handicaps, and weekly reload bonuses.',
      promoCode: '22_BRYME',
      perk: 'Deep alternative Asian totals & fast payouts',
      url: adSettings?.twentyTwoBetAffiliateUrl || 'https://che.fluxbrox.com/redirect.aspx?pid=199669&bid=1488&lpid=25'
    },
    {
      id: '1xbet',
      name: '1xBet Nigeria',
      bonus: '300% Welcome Bonus',
      maxAmount: 'Up to ₦145,600',
      badge: 'TOP VALUE',
      badgeBg: 'bg-blue-600 text-white',
      accent: 'border-blue-500/50 hover:border-blue-400',
      description: 'Exclusive 300% first deposit bonus + highest odds payout on football corners, cards, and combo accumulators.',
      promoCode: 'BRYMEVIP',
      perk: 'Lowest 5x accumulator wagering requirement',
      url: adSettings?.oneXBetAffiliateUrl || 'https://1xbet.ng/?bf=bryme'
    },
    {
      id: 'msport',
      name: 'MSport Nigeria',
      bonus: '₦500,000 Welcome Pack',
      maxAmount: '₦500,000 Vouchers',
      badge: 'FAST CASHOUT',
      badgeBg: 'bg-amber-500 text-black',
      accent: 'border-amber-500/50 hover:border-amber-400',
      description: 'Instant Nigerian bank payouts in under 60 seconds + ₦500,000 in free betting vouchers upon registration.',
      promoCode: 'AUTO-APPLIED',
      perk: 'Fastest mobile app with super odds boosts',
      url: adSettings?.msportAffiliateUrl || 'https://www.msport.com/?ref=bryme'
    },
    {
      id: 'betking',
      name: 'BetKing',
      bonus: '₦100,000 FreeBet',
      maxAmount: '100% Risk-Free',
      badge: 'RISK-FREE',
      badgeBg: 'bg-purple-600 text-white',
      accent: 'border-purple-500/50 hover:border-purple-400',
      description: '100% money-back risk-free bet if your first ticket cuts + 300% accumulator multiplier bonus.',
      promoCode: 'KINGVIP',
      perk: 'Huge multi-match accumulator boosters',
      url: adSettings?.betkingAffiliateUrl || 'https://www.betking.com/?aff=bryme'
    },
    {
      id: 'bet9ja',
      name: 'Bet9ja',
      bonus: '100% Sportsbook Match',
      maxAmount: 'Up to ₦100,000',
      badge: 'NIGERIA #1',
      badgeBg: 'bg-[#00C250] text-black',
      accent: 'border-emerald-500/50 hover:border-emerald-400',
      description: 'The household name for Nigerian punters. Solid weekend liquidity and instant retail/online code loading.',
      promoCode: 'BET9JABRYME',
      perk: 'Over 100,000 retail shops nationwide',
      url: adSettings?.bet9jaAffiliateUrl || 'https://register.bet9ja.com/?promocode=bryme'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 1. REAL-TIME LIVE VIP RADAR MARQUEE ── */}
      <div className="bg-gradient-to-r from-[#0C1222] via-[#162035] to-[#0A0F1D] border-2 border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E41B13] text-white font-display font-black text-[11px] uppercase tracking-wider shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              LIVE WAT MIDNIGHT DROPS
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              ⚡ <strong>14,850+</strong> Punters Active Now &bull; <span className="text-[#00FF66]">86.4% Hit Rate</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-300 self-end sm:self-auto">
            <span>Rollover Target:</span>
            <span className="px-2.5 py-0.5 rounded bg-[#00FF66]/15 text-[#00FF66] font-black border border-[#00FF66]/30">
              ₦1,000,000 JACKPOT
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. HERO SECTION: THE DUAL CONVICTION FISHHOOK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* CARD A: 🪜 BRYME 18-STEP ROLLOVER CHALLENGE */}
        <div className="rounded-3xl border-2 border-[#E41B13] bg-gradient-to-b from-[#141C30] via-[#0E1626] to-[#080C17] text-white p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-[#E41B13]/25 blur-3xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E41B13] text-white font-display font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>BRYME 18-STEP ROLLOVER</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono font-black text-xs text-amber-300 border border-white/15">
                STEP {currentStep} OF 18
              </span>
            </div>

            {/* Title & Core Value Proposition */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                ₦1,000 &rarr; ₦1,000,000
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Compound daily 1.50x banker lines with 2 built-in <strong>Safe Haven Cashouts</strong> at Step 6 &amp; Step 12 to secure guaranteed profits in your bank account!
              </p>
            </div>

            {/* Pot Stats Box */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/50 border border-white/10 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Current Pot Stake</span>
                <span className="text-xl sm:text-2xl font-black text-white">₦{currentPot.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Step {currentStep} Payout</span>
                <span className="text-xl sm:text-2xl font-black text-[#00FF66]">₦{targetPot.toLocaleString()}</span>
              </div>
            </div>

            {/* Today's Selections Box */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400 uppercase">
                <span>Today's Step {currentStep} Banker Pick:</span>
                <span>Odds: {dailyOdds}x</span>
              </div>
              <div className="font-display font-black text-sm text-white">
                Ribecai Michele vs Vasami (Home Set @ 1.26) + Cecchinato vs Gaubas (Away Set @ 1.22)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Tennis Pro Circuit &bull; High-probability set-winning momentum
              </div>
            </div>

            {/* 1-Tap Booking Codes Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto scrollbar-none pb-0.5">
                <button
                  onClick={() => setSelectedBookieTab('sporty')}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap ${
                    selectedBookieTab === 'sporty' ? 'bg-[#E41B13] text-white shadow-sm' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  SportyBet
                </button>
                <button
                  onClick={() => setSelectedBookieTab('football')}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap ${
                    selectedBookieTab === 'football' ? 'bg-[#008751] text-white shadow-sm' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  Football.com
                </button>
                <button
                  onClick={() => setSelectedBookieTab('1xbet')}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap ${
                    selectedBookieTab === '1xbet' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  1xBet (300% Bonus)
                </button>
                <button
                  onClick={() => setSelectedBookieTab('bet9ja')}
                  className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap ${
                    selectedBookieTab === 'bet9ja' ? 'bg-[#00C250] text-black shadow-sm' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  Bet9ja
                </button>
              </div>

              {/* Code Display + 1-Tap Copy */}
              <div className="p-3 rounded-xl bg-black border border-white/15 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                    {selectedBookieTab === 'sporty' ? 'SportyBet' : selectedBookieTab === 'football' ? 'Football.com' : selectedBookieTab === '1xbet' ? '1xBet' : 'Bet9ja'} Code
                  </span>
                  <span className="font-mono font-black text-lg text-amber-300 tracking-wider">
                    {selectedBookieTab === 'sporty' ? sportyLadderCode : selectedBookieTab === 'football' ? footballLadderCode : selectedBookieTab === '1xbet' ? oneXBetLadderCode : bet9jaLadderCode}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const activeCode = selectedBookieTab === 'sporty' ? sportyLadderCode : selectedBookieTab === 'football' ? footballLadderCode : selectedBookieTab === '1xbet' ? oneXBetLadderCode : bet9jaLadderCode;
                      const activeBookie = selectedBookieTab === 'sporty' ? 'SportyBet' : selectedBookieTab === 'football' ? 'Football.com' : selectedBookieTab === '1xbet' ? '1xBet' : 'Bet9ja';
                      handleCopy(activeCode, activeBookie, `Rollover Step ${currentStep}`, `${dailyOdds}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-all ${
                      selectedBookieTab === 'football' ? 'bg-[#008751] hover:bg-[#007043]' : 'bg-[#E41B13] hover:bg-[#D01710]'
                    }`}
                  >
                    {copiedCode === (selectedBookieTab === 'sporty' ? sportyLadderCode : selectedBookieTab === 'football' ? footballLadderCode : selectedBookieTab === '1xbet' ? oneXBetLadderCode : bet9jaLadderCode) ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 6 Safe Haven: ₦5,695 Banked</span>
            </span>

            <button
              onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
              className="text-[#E41B13] dark:text-rose-400 font-display font-black uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              <span>Full 18-Step Board &rarr;</span>
            </button>
          </div>
        </div>

        {/* CARD B: 🐋 TODAY'S WHALE 2-ODDS SYNDICATE STAKE */}
        <div className="rounded-3xl border-2 border-emerald-500/70 bg-gradient-to-b from-[#0A2218] via-[#0E1B22] to-[#0A0D18] text-white p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>SYNDICATE BET WON &amp; PAID OUT</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-[#00FF66] font-mono font-black text-xs border border-emerald-500/40">
                100% SETTLED WIN
              </span>
            </div>

            {/* Title & Syndicate Big Numbers */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
                  ₦1,090,000 Cashed Out!
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Backed by <strong>Lagos VIP Syndicate #04</strong>. Initial ₦500,000 high-roller stake cleanly cashed <strong>+₦590,000 pure net profit</strong>!
              </p>
            </div>

            {/* Odds & Return Box */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/50 border border-emerald-500/30 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Staked by Syndicate</span>
                <span className="text-xl sm:text-2xl font-black text-white">₦500,000</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 uppercase block font-bold">Total Paid Out</span>
                <span className="text-xl sm:text-2xl font-black text-[#00FF66]">₦1,090,000</span>
              </div>
            </div>

            {/* Whale Match Selections With Verified Results */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Real Madrid vs Sevilla</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono text-[10px]">2-1 FT</span>
                  </div>
                  <div className="text-[10px] text-slate-300">Pick: Madrid Over 1.5 Team Goals</div>
                </div>
                <span className="font-mono font-black text-emerald-400 flex items-center gap-1">
                  <span>1.45x</span>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Bayern Munich vs RB Leipzig</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono text-[10px]">3-2 FT</span>
                  </div>
                  <div className="text-[10px] text-slate-300">Pick: Over 2.5 Total Goals</div>
                </div>
                <span className="font-mono font-black text-emerald-400 flex items-center gap-1">
                  <span>1.50x</span>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
            </div>

            {/* Next Whale Status */}
            <div className="p-3 rounded-xl bg-black border border-emerald-500/30 text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block mb-0.5">
                Next Whale Game Status:
              </span>
              <span className="font-display font-black text-sm text-white">
                Syndicate Compiling Next Lock &bull; Drops Before Next Matchday
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <button
              onClick={() => onNavigate('results/syndicate')}
              className="text-amber-300 hover:text-amber-200 font-mono font-bold flex items-center gap-1.5 text-xs transition-colors"
            >
              <span>📜 Check Past Syndicate Wins &amp; Loss (85.7% Win Rate) &rarr;</span>
            </button>

            <a
              href={getBookmakerUrl('1xbet')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-display font-bold flex items-center gap-1 text-xs"
            >
              <span>Get 300% Bonus on 1xBet for Next Whale</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      {/* ── 3. EXCLUSIVE EMERGING BOOKMAKERS & WELCOME BONUSES VAULT ── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
              🎁
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Top Emerging Bookmakers &amp; Free Bet Bonuses</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">
                  HIGH PAYOUTS
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have SportyBet? Register on these emerging platforms to unlock up to <strong>300% Welcome Deposit Bonuses</strong> and lower wagering conditions.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Emerging Bookmaker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {emergingBookmakers.map(bookie => (
            <div
              key={bookie.id}
              className={`rounded-2xl border-2 ${bookie.accent} bg-white dark:bg-[#0E1626] p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-xl transition-all relative overflow-hidden group`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider ${bookie.badgeBg}`}>
                    {bookie.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Promo: <strong className="text-slate-900 dark:text-white">{bookie.promoCode}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                    {bookie.name}
                  </h3>
                  <div className="text-xs font-mono font-bold text-[#E41B13] dark:text-rose-400">
                    {bookie.bonus} ({bookie.maxAmount})
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {bookie.description}
                </p>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {bookie.perk}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={bookie.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E41B13] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all group-hover:scale-[1.02]"
                >
                  <span>Claim Bonus &amp; Register</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP HOME AD SLOT (MONETIZATION - MONETAG / ADSTERRA) */}
      <AdBanner slot="top-banner" label="Sponsored Betting Partner Banner" />

      {/* ── 4. VIP PUNTERS ROSTER: FEATURING MR BANKS 📌 PINNED MASTER ── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-md">
              👑
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Official Tracked African Punters</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent tracking of Nigeria's recognized betting analysts &bull; 1-tap copy active slips
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('punters')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All 11 Punters &rarr;</span>
          </button>
        </div>

        {/* Punters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedPunters.slice(0, 6).map((punter) => {
            const isPinned = punter.pinned;
            const primaryCode = punter.dailyCodes && punter.dailyCodes[0];
            const isCopied = primaryCode && copiedCode === primaryCode.code;

            return (
              <div
                key={punter.id}
                className={`rounded-2xl border ${
                  isPinned 
                    ? 'border-2 border-amber-500 bg-gradient-to-br from-amber-500/15 via-white dark:via-[#0E1626] to-transparent shadow-xl ring-2 ring-amber-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626]'
                } p-4 flex flex-col justify-between gap-3 shadow-sm transition-all hover:border-[#E41B13]/60`}
              >
                <div>
                  {/* Header: Name, Handle, Pinned badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl ${
                        isPinned 
                          ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black shadow-md' 
                          : 'bg-gradient-to-br from-slate-900 via-[#1a2336] to-[#0A0F1D] border border-slate-700 text-white'
                      } flex items-center justify-center font-display font-black text-sm`}>
                        {isPinned ? '📌' : (punter.avatar || punter.displayName.slice(0, 2).toUpperCase())}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                            {punter.displayName}
                          </h3>
                          {isPinned && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase">
                              VIP PINNED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {punter.handle} &bull; {punter.region}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                        {punter.hitRate || '82%'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {punter.winStreak || 'Streak'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
                    {punter.specialty || punter.bio}
                  </p>
                </div>

                {/* Primary Daily Code Box */}
                {primaryCode ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#162238] font-bold uppercase text-slate-800 dark:text-slate-200">
                        {primaryCode.bookmaker}
                      </span>
                      <span className="font-bold text-amber-500">
                        {primaryCode.totalOdds}x Odds &bull; {primaryCode.gamesCount || 2} Legs
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm tracking-wider text-slate-900 dark:text-white select-all">
                        {primaryCode.code}
                      </span>

                      <button
                        onClick={() => handleCopy(primaryCode.code, primaryCode.bookmaker, `${punter.displayName}'s Slip`, primaryCode.totalOdds)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isCopied 
                            ? 'bg-[#00FF66] text-slate-950' 
                            : 'bg-[#E41B13] hover:bg-[#D01710] text-white shadow-sm'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] text-center text-xs text-slate-400 font-mono">
                    New slip dropping at 02:00 AM WAT
                  </div>
                )}

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onNavigate(`punter/${punter.id}`)}
                    className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Profile &amp; Slips</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {primaryCode && (
                    <a
                      href={getBookmakerUrl(primaryCode.bookmaker)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Load Slip</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MID-PAGE ADSTERRA 300x250 BANNER SLOT */}
      <AdBanner slot="300x250" label="Sponsored 300x250 Banner" />

      {/* ── 5. LIVE BOOKING CODES VAULT (OVER 1.5, DOUBLE CHANCE, BTTS) ── */}
      <section className="space-y-3 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                Featured High-Odds Market Slips
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready-to-load slips with odds, bookmaker, and 1-tap copy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
            {['all', 'over-15-goals', 'double-chance', 'both-teams-to-score'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveMarketFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  activeMarketFilter === cat
                    ? 'bg-[#E41B13] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All Slips' : cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Market codes list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {(marketCodes || [])
            .filter(c => activeMarketFilter === 'all' || c.marketId === activeMarketFilter)
            .map(codeItem => {
              const isCopied = copiedCode === codeItem.code;
              const bookieUrl = getBookmakerUrl(codeItem.bookmaker);

              return (
                <div
                  key={codeItem.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121B2F] flex flex-col justify-between gap-2.5 transition-all hover:border-amber-500/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-display font-black uppercase ${
                        codeItem.bookmaker === 'sportybet' ? 'bg-[#E41B13] text-white' : codeItem.bookmaker === '1xbet' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        {codeItem.bookmakerName || codeItem.bookmaker}
                      </span>
                      <span className="font-mono font-black text-amber-500 text-xs">
                        {codeItem.odds}x Odds
                      </span>
                    </div>

                    <div className="font-mono font-black text-base text-slate-900 dark:text-white tracking-wider select-all pt-1">
                      {codeItem.code}
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                      {codeItem.title || 'Market Slip'}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      {codeItem.eventsCount || 4} Legs &bull; {codeItem.dropTime || '02:00 AM WAT'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(codeItem.code, codeItem.bookmaker, codeItem.title, codeItem.odds)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        isCopied ? 'bg-[#00FF66] text-slate-950' : 'bg-[#E41B13] hover:bg-[#D01710] text-white shadow-sm'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                    </button>

                    <a
                      href={bookieUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-[#162238] hover:bg-slate-300 dark:hover:bg-[#1f2d4a] text-slate-800 dark:text-slate-200 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <span>Load</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ── 6. BETTING ACADEMY: ARBITRAGE SUREBETS BANNER ── */}
      <section className="rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-950/25 via-[#0E1626] to-[#0A0F1D] p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-md">
              📚
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-black text-[10px] uppercase tracking-wider border border-cyan-500/30">
                BRYME BETTING ACADEMY &bull; FREE GUIDE
              </span>
              <h3 className="text-base sm:text-lg font-display font-black text-white mt-1">
                Everything to Know About Arbitrage Betting (Surebets in Nigeria)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                Learn how sharp punters exploit bookmaker odds discrepancies across SportyBet, Bet9ja, and 1xBet to lock in 100% mathematically guaranteed profit regardless of match outcome.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('article/arbitrage-betting-nigeria')}
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          >
            <span>Read Arbitrage Guide</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 7. VERIFIED WIN-RATE ACCURACY ARCHIVE ── */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Verified Win Rate &amp; Performance Ledger</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs border border-emerald-500/30">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}% Win Rate
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% public transparency. No deleted tickets, real full-time scores verified.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View 13-Weekend Archive &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
            <strong className="text-lg text-emerald-500 font-black">{WEEKEND_2_ODDS_STATS.accuracyRate}%</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Won / Total</span>
            <strong className="text-lg text-blue-500 font-black">{WEEKEND_2_ODDS_STATS.won} / {WEEKEND_2_ODDS_STATS.totalWeekends}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">ROI Multiplier</span>
            <strong className="text-lg text-amber-500 font-black">{WEEKEND_2_ODDS_STATS.roiUnits}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Simulated Profit</span>
            <strong className="text-lg text-slate-900 dark:text-white font-black">+{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}</strong>
          </div>
        </div>
      </section>

      {/* BOTTOM NATIVE RECOMMENDATIONS */}
      <AdBanner slot="native" label="Recommended for You" />

    </div>
  );
}
