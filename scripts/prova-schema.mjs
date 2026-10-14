// D2 — Un campo sbagliato o mancante ferma la build con un messaggio in italiano che dice il file e il campo.
// Tre prove su file diversi, poi tutto torna com'era.
import fs from 'node:fs';
import { costruisci, conModifica } from './lib/prova-build.mjs';

const prove = [
  { file: 'src/content/pagine/home.yml', cosa: 'titolo dell’apertura cancellato', cambia: (t) => t.replace(/^  titolo: Agenti AI che .*$/m, ''), atteso: [/Contenuto non valido nel file src\/content\/pagine\/home\.yml/, /campo apertura\.titolo \(Apertura › Titolo sotto il nome\): manca: è obbligatorio\./] },
  { file: 'src/content/progetti/sfornaclaw.md', cosa: 'colore non ammesso', cambia: (t) => t.replace(/^colore: rosso$/m, 'colore: fucsia'), atteso: [/src\/content\/progetti\/sfornaclaw\.md/, /campo colore \(Colore\): valore non ammesso: scegli tra «blu», «rosso»/] },
  { file: 'src/content/pagine/chi-sono.md', cosa: 'foto che non esiste', cambia: (t) => t.replace('/media/foto/andrea-ritratto.jpg', '/media/foto/non-esiste.jpg'), atteso: [/src\/content\/pagine\/chi-sono\.md/, /campo apertura\.foto\.src \(Apertura › Foto principale › File\): il file «\/media\/foto\/non-esiste\.jpg» non esiste in public\//] },
];
let falliti = 0;
for (const p of prove) {
  const r = await conModifica(p.file, p.cambia, () => costruisci());
  const msg = r.uscita.split('\n').filter((l) => /Contenuto non valido|campo |Correggi/.test(l)).join('\n');
  const ok = !r.ok && p.atteso.every((re) => re.test(r.uscita));
  if (!ok) falliti++;
  console.log(`  ${ok ? '✓' : '✗'} ${p.file}: ${p.cosa} → build ${r.ok ? 'RIUSCITA (doveva fermarsi)' : 'fermata'}`);
  console.log(msg.split('\n').map((l) => '      ' + l.trim()).join('\n'));
  fs.rmSync(r.cartella, { recursive: true, force: true });
}
const dopo = costruisci();
console.log(`  ${dopo.ok ? '✓' : '✗'} file ripristinati: la build torna a funzionare`);
fs.rmSync(dopo.cartella, { recursive: true, force: true });
console.log(`D2: ${prove.length} prove, ${falliti} senza il messaggio atteso`);
process.exit(falliti || !dopo.ok ? 1 : 0);
