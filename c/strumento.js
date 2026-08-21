/* VARIANTE C - lo strumento.
   Tre meccanismi: il disegno tecnico che si compone tratto per tratto, le comparse
   dei blocchi, e tre misure vere della pagina che si aggiornano con un lampo breve.
   Le misure non sono scenografia: se il numero non e misurato, non va scritto. */

const radice = document.documentElement;
const ferma = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- tema */

const tasto = document.querySelector('[data-tema-tasto]');
const etichetta = document.querySelector('[data-tema-testo]');
const agoTema = document.querySelector('[data-tema-valore]');

function scriviTema(t) {
  radice.dataset.tema = t;
  if (etichetta) etichetta.textContent = t === 'scuro' ? 'Chiaro' : 'Scuro';
  if (tasto) tasto.setAttribute('aria-pressed', String(t === 'chiaro'));
  if (agoTema) lampeggia(agoTema, t);
  try { localStorage.setItem('tema-c', t); } catch (e) {}
}
if (tasto) {
  tasto.addEventListener('click', () =>
    scriviTema(radice.dataset.tema === 'scuro' ? 'chiaro' : 'scuro')
  );
}

/* --------------------------------------------------------- comparse */

const daEntrare = document.querySelectorAll('[data-entra], [data-disegno]');
if (ferma.matches) {
  daEntrare.forEach((el) => el.classList.add('is-dentro'));
} else {
  const oss = new IntersectionObserver(
    (voci) => {
      voci.forEach((v) => {
        if (v.isIntersecting) {
          v.target.classList.add('is-dentro');
          oss.unobserve(v.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );
  daEntrare.forEach((el) => oss.observe(el));
}

/* ------------------------------------------------- il disegno tecnico
   Ogni tratto porta la sua lunghezza vera, misurata dal browser: senza,
   un dasharray fisso fa partire i tratti corti troppo presto e i lunghi troppo
   tardi, e il disegno non sembra disegnato a mano. */

const disegno = document.querySelector('[data-disegno]');
if (disegno) {
  const ordine = ['riga', 'tacche', 'corsie', 'frecce', 'confine', 'varco', 'uscita'];
  ordine.forEach((gruppo, g) => {
    const nodi = disegno.querySelectorAll('.disegno__' + gruppo + ' path');
    nodi.forEach((p, i) => {
      let lung = 600;
      try { lung = Math.max(1, p.getTotalLength()); } catch (e) {}
      p.style.setProperty('--lung', lung.toFixed(1));
      p.style.setProperty('--ritardo', g * 220 + i * 45 + 'ms');
    });
  });
}

/* ------------------------------------------------------ le tre misure */

function lampeggia(el, valore) {
  if (!el || el.textContent === String(valore)) return;
  el.textContent = valore;
  el.setAttribute('data-cambia', '');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.removeAttribute('data-cambia'), 220);
}

const agoLarghezza = document.querySelector('[data-larghezza]');
const agoFps = document.querySelector('[data-fps]');

function misuraLarghezza() {
  if (agoLarghezza) lampeggia(agoLarghezza, window.innerWidth + ' px');
}
misuraLarghezza();
window.addEventListener('resize', misuraLarghezza, { passive: true });
scriviTema(radice.dataset.tema || 'scuro');

/* i fotogrammi si contano davvero, e il contatore si ferma quando la pagina
   non e visibile: un valore aggiornato a scheda nascosta sarebbe finto */
if (agoFps && !ferma.matches) {
  let n = 0;
  let da = performance.now();
  let vivo = true;

  function conta(ora) {
    if (!vivo) return;
    requestAnimationFrame(conta);
    n++;
    if (ora - da >= 900) {
      lampeggia(agoFps, Math.round((n * 1000) / (ora - da)) + ' /s');
      n = 0;
      da = ora;
    }
  }
  requestAnimationFrame(conta);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { vivo = false; }
    else { vivo = true; n = 0; da = performance.now(); requestAnimationFrame(conta); }
  });
} else if (agoFps) {
  agoFps.textContent = 'fermi';
}
