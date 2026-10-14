// Dopo la build: scrive in dist/ gli indirizzi del vecchio sito, così nessun link vecchio finisce su una pagina 404.
// Pagine → piccola pagina che reindirizza; file (immagini, icone, caratteri) → copia del file nuovo più vicino.
// Elenco in src/lib/vecchi-indirizzi.json. Si può lanciare anche da solo: node scripts/compatibilita.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sfuggi = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export default async function compatibilita(dist = 'dist', sito = 'https://navras98.github.io') {
  const elenco = JSON.parse(fs.readFileSync('src/lib/vecchi-indirizzi.json', 'utf8'));
  let n = 0;
  const scrivi = (vecchio, dati) => {
    const dove = path.join(dist, vecchio.endsWith('/') ? vecchio + 'index.html' : vecchio);
    if (fs.existsSync(dove)) throw new Error(`compatibilità: ${vecchio} esiste già nella build, toglilo da src/lib/vecchi-indirizzi.json`);
    fs.mkdirSync(path.dirname(dove), { recursive: true });
    fs.writeFileSync(dove, dati);
    n++;
  };
  for (const [vecchio, nuovo] of Object.entries(elenco.pagine)) {
    const assoluto = sito + nuovo;
    const lingua = vecchio.startsWith('/en/') ? 'en' : 'it';
    scrivi(vecchio, `<!doctype html>
<html lang="${lingua}">
<head>
<meta charset="utf-8">
<title>${lingua === 'en' ? 'This page has moved' : 'Questa pagina si è spostata'} · Andrea Sforna</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="${sfuggi(assoluto)}">
<meta http-equiv="refresh" content="0; url=${sfuggi(nuovo)}">
<script>location.replace(${JSON.stringify(nuovo)} + location.search)</script>
</head>
<body><p><a href="${sfuggi(nuovo)}">${lingua === 'en' ? 'This page has moved here' : 'La pagina si è spostata qui'}</a></p></body>
</html>
`);
  }
  for (const [vecchio, nuovo] of Object.entries(elenco.file)) {
    const sorgente = path.join(dist, nuovo);
    if (!fs.existsSync(sorgente)) throw new Error(`compatibilità: ${nuovo} (per ${vecchio}) non esiste nella build`);
    const est = path.extname(vecchio).toLowerCase();
    const formato = { '.png': 'png', '.webp': 'webp' }[est];
    const daConvertire = formato && path.extname(nuovo).toLowerCase() !== est;
    scrivi(vecchio, daConvertire ? await sharp(sorgente, { density: 300 }).resize({ width: 1200, withoutEnlargement: true })[formato]().toBuffer() : fs.readFileSync(sorgente));
  }
  for (const [vecchio, testo] of Object.entries(elenco.vuoti)) scrivi(vecchio, testo);
  return n;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = await compatibilita(process.argv[2] ?? 'dist');
  console.log(`compatibilità: ${n} indirizzi del vecchio sito scritti`);
}
