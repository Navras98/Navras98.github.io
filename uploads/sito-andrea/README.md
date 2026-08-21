# Andrea Sforna — sito

Sito personale: architetture di agenti AI, sicurezza, accesso deterministico ai dati.
Pubblicato con GitHub Pages sulla user site, dal branch `main`.

Direzione visiva, palette, scala tipografica e le regole che valgono su tutto il sito:
**[DESIGN.md](DESIGN.md)**. Il foglio di stile non contiene un solo valore che non sia
dichiarato lì dentro come variabile.

## Com'è fatto

Nove pagine statiche in radice. GitHub Pages serve HTML già pronto: non c'è nessun
passaggio di costruzione al momento della pubblicazione.

    index.html  architettura.html  sicurezza.html  dati.html  privacy.html
    automazione.html  stack.html  metodo.html  contatti.html

Le pagine si generano da `src/`, che è il punto unico per testa, menu, piede e metadati:
così una voce di menu si scrive una volta sola invece che nove.

    node build.mjs

`build.mjs` genera anche `sitemap.xml` e `robots.txt` dall'elenco del menu, e si ferma con
errore se una voce di menu non ha una pagina, se una pagina è fuori dal menu, o se il
collegamento «pagina successiva» punta a qualcosa che non esiste.

- `src/layout.mjs` — testa, menu, piede, blocco con annotazione, passaggio alla pagina dopo
- `src/pages/*.mjs` — una pagina per file, contenuto e metadati insieme
- `src/diagrammi.mjs` — i diagrammi in SVG, disegnati a mano, colori dal tema
- `src/anteprima.html`, `src/icona.html` — sorgenti delle immagini in `assets/img/`
- `assets/css/site.css` — token e componenti, un file solo
- `assets/js/site.js` — tema, menu, comparse, avanzamento, copia, transizione fra pagine
- `assets/js/scena.js` — la scena 3D dell'apertura, caricata a parte e differita

## Verifiche

    python3 verifica.py

Controlli statici sul generato: parole per pagina, collegamenti interni, risorse esistenti,
menu completo con stato attivo su tutte le pagine, metadati unici, elemento visivo e limite
dichiarato dove servono, e le regole di scrittura del progetto (frasi bandite, emoji,
trattini lunghi, numeri senza metodo, dettagli riservati).

    python3 collaudo.py [--foto cartella]

Collaudo dal vivo su browser vero, misurato sulla pagina resa. Nove pagine per cinque
larghezze (390, 768, 1024, 1440, 1920) e per due temi; contrasto calcolato su ogni nodo di
testo con la soglia AA; menu a scomparsa aperto e chiuso con Esc; salto al contenuto col
tasto Tab; giro da tastiera con contorno di fuoco; collegamenti interni premuti uno per
uno; tema che segue il sistema, si sceglie, si ricorda e non lampeggia; scena 3D con
fotogrammi misurati anche su profilo telefono rallentato; ripiego senza WebGL; percorso
`prefers-reduced-motion`; percorso senza JavaScript.

Un controllo che non ha potuto misurare non viene contato come passato: ha una casella sua
e viene detto a parole, perché un bersaglio perso somiglia troppo a un bersaglio centrato.

## Note tecniche

Cose che si sono imparate costruendo, e che conviene non riscoprire.

- **La tela 3D sta fuori dal flusso del contenuto**, si carica differita e si spegne da
  sola. Il testo non la aspetta mai: se non parte, resta il disegno statico che è già nel
  documento e la pagina non perde niente.
- **Il colore del materiale moltiplica quello dell'istanza.** Tingendoli tutti e due con la
  stessa tinta, le due si moltiplicano fra loro e i solidi diventano quasi neri. Il
  materiale resta bianco e la tinta la porta l'istanza.
- **Sotto i 62rem la scena non sta dietro al testo**: prende una fascia sua, sotto la riga
  di apertura. Sovrapporla a una colonna stretta rende il testo illeggibile, e nessuna
  maschera lo salva.
- **La transizione dei colori si accende solo mentre si cambia tema.** Se restasse sempre
  attiva, ogni comparsa allo scorrimento trascinerebbe dietro un fondo che sfuma.
- **Il tema si scrive prima della prima pittura**, con uno script in linea dentro la testa.
  Senza quel blocco il tema chiaro lampeggia scuro al caricamento.
- **Il pannello del menu mobile sta fuori dalla barra** di proposito: il filtro sullo sfondo
  dell'intestazione ne farebbe il blocco contenitore e lo schiaccerebbe ad altezza zero.
- **Le comparse allo scorrimento sono strozzate a tempo, non su `requestAnimationFrame`**:
  in una scheda che non disegna, rAF non viene mai chiamato e i blocchi resterebbero
  invisibili per sempre.
- **Sbordare a sinistra non allarga il documento**: è la tecnica con cui si parcheggia il
  salto al contenuto. Una sonda che lo segnala come trabocco boccia un sito sano.
- **`element.focus()` da script non fa applicare la regola `:focus`** in una finestra senza
  fuoco di sistema: sposta `document.activeElement` e basta. Il fuoco si dà col tasto vero.
- **La grana è disegnata**, non scaricata: righe da 1px ogni 3px con un gradiente ripetuto,
  su uno strato fisso e non cliccabile. Zero byte di immagine, zero ridisegno mentre si
  scorre.
