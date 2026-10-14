// D3 — .pages.yml e schemi dei contenuti coincidono campo per campo (nome, tipo, obbligatorio, elenco, scelte);
// ogni immagine ha i campi «punto focale» e «adatta»; ogni file di contenuto rispetta il suo schema.
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { SEZIONI, campiSezione } from './lib/pages-cms.mjs';

const cfg = load(fs.readFileSync('.pages.yml', 'utf8'));
const differenze = [];
let confrontati = 0, immagini = 0;
const confronta = (atteso, reale, dove) => {
  const nomiA = atteso.map((f) => f.name), nomiR = (reale ?? []).map((f) => f.name);
  for (const n of nomiA) if (!nomiR.includes(n)) differenze.push(`${dove}: manca il campo «${n}» in .pages.yml`);
  for (const n of nomiR) if (!nomiA.includes(n)) differenze.push(`${dove}: il campo «${n}» di .pages.yml non esiste nello schema`);
  for (const a of atteso) {
    const r = (reale ?? []).find((f) => f.name === a.name);
    if (!r) continue;
    confrontati++;
    const qui = `${dove}.${a.name}`;
    for (const k of ['type', 'list', 'required']) if ((a[k] ?? false) !== (r[k] ?? false)) differenze.push(`${qui}: ${k} è «${r[k]}» in .pages.yml e «${a[k]}» nello schema`);
    if (a.type === 'select' && JSON.stringify(a.options?.values) !== JSON.stringify(r.options?.values)) differenze.push(`${qui}: scelte diverse`);
    if (a.type === 'object') {
      confronta(a.fields, r.fields, qui);
      if (a.fields.some((f) => f.type === 'image') && a.fields.some((f) => f.name === 'src')) {
        immagini++;
        for (const n of ['punto_focale', 'adatta']) if (!(r.fields ?? []).some((f) => f.name === n)) differenze.push(`${qui}: immagine senza il campo «${n}»`);
      }
    }
  }
};
for (const s of SEZIONI) {
  const sez = cfg.content.find((c) => c.name === s.name);
  if (!sez) { differenze.push(`sezione «${s.name}» mancante in .pages.yml`); continue; }
  if (sez.path !== s.path) differenze.push(`${s.name}: percorso ${sez.path} invece di ${s.path}`);
  confronta(campiSezione(s), sez.fields, s.name);
}
for (const c of cfg.content) if (!SEZIONI.some((s) => s.name === c.name)) differenze.push(`sezione «${c.name}» di .pages.yml senza schema`);
for (const m of cfg.media) if (!fs.existsSync(m.input)) differenze.push(`cartella media mancante: ${m.input}`);
// ogni file di contenuto rispetta il suo schema
let file = 0;
for (const s of SEZIONI) {
  const elenco = s.type === 'collection' ? fs.readdirSync(s.path).filter((f) => /\.(md|ya?ml)$/.test(f)).map((f) => path.join(s.path, f)) : [s.path];
  for (const f of elenco) {
    file++;
    const t = fs.readFileSync(f, 'utf8');
    const dati = s.md ? load(t.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]) : load(t);
    const r = s.schema.safeParse(dati);
    if (!r.success) differenze.push(`${f}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
}
console.log(`D3 Pages CMS: ${cfg.content.length} sezioni, ${confrontati} campi confrontati con gli schemi, ${immagini} gruppi immagine (tutti con punto focale e adatta), ${file} file di contenuto controllati`);
if (differenze.length) { console.log(differenze.map((d) => '  ✗ ' + d).join('\n')); console.log(`D3: ${differenze.length} differenze`); process.exit(1); }
console.log('D3: 0 differenze tra .pages.yml e schemi');
