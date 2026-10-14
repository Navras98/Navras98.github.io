import { defineConfig } from 'astro/config';
import compatibilita from './scripts/compatibilita.mjs';

export default defineConfig({
  site: 'https://navras98.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    {
      // alla fine della build scrive gli indirizzi del vecchio sito (vedi src/lib/vecchi-indirizzi.json)
      name: 'indirizzi-del-vecchio-sito',
      hooks: {
        'astro:build:done': async ({ dir, logger }) => {
          const n = await compatibilita(new URL(dir).pathname);
          logger.info(`${n} indirizzi del vecchio sito scritti`);
        },
      },
    },
  ],
});
