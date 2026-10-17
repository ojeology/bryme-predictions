import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Phone } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', category: 'Correction', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
          Contact &amp; Corrections Desk
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Report an outcome error, suggest a market, or reach our editorial team in Lagos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Editorial Desk</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">editorial@bryme-predictions.com</p>
          <span className="text-[10px] text-slate-500">Response within 2 hours</span>
        </div>
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Location</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">Lagos, Nigeria</p>
          <span className="text-[10px] text-slate-500">West Africa Time (WAT)</span>
        </div>
        <div className="bg-white dark:bg-[#0E1626] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Punter Submissions</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">punters@bryme-predictions.com</p>
          <span className="text-[10px] text-slate-500">Public attribution requests</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Feedback Received</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Thank you for contributing to BRYME transparency. Our verification desk will review your submission promptly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', category: 'Correction', message: '' }); }}
              className="px-4 py-2 bg-slate-100 dark:bg-[#162238] text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Tunde or Kiprono"
                  className="w-full bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Inquiry Type</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="Correction">Result or Booking Code Correction</option>
                <option value="PunterSuggestion">Suggest a Punter to Track</option>
                <option value="LadderInquiry">Ladder Challenge Ledger Question</option>
                <option value="Partnership">Responsible Gambling Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Message Details</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Include ticket ID, match details, or corrected code..."
                className="w-full bg-slate-50 dark:bg-[#162035] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Editorial Desk</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
