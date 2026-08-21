#!/usr/bin/env python3
"""Collaudo del sito: apre ogni pagina in un browser vero e misura.

Non controlla che il codice contenga certe stringhe: carica le pagine, le fa
disegnare e legge quello che il browser ha davvero calcolato. Ogni controllo
dice ATTESO, ROSSO o ROTTO, e alla fine il codice di uscita e' 1 se qualcosa
non va.

Prima di lanciarlo serve un browser con la porta di ispezione aperta:
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \\
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .

Uso:
    python3 strumenti/collaudo.py [indirizzo-base]
    (senza argomenti usa http://127.0.0.1:8899)
"""
import asyncio
import json
import re
import sys
import urllib.request
from pathlib import Path

try:
    import websockets
except ImportError:
    print("serve il pacchetto websockets: python3 -m pip install websockets")
    sys.exit(2)

RADICE = Path(__file__).resolve().parent.parent
BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8899").rstrip("/")
CDP = "http://127.0.0.1:9333"

PAGINE = ["index.html", "Agenti.dc.html", "Casi.dc.html", "Modelli.dc.html",
          "Sicurezza.dc.html", "Dati.dc.html", "Privacy.dc.html", "Formazione.dc.html",
          "Contatti.dc.html", "Locali.dc.html", "Architettura.dc.html",
          "Automazione.dc.html", "Strumenti.dc.html", "Metodo.dc.html", "404.html"]

esiti = []


def segna(nome, stato, dettaglio=""):
    esiti.append((nome, stato, dettaglio))
    simbolo = {"ATTESO": "  ok  ", "ROSSO": " ROSSO", "ROTTO": " ROTTO"}[stato]
    print(f"{simbolo}  {nome}" + (f"  — {dettaglio}" if dettaglio else ""))


# --------------------------------------------------------- misure nel browser
MISURA = r"""
(() => {
  const vw = document.documentElement.clientWidth;
  const disp = (s) => document.querySelector(s);
  const meta = (s) => (disp(s) || {}).content || null;

  // blocchi che escono dallo schermo senza essere in un contenitore che scorre
  const tagliati = [];
  document.querySelectorAll('main *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.right - vw <= 1) return;
    let n = el.parentElement, scorre = false;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowX === 'hidden')
          && n.scrollWidth > n.clientWidth + 1) { scorre = true; break; }
      if (cs.overflowX === 'hidden') { scorre = true; break; }
      n = n.parentElement;
    }
    if (!scorre) tagliati.push({ px: Math.round(r.right - vw),
                                 txt: (el.textContent || '').trim().slice(0, 40) });
  });

  // sezioni dimostrative: il titolo deve venire prima della sua chat
  const dimostrazioni = [...document.querySelectorAll('[data-demo]')].map((e) => {
    const f = [...e.children].map((c) => ({
      h2: !!c.querySelector('h2'), y: c.getBoundingClientRect().top,
      w: Math.round(c.getBoundingClientRect().width) }));
    const perAltezza = [...f].sort((a, b) => a.y - b.y);
    return { titoloPrima: perAltezza[0].h2, larghezze: f.map((x) => x.w) };
  });

  // numerazione visibile accanto agli h2
  const numeri = [...document.querySelectorAll('h2')]
    .map((h) => { const p = h.previousElementSibling;
                  return p && /^\d{2}$/.test(p.textContent.trim()) ? p.textContent.trim() : null; })
    .filter(Boolean);

  // bolle delle chat invisibili
  const bolle = [...document.querySelectorAll('[data-bolla]')];

  return JSON.stringify({
    vw,
    lang: document.documentElement.lang,
    titolo: (document.title || '').trim(),
    descrizione: meta('meta[name="description"]'),
    canonico: (disp('link[rel="canonical"]') || {}).href || null,
    anteprima: meta('meta[property="og:image"]'),
    viewport: meta('meta[name="viewport"]'),
    icona: !!disp('link[rel="icon"]'),
    salta: !!disp('a[href="#contenuto"]'),
    h1: document.querySelectorAll('h1').length,
    h1nome: (disp('h1') || {}).ariaLabel || (disp('h1') || {}).textContent || '',
    tagliati: tagliati.slice(0, 4),
    dimostrazioni,
    numeri,
    bolle: bolle.length,
    bolleInvisibili: bolle.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.05).length,
    interni: [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && !/^(https?:|mailto:|#)/.test(h)),
  });
})()
"""


async def apri():
    tabs = json.load(urllib.request.urlopen(CDP + "/json"))
    pagina = [t for t in tabs if t["type"] == "page"][0]
    return await websockets.connect(pagina["webSocketDebuggerUrl"], max_size=200_000_000)


async def misura(ws, invia, url, larghezza, ridotto=False):
    await invia("Emulation.setEmulatedMedia",
                {"features": [{"name": "prefers-reduced-motion",
                               "value": "reduce" if ridotto else "no-preference"}]})
    await invia("Emulation.setDeviceMetricsOverride",
                {"width": larghezza, "height": 900, "deviceScaleFactor": 1,
                 "mobile": larghezza < 700})
    await invia("Page.navigate", {"url": url})
    await asyncio.sleep(2.4)
    await invia("Runtime.evaluate", {"expression": "window.scrollTo(0,document.body.scrollHeight)"})
    await asyncio.sleep(1.4)
    await invia("Runtime.evaluate", {"expression": "window.scrollTo(0,0)"})
    await asyncio.sleep(0.4)
    r = await invia("Runtime.evaluate", {"expression": MISURA, "returnByValue": True})
    return json.loads(r["result"]["value"])


async def main():
    ws = await apri()
    n = [0]

    async def invia(m, p=None):
        n[0] += 1
        await ws.send(json.dumps({"id": n[0], "method": m, "params": p or {}}))
        while True:
            r = json.loads(await ws.recv())
            if r.get("id") == n[0]:
                return r.get("result", {})

    await invia("Page.enable")
    await invia("Network.enable")
    await invia("Network.setCacheDisabled", {"cacheDisabled": True})

    collegamenti = set()
    print("\n— testa delle pagine, struttura e larghezze —\n")
    for p in PAGINE:
        url = f"{BASE}/{p}"
        try:
            d = await misura(ws, invia, url, 390)
        except Exception as e:
            segna(f"{p}", "ROTTO", f"non si apre: {e}")
            continue

        mancanti = [k for k in ("lang", "titolo", "descrizione", "anteprima", "viewport")
                    if not d.get(k)]
        if p != "404.html" and not d.get("canonico"):
            mancanti.append("canonico")
        if mancanti:
            segna(f"{p} · testa", "ROSSO", "manca " + ", ".join(mancanti))
        elif d["lang"] != "it":
            segna(f"{p} · testa", "ROSSO", f"lingua dichiarata «{d['lang']}»")
        else:
            segna(f"{p} · testa", "ATTESO")

        if d["h1"] != 1:
            segna(f"{p} · un solo h1", "ROSSO", f"ne ho contati {d['h1']}")
        elif len(d["h1nome"].strip()) < 4:
            segna(f"{p} · nome del titolo", "ROSSO", f"«{d['h1nome']}»")
        else:
            segna(f"{p} · un solo h1", "ATTESO")

        if not d["salta"]:
            segna(f"{p} · salta al contenuto", "ROSSO", "collegamento assente")

        if d["tagliati"]:
            peggio = max(d["tagliati"], key=lambda x: x["px"])
            segna(f"{p} · niente tagli a 390px", "ROSSO",
                  f"{len(d['tagliati'])} blocchi, il peggiore +{peggio['px']}px « {peggio['txt']} »")
        else:
            segna(f"{p} · niente tagli a 390px", "ATTESO")

        fuori = [x for x in d["dimostrazioni"] if not x["titoloPrima"]]
        if fuori:
            segna(f"{p} · titolo prima della demo", "ROSSO", f"{len(fuori)} sezioni al contrario")
        elif d["dimostrazioni"]:
            segna(f"{p} · titolo prima della demo", "ATTESO",
                  f"{len(d['dimostrazioni'])} sezioni")

        num = d["numeri"]
        atteso = [f"{i:02d}" for i in range(1, len(num) + 1)]
        if num and num != atteso:
            segna(f"{p} · numeri in fila", "ROSSO", f"{' '.join(num)}")
        elif num:
            segna(f"{p} · numeri in fila", "ATTESO", " ".join(num))

        collegamenti.update(d["interni"])

    print("\n— schermo stretto (320px) —\n")
    for p in ("index.html", "Casi.dc.html", "Automazione.dc.html", "Modelli.dc.html"):
        d = await misura(ws, invia, f"{BASE}/{p}", 320)
        if d["tagliati"]:
            peggio = max(d["tagliati"], key=lambda x: x["px"])
            segna(f"{p} · niente tagli a 320px", "ROSSO", f"il peggiore +{peggio['px']}px")
        else:
            segna(f"{p} · niente tagli a 320px", "ATTESO")

    print("\n— con «riduci movimento» attivo —\n")
    for p in ("index.html", "Agenti.dc.html", "Casi.dc.html", "Automazione.dc.html",
              "Privacy.dc.html", "Sicurezza.dc.html"):
        d = await misura(ws, invia, f"{BASE}/{p}", 1280, ridotto=True)
        if d["bolle"] and d["bolleInvisibili"]:
            segna(f"{p} · chat visibili", "ROSSO",
                  f"{d['bolleInvisibili']} bolle su {d['bolle']} restano invisibili")
        elif d["bolle"]:
            segna(f"{p} · chat visibili", "ATTESO", f"{d['bolle']} bolle")

    print("\n— collegamenti interni —\n")
    rotti = []
    for c in sorted(collegamenti):
        base = c.split("#")[0].split("?")[0]
        if not base:
            continue
        try:
            req = urllib.request.Request(f"{BASE}/{base}", method="HEAD")
            with urllib.request.urlopen(req, timeout=6) as r:
                if r.status >= 400:
                    rotti.append(f"{base} → {r.status}")
        except Exception as e:
            rotti.append(f"{base} → {getattr(e, 'code', e)}")
    if rotti:
        segna("collegamenti interni", "ROSSO", "; ".join(rotti))
    else:
        segna("collegamenti interni", "ATTESO", f"{len(collegamenti)} indirizzi, nessun 404")

    print("\n— file di servizio —\n")
    for f in ("robots.txt", "sitemap.xml", "site.webmanifest", "assets/icona.svg",
              "assets/anteprima.png", "assets/icona-180.png"):
        try:
            with urllib.request.urlopen(f"{BASE}/{f}", timeout=6) as r:
                segna(f, "ATTESO" if r.status == 200 else "ROSSO", f"HTTP {r.status}")
        except Exception as e:
            segna(f, "ROSSO", str(getattr(e, "code", e)))

    print("\n— materiale che non deve essere pubblico —\n")
    for f in ("uploads/Hetepi_Agent_AI.pdf", "uploads/report-competenze-2026.md",
              "uploads/sito-andrea/README.md"):
        try:
            urllib.request.urlopen(f"{BASE}/{f}", timeout=6)
            segna(f"{f} non raggiungibile", "ROSSO", "risponde ancora 200")
        except Exception as e:
            if getattr(e, "code", None) == 404:
                segna(f"{f} non raggiungibile", "ATTESO", "404")
            else:
                segna(f"{f} non raggiungibile", "ROTTO", str(e))

    await ws.close()

    rossi = [e for e in esiti if e[1] == "ROSSO"]
    rotti_ = [e for e in esiti if e[1] == "ROTTO"]
    print(f"\n{'=' * 66}")
    print(f"  {len(esiti)} controlli · {len(esiti) - len(rossi) - len(rotti_)} attesi · "
          f"{len(rossi)} rossi · {len(rotti_)} rotti")
    print(f"{'=' * 66}")
    return 1 if (rossi or rotti_) else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
