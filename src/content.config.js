// Collezioni dei contenuti: un file per pagina in src/content/pagine, una cartella per i progetti
// e una per i numeri della newsletter. Gli schemi sono in src/lib/schemi.js.
import { defineCollection } from 'astro:content';
import { unFile, cartella } from './lib/caricatore.js';
import * as s from './lib/schemi.js';

const file = (rel, schema) => defineCollection({ loader: unFile(rel, schema), schema });

export const collections = {
  impostazioni: file('impostazioni.yml', s.impostazioni),
  menu: file('menu.yml', s.menu),
  piede: file('piede.yml', s.piede),
  home: file('pagine/home.yml', s.home),
  metodo: file('pagine/metodo.yml', s.metodo),
  progettiPagina: file('pagine/progetti.yml', s.progettiPagina),
  strumenti: file('pagine/strumenti.yml', s.strumenti),
  openSource: file('pagine/open-source.yml', s.openSource),
  chiSono: file('pagine/chi-sono.md', s.chiSono),
  contatti: file('pagine/contatti.yml', s.contatti),
  privacy: file('pagine/privacy.md', s.privacy),
  errore404: file('pagine/errore-404.yml', s.errore404),
  newsletterPagina: file('pagine/newsletter.yml', s.newsletterPagina),
  newsletterInglese: file('pagine/newsletter-en.yml', s.newsletterInglese),
  progetti: defineCollection({ loader: cartella('progetti', s.progetto), schema: s.progetto }),
  newsletter: defineCollection({ loader: cartella('newsletter', s.numeroNewsletter), schema: s.numeroNewsletter }),
};
