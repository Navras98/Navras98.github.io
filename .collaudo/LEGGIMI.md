# strumenti/

Tre attrezzi, nessuno dei quali serve per pubblicare: il sito resta statico.

## `collaudo.py`
Apre ogni pagina in un browser vero, la fa disegnare e misura. Non cerca stringhe
nel codice: legge quello che il browser ha calcolato. Controlla testa delle pagine,
larghezze su 390 e 320 px, ordine di lettura delle sezioni dimostrative,
numerazione, visibilita' delle chat con «riduci movimento» attivo, collegamenti
interni e materiale che non deve essere pubblico.

    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .
    python3 strumenti/collaudo.py

Esce con 1 se anche un solo controllo e' rosso.

## `numeri.py`
La pagina Modelli non deve dire numeri diversi da `assets/benchmark.json`.
Confronta i due e stampa gli scostamenti. Esce con 1 se ce ne sono.
Provato al contrario: alterando la fonte di proposito, diventa rosso.

    python3 strumenti/numeri.py

## `patch-01-struttura.py`
Passata di revisione del 21 agosto 2026, gia' applicata. Resta qui come registro
di che cosa e' stato cambiato e perche'. Non va rilanciata.
