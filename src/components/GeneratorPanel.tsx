import React, { useState } from 'react';
import type {
  ErrorCorrectionLevel,
  QRSize,
  ActivityItem,
  TemplateType,
  QRGenerationResult,
} from '../types';
import { useQRGenerator } from '../hooks/useQRGenerator';
import { QRPreview } from './QRPreview';
import { normalizeUrl } from '../utils/validators';

interface GeneratorPanelProps {
  onActivityAdded: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  onArchiveWithWinrar?: (result: QRGenerationResult) => void;
}

// Retro CRT & Win2K Color Presets
const FG_PRESETS = [
  { name: 'Classic Black', hex: '#000000' },
  { name: 'Terminal Green', hex: '#00FF00' },
  { name: 'Amber CRT', hex: '#FFB000' },
  { name: 'BSOD Blue', hex: '#0000AA' },
  { name: 'Classic Maroon', hex: '#800000' },
  { name: 'Dark Navy', hex: '#000080' },
];

const BG_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Win2K Grey', hex: '#D4D0C8' },
  { name: 'LCD Olive', hex: '#C4CCA8' },
  { name: 'Night Black', hex: '#001100' },
];

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({
  onActivityAdded,
  onArchiveWithWinrar,
}) => {
  const {
    options,
    result,
    error,
    isGenerating,
    copyFeedback,
    imageCopyFeedback,
    asciiCopyFeedback,
    setContent,
    setType,
    setTemplate,
    setForegroundColor,
    setBackgroundColor,
    setSize,
    setErrorCorrectionLevel,
    setMargin,
    resetSettings,
    handleExplicitGenerate,
    handleDownloadPng,
    handleDownloadSvg,
    handleDownloadAscii,
    handleCopyContent,
    handleCopyImage,
    handleCopyAscii,
  } = useQRGenerator({ onActivityAdded });

  const [activeTemplate, setActiveTemplateState] = useState<TemplateType>('url');
  const [showNormalizationHint, setShowNormalizationHint] = useState<boolean>(false);

  // Structured Builder States
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  const handleTemplateChange = (template: TemplateType) => {
    setActiveTemplateState(template);
    setTemplate(template);

    if (template === 'url') {
      setType('url');
      setContent('https://example.com');
    } else if (template === 'custom') {
      setType('text');
      setContent('Hello, World! Authentic 2000s QR Utility.');
    } else if (template === 'wifi') {
      setType('text');
      const payload = `WIFI:T:${wifiAuth};S:${wifiSsid || 'MyNetwork'};P:${wifiPassword || 'secret123'};;`;
      setContent(payload);
    } else if (template === 'vcard') {
      setType('text');
      const payload = `BEGIN:VCARD\nVERSION:2.1\nN:${vcardName || 'Doe;John'}\nFN:${vcardName || 'John Doe'}\nTEL;CELL:${vcardPhone || '+628123456789'}\nEMAIL:${vcardEmail || 'user@domain.com'}\nEND:VCARD`;
      setContent(payload);
    }
  };

  const updateWifi = (ssid: string, pass: string, auth: 'WPA' | 'WEP' | 'nopass') => {
    setWifiSsid(ssid);
    setWifiPassword(pass);
    setWifiAuth(auth);
    setContent(`WIFI:T:${auth};S:${ssid};P:${pass};;`);
  };

  const updateVcard = (name: string, phone: string, email: string) => {
    setVcardName(name);
    setVcardPhone(phone);
    setVcardEmail(email);
    setContent(`BEGIN:VCARD\nVERSION:2.1\nN:${name}\nFN:${name}\nTEL;CELL:${phone}\nEMAIL:${email}\nEND:VCARD`);
  };

  const handleUrlChange = (value: string) => {
    setContent(value);
    if (
      value.trim() &&
      !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value.trim()) &&
      /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(value.trim())
    ) {
      setShowNormalizationHint(true);
    } else {
      setShowNormalizationHint(false);
    }
  };

  const applyNormalizedUrl = () => {
    const normalized = normalizeUrl(options.content);
    setContent(normalized);
    setShowNormalizationHint(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start p-1">
      {/* Left Column: Property Sheets & Controls (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-2">
        {/* GroupBox 1: Data Source & Payload */}
        <fieldset className="win-groupbox bg-[#D4D0C8]">
          <legend>Data Source &amp; Payload Specification</legend>

          {/* Template Selection Dropdown */}
          <div className="flex items-center gap-2 mb-2 text-xs">
            <label htmlFor="select-template" className="font-bold shrink-0">
              Payload Template:
            </label>
            <select
              id="select-template"
              value={activeTemplate}
              onChange={(e) => handleTemplateChange(e.target.value as TemplateType)}
              className="win-sunken bg-white px-2 py-1 text-xs font-sans w-full cursor-pointer"
            >
              <option value="url">Website URL (http:// or https://)</option>
              <option value="custom">Plain Text / Raw ASCII String</option>
              <option value="wifi">Wi-Fi Access Point Configuration</option>
              <option value="vcard">vCard 2.1 Electronic Contact</option>
            </select>
          </div>

          {/* Wi-Fi Wizard Fields */}
          {activeTemplate === 'wifi' && (
            <div className="win-sunken bg-[#EFECE6] p-2 mb-2 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">SSID:</span>
                <input
                  type="text"
                  placeholder="Network Name"
                  value={wifiSsid}
                  onChange={(e) => updateWifi(e.target.value, wifiPassword, wifiAuth)}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">Password:</span>
                <input
                  type="text"
                  placeholder="Network Password"
                  value={wifiPassword}
                  onChange={(e) => updateWifi(wifiSsid, e.target.value, wifiAuth)}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs w-full font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">Auth:</span>
                <select
                  value={wifiAuth}
                  onChange={(e) => updateWifi(wifiSsid, wifiPassword, e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs"
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Encryption</option>
                </select>
              </div>
            </div>
          )}

          {/* vCard Wizard Fields */}
          {activeTemplate === 'vcard' && (
            <div className="win-sunken bg-[#EFECE6] p-2 mb-2 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">Full Name:</span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={vcardName}
                  onChange={(e) => updateVcard(e.target.value, vcardPhone, vcardEmail)}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">Phone:</span>
                <input
                  type="text"
                  placeholder="e.g. +628123456789"
                  value={vcardPhone}
                  onChange={(e) => updateVcard(vcardName, e.target.value, vcardEmail)}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 font-bold">Email:</span>
                <input
                  type="text"
                  placeholder="e.g. user@domain.com"
                  value={vcardEmail}
                  onChange={(e) => updateVcard(vcardName, vcardPhone, e.target.value)}
                  className="win-sunken bg-white px-1.5 py-0.5 text-xs w-full"
                />
              </div>
            </div>
          )}

          {/* Main Buffer Textarea / Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-700">
              <span>Raw Payload Buffer:</span>
              <span className="font-mono">{options.content.length} bytes</span>
            </div>

            {options.type === 'url' && activeTemplate === 'url' ? (
              <input
                id="generator-content-input"
                type="text"
                value={options.content}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="win-sunken w-full px-2 py-1 text-xs font-mono bg-white text-black focus:outline-none"
              />
            ) : (
              <textarea
                id="generator-content-textarea"
                rows={4}
                value={options.content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste payload string..."
                className="win-sunken w-full px-2 py-1 text-xs font-mono bg-white text-black focus:outline-none resize-y"
              />
            )}

            {/* Smart URL normalization warning */}
            {showNormalizationHint && (
              <div className="win-sunken bg-[#FFFFE1] border border-[#000000] p-1.5 mt-1 flex items-center justify-between text-[11px]">
                <span>Notice: Missing 'https://' prefix. Auto-prepend?</span>
                <button
                  type="button"
                  onClick={applyNormalizedUrl}
                  className="win-button text-[10px] font-bold"
                >
                  Prepend https://
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-1.5">
              <button
                type="button"
                id="btn-force-render"
                onClick={handleExplicitGenerate}
                className="win-button font-bold text-xs"
                title="Force matrix generation immediately"
              >
                ⚡ Render Matrix Now
              </button>
              <span className="text-[10px] text-slate-500">Instant in-memory synthesis</span>
            </div>
          </div>
        </fieldset>

        {/* GroupBox 2: Matrix Parameters */}
        <fieldset className="win-groupbox bg-[#D4D0C8]">
          <legend>Matrix Parameters (ISO/IEC 18004)</legend>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Error Correction Level */}
            <div>
              <span className="font-bold block mb-1">Error Correction:</span>
              <div className="space-y-1">
                {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((level) => {
                  const labels: Record<ErrorCorrectionLevel, string> = {
                    L: 'L - Low (~7%)',
                    M: 'M - Med (~15%)',
                    Q: 'Q - Qrt (~25%)',
                    H: 'H - High (~30%)',
                  };
                  return (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        name="errorLevel"
                        value={level}
                        checked={options.errorCorrectionLevel === level}
                        onChange={() => setErrorCorrectionLevel(level)}
                      />
                      <span>{labels[level]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Matrix Dimension */}
            <div>
              <span className="font-bold block mb-1">Resolution (px):</span>
              <div className="space-y-1">
                {([256, 384, 512] as QRSize[]).map((sz) => (
                  <label key={sz} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="qrSize"
                      value={sz}
                      checked={options.size === sz}
                      onChange={() => setSize(sz)}
                    />
                    <span>{sz} × {sz} px</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quiet Zone Margin */}
            <div>
              <span className="font-bold block mb-1">Quiet Zone (Margin):</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={options.margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-[#0A246A]"
                />
                <span className="win-sunken bg-white px-2 py-0.5 text-xs font-mono font-bold">
                  {options.margin}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 block mt-1">
                Spec recommends margin ≥ 2 modules.
              </span>
            </div>
          </div>
        </fieldset>

        {/* GroupBox 3: Color Table & Palettes */}
        <fieldset className="win-groupbox bg-[#D4D0C8]">
          <legend>Color Table &amp; Palettes</legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Foreground */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">Foreground (Modules):</span>
                <span className="font-mono text-[10px]">{options.foregroundColor}</span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                {FG_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setForegroundColor(p.hex)}
                    title={p.name}
                    className={`w-5 h-5 border ${
                      options.foregroundColor.toLowerCase() === p.hex.toLowerCase()
                        ? 'border-black ring-1 ring-white'
                        : 'border-[#808080]'
                    }`}
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={options.foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-6 h-5 p-0 border border-[#808080] cursor-pointer ml-1"
                  title="Custom hex picker"
                />
              </div>
            </div>

            {/* Background */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">Background:</span>
                <span className="font-mono text-[10px]">{options.backgroundColor}</span>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                {BG_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setBackgroundColor(p.hex)}
                    title={p.name}
                    className={`w-5 h-5 border ${
                      options.backgroundColor.toLowerCase() === p.hex.toLowerCase()
                        ? 'border-black ring-1 ring-black'
                        : 'border-[#808080]'
                    }`}
                    style={{ backgroundColor: p.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-6 h-5 p-0 border border-[#808080] cursor-pointer ml-1"
                  title="Custom hex picker"
                />
              </div>
            </div>
          </div>

          {/* Reset Settings Button */}
          <div className="flex justify-end pt-2 border-t border-[#808080] mt-2">
            <button
              type="button"
              onClick={resetSettings}
              className="win-button text-xs"
            >
              ↺ Reset Defaults
            </button>
          </div>
        </fieldset>
      </div>

      {/* Right Column: Hardware Viewport (5 cols on lg) */}
      <div className="lg:col-span-5 h-full">
        <QRPreview
          result={result}
          error={error}
          isGenerating={isGenerating}
          copyFeedback={copyFeedback}
          imageCopyFeedback={imageCopyFeedback}
          asciiCopyFeedback={asciiCopyFeedback}
          onDownloadPng={handleDownloadPng}
          onDownloadSvg={handleDownloadSvg}
          onDownloadAscii={handleDownloadAscii}
          onCopyContent={handleCopyContent}
          onCopyImage={handleCopyImage}
          onCopyAscii={handleCopyAscii}
          onArchiveWithWinrar={
            result && onArchiveWithWinrar ? () => onArchiveWithWinrar(result) : undefined
          }
        />
      </div>
    </div>
  );
};
