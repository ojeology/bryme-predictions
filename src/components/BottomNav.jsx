import React from 'react';
import { Home, Flame, Layers, Trophy, CheckSquare } from 'lucide-react';

export default function BottomNav({ currentRoute, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'predictions', label: 'Predictions', icon: Flame },
    { id: 'markets', label: 'Markets', icon: Layers },
    { id: 'ladder', label: 'Ladder', icon: Trophy, hasPulse: true },
    { id: 'results', label: 'Results', icon: CheckSquare }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-pitch-950/95 backdrop-blur-lg border-t border-pitch-800 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors relative ${
                isActive ? 'text-brand-green' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
