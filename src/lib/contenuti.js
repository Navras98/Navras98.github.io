// Accesso ai contenuti delle collezioni e piccoli aiuti di testo. I componenti non contengono testi: tutto arriva da qui.
import { getEntry, getCollection } from 'astro:content';

// Una pagina (file singolo): restituisce i dati, più l'HTML del testo se è un file .md.
export async function pagina(collezione) {
  const voce = (await getCollection(collezione))[0];
  return { ...voce.data, html: voce.rendered?.html ?? '' };
}

export async function progetti() {
  return (await getCollection('progetti'))
    .map((v) => ({ slug: v.id, ...v.data, html: v.rendered?.html ?? '' }))
    .sort((a, b) => a.ordine - b.ordine);
}

export async function numeri() {
  return (await getCollection('newsletter'))
    .map((v) => ({ slug: v.id, ...v.data, html: v.rendered?.html ?? '' }))
    .sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero);
}

export { getEntry };

// Testi di menu, piè di pagina e interfaccia nella lingua della pagina: per l'inglese usa la tabella «traduzioni»
// di src/content/pagine/newsletter-en.yml; un testo che non è nella tabella resta in italiano.
export async function traduttore(lingua) {
  if (lingua !== 'en') return (t) => t;
  const { traduzioni } = await pagina('newsletterInglese');
  const tabella = new Map(traduzioni.map((x) => [tipografia(x.it), x.en]));
  return (t) => tabella.get(tipografia(t)) ?? t;
}

// Apostrofi e virgolette tipografici (li applica già il caricatore a tutti i testi dei contenuti).
import { tipografia as tipo } from './caricatore.js';
export const tipografia = (t) => tipo(String(t ?? ''));

const sfuggi = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// *parola* → corsivo serif, **parola** → colore d'accento. Le ultime due parole restano unite (niente orfane).
export function titolo(t) {
  return sfuggi(tipografia(t))
    .replace(/ (\S+)$/, ' $1')
    // nei titoli le parole di una o due lettere («e», «a», «Un») restano attaccate alla parola dopo
    .replace(/(^|[\s(«*])(\p{L}{1,2}) (?=\S)/gu, '$1$2\u00a0')
    .replace(/\*\*(.+?)\*\*/g, '<span class="accento">$1</span>')
    .replace(/\*(.+?)\*/g, '<em class="corsivo">$1</em>');
}

export const testoPiano = (t) => tipografia(String(t ?? '').replace(/\*/g, ''));

export const esterno = (link) => /^https?:\/\//.test(link ?? '');

// Nome in due parti: se la seconda parte inizia in minuscolo è una parola a sé ("Automazioni social").
export const spazio = (seconda) => (/^\p{Ll}/u.test(seconda ?? '') ? ' ' : '');

export const dueCifre = (i) => String(i).padStart(2, '0');

// Colonne di una griglia secondo il numero di elementi: niente celle vuote in fondo a 1440 px.
export const griglia = (n) => (n % 3 === 0 ? 'griglia-3' : n % 4 === 0 ? 'griglia-4' : n % 2 === 0 ? 'griglia-2' : 'griglia-3');

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
export const dataEstesa = (d) => {
  const [a, m, g] = String(d).split('-').map(Number);
  return `${g} ${MESI[m - 1]} ${a}`;
};

export const statoClasse = (s) => `stato stato-${String(s).replace(/\s+/g, '-')}`;
