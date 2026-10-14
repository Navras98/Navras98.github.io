// B5 — Loghi da fonte ufficiale annotata in src/lib/marchi.json; griglia uniforme (stesso riquadro, raggio e margine
// per ogni logo, a 1x e 2x, nei due temi); monogramma leggibile a 16 px e a 512 px nei due temi (screenshot).
import fs from 'node:fs';
import { load } from 'js-yaml';
import sharp from 'sharp';
import { serviDist } from './lib/server.mjs';
import { apri, pagina } from './lib/browser.mjs';

const marchi = JSON.parse(fs.readFileSync('src/lib/marchi.json', 'utf8')).loghi;
const strumenti = load(fs.readFileSync('src/content/pagine/strumenti.yml', 'utf8')).elenco.voci;
const home = load(fs.readFileSync('src/content/pagine/home.yml', 'utf8'));
const usati = new Set([...strumenti.map((s) => s.logo.src), ...home.prove.voci.map((v) => v.logo.src)]);
const errori = [];
for (const src of usati) {
  const m = Object.values(marchi).find((x) => x.file === src);
  if (!m) errori.push(`${src}: nessuna fonte in marchi.json`);
  else if (!/^https:\/\//.test(m.fonte) || !m.pagina_fonte) errori.push(`${src}: fonte incompleta`);
}
console.log(`  ${errori.length ? '✗' : '✓'} ${usati.size} loghi usati nel sito, tutti con fonte ufficiale in marchi.json`);
fs.mkdirSync('verifica/loghi', { recursive: true });
fs.mkdirSync('verifica/monogramma', { recursive: true });
const { base, chiudi } = await serviDist();
const browser = await apri();
for (const tema of ['dark', 'light']) for (const dpr of [1, 2]) {
  const { p, ctx } = await pagina(browser, base + '/strumenti/', { larghezza: 1440, tema, dpr, movimento: 'reduce' });
  const misure = await p.$$eval('.griglia-strumenti .tessera-riquadro', (els) => els.map((e) => { const s = getComputedStyle(e); const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height), s.borderRadius, s.padding, s.backgroundColor].join(' '); }));
  const diverse = new Set(misure);
  if (diverse.size !== 1) errori.push(`griglia ${tema} ${dpr}x: riquadri diversi (${[...diverse].join(' / ')})`);
  console.log(`  ${diverse.size === 1 ? '✓' : '✗'} griglia ${tema === 'dark' ? 'scura' : 'chiara'} @${dpr}x: ${misure.length} riquadri uguali (${[...diverse][0]})`);
  const g = p.locator('#tutti');
  await g.scrollIntoViewIfNeeded();
  await g.screenshot({ path: `verifica/loghi/griglia-sito-${tema === 'dark' ? 'scuro' : 'chiaro'}-${dpr}x.png` });
  await ctx.close();
}
// monogramma: favicon a 16 px (ingrandita 8 volte, pixel visibili) e a 512 px, nei due temi
const svg = fs.readFileSync('public/favicon.svg', 'utf8');
for (const schema of ['dark', 'light']) {
  const ctx = await browser.newContext({ colorScheme: schema, viewport: { width: 600, height: 600 } });
  const p = await ctx.newPage();
  const fondo = schema === 'dark' ? '#121316' : '#f2f1ee';
  await p.setContent(`<body style="margin:0;background:${fondo};display:grid;place-items:center;width:600px;height:600px"><img id="m" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="16" height="16"></body>`);
  const piccolo = await p.locator('#m').screenshot();
  await sharp(piccolo).resize(128, 128, { kernel: 'nearest' }).toFile(`verifica/monogramma/sito-16px-${schema === 'dark' ? 'scuro' : 'chiaro'}-ingrandito.png`);
  await p.setContent(`<body style="margin:0;background:${fondo};display:grid;place-items:center;width:600px;height:600px"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="512" height="512"></body>`);
  await p.screenshot({ path: `verifica/monogramma/sito-512px-${schema === 'dark' ? 'scuro' : 'chiaro'}.png` });
  // a 16 px il segno deve avere contrasto pieno col fondo
  const { data, info } = await sharp(piccolo).raw().toBuffer({ resolveWithObject: true });
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += info.channels) { const l = (data[i] + data[i + 1] + data[i + 2]) / 3; min = Math.min(min, l); max = Math.max(max, l); }
  const contrasto = max - min;
  if (contrasto < 150) errori.push(`monogramma a 16 px su fondo ${schema}: contrasto basso (${contrasto})`);
  console.log(`  ${contrasto >= 150 ? '✓' : '✗'} monogramma a 16 px su fondo ${schema === 'dark' ? 'scuro' : 'chiaro'}: escursione di luminosità ${contrasto.toFixed(0)}/255; screenshot a 16 e 512 px in verifica/monogramma/`);
  await ctx.close();
}
await browser.close();
await chiudi();
console.log(`B5: ${errori.length ? errori.join('; ') : 'loghi ufficiali, griglia uniforme, monogramma leggibile a 16 e 512 px nei due temi'}`);
process.exit(errori.length ? 1 : 0);
