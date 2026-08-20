#!/usr/bin/env python3
"""Controlli statici sul sito generato: parole per pagina, collegamenti, riservatezza."""

import html
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
PAGES = [
    "index.html",
    "competenze.html",
    "sicurezza.html",
    "dati.html",
    "modelli.html",
    "metodo.html",
    "contatti.html",
]
INTERNE = [p for p in PAGES if p != "index.html"]
MINIMO = 700

BANDITE = [
    "soluzioni innovative",
    "trasformo il tuo business",
    "al passo con l'ia",
    "esperienza a 360",
    "360 gradi",
    "chiavi in mano",  # ammesso solo fra virgolette, controllato a parte
]

EMOJI = re.compile(
    "[\U0001f300-\U0001faff\U00002700-\U000027bf\U0001f1e6-\U0001f1ff☀-⛿]"
)


def testo_main(sorgente: str) -> str:
    m = re.search(r"<main[^>]*>(.*?)</main>", sorgente, re.S)
    corpo = m.group(1) if m else ""
    corpo = re.sub(r"<script.*?</script>", " ", corpo, flags=re.S)
    corpo = re.sub(r"<[^>]+>", " ", corpo)
    return html.unescape(corpo)


def parole(t: str) -> int:
    return len([w for w in re.split(r"\s+", t.strip()) if re.search(r"[A-Za-zÀ-ÿ0-9]", w)])


def main() -> int:
    problemi = []
    conteggi = {}

    for nome in PAGES:
        f = BASE / nome
        if not f.exists():
            problemi.append(f"manca il file {nome}")
            continue
        src = f.read_text(encoding="utf-8")
        t = testo_main(src)
        n = parole(t)
        conteggi[nome] = n

        if nome in INTERNE and n < MINIMO:
            problemi.append(f"{nome}: {n} parole, sotto il minimo di {MINIMO}")

        # collegamenti interni
        for href in re.findall(r'href="([^"]+)"', src):
            if href.startswith(("http", "mailto:", "#")):
                continue
            target = href.split("#")[0]
            if not target:
                continue
            if not (BASE / target).exists():
                problemi.append(f"{nome}: collegamento rotto -> {href}")

        # menu completo e stato attivo
        for voce in PAGES:
            if f'href="{voce}"' not in src:
                problemi.append(f"{nome}: il menu non porta a {voce}")
        if src.count('aria-current="page"') != 2:  # desktop + mobile
            problemi.append(f"{nome}: stato attivo del menu assente o duplicato")

        # meta uniche
        for tag in ("<title>", 'name="description"', 'rel="canonical"'):
            if tag not in src:
                problemi.append(f"{nome}: manca {tag}")

        basso = t.lower()
        for frase in BANDITE:
            if frase in basso and frase != "chiavi in mano":
                problemi.append(f"{nome}: frase bandita «{frase}»")
        if EMOJI.search(t):
            problemi.append(f"{nome}: contiene emoji")

    # titoli e descrizioni tutte diverse
    titoli = [re.search(r"<title>(.*?)</title>", (BASE / p).read_text(encoding="utf-8")).group(1) for p in PAGES]
    desc = [
        re.search(r'name="description" content="(.*?)"', (BASE / p).read_text(encoding="utf-8")).group(1)
        for p in PAGES
    ]
    if len(set(titoli)) != len(titoli):
        problemi.append("titoli duplicati fra pagine")
    if len(set(desc)) != len(desc):
        problemi.append("descrizioni duplicate fra pagine")

    print("PAROLE (contenuto di <main>)")
    for nome, n in conteggi.items():
        segno = "ok " if (nome == "index.html" or n >= MINIMO) else "BASSO"
        print(f"  {segno} {nome:18} {n}")

    print()
    if problemi:
        print(f"PROBLEMI: {len(problemi)}")
        for p in problemi:
            print("  -", p)
        return 1
    print("PROBLEMI: nessuno")
    return 0


if __name__ == "__main__":
    sys.exit(main())
