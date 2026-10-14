// B4 — Foto di Andrea con punto focale; viso intero a 390, 768 e 1440 px. Per ogni pagina che mostra la foto:
// calcola quale parte dell'immagine è visibile (object-fit e object-position veri, contenitori che tagliano) e
// controlla che il riquadro del viso (riferimento/foto-andrea.json) sia tutto dentro. Screenshot in verifica/volto/.
import fs from 'node:fs';
import { serviDist } from './lib/server.mjs';
import { apri, pagina } from './lib/browser.mjs';

const info = JSON.parse(fs.readFileSync('riferimento/foto-andrea.json', 'utf8')).foto[0];
const NOME = 'andrea-ritratto';
const PAGINE = [['/', '#chi-sono .chi-foto'], ['/chi-sono/', '.chi-foto'], ['/contatti/', '.contatti-foto']];
fs.mkdirSync('verifica/volto', { recursive: true });
const { base, chiudi } = await serviDist();
const browser = await apri();
const errori = [];
for (const [u, contenitore] of PAGINE) for (const w of [390, 768, 1440]) for (const tema of ['dark', 'light']) {
  const { p, ctx } = await pagina(browser, base + u, { larghezza: w, tema, movimento: 'reduce' });
  const el = p.locator(`${contenitore} img[src*="${NOME}"]`).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const r = await el.evaluate((img, viso) => {
    const b = img.getBoundingClientRect();
    const s = getComputedStyle(img);
    const nw = img.naturalWidth, nh = img.naturalHeight;
    const scala = s.objectFit === 'cover' ? Math.max(b.width / nw, b.height / nh) : s.objectFit === 'contain' ? Math.min(b.width / nw, b.height / nh) : b.width / nw;
    const [px, py] = s.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const dx = (b.width - nw * scala) * px, dy = (b.height - nh * scala) * py;
    // il viso in coordinate dello schermo (le misure del json sono sull'originale 1289×1660)
    const k = nw / 1289;
    const f = { l: b.left + dx + viso.x * k * scala, t: b.top + dy + viso.y * k * scala, r: b.left + dx + (viso.x + viso.w) * k * scala, b: b.top + dy + (viso.y + viso.h) * k * scala };
    // area visibile: l'immagine stessa e ogni contenitore che taglia
    let v = { l: b.left, t: b.top, r: b.right, b: b.bottom };
    for (let a = img.parentElement; a && a !== document.body; a = a.parentElement) {
      const sa = getComputedStyle(a);
      if (sa.overflow === 'visible' && sa.overflowX === 'visible' && sa.overflowY === 'visible') continue;
      const ba = a.getBoundingClientRect();
      v = { l: Math.max(v.l, ba.left), t: Math.max(v.t, ba.top), r: Math.min(v.r, ba.right), b: Math.min(v.b, ba.bottom) };
    }
    const intero = f.l >= v.l - 1 && f.t >= v.t - 1 && f.r <= v.r + 1 && f.b <= v.b + 1;
    return { intero, fit: s.objectFit, pos: s.objectPosition, box: `${Math.round(b.width)}×${Math.round(b.height)}`, viso: `${Math.round(f.r - f.l)}×${Math.round(f.b - f.t)}` };
  }, info.viso);
  const file = `verifica/volto/${u === '/' ? 'home' : u.replace(/\//g, '')}-${w}-${tema === 'dark' ? 'scuro' : 'chiaro'}.png`;
  await p.locator(contenitore).first().screenshot({ path: file });
  if (!r.intero) errori.push(`${u} ${w}px ${tema}`);
  console.log(`  ${r.intero ? '✓' : '✗'} ${u.padEnd(11)} ${String(w).padStart(4)} px ${tema === 'dark' ? 'scuro' : 'chiaro'}: foto ${r.box} (${r.fit}, ${r.pos}), viso ${r.viso} ${r.intero ? 'intero' : 'TAGLIATO'} → ${file}`);
  await ctx.close();
}
await browser.close();
await chiudi();
console.log(`B4: punto focale «${info.punto_focale}», ${errori.length ? 'viso tagliato in: ' + errori.join(', ') : 'viso intero in tutte le ' + PAGINE.length * 6 + ' prove'}`);
process.exit(errori.length ? 1 : 0);
