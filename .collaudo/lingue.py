#!/usr/bin/env python3
"""Controlla che le due lingue siano davvero due lingue, e che si trovino.

Non basta che esista una cartella /en/: un sito bilingue sbagliato e' peggio
di un sito in una lingua sola, perche' promette una cosa e ne mantiene meta'.
Qui si guardano cinque cose, e ognuna puo' diventare rossa da sola:

1. ogni pagina italiana ha la gemella inglese, e viceversa
2. le dichiarazioni hreflang si puntano a vicenda (se A dice B, B deve dire A)
3. la pagina inglese e' marcata lang="en" e la lingua sociale e' en_US
4. il tasto di scambio lingua porta a un indirizzo che esiste davvero
5. nel testo visibile inglese non e' rimasta prosa italiana

Il quinto controllo non cerca "parole che sembrano italiane": cerca parole
funzionali che in inglese non esistono (che, degli, perche', quando...). Un
nome proprio italiano non lo fa scattare, una frase dimenticata si'.

    python3 .collaudo/lingue.py [http://127.0.0.1:8899]
"""
import os
import re
import sys
import urllib.request

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
sys.path.insert(0, QUI)
from i18n_costruisci import IN_INGLESE, SITO  # noqa: E402
from i18n_estrai import PAGINE  # noqa: E402

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8899").rstrip("/")

# Parole di servizio italiane che in inglese non esistono. Fuori dall'elenco
# stanno di proposito "come", "per" e "dove": sono parole inglesi a tutti gli
# effetti ("cost per task", "the proposals come from"), e tenerle dentro fa
# suonare l'allarme su frasi corrette. Una spia che suona sempre non la guarda
# piu' nessuno.
SPIE = re.compile(
    r"\b(che|degli|delle|della|dello|dei|nel|nella|nelle|negli|perch[eé]|"
    r"quando|senza|anche|questo|questa|questi|queste|ogni|"
    r"sono|essere|fare|viene|vengono|pu[oò]|deve|devono|gli|una|"
    r"col|sul|sulla|sulle|tra|fra|mentre|oppure|"
    r"tutto|tutti|tutte|molto|pi[uù]|gi[aà]|ancora|quindi|per[oò])\b",
    re.I,
)

# eccezioni: testo che resta italiano di proposito
PERDONATE = {"privacy", "Privacy Bridge", "Andrea Sforna", "AI", "Nel"}

esiti = []


def segna(nome, stato, dettaglio=""):
    esiti.append((nome, stato))
    print("%-6s  %s%s" % ({"ok": "  ok", "ROSSO": "ROSSO", "ROTTO": "ROTTO"}[stato],
                          nome, "  — " + dettaglio if dettaglio else ""))


def prendi(percorso):
    try:
        with urllib.request.urlopen(BASE + percorso, timeout=8) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return None, str(e)


def solo_testo(html):
    b = re.sub(r"<(script|style)\b[\s\S]*?</\1>", " ", html, flags=re.I)
    b = re.sub(r"<[^>]+>", " ", b)
    b = re.sub(r"&[#\w]+;", " ", b)
    return re.sub(r"\s+", " ", b)


def coda_di(pagina):
    return pagina.replace("/index.html", "").replace("index.html", "").rstrip("/")


def main():
    coppie = []
    for pag in PAGINE:
        it = coda_di(pag)
        en = IN_INGLESE.get(it, it)
        coppie.append((("/" + it + "/") if it else "/",
                       ("/en/" + en + "/") if en else "/en/"))

    print("\n— le due lingue esistono e si trovano —\n")
    for it_url, en_url in coppie:
        s_it, h_it = prendi(it_url)
        s_en, h_en = prendi(en_url)
        nome = "%s  <->  %s" % (it_url, en_url)
        if s_it != 200 or s_en != 200:
            segna(nome, "ROSSO", "HTTP %s / %s" % (s_it, s_en))
            continue

        # 2. hreflang reciproci
        att_it = SITO + it_url
        att_en = SITO + en_url
        ok_it = ('hreflang="en" href="%s"' % att_en) in h_it
        ok_en = ('hreflang="it" href="%s"' % att_it) in h_en
        if not (ok_it and ok_en):
            segna(nome + " · hreflang", "ROSSO",
                  "it→en %s · en→it %s" % (ok_it, ok_en))
        else:
            segna(nome + " · hreflang", "ok")

        # 3. la pagina inglese si dichiara inglese
        if '<html lang="en">' not in h_en or 'content="en_US"' not in h_en:
            segna(en_url + " · lingua dichiarata", "ROSSO")
        else:
            segna(en_url + " · lingua dichiarata", "ok")

        # 3b. la pagina inglese non deve dichiararsi canonica in italiano
        can = re.search(r'<link rel="canonical" href="([^"]*)"', h_en)
        if not can or can.group(1) != att_en:
            segna(en_url + " · canonico", "ROSSO", can.group(1) if can else "assente")
        else:
            segna(en_url + " · canonico", "ok")

        # 4. il tasto di scambio porta da qualche parte
        for html, atteso, verso in ((h_it, en_url, "IT→EN"), (h_en, it_url, "EN→IT")):
            m = re.search(r'<a data-lingua href="([^"]*)"', html)
            if not m:
                segna(nome + " · tasto " + verso, "ROSSO", "tasto assente")
            elif m.group(1) != atteso:
                segna(nome + " · tasto " + verso, "ROSSO",
                      "punta a %s invece di %s" % (m.group(1), atteso))
            else:
                s, _ = prendi(m.group(1))
                segna(nome + " · tasto " + verso,
                      "ok" if s == 200 else "ROSSO", "" if s == 200 else "HTTP %s" % s)

        # 5. italiano rimasto nel testo inglese
        testo = solo_testo(h_en)
        trovate = [w for w in set(SPIE.findall(testo)) if w not in PERDONATE]
        if trovate:
            segna(en_url + " · italiano rimasto", "ROSSO",
                  ", ".join(sorted(trovate)[:8]))
        else:
            segna(en_url + " · italiano rimasto", "ok")

    print("\n— la mappa del sito conosce tutte e due le lingue —\n")
    s, mappa = prendi("/sitemap.xml")
    if s != 200:
        segna("sitemap.xml", "ROTTO", "HTTP %s" % s)
    else:
        manca = [u for _, en in coppie for u in [SITO + en] if u not in mappa]
        manca += [u for it, _ in coppie for u in [SITO + it] if u not in mappa]
        if manca:
            segna("sitemap.xml", "ROSSO", "%d indirizzi assenti: %s"
                  % (len(manca), ", ".join(manca[:3])))
        else:
            segna("sitemap.xml", "ok", "%d indirizzi" % (len(coppie) * 2))

    rossi = sum(1 for _, s in esiti if s != "ok")
    print("\n" + "=" * 66)
    print("  %d controlli · %d rossi" % (len(esiti), rossi))
    print("=" * 66)
    return 1 if rossi else 0


if __name__ == "__main__":
    sys.exit(main())
