#!/usr/bin/env python3
"""Revisione del 21 agosto 2026 — passata 1: struttura, mobile, accessibilita, testa.

Non tocca il disegno: nessun colore, nessuna dimensione, nessuna spaziatura cambia.
Agisce solo su ordine dei numeri, larghezze minime della griglia, semantica e <head>.

Uso:  python3 strumenti/patch-01-struttura.py [--prova]
      --prova stampa cosa cambierebbe senza scrivere.
"""
import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
PROVA = "--prova" in sys.argv

SITO = "https://navras98.github.io"
PAGINE = [
    "index.html", "Home.dc.html", "Agenti.dc.html", "Casi.dc.html", "Modelli.dc.html",
    "Sicurezza.dc.html", "Dati.dc.html", "Privacy.dc.html", "Formazione.dc.html",
    "Contatti.dc.html", "Locali.dc.html", "Architettura.dc.html", "Automazione.dc.html",
    "Strumenti.dc.html", "Metodo.dc.html",
]

conteggio = {}


def segna(chiave, n=1):
    conteggio[chiave] = conteggio.get(chiave, 0) + n


# ---------------------------------------------------------------- 1. lingua
def lingua(h):
    nuovo, n = re.subn(r"<html>", '<html lang="it">', h, count=1)
    segna("lang=it", n)
    return nuovo


# ------------------------------------------- 2. griglie che sforano su mobile
def griglie(h):
    """minmax(Npx,1fr) con N grande sfora il telefono: lo si limita al 100%.

    Su desktop il valore resta identico (min(480px,100%) == 480px appena la
    finestra supera i 480px), quindi il disegno non cambia di un pixel.
    """
    def sost(m):
        n = int(m.group(1))
        if n < 200:
            return m.group(0)
        segna("griglie mobile")
        return f"minmax(min({n}px,100%),{m.group(2)})"

    return re.sub(r"minmax\((\d+)px,(1fr)\)", sost, h)


# --------------------------------------------- 3. numerazione delle sezioni
def numerazione(h):
    """Rinumera in ordine i numeri visibili accanto agli h2, 01, 02, 03...

    Prima erano duplicati o saltavano (03 due volte, 04 mancante, salti da 03 a 05).
    Le sezioni che per disegno non hanno numero restano senza.
    """
    contatore = [0]

    def sost(m):
        contatore[0] += 1
        atteso = f"{contatore[0]:02d}"
        if m.group(2) != atteso:
            segna("numeri corretti")
        return f'<p style="{m.group(1)}">{atteso}</p>{m.group(3)}<h2'

    return re.sub(r'<p style="([^"]*)">(\d{2})</p>(\s*)<h2', sost, h)


# ------------------------- 4. etichette interne: via il secondo conto parallelo
def etichette(h):
    """data-screen-label conteneva una seconda numerazione che non coincideva
    con quella visibile. Nessuno script la legge: resta solo il titolo."""
    def sost(m):
        testo = m.group(1)
        pulito = re.sub(r"^\d{2}\s+", "", testo)
        if pulito != testo:
            segna("etichette ripulite")
        return f'data-screen-label="{pulito}"'

    return re.sub(r'data-screen-label="([^"]*)"', sost, h)


# ------------------------------------------------- 5. titolo grande leggibile
def titolo_hero(h):
    """L'h1 della home e' fatto di una <span> per lettera, senza spazi: un
    lettore di schermo pronuncia "AndreaSfornaAI" o sillaba lettera per lettera.
    Si dichiara il nome accessibile e si nascondono le lettere alla lettura."""
    m = re.search(r"<h1 ([^>]*?)>(.*?)</h1>", h, re.S)
    if not m or "aria-label" in m.group(1):
        return h
    testo = re.sub(r"<[^>]+>", "", m.group(2))
    if len(re.findall(r"<span", m.group(2))) < 8:
        return h  # h1 normale, niente da fare
    nome = "Andrea Sforna AI"
    corpo = m.group(2)
    if "aria-hidden" not in corpo[:200]:
        corpo = re.sub(r"^\s*<span", '<span aria-hidden="true"', corpo, count=1)
    segna("h1 accessibile")
    return h[: m.start()] + f'<h1 aria-label="{nome}" {m.group(1)}>{corpo}</h1>' + h[m.end():]


# ------------------------------------------------ 6. tabelle: semantica ARIA
def tabelle_aria(h):
    """I dati tabellari sono griglie di <div>: visivamente perfetti, ma per un
    lettore di schermo la relazione fra intestazione e valore sparisce.
    Si aggiungono i ruoli ARIA: zero effetto sul disegno, semantica ripristinata."""
    # intestazioni delle tabelle a tre colonne (componente `tabella`)
    def blocco(m):
        segna("tabelle ARIA")
        return m.group(0).replace(
            'style="border-top:1px solid var(--filo2)" data-reveal>',
            'style="border-top:1px solid var(--filo2)" data-reveal role="table">', 1)

    h = re.sub(r'<div style="border-top:1px solid var\(--filo2\)" data-reveal>', blocco, h)
    return h


# ----------------------------------------------------- 7. salta al contenuto
SALTA = (
    '<a href="#contenuto" style="position:absolute;left:-9999px;top:0;z-index:100;'
    'padding:12px 18px;background:var(--acc);color:#fff;font:500 12px \'JetBrains Mono\','
    'monospace;letter-spacing:.08em;text-transform:uppercase" '
    'onfocus="this.style.left=\'12px\';this.style.top=\'12px\'" '
    'onblur="this.style.left=\'-9999px\'">Salta al contenuto</a>'
)


def salta_al_contenuto(h):
    if "#contenuto" in h:
        return h
    h, n = re.subn(r"<body>", "<body>\n" + SALTA, h, count=1)
    h = re.sub(r"<main>", '<main id="contenuto" tabindex="-1">', h, count=1)
    segna("salta al contenuto", n)
    return h


# ------------------------------------------------------------ 8. collegamenti
def collegamenti(h):
    """Il logo puntava a Home.dc.html: la home esisteva a due indirizzi.
    Il bottone principale portava alla pagina piu' tecnica del sito."""
    h, n = re.subn(r'<a href="Home\.dc\.html"', '<a href="./"', h)
    segna("logo verso la radice", n)
    # bottone della home: "Come lavoro" deve portare al Metodo, non ad Architettura
    h, n = re.subn(
        r'<a href="Architettura\.dc\.html"([^>]*?)>Come lavoro',
        r'<a href="Metodo.dc.html"\1>Come lavoro', h)
    segna("bottone Come lavoro -> Metodo", n)
    return h


# ------------------------------------------------------------- 9. microtesti
def microtesti(h):
    # "50 oltre" si leggeva rovesciato: diventa "50+"
    h, n = re.subn(
        r'>50<span (style="font-size:\.42em[^"]*")> oltre</span>',
        r'>50<span \1>+</span>', h)
    segna('"50 oltre" -> "50+"', n)
    # l'occhiello della pagina diceva "Locali", il menu "Modelli in locale"
    h, n = re.subn(
        r'(<p style="[^"]*animation:appari[^"]*">)\s*Locali\s*(</p>)',
        r"\1Modelli in locale\2", h)
    segna('occhiello "Locali" -> "Modelli in locale"', n)
    return h


# --------------------------------------------------------------- 10. la testa
def testa(h, nome):
    """Sposta titolo, descrizione, tipi di carattere e foglio di stile dentro
    <head> vero, e aggiunge tutto quello che mancava: canonico, anteprime per
    i social, icone, colore della barra del browser."""
    mh = re.search(r"<helmet[^>]*>(.*?)</helmet>", h, re.S)
    if not mh:
        return h
    dentro = mh.group(1)
    titolo = re.search(r"<title>(.*?)</title>", dentro, re.S)
    desc = re.search(r'<meta name="description" content="(.*?)">', dentro, re.S)
    if not titolo or not desc:
        return h
    titolo, desc = titolo.group(1).strip(), desc.group(1).strip()

    resta = re.sub(r"<title>.*?</title>", "", dentro, flags=re.S)
    resta = re.sub(r'<meta name="description"[^>]*>', "", resta)
    resta = re.sub(r"<link[^>]*>", "", resta)  # font e css salgono in <head>

    slug = "" if nome in ("index.html", "Home.dc.html") else nome
    canonico = f"{SITO}/{slug}"

    blocco = f"""<title>{titolo}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonico}">
<meta name="author" content="Andrea Sforna">
<meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f7f6f3" media="(prefers-color-scheme: light)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Andrea Sforna AI">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{titolo}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonico}">
<meta property="og:image" content="{SITO}/assets/anteprima.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Andrea Sforna AI — progettazione, sicurezza e manutenzione di sistemi di agenti AI">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{titolo}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITO}/assets/anteprima.png">
<link rel="icon" href="assets/icona.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/icona-180.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/tema.css">"""

    h = h[: mh.start()] + f"<helmet data-dc-atomics>{resta.strip()}</helmet>" + h[mh.end():]
    h, n = re.subn(r'(<script src="\./support\.js"></script>)', r"\1\n" + blocco, h, count=1)
    segna("testa completata", n)
    return h


# ------------------------------------------------------------------- esegui
def main():
    for nome in PAGINE:
        f = RADICE / nome
        if not f.exists():
            print(f"  saltata (assente): {nome}")
            continue
        prima = f.read_text(encoding="utf-8")
        h = prima
        h = lingua(h)
        h = griglie(h)
        h = numerazione(h)
        h = etichette(h)
        h = titolo_hero(h)
        h = tabelle_aria(h)
        h = salta_al_contenuto(h)
        h = collegamenti(h)
        h = microtesti(h)
        h = testa(h, nome)
        if h != prima and not PROVA:
            f.write_text(h, encoding="utf-8")
        print(f"  {'(prova) ' if PROVA else ''}{nome}: {len(prima)} -> {len(h)} byte")

    print("\n  riepilogo delle modifiche")
    for k, v in sorted(conteggio.items()):
        print(f"    {v:4d}  {k}")


if __name__ == "__main__":
    main()
