# Andrea Sforna — sito

Sito personale: progettazione, sicurezza e manutenzione di sistemi di agenti AI.
Pubblicato con GitHub Pages sulla user site, dal branch `main`.

## Com'è fatto

Sette pagine statiche in radice, senza processo di build in fase di pubblicazione:
GitHub Pages serve HTML già pronto.

    index.html  competenze.html  sicurezza.html  dati.html
    modelli.html  metodo.html  contatti.html

Le pagine si generano da `src/`, che è il punto unico per intestazione, menu, piede
e metadati: così una voce di menu si scrive una volta sola invece che sette.

    node build.mjs

`build.mjs` rigenera anche `sitemap.xml` e `robots.txt` a partire dall'elenco del menu,
e si ferma con errore se una voce di menu non ha una pagina o una pagina non è nel menu.

- `src/layout.mjs` — head, menu, piede, blocco «pagina successiva»
- `src/pages/*.mjs` — una pagina per file, contenuto e metadati insieme
- `src/anteprima.html`, `src/icona.html` — sorgenti delle immagini in `assets/img/`
- `assets/css/site.css`, `assets/js/site.js` — condivisi da tutte le pagine

## Verifiche

    python3 verifica.py

Controlla il conteggio parole di ogni pagina interna, i collegamenti interni, la presenza
del menu completo e dello stato attivo, i metadati unici per pagina, le frasi bandite.

    python3 collaudo.py [--foto cartella]

Collaudo dal vivo: serve il sito in locale, apre un browser headless su CDP e misura sulla
pagina resa. Sette pagine per quattro larghezze (390, 768, 1024, 1440) con controllo di
console, trabocco orizzontale e testo tagliato; menu a scomparsa aperto e richiuso su ogni
pagina; collegamenti interni premuti uno per uno; salto al contenuto col tasto Tab; percorso
`prefers-reduced-motion` e percorso senza JavaScript. Uscita 0 se passano tutti i controlli.

Due cose che il collaudo ha dovuto imparare a misurare bene:

- sbordare a sinistra non allarga il documento — è la tecnica con cui si parcheggia il salto
  al contenuto, quindi il bordo sinistro conta solo per gli elementi in flusso;
- `element.focus()` da script sposta `document.activeElement` ma non fa applicare la regola
  `:focus` in una finestra senza fuoco di sistema: il fuoco va dato con un tasto vero,
  altrimenti un salto al contenuto perfettamente funzionante risulta guasto.

## Note tecniche

- Nessuna libreria: menu, comparse allo scroll, barra di avanzamento e transizione fra
  pagine stanno in `assets/js/site.js`. Senza JavaScript il sito resta completamente leggibile.
- Le comparse allo scroll sono strozzate a tempo e non su `requestAnimationFrame`: in una
  scheda che non disegna rAF non viene mai chiamato e i blocchi resterebbero invisibili.
- Il pannello del menu mobile sta fuori da `.site-head` di proposito: il `backdrop-filter`
  dell'intestazione ne farebbe il blocco contenitore e schiaccerebbe il pannello a altezza zero.
- `prefers-reduced-motion` disattiva ogni movimento e lascia tutti i contenuti visibili.
