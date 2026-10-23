import React, { useState } from 'react';
import type { ActivityItem } from '../types';
import { copyToClipboard } from '../utils/validators';
import { downloadTextFile } from '../utils/qrGenerator';

interface RecentActivityProps {
  activities: ActivityItem[];
  onClearHistory: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onClearHistory,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const selectedItem = activities.find((a) => a.id === selectedId) || activities[0] || null;

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleExportLog = () => {
    if (activities.length === 0) return;

    const timestamp = new Date().toISOString();
    let logContent = `================================================================================\n`;
    logContent += `PPLQR STUDIO v2.0 (Build 2003) - SYSTEM ACTIVITY AUDIT LOG\n`;
    logContent += `Export Timestamp : ${timestamp}\n`;
    logContent += `Host Environment : 100% Client-Side In-Memory Execution\n`;
    logContent += `Total Records    : ${activities.length}\n`;
    logContent += `================================================================================\n\n`;

    activities.forEach((act, idx) => {
      const time = new Date(act.timestamp).toLocaleString();
      logContent += `[RECORD #${String(idx + 1).padStart(2, '0')}]\n`;
      logContent += `  ID          : ${act.id}\n`;
      logContent += `  Timestamp   : ${time}\n`;
      logContent += `  Action      : ${act.type.toUpperCase()}\n`;
      logContent += `  Type        : ${act.contentType.toUpperCase()}\n`;
      if (act.meta?.size) logContent += `  Resolution  : ${act.meta.size}x${act.meta.size}px\n`;
      if (act.meta?.errorLevel) logContent += `  ECC Level   : ${act.meta.errorLevel}\n`;
      logContent += `  Payload     : ${act.content}\n`;
      logContent += `--------------------------------------------------------------------------------\n`;
    });

    logContent += `\n[END OF PPLQR AUDIT LOG - CHECKSUM OK]\n`;

    const stamp = timestamp.replace(/[-:T.]/g, '').slice(0, 14);
    downloadTextFile(logContent, `PPLQR_AUDIT_${stamp}.LOG`, 'text/plain');
  };

  return (
    <fieldset className="win-groupbox bg-[#D4D0C8] p-3 space-y-2">
      <legend className="flex items-center gap-2">
        <span>System Activity Log</span>
        <span className="text-[10px] text-slate-600 font-normal">
          [ListView: {activities.length}/10 In-Memory Records]
        </span>
      </legend>

      {/* Confirmation Dialog for Clear */}
      {isConfirmingClear && (
        <div className="win-sunken bg-[#FFFFE1] border-2 border-[#AA0000] p-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#AA0000] font-bold">
            <span>[?] Are you sure you want to purge all recent audit logs from localStorage?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClearHistory();
                setIsConfirmingClear(false);
                setSelectedId(null);
              }}
              className="win-button font-bold text-xs px-3"
            >
              Yes, Purge
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingClear(false)}
              className="win-button text-xs px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Classic Table / ListView Well */}
      <div className="win-sunken bg-white min-h-[160px] max-h-[220px] overflow-auto border border-[#808080]">
        <table className="w-full text-left border-collapse text-[11px] font-sans">
          <thead className="bg-[#D4D0C8] sticky top-0 border-b border-[#808080] select-none text-[10px]">
            <tr>
              <th className="win-raised p-1 w-8 text-center font-bold">#</th>
              <th className="win-raised p-1 w-32 font-bold">Timestamp</th>
              <th className="win-raised p-1 w-24 font-bold">Operation</th>
              <th className="win-raised p-1 w-20 font-bold">Format</th>
              <th className="win-raised p-1 font-bold">Payload Buffer</th>
              <th className="win-raised p-1 w-16 text-center font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-slate-400 font-sans text-xs">
                  [ System Activity Log Buffer is Empty ]
                </td>
              </tr>
            ) : (
              activities.map((act, idx) => {
                const isSelected = selectedId === act.id || (!selectedId && idx === 0);
                return (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedId(act.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0A246A] text-white'
                        : 'hover:bg-[#EFECE6] text-black'
                    }`}
                  >
                    <td className="p-1 text-center font-sans text-[10px]">{idx + 1}</td>
                    <td className="p-1 truncate text-[10px]">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-1 font-sans font-bold text-[10px]">
                      {act.type === 'generated' ? '⚡ GENERATE' : '🔍 SCAN'}
                    </td>
                    <td className="p-1 font-sans text-[10px]">
                      {act.contentType.toUpperCase()}
                    </td>
                    <td className="p-1 truncate max-w-[280px] text-[10px]">
                      {act.content}
                    </td>
                    <td className="p-1 text-center font-sans">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(act.id, act.content);
                        }}
                        className={`win-button text-[9px] px-1.5 py-0.5 ${
                          copiedId === act.id ? 'win-button-pressed font-bold' : ''
                        }`}
                        title="Copy payload to clipboard"
                      >
                        {copiedId === act.id ? '✓' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Item Detail Inspector Strip */}
      {selectedItem && (
        <div className="win-sunken bg-[#EFECE6] p-2 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-[#808080]">
          <div className="truncate w-full">
            <span className="font-bold text-[#0A246A] mr-2">[SELECTED RECORD]:</span>
            <span className="text-black select-all">{selectedItem.content}</span>
          </div>
          <div className="shrink-0 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCopy(selectedItem.id, selectedItem.content)}
              className="win-button text-[10px]"
            >
              📋 Copy Payload
            </button>
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleExportLog}
          disabled={activities.length === 0}
          className="win-button text-xs font-bold"
          title="Download text audit log file"
        >
          📄 Export .LOG
        </button>

        {activities.length > 0 && !isConfirmingClear && (
          <button
            type="button"
            id="btn-clear-history"
            onClick={() => setIsConfirmingClear(true)}
            className="win-button text-xs text-[#AA0000]"
          >
            ✕ Purge Log...
          </button>
        )}
      </div>
    </fieldset>
  );
};
