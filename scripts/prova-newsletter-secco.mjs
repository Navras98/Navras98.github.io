// C4 — La nuova automazione della newsletter (preparata in ~/.openclaw/workspace/newsletter/nuovo-sito/, NON attiva)
// funziona in prova a secco: un numero d'esempio diventa UN file .md più le foto in una COPIA del sito, la build
// della copia crea la pagina giusta, «butta» rimette tutto com'era. Niente rete, niente invii, niente push.
// Controlla anche che esista la copia di sicurezza e che n8n usi ancora gli script di oggi (automazione non attiva).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const CASA = os.homedir();
const NUOVA = path.join(CASA, '.openclaw/workspace/newsletter/nuovo-sito');
const COPIA_SICUREZZA = path.join(CASA, '.openclaw/workspace/backup/newsletter-prima-del-nuovo-sito-2026-10-14');
const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); return c; };
let tutto = true;
tutto &= ok(fs.existsSync(path.join(NUOVA, 'prova_secco.py')), 'nuova automazione preparata in ~/.openclaw/workspace/newsletter/nuovo-sito/');
tutto &= ok(fs.existsSync(path.join(COPIA_SICUREZZA, 'newsletter')) && fs.existsSync(path.join(COPIA_SICUREZZA, 'n8n')), 'copia di sicurezza degli script e dei flussi n8n in ~/.openclaw/workspace/backup/newsletter-prima-del-nuovo-sito-2026-10-14/');
// automazione non attiva: il flusso n8n del numero chiama ancora gli script di oggi (lettura del database, sola lettura)
const db = path.join(CASA, '.n8n/database.sqlite');
if (fs.existsSync(db)) {
  const nodi = execFileSync('sqlite3', ['-readonly', `file:${db}?mode=ro`, "select nodes from workflow_entity where name like '%il numero%'"], { encoding: 'utf8' });
  tutto &= ok(/uscita\.py/.test(nodi) && !/uscita_astro\.py|numero_astro\.py/.test(nodi), 'n8n usa ancora uscita.py e numero.py: la nuova automazione NON è attiva');
}
// copia di lavoro del sito (file del progetto, senza node_modules, dist e .git)
// la copia sta dentro il progetto (cartella ignorata da git), così usa gli stessi node_modules senza collegamenti
fs.mkdirSync('.prove', { recursive: true });
const copia = fs.mkdtempSync(path.resolve('.prove/nl-prova-'));
for (const f of execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).split('\n').filter(Boolean)) {
  if (!fs.existsSync(f)) continue;
  fs.mkdirSync(path.join(copia, path.dirname(f)), { recursive: true });
  fs.copyFileSync(f, path.join(copia, f));
}
const r = spawnSync('/usr/bin/python3', ['-B', path.join(NUOVA, 'prova_secco.py'), '--copia', copia, '--esempio', path.join(copia, 'src/content/newsletter/2026-09-11.md'), '--foto', path.join(copia, 'public/newsletter/numeri/2026-09-11'), '--costruisci', '--confronto', path.join(copia, 'scripts/confronta-newsletter.mjs')], { encoding: 'utf8', timeout: 600000 });
const uscita = (r.stdout ?? '') + (r.stderr ?? '');
fs.mkdirSync('verifica', { recursive: true });
fs.writeFileSync('verifica/newsletter-prova-secco.txt', uscita.split(copia).join('<copia del sito>').split(CASA).join('~'));
fs.rmSync(copia, { recursive: true, force: true });
const righe = uscita.split('\n').filter((l) => /ESITO|chiamate di rete|→ ok|pagina|numeri\.json|build|testi uguali/i.test(l)).slice(-14);
console.log(righe.map((l) => '      ' + l.trim().split(copia).join('<copia>')).join('\n'));
tutto &= ok(/ESITO: superata/.test(uscita), 'prova a secco: ' + (uscita.match(/ESITO: [^\n]+/)?.[0] ?? 'nessun esito'));
console.log(`C4: ${tutto ? 'automazione pronta, provata a secco e non attiva' : 'problemi'} — resoconto in verifica/newsletter-prova-secco.txt`);
process.exit(tutto ? 0 : 1);
