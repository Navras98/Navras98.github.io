#!/usr/bin/env python3
"""Revisione del 21 agosto 2026 — passata 2: indirizzi leggibili.

Prima:  navras98.github.io/Agenti.dc.html   («dc» e' la sigla del programma
                                              con cui il sito e' stato generato)
Dopo:   navras98.github.io/agenti/

I vecchi indirizzi restano e rimandano ai nuovi, quindi nessun collegamento
gia' in giro si rompe. I percorsi di file e immagini diventano assoluti, perche'
le pagine ora vivono un livello piu' in basso.

Uso:  python3 strumenti/patch-02-indirizzi.py [--prova]
"""
import re
import shutil
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
PROVA = "--prova" in sys.argv
SITO = "https://navras98.github.io"

# vecchio file -> nuova cartella
MAPPA = {
    "Agenti.dc.html": "agenti",
    "Casi.dc.html": "casi",
    "Modelli.dc.html": "modelli",
    "Sicurezza.dc.html": "sicurezza",
    "Dati.dc.html": "dati",
    "Privacy.dc.html": "privacy-bridge",
    "Formazione.dc.html": "formazione",
    "Contatti.dc.html": "contatti",
    "Locali.dc.html": "modelli-in-locale",
    "Architettura.dc.html": "architettura",
    "Automazione.dc.html": "automazione",
    "Strumenti.dc.html": "strumenti",
    "Metodo.dc.html": "metodo",
}

RIMANDO = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titolo}</title>
<link rel="canonical" href="{sito}/{dove}/">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=/{dove}/">
<script>location.replace('/{dove}/');</script>
</head>
<body style="background:#0A0B0D;color:#9A9CA1;font-family:Geist,Helvetica,Arial,sans-serif;padding:48px">
<p>Questa pagina si e&#8217; spostata: <a href="/{dove}/" style="color:#FF3B2F">navras98.github.io/{dove}/</a></p>
</body>
</html>
"""


def assoluti(h):
    """I percorsi relativi vanno resi assoluti: la pagina scende di un livello."""
    h = h.replace('src="./support.js"', 'src="/support.js"')
    h = h.replace('src="./assets/', 'src="/assets/')
    h = re.sub(r'(href|src)="(assets/[^"]+)"', r'\1="/\2"', h)
    h = re.sub(r'href="(site\.webmanifest)"', r'href="/\1"', h)
    return h


def collegamenti(h):
    """Ogni riferimento a Nome.dc.html diventa /cartella/."""
    for vecchio, dove in MAPPA.items():
        h = h.replace(f'href="{vecchio}"', f'href="/{dove}/"')
        h = h.replace(f'href="/{vecchio}"', f'href="/{dove}/"')
    h = h.replace('href="Home.dc.html"', 'href="/"')
    return h


def canonico(h, dove):
    fine = f"{SITO}/{dove}/" if dove else f"{SITO}/"
    h = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{fine}">', h)
    h = re.sub(r'<meta property="og:url" content="[^"]*">',
               f'<meta property="og:url" content="{fine}">', h)
    return h


def main():
    fatti = []

    # 1. le pagine si spostano dentro una cartella con il loro nome
    for vecchio, dove in MAPPA.items():
        f = RADICE / vecchio
        if not f.exists():
            print(f"  saltata (assente): {vecchio}")
            continue
        h = f.read_text(encoding="utf-8")
        titolo = re.search(r"<title>(.*?)</title>", h, re.S)
        titolo = titolo.group(1).strip() if titolo else "Andrea Sforna AI"

        nuova = assoluti(collegamenti(canonico(h, dove)))
        if not PROVA:
            cartella = RADICE / dove
            cartella.mkdir(exist_ok=True)
            (cartella / "index.html").write_text(nuova, encoding="utf-8")
            f.write_text(RIMANDO.format(titolo=titolo, sito=SITO, dove=dove), encoding="utf-8")
        fatti.append(f"{vecchio}  ->  /{dove}/")

    # 2. le pagine che restano in radice aggiornano solo i collegamenti
    for nome, dove in (("index.html", ""), ("404.html", None)):
        f = RADICE / nome
        if not f.exists():
            continue
        h = f.read_text(encoding="utf-8")
        h = collegamenti(h)
        if dove is not None:
            h = canonico(h, dove)
        if not PROVA:
            f.write_text(h, encoding="utf-8")
        fatti.append(f"{nome}  (collegamenti aggiornati)")

    # 3. la mappa del sito indica i nuovi indirizzi
    sm = RADICE / "sitemap.xml"
    if sm.exists():
        h = sm.read_text(encoding="utf-8")
        for vecchio, dove in MAPPA.items():
            h = h.replace(f"{SITO}/{vecchio}", f"{SITO}/{dove}/")
        if not PROVA:
            sm.write_text(h, encoding="utf-8")
        fatti.append("sitemap.xml  (indirizzi aggiornati)")

    for r in fatti:
        print(f"  {'(prova) ' if PROVA else ''}{r}")
    print(f"\n  {len(fatti)} voci")


if __name__ == "__main__":
    main()
