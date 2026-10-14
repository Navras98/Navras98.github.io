// npm run verifica — lancia tutti i controlli dei criteri (CRITERI.md) e scrive verifica/rapporto.md.
// Opzioni: --rapidi (salta i controlli lunghi), --iscrizione (fa anche una vera iscrizione di prova alla newsletter).
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const RAPIDI = process.argv.includes('--rapidi');
const ISCRIZIONE = process.argv.includes('--iscrizione');
// [criteri, script, argomenti, lungo]
const CONTROLLI = [
  ['E1', 'npm', ['run', 'build'], false],
  ['A1', 'scripts/controlla-github.mjs', [], false],
  ['A3 A4', 'scripts/controlla-media.mjs', [], false],
  ['A5', 'scripts/controlla-testi.mjs', [], false],
  ['A6', 'scripts/controlla-segreti.mjs', [], false],
  ['A7', 'scripts/controlla-social.mjs', [], true],
  ['B1', 'scripts/confronti.mjs', [], true],
  ['B2', 'scripts/verifica-video.mjs', [], false],
  ['B3', 'scripts/verifica-verticali.mjs', [], true],
  ['B4', 'scripts/verifica-volto.mjs', [], false],
  ['B5', 'scripts/verifica-loghi.mjs', [], false],
  ['B6', 'scripts/verifica-scroll-orizzontale.mjs', [], true],
  ['B7', 'scripts/verifica-screenshot.mjs', [], true],
  ['B3 B7', 'scripts/verifica-nitidezza.mjs', [], true],
  ['C1', 'scripts/verifica-pagine.mjs', [], false],
  ['C2', 'scripts/confronta-newsletter.mjs', [], false],
  ['C3', 'scripts/prova-iscrizione.mjs', [], 'iscrizione'],
  ['C4', 'scripts/prova-newsletter-secco.mjs', [], true],
  ['C5', 'scripts/verifica-vecchi-indirizzi.mjs', [], false],
  ['C6', 'scripts/verifica-link.mjs', RAPIDI ? ['--solo-interni'] : [], false],
  ['C7', 'scripts/prova-contatti.mjs', [], true],
  ['D1', 'scripts/prova-modifiche.mjs', [], true],
  ['D2', 'scripts/prova-schema.mjs', [], true],
  ['D3', 'scripts/valida-pages.mjs', [], false],
  ['D4', 'scripts/prova-nuovo-numero.mjs', [], true],
  ['D5', 'scripts/controlla-inutilizzati.mjs', [], false],
  ['E2', 'scripts/verifica-lighthouse.mjs', [], true],
  ['E3', 'scripts/verifica-axe.mjs', [], true],
  ['E4', 'scripts/peso-home.mjs', [], false],
];
const righe = [];
let falliti = 0;
for (const [criteri, script, args, lungo] of CONTROLLI) {
  if (lungo === 'iscrizione' && !ISCRIZIONE) { righe.push([criteri, script, 'saltato', 'serve --iscrizione (fa una vera iscrizione di prova)']); continue; }
  if (lungo === true && RAPIDI) { righe.push([criteri, script, 'saltato', '--rapidi']); continue; }
  const inizio = Date.now();
  const r = script === 'npm' ? spawnSync('npm', args, { encoding: 'utf8' }) : spawnSync('node', [script, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const uscita = ((r.stdout ?? '') + (r.stderr ?? '')).trim().split('\n');
  const sintesi = script === 'npm' ? (uscita.find((l) => /Complete!|ERROR|error/.test(l)) ?? uscita.at(-1)) : uscita.filter((l) => l.trim()).at(-1);
  const ok = r.status === 0;
  if (!ok) falliti++;
  righe.push([criteri, script === 'npm' ? 'npm run build' : script, ok ? 'OK' : 'NON SUPERATO', `${sintesi?.trim().replace(/\|/g, '/')} (${((Date.now() - inizio) / 1000).toFixed(0)} s)`]);
  console.log(`${ok ? '✓' : '✗'} ${criteri.padEnd(6)} ${sintesi?.trim()}`);
}
const md = `# Rapporto dei controlli\n\nEseguito il ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} con \`npm run verifica${RAPIDI ? ' -- --rapidi' : ''}\`.\n\n| Criteri | Controllo | Esito | Sintesi |\n|---|---|---|---|\n${righe.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;
fs.mkdirSync('verifica', { recursive: true });
fs.writeFileSync('verifica/rapporto.md', md);
console.log(`\n${falliti ? `${falliti} controlli non superati` : 'Tutti i controlli eseguiti sono superati'} — rapporto in verifica/rapporto.md`);
process.exit(falliti ? 1 : 0);
