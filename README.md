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

## 🚀 Install & Run

```bash
# Clone
git clone https://github.com/Danielsmb/link-checker.git
cd link-checker

# Install
npm install

# Start
npm start
```

Buka `http://localhost:3456` di browser.

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Parsing:** Regex-based HTML image extraction
- **Checking:** HTTP HEAD requests dengan timeout & redirect following

## 📸 Screenshot

![Link Checker Screenshot](screenshot.png)

## 📄 License

MIT — bebas pakai, modifikasi, sebarkan.
