const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ────────────────────────────────────────────────────────

function resolveUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

/** Extract all image candidate URLs from an HTML string */
function extractImageUrls(html, baseUrl) {
  const seen = new Set();
  const candidates = [];

  // <img src="...">
  for (const m of html.matchAll(/<img[^>]+?src\s*=\s*["']([^"']+)["']/gi)) {
    const u = resolveUrl(m[1], baseUrl);
    if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'src' }); }
  }

  // <img srcset="...">
  for (const m of html.matchAll(/<img[^>]+?srcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const u = resolveUrl(part.trim().split(/\s+/)[0], baseUrl);
      if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'srcset' }); }
    }
  }

  // <img data-src="..."> / data-original="..." (lazy-load)
  for (const attr of ['data-src', 'data-original', 'data-lazy-src', 'data-srcset']) {
    const re = new RegExp(`<img[^>]+?${attr}\\s*=\\s*["']([^"']+)["']`, 'gi');
    for (const m of html.matchAll(re)) {
      const u = resolveUrl(m[1], baseUrl);
      if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: attr }); }
    }
  }

  // <source srcset="..."> inside <picture>
  for (const m of html.matchAll(/<source[^>]+?srcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const u = resolveUrl(part.trim().split(/\s+/)[0], baseUrl);
      if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'picture/srcset' }); }
    }
  }

  // CSS url() in inline style
  for (const m of html.matchAll(/style\s*=\s*["']([^"']*url\(["']?([^)"']+)["']?\)[^"']*)["']/gi)) {
    const u = resolveUrl(m[2], baseUrl);
    if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'inline-css' }); }
  }

  // background / background-image in style attr
  for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\(["']?([^)"']+)["']?\)/gi)) {
    const u = resolveUrl(m[1], baseUrl);
    if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'background-css' }); }
  }

  // <link rel="icon"> / <link rel="apple-touch-icon">
  for (const m of html.matchAll(/<link[^>]+?rel\s*=\s*["'](?:icon|apple-touch-icon|shortcut icon)[^"']*["'][^>]*?href\s*=\s*["']([^"']+)["']/gi)) {
    const u = resolveUrl(m[1], baseUrl);
    if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'favicon' }); }
  }

  // og:image meta
  for (const m of html.matchAll(/<meta[^>]+?property\s*=\s*["']og:image["'][^>]*?content\s*=\s*["']([^"']+)["']/gi)) {
    const u = resolveUrl(m[1], baseUrl);
    if (u && !seen.has(u)) { seen.add(u); candidates.push({ url: u, source: 'og:image' }); }
  }

  return candidates;
}

/** Fetch with redirect following and timeout, returns { status, redirectedUrl, error? } */
async function fetchHead(imgUrl, timeoutMs = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(imgUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
      },
    });
    clearTimeout(t);
    return {
      status: resp.status,
      redirectedUrl: resp.url,
      contentType: resp.headers.get('content-type') || '',
      contentLength: parseInt(resp.headers.get('content-length') || '0', 10),
    };
  } catch (err) {
    clearTimeout(t);
    return { status: 0, error: err.message, redirectedUrl: imgUrl };
  }
}

/** Decide status label from check result */
function classify(status, error) {
  if (error) {
    const msg = error.toLowerCase();
    if (msg.includes('timeout') || msg.includes('abort')) return { label: 'TIMEOUT', cls: 'warn', icon: '⏱️' };
    if (msg.includes('fetch failed') || msg.includes('econnrefused') || msg.includes('enotfound')) return { label: 'GAGAL KONEKSI', cls: 'error', icon: '🔌' };
    return { label: 'ERROR', cls: 'error', icon: '❌' };
  }
  if (status >= 200 && status < 300) return { label: 'OK', cls: 'ok', icon: '✅' };
  if (status >= 300 && status < 400) return { label: 'REDIRECT', cls: 'warn', icon: '↪️' };
  if (status === 403) return { label: 'FORBIDDEN', cls: 'warn', icon: '🚫' };
  if (status === 404) return { label: 'NOT FOUND', cls: 'error', icon: '❌' };
  if (status >= 400 && status < 500) return { label: 'CLIENT ERROR', cls: 'error', icon: '⚠️' };
  if (status >= 500) return { label: 'SERVER ERROR', cls: 'error', icon: '💥' };
  return { label: 'UNKNOWN', cls: 'warn', icon: '❓' };
}

// ── API ─────────────────────────────────────────────────────────────

app.post('/api/check', async (req, res) => {
  const { url: targetUrl } = req.body;
  if (!targetUrl) return res.status(400).json({ error: 'URL diperlukan' });

  let normalized = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;

  let baseUrl;
  try { baseUrl = new URL(normalized); } catch {
    return res.status(400).json({ error: 'URL tidak valid' });
  }

  // Fetch the page
  let html;
  let pageStatus;
  let pageError = null;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000);
    const resp = await fetch(normalized, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
    });
    clearTimeout(t);
    pageStatus = resp.status;
    html = await resp.text();
  } catch (err) {
    return res.json({
      url: normalized,
      pageStatus: 0,
      pageError: err.message,
      totalImages: 0,
      ok: 0, broken: 0, warn: 0,
      images: [],
    });
  }

  const candidates = extractImageUrls(html, normalized);

  // Deduplicate (URLs only) keeping first source
  const deduped = [];
  const seenUrls = new Set();
  for (const c of candidates) {
    if (!seenUrls.has(c.url) && deduped.length < 200) {
      seenUrls.add(c.url);
      deduped.push(c);
    }
  }

  // Check each image concurrently in batches
  const BATCH = 10;
  const results = [];
  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH);
    const batchResults = await Promise.allSettled(
      batch.map(async (c) => {
        const r = await fetchHead(c.url);
        const cls = classify(r.status, r.error);
        return {
          url: c.url,
          source: c.source,
          status: r.status,
          error: r.error || null,
          contentType: r.contentType || '',
          contentLength: r.contentLength || 0,
          redirectedUrl: r.redirectedUrl !== c.url ? r.redirectedUrl : null,
          label: cls.label,
          cls: cls.cls,
          icon: cls.icon,
        };
      })
    );
    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
      else results.push({ url: batch[batchResults.indexOf(r)]?.url || '?', status: 0, error: r.reason?.message || 'Unknown', label: 'ERROR', cls: 'error', icon: '❌' });
    }
  }

  const ok = results.filter(r => r.cls === 'ok').length;
  const broken = results.filter(r => r.cls === 'error').length;
  const warn = results.filter(r => r.cls === 'warn').length;

  return res.json({
    url: normalized,
    pageStatus,
    pageError: null,
    totalImages: results.length,
    ok, broken, warn,
    images: results,
  });
});

app.listen(PORT, () => {
  console.log(`🔍 Link Checker berjalan di http://localhost:${PORT}`);
});
