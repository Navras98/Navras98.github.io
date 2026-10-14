// Aiuti per i controlli nel browser: apre una pagina con tema e larghezza scelti e la «sveglia»
// scorrendola tutta, così le comparse allo scroll sono visibili.
import { chromium } from 'playwright';

export const LARGHEZZE = [320, 390, 768, 1024, 1440, 1920];
export const altezza = (w) => (w < 500 ? 844 : w < 900 ? 1024 : 900);

export async function apri() {
  return chromium.launch();
}

export async function pagina(browser, url, { larghezza = 1440, tema = 'dark', movimento = 'no-preference', dpr = 1 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: larghezza, height: altezza(larghezza) }, deviceScaleFactor: dpr, reducedMotion: movimento });
  await ctx.addInitScript((t) => { try { localStorage.setItem('tema', t); } catch (e) {} }, tema);
  const p = await ctx.newPage();
  const errori = [];
  p.on('pageerror', (e) => errori.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
  await p.goto(url, { waitUntil: 'networkidle' });
  return { p, ctx, errori };
}

export async function scorriTutta(p) {
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(40); }
  await p.evaluate(() => { document.querySelectorAll('[data-rivela]').forEach((e) => e.classList.add('visibile')); document.querySelectorAll('.sezione').forEach((e) => e.classList.add('disegnata')); window.scrollTo(0, 0); });
  await p.waitForTimeout(400);
}
