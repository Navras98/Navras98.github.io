// Caricatori delle collezioni: leggono i file di src/content, li controllano con lo schema
// e, se qualcosa non va, fermano la build con un messaggio in italiano (file, campo, problema).
import fs from 'node:fs';
import path from 'node:path';
import { load as leggiYaml } from 'js-yaml';

const CARTELLA = 'src/content';

// Apostrofi e virgolette tipografici in tutti i testi (non in link, percorsi e codici).
const NON_TESTO = new Set(['src', 'link', 'mp4', 'webm', 'copertina', 'indirizzo', 'indirizzo_sito', 'indirizzo_iscrizione', 'email', 'chiave_modulo', 'codice', 'data', 'lancio', 'punto_focale', 'adatta', 'colore', 'stato', 'gruppo', 'partita_iva']);
export const tipografia = (t) =>
  t
    .replace(/(\p{L})'(?=\p{L})/gu, '$1’')
    .replace(/(\p{L})'/gu, '$1’')
    .replace(/"([^"]+)"/g, '«$1»')
    .replace(/\.\.\./g, '…')
    // «e newsletter»: una parola di una o due lettere all'inizio resta attaccata alla seguente
    .replace(/^(\p{Ll}{1,2}) (?=\S)/u, '$1\u00a0')
    // nelle frasi di una riga, l'ultima parola breve resta attaccata alla penultima (niente parole sole a capo)
    .replace(/^([^\n]*\S \S+[^\n]*) (\S{1,14})$/u, (tutto, prima, ultima) => (prima.split(' ').length >= 3 && prima.split(/\s/).pop().length + ultima.length <= 20 ? `${prima}\u00a0${ultima}` : tutto));
const ripulisci = (v, chiave) => {
  if (typeof v === 'string') return NON_TESTO.has(chiave) ? v : tipografia(v);
  if (Array.isArray(v)) return v.map((x) => ripulisci(x, chiave));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ripulisci(x, k)]));
  return v;
};

const sbuccia = (s) => {
  while (s && ['optional', 'default', 'nullable', 'pipe', 'readonly'].includes(s.def?.type)) s = s.def.innerType ?? s.def.in;
  return s;
};

// Il nome leggibile di un campo, ricavato dalle etichette dello schema: «Apertura › Titolo».
export function nomeCampo(schema, percorso) {
  const nomi = [];
  let s = sbuccia(schema);
  for (const passo of percorso) {
    if (typeof passo === 'number' && s?.def?.type === 'array') {
      s = sbuccia(s.def.element);
      nomi.push(`n. ${passo + 1}`);
    } else if (s?.def?.type === 'object' && s.shape[passo]) {
      s = s.shape[passo];
      nomi.push(s.meta?.()?.etichetta ?? String(passo));
      s = sbuccia(s);
    } else nomi.push(String(passo));
  }
  return nomi.join(' › ');
}

const tipi = { string: 'un testo', number: 'un numero', boolean: 'sì o no (true/false)', array: 'un elenco', object: 'un gruppo di campi' };

function spiega(issue) {
  switch (issue.code) {
    case 'invalid_type':
      return issue.input === undefined ? 'manca: è obbligatorio.' : `ha il tipo sbagliato: deve essere ${tipi[issue.expected] ?? issue.expected}.`;
    case 'invalid_value':
      return `valore non ammesso: scegli tra ${issue.values.map((v) => `«${v}»`).join(', ')}.`;
    case 'unrecognized_keys':
      return `campo sconosciuto ${issue.keys.map((k) => `«${k}»`).join(', ')}: controlla come è scritto o toglilo.`;
    case 'too_small':
      return issue.origin === 'array' ? `servono almeno ${issue.minimum} elementi.` : 'non può essere vuoto.';
    default:
      return issue.message.endsWith('.') ? issue.message : issue.message + '.';
  }
}

export function messaggioErrore(file, schema, issues) {
  const righe = issues.map((i) => {
    const p = i.path.length ? i.path.join('.') : '(file intero)';
    const nome = i.path.length ? ` (${nomeCampo(schema, i.path)})` : '';
    return `  • campo ${p}${nome}: ${spiega(i)}`;
  });
  return `Contenuto non valido nel file ${file}\n${righe.join('\n')}\nCorreggi il file e rilancia la build.`;
}

function leggi(rel) {
  const file = path.join(CARTELLA, rel);
  const t = fs.readFileSync(file, 'utf8');
  try {
    if (rel.endsWith('.md')) {
      const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!m) throw new Error('manca l’intestazione racchiusa tra due righe «---».');
      return { dati: leggiYaml(m[1]) ?? {}, corpo: m[2] };
    }
    return { dati: leggiYaml(t) ?? {}, corpo: null };
  } catch (e) {
    throw new Error(`Il file ${file} non si legge: ${e.reason ?? e.message}${e.mark ? ` (riga ${e.mark.line + 1})` : ''}.\nControlla rientri, due punti e virgolette.`);
  }
}

async function salva(ctx, rel, schema, id) {
  const { dati, corpo } = leggi(rel);
  const esito = schema.safeParse(dati);
  if (!esito.success) throw new Error(messaggioErrore(path.join(CARTELLA, rel), schema, esito.error.issues));
  const filePath = path.join(CARTELLA, rel);
  const data = await ctx.parseData({ id, data: ripulisci(esito.data), filePath });
  ctx.store.set({
    id,
    data,
    filePath,
    digest: ctx.generateDigest({ data, corpo }),
    ...(corpo != null ? { body: corpo, rendered: await ctx.renderMarkdown(corpo) } : {}),
  });
}

const osserva = (ctx, cartella, ricarica) => {
  if (!ctx.watcher) return;
  const radice = path.resolve(CARTELLA, cartella);
  ctx.watcher.add(radice);
  const forse = (f) => { if (path.resolve(f).startsWith(radice)) ricarica().catch((e) => ctx.logger.error(e.message)); };
  ctx.watcher.on('change', forse);
  ctx.watcher.on('add', forse);
  ctx.watcher.on('unlink', forse);
};

// Un solo file (per esempio una pagina): la voce ha come id il nome del file senza estensione.
export function unFile(rel, schema) {
  return {
    name: 'contenuto-file',
    load: async (ctx) => {
      const id = path.basename(rel).replace(/\.(ya?ml|md)$/, '');
      const carica = async () => { ctx.store.clear(); await salva(ctx, rel, schema, id); };
      await carica();
      osserva(ctx, rel, carica);
    },
  };
}

// Tutti i file .md o .yml di una cartella (progetti, numeri della newsletter): una voce per file.
export function cartella(rel, schema) {
  return {
    name: 'contenuto-cartella',
    load: async (ctx) => {
      const carica = async () => {
        ctx.store.clear();
        const file = fs.readdirSync(path.join(CARTELLA, rel)).filter((f) => /\.(md|ya?ml)$/.test(f)).sort();
        for (const f of file) await salva(ctx, `${rel}/${f}`, schema, f.replace(/\.(ya?ml|md)$/, ''));
      };
      await carica();
      osserva(ctx, rel, carica);
    },
  };
}
