// B3 — Ogni immagine con altezza > larghezza è mostrata intera (cornice verticale o di telefono): su tutte le pagine
// e a tutte le larghezze controlla che non sia tagliata da object-fit né da un contenitore, e che non sia deformata.
import { serviDist, pagineDist } from './lib/server.mjs';
import { apri, pagina, scorriTutta, LARGHEZZE } from './lib/browser.mjs';

const { base, chiudi } = await serviDist();
const browser = await apri();
const problemi = [];
let verticali = 0, prove = 0;
for (const u of pagineDist()) {
  for (const w of LARGHEZZE) {
    const { p, ctx } = await pagina(browser, base + u, { larghezza: w });
    await scorriTutta(p);
    await p.evaluate(async () => { for (const i of document.images) { i.loading = 'eager'; if (!i.complete) await new Promise((ok) => { i.onload = i.onerror = ok; setTimeout(ok, 4000); }); } });
    const r = await p.evaluate(() => {
      const out = { n: 0, errori: [] };
      for (const img of document.images) {
        const b = img.getBoundingClientRect();
        if (!img.naturalWidth || b.width === 0 || b.height === 0 || getComputedStyle(img).display === 'none') continue;
        if (img.naturalHeight <= img.naturalWidth * 1.02) continue;
        out.n++;
        const s = getComputedStyle(img);
        const rn = img.naturalWidth / img.naturalHeight, rb = b.width / b.height;
        const diversi = Math.abs(rn - rb) / rn > 0.02;
        const nome = img.currentSrc.split('/').pop();
        if (diversi && s.objectFit === 'cover') out.errori.push(`${nome}: tagliata (object-fit cover in un riquadro ${Math.round(b.width)}×${Math.round(b.height)})`);
        if (diversi && s.objectFit === 'fill') out.errori.push(`${nome}: deformata`);
        // un contenitore che la taglia (tranne il nastro dei caroselli, che scorre)
        if (!img.closest('[data-nastro]')) {
          for (let a = img.parentElement; a && a !== document.body; a = a.parentElement) {
            const sa = getComputedStyle(a);
            if (sa.overflow === 'visible' && sa.overflowX === 'visible' && sa.overflowY === 'visible') continue;
            const ba = a.getBoundingClientRect();
            if (b.top < ba.top - 1 || b.bottom > ba.bottom + 1 || b.left < ba.left - 1 || b.right > ba.right + 1) { out.errori.push(`${nome}: tagliata dal contenitore ${a.tagName.toLowerCase()}.${[...a.classList].join('.')}`); break; }
          }
        }
      }
      return out;
    });
    verticali += r.n; prove++;
    for (const e of r.errori) problemi.push(`${u} a ${w}px — ${e}`);
    await ctx.close();
  }
}
await browser.close();
await chiudi();
if (problemi.length) console.log([...new Set(problemi)].map((x) => '  ✗ ' + x).join('\n'));
console.log(`B3: ${prove} prove (pagine × ${LARGHEZZE.join(', ')} px), ${verticali} immagini verticali mostrate, ${problemi.length} tagliate o deformate`);
process.exit(problemi.length ? 1 : 0);
