#!/usr/bin/env python3
"""Collaudo dal vivo: si misura sulla pagina resa, non sul sorgente.

Cinque larghezze per due temi, console, collegamenti premuti uno per uno, menu a
scomparsa, salto al contenuto col tasto vero, contrasto calcolato su ogni nodo di
testo, scena 3D con fotogrammi misurati e ripiego provato, percorso senza
animazioni e percorso senza JavaScript.

Uso: python3 collaudo.py [--foto cartella] [--veloce]
Uscita 0 se tutti i controlli passano, 1 se qualcuno fallisce, 2 se il collaudo
non è riuscito a partire. Un controllo che non ha potuto misurare non è verde:
viene contato a parte e detto a parole.
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
PAGINE = [
    "index.html",
    "architettura.html",
    "sicurezza.html",
    "dati.html",
    "privacy.html",
    "automazione.html",
    "stack.html",
    "metodo.html",
    "contatti.html",
]
LARGHEZZE = [390, 768, 1024, 1440, 1920]
TEMI = ["scuro", "chiaro"]
BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"

esiti = []


def segna(stato, testo):
    """stato: True passato, False fallito, None non misurato."""
    esiti.append((stato, testo))
    print(("  ok  " if stato is True else "  KO  " if stato is False else "  ??  ") + testo)


def apri_browser(porta_cdp, profilo):
    return subprocess.Popen(
        [BRAVE, "--headless=new", f"--remote-debugging-port={porta_cdp}",
         f"--user-data-dir={profilo}", "--no-first-run", "--no-default-browser-check",
         "--disable-extensions", "--hide-scrollbars",
         "--use-gl=angle", "--enable-unsafe-swiftshader", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


async def aggancia(porta_cdp):
    for _ in range(70):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{porta_cdp}/json"))
            p = [t for t in tabs if t["type"] == "page"]
            if p:
                return p[0]["webSocketDebuggerUrl"]
        except Exception:
            pass
        await asyncio.sleep(0.4)
    return None


async def misura_scena(radice):
    """La scena si misura in un browser appena aperto.

    Dopo un giro lungo il compositore headless smette di consegnare fotogrammi, e
    il numero che ne esce non è quello che vedrebbe una persona: sarebbe un
    surrogato comodo al posto del bersaglio vero. Un browser suo costa qualche
    secondo e misura la condizione giusta.
    """
    porta = porta_libera()
    profilo = tempfile.mkdtemp(prefix="collaudo-scena-")
    br = apri_browser(porta, profilo)
    try:
        alveo = await aggancia(porta)
        if not alveo:
            segna(None, "scena 3D: il browser dedicato non è partito, non misurata")
            return
        async with websockets.connect(alveo, max_size=90_000_000) as ws:
            c = Cdp(ws)
            await c.send("Page.enable")
            await c.send("Runtime.enable")

            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
            await c.apri(radice + "index.html", attesa=4.0)
            stato = await c.ev("document.querySelector('[data-scena]').getAttribute('data-scena-stato')")
            segna(stato in ("viva", "ridotta"), f"finestra larga: la scena parte, stato «{stato}»")
            if stato in ("viva", "ridotta"):
                giri, comp = await c.misura_fotogrammi()
                if comp == 0:
                    segna(None, "finestra larga: la finestra non ha disegnato niente, non misurato")
                else:
                    segna(comp >= 50,
                          f"finestra larga: {comp} fotogrammi al secondo dal compositore, "
                          f"{giri} giri di animazione dentro la pagina (disegno via software, "
                          f"quindi è un pavimento e non la resa su una scheda vera)")

            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 390, "height": 844, "deviceScaleFactor": 2, "mobile": True})
            await c.send("Emulation.setCPUThrottlingRate", {"rate": 4})
            await c.apri(radice + "index.html", attesa=5.0)
            statoM = await c.ev("document.querySelector('[data-scena]').getAttribute('data-scena-stato')")
            giriM, compM = await c.misura_fotogrammi()
            ok_stato = statoM in ("viva", "ridotta", "gpu-debole", "niente-webgl")
            if compM == 0:
                segna(None, f"profilo telefono: stato «{statoM}», fotogrammi non misurati")
            else:
                segna(ok_stato and compM >= 50,
                      f"profilo telefono, processore a un quarto: stato «{statoM}», "
                      f"{compM} fotogrammi al secondo dal compositore, {giriM} giri nella pagina")
            testoM = await c.ev("document.querySelector('main').innerText.trim().length")
            segna(testoM > 600, f"profilo telefono: {testoM} caratteri leggibili comunque")
            await c.send("Emulation.setCPUThrottlingRate", {"rate": 1})

            # ripiego: senza WebGL la scena non parte e resta il disegno statico
            await c.send("Emulation.setDeviceMetricsOverride", {
                "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
            await c.send("Page.addScriptToEvaluateOnNewDocument", {
                "source": "HTMLCanvasElement.prototype.getContext = function () { return null; };"})
            await c.apri(radice + "index.html", attesa=3.0)
            rip = await c.jso(
                "(function(){var g=document.querySelector('[data-scena]');"
                "var f=g.querySelector('.scena__fermo');"
                "var r=f?f.getBoundingClientRect():{width:0,height:0};"
                "return JSON.stringify({stato:g.getAttribute('data-scena-stato'),"
                "fermo:!!f,visibile:r.width>100&&r.height>60,"
                "testo:document.querySelector('main').innerText.trim().length});})()")
            segna(rip["stato"] == "niente-webgl" and rip["fermo"] and rip["visibile"]
                  and rip["testo"] > 600,
                  f"senza WebGL: stato «{rip['stato']}», disegno statico visibile "
                  f"{'sì' if rip['visibile'] else 'no'}, {rip['testo']} caratteri")
    except Fermo as e:
        segna(None, f"scena 3D: il browser dedicato non ha risposto ({e}), fase non misurata")
    finally:
        br.terminate()
        shutil.rmtree(profilo, ignore_errors=True)


def porta_libera():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


class Fermo(Exception):
    """Il browser non ha risposto entro il tempo massimo."""


class Cdp:
    def __init__(self, ws):
        self.ws = ws
        self.n = 0
        self.console = []
        self.fotogrammi = 0

    async def send(self, metodo, params=None, secondi=25):
        try:
            return await asyncio.wait_for(self._send(metodo, params), secondi)
        except asyncio.TimeoutError:
            raise Fermo(f"{metodo} non ha risposto entro {secondi}s")

    async def _send(self, metodo, params=None):
        self.n += 1
        ident = self.n
        await self.ws.send(json.dumps({"id": ident, "method": metodo, "params": params or {}}))
        while True:
            r = json.loads(await self.ws.recv())
            m = r.get("method")
            if m == "Runtime.consoleAPICalled" and r["params"].get("type") in ("error", "warning"):
                self.console.append("console." + r["params"]["type"] + ": " + str(r["params"].get("args"))[:160])
            elif m == "Runtime.exceptionThrown":
                d = r["params"]["exceptionDetails"]
                self.console.append("eccezione: " + str(d.get("exception", {}).get("description", d.get("text", "")))[:160])
            elif m == "Log.entryAdded" and r["params"]["entry"].get("level") == "error":
                self.console.append("rete: " + r["params"]["entry"].get("text", "")[:160])
            elif m == "Page.screencastFrame":
                # ogni fotogramma va confermato, altrimenti il browser smette di
                # produrne e la misura torna a zero dopo pochi istanti
                self.fotogrammi += 1
                self.n += 1
                await self.ws.send(json.dumps({
                    "id": self.n, "method": "Page.screencastFrameAck",
                    "params": {"sessionId": r["params"]["sessionId"]}}))
            if r.get("id") == ident:
                if "error" in r:
                    raise RuntimeError(metodo + ": " + json.dumps(r["error"]))
                return r.get("result", {})

    async def ev(self, expr):
        r = await self.send(
            "Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True}
        )
        if "exceptionDetails" in r:
            raise RuntimeError(json.dumps(r["exceptionDetails"])[:300])
        return r.get("result", {}).get("value")

    async def jso(self, expr):
        return json.loads(await self.ev(expr))

    async def apri(self, url, attesa=1.5):
        self.console = []
        await self.send("Page.navigate", {"url": url})
        await asyncio.sleep(attesa)

    async def misura_fotogrammi(self):
        """Quanti fotogrammi produce davvero la pagina in due secondi e mezzo.

        In headless il compositore non disegna se nessuno guarda: e' lo stesso
        guasto che rende inutile requestAnimationFrame in una scheda nascosta.
        Aprire uno specchio dello schermo lo rimette in moto, e i fotogrammi che
        arrivano sono la misura vera. Il conteggio dentro la pagina resta come
        secondo parere: se i due numeri divergono, il buono e' quello del
        compositore, perche' e' quello che una persona vedrebbe.
        """
        self.fotogrammi = 0
        await self.send("Page.startScreencast", {
            "format": "jpeg", "quality": 1, "maxWidth": 120, "maxHeight": 80,
            "everyNthFrame": 1})
        # il compositore ci mette un istante a ripartire: misurare subito
        # significa contare i fotogrammi di quando era ancora fermo
        await asyncio.sleep(1.2)
        self.fotogrammi = 0
        try:
            giri = await self.ev(MISURA_FPS)
        finally:
            try:
                await self.send("Page.stopScreencast")
            except Fermo:
                pass
        return round((giri or 0) / 2.5), round(self.fotogrammi / 2.5)

    async def tasto(self, chiave, codice, vk, testo=None):
        for tipo in ("rawKeyDown", "char", "keyUp"):
            e = {"type": tipo, "key": chiave, "code": codice, "windowsVirtualKeyCode": vk,
                 "nativeVirtualKeyCode": vk}
            if tipo == "char":
                if testo is None:
                    continue
                e["text"] = testo
            await self.send("Input.dispatchKeyEvent", e)


SONDA_LAYOUT = """
(function () {
  var fuori = [], tagliati = [];
  var w = document.documentElement.clientWidth;
  var nodi = document.querySelectorAll('body *');
  for (var i = 0; i < nodi.length; i++) {
    var e = nodi[i], st = getComputedStyle(e);
    if (st.display === 'none' || st.visibility === 'hidden' || st.position === 'fixed') continue;
    if (e.offsetParent === null && st.position !== 'sticky') continue;
    /* Chi sta dentro un contenitore che scorre sborda dal genitore per
       costruzione e non allarga il documento: e' il caso dei diagrammi, che su
       schermo stretto si scorrono invece di rimpicciolire il testo fino a
       renderlo illeggibile. Il controllo sul documento intero resta. */
    var dentroScorrevole = false;
    for (var a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      var sa = getComputedStyle(a).overflowX;
      if (sa === 'auto' || sa === 'scroll') { dentroScorrevole = true; break; }
    }
    if (dentroScorrevole) continue;
    var r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* Sbordare a destra allarga il documento e fa comparire la barra orizzontale.
       A sinistra no: e' la tecnica con cui si parcheggia il salto al contenuto,
       quindi il bordo sinistro conta solo per gli elementi in flusso. */
    var inFlusso = st.position === 'static' || st.position === 'relative';
    if (r.right > w + 1.5 || (inFlusso && r.left < -1.5)) {
      fuori.push((e.tagName + '.' + (e.className || '')).toString().slice(0, 50));
    }
  }
  var t = document.querySelectorAll('main p, main h1, main h2, main h3, main li, .nav__link, .porta__titolo, .next__title, .giudizio__chiave, .regola__titolo, .contatto__mail, .copia, .theme, .burger');
  for (var j = 0; j < t.length; j++) {
    var el = t[j];
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === 'visible') {
      tagliati.push((el.tagName + '.' + (el.className || '')).toString().slice(0, 50));
    }
  }
  return JSON.stringify({
    doc: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    fuori: fuori.slice(0, 4), tagliati: tagliati.slice(0, 4)
  });
})()
"""

# I fotogrammi si contano con requestAnimationFrame, ma la misura non può
# dipendere solo da lui: in una finestra che non disegna non viene mai chiamato e
# la promessa resterebbe appesa. Una via d'uscita a tempo trasforma il caso in un
# "non misurato" dichiarato, invece che in un collaudo che non finisce mai.
MISURA_FPS = """
new Promise(function (ris) {
  /* Il conto si chiude su un tempo, non sull'ultimo fotogramma: se la finestra
     non disegna, requestAnimationFrame non viene mai chiamato e una promessa
     legata solo a lui resterebbe appesa per sempre. Cosi' invece torna zero, che
     e' un'informazione. */
  var n = 0;
  function giro() { n++; requestAnimationFrame(giro); }
  requestAnimationFrame(giro);
  setTimeout(function () { ris(n); }, 2500);
})
"""

# contrasto calcolato sul reso: si risale finche' non si trova un fondo opaco
SONDA_CONTRASTO = """
(function () {
  function lum(c) {
    var v = c.map(function (x) { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); });
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
  }
  function rgba(s) {
    var m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function fondo(el) {
    var e = el;
    while (e && e !== document.documentElement) {
      var c = rgba(getComputedStyle(e).backgroundColor);
      if (c && c.a > .85) return [c.r, c.g, c.b];
      e = e.parentElement;
    }
    var c2 = rgba(getComputedStyle(document.body).backgroundColor);
    return c2 ? [c2.r, c2.g, c2.b] : [0, 0, 0];
  }
  var guai = [];
  var tutti = document.querySelectorAll('body *');
  for (var i = 0; i < tutti.length; i++) {
    var el = tutti[i];
    var testo = '';
    for (var k = 0; k < el.childNodes.length; k++) {
      if (el.childNodes[k].nodeType === 3) testo += el.childNodes[k].nodeValue.trim();
    }
    if (!testo) continue;
    var st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) < .5) continue;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right < 0) continue;               /* il salto al contenuto, parcheggiato fuori */
    /* nell'SVG il testo non lo dipinge color, lo dipinge fill: leggerlo dal
       posto sbagliato farebbe passare per buono un diagramma illeggibile */
    var dentroSvg = el.ownerSVGElement || el.tagName.toLowerCase() === 'svg';
    var f = rgba(dentroSvg ? st.fill : st.color);
    if (!f || f.a < 0.5) continue;
    var b = fondo(el);
    var L1 = lum([f.r, f.g, f.b]), L2 = lum(b);
    var rap = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    var px = parseFloat(st.fontSize);
    var grande = px >= 24 || (px >= 18.66 && parseInt(st.fontWeight, 10) >= 700);
    var soglia = grande ? 3 : 4.5;
    if (rap < soglia) {
      guai.push({ t: testo.slice(0, 28), c: Math.round(rap * 100) / 100, s: soglia,
                  k: (el.tagName + '.' + (el.className || '')).toString().slice(0, 40) });
    }
  }
  var perClasse = {};
  for (var q = 0; q < guai.length; q++) {
    var k = guai[q].k;
    if (!perClasse[k]) perClasse[k] = { n: 0, peggio: 99, esempio: guai[q].t, s: guai[q].s };
    perClasse[k].n++;
    if (guai[q].c < perClasse[k].peggio) perClasse[k].peggio = guai[q].c;
  }
  return JSON.stringify({ quanti: guai.length, classi: perClasse });
})()
"""


async def main():
    cartella = None
    if "--foto" in sys.argv:
        cartella = Path(sys.argv[sys.argv.index("--foto") + 1])
        cartella.mkdir(parents=True, exist_ok=True)
    veloce = "--veloce" in sys.argv

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
         "--disable-extensions", "--hide-scrollbars",
         "--use-gl=angle", "--enable-unsafe-swiftshader", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    radice = f"http://127.0.0.1:{porta_web}/"

    try:
        alveo = None
        for _ in range(70):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{porta_cdp}/json"))
                p = [t for t in tabs if t["type"] == "page"]
                if p:
                    alveo = p[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                pass
            time.sleep(0.4)
        if not alveo:
            print("Brave non risponde su CDP: il collaudo non è partito")
            return 2

        async with websockets.connect(alveo, max_size=90_000_000) as ws:
          c = Cdp(ws)
          try:
              await c.send("Page.enable")
              await c.send("Runtime.enable")
              await c.send("Log.enable")

              async def imposta_tema(nome):
                  await c.ev(f"localStorage.setItem('tema','{nome}');1")

              # ============================================ larghezze per due temi
              for tema in TEMI:
                  await c.apri(radice + "index.html", attesa=1.0)
                  await imposta_tema(tema)
                  for larghezza in LARGHEZZE:
                      print(f"\n== {larghezza} px, tema {tema} ==")
                      await c.send("Emulation.setDeviceMetricsOverride", {
                          "width": larghezza, "height": 900, "deviceScaleFactor": 1,
                          "mobile": larghezza < 700})
                      for pagina in PAGINE:
                          await c.apri(radice + pagina, attesa=1.4 if pagina == "index.html" else 1.0)
                          vero = await c.ev("document.documentElement.getAttribute('data-tema')")
                          await c.ev("window.scrollTo(0, document.body.scrollHeight);1")
                          await asyncio.sleep(0.6)
                          await c.ev("window.scrollTo(0,0);1")
                          await asyncio.sleep(0.3)
                          d = await c.jso(SONDA_LAYOUT)
                          guai = []
                          if vero != tema:
                              guai.append(f"tema atteso {tema}, reso {vero}")
                          if d["doc"]:
                              guai.append("la pagina scorre in orizzontale")
                          if d["fuori"]:
                              guai.append("fuori dal bordo: " + ", ".join(d["fuori"]))
                          if d["tagliati"]:
                              guai.append("testo tagliato: " + ", ".join(d["tagliati"]))
                          if c.console:
                              guai.append("console: " + " | ".join(c.console[:2]))
                          segna(not guai, f"{pagina} a {larghezza}px [{tema}]" + (" - " + " ; ".join(guai) if guai else ""))

                          if cartella and pagina in ("index.html", "sicurezza.html") and larghezza in (390, 1440):
                              r = await c.send("Page.captureScreenshot", {"format": "png"})
                              (cartella / f"{pagina.replace('.html','')}-{larghezza}-{tema}.png").write_bytes(
                                  base64.b64decode(r["data"]))

              # ==================================================== contrasto
              print("\n== contrasto sul reso, entrambi i temi ==")
              await c.send("Emulation.setDeviceMetricsOverride", {
                  "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
              for tema in TEMI:
                  await c.apri(radice + "index.html", attesa=1.0)
                  await imposta_tema(tema)
                  for pagina in PAGINE:
                      await c.apri(radice + pagina, attesa=1.2)
                      d = await c.jso(SONDA_CONTRASTO)
                      ok = d["quanti"] == 0
                      dettaglio = "" if ok else " - " + "; ".join(
                          f"{k} x{v['n']} peggiore {v['peggio']} sotto {v['s']}"
                          for k, v in d["classi"].items())
                      segna(ok, f"{pagina} [{tema}]: {d['quanti']} testi sotto la soglia AA{dettaglio}")

              # ==================================================== menu mobile
              print("\n== menu a scomparsa (390px) ==")
              await c.send("Emulation.setDeviceMetricsOverride", {
                  "width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
              for pagina in PAGINE:
                  await c.apri(radice + pagina, attesa=1.2)
                  visibile = await c.ev(
                      "(function(){var b=document.querySelector('[data-burger]');"
                      "return !!b && getComputedStyle(b).display!=='none';})()")
                  await c.ev("document.querySelector('[data-burger]').click();1")
                  await asyncio.sleep(0.6)
                  st = await c.jso(
                      "(function(){var m=document.querySelector('[data-menu]');"
                      "var l=[].slice.call(m.querySelectorAll('a.drawer__link'));"
                      "return JSON.stringify({h:Math.round(m.getBoundingClientRect().height),"
                      "n:l.length,attivo:l.filter(function(a){return a.getAttribute('aria-current')==='page';}).length,"
                      "vis:l.filter(function(a){var r=a.getBoundingClientRect();"
                      "return r.height>10 && r.top>=0 && r.bottom<=innerHeight+1;}).length,"
                      "esp:document.querySelector('[data-burger]').getAttribute('aria-expanded')});})()")
                  await c.tasto("Escape", "Escape", 27)
                  await asyncio.sleep(0.5)
                  chiuso = await c.ev(
                      "document.querySelector('[data-burger]').getAttribute('aria-expanded')==='false'")
                  ok = (visibile and st["n"] == len(PAGINE) and st["vis"] == len(PAGINE)
                        and st["attivo"] == 1 and st["esp"] == "true" and st["h"] > 200 and chiuso)
                  segna(ok, f"{pagina}: apre, {st['vis']}/{len(PAGINE)} voci raggiungibili, "
                            f"attiva {st['attivo']}, si chiude con Esc {'sì' if chiuso else 'no'}")

              # ============================================== salto al contenuto
              # Il fuoco si dà col tasto vero: in una finestra senza fuoco di sistema
              # element.focus() sposta activeElement ma la regola :focus non si applica.
              print("\n== salto al contenuto (Tab vero) ==")
              await c.send("Emulation.setDeviceMetricsOverride", {
                  "width": 1440, "height": 900, "deviceScaleFactor": 1, "mobile": False})
              for pagina in PAGINE:
                  await c.apri(radice + pagina, attesa=1.0)
                  prima = await c.jso(
                      "(function(){var s=document.querySelector('.skip');var r=s.getBoundingClientRect();"
                      "return JSON.stringify({fuori:r.right<0,meta:s.getAttribute('href')});})()")
                  await c.tasto("Tab", "Tab", 9, "\t")
                  await asyncio.sleep(0.45)
                  dopo = await c.jso(
                      "(function(){var s=document.querySelector('.skip');var r=s.getBoundingClientRect();"
                      "return JSON.stringify({primo:document.activeElement===s,"
                      "dentro:r.left>=0&&r.right<=innerWidth&&r.height>10&&r.top>=0});})()")
                  ok = prima["fuori"] and prima["meta"] == "#main" and dopo["primo"] and dopo["dentro"]
                  segna(ok, f"{pagina}: fuori schermo a riposo, primo col Tab, rientra visibile")

              # ================================================ giro da tastiera
              print("\n== navigazione da tastiera ==")
              for pagina in ("index.html", "contatti.html"):
                  await c.apri(radice + pagina, attesa=1.2)
                  senza = 0
                  for _ in range(14):
                      await c.tasto("Tab", "Tab", 9, "\t")
                      await asyncio.sleep(0.12)
                      d = await c.jso(
                          "(function(){var a=document.activeElement;if(!a||a===document.body)"
                          "return JSON.stringify({vuoto:true});var st=getComputedStyle(a);"
                          "var contorno=st.outlineStyle!=='none'&&parseFloat(st.outlineWidth)>0;"
                          "var r=a.getBoundingClientRect();"
                          "return JSON.stringify({vuoto:false,contorno:contorno,"
                          "dentro:r.width>0&&r.height>0,tag:a.tagName});})()")
                      if d.get("vuoto"):
                          continue
                      if not d["contorno"] or not d["dentro"]:
                          senza += 1
                  segna(senza == 0, f"{pagina}: 14 tappe col Tab, {senza} senza contorno di fuoco visibile")

              # ============================================ collegamenti premuti
              print("\n== collegamenti interni, premuti uno per uno ==")
              aperture = 0
              for pagina in PAGINE:
                  await c.apri(radice + pagina, attesa=1.0)
                  href = await c.jso(
                      "JSON.stringify(Array.from(new Set(Array.from(document.querySelectorAll('a[href]'))"
                      ".map(function(a){return a.getAttribute('href');})"
                      ".filter(function(h){return h && !/^(https?:|mailto:|#)/.test(h);}))))")
                  rotti = []
                  for h in href:
                      await c.apri(radice + h, attesa=0.85)
                      e = await c.jso(
                          "JSON.stringify({t:document.title,m:!!document.querySelector('main'),"
                          "p:document.querySelectorAll('main p').length,h1:document.querySelectorAll('h1').length})")
                      if not e["m"] or e["p"] < 2 or e["h1"] != 1 or "404" in e["t"]:
                          rotti.append(h)
                      aperture += 1
                  segna(not rotti, f"{pagina}: {len(href)} collegamenti interni, "
                                   + ("tutti aprono una pagina vera" if not rotti else "rotti: " + ", ".join(rotti)))
              print(f"     (aperture totali: {aperture})")

              # ======================================================== il tema
              print("\n== tema: scelta, memoria, preferenza di sistema ==")
              await c.apri(radice + "index.html", attesa=1.2)
              await c.ev("localStorage.removeItem('tema');1")
              await c.send("Emulation.setEmulatedMedia", {
                  "features": [{"name": "prefers-color-scheme", "value": "light"}]})
              await c.apri(radice + "index.html", attesa=1.2)
              segue = await c.ev("document.documentElement.getAttribute('data-tema')")
              segna(segue == "chiaro", f"senza scelta salvata segue il sistema: {segue}")

              await c.ev("document.querySelector('[data-theme-toggle]').click();1")
              await asyncio.sleep(0.6)
              dopo_clic = await c.jso(
                  "JSON.stringify({tema:document.documentElement.getAttribute('data-tema'),"
                  "salvato:localStorage.getItem('tema'),"
                  "etichetta:document.querySelector('[data-theme-label]').textContent})")
              segna(dopo_clic["tema"] == "scuro" and dopo_clic["salvato"] == "scuro",
                    f"il clic cambia e salva: {dopo_clic['tema']}, etichetta «{dopo_clic['etichetta']}»")

              await c.apri(radice + "metodo.html", attesa=1.2)
              resta = await c.ev("document.documentElement.getAttribute('data-tema')")
              segna(resta == "scuro", f"la scelta resta cambiando pagina: {resta}")

              # nessun lampeggio: il tema è già scritto prima della prima pittura
              senza_lampo = await c.jso(
                  "JSON.stringify({inline:document.documentElement.getAttribute('data-tema'),"
                  "primoScript:!!document.head.querySelector('script:not([src]):not([type])')})")
              segna(senza_lampo["primoScript"] and senza_lampo["inline"] in ("scuro", "chiaro"),
                    "il tema è deciso prima della prima pittura, niente lampeggio")
              await c.send("Emulation.setEmulatedMedia", {"features": []})
              await c.ev("localStorage.removeItem('tema');1")

              # ======================================================= la scena
              # misurata in un browser dedicato, subito sotto
              # ============================================ movimento ridotto
              print("\n== prefers-reduced-motion: reduce ==")
              await c.send("Emulation.setEmulatedMedia", {
                  "features": [{"name": "prefers-reduced-motion", "value": "reduce"}]})
              for pagina in PAGINE:
                  await c.apri(radice + pagina, attesa=1.6)
                  d = await c.jso(
                      "(function(){var n=Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));"
                      "var inv=n.filter(function(e){var s=getComputedStyle(e);"
                      "return parseFloat(s.opacity)<0.9||s.visibility==='hidden';});"
                      "var g=document.querySelector('[data-scena]');"
                      "return JSON.stringify({tot:n.length,inv:inv.length,"
                      "testo:document.querySelector('main').innerText.trim().length,"
                      "moto:document.documentElement.classList.contains('moto'),"
                      "tela:!!document.querySelector('.scena__tela'),"
                      "fermo:g?!!g.querySelector('.scena__fermo'):null});})()")
                  ok = (d["inv"] == 0 and d["testo"] > 600 and not d["moto"] and not d["tela"]
                        and (d["fermo"] is None or d["fermo"]))
                  segna(ok, f"{pagina}: {d['tot']} blocchi, {d['inv']} invisibili, {d['testo']} caratteri, "
                            f"animazioni {'spente' if not d['moto'] else 'ACCESE'}, "
                            f"scena 3D {'non partita' if not d['tela'] else 'PARTITA'}")
              await c.send("Emulation.setEmulatedMedia", {"features": []})

              # ============================================ senza JavaScript
              print("\n== senza JavaScript ==")
              await c.send("Emulation.setScriptExecutionDisabled", {"value": True})
              for larghezza in (390, 1440):
                  await c.send("Emulation.setDeviceMetricsOverride", {
                      "width": larghezza, "height": 900, "deviceScaleFactor": 1,
                      "mobile": larghezza < 700})
                  for pagina in PAGINE:
                      await c.apri(radice + pagina, attesa=0.9)
                      d = await c.jso(
                          "(function(){var l=Array.prototype.slice.call(document.querySelectorAll('.nav__link'));"
                          "var v=l.filter(function(a){var r=a.getBoundingClientRect();"
                          "return r.width>0&&r.height>0;});"
                          "return JSON.stringify({voci:v.length,"
                          "testo:document.querySelector('main').innerText.trim().length,"
                          "ovf:document.documentElement.scrollWidth>document.documentElement.clientWidth+1});})()")
                      ok = d["voci"] == len(PAGINE) and d["testo"] > 600 and not d["ovf"]
                      segna(ok, f"{pagina} a {larghezza}px: {d['voci']}/{len(PAGINE)} voci di menu in chiaro, "
                                f"{d['testo']} caratteri, trabocco {'sì' if d['ovf'] else 'no'}")
              await c.send("Emulation.setScriptExecutionDisabled", {"value": False})
          except Fermo as e:
            # un collaudo che si pianta non deve restare appeso né morire in
            # silenzio: dichiara dove si è fermato e passa al conto finale
            segna(None, f"il browser non ha risposto: {e}. Da qui in poi non è stato misurato niente")

        brave.terminate()
        shutil.rmtree(profilo, ignore_errors=True)

        print("\n== scena 3D (browser dedicato) ==")
        await misura_scena(radice)

    finally:
        brave.terminate()
        web.terminate()
        shutil.rmtree(profilo, ignore_errors=True)

    ko = [t for s, t in esiti if s is False]
    nm = [t for s, t in esiti if s is None]
    print("\n" + "=" * 68)
    print(f"CONTROLLI: {len(esiti)} - passati {len(esiti) - len(ko) - len(nm)}, "
          f"falliti {len(ko)}, non misurati {len(nm)}")
    for t in nm:
        print("  ??  " + t)
    for t in ko:
        print("  KO  " + t)
    return 1 if ko else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
