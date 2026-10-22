import React, { useState } from 'react';
import {
  History,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Scan,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { ActivityItem } from '../types';
import { copyToClipboard, isSafeHttpUrl } from '../utils/validators';

interface RecentActivityProps {
  activities: ActivityItem[];
  onClearHistory: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' • ' +
        date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            {activities.length}/10
          </span>
        </div>

        {activities.length > 0 && !isConfirmingClear && (
          <button
            id="btn-clear-history"
            type="button"
            onClick={() => setIsConfirmingClear(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Confirmation Banner for Clear History */}
      {isConfirmingClear && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Are you sure you want to clear all recent activity?</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsConfirmingClear(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-clear-history"
              type="button"
              onClick={() => {
                onClearHistory();
                setIsConfirmingClear(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      )}

      {/* List of items or Empty State */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50 stroke-[1.5]" />
          <p className="text-xs font-semibold text-slate-600">No recent activity yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Generated and scanned QR codes will appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activities.map((item) => {
            const isUrl = isSafeHttpUrl(item.content);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 group transition-colors hover:bg-slate-50/50 -mx-2 px-2 rounded-xl"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Badge Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'generated'
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {item.type === 'generated' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Scan className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content & Timestamp */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          item.type === 'generated'
                            ? 'bg-indigo-100/70 text-indigo-700'
                            : 'bg-emerald-100/70 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>

                    <p
                      className="text-xs font-mono text-slate-800 truncate"
                      title={item.content}
                    >
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isUrl && (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.content)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Copy content to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
