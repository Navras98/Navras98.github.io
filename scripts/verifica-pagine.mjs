// C1 — Esistono tutte le pagine richieste: Home, Metodo, Strumenti, Open source, Chi sono, Contatti, Privacy, 404,
// le quattro pagine progetto, l'archivio della newsletter e tutti i numeri.
import fs from 'node:fs';
import { serviDist } from './lib/server.mjs';

const numeri = fs.readdirSync('src/content/newsletter').filter((f) => f.endsWith('.md')).map((f) => `/newsletter/numeri/${f.slice(0, -3)}/`);
const richieste = ['/', '/metodo/', '/strumenti/', '/open-source/', '/chi-sono/', '/contatti/', '/privacy/', '/progetti/', '/progetti/sfornaclaw/', '/progetti/privacybridge/', '/progetti/automazioni/', '/progetti/agenti-personali/', '/newsletter/', '/newsletter/ultimo/', '/newsletter/confermato/', '/newsletter/link-non-valido/', '/en/newsletter/', '/newsletter/numeri.json', '/sitemap.xml', ...numeri];
const { base, chiudi } = await serviDist();
let errori = 0;
for (const u of richieste) {
  const r = await fetch(base + u, { redirect: 'manual' });
  const ok = r.status === 200;
  if (!ok) errori++;
  console.log(`  ${ok ? '✓' : '✗'} ${r.status} ${u}`);
}
const r404 = await fetch(base + '/questa-pagina-non-esiste/');
const t404 = await r404.text();
const ok404 = r404.status === 404 && t404.includes('404');
if (!ok404) errori++;
console.log(`  ${ok404 ? '✓' : '✗'} ${r404.status} /questa-pagina-non-esiste/ → pagina 404 del sito`);
await chiudi();
console.log(`C1: ${richieste.length + 1} indirizzi controllati, ${numeri.length} numeri della newsletter, ${errori} errori`);
process.exit(errori ? 1 : 0);
