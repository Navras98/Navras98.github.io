// Apertura della home: carte (video e schermate) su tre anelli che girano attorno al nome, archi che ruotano,
// volo del nome verso l'indice. Le carte entrano dal centro all'arrivo e girano sempre; i video partono poco dopo
// il caricamento (o al primo gesto), solo per le carte in primo piano e solo con l'apertura visibile.
import { fermo, suona } from './video.js';
import { posto, trasforma } from '../lib/orbita.js';

const TESTATA = 48;
const ENTRATA = 1100; // ms per carta
const PASSO = 75; // ms tra una carta e la successiva

export function avvia() {
  const hero = document.querySelector('[data-hero]');
  const orbita = hero?.querySelector('[data-orbita]');
  if (!hero || !orbita) return;
  const doc = document.documentElement;
  const immobile = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wordmark = hero.querySelector('[data-wordmark]');
  const testoHero = hero.querySelector('[data-hero-testo]');
  const carte = [...orbita.querySelectorAll('[data-carta]')];
  const largo = window.matchMedia('(min-width: 1100px) and (min-height: 620px)');
  // ordine di entrata: prima le carte davanti
  const dati = carte.map((c, i) => ({ el: c, video: c.querySelector('video'), icona: c.classList.contains('carta-icona'), anello: Number(c.dataset.anello), fase: Number(c.dataset.fase), raggio: Number(c.dataset.raggio || 1), f: 0.6 + ((i * 37) % 10) / 25, suona: false, n: 0 }));
  [...dati].sort((p, q) => Number(q.el.style.getPropertyValue('--prof')) - Number(p.el.style.getPropertyValue('--prof'))).forEach((d, k) => { d.n = k; });
  let mx = 0, my = 0, tx = 0, ty = 0, t = 0, ultimo = performance.now(), visibile = true, vivo = false, volo = 0, raf = 0, inizio = 0;
  let vw = innerWidth, vh = innerHeight, altezzaHero = hero.offsetHeight;
  const eventi = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'];
  const sveglia = () => { if (vivo) return; vivo = true; doc.classList.add('vivo'); };
  let attesa = 0;
  if (!immobile) {
    eventi.forEach((ev) => addEventListener(ev, sveglia, { once: true, passive: true }));
    // i video partono da soli poco dopo il caricamento completo della pagina
    const dopo = () => { attesa = setTimeout(sveglia, 1200); };
    if (document.readyState === 'complete') dopo(); else addEventListener('load', dopo, { once: true });
  }
  // zone di rispetto: un rettangolo per ogni riga vera di testo (nome, titolo, testo, bottoni, riga piccola),
  // rispetto al centro dell'orbita. Una carta si spegne solo dove copre davvero del testo.
  let zone = [];
  const misuraZona = () => {
    if (!testoHero) return;
    const o = orbita.getBoundingClientRect();
    const cx = o.left + o.width / 2, cy = o.top + o.height / 2;
    const rette = [];
    for (const el of testoHero.children) {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      for (const r of rg.getClientRects()) if (r.width > 4 && r.height > 4) rette.push(r);
    }
    zone = rette.map((r) => ({ x0: r.left - cx - 10, x1: r.right - cx + 10, y0: r.top - cy - 6, y1: r.bottom - cy + 6 }));
  };
  const misura = () => { vw = innerWidth; vh = innerHeight; altezzaHero = hero.offsetHeight; misuraNome(); misuraZona(); };
  const mouse = (e) => { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; };
  addEventListener('resize', misura);
  if (!immobile) addEventListener('pointermove', mouse, { passive: true });
  // fuori schermo i video dell'apertura si fermano subito
  const io = new IntersectionObserver(([v]) => {
    visibile = v.isIntersecting;
    if (!visibile) dati.forEach((d) => { if (d.video && d.suona) { d.video.pause(); d.suona = false; } });
  }, { threshold: 0.05 });
  io.observe(hero);

  const misuraNome = () => {
    if (!wordmark) return;
    const t = wordmark.style.transform; wordmark.style.transform = 'none';
    const b = wordmark.getBoundingClientRect();
    wordmark.dataset.r = JSON.stringify({ cx: b.left + b.width / 2, cy: b.top + window.scrollY + b.height / 2, w: b.width });
    wordmark.style.transform = t;
  };

  const disegna = (ora) => {
    const dt = Math.min(64, ora - ultimo); ultimo = ora;
    if (!immobile) t += dt / 1000;
    tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
    const y = window.scrollY;
    const p = Math.min(1, y / Math.max(1, altezzaHero * 0.85));
    const altezza = Math.max(420, (altezzaHero || vh) - 0);
    for (const d of dati) {
      const q = posto(d.anello, d.fase, t, vw * (1 + p * 0.25), altezza, d.raggio);
      const prof = q.prof;
      // entrata: dal centro verso il posto, una carta dopo l'altra
      const e = immobile ? 1 : Math.min(1, Math.max(0, (ora - inizio - d.n * PASSO) / ENTRATA));
      const k = 1 - Math.pow(1 - e, 3);
      const dx = tx * (20 + 50 * prof) * d.f;
      const dy = ty * (16 + 40 * prof) * d.f - y * (0.12 + 0.38 * prof);
      const x = q.x * (0.35 + 0.65 * k) + dx, yc = q.y * (0.35 + 0.65 * k) + dy, sc = q.scala * (0.55 + 0.45 * k);
      d.el.style.transform = trasforma({ ...q, x, y: yc, scala: sc });
      // quanto la carta copre il testo (0–1): sopra il testo si spegne
      let velo = 1;
      const w = (d.w ??= d.el.offsetWidth) * sc, h = (d.h ??= d.el.offsetHeight) * sc;
      if (zone.length && y < altezzaHero && w * h > 0) {
        let coperto = 0;
        for (const z of zone) {
          const ox = Math.max(0, Math.min(x + w / 2, z.x1) - Math.max(x - w / 2, z.x0));
          const oy = Math.max(0, Math.min(yc + h / 2, z.y1) - Math.max(yc - h / 2, z.y0));
          coperto += ox * oy;
        }
        // sul telefono il testo è largo quasi quanto lo schermo: le carte ai bordi si spengono meno
        const forza = vw < 640 ? 0.55 : 1;
        velo = 1 - forza * Math.min(1, (coperto / (w * h)) * 4) * Math.max(0, 1 - volo * 1.6);
      }
      d.el.style.setProperty('--velo', velo.toFixed(3));
      // in tema chiaro una carta sopra il testo si spegne del tutto, con una dissolvenza breve e un margine
      // (si spegne sotto .85, si riaccende sopra .93): così non resta mai a metà, grigia sul fondo crema
      if (velo < 0.85 && !d.coperta) { d.coperta = true; d.el.classList.add('coperta'); }
      else if (velo > 0.93 && d.coperta) { d.coperta = false; d.el.classList.remove('coperta'); }
      d.el.style.zIndex = String(q.z);
      d.el.style.setProperty('--prof', prof.toFixed(3));
      d.el.style.setProperty('--entrata', k.toFixed(3));
      d.prof = prof; d.pronta = e === 1 && velo > 0.7;
    }
    // gira un video alla volta, il più vicino e libero dal testo (con l'orbita cambia: prima o poi girano tutti);
    // mentre il nome vola verso l'indice i video si fermano, così lo scorrimento resta fluido
    const davanti = dati.filter((d) => d.video && d.pronta).sort((a, b) => b.prof - a.prof).slice(0, 1);
    for (const d of dati) {
      if (!d.video) continue;
      const deve = vivo && visibile && !document.hidden && volo < 0.05 && davanti.includes(d) && d.prof > 0.32 && !fermo();
      if (deve !== d.suona) { d.suona = deve; deve ? suona(d.video) : d.video.pause(); }
    }
    if (wordmark && testoHero) {
      volo = Math.min(1, y / Math.max(1, altezzaHero * 0.55));
      const r = wordmark.dataset.r ? JSON.parse(wordmark.dataset.r) : null;
      if (largo.matches && !immobile && r) {
        const fs = parseFloat(getComputedStyle(wordmark).fontSize);
        const destX = vw - 60 - (r.w * 34 / fs) / 2 - 2;
        const destY = TESTATA + 58 + 17; // centro della voce corrente dell'indice (Indice.astro: ol a 58 px, voce da 34 px)
        const e = volo * volo * (3 - 2 * volo);
        wordmark.style.transform = `translate3d(${((destX - r.cx) * e).toFixed(1)}px, ${(y + (destY - r.cy) * e).toFixed(1)}px, 0) scale(${(1 - (1 - 34 / fs) * e).toFixed(4)})`;
        wordmark.style.opacity = volo > 0.96 ? '0' : '1';
      } else {
        wordmark.style.transform = immobile ? '' : `translate3d(0, ${(y * 0.35).toFixed(1)}px, 0)`;
        wordmark.style.opacity = '';
      }
      const resto = Math.max(0, 1 - volo * 1.6);
      for (const el of testoHero.children) if (el !== wordmark) el.style.opacity = resto < 1 ? resto.toFixed(3) : '';
    }
    doc.style.setProperty('--volo', volo.toFixed(3));
  };
  document.fonts?.ready.then(() => { misuraNome(); misuraZona(); });
  misuraNome();
  misuraZona();
  // le carte entrano dopo il nome e il testo, come in ArtCraft
  inizio = performance.now() + 1700;
  disegna(performance.now());
  orbita.classList.add('pronta');
  const ciclo = (ora) => { if (visibile || volo < 1) disegna(ora); raf = requestAnimationFrame(ciclo); };
  const scorri = () => disegna(performance.now());
  if (!immobile) raf = requestAnimationFrame(ciclo);
  else addEventListener('scroll', scorri, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    eventi.forEach((ev) => removeEventListener(ev, sveglia));
    clearTimeout(attesa);
    removeEventListener('resize', misura);
    removeEventListener('pointermove', mouse);
    removeEventListener('scroll', scorri);
    dati.forEach((d) => d.video?.pause());
    doc.classList.remove('vivo');
    doc.style.removeProperty('--volo');
  };
}
