# Cetak Biru Perombakan UI/UX: QR Studio — Authentic Early 2000s Edition (PPLQR v2.0)

> **Visi Desain:** Mengubah antarmuka QR Studio dari *template SaaS modern generik* ("AI Slop") menjadi **Authentic Early 2000s Desktop Utility** (terinspirasi dari Windows 2000 Professional, Winamp Classic, Nero Burning ROM, dan IrfanView). Fungsional, taktil, padat informasi, tanpa animasi lambat, dan jujur sebagai *client-side software utility*.

---

## Daftar Isi
1. [Audit & Penghapusan "AI Slop" (Anti-Bloat Purge)](#1-audit--penghapusan-ai-slop-anti-bloat-purge)
2. [Sistem Desain Authentic Early 2000s](#2-sistem-desain-authentic-early-2000s)
   - [2.1 Palet Warna (Win2K & CRT Phosphor)](#21-palet-warna-win2k--crt-phosphor)
   - [2.2 Tipografi & Rendering Font](#22-tipografi--rendering-font)
   - [2.3 Sistem Border Bevel 3D (Sunken & Raised)](#23-sistem-border-bevel-3d-sunken--raised)
3. [Transformasi Arsitektur Komponen](#3-transformasi-arsitektur-komponen)
4. [Spesifikasi Implementasi CSS (`src/index.css`)](#4-spesifikasi-implementasi-css-srcindexcss)
5. [Rekomendasi Pengembangan Fitur & Teknis](#5-rekomendasi-pengembangan-fitur--teknis)
6. [Daftar Periksa Eksekusi (Action Plan)](#6-daftar-periksa-eksekusi-action-plan)

---

## 1. Audit & Penghapusan "AI Slop" (Anti-Bloat Purge)

Istilah **"AI Slop"** dalam desain web merujuk pada pola antarmuka web modern yang sangat generik, repetitif, dan terasa dibuat otomatis oleh generator template AI (seperti gradasi warna *indigo-violet-rose*, sudut super membulat `rounded-2xl`, bayangan kabur, dan *hero marketing banner* pada aplikasi utilitas).

Berikut adalah daftar objek dan elemen pada kode saat ini yang **wajib dihapus atau dirombak total**:

### 1.1 Komponen & Layout yang Dihapus
- ❌ **`HeroSection.tsx` (Hapus Total)**: Aplikasi utilitas desktop tahun 2000-an tidak memiliki *landing page hero section* dengan kalimat promosi bombastis atau *badge pill* mengambang. Pengguna membuka aplikasi untuk langsung bekerja pada *workspace* utama.
- ❌ **`Navbar.tsx` Modern & `Footer.tsx` SaaS**: Digantikan oleh **Window Title Bar** di bagian atas (dengan tombol Minimize, Maximize, Close bergaya klasik), **Menu Bar** (`File`, `Mode`, `Options`, `Help`), dan **Status Bar** berbingkai cekung (*sunken*) di bagian bawah jendela.

### 1.2 Elemen Visual & Styling yang Dihapus
- ❌ **Palet Warna "AI Indigo/Violet/Slate/Emerald/Rose"**:
  - Hapus semua preset warna modern (`Subtle Indigo`, `Soft Slate`, `Rose`, `Violet`).
  - Ganti dengan palet warna piksel standar industri & layar monokrom/CRT: *Classic Black (`#000000`)*, *Terminal Green (`#00FF00`)*, *Amber CRT (`#FFB000`)*, *BSOD Blue (`#0000AA`)*, dan *LCD Olive (`#8B956D`)*.
- ❌ **Border Radius Modern (`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`)**:
  - Semua sudut elemen **wajib `0px` (`rounded-none`)**. Tidak ada tombol kapsul atau kartu melengkung.
- ❌ **Efek Kaca & Bayangan Lembut (`backdrop-blur`, `shadow-lg`, `shadow-xl`, `ring-indigo-500`)**:
  - Hapus seluruh *drop shadow* kabur dan efek *glassmorphism*. Kedalaman ruang pada era 2000-an diciptakan murni menggunakan garis tepi **Bevel 3D tajam 1px-2px** (terang di kiri-atas, gelap di kanan-bawah).
- ❌ **Ikon Vektor Tipis Minimalis (`lucide-react` default stroke)**:
  - Kurangi ketergantungan pada ikon Lucide yang terlalu modern, atau paksa menggunakan ukuran tegas (`16px x 16px`), `strokeWidth={2.5}`, tanpa animasi *hover scale*. Lebih disarankan menggunakan ikon piksel SVG inline 16x16 (ikon Floppy Disk untuk simpan, Folder kuning terbuka untuk *upload*, Kaca Pembesar piksel untuk *scan*).
- ❌ **Font `Plus Jakarta Sans`**:
  - Font geometris modern ini merusak nuansa awal 2000-an. Ganti dengan **Tahoma**, **MS Sans Serif**, atau **Verdana** untuk UI, dan **Courier New** / **Fixedsys** untuk data teks/log.

---

## 2. Sistem Desain Authentic Early 2000s

### 2.1 Palet Warna (Win2K & CRT Phosphor)

| Token Warna | Hex Code | Penggunaan pada UI |
| :--- | :--- | :--- |
| **Desktop Background** | `#008080` | Warna latar belakang layar utama (*Classic Teal Desktop*). |
| **Window Surface (3D Face)** | `#D4D0C8` / `#C0C0C0` | Warna abu-abu hangat khas dialog Windows 2000 / 98. |
| **Title Bar Active** | `linear-gradient(90deg, #0A246A, #A6CAF0)` | Gradasi biru tua ke biru langit khas jendela aktif Windows 2000. |
| **Title Bar Text** | `#FFFFFF` | Teks putih tebal pada bilah judul. |
| **Input / Canvas Well** | `#FFFFFF` | Latar dalam kotak teks, daftar riwayat, dan area kanvas. |
| **CRT Monitor Well** | `#001100` | Latar belakang layar pratinjau/scanner bergaya monitor perangkat keras. |
| **CRT Phosphor Text** | `#00FF66` | Teks status indikator di dalam monitor pratinjau. |
| **Bevel Highlight (Outer)** | `#FFFFFF` | Garis tepi atas & kiri untuk efek timbul (*raised*). |
| **Bevel Light (Inner)** | `#DFDFDF` | Garis tepi dalam atas & kiri. |
| **Bevel Shadow (Inner)** | `#808080` | Garis tepi dalam bawah & kanan untuk efek bayangan. |
| **Bevel Dark Shadow (Outer)**| `#000000` | Garis tepi terluar bawah & kanan. |
| **Selection / Highlight** | `#0A246A` | Warna sorotan teks atau item *list* yang sedang dipilih (teks `#FFFFFF`). |

---

### 2.2 Tipografi & Rendering Font

Pada awal tahun 2000-an, sistem operasi belum menggunakan *subpixel anti-aliasing* yang halus untuk ukuran font UI standar.
- **Font Utama UI**: `'Tahoma', 'MS Sans Serif', 'Geneva', sans-serif` pada ukuran ketat `11px` atau `12px`.
- **Font Data & Log**: `'Lucida Console', 'Courier New', monospace` pada ukuran `12px`.
- **Aturan Fokus Keyboard**: Gunakan `outline: 1px dotted #000000; outline-offset: -3px;` di dalam tombol saat difokuskan (persis seperti tombol native Windows klasik).

---

### 2.3 Sistem Border Bevel 3D (Sunken & Raised)

Alih-alih menggunakan bayangan CSS modern, seluruh komponen dibangun di atas tiga primitif border:
1. **Raised Panel / Button (Timbul)**: Digunakan pada jendela aplikasi, tombol aksi (`Generate`, `Save to Disk`, `Browse...`), dan tab aktif. Saat tombol ditekan (`:active`), urutan warna border dibalik sehingga terlihat melesak ke dalam, dan teks bergeser `1px` ke kanan-bawah.
2. **Sunken Well (Cekung ke Dalam)**: Digunakan pada `textarea`, input hex, kanvas pratinjau QR, daftar tabel `Recent Activity`, dan bilah status bawah.
3. **Etched GroupBox (`<fieldset>` & `<legend>`)**: Menggantikan kartu modern (`div` dengan `shadow-sm`). Semua pengelompokan pengaturan (seperti *Color Palette*, *Matrix Resolution*, *Error Correction*) wajib dibungkus dengan `<fieldset>` berbingkai garis ukir (*etched groove*) dan judul `<legend>` di sudut kiri atasnya.

---

## 3. Transformasi Arsitektur Komponen

Berikut adalah pemetaan perubahan dari struktur berkas yang ada di `DOKUMENTASI.md` menjadi komponen bergaya tahun 2000-an:

| Komponen Lama | Transformasi Retro Early 2000s |
| :--- | :--- |
| `App.tsx` | Berubah menjadi kontainer **Main Application Window (`PPLQR_STUDIO.EXE`)** di atas kanvas desktop `#008080`, lengkap dengan *Title Bar*, *Menu Bar*, *Toolbar*, *Tab Control*, dan *Status Bar*. |
| `Navbar.tsx` + `HeroSection.tsx` | Digabung & diganti menjadi **Window Title Bar + Classic Menu Bar + Folder Tab Strip** (`[ Generator ]` `[ Image Scanner ]` `[ Activity Log ]`). |
| `GeneratorPanel.tsx` | Menggunakan `<fieldset>` (*GroupBox*) untuk memisahkan grup kontrol: **Data Source**, **Matrix Parameters**, dan **Color Table**. Slider modern diganti dengan track cekung dan *thumb* persegi panjang 3D. |
| `QRPreview.tsx` | Dirancang seperti **Hardware Preview Viewport**. Memiliki bingkai cekung gelap, penggaris piksel (*pixel ruler* di tepi X/Y), indikator LED hijau (`READY` / `RENDERING`), serta tombol dengan ikon *Floppy Disk* (`Save .PNG`). |
| `UploadDropzone.tsx` | Dihapus istilah dropzone modern; diubah menjadi **"Image Acquisition Bay"** bergaya perangkat pemindai flatbed (TWAIN Scanner UI) dengan tombol tegas `Browse Local Disk...` dan pratinjau *bounding box* bergaya bidikan terminal. |
| `RecentActivity.tsx` | Diubah dari daftar kartu modern menjadi **System Log Table (`ListView`)** dengan kolom berbatas tegas: `Time`, `Action`, `Type`, `Resolution`, `Payload`, yang dapat diklik seperti tabel detail Windows Explorer klasik. |
| `AboutModal.tsx` | Diubah menjadi kotak dialog **`System Properties / About PPLQR.EXE`** yang dapat digeser (*draggable*), menampilkan penggunaan memori lokal, spesifikasi engine `qrcode` & `jsQR`, dan tombol `OK` berbingkai tebal di bagian bawah. |
| `Footer.tsx` | Diganti menjadi **Window Status Bar** 3 panel cekung di bagian paling bawah jendela: Panel 1 (`Status: Ready / 100% Local Execution`), Panel 2 (`Mem: Client-Side RAM`), Panel 3 (`Engine: ISO/IEC 18004`) beserta * diagonal resize grip* di pojok kanan bawah. |

---

## 4. Spesifikasi Implementasi CSS (`src/index.css`)

Gunakan konfigurasi utilitas CSS berikut untuk menggantikan *styling* modern pada `src/index.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    --win-bg: #D4D0C8;
    --win-desktop: #008080;
    --win-title-start: #0A246A;
    --win-title-end: #A6CAF0;
    --win-text: #000000;
    --win-hilite: #FFFFFF;
    --win-light: #DFDFDF;
    --win-shadow: #808080;
    --win-dkshadow: #000000;
    --win-selection: #0A246A;
  }

  * {
    border-radius: 0px !important;
    box-sizing: border-box;
  }

  body {
    background-color: var(--win-desktop);
    color: var(--win-text);
    font-family: 'Tahoma', 'MS Sans Serif', 'Verdana', sans-serif;
    font-size: 11px;
    line-height: 1.3;
    -webkit-font-smoothing: none;
    margin: 0;
    padding: 0;
    user-select: none;
  }
}

/* Primitif 3D Bevel Khas Early 2000s */
.win-window {
  background-color: var(--win-bg);
  border-top: 2px solid var(--win-light);
  border-left: 2px solid var(--win-light);
  border-right: 2px solid var(--win-dkshadow);
  border-bottom: 2px solid var(--win-dkshadow);
  box-shadow: inset 1px 1px 0px var(--win-hilite), inset -1px -1px 0px var(--win-shadow);
}

.win-raised, .win-button {
  background-color: var(--win-bg);
  border-top: 1px solid var(--win-hilite);
  border-left: 1px solid var(--win-hilite);
  border-right: 1px solid var(--win-dkshadow);
  border-bottom: 1px solid var(--win-dkshadow);
  box-shadow: inset 1px 1px 0px var(--win-light), inset -1px -1px 0px var(--win-shadow);
}

.win-button:active:not(:disabled), .win-button-pressed {
  border-top: 1px solid var(--win-dkshadow);
  border-left: 1px solid var(--win-dkshadow);
  border-right: 1px solid var(--win-hilite);
  border-bottom: 1px solid var(--win-hilite);
  box-shadow: inset 1px 1px 0px var(--win-shadow);
  padding-top: 2px;
  padding-left: 2px;
}

.win-button:focus-visible {
  outline: 1px dotted #000000;
  outline-offset: -4px;
}

.win-sunken {
  background-color: #FFFFFF;
  border-top: 1px solid var(--win-shadow);
  border-left: 1px solid var(--win-shadow);
  border-right: 1px solid var(--win-hilite);
  border-bottom: 1px solid var(--win-hilite);
  box-shadow: inset 1px 1px 0px var(--win-dkshadow), inset -1px -1px 0px var(--win-light);
}

.win-status-pane {
  background-color: var(--win-bg);
  border-top: 1px solid var(--win-shadow);
  border-left: 1px solid var(--win-shadow);
  border-right: 1px solid var(--win-hilite);
  border-bottom: 1px solid var(--win-hilite);
}

.win-groupbox {
  border: 1px solid var(--win-shadow);
  box-shadow: 1px 1px 0px var(--win-hilite), inset 1px 1px 0px var(--win-hilite);
  padding: 10px 8px 8px 8px;
  margin-top: 6px;
}

.win-groupbox > legend {
  padding: 0 4px;
  margin-left: 6px;
  font-weight: bold;
  color: #000000;
}

.win-titlebar {
  background: linear-gradient(90deg, var(--win-title-start) 0%, var(--win-title-end) 100%);
  color: #FFFFFF;
  font-weight: bold;
  padding: 3px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## 5. Rekomendasi Pengembangan Fitur & Teknis

Selain perombakan visual menjadi *Authentic Early 2000s*, berikut adalah rekomendasi pengembangan bernilai tinggi yang selaras dengan filosofi **100% Client-Side, Zero-Server Leakage, dan Utilitas Kelas Pro**:

### 5.1 Fitur Pemindai Cepat via Clipboard (`Ctrl + V` Global Paste)
- **Masalah Saat Ini**: Pengguna harus menyimpan tangkapan layar (*screenshot*) menjadi file gambar terlebih dahulu, lalu mengunggahnya ke `UploadDropzone`.
- **Solusi**: Tambahkan *event listener* global `window.addEventListener('paste', ...)` pada modul Scanner. Ketika pengguna menekan `Ctrl+V` setelah melakukan *Snipping Tool* / *PrintScreen*, gambar dari clipboard langsung diproses oleh `scanQRCodeFromImageFile` tanpa perlu menyentuh penyimpanan hard disk.

### 5.2 Mode Ekspor "ASCII / ANSI Terminal QR" & ".BMP"
- **Konsep**: Sangat serasi dengan tema awal 2000-an! Selain mengunduh `.PNG`, gunakan fungsi `QRCode.create(content)` untuk membaca array matriks bit (`modules.data`), lalu konversikan menjadi blok teks karakter ASCII/ANSI (`█`, `▀`, `▄`, ` `) yang bisa langsung disalin ke file `.TXT`, dokumen `README.md`, atau *NFO file* klasik.
- **Format `.SVG` Murni**: Tambahkan tombol ekspor `.SVG` menggunakan `QRCode.toString(content, { type: 'svg' })` yang sudah tersedia di dalam library `qrcode` tanpa perlu menambah dependensi baru.

### 5.3 Visualisasi Kotak Deteksi (Finder Pattern Bounding Box) pada Scanner
- **Masalah Saat Ini**: Ketika pengguna memindai foto di `qrScanner.ts`, hasil objek `jsQR` sebenarnya mengembalikan koordinat `code.location` (`topLeftCorner`, `topRightCorner`, `bottomLeftCorner`, `bottomRightCorner`), namun data lokasi tersebut saat ini dibuang begitu saja.
- **Solusi**: Gambarlah garis poligon hijau terang (`#00FF00`) dan titik bidik merah di atas kanvas pratinjau gambar yang diunggah tepat mengelilingi posisi QR Code yang terdeteksi. Ini memberikan kepuasan visual instan layaknya *software computer vision* awal 2000-an.

### 5.4 Pemrosesan Scanner di Dalam Web Worker
- **Masalah Saat Ini**: `scanQRCodeFromImageFile` mengeksekusi `jsQR` pada *Main UI Thread*. Untuk foto 2048px yang rumit dan harus melewati *Dual-Pass Rescaling*, antarmuka peramban dapat membeku (*freeze*) selama 150–400ms.
- **Solusi**: Pindahkan fungsi dekode `jsQR(imageData.data, width, height)` ke dalam **Web Worker** khusus (`qrScanner.worker.ts`) menggunakan pengiriman *Transferable Objects* (`imageData.data.buffer`). UI akan tetap 100% responsif pada 60fps.

### 5.5 Generator Payload Terstruktur (Structured Builders)
Tanpa merusak kesederhanaan, tambahkan *dropdown* "Wizard / Template" bergaya klasik untuk membuat struktur string standar secara otomatis:
- **Wi-Fi Access Point**: Input `SSID`, `Password`, dan tipe enkripsi (`WPA/WPA2`, `WEP`, `None`) $\rightarrow$ menghasilkan format `WIFI:T:WPA;S:nama;P:sandi;;`.
- **vCard 2.1 Contact**: Format kartu nama elektronik era 2000-an yang langsung dapat disimpan ke buku telepon ponsel saat dipindai.

### 5.6 Ekspor & Impor Log Aktivitas (`.LOG` / `.CSV`)
- Di bagian bawah tabel **Recent Activity**, sediakan tombol kecil `Export .LOG` yang mengunduh riwayat pemindaian dan pembuatan QR dalam format teks log ber-timestamp (mirip log aplikasi `HijackThis` atau `ImgBurn`).

---

## 6. Daftar Periksa Eksekusi (Action Plan)

Jika kamu setuju dengan rancangan di atas, kita dapat mengeksekusi perubahan kode secara bertahap dengan urutan berikut:

1. **Tahap 1 — Fondasi Visual (`index.html` & `src/index.css`)**:
   - Menghapus Google Fonts `Plus Jakarta Sans`, menerapkan sistem kelas CSS `.win-window`, `.win-raised`, `.win-sunken`, dan `.win-groupbox`.
2. **Tahap 2 — Shell Aplikasi Desktop (`App.tsx`, `Navbar.tsx`, `Footer.tsx`, Hapus `HeroSection.tsx`)**:
   - Merakit bingkai jendela `PPLQR Studio v2.0 (Build 2003)`, *Menu Bar* interaktif, *Tab Strip* bergaya folder klasik, dan *Status Bar* 3-panel di bagian bawah.
3. **Tahap 3 — Modul Generator & Hardware Preview (`GeneratorPanel.tsx` & `QRPreview.tsx`)**:
   - Mengganti preset warna "AI Slop" dengan palet Retro/CRT, menerapkan `<fieldset>` GroupBox, dan menambahkan fitur **ASCII Text QR View** serta **SVG Export**.
4. **Tahap 4 — Modul Scanner & Bounding Box (`ScannerPanel.tsx`, `UploadDropzone.tsx`, `ScanResult.tsx`, `qrScanner.ts`)**:
   - Menambahkan dukungan **Global `Ctrl+V` Paste** dan menggambar **Green Bounding Box** di atas posisi QR Code yang berhasil dipindai.
5. **Tahap 5 — Tabel System Log & Dialog Properties (`RecentActivity.tsx` & `AboutModal.tsx`)**:
   - Mengubah daftar riwayat menjadi tabel *ListView* klasik dan merombak modal informasi menjadi dialog *System Properties*.