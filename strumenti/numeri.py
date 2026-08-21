#!/usr/bin/env python3
"""I numeri della pagina Modelli hanno una sola fonte: assets/benchmark.json.

Questo strumento legge la pagina, ne estrae i numeri davvero pubblicati e li
confronta con il file. Se i due si scostano esce con codice 1 e dice dove.
Serve a impedire che la pagina resti indietro rispetto alla fonte senza che
nessuno se ne accorga.

Uso:
    python3 strumenti/numeri.py            # controlla e stampa lo scostamento
    python3 strumenti/numeri.py --silenzio # solo il codice di uscita
"""
import html as H
import json
import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
FONTE = RADICE / "assets" / "benchmark.json"
PAGINA = RADICE / "Modelli.dc.html"
SILENZIO = "--silenzio" in sys.argv

MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
        "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]

# una riga di grafico a barre: nome, barra, valore (con eventuale coda "· costo")
RIGA_BARRA = re.compile(
    r'white-space:nowrap">(?P<nome>[^<]+)</span>\s*'
    r'<span style="position:relative[^"]*">.*?</span>\s*'
    r'<span style="font:500 13px[^"]*">(?P<val>[\d.]+)'
    r'(?:<span style="color:var\(--t3\)">\s*·\s*(?P<coda>[^<]+)</span>)?</span>',
    re.S)

# una riga della tabella prezzi: modello, ingresso, uscita
RIGA_PREZZO = re.compile(
    r'<span data-num style="font:500 12px[^"]*">(?P<modello>[^<]+)</span>\s*'
    r'<span style="font-weight:500;font-size:clamp\(17px[^"]*">(?P<ing>[^<]+)</span>\s*'
    r'<span style="font-size:16px[^"]*">(?P<usc>[^<]+)</span>',
    re.S)


def pulisci(s):
    return H.unescape(s).replace(" ", " ").strip()


def visibile(html):
    h = re.sub(r"<(script|style).*?</\1>", " ", html, flags=re.S | re.I)
    h = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"\s+", " ", H.unescape(h))


def euro(v):
    return "$" + f"{v:.2f}".replace(".", ",")


def sezione(html, dallo, allo=None):
    """Ritaglia la porzione di pagina fra due titoli, per non confondere
    due grafici che hanno la stessa forma."""
    i = html.find(dallo)
    if i < 0:
        return ""
    j = html.find(allo, i) if allo else len(html)
    return html[i: j if j > 0 else len(html)]


def main():
    dati = json.loads(FONTE.read_text(encoding="utf-8"))
    html = PAGINA.read_text(encoding="utf-8")
    vis = visibile(html)
    guasti = []
    n = 0

    def esigi(etichetta, atteso):
        nonlocal n
        n += 1
        if atteso not in vis:
            guasti.append(f"{etichetta}: la pagina non dice «{atteso}»")

    # ---------------------------------------------- intestazione e provenienza
    ii = dati["indice_intelligenza"]
    esigi("indice/versione", f"Intelligence Index {ii['versione']}")
    esigi("indice/valutazioni", f"{ii['valutazioni']} valutazioni")
    esigi("indice/censiti", f"{ii['modelli_censiti']} modelli censiti")
    esigi("indice/in classifica", f"{ii['modelli_in_classifica']} in classifica")
    esigi("fonte", dati["fonte"])

    a, m, g = dati["letto"].split("-")
    data_estesa = f"{int(g)} {MESI[int(m) - 1]} {a}"
    esigi("data di lettura", data_estesa)

    # ------------------------------------- classifica dell'indice di intelligenza
    blocco = sezione(html, "Indice di intelligenza", "Intelligenza per euro speso")
    letti = [(pulisci(x["nome"]), x["val"], pulisci(x["coda"] or ""))
             for x in (mm.groupdict() for mm in RIGA_BARRA.finditer(blocco))]
    attesi = [(v["nome"], str(v["indice"]), v["costo_per_compito"]) for v in ii["valori"]]
    n += max(len(letti), len(attesi))

    if [r[0] for r in letti] != [r[0] for r in attesi]:
        soli_pagina = [r[0] for r in letti if r[0] not in {x[0] for x in attesi}]
        soli_file = [r[0] for r in attesi if r[0] not in {x[0] for x in letti}]
        if soli_pagina:
            guasti.append(f"classifica: nella pagina e non nel file → {', '.join(soli_pagina)}")
        if soli_file:
            guasti.append(f"classifica: nel file e non nella pagina → {', '.join(soli_file)}")
        if not soli_pagina and not soli_file:
            guasti.append("classifica: stessi modelli ma in ordine diverso fra file e pagina")
    for nome, val, coda in letti:
        atteso = next((x for x in attesi if x[0] == nome), None)
        if atteso and (val, coda) != (atteso[1], atteso[2]):
            guasti.append(
                f"classifica «{nome}»: la pagina dice {val} · {coda}, "
                f"il file dice {atteso[1]} · {atteso[2]}")

    # ---------------------------------------------- indice degli agenti di codice
    ac = dati["indice_agenti_codice"]
    esigi("agenti di codice/versione", ac["versione"])
    blocco = sezione(html, "Agenti di codice", "Come è costruito")
    letti = [(pulisci(x["nome"]), x["val"]) for x in (mm.groupdict() for mm in RIGA_BARRA.finditer(blocco))]
    attesi = [(v["nome"], str(v["indice"])) for v in ac["valori"]]
    n += max(len(letti), len(attesi))
    for nome, val in letti:
        atteso = next((x for x in attesi if x[0] == nome), None)
        if atteso is None:
            guasti.append(f"agenti di codice: «{nome}» sta nella pagina ma non nel file")
        elif val != atteso[1]:
            guasti.append(f"agenti di codice «{nome}»: pagina {val}, file {atteso[1]}")
    for nome, val in attesi:
        if nome not in {x[0] for x in letti}:
            guasti.append(f"agenti di codice: «{nome}» sta nel file ma non nella pagina")

    # -------------------------------------------- prezzi per milione di token
    blocco = sezione(html, "Prezzo per milione di token", "La cache non è un dettaglio")
    letti = [(pulisci(x["modello"]), pulisci(x["ing"]), pulisci(x["usc"]))
             for x in (mm.groupdict() for mm in RIGA_PREZZO.finditer(blocco))]
    attesi = [(p["modello"], euro(p["ingresso"]), euro(p["uscita"]))
              for p in dati["prezzi_per_milione_token"]]
    n += max(len(letti), len(attesi))

    for modello, ing, usc in letti:
        atteso = next((x for x in attesi if x[0] == modello), None)
        if atteso is None:
            guasti.append(f"prezzi: «{modello}» sta nella pagina ma non in benchmark.json")
        elif (ing, usc) != (atteso[1], atteso[2]):
            guasti.append(
                f"prezzi «{modello}»: pagina {ing} / {usc}, file {atteso[1]} / {atteso[2]}")
    for modello, ing, usc in attesi:
        if modello not in {x[0] for x in letti}:
            guasti.append(f"prezzi: «{modello}» sta nel file ma non nella pagina")

    # ------------------------------------------------------------------- esito
    if not SILENZIO:
        print(f"  fonte     {FONTE.relative_to(RADICE)}")
        print(f"  pagina    {PAGINA.relative_to(RADICE)}")
        print(f"  letto il  {data_estesa}")
        print(f"  controlli {n}")
        if guasti:
            print(f"\n  SCOSTAMENTI: {len(guasti)}")
            for s in guasti:
                print(f"    - {s}")
        else:
            print("\n  nessuno scostamento: la pagina dice quello che dice il file.")
    return 1 if guasti else 0


if __name__ == "__main__":
    sys.exit(main())
