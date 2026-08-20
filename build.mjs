/* Genera le pagine .html in radice dai moduli in src/.
   Il sito pubblicato resta statico: questo passaggio serve solo a tenere
   head, menu e piede in un punto solo. Uso: node build.mjs */

import { writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { render, SITE, NAV } from './src/layout.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, 'src', 'pages');

const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs')).sort();
const pages = [];

for (const f of files) {
  const mod = await import(join(pagesDir, f));
  pages.push(mod.default);
}

/* controllo: ogni voce del menu ha una pagina, e viceversa */
const built = new Set(pages.map((p) => p.file));
for (const item of NAV) {
  if (!built.has(item.file)) throw new Error(`Menu senza pagina: ${item.file}`);
}
for (const p of pages) {
  if (!NAV.some((n) => n.file === p.file)) throw new Error(`Pagina fuori dal menu: ${p.file}`);
}

for (const page of pages) {
  await writeFile(join(here, page.file), render(page), 'utf8');
}

/* sitemap derivata dal menu, non scritta a mano */
const today = '2026-08-21';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${NAV.map(
  (n) => `  <url>
    <loc>${SITE.origin}/${n.file === 'index.html' ? '' : n.file}</loc>
    <lastmod>${today}</lastmod>
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
