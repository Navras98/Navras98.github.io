/* VARIANTE B - il carattere e tutto.
   Tre meccanismi, nessuna libreria: le lettere salgono da una maschera con un
   ritardo a cascata, il fondo cambia tinta fra le sezioni, e una fascia scorre in
   orizzontale mentre si scende. Il peso del movimento sta nelle curve e nel
   coefficiente di interpolazione, non nella durata. */

const radice = document.documentElement;
const ferma = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------------------------------------------------------- tema */

const tasto = document.querySelector('[data-tema-tasto]');
const etichetta = document.querySelector('[data-tema-testo]');

function scriviTema(t) {
  radice.dataset.tema = t;
  if (etichetta) etichetta.textContent = t === 'scuro' ? 'Chiaro' : 'Scuro';
  if (tasto) tasto.setAttribute('aria-pressed', String(t === 'chiaro'));
  try { localStorage.setItem('tema-b', t); } catch (e) {}
  tinta(attuale, true);
}
if (tasto) {
  tasto.addEventListener('click', () =>
    scriviTema(radice.dataset.tema === 'scuro' ? 'chiaro' : 'scuro')
  );
}

/* ------------------------------------------------ lettere sotto maschera */

document.querySelectorAll('[data-lettere]').forEach((el) => {
  const testo = el.textContent;
  el.textContent = '';
  /* una lettera per elemento, ma il testo resta leggibile: l'etichetta accessibile
     sta sul contenitore, cosi lo screen reader legge la parola e non le lettere */
  el.setAttribute('aria-label', testo);
  [...testo].forEach((ch, i) => {
    const s = document.createElement('i');
    s.textContent = ch;
    s.style.setProperty('--i', String(i));
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  });
});

/* --------------------------------------------------- nome a tutta larghezza */

const nome = document.querySelector('[data-adatta]');

function adatta() {
  if (!nome) return;
  const genitore = nome.parentElement;
  const st = getComputedStyle(genitore);
  const disponibile = genitore.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
  if (disponibile <= 0) return;
  nome.style.fontSize = '100px';
  const gamma = document.createRange();
  gamma.selectNodeContents(nome);
  const largo = gamma.getBoundingClientRect().width;
  if (!largo) return;
  nome.style.fontSize = Math.min((100 * disponibile) / largo, window.innerHeight * 0.36) + 'px';
}
adatta();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(adatta);
window.addEventListener('resize', adatta, { passive: true });

/* ------------------------------------------------------------- comparse */

const daEntrare = document.querySelectorAll('[data-riga], .riga');
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
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );
  daEntrare.forEach((el, i) => {
    if (el.hasAttribute('data-riga')) el.style.setProperty('--ritardo', i * 70 + 'ms');
    oss.observe(el);
  });
}

/* ------------------------------------------------------- tinte del fondo */

const sezioni = [...document.querySelectorAll('[data-tinta]')];
let attuale = sezioni.length ? sezioni[0].dataset.tinta : 'inchiostro';

function tinta(nomeTinta, forza) {
  if (!forza && nomeTinta === attuale) return;
  attuale = nomeTinta;
  const v = getComputedStyle(radice).getPropertyValue('--' + nomeTinta).trim();
  if (v) document.body.style.backgroundColor = v;
}
tinta(attuale, true);

if (sezioni.length) {
  const ossTinta = new IntersectionObserver(
    (voci) => {
      /* vince la sezione che occupa piu banda a meta schermo */
      let migliore = null;
      voci.forEach((v) => {
        if (v.isIntersecting && (!migliore || v.intersectionRatio > migliore.intersectionRatio)) {
          migliore = v;
        }
      });
      if (migliore) tinta(migliore.target.dataset.tinta);
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  sezioni.forEach((s) => ossTinta.observe(s));
}

/* ------------------------------------------- la fascia che scorre di lato */

const fascia = document.querySelector('[data-orizzontale]');
const nastro = document.querySelector('[data-nastro]');

if (fascia && nastro && !ferma.matches) {
  let corsa = 0;
  let bersaglio = 0;
  let ora = 0;
  let vivo = false;
  let giroAttivo = false;

  function misura() {
    /* la corsa e quanto il nastro sporge oltre lo schermo, non un numero a mano */
    corsa = Math.max(0, nastro.scrollWidth - window.innerWidth);
    fascia.style.height = window.innerHeight + corsa + 'px';
    if (corsa === 0) {
      nastro.style.transform = '';
      fascia.style.height = '';
    }
  }

  function passo() {
    if (!vivo) { giroAttivo = false; return; }
    giroAttivo = true;
    requestAnimationFrame(passo);
    const r = fascia.getBoundingClientRect();
    const avanti = Math.min(Math.max(-r.top / Math.max(1, corsa), 0), 1);
    bersaglio = avanti * corsa;
    /* interpolazione bassa: il nastro arriva in ritardo sullo scorrimento,
       ed e quel ritardo a dare il peso */
    ora += (bersaglio - ora) * 0.09;
    nastro.style.transform = 'translate3d(' + -ora.toFixed(2) + 'px,0,0)';
  }

  const ossFascia = new IntersectionObserver(
    (voci) => {
      vivo = voci.some((v) => v.isIntersecting);
      if (vivo && !giroAttivo) requestAnimationFrame(passo);
    },
    { rootMargin: '10% 0px 10% 0px' }
  );
  ossFascia.observe(fascia);

  misura();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(misura);
  let attesa;
  window.addEventListener('resize', () => {
    clearTimeout(attesa);
    attesa = setTimeout(misura, 140);
  });
}
