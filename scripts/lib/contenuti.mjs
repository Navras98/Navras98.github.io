// Legge tutti i testi di src/content (valori YAML e corpo Markdown), senza link, percorsi e codici.
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

const NON_TESTO = new Set(['src', 'link', 'mp4', 'webm', 'copertina', 'indirizzo', 'indirizzo_sito', 'indirizzo_iscrizione', 'email', 'chiave_modulo', 'codice', 'data', 'lancio', 'punto_focale', 'adatta', 'colore', 'gruppo', 'partita_iva']);

export function fileContenuti(cartella = 'src/content') {
  const tutti = [];
  const giro = (d) => { for (const v of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, v.name); if (v.isDirectory()) giro(p); else if (/\.(ya?ml|md)$/.test(v.name)) tutti.push(p); } };
  giro(cartella);
  return tutti.sort();
}

// [{ file, campo, testo }]
export function testiDi(file) {
  const t = fs.readFileSync(file, 'utf8');
  let dati = {}, corpo = '';
  if (file.endsWith('.md')) { const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/); dati = load(m[1]) ?? {}; corpo = m[2]; }
  else dati = load(t) ?? {};
  const out = [];
  const giro = (v, campo, chiave) => {
    if (typeof v === 'string') { if (!NON_TESTO.has(chiave)) out.push({ file, campo, testo: v }); }
    else if (Array.isArray(v)) v.forEach((x, i) => giro(x, `${campo}[${i}]`, chiave));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) giro(x, campo ? `${campo}.${k}` : k, k);
  };
  giro(dati, '', '');
  if (corpo.trim()) out.push({ file, campo: '(testo)', testo: corpo.replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, '') });
  return out;
}
