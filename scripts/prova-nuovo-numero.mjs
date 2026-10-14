// D4 — Un nuovo numero della newsletter si aggiunge creando UN solo file in src/content/newsletter/.
// La prova crea src/content/newsletter/2026-10-14.md, costruisce il sito a parte e controlla pagina, archivio,
// numeri.json, «ultimo numero», mappa del sito e riquadro in home; poi cancella il file.
import fs from 'node:fs';
import path from 'node:path';
import { costruisci, conModifica } from './lib/prova-build.mjs';

const FILE = 'src/content/newsletter/2026-10-14.md';
const TITOLO = 'Numero di prova: un file solo basta';
const numero = `---
numero: 13
data: "2026-10-14"
titolo: "${TITOLO}"
sommario: "Questo numero esiste solo durante la prova: serve a dimostrare che per aggiungere un numero basta un file."
copertina:
  src: /newsletter/numeri/2026-09-11/copertina.jpg
  alt: "Copertina di prova"
  punto_focale: centro
  adatta: riempi
articoli:
  - rubrica: "Prova"
    titolo: "Un solo file, una pagina nuova"
    testo: |
      Il file contiene titolo, sommario, copertina e articoli.

      La build crea la pagina, aggiorna l'archivio, l'elenco dei numeri e l'ultimo numero.
    fonte:
      nome: "Pages CMS"
      link: "https://pagescms.org"
---
Ci sentiamo al prossimo numero.
`;
if (fs.existsSync(FILE)) { console.log(`${FILE} esiste già: prova annullata`); process.exit(1); }
const r = await conModifica(FILE, numero, () => costruisci());
// gli spazi unificatori messi dalla tipografia (fra le ultime parole di una frase) contano come spazi
const leggi = (p) => { const f = path.join(r.cartella, p); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').replace(/\u00a0|&nbsp;|&#160;/g, ' ') : ''; };
const controlli = [
  ['la build riesce', r.ok],
  ['pagina /newsletter/numeri/2026-10-14/ creata con il titolo', leggi('newsletter/numeri/2026-10-14/index.html').includes(TITOLO)],
  ['l’archivio /newsletter/ la elenca per prima', (() => { const t = leggi('newsletter/index.html'); return t.includes('/newsletter/numeri/2026-10-14/') && t.indexOf('/newsletter/numeri/2026-10-14/') < t.indexOf('/newsletter/numeri/2026-09-11/'); })()],
  ['numeri.json la mette in cima', JSON.parse(leggi('newsletter/numeri.json') || '{"numeri":[]}').numeri[0]?.slug === '2026-10-14'],
  ['/newsletter/ultimo/ porta al numero nuovo', leggi('newsletter/ultimo/index.html').includes('url=/newsletter/numeri/2026-10-14/')],
  ['la mappa del sito lo contiene', leggi('sitemap.xml').includes('/newsletter/numeri/2026-10-14/')],
  ['il riquadro newsletter della home mostra il numero nuovo', leggi('index.html').includes(TITOLO)],
  ['il numero precedente rimanda al nuovo («Numero successivo»)', leggi('newsletter/numeri/2026-09-11/index.html').includes('/newsletter/numeri/2026-10-14/')],
];
for (const [cosa, ok] of controlli) console.log(`  ${ok ? '✓' : '✗'} ${cosa}`);
fs.rmSync(r.cartella, { recursive: true, force: true });
console.log(`  ${fs.existsSync(FILE) ? '✗' : '✓'} file di prova cancellato, contenuti come prima`);
const falliti = controlli.filter(([, ok]) => !ok).length;
console.log(`D4: un file → ${controlli.length - falliti}/${controlli.length} controlli riusciti`);
process.exit(falliti ? 1 : 0);
