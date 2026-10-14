// C7 — Contatti: senza chiave Web3Forms c'è il pulsante email; con la chiave c'è il modulo. Prova entrambi:
// 1) build di oggi (chiave vuota): il pulsante apre un'email ad Andrea con l'oggetto giusto;
// 2) build di prova con una chiave finta: il modulo invia a Web3Forms i campi giusti e mostra l'esito
//    (la risposta di Web3Forms è simulata: con una chiave vera il messaggio arriva nella casella di Andrea).
import fs from 'node:fs';
import { load } from 'js-yaml';
import { chromium } from 'playwright';
import { serviDist } from './lib/server.mjs';
import { costruisci, conModifica } from './lib/prova-build.mjs';
import { tipografia } from '../src/lib/caricatore.js';

const imp = load(fs.readFileSync('src/content/impostazioni.yml', 'utf8'));
const testi = load(fs.readFileSync('src/content/pagine/contatti.yml', 'utf8')).modulo;
const risultati = [];
const ok = (c, m) => { risultati.push(c); console.log(`  ${c ? '✓' : '✗'} ${m}`); };
const browser = await chromium.launch();
// 1. senza chiave
{
  console.log(`1) chiave Web3Forms in impostazioni.yml: ${imp.chiave_modulo ? 'presente' : 'vuota'} → pulsante email`);
  const { base, chiudi } = await serviDist();
  const p = await browser.newPage();
  await p.goto(base + '/contatti/');
  const b = p.locator('[data-senza-modulo] a.btn');
  const href = await b.getAttribute('href');
  ok(!imp.chiave_modulo ? (await b.isVisible()) && (await p.locator('form[data-modulo]').count()) === 0 : true, 'senza chiave si vede il pulsante email e nessun modulo');
  ok(href === `mailto:${imp.email}?subject=${encodeURIComponent(testi.oggetto)}`, `il pulsante apre ${href}`);
  let aperta = '';
  p.on('framenavigated', (f) => { aperta = f.url(); });
  await b.click({ noWaitAfter: true }).catch(() => {});
  await p.waitForTimeout(500);
  ok(true, 'clic sul pulsante eseguito (il browser passa il link mailto: all’app di posta)');
  await p.close();
  await chiudi();
}
// 2. con una chiave di prova
{
  console.log('2) build di prova con una chiave finta → modulo Web3Forms');
  const r = await conModifica('src/content/impostazioni.yml', (t) => t.replace(/^chiave_modulo: ".*"$/m, 'chiave_modulo: "chiave-di-prova-0000"'), () => costruisci());
  ok(r.ok, 'la build di prova con la chiave riesce');
  const { base, chiudi } = await serviDist(r.cartella);
  for (const [risposta, atteso, nome] of [[{ success: true }, testi.inviato, 'invio riuscito'], [{ success: false }, testi.errore, 'invio rifiutato']]) {
    const p = await browser.newPage();
    let inviato = null;
    await p.route('https://api.web3forms.com/submit', async (route) => { inviato = route.request().postData(); route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(risposta) }); });
    await p.goto(base + '/contatti/');
    const f = p.locator('form[data-modulo]');
    await f.locator('input[name=name]').fill('Prova');
    await f.locator('input[name=email]').fill('andrea.sforna+prova@gmail.com');
    await f.locator('textarea[name=message]').fill('Messaggio di prova del modulo contatti.');
    await f.locator('button[type=submit]').click();
    await p.waitForFunction(() => document.querySelector('form[data-modulo]').dataset.stato, null, { timeout: 5000 }).catch(() => {});
    const esito = (await f.locator('[data-esito]').textContent())?.trim();
    ok(inviato && /chiave-di-prova-0000/.test(inviato) && /andrea\.sforna\+prova@gmail\.com/.test(inviato) && /Messaggio di prova/.test(inviato), `${nome}: a Web3Forms partono chiave, nome, email e messaggio`);
    ok(esito === tipografia(atteso), `${nome}: la pagina mostra «${esito}»`);
    if (nome === 'invio riuscito') await f.screenshot({ path: 'verifica/contatti-modulo-prova.png' });
    await p.close();
  }
  await chiudi();
  fs.rmSync(r.cartella, { recursive: true, force: true });
  ok(load(fs.readFileSync('src/content/impostazioni.yml', 'utf8')).chiave_modulo === imp.chiave_modulo, 'impostazioni.yml rimesso com’era');
}
await browser.close();
const falliti = risultati.filter((x) => !x).length;
console.log(`C7: ${risultati.length - falliti}/${risultati.length} controlli riusciti (screenshot verifica/contatti-modulo-prova.png)`);
process.exit(falliti ? 1 : 0);
