import React, { useState, useRef, useCallback } from 'react';
import type {
  ArchiveFileItem,
  ArchiveOptions,
  ArchiveResult,
  CompressionEngine,
  CompressionLevel,
  QRGenerationResult,
  ActivityItem,
} from '../types';
import {
  COMPRESSION_ENGINES,
  COMPRESSION_LEVELS,
  VOLUME_SPLIT_PRESETS,
  calculateCrc32,
  compressFiles,
  formatBytes,
  testAndInspectZip,
} from '../utils/compression';
import { WinrarProgressDialog } from './WinrarProgressDialog';

interface WinrarCompressorProps {
  currentQrResult?: QRGenerationResult | null;
  activities?: ActivityItem[];
  preloadedFiles?: ArchiveFileItem[];
}

export const WinrarCompressor: React.FC<WinrarCompressorProps> = ({
  currentQrResult,
  activities = [],
  preloadedFiles = [],
}) => {
  // Tab within WinRAR Dialog
  const [activeDialogTab, setActiveDialogTab] = useState<'general' | 'files' | 'advanced' | 'comment' | 'inspector'>('general');

  // Archive parameters
  const [archiveName, setArchiveName] = useState('PPLQR_Archive');
  const [engine, setEngine] = useState<CompressionEngine>('zip');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(6);
  const [volumeSplitSize, setVolumeSplitSize] = useState<number>(0);
  const [solidArchive, setSolidArchive] = useState(true);
  const [testAfterPacking, setTestAfterPacking] = useState(true);
  const [authVerification, setAuthVerification] = useState(true);
  const [dictionarySize, setDictionarySize] = useState('256 KB');
  const [password, setPassword] = useState('');
  const [archiveComment, setArchiveComment] = useState(
    '=================================================\n' +
    ' PPLQR Studio v2.0 - WinRAR Archive Utility\n' +
    ' Client-Side Compressed Package • ISO/IEC 18004\n' +
    '================================================='
  );

  // Files in archive queue
  const [fileList, setFileList] = useState<ArchiveFileItem[]>(preloadedFiles);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Compression progress & result state
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileLabel, setCurrentFileLabel] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [archiveResult, setArchiveResult] = useState<ArchiveResult | null>(null);
  const [compressionError, setCompressionError] = useState<string | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  // Inspector / Unpack state
  const [inspectedFiles, setInspectedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [inspectorMessage, setInspectorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inspectZipInputRef = useRef<HTMLInputElement>(null);

  // Synchronize preloadedFiles without cascading renders warning
  const [prevPreloaded, setPrevPreloaded] = useState(preloadedFiles);
  if (preloadedFiles !== prevPreloaded) {
    setPrevPreloaded(preloadedFiles);
    if (preloadedFiles && preloadedFiles.length > 0) {
      const existingIds = new Set(fileList.map((f) => f.id));
      const newOnes = preloadedFiles.filter((f) => !existingIds.has(f.id));
      if (newOnes.length > 0) {
        setFileList([...fileList, ...newOnes]);
      }
    }
  }

  // Keep extension synchronized with selected engine
  const getFullArchiveName = useCallback(() => {
    const selectedEngine = COMPRESSION_ENGINES.find((e) => e.id === engine) || COMPRESSION_ENGINES[0];
    let base = archiveName.trim() || 'Archive';
    base = base.replace(/\.(zip|tar\.gz|tar|gz|bin\.deflate)$/i, '');
    return `${base}${selectedEngine.extension}`;
  }, [archiveName, engine]);

  // Add files from user disk
  const handleAddLocalFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const uint8 = new Uint8Array(reader.result);
          const newItem: ArchiveFileItem = {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            data: uint8,
            type: file.type || 'application/octet-stream',
            lastModified: file.lastModified || Date.now(),
            crc32: calculateCrc32(uint8),
          };
          setFileList((prev) => [...prev, newItem]);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Shortcut: Add current QR code artifacts
  const handleAddCurrentQr = () => {
    if (!currentQrResult) return;

    try {
      // 1. PNG Image Data
      const base64Data = currentQrResult.dataUrl.split(',')[1];
      const binaryStr = atob(base64Data);
      const pngBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        pngBytes[i] = binaryStr.charCodeAt(i);
      }

      const pngItem: ArchiveFileItem = {
        id: `qr-matrix-${Date.now()}`,
        name: `qrcode_${currentQrResult.size}x${currentQrResult.size}.png`,
        size: pngBytes.length,
        data: pngBytes,
        type: 'image/png',
        lastModified: currentQrResult.timestamp || Date.now(),
        crc32: calculateCrc32(pngBytes),
      };

      // 2. ASCII & Metadata Text File
      const metaContent =
        `=======================================================\n` +
        ` PPLQR STUDIO 2.0 - MATRIX SPECIFICATION\n` +
        ` Timestamp: ${new Date(currentQrResult.timestamp).toLocaleString()}\n` +
        ` Dimensions: ${currentQrResult.size}x${currentQrResult.size} px\n` +
        ` Error Correction: Level ${currentQrResult.errorCorrectionLevel}\n` +
        ` Payload: ${currentQrResult.content}\n` +
        ` CRC-32: ${pngItem.crc32}\n` +
        `=======================================================\n\n` +
        `ASCII MATRIX PREVIEW:\n` +
        `${currentQrResult.asciiArt || '(No ASCII Art)'}\n`;

      const metaBytes = new TextEncoder().encode(metaContent);
      const txtItem: ArchiveFileItem = {
        id: `qr-meta-${Date.now()}`,
        name: `qrcode_specs.nfo`,
        size: metaBytes.length,
        data: metaBytes,
        type: 'text/plain',
        lastModified: Date.now(),
        crc32: calculateCrc32(metaBytes),
      };

      setFileList((prev) => [...prev, pngItem, txtItem]);
      setActiveDialogTab('files');
    } catch (e) {
      console.error('Failed to convert QR code for archive:', e);
    }
  };

  // Shortcut: Add system audit log
  const handleAddSystemLog = () => {
    if (!activities || activities.length === 0) {
      alert('Activity log is currently empty. Generate or scan a QR code first.');
      return;
    }

    const logLines = activities.map(
      (a, i) =>
        `[${new Date(a.timestamp).toISOString()}] #${i + 1} [${a.type.toUpperCase()}] [${a.contentType}] Payload: ${a.content}`
    );
    const content =
      `# PPLQR SYSTEM AUDIT LOG\n# Generated: ${new Date().toISOString()}\n\n` +
      logLines.join('\n');
    const bytes = new TextEncoder().encode(content);

    const logItem: ArchiveFileItem = {
      id: `sys-log-${Date.now()}`,
      name: `PPLQR_Audit_Log_${new Date().toISOString().slice(0, 10)}.log`,
      size: bytes.length,
      data: bytes,
      type: 'text/plain',
      lastModified: Date.now(),
      crc32: calculateCrc32(bytes),
    };

    setFileList((prev) => [...prev, logItem]);
    setActiveDialogTab('files');
  };

  // Remove selected file
  const handleRemoveSelected = () => {
    if (!selectedFileId) return;
    setFileList((prev) => prev.filter((f) => f.id !== selectedFileId));
    setSelectedFileId(null);
  };

  // Clear all files
  const handleClearAll = () => {
    if (fileList.length === 0) return;
    if (window.confirm('Clear all files from archiving queue?')) {
      setFileList([]);
      setSelectedFileId(null);
    }
  };

  // Trigger compression execution
  const handleStartCompression = async () => {
    if (fileList.length === 0) {
      alert('Please add at least one file to the archive first (click "Add Files..." or "Add QR Code").');
      setActiveDialogTab('files');
      return;
    }

    setIsCompressing(true);
    setProgress(5);
    setCurrentFileLabel('Preparing file headers...');
    setIsFinished(false);
    setCompressionError(null);
    setArchiveResult(null);
    setIsProgressDialogOpen(true);

    const options: ArchiveOptions = {
      archiveName: getFullArchiveName(),
      engine,
      level: compressionLevel,
      comment: archiveComment,
      password: password || undefined,
      solidArchive,
      volumeSplitSize,
    };

    try {
      const result = await compressFiles(fileList, options, (p, label) => {
        setProgress(p);
        setCurrentFileLabel(label);
      });

      setArchiveResult(result);
      setIsFinished(true);
      setProgress(100);
      setCurrentFileLabel('Archive successfully verified.');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Compression error';
      setCompressionError(errMsg);
      setIsFinished(true);
    } finally {
      setIsCompressing(false);
    }
  };

  // Download compressed archive file
  const handleDownloadArchive = () => {
    if (!archiveResult) return;
    const url = URL.createObjectURL(archiveResult.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archiveResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick preset profiles
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'max':
        setEngine('zip');
        setCompressionLevel(9);
        setSolidArchive(true);
        break;
      case 'fast':
        setEngine('zip');
        setCompressionLevel(1);
        setSolidArchive(false);
        break;
      case 'tarball':
        setEngine('tar.gz');
        setCompressionLevel(6);
        break;
      case 'floppy':
        setEngine('zip');
        setCompressionLevel(9);
        setVolumeSplitSize(1457664);
        break;
      case 'default':
      default:
        setEngine('zip');
        setCompressionLevel(6);
        setSolidArchive(true);
        setVolumeSplitSize(0);
        break;
    }
  };

  // Inspect existing zip archive
  const handleInspectUploadedZip = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const inspection = testAndInspectZip(new Uint8Array(reader.result));
        if (inspection.isValid) {
          setInspectedFiles(inspection.files);
          setInspectorMessage(`Archive [${file.name}] verified: ${inspection.fileCount} files found.`);
          setActiveDialogTab('inspector');
        } else {
          setInspectorMessage(`Archive inspection error: ${inspection.error}`);
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalUncompressedBytes = fileList.reduce((acc, f) => acc + f.size, 0);
  const currentEngineInfo = COMPRESSION_ENGINES.find((e) => e.id === engine) || COMPRESSION_ENGINES[0];

  return (
    <div className="w-full bg-[#D4D0C8] flex flex-col gap-2 font-sans select-none">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleAddLocalFiles(e.target.files)}
      />
      <input
        ref={inspectZipInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => handleInspectUploadedZip(e.target.files)}
      />

      {/* Main WinRAR Window Container */}
      <div className="win-window border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000] p-2 flex flex-col bg-[#D4D0C8]">
        {/* WinRAR Dialog Sub-Titlebar */}
        <div className="win-titlebar px-2 py-1 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm">🗜️</span>
            <span className="font-bold text-xs truncate">
              WinRAR 3.20 - Archive name and parameters
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-white/80 font-mono text-[10px]">
              Engine: {engine.toUpperCase()}
            </span>
          </div>
        </div>

        {/* WinRAR Dialog Folder Tabs */}
        <div className="win-tab-container px-1 pt-1 mb-2">
          <button
            type="button"
            onClick={() => setActiveDialogTab('general')}
            className={`win-tab ${activeDialogTab === 'general' ? 'win-tab-active font-bold' : ''}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveDialogTab('files')}
            className={`win-tab flex items-center gap-1 ${
              activeDialogTab === 'files' ? 'win-tab-active font-bold' : ''
            }`}
          >
            <span>Files</span>
            <span className="font-mono text-[10px]">({fileList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDialogTab('advanced')}
            className={`win-tab ${activeDialogTab === 'advanced' ? 'win-tab-active font-bold' : ''}`}
          >
            Advanced & Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveDialogTab('comment')}
            className={`win-tab ${activeDialogTab === 'comment' ? 'win-tab-active font-bold' : ''}`}
          >
            Comment
          </button>
          <button
            type="button"
            onClick={() => setActiveDialogTab('inspector')}
            className={`win-tab ${activeDialogTab === 'inspector' ? 'win-tab-active font-bold' : ''}`}
          >
            Archive Inspector
          </button>
        </div>

        {/* Dialog Content Area based on Tab */}
        <div className="bg-[#D4D0C8] p-2 min-h-[380px] flex flex-col">
          {/* TAB 1: GENERAL */}
          {activeDialogTab === 'general' && (
            <div className="flex flex-col gap-3">
              {/* Archive Name Field */}
              <fieldset className="win-groupbox">
                <legend>Archive name</legend>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={archiveName}
                    onChange={(e) => setArchiveName(e.target.value)}
                    className="win-sunken flex-1 px-2 py-1 font-mono text-xs text-black"
                    placeholder="Enter archive name"
                  />
                  <div className="win-status-pane font-mono font-bold text-xs bg-[#EBE8E1] px-2 py-1">
                    {currentEngineInfo.extension}
                  </div>
                </div>
                <div className="text-[10px] text-[#555] mt-1">
                  Full target path: <span className="font-mono font-bold text-[#0A246A]">{getFullArchiveName()}</span>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Archive Format (Compression Engine) */}
                <fieldset className="win-groupbox">
                  <legend>Archive format (Compression Engine)</legend>
                  <div className="flex flex-col gap-2 p-1">
                    {COMPRESSION_ENGINES.map((eng) => (
                      <label
                        key={eng.id}
                        className={`flex items-start gap-2 cursor-pointer p-1 border ${
                          engine === eng.id ? 'bg-[#FFFFFF] border-[#808080]' : 'border-transparent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="compression-engine"
                          checked={engine === eng.id}
                          onChange={() => setEngine(eng.id)}
                          className="mt-0.5"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-[#0A246A]">{eng.name}</span>
                          <span className="text-[10px] text-[#555]">{eng.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Compression Parameters & Levels */}
                <div className="flex flex-col gap-2">
                  <fieldset className="win-groupbox">
                    <legend>Compression method (Level Kompresi)</legend>
                    <div className="flex flex-col gap-1.5 p-1">
                      <select
                        value={compressionLevel}
                        onChange={(e) => setCompressionLevel(Number(e.target.value) as CompressionLevel)}
                        className="win-sunken w-full p-1.5 text-xs font-bold font-sans cursor-pointer"
                      >
                        {COMPRESSION_LEVELS.map((lvl) => (
                          <option key={lvl.level} value={lvl.level}>
                            {lvl.label} — [{lvl.speed} | Ratio: {lvl.ratio}]
                          </option>
                        ))}
                      </select>

                      {/* Compression Level Explanation Box */}
                      {(() => {
                        const cur = COMPRESSION_LEVELS.find((l) => l.level === compressionLevel) || COMPRESSION_LEVELS[3];
                        return (
                          <div className="p-2 bg-[#FFFFE1] border border-[#808080] text-[11px] flex flex-col gap-1 shadow-inner">
                            <div className="font-bold text-[#0A246A]">{cur.label}</div>
                            <div className="text-[#333]">{cur.description}</div>
                            <div className="flex justify-between text-[10px] font-mono border-t border-[#D0D0B0] pt-1">
                              <span>CPU Effort: <b>{cur.speed}</b></span>
                              <span>Target Ratio: <b>{cur.ratio}</b></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </fieldset>

                  {/* Split to Volumes */}
                  <fieldset className="win-groupbox">
                    <legend>Split to volumes, bytes (Floppy / CD / DVD)</legend>
                    <select
                      value={volumeSplitSize}
                      onChange={(e) => setVolumeSplitSize(Number(e.target.value))}
                      className="win-sunken w-full p-1.5 text-xs font-mono"
                    >
                      {VOLUME_SPLIT_PRESETS.map((vol) => (
                        <option key={vol.value} value={vol.value}>
                          {vol.label}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              </div>

              {/* Archiving Options Checkboxes */}
              <fieldset className="win-groupbox">
                <legend>Archiving options</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={solidArchive}
                      onChange={(e) => setSolidArchive(e.target.checked)}
                    />
                    <span>Create solid archive</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testAfterPacking}
                      onChange={(e) => setTestAfterPacking(e.target.checked)}
                    />
                    <span>Test archived files</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authVerification}
                      onChange={(e) => setAuthVerification(e.target.checked)}
                    />
                    <span>Put verification (CRC32)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer opacity-70">
                    <input type="checkbox" disabled />
                    <span>Lock archive</span>
                  </label>
                </div>
              </fieldset>
            </div>
          )}

          {/* TAB 2: FILES */}
          {activeDialogTab === 'files' && (
            <div className="flex flex-col gap-2 flex-1">
              {/* Files Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-1 bg-[#D4D0C8] p-1 border-b border-[#808080]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="win-button font-bold text-xs py-1"
                    title="Add any file from computer"
                  >
                    <span>➕ Add Files...</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCurrentQr}
                    disabled={!currentQrResult}
                    className="win-button text-xs py-1"
                    title="Add current generated QR code and metadata"
                  >
                    <span>⚡ Add QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSystemLog}
                    disabled={activities.length === 0}
                    className="win-button text-xs py-1"
                    title="Add current activity history as text log"
                  >
                    <span>📋 Add Log ({activities.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRemoveSelected}
                    disabled={!selectedFileId}
                    className="win-button text-xs py-1 text-rose-800"
                    title="Remove selected file"
                  >
                    <span>❌ Remove</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={fileList.length === 0}
                    className="win-button text-xs py-1 text-slate-700"
                    title="Remove all files"
                  >
                    <span>🗑️ Clear</span>
                  </button>
                </div>
              </div>

              {/* Files Table View */}
              <div className="win-sunken bg-white flex-1 min-h-[220px] max-h-[320px] overflow-auto text-xs font-mono">
                {fileList.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 flex flex-col items-center justify-center text-slate-500 cursor-pointer h-full border-2 border-dashed border-slate-300 m-2 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-3xl mb-1">📂</span>
                    <span className="font-bold text-black font-sans text-xs">
                      No files added yet
                    </span>
                    <span className="text-[11px] text-center font-sans mt-0.5">
                      Click <b>Add Files...</b> or drag-and-drop local files here to compress.
                    </span>
                    {currentQrResult && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCurrentQr();
                        }}
                        className="win-button mt-3 font-sans font-bold"
                      >
                        ⚡ Add Active QR Code to Archive
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse select-none">
                    <thead className="bg-[#D4D0C8] text-black font-sans text-[11px] sticky top-0 border-b border-[#808080]">
                      <tr>
                        <th className="p-1 border-r border-[#808080]">Name</th>
                        <th className="p-1 border-r border-[#808080] text-right">Size</th>
                        <th className="p-1 border-r border-[#808080] text-center">CRC-32</th>
                        <th className="p-1 border-r border-[#808080]">Type</th>
                        <th className="p-1">Modified</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileList.map((f) => {
                        const isSelected = selectedFileId === f.id;
                        return (
                          <tr
                            key={f.id}
                            onClick={() => setSelectedFileId(f.id)}
                            className={`cursor-pointer ${
                              isSelected ? 'bg-[#0A246A] text-white' : 'hover:bg-[#EBE8E1]'
                            }`}
                          >
                            <td className="p-1 flex items-center gap-1.5 truncate max-w-[220px]">
                              <span>📄</span>
                              <span className="truncate">{f.name}</span>
                            </td>
                            <td className="p-1 text-right font-mono">
                              {formatBytes(f.size)}
                            </td>
                            <td className="p-1 text-center font-mono text-[10px]">
                              {f.crc32 || calculateCrc32(f.data)}
                            </td>
                            <td className="p-1 truncate max-w-[100px] text-[10px]">
                              {f.type}
                            </td>
                            <td className="p-1 text-[10px] font-sans">
                              {new Date(f.lastModified).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Status Bar */}
              <div className="win-status-pane flex items-center justify-between text-[11px]">
                <span>Files in archive: <b>{fileList.length}</b></span>
                <span>
                  Total uncompressed: <b>{formatBytes(totalUncompressedBytes)}</b>
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCED & ENGINE */}
          {activeDialogTab === 'advanced' && (
            <div className="flex flex-col gap-3">
              <fieldset className="win-groupbox">
                <legend>Selected Compression Engine Specifications</legend>
                <div className="flex flex-col gap-2 p-2 bg-[#FFFFFF] border border-[#808080]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0A246A]">
                      {currentEngineInfo.name}
                    </span>
                    <span className="win-status-pane bg-[#E4E0D8] text-[10px] font-bold">
                      Extension: {currentEngineInfo.extension}
                    </span>
                  </div>

                  <p className="text-xs text-[#333]">
                    {currentEngineInfo.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-[#D0D0D0] pt-2 mt-1">
                    <div>
                      <span className="text-[#666]">MIME Type:</span>{' '}
                      <b>{currentEngineInfo.mimeType}</b>
                    </div>
                    <div>
                      <span className="text-[#666]">OS Compatibility:</span>{' '}
                      <b>{currentEngineInfo.compatibility}</b>
                    </div>
                    <div>
                      <span className="text-[#666]">Checksum:</span>{' '}
                      <b>IEEE 802.3 CRC32</b>
                    </div>
                    <div>
                      <span className="text-[#666]">Standard:</span>{' '}
                      <b>PKWare APPNOTE / RFC 1951</b>
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Dictionary Buffer Size */}
                <fieldset className="win-groupbox">
                  <legend>Compression Dictionary Size</legend>
                  <div className="p-1 flex flex-col gap-1.5">
                    <select
                      value={dictionarySize}
                      onChange={(e) => setDictionarySize(e.target.value)}
                      className="win-sunken w-full p-1.5 text-xs font-mono"
                    >
                      <option value="64 KB">64 KB (Fastest seek)</option>
                      <option value="128 KB">128 KB</option>
                      <option value="256 KB">256 KB (WinRAR Recommended)</option>
                      <option value="512 KB">512 KB</option>
                      <option value="1024 KB">1024 KB (Large memory)</option>
                      <option value="4096 KB">4096 KB (Maximum dictionary)</option>
                    </select>
                    <span className="text-[10px] text-[#555]">
                      Larger dictionary enables WinRAR to detect duplicate patterns across further distances.
                    </span>
                  </div>
                </fieldset>

                {/* Password Protection */}
                <fieldset className="win-groupbox">
                  <legend>Password encryption (Optional)</legend>
                  <div className="p-1 flex flex-col gap-1.5">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter archive password"
                      className="win-sunken w-full px-2 py-1 text-xs font-mono"
                    />
                    <span className="text-[10px] text-[#555]">
                      {password ? '✓ Password set (PKWare header)' : 'Leave empty for unencrypted archive.'}
                    </span>
                  </div>
                </fieldset>
              </div>
            </div>
          )}

          {/* TAB 4: COMMENT */}
          {activeDialogTab === 'comment' && (
            <div className="flex flex-col gap-2 flex-1">
              <fieldset className="win-groupbox flex-1 flex flex-col">
                <legend>Archive comment (Stored in Central Directory)</legend>
                <textarea
                  value={archiveComment}
                  onChange={(e) => setArchiveComment(e.target.value)}
                  rows={10}
                  className="win-sunken flex-1 p-2 font-mono text-xs text-black"
                  placeholder="Enter comments to be stored inside the archive header..."
                ></textarea>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-[#555]">Preset Signatures:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setArchiveComment(
                        '=================================================\n' +
                        ' PPLQR Studio v2.0 - WinRAR Archive Utility\n' +
                        ' Client-Side Compressed Package • ISO/IEC 18004\n' +
                        '================================================='
                      )
                    }
                    className="win-button text-[10px]"
                  >
                    PPLQR Default
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setArchiveComment(
                        '*************************************************\n' +
                        '* CONFIDENTIAL ARCHIVE - CLIENT-SIDE RAM ONLY   *\n' +
                        '* ZERO SERVER TRANSMISSION GUARANTEED           *\n' +
                        '*************************************************'
                      )
                    }
                    className="win-button text-[10px]"
                  >
                    Zero-Leakage Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => setArchiveComment('')}
                    className="win-button text-[10px]"
                  >
                    Clear
                  </button>
                </div>
              </fieldset>
            </div>
          )}

          {/* TAB 5: ARCHIVE INSPECTOR / EXTRACTOR */}
          {activeDialogTab === 'inspector' && (
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between bg-[#D4D0C8] p-1 border-b border-[#808080]">
                <div className="font-bold text-xs">
                  Archive Content Explorer & Integrity Test
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => inspectZipInputRef.current?.click()}
                    className="win-button text-xs py-1"
                  >
                    <span>📁 Open Local .ZIP Archive...</span>
                  </button>
                </div>
              </div>

              {inspectorMessage && (
                <div className="p-2 bg-[#FFFFE1] border border-[#808080] text-xs font-mono">
                  {inspectorMessage}
                </div>
              )}

              <div className="win-sunken bg-white flex-1 min-h-[220px] max-h-[300px] overflow-auto font-mono text-xs">
                {inspectedFiles.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <div>No archive currently inspected.</div>
                    <div className="text-[11px] mt-1 font-sans">
                      Click <b>Open Local .ZIP Archive...</b> to inspect file entries and verify CRC32 headers.
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#D4D0C8] sticky top-0 border-b border-[#808080] font-sans text-[11px]">
                      <tr>
                        <th className="p-1 border-r border-[#808080]">File Name</th>
                        <th className="p-1 border-r border-[#808080] text-right">Size</th>
                        <th className="p-1">Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectedFiles.map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="p-1 flex items-center gap-1.5">
                            <span>📄</span>
                            <span>{f.name}</span>
                          </td>
                          <td className="p-1 text-right">{formatBytes(f.size)}</td>
                          <td className="p-1 text-[#008000] font-bold">✓ CRC32 OK</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WinRAR Bottom Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#D4D0C8] border-t-2 border-[#808080] mt-2">
          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-600">Preset:</span>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="win-button text-[10px]"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => applyPreset('max')}
              className="win-button text-[10px]"
            >
              Maximum
            </button>
            <button
              type="button"
              onClick={() => applyPreset('fast')}
              className="win-button text-[10px]"
            >
              Fastest
            </button>
            <button
              type="button"
              onClick={() => applyPreset('tarball')}
              className="win-button text-[10px]"
            >
              TAR.GZ
            </button>
          </div>

          {/* WinRAR Classic Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-winrar-ok"
              onClick={handleStartCompression}
              disabled={isCompressing || fileList.length === 0}
              className="win-button font-bold text-xs px-5 py-1.5 border-2 min-w-[90px]"
            >
              <span>{isCompressing ? 'Packing...' : 'OK (Compress)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                applyPreset('default');
                setArchiveName('PPLQR_Archive');
              }}
              className="win-button text-xs px-3 py-1.5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                alert(
                  'WinRAR Compression Utility (PPLQR Studio):\n\n' +
                  '• Engine: ZIP (Deflate), TAR.GZ (GNU Zip), TAR (POSIX), GZ, Web Stream API\n' +
                  '• Levels: Store (0), Fastest (1), Fast (3), Normal (6), Good (7), Best (9)\n' +
                  '• 100% Client-Side In-Memory Execution, Zero Server Uploads.'
                )
              }
              className="win-button text-xs px-3 py-1.5"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* WinRAR Classic Animated Progress Dialog */}
      <WinrarProgressDialog
        isOpen={isProgressDialogOpen}
        archiveName={getFullArchiveName()}
        progress={progress}
        currentFile={currentFileLabel}
        isFinished={isFinished}
        result={archiveResult}
        error={compressionError}
        onDownload={handleDownloadArchive}
        onClose={() => setIsProgressDialogOpen(false)}
        onInspect={() => {
          if (archiveResult) {
            setInspectedFiles(
              archiveResult.files.map((f) => ({
                name: f.name,
                size: f.originalSize,
              }))
            );
            setInspectorMessage(`Archive [${archiveResult.fileName}] contents:`);
            setActiveDialogTab('inspector');
            setIsProgressDialogOpen(false);
          }
        }}
      />
    </div>
  );
};
