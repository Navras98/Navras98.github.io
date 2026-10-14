// Scrive .pages.yml (la configurazione di Pages CMS) a partire dagli schemi dei contenuti, con etichette e
// spiegazioni in italiano. Dopo aver cambiato uno schema: node scripts/pages-cms.mjs && node scripts/valida-pages.mjs
import fs from 'node:fs';
import { dump } from 'js-yaml';
import { SEZIONI, campiSezione } from './lib/pages-cms.mjs';

const config = {
  media: [
    { name: 'media', label: 'Immagini e video del sito', input: 'public/media', output: '/media', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'mp4', 'webm'] },
    { name: 'newsletter', label: 'Immagini della newsletter', input: 'public/newsletter', output: '/newsletter', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  ],
  content: SEZIONI.map((s) => ({
    name: s.name,
    label: s.label,
    type: s.type,
    path: s.path,
    ...(s.md ? { format: 'yaml-frontmatter' } : { format: 'yaml' }),
    ...(s.descrizione ? { description: s.descrizione } : {}),
    ...(s.type === 'collection' ? { filename: s.name === 'newsletter' ? '{year}-{month}-{day}.md' : '{primary}.md', view: { fields: ['titolo', 'nome', 'data', 'numero'].filter((c) => s.schema.shape[c]) } } : {}),
    fields: campiSezione(s),
  })),
};
const testa = '# Configurazione di Pages CMS (https://pagescms.org): una sezione per pagina, in italiano.\n# NON modificare a mano: si rigenera dagli schemi con «node scripts/pages-cms.mjs» e si controlla con\n# «node scripts/valida-pages.mjs». Nei titoli: *parola* = corsivo, **parola** = colore blu.\n';
fs.writeFileSync('.pages.yml', testa + dump(config, { lineWidth: 140, noRefs: true }));
console.log(`.pages.yml scritto: ${SEZIONI.length} sezioni`);
