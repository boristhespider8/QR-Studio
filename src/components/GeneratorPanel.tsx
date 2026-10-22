import React, { useState } from 'react';
import {
  Link,
  AlignLeft,
  Sliders,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Globe,
} from 'lucide-react';
import type {
  ErrorCorrectionLevel,
  QRSize,
  ActivityItem,
} from '../types';
import { useQRGenerator } from '../hooks/useQRGenerator';
import { QRPreview } from './QRPreview';
import { normalizeUrl } from '../utils/validators';

interface GeneratorPanelProps {
  onActivityAdded: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

// Preset color options for quick selection
const FG_PRESETS = [
  { name: 'Slate Dark', hex: '#0f172a' },
  { name: 'Indigo', hex: '#4338ca' },
  { name: 'Violet', hex: '#6d28d9' },
  { name: 'Emerald', hex: '#047857' },
  { name: 'Rose', hex: '#be123c' },
  { name: 'Midnight', hex: '#000000' },
];

const BG_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Soft Slate', hex: '#f8fafc' },
  { name: 'Warm Cream', hex: '#fffbeb' },
  { name: 'Subtle Indigo', hex: '#eef2ff' },
];

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ onActivityAdded }) => {
  const {
    options,
    result,
    error,
    isGenerating,
    copyFeedback,
    imageCopyFeedback,
    setContent,
    setType,
    setForegroundColor,
    setBackgroundColor,
    setSize,
    setErrorCorrectionLevel,
    setMargin,
    resetSettings,
    handleExplicitGenerate,
    handleDownload,
    handleCopyContent,
    handleCopyImage,
  } = useQRGenerator({ onActivityAdded });

  const [showNormalizationHint, setShowNormalizationHint] = useState<boolean>(false);

  // Check if current URL input looks like a bare domain needing https://
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
      {/* Left Column: Inputs & Settings (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Input Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          {/* Content Type Selector Tabs */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Content Type
            </span>
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/60" role="tablist">
              <button
                type="button"
                id="type-url-tab"
                role="tab"
                aria-selected={options.type === 'url'}
                onClick={() => setType('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  options.type === 'url'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Website URL</span>
              </button>

              <button
                type="button"
                id="type-text-tab"
                role="tab"
                aria-selected={options.type === 'text'}
                onClick={() => setType('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  options.type === 'text'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Plain Text</span>
              </button>
            </div>
          </div>

          {/* Conditional Input Field */}
          {options.type === 'url' ? (
            <div className="space-y-2">
              <label htmlFor="qr-url-input" className="block text-xs font-semibold text-slate-700">
                Destination URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  id="qr-url-input"
                  type="text"
                  value={options.content}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'url-error' : undefined}
                />
              </div>

              {/* Normalization prompt */}
              {showNormalizationHint && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Missing protocol? We can format as <strong className="font-mono">{normalizeUrl(options.content)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={applyNormalizedUrl}
                    className="ml-2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shrink-0 shadow-xs transition-colors"
                  >
                    Add https://
                  </button>
                </div>
              )}

              {error && (
                <p id="url-error" className="text-xs text-rose-600 font-medium pt-1">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="qr-text-input" className="block text-xs font-semibold text-slate-700">
                  Plain Text Content <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {options.content.length} characters
                </span>
              </div>
              <textarea
                id="qr-text-input"
                rows={4}
                value={options.content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste any text or notes here..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono resize-y"
                aria-invalid={!!error}
                aria-describedby={error ? 'text-error' : undefined}
              />
              {error && (
                <p id="text-error" className="text-xs text-rose-600 font-medium pt-1">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Customization Settings Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">QR Appearance &amp; Quality</h2>
            </div>
            <button
              id="btn-reset-settings"
              type="button"
              onClick={resetSettings}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              title="Reset to default settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Color Pickers: Foreground & Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Foreground Color */}
            <div className="space-y-2">
              <label htmlFor="fg-color-picker" className="block text-xs font-semibold text-slate-700">
                Pattern Color
              </label>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    id="fg-color-picker"
                    type="color"
                    value={options.foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    title="Choose custom pattern color"
                  />
                </div>
                <input
                  type="text"
                  value={options.foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 uppercase"
                  maxLength={7}
                />
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 pt-1">
                {FG_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setForegroundColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-5 h-5 rounded-md border transition-all ${
                      options.foregroundColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'ring-2 ring-indigo-500 ring-offset-1 border-white scale-110'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    title={color.name}
                    aria-label={`Select pattern color ${color.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label htmlFor="bg-color-picker" className="block text-xs font-semibold text-slate-700">
                Background Color
              </label>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    id="bg-color-picker"
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                    title="Choose custom background color"
                  />
                </div>
                <input
                  type="text"
                  value={options.backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 uppercase"
                  maxLength={7}
                />
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 pt-1">
                {BG_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setBackgroundColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-5 h-5 rounded-md border transition-all ${
                      options.backgroundColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'ring-2 ring-indigo-500 ring-offset-1 border-white scale-110'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    title={color.name}
                    aria-label={`Select background color ${color.name}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Output Resolution
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {([256, 384, 512] as QRSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  id={`btn-size-${sz}`}
                  onClick={() => setSize(sz)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                    options.size === sz
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold">{sz} px</span>
                  <span className="text-[10px] text-slate-400">
                    {sz === 256 ? 'Standard' : sz === 384 ? 'High Res' : 'Ultra HD'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Correction Level */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Error Correction Level
              </label>
              <span className="text-[11px] text-slate-400">Higher = more scannable if damaged</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { level: 'L', label: 'Low (~7%)', desc: 'Lightweight' },
                  { level: 'M', label: 'Medium (~15%)', desc: 'Recommended' },
                  { level: 'Q', label: 'Quartile (~25%)', desc: 'High density' },
                  { level: 'H', label: 'High (~30%)', desc: 'Maximum durability' },
                ] as const
              ).map(({ level, label, desc }) => (
                <button
                  key={level}
                  type="button"
                  id={`btn-ecl-${level}`}
                  onClick={() => setErrorCorrectionLevel(level as ErrorCorrectionLevel)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    options.errorCorrectionLevel === level
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{level}</span>
                    {options.errorCorrectionLevel === level && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 mt-0.5">{label}</div>
                  <div className="text-[10px] text-slate-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Margin / Quiet Zone */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="margin-slider" className="block text-xs font-semibold text-slate-700">
                Quiet Zone (Margin): <span className="font-mono text-indigo-600">{options.margin} modules</span>
              </label>
              <span className="text-[11px] text-slate-400">Clear space around code</span>
            </div>
            <input
              id="margin-slider"
              type="range"
              min={1}
              max={6}
              step={1}
              value={options.margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              id="btn-explicit-generate"
              type="button"
              onClick={handleExplicitGenerate}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md shadow-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Preview & Output (5 cols on lg) */}
      <div className="lg:col-span-5 sticky top-24">
        <QRPreview
          result={result}
          error={error}
          isGenerating={isGenerating}
          copyFeedback={copyFeedback}
          imageCopyFeedback={imageCopyFeedback}
          onDownload={handleDownload}
          onCopyContent={handleCopyContent}
          onCopyImage={handleCopyImage}
          onRegenerate={handleExplicitGenerate}
        />
      </div>
    </div>
  );
};
