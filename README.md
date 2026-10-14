# Sito di Andrea Sforna

Sito statico fatto con [Astro](https://astro.build). Testi, foto e video stanno in `src/content/` e `public/media/`,
modificabili dal browser con [Pages CMS](https://pagescms.org) (configurazione in `.pages.yml`, una sezione per pagina).

1. Installa Node.js 22.12 o più recente, poi `npm ci`.
2. `npm run dev` e apri http://localhost:4321 (anteprima con ricarica automatica).
3. `npm run build` crea il sito in `dist/`; `npm run preview` lo serve in locale.
4. `npm run verifica` lancia tutti i controlli (testi, privacy, link, accessibilità, prestazioni, video, newsletter).
5. A ogni push su `main` la GitHub Action in `.github/workflows/deploy.yml` lo pubblica su GitHub Pages.
6. Regole per chi modifica il sito (persone e agenti) e dove si cambia cosa: `CLAUDE.md`.
