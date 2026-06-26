# 🔍 Link & Page Auditor

**Audit halaman web ala PageSpeed Insights — deteksi error, bug, dan masalah SEO/HTML lengkap dengan skor dan rekomendasi.**

![Node.js](https://img.shields.io/badge/static-html-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

🌐 **Live:** [ngktaudeh.github.io/link-checker](https://ngktaudeh.github.io/link-checker/)

## ✨ Fitur Audit

### 📊 Skor Keseluruhan
Skor 0-100 dengan tampilan donat ala PageSpeed, plus ringkasan Error / Warning / OK / Info.

### 🖼️ Audit Gambar
- Deteksi semua gambar (`<img>`, `srcset`, `data-src`, `<picture>`, CSS `background-image`)
- Cek gambar broken/404/timeout secara real-time
- Deteksi missing `alt` (aksesibilitas)
- Deteksi missing `width`/`height` (CLS / layout shift)
- Deteksi 0×0 dimensi (gambar corrupt)

### 🔗 Audit Tautan
- Hitung total link (internal vs eksternal)
- Deteksi tautan kosong (`#`, `javascript:void(0)`)
- Cek `rel="noopener"` untuk link eksternal

### 📈 SEO & Meta
- Analisis tag `<title>` (panjang, keberadaan)
- Meta description check (panjang optimal 120-160 karakter)
- Viewport meta tag (mobile-friendly)
- Open Graph tags (social sharing)
- Heading hierarchy (H1-H4)
- Canonical URL
- Favicon
- Robots meta

### 🏗️ Struktur HTML
- DOCTYPE check
- `lang` attribute
- Meta charset
- Form input labels
- Render-blocking scripts di `<head>`
- Heading hierarchy validation
- Inline style detection

### ⚡ Performa
- Ukuran halaman
- Jumlah resource eksternal (JS + CSS)
- Google Fonts detection
- Preload hints

## 🚀 Cara Pakai

**Langsung online:** buka [ngktaudeh.github.io/link-checker](https://ngktaudeh.github.io/link-checker/)

**Lokal:**
```bash
git clone https://github.com/ngktaudeh/link-checker.git
cd link-checker
open docs/index.html   # atau langsung buka di browser
```

## 🛠️ Tech

- **100% client-side** — vanilla HTML/CSS/JS, zero dependencies
- **Multi CORS proxy** — auto-fallback untuk fetch halaman target
- **`Image()` API** — cek status gambar langsung dari browser
- **Regex-based parsing** — ekstrak semua elemen tanpa library
- **Deploy ke GitHub Pages** — gratis, CDN, SSL

## 📄 License

MIT
