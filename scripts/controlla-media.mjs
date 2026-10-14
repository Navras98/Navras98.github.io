// A3 e A4 — Ogni file in public/media è elencato in riferimento/MEDIA.md con la sua provenienza e nessuno è generato
// con AI; le vecchie foto generate (hero-*, chiusura-notte) non esistono più, né nei file né in git.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const errori = [];
const file = [];
const giro = (d) => { for (const v of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, v.name); if (v.isDirectory()) giro(p); else if (v.name !== '.DS_Store') file.push(p); } };
giro('public/media');
const elenco = fs.existsSync('riferimento/MEDIA.md') ? fs.readFileSync('riferimento/MEDIA.md', 'utf8') : '';
if (!elenco) errori.push('riferimento/MEDIA.md manca');
const righe = elenco.split('\n');
for (const f of file) {
  const rel = path.relative('public/media', f).split(path.sep).join('/');
  const mie = righe.filter((r) => r.includes(`\`${rel}\``) || r.includes(`\`media/${rel}\``) || r.includes(`\`public/media/${rel}\``));
  if (!mie.length) { errori.push(`non elencato in MEDIA.md: public/media/${rel}`); continue; }
  for (const r of mie) if (/DA ELIMINARE|generat[ao] con AI(?! *(:|\?)? *no)/i.test(r) && !/non (è |sono )?generat|nessun[ao]? .*generat|niente .*generat/i.test(r)) errori.push(`MEDIA.md segna come generato o da eliminare: public/media/${rel}`);
}
// A4: niente foto generate del vecchio sito
const vietati = /(^|\/)(hero-[^/]*|chiusura-notte[^/]*)\.(jpe?g|png|webp|avif)$/i;
for (const f of file) if (vietati.test(f)) errori.push(`foto generata ancora presente: ${f}`);
const inGit = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter((f) => vietati.test(f));
for (const f of inGit) errori.push(`foto generata ancora in git: ${f}`);
console.log(`A3/A4 media: ${file.length} file in public/media, ${righe.filter((r) => r.startsWith('|')).length} righe in MEDIA.md`);
if (errori.length) { console.log(errori.map((e) => '  ✗ ' + e).join('\n')); console.log(`A3/A4: ${errori.length} problemi`); process.exit(1); }
console.log('A3: ogni file di public/media è in MEDIA.md con provenienza, nessuno generato con AI');
console.log('A4: 0 foto hero-* o chiusura-notte nei file e in git');
