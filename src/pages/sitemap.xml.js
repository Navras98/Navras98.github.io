// /sitemap.xml: tutte le pagine pubbliche (lo stesso indirizzo della mappa del vecchio sito).
import { pagina, progetti, numeri } from '../lib/contenuti.js';

export async function GET() {
  const { indirizzo_sito } = await pagina('impostazioni');
  const base = indirizzo_sito.replace(/\/$/, '');
  const percorsi = [
    '/', '/metodo/', '/progetti/', ...(await progetti()).map((p) => `/progetti/${p.slug}/`),
    '/strumenti/', '/open-source/', '/chi-sono/', '/newsletter/', ...(await numeri()).map((n) => `/newsletter/numeri/${n.slug}/`),
    '/en/newsletter/', '/contatti/', '/privacy/',
  ];
  const righe = percorsi.map((p) => `  <url><loc>${base}${p}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${righe}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
