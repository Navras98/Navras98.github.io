#!/usr/bin/env python3
"""Caccia ai traboccamenti: cerca ogni pezzo di contenuto che esce dal suo contenitore.

Il collaudo generale guarda se la pagina scorre in orizzontale. Non basta: un dato
puo' uscire da una tabella, o da una scheda, senza che la pagina intera si allarghi
(basta un overflow:hidden a monte, o una colonna che taglia il testo).

Questo attrezzo apre ogni pagina a sette larghezze e segnala tre cose diverse:

  TRABOCCA   l'elemento e' piu' largo del suo spazio (scrollWidth > clientWidth)
             e nessuno gli ha dato il permesso di scorrere: il contenuto e' tagliato
  ESCE       il rettangolo dell'elemento sfora il bordo destro della finestra
  TAGLIA     testo troncato da ellissi o nascosto da overflow:hidden senza scorrimento

Serve un browser con la porta di ispezione aperta e un server locale:
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \\
        --headless=new --remote-debugging-port=9333 --disable-gpu &
    python3 -m http.server 8899 --directory .
    python3 strumenti/traboccamenti.py

Esce con 1 se trova anche un solo traboccamento.
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

PAGINE = [
    "/", "/agenti/", "/casi/", "/modelli/", "/sicurezza/", "/dati/",
    "/privacy-bridge/", "/formazione/", "/contatti/", "/architettura/",
    "/automazione/", "/strumenti/", "/metodo/", "/modelli-in-locale/",
    "/404.html",
]

# larghezze vere di telefoni e tablet in circolazione, piu' i due estremi
LARGHEZZE = [
    (320, "iPhone SE 1a gen"),
    (360, "Android piccolo"),
    (390, "iPhone 14/15"),
    (414, "iPhone Plus"),
    (768, "iPad verticale"),
    (1024, "iPad orizzontale"),
    (1440, "portatile"),
]

# Lo script gira dentro la pagina: torna l'elenco dei traboccamenti trovati.
SONDA = r"""
(() => {
  const larghezzaFinestra = document.documentElement.clientWidth;
  const esiti = [];
  const visto = new Set();

  const descrivi = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cl = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cl.length) s += '.' + cl.join('.');
    for (const a of el.attributes) if (a.name.startsWith('data-') && !a.value) s += '[' + a.name + ']';
    return s;
  };

  const percorso = (el) => {
    const p = [];
    let n = el;
    while (n && n.nodeType === 1 && p.length < 5) { p.unshift(descrivi(n)); n = n.parentElement; }
    return p.join(' > ');
  };

  const testo = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 110);

  // Due cose escono dal loro spazio per costruzione, non per difetto:
  // il nastro dei loghi (scorre in continuo, largo il doppio dello schermo, dentro
  // un contenitore che lo taglia di proposito) e il testo dentro un disegno SVG,
  // dove scrollWidth non misura quello che si vede. Vanno esclusi, altrimenti
  // sette pagine restano rosse per sempre e il collaudo smette di dire qualcosa.
  const voluto = (el) => {
    if (el.ownerSVGElement || el.tagName === 'svg') return true;
    let n = el;
    for (let i = 0; n && i < 5; i++, n = n.parentElement) {
      const a = getComputedStyle(n).animationName || '';
      if (a.includes('scorri')) return true;
      if (n.hasAttribute && n.hasAttribute('data-nastro')) return true;
    }
    return false;
  };

  // Si guardano solo gli elementi che portano testo di loro (o un'immagine): sono
  // gli unici che possono perdere qualcosa. Un contenitore risulta troppo largo
  // ogni volta che un figlio lo e', e i fondali decorativi — riquadri vuoti larghi
  // 150vw messi li' apposta — non hanno niente da perdere. Segnalarli riempiva il
  // rapporto di righe che non si possono chiudere, e un rapporto cosi' non si legge.
  const portaTesto = (el) => {
    if (el.tagName === 'IMG') return true;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  };

  for (const el of document.querySelectorAll('body *')) {
    if (voluto(el) || !portaTesto(el)) continue;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    const scorreX = st.overflowX === 'auto' || st.overflowX === 'scroll';
    const nascondeX = st.overflowX === 'hidden' || st.overflowX === 'clip';
    const eccesso = el.scrollWidth - el.clientWidth;

    // 1. contenuto piu' largo della scatola, e la scatola non permette di scorrere
    if (eccesso > 1 && !scorreX && el.clientWidth > 0) {
      const chiave = 'T' + percorso(el);
      if (!visto.has(chiave)) {
        visto.add(chiave);
        esiti.push({
          tipo: nascondeX ? 'TAGLIA' : 'TRABOCCA',
          dove: percorso(el),
          eccesso: Math.round(eccesso),
          scatola: Math.round(el.clientWidth),
          contenuto: Math.round(el.scrollWidth),
          testo: testo(el),
        });
      }
    }

    // 2. il rettangolo sfora il bordo destro della finestra.
    //    Non vale dentro un contenitore che scorre: li' il contenuto e' piu' largo
    //    per costruzione e si raggiunge scorrendo, non e' perduto.
    let dentroUnoScorrevole = false;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n).overflowX;
      if (s === 'auto' || s === 'scroll') { dentroUnoScorrevole = true; break; }
    }
    if (r.right > larghezzaFinestra + 1 && st.position !== 'fixed' && !dentroUnoScorrevole) {
      const chiave = 'E' + percorso(el);
      if (!visto.has(chiave)) {
        visto.add(chiave);
        esiti.push({
          tipo: 'ESCE',
          dove: percorso(el),
          eccesso: Math.round(r.right - larghezzaFinestra),
          scatola: Math.round(larghezzaFinestra),
          contenuto: Math.round(r.right),
          testo: testo(el),
        });
      }
    }

    // 3. testo troncato dai puntini
    if (st.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      const chiave = 'P' + percorso(el);
      if (!visto.has(chiave)) {
        visto.add(chiave);
        esiti.push({
          tipo: 'TAGLIA',
          dove: percorso(el),
          eccesso: Math.round(el.scrollWidth - el.clientWidth),
          scatola: Math.round(el.clientWidth),
          contenuto: Math.round(el.scrollWidth),
          testo: testo(el),
        });
      }
    }
  }

  // la pagina intera scorre in orizzontale?
  const scorrimentoPagina = document.documentElement.scrollWidth - larghezzaFinestra;
  return JSON.stringify({ esiti, scorrimentoPagina, larghezzaFinestra });
})()
"""


async def apri_scheda():
    """Chrome recente vuole PUT su /json/new; se non passa, riusa una scheda aperta."""
    try:
        req = urllib.request.Request(f"{ISPEZIONE}/json/new?about:blank", method="PUT")
        dati = json.loads(urllib.request.urlopen(req).read())
        return dati["webSocketDebuggerUrl"], dati["id"]
    except Exception:
        schede = json.loads(urllib.request.urlopen(f"{ISPEZIONE}/json").read())
        pagine = [t for t in schede if t.get("type") == "page"]
        if not pagine:
            raise RuntimeError("nessuna scheda disponibile nel browser di ispezione")
        return pagine[0]["webSocketDebuggerUrl"], None


async def chiudi_scheda(ident):
    if not ident:
        return
    try:
        urllib.request.urlopen(f"{ISPEZIONE}/json/close/{ident}").read()
    except Exception:
        pass


class Sessione:
    def __init__(self, ws):
        self.ws = ws
        self.n = 0

    async def chiama(self, metodo, **parametri):
        self.n += 1
        mio = self.n
        await self.ws.send(json.dumps({"id": mio, "method": metodo, "params": parametri}))
        while True:
            msg = json.loads(await self.ws.recv())
            if msg.get("id") == mio:
                if "error" in msg:
                    raise RuntimeError(f"{metodo}: {msg['error']}")
                return msg.get("result", {})


async def misura_pagina(sess, indirizzo, larghezza):
    await sess.chiama(
        "Emulation.setDeviceMetricsOverride",
        width=larghezza, height=900, deviceScaleFactor=1,
        mobile=larghezza < 768,
    )
    await sess.chiama("Page.navigate", url=indirizzo)
    # aspetta che il runtime custom abbia finito di comporre la pagina
    for _ in range(60):
        await asyncio.sleep(0.25)
        r = await sess.chiama(
            "Runtime.evaluate",
            expression="document.readyState === 'complete' && document.querySelectorAll('body *').length",
            returnByValue=True,
        )
        if r.get("result", {}).get("value"):
            break
    await asyncio.sleep(0.9)  # animazioni di entrata e font
    r = await sess.chiama("Runtime.evaluate", expression=SONDA, returnByValue=True)
    return json.loads(r["result"]["value"])


async def principale():
    ws_url, ident = await apri_scheda()
    trovati = []
    try:
        async with websockets.connect(ws_url, max_size=60 * 1024 * 1024) as ws:
            sess = Sessione(ws)
            await sess.chiama("Page.enable")
            await sess.chiama("Runtime.enable")
            # Senza questa riga il browser riusa il foglio di stile gia' scaricato:
            # si corregge il CSS, si rilancia il collaudo e resta rosso lo stesso.
            await sess.chiama("Network.enable")
            await sess.chiama("Network.setCacheDisabled", cacheDisabled=True)
            for pagina in PAGINE:
                print(f"\n  {pagina}")
                for larghezza, nome in LARGHEZZE:
                    esito = await misura_pagina(sess, BASE + pagina, larghezza)
                    gravi = [e for e in esito["esiti"] if e["eccesso"] >= 2]
                    scorr = esito["scorrimentoPagina"]
                    stato = "ok" if not gravi and scorr <= 1 else "ROSSO"
                    extra = f" · pagina scorre di {scorr}px" if scorr > 1 else ""
                    print(f"    {stato:6} {larghezza:>4}px {nome:<18}{len(gravi):>3} traboccamenti{extra}")
                    for e in gravi:
                        trovati.append((pagina, larghezza, e))
    finally:
        await chiudi_scheda(ident)

    print("\n" + "=" * 78)
    if not trovati:
        print("  nessun traboccamento su 15 pagine x 7 larghezze")
        print("=" * 78)
        return 0

    # raggruppa per elemento: lo stesso difetto a piu' larghezze e' un difetto solo
    per_elemento = {}
    for pagina, larghezza, e in trovati:
        chiave = (pagina, e["dove"], e["tipo"])
        per_elemento.setdefault(chiave, {"larghezze": [], "esempio": e})
        per_elemento[chiave]["larghezze"].append(larghezza)
        if e["eccesso"] > per_elemento[chiave]["esempio"]["eccesso"]:
            per_elemento[chiave]["esempio"] = e

    print(f"  {len(per_elemento)} difetti distinti, {len(trovati)} occorrenze")
    print("=" * 78)
    for (pagina, dove, tipo), dati in sorted(
        per_elemento.items(), key=lambda x: -x[1]["esempio"]["eccesso"]
    ):
        e = dati["esempio"]
        larghezze = ", ".join(f"{l}px" for l in sorted(set(dati["larghezze"])))
        print(f"\n  {tipo}  {pagina}   a {larghezze}")
        print(f"    dove:      {dove}")
        print(f"    misura:    contenuto {e['contenuto']}px in una scatola da {e['scatola']}px "
              f"(+{e['eccesso']}px)")
        if e["testo"]:
            print(f"    testo:     {e['testo']}")
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(principale()))
