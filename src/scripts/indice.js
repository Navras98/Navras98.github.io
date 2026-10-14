// Indice delle sezioni (a destra) e righello con la percentuale di lettura.
export function avvia() {
  const doc = document.documentElement;
  const fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const indice = document.querySelector('[data-indice]');
  const righello = document.querySelector('[data-righello]');
  const conApertura = !!document.querySelector('[data-hero]');
  let raf = 0;
  // quando entra il piè di pagina l'indice si toglie: sulle pagine corte finirebbe sopra le sue colonne
  const piede = document.querySelector('footer.piede');
  const sulPiede = piede && indice ? new IntersectionObserver(([v]) => indice.classList.toggle('sul-piede', v.isIntersecting), { rootMargin: '0px 0px -12% 0px' }) : null;
  if (sulPiede) sulPiede.observe(piede);
  let aggiornaIndice = () => {};
  let aggiornaRighello = () => {};
  if (indice) {
    const voci = [...indice.querySelectorAll('li')];
    const sezioni = voci.map((li) => document.getElementById(li.dataset.voce));
    let corrente = -1, nascostoPrima = true;
    // una voce che passa sopra un testo o un'immagine si nasconde finché non torna su uno spazio vuoto
    // cosa c'è sotto una voce: 'testo' (le righe vere, non il riquadro dell'elemento), 'media' o niente
    const tocca = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    const contenuti = [...document.querySelectorAll(':is(main, footer) :is(h1, h2, h3, p, li > a, figcaption, img, video, .btn, .etichetta, dd, dt, input, button, a.tessera, .galleria-intera, .prova-etichetta, .passo-nodo, .ultimo-numero, article.progetto, .tappa-prova, .tappa-logo, .scheda-strumento-testa > span, tbody tr)')]
      .filter((e) => !e.closest('[data-indice]') && (!e.closest('[aria-hidden="true"]') || e.closest('[data-fasi-palco]')));
    const ol = indice.querySelector('ol');
    const sotto = (el) => {
      // posizione finale della voce, senza l'animazione in corso
      const o = ol.getBoundingClientRect();
      const r = { left: o.left + el.offsetLeft, top: o.top + el.offsetTop, right: o.left + el.offsetLeft + el.offsetWidth, bottom: o.top + el.offsetTop + el.offsetHeight };
      const fascia = { left: r.left - 4, right: r.right + 4, top: r.top - 4, bottom: r.bottom + 4 };
      let trovato = '';
      for (const e of contenuti) {
        const q = e.getBoundingClientRect();
        if (!q.width || !tocca(q, fascia)) continue;
        // i riquadri pieni (l'ultimo numero, le schede dei progetti, le righe delle tabelle) contano come un'immagine
        if (e.tagName === 'IMG' || e.tagName === 'VIDEO' || e.tagName === 'TR' || e.matches('.ultimo-numero, article.progetto, .tappa-prova, .tappa-logo')) { if (getComputedStyle(e).visibility !== 'hidden') trovato = 'media'; continue; }
        const rg = document.createRange();
        rg.selectNodeContents(e);
        for (const z of rg.getClientRects()) if (tocca(z, fascia)) return 'testo';
      }
      return trovato;
    };
    let ultimoControllo = 0;
    const controllaCoperture = (ora, subito = false) => {
      if (!subito && ora - ultimoControllo < 60) return;
      ultimoControllo = ora;
      voci.forEach((li) => {
        if (li.classList.contains('lontana')) return;
        const s = sotto(li.firstElementChild);
        // ogni voce, anche quella corrente, si nasconde finché passa sopra un testo o un'immagine
        if (li.classList.contains('corrente')) { li.classList.remove('coperta'); li.classList.toggle('sopra-testo', s !== ''); }
        else { li.classList.remove('sopra-testo'); li.classList.toggle('coperta', s !== ''); }
      });
    };
    aggiornaIndice = (ora) => {
      controllaCoperture(ora);
      const linea = innerHeight * 0.42;
      let k = 0;
      sezioni.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= linea) k = i; });
      const volo = parseFloat(doc.style.getPropertyValue('--volo') || '1');
      const nascondi = k === 0 && conApertura ? volo < 0.96 : false;
      if (k === corrente && nascondi === nascostoPrima) return;
      const prima = voci.map((li) => li.firstElementChild.getBoundingClientRect());
      indice.classList.toggle('in-apertura', nascondi);
      voci.forEach((li, i) => {
        li.classList.toggle('corrente', i === k);
        li.classList.toggle('primo-futuro', i === k + 1);
        li.classList.toggle('lontana', i < k || i > k + 3);
        li.classList.toggle('nascosto', i === 0 && nascondi);
        li.firstElementChild.tabIndex = i === 0 && nascondi ? -1 : 0;
        if (i === k) li.firstElementChild.setAttribute('aria-current', 'true'); else li.firstElementChild.removeAttribute('aria-current');
      });
      if (!fermo && corrente !== -1) {
        voci.forEach((li, i) => {
          const a = li.firstElementChild; const dopo = a.getBoundingClientRect(); const f = prima[i];
          if (!dopo.width || !f.width) return;
          // FLIP: dalla posizione e grandezza di prima a quelle nuove
          a.animate([
            { transform: `translate(${(f.right - dopo.right).toFixed(1)}px, ${(f.top - dopo.top).toFixed(1)}px) scale(${(f.width / dopo.width).toFixed(4)})` },
            { transform: 'none' },
          ], { duration: 520, easing: 'cubic-bezier(.25,1,.5,1)' });
        });
      }
      corrente = k; nascostoPrima = nascondi;
      controllaCoperture(performance.now(), true);
    };
  }
  if (righello) {
    const scala = righello.querySelector('.righello-scala');
    const segno = righello.querySelector('.righello-segno');
    const cifra = segno.querySelector('b');
    let H = 0;
    const costruisci = () => {
      H = doc.scrollHeight;
      let html = '';
      for (let i = 0; i <= 100; i++) {
        const top = ((i / 100) * H).toFixed(1);
        html += `<span class="${i % 5 === 0 ? 'lunga' : ''}" style="top:${top}px"></span>`;
        if (i % 5 === 0) html += `<b style="top:${top}px">${i}</b>`;
      }
      scala.innerHTML = html;
    };
    aggiornaRighello = () => {
      if (doc.scrollHeight !== H) costruisci();
      const y = window.scrollY, vh = innerHeight;
      const p = Math.min(1, Math.max(0, y / Math.max(1, H - vh)));
      scala.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
      segno.style.transform = `translate3d(0, ${(p * (vh - 1)).toFixed(1)}px, 0)`;
      cifra.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
    };
  }
  if (!indice && !righello) return;
  const largo = window.matchMedia('(min-width: 1100px) and (min-height: 620px)');
  const ciclo = (ora) => { if (largo.matches) { aggiornaIndice(ora); aggiornaRighello(); } raf = requestAnimationFrame(ciclo); };
  raf = requestAnimationFrame(ciclo);
  return () => { cancelAnimationFrame(raf); sulPiede?.disconnect(); };
}
