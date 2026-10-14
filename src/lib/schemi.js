// Schemi dei contenuti: per ogni file di src/content dicono quali campi servono e di che tipo.
// Le etichette e le spiegazioni in italiano finiscono anche in Pages CMS (scripts/pages-cms.mjs le copia in .pages.yml).
import { z } from 'astro/zod';
import fs from 'node:fs';
import path from 'node:path';

export const PUNTI_FOCALI = ['centro', 'alto', 'basso', 'sinistra', 'destra'];
export const ADATTA = ['riempi', 'intera'];
export const COLORI = ['blu', 'rosso', 'viola', 'giallo', 'acqua', 'rosa', 'lime', 'verde', 'indaco', 'ciano', 'arancio'];
export const STATI = ['integrata', 'in revisione', 'proposta'];

const conNome = (schema, etichetta, spiegazione, extra = {}) => schema.meta({ etichetta, ...(spiegazione ? { spiegazione } : {}), ...extra });
const esiste = (p) => typeof p === 'string' && fs.existsSync(path.join('public', decodeURI(p.split('#')[0])));

// ——— Mattoni ———
export const testo = (etichetta, spiegazione) => conNome(z.string().trim().min(1, 'non può essere vuoto'), etichetta, spiegazione);
export const paragrafo = (etichetta, spiegazione) => conNome(z.string().trim().min(1, 'non può essere vuoto'), etichetta, spiegazione, { tipo: 'text' });
export const titolo = (etichetta, spiegazione = '*parola* = corsivo, **parola** = blu') => testo(etichetta, spiegazione);
export const data = (etichetta, spiegazione) => conNome(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'deve essere una data nel formato AAAA-MM-GG'), etichetta, spiegazione, { tipo: 'date' });
export const numero = (etichetta, spiegazione) => conNome(z.number({ error: 'deve essere un numero' }), etichetta, spiegazione);
export const interruttore = (etichetta, spiegazione) => conNome(z.boolean({ error: 'deve essere sì o no (true/false)' }), etichetta, spiegazione);
export const scelta = (valori, etichetta, spiegazione) => conNome(z.enum(valori), etichetta, spiegazione);
export const link = (etichetta, spiegazione) =>
  conNome(z.string().trim().regex(/^(\/|https:\/\/|mailto:|#)/, 'deve iniziare con «/», «https://», «mailto:» o «#»'), etichetta, spiegazione);
export const lista = (schema, etichetta, spiegazione, minimo = 1) =>
  conNome(z.array(schema).min(minimo, `servono almeno ${minimo} elementi`), etichetta, spiegazione);
export const gruppo = (campi, etichetta, spiegazione) => conNome(z.object(campi).strict(), etichetta, spiegazione);
export const facoltativo = (schema) => schema.optional();

const percorso = (etichetta, spiegazione, tipo, estensioni) =>
  conNome(
    z
      .string()
      .trim()
      .regex(/^\//, 'deve iniziare con «/» (per esempio /media/foto/andrea.jpg)')
      .refine((p) => estensioni.test(p), `formato non ammesso: usa ${String(estensioni).replace(/[\\/^$()?:i]/g, '').split('|').join(', ')}`)
      .refine(esiste, { error: (i) => `il file «${i.input}» non esiste in public/` }),
    etichetta,
    spiegazione,
    { tipo }
  );
export const fileImmagine = (etichetta, spiegazione) => percorso(etichetta, spiegazione, 'image', /\.(jpe?g|png|webp|avif|svg)$/i);

// Ogni immagine porta con sé testo alternativo, punto focale e modo di adattarsi al riquadro.
export const immagine = (etichetta, spiegazione) =>
  gruppo(
    {
      src: fileImmagine('File', 'Un file in public/media (foto/, progetti/, icone/, strumenti/, prove/).'),
      alt: conNome(z.string().trim(), 'Testo alternativo', "Cosa si vede, in una frase. Vuoto solo se l'immagine è decorativa."),
      punto_focale: scelta(PUNTI_FOCALI, 'Punto focale', "La parte da tenere sempre visibile quando l'immagine viene ritagliata."),
      adatta: scelta(ADATTA, 'Adatta', "riempi = riempie il riquadro e può tagliare i bordi; intera = mostra tutta l'immagine (per gli screenshot verticali)."),
    },
    etichetta,
    spiegazione
  );

export const video = (etichetta, spiegazione) =>
  gruppo(
    {
      mp4: percorso('Video MP4', 'File .mp4 in public/media/video.', 'file', /\.mp4$/i),
      webm: percorso('Video WebM', 'Lo stesso video in formato .webm.', 'file', /\.webm$/i),
      copertina: fileImmagine('Copertina', 'Immagine mostrata prima che il video parta e a chi ha chiesto meno movimento.'),
      descrizione: testo('Descrizione', 'Cosa mostra il video, in una frase (per chi non lo vede).'),
      didascalia: facoltativo(conNome(z.string().trim().max(60, 'al massimo 60 caratteri'), 'Didascalia breve', 'Riga sopra il video nelle pagine progetto, al massimo 60 caratteri. Se è vuota si usa la descrizione.')),
      telefono: facoltativo(
        gruppo(
          {
            mp4: percorso('Video MP4 per il telefono', 'Versione verticale 4:5 (720×900) per gli schermi sotto i 640 px.', 'file', /\.mp4$/i),
            webm: percorso('Video WebM per il telefono', 'La stessa versione verticale in .webm.', 'file', /\.webm$/i),
          },
          'Versione per il telefono',
          'Facoltativa: se c’è, sotto i 640 px si vede questa al posto del video orizzontale.'
        )
      ),
      punto_focale: scelta(PUNTI_FOCALI, 'Punto focale', 'La parte da tenere sempre visibile.'),
      adatta: scelta(ADATTA, 'Adatta', 'riempi = riempie il riquadro; intera = mostra tutto il video.'),
    },
    etichetta,
    spiegazione
  );

export const collegamento = (etichetta, spiegazione) => gruppo({ etichetta: testo('Testo'), link: link('Link') }, etichetta, spiegazione);

// Carta «canale» (come le carte di supporto di ArtCraft): icona, titolo, testo e un link.
export const carteCanale = (etichetta, spiegazione) =>
  lista(
    gruppo(
      { icona: scelta(['posta', 'github', 'instagram', 'x', 'casa', 'progetti', 'newsletter'], 'Icona'), titolo: testo('Titolo'), testo: paragrafo('Testo'), link: collegamento('Link') },
      'Carta'
    ),
    etichetta,
    spiegazione
  );

const seo = gruppo(
  {
    titolo: testo('Titolo nella scheda del browser'),
    descrizione: paragrafo('Descrizione per Google e per le anteprime', 'Una o due frasi, al massimo 160 caratteri.'),
    immagine: immagine('Immagine di condivisione', 'Anteprima quando la pagina viene condivisa (1200×630).'),
  },
  'Ricerca e condivisione'
);

const testata = (conTesto = true) => ({
  etichetta: testo('Etichetta piccola', 'Riga in maiuscoletto sopra il titolo.'),
  titolo: titolo('Titolo'),
  ...(conTesto ? { testo: paragrafo('Testo') } : {}),
});

const introSezione = (extra = {}) =>
  gruppo(
    {
      etichetta: testo('Nome della sezione', 'Compare nella barra «01 / NOME» e nell’indice a destra.'),
      didascalia: testo('Didascalia', 'Testo piccolo a destra della barra.'),
      titolo: titolo('Titolo'),
      testo: paragrafo('Testo'),
      ...extra,
    },
    'Sezione'
  );

// ——— Impostazioni, menu, piè di pagina ———
export const impostazioni = z
  .object({
    nome: testo('Nome'),
    titolo_sito: testo('Titolo del sito', 'Titolo della home nella scheda del browser.'),
    descrizione: paragrafo('Descrizione del sito'),
    indirizzo_sito: link('Indirizzo del sito'),
    email: conNome(z.string().email('deve essere un indirizzo email valido'), 'Email'),
    partita_iva: testo('Partita IVA'),
    lavoro: testo('Lavoro'),
    immagine_condivisione: immagine('Immagine di condivisione predefinita'),
    chiave_modulo: conNome(z.string().trim(), 'Chiave Web3Forms', 'Chiave pubblica del modulo contatti. Se è vuota, al posto del modulo compare un pulsante email.'),
    indirizzo_iscrizione: conNome(z.string().trim().regex(/^(https:\/\/.+)?$/, 'deve essere vuoto o iniziare con https://'), 'Indirizzo di iscrizione alla newsletter', 'Se è vuoto, il modulo prepara un’email di iscrizione.'),
    social: lista(gruppo({ nome: scelta(['GitHub', 'Instagram', 'X', 'LinkedIn'], 'Rete'), indirizzo: link('Indirizzo del profilo') }, 'Profilo'), 'Profili social'),
    interfaccia: gruppo(
      Object.fromEntries(
        [
          ['salta_al_contenuto', 'Link «vai al contenuto»'], ['menu_principale', 'Nome del menu'], ['apri_menu', 'Apri il menu'], ['chiudi_menu', 'Chiudi il menu'],
          ['cambia_tema', 'Cambia tema'], ['indice_sezioni', 'Nome dell’indice'], ['torna_alla_home', 'Logo: torna alla home'], ['tutti_i_progetti', 'Voce «tutti i progetti»'],
          ['condividi', 'Condividi'], ['copia_link', 'Copia link'], ['link_copiato', 'Link copiato'], ['progetto', 'Progetto'], ['cosa_ottieni', 'Cosa ottieni'],
          ['dettagli', 'Dettagli'], ['altri_progetti', 'Altri progetti'], ['altri_progetti_didascalia', 'Didascalia «altri progetti»'], ['partita_iva', 'P.IVA'], ['email', 'Email'], ['vedi_su_github', 'Vedi su GitHub'],
          ['esplora', 'Esplora'], ['video', 'Etichetta dei video'], ['immagine_intera', 'Immagine intera'], ['ritratto', 'Etichetta del ritratto'], ['scorri', 'Scorri'], ['precedente', 'Precedente'], ['successiva', 'Successiva'], ['apre_nuova_scheda', 'Si apre in una nuova scheda'],
        ].map(([k, e]) => [k, testo(e)])
      ),
      'Piccoli testi dell’interfaccia'
    ),
  })
  .strict();

export const menu = z
  .object({
    voci: lista(
      gruppo(
        {
          etichetta: testo('Testo'),
          link: link('Link'),
          separatore: facoltativo(interruttore('Linea prima della voce')),
          tendina: facoltativo(interruttore('Tendina dei progetti', 'Se è sì, la voce apre l’elenco dei progetti con le icone.')),
        },
        'Voce'
      ),
      'Voci del menu'
    ),
    link_icona: collegamento('Link con icona (GitHub)'),
    bottone: collegamento('Bottone in alto a destra'),
  })
  .strict();

export const piede = z
  .object({
    frase: paragrafo('Frase sotto il logo'),
    colonne: lista(gruppo({ titolo: testo('Titolo'), link: lista(collegamento('Link'), 'Link') }, 'Colonna'), 'Colonne di link'),
    motto: testo('Riga in fondo a destra'),
    invito: gruppo(
      {
        etichetta: testo('Nome della sezione'),
        sopratitolo: testo('Sopratitolo'),
        titolo: titolo('Titolo'),
        testo: paragrafo('Testo'),
        bottone_principale: collegamento('Bottone principale'),
        bottone_secondario: collegamento('Bottone secondario'),
      },
      'Invito finale',
      'Il blocco «scrivimi» in fondo a ogni pagina.'
    ),
  })
  .strict();

// ——— Pagine ———
// progetti a cui un obiettivo o una tappa possono rimandare (open-source = la pagina Open source)
export const PROGETTI = ['agenti-personali', 'sfornaclaw', 'privacybridge', 'automazioni', 'open-source'];
const obiettivo = gruppo(
  { titolo: testo('Titolo'), testo: paragrafo('Testo'), progetto: facoltativo(scelta(PROGETTI, 'Progetto', 'Facoltativo: mostra l’icona del progetto e porta alla sua pagina.')) },
  'Voce'
);

const fase = gruppo(
  {
    nome: testo('Nome della fase', 'Una o due parole, per esempio «Ascolto».'),
    titolo: titolo('Titolo'),
    testo: paragrafo('Cosa faccio'),
    ottieni: lista(testo('Voce'), 'Cosa ottieni', 'Cosa ha in mano il cliente alla fine della fase.'),
    immagine: facoltativo(immagine('Immagine', 'Un dettaglio reale o uno schema che mostra la fase.')),
    video: facoltativo(video('Video', 'Animazione della fase, 6 secondi. Se c’è, si vede al posto dell’immagine (l’immagine resta per chi chiede meno movimento).')),
  },
  'Fase'
);

const proveFascia = gruppo(
  {
    etichetta: testo('Nome della fascia', 'Per chi usa un lettore di schermo.'),
    voci: lista(
      gruppo({ logo: immagine('Logo'), testo: testo('Testo'), stato: testo('Stato', 'Lo stato vero, verificato su GitHub.'), link: link('Link alla prova') }, 'Prova'),
      'Prove'
    ),
  },
  'Fascia delle prove'
);

const schedaFunzione = gruppo(
  {
    etichetta: testo('Etichetta'),
    titolo: titolo('Titolo'),
    testo: paragrafo('Testo'),
    risultato: facoltativo(testo('Cosa ti resta', 'Il risultato concreto, in una frase. Compare in fondo alla scheda con la spunta.')),
    colore: facoltativo(scelta(COLORI, 'Colore del palco', 'Il colore della luce dietro al video.')),
    video: facoltativo(video('Video')),
    immagine: facoltativo(immagine('Immagine', 'Usata se non c’è un video.')),
    link: facoltativo(collegamento('Link')),
  },
  'Scheda'
);

export const home = z
  .object({
    seo,
    apertura: gruppo(
      {
        titolo: titolo('Titolo sotto il nome'),
        testo: paragrafo('Testo'),
        bottone_principale: collegamento('Bottone principale'),
        bottone_secondario: collegamento('Bottone secondario'),
        riga: lista(collegamento('Voce'), 'Riga piccola sotto i bottoni'),
        carte: lista(video('Video'), 'Carte video in orbita', 'Sette video brevi e muti che girano attorno al nome.', 3),
        immagini: facoltativo(lista(immagine('Immagine'), 'Icone in orbita', 'Icone quadrate (in public/media/icone/) che girano insieme ai video.', 0)),
      },
      'Apertura'
    ),
    prove: proveFascia,
    cosa_faccio: introSezione({ schede: lista(schedaFunzione, 'Schede') }),
    metodo: introSezione({ bottone: collegamento('Bottone') }),
    progetti: introSezione(),
    open_source: introSezione({ prove: lista(testo('Codice della prova', 'Il «codice» di una prova scritta nella pagina Open source.'), 'Prove da mostrare'), bottone: collegamento('Bottone') }),
    strumenti: introSezione({ nota: testo('Nota'), bottone: collegamento('Bottone') }),
    principi: introSezione({
      testo: facoltativo(paragrafo('Testo', 'Facoltativo: in home i principi stanno senza paragrafo, per tenere la pagina corta.')),
      principi: lista(
        gruppo({ lettera: testo('Lettera'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), bottone: facoltativo(collegamento('Bottone')) }, 'Principio'),
        'Principi'
      ),
    }),
    chi_sono: introSezione({
      foto: immagine('Foto'),
      bottone: collegamento('Bottone'),
      dettagli: lista(gruppo({ etichetta: testo('Etichetta'), valore: testo('Valore'), link: facoltativo(link('Link')) }, 'Dettaglio'), 'Dettagli'),
    }),
    newsletter: gruppo({ etichetta: testo('Nome della sezione'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), link: collegamento('Link all’archivio') }, 'Riquadro newsletter'),
  })
  .strict();

export const metodo = z
  .object({
    seo,
    apertura: gruppo(testata(), 'Apertura'),
    fasi: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), voci: lista(fase, 'Fasi') }, 'Le fasi'),
    non_faccio: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), voci: lista(gruppo({ titolo: testo('Titolo'), testo: paragrafo('Testo') }, 'Voce'), 'Voci') },
      'Cosa non faccio'
    ),
    obiettivi: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), voci: lista(obiettivo, 'Voci') },
      'I miei obiettivi'
    ),
  })
  .strict();

export const progettiPagina = z
  .object({
    seo,
    apertura: gruppo(testata(), 'Apertura'),
    elenco: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia') }, 'Elenco'),
  })
  .strict();

export const progetto = z
  .object({
    ordine: numero('Ordine', 'Posizione nell’elenco dei progetti (1 = primo).'),
    nome: testo('Nome', 'Prima parte del nome, per esempio «Sforna».'),
    nome_colorato: testo('Seconda parte colorata', 'Per esempio «Claw». Se inizia in minuscolo viene staccata da uno spazio.'),
    categoria: testo('Categoria'),
    colore: scelta(COLORI, 'Colore'),
    icona: immagine('Icona'),
    seo,
    scheda: gruppo(
      {
        testo: paragrafo('Testo breve'),
        immagine: immagine('Immagine della scheda'),
        stato: lista(testo('Voce'), 'Stato'),
        dove: lista(testo('Voce'), 'Dove funziona'),
        link_etichetta: testo('Testo del link'),
      },
      'Scheda nell’elenco dei progetti'
    ),
    apertura: gruppo(
      { sottotitolo: titolo('Sottotitolo'), testo: paragrafo('Testo'), video: video('Video'), link_esterni: lista(collegamento('Link'), 'Link esterni', '', 0) },
      'Apertura'
    ),
    cosa_ottieni: gruppo({ etichetta: facoltativo(testo('Nome della sezione', 'Se è vuoto: «Cosa ottieni».')), didascalia: testo('Didascalia della barra', 'Descrive la sezione, senza ripetere il nome del progetto.'), titolo: titolo('Titolo'), punti: lista(gruppo({ titolo: testo('Titolo'), testo: paragrafo('Testo') }, 'Punto'), 'Punti') }, 'Cosa ottieni'),
    capacita: facoltativo(
      gruppo(
        {
          etichetta: testo('Nome della sezione'),
          didascalia: testo('Didascalia della barra'),
          titolo: titolo('Titolo'),
          testo: facoltativo(paragrafo('Testo')),
          voci: lista(schedaFunzione, 'Schede', 'Una scheda per ogni cosa che sa fare, ognuna con il suo video vero.'),
        },
        'Cosa sa fare',
        'Facoltativa: schede con video, come «Cosa faccio» della home.'
      )
    ),
    processo: facoltativo(
      gruppo(
        {
          etichetta: testo('Nome della sezione'),
          didascalia: testo('Didascalia della barra'),
          titolo: titolo('Titolo'),
          testo: paragrafo('Testo'),
          passi: lista(gruppo({ nome: testo('Nome del passo'), icona: scelta(['notizie', 'testo', 'immagine', 'telegram', 'invia', 'archivio', 'mano', 'posta'], 'Icona'), testo: paragrafo('Cosa succede'), umano: facoltativo(interruttore('Serve una persona', 'Evidenzia il passo in cui decide una persona.')) }, 'Passo'), 'Passi'),
        },
        'Come funziona',
        'Schema animato dei passi.'
      )
    ),
    caroselli: facoltativo(
      gruppo(
        {
          etichetta: testo('Nome della sezione'),
          didascalia: testo('Didascalia della barra'),
          titolo: titolo('Titolo'),
          testo: paragrafo('Testo'),
          serie: lista(gruppo({ nome: testo('Nome della serie'), slide: lista(immagine('Slide'), 'Slide'), crediti: facoltativo(gruppo({ nota: testo('Nota'), voci: lista(collegamento('Credito'), 'Crediti') }, 'Crediti delle foto', 'Autore e licenza di ogni foto usata nelle slide.')) }, 'Carosello'), 'Caroselli'),
          storie: lista(immagine('Storia'), 'Storie', '', 0),
        },
        'Esempi veri'
      )
    ),
    galleria: gruppo(
      {
        didascalia: testo('Didascalia della barra'),
        titolo: titolo('Titolo'),
        voci: lista(gruppo({ immagine: immagine('Immagine'), immagine_telefono: facoltativo(immagine('Per telefono', 'Facoltativa: la stessa schermata in una finestra stretta, mostrata sotto i 640 px (per esempio un terminale).')), didascalia: testo('Didascalia') }, 'Immagine'), 'Immagini', '', 0),
      },
      'Galleria di dettagli'
    ),
  })
  .strict();

export const strumenti = z
  .object({
    seo,
    apertura: gruppo({ ...testata(), nota: testo('Nota', 'Per esempio: strumenti che uso, nessuna affiliazione.') }, 'Apertura'),
    elenco: gruppo(
      {
        etichetta: testo('Nome della sezione'),
        didascalia: testo('Didascalia'),
        voci: lista(
          gruppo(
            {
              nome: testo('Nome'),
              logo: immagine('Logo'),
              gruppo: scelta(['Agenti', 'Automazioni', 'Modelli', 'Privacy e sicurezza'], 'Gruppo'),
              in_home: interruttore('Anche in home'),
              terminale: facoltativo(interruttore('Programma da terminale', 'Aggiunge il segno >_ sul riquadro: distingue il programma dal modello che ha lo stesso marchio.')),
              link: link('Sito ufficiale'),
            },
            'Strumento'
          ),
          'Strumenti'
        ),
      },
      'Griglia delle icone'
    ),
    schede: gruppo(
      {
        etichetta: testo('Nome della sezione'),
        didascalia: testo('Didascalia'),
        titolo: titolo('Titolo'),
        voci: lista(
          gruppo(
            { nome: testo('Strumento', 'Lo stesso nome usato nella griglia.'), titolo: titolo('Titolo'), come_lo_uso: paragrafo('Come lo uso'), immagine: facoltativo(immagine('Screenshot', 'Serve se non c’è il video.')), video: facoltativo(video('Video', 'Facoltativo: un video al posto dello screenshot (per esempio un flusso che si accende).')), immagine_telefono: facoltativo(immagine('Screenshot per telefono', 'Facoltativo: la stessa schermata in una finestra stretta, mostrata sotto i 640 px.')), accanto: facoltativo(gruppo({ immagine: immagine('Immagine'), immagine_telefono: facoltativo(immagine('Per telefono')) }, 'Immagine accanto', 'Facoltativa: un secondo documento mostrato prima dello screenshot (per esempio la missione che lo strumento esegue). La scheda diventa larga.')) },
            'Scheda'
          ),
          'Schede'
        ),
      },
      'Schede dettagliate'
    ),
  })
  .strict();

const prova = gruppo(
  {
    codice: testo('Codice', 'Un nome breve e unico, usato dalla home per scegliere quali prove mostrare.'),
    titolo: testo('Titolo'),
    testo: paragrafo('Testo'),
    progetto: testo('Progetto'),
    data: data('Data'),
    stato: scelta(STATI, 'Stato', 'integrata = accettata nel progetto; in revisione = ancora aperta; proposta = chiusa senza integrazione.'),
    link: link('Link all’originale'),
    chiaro: immagine('Screenshot in tema chiaro'),
    scuro: immagine('Screenshot in tema scuro'),
  },
  'Prova'
);

export const openSource = z
  .object({
    seo,
    apertura: gruppo({ ...testata(), verificato: testo('Riga di verifica', 'Per esempio: stato verificato su GitHub il …'), video: facoltativo(video('Video', 'Facoltativo: la prova più forte, in movimento, accanto al titolo.')) }, 'Apertura'),
    prove: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), altre: testo('Titolo delle prove in striscia', 'Le prove larghe e basse (note di rilascio, intestazioni) vanno in un elenco sotto le schede grandi.'), voci: lista(prova, 'Prove') }, 'Prove da GitHub'),
    contributi: gruppo(
      {
        etichetta: testo('Nome della sezione'),
        didascalia: testo('Didascalia'),
        titolo: titolo('Titolo'),
        testo: paragrafo('Testo'),
        altre: testo('Le altre proposte', 'Testo del riquadro che si apre con le proposte non ancora integrate di un progetto che ne ha già di integrate. Il numero si aggiunge da solo.'),
        voci: lista(
          gruppo(
            { progetto: testo('Progetto'), numero: numero('Numero'), titolo: testo('Cosa cambia'), stato: scelta(STATI, 'Stato'), data: data('Data'), link: link('Link') },
            'Contributo'
          ),
          'Contributi'
        ),
      },
      'Tutti i contributi'
    ),
    progetto_mio: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), immagine: immagine('Immagine'), link: collegamento('Link') },
      'Il mio progetto aperto'
    ),
  })
  .strict();

export const chiSono = z
  .object({
    seo,
    apertura: gruppo({ ...testata(false), foto: immagine('Foto principale') }, 'Apertura'),
    dettagli: lista(gruppo({ etichetta: testo('Etichetta'), valore: testo('Valore'), link: facoltativo(link('Link')) }, 'Dettaglio'), 'Dettagli'),
    percorso: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), voci: lista(gruppo({ tappa: testo('Tappa'), testo: paragrafo('Testo'), loghi: facoltativo(lista(immagine('Logo'), 'Loghi', 'Loghi ufficiali degli strumenti di questa tappa (in public/media/strumenti/ o icone/).', 0)), prova: facoltativo(testo('Prova', 'Facoltativa: il codice di una prova della pagina Open source (per esempio pr-170951-grazie). La sua schermata vera si vede accanto alla tappa.')), video: facoltativo(video('Video della prova', 'Facoltativo: al posto della schermata, il video della stessa prova (si legge meglio in piccolo).')), progetti: facoltativo(lista(scelta(PROGETTI, 'Progetto'), 'Progetti', 'Facoltativo: le icone dei progetti di questa tappa, che portano alle loro pagine.', 0)) }, 'Tappa'), 'Tappe') },
      'Il percorso'
    ),
    obiettivi: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), voci: lista(obiettivo, 'Voci') },
      'Obiettivi'
    ),
  })
  .strict();

export const contatti = z
  .object({
    seo,
    apertura: gruppo({ ...testata(), foto: immagine('Foto') }, 'Apertura'),
    scrivimi: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), nota: paragrafo('Nota sotto il bottone') }, 'Sezione «scrivimi»'),
    altri_canali: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), voci: carteCanale('Canali') }, 'Altri canali'),
    modulo: gruppo(
      Object.fromEntries(
        [
          ['titolo', 'Titolo'], ['oggetto', 'Oggetto dell’email'], ['nome', 'Etichetta nome'], ['email', 'Etichetta email'], ['messaggio', 'Etichetta messaggio'],
          ['invia', 'Bottone invia'], ['inviato', 'Messaggio inviato'], ['errore', 'Errore'], ['senza_chiave', 'Testo senza modulo'], ['bottone_email', 'Bottone email'],
        ].map(([k, e]) => [k, testo(e)])
      ),
      'Modulo'
    ),
  })
  .strict();

export const privacy = z.object({ seo, titolo: testo('Titolo'), aggiornata: testo('Aggiornata il'), sezione: testo('Nome della sezione') }).strict();

export const errore404 = z
  .object({ seo, etichetta: testo('Etichetta piccola'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), strade: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), voci: carteCanale('Strade') }, 'Dove andare') })
  .strict();

const moduloIscrizione = gruppo(
  Object.fromEntries(
    [
      ['etichetta_email', 'Etichetta del campo email'], ['segnaposto', 'Testo di esempio nel campo'], ['invia', 'Bottone'], ['attesa', 'Mentre invia'],
      ['fatto', 'Iscrizione riuscita'], ['errore', 'Errore'], ['non_valido', 'Email non valida'], ['nota', 'Nota sotto il modulo'], ['oggetto_email', 'Oggetto dell’email di ripiego'],
    ].map(([k, e]) => [k, testo(e)])
  ),
  'Modulo di iscrizione'
);

export const newsletterPagina = z
  .object({
    seo,
    apertura: gruppo(testata(), 'Apertura'),
    modulo: moduloIscrizione,
    cosa_ricevi: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), voci: lista(gruppo({ titolo: testo('Titolo'), testo: paragrafo('Testo') }, 'Voce'), 'Voci') },
      'Cosa ricevi'
    ),
    archivio: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), ultimo: testo('Link all’ultimo numero', 'Porta a /newsletter/ultimo/.') }, 'Archivio'),
    domande: gruppo(
      { etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), voci: lista(gruppo({ domanda: testo('Domanda'), risposta: paragrafo('Risposta') }, 'Domanda'), 'Domande') },
      'Domande frequenti'
    ),
    numero: gruppo(
      Object.fromEntries(
        [['numero', 'Numero'], ['fonte', 'Leggi su'], ['punto', 'Titolo «il punto»'], ['firma', 'Firma'], ['archivio', 'Torna all’archivio'], ['precedente', 'Numero precedente'], ['successivo', 'Numero successivo'], ['iscriviti', 'Invito a iscriversi'], ['leggi', 'Link «leggi il numero» (anteprima dell’ultimo numero)'], ['prossimo', 'Nome dell’ultima sezione (iscrizione e numeri vicini)']].map(
          ([k, e]) => [k, testo(e)]
        )
      ),
      'Testi della pagina di un numero'
    ),
    ultimo: gruppo({ titolo: testo('Titolo'), testo: paragrafo('Testo') }, 'Pagina «ultimo numero»'),
    confermato: gruppo({ etichetta: testo('Etichetta'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), strade: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), voci: carteCanale('Strade') }, 'Dove andare') }, 'Pagina «iscrizione confermata»'),
    link_non_valido: gruppo({ etichetta: testo('Etichetta'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), nota: paragrafo('Nota sotto il modulo') }, 'Pagina «link non valido»'),
  })
  .strict();

export const newsletterInglese = z
  .object({
    seo,
    apertura: gruppo(testata(), 'Apertura'),
    archivio_link: collegamento('Link alla newsletter in italiano'),
    ultimo: gruppo({ etichetta: testo('Etichetta del numero', 'Per esempio: Issue.'), link: testo('Link al numero', 'Per esempio: Read it, in Italian.') }, 'Riquadro dell’ultimo numero'),
    indice: testo('Nome dell’indice delle sezioni', 'Lo leggono i lettori di schermo.'),
    cosa_e: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo') }, 'Che cos’è'),
    resto: gruppo({ etichetta: testo('Nome della sezione'), didascalia: testo('Didascalia'), titolo: titolo('Titolo'), testo: paragrafo('Testo'), link: collegamento('Link') }, 'Il resto del sito'),
    traduzioni: lista(
      gruppo({ it: testo('In italiano', 'Il testo esatto come compare nel menu, nel piè di pagina o nell’interfaccia.'), en: testo('In inglese') }, 'Traduzione'),
      'Menu e piè di pagina in inglese',
      'Su questa pagina menu, piè di pagina e testi dell’interfaccia usano queste traduzioni. Un testo che non è qui resta in italiano.'
    ),
  })
  .strict();

// Un numero della newsletter = un file src/content/newsletter/<data>.md (il nome del file è l'indirizzo).
export const numeroNewsletter = z
  .object({
    numero: numero('Numero'),
    data: data('Data di uscita'),
    titolo: testo('Titolo'),
    sommario: paragrafo('Sommario'),
    lancio: facoltativo(testo('Codice di lancio', 'Lo scrive l’automazione. Non serve toccarlo.')),
    oggetto: facoltativo(testo('Oggetto dell’email', 'Lo scrive l’automazione.')),
    riga_anteprima: facoltativo(testo('Riga di anteprima dell’email', 'Il testo che le app di posta mostrano accanto all’oggetto.')),
    copertina: immagine('Copertina'),
    articoli: lista(
      gruppo(
        {
          rubrica: testo('Rubrica', 'Per esempio «Mercati».'),
          titolo: testo('Titolo'),
          testo: conNome(z.string().trim().min(1, 'non può essere vuoto'), 'Testo', 'Paragrafi separati da una riga vuota.', { tipo: 'text' }),
          immagine: facoltativo(immagine('Immagine')),
          fonte: facoltativo(gruppo({ nome: testo('Nome della fonte'), link: link('Link all’articolo') }, 'Fonte')),
        },
        'Articolo'
      ),
      'Articoli'
    ),
    punto: facoltativo(paragrafo('Il punto', 'Il commento che tiene insieme le notizie.')),
  })
  .strict();
