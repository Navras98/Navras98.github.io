// E4 — Peso della home prima dello scroll ≤ 1,5 MB, e video caricati solo quando servono.
// Misura i byte scaricati (corpo delle risposte, senza compressione: stima per eccesso) a 390 px @3x e 1440 px @2x:
// 1) all'apertura, senza gesti; 2) dopo il primo gesto del mouse o del dito, ancora senza scorrere.
// I video dell'apertura sono sullo schermo e partono da soli poco dopo il caricamento (servono subito, come in ArtCraft);
// i video delle sezioni più in basso non devono essere scaricati prima dello scroll.
import { serviDist } from './lib/server.mjs';
import { apri } from './lib/browser.mjs';

const LIMITE = 1.5 * 1024 * 1024;
const { base, chiudi } = await serviDist();
const browser = await apri();
let problemi = 0;
for (const [w, h, dpr] of [[390, 844, 3], [1440, 900, 2]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: w < 500 });
  const p = await ctx.newPage();
  let tot = 0; const per = {}; const video = new Set();
  p.on('response', async (r) => { try { const n = (await r.body()).length; tot += n; const t = /\.(mp4|webm)$/.test(r.url()) ? 'video' : r.request().resourceType(); if (t === 'video') video.add(new URL(r.url()).pathname); per[t] = (per[t] || 0) + n; } catch {} });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const apertura = new Set(await p.evaluate(() => [...document.querySelectorAll('[data-hero] video source')].map((s) => new URL(s.src).pathname)));
  const fuori = () => [...video].filter((v) => !apertura.has(v));
  const prima = tot, videoPrima = fuori().length;
  const fmt = (n) => `${(n / 1048576).toFixed(2)} MB`;
  const dettaglio = () => Object.entries(per).map(([k, v]) => `${k} ${(v / 1024).toFixed(0)} KB`).join(', ');
  console.log(`  ${prima <= LIMITE && videoPrima === 0 ? '✓' : '✗'} ${w}px @${dpr}x, apertura senza gesti: ${fmt(prima)} (${dettaglio()})${videoPrima ? ' — video delle sezioni scaricati: ' + fuori().join(', ') : ''}`);
  if (prima > LIMITE || videoPrima > 0) problemi++;
  if (w < 500) await p.touchscreen.tap(w / 2, h - 40).catch(() => {}); else { await p.mouse.move(400, 300); await p.mouse.move(420, 320); }
  await p.waitForTimeout(4000);
  const y = await p.evaluate(() => window.scrollY);
  const fuoriDopo = fuori();
  console.log(`  ${tot <= LIMITE && !fuoriDopo.length ? '✓' : '✗'} ${w}px @${dpr}x, dopo il primo gesto (scroll ${y}px): ${fmt(tot)} (${dettaglio()})${fuoriDopo.length ? ' — video delle sezioni scaricati: ' + fuoriDopo.join(', ') : ''}`);
  if (tot > LIMITE || fuoriDopo.length) problemi++;
  await ctx.close();
}
await browser.close();
await chiudi();
console.log(`E4: limite 1,5 MB prima dello scroll e nessun video delle sezioni prima dello scroll, ${problemi} misure fuori regola`);
process.exit(problemi ? 1 : 0);
