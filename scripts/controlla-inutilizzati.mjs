// D5 — File inutilizzati = 0: immagini, video e file di public/, componenti, stili, script e moduli di src/.
// Un file è usato se il suo percorso compare nei contenuti, nel codice, negli script o nell'elenco dei vecchi indirizzi.
import fs from 'node:fs';
import path from 'node:path';

const elenca = (d, filtro = () => true) => {
  const out = [];
  const giro = (c) => { for (const v of fs.readdirSync(c, { withFileTypes: true })) { const p = path.join(c, v.name); if (v.isDirectory()) giro(p); else if (v.name !== '.DS_Store' && filtro(p)) out.push(p); } };
  if (fs.existsSync(d)) giro(d);
  return out;
};
const leggiTutti = (files) => files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const sorgenti = leggiTutti([...elenca('src', (p) => !p.includes('src/generated')), ...elenca('scripts'), 'astro.config.mjs', 'public/manifest.webmanifest', '.pages.yml'].filter((f) => fs.existsSync(f)));
const errori = [];

// 1. file pubblici (media, newsletter, icone, caratteri)
for (const f of elenca('public', (p) => !p.startsWith('public/_img/'))) {
  const url = '/' + path.relative('public', f).split(path.sep).join('/');
  if (['/robots.txt', '/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png', '/manifest.webmanifest'].includes(url) && sorgenti.includes(url.slice(1))) continue;
  if (!sorgenti.includes(url)) errori.push(`file pubblico mai usato: ${f}`);
}
// 2. componenti, layout, stili, script, moduli di src/lib
const importato = (f) => {
  const nome = path.basename(f);
  const senza = nome.replace(/\.(m?js|astro|css|json)$/, '');
  return new RegExp(`['"/]${senza.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\.(astro|m?js|css|json))?['"]`).test(sorgenti.replace(fs.readFileSync(f, 'utf8'), ''));
};
for (const f of [...elenca('src/components'), ...elenca('src/layouts'), ...elenca('src/styles'), ...elenca('src/scripts'), ...elenca('src/lib')]) {
  if (f === 'src/scripts/sito.js' && sorgenti.includes("'../scripts/sito.js'")) continue;
  if (!importato(f)) errori.push(`file di codice mai importato: ${f}`);
}
// 3. contenuti: ogni file di src/content deve avere una collezione
const config = fs.readFileSync('src/content.config.js', 'utf8');
for (const f of elenca('src/content')) {
  const rel = path.relative('src/content', f).split(path.sep).join('/');
  if (!config.includes(`'${rel}'`) && !config.includes(`'${rel.split('/')[0]}'`)) errori.push(`contenuto senza collezione: ${f}`);
}
console.log(`D5 file inutilizzati: controllati public/, src/components, src/layouts, src/styles, src/scripts, src/lib, src/content`);
if (errori.length) { console.log(errori.map((e) => '  ✗ ' + e).join('\n')); console.log(`D5: ${errori.length} file inutilizzati`); process.exit(1); }
console.log('D5: 0 file inutilizzati');
