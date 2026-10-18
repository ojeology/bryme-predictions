import React from 'react';
import { Trophy, Users, BarChart2, Zap, Menu } from 'lucide-react';

export default function BottomNav({ currentRoute, onNavigate, onOpenSidebar }) {
  const items = [
    { id: 'home', label: '18-Ladder', icon: Trophy, hasPulse: true },
    { id: 'punters', label: 'Punters', icon: Users },
    { id: 'results', label: 'Results', icon: BarChart2 },
    { id: 'convert', label: 'Convert', icon: Zap },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070D1E]/95 dark:bg-[#050A14]/95 backdrop-blur-xl border-t border-blue-900/40 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
                isActive 
                  ? 'text-[#E41B13] dark:text-rose-400 font-black' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                {item.hasPulse && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E41B13] opacity-75"></span>
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

        {/* Menu / Sidebar button on mobile */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-white transition-all"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 font-display uppercase tracking-wider font-semibold">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
