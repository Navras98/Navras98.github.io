#!/usr/bin/env python3
"""Il sito deve reggere anche se i domini di terzi non rispondono.

Il sito veniva disegnato da React scaricato da unpkg.com. Bloccando quel dominio
ogni pagina restava bianca: 18 caratteri di testo, cioe' il solo «Salta al
contenuto». Un blocco pubblicitario aggressivo, un proxy aziendale o un guasto
del CDN bastavano a spegnere il sito, e da fuori sarebbe sembrato un sito rotto.

Questo attrezzo lo verifica invece di darlo per buono: apre ogni pagina con i
domini esterni bloccati e conta il testo che resta. Se una pagina si svuota,
esce con 1.

    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \\
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .
    python3 strumenti/senza_rete.py
"""
import asyncio
import json
import sys
import urllib.request

try:
    import websockets
except ImportError:
    print("serve il pacchetto websockets: python3 -m pip install websockets")
    sys.exit(2)

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8899"
ISPEZIONE = "http://127.0.0.1:9333"

BLOCCATI = ["*unpkg.com*", "*fonts.googleapis.com*", "*fonts.gstatic.com*",
            "*cdn.jsdelivr.net*", "*cdnjs.cloudflare.com*"]

PAGINE = [
    "/", "/agenti/", "/casi/", "/modelli/", "/sicurezza/", "/dati/",
    "/privacy-bridge/", "/formazione/", "/contatti/", "/architettura/",
    "/automazione/", "/strumenti/", "/metodo/", "/modelli-in-locale/",
]

# le gemelle inglesi: l'elenco si deriva dalla tabella che le costruisce,
# cosi' una pagina nuova non puo' restare fuori dal collaudo senza che si veda
import os as _os
import sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from i18n_costruisci import IN_INGLESE as _EN  # noqa: E402

PAGINE = PAGINE + [
    "/en/" + (_EN.get(p.strip("/"), p.strip("/")) + "/" if p != "/" else "")
    for p in PAGINE
] + ["/404.html"]

# Sotto questa soglia la pagina e' da considerarsi vuota. Il metro viene dal
# guasto vero: con il CDN giu' le pagine si fermavano a 18 caratteri. La pagina
# piu' corta del sito e' la 404, che ne ha 881; le altre stanno fra 1.700 e 6.400.
# 600 sta comodamente sopra il guasto e sotto la pagina piu' povera.
MINIMO = 600


async def principale():
    schede = json.loads(urllib.request.urlopen(f"{ISPEZIONE}/json").read())
    pagina = [t for t in schede if t.get("type") == "page"][0]
    rossi = []
    rotti = []
    async with websockets.connect(pagina["webSocketDebuggerUrl"], max_size=60 * 1024 * 1024) as ws:
        n = 0

        async def chiama(metodo, **par):
            nonlocal n
            n += 1
            mio = n
            await ws.send(json.dumps({"id": mio, "method": metodo, "params": par}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get("id") == mio:
                    if "error" in msg:
                        raise RuntimeError(f"{metodo}: {msg['error']}")
                    return msg.get("result", {})

        await chiama("Page.enable")
        await chiama("Runtime.enable")
        await chiama("Network.enable")
        await chiama("Network.setCacheDisabled", cacheDisabled=True)
        await chiama("Network.setBlockedURLs", urls=BLOCCATI)
        await chiama("Emulation.setDeviceMetricsOverride", width=1280, height=900,
                     deviceScaleFactor=1, mobile=False)

        print(f"  domini bloccati: {', '.join(u.strip('*') for u in BLOCCATI)}\n")
        for p in PAGINE:
            await chiama("Page.navigate", url=BASE + p)
            await asyncio.sleep(3.0)
            r = await chiama("Runtime.evaluate", returnByValue=True, expression="""
                JSON.stringify({
                  testo: (document.body.innerText||'').trim().length,
                  altezza: Math.round(document.body.scrollHeight),
                  titoli: document.querySelectorAll('h1,h2').length,
                  testoIniziale: (document.body.innerText||'').slice(0,120)
                })""")
            d = json.loads(r["result"]["value"])
            # Una prova morta non e' una prova rossa: se il server locale non
            # risponde, il browser mostra la sua pagina d'errore e ogni pagina
            # sembrerebbe vuota per colpa del sito. Va detto, non contato.
            if "ERR_CONNECTION" in d["testoIniziale"] or "ERR_" in d["testoIniziale"]:
                print(f"    ROTTO  {p:<22} il server locale non risponde — prova non eseguita")
                rotti.append(p)
                continue
            ok = d["testo"] >= MINIMO and d["titoli"] > 0
            if not ok:
                rossi.append((p, d))
            print(f"    {'ok' if ok else 'ROSSO':6} {p:<22} {d['testo']:>6} caratteri · "
                  f"{d['titoli']:>2} titoli · alta {d['altezza']}px")

    print("\n" + "=" * 70)
    if rotti:
        print(f"  {len(rotti)} pagine non provate: il server locale non rispondeva.")
        print("  Rilancia `python3 -m http.server 8899 --directory .` e riprova.")
        print("=" * 70)
        return 2
    if rossi:
        print(f"  {len(rossi)} pagine su {len(PAGINE)} si svuotano senza i domini esterni")
        for p, d in rossi:
            print(f"    {p}: {d['testo']} caratteri")
        print("=" * 70)
        return 1
    print(f"  {len(PAGINE)} pagine su {len(PAGINE)} restano leggibili con i domini esterni giu'")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(principale()))
