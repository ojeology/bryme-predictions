import React, { useState } from 'react';
import { BETTING_ARTICLES } from '../data/articles';
import AdBanner from '../components/AdBanner';
import { 
  ArrowLeft, Clock, Calendar, User, Share2, Check, 
  BookOpen, Sparkles, ShieldCheck, ChevronRight, Tag 
} from 'lucide-react';

export default function ArticleDetailPage({ slug, onNavigate }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const article = BETTING_ARTICLES.find(a => a.slug === slug) || BETTING_ARTICLES[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.subtitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('articles')}
        className="inline-flex items-center gap-2 text-xs font-display font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Betting Academy</span>
      </button>

      {/* Article Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0F1B3B] to-[#070D1D] border border-cyan-500/30 p-6 sm:p-9 shadow-2xl text-white space-y-4">
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            {article.category}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {article.publishedDate}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-black text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          {article.subtitle}
        </p>

        <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
              ⚡
            </div>
            <div>
              <div className="font-display font-black text-white">{article.author}</div>
              <div className="text-[11px] text-slate-400">{article.authorRole}</div>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Guide'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner Ad */}
      <AdBanner slot="top-banner" label="Partner Sponsor" />

      {/* Table of Contents & Article Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Table of Contents sidebar (desktop) */}
        {article.tableOfContents && (
          <div className="lg:col-span-1 space-y-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 sticky top-20">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                <span>Contents</span>
              </h4>
              <nav className="space-y-1.5">
                {article.tableOfContents.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-[11px] text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 py-1 transition-colors leading-tight"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={article.tableOfContents ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="rounded-3xl bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 p-6 sm:p-9 shadow-sm space-y-6">
            
            {/* HTML Article Content */}
            <div 
              className="prose dark:prose-invert prose-slate max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            {/* In-Article Adsterra Placement */}
            <AdBanner slot="300x250" label="Adsterra Sponsored 300x250" />

            {/* Tags Ribbon */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5" />
                Tags:
              </span>
              {article.tags?.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Next Masterclass Recommendation */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#0B1428] to-[#070D1D] border border-cyan-500/30 flex items-center justify-between gap-3 text-white">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  Continue Reading
                </span>
                <h4 className="font-display font-black text-sm sm:text-base text-white">
                  The 18-Step Rollover Mathematical Strategy
                </h4>
              </div>
              <button
                onClick={() => onNavigate('article/18-step-rollover-mathematical-strategy')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors flex-shrink-0"
              >
                <span>Read Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
