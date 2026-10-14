// D1 — Per OGNI pagina: cambiare una foto e un testo solo dal suo file in src/content/ cambia solo quella foto e
// quel testo nella build. Per ogni pagina: copia la foto con i colori invertiti (stesse dimensioni) in
// public/media/prova-d1/, la mette al posto dell'originale nel file della pagina, cambia un testo, ricostruisce
// il sito a parte e confronta OGNI file della build con quella di partenza. Poi rimette tutto com'era.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { load, dump } from 'js-yaml';
import { costruisci } from './lib/prova-build.mjs';
import { tipografia } from '../src/lib/caricatore.js';

const PAGINE = [
  ['/', 'pagine/home.yml', ['apertura', 'testo'], ['chi_sono', 'foto']],
  ['/metodo/', 'pagine/metodo.yml', ['apertura', 'testo'], ['fasi', 'voci', 2, 'immagine']],
  ['/progetti/', 'pagine/progetti.yml', ['apertura', 'testo'], ['seo', 'immagine']],
  ['/progetti/sfornaclaw/', 'progetti/sfornaclaw.md', ['apertura', 'testo'], ['galleria', 'voci', 0, 'immagine']],
  ['/progetti/privacybridge/', 'progetti/privacybridge.md', ['apertura', 'testo'], ['galleria', 'voci', 0, 'immagine']],
  ['/progetti/automazioni/', 'progetti/automazioni.md', ['apertura', 'testo'], ['galleria', 'voci', 0, 'immagine']],
  ['/progetti/agenti-personali/', 'progetti/agenti-personali.md', ['apertura', 'testo'], ['galleria', 'voci', 0, 'immagine']],
  ['/strumenti/', 'pagine/strumenti.yml', ['apertura', 'testo'], ['schede', 'voci', 0, 'immagine']],
  ['/open-source/', 'pagine/open-source.yml', ['apertura', 'testo'], ['progetto_mio', 'immagine']],
  ['/chi-sono/', 'pagine/chi-sono.md', ['percorso', 'voci', 0, 'testo'], ['apertura', 'foto']],
  ['/contatti/', 'pagine/contatti.yml', ['apertura', 'testo'], ['apertura', 'foto']],
  ['/privacy/', 'pagine/privacy.md', ['aggiornata'], ['seo', 'immagine']],
  ['/404.html', 'pagine/errore-404.yml', ['testo'], ['seo', 'immagine']],
  ['/newsletter/', 'pagine/newsletter.yml', ['apertura', 'testo'], ['seo', 'immagine']],
  ['/en/newsletter/', 'pagine/newsletter-en.yml', ['apertura', 'testo'], ['seo', 'immagine']],
  // l'ultimo numero: i titoli delle sue notizie compaiono, voluti, anche nelle anteprime di home e newsletter
  ['/newsletter/numeri/2026-09-11/', 'newsletter/2026-09-11.md', ['articoli', 0, 'titolo'], ['copertina'], ['index.html', 'newsletter/index.html', 'en/newsletter/index.html', 'newsletter/link-non-valido/index.html']],
];
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prendi = (o, p) => p.reduce((x, k) => x[k], o);
const metti = (o, p, v) => { prendi(o, p.slice(0, -1))[p.at(-1)] = v; };
const tuttiFile = (d) => { const out = []; const g = (c) => { for (const v of fs.readdirSync(c, { withFileTypes: true })) { const f = path.join(c, v.name); if (v.isDirectory()) g(f); else if (/\.(html|xml|json|txt|webmanifest)$/.test(v.name)) out.push(path.relative(d, f)); } }; g(d); return out.sort(); };
const leggiContenuto = (f) => { const t = fs.readFileSync(f, 'utf8'); if (!f.endsWith('.md')) return { dati: load(t), corpo: null }; const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/); return { dati: load(m[1]), corpo: m[2] }; };
const scriviContenuto = (f, { dati, corpo }) => fs.writeFileSync(f, corpo === null ? dump(dati, { lineWidth: -1 }) : `---\n${dump(dati, { lineWidth: -1 })}---\n${corpo}`);
const pagina = (u) => (u.endsWith('.html') ? u.slice(1) : path.join(u.slice(1), 'index.html'));

const impronte = () => execFileSync('git', ['hash-object', ...fs.readdirSync('src/content', { recursive: true }).map((f) => path.join('src/content', f)).filter((f) => fs.statSync(f).isFile())], { encoding: 'utf8' });
const primaImpronte = impronte();
execFileSync('node', ['scripts/media.mjs'], { stdio: 'ignore' });
const base = costruisci();
if (!base.ok) { console.log('la build di partenza non riesce'); process.exit(1); }
const fileBase = tuttiFile(base.cartella);
let falliti = 0;
fs.mkdirSync('public/media/prova-d1', { recursive: true });
for (const [url, rel, campoTesto, campoImmagine, ancheIn = []] of PAGINE) {
  const file = path.join('src/content', rel);
  const originale = fs.readFileSync(file);
  const c = leggiContenuto(file);
  const vecchioTesto = prendi(c.dati, campoTesto);
  const nuovoTesto = `Frase di prova D1 per la pagina ${url} che deve cambiare soltanto qui`;
  const imm = prendi(c.dati, campoImmagine);
  const vecchiaFoto = imm.src;
  const nuovaFoto = `/media/prova-d1/${path.basename(vecchiaFoto)}`;
  let esito;
  try {
    await sharp(path.join('public', vecchiaFoto)).negate({ alpha: false }).toFile(path.join('public', nuovaFoto));
    metti(c.dati, campoTesto, nuovoTesto);
    metti(c.dati, [...campoImmagine, 'src'], nuovaFoto);
    scriviContenuto(file, c);
    execFileSync('node', ['scripts/media.mjs'], { stdio: 'ignore' });
    esito = costruisci();
  } finally {
    fs.writeFileSync(file, originale);
    fs.rmSync(path.join('public', nuovaFoto), { force: true });
  }
  const problemi = [];
  if (!esito.ok) problemi.push('la build non riesce');
  else {
    const fileNuovi = tuttiFile(esito.cartella);
    if (JSON.stringify(fileNuovi) !== JSON.stringify(fileBase)) problemi.push('l’elenco dei file della build è cambiato');
    const vecchioReso = esc(tipografia(vecchioTesto));
    const fotoVecchia = vecchiaFoto.replace(/\.[^.]+$/, ''), fotoNuova = nuovaFoto.replace(/\.[^.]+$/, '');
    const nuovoReso = esc(tipografia(nuovoTesto));
    const norma = (t) => t.split(nuovoReso).join('«TESTO»').split(vecchioReso).join('«TESTO»').split(fotoNuova).join('«FOTO»').split(fotoVecchia).join('«FOTO»');
    const bersaglio = pagina(url);
    const dopo = fs.readFileSync(path.join(esito.cartella, bersaglio), 'utf8');
    if (!dopo.includes(nuovoReso)) problemi.push('il testo nuovo non compare nella pagina');
    if (!dopo.includes(fotoNuova)) problemi.push('la foto nuova non compare nella pagina');
    let cambiati = 0;
    for (const f of fileBase) {
      const a = fs.readFileSync(path.join(base.cartella, f), 'utf8');
      const b = fs.existsSync(path.join(esito.cartella, f)) ? fs.readFileSync(path.join(esito.cartella, f), 'utf8') : '';
      if (a !== b) cambiati++;
      if (f !== bersaglio && !ancheIn.includes(f) && (b.includes(nuovoReso) || b.includes(fotoNuova))) problemi.push(`il cambio compare anche in ${f}`);
      if (norma(a) !== norma(b)) problemi.push(`${f} cambia anche in altri punti`);
    }
    if (cambiati !== 1 + ancheIn.length) problemi.push(`file della build cambiati: ${cambiati} (atteso ${1 + ancheIn.length})`);
  }
  fs.rmSync(esito.cartella, { recursive: true, force: true });
  if (problemi.length) falliti++;
  console.log(`  ${problemi.length ? '✗' : '✓'} ${url.padEnd(32)} ${rel} → testo «${campoTesto.join('.')}» e foto «${campoImmagine.join('.')}»: ${problemi.length ? problemi.slice(0, 3).join('; ') : ancheIn.length ? `cambiano solo loro, nella pagina e nelle anteprime volute (${ancheIn.join(', ')})` : 'cambiano solo loro, in 1 file della build'}`);
}
fs.rmSync('public/media/prova-d1', { recursive: true, force: true });
execFileSync('node', ['scripts/media.mjs'], { stdio: 'ignore' });
fs.rmSync(base.cartella, { recursive: true, force: true });
const ripristinati = impronte() === primaImpronte;
console.log(`D1: ${PAGINE.length} pagine provate, ${falliti} con cambi indesiderati; file di src/content ${ripristinati ? 'identici a prima della prova' : 'DIVERSI da prima della prova'}`);
process.exit(falliti || !ripristinati ? 1 : 0);
