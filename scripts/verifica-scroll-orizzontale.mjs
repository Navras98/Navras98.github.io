// B6 — Nessuno scorrimento orizzontale da 320 a 1920 px su nessuna pagina (320, 390, 768, 1024, 1440, 1920).
import { serviDist, pagineDist } from './lib/server.mjs';
import { apri, pagina, scorriTutta, LARGHEZZE } from './lib/browser.mjs';

const { base, chiudi } = await serviDist();
const browser = await apri();
const problemi = [];
let prove = 0;
for (const u of pagineDist()) {
  for (const w of LARGHEZZE) {
    const { p, ctx } = await pagina(browser, base + u, { larghezza: w });
    await scorriTutta(p);
    const r = await p.evaluate(() => {
      const doc = document.documentElement;
      const largo = doc.scrollWidth - doc.clientWidth;
      // anche gli elementi che escono a destra pur con overflow-x: clip sul documento
      const fuori = [...document.querySelectorAll('main *, header *, footer *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > doc.clientWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.orbita, .archi, .invito-archi, .carosello-nastro, .storie, .indice, .righello, .tendina, .menu-mobile, .sr-only, .tacca, .tacca-foto'); }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} (${Math.round(e.getBoundingClientRect().right)}px)`);
      return { largo, fuori };
    });
    prove++;
    if (r.largo > 0 || r.fuori.length) problemi.push(`${u} a ${w}px: scorrimento ${r.largo}px ${r.fuori.join(', ')}`);
    await ctx.close();
  }
}
await browser.close();
await chiudi();
if (problemi.length) { console.log(problemi.map((x) => '  ✗ ' + x).join('\n')); }
console.log(`B6: ${prove} prove (${prove / LARGHEZZE.length} pagine × ${LARGHEZZE.join(', ')} px), ${problemi.length} con scorrimento orizzontale`);
process.exit(problemi.length ? 1 : 0);
