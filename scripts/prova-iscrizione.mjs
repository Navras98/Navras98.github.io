// C3 — L'iscrizione alla newsletter dal nuovo sito arriva davvero. Apre la pagina /newsletter/ del NUOVO sito
// (servita dalla build locale) all'indirizzo pubblico https://navras98.github.io, così il modulo parte dalla stessa
// origine del sito pubblicato; compila l'email di prova, invia e registra la risposta vera del servizio di iscrizione.
// Uso: node scripts/prova-iscrizione.mjs [email]   (predefinita: andrea.sforna+prova@gmail.com)
import fs from 'node:fs';
import { chromium } from 'playwright';
import { Resolver } from 'node:dns/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { load } from 'js-yaml';
import { serviDist } from './lib/server.mjs';

const EMAIL = process.argv[2] || 'andrea.sforna+prova@gmail.com';
const SITO = 'https://navras98.github.io';
// Come un visitatore su internet: l'indirizzo del servizio si risolve con un DNS pubblico. (Da questo Mac il nome
// punterebbe alla rete privata, e il browser bloccherebbe la richiesta per la protezione delle reti locali.)
const servizio = new URL(load(fs.readFileSync('src/content/impostazioni.yml', 'utf8')).indirizzo_iscrizione);
const dns = new Resolver(); dns.setServers(['1.1.1.1', '8.8.8.8']);
const [ipPubblico] = await dns.resolve4(servizio.hostname);
const { base, chiudi } = await serviDist();
const browser = await chromium.launch({ args: [`--host-resolver-rules=MAP ${servizio.hostname} ${ipPubblico}`] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(`${SITO}/**`, async (route) => {
  const u = new URL(route.request().url());
  const r = await fetch(base + u.pathname + u.search);
  route.fulfill({ status: r.status, headers: { 'content-type': r.headers.get('content-type') ?? 'application/octet-stream' }, body: Buffer.from(await r.arrayBuffer()) });
});
const p = await ctx.newPage();
let risposta = null;
const problemi = [];
p.on('requestfailed', (r) => problemi.push(`${r.method()} ${new URL(r.url()).host}: ${r.failure()?.errorText}`));
p.on('console', (m) => { if (m.type() === 'error') problemi.push(m.text().slice(0, 200)); });
p.on('response', async (r) => { if (r.request().method() === 'POST' && !r.url().startsWith(SITO)) { try { risposta = { url: new URL(r.url()).host, stato: r.status(), corpo: await r.text() }; } catch { risposta = { url: r.url(), stato: r.status(), corpo: '(non leggibile)' }; } } });
await p.goto(`${SITO}/newsletter/`, { waitUntil: 'networkidle' });
const modulo = p.locator('form#iscriviti');
const indirizzo = await modulo.getAttribute('data-indirizzo');
await modulo.locator('input[name=email]').fill(EMAIL);
const inviata = new Date();
await modulo.locator('button[type=submit]').click();
await p.waitForFunction(() => ['fatto', 'errore'].includes(document.querySelector('form#iscriviti').dataset.stato), null, { timeout: 30000 }).catch(() => {});
const stato = await modulo.getAttribute('data-stato');
const messaggio = await modulo.locator('[data-esito]').textContent();
fs.mkdirSync('verifica', { recursive: true });
await modulo.screenshot({ path: 'verifica/iscrizione-prova.png' });
await browser.close();
await chiudi();
const riga = [
  `Prova di iscrizione del ${inviata.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}`,
  `pagina: ${SITO}/newsletter/ (nuovo sito, build locale)`,
  `servizio di iscrizione: ${indirizzo ? 'indirizzo pubblico da impostazioni.yml, raggiunto come da internet (DNS pubblico)' : 'NESSUNO (il modulo apre un’email)'}`,
  `email inviata: ${EMAIL}`,
  `risposta del servizio: HTTP ${risposta?.stato} ${risposta?.corpo}`,
  `esito mostrato nella pagina: [${stato}] ${messaggio}`,
  ...(problemi.length ? [`errori di rete: ${problemi.join(' | ')}`] : []),
].join('\n');
// Su questo Mac il servizio è il flusso n8n: in sola lettura si guarda come è finita l'esecuzione appena partita.
let diagnosi = '';
const db = path.join(os.homedir(), '.n8n', 'database.sqlite');
if (fs.existsSync(db)) {
  try {
    await new Promise((ok) => setTimeout(ok, 3000));
    const q = (sql) => execFileSync('sqlite3', ['-readonly', `file:${db}?mode=ro`, sql], { encoding: 'utf8' }).trim();
    const ultima = q(`select e.id||'|'||e.status||'|'||e.startedAt from execution_entity e join workflow_entity w on w.id=e.workflowId where w.name like '%iscrizioni%' order by e.id desc limit 1`);
    const [id, esito, quando] = ultima.split('|');
    const dati = q(`select data from execution_data where executionId=${Number(id)}`);
    const motivo = (dati.match(/Brevo ha rifiutato: (\d+)[^"]*?\\"message\\":\\"([^\\]+)/) ?? []).slice(1).join(' ').replace(/\d{1,3}(\.\d{1,3}){3}|[0-9a-f]{1,4}(:[0-9a-f]{0,4}){3,7}/gi, '[indirizzo]');
    diagnosi = `esecuzione del flusso di iscrizione (n8n, sola lettura): n. ${id} del ${quando} UTC, esito «${esito}»${motivo ? ` — Brevo risponde ${motivo}` : ''}`;
  } catch (e) { diagnosi = 'diagnosi n8n non disponibile'; }
}
const testo = riga + (diagnosi ? '\n' + diagnosi : '');
fs.writeFileSync('verifica/iscrizione-prova.txt', testo + '\n');
console.log(testo);
const ok = stato === 'fatto' && risposta?.stato === 200 && /"ok"\s*:\s*true/.test(risposta?.corpo ?? '');
console.log(`C3: iscrizione ${ok ? 'ARRIVATA (risposta {"ok":true})' : 'NON riuscita'} — screenshot verifica/iscrizione-prova.png`);
process.exit(ok ? 0 : 1);
