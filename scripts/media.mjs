// Prima di ogni build: crea versioni AVIF e WebP ridimensionate delle immagini in public/media e public/newsletter.
// Le copie vanno in public/_img (non si modificano a mano e non vanno in git), l'elenco in src/generated/media.json.
// Le copie di immagini che non esistono più vengono cancellate.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SORGENTI = ['public/media', 'public/newsletter'];
const DESTINAZIONE = 'public/_img';
const ELENCO = 'src/generated/media.json';
const LARGHEZZE = [400, 720, 1080, 1600, 2400];
// Qualità alta e colore pieno (4:4:4): sono quasi tutte schermate con testo, che con la compressione forte si impasta.
const FORMATI = { avif: { quality: 70, effort: 4, chromaSubsampling: '4:4:4' }, webp: { quality: 88, smartSubsample: true } };
// versioni da rifare quando cambiano le impostazioni qui sopra
const IMPOSTAZIONI = JSON.stringify(FORMATI);

const file = [];
const cerca = (cartella) => {
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    const p = path.join(cartella, voce.name);
    if (voce.isDirectory()) cerca(p);
    else if (/\.(jpe?g|png|webp|avif)$/i.test(voce.name)) file.push(p);
  }
};
for (const s of SORGENTI) if (fs.existsSync(s)) cerca(s);

const elenco = {};
// se le impostazioni di qualità sono cambiate dall'ultima build, si rifanno tutte le versioni
const FIRMA = path.join(DESTINAZIONE, '.impostazioni');
const vecchie = !fs.existsSync(FIRMA) || fs.readFileSync(FIRMA, 'utf8') !== IMPOSTAZIONI;
// un'immagine si rifà solo se è cambiato il suo contenuto (non la data del file: su GitHub ogni copia del deposito ha date
// nuove, e con la cache delle versioni già pronte la pubblicazione dura un minuto invece di un quarto d'ora)
const IMPRONTE = path.join(DESTINAZIONE, '.impronte.json');
const impronteVecchie = fs.existsSync(IMPRONTE) ? JSON.parse(fs.readFileSync(IMPRONTE, 'utf8')) : {};
const impronte = {};
const tenuti = new Set([path.resolve(FIRMA), path.resolve(path.join(DESTINAZIONE, '.impronte.json'))]);
let creati = 0;
for (const p of file) {
  const rel = path.relative('public', p).split(path.sep).join('/');
  const base = rel.replace(/\.[^.]+$/, '');
  const impronta = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
  impronte[rel] = impronta;
  const cambiata = impronteVecchie[rel] !== impronta;
  const { width, height } = await sharp(p).metadata();
  const larghezze = [...new Set(LARGHEZZE.map((l) => Math.min(l, width)))];
  const voce = { width, height, varianti: {} };
  for (const [formato, opzioni] of Object.entries(FORMATI)) {
    voce.varianti[formato] = [];
    for (const l of larghezze) {
      const uscita = path.join(DESTINAZIONE, `${base}-${l}.${formato}`);
      tenuti.add(path.resolve(uscita));
      const url = '/' + path.relative('public', uscita).split(path.sep).join('/');
      if (!fs.existsSync(uscita) || cambiata || vecchie) {
        fs.mkdirSync(path.dirname(uscita), { recursive: true });
        await sharp(p).resize({ width: l, withoutEnlargement: true })[formato](opzioni).toFile(uscita);
        creati++;
      }
      voce.varianti[formato].push({ url, w: l });
    }
  }
  elenco['/' + rel] = voce;
}

// via le copie orfane
let tolti = 0;
const pulisci = (cartella) => {
  if (!fs.existsSync(cartella)) return;
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    const p = path.join(cartella, voce.name);
    if (voce.isDirectory()) { pulisci(p); if (!fs.readdirSync(p).length) fs.rmdirSync(p); }
    else if (!tenuti.has(path.resolve(p))) { fs.unlinkSync(p); tolti++; }
  }
};
pulisci(DESTINAZIONE);

fs.mkdirSync(DESTINAZIONE, { recursive: true });
fs.writeFileSync(FIRMA, IMPOSTAZIONI);
fs.writeFileSync(IMPRONTE, JSON.stringify(impronte));
fs.mkdirSync(path.dirname(ELENCO), { recursive: true });
fs.writeFileSync(ELENCO, JSON.stringify(elenco, null, 1));
console.log(`media: ${file.length} immagini, ${creati} versioni create, ${tolti} copie orfane tolte`);
