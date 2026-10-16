import React from 'react';

export default function AdPlaceholder({ format = 'banner', label = 'Ad Placement Slot' }) {
  return (
    <div className="w-full my-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-lg border border-dashed border-slate-700/60 bg-pitch-850/50 p-3 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-600"></span>
          <span className="font-mono uppercase tracking-wider text-[11px] text-slate-400">
            {label} (Reserved for Future Adsterra Placement)
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Clean container reserved per specification &bull; No active 3rd-party ad scripts loaded in prototype
        </p>
      </div>
    </div>
  );
}
