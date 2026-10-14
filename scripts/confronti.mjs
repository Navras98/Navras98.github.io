// B1 — Per ogni pagina e sezione del sito, un confronto affiancato con il corrispettivo di ArtCraft
// (riferimento/DESIGN.md, «Corrispondenze») → verifica/confronti/<nome>-<larghezza>-<tema>.png
// A sinistra ArtCraft (screenshot in riferimento/artcraft/), a destra il sito. Tema scuro e chiaro a 1440, scuro a 390.
import fs from 'node:fs';
import sharp from 'sharp';
import { serviDist } from './lib/server.mjs';
import { apri, pagina, scorriTutta } from './lib/browser.mjs';

const R = 'riferimento/artcraft';
const S = `${R}/sezioni`;
// [nome, pagina, selettore (null = prima schermata), riferimento ArtCraft (con {w} e {t}), azione]
const COPPIE = [
  ['home-apertura', '/', null, `${R}/ac-apertura-{w}-{t}.png`],
  ['home-fascia-prove', '/', '.fascia-prove', `${S}/ac-home-marquee-{w}-{t}.png`],
  ['home-01-cosa-faccio', '/', '#cosa-faccio', `${S}/ac-home-features-{w}-{t}.png`],
  ['home-02-metodo', '/', '#metodo', `${S}/ac-download-quick-start-{w}-{t}.png`],
  ['home-03-progetti', '/', '#progetti', `${S}/ac-apps-lineup-{w}-{t}.png`],
  ['home-04-open-source', '/', '#open-source', `${S}/ac-home-made-with-{w}-{t}.png`],
  ['home-05-strumenti', '/', '#strumenti', `${S}/ac-apps-apps-{w}-{t}.png`],
  ['home-06-principi', '/', '#principi', `${S}/ac-home-ownership-{w}-{t}.png`],
  ['home-07-chi-sono', '/', '#chi-sono', `${S}/ac-download-anteprima-{w}-{t}.png`],
  ['home-newsletter', '/', '#newsletter', `${S}/ac-app-get-it-{w}-{t}.png`],
  ['home-chiusura', '/', '#scrivimi', `${S}/ac-home-start-{w}-{t}.png`],
  ['piede', '/', 'footer.piede', `${S}/ac-home-footer-{w}-{t}.png`],
  ['testata-tendina-progetti', '/', 'tendina', `${R}/ac-menu-resources-1440-{t}.png`],
  ['menu-mobile', '/', 'menu', `${R}/ac-menu-mobile-390-{t}.png`],
  ['metodo-apertura', '/metodo/', '#hero', `${S}/ac-download-download-{w}-{t}.png`],
  ['metodo-fasi', '/metodo/', '#fasi', `${S}/ac-apps-principles-{w}-{t}.png`],
  ['metodo-non-faccio', '/metodo/', '#non-faccio', `${S}/ac-home-ownership-{w}-{t}.png`],
  ['metodo-obiettivi', '/metodo/', '#obiettivi', `${S}/ac-download-quick-start-{w}-{t}.png`],
  ['progetti-apertura', '/progetti/', '#hero', `${S}/ac-apps-apps-{w}-{t}.png`],
  ['progetti-elenco', '/progetti/', '#elenco', `${S}/ac-apps-lineup-{w}-{t}.png`],
  ['progetto-apertura', '/progetti/sfornaclaw/', '#hero', `${S}/ac-app-photocraft-{w}-{t}.png`],
  ['progetto-cosa-ottieni', '/progetti/sfornaclaw/', '#cosa-ottieni', `${S}/ac-app-highlights-{w}-{t}.png`],
  ['progetto-dettagli', '/progetti/sfornaclaw/', '#dettagli', `${S}/ac-app-gallery-{w}-{t}.png`],
  ['progetto-altri', '/progetti/sfornaclaw/', '#altri', `${S}/ac-app-family-{w}-{t}.png`],
  ['automazioni-come-funziona', '/progetti/automazioni/', '#come-funziona', `${S}/ac-download-quick-start-{w}-{t}.png`],
  ['automazioni-esempi', '/progetti/automazioni/', '#esempi', `${S}/ac-app-gallery-{w}-{t}.png`],
  ['privacybridge-apertura', '/progetti/privacybridge/', '#hero', `${S}/ac-app-photocraft-{w}-{t}.png`],
  ['agenti-personali-apertura', '/progetti/agenti-personali/', '#hero', `${S}/ac-app-photocraft-{w}-{t}.png`],
  ['strumenti-apertura', '/strumenti/', '#hero', `${S}/ac-apps-apps-{w}-{t}.png`],
  ['strumenti-griglia', '/strumenti/', '#tutti', `${R}/ac-apps-griglia-icone-{w}-dark.png`],
  ['strumenti-schede', '/strumenti/', '#come-li-uso', `${S}/ac-download-platforms-{w}-{t}.png`],
  ['open-source-prove', '/open-source/', '#prove', `${S}/ac-home-made-with-{w}-{t}.png`],
  ['open-source-proposte', '/open-source/', '#contributi', `${R}/pagine/ac-news-{w}-{t}-full.png`],
  ['open-source-progetto-mio', '/open-source/', '#progetto-mio', `${S}/ac-download-anteprima-{w}-{t}.png`],
  ['chi-sono-apertura', '/chi-sono/', '#hero', `${S}/ac-download-anteprima-{w}-{t}.png`],
  ['chi-sono-percorso', '/chi-sono/', '#percorso', `${S}/ac-download-quick-start-{w}-{t}.png`],
  ['newsletter-apertura', '/newsletter/', '#hero', `${S}/ac-download-download-{w}-{t}.png`],
  ['newsletter-archivio', '/newsletter/', '#archivio', `${R}/pagine/ac-news-{w}-{t}-full.png`],
  ['newsletter-domande', '/newsletter/', '#domande', `${S}/ac-faq-faq-{w}-{t}.png`],
  ['newsletter-numero', '/newsletter/numeri/2026-09-11/', 'article.numero', `${R}/pagine/ac-articolo-{w}-{t}-full.png`],
  ['newsletter-confermato', '/newsletter/confermato/', '#hero', `${S}/ac-support-support-{w}-{t}.png`],
  ['newsletter-link-non-valido', '/newsletter/link-non-valido/', '#hero', `${S}/ac-support-support-{w}-{t}.png`],
  ['newsletter-inglese', '/en/newsletter/', '#hero', `${S}/ac-download-download-{w}-{t}.png`],
  ['contatti', '/contatti/', '#hero', `${S}/ac-support-contact-{w}-{t}.png`],
  ['privacy', '/privacy/', '#hero', `${R}/pagine/ac-articolo-{w}-{t}-full.png`],
  ['404', '/pagina-che-non-esiste/', '#hero', `${S}/ac-support-support-{w}-{t}.png`],
];
const ALTEZZA = 1600, LARGO = 720;
fs.mkdirSync('verifica/confronti', { recursive: true });
const { base, chiudi } = await serviDist();
const browser = await apri();
const riquadro = async (buf) => { const m = await sharp(buf).metadata(); const scalato = await sharp(buf).resize(LARGO).toBuffer(); const h = Math.min(ALTEZZA, Math.round(m.height * LARGO / m.width)); return sharp(scalato).extract({ left: 0, top: 0, width: LARGO, height: h }).toBuffer(); };
let n = 0;
const mancanti = [];
for (const [nome, u, sel, rif] of COPPIE) {
  for (const [w, t] of [[1440, 'dark'], [1440, 'light'], [390, 'dark']]) {
    const tema = t === 'dark' ? 'dark' : 'light';
    let fileRif = rif.replace('{w}', w).replace('{t}', tema);
    if (!fs.existsSync(fileRif)) fileRif = rif.replace('{w}', w).replace('{t}', 'dark');
    if (!fs.existsSync(fileRif)) fileRif = rif.replace('{w}', 1440).replace('{t}', tema);
    if (!fs.existsSync(fileRif)) { mancanti.push(`${nome} ${w} ${t}`); continue; }
    if ((sel === 'tendina' && w !== 1440) || (sel === 'menu' && w !== 390)) continue;
    const { p, ctx } = await pagina(browser, base + u, { larghezza: w, tema, movimento: 'reduce' });
    let foto;
    if (sel === null) { await p.waitForTimeout(800); foto = await p.screenshot(); }
    else if (sel === 'tendina') { await p.click('[data-tendina-bottone]'); await p.waitForTimeout(300); foto = await p.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 520 } }); }
    else if (sel === 'menu') { await p.click('[data-menu]'); await p.waitForTimeout(400); foto = await p.screenshot(); }
    else { await scorriTutta(p); const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); foto = await el.screenshot(); }
    await ctx.close();
    const a = await riquadro(fs.readFileSync(fileRif)), b = await riquadro(foto);
    const ha = (await sharp(a).metadata()).height, hb = (await sharp(b).metadata()).height;
    const etichetta = (testo, x) => ({ input: Buffer.from(`<svg width="${LARGO}" height="28"><rect width="100%" height="100%" fill="#000"/><text x="10" y="19" font-family="monospace" font-size="13" fill="#fff">${testo}</text></svg>`), left: x, top: 0 });
    await sharp({ create: { width: LARGO * 2 + 12, height: Math.max(ha, hb) + 28, channels: 3, background: '#ff00ff' } })
      .composite([etichetta(`ArtCraft — ${fileRif.split('/').pop()}`, 0), etichetta(`Andrea Sforna — ${u} ${sel ?? 'prima schermata'}`, LARGO + 12), { input: a, left: 0, top: 28 }, { input: b, left: LARGO + 12, top: 28 }])
      .png().toFile(`verifica/confronti/${nome}-${w}-${t === 'dark' ? 'scuro' : 'chiaro'}.png`);
    n++;
  }
}
await browser.close();
await chiudi();
console.log(`B1: ${n} confronti affiancati per ${COPPIE.length} pagine e sezioni in verifica/confronti/${mancanti.length ? ` (riferimento mancante: ${mancanti.join(', ')})` : ''}`);
