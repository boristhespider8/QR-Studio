import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#D4D0C8] border-t border-[#808080] pt-1 pb-0.5 px-1 select-none">
      <div className="grid grid-cols-12 gap-1 items-center">
        {/* Pane 1: Primary Status (6 cols on md) */}
        <div className="win-status-pane col-span-12 sm:col-span-6 flex items-center gap-1.5 text-[11px] truncate">
          <span className="w-2 h-2 bg-[#00FF00] border border-black shrink-0"></span>
          <span className="font-bold text-black truncate">Status: Ready</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-700 truncate">100% Client-Side Execution</span>
        </div>

        {/* Pane 2: Host Memory Status (3 cols on md) */}
        <div className="win-status-pane hidden sm:flex col-span-3 items-center text-[10px] text-slate-700 truncate">
          <span>Host: In-Memory Device RAM</span>
        </div>

        {/* Pane 3: Engine Version & Resize Grip (3 cols on md) */}
        <div className="win-status-pane col-span-12 sm:col-span-3 flex items-center justify-between text-[10px] text-slate-700">
          <span className="truncate">ISO/IEC 18004 • WinRAR Utility</span>
          <div className="win-resize-grip shrink-0 ml-1" title="Window Resize Grip"></div>
        </div>
      </div>
    </footer>
  );
};
