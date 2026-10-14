// C6 — Link interni ed esterni: 0 rotti. Legge ogni pagina della build: href, src, srcset, poster.
// Interni: il file deve esistere e, se c'è un'ancora, l'elemento con quell'id deve esistere nella pagina di arrivo.
// Esterni: richiesta vera (HEAD, poi GET con un browser se il sito rifiuta i programmi automatici).
import fs from 'node:fs';
import { chromium } from 'playwright';
import { serviDist, pagineDist } from './lib/server.mjs';

const SOLO_INTERNI = process.argv.includes('--solo-interni');
const SITO = 'https://navras98.github.io';
const { base, chiudi } = await serviDist();
const pagine = pagineDist();
const html = new Map();
const interni = new Map(); // percorso → pagine che lo usano
const esterni = new Map();
const ancore = [];
const aggiungi = (m, k, da) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(da); };
for (const p of pagine) {
  const t = await (await fetch(base + p)).text();
  html.set(p, t);
  const valori = [...t.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)].map((m) => m[1]);
  // anche gli indirizzi nelle meta (immagine e indirizzo di condivisione)
  for (const m of t.matchAll(/<meta [^>]*content="(https?:\/\/[^"\s]+)"/g)) valori.push(m[1]);
  for (const s of t.matchAll(/\ssrcset="([^"]+)"/g)) for (const parte of s[1].split(',')) valori.push(parte.trim().split(/\s+/)[0]);
  for (let v of valori) {
    v = v.replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|data:|javascript:)/.test(v)) continue;
    let u = new URL(v, base + p);
    // gli indirizzi assoluti del sito pubblicato (canonico, condivisione) si controllano sulla build
    if (u.origin === SITO) u = new URL(u.pathname + u.search + u.hash, base);
    if (u.origin === base) {
      aggiungi(interni, u.pathname, p);
      if (u.hash && u.hash.length > 1) ancore.push({ da: p, a: u.pathname, id: decodeURIComponent(u.hash.slice(1)) });
    } else if (/^https?:/.test(u.protocol)) aggiungi(esterni, u.href, p);
  }
}
const rotti = [];
for (const [u, da] of interni) {
  const r = await fetch(base + u, { method: 'HEAD' });
  if (r.status !== 200) rotti.push(`interno ${r.status} ${u} (in ${[...da].slice(0, 3).join(', ')})`);
}
for (const a of ancore) {
  let t = html.get(a.a);
  if (t === undefined) { const r = await fetch(base + a.a); t = r.ok ? await r.text() : ''; }
  if (!new RegExp(`\\sid="${a.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(t)) rotti.push(`ancora #${a.id} assente in ${a.a} (link in ${a.da})`);
}
console.log(`C6: ${pagine.length} pagine, ${interni.size} indirizzi interni, ${ancore.length} ancore, ${esterni.size} indirizzi esterni`);
let browser;
const esito = [];
if (!SOLO_INTERNI) {
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
  const prova = async (u) => {
    for (const metodo of ['HEAD', 'GET']) {
      try {
        const r = await fetch(u, { method: metodo, redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
        if (r.status < 400) return { stato: r.status, come: metodo };
        if (metodo === 'GET' && ![401, 403, 405, 429, 999].includes(r.status)) return { stato: r.status, come: metodo };
      } catch (e) { if (metodo === 'GET') return { stato: 'errore', come: e.message }; }
    }
    // alcuni siti (social) rifiutano i programmi: si apre la pagina in un browser vero
    browser ??= await chromium.launch();
    const p = await browser.newPage({ userAgent: UA });
    try {
      const r = await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const s = r?.status() ?? 0;
      return { stato: s, come: 'browser' };
    } catch (e) { return { stato: 'errore', come: 'browser ' + e.message.slice(0, 60) }; }
    finally { await p.close(); }
  };
  const coda = [...esterni.keys()];
  const lavora = async () => { while (coda.length) { const u = coda.shift(); const r = await prova(u); esito.push({ u, ...r }); } };
  await Promise.all(Array.from({ length: 6 }, lavora));
  for (const e of esito.sort((a, b) => a.u.localeCompare(b.u))) {
    const ok = typeof e.stato === 'number' && e.stato < 400;
    console.log(`  ${ok ? '✓' : '✗'} ${e.stato} ${e.u} (${e.come})`);
    if (!ok) rotti.push(`esterno ${e.stato} ${e.u} (in ${[...esterni.get(e.u)].slice(0, 2).join(', ')})`);
  }
  await browser?.close();
}
await chiudi();
if (rotti.length) { console.log(rotti.map((r) => '  ✗ ' + r).join('\n')); console.log(`C6: ${rotti.length} link rotti`); process.exit(1); }
console.log(`C6: 0 link rotti (${interni.size} interni, ${ancore.length} ancore${SOLO_INTERNI ? '' : `, ${esterni.size} esterni`})`);
fs.mkdirSync('verifica', { recursive: true });
