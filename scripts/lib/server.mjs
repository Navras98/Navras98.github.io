// Server statico che si comporta come GitHub Pages: serve dist/, cerca index.html nelle cartelle,
// reindirizza /cartella → /cartella/ e risponde 404 con dist/404.html quando un file non esiste.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

export function serviDist(cartella = 'dist', porta = 0) {
  const radice = path.resolve(cartella);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);
    let file = path.join(radice, p);
    if (!file.startsWith(radice)) { res.writeHead(400).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + url.search }).end(); return; }
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': TIPI['.html'] });
      res.end(fs.existsSync(path.join(radice, '404.html')) ? fs.readFileSync(path.join(radice, '404.html')) : 'Not found');
      return;
    }
    const dati = fs.readFileSync(file);
    const tipo = TIPI[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    // i video rispondono anche alle richieste parziali (come un server vero)
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range && tipo.startsWith('video/')) {
      const inizio = range[1] ? +range[1] : 0;
      const fine = range[2] ? +range[2] : dati.length - 1;
      res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${inizio}-${fine}/${dati.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': fine - inizio + 1 });
      res.end(dati.subarray(inizio, fine + 1));
      return;
    }
    // come GitHub Pages: i file di testo viaggiano compressi
    if (/text|javascript|json|xml|svg|manifest/.test(tipo) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      const z = zlib.gzipSync(dati);
      res.writeHead(200, { 'Content-Type': tipo, 'Content-Encoding': 'gzip', 'Content-Length': z.length, 'Cache-Control': 'max-age=600' });
      res.end(req.method === 'HEAD' ? undefined : z);
      return;
    }
    res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': dati.length, 'Accept-Ranges': 'bytes', 'Cache-Control': 'max-age=600' });
    res.end(req.method === 'HEAD' ? undefined : dati);
  });
  return new Promise((ok) => server.listen(porta, 'localhost', () => ok({ base: `http://localhost:${server.address().port}`, chiudi: () => new Promise((f) => server.close(f)) })));
}

// Tutte le pagine HTML della build (escluse le pagine di compatibilità del vecchio sito).
export function pagineDist(cartella = 'dist') {
  const vecchi = JSON.parse(fs.readFileSync('src/lib/vecchi-indirizzi.json', 'utf8'));
  const escludi = new Set(Object.keys(vecchi.pagine).map((p) => (p.endsWith('/') ? p : p)));
  const elenco = [];
  const giro = (d) => {
    for (const v of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, v.name);
      if (v.isDirectory()) { if (!['_img', '_astro', 'media', 'fonts'].includes(v.name)) giro(p); }
      else if (v.name.endsWith('.html')) {
        let u = '/' + path.relative(cartella, p).split(path.sep).join('/');
        u = u.replace(/index\.html$/, '');
        if (u === '/404.html') u = '/404.html';
        if (!escludi.has(u) && !/\.dc\.html$/.test(u) && u !== '/newsletter/ultimo/') elenco.push(u);
      }
    }
  };
  giro(cartella);
  return elenco.sort();
}
