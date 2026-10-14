// C5 — Ogni indirizzo del vecchio sito (sitemap e file del sito vecchio, /en/ compreso, più i numeri elencati nel
// vecchio numeri.json) risponde con una pagina o con un reindirizzamento verso una pagina: 0 errori 404.
// Il sito vecchio è copiato in riferimento/sito-precedente/ (estratto dal tag git «sito-precedente» prima della
// pubblicazione; la storia completa è nella copia di sicurezza sul Desktop).
import fs from 'node:fs';
import path from 'node:path';
import { serviDist } from './lib/server.mjs';

const VECCHIO = 'riferimento/sito-precedente';
const tutti = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? tutti(path.join(d, e.name)) : [path.join(d, e.name)]));
const leggi = (f) => fs.readFileSync(path.join(VECCHIO, f), 'utf8');
const indirizzi = new Set();
for (const f of tutti(VECCHIO).map((x) => path.relative(VECCHIO, x))) {
  indirizzi.add('/' + f.replace(/(^|\/)index\.html$/, '$1'));
}
for (const m of leggi('sitemap.xml').matchAll(/<loc>https:\/\/navras98\.github\.io([^<]*)<\/loc>/g)) indirizzi.add(m[1] || '/');
for (const n of JSON.parse(leggi('newsletter/numeri.json')).numeri) indirizzi.add(`/newsletter/numeri/${n.slug}/`);
const { base, chiudi } = await serviDist();
const righe = [];
let errori = 0;
for (const u of [...indirizzi].sort()) {
  let r = await fetch(base + u, { redirect: 'follow' });
  let dove = new URL(r.url).pathname;
  let nota = '';
  if (r.status === 200 && /text\/html/.test(r.headers.get('content-type') ?? '')) {
    const t = await r.text();
    const m = t.match(/http-equiv="refresh" content="0; url=([^"]+)"/);
    if (m) {
      const r2 = await fetch(new URL(m[1], base + u).href);
      nota = ` → ${m[1]} (${r2.status})`;
      if (r2.status !== 200) { errori++; nota += ' ROTTO'; }
      dove = m[1];
    }
  }
  if (r.status !== 200) errori++;
  righe.push(`  ${r.status === 200 && !nota.includes('ROTTO') ? '✓' : '✗'} ${r.status} ${u}${nota}`);
}
await chiudi();
console.log(righe.join('\n'));
console.log(`C5: ${indirizzi.size} indirizzi del vecchio sito controllati, ${errori} errori 404`);
process.exit(errori ? 1 : 0);
