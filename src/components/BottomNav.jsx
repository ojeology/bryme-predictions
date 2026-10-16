import React from 'react';
import { Home, Flame, Layers, Trophy, CheckSquare } from 'lucide-react';

export default function BottomNav({ currentRoute, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'predictions', label: 'Predictions', icon: Flame },
    { id: 'ladder', label: 'Ladder', icon: Trophy, hasPulse: true },
    { id: 'markets', label: 'Markets', icon: Layers },
    { id: 'results', label: 'Results', icon: CheckSquare }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#050A14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#182847] md:hidden pb-[env(safe-area-inset-bottom)] shadow-lg transition-colors">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                {item.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-display uppercase tracking-wider ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
