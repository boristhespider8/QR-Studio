# QR Studio — QR Code Generator & Scanner

A modern, privacy-first, client-side web application to generate custom QR Codes and scan QR Codes from images directly in the browser.

![QR Studio Preview](https://img.shields.io/badge/Client--Side-100%25-indigo?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal?style=flat-square)

---

## Key Features

### 1. QR Code Generator
- **Content Types**: Supports Website URLs and Plain Text.
- **Smart URL Normalization**: Automatically validates and formats links (e.g., handles bare domains with one-click `https://` prefixing).
- **Appearance Customization**:
  - Foreground (pattern) color picker with curated presets and native color selector.
  - Background color picker with curated presets and native color selector.
  - Resolution controls: 256 px, 384 px, and 512 px (*Ultra HD*).
  - Error correction level adjustment: Low (7%), Medium (15%), Quartile (25%), and High (30%).
  - Adjustable quiet zone (margin).
- **Live Preview**: Debounced instant preview rendering directly on screen.
- **Exporting**: Download high-resolution PNG images, copy content to clipboard, or copy image data.

### 2. QR Code Scanner
- **Drag-and-Drop & File Picker**: Upload PNG, JPG, JPEG, or WEBP images up to 15 MB.
- **HTML5 Canvas Decoding**: Processes pixel data locally using `jsQR` with dual-pass resolution scaling.
- **Safe Output Display**:
  - Distinguishes between URL and plain text.
  - Displays complete decoded text without automatic redirection.
  - One-click copy result to clipboard.
  - Safe "Open Link" button with `rel="noopener noreferrer"` restricted to `http:` and `https:`.

### 3. Local Activity History
- Automatically tracks recent generated and scanned QR codes in `localStorage` (capped at 10 items).
- Displays activity type, content snippet, and relative timestamps.
- Quick copy button for every history entry.
- Clear history functionality with confirmation modal.
- Safe fallback when storage is inaccessible.

### 4. 100% Client-Side Privacy
- No user content or uploaded images are transmitted to external servers or third-party APIs.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Generation**: [qrcode](https://www.npmjs.com/package/qrcode)
- **QR Decoding**: [jsqr](https://www.npmjs.com/package/jsqr)

---

## Project Structure

```
src/
├── assets/             # Static icons and assets
├── components/         # Reusable UI components
│   ├── AboutModal.tsx      # Privacy & app details modal
│   ├── Footer.tsx          # Minimalist footer with dynamic year
│   ├── GeneratorPanel.tsx  # Generator options & controls
│   ├── HeroSection.tsx     # Hero banner and tab switcher
│   ├── Navbar.tsx          # Navigation header
│   ├── QRPreview.tsx       # Live preview card and export actions
│   ├── RecentActivity.tsx  # Local history listing & management
│   ├── ScannerPanel.tsx    # Scanner parent container
│   ├── ScanResult.tsx      # Decoded output & troubleshooting view
│   └── UploadDropzone.tsx  # Drag & drop image upload area
├── hooks/              # Custom React hooks
│   ├── useQRGenerator.ts   # Generator state, debounce, & exports
│   └── useQRScanner.ts     # Scanner state, file decode, & cleanup
├── types/              # TypeScript interfaces and types
│   └── index.ts
├── utils/              # Pure utility functions
│   ├── qrGenerator.ts      # Canvas dataUrl generation & PNG download
│   ├── qrScanner.ts        # Canvas pixel extraction & jsQR decoding
│   ├── storage.ts          # Safe localStorage history management
│   └── validators.ts       # URL normalization & clipboard fallback
├── App.tsx             # Root application orchestrator
├── main.tsx            # React application entry point
└── index.css           # Tailwind CSS imports & global design tokens
```

---

## Getting Started Locally

### Prerequisites
- Node.js (version 20.19+ or 22+)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
# Typecheck and build production bundle
npm run build

# Preview production build locally
npm run preview
```
