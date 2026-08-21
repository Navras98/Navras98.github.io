#!/usr/bin/env python3
"""Estrae dalle pagine italiane ogni pezzo di testo che un lettore vede.

Non tocca il codice: salta <script> e <style>, prende i nodi di testo e le
poche proprieta' che finiscono sotto gli occhi (alt, aria-label, title,
placeholder) piu' le descrizioni della testa della pagina.

Ogni pezzo esce con un numero d'ordine stabile: la traduzione torna indietro
con lo stesso numero e viene rimessa esattamente dov'era. Cosi' la struttura
del documento non passa mai dalle mani di chi traduce.

    python3 .collaudo/i18n_estrai.py            # scrive .collaudo/i18n/*.json
"""
import json
import os
import re
import sys

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUORI = os.path.join(os.path.dirname(os.path.abspath(__file__)), "i18n")

PAGINE = [
    "index.html",
    "agenti/index.html",
    "architettura/index.html",
    "automazione/index.html",
    "casi/index.html",
    "contatti/index.html",
    "dati/index.html",
    "formazione/index.html",
    "metodo/index.html",
    "modelli-in-locale/index.html",
    "modelli/index.html",
    "privacy-bridge/index.html",
    "sicurezza/index.html",
    "strumenti/index.html",
]

# proprieta' che contengono testo per una persona
ATTR_TESTO = ("alt", "aria-label", "title", "placeholder", "data-etichetta")

# meta della testa: solo queste, le altre sono indirizzi o numeri
META_TESTO = {
    ("name", "description"),
    ("property", "og:title"),
    ("property", "og:description"),
    ("property", "og:image:alt"),
    ("name", "twitter:title"),
    ("name", "twitter:description"),
}

# campi di schema.org che sono prosa e non identificatori
LD_TESTO = {
    "name", "description", "jobTitle", "headline", "alternateName",
    "abstract", "text", "caption", "knowsAbout", "slogan", "about",
    "areaServed", "serviceType", "itemListElement",
}

HA_LETTERA = re.compile(r"[A-Za-zÀ-ÿ]")


def _salta_blocchi(testo):
    """Intervalli (inizio, fine) in cui non si traduce.

    Oltre a script e style c'e' il tasto di scambio lingua: lo aggiunge la
    costruzione, non l'autore. Se entrasse fra i pezzi, la seconda volta che
    si ricostruisce il sito tutti i numeri d'ordine slitterebbero di uno e le
    traduzioni finirebbero una riga piu' in la'.
    """
    fuori = []
    for m in re.finditer(r"<(script|style)\b[^>]*>([\s\S]*?)</\1\s*>", testo, re.I):
        fuori.append((m.start(2), m.end(2)))
    for m in re.finditer(r"<a\b[^>]*\bdata-lingua\b[\s\S]*?</a\s*>", testo, re.I):
        fuori.append((m.start(), m.end()))
    return fuori


def _dentro(pos, intervalli):
    return any(a <= pos < b for a, b in intervalli)


def estrai(html):
    """Ritorna (pezzi, mappa) — pezzi: lista di dict con id/testo/tipo."""
    saltare = _salta_blocchi(html)
    pezzi = []

    # 1. nodi di testo: tutto cio' che sta fra > e <
    for m in re.finditer(r">([^<>]+)<", html):
        grezzo = m.group(1)
        if _dentro(m.start(1), saltare):
            continue
        if not HA_LETTERA.search(grezzo):
            continue
        nudo = grezzo.strip()
        if not nudo:
            continue
        pezzi.append({
            "tipo": "testo",
            "inizio": m.start(1),
            "fine": m.end(1),
            "testo": nudo,
            "prima": grezzo[: len(grezzo) - len(grezzo.lstrip())],
            "dopo": grezzo[len(grezzo.rstrip()):],
        })

    # 2. proprieta' visibili
    for attr in ATTR_TESTO:
        for m in re.finditer(r'\b%s="([^"]*)"' % re.escape(attr), html, re.I):
            if _dentro(m.start(1), saltare):
                continue
            v = m.group(1).strip()
            if not v or not HA_LETTERA.search(v):
                continue
            pezzi.append({
                "tipo": "attributo:" + attr,
                "inizio": m.start(1),
                "fine": m.end(1),
                "testo": v,
                "prima": "",
                "dopo": "",
            })

    # 3. meta della testa
    for m in re.finditer(r"<meta\b[^>]*>", html, re.I):
        tag = m.group(0)
        chiave = None
        for k in ("name", "property"):
            mk = re.search(r'\b%s="([^"]*)"' % k, tag, re.I)
            if mk and (k, mk.group(1)) in META_TESTO:
                chiave = (k, mk.group(1))
                break
        if not chiave:
            continue
        mc = re.search(r'\bcontent="([^"]*)"', tag, re.I)
        if not mc:
            continue
        pezzi.append({
            "tipo": "meta:" + chiave[1],
            "inizio": m.start() + mc.start(1),
            "fine": m.start() + mc.end(1),
            "testo": mc.group(1),
            "prima": "",
            "dopo": "",
        })

    # ordina per posizione e assegna i numeri
    pezzi.sort(key=lambda p: p["inizio"])
    # scarta sovrapposizioni (non dovrebbero esistere, ma meglio accorgersene)
    puliti = []
    ultimo = -1
    for p in pezzi:
        if p["inizio"] < ultimo:
            print("  ATTENZIONE sovrapposizione a %d: %r" % (p["inizio"], p["testo"][:40]))
            continue
        p["id"] = len(puliti)
        puliti.append(p)
        ultimo = p["fine"]
    return puliti


def json_ld_pezzi(html):
    """I campi di prosa dentro i blocchi schema.org, con percorso puntato."""
    fuori = []
    for m in re.finditer(
        r'<script type="application/ld\+json">([\s\S]*?)</script>', html, re.I
    ):
        try:
            dati = json.loads(m.group(1))
        except ValueError:
            continue
        raccolta = {}

        def scendi(nodo, percorso):
            if isinstance(nodo, dict):
                for k, v in nodo.items():
                    scendi(v, percorso + [k])
            elif isinstance(nodo, list):
                for i, v in enumerate(nodo):
                    scendi(v, percorso + [str(i)])
            elif isinstance(nodo, str):
                chiave = next((p for p in reversed(percorso) if not p.isdigit()), "")
                if chiave in LD_TESTO and HA_LETTERA.search(nodo) and not nodo.startswith("http"):
                    raccolta[".".join(percorso)] = nodo

        scendi(dati, [])
        fuori.append({"inizio": m.start(1), "fine": m.end(1), "campi": raccolta})
    return fuori


def main():
    os.makedirs(FUORI, exist_ok=True)
    totale = 0
    riepilogo = {}
    for pag in PAGINE:
        percorso = os.path.join(RADICE, pag)
        html = open(percorso, encoding="utf-8").read()
        pezzi = estrai(html)
        ld = json_ld_pezzi(html)
        nome = pag.replace("/index.html", "").replace("index.html", "home")
        fuori = {
            "pagina": pag,
            "pezzi": [{"id": p["id"], "tipo": p["tipo"], "it": p["testo"]} for p in pezzi],
            "schema": [b["campi"] for b in ld],
        }
        with open(os.path.join(FUORI, nome + ".json"), "w", encoding="utf-8") as f:
            json.dump(fuori, f, ensure_ascii=False, indent=1)
        n_ld = sum(len(b["campi"]) for b in ld)
        parole = sum(len(p["testo"].split()) for p in pezzi)
        riepilogo[nome] = (len(pezzi), n_ld, parole)
        totale += parole
        print("  %-22s %4d pezzi  %3d campi schema  %5d parole" % (nome, len(pezzi), n_ld, parole))
    print("\n  totale %d parole da tradurre" % totale)
    return 0


if __name__ == "__main__":
    sys.exit(main())
