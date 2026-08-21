#!/usr/bin/env python3
"""Collaudo dal vivo delle tre direzioni visive, sulla pagina resa.

Due larghezze (390 e 1440), due temi, per ognuna delle tre varianti. Contrasto
misurato sui PIXEL VERI dietro il testo, non sul colore dichiarato dal CSS: sopra
un campo generato a schermo il colore di sfondo dichiarato non esiste.

Un controllo che non e riuscito a misurare non e verde: ha una casella sua.

Uso: python3 collaudo-varianti.py [--foto CARTELLA]
Uscita 0 se tutto passa, 1 se qualcosa fallisce, 2 se il collaudo non parte.
"""

import asyncio
import base64
import io
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import numpy as np
import websockets
from PIL import Image

BASE = Path(__file__).resolve().parent
BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
# SOLO=b limita il giro a una variante mentre ci si lavora sopra
VARIANTI = (os.environ.get("SOLO") or "a,b,c").split(",")
LARGHEZZE = [390, 1440]
TEMI = ["scuro", "chiaro"]

FOTO = None
if "--foto" in sys.argv:
    FOTO = Path(sys.argv[sys.argv.index("--foto") + 1])
    FOTO.mkdir(parents=True, exist_ok=True)

esiti = []


def segna(stato, testo):
    """stato: True passato, False fallito, None non misurato."""
    esiti.append((stato, testo))
    print(("  ok  " if stato is True else "  KO  " if stato is False else "  ??  ") + testo)


def porta_libera():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def rel_lum(rgb):
    c = np.asarray(rgb, dtype=float) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def rapporto(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)


class Sessione:
    """Il compositore va tenuto acceso per tutta la sessione.

    In una finestra headless che non disegna, le transizioni CSS non avanzano e
    requestAnimationFrame non scatta: la variante col campo WebGL misurerebbe 60
    fotogrammi e le altre due zero, per colpa del banco e non della pagina.
    Lo screencast forza il disegno, ma Chromium produce un fotogramma nuovo solo
    dopo che il precedente e stato riscontrato: se il socket viene letto soltanto
    mentre si aspetta la risposta a un comando, i riscontri si fermano e con loro
    il disegno. Per questo il socket ha un lettore suo, sempre in ascolto.
    """

    def __init__(self, ws):
        self.ws = ws
        self.n = 0
        self.log = []
        self.attesa = {}
        self.lettore = asyncio.ensure_future(self._leggi())

    async def _leggi(self):
        try:
            while True:
                r = json.loads(await self.ws.recv())
                metodo = r.get("method")
                if metodo == "Page.screencastFrame":
                    self.n += 1
                    await self.ws.send(json.dumps({
                        "id": self.n, "method": "Page.screencastFrameAck",
                        "params": {"sessionId": r["params"]["sessionId"]}}))
                    continue
                if metodo == "Runtime.consoleAPICalled":
                    p = r["params"]
                    if p.get("type") in ("error", "warning"):
                        self.log.append(json.dumps(p)[:240])
                elif metodo == "Log.entryAdded":
                    p = r["params"]["entry"]
                    if p.get("level") == "error":
                        self.log.append(json.dumps(p)[:240])
                elif metodo == "Runtime.exceptionThrown":
                    self.log.append(json.dumps(r["params"])[:240])
                idr = r.get("id")
                if idr in self.attesa:
                    f = self.attesa.pop(idr)
                    if not f.done():
                        f.set_result(r)
        except asyncio.CancelledError:
            raise
        except Exception:
            for f in self.attesa.values():
                if not f.done():
                    f.set_exception(RuntimeError("socket chiuso"))

    async def send(self, metodo, params=None, secondi=40):
        self.n += 1
        mio = self.n
        f = asyncio.get_event_loop().create_future()
        self.attesa[mio] = f
        await self.ws.send(json.dumps({"id": mio, "method": metodo, "params": params or {}}))
        r = await asyncio.wait_for(f, secondi)
        if "error" in r:
            raise RuntimeError(metodo + ": " + json.dumps(r["error"]))
        return r.get("result", {})

    async def spegni(self):
        try:
            await self.send("Page.stopScreencast", secondi=6)
        except Exception:
            pass

    async def compositore(self):
        # subito dopo una navigazione la pagina puo non essere ancora agganciata:
        # si riprova, e se proprio non si accende lo si dice invece di fingere
        for _ in range(12):
            try:
                await self.send("Page.startScreencast",
                                {"format": "jpeg", "quality": 15, "everyNthFrame": 1,
                                 "maxWidth": 400, "maxHeight": 260}, secondi=8)
                return True
            except Exception:
                await asyncio.sleep(0.25)
        return False

    async def ev(self, expr):
        r = await self.send(
            "Runtime.evaluate",
            {"expression": expr, "awaitPromise": True, "returnByValue": True},
        )
        if "exceptionDetails" in r:
            raise RuntimeError(json.dumps(r["exceptionDetails"])[:300])
        return r.get("result", {}).get("value")

    async def foto(self):
        r = await self.send("Page.captureScreenshot", {"format": "png"})
        return Image.open(io.BytesIO(base64.b64decode(r["data"]))).convert("RGB")

    async def tasto(self, chiave, codice, vk):
        for tipo in ("rawKeyDown", "char", "keyUp"):
            p = {"type": tipo, "key": chiave, "code": codice, "windowsVirtualKeyCode": vk}
            if tipo == "char":
                p = {"type": "char", "text": "\t"}
            await self.send("Input.dispatchKeyEvent", p)


LEGGI_TESTI = """
(() => {
  const fuori = new Set(['SCRIPT','STYLE','SVG','PATH','G','CANVAS','NOSCRIPT']);
  const out = [];
  document.querySelectorAll('body *').forEach(el => {
    if (fuori.has(el.tagName)) return;
    if (el.closest('[aria-hidden="true"]')) return;
    const testo = [...el.childNodes]
      .filter(n => n.nodeType === 3 && n.textContent.trim())
      .map(n => n.textContent.trim()).join(' ');
    if (!testo) return;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) < 0.05) return;
    // il contrasto riguarda i pixel dietro le LETTERE: la scatola di un paragrafo
    // e larga quanto la colonna anche quando la riga e corta, e misurarla vuol
    // dire leggere sfondo dove testo non ce n'e
    const g = document.createRange();
    g.selectNodeContents(el);
    let righe = [...g.getClientRects()].filter(r => r.width >= 2 && r.height >= 2);
    if (!righe.length) righe = [box];
    righe.forEach(r => out.push({
      testo: testo.slice(0, 40),
      x: r.left, y: r.top, w: r.width, h: r.height,
      colore: s.color,
      dim: parseFloat(s.fontSize),
      peso: parseInt(s.fontWeight, 10) || 400,
      // un contenuto piu alto della scatola non e testo tagliato se la scatola
      // non taglia: con interlinea sotto 1 succede su ogni titolo
      tagliato: (s.overflowX !== 'visible' && el.scrollWidth - el.clientWidth > 1) ||
                (s.overflowY !== 'visible' && el.scrollHeight - el.clientHeight > 1),
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\\s+/)[0] : '')
    }));
  });
  return JSON.stringify(out);
})()
"""


def a_rgb(css):
    n = [int(float(v)) for v in css.replace("rgba(", "").replace("rgb(", "").rstrip(")").split(",")[:3]]
    return n


async def collauda(s, variante, largo, tema, radice_url):
    eti = f"{variante}/ {largo}px {tema}"
    url = f"{radice_url}/{variante}/"

    await s.spegni()
    await s.send("Emulation.setEmulatedMedia", {"features": [
        {"name": "prefers-reduced-motion", "value": "no-preference"}]})
    await s.send("Emulation.setDeviceMetricsOverride",
                 {"width": largo, "height": 900, "deviceScaleFactor": 1, "mobile": largo < 700})
    await s.send("Page.navigate", {"url": url})
    await asyncio.sleep(1.0)
    await s.ev(f"localStorage.setItem('tema-{variante}','{tema}');1")
    s.log.clear()
    await s.send("Page.navigate", {"url": url})
    await asyncio.sleep(0.6)
    accesso = await s.compositore()
    await asyncio.sleep(2.8)

    if not accesso:
        segna(None, f"{eti}: compositore non acceso, le misure sul tempo non valgono")
    tema_vero = await s.ev("document.documentElement.dataset.tema")
    segna(tema_vero == tema, f"{eti}: il tema richiesto e quello applicato")

    trab = await s.ev("document.documentElement.scrollWidth - window.innerWidth")
    segna(trab is not None and trab <= 1, f"{eti}: nessun trabocco orizzontale ({trab} px)")

    testi = json.loads(await s.ev(LEGGI_TESTI))
    segna(len(testi) >= 8, f"{eti}: {len(testi)} blocchi di testo trovati (minimo 8)")

    tagliati = [t["sel"] for t in testi if t["tagliato"]]
    segna(not tagliati, f"{eti}: nessun testo tagliato" + (f" ({tagliati})" if tagliati else ""))

    # contrasto sui pixel veri: si nasconde il testo, si fotografa il fondo,
    # e si confronta il colore dichiarato del testo con lo sfondo peggiore del suo riquadro
    await s.ev(
        "(()=>{let e=document.getElementById('_velo');if(!e){e=document.createElement('style');"
        "e.id='_velo';e.textContent='body *{color:transparent!important}';document.head.appendChild(e)}return 1})()"
    )
    await asyncio.sleep(0.45)
    sfondo = np.asarray(await s.foto(), dtype=float)
    await s.ev("(()=>{const e=document.getElementById('_velo');if(e)e.remove();return 1})()")

    peggiori = []
    non_misurati = 0
    for t in testi:
        x0 = max(0, int(t["x"])); y0 = max(0, int(t["y"]))
        x1 = min(sfondo.shape[1], int(t["x"] + t["w"]))
        y1 = min(sfondo.shape[0], int(t["y"] + t["h"]))
        if x1 - x0 < 2 or y1 - y0 < 2:
            non_misurati += 1
            continue
        zona = sfondo[y0:y1, x0:x1]
        lum_sf = rel_lum(zona)
        lum_tx = float(rel_lum(np.array(a_rgb(t["colore"]))))
        # il caso peggiore: lo sfondo piu vicino in luminanza al testo, nel 95mo percentile
        peggio = np.percentile(lum_sf, 95) if lum_tx < 0.4 else np.percentile(lum_sf, 5)
        r = rapporto(lum_tx, float(peggio))
        grande = t["dim"] >= 24 or (t["dim"] >= 18.66 and t["peso"] >= 700)
        soglia = 3.0 if grande else 4.5
        if r < soglia:
            peggiori.append(f"{t['sel']} {r:.2f}<{soglia}")

    if non_misurati == len(testi):
        segna(None, f"{eti}: contrasto non misurato (nessun riquadro utilizzabile)")
    else:
        segna(not peggiori,
              f"{eti}: contrasto AA sui pixel veri, {len(testi) - non_misurati} blocchi"
              + (f" (sotto soglia: {peggiori})" if peggiori else ""))

    # fotogrammi misurati mentre la pagina viene mossa davvero: un valore preso
    # a pagina ferma direbbe solo che il ciclo gira a vuoto
    await s.ev(
        "window.__fps = new Promise(r=>{let n=0,t0=performance.now();"
        "(function g(){n++;if(performance.now()-t0<1800)requestAnimationFrame(g);"
        "else r(Math.round(n/((performance.now()-t0)/1000)))})();"
        "setTimeout(()=>r(-1),5000)}); 1"
    )
    # lo scorrimento si guida da dentro la pagina: i vhe eventi di rotella via CDP
    # possono restare senza risposta e appendere il collaudo
    await s.ev(
        "(()=>{let k=0;const id=setInterval(()=>{window.scrollBy(0,(k%24)<12?16:-16);"
        "if(++k>130)clearInterval(id)},16);return 1})()"
    )
    await asyncio.sleep(2.4)
    fps = await s.ev("window.__fps")
    await s.ev("window.scrollTo(0,0);1")
    if fps is None or fps < 0:
        segna(None, f"{eti}: fotogrammi non misurati")
    else:
        segna(fps >= 55, f"{eti}: {fps} fotogrammi al secondo durante lo scorrimento")

    # salto al contenuto col tasto vero
    await s.ev("document.body.focus();window.scrollTo(0,0);1")
    await s.tasto("Tab", "Tab", 9)
    await asyncio.sleep(0.7)
    salto = await s.ev(
        "(()=>{const a=document.activeElement;if(!a||!a.classList.contains('salta'))return 'no';"
        "const r=a.getBoundingClientRect();return r.top>=0&&r.left>=0?'si':'fuori'})()"
    )
    segna(salto == "si", f"{eti}: il salto al contenuto rientra col tasto Tab ({salto})")

    if FOTO:
        # senza togliere il fuoco, la foto esce col salto al contenuto in evidenza
        await s.ev("document.activeElement && document.activeElement.blur();window.scrollTo(0,0);1")
        await asyncio.sleep(0.4)
        img = await s.foto()
        img.save(FOTO / f"{variante}-{largo}-{tema}.png")

    errori = [l for l in s.log if "favicon" not in l]
    segna(not errori, f"{eti}: console pulita" + (f" ({errori[:1]})" if errori else ""))


async def ripieghi(s, variante, radice_url):
    """I tre percorsi di ripiego, provati davvero e non simulati."""
    url = f"{radice_url}/{variante}/"
    eti = f"{variante}/ ripieghi"

    # 1. senza animazioni
    await s.spegni()
    await s.send("Emulation.setEmulatedMedia", {"features": [
        {"name": "prefers-reduced-motion", "value": "reduce"}]})
    await s.send("Emulation.setDeviceMetricsOverride",
                 {"width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
    await s.send("Page.navigate", {"url": url})
    await asyncio.sleep(0.6)
    await s.compositore()
    await asyncio.sleep(1.8)
    invisibili = await s.ev(
        "[...document.querySelectorAll('main *')].filter(e=>{const s=getComputedStyle(e);"
        "return e.textContent.trim() && parseFloat(s.opacity)<0.5}).length"
    )
    segna(invisibili == 0, f"{eti}: senza animazioni nessun blocco resta invisibile ({invisibili})")
    if variante == "a":
        acceso = await s.ev("!!document.querySelector('#campo[data-acceso]')")
        segna(acceso is False, f"{eti}: senza animazioni il campo non parte")

    await s.send("Emulation.setEmulatedMedia", {"features": [
        {"name": "prefers-reduced-motion", "value": "no-preference"}]})

    # 2. senza JavaScript
    await s.spegni()
    await s.send("Emulation.setScriptExecutionDisabled", {"value": True})
    await s.send("Page.navigate", {"url": url})
    await asyncio.sleep(1.6)
    stato = json.loads(await s.ev(
        "JSON.stringify({parole:document.body.innerText.trim().split(/\\s+/).length,"
        "invisibili:[...document.querySelectorAll('main *')].filter(e=>{const s=getComputedStyle(e);"
        "return e.textContent.trim() && parseFloat(s.opacity)<0.5}).length,"
        "trab:document.documentElement.scrollWidth-window.innerWidth})"
    ) or "{}")
    await s.send("Emulation.setScriptExecutionDisabled", {"value": False})
    segna(stato.get("parole", 0) >= 60,
          f"{eti}: senza JavaScript il testo resta leggibile ({stato.get('parole')} parole)")
    segna(stato.get("invisibili") == 0,
          f"{eti}: senza JavaScript nessun blocco resta invisibile ({stato.get('invisibili')})")
    segna(stato.get("trab", 99) <= 1,
          f"{eti}: senza JavaScript nessun trabocco ({stato.get('trab')} px)")

    # 3. senza WebGL, solo dove serve
    if variante == "a":
        # lo script iniettato resta valido per OGNI documento successivo: se non lo
        # si toglie, le varianti provate dopo girano in un browser mutilato e
        # falliscono per colpa del banco. Misurato: senza la rimozione, b/ e c/
        # davano fotogrammi non misurati e salto al contenuto rosso
        await s.spegni()
        segno = await s.send("Page.addScriptToEvaluateOnNewDocument", {
            "source": "HTMLCanvasElement.prototype.getContext=function(){return null};"
        })
        await s.send("Page.navigate", {"url": url})
        await asyncio.sleep(2.6)
        senza = json.loads(await s.ev(
            "JSON.stringify({acceso:!!document.querySelector('#campo[data-acceso]'),"
            "parole:document.body.innerText.trim().split(/\\s+/).length,"
            "velo:!!document.querySelector('.velo')})"
        ) or "{}")
        segna(senza.get("acceso") is False, f"{eti}: senza WebGL il campo non si accende")
        segna(senza.get("velo") is True and senza.get("parole", 0) >= 60,
              f"{eti}: senza WebGL resta il ripiego statico e il testo ({senza.get('parole')} parole)")

        await s.send("Page.removeScriptToEvaluateOnNewDocument",
                     {"identifier": segno["identifier"]})
        await s.spegni()
        await s.send("Page.navigate", {"url": "about:blank"})
        await asyncio.sleep(0.4)
        pulito = None
        for _ in range(3):
            await s.send("Page.navigate", {"url": url})
            await asyncio.sleep(1.6)
            pulito = await s.ev("!!document.createElement('canvas').getContext('webgl2')")
            if pulito:
                break
        segna(pulito is True,
              f"{eti}: il browser torna intero dopo la prova senza WebGL")


def apri_browser():
    porta_cdp = porta_libera()
    profilo = tempfile.mkdtemp()
    proc = subprocess.Popen(
        [BRAVE, "--headless=new", f"--remote-debugging-port={porta_cdp}",
         f"--user-data-dir={profilo}", "--no-first-run", "--no-default-browser-check",
         "--disable-extensions", "--hide-scrollbars",
         "--use-gl=angle", "--enable-unsafe-swiftshader", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(80):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{porta_cdp}/json"))
            p = [t for t in tabs if t["type"] == "page"]
            if p:
                return proc, p[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        time.sleep(0.25)
    proc.kill()
    return None, None


async def main():
    if not Path(BRAVE).exists():
        print("browser non trovato")
        return 2

    porta_web = porta_libera()
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(porta_web)],
        cwd=str(BASE), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    radice_url = f"http://127.0.0.1:{porta_web}"
    time.sleep(1.0)

    try:
        # ogni variante nel suo browser. Le prove di ripiego spengono JavaScript,
        # tolgono WebGL e cambiano i media: in una sessione sola quello stato
        # sporca le varianti successive, che escono rosse per colpa del banco.
        # Misurato: con un browser unico, b/ e c/ perdevano fotogrammi e salto
        # al contenuto solo se venivano dopo i ripieghi di a/.
        for v in VARIANTI:
            proc, ws_url = apri_browser()
            if not ws_url:
                segna(None, f"{v}/: browser non agganciato, nessuna misura")
                continue
            try:
                async with websockets.connect(ws_url, max_size=300_000_000) as ws:
                    s = Sessione(ws)
                    await s.send("Page.enable")
                    await s.send("Runtime.enable")
                    await s.send("Log.enable")
                    for largo in LARGHEZZE:
                        for tema in TEMI:
                            await collauda(s, v, largo, tema, radice_url)
                    await ripieghi(s, v, radice_url)
                    s.lettore.cancel()
            finally:
                proc.kill()
    finally:
        server.kill()

    passati = sum(1 for e, _ in esiti if e is True)
    falliti = sum(1 for e, _ in esiti if e is False)
    aperti = sum(1 for e, _ in esiti if e is None)
    print(f"\n{passati} passati, {falliti} falliti, {aperti} non misurati, su {len(esiti)}")
    return 1 if (falliti or aperti) else 0


sys.exit(asyncio.run(main()))
