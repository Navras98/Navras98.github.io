// A7 — Ogni profilo social linkato dal sito esiste davvero. Apre ogni profilo senza login in un browser vero
// (screenshot in verifica/social/) e, come controllo, un profilo inesistente: deve risultare inesistente.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { load } from 'js-yaml';

const imp = load(fs.readFileSync('src/content/impostazioni.yml', 'utf8'));
const piede = load(fs.readFileSync('src/content/piede.yml', 'utf8'));
const link = new Set([...imp.social.map((s) => s.indirizzo), ...piede.colonne.flatMap((c) => c.link.map((l) => l.link))].filter((u) => /instagram\.com|x\.com|twitter\.com|github\.com\/[^/]+\/?$|linkedin\.com\/in/.test(u)));
const CONTROLLO = 'https://x.com/zz_nonesiste_qq_91835';
fs.mkdirSync('verifica/social', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', args: ['--disable-blink-features=AutomationControlled'] });
const esiste = async (url) => {
  const gh = url.match(/^https:\/\/github\.com\/([^/]+)\/?$/);
  if (gh) { try { const u = JSON.parse(execFileSync('gh', ['api', `users/${gh[1]}`], { encoding: 'utf8' })); return { si: true, perche: `gh api: ${u.login}, ${u.public_repos} repository pubblici` }; } catch { return { si: false, perche: 'gh api: utente inesistente' }; } }
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' });
  const p = await ctx.newPage();
  const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await p.waitForTimeout(8000);
  const info = await p.evaluate(() => ({ titolo: document.title, testo: document.body.innerText.replace(/\s+/g, ' ').slice(0, 2000) }));
  const nome = url.replace(/\/$/, '').split('/').pop();
  await p.screenshot({ path: `verifica/social/${new URL(url).hostname.replace('www.', '')}-${nome}.png` });
  await ctx.close();
  if (/instagram\.com/.test(url)) {
    const si = info.titolo.includes(`(@${nome})`) && !/isn.t available/i.test(info.testo);
    return { si, perche: `titolo «${info.titolo.slice(0, 70)}»` };
  }
  const si = (r?.status() ?? 0) < 400 && info.testo.includes(`@${nome}`) && !/account doesn.t exist|User Profile Not Found/i.test(info.testo);
  return { si, perche: si ? `profilo @${nome} visibile (${(info.testo.match(/Joined [A-Za-z]+ \d{4}/) ?? [''])[0]})` : `HTTP ${r?.status()}, ${info.testo.slice(0, 60)}` };
};
let errori = 0;
for (const u of link) {
  const e = await esiste(u);
  if (!e.si) errori++;
  console.log(`  ${e.si ? '✓' : '✗'} ${u} — ${e.perche}`);
}
const c = await esiste(CONTROLLO);
console.log(`  ${c.si ? '✗' : '✓'} controllo: ${CONTROLLO} risulta ${c.si ? 'ESISTENTE (il controllo non distingue)' : 'inesistente'} — ${c.perche}`);
if (c.si) errori++;
await browser.close();
console.log(`A7: ${link.size} profili linkati dal sito, ${errori} problemi (screenshot in verifica/social/)`);
process.exit(errori ? 1 : 0);
