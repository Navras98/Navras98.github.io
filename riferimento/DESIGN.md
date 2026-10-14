# DESIGN — valori estratti da getartcraft.com (13/10/2026)

Fonte: CSS di produzione + stili calcolati con Playwright (1440/768/390, scuro e chiaro).
Screenshot in `riferimento/` (`ac-<pagina>-<larghezza>-<tema>-full.png`, sequenze di scroll in `riferimento/scroll/`).

## Licenze
- Codice del sito: pubblico in `github.com/storytold/artcraft-services` (frontend/apps/artcraft-website-next), licenza
  "ArtCraft License (WIP)", fair source: solo uso privato, vietato l'uso commerciale. → NON riusabile: codice scritto da zero.
- Font: tutti liberi (SIL OFL 1.1), serviti da ArtCraft in locale via next/font. → stessi font, ospitati in locale.
  - Archivo (variabile: peso 100–900, larghezza 62–125%) — titoli, wordmark
  - Instrument Serif (400 regular + italic) — parola in corsivo nei titoli
  - Inter (variabile) — testo
  - Geist Mono (variabile) — etichette HUD, bottoni, menu

## Colori
| variabile | scuro | chiaro |
|---|---|---|
| --bg | #121316 | #f2f1ee |
| --bg-raised | #101014 | #faf9f7 |
| --bg-sunken | #060607 | #e9e8e4 |
| --ink | #f2f1ee | #101014 |
| --ink-strong | #ffffff | #000000 |
| --muted | #f2f1ee99 (60%) | #1010149e (62%) |
| --faint | #f2f1ee61 (38%) | #1010146b (42%) |
| --line | #f2f1ee26 (15%) | #10101429 (16%) |
| --line-strong | #f2f1ee66 (40%) | #10101466 (40%) |
| --accent | #2d81ff | #2d81ff |
| --accent-ink | #74aaff | #1659c4 |
| --invert-bg | #ffffff | #101014 |
| --invert-fg | #0b0b0c | #f2f1ee |
- Header: --bg al 95% + backdrop-filter blur(8px). Barra sezione sticky: --bg al 60% + blur(12px).
- ::selection: sfondo --accent, testo #fff. :focus-visible: outline 2px --accent-ink, offset 2px.
- Cambio tema: transizione 0.4s sulle variabili colore (@property), resto senza transizioni.
- Badge numerati (colore app, testo nero) — --app / --app-ink scuro / --app-ink chiaro:
  blu #2f7bf5 / #7fb0ff / #1a5bc4 · rosso #e8573f / #ff8a70 / #b83a24 · viola #8b5cf6 / #b69cff / #6a3fd6 ·
  giallo #f2a516 / #ffc14d / #8a5800 · verde acqua #12a58a / #3fd6b8 / #0a7563 · rosa #e0368f / #ff7ab8 / #b0206c ·
  lime #7bb51c / #a6e04a / #457008 · smeraldo #02da96 / #3fe6ae / #017a54 · indaco #4c6ef5 / #8da2fb / #253e99 ·
  ciano #14a3c7 / #52d1ea / #09596d · arancio #f26b1d / #ff9657 / #ad4306 · verde #1f9d55 / #5ee089 / #136938
- Archi in orbita dietro l'hero: verde, rosso, viola, blu (tratti sottili sfumati), più trattini radiali tenui.

## Tipografia
- `.font-display`: Archivo, weight 620, font-stretch 118%.
- Wordmark hero: Archivo 750, stretch 125%, 95.4px a 1440 (≈ 6.6vw), 48.5px a 390; line-height 1; lettere separate (animate all'ingresso).
- h1 hero (sottotitolo): display 36px (30px mobile), lh 1.05, tracking -0.03em; parte finale Instrument Serif italic 400 in --muted.
- h2 sezione: display 60px a ≥768 (36px mobile), lh 1.02, tracking -0.035em, max-w 768px; una parola in Instrument Serif italic (colore --ink-strong) oppure in --accent-ink.
- h2 chiusura: display 72px (48px mobile), lh 0.98, tracking -0.04em, centrato.
- h3 card: display 24px, lh 32px, tracking -0.02em, --ink-strong. Nome prodotto lineup: 30px, tracking -0.03em, seconda metà in --app-ink.
- Paragrafo grande: Inter 18px / 29.25px (1.625), --muted, max-w 448px (hero) / 576px (sezioni).
- Testo card: Inter 16px / 26px, --muted.
- `.hud-label`: Geist Mono 11px (0.6875rem), weight 500, uppercase, letter-spacing 0.15em. Colori: --muted o --faint.
- Etichette bordate (tag): Geist Mono 10px, 500, uppercase, tracking 0.1em, padding 1px 6px, bordo 1px --line, sfondo --bg-sunken, raggio 0.
- Righello: Geist Mono 9px, tracking 0.08em, opacità 0.5.

## Griglia e spaziature
- Contenitore max 1280px centrato, bordi verticali 1px --line (border-x). A 1440 margini di 80px.
- Ogni sezione: riga orizzontale 1px in cima a tutta larghezza (disegnata da sinistra) + crocette 11×11 (tratti 1px --line-strong) agli incroci con i bordi del contenitore.
- Barra sezione: sticky top 48px, bordo sopra/sotto, padding 12px 24px (40px a ≥768): sinistra "01 / NOME" (numero e barra --faint, nome --muted), destra didascalia --faint (nascosta < 640).
- Blocco intro sezione: padding 56px 24px (80px 40px a ≥768).
- Griglie di card: gap 1px su sfondo --line (effetto filetti), 2 o 3 o 4 colonne; card su --bg.
- Card feature: testata 10px 32px con etichetta + numero; media 16:9; corpo 24–32px.
- Card lineup: testata 12px 24px con badge numerato (padding 4px 8px, sfondo --app, testo nero bold) e categoria --faint a destra (troncata); media 16:10; icona 72×72 sovrapposta (-36px) con drop-shadow 0 6px 14px rgba(0,0,0,.28); nome 30px; descrizione 2 righe; tag; link "ESPLORA … ↗" hud-label in fondo. Hover: barra colorata 2px in cima (scale-x 0→1, 300ms), immagine scale 1.03 (500ms), icona -4px, freccia +2px/-2px.
- Griglia icone: icone 80×80 (56 mobile), etichetta Inter 12px 500 --muted sotto (gap 8px), 5 per riga a 1440 (7 a sm, 4 mobile), gap 24px × 20px; hover icona -4px, etichetta in --app-ink.
- Principi (Ownership): 3 colonne, padding 32px, lettera A/B/C hud-label --faint, h3 a 24px dal top, testo, bottone piccolo bordato.
- Footer: grid 2fr 1fr 1fr 1fr 1fr con gap 1px su --line; colonna 1: logo h-8, frase --muted max 320px, email hud-label --faint; colonne: titolo hud-label --faint, link Inter 16px --muted (hover --ink) gap 10px; barra finale 16px 40px con © e motto hud-label --faint.

## Header (h 48px + bordo)
- Sticky, bordo inferiore --line. Logo a sinistra in cella con bordo destro, padding 0 20px, h 24px.
- Voci: hud-label in --muted; ogni voce padding 0 10px, testo dentro span padding 2px 6px; hover/attiva: span con sfondo --invert-bg e testo --invert-fg (riquadro bianco con testo nero in scuro).
- Separatore verticale: bordo sinistro --line prima del gruppo successivo (ml 6px, pl 6px).
- Destra: voce, icone in celle 48×48 con bordo sinistro (social, tema: hover = blocco invertito, transizione 0.12s linear), CTA finale bianco pieno a tutta altezza (Geist Mono 11px 700, tracking 0.12em, padding 8px 20px).
- < 1024: voci nascoste, cella hamburger 48×48. Menu mobile: pannello a tutta larghezza sotto l'header, voci hud-label impilate (attiva in riquadro invertito), sottovoci rientrate, CTA bianca piena a tutta larghezza, riga finale a 2 celle bordate.

## Bottoni
- Primario: h 48px, padding 0 24px, Geist Mono 11px 700 uppercase tracking 0.12em, sfondo --invert-bg, testo --invert-fg, raggio 0, gap 8px icona; hover opacità 0.85 (0.15s).
- Secondario: stesso, sfondo --bg, bordo 1px --line-strong, testo --ink; hover blocco invertito (0.12s linear).
- Piccolo bordato: padding 6px 12px, 500.
- Barra di condivisione: celle h 36px divise da 1px (gap-px su --line, bordo --line): "SHARE" --faint + bottoni hud-label bold --muted.

## Movimenti
- Scroll morbido (Lenis). Reveal: da opacity 0, translateY(28px), blur(8px) → visibile; a gruppi con ritardo progressivo.
- Righe di sezione che si disegnano da sinistra (scale-x), crocette che compaiono (scale 0→1).
- Hero: canvas con carte-immagine fluttuanti in un'orbita 3D (angoli arrotondati ~10px, aberrazione cromatica rosso/ciano sui bordi, ombra), parallax col mouse e con lo scroll; archi colorati in orbita sullo sfondo.
- Wordmark: lettere che entrano una a una; allo scroll il wordmark vola in alto a destra e diventa la prima voce dell'indice.
- Indice sezioni (fisso, a destra, ≥1024): voci Archivo display 34px maiuscole; corrente bianca piena in alto a destra (sotto le voci già passate, rimpicciolite a 0.47 e grigie), le successive in basso a destra, rimpicciolite e grigie. Lettere animate. Cliccabili.
- Righello verticale a destra (60px, ≥1024): tacche ogni 1% (tacca lunga e numero ogni 5), indicatore blu --accent con percentuale di lettura a 3 cifre ("011%") che scende.
- Marquee sotto l'hero: fila hud-label --muted con quadratino ▪ --accent-ink, 36s lineare infinito, bordo superiore.
- prefers-reduced-motion: tutte le animazioni a 0.01ms, niente scroll morbido.

## Dettagli studiati il 14/10/2026

Fonte: getartcraft.com aperto con Playwright (Chromium) a 1440, 768 e 390 px, temi scuro e chiaro, con e senza
`prefers-reduced-motion`; stili calcolati, `getBoundingClientRect`, stato dei `<video>`, fotogrammi ogni 50–100 ms,
più la lettura dei parametri di produzione (pannello «tuner» interno, valori predefiniti) per i dati che lo schermo non
mostra. Script in `riferimento/artcraft/script/` (01–13), dati grezzi in `riferimento/artcraft/dati/`, screenshot in
`riferimento/artcraft/` (`ac-*.png`), ritagli per sezione in `riferimento/artcraft/sezioni/`, hover in
`riferimento/artcraft/hover/`, sequenze in `riferimento/artcraft/sequenze/`, altre pagine in `riferimento/artcraft/pagine/`.
Il codice di ArtCraft non è riusabile (licenza): qui ci sono solo misure, da riscrivere da zero.
Il tema di ArtCraft segue `prefers-color-scheme`, sovrascritto da `localStorage['artcraft-theme']`.

### 1. Apertura: le carte sono VIDEO in loop dentro un canvas WebGL
Screenshot: `artcraft/ac-apertura-{1440,768,390}-{dark,light}.png`, `artcraft/ac-apertura-1440-dark-2x.png`,
ingrandimenti `artcraft/ac-apertura-carta-zoom-2x-{a,b,c}.png`, intro `artcraft/ac-apertura-intro-1440-dark-provino.png`,
riduzione del movimento `artcraft/ac-apertura-1440-{dark,light}-ridotto.png`.
- **Tecnica:** un solo `<canvas>` (three.js) a tutta area sotto la testata (1440×852 a 1440×900), `dpr` 1–1,5,
  antialias, sfondo trasparente, `aria-hidden`, `pointer-events: none`, `tabindex=-1`. Le carte non sono nel DOM.
- **Video sorgente:** 35 clip MP4 (`/cdn-media/videos/001…035.mp4`) creati in JS (`document.createElement('video')`,
  mai inseriti nel DOM): `muted`, `loop`, `playsInline`, `preload="metadata"`, `crossOrigin="anonymous"`,
  `disableRemotePlayback`. Nessun poster: finché un video non ha dati la carta resta sfocata sul colore `--bg`.
  - Formato misurato (ffprobe): H.264 Main, 640×360 (alcune 640×356), 24 fps, yuv420p, senza audio, 8–10 s,
    fotogramma chiave ogni ~2 s. Peso 223–1462 KB, media 530 KB (totale 18,5 MB, ma ne carica solo una parte).
  - Avvio scaglionato: il clip *i* viene caricato a 400 + 250·*i* ms e parte da un punto diverso
    (0,1 + 2,618·*i* s modulo la durata), così le carte non sono mai sincronizzate.
  - **Quanti video insieme:** ogni 250 ms un regolatore ordina le carte per importanza (grandi e nitide prima) e
    tiene in riproduzione al massimo **8 video** (ne avvia al più 3 per giro); gli altri vanno in pausa dopo ~1,2 s
    fuori classifica. Le carte appena nate (ancora sfocate, primo 14% del percorso) mostrano un fotogramma fermo.
    Misurato: 8 attivi su 35 creati a regime (1440 scuro); 8–15 durante gli scambi.
  - **Fuori schermo:** IntersectionObserver sull'apertura con `rootMargin: 600px 0px`. Quando esce (o la scheda è
    nascosta, `visibilitychange`) il ciclo di disegno si ferma e dopo **2,5 s** tutti i video vanno in pausa.
    Misurato: 0 video attivi dopo 3,5 s a 3000 px più in basso; tornando su ripartono (6 attivi dopo 2,5 s).
  - Se il frame rate scende sotto 30 fps per un po', toglie carte (e decodificatori) e poi le rimette piano.
- **Riduzione del movimento:** nessun canvas, nessun video caricato (0 creati), resta solo wordmark + testo + bottoni
  (le lettere del wordmark restano ferme e larghe, poco curato). → Per noi: mostrare le copertine ferme delle 7 carte.
- **Disposizione («galassia»):** spirali di Archimede che partono dal centro (dietro il wordmark); le carte nascono al
  centro e scorrono verso l'esterno lungo i bracci, restando dritte.
  - Desktop: 6 bracci, 1,05 giri per braccio, raggio esterno 0,7 × mezza diagonale; numero di carte 64 a 1,65 Mpx,
    scalato sull'area: **~48 carte a 1440×852**, ~29 a 768×975. Mobile (area < 0,6 Mpx, es. 390×844): 3 bracci,
    0,7 giri, **14 carte**, raggio 0,8.
  - **Dimensioni:** proporzione 16:9 a regime; da appena nate sono quadrati arrotondati che diventano 16:9 entro il
    30% del percorso; le interne sono più piccole (tetto 45% che cresce lungo il percorso). Altezza massima =
    clamp(70 px, 25% dell'altezza del canvas — 30% su mobile —, 340 px) → 213 px a 1440×900. Misurate a schermo:
    a 1440 le carte nitide sono larghe ~120–250 px (le esterne fino a ~380, tagliate dal bordo); a 390 ~95–175 px.
    Densità: ogni carta occupa l'82% dello spazio libero verso la vicina (115% di quel valore su mobile); mai sovrapposte.
  - **Moto:** 0,57 percorsi completi al minuto da ferma (~105 s dal centro al bordo); lo scroll fa avanzare 0,2
    percorsi ogni 1000 px (reversibile); rotazione lenta di tutto il sistema −50°/min; ondeggiamento 6 px a 0,25 Hz.
    All'avvio la velocità è ×3 e rallenta in 2,5 s. Un'onda radiale di 4 s rivela le carte dal centro (fronte 220 px).
  - **Mouse:** entro 320 px le carte si avvicinano di 8 px e prendono più dispersione (+0,032, che svanisce a 3/s);
    la carta sotto il cursore si ferma (0,15 s), le altre la seguono più lente (1 s). Clic: anello di dispersione
    (900 px/s, 1,8 s) e la carta cliccata si ingrandisce ×3 (0,18 s).
- **Aspetto della carta** (dallo shader):
  - angoli **10 px** (l'unica eccezione alla regola «raggio 0» del sito), bordo antialiasato;
  - **filetto** di 1 px a 1 px dal bordo, colore `--line-strong` miscelato al 22% sull'immagine;
  - **aberrazione cromatica** solo verso i bordi: rosso campionato spostato verso l'esterno e blu verso l'interno di
    `d·|d|²·4·0,019` (d = distanza dal centro in coordinate 0–1): 0 al centro, ~0,95% del lato a metà bordo, ~1,9%
    negli angoli → su una carta di 240 px circa 2 px sui lati e 4–5 px negli angoli. Il verde resta fermo;
  - leggera **curvatura** verso l'osservatore (32 px al centro) che fa sembrare i bordi appena incurvati;
  - nascita sfocata (raggio 12% della carta) che diventa nitida entro il 18% del percorso; dissolvenza in entrata
    nel primo 15%; nessuna dissolvenza in uscita (muoiono fuori schermo);
  - **nessuna ombra** sulle carte. Il contrasto del testo lo fanno: una «sacca» radiale di `--bg` al 78% dietro il
    blocco centrale (sporge 128 px ai lati e 88 px sopra/sotto) e le ombre del wordmark
    `0 0 .6vw bg 92%, 0 .25vw 2.4vw bg 78%, 0 .4vw 5vw bg 55%` (logo A: `drop-shadow(0 0 .3vw bg 85%)
    drop-shadow(0 .2vw 1.6vw bg 60%)`).
  - Cambio tema: i colori del canvas inseguono quelli nuovi con costante di 0,13 s.
- **Linee di fondo:** bracci a filo 2 px al 15%, cerchio di costruzione tratteggiato a 0,56 del raggio, 16 tacche per
  braccio al 30%; «comete» colorate che corrono verso l'esterno (3 per braccio, 0,19 cicli/s, +3,5 px di spessore,
  72% di opacità). Scuro: colore accento ruotato per braccio (verde, rosso, viola, blu…). Chiaro: solo grigio
  (inchiostro al 62%), la cometa si legge dallo spessore.
- **Intro (secondi dall'apertura):** logo A in dissolvenza da 0; lettere che escono da dietro il logo da 0,35 per
  0,85 s; menu (voci da `opacity 0, y −6px` a visibili, 0,5 s, cascata 0,08 s, power2.out) e righello da 0,70;
  carte da 1,00; testo centrale da 1,05 (titolo, paragrafo, bottoni, riga di prove: opacità 0→1, y 28→0, blur 8→0,
  0,9 s, cascata 0,08 s). Scroll, clic o tasto durante l'intro la accelerano ×4 (mai un taglio netto).
- **Proposta per le nostre 7 carte** (stesso effetto senza WebGL, DOM + CSS):
  `<video muted loop playsinline preload="none" poster="…" aria-hidden="true">` (le carte sono decorative; il
  significato va nel testo), WebM VP9 + MP4 H.264, 1280×720, 4–6 s, ≤ 700 KB, fotogramma chiave ogni 2 s, senza audio.
  Carta: `border-radius: 10px; overflow: hidden; box-shadow: inset 0 0 0 1px rgb(from var(--line-strong) r g b / .22)`
  (filetto); aberrazione **cotta nel video** (ffmpeg `rgbashift=rh=2:bh=-2` mascherato verso i bordi) oppure in CSS con
  `filter: drop-shadow(-1.5px 0 0 rgb(255 40 80 / .35)) drop-shadow(1.5px 0 0 rgb(40 200 255 / .35))`.
  Dimensioni a 1440: 180–260 px di larghezza (16:9), 7 carte su 2–3 bracci; a 390: 3–4 carte visibili di 110–170 px,
  dietro il testo con la «sacca» al 78%. Avvio con IntersectionObserver (`rootMargin: 600px 0px`), pausa 2,5 s dopo
  l'uscita e con `visibilitychange`; con riduzione del movimento solo copertine, nessun video scaricato.

### 2. Schede video «Crafting features» (Home → 01 Cosa faccio)
Screenshot: `artcraft/sezioni/ac-home-features-1440-{dark,light}.png`, `…-390-dark.png`, riduzione `artcraft/ac-feature-1440-dark-ridotto.png`.
- Markup: `<video src="….webm" muted loop playsinline preload="none" aria-label="<titolo> demo">`, **senza poster**,
  `object-fit: cover` in un riquadro `aspect-ratio: 16/9`, sfondo `--bg-sunken` mentre carica.
- Avvio/arresto: IntersectionObserver per singolo video, `rootMargin: 160px 0px`: entra → `play()`, esce → `pause()`
  (riprende dal punto in cui era, non riparte da 0). Misurato: visibili in riproduzione, gli altri `readyState 0`
  (non scaricati); usciti dallo schermo tutti in pausa entro 1,2 s.
- Riduzione del movimento: `preload="metadata"`, mai `play()` → resta il primo fotogramma.
- File: solo WebM VP9 (nessun MP4 di riserva), 1280×1080 o 1920×1080, 25–30 fps, 7–8,5 s, **1,2–4,3 MB** l'uno
  (troppo pesanti: noi ≤ 700 KB, 720p, con poster).
- Misure a 1440 (contenitore 1278): griglia 2 colonne da 768 px in su, gap 1 px su `--line`; carta 639 px:
  testata 37,5 px (padding 10px 32px; 24px su mobile) con etichetta hud `--muted` a sinistra e numero «01» hud
  `--faint` a destra, bordo inferiore `--line`; media 16:9 (639×359); corpo padding 24px 32px: h3 Archivo 24/32 w620
  stretch 118% tracking −0,02em (−0,48 px) `--ink-strong`, testo Inter 16/26 `--muted` mt 8px, max 576 px.
  L'ottava cella è un link «More in the app»: quadrato 56×56 bordato `--line-strong` con freccia ↗ 24 px, crocette
  11 px agli angoli (inset 8 px, opacità 0,6); hover → quadrato invertito (0,15 s).
- Nessun effetto hover sulle schede video.

### 3. Entrate allo scroll (GSAP + ScrollTrigger, Lenis)
Prove: `artcraft/ac-entrata-scroll-principles-1440-dark-provino.png`, `artcraft/ac-cambio-pagina-apps-download-provino.png`,
campioni numerici in `artcraft/dati/movimenti.json`.
- **Elemento singolo** `[data-reveal]`: da `opacity 0; visibility hidden; translateY(28px); filter: blur(8px)` a
  visibile, **0,9 s, power3.out** (≈ `cubic-bezier(0.25, 1, 0.5, 1)`), parte quando il suo bordo superiore arriva
  all'**85%** dell'altezza della finestra, una sola volta.
- **Gruppo** `[data-reveal-group]` (griglie di carte): ogni figlio parte quando il suo bordo arriva all'**88%**, con
  ritardo proporzionale alla posizione orizzontale = (x figlio − x gruppo) / larghezza gruppo × **0,18 s** (cascata da
  sinistra a destra, max 0,18 s; le righe successive partono quando arrivano loro). Misurato su due carte affiancate:
  opacità 0,35 a 50 ms, 0,54 a 100, 0,77 a 200, 0,93 a 350, 0,98 a 500, 1 a ~800 ms; la seconda in ritardo di ~0,09 s.
- **Coreografia di sezione** `[data-choreo]` (all'88%): la riga superiore si disegna da sinistra (`scaleX 0→1`,
  **0,7 s, power2.out** ≈ `cubic-bezier(0.33, 1, 0.68, 1)`); a 0,15 s entra l'occhiello; a 0,35 s le crocette
  (`scale 0→1`, opacità 0→1, **0,35 s, power3.out**, cascata **0,06 s**).
- **Apertura:** il gruppo centrale entra con cascata 0,08 s quando l'intro arriva a 1,05 s.
- **Scroll morbido:** Lenis 1.3, `lerp: 0.12`, `anchors: true` (classe `lenis` su `<html>`). Il righello «aggancia»
  la pagina: se lo scroll si ferma a metà di un cambio di titolo nell'indice, dopo 400 ms scorre da solo per 0,7 s
  (da non copiare: disorienta).
- Riduzione del movimento: nessuna entrata (tutto visibile subito), intro saltata, scroll nativo, marquee fermo.

### 4. Transizioni tra pagine
- **Nessuna dissolvenza tra pagine** (navigazione client di Next.js, nessuna View Transition: 0 chiamate a
  `startViewTransition`, opacità di `<main>` sempre 1). La pagina nuova compare subito e la sua intro fa le entrate
  normali (titolo sfocato che si mette a fuoco in 0,9 s). Prova: `artcraft/ac-cambio-pagina-apps-download-provino.png`.
- Per noi (Fase 6 chiede le View Transitions di Astro): `<ClientRouter />` con testata, righello e indice persistenti
  (`transition:persist`), dissolvenza del contenuto ≤ 200 ms `ease-out`, poi le entrate della nuova pagina; con
  riduzione del movimento `transition:animate="none"`.

### 5. Menu a tendina e menu mobile
Screenshot: `artcraft/ac-menu-resources-1440-{dark,light}.png`, `artcraft/ac-menu-resources-hover-voce-1440-dark.png`,
`artcraft/ac-menu-craft-apps-1440-dark.png`, `artcraft/ac-menu-tastiera-1440-dark.png`, `artcraft/ac-menu-mobile-390-{dark,light}.png`,
sequenze `artcraft/sequenze/menu-resources/`, `artcraft/sequenze/menu-mobile-dark/`.
- **Stato al 14/10/2026: la tendina RESOURCES è solo testo (nessuna icona) e CRAFT APPS è un link semplice a `/apps`,
  senza tendina** (verificato su `/`, `/apps`, `/apps/photocraft`, `/download`, `/support`). Le icone delle app
  compaiono solo nella griglia di `/apps` e nelle carte. La nostra tendina PROGETTI con icone è quindi un adattamento:
  struttura della tendina RESOURCES + icone nello stile della griglia app.
- **Tendina RESOURCES** (Radix NavigationMenu): voce `<button aria-expanded>` con chevron 12 px che ruota di 180°
  quando è aperta e testo nel riquadro invertito (come la voce attiva). Pannello `position: absolute; top: 100%;
  left: 0` sotto la voce: **202 × 163 px**, sfondo `--bg`, bordo 1 px `--line` su tre lati (niente bordo superiore,
  si attacca alla linea della testata), **nessuna ombra, raggio 0, nessuna sfocatura**. 4 voci (Tutorials, News, FAQ,
  Press Kit), ognuna **200 × 41 px**, padding 10px 12px, hud-label 11 px `--muted`; hover → lo span interno diventa
  blocco invertito (padding 2px 6px), istantaneo.
- **Apertura:** al passaggio del mouse, **istantanea** (nessuna dissolvenza né scorrimento: opacità 1 e nessuna
  trasformazione dal primo fotogramma utile); chiusura ~100 ms dopo l'uscita del mouse, istantanea.
- **Tastiera:** Tab raggiunge la voce (outline 2 px `--accent-ink`, offset 2 px); Invio apre; Tab entra nella prima
  voce; frecce ↑↓ scorrono le voci; Esc chiude e riporta il focus sulla voce.
- **Proposta PROGETTI ▾:** stesso pannello (bordo su tre lati, `--bg`, raggio 0, apertura istantanea, anche al clic e da
  tastiera), larghezza ~320 px; ogni voce 56 px: icona del progetto **32×32** (raggio ~21% del lato, `drop-shadow(0 6px
  14px rgb(0 0 0 / .28))` solo in scuro), nome hud-label 11 px `--ink`, sotto una riga Inter 12 px `--faint`; hover =
  blocco invertito sul nome (come ArtCraft) o sfondo `--bg-raised`; ultima riga «TUTTI I PROGETTI →» separata da un
  filetto.
- **Menu mobile** (< 1024): l'icona ☰ diventa ✕ nella stessa cella 48×48; il pannello `#mobile-nav` **spinge giù il
  contenuto** (non è un livello sopra la pagina), si apre **senza animazione**, nessun blocco dello scroll.
  Voci a tutta larghezza **45 px** (padding 12 px, hud-label 11 px `--muted`); gruppo «RESOURCES» come etichetta più
  piccola `--faint` e sottovoci rientrate (padding sinistro 32 px); voce attiva in riquadro invertito, separata da un
  filetto; CTA «LAUNCH APP» piena a tutta larghezza **44 px** (Geist Mono 11 px w700, tracking 0,12em = 1,32 px);
  riga finale a 2 celle da **40 px** con filetto centrale (Pricing · Discord). Altezza totale 566 px a 390.
- **Scelta del nuovo sito (14/10/2026), menu mobile:** il pannello è un livello sopra la pagina (`position: fixed`), non
  spinge giù il contenuto: aprendo il menu la pagina sotto non salta. Voci, sottovoci (icona 32 px e nome centrati sulla
  stessa riga), CTA e misure come sopra.

### 6. Pagina elenco app `/apps` (→ Strumenti e indice Progetti)
Screenshot: `ac-apps-1440-dark-full.png`, `artcraft/sezioni/ac-apps-{apps,lineup,principles,start}-1440-{dark,light}.png`,
`artcraft/ac-apps-griglia-icone-{1440,768,390}-dark.png`.
- **Apertura** (≥1280 su due colonne, `justify-between`, gap 48): a sinistra h1 60/61,2 px (−2,1 px) «Thirteen apps.
  One *craft*.» con «craft» in `--accent-ink`; paragrafo 18/29,25 max 576; bottoni 48 px (primario con icona 16 px +
  sotto una nota hud `--faint` «FOR MACOS · DISK IMAGE»; due secondari bordati); nota Inter 16 `--muted`; barra
  «SHARE» (celle alte 36 px separate da 1 px). A destra la **griglia di icone**.
- **Griglia di icone** (misurata):
  | larghezza | colonne | icona | cella (icona + etichetta) | gap colonne × righe |
  |---|---|---|---|---|
  | ≥ 1280 | 5 (flex a capo, centrata, larga 480 px) | 80×80 | 80×104 | 20 × 24 px |
  | 640–1279 | 7 (griglia) | 80×80 | 80×104 | 20 × 24 px |
  | < 640 | 4 (griglia) | 56×56 | 72×80 | 12 × 24 px |
  Etichetta Inter 12/16 w500 `--muted`, 8 px sotto l'icona; hover: icona `translateY(−4px)` in 0,3 s
  `cubic-bezier(0,0,.2,1)`, etichetta → `--app-ink` (istantaneo). Icone: WebP 256×256 a tutto campo, angoli
  arrotondati **≈ 21% del lato** (17 px a 80, 15 a 72, 12 a 56) già nell'immagine, `drop-shadow(0 6px 14px
  rgb(0 0 0 / .28))`, 5–34 KB l'una, le prime precaricate con `fetchpriority=high`. (DESIGN sopra diceva «gap 24×20»:
  è 20 in orizzontale e 24 in verticale.)
- **Carte lineup:** colonne 1 (< 640) · 2 (640–1279) · 4 (≥ 1280); a 1440 ogni carta 319×567.
  - barra colorata 2 px in cima (`scaleX 0→1`, 0,3 s `cubic-bezier(.4,0,.2,1)` all'hover);
  - testata 49,5 px (padding 12px 24px): **badge** «01» 32,5×24,5 (padding 4px 8px, Geist Mono 11/16,5 w500
    tracking 1,65 px, nero su `--app`, raggio 0) e categoria hud `--faint` troncata a destra;
  - media **16:10** con bordo inferiore, immagine `object-fit: cover`, hover `scale(1.03)` in 0,5 s `cubic-bezier(0,0,.2,1)`;
  - icona **72×72** sovrapposta (margine −36 px), hover −4 px (0,3 s);
  - nome Archivo 30/36 w620 tracking −0,9 px, a due colori (prima parte `--ink-strong`, seconda `--app-ink`), mt 16;
  - descrizione Inter 16/26 `--muted` mt 12 (2–3 righe);
  - **etichette** mt 24, gap 6 px: Geist Mono **10/15 w500 tracking 1 px (0,1em)**, padding 1px 6px, altezza 19 px,
    bordo 1 px `--line`, sfondo `--bg-sunken`, raggio 0; quelle di stato in `--app-ink`, quelle di piattaforma in `--muted`;
  - «EXPLORE PHOTOCRAFT ↗» hud `--muted` → `--ink` all'hover, freccia 14 px `translate(2px,−2px)` in 0,15 s;
  - padding orizzontale 24 (32 da 768), in basso 24 (32).
  - Cella finale «NEXT UP»: hud `--faint`, h3 30/31,5, testo, bottone piccolo in fondo (33 px).
- **Principi** (6 celle, 3 colonne): padding 32; riquadro icona **40×40** bordato `--line` con icona 20 px in
  `--accent-ink`, numero hud `--faint` a destra; h3 24/32 mt 24; testo mt 8.
- Didascalia a destra della barra di sezione: «THIRTEEN APPS · OPEN SOURCE · PURE RUST» (descrive, non ripete il titolo).

### 7. Pagina di un'app `/apps/photocraft` (→ pagine progetto)
Screenshot: `artcraft/sezioni/ac-app-{photocraft,highlights,gallery,get-it,family}-1440-{dark,light}.png` e `-390-dark`.
- **Apertura centrata:** icona **112×112** (96 a 390) con ombra; riga badge «01» + nome Archivo **24/32** tracking
  −0,72 px a due colori; h1 **72/73,44 px** tracking −2,52 px (60 a 768, 36 a 390), max 896 px, una parola in
  `--app-ink`; paragrafo 18/29,25 max 576; tre bottoni 48 px (primario con icona, due secondari con icona); nota hud
  `--faint` sotto il primario; link hud «OTHER PLATFORMS AND DOWNLOADS ↓»; riga hud `--faint` «MACOS · WINDOWS · …»;
  barra SHARE. Poi, a tutta larghezza del contenitore, una **figura**: barra didascalia 34 px (padding 8px 40px:
  didascalia hud `--faint` a sinistra, «SCREENSHOT» a destra) e immagine **16:9** (1278×719). Anche qui il media
  comincia sotto la piega a 1440×900 (y = 1019).
- **Highlights** (= «cosa ottieni»): 6 celle, 3 colonne già a 768, 1 a 390; padding 32 (24); numero hud `--faint`
  in alto a destra; h3 24/32 mt 24; testo mt 8. Nessuna immagine.
- **Galleria** (= galleria di dettagli): griglia 2 colonne, la prima figura occupa 2 colonne. Ogni figura è un link
  all'immagine intera (nuova scheda): riquadro **16:10** `object-fit: cover`, `loading="lazy"`, alt descrittivo; in
  basso a destra (inset 12 px) l'etichetta «FULL SIZE ↗» hud su `--bg` all'80% con `backdrop-filter: blur(4px)`,
  padding 4px 8px, **opacità 0→1 in 0,15 s** all'hover e al focus; sotto, `figcaption` con filetto superiore,
  padding 12px 40px (24 su mobile): didascalia hud `--muted` a sinistra e numero hud `--faint` a destra (42 px).
- **Get it**: due blocchi; il riquadro «Terminal» (bordo `--line`, sfondo `--bg-sunken`, testata con «▸_ TERMINAL»
  hud `--faint` e bottone «COPY» alto 36 px separato da un filetto verticale) è il modello per riquadri di codice o
  per un campo di iscrizione.
- **The family** (= altri progetti): titolo h2 48 px a sinistra + link hud «ALL CRAFTING APPS» a destra; carte
  lineup con media 425×265 e icona **56** (margine −28); 3 colonne a 1440, 2 a 768, 1 a 390.

### 8. Download, Support, FAQ, News (→ Metodo, Contatti, Newsletter, Privacy, 404)
Screenshot: `ac-download-*.png`, `ac-support-*.png`, `artcraft/sezioni/ac-download-*.png`, `artcraft/sezioni/ac-support-*.png`,
`artcraft/sezioni/ac-faq-*.png`, `artcraft/pagine/ac-{news,articolo,pagina-404}-*.png`.
- **Download:** intro (h1 60 «Download *ArtCraft*.», paragrafo, bottoni 48, riga hud `--faint` «FREE · OPEN SOURCE ·
  V 0.41.0»); **anteprima** a tutta larghezza con barra didascalia 34 px e **4 crocette** 11 px agli angoli (inset 8 px,
  opacità 0,6), immagine `height: auto`; **Platforms**: 2 carte (testata 38 px «PLATFORM» + numero; corpo padding 32:
  riquadro icona 40×40 + h2 24 px; elenco requisiti mt 24 con righe Inter **14/20** `--muted` e icona 16 px `--faint`,
  gap 10; bottone a tutta larghezza alto 33–35 px in fondo, primario per la piattaforma consigliata, bordato l'altra);
  **Quick start**: 3 celle padding 32 con «STEP 1/2/3» hud `--faint`, h3 24 mt 24, testo mt 8.
- **Support:** intro + 3 carte canale **A/B/C** (padding 32): riquadro icona 40×40 bordato che diventa invertito
  all'hover (0,15 s), lettera hud `--faint` a destra, h2 24 mt 24, testo mt 8, «OPEN DISCORD →» hud `--muted` → `--ink`
  con freccia `translateX(4px)` (0,15 s); tutta la carta è un link e all'hover passa a `--bg-raised` (istantaneo).
- **FAQ/accordion: non esiste.** Support rimanda a `/faq`, che è una griglia 2 colonne di carte guida (numero hud,
  h2 24, testo; hover `--bg-raised`). Nessun `<details>`, nessuna tabella in Download, Support, FAQ e pagine app.
  Unici «tab»: Yearly/Monthly in Pricing (Geist Mono 11 px w600 tracking 0,1em).
- **News** (→ archivio newsletter): righe a tutta larghezza in griglia `160px 1fr` (gap 16, padding 32/24): data hud
  `--faint` a sinistra; a destra titolo Archivo 24/32 + freccia → 16 px `--faint` (all'hover `--ink` e
  `translateX(4px)`), descrizione Inter 16/26 `--muted` max 672 mt 8; hover riga `--bg-raised`. Barra «02 / POSTS» con
  didascalia «NEWEST FIRST».
- **Articolo** (→ numero di newsletter, Privacy): intro come le altre pagine (barra «01 / NEWS» con la data a destra,
  h1 60 px max 768, sottotitolo 18 px, link hud «‹ BACK TO NEWS»); corpo `<article>` centrato **max 768 px**, padding
  64px 40px; paragrafi Inter **17/29,75 in `--ink`** (non `--muted`), titoli interni Archivo 32/35,2 tracking −0,64
  mb 16; immagini e video con margine 32px 0 su `--bg-sunken`; citazioni Instrument Serif 20/35 `--muted` rientrate di
  20 px; link `--accent-ink`.
- **404 e Privacy di ArtCraft:** la 404 è la pagina predefinita di Next.js, non curata («404 | This page could not be
  found.» su fondo nero); `/privacy` non esiste. Non c'è un modello: la nostra 404 usa l'intro di Support + carte canale,
  la Privacy il layout dell'articolo.

### 9. Hover, misurati (stili calcolati prima/dopo, scuro e chiaro)
Ritagli prima/dopo in `artcraft/hover/` (`<elemento>-<tema>-{prima,dopo}.png`), confronto `artcraft/ac-hover-carta-lineup-prima-dopo.png`.
| elemento | cosa cambia | durata e curva |
|---|---|---|
| Bottone primario (pieno) | opacità 1 → **0,8** (non 0,85) | 0,15 s `cubic-bezier(.4,0,.2,1)` |
| Bottone secondario / piccolo bordato | sfondo → `--invert-bg`, testo → `--invert-fg`, bordo → trasparente | 0,12 s lineare |
| CTA della testata | opacità → 0,8 | 0,15 s |
| Voce di menu e voce della tendina | testo `--muted` → `--ink`; lo span interno diventa blocco invertito | istantaneo |
| Celle icona della testata (Discord, tema) | blocco invertito | istantaneo |
| Link hud (es. «OPEN SOURCE ON GITHUB») e link del piè di pagina | colore → `--ink` | istantaneo |
| Carta lineup | barra 2 px `scaleX 0→1`; immagine `scale 1.03`; icona −4 px; «EXPLORE» → `--ink`; freccia +2/−2 px | 0,3 s / 0,5 s / 0,3 s / – / 0,15 s |
| Icona della griglia app | icona −4 px; etichetta → `--app-ink` | 0,3 s ease-out / istantaneo |
| Carta canale (Support) e carta guida (FAQ) | sfondo → `--bg-raised`; riquadro icona invertito; freccia +4 px | istantaneo / 0,15 s / 0,15 s |
| Riga News | sfondo → `--bg-raised`; freccia +4 px e → `--ink` | istantaneo / 0,15 s |
| Film della community | velo nero 20% → 10% | 0,15 s |
| Figura della galleria | etichetta «FULL SIZE ↗» opacità 0 → 1 | 0,15 s |
| Carta «More in the app» | quadrato freccia invertito | 0,15 s |
| Schede video «Crafting features» | nulla | – |
- Tutti gli hover sono dentro `@media (hover: hover)` (niente effetti appiccicati al tocco).
- `--ease-out` di Tailwind = `cubic-bezier(0,0,.2,1)`; transizione predefinita 0,15 s `cubic-bezier(.4,0,.2,1)`.

### 10. «Made with ArtCraft» (Home → 04 Open source)
Screenshot: `artcraft/sezioni/ac-home-made-with-1440-{dark,light}.png`, `…-390-dark.png`.
- Barra «03 / PROOF» con didascalia «FROM THE COMMUNITY»; titolo h2 «Made *with* ArtCraft.» (serif corsivo); nessun
  paragrafo.
- Griglia 3 colonne (1 su mobile), gap 1 px. Ogni `<figure>`: testata 37,5 px (padding 10px 24px) con `<figcaption>`
  «COMMUNITY FILM» hud `--muted` e numero «01» hud `--faint`; riquadro **16:9** (425×239 a 1440) con un `<button>`
  a tutta area (`aria-label="Play video: Made with ArtCraft #1"`): miniatura YouTube `hqdefault.jpg` `loading=lazy`
  `object-fit: cover`, velo nero al 20% (10% all'hover, 0,15 s), etichetta **«▶ PLAY»** in basso a sinistra (inset
  12 px): hud-label 11 px, blocco invertito `--invert-bg`/`--invert-fg`, padding 6px 12px, icona play 14 px, gap 6,
  77×28,5 px. Al clic il riquadro diventa un `<iframe>` di `youtube-nocookie.com` con autoplay (facciata leggera:
  nessun YouTube caricato prima del clic).
- **Per noi:** testata «PROVA · GITHUB» + numero; riquadro con lo screenshot ritagliato della prova (16:9 o 16:10,
  `object-fit: cover` con punto focale sul commento); etichetta **«VEDI SU GITHUB ↗»** nella stessa posizione e
  forma di «PLAY» (blocco invertito, hud 11 px, padding 6px 12px); tutta la figura è un link `target=_blank rel=noopener`
  con `aria-label` che dice cosa si apre; sotto (aggiunta nostra, utile) una `figcaption` con data e stato in etichetta
  10 px (INTEGRATA / IN REVISIONE / PROPOSTA).

### 11. Proporzioni, etichette e maiuscole monospace (riepilogo riutilizzabile)
- Maiuscole monospace (Geist Mono, sempre `text-transform: uppercase`):
  | uso | corpo / interlinea | peso | spaziatura |
  |---|---|---|---|
  | hud-label (menu, barre, didascalie, badge, PLAY) | 11 / 16,5 px | 500 | **0,15em = 1,65 px** |
  | bottoni e CTA | 11 / 16,5 px | 700 | **0,12em = 1,32 px** |
  | etichette bordate (tag) | 10 / 15 px | 500 | **0,1em = 1 px** |
  | tab (Pricing) | 11 px | 600 | 0,1em |
  | numeri del righello | 9 px | – | 0,08em |
  Nota: il badge numerato ha la classe `font-bold` ma il peso calcolato è 500 (vince `.hud-label`).
- Altezze: testata 48 (+1 bordo); barra di sezione 42,5 (padding 12px 40px); testata carta feature/film 37,5;
  testata carta lineup 49,5; bottone 48; bottone piccolo 31–35; cella SHARE 36; badge 24,5; tag 19; voce tendina 41;
  voce menu mobile 45.
- Proporzioni dei media: hero carte 16:9 (10 px di raggio); feature e film 16:9; lineup e galleria **16:10**;
  figura d'apertura della pagina app 16:9; anteprima Download altezza naturale.
- Spaziature ricorrenti: intro di sezione 56px 24px (80px 40px da 768); padding carta 24 (32 da 768); titolo → testo
  20 px (h2) / 8 px (h3); testo → bottoni 32 px (28 nell'apertura); gap bottoni 12; chiusura 80 px (112 da 768).
- Titoli: h2 sezione Archivo 60/61,2 tracking −2,1 px (−0,035em), max 768; h2 chiusura 72/70,56 tracking −2,88 px
  (−0,04em); h1 pagina app 72/73,44; sottotitolo apertura 36/37,8 tracking −1,08 px con la parte in Instrument Serif
  corsivo 400 `--muted`; wordmark Archivo 750 stretch 125%, 95,4 px a 1440 (lettere 95–113 px di larghezza).
- Righello (valori di produzione): rotaia 60 px a destra, tacche ogni 1% (lunghe 10 px, opacità 0,4), numerate ogni 5%
  (20 px, 0,8), etichette 0,5; indice: titolo corrente 34 px, parola che corre sulla rotaia 20 px, voci in coda 16 px a
  opacità 0,35, passo 20 px; entrata delle tacche 1 s con cascata 0,01 s; cifre della percentuale che scorrono in
  0,28 s `cubic-bezier(.2,.9,.2,1)`. Il wordmark dell'apertura vola nell'indice: il volo inizia 100 px prima che passi sotto la testata e dura 320 px di scroll (a 1440 circa da 130 a 450 px).
- **Scelta del nuovo sito (14/10/2026), indice:** voce corrente sotto la barra fissa della sezione (58 px sotto la testata);
  in coda solo le tre voci successive; nell'apertura della Home solo il nome; ogni voce, anche la corrente, si nasconde
  finché passa sopra le righe di un testo o sopra un'immagine o un video, così l'indice non copre mai i contenuti.
- Marquee: celle hud 11 px padding 12px 24px (alte 40,5), quadratino ▪ `--accent-ink` mr 24; due copie della fila,
  36 s lineare infinito; fermo con riduzione del movimento.

## Corrispondenze

Per ogni pagina e sezione del nuovo sito, il corrispettivo esatto in ArtCraft. Percorsi relativi a `riferimento/`.
«(adattamento)» = in ArtCraft non c'è un elemento identico: si usa quello indicato, con la modifica descritta.

| Nuovo sito — pagina / sezione | ArtCraft — pagina e sezione | Screenshot di riferimento |
|---|---|---|
| **Testata** (HOME · METODO · PROGETTI ▾ · STRUMENTI · OPEN SOURCE · NEWSLETTER \| CONTATTI, GitHub, tema, SCRIVIMI) | tutte le pagine, `#site-nav` (Home… \| Craft Apps, Pricing, Discord, tema, LAUNCH APP) | `ac-home-1440-dark-top.png`, `artcraft/ac-menu-resources-1440-dark.png` |
| **Tendina PROGETTI con icone** | tendina RESOURCES (solo testo) + icone della griglia di `/apps` (adattamento, § 5) | `artcraft/ac-menu-resources-1440-{dark,light}.png`, `artcraft/ac-menu-resources-hover-voce-1440-dark.png`, `artcraft/ac-apps-griglia-icone-1440-dark.png` |
| **Menu mobile** | `#mobile-nav` (< 1024): voci 45 px, sottovoci rientrate, CTA piena, riga a 2 celle | `artcraft/ac-menu-mobile-390-{dark,light}.png`, `ac-menu-mobile-390-dark.png` |
| Home — **apertura**: wordmark, sottotitolo, 2 bottoni, 7 carte video in orbita | Home `#hero` (wordmark ARTCRAFT, «Capable tools *for artists.*», 2 bottoni, galassia di carte video) — 7 carte invece di ~48 | `artcraft/ac-apertura-{1440,768,390}-{dark,light}.png`, `artcraft/ac-apertura-1440-dark-2x.png`, `artcraft/ac-apertura-carta-zoom-2x-a.png`, `artcraft/ac-apertura-intro-1440-dark-provino.png` |
| Home — **fascia di prove** in monospace con loghi | Home: riga hud sotto i bottoni («OPEN SOURCE ON GITHUB · MACOS · …», icona 14 px) + `.marquee` sotto l'apertura (fila hud, ▪ `--accent-ink`, 36 s) — con loghi 16–20 px al posto di ▪ (adattamento) | `artcraft/sezioni/ac-home-marquee-1440-{dark,light}.png`, `ac-home-1440-dark-top.png` |
| Home — **01 Cosa faccio** (schede con video) | Home `#features` «Crafting features»: 2 colonne, testata etichetta + numero, video 16:9, h3 + testo | `artcraft/sezioni/ac-home-features-1440-{dark,light}.png`, `…-390-dark.png` |
| Home — **02 Metodo** (fasi numerate) | Download `#quick-start` («STEP 1/2/3», 3 celle) per il riassunto; per 6 fasi la griglia di `/apps` `#principles` (riquadro icona 40 + numero 01–06) | `artcraft/sezioni/ac-download-quick-start-1440-dark.png`, `artcraft/sezioni/ac-apps-principles-1440-{dark,light}.png` |
| Home — **03 Cosa sviluppo** (lineup) | `/apps` `#lineup` «The lineup»: badge numerato, categoria, media 16:10, icona 72 sovrapposta, nome a due colori, etichette, «EXPLORE ↗» | `artcraft/sezioni/ac-apps-lineup-1440-{dark,light}.png`, `artcraft/ac-hover-carta-lineup-prima-dopo.png` |
| Home — **04 Open source** (prove da GitHub, «VEDI SU GITHUB ↗») | Home `#made-with` «Made *with* ArtCraft.»: figure 16:9 con testata e etichetta «▶ PLAY» invertita (§ 10) | `artcraft/sezioni/ac-home-made-with-1440-{dark,light}.png`, `…-390-dark.png` |
| Home — **05 Strumenti** (griglia di icone) | `/apps` `#apps`, colonna destra: griglia di 13 icone (5 / 7 / 4 colonne) | `artcraft/ac-apps-griglia-icone-{1440,768,390}-dark.png`, `artcraft/sezioni/ac-apps-apps-1440-{dark,light}.png` |
| Home — **06 Principi** | Home `#ownership` (3 celle A/B/C, h3, testo, bottone piccolo bordato) | `artcraft/sezioni/ac-home-ownership-1440-{dark,light}.png`, `…-390-dark.png` |
| Home — **07 Chi sono** | (adattamento) intro di sezione + Download: figura con barra didascalia e 4 crocette per la foto (verticale 4:5) e, accanto, celle come `#platforms` (elenco con icone 16 px) per i fatti | `artcraft/sezioni/ac-download-anteprima-1440-dark.png`, `artcraft/sezioni/ac-download-platforms-1440-dark.png` |
| Home — **riquadro newsletter** | pagina app `#get-it` (blocco «Option 1 · Recommended»: occhiello hud `--app-ink`, titolo 30–36 px, 3 punti hud, azione a destra) + riquadro «Terminal» per il campo email (adattamento: ArtCraft non ha moduli) | `artcraft/sezioni/ac-app-get-it-1440-{dark,light}.png` |
| Home — **chiusura** | Home `#start` «Start *crafting*.» (hud `--faint`, h2 72 centrato, testo, 2 bottoni) | `artcraft/sezioni/ac-home-start-1440-{dark,light}.png`, `…-390-dark.png` |
| **Piè di pagina** | `footer` (griglia 2fr 1fr 1fr 1fr 1fr, gap 1 px; barra finale) | `artcraft/sezioni/ac-home-footer-1440-{dark,light}.png`, `…-390-dark.png` |
| **Metodo** — apertura | Download `#download` (h1 60, testo, bottoni, riga hud) | `artcraft/sezioni/ac-download-download-1440-{dark,light}.png` |
| Metodo — 6 fasi (ascolto … manutenzione) | `/apps` `#principles` (6 celle numerate 01–06 con riquadro icona 40) | `artcraft/sezioni/ac-apps-principles-1440-{dark,light}.png` |
| Metodo — cosa ottiene il cliente in ogni fase | Download `#platforms` (carte con testata + elenco di righe con icona 16 px) | `artcraft/sezioni/ac-download-platforms-1440-{dark,light}.png` |
| Metodo — cosa non fa / obiettivi | Home `#ownership` (A/B/C) e `#start` per la chiusura | `artcraft/sezioni/ac-home-ownership-1440-dark.png`, `artcraft/sezioni/ac-home-start-1440-dark.png` |
| **Progetti — indice** | `/apps` intero: `#apps` (titolo grande + griglia di icone), `#lineup`, `#principles`, `#start` | `ac-apps-1440-dark-full.png`, `ac-apps-390-dark-full.png`, `artcraft/sezioni/ac-apps-*.png` |
| **Progetto** (SfornaClaw, PrivacyBridge, Automazioni, Agenti personali) — apertura con video | `/apps/photocraft` `#photocraft`: icona 112, badge + nome, h1 72 centrato, bottoni, figura 16:9 con barra didascalia (qui: video) | `artcraft/sezioni/ac-app-photocraft-1440-{dark,light}.png`, `…-390-dark.png` |
| Progetto — cosa ottieni | `/apps/photocraft` `#highlights` (6 celle numerate) | `artcraft/sezioni/ac-app-highlights-1440-{dark,light}.png` |
| Progetto — galleria di dettagli | `/apps/photocraft` `#gallery` (prima figura su 2 colonne, 16:10, «FULL SIZE ↗», didascalia + numero); le schermate verticali in cornice di telefono (adattamento) | `artcraft/sezioni/ac-app-gallery-1440-{dark,light}.png`, `…-390-dark.png` |
| Progetto — altri progetti | `/apps/photocraft` `#family` «More from the family.» (carte lineup, icona 56) | `artcraft/sezioni/ac-app-family-1440-{dark,light}.png` |
| Automazioni — schema animato dei passi | (adattamento) celle numerate di `#quick-start` in fila, collegate da filetti; ogni passo si accende con l'entrata a cascata (0,18 s) | `artcraft/sezioni/ac-download-quick-start-1440-dark.png` |
| **Strumenti** — titolo grande + griglia di icone | `/apps` `#apps` (h1 «Thirteen apps. One *craft*.» + griglia) | `artcraft/sezioni/ac-apps-apps-1440-{dark,light}.png`, `artcraft/ac-apps-griglia-icone-*.png` |
| Strumenti — schede dettagliate (come lo uso + screenshot/video) | `/apps` `#lineup` per le carte + `#features` della Home per il media 16:9 | `artcraft/sezioni/ac-apps-lineup-1440-dark.png`, `artcraft/sezioni/ac-home-features-1440-dark.png` |
| Strumenti — nota «nessuna affiliazione» | didascalia hud `--faint` a destra della barra di sezione («THIRTEEN APPS · OPEN SOURCE · PURE RUST») | `artcraft/sezioni/ac-apps-apps-1440-dark.png` |
| **Open source** — prove (contributi integrati, ringraziamenti, note di rilascio) | Home `#made-with` (figure con etichetta azione) | `artcraft/sezioni/ac-home-made-with-1440-{dark,light}.png` |
| Open source — elenco cronologico con link, data e stato | `/news` (righe data \| titolo + testo + →) con etichette 10 px di stato come i tag della lineup | `artcraft/pagine/ac-news-1440-{dark,light}-top.png`, `artcraft/sezioni/ac-apps-lineup-1440-dark.png` |
| Open source — PrivacyBridge come progetto suo | carta lineup singola (`#family`) | `artcraft/sezioni/ac-app-family-1440-dark.png` |
| **Chi sono** | (adattamento) Download: intro + figura con crocette per la foto + celle `#platforms` per i fatti; storia in colonna di lettura come l'articolo News (max 768, Inter 17/29,75) | `artcraft/sezioni/ac-download-*.png`, `artcraft/pagine/ac-articolo-1440-dark-top.png` |
| **Newsletter — archivio** | `/news` (barra «02 / POSTS» · «NEWEST FIRST», righe 160px \| 1fr) | `artcraft/pagine/ac-news-1440-{dark,light}-{top,full}.png`, `artcraft/pagine/ac-news-390-dark-full.png` |
| Newsletter — **numero** (`/newsletter/numeri/<data>/`) | `/news/world-models-for-film` (intro con data a destra, «‹ BACK TO NEWS», corpo max 768) | `artcraft/pagine/ac-articolo-1440-{dark,light}-{top,full}.png`, `artcraft/pagine/ac-articolo-390-dark-full.png` |
| Newsletter — iscrizione | pagina app `#get-it` + riquadro «Terminal» (adattamento: campo email bordato su `--bg-sunken`, bottone a destra alto 36–48 px) | `artcraft/sezioni/ac-app-get-it-1440-dark.png` |
| Newsletter — conferma / link non valido | intro di `/support` (barra + h1 + testo) + una o due carte canale | `artcraft/sezioni/ac-support-support-1440-dark.png`, `artcraft/sezioni/ac-support-contact-1440-dark.png` |
| **Contatti** | `/support`: intro + `#contact` (3 carte canale A/B/C: email, GitHub, modulo) | `ac-support-1440-dark-full.png`, `artcraft/sezioni/ac-support-contact-1440-{dark,light}.png`, `…-390-dark.png` |
| **Privacy** | nessuna in ArtCraft (`/privacy` → 404): layout dell'articolo News | `artcraft/pagine/ac-articolo-1440-dark-top.png` |
| **404** | nessun modello (la 404 di ArtCraft è quella predefinita di Next.js, `artcraft/pagine/ac-pagina-404-1440-dark-top.png`): intro di Support + carte canale (Home, Progetti, Contatti) | `artcraft/sezioni/ac-support-support-1440-dark.png`, `artcraft/sezioni/ac-support-contact-1440-dark.png` |
| **Righello e indice** (tutte le pagine ≥ 1024) | righello a destra e indice dei titoli (§ 11) | `ac-home-1440-dark-scrolled-index.png`, `artcraft/ac-entrata-scroll-principles-1440-dark-provino.png` |
| **Entrate allo scroll, hover, cambio pagina** | § 3, § 9, § 4 | `artcraft/ac-entrata-scroll-principles-1440-dark-provino.png`, `artcraft/hover/`, `artcraft/ac-cambio-pagina-apps-download-provino.png` |
