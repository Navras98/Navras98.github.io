#!/usr/bin/env python3
"""Rigenera sitemap.xml dalle pagine che esistono davvero, in due lingue.

Un elenco scritto a mano di pagine che stanno gia' sul disco e' un doppione
che tace: il giorno che se ne aggiunge una, nessuno se ne accorge. Qui
l'elenco si deriva, e ogni indirizzo dichiara la sua gemella nell'altra
lingua con xhtml:link, che e' il modo in cui un motore capisce che non sono
due pagine in concorrenza ma la stessa pagina in due lingue.

    python3 .collaudo/mappa.py 2026-08-21
"""
import os
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, QUI)
from i18n_costruisci import IN_INGLESE, SITO  # noqa: E402
from i18n_estrai import PAGINE  # noqa: E402

# quanto conta ogni pagina, per chi indicizza
PESO = {
    "": "1.0", "agenti": "0.9", "casi": "0.9", "formazione": "0.9",
    "contatti": "0.9", "modelli": "0.8", "sicurezza": "0.8", "dati": "0.8",
    "privacy-bridge": "0.8", "metodo": "0.8", "modelli-in-locale": "0.7",
    "architettura": "0.7", "automazione": "0.7", "strumenti": "0.7",
}


def main():
    giorno = sys.argv[1] if len(sys.argv) > 1 else None
    if not giorno:
        print("  serve la data: python3 .collaudo/mappa.py AAAA-MM-GG")
        return 2

    righe = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
             '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    conto = 0
    for pag in PAGINE:
        it = pag.replace("/index.html", "").replace("index.html", "").rstrip("/")
        en = IN_INGLESE.get(it, it)
        it_url = SITO + "/" + (it + "/" if it else "")
        en_url = SITO + "/en/" + (en + "/" if en else "")
        # la gemella deve esistere sul disco, altrimenti non la si annuncia
        disco_en = os.path.join(RADICE, "en", en, "index.html") if en else os.path.join(RADICE, "en", "index.html")
        if not os.path.exists(disco_en):
            print("  manca en/%s: non la metto nella mappa" % en)
            continue
        for url in (it_url, en_url):
            righe.append("  <url>")
            righe.append("    <loc>%s</loc>" % url)
            righe.append('    <xhtml:link rel="alternate" hreflang="it" href="%s"/>' % it_url)
            righe.append('    <xhtml:link rel="alternate" hreflang="en" href="%s"/>' % en_url)
            righe.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % it_url)
            righe.append("    <lastmod>%s</lastmod>" % giorno)
            righe.append("    <priority>%s</priority>" % PESO.get(it, "0.7"))
            righe.append("  </url>")
            conto += 1
    righe.append("</urlset>")
    righe.append("")

    with open(os.path.join(RADICE, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(righe))
    print("  sitemap.xml rifatta: %d indirizzi, due lingue" % conto)
    return 0


if __name__ == "__main__":
    sys.exit(main())
