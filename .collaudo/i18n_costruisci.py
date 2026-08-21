#!/usr/bin/env python3
"""Costruisce le pagine inglesi sotto /en/ rimettendo le traduzioni al loro posto.

Chi traduce non vede mai un tag: riceve una lista numerata di frasi e rimanda
indietro la stessa lista. Questo script rimette ogni frase esattamente dove
stava, dalla fine verso l'inizio, cosi' le posizioni non si spostano.

Modi:
    --prova     rimette il testo ITALIANO al suo posto e confronta con
                l'originale. Se non torna identico byte per byte, la
                traduzione non si fa: vuol dire che il meccanismo perde pezzi.
    (default)   legge .collaudo/i18n/<pagina>.en.json e scrive en/<pagina>/
"""
import json
import os
import re
import shutil
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
DENTRO = os.path.join(QUI, "i18n")
sys.path.insert(0, QUI)
from i18n_estrai import PAGINE, estrai, json_ld_pezzi  # noqa: E402

SITO = "https://navras98.github.io"

# indirizzi interni: cartella italiana -> cartella inglese.
# Un inglese che legge /en/sicurezza/ capisce di essere in una traduzione a
# meta'. L'ordine conta: "modelli-in-locale" prima di "modelli", altrimenti
# la sostituzione piu' corta mangia la piu' lunga.
CARTELLE = [
    ("modelli-in-locale", "local-models"),
    ("privacy-bridge", "privacy-bridge"),
    ("architettura", "architecture"),
    ("automazione", "automation"),
    ("formazione", "training"),
    ("sicurezza", "security"),
    ("strumenti", "tools"),
    ("contatti", "contact"),
    ("modelli", "models"),
    ("agenti", "agents"),
    ("metodo", "method"),
    ("casi", "case-studies"),
    ("dati", "data"),
]
IN_INGLESE = dict(CARTELLE)

ANCORA_TEMA = '<button type="button" data-tema-btn'
ANCORA_PANNELLO = "</a>\n    </div>\n  </div>\n</header>"


def scudo_testo(s):
    """Protegge i caratteri che romperebbero il documento, senza toccare
    le entita' gia' scritte (&nbsp;, &amp;, &#8230; restano com'erano)."""
    s = re.sub(r"&(?!#?\w+;)", "&amp;", s)
    return s.replace("<", "&lt;").replace(">", "&gt;")


def scudo_attributo(s):
    return scudo_testo(s).replace('"', "&quot;")


def rimetti(html, pezzi, nuovo_per_id):
    """Sostituisce dal fondo verso l'alto: gli indici restano validi."""
    fuori = html
    for p in sorted(pezzi, key=lambda x: x["inizio"], reverse=True):
        if p["id"] not in nuovo_per_id:
            continue
        testo = nuovo_per_id[p["id"]]
        if p["tipo"].startswith("attributo:") or p["tipo"].startswith("meta:"):
            val = scudo_attributo(testo)
        else:
            val = p["prima"] + scudo_testo(testo) + p["dopo"]
        fuori = fuori[: p["inizio"]] + val + fuori[p["fine"]:]
    return fuori


def rimetti_schema(html, blocchi, traduzioni):
    """Riscrive i blocchi schema.org con i campi tradotti."""
    for blocco, campi in sorted(
        zip(blocchi, traduzioni), key=lambda x: x[0]["inizio"], reverse=True
    ):
        grezzo = html[blocco["inizio"]: blocco["fine"]]
        dati = json.loads(grezzo)

        def posa(nodo, percorso):
            if isinstance(nodo, dict):
                for k, v in list(nodo.items()):
                    p = percorso + [k]
                    chiave = ".".join(p)
                    if isinstance(v, str) and chiave in campi:
                        nodo[k] = campi[chiave]
                    else:
                        posa(v, p)
            elif isinstance(nodo, list):
                for i, v in enumerate(nodo):
                    p = percorso + [str(i)]
                    chiave = ".".join(p)
                    if isinstance(v, str) and chiave in campi:
                        nodo[i] = campi[chiave]
                    else:
                        posa(v, p)

        posa(dati, [])
        html = (
            html[: blocco["inizio"]]
            + json.dumps(dati, ensure_ascii=False, separators=(",", ":"))
            + html[blocco["fine"]:]
        )
    return html


def indirizzi_inglesi(html):
    """Ogni collegamento interno punta al gemello inglese."""
    for it, en in CARTELLE:
        html = html.replace('href="/%s/"' % it, 'href="/en/%s/"' % en)
    html = re.sub(r'href="/"(?![^<>]*hreflang="it")', 'href="/en/"', html)
    return html


def testa_inglese(html, coda, coda_en):
    """lang, canonico, lingua sociale, e le due dichiarazioni hreflang."""
    html = html.replace('<html lang="it">', '<html lang="en">', 1)
    html = html.replace('content="it_IT"', 'content="en_US"', 1)
    it_url = SITO + "/" + (coda + "/" if coda else "")
    en_url = SITO + "/en/" + (coda_en + "/" if coda_en else "")
    html = re.sub(
        r'<link rel="canonical" href="[^"]*">',
        '<link rel="canonical" href="%s">' % en_url,
        html, count=1,
    )
    html = re.sub(
        r'<meta property="og:url" content="[^"]*">',
        '<meta property="og:url" content="%s">' % en_url,
        html, count=1,
    )
    alternate = (
        '<link rel="alternate" hreflang="it" href="%s">\n'
        '<link rel="alternate" hreflang="en" href="%s">\n'
        '<link rel="alternate" hreflang="x-default" href="%s">\n' % (it_url, en_url, it_url)
    )
    html = html.replace('<link rel="canonical"', alternate + '<link rel="canonical"', 1)
    return html


def scambio_lingua(html, verso, coda, coda_en):
    """Il modo di passare all'altra lingua, in due posti diversi.

    Sopra i 480px sta in testa alla pagina, accanto al tasto del tema. Sotto,
    no: su un telefono da 320px la riga in testa gia' conteneva marchio, tema
    e menu, e un quarto elemento la faceva sfondare di 44px, portando fuori
    schermo proprio il tasto Menu. Sotto i 480px la lingua si legge per esteso
    dentro il pannello del menu, dove c'e' spazio per dire "English" invece di
    "EN". Le due copie non convivono mai: una delle due e' sempre nascosta.
    """
    if verso == "en":
        href = "/en/" + (coda_en + "/" if coda_en else "")
        sigla, disteso, etichetta, lang = "EN", "English", "Read this page in English", "en"
    else:
        href = "/" + (coda + "/" if coda else "")
        sigla, disteso, etichetta, lang = "IT", "Italiano", "Leggi questa pagina in italiano", "it"

    # il segno da cercare e' il tasto, non la parola hreflang: quella compare
    # gia' nelle dichiarazioni della testa, e cercandola il tasto non si mette
    if "data-lingua" in html:
        return html

    tasto = (
        '<a data-lingua href="%s" hreflang="%s" lang="%s" aria-label="%s" '
        'style="padding:7px 12px;border:1px solid var(--filo1);color:var(--t2);'
        "font:500 10.5px 'JetBrains Mono',monospace;letter-spacing:.09em;"
        'text-transform:uppercase" style-hover="border-color:var(--filo2);color:var(--t1)">%s</a>\n      '
        % (href, lang, lang, etichetta, sigla)
    )
    html = html.replace(ANCORA_TEMA, tasto + ANCORA_TEMA, 1)

    voce = (
        '</a>\n      <a data-lingua-menu href="%s" hreflang="%s" lang="%s" '
        'aria-label="%s" style="color:var(--acc)">%s</a>\n    </div>\n  </div>\n</header>'
        % (href, lang, lang, etichetta, disteso)
    )
    return html.replace(ANCORA_PANNELLO, voce, 1)


def coda_di(pagina):
    return pagina.replace("/index.html", "").replace("index.html", "")


def pagina_nuda(html):
    """Toglie quello che ha aggiunto la costruzione precedente.

    Senza questo, ricostruire due volte di fila non da' lo stesso risultato:
    la pagina inglese eredita il tasto EN della pagina italiana e le
    dichiarazioni hreflang si duplicano. Un attrezzo che non e' ripetibile
    non e' un attrezzo, e' un colpo di fortuna.
    """
    html = re.sub(r'\s*<a\b[^>]*\bdata-lingua\b[^>]*>[\s\S]*?</a\s*>', "", html)
    html = re.sub(r'\s*<a\b[^>]*\bdata-lingua-menu\b[^>]*>[\s\S]*?</a\s*>', "", html)
    html = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?', "", html)
    # il tasto in testa stava su una riga sua: senza, resta l'indentazione
    html = html.replace('<button type="button" data-tema-btn',
                        '\n      <button type="button" data-tema-btn', 1)
    html = html.replace('\n\n      <button type="button" data-tema-btn',
                        '\n      <button type="button" data-tema-btn', 1)
    return html


def prova():
    """Giro a vuoto: rimetto l'italiano e pretendo lo stesso file."""
    rossi = 0
    for pag in PAGINE:
        html = open(os.path.join(RADICE, pag), encoding="utf-8").read()
        pezzi = estrai(html)
        rifatto = rimetti(html, pezzi, {p["id"]: p["testo"] for p in pezzi})
        blocchi = json_ld_pezzi(html)
        rifatto2 = rimetti_schema(
            rifatto, blocchi, [b["campi"] for b in blocchi]
        )
        stato = "ok  " if rifatto == html else "ROSSO"
        if rifatto != html:
            rossi += 1
            for i in range(min(len(html), len(rifatto))):
                if html[i] != rifatto[i]:
                    print("    prima differenza a %d: %r vs %r"
                          % (i, html[i - 60:i + 60], rifatto[i - 60:i + 60]))
                    break
        # lo schema si riscrive compatto: basta che il senso torni
        senso = "ok" if json.loads(
            re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', rifatto2).group(1)
        ) == json.loads(
            re.search(r'<script type="application/ld\+json">([\s\S]*?)</script>', html).group(1)
        ) else "ROSSO"
        if senso == "ROSSO":
            rossi += 1
        print("  %-6s %-24s testo %s · schema %s" % ("", pag, stato, senso))
    print("\n  %d rossi" % rossi)
    return 1 if rossi else 0


def costruisci():
    mancanti = []
    for pag in PAGINE:
        nome = coda_di(pag) or "home"
        f = os.path.join(DENTRO, nome + ".en.json")
        if not os.path.exists(f):
            mancanti.append(nome)
    if mancanti:
        print("  manca la traduzione di: %s" % ", ".join(mancanti))
        return 1

    base = os.path.join(RADICE, "en")
    if os.path.isdir(base):
        shutil.rmtree(base)
    os.makedirs(base)

    for pag in PAGINE:
        nome = coda_di(pag) or "home"
        coda = coda_di(pag).rstrip("/")
        coda_en = IN_INGLESE.get(coda, coda)
        html = pagina_nuda(open(os.path.join(RADICE, pag), encoding="utf-8").read())
        tradotto = json.load(open(os.path.join(DENTRO, nome + ".en.json"), encoding="utf-8"))

        pezzi = estrai(html)
        per_id = {int(k): v for k, v in tradotto["pezzi"].items()}
        senza = [p["id"] for p in pezzi if p["id"] not in per_id]
        if senza:
            print("  %s: %d pezzi senza traduzione (%s...)"
                  % (nome, len(senza), senza[:5]))
        fuori = rimetti(html, pezzi, per_id)

        # le posizioni si ricalcolano sul documento gia' tradotto: il testo
        # sostituito ha lunghezze diverse e gli indici di prima non valgono piu'
        blocchi = json_ld_pezzi(fuori)
        fuori = rimetti_schema(fuori, blocchi, tradotto.get("schema", [{}] * len(blocchi)))

        fuori = indirizzi_inglesi(fuori)
        fuori = testa_inglese(fuori, coda, coda_en)
        fuori = scambio_lingua(fuori, "it", coda, coda_en)

        dove = os.path.join(base, coda_en) if coda_en else base
        os.makedirs(dove, exist_ok=True)
        with open(os.path.join(dove, "index.html"), "w", encoding="utf-8") as f:
            f.write(fuori)
        print("  scritto en/%s" % (coda_en + "/" if coda_en else ""))

    # e il tasto EN sulle pagine italiane
    for pag in PAGINE:
        coda = coda_di(pag).rstrip("/")
        coda_en = IN_INGLESE.get(coda, coda)
        percorso = os.path.join(RADICE, pag)
        originale = open(percorso, encoding="utf-8").read()
        html = pagina_nuda(originale)
        nuovo = scambio_lingua(html, "en", coda, coda_en)
        it_url = SITO + "/" + (coda + "/" if coda else "")
        en_url = SITO + "/en/" + (coda_en + "/" if coda_en else "")
        if 'hreflang="en"' not in nuovo.split("</head>")[0]:
            alternate = (
                '<link rel="alternate" hreflang="it" href="%s">\n'
                '<link rel="alternate" hreflang="en" href="%s">\n'
                '<link rel="alternate" hreflang="x-default" href="%s">\n'
                % (it_url, en_url, it_url)
            )
            nuovo = nuovo.replace('<link rel="canonical"', alternate + '<link rel="canonical"', 1)
        if nuovo != originale:
            open(percorso, "w", encoding="utf-8").write(nuovo)
            print("  tasto EN su %s" % pag)
    return 0


if __name__ == "__main__":
    sys.exit(prova() if "--prova" in sys.argv else costruisci())
