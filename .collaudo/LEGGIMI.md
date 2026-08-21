# .collaudo/

Attrezzi interni. Nessuno serve per pubblicare: il sito resta statico, e questa
cartella non finisce online (GitHub Pages non serve le cartelle che iniziano con
un punto: chiesti al sito vero, i file rispondono 404).

Prima di lanciare quelli che aprono il browser servono due cose accese:

    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .

Tutti escono con 1 se anche un solo controllo e' rosso.

## Il giro completo, in ordine

    python3 .collaudo/i18n_estrai.py        # solo se sono cambiati i testi italiani
    python3 .collaudo/i18n_costruisci.py    # rifa' /en/ e il tasto lingua
    python3 .collaudo/mappa.py AAAA-MM-GG   # rifa' sitemap.xml sulle due lingue
    python3 .collaudo/collaudo.py           # 159 controlli
    python3 .collaudo/tasti.py              # 188 tasti premuti
    python3 .collaudo/lingue.py             #  85 controlli
    python3 .collaudo/traboccamenti.py      #  29 pagine x 7 larghezze
    python3 .collaudo/senza_rete.py         #  29 pagine coi domini esterni giu'
    python3 .collaudo/numeri.py             #  92 controlli, due lingue

## `collaudo.py`

Apre ogni pagina in un browser vero, la fa disegnare e misura. Non cerca
stringhe nel codice: legge quello che il browser ha calcolato. Testa delle
pagine, larghezze su 390 e 320 px, ordine di lettura delle sezioni dimostrative,
numerazione, visibilita' delle chat con «riduci movimento» attivo, collegamenti
interni, materiale che non deve essere pubblico. La lingua attesa la decide
l'indirizzo: sotto `/en/` si pretende `en`, altrove `it`.

## Le due lingue

`i18n_estrai.py` tira fuori da ogni pagina italiana i pezzi di testo che un
lettore vede, numerati. Chi traduce non vede mai un tag: riceve una lista e
rimanda la stessa lista. `i18n_costruisci.py` rimette ogni pezzo dov'era e
scrive `en/`.

Due garanzie, e vanno tenute:

- `python3 .collaudo/i18n_costruisci.py --prova` rimette al posto il testo
  **italiano** e pretende il file identico byte per byte. Se non torna, il
  meccanismo perde pezzi e non si traduce niente.
- lanciarlo due volte di fila deve dare lo stesso risultato. Per questo esiste
  `pagina_nuda()`: toglie il tasto lingua e le dichiarazioni hreflang aggiunte
  dal giro precedente, prima di rileggere la pagina.

Gli indirizzi inglesi sono inglesi (`/en/security/`, non `/en/sicurezza/`): la
tabella sta in `i18n_costruisci.py` ed e' la stessa da cui `collaudo.py`,
`traboccamenti.py` e `senza_rete.py` derivano l'elenco delle pagine. Nessuno di
loro scrive l'elenco a mano, cosi' una pagina nuova non puo' restare fuori dal
collaudo in silenzio.

Il passaggio fra le lingue sta in due posti che non si vedono mai insieme:
sopra i 480px e' la sigla in testa alla pagina, sotto e' una voce per esteso
dentro il pannello del menu. Su uno schermo da 320px un quarto elemento in
testa buttava fuori il tasto Menu.

## `tasti.py`

Preme. Il tasto Menu deve aprire e richiudere il pannello, il tasto del tema
deve cambiare tema e chiamarsi nella lingua della pagina.

Esiste per un difetto vero: il motore che disegna la pagina rifa' i nodi
portandosi dietro gli attributi ma non gli ascoltatori. `sito.js` si segnava
«gia' legato» con un attributo, lo rileggeva sul nodo nuovo e non rilegava piu'
nulla. Da fuori era tutto perfetto: il tasto c'era, al suo posto, col contorno
giusto. Solo non faceva niente, e nessun controllo sul testo o sulla forma
poteva accorgersene. Ora il segno e' un `WeakSet`, che muore insieme al nodo.

Provato al contrario: rimettendo la guardia ad attributo, 69 controlli
diventano rossi. La prima volta la prova negativa e' uscita al contrario,
verde col guasto e rossa senza, perche' il browser rispondeva con lo script
della volta prima. Da allora la prova spegne la memoria del browser.

## `numeri.py`

La pagina Modelli, in **tutte e due le lingue**, non deve dire numeri diversi
da `assets/benchmark.json`. Il nome di un modello e' un identificativo, non
prosa: si traduce solo se la fonte dichiara come si scrive nell'altra lingua,
col campo `nome_en`. Provato al contrario: alterando la fonte, diventano rosse
tutte e due le lingue.

## `lingue.py`

Che le due lingue esistano, si trovino, si dichiarino e non si sporchino: le
gemelle ci sono tutte, gli hreflang si puntano a vicenda, la pagina inglese si
dichiara inglese e canonica su se stessa, il tasto porta a un indirizzo che
risponde, e nel testo inglese non e' rimasta prosa italiana.

L'ultimo controllo cerca parole funzionali italiane, non «parole che sembrano
italiane». Fuori dall'elenco stanno di proposito *come*, *per* e *dove*: sono
parole inglesi a tutti gli effetti («cost per task», «the proposals come from»),
e tenerle dentro faceva suonare l'allarme su frasi corrette. Una spia che suona
sempre non la guarda piu' nessuno.

## `mappa.py`

Rigenera `sitemap.xml` dalle pagine che esistono davvero, in due lingue, e ogni
indirizzo dichiara la gemella con `xhtml:link`. Un elenco scritto a mano di cose
che stanno gia' sul disco e' un doppione che tace.

## `patch-01-struttura.py`, `patch-02-indirizzi.py`

Passate di revisione del 21 agosto 2026, gia' applicate. Restano come registro
di che cosa e' stato cambiato e perche'. Non vanno rilanciate.
