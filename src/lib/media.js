// Informazioni sulle immagini: dimensioni e versioni ottimizzate create da scripts/media.mjs.
import fs from 'node:fs';
import path from 'node:path';

let elenco;
const carica = () => {
  if (!elenco) {
    try { elenco = JSON.parse(fs.readFileSync('src/generated/media.json', 'utf8')); } catch { elenco = {}; }
  }
  return elenco;
};

export function media(src) {
  return carica()[src];
}

// Larghezza e altezza naturali (per gli SVG dal viewBox).
export function dimensioni(src) {
  const info = media(src);
  if (info) return { w: info.width, h: info.height };
  if (/\.svg$/i.test(src)) {
    const t = fs.readFileSync(path.join('public', src), 'utf8');
    const vb = t.match(/viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
    if (vb) return { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
  }
  return { w: 1, h: 1 };
}

// La versione WebP più vicina alla larghezza chiesta (per le copertine dei video).
export function versione(src, larghezza) {
  const v = media(src)?.varianti.webp;
  if (!v?.length) return src;
  return (v.find((x) => x.w >= larghezza) ?? v.at(-1)).url;
}

export const posizione = { centro: '50% 50%', alto: '50% 12%', basso: '50% 100%', sinistra: '0% 50%', destra: '100% 50%' };
