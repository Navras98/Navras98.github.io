// B7 — Screenshot di tutte le pagine a 1440, 768 e 390 px, tema chiaro e scuro → verifica/pagine/
// (<pagina>-<larghezza>-<tema>.png a pagina intera, -schermo.png per la prima schermata).
// Opzioni: PAGINE=/,/metodo/  LARGHEZZE=1440,390  TEMI=dark
import fs from 'node:fs';
import { serviDist, pagineDist } from './lib/server.mjs';
import { apri, pagina, scorriTutta } from './lib/browser.mjs';

const pagine = process.env.PAGINE ? process.env.PAGINE.split(',') : pagineDist();
const larghezze = (process.env.LARGHEZZE || '1440,768,390').split(',').map(Number);
const temi = (process.env.TEMI || 'dark,light').split(',');
const CARTELLA = 'verifica/pagine';
fs.mkdirSync(CARTELLA, { recursive: true });
const nome = (u) => (u === '/' ? 'home' : u.replace(/^\/|\/$/g, '').replace(/\.html$/, '').replace(/\//g, '-'));
const { base, chiudi } = await serviDist();
const browser = await apri();
let n = 0;
for (const u of pagine) for (const tema of temi) for (const w of larghezze) {
  const { p, ctx } = await pagina(browser, base + u, { larghezza: w, tema });
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${CARTELLA}/${nome(u)}-${w}-${tema}-schermo.png` });
  await scorriTutta(p);
  await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; if (!i.complete) await new Promise((ok) => { i.onload = i.onerror = ok; setTimeout(ok, 3000); }); } });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${CARTELLA}/${nome(u)}-${w}-${tema}.png`, fullPage: true });
  n += 2;
  await ctx.close();
}
await browser.close();
await chiudi();
console.log(`B7: ${n} screenshot di ${pagine.length} pagine (${larghezze.join(', ')} px; ${temi.join(', ')}) in ${CARTELLA}/`);
