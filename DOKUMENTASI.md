# Dokumentasi Teknis Lengkap: PPLQR Studio v2.0 (Build 2003)

> **PPLQR Studio v2.0** adalah aplikasi web desktop utility bergaya **Authentic Early 2000s (Windows 2000 Professional / Classic Utility)** berbasis *client-side* murni (100% peramban) yang dirancang untuk menghasilkan (*generate*) dan memindai (*scan*) QR Code ISO/IEC 18004 secara cepat, presisi, berorientasi fungsi, dan memprioritaskan privasi pengguna (*privacy-first*).

---

## Daftar Isi
1. [Ringkasan Eksekutif & Filosofi Desain v2.0](#1-ringkasan-eksekutif--filosofi-desain-v20)
2. [Tumpukan Teknologi (Tech Stack)](#2-tumpukan-teknologi-tech-stack)
3. [Sistem Desain Authentic Early 2000s (Win2K Design System)](#3-sistem-desain-authentic-early-2000s-win2k-design-system)
   - [3.1 Palet Warna & Bevel 3D Primitives](#31-palet-warna--bevel-3d-primitives)
   - [3.2 Tipografi & Anti-Aliasing Rendering](#32-tipografi--anti-aliasing-rendering)
   - [3.3 GroupBox & Fieldset Semantik](#33-groupbox--fieldset-semantik)
4. [Arsitektur Sistem & Alur Kerja](#4-arsitektur-sistem--alur-kerja)
   - [4.1 Prinsip Kerja Utama: 100% Client-Side](#41-prinsip-kerja-utama-100-client-side)
   - [4.2 Alur Kerja Generator Matrix & ASCII NFO](#42-alur-kerja-generator-matrix--ascii-nfo)
   - [4.3 Alur Kerja Pemindai & Bounding Box HUD](#43-alur-kerja-pemindai--bounding-box-hud)
   - [4.4 Alur Kerja System Activity Audit Log](#44-alur-kerja-system-activity-audit-log)
5. [Struktur Direktori & Penjelasan Berkas](#5-struktur-direktori--penjelasan-berkas)
6. [Spesifikasi Fitur Utama](#6-spesifikasi-fitur-utama)
   - [6.1 Modul Generator Bay & Structured Builders](#61-modul-generator-bay--structured-builders)
   - [6.2 Hardware Preview Viewport (CRT Monitor & ASCII Art)](#62-hardware-preview-viewport-crt-monitor--ascii-art)
   - [6.3 Modul Optical Scanner & TWAIN Bay (Ctrl+V Paste)](#63-modul-optical-scanner--twain-bay-ctrlv-paste)
   - [6.4 System Activity Log (ListView & Export .LOG)](#64-system-activity-log-listview--export-log)
   - [6.5 Title Bar, Classic Menu Bar, & Status Bar](#65-title-bar-classic-menu-bar--status-bar)
   - [6.6 Dialog System Properties (About PPLQR.EXE)](#66-dialog-system-properties-about-pplqrexe)
7. [Bedah Kode & Rincian Logika Internal](#7-bedah-kode--rincian-logika-internal)
   - [7.1 Tipe Data & Skema (src/types/index.ts)](#71-tipe-data--skema-srctypesindexts)
   - [7.2 Custom React Hooks](#72-custom-react-hooks)
   - [7.3 Modul Utilitas (Utilities)](#73-modul-utilitas-utilities)
8. [Panduan Instalasi & Eksekusi Proyek](#8-panduan-instalasi--eksekusi-proyek)
9. [Aspek Keamanan, Privasi, & Efisiensi Memori](#9-aspek-keamanan-privasi--efisiensi-memori)
10. [Panduan Pemecahan Masalah (Troubleshooting)](#10-panduan-pemecahan-masalah-troubleshooting)

---

## 1. Ringkasan Eksekutif & Filosofi Desain v2.0

Pada versi 2.0, **PPLQR Studio** mengalami perombakan arsitektur visual dan fungsional total:
- **Penghapusan "AI Slop"**: Menghilangkan template web modern generik (gradasi ungu/indigo, sudut `rounded-2xl`, efek kaca blur, bayangan mengambang, dan banner promosi hero) yang tidak cocok untuk software utilitas.
- **Transformasi Authentic Early 2000s**: Mengadopsi antarmuka aplikasi utilitas desktop era Windows 2000 / Winamp Classic / IrfanView dengan canvas desktop `#008080` (*Classic Teal*), border Bevel 3D tajam (0px border-radius), *Title Bar* biru bergradasi, *Classic Menu Bar*, *Tab Strip* folder, dan *Status Bar* 3-panel di bagian bawah.
- **100% In-Memory Execution (Zero Server Leakage)**: Seluruh pemrosesan teks, kata sandi Wi-Fi, kontak vCard, dan gambar citra dilakukan langsung di dalam memori peramban tanpa koneksi API pihak ketiga.

---

## 2. Tumpukan Teknologi (Tech Stack)

| Kategori | Teknologi | Versi | Peran Teknis |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | `^19.3.1` | Komposisi antarmuka modular, hook state reaktif, render cepat. |
| **Bahasa Pemrograman** | TypeScript | `~6.0.3` | Type-safety ketat pada skema QR generator, dekoder, dan audit log. |
| **Build Tool / Bundler** | Vite | `^8.3.5` | HMR instan dan kompilasi produksi sub-detik (392ms build time). |
| **Kerangka Gaya (CSS)** | Tailwind CSS | `^4.3.3` | Styling token-based via `@tailwindcss/vite` untuk primitif Bevel 3D. |
| **QR Matrix Synthesis** | `qrcode` | `^1.5.4` | Algoritma polinomial Reed-Solomon ISO/IEC 18004, ekspor raster & SVG, pembaca bit array matriks untuk ASCII art. |
| **Optical Matrix Decoder**| `jsQR` | `^1.4.0` | Deteksi finder pattern, de-inversi luminans, dan dekode bit data lokal. |
| **Compression Engine** | `fflate` | `^0.8.3` | Mesin kompresi Deflate, Gzip, Tarball multi-engine dengan level 0-9 dan validasi CRC-32. |
| **Linter Berkecepatan Tinggi**| Oxlint | `^1.88.0` | Linter berbasis Rust dengan 0 warnings dan 0 errors. |

---

## 3. Sistem Desain Authentic Early 2000s (Win2K Design System)

### 3.1 Palet Warna & Bevel 3D Primitives

Desain antarmuka dibangun di atas sistem border 3D bevel tanpa bayangan kabur (*blur*):

| Token Warna | Nilai Hex | Penerapan Antarmuka |
| :--- | :--- | :--- |
| **Desktop Background** | `#008080` | Latar belakang kanvas desktop utama (*Classic Teal*). |
| **Window Surface (3D Face)** | `#D4D0C8` | Warna abu-abu klasik bodi jendela dan kontrol. |
| **Title Bar Active** | `linear-gradient(90deg, #0A246A, #A6CAF0)` | Gradasi biru jendela aktif Windows 2000. |
| **Bevel Highlight (Outer)** | `#FFFFFF` | Garis tepi atas & kiri untuk efek timbul (*raised*). |
| **Bevel Light (Inner)** | `#DFDFDF` | Garis tepi dalam atas & kiri. |
| **Bevel Shadow (Inner)** | `#808080` | Garis tepi dalam kanan & bawah untuk bayangan 3D. |
| **Bevel Dark Shadow (Outer)**| `#000000` | Garis batas luar kanan & bawah (tepi terluar). |
| **CRT Monitor Well** | `#001100` | Layar pratinjau monitor hardware & inspection box. |
| **CRT Phosphor Glow** | `#00FF66` | Teks status indikator terminal & ASCII art. |
| **Selection Highlight** | `#0A246A` | Warna sorotan item list/menu aktif (teks putih). |

### 3.2 Tipografi & Anti-Aliasing Rendering
- **Font Utama UI**: `'Tahoma', 'MS Sans Serif', 'Segoe UI', 'Verdana', sans-serif` dengan ukuran `11px` atau `12px`.
- **Font Data & Log**: `'Lucida Console', 'Courier New', monospace`.
- **Border Radius**: Ditegakkan ketat `0px` (`* { border-radius: 0px !important; }`).
- **Efek Tekan Tombol (`:active`)**: Border terbalik dan pergeseran konten `1px` ke kanan-bawah.

### 3.3 GroupBox & Fieldset Semantik
Semua kartu modern digantikan oleh `<fieldset className="win-groupbox">` bergaris ukir (*etched groove*) dengan judul `<legend>` tebal di sudut kiri atas.

---

## 4. Arsitektur Sistem & Alur Kerja

```
                 [DESKTOP CANVAS: #008080]
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
[PPLQR STUDIO v2.0 MAIN WINDOW]             [SYSTEM PROPERTIES DIALOG]
  ├── Title Bar & Controls                     ├── General Specs
  ├── Classic Menu Bar (File/View/Tools/Help)  ├── Engine Specs
  ├── Folder Tab Strip (Gen / Scan / Log)      └── Privacy & EULA
  ├── Active Workspace Panel
  └── Status Bar (3 Sunken Panes + Grip)
```

### 4.2 Alur Kerja Generator Matrix & ASCII NFO
1. Pengguna memilih template: *Website URL*, *Plain Text*, *Wi-Fi Access Point*, atau *vCard 2.1*.
2. Wizard template secara otomatis menyusun payload terstruktur standar.
3. Hook `useQRGenerator` menerapkan *debounce* 280ms (atau tombol manual *Render Matrix Now*).
4. Mesin menghasilkan 3 representasi sekaligus:
   - **Raster DataURL** (PNG).
   - **Vector Markup** (SVG via `QRCode.toString`).
   - **Terminal ASCII Block Art** (Karakter `██` dan spasi ganda dari matriks bit modules).
5. Pratinjau dirender pada **Hardware Preview Viewport** berlayar CRT hijau.

### 4.3 Alur Kerja Pemindai & Bounding Box HUD
1. Gambar diperoleh via **Drag-and-Drop**, **Browse Disk**, atau **Global `Ctrl + V` Paste**.
2. Ukuran dan format divalidasi (PNG, JPG, JPEG, WEBP; maks 15 MB).
3. Gambar dimuat ke canvas virtual dengan batas dimensi 2048px.
4. **Dual-Pass Rescaling Execution**:
   - *Pass 1*: Pemindaian skala penuh dengan inversi `attemptBoth`.
   - *Pass 2*: Jika belum terdeteksi dan dimensi > 800px, gambar di-downscale ke 800px standar.
5. Saat QR terdeteksi, sistem mengambil koordinat `code.location` dan menggambar **Green HUD Bounding Box (`#00FF00`)** berbingkai poligon, titik sudut merah, dan crosshair tengah.
6. Gambar beranotasi HUD ditampilkan langsung di antarmuka inspeksi.

---

## 5. Struktur Direktori & Penjelasan Berkas

```
c:\Users\MSI G\Documents\PPLQR\
│
├── index.html                 # Entry HTML: Desktop Teal #008080 & icon retro 16x16
├── package.json               # Konfigurasi dependensi v2.0
├── vite.config.ts             # Bundler Vite & Tailwind CSS v4 plugin
├── DOKUMENTASI.md             # Berkas dokumentasi teknis ini
├── README.md                  # Ringkasan repositori & badge
│
└── src/
    ├── types/
    │   └── index.ts           # Antarmuka TypeScript: ScanLocation, Point, TemplateType, dll.
    │
    ├── utils/
    │   ├── qrGenerator.ts     # Generator PNG DataURL, SVG Vector, ASCII Art, & File Download
    │   ├── qrScanner.ts       # Ekstraksi canvas, dual-pass jsQR, & anotasi Bounding Box HUD
    │   ├── storage.ts         # Wrapper safe localStorage & deduplikasi riwayat
    │   └── validators.ts      # Validasi URL http/https, normalisasi https://, clipboard fallback
    │
    ├── hooks/
    │   ├── useQRGenerator.ts  # State controller, multi-format render, debouncing, & export
    │   └── useQRScanner.ts    # Status lifecycle, global Ctrl+V paste listener, & memory cleanup
    │
    ├── components/
    │   ├── Navbar.tsx         # Title Bar Win2K & Classic Menu Bar (File/View/Tools/Help)
    │   ├── GeneratorPanel.tsx # Panel generator: Data Source, Matrix Parameters, Color Table
    │   ├── QRPreview.tsx      # Hardware Viewport CRT, Matrix/ASCII switcher, Save PNG/SVG/NFO
    │   ├── ScannerPanel.tsx   # Pembungkus modul pemindai
    │   ├── UploadDropzone.tsx # TWAIN Image Acquisition Bay & petunjuk Ctrl+V
    │   ├── ScanResult.tsx     # Optical Inspector dengan anotasi Bounding Box HUD & Safe Link
    │   ├── RecentActivity.tsx # System Activity Log ListView table & Export .LOG
    │   ├── AboutModal.tsx     # Kotak dialog System Properties (About PPLQR.EXE)
    │   └── Footer.tsx         # 3-Pane Sunken Status Bar & resize grip diagonal
    │
    ├── App.tsx                # Komponen jendela desktop utama PPLQR_STUDIO.EXE
    ├── main.tsx               # Bootstrapping React 19 ke DOM
    └── index.css              # Sistem styling Bevel 3D, GroupBox, dan token Win2K
```

---

## 6. Spesifikasi Fitur Utama

### 6.1 Modul Generator Bay & Structured Builders
- **Template Payload Wizard**:
  - `Website URL`: Input teks dengan notifikasi koreksi otomatis jika prefix `https://` tertinggal.
  - `Plain Text / ASCII`: Textarea multi-baris untuk teks bebas dengan penghitung byte.
  - `Wi-Fi Access Point`: Formulir terstruktur (SSID, Password, Enkripsi WPA/WEP/nopass) yang otomatis memformat string `WIFI:T:WPA;S:ssid;P:password;;`.
  - `vCard 2.1 Contact`: Formulir nama, telepon, dan surel yang menghasilkan kartu nama elektronik kompatibel ponsel pintar.
- **Parameter Matriks ISO/IEC 18004**:
  - Error Correction Level: Radio buttons `L (~7%)`, `M (~15%)`, `Q (~25%)`, dan `H (~30%)`.
  - Dimensi Piksel: `256 x 256 px`, `384 x 384 px`, dan `512 x 512 px`.
  - Quiet Zone (Margin): Slider 0–5 modul.
- **Tabel Warna Retro & CRT**:
  - Foreground: *Classic Black (`#000000`)*, *Terminal Green (`#00FF00`)*, *Amber CRT (`#FFB000`)*, *BSOD Blue (`#0000AA`)*, *Classic Maroon (`#800000`)*, *Dark Navy (`#000080`)*.
  - Background: *Pure White (`#FFFFFF`)*, *Win2K Grey (`#D4D0C8`)*, *LCD Olive (`#C4CCA8`)*, *Night Black (`#001100`)*.

---

### 6.2 Hardware Preview Viewport (CRT Monitor & ASCII Art)
- **Indikator LED Hardware**:
  - `[READY]`: Titik hijau berpendar saat matriks siap dipindai.
  - `[RENDERING]`: Indikator kuning berkedip saat kalkulasi matriks berlangsung.
  - `[WAITING]`: Indikator merah bila buffer kosong.
- **Dual Display Modes**:
  - `Matrix View`: Pratinjau raster tajam dengan bingkai pengukuran piksel.
  - `ASCII/NFO View`: Tampilan blok karakter ASCII murni (`██` / spasi) font hijau fosfor di atas monitor CRT yang dapat langsung disalin ke berkas `.TXT` atau `.NFO`.
- **Aksi Ekspor 3D**:
  - `💾 Save .PNG` (Raster).
  - `📐 Save .SVG` (Vektor murni).
  - `📟 Save .NFO` (ASCII block text).
  - `📋 Copy Image` (PNG Blob via Clipboard API).
  - `📄 Copy Text` (Plain text payload).
  - `📟 Copy ASCII` (Teks seni terminal).

---

### 6.3 Modul Optical Scanner & TWAIN Bay (Ctrl+V Paste)
- **TWAIN Image Acquisition Bay**:
  - Wadah drag-and-drop cekung (*sunken well*) dengan tombol tegas `Browse Local Disk...`.
  - **Akselerator Global `Ctrl + V`**: Pengguna dapat langsung menekan tombol pintas `Ctrl+V` setelah mengambil tangkapan layar (*Snipping Tool*), dan citra langsung didekode secara instan tanpa perlu disimpan ke disk lokal terlebih dahulu.
- **Anotasi Bounding Box HUD**:
  - Saat `jsQR` mendeteksi pola QR, koordinat `code.location` digambar di atas citra sebagai poligon hijau neon (`#00FF00`) lengkap dengan titik bidik sudut merah dan crosshair tengah.
- **Pemeriksaan Keamanan URL**:
  - Membedakan teks biasa dan tautan web sah. Tombol `Open Link in Browser` diisolasi dengan `target="_blank"` dan `rel="noopener noreferrer"`.

---

### 6.4 System Activity Log (ListView & Export .LOG)
- Menggunakan tata letak tabel detail klasik Windows Explorer: kolom `#`, `Timestamp`, `Operation`, `Format`, `Payload Buffer`, dan `Aksi`.
- Baris tabel dapat diklik dengan efek seleksi warna biru Windows (`#0A246A`) dan teks putih.
- **Ekspor Berkas `.LOG`**: Mengunduh berkas laporan diagnostik teks (contoh: `PPLQR_AUDIT_20261022.LOG`) yang mencakup rincian setiap rekaman, resolusi, tingkat ECC, dan timestamp.
- Tombol **Purge Log** dengan konfirmasi dialog peringatan.

---

### 6.5 Title Bar, Classic Menu Bar, & Status Bar
- **Title Bar**: Gradasi biru Windows 2000 dengan tombol Minimize `_`, Maximize `□`, dan Close `✕`.
- **Menu Bar Interaktif**:
  - `File`: Navigasi cepat ke Generator (`Ctrl+G`), Scanner (`Ctrl+S`), Activity Log (`Ctrl+L`), dan Properties.
  - `View`: Status tab aktif bertanda centang `✓`.
  - `Tools`: Opsi pembersihan histori dan inspeksi audit log.
  - `Help`: Tautan pembuka dialog About.
- **Status Bar 3-Panel**:
  - Panel 1: Status eksekusi & jaminan 100% Client-Side.
  - Panel 2: Status pemakaian RAM lokal.
  - Panel 3: Standar ISO/IEC 18004 dan *diagonal resize grip* di sudut kanan bawah.

### 6.7 Modul WinRAR Archiver & Kompresi Multi-Engine (`WinrarCompressor.tsx`)
Menghadirkan utilitas arsip dan kompresi berkas legendaris bergaya dialog **WinRAR 3.20 ("Archive name and parameters")**:
- **Pilihan Engine Kompresi (Archive Format)**:
  1. `ZIP (Deflate / PKZip Standard)`: Standar universal PKWare yang terbaca secara natif di Windows Explorer, macOS, Linux, WinRAR, 7-Zip, dan perangkat mobile.
  2. `TAR.GZ (POSIX Tar + GNU Gzip Stream)`: Format distribusi Unix standar (RFC 1952) mengombinasikan ustar container dan kompresi GZIP.
  3. `TAR (POSIX Tape Archive)`: Format sequential byte-block tanpa kompresi dengan overhead CPU 0% untuk pengemasan cepat.
  4. `GZIP (.gz Compressed Stream)`: Format kompresi stream tunggal/tergabung dengan header CRC-32.
  5. `Web Stream API (CompressionStream)`: Eksekusi hardware/OS-accelerated C++ via standard modern browser `CompressionStream` API.
- **Pilihan Level Kompresi (Compression Levels)**:
  - `Store (Level 0)`: Tanpa kompresi (kecepatan ultra cepat untuk pengemasan murni).
  - `Fastest (Level 1)`: Kompresi ringan dengan kecepatan eksekusi tertinggi.
  - `Fast (Level 3)`: Kompresi cepat dengan rasio moderat.
  - `Normal (Level 6)`: Pengaturan bawaan WinRAR untuk keseimbangan optimal antara kecepatan dan ukuran berkas.
  - `Good (Level 7)`: Pencarian kamus lebih dalam untuk ukuran arsip lebih hemat.
  - `Best (Level 9)`: Algoritma Deflate level 9 dengan kamus maksimal untuk ukuran paling minimal.
- **Fitur Otentik WinRAR**:
  - Dialog Progress WinRAR klasik dengan animasi ikon tumpukan buku bersabuk, dua bilah kemajuan (*Total progress* & *Current file*), dan metrik statistik langsung (ukuran sebelum, ukuran kompresi, persentase penghematan ruang).
  - Verifikasi integritas checksum IEEE 802.3 32-bit CRC-32 untuk setiap berkas.
  - Pengaturan *Split to volumes* (Floppy 1.44MB, ZIP 100MB, CD 650/700MB, DVD 4.7GB).
  - Integrasi 1-klik dengan Generator: tombol `🗜️ WinRAR .ZIP` di *Hardware Viewport* yang langsung mengekspor berkas citra PNG, NFO spesifikasi, dan ASCII art ke dalam antrean arsip.
  - *Archive Inspector / Explorer*: Melihat dan menguji integritas isi berkas `.zip`.

---

## 7. Bedah Kode & Rincian Logika Internal

### 7.1 Tipe Data & Skema (`src/types/index.ts`)

```typescript
export type ContentType = 'url' | 'text';
export type TemplateType = 'custom' | 'url' | 'wifi' | 'vcard';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRSize = 256 | 384 | 512;

export interface Point {
  x: number;
  y: number;
}

export interface ScanLocation {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ScanResultData {
  text: string;
  isUrl: boolean;
  url: string | null;
  detectedAt: number;
  location?: ScanLocation;
  dimensions?: { width: number; height: number };
  annotatedDataUrl?: string; // Citra beranotasi neon green HUD box
}

export type ActiveTab = 'generator' | 'scanner' | 'log';
```

---

## 8. Panduan Instalasi & Eksekusi Proyek

### 8.1 Prasyarat
- Node.js versi `20.19.0+` atau `22.0.0+`.
- npm atau pnpm.

### 8.2 Menjalankan Server Pengembangan
```powershell
cmd /c npm run dev
```
Aplikasi dapat diakses pada peramban melalui alamat: **`http://localhost:5173/`**.

### 8.3 Memeriksa Linting Kode (Oxlint)
```powershell
cmd /c npm run lint
```
*Hasil status: 0 warnings, 0 errors pada seluruh berkas.*

### 8.4 Kompilasi Produksi (Production Build)
```powershell
cmd /c npm run build
```
Menghasilkan aset minified optimal di folder `dist/` dalam waktu kurang dari 500ms.

---

## 9. Aspek Keamanan, Privasi, & Efisiensi Memori

1. **Nol Kebocoran Data Jaringan (Zero Network Transmission)**: Tidak ada endpoint analitik, pelacakan, atau server backend. Semua operasi berjalan di heap memori browser pengguna.
2. **Pembersihan URL Objek (Memory Hygiene)**: Setiap kali berkas citra selesai diproses atau komponen dilepas (*unmount*), `URL.revokeObjectURL(imagePreviewUrl)` dipanggil secara deterministik untuk mencegah pemborosan memori peramban.
3. **Pencegahan Reverse Tabnabbing**: Tautan luar yang dibuka dari hasil pemindaian selalu menggunakan isolasi atribut `rel="noopener noreferrer"`.
4. **Fallback API Papan Klip**: Menggabungkan `navigator.clipboard` modern dengan fallback `document.execCommand('copy')` agar tetap berfungsi di lingkungan lokal atau non-HTTPS.

---

## 10. Panduan Pemecahan Masalah (Troubleshooting)

| Masalah | Analisis Penyebab | Solusi yang Disediakan |
| :--- | :--- | :--- |
| **QR Code tidak terdeteksi pada citra** | Pola sudut tertutup, kontras rendah, atau resolusi kamera buram. | Sistem menjalankan **Pass 2: Downscaling 800px** secara otomatis. Pastikan 3 kotak sudut (*finder patterns*) tampak jelas. |
| **Ingin memindai screenshot dengan cepat tanpa simpan file** | Alur upload file konvensional lambat. | Cukup ambil screenshot dengan *Snipping Tool*, buka tab *Optical Scanner Bay*, lalu tekan **`Ctrl + V`**. |
| **Salin Gambar gagal di peramban tertentu** | Peramban membatasi `ClipboardItem` format blob image pada konteks non-HTTPS. | Gunakan tombol **💾 Save .PNG** atau gunakan tombol **📋 Copy Text**. |
| **QR Code buram saat dicetak dalam ukuran besar** | Format raster PNG mengalami pikselasi jika diperbesar. | Gunakan fitur **📐 Save .SVG** untuk mengunduh format vektor beresolusi tak terhingga. |

---

*Dokumentasi ini mencakup rincian teknis lengkap untuk **PPLQR Studio v2.0 (Build 2003)**.*
