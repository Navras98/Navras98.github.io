#!/usr/bin/env python3
"""Preme i tasti della pagina e guarda se succede quello che devono fare.

Il collaudo delle pagine misura quello che si vede fermo. Qui invece si preme:
il tasto Menu deve aprire e richiudere il pannello, il tasto del tema deve
cambiare tema e chiamarsi nella lingua della pagina, e ogni collegamento della
testa e del piede deve rispondere.

Serve perche' un difetto vero e' passato di qui: il motore che disegna la
pagina rifa' i nodi portandosi dietro gli attributi ma non gli ascoltatori.
Lo script si segnava «gia' legato» con un attributo, lo rileggeva sul nodo
nuovo e non rilegava piu' niente. Da fuori la pagina era perfetta: il tasto
c'era, era al suo posto, aveva il contorno giusto. Solo non faceva nulla.
Nessun controllo sul testo o sulla forma poteva vederlo.

    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \\
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .
    python3 .collaudo/tasti.py
"""
import asyncio
import json
import os
import sys
import urllib.request

try:
    import websockets
except ImportError:
    print("serve il pacchetto websockets: python3 -m pip install websockets")
    sys.exit(2)

QUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, QUI)
from collaudo import PAGINE  # noqa: E402

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8899").rstrip("/")
CDP = "http://127.0.0.1:9333"

# Quello che deve succedere quando si preme. Il tasto del tema si chiama con
# una parola diversa per lingua: se la pagina e' inglese e il tasto dice
# «Chiaro», e' una parola italiana in mezzo a una pagina inglese.
ATTESE_TEMA = {"it": {"Chiaro", "Scuro"}, "en": {"Light", "Dark"}}

PROVA = r"""
(() => {
  const out = { };
  const b = document.querySelector('[data-burger]');
  const p = document.querySelector('[data-pannello]');
  if (!b || !p) { out.errore = 'manca il tasto Menu o il pannello'; return JSON.stringify(out); }

  b.click();
  out.apre = getComputedStyle(p).display !== 'none';
  out.avvisa = b.getAttribute('aria-expanded') === 'true';
  b.click();
  out.chiude = getComputedStyle(p).display === 'none';

  const t = document.querySelector('[data-tema-btn]');
  if (!t) { out.errore = 'manca il tasto del tema'; return JSON.stringify(out); }
  const prima = document.documentElement.getAttribute('data-tema');
  t.click();
  out.temaCambia = document.documentElement.getAttribute('data-tema') !== prima;
  out.etichetta = t.textContent.trim();
  t.click();
  out.tornaIndietro = document.documentElement.getAttribute('data-tema') === prima;

  out.lingua = (document.documentElement.getAttribute('lang') || '').slice(0, 2);
  // fuori la voce che porta all'altra lingua: quella DEVE uscire dalla lingua
  // della pagina, e' tutto il suo mestiere. Il suo bersaglio lo controlla
  // lingue.py, che sa qual e' la pagina gemella.
  out.vociMenu = [...p.querySelectorAll('a:not([data-lingua-menu])')]
    .map((a) => a.getAttribute('href'));
  return JSON.stringify(out);
})()
"""

esiti = []


def segna(nome, stato, dettaglio=""):
    esiti.append((nome, stato))
    print("%-6s  %s%s" % ({"ok": "  ok", "ROSSO": "ROSSO", "ROTTO": "ROTTO"}[stato],
                          nome, "  — " + dettaglio if dettaglio else ""))


async def apri():
    """Si usa la scheda gia' aperta: aprirne una nuova richiede una PUT che
    questa versione del browser rifiuta (405)."""
    tabs = json.load(urllib.request.urlopen(CDP + "/json"))
    pagina = [t for t in tabs if t["type"] == "page"][0]
    return pagina["webSocketDebuggerUrl"]


async def main():
    ws_url = await apri()
    if True:
        async with websockets.connect(ws_url, max_size=None) as ws:
            n = 0

            async def cmd(metodo, par=None):
                nonlocal n
                n += 1
                await ws.send(json.dumps({"id": n, "method": metodo, "params": par or {}}))
                while True:
                    r = json.loads(await ws.recv())
                    if r.get("id") == n:
                        return r

            await cmd("Page.enable")
            await cmd("Runtime.enable")
            # senza questo il browser riusa il foglio e lo script della volta
            # prima: si finisce per collaudare una versione che non e' piu' sul
            # disco. Con la memoria accesa, la prova negativa e' uscita al
            # contrario, cioe' verde con il guasto e rossa senza.
            await cmd("Network.enable")
            await cmd("Network.setCacheDisabled", {"cacheDisabled": True})
            await cmd("Emulation.setDeviceMetricsOverride",
                      {"width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})

            for p in PAGINE:
                url = f"{BASE}/{p}"
                etichetta = "/" + p
                await cmd("Page.navigate", {"url": url})
                await asyncio.sleep(2.6)
                r = await cmd("Runtime.evaluate", {"expression": PROVA, "returnByValue": True})
                grezzo = (r.get("result", {}).get("result", {}) or {}).get("value")
                if not grezzo:
                    segna(etichetta, "ROTTO", "la pagina non risponde alla prova")
                    continue
                d = json.loads(grezzo)
                if d.get("errore"):
                    segna(etichetta, "ROSSO", d["errore"])
                    continue

                segna(etichetta + " · il Menu apre il pannello",
                      "ok" if d["apre"] else "ROSSO",
                      "" if d["apre"] else "premuto, il pannello resta chiuso")
                segna(etichetta + " · il Menu lo richiude",
                      "ok" if d["chiude"] else "ROSSO")
                segna(etichetta + " · il Menu lo dice a chi non vede",
                      "ok" if d["avvisa"] else "ROSSO", "" if d["avvisa"] else "aria-expanded non cambia")
                segna(etichetta + " · il tema cambia",
                      "ok" if d["temaCambia"] else "ROSSO",
                      "" if d["temaCambia"] else "premuto, il tema resta quello di prima")
                segna(etichetta + " · il tema torna indietro",
                      "ok" if d["tornaIndietro"] else "ROSSO")

                attese = ATTESE_TEMA.get(d["lingua"] or "it", ATTESE_TEMA["it"])
                giusta = d["etichetta"] in attese
                segna(etichetta + " · il tasto del tema parla la lingua della pagina",
                      "ok" if giusta else "ROSSO",
                      "" if giusta else "dice «%s», in «%s» ci si aspetta %s"
                      % (d["etichetta"], d["lingua"], " o ".join(sorted(attese))))

                # le voci del pannello devono restare nella lingua della pagina
                dentro = "/en/" if p.startswith("en/") else None
                if dentro:
                    fuori = [h for h in d["vociMenu"]
                             if h and h.startswith("/") and not h.startswith("/en/") and h != "/"]
                    segna(etichetta + " · il menu non porta fuori dalla lingua",
                          "ok" if not fuori else "ROSSO",
                          "" if not fuori else ", ".join(fuori[:4]))
    rossi = sum(1 for _, s in esiti if s != "ok")
    print("\n" + "=" * 70)
    print("  %d tasti premuti · %d rossi" % (len(esiti), rossi))
    print("=" * 70)
    return 1 if rossi else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
