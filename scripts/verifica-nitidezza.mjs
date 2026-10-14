// Nitidezza di immagini e video: su ogni pagina, a 390 px (3x), 768 px (2x) e 1440 px (2x), confronta i pixel del
// file scelto dal browser con i pixel che lo schermo mostra. Un'immagine ingrandita oltre il 10 % (o un video
// oltre il 15 %) si vede sgranata: è un problema. Le immagini decorative piccole (sotto 120 px mostrati) non contano.
// Uso: node scripts/verifica-nitidezza.mjs [--dettagli]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { serviDist, pagineDist } from './lib/server.mjs';
import { apri, pagina } from './lib/browser.mjs';

// dimensioni vere di ogni video (con «riduci movimento» il browser non li carica: si legge il file)
const DIM = {};
for (const f of fs.readdirSync('public/media/video').filter((x) => /\.(mp4|webm)$/.test(x))) {
  const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', `public/media/video/${f}`], { encoding: 'utf8' }).trim().split(',').map(Number);
  DIM[`/media/video/${f}`] = [w, h];
}
const DETTAGLI = process.argv.includes('--dettagli');
const pagine = pagineDist();
const { base, chiudi } = await serviDist();
const browser = await apri();
const problemi = [];
let misure = 0;
for (const [larghezza, dpr] of [[390, 3], [768, 2], [1440, 2]]) {
  for (const url of pagine) {
    const { p, ctx } = await pagina(browser, base + url, { larghezza, dpr, movimento: 'reduce' });
    // carica tutte le immagini pigre e le copertine dei video
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
    await p.waitForTimeout(400);
    const elenco = await p.evaluate(async ([dpr, DIM]) => {
      const visibile = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[aria-hidden="true"]:not([data-fasi-palco])'); };
      const out = [];
      for (const img of document.querySelectorAll('img')) {
        if (!visibile(img) || !img.naturalWidth || /\.svg($|\?)/.test(img.currentSrc)) continue;
        const r = img.getBoundingClientRect();
        const fit = getComputedStyle(img).objectFit;
        // pixel veri del file scelto dal browser (naturalWidth con srcset è già diviso per la densità)
        const vero = new Image(); vero.src = img.currentSrc;
        try { await vero.decode(); } catch { continue; }
        const nw = vero.naturalWidth, nh = vero.naturalHeight;
        // area davvero occupata dall'immagine dentro il suo riquadro
        const k = fit === 'contain' ? Math.min(r.width / nw, r.height / nh) : fit === 'cover' ? Math.max(r.width / nw, r.height / nh) : r.width / nw;
        // le foto dell'archivio della newsletter sono gli originali spediti (1040 px, non esistono più grandi):
        // per loro vale che non siano mostrate oltre la loro grandezza vera; per tutto il resto serve la densità dello schermo
        const archivio = img.currentSrc.includes('/newsletter/numeri/');
        out.push({ tipo: 'img', src: img.currentSrc.replace(location.origin, ''), mostrata: Math.round(r.width), scala: +(k * (archivio ? 1 : dpr)).toFixed(2) });
      }
      for (const v of document.querySelectorAll('video')) {
        if (!visibile(v) || v.closest('[data-carta]')) continue;
        const r = v.getBoundingClientRect();
        // la sorgente che il browser sceglierebbe: la prima con il «media» che vale per questo schermo
        const sorgente = [...v.querySelectorAll('source')].find((x) => !x.media || matchMedia(x.media).matches);
        const file = new URL(sorgente.src).pathname;
        const [vw, vh] = DIM[file] || [v.videoWidth, v.videoHeight];
        const fit = getComputedStyle(v).objectFit;
        const k = fit === 'cover' ? Math.max(r.width / vw, r.height / vh) : Math.min(r.width / vw, r.height / vh);
        out.push({ tipo: 'video', src: file, mostrata: Math.round(r.width), scala: +(k * dpr).toFixed(2) });
      }
      return out;
    }, [dpr, DIM]);
    for (const x of elenco) {
      if (x.mostrata < 120) continue;
      misure++;
      const limite = x.tipo === 'video' ? 1.15 : 1.1;
      if (x.scala > limite) problemi.push(`${url} a ${larghezza}px @${dpr}x: ${x.tipo} ${x.src} ingrandita ×${x.scala} (mostrata ${x.mostrata} px)`);
      else if (DETTAGLI) console.log(`  ✓ ${url} ${larghezza}px: ${x.src} ×${x.scala}`);
    }
    await ctx.close();
  }
}
await browser.close();
await chiudi();
const unici = [...new Set(problemi)];
unici.forEach((x) => console.log(`  ✗ ${x}`));
console.log(`NITIDEZZA: ${misure} immagini e video misurati su ${pagine.length} pagine × 3 schermi, ${unici.length} ingranditi`);
process.exit(unici.length ? 1 : 0);
