// A5 — Testi: parole vietate, punti esclamativi ed emoji in src/content = 0; nessuna sigla tecnica fuori da
// Strumenti e Open source; niente superlativi né numeri di versione.
// L'archivio della newsletter (src/content/newsletter) riporta alla lettera numeri già spediti (criterio C2):
// lì si controllano parole vietate, punti esclamativi ed emoji, non le sigle delle notizie riportate.
import { fileContenuti, testiDi } from './lib/contenuti.mjs';

const VIETATE = ['soluzioni innovative', "all'avanguardia", 'all’avanguardia', 'rivoluzionari', 'a 360 gradi', 'sinergi', 'leader', 'game changer', 'potenziare', 'potenzia ', 'sblocca', 'trasformazione digitale', 'next level', 'senza precedenti', 'eccellenz', 'da bambino'];
const SIGLE = ['API', 'CLI', 'LLM', 'RAG', 'MCP', 'SDK', 'GPU', 'CPU', 'VPN', 'SSH', 'JSON', 'YAML', 'HTML', 'CSS', 'URL', 'HTTP', 'HTTPS', 'DNS', 'IP', 'OS', 'RAM', 'SaaS', 'PR', 'CI', 'UI', 'UX', 'AWS', 'VM', 'SQL', 'NAS', 'LAN', 'KPI', 'ERP', 'CRM', 'OCR', 'IDE', 'NPM', 'IT', 'MIT', 'PEC', 'CMS', 'SSD'];
const TECNICHE = ['src/content/pagine/strumenti.yml', 'src/content/pagine/open-source.yml'];
const errori = [];
let controllati = 0;
for (const file of fileContenuti()) {
  const archivio = file.startsWith('src/content/newsletter/');
  for (const { campo, testo } of testiDi(file)) {
    controllati++;
    const basso = testo.toLowerCase();
    for (const v of VIETATE) if (basso.includes(v)) errori.push(`${file} › ${campo}: parola vietata «${v.trim()}»`);
    if (testo.includes('!')) errori.push(`${file} › ${campo}: punto esclamativo`);
    if (/\p{Extended_Pictographic}/u.test(testo)) errori.push(`${file} › ${campo}: emoji`);
    if (archivio) continue;
    if (/\b\p{L}+issim[oaie]\b/iu.test(testo) || /\b(il|la|i|le) (migliore|migliori|più (bravo|potente|avanzat[oaie]))\b/i.test(testo)) errori.push(`${file} › ${campo}: superlativo`);
    if (/\bv?\d+\.\d+(\.\d+)?\b/.test(testo.replace(/\b\d{1,3}(\.\d{3})+\b/g, '')) && !/CC (BY|0)/.test(testo)) errori.push(`${file} › ${campo}: numero di versione «${testo.match(/\bv?\d+\.\d+(\.\d+)?\b/)[0]}»`);
    if (!TECNICHE.includes(file)) for (const s of SIGLE) if (new RegExp(`(^|[^\\p{L}])${s}([^\\p{L}]|$)`, 'u').test(testo)) errori.push(`${file} › ${campo}: sigla tecnica «${s}»`);
  }
}
console.log(`A5 testi: ${controllati} testi controllati in src/content`);
if (errori.length) { console.log(errori.map((e) => '  ✗ ' + e).join('\n')); console.log(`A5: ${errori.length} problemi`); process.exit(1); }
console.log('A5: 0 parole vietate, 0 punti esclamativi, 0 emoji, 0 superlativi, 0 versioni, 0 sigle tecniche fuori da Strumenti e Open source');
