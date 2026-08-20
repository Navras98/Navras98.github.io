#!/usr/bin/env python3
"""Collaudo dal vivo: quattro larghezze, console, collegamenti, menu, percorso senza animazioni.

Serve il sito in locale, apre un browser headless su CDP e misura sulla pagina
resa, non sul sorgente. Uscita 0 se tutti i controlli passano, 1 altrimenti.
Uso: python3 collaudo.py [--foto cartella]
"""

import asyncio
import base64
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import websockets

BASE = Path(__file__).resolve().parent
PAGES = [
    "index.html",
    "competenze.html",
    "sicurezza.html",
    "dati.html",
    "modelli.html",
    "metodo.html",
    "contatti.html",
]
LARGHEZZE = [390, 768, 1024, 1440]
BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

esiti = []


def segna(ok, testo):
    esiti.append((ok, testo))
    print(("  ok  " if ok else "  KO  ") + testo)


def porta_libera():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


class Cdp:
    def __init__(self, ws):
        self.ws = ws
        self.n = 0
        self.console = []
        self.attesi = {}

    async def send(self, metodo, params=None):
        self.n += 1
        ident = self.n
        await self.ws.send(json.dumps({"id": ident, "method": metodo, "params": params or {}}))
        while True:
            r = json.loads(await self.ws.recv())
            if r.get("method") == "Runtime.consoleAPICalled":
                if r["params"].get("type") in ("error", "warning"):
                    self.console.append(("console." + r["params"]["type"], str(r["params"].get("args"))[:200]))
            elif r.get("method") == "Runtime.exceptionThrown":
                d = r["params"]["exceptionDetails"]
                self.console.append(("eccezione", d.get("text", "") + " " + str(d.get("exception", {}).get("description", ""))[:200]))
            elif r.get("method") == "Log.entryAdded":
                e = r["params"]["entry"]
                if e.get("level") == "error":
                    self.console.append(("log", e.get("text", "")[:200]))
            if r.get("id") == ident:
                if "error" in r:
                    raise RuntimeError(metodo + ": " + json.dumps(r["error"]))
                return r.get("result", {})

    async def ev(self, expr):
        r = await self.send("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True})
        if "exceptionDetails" in r:
            raise RuntimeError(json.dumps(r["exceptionDetails"])[:400])
        return r.get("result", {}).get("value")

    async def apri(self, url, attesa=1.6):
        self.console = []
        await self.send("Page.navigate", {"url": url})
        await asyncio.sleep(attesa)


SONDA_TRABOCCO = """
(function () {
  var fuori = [];
  var w = document.documentElement.clientWidth;
  var nodi = document.querySelectorAll('body *');
  for (var i = 0; i < nodi.length; i++) {
    var e = nodi[i];
    var st = getComputedStyle(e);
    if (st.position === 'fixed' || st.display === 'none' || st.visibility === 'hidden') continue;
    if (e.offsetParent === null && st.position !== 'sticky') continue;
    var r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* Sbordare a destra allarga il documento e fa comparire la barra orizzontale.
       A sinistra no: in un testo che scorre da sinistra a destra il fuori-schermo
       negativo è la tecnica con cui si parcheggia il salto al contenuto, che
       rientra al fuoco. Perciò il bordo sinistro conta solo per gli elementi in
       flusso, che a differenza di quelli posizionati porterebbero via del testo. */
    var inFlusso = st.position === 'static' || st.position === 'relative';
    if (r.right > w + 1.5 || (inFlusso && r.left < -1.5)) {
      fuori.push((e.tagName + '.' + (e.className || '')).slice(0, 60) + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
    }
  }
  var tagliati = [];
  var t = document.querySelectorAll('main p, main h1, main h2, main h3, main li, .nav__link, .door__title, .next__title');
  for (var j = 0; j < t.length; j++) {
    var el = t[j];
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === 'visible') {
      tagliati.push((el.tagName + '.' + (el.className || '')).slice(0, 60));
    }
  }
  return JSON.stringify({
    doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    fuori: fuori.slice(0, 5),
    tagliati: tagliati.slice(0, 5)
  });
})()
"""


async def main():
    cartella_foto = None
    if "--foto" in sys.argv:
        cartella_foto = Path(sys.argv[sys.argv.index("--foto") + 1])
        cartella_foto.mkdir(parents=True, exist_ok=True)

    porta_web = porta_libera()
    web = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(porta_web), "-b", "127.0.0.1"],
        cwd=BASE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    porta_cdp = porta_libera()
    profilo = tempfile.mkdtemp(prefix="collaudo-brave-")
    brave = subprocess.Popen(
        [BRAVE, "--headless=new", f"--remote-debugging-port={porta_cdp}",
         f"--user-data-dir={profilo}", "--no-first-run", "--no-default-browser-check",
         "--disable-extensions", "--hide-scrollbars", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    try:
        alveo = None
        for _ in range(60):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{porta_cdp}/json"))
                pagine = [t for t in tabs if t["type"] == "page"]
                if pagine:
                    alveo = pagine[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                pass
            time.sleep(0.4)
        if not alveo:
            print("Brave non risponde su CDP")
            return 2

        radice = f"http://127.0.0.1:{porta_web}/"

        async with websockets.connect(alveo, max_size=80_000_000) as ws:
            c = Cdp(ws)
            await c.send("Page.enable")
            await c.send("Runtime.enable")
            await c.send("Log.enable")

            # ---------------------------------------------- larghezze e console
            for larghezza in LARGHEZZE:
                print(f"\n== {larghezza} px ==")
                await c.send("Emulation.setDeviceMetricsOverride", {
                    "width": larghezza, "height": 900, "deviceScaleFactor": 1,
                    "mobile": larghezza < 700,
                })
                for pagina in PAGES:
                    await c.apri(radice + pagina)
                    await c.ev("window.scrollTo(0, document.body.scrollHeight); 1")
                    await asyncio.sleep(0.7)
                    await c.ev("window.scrollTo(0, 0); 1")
                    await asyncio.sleep(0.3)
                    dati = json.loads(await c.ev(SONDA_TRABOCCO))
                    guai = []
                    if dati["doc"]:
                        guai.append("la pagina scorre in orizzontale")
                    if dati["fuori"]:
                        guai.append("fuori dal bordo: " + "; ".join(dati["fuori"]))
                    if dati["tagliati"]:
                        guai.append("testo tagliato: " + "; ".join(dati["tagliati"]))
                    if c.console:
                        guai.append("console: " + "; ".join(f"{a}: {b}" for a, b in c.console[:3]))
                    segna(not guai, f"{pagina} a {larghezza}px" + (" — " + " | ".join(guai) if guai else ""))

                    if cartella_foto and pagina in ("index.html", "sicurezza.html"):
                        r = await c.send("Page.captureScreenshot", {"format": "png"})
                        (cartella_foto / f"{pagina.replace('.html','')}-{larghezza}.png").write_bytes(
                            base64.b64decode(r["data"]))

            # ------------------------------------------------ menu a scomparsa
            print("\n== menu a scomparsa (390px) ==")
            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
            for pagina in PAGES:
                await c.apri(radice + pagina)
                visibile = await c.ev(
                    "(function(){var b=document.querySelector('[data-burger]');"
                    "return b && getComputedStyle(b).display!=='none';})()")
                await c.ev("document.querySelector('[data-burger]').click(); 1")
                await asyncio.sleep(0.55)
                stato = json.loads(await c.ev(
                    "(function(){var m=document.querySelector('[data-menu]');"
                    "var r=m.getBoundingClientRect();"
                    "var l=[...m.querySelectorAll('a.menu__link')];"
                    "return JSON.stringify({h:Math.round(r.height),n:l.length,"
                    "attivo:l.filter(a=>a.getAttribute('aria-current')==='page').length,"
                    "cliccabili:l.filter(function(a){var q=a.getBoundingClientRect();"
                    "return q.height>10 && q.top>=0 && q.bottom<=innerHeight+1;}).length,"
                    "espanso:document.querySelector('[data-burger]').getAttribute('aria-expanded')});})()"))
                await c.ev("document.querySelector('[data-burger]').click(); 1")
                await asyncio.sleep(0.45)
                chiuso = await c.ev("document.querySelector('[data-menu]').getAttribute('aria-expanded')==='true'"
                                    " || document.querySelector('[data-burger]').getAttribute('aria-expanded')==='true'")
                ok = (visibile and stato["n"] == len(PAGES) and stato["cliccabili"] == len(PAGES)
                      and stato["attivo"] == 1 and stato["espanso"] == "true" and stato["h"] > 200 and not chiuso)
                segna(ok, f"{pagina}: menu apre, {stato['cliccabili']}/{len(PAGES)} voci raggiungibili, "
                          f"attiva {stato['attivo']}, richiude {'sì' if not chiuso else 'no'}")

            # ------------------------------------ salto al contenuto, al fuoco
            # Il fuoco si dà col tasto vero, non con element.focus(): in una finestra
            # che non ha il fuoco di sistema lo script sposta document.activeElement
            # ma la regola :focus non si applica, e il collegamento resterebbe
            # parcheggiato fuori schermo pur essendo a posto.
            print("\n== salto al contenuto (col tasto Tab vero) ==")
            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
            for pagina in PAGES:
                await c.apri(radice + pagina, attesa=1.0)
                prima = json.loads(await c.ev(
                    "(function(){var s=document.querySelector('.skip');"
                    "var r=s.getBoundingClientRect();"
                    "return JSON.stringify({fuori:r.right<0,meta:s.getAttribute('href')});})()"))
                for tipo in ("rawKeyDown", "char", "keyUp"):
                    evento = {"type": tipo, "key": "Tab", "code": "Tab",
                              "windowsVirtualKeyCode": 9, "nativeVirtualKeyCode": 9}
                    if tipo == "char":
                        evento["text"] = "\t"
                    await c.send("Input.dispatchKeyEvent", evento)
                await asyncio.sleep(0.45)
                dopo = json.loads(await c.ev(
                    "(function(){var s=document.querySelector('.skip');"
                    "var r=s.getBoundingClientRect();"
                    "return JSON.stringify({primo:document.activeElement===s,"
                    "dentro:r.left>=0&&r.right<=innerWidth&&r.height>10&&r.top>=0});})()"))
                ok = prima["fuori"] and prima["meta"] == "#main" and dopo["primo"] and dopo["dentro"]
                segna(ok, f"{pagina}: fuori schermo a riposo, primo col Tab, rientra visibile, punta a #main")

            # -------------------------------------------- collegamenti provati
            print("\n== collegamenti, premuti uno per uno ==")
            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
            provati = 0
            for pagina in PAGES:
                await c.apri(radice + pagina)
                href = json.loads(await c.ev(
                    "JSON.stringify([...new Set([...document.querySelectorAll('a[href]')]"
                    ".map(a=>a.getAttribute('href'))"
                    ".filter(h=>h && !/^(https?:|mailto:|#)/.test(h)))])"))
                rotti = []
                for h in href:
                    await c.apri(radice + h, attesa=1.0)
                    esito = json.loads(await c.ev(
                        "JSON.stringify({t:document.title, m:!!document.querySelector('main'),"
                        "p:document.querySelectorAll('main p').length})"))
                    if not esito["m"] or esito["p"] < 2 or "404" in esito["t"]:
                        rotti.append(h)
                    provati += 1
                segna(not rotti, f"{pagina}: {len(href)} collegamenti interni, "
                                 + ("tutti aprono una pagina vera" if not rotti else "rotti: " + ", ".join(rotti)))
            print(f"     (aperture totali: {provati})")

            # ------------------------------------- percorso senza animazioni
            print("\n== prefers-reduced-motion: reduce ==")
            await c.send("Emulation.setEmulatedMedia", {
                "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]})
            for pagina in PAGES:
                await c.apri(radice + pagina)
                dati = json.loads(await c.ev(
                    "(function(){var n=[...document.querySelectorAll('[data-reveal]')];"
                    "var invisibili=n.filter(function(e){var s=getComputedStyle(e);"
                    "return parseFloat(s.opacity)<0.9 || s.visibility==='hidden';});"
                    "var testo=document.querySelector('main').innerText.trim().length;"
                    "return JSON.stringify({tot:n.length,inv:invisibili.length,testo:testo,"
                    "moto:document.documentElement.classList.contains('motion')});})()"))
                ok = dati["inv"] == 0 and dati["testo"] > 600 and not dati["moto"]
                segna(ok, f"{pagina}: {dati['tot']} blocchi, {dati['inv']} invisibili, "
                          f"{dati['testo']} caratteri leggibili, animazioni {'spente' if not dati['moto'] else 'ACCESE'}")
            await c.send("Emulation.setEmulatedMedia", {"features": []})

            # ------------------------------------------- percorso senza JavaScript
            print("\n== senza JavaScript ==")
            await c.send("Emulation.setScriptExecutionDisabled", {"value": True})
            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
            for pagina in PAGES:
                await c.apri(radice + pagina, attesa=1.0)
                dati = json.loads(await c.ev(
                    "(function(){var l=[...document.querySelectorAll('.nav__link')];"
                    "var v=l.filter(function(a){var r=a.getBoundingClientRect();"
                    "return r.width>0&&r.height>0;});"
                    "return JSON.stringify({voci:v.length,"
                    "testo:document.querySelector('main').innerText.trim().length,"
                    "ovf:document.documentElement.scrollWidth>document.documentElement.clientWidth+1});})()"))
                ok = dati["voci"] == len(PAGES) and dati["testo"] > 600 and not dati["ovf"]
                segna(ok, f"{pagina}: {dati['voci']}/{len(PAGES)} voci di menu in chiaro, "
                          f"{dati['testo']} caratteri, trabocco {'sì' if dati['ovf'] else 'no'}")
                if cartella_foto and pagina == "index.html":
                    r = await c.send("Page.captureScreenshot", {"format": "png"})
                    (cartella_foto / "senza-js-390.png").write_bytes(base64.b64decode(r["data"]))
            await c.send("Emulation.setScriptExecutionDisabled", {"value": False})

    finally:
        brave.terminate()
        web.terminate()
        shutil.rmtree(profilo, ignore_errors=True)

    ko = [t for ok, t in esiti if not ok]
    print("\n" + "=" * 60)
    print(f"CONTROLLI: {len(esiti)} — passati {len(esiti) - len(ko)}, falliti {len(ko)}")
    for t in ko:
        print("  KO  " + t)
    return 1 if ko else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
