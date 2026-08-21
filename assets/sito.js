const CHIAVE = 'as-tema';

function applica(tema) {
  const r = document.documentElement;
  if (tema === 'chiaro') r.setAttribute('data-tema', 'chiaro');
  else r.removeAttribute('data-tema');
  document.querySelectorAll('[data-tema-btn]').forEach((b) => {
    b.textContent = tema === 'chiaro' ? 'Scuro' : 'Chiaro';
    b.setAttribute('aria-label', tema === 'chiaro' ? 'Passa al tema scuro' : 'Passa al tema chiaro');
  });
}

function tema() {
  let salvato = null;
  try { salvato = localStorage.getItem(CHIAVE); } catch (e) {}
  const scuroDiSistema = !window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)').matches;
  applica(salvato || (scuroDiSistema ? 'scuro' : 'chiaro'));

  document.querySelectorAll('[data-tema-btn]').forEach((b) => {
    if (b.dataset.legato) return;
    b.dataset.legato = '1';
    b.addEventListener('click', () => {
      const ora = document.documentElement.getAttribute('data-tema') === 'chiaro' ? 'scuro' : 'chiaro';
      applica(ora);
      try { localStorage.setItem(CHIAVE, ora); } catch (e) {}
    });
  });
}

function comparse() {
  const nodi = document.querySelectorAll('[data-reveal]');
  if (!nodi.length) return;
  if (!('IntersectionObserver' in window)) {
    nodi.forEach((n) => n.classList.add('vis'));
    return;
  }
  const oss = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (v.isIntersecting || v.boundingClientRect.bottom < 0) { v.target.classList.add('vis'); oss.unobserve(v.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  nodi.forEach((n) => oss.observe(n));

  const recupera = () => {
    nodi.forEach((n) => {
      if (!n.classList.contains('vis') && n.getBoundingClientRect().top < window.innerHeight) {
        n.classList.add('vis');
        oss.unobserve(n);
      }
    });
  };
  let atteso = false;
  window.addEventListener('scroll', () => {
    if (!atteso) { atteso = true; setTimeout(() => { atteso = false; recupera(); }, 140); }
  }, { passive: true });
  recupera();
}

function avanzamento() {
  const barra = document.querySelector('[data-avanzamento]');
  if (!barra) return;
  let atteso = false;
  const misura = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (h > 0 ? Math.min(1, window.scrollY / h) * 100 : 0) + '%';
    atteso = false;
  };
  window.addEventListener('scroll', () => {
    if (!atteso) { atteso = true; setTimeout(misura, 60); }
  }, { passive: true });
  misura();
}

function copia() {
  document.querySelectorAll('[data-copia]').forEach((b) => {
    if (b.dataset.legato) return;
    b.dataset.legato = '1';
    b.addEventListener('click', async () => {
      const testo = b.getAttribute('data-copia');
      const prima = b.textContent;
      try {
        await navigator.clipboard.writeText(testo);
        b.textContent = 'Copiato';
      } catch (e) {
        b.textContent = testo;
      }
      setTimeout(() => { b.textContent = prima; }, 2200);
    });
  });
}

function menu() {
  const bottone = document.querySelector('[data-burger]');
  const pannello = document.querySelector('[data-pannello]');
  if (!bottone || !pannello || bottone.dataset.legato) return;
  bottone.dataset.legato = '1';
  const chiudi = () => {
    pannello.style.display = 'none';
    bottone.setAttribute('aria-expanded', 'false');
  };
  bottone.addEventListener('click', () => {
    const aperto = pannello.style.display === 'block';
    pannello.style.display = aperto ? 'none' : 'block';
    bottone.setAttribute('aria-expanded', aperto ? 'false' : 'true');
  });
  pannello.querySelectorAll('a').forEach((a) => a.addEventListener('click', chiudi));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chiudi(); });
}

function cursore() {
  const r = document.documentElement;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let x = 0, y = 0, atteso = false;
  window.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!atteso) {
      atteso = true;
      requestAnimationFrame(() => {
        r.style.setProperty('--mx', x + 'px');
        r.style.setProperty('--my', y + 'px');
        atteso = false;
      });
    }
  }, { passive: true });
}

function parallasse() {
  const nodi = document.querySelectorAll('[data-parallasse]');
  if (!nodi.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let atteso = false;
  const muovi = () => {
    nodi.forEach((n) => {
      const f = parseFloat(n.getAttribute('data-parallasse')) || 0.08;
      const centro = n.getBoundingClientRect().top - window.innerHeight / 2;
      n.style.transform = 'translate3d(0,' + (-centro * f).toFixed(1) + 'px,0)';
    });
    atteso = false;
  };
  window.addEventListener('scroll', () => {
    if (!atteso) { atteso = true; requestAnimationFrame(muovi); }
  }, { passive: true });
  muovi();
}

let globali = false;
export function avvia() {
  document.documentElement.setAttribute('data-js', '');
  if (!globali) { globali = true; cursore(); parallasse(); }
  return avviaResto();
}
function avviaResto() {
  const nulla = () => {};
  nulla();
  tema();
  comparse();
  avanzamento();
  copia();
  menu();
}

let inCoda = null;
function ripassa() {
  if (inCoda) return;
  inCoda = setTimeout(() => { inCoda = null; try { avvia(); } catch (e) { console.error(e); } }, 120);
}
function osservaCrescita() {
  if (!document.body) return;
  new MutationObserver(ripassa).observe(document.body, { childList: true, subtree: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { avvia(); osservaCrescita(); });
else { avvia(); osservaCrescita(); }
