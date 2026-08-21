/* Genera le pagine .html in radice dai moduli in src/.
   Il sito pubblicato resta statico e senza build obbligatoria: questo passaggio
   serve a tenere testa, menu, piede e token in un punto solo. Uso: node build.mjs */

import { writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { render, SITE, NAV } from './src/layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, 'src', 'pages');

const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort();
const pages = [];

for (const f of files) {
  const mod = await import(join(pagesDir, f) + `?v=${files.length}-${f}`);
  pages.push(mod.default);
}

/* L'elenco delle pagine e quello del menu devono coincidere: se qualcuno
   aggiunge una pagina e dimentica il menu, la build si ferma qui. */
const built = new Set(pages.map((p) => p.file));
for (const item of NAV) {
  if (!built.has(item.file)) throw new Error(`Voce di menu senza pagina: ${item.file}`);
}
for (const p of pages) {
  if (!NAV.some((n) => n.file === p.file)) throw new Error(`Pagina fuori dal menu: ${p.file}`);
}

/* Il collegamento «pagina successiva» deve puntare a una pagina che esiste. */
for (const p of pages) {
  if (p.next && !built.has(p.next.file)) {
    throw new Error(`${p.file}: la pagina successiva ${p.next.file} non esiste`);
  }
}

for (const page of pages) {
  await writeFile(join(here, page.file), render(page), 'utf8');
}

/* sitemap e robots derivati dal menu, non scritti a mano */
const oggi = process.env.SITO_DATA || '2026-08-21';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${NAV.map(
  (n) => `  <url>
    <loc>${SITE.origin}/${n.file === 'index.html' ? '' : n.file}</loc>
    <lastmod>${oggi}</lastmod>
    <priority>${n.file === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`
).join('\n')}
</urlset>
`;
await writeFile(join(here, 'sitemap.xml'), sitemap, 'utf8');

await writeFile(
  join(here, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`,
  'utf8'
);

console.log(`Generate ${pages.length} pagine: ${pages.map((p) => p.file).join(', ')}`);
