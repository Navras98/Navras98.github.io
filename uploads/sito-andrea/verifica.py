#!/usr/bin/env python3
"""Controlli statici sulle pagine generate.

Parole per pagina, collegamenti interni, menu completo con stato attivo, metadati
unici, elemento visivo, limite dichiarato, e le regole di scrittura del progetto:
niente frasi generiche, niente trattini lunghi, niente emoji, niente numeri senza
metodo, niente dettagli riservati. Uscita 0 se non c'è nulla da segnalare.
"""

import html
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent

PAGINE = [
    "index.html",
    "architettura.html",
    "sicurezza.html",
    "dati.html",
    "privacy.html",
    "automazione.html",
    "stack.html",
    "metodo.html",
    "contatti.html",
]
INTERNE = [p for p in PAGINE if p != "index.html"]
MIN_PAROLE = 700
MAX_PAROLE = 1400
# le pagine tecniche devono dichiarare un limite; home, stack e contatti no
TECNICHE = ["architettura.html", "sicurezza.html", "dati.html", "privacy.html", "automazione.html"]

BANDITE = [
    "soluzioni innovative",
    "trasformo il tuo business",
    "al passo con l'ia",
    "al passo con l’ia",
    "esperienza a 360",
    "360 gradi",
    "rivoluzionar",
    "all'avanguardia",
    "all’avanguardia",
    "cutting edge",
    "game changer",
    "inviolabil",
    "non sbaglia mai",
    "al 100%",
    "non rimanere indietro",
    "non restare indietro",
]

# nomi che non devono comparire: sistema interno, agenti, bot, strumenti, percorsi
RISERVATI = [
    r"\bopenclaw\b",
    r"\bhetepi\b",
    r"\bn8n\b",
    r"\btailscale\b",
    r"\blaunchd\b",
    r"\bportachiavi\b",
    r"\bkeychain\b",
    r"\bsqlite\b",
    r"\btelegram\b",
    r"\bwhatsapp\b",
    r"\bcrontab\b",
    r"\bsystemd\b",
    r"\bnginx\b",
    r"\bgateway\b",
    r"[\w/.-]+\.(py|mjs|json|sh|yml|yaml|plist|jsonl)\b",
    r"(?<![\w.])/(Users|home|etc|var|opt)/",
    r"\bapi[_ -]?key\b",
]

EMOJI = re.compile(
    "[\U0001f300-\U0001faff\U00002700-\U000027bf\U0001f1e6-\U0001f1ff☀-⛿]"
)
# percentuali, moltiplicatori e valute: numeri senza metodo
NUMERI = re.compile(r"\b\d+([.,]\d+)?\s?(%|x\b|€|\$|euro|dollar)", re.I)

problemi = []
note = []


def testo_main(sorgente: str) -> str:
    m = re.search(r"<main[^>]*>(.*?)</main>", sorgente, re.S)
    corpo = m.group(1) if m else ""
    corpo = re.sub(r"<script.*?</script>", " ", corpo, flags=re.S)
    corpo = re.sub(r"<svg.*?</svg>", " ", corpo, flags=re.S)
    corpo = re.sub(r"<[^>]+>", " ", corpo)
    return html.unescape(corpo)


def parole(t: str) -> int:
    return len([w for w in re.split(r"\s+", t) if w.strip()])


def main() -> int:
    sorgenti = {}
    for p in PAGINE:
        f = BASE / p
        if not f.exists():
            problemi.append(f"{p}: la pagina non esiste")
            continue
        sorgenti[p] = f.read_text(encoding="utf8")

    if len(sorgenti) != len(PAGINE):
        for x in problemi:
            print("  KO  " + x)
        return 2

    # ---------------------------------------------------------------- parole
    print("PAROLE (contenuto di <main>, esclusi i diagrammi)")
    for p in PAGINE:
        n = parole(testo_main(sorgenti[p]))
        if p in INTERNE and n < MIN_PAROLE:
            problemi.append(f"{p}: {n} parole, sotto il minimo di {MIN_PAROLE}")
            stato = "KO"
        elif p in INTERNE and n > MAX_PAROLE:
            note.append(f"{p}: {n} parole, sopra la fascia indicata di {MAX_PAROLE}")
            stato = "..."
        else:
            stato = "ok"
        print(f"  {stato:>3}  {p:<22} {n}")

    # ---------------------------------------------------- menu e collegamenti
    for p, s in sorgenti.items():
        mancanti = [q for q in PAGINE if f'href="{q}"' not in s]
        if mancanti:
            problemi.append(f"{p}: nel menu mancano {', '.join(mancanti)}")
        if s.count('aria-current="page"') != 2:  # barra + pannello mobile
            problemi.append(f"{p}: la pagina corrente non è segnata due volte nel menu")
        for href in set(re.findall(r'href="([^"#:]+\.html)"', s)):
            if not (BASE / href).exists():
                problemi.append(f"{p}: collegamento rotto verso {href}")
        for risorsa in set(re.findall(r'(?:href|src)="(assets/[^"]+)"', s)):
            if not (BASE / risorsa).exists():
                problemi.append(f"{p}: risorsa mancante {risorsa}")

    # -------------------------------------------------------------- metadati
    titoli, descr = {}, {}
    for p, s in sorgenti.items():
        t = re.search(r"<title>(.*?)</title>", s, re.S)
        d = re.search(r'<meta name="description" content="(.*?)">', s, re.S)
        if not t or not d:
            problemi.append(f"{p}: titolo o descrizione mancanti")
            continue
        titoli.setdefault(t.group(1), []).append(p)
        descr.setdefault(d.group(1), []).append(p)
        if not 60 <= len(d.group(1)) <= 260:
            note.append(f"{p}: descrizione di {len(d.group(1))} caratteri")
    for valore, pagine in list(titoli.items()) + list(descr.items()):
        if len(pagine) > 1:
            problemi.append(f"metadato ripetuto su {', '.join(pagine)}")

    # ------------------------------------------- elemento visivo e limite
    for p in INTERNE:
        s = sorgenti[p]
        if 'class="dia"' not in s.split("</main>")[0]:
            problemi.append(f"{p}: nessun elemento visivo dentro il contenuto")
        if p in TECNICHE and 'class="limite"' not in s:
            problemi.append(f"{p}: nessun limite dichiarato")
        if 'class="next__link"' not in s:
            problemi.append(f"{p}: manca il passaggio alla pagina successiva")
        if len(re.findall(r"<h2", s)) < 3:
            problemi.append(f"{p}: meno di tre sottosezioni")

    # ----------------------------------------------------- regole di scrittura
    for p, s in sorgenti.items():
        # titolo e descrizione sono testo visibile quanto il corpo: la scheda del
        # browser e il risultato di ricerca li mostrano per primi
        for campo, pattern in (("titolo", r"<title>(.*?)</title>"),
                               ("descrizione", r'<meta name="description" content="(.*?)">')):
            m = re.search(pattern, s, re.S)
            if m and ("—" in m.group(1) or "–" in m.group(1)):
                problemi.append(f"{p}: trattino lungo nel {campo}")
        t = testo_main(s)
        basso = t.lower()
        for b in BANDITE:
            if b in basso:
                problemi.append(f"{p}: frase bandita «{b}»")
        if EMOJI.search(t):
            problemi.append(f"{p}: contiene un'emoji")
        if "—" in t or "–" in t:
            problemi.append(f"{p}: contiene un trattino lungo")
        n = NUMERI.search(t)
        if n:
            problemi.append(f"{p}: numero senza metodo «{n.group(0)}»")
        for pattern in RISERVATI:
            m = re.search(pattern, t, re.I)
            if m:
                problemi.append(f"{p}: dettaglio riservato «{m.group(0)}»")

    # ------------------------------------------------------ struttura e temi
    for p, s in sorgenti.items():
        if 'lang="it"' not in s:
            problemi.append(f"{p}: lingua non dichiarata")
        if 'data-tema="scuro"' not in s:
            problemi.append(f"{p}: tema predefinito non impostato prima della pittura")
        if "data-theme-toggle" not in s:
            problemi.append(f"{p}: manca l'interruttore del tema")
        if s.count("<h1") != 1:
            problemi.append(f"{p}: {s.count('<h1')} titoli di primo livello invece di uno")
        if 'rel="canonical"' not in s or 'property="og:image"' not in s:
            problemi.append(f"{p}: metadati social incompleti")

    # ------------------------------------------------------------ sitemap
    sm = (BASE / "sitemap.xml").read_text(encoding="utf8")
    for p in PAGINE:
        atteso = "/" if p == "index.html" else "/" + p
        if atteso not in sm:
            problemi.append(f"sitemap.xml: manca {atteso}")

    print()
    if note:
        print("NOTE")
        for x in note:
            print("  ..  " + x)
        print()
    if problemi:
        print("PROBLEMI")
        for x in problemi:
            print("  KO  " + x)
        return 1
    print("PROBLEMI: nessuno")
    return 0


if __name__ == "__main__":
    sys.exit(main())
