// Confronta ogni numero della newsletter con l'originale del vecchio sito.
//
// Per ogni numero legge l'originale, ne estrae testi e immagini e li confronta con:
//   1. il file src/content/newsletter/<slug>.md
//   2. la pagina costruita dist/newsletter/numeri/<slug>/index.html, se esiste (dopo `npm run build`)
//
// Originali:
//   - numeri 10–12: tag git `sito-precedente` (newsletter/numeri/<slug>/index.html);
//   - numeri 1–9: copia locale riferimento/newsletter-originali/<slug>.html, presa dal vecchio
//     deposito Navras98/newsletter-ai; se manca, con --rete la scarica da navras98.github.io/newsletter-ai/.
// Un numero uscito dopo il vecchio sito (nessun originale, non in numeri.json del tag) si controlla solo
// sulla pagina costruita, contro il suo file .md.
// Testi normalizzati: entità, spazi, apostrofi e virgolette tipografiche. La rubrica si confronta
// senza badare a maiuscole (il sito la rende in maiuscoletto).
//
// Uso:  node scripts/confronta-newsletter.mjs [--rete] [--solo-md] [slug ...]
//   --rete     controlla anche che le immagini in public/ siano identiche byte per byte agli originali
//              dei numeri 1–9 (scaricandoli); per 10–12 il controllo dei byte si fa sempre, dal tag git
//   --solo-md  non guarda dist/ anche se esiste
// Esce con 1 se c'è almeno una differenza.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load as caricaYaml } from 'js-yaml';
import { marked } from 'marked';

const TAG = 'sito-precedente';
const ARCHIVIO_VECCHIO = 'https://navras98.github.io/newsletter-ai';
const argomenti = process.argv.slice(2);
const RETE = argomenti.includes('--rete');
const SOLO_MD = argomenti.includes('--solo-md');
const scelti = argomenti.filter((a) => !a.startsWith('--'));

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const inLettere = (iso) => {
  const [a, m, g] = iso.split('-').map(Number);
  return `${g} ${MESI[m - 1]} ${a}`;
};

// ───────────────────────────── testo ─────────────────────────────
const NOMINATE = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rarr: '→', larr: '←', middot: '·', hellip: '…',
  mdash: '—', ndash: '–', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', egrave: 'è',
  eacute: 'é', agrave: 'à', igrave: 'ì', ograve: 'ò', ugrave: 'ù', Egrave: 'È', zwnj: '', zwj: '', copy: '©', euro: '€',
};
function sciogli(t) {
  return String(t ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tutto, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return e in NOMINATE ? NOMINATE[e] : tutto;
  });
}
const senzaTag = (h) => String(h ?? '').replace(/<[^>]+>/g, '');
const testo = (h) => sciogli(senzaTag(h)).replace(/[ \s]+/g, ' ').trim();
// la forma con cui si confronta: niente differenze di spazi, apostrofi, virgolette, a capo
const norma = (t) =>
  String(t ?? '')
    .normalize('NFC')
    .replace(/[​-‍﻿]/g, '')
    .replace(/[‘’ʼ′]/g, "'")
    .replace(/[“”„″«»]/g, '"')
    .replace(/\.\.\./g, '…')
    .replace(/[ \s]+/g, ' ')
    .trim();
const attributo = (tag, nome) => {
  const m = tag.match(new RegExp(`\\s${nome}="([^"]*)"`));
  return m ? sciogli(m[1]) : null;
};
const nomeFile = (src) => String(src ?? '').split(/[?#]/)[0].split('/').pop();

// ─────────────────────── estrazione dagli originali ───────────────────────
// Ogni estrattore restituisce { numero, data, titolo, sommario, articoli[], punto[], chiusura[], immagini[] }
// dove immagini = [{ file, alt }] in ordine di pagina.
function daPaginaSito(h) {
  const main = h.slice(h.indexOf('<main'), h.indexOf('</main>'));
  const testata = main.match(/<p[^>]*>Numero (\d{3}) &#183; ([^<]+)<\/p>/);
  const apertura = main.slice(0, main.indexOf('</section>'));
  const pApertura = [...apertura.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
  const immagini = [];
  const cop = apertura.match(/<img [^>]*>/);
  if (cop) immagini.push({ file: nomeFile(attributo(cop[0], 'src')), alt: attributo(cop[0], 'alt') });
  const articoli = [...main.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(([b]) => {
    const span = [...b.matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map((m) => testo(m[1]));
    const dopo = b.slice(b.indexOf('</h2>'));
    const img = b.match(/<img [^>]*>/);
    if (img) immagini.push({ file: nomeFile(attributo(img[0], 'src')), alt: attributo(img[0], 'alt') });
    const fonte = b.match(/<a href="([^"]+)"[^>]*>Leggi su ([\s\S]*?) &#8594;<\/a>/);
    return {
      rubrica: span[1],
      titolo: testo(b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)[1]),
      paragrafi: [...dopo.matchAll(/<p style="margin:0 0 clamp\(18px[^"]*">([\s\S]*?)<\/p>/g)].map((m) => testo(m[1])),
      fonte: fonte ? { nome: testo(fonte[2]), link: sciogli(fonte[1]) } : null,
      immagine: img ? nomeFile(attributo(img[0], 'src')) : null,
    };
  });
  const punto = main.match(/>Il punto<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  const chiusa = main.match(/<p style="margin:0 0 clamp\(28px,3vw,44px\);max-width:60ch[^"]*">([\s\S]*?)<\/p>\s*<p[^>]*>Andrea<\/p>/);
  return {
    numero: Number(testata[1]),
    data: testo(testata[2]),
    titolo: testo(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]),
    sommario: testo(pApertura[pApertura.length - 1][1]),
    articoli,
    punto: punto ? [testo(punto[1])] : [],
    chiusura: chiusa ? [testo(chiusa[1])] : [],
    immagini,
  };
}

function daPaginaEmail(h) {
  const corpo = h.slice(h.indexOf('<body'));
  const tra = (da, a) => corpo.slice(corpo.indexOf(da), a ? corpo.indexOf(a) : undefined);
  const immagini = [];
  const testata = tra('<body', '<!-- ═══ APERTURA');
  const cop = testata.match(/<img [^>]*>/);
  if (cop) immagini.push({ file: nomeFile(attributo(cop[0], 'src')), alt: attributo(cop[0], 'alt') });
  const zona = tra('<!-- ═══════ ARTICOLO', '<!-- ═══ IL PUNTO');
  const articoli = zona
    .split('<!-- numero + categoria -->')
    .slice(1)
    .map((b) => {
      const rubrica = b.match(/<div class="num"[^>]*>\d+<\/div>[\s\S]*?<div[^>]*>([^<]*)<\/div>/)[1];
      let dopo = b.slice(b.indexOf('</h2>') + 5);
      dopo = dopo.slice(0, dopo.indexOf('</td>'));
      const img = b.match(/<img [^>]*>/);
      if (img) immagini.push({ file: nomeFile(attributo(img[0], 'src')), alt: attributo(img[0], 'alt') });
      const fonte = b.match(/<a href="([^"]+)"[^>]*>Leggi su ([\s\S]*?)&nbsp;&rarr;<\/a>/);
      return {
        rubrica: testo(rubrica),
        titolo: testo(b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)[1]),
        // i paragrafi veri stanno annidati dentro un <p> esterno
        paragrafi: [...dopo.matchAll(/<p [^>]*>((?:[^<]|<(?!\/?p\b))*)<\/p>/g)].map((m) => testo(m[1])).filter(Boolean),
        fonte: fonte ? { nome: testo(fonte[2]), link: sciogli(fonte[1]) } : null,
        immagine: img ? nomeFile(attributo(img[0], 'src')) : null,
      };
    });
  const punto = tra('<!-- ═══ IL PUNTO', '<!-- ═══ CHIUSURA').match(/>Il punto<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  const chiusa = tra('<!-- ═══ CHIUSURA', '<!-- ═══ PIÈ DI PAGINA').match(/<div[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*>Andrea<\/div>/);
  const pre = corpo.match(/<div style="display:none;[^"]*">([\s\S]*?)<\/div>/);
  return {
    numero: Number(corpo.match(/>N\. (\d{3})<\/div>/)[1]),
    data: testo(corpo.match(/>N\. \d{3}<\/div>\s*<div[^>]*>([^<]+)<\/div>/)[1]),
    titolo: testo(corpo.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]),
    sommario: testo(corpo.match(/<p class="lead[^"]*"[^>]*>([\s\S]*?)<\/p>/)[1]),
    rigaAnteprima: pre ? testo(pre[1]) : null,
    articoli,
    punto: punto ? [testo(punto[1])] : [],
    chiusura: chiusa ? [testo(chiusa[1])] : [],
    immagini,
  };
}

// il sito vecchio è copiato in riferimento/sito-precedente/ (estratto dal tag prima della pubblicazione)
function dalTag(percorso) {
  try {
    return fs.readFileSync(path.join('riferimento/sito-precedente', percorso));
  } catch {
    return null;
  }
}

// Sostituzioni documentate (parole vietate dal sito, criterio A5): si applicano anche agli originali prima del confronto.
const SOSTITUZIONI = JSON.parse(fs.readFileSync('src/lib/newsletter-sostituzioni.json', 'utf8')).sostituzioni;
let sostituzioniApplicate = 0;
const sostituisci = (slug, t) => {
  for (const x of SOSTITUZIONI) if (x.file.endsWith(`/${slug}.md`)) { const n = t.split(x.prima).length - 1; if (n) { sostituzioniApplicate += n; t = t.split(x.prima).join(x.dopo); } }
  return t;
};
async function originale(slug) {
  const o = await originaleGrezzo(slug);
  return o ? { ...o, html: sostituisci(slug, o.html) } : null;
}
async function originaleGrezzo(slug) {
  const dalSito = dalTag(`newsletter/numeri/${slug}/index.html`);
  if (dalSito) return { html: dalSito.toString('utf8'), fonte: `${TAG}:newsletter/numeri/${slug}/index.html`, vecchio: false };
  const locale = path.join('riferimento', 'newsletter-originali', `${slug}.html`);
  if (fs.existsSync(locale)) return { html: fs.readFileSync(locale, 'utf8'), fonte: locale, vecchio: true };
  if (RETE) {
    const r = await fetch(`${ARCHIVIO_VECCHIO}/numeri/${slug}/`);
    if (r.ok) return { html: await r.text(), fonte: `${ARCHIVIO_VECCHIO}/numeri/${slug}/`, vecchio: true };
  }
  return null;
}

async function byteOriginali(slug, file, vecchio) {
  if (!vecchio) return dalTag(`newsletter/numeri/${slug}/${file}`);
  if (!RETE) return undefined; // non verificato
  const r = await fetch(`${ARCHIVIO_VECCHIO}/numeri/${slug}/${file}`);
  return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
}
const impronta = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ─────────────────────────── dal file .md ───────────────────────────
function paragrafiMd(md) {
  const h = marked.parse(String(md ?? ''));
  return [...h.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => testo(m[1].replace(/<br\s*\/?>/g, '\n')));
}
function leggiMd(file) {
  const grezzo = fs.readFileSync(file, 'utf8');
  const parti = grezzo.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!parti) throw new Error('frontmatter assente');
  const d = caricaYaml(parti[1]);
  return { dati: d, corpo: parti[2] };
}
const dataIso = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));

// ─────────────────────────── confronto ───────────────────────────
function differenzeTesti(o, d, corpo) {
  const diff = [];
  const uguale = (cosa, a, b) => {
    if (norma(a) !== norma(b)) diff.push(`${cosa}: originale «${norma(a).slice(0, 90)}» ≠ file «${norma(b).slice(0, 90)}»`);
  };
  if (o.numero !== d.numero) diff.push(`numero: ${o.numero} ≠ ${d.numero}`);
  uguale('data', o.data, inLettere(dataIso(d.data)));
  uguale('titolo', o.titolo, d.titolo);
  uguale('sommario', o.sommario, d.sommario);
  if (o.rigaAnteprima) uguale('riga_anteprima', o.rigaAnteprima, d.riga_anteprima);
  const art = d.articoli ?? [];
  if (o.articoli.length !== art.length) diff.push(`articoli: ${o.articoli.length} nell'originale, ${art.length} nel file`);
  o.articoli.forEach((a, i) => {
    const b = art[i] ?? {};
    const n = String(i + 1).padStart(2, '0');
    if (norma(a.rubrica).toLocaleUpperCase('it') !== norma(b.rubrica).toLocaleUpperCase('it'))
      diff.push(`articolo ${n} rubrica: «${a.rubrica}» ≠ «${b.rubrica}»`);
    uguale(`articolo ${n} titolo`, a.titolo, b.titolo);
    const pb = paragrafiMd(b.testo);
    if (a.paragrafi.length !== pb.length) diff.push(`articolo ${n}: ${a.paragrafi.length} paragrafi nell'originale, ${pb.length} nel file`);
    a.paragrafi.forEach((p, j) => uguale(`articolo ${n} paragrafo ${j + 1}`, p, pb[j]));
    if (a.fonte || b.fonte) {
      uguale(`articolo ${n} fonte`, a.fonte?.nome, b.fonte?.nome);
      if ((a.fonte?.link ?? '') !== (b.fonte?.link ?? '')) diff.push(`articolo ${n} link fonte: ${a.fonte?.link} ≠ ${b.fonte?.link}`);
    }
  });
  const pp = paragrafiMd(d.punto);
  if (o.punto.length !== pp.length) diff.push(`il punto: ${o.punto.length} paragrafi nell'originale, ${pp.length} nel file`);
  o.punto.forEach((p, j) => uguale(`il punto ${j + 1}`, p, pp[j]));
  const pc = paragrafiMd(corpo);
  if (o.chiusura.length !== pc.length) diff.push(`chiusura: ${o.chiusura.length} paragrafi nell'originale, ${pc.length} nel file`);
  o.chiusura.forEach((p, j) => uguale(`chiusura ${j + 1}`, p, pc[j]));
  return diff;
}

function immaginiMd(d, slug) {
  const lista = [];
  const prendi = (im, dove) => {
    if (!im) return;
    lista.push({ file: nomeFile(im.src), alt: im.alt, src: im.src, dove });
  };
  prendi(d.copertina, 'copertina');
  (d.articoli ?? []).forEach((a, i) => prendi(a.immagine, `articolo ${String(i + 1).padStart(2, '0')}`));
  const diff = [];
  for (const im of lista) {
    if (!im.src.startsWith(`/newsletter/numeri/${slug}/`)) diff.push(`${im.dove}: percorso ${im.src} fuori dalla cartella del numero`);
    for (const campo of ['punto_focale', 'adatta']) {
      const v = im.dove === 'copertina' ? d.copertina[campo] : d.articoli[Number(im.dove.slice(-2)) - 1].immagine[campo];
      if (!v) diff.push(`${im.dove}: manca ${campo}`);
    }
  }
  return { lista, diff };
}

async function differenzeImmagini(o, d, slug, vecchio) {
  const { lista, diff } = immaginiMd(d, slug);
  const chiave = (x) => `${x.file}|${norma(x.alt)}`;
  const a = o.immagini.map(chiave).join(' · ');
  const b = lista.map(chiave).join(' · ');
  if (a !== b) diff.push(`elenco immagini: originale [${o.immagini.map((x) => x.file).join(', ')}] ≠ file [${lista.map((x) => x.file).join(', ')}]${a.replace(/\|[^·]*/g, '') === b.replace(/\|[^·]*/g, '') ? ' (diverso il testo alternativo)' : ''}`);
  // anche ogni articolo deve avere la sua immagine, non solo l'elenco complessivo
  o.articoli.forEach((x, i) => {
    const im = d.articoli?.[i]?.immagine;
    if ((x.immagine ?? null) !== (im ? nomeFile(im.src) : null)) diff.push(`articolo ${String(i + 1).padStart(2, '0')}: immagine ${x.immagine ?? 'nessuna'} ≠ ${im ? nomeFile(im.src) : 'nessuna'}`);
  });
  let byte = 'verificati';
  for (const im of lista) {
    const locale = path.join('public', im.src);
    if (!fs.existsSync(locale)) {
      diff.push(`file mancante: ${locale}`);
      continue;
    }
    const orig = await byteOriginali(slug, im.file, vecchio);
    if (orig === undefined) byte = 'non verificati (usa --rete)';
    else if (orig === null) diff.push(`originale non trovato per ${im.file}`);
    else if (impronta(orig) !== impronta(fs.readFileSync(locale))) diff.push(`${locale}: byte diversi dall'originale`);
  }
  return { diff, byte };
}

// La pagina costruita: non sappiamo come è impaginata, quindi si cerca ogni testo atteso nel testo
// visibile di <main>, nell'ordine, e ogni immagine fra gli <img> della pagina.
function confrontaDist(file, o, slug) {
  const h = fs.readFileSync(file, 'utf8');
  const inizio = h.indexOf('<main');
  const main = inizio >= 0 ? h.slice(inizio, h.indexOf('</main>', inizio)) : h;
  const visibile = norma(testo(main.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<\/(p|h\d|li|div|span|a|figcaption|summary)>/gi, ' $&')));
  const visibileMaiuscolo = visibile.toLocaleUpperCase('it');
  const diffT = [];
  let da = 0;
  const cerca = (cosa, t, { maiuscole = false } = {}) => {
    const ago = norma(t);
    if (!ago) return;
    const pagliaio = maiuscole ? visibileMaiuscolo : visibile;
    const cercato = maiuscole ? ago.toLocaleUpperCase('it') : ago;
    const i = pagliaio.indexOf(cercato, da);
    if (i < 0) {
      diffT.push(`${cosa}: «${ago.slice(0, 80)}» ${pagliaio.includes(cercato) ? 'presente ma fuori ordine' : 'assente'}`);
      return;
    }
    da = i + cercato.length;
  };
  cerca('titolo', o.titolo);
  cerca('sommario', o.sommario);
  o.articoli.forEach((a, i) => {
    const n = String(i + 1).padStart(2, '0');
    cerca(`articolo ${n} rubrica`, a.rubrica, { maiuscole: true });
    cerca(`articolo ${n} titolo`, a.titolo);
    a.paragrafi.forEach((p, j) => cerca(`articolo ${n} paragrafo ${j + 1}`, p));
    if (a.fonte) {
      cerca(`articolo ${n} fonte`, a.fonte.nome);
      if (!main.includes(`href="${a.fonte.link.replace(/&/g, '&amp;')}"`) && !main.includes(`href="${a.fonte.link}"`))
        diffT.push(`articolo ${n}: link alla fonte ${a.fonte.link} assente`);
    }
  });
  o.punto.forEach((p, j) => cerca(`il punto ${j + 1}`, p));
  o.chiusura.forEach((p, j) => cerca(`chiusura ${j + 1}`, p));
  const avvisi = [];
  if (!new RegExp(`\\b0*${o.numero}\\b`).test(visibile)) avvisi.push(`numero ${o.numero} non trovato nella pagina`);
  // indirizzi relativi («copertina.jpg») e assoluti risolti rispetto all'indirizzo della pagina
  const risolvi = (src) => {
    try {
      return new URL(src, `https://navras98.github.io/newsletter/numeri/${slug}/`).pathname;
    } catch {
      return src;
    }
  };
  const imgs = [...main.matchAll(/<img\b[^>]*>/gi)].map(([t]) => ({ src: risolvi(attributo(t, 'src') ?? ''), alt: attributo(t, 'alt') ?? '' }));
  const diffI = [];
  for (const im of o.immagini) {
    const base = im.file.replace(/\.[^.]+$/, '');
    const trovata = imgs.find((x) => x.src.includes(`/newsletter/numeri/${slug}/${im.file}`)) ?? imgs.find((x) => x.src.includes(`${slug}/${base}`));
    if (!trovata) diffI.push(`immagine ${im.file} assente dalla pagina`);
    else if (norma(trovata.alt) !== norma(im.alt)) diffI.push(`immagine ${im.file}: alt «${trovata.alt}» invece di «${im.alt}»`);
  }
  return { diffT, diffI, avvisi };
}

// ───────────────────────────── giro ─────────────────────────────
const elencoTag = dalTag('newsletter/numeri.json');
const elenco = elencoTag ? JSON.parse(elencoTag.toString('utf8')).numeri.map((n) => ({ ...n, titolo: sostituisci(n.slug, n.titolo), sommario: sostituisci(n.slug, n.sommario) })) : [];
const cartellaMd = path.join('src', 'content', 'newsletter');
const slugMd = fs.existsSync(cartellaMd) ? fs.readdirSync(cartellaMd).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
let slugs = [...new Set([...elenco.map((n) => n.slug), ...slugMd])].sort();
if (scelti.length) slugs = slugs.filter((s) => scelti.includes(s));

let problemi = 0;
const righe = [];
const scrivi = (r = '') => righe.push(r) && console.log(r);
scrivi(`Confronto newsletter — ${new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })} — originali: tag ${TAG} e riferimento/newsletter-originali${RETE ? ' (+ rete)' : ''}`);
scrivi(`Numeri in numeri.json del vecchio sito: ${elenco.length}; file in src/content/newsletter: ${slugMd.length}`);
scrivi();
// Un numero uscito dopo il vecchio sito non ha un originale: la pagina costruita si confronta con il suo .md.
function daMd(d, corpo) {
  const immagini = [];
  if (d.copertina) immagini.push({ file: nomeFile(d.copertina.src), alt: d.copertina.alt });
  const articoli = (d.articoli ?? []).map((a) => {
    if (a.immagine) immagini.push({ file: nomeFile(a.immagine.src), alt: a.immagine.alt });
    return { rubrica: a.rubrica, titolo: a.titolo, paragrafi: paragrafiMd(a.testo), fonte: a.fonte ?? null, immagine: a.immagine ? nomeFile(a.immagine.src) : null };
  });
  return { numero: d.numero, data: inLettere(dataIso(d.data)), titolo: d.titolo, sommario: d.sommario, articoli, punto: paragrafiMd(d.punto), chiusura: paragrafiMd(corpo), immagini };
}

for (const slug of slugs) {
  const voce = elenco.find((n) => n.slug === slug);
  const o = await originale(slug);
  const fileMd = path.join(cartellaMd, `${slug}.md`);
  let md = null;
  if (fs.existsSync(fileMd)) {
    try {
      md = leggiMd(fileMd);
    } catch (e) {
      md = { errore: e.message };
    }
  }
  const etichetta = `${String(voce?.numero ?? md?.dati?.numero ?? '?').padStart(2, '0')} ${slug}`;
  let orig;
  if (o) {
    orig = o.vecchio ? daPaginaEmail(o.html) : daPaginaSito(o.html);
    scrivi(`${etichetta}  (originale: ${o.fonte})`);
    if (!md) {
      scrivi(`   md:   FILE MANCANTE ${fileMd}`);
      problemi++;
      continue;
    }
    if (md.errore) {
      scrivi(`   md:   ILLEGGIBILE (${md.errore})`);
      problemi++;
      continue;
    }
    const dT = differenzeTesti(orig, md.dati, md.corpo);
    if (voce && (norma(voce.titolo) !== norma(md.dati.titolo) || norma(voce.sommario) !== norma(md.dati.sommario) || voce.data !== dataIso(md.dati.data) || voce.numero !== md.dati.numero))
      dT.push('numeri.json del vecchio sito e file .md non coincidono (numero, data, titolo o sommario)');
    if (voce?.lancio && String(voce.lancio) !== String(md.dati.lancio)) dT.push(`lancio: ${voce.lancio} ≠ ${md.dati.lancio}`);
    const { diff: dI, byte } = await differenzeImmagini(orig, md.dati, slug, o.vecchio);
    scrivi(`   md:   testi uguali: ${dT.length ? 'NO' : 'sì'} · immagini uguali: ${dI.length ? 'NO' : 'sì'} (${orig.immagini.length} immagini, byte ${byte})`);
    for (const x of [...dT, ...dI]) scrivi(`         - ${x}`);
    problemi += dT.length + dI.length;
  } else if (md && !md.errore && !voce) {
    orig = daMd(md.dati, md.corpo);
    scrivi(`${etichetta}  (numero nuovo, senza originale: la pagina costruita si confronta con ${fileMd})`);
    const { diff: dI } = immaginiMd(md.dati, slug);
    for (const im of [md.dati.copertina, ...(md.dati.articoli ?? []).map((a) => a.immagine)].filter(Boolean))
      if (!fs.existsSync(path.join('public', im.src))) dI.push(`file mancante: public${im.src}`);
    scrivi(`   md:   immagini presenti e complete: ${dI.length ? 'NO' : 'sì'}`);
    for (const x of dI) scrivi(`         - ${x}`);
    problemi += dI.length;
  } else {
    scrivi(`${etichetta}  ORIGINALE NON TROVATO${md?.errore ? ` e file .md illeggibile (${md.errore})` : ''}`);
    problemi++;
    continue;
  }

  const fileDist = path.join('dist', 'newsletter', 'numeri', slug, 'index.html');
  if (SOLO_MD) continue;
  if (!fs.existsSync(fileDist)) {
    scrivi(`   dist: non costruito (${fileDist} assente: lancia npm run build)`);
    continue;
  }
  const { diffT, diffI, avvisi } = confrontaDist(fileDist, orig, slug);
  scrivi(`   dist: testi uguali: ${diffT.length ? 'NO' : 'sì'} · immagini uguali: ${diffI.length ? 'NO' : 'sì'}`);
  for (const x of [...diffT, ...diffI]) scrivi(`         - ${x}`);
  for (const x of avvisi) scrivi(`         · avviso: ${x}`);
  problemi += diffT.length + diffI.length;
}
scrivi();
scrivi(`Sostituzioni documentate applicate agli originali (src/lib/newsletter-sostituzioni.json): ${SOSTITUZIONI.length} voci, ${sostituzioniApplicate} punti nel testo.`);
scrivi(problemi ? `Differenze trovate: ${problemi}` : `Nessuna differenza su ${slugs.length} numeri.`);
process.exit(problemi ? 1 : 0);
