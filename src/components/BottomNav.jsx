import React from 'react';
import { Flame, Trophy, Lock, ClipboardList, ShieldAlert } from 'lucide-react';

export default function BottomNav({ currentRoute, onNavigate }) {
  const items = [
    { id: 'friday', label: 'Fri 3.04x', icon: Flame, hasPulse: true },
    { id: 'ladder', label: '3x Rollover', icon: Trophy, hasPulse: true },
    { id: 'vault', label: '100% Vault', icon: Lock },
    { id: 'ledger', label: '54 Ledger', icon: ClipboardList },
    { id: 'whynot', label: 'Line Rules', icon: ShieldAlert },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070D1E]/95 dark:bg-[#050A14]/95 backdrop-blur-xl border-t border-blue-900/40 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id || (currentRoute === 'home' && item.id === 'friday');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
                isActive ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                {item.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF66]"></span>
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
