// E2 — Lighthouse in modalità mobile (impostazioni predefinite: telefono lento, rete 4G lenta) su Home, una pagina
// progetto, Newsletter e Open source: prestazioni ≥ 90, accessibilità, buone pratiche e SEO = 100.
// Rapporti in verifica/lighthouse/.
import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { serviDist } from './lib/server.mjs';

const PAGINE = [['home', '/'], ['progetto-sfornaclaw', '/progetti/sfornaclaw/'], ['newsletter', '/newsletter/'], ['open-source', '/open-source/']];
fs.mkdirSync('verifica/lighthouse', { recursive: true });
const { base, chiudi } = await serviDist();
const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH || chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
let problemi = 0;
const righe = [];
for (const [nome, u] of PAGINE) {
  const r = await lighthouse(base + u, { port: chrome.port, output: ['html', 'json'], logLevel: 'error', formFactor: 'mobile', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
  const c = r.lhr.categories;
  const p = Math.round(c.performance.score * 100), a = Math.round(c.accessibility.score * 100), b = Math.round(c['best-practices'].score * 100), s = Math.round(c.seo.score * 100);
  fs.writeFileSync(`verifica/lighthouse/${nome}.html`, r.report[0]);
  fs.writeFileSync(`verifica/lighthouse/${nome}.json`, r.report[1]);
  const ok = p >= 90 && a === 100 && b === 100 && s === 100;
  if (!ok) problemi++;
  const m = r.lhr.audits;
  righe.push(`  ${ok ? '✓' : '✗'} ${u.padEnd(24)} prestazioni ${p} · accessibilità ${a} · buone pratiche ${b} · SEO ${s}   (LCP ${m['largest-contentful-paint'].displayValue}, TBT ${m['total-blocking-time'].displayValue}, CLS ${m['cumulative-layout-shift'].displayValue})`);
  if (!ok) for (const cat of ['accessibility', 'best-practices', 'seo']) for (const ref of c[cat].auditRefs) { const au = m[ref.id]; if (au.score !== null && au.score < 1 && ref.weight > 0) righe.push(`      - ${cat}: ${au.id} — ${au.title}`); }
}
await chrome.kill();
await chiudi();
console.log(righe.join('\n'));
console.log(`E2: ${PAGINE.length} pagine misurate (mobile), ${problemi} sotto soglia — rapporti in verifica/lighthouse/`);
process.exit(problemi ? 1 : 0);
