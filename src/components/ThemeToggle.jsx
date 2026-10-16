import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 ${
        isDark
          ? 'bg-[#0E172A] border-white/[0.1] text-amber-400 hover:text-amber-300 hover:bg-[#16223B]'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm'
      } ${className}`}
      title={`Switch to ${isDark ? 'White/Light' : 'Dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-display font-bold uppercase tracking-wider">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
