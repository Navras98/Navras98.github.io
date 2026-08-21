#!/usr/bin/env python3
"""Controlli statici sulle tre direzioni visive (a/, b/, c/).

Conta le parole VISIBILI della home (tutto: menu, testo, piede, etichette),
cerca le frasi bandite, i trattini lunghi, i dettagli riservati e i riferimenti
rotti. Uscita 0 se tutto passa, 1 se qualcosa fallisce.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

BASE = Path(__file__).resolve().parent
VARIANTI = ["a", "b", "c"]
TETTO_PAROLE = 120

BANDITE = [
    "soluzion", "innovativ", "trasform", "al passo con", "cutting edge",
    "esperienza pluriennale", "leader di settore", "su misura per te",
    "rivoluzion", "next-gen", "unleash", "elevate your", "seamless",
]

# nessun dettaglio riservato deve comparire nella pagina resa
RISERVATI = [
    "openclaw", "n8n", "hetepi", "launchd", "telegram", "whatsapp",
    "portafoglio", "dreame", "keychain", "portachiavi", ".py", ".mjs",
    "gateway", "cron", "instagram",
]

esiti = []


def segna(ok, testo):
    esiti.append(ok)
    print(("  ok  " if ok else "  KO  ") + testo)


class Testo(HTMLParser):
    """Estrae il testo visibile: salta script, style, svg e gli aria-hidden."""

    def __init__(self):
        super().__init__()
        self.pezzi = []
        self.salta = 0
        self.pila = []

    VUOTI = ("meta", "link", "br", "img", "input", "hr", "source")

    def handle_starttag(self, tag, attrs):
        # i tag vuoti non aprono niente: se qui alzassero il contatore,
        # nessun tag di chiusura lo riabbasserebbe e il testo sparirebbe tutto
        if tag in self.VUOTI:
            return
        d = dict(attrs)
        nascosto = (
            tag in ("script", "style", "svg", "head", "title")
            or d.get("aria-hidden") == "true"
            or "hidden" in d
        )
        self.pila.append(nascosto)
        if nascosto:
            self.salta += 1

    def handle_endtag(self, tag):
        if tag in self.VUOTI:
            return
        if self.pila:
            if self.pila.pop():
                self.salta -= 1

    def handle_data(self, dato):
        if self.salta == 0:
            self.pezzi.append(dato)

    def testo(self):
        return re.sub(r"\s+", " ", " ".join(self.pezzi)).strip()


def parole(t):
    return [p for p in re.split(r"[\s ]+", t) if re.search(r"[0-9A-Za-zÀ-ÿ]", p)]


for v in VARIANTI:
    pagina = BASE / v / "index.html"
    if not pagina.exists():
        segna(False, f"{v}/: index.html mancante")
        continue
    grezzo = pagina.read_text(encoding="utf8")

    p = Testo()
    p.feed(grezzo)
    visibile = p.testo()
    n = len(parole(visibile))
    # un conteggio a zero non e un conteggio buono: e un estrattore rotto.
    # Senza questa riga, un parser guasto passerebbe come verde.
    segna(n >= 40, f"{v}/: l'estrattore ha letto davvero il testo ({n} parole, minimo 40)")
    segna(n <= TETTO_PAROLE, f"{v}/: {n} parole visibili (tetto {TETTO_PAROLE})")

    basso = visibile.lower()
    trovate = [b for b in BANDITE if b in basso]
    segna(not trovate, f"{v}/: nessuna frase generica" + (f" (trovate {trovate})" if trovate else ""))

    riservati = [r for r in RISERVATI if r in grezzo.lower()]
    segna(not riservati, f"{v}/: nessun dettaglio riservato" + (f" ({riservati})" if riservati else ""))

    lunghi = [c for c in "—–" if c in visibile]
    segna(not lunghi, f"{v}/: nessun trattino lungo nel testo visibile")

    # biografia corretta: mai "ChatGPT dal lancio"
    segna("chatgpt" not in basso, f"{v}/: nessun riferimento a un prodotto di terzi")
    segna(
        "da quando è nata" in visibile,
        f"{v}/: la riga biografica esatta è presente",
    )

    # riferimenti locali risolvibili
    rotti = []
    for rif in re.findall(r'(?:href|src)="([^"#][^"]*)"', grezzo):
        if rif.startswith(("http", "mailto:", "data:")):
            continue
        bersaglio = (BASE / v / rif).resolve()
        if not bersaglio.exists():
            rotti.append(rif)
    segna(not rotti, f"{v}/: tutti i riferimenti locali esistono" + (f" (rotti {rotti})" if rotti else ""))

    # nessun carattere giocoso rimasto
    segna("Bricolage" not in grezzo, f"{v}/: Bricolage Grotesque rimosso")

    # un solo h1
    segna(len(re.findall(r"<h1", grezzo)) == 1, f"{v}/: un solo titolo di primo livello")

    # tema chiaro dichiarato
    segna("data-tema='chiaro'" in (BASE / v / "stile.css").read_text(encoding="utf8"),
          f"{v}/: tema chiaro completo dichiarato nel foglio di stile")

    # prefers-reduced-motion presente
    segna("prefers-reduced-motion" in (BASE / v / "stile.css").read_text(encoding="utf8"),
          f"{v}/: percorso senza animazioni previsto")

buoni = sum(1 for e in esiti if e)
print(f"\n{buoni} su {len(esiti)} passati")
sys.exit(0 if buoni == len(esiti) else 1)
