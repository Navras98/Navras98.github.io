// A6 — Segreti e dati interni nel progetto (file in git e file nuovi non ignorati) e nella build (dist/):
// chiavi, parole d'accesso, percorsi di sistema, indirizzi di rete privati, indirizzi della rete privata Tailscale,
// numeri di telefono. (I modelli sono scritti a pezzi, così questo file non trova sé stesso.)
// Unica eccezione: l'indirizzo pubblico di iscrizione alla newsletter, solo in src/content/impostazioni.yml
// (nella build compare dove serve al modulo).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load } from 'js-yaml';

const imp = load(fs.readFileSync('src/content/impostazioni.yml', 'utf8'));
const ISCRIZIONE = imp.indirizzo_iscrizione;
const pezzi = (...p) => p.join('');
const REGOLE = [
  ['chiave sk-', new RegExp(pezzi('\\bs', 'k-[A-Za-z0-9_-]{8,}'))],
  ['chiave api', new RegExp(pezzi('ap', 'i[_-]?ke', 'y'), 'i')],
  ['parola d’accesso', new RegExp(pezzi('pass', 'word|pass', 'wd'), 'i')],
  ['percorso di sistema', new RegExp(pezzi('/Use', 'rs/[A-Za-z]|/ho', 'me/[a-z][a-z0-9_-]*/'))],
  ['indirizzo privato', new RegExp(pezzi('\\b(10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|19', '2\\.168\\.\\d{1,3}\\.\\d{1,3}|17', '2\\.(1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3}|10', '0\\.(6[4-9]|[7-9]\\d|1[01]\\d|12[0-7])\\.\\d{1,3}\\.\\d{1,3}|12', '7\\.0\\.0\\.1)\\b'))],
  ['rete Tailscale', new RegExp(pezzi('t', 's\\.ne', 't'), 'i')],
  ['telefono', /(?<![\d.\w-])(\+39[\s.]?)?3\d{2}[\s.]?\d{3}[\s.]?\d{3,4}(?![\d.])/, (f, riga) => !f.endsWith('.svg') && !/<svg|viewBox|stroke|<path|<circle/.test(riga)],
];
const testuale = (f) => /\.(astro|m?js|json|ya?ml|md|css|html|txt|xml|svg|webmanifest|ts)$/i.test(f) || /(^|\/)\.[a-z]+$|CNAME$|LICENSE$/i.test(f);
const progetto = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\n').filter((f) => f && fs.existsSync(f) && testuale(f));
const build = [];
const giro = (d) => { for (const v of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, v.name); if (v.isDirectory()) giro(p); else if (testuale(p)) build.push(p); } };
if (fs.existsSync('dist')) giro('dist'); else console.log('(dist assente: lancia prima npm run build)');

const trovati = [];
let eccezioni = 0;
for (const f of [...progetto, ...build]) {
  const righe = fs.readFileSync(f, 'utf8').split('\n');
  righe.forEach((r, i) => {
    let riga = r;
    // l'indirizzo di iscrizione è ammesso solo in impostazioni.yml (sorgente) e nella build
    if (ISCRIZIONE && riga.includes(ISCRIZIONE) && (f === 'src/content/impostazioni.yml' || f.startsWith('dist/'))) { eccezioni++; riga = riga.split(ISCRIZIONE).join('[iscrizione]'); }
    for (const [nome, re, vale] of REGOLE) if ((!vale || vale(f, riga)) && re.test(riga)) trovati.push(`${f}:${i + 1}: ${nome} → ${riga.trim().slice(0, 120)}`);
  });
}
console.log(`A6 segreti: ${progetto.length} file del progetto e ${build.length} file della build controllati`);
console.log(`   eccezione ammessa (indirizzo di iscrizione alla newsletter): ${eccezioni} righe, solo in impostazioni.yml e in dist/`);
if (trovati.length) { console.log(trovati.map((t) => '  ✗ ' + t).join('\n')); console.log(`A6: ${trovati.length} problemi`); process.exit(1); }
console.log('A6: 0 chiavi, 0 parole d’accesso, 0 percorsi di sistema, 0 indirizzi privati, 0 indirizzi Tailscale fuori dall’eccezione, 0 numeri di telefono');
