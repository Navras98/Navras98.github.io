// Crea public/media/condivisione.jpg (1200×630), l'anteprima quando il sito viene condiviso:
// il nome (wordmark con i glifi del monogramma), la foto vera di Andrea e una prova vera da GitHub. Nessuna foto generata.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import os from 'node:os';

const f = (p) => 'file://' + path.resolve(p);
const glifi = JSON.parse(fs.readFileSync('src/lib/glifi.json', 'utf8'));
const svg = (g, h) => `<svg viewBox="${g.viewBox}" style="height:${h};width:auto;display:inline-block;margin:0 ${g.md ?? 0}em 0 ${g.ms ?? 0}em"><path fill="#fff" fill-rule="evenodd" d="${g.d}"/></svg>`;
const nome = (p) => `<span class="parola">${svg(glifi[p[0]], '.688em')}${p.slice(1)}</span>`;
const html = `<!doctype html><html><head><style>
@font-face{font-family:Archivo;src:url(${f('public/fonts/archivo.woff2')});font-weight:600 760;font-stretch:110% 125%}
@font-face{font-family:IS;src:url(${f('public/fonts/instrument-serif-italic.woff2')});font-style:italic}
@font-face{font-family:GM;src:url(${f('public/fonts/geist-mono.woff2')});font-weight:400 700}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#121316;color:#fff;overflow:hidden;position:relative;font-family:Archivo}
.griglia{position:absolute;inset:0;background:linear-gradient(#f2f1ee14 1px,transparent 1px) 0 0/100% 90px,linear-gradient(90deg,#f2f1ee14 1px,transparent 1px) 0 0/90px 100%}
.archi{position:absolute;inset:0}
.testo{position:absolute;left:64px;top:118px;width:600px}
.hud{font-family:GM;font-size:15px;letter-spacing:.15em;text-transform:uppercase;color:rgba(242,241,238,.62)}
.wm{margin-top:26px;font-weight:750;font-stretch:125%;font-size:66px;line-height:1.02;display:flex;flex-direction:column}
.parola{display:inline-flex;align-items:baseline}
.t{margin-top:30px;font-weight:620;font-stretch:118%;font-size:34px;letter-spacing:-.03em}
.t em{font-family:IS;font-weight:400;color:rgba(242,241,238,.62)}
.riga{position:absolute;left:64px;bottom:58px}
.riga b{color:#74aaff;font-weight:500}
.foto{position:absolute;right:64px;top:64px;width:300px;height:386px;border-radius:10px;overflow:hidden;box-shadow:-1.5px 0 0 rgba(255,60,90,.55),1.5px 0 0 rgba(40,200,255,.55),0 0 0 1px rgba(255,255,255,.08)}
.foto img{width:100%;height:100%;object-fit:cover;object-position:54% 40%}
.prova{position:absolute;right:236px;top:368px;width:430px;border-radius:10px;overflow:hidden;background:#0d1117;box-shadow:-1.5px 0 0 rgba(255,60,90,.55),1.5px 0 0 rgba(40,200,255,.55),0 0 0 1px rgba(255,255,255,.08),0 20px 40px rgba(0,0,0,.6)}
.prova img{width:100%;display:block}
</style></head><body>
<div class="griglia"></div>
<svg class="archi" viewBox="0 0 1200 630" fill="none"><circle cx="840" cy="320" r="430" stroke="#2fd39c" stroke-opacity=".45" stroke-width="2" stroke-dasharray="700 3000" transform="rotate(200 840 320)"/><circle cx="840" cy="320" r="360" stroke="#ff6259" stroke-opacity=".4" stroke-width="2" stroke-dasharray="500 3000" transform="rotate(120 840 320)"/><circle cx="840" cy="320" r="300" stroke="#9d4cff" stroke-opacity=".45" stroke-width="2" stroke-dasharray="420 3000" transform="rotate(300 840 320)"/><circle cx="840" cy="320" r="250" stroke="#2d81ff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="380 3000" transform="rotate(40 840 320)"/></svg>
<div class="testo">
  <p class="hud">Consulente informatico · P.IVA</p>
  <p class="wm">${nome('ANDREA')}${nome('SFORNA')}</p>
  <p class="t">Agenti AI che <em>restano tuoi.</em></p>
</div>
<p class="riga hud">Contributore di OpenClaw · <b>thanks @Navras98</b></p>
<div class="foto"><img src="${f('public/media/foto/andrea-ritratto.jpg')}"></div>
<div class="prova"><img src="${f('public/media/prove/pr-170951-grazie-scuro.png')}"></div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const pagina = path.join(os.tmpdir(), 'condivisione-andrea-sforna.html');
fs.writeFileSync(pagina, html);
await p.goto('file://' + pagina, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const png = await p.screenshot({ type: 'png' });
await b.close();
fs.unlinkSync(pagina);
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile('public/media/condivisione.jpg');
console.log('creata public/media/condivisione.jpg');
