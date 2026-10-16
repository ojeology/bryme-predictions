import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const normalized = (status || 'pending').toLowerCase();

  const configs = {
    won: {
      label: 'WON',
      classes: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 shadow-sm shadow-emerald-950/50',
      icon: CheckCircle2
    },
    lost: {
      label: 'LOST',
      classes: 'bg-rose-950/80 text-rose-400 border-rose-700/60 shadow-sm shadow-rose-950/50',
      icon: XCircle
    },
    void: {
      label: 'VOID',
      classes: 'bg-amber-950/80 text-amber-400 border-amber-700/60 shadow-sm shadow-amber-950/50',
      icon: AlertCircle
    },
    pending: {
      label: 'PENDING',
      classes: 'bg-sky-950/80 text-sky-400 border-sky-700/60 shadow-sm shadow-sky-950/50',
      icon: Clock
    }
  };

  const current = configs[normalized] || configs.pending;
  const Icon = current.icon;
  const sizeClasses = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.classes} ${sizeClasses} uppercase tracking-wider`}>
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
}
