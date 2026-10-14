// Corrispondenza tra gli schemi dei contenuti (src/lib/schemi.js) e i campi di Pages CMS (.pages.yml).
import * as s from '../../src/lib/schemi.js';

// Le sezioni di Pages CMS: una per pagina, più impostazioni, menu, piè di pagina, progetti e newsletter.
export const SEZIONI = [
  { name: 'home', label: 'Home', type: 'file', path: 'src/content/pagine/home.yml', schema: s.home },
  { name: 'metodo', label: 'Metodo', type: 'file', path: 'src/content/pagine/metodo.yml', schema: s.metodo },
  { name: 'progetti-pagina', label: 'Progetti: pagina con l’elenco', type: 'file', path: 'src/content/pagine/progetti.yml', schema: s.progettiPagina },
  { name: 'progetti', label: 'Progetti', type: 'collection', path: 'src/content/progetti', schema: s.progetto, md: true, descrizione: 'Una pagina per progetto: il nome del file è l’indirizzo (/progetti/<nome>/).' },
  { name: 'strumenti', label: 'Strumenti', type: 'file', path: 'src/content/pagine/strumenti.yml', schema: s.strumenti },
  { name: 'open-source', label: 'Open source', type: 'file', path: 'src/content/pagine/open-source.yml', schema: s.openSource },
  { name: 'chi-sono', label: 'Chi sono', type: 'file', path: 'src/content/pagine/chi-sono.md', schema: s.chiSono, md: true },
  { name: 'newsletter-pagina', label: 'Newsletter: pagina e testi', type: 'file', path: 'src/content/pagine/newsletter.yml', schema: s.newsletterPagina },
  { name: 'newsletter', label: 'Newsletter: numeri', type: 'collection', path: 'src/content/newsletter', schema: s.numeroNewsletter, md: true, descrizione: 'Un numero = un file. Il nome del file è la data (per esempio 2026-10-20.md) e diventa l’indirizzo /newsletter/numeri/<data>/. Le immagini vanno in public/newsletter/numeri/<data>/.', media: 'newsletter' },
  { name: 'newsletter-en', label: 'Newsletter: pagina inglese', type: 'file', path: 'src/content/pagine/newsletter-en.yml', schema: s.newsletterInglese },
  { name: 'contatti', label: 'Contatti', type: 'file', path: 'src/content/pagine/contatti.yml', schema: s.contatti },
  { name: 'privacy', label: 'Privacy', type: 'file', path: 'src/content/pagine/privacy.md', schema: s.privacy, md: true },
  { name: 'errore-404', label: 'Pagina 404', type: 'file', path: 'src/content/pagine/errore-404.yml', schema: s.errore404 },
  { name: 'menu', label: 'Menu', type: 'file', path: 'src/content/menu.yml', schema: s.menu },
  { name: 'piede', label: 'Piè di pagina e invito finale', type: 'file', path: 'src/content/piede.yml', schema: s.piede },
  { name: 'impostazioni', label: 'Impostazioni', type: 'file', path: 'src/content/impostazioni.yml', schema: s.impostazioni },
];

export const sbuccia = (z) => {
  let opzionale = false;
  while (['optional', 'default', 'nullable', 'pipe', 'readonly'].includes(z.def?.type)) { if (z.def.type !== 'pipe') opzionale = true; z = z.def.innerType ?? z.def.in; }
  return { z, opzionale };
};
const meta = (z) => z.meta?.() ?? {};

// Un campo dello schema → un campo di Pages CMS
export function campo(nome, zOriginale, media) {
  const m = meta(zOriginale);
  let { z, opzionale } = sbuccia(zOriginale);
  const mInterno = meta(z);
  const etichetta = m.etichetta ?? mInterno.etichetta ?? nome;
  const spiegazione = m.spiegazione ?? mInterno.spiegazione;
  let lista = false;
  if (z.def.type === 'array') { lista = true; const e = sbuccia(z.def.element); z = e.z; }
  const mi = meta(z);
  const f = { name: nome, label: etichetta };
  if (spiegazione) f.description = spiegazione;
  switch (z.def.type) {
    case 'object': f.type = 'object'; f.fields = Object.entries(z.shape).map(([k, v]) => campo(k, v, media)); break;
    case 'number': f.type = 'number'; break;
    case 'boolean': f.type = 'boolean'; break;
    case 'enum': f.type = 'select'; f.options = { values: z.options }; break;
    default: {
      const tipo = mi.tipo ?? mInterno.tipo ?? m.tipo;
      f.type = tipo === 'text' ? 'text' : tipo === 'image' ? 'image' : tipo === 'file' ? 'file' : tipo === 'date' ? 'date' : 'string';
      if (f.type === 'date') f.options = { format: 'yyyy-MM-dd' };
      if ((f.type === 'image' || f.type === 'file') && media) f.options = { media };
    }
  }
  if (lista) f.list = true;
  if (!opzionale) f.required = true;
  return f;
}

export function campiSezione(sez) {
  const campi = Object.entries(sez.schema.shape).map(([k, v]) => campo(k, v, sez.media));
  if (sez.md) campi.push({ name: 'body', label: 'Testo', type: 'rich-text' });
  return campi;
}
