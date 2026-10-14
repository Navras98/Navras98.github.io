# Sito di Andrea Sforna — regole per qualunque agente

Sito statico di presentazione (Astro, output statico, JavaScript vanilla + Lenis, transizioni tra pagine di Astro).
Pubblicato su GitHub Pages da `.github/workflows/deploy.yml` a ogni push su `main`. Linguaggio visivo ricavato da
getartcraft.com: i valori sono in `riferimento/DESIGN.md`.

## Dove si cambia cosa
| Cosa | Dove |
|---|---|
| Testi, link, foto e video di una pagina | il suo file in `src/content/pagine/` (`home.yml`, `metodo.yml`, `progetti.yml`, `strumenti.yml`, `open-source.yml`, `chi-sono.md`, `newsletter.yml`, `newsletter-en.yml`, `contatti.yml`, `privacy.md`, `errore-404.yml`) |
| Un progetto (scheda e pagina `/progetti/<nome>/`) | `src/content/progetti/<nome>.md` |
| Un numero della newsletter | un file `src/content/newsletter/<data>.md` + le foto in `public/newsletter/numeri/<data>/` |
| Menu, piè di pagina e invito finale «scrivimi» | `src/content/menu.yml`, `src/content/piede.yml` |
| Nome, email, partita IVA, social, chiave Web3Forms, indirizzo di iscrizione, piccoli testi dell'interfaccia | `src/content/impostazioni.yml` |
| Contributi e prove da GitHub | `src/content/pagine/open-source.yml` (stati verificati con `node scripts/controlla-github.mjs`) |
| Immagini e video | `public/media/` (`foto/`, `metodo/` schemi delle fasi, `progetti/`, `icone/`, `strumenti/`, `strumenti/uso/`, `prove/`, `video/`) |
| Indirizzi del vecchio sito e dove portano | `src/lib/vecchi-indirizzi.json` |
| Glifi del monogramma AS e crenatura del nome | `src/lib/glifi.json` |
| Fonti ufficiali dei loghi | `src/lib/marchi.json` |
| Schemi dei contenuti (campi, tipi, etichette in italiano) | `src/lib/schemi.js` |
| Colori, caratteri, spaziature, raggi, tempi | `src/styles/token.css` (unico file di token) |

Ogni immagine nei contenuti ha `src`, `alt`, `punto_focale` (centro, alto, basso, sinistra, destra) e `adatta`
(riempi oppure intera). Le immagini verticali sono sempre mostrate intere, in una cornice di telefono o verticale.
Ogni video ha `mp4`, `webm`, `copertina` e `descrizione`: WebM e MP4, muto, ≤ 700 KB; 1280×720 per le carte
dell'apertura e le schede, 1920×1080 per i video grandi delle pagine progetto (campo facoltativo `telefono` con la
versione verticale 1080×1350). Nessuna immagine o video si mostra oltre la sua risoluzione: lo controlla
`node scripts/verifica-nitidezza.mjs` (pixel veri contro pixel mostrati, a 390 px 3x, 768 e 1440 px 2x).

## Regole
1. **Per cambiare un testo, un link, un'immagine o un video modifica SOLO il file in `src/content/`.** Nessun testo
   sta nei componenti. Nei titoli `*parola*` = corsivo serif, `**parola**` = colore blu. Apostrofi e virgolette
   diventano tipografici da soli.
2. Non toccare layout, stili (`src/styles/`, stili nei componenti), componenti (`src/components/`, `src/layouts/`,
   `src/pages/`) e script senza una richiesta esplicita di Andrea.
3. Mai riscrivere pagine intere. Modifica solo le righe necessarie.
4. Una modifica = un commit piccolo, con un messaggio chiaro in italiano.
5. Le immagini nuove vanno in `public/media/` (o, per la newsletter, in `public/newsletter/numeri/<data>/`). Le
   versioni ottimizzate (`public/_img/`, `src/generated/`) le crea `npm run build`: non modificarle e non metterle in git.
   Ogni file nuovo va annotato in `riferimento/MEDIA.md` con provenienza e controllo privacy.
6. Se aggiungi o cambi un campo, cambialo nello schema in `src/lib/schemi.js`, poi lancia
   `node scripts/pages-cms.mjs` (rigenera `.pages.yml`) e `node scripts/valida-pages.mjs`. Un campo sbagliato ferma la
   build con un messaggio in italiano che dice file e campo.
7. Privacy: mai nel sito o nel repo chiavi, codici e parole d'accesso, indirizzi interni, indirizzi di rete, percorsi di
   sistema, nomi di clienti, dati personali di terzi, numeri di telefono. Uniche eccezioni, solo in `impostazioni.yml`:
   la chiave di Web3Forms (pubblica per natura) e l'indirizzo pubblico di iscrizione alla newsletter (già pubblicato).
   Ogni screenshot si controlla pixel per pixel e si ritaglia o si oscura ciò che non deve uscire.
8. Niente immagini o video generati con AI, in nessun punto del sito: solo screenshot e registrazioni reali, animazioni
   costruite da quel materiale, foto vere di Andrea, loghi ufficiali.
9. Testi: prima persona, frasi brevi, tono sobrio; niente superlativi, punti esclamativi, emoji, prezzi, numeri di test o
   versioni; niente gergo tecnico fuori da Strumenti e Open source. Parole vietate: soluzioni innovative, all'avanguardia,
   rivoluzionario, a 360 gradi, sinergia, leader, game changer, potenziare, sbloccare, trasformazione digitale,
   next level, senza precedenti, eccellenza. Scrivere «fin dalla giovane età» (mai «da bambino») e sull'AI «la seguo fin
   dai suoi esordi». Niente frasi che sminuiscono, niente racconti di errori o guasti, niente nomi di clienti o di terzi.
10. Verità: ogni affermazione si può verificare. Su GitHub: integrata = contributo; aperta = «in revisione»; chiusa senza
    integrazione = «ho proposto». Prima di toccare `open-source.yml` lancia `node scripts/controlla-github.mjs`.
    Non scrivere il numero degli agenti di Andrea.
11. L'archivio della newsletter (`src/content/newsletter/`) riporta i numeri già spediti: non si riscrive. Le uniche
    sostituzioni (parole vietate) sono in `src/lib/newsletter-sostituzioni.json`.

## Comandi
- `npm run dev` — anteprima con ricarica automatica
- `npm run build` — costruisce in `dist/` (immagini ottimizzate, pagine, indirizzi del vecchio sito)
- `npm run preview` — serve `dist/` su http://localhost:4321
- `npm run verifica` — tutti i controlli dei criteri (rapporto in `verifica/rapporto.md`); `npm run verifica -- --rapidi`
  salta i controlli lunghi
- Controlli singoli in `scripts/` (uno per scopo): `controlla-testi`, `controlla-segreti`, `controlla-media`,
  `controlla-inutilizzati`, `controlla-github`, `controlla-social`, `valida-pages`, `verifica-pagine`,
  `verifica-vecchi-indirizzi`, `verifica-link`, `verifica-scroll-orizzontale`, `verifica-verticali`, `verifica-video`,
  `verifica-volto`, `verifica-loghi`, `verifica-nitidezza`, `verifica-axe`, `verifica-lighthouse`, `peso-home`, `verifica-screenshot`,
  `confronti`, `confronta-newsletter`, `prova-modifiche`, `prova-schema`, `prova-nuovo-numero`, `prova-contatti`,
  `prova-iscrizione`, `prova-newsletter-secco`.
- `node scripts/og.mjs` — rifà l'immagine di condivisione da wordmark, foto e prova vera.

## Newsletter
- Un numero nuovo = un file `src/content/newsletter/<data>.md` (formato in `riferimento/newsletter-formato.md`) più le foto.
  La build crea la pagina `/newsletter/numeri/<data>/`, aggiorna l'archivio, `/newsletter/numeri.json` (lo legge
  l'automazione) e `/newsletter/ultimo/`.
- Iscrizione: il modulo chiama l'indirizzo in `impostazioni.yml → indirizzo_iscrizione` (flusso n8n con doppia conferma
  via Brevo); se è vuoto, il modulo prepara un'email ad Andrea.
- Pubblicazione dei numeri: il flusso n8n «🗞 Newsletter — il numero, quando lo avvii tu» usa gli script di
  `~/.openclaw/workspace/newsletter/nuovo-sito/` (`numero_astro.py`, `uscita_astro.py`): ogni numero sale con UN commit su
  `main` (file `.md` + foto) e GitHub Actions lo pubblica. Copia di sicurezza della versione di prima in
  `~/.openclaw/workspace/backup/`. Istruzioni in `riferimento/NEWSLETTER-AUTOMAZIONE.md`.

## Pubblicazione
Il sito è online su https://navras98.github.io dal 15/10/2026. Ogni push su `main` (anche da Pages CMS o dall'editor di
GitHub) lo ricostruisce e lo pubblica da solo con GitHub Actions (`.github/workflows/deploy.yml`) in 1–3 minuti.
- Controllare un deploy: `gh run watch $(gh run list --workflow deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')`.
- Dopo una modifica importante: verifica online di home, una pagina progetto, `/newsletter/`, un numero vecchio
  (`/newsletter/numeri/2026-08-22/`), un indirizzo vecchio (`/agenti/`, `/en/`) e un'iscrizione di prova
  (`node scripts/prova-iscrizione.mjs`).
- Dominio personalizzato: oggi non c'è. Se in futuro esiste un file `CNAME`, va messo in `public/CNAME`.

**Per tornare indietro:** la storia completa di prima (sito vecchio, rami archivio e tag) è salvata nel file
`~/Desktop/sito-andrea-sforna-copia-2026-10-15/storia-completa-prima-della-pubblicazione.bundle`. Per rimettere il sito
vecchio: `git fetch <quel file> refs/tags/sito-precedente:refs/tags/sito-precedente`, poi
`git push --force origin "refs/tags/sito-precedente^{commit}:refs/heads/main"` e Pages in modalità branch:
`gh api -X PUT repos/Navras98/Navras98.github.io/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`.
Per l'automazione: rimettere i tre comandi di prima in n8n (`comando_prima` in
`~/.openclaw/workspace/newsletter/nuovo-sito/n8n-modifiche.json`).
