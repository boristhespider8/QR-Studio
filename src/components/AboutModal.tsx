import React from 'react';
import { X, ShieldCheck, Download, Scan, Palette, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 id="about-modal-title" className="text-xl font-bold text-slate-900">
              About QR Studio
            </h2>
            <p className="text-xs text-slate-500 font-medium">Privacy-First QR Code Suite</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          <strong className="text-slate-800">QR Studio</strong> is a modern, high-performance web utility designed for generating and scanning QR codes directly within your browser. No data ever leaves your device.
        </p>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              100% Client-Side Privacy
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every QR generation and image decode is executed locally using HTML5 Canvas & Web APIs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Palette className="w-4 h-4" />
              Full Customization
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Adjust colors, margins, resolution, and standard error correction levels (L, M, Q, H).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Scan className="w-4 h-4" />
              Instant Image Scanner
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drop or upload PNG, JPG, or WEBP photos to extract links and text reliably with jsQR.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Download className="w-4 h-4" />
              Export & Clipboard
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download crisp high-res PNGs or copy QR content and results in one click.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Version 1.0.0 • No sign-up required</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
