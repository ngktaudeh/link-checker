# 🔍 Link Checker

**Cek gambar error, bug, atau rusak di halaman web — tinggal tempel link.**

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Fitur

- 🔗 **Tempel URL** — langsung scan semua gambar di halaman
- 🖼️ **Deteksi multi-source** — `<img src>`, `srcset`, `data-src` (lazy load), `<picture>`, CSS `background-image`, `og:image`, favicon
- 📊 **Kategori jelas** — ✅ OK, ❌ Rusak (404/500/gagal koneksi), ⚠️ Warning (timeout/redirect)
- 🔍 **Filter hasil** — lihat hanya yang broken, warning, atau OK
- 🖼️ **Thumbnail preview** — gambar OK ditampilkan thumbnail-nya
- 📝 **Detail info** — HTTP status, content-type, content-length, redirect chain
- 📋 **Riwayat** — URL yang pernah dicek otomatis tersimpan
- 🌙 **Dark theme** — UI bersih, responsive mobile

## 🚀 Live Demo

🌐 **Langsung pakai:** [ngktaudeh.github.io/link-checker](https://ngktaudeh.github.io/link-checker/)

## 🛠️ Run Lokal

```bash
git clone https://github.com/ngktaudeh/link-checker.git
cd link-checker

# Client-side version — langsung buka di browser:
open docs/index.html

# Atau pakai server (butuh Node.js):
npm install && npm start
# buka http://localhost:3456
```

## 🛠️ Tech Stack

- **Full client-side** — gak butuh backend, jalan di GitHub Pages
- **Vanilla HTML/CSS/JS** — zero dependencies, loading cepat
- **CORS proxy** — auto-fallback ke multiple proxy untuk fetch halaman target
- **Image() API** — ngecek gambar langsung dari browser, tau dimensi & load status
- **Regex parsing** — ekstrak gambar dari `<img>`, `srcset`, `data-src`, `<picture>`, CSS background, `og:image`, favicon

## 📸 Screenshot

![Link Checker Screenshot](screenshot.png)

## 📄 License

MIT — bebas pakai, modifikasi, sebarkan.
