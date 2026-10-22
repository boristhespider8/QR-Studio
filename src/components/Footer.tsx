import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-24 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & description */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <QrCode className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              QR Studio
            </span>
            <p className="text-xs text-slate-500">
              Built for simple and secure QR workflows.
            </p>
          </div>
        </div>

        {/* Security & Client-side assurance badge */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero Server Uploads
          </span>
          <span className="text-slate-400">•</span>
          <span>© {currentYear} QR Studio</span>
        </div>
      </div>
    </footer>
  );
};
