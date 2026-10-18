import React, { useState } from 'react';
import { BETTING_ARTICLES } from '../data/articles';
import AdBanner from '../components/AdBanner';
import { 
  BookOpen, ArrowRight, Clock, Award, Sparkles, TrendingUp, 
  ShieldCheck, Search, Tag, ExternalLink 
} from 'lucide-react';

export default function ArticlesPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Masterclasses' },
    { id: 'Arbitrage & Surebets', label: '💰 Arbitrage & Surebets' },
    { id: 'Bankroll & Rollover', label: '🪜 Rollover & Bankroll' },
    { id: 'Market Masterclass', label: '🎯 Market Masterclass' }
  ];

  const filteredArticles = BETTING_ARTICLES.filter(art => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = BETTING_ARTICLES[0]; // Arbitrage guide

  return (
    <div className="space-y-6">
      
      {/* Academy Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#101F42] to-[#080D1D] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>BRYME BETTING ACADEMY &bull; QUANTITATIVE GUIDES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
            Master Mathematical Edge &amp; Beating the Bookies
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            In-depth guides on sports arbitrage, compound rollover math, Asian handicap mechanics, and bankroll preservation engineered for serious African punters.
          </p>
        </div>
      </div>

      {/* Featured Arbitrage Article Spotlight */}
      {featuredArticle && (
        <div 
          onClick={() => onNavigate(`article/${featuredArticle.slug}`)}
          className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-white dark:from-[#0E1626] to-amber-50/20 dark:to-amber-950/20 p-5 sm:p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <span>🔥 FEATURED MASTERCLASS</span>
              <span>&bull;</span>
              <span>{featuredArticle.categoryBadge}</span>
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{featuredArticle.readTime}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
              {featuredArticle.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {featuredArticle.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-mono">
              By {featuredArticle.author}
            </span>
            <span className="font-display font-black text-amber-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Read Full Guide</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      )}

      {/* Top Banner Ad Slot */}
      <AdBanner slot="top-banner" label="Sponsored Educational Partner" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0E1626] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#162035] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(art => (
          <div
            key={art.slug}
            onClick={() => onNavigate(`article/${art.slug}`)}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 bg-white dark:bg-[#0E1626] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  {art.category}
                </span>
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.readTime}
                </span>
              </div>

              <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                {art.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans line-clamp-3">
                {art.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-400">
                {art.publishedDate}
              </span>
              <span className="font-display font-black text-cyan-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Masterclass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* In-feed Ad Banner Slot */}
      <AdBanner slot="in-feed" label="Adsterra / Monetag In-Feed Placement" />

    </div>
  );
}
