// B2 — L'apertura ha 7 carte VIDEO reali in loop. Ogni video: WebM e MP4, ≤ 700 KB, 1280×720, muto, con copertina.
// Parte solo quando è visibile (nell'apertura: le carte in primo piano, poco dopo il caricamento), si ferma fuori schermo;
// con «riduci movimento» non si scarica nessun video e resta la copertina.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { load } from 'js-yaml';
import { serviDist } from './lib/server.mjs';
import { apri, pagina } from './lib/browser.mjs';

const errori = [];
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) errori.push(msg); };
const home = load(fs.readFileSync('src/content/pagine/home.yml', 'utf8'));
ok(home.apertura.carte.length === 7, `apertura: ${home.apertura.carte.length} carte video`);
// tutti i video usati nel sito
const video = new Map();
// le versioni per il telefono (campo «telefono», verticali 720×900) si controllano a parte
const telefono = new Map();
const giro = (v) => { if (Array.isArray(v)) v.forEach(giro); else if (v && typeof v === 'object') { if (v.mp4 && v.webm) { video.set(v.mp4, v); if (v.telefono) telefono.set(v.telefono.mp4, v.telefono); return; } Object.values(v).forEach(giro); } };
for (const f of execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'src/content'], { encoding: 'utf8' }).split('\n').filter((x) => /\.(ya?ml|md)$/.test(x))) {
  const t = fs.readFileSync(f, 'utf8');
  giro(load(f.endsWith('.md') ? t.split(/^---$/m)[1] : t));
}
const carteApertura = new Set(home.apertura.carte.map((c) => c.mp4));
const probe = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', f], { encoding: 'utf8' }));
for (const v of video.values()) {
  for (const k of ['mp4', 'webm']) {
    const f = 'public' + v[k];
    const kb = fs.statSync(f).size / 1024;
    const p = probe(f);
    const vs = p.streams.find((s) => s.codec_type === 'video');
    const audio = p.streams.some((s) => s.codec_type === 'audio');
    const dur = Number(p.format.duration);
    // le carte dell'apertura sono 1280×720 (missione); i video grandi delle pagine anche 1920×1080, per restare nitidi a 2x
    const carta = carteApertura.has(v.mp4);
    const dimOk = (vs.width === 1280 && vs.height === 720) || (!carta && vs.width === 1920 && vs.height === 1080);
    ok(kb <= 700 && dimOk && !audio && dur >= 4 && dur <= 6.1, `${v[k]}: ${kb.toFixed(0)} KB, ${vs.codec_name} ${vs.width}×${vs.height}, ${dur.toFixed(1)} s, ${audio ? 'CON audio' : 'muto'}`);
  }
  ok(fs.existsSync('public' + v.copertina), `${v.copertina}: copertina presente (${(fs.statSync('public' + v.copertina).size / 1024).toFixed(0)} KB)`);
}
for (const v of telefono.values()) {
  for (const k of ['mp4', 'webm']) {
    const f = 'public' + v[k];
    const kb = fs.statSync(f).size / 1024;
    const p = probe(f);
    const vs = p.streams.find((s) => s.codec_type === 'video');
    const audio = p.streams.some((s) => s.codec_type === 'audio');
    const dur = Number(p.format.duration);
    ok(kb <= 700 && ((vs.width === 720 && vs.height === 900) || (vs.width === 1080 && vs.height === 1350)) && !audio && dur >= 4 && dur <= 6.1, `${v[k]} (telefono): ${kb.toFixed(0)} KB, ${vs.codec_name} ${vs.width}×${vs.height}, ${dur.toFixed(1)} s, ${audio ? 'CON audio' : 'muto'}`);
  }
}
const { base, chiudi } = await serviDist();
const browser = await apri();
const stato = (p, sel) => p.$$eval(sel, (vs) => vs.map((v) => ({ fermo: v.paused, pronto: v.readyState, t: v.currentTime, poster: !!v.poster, sorgenti: [...v.querySelectorAll('source')].map((s) => s.type).join('+') })));
// 1. movimento normale
{
  const { p, ctx } = await pagina(browser, base + '/', { larghezza: 1440 });
  const scaricati = new Set();
  p.on('request', (r) => { if (/\.(mp4|webm)$/.test(r.url())) scaricati.add(r.url().split('/').pop()); });
  let s = await stato(p, '[data-carta] video');
  ok(s.length === 7 && s.every((x) => x.poster && x.sorgenti === 'video/webm+video/mp4'), `home: 7 video nelle carte, ognuno con copertina e sorgenti WebM + MP4`);
  // senza alcun gesto: dopo il caricamento parte da sola la carta in primo piano (una alla volta, per tenere l'apertura
  // fluida; con l'orbita il turno passa a tutte); quelle lontane restano ferme
  await p.waitForTimeout(5000);
  s = await p.$$eval('[data-carta]', (cs) => cs.filter((c) => c.querySelector('video')).map((c) => { const v = c.querySelector('video'); return { prof: Number(c.style.getPropertyValue('--prof')), fermo: v.paused, t: v.currentTime }; }));
  const attivi = s.filter((x) => !x.fermo && x.t > 0).length;
  ok(attivi >= 1 && attivi <= 2, `senza gesti, dopo il caricamento: ${attivi} video dell'apertura in riproduzione (la carta in primo piano)`);
  ok(s.filter((x) => x.prof < 0.25).every((x) => x.fermo), `le carte lontane (dietro il nome) restano ferme sulla copertina`);
  let sez = await stato(p, '#cosa-faccio video');
  ok(sez.every((x) => x.fermo && x.pronto === 0), `video della sezione «Cosa faccio» fuori schermo: fermi e non scaricati`);
  await p.evaluate(() => document.querySelector('#cosa-faccio video').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(2500);
  sez = await stato(p, '#cosa-faccio .scheda-funzione:first-of-type video');
  ok(!sez[0].fermo && sez[0].t > 0, `quando la scheda è visibile il suo video parte (t = ${sez[0].t.toFixed(2)} s)`);
  s = await stato(p, '[data-carta] video');
  ok(s.every((x) => x.fermo), `con l'apertura fuori schermo i suoi video sono fermi`);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(1500);
  sez = await stato(p, '#cosa-faccio video');
  ok(sez.every((x) => x.fermo), `scorrendo oltre, i video della sezione si fermano`);
  await ctx.close();
}
// 2. riduzione del movimento
{
  const { p, ctx } = await pagina(browser, base + '/', { larghezza: 1440, movimento: 'reduce' });
  const scaricati = new Set();
  p.on('request', (r) => { if (/\.(mp4|webm)$/.test(r.url())) scaricati.add(r.url()); });
  await p.mouse.move(700, 450); await p.mouse.move(720, 470);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
  await p.waitForTimeout(1500);
  const tutti = await stato(p, 'video');
  ok(tutti.every((x) => x.fermo && x.poster) && scaricati.size === 0, `riduci movimento: ${tutti.length} video, tutti fermi sulla copertina, 0 file video scaricati`);
  await ctx.close();
}
// 3. pagine progetto: il video d'apertura parte perché è visibile
{
  const { p, ctx } = await pagina(browser, base + '/progetti/sfornaclaw/', { larghezza: 1440 });
  await p.evaluate(() => document.querySelector('.progetto-figura video').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(2500);
  const [v] = await stato(p, '.progetto-figura video');
  ok(!v.fermo && v.t > 0, `pagina progetto: il video d'apertura parte quando è visibile`);
  await ctx.close();
}
await browser.close();
await chiudi();
console.log(`B2: ${video.size} video controllati${telefono.size ? ` (più ${telefono.size} versioni per il telefono)` : ''}, ${errori.length} problemi`);
process.exit(errori.length ? 1 : 0);
