// Caroselli nel telefono: si sfogliano con il dito, con le frecce o con la tastiera; i pallini seguono la slide.
export function avvia() {
  const caroselli = [...document.querySelectorAll('[data-carosello]')];
  const pulizie = caroselli.map((c) => {
    const nastro = c.querySelector('[data-nastro]');
    const slide = [...nastro.children];
    const pallini = [...c.querySelectorAll('[data-pallino]')];
    const indietro = c.querySelector('[data-indietro]');
    const avanti = c.querySelector('[data-avanti]');
    const vai = (i) => nastro.scrollTo({ left: Math.max(0, Math.min(slide.length - 1, i)) * nastro.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const attuale = () => Math.round(nastro.scrollLeft / Math.max(1, nastro.clientWidth));
    const segna = () => {
      const k = attuale();
      pallini.forEach((p, i) => p.toggleAttribute('aria-current', i === k));
      if (indietro) indietro.disabled = k === 0;
      if (avanti) avanti.disabled = k === slide.length - 1;
    };
    const tasti = (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); vai(attuale() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); vai(attuale() - 1); } };
    const prima = () => vai(attuale() - 1);
    const dopo = () => vai(attuale() + 1);
    const clicPallino = (e) => vai(pallini.indexOf(e.currentTarget));
    nastro.addEventListener('scroll', segna, { passive: true });
    nastro.addEventListener('keydown', tasti);
    indietro?.addEventListener('click', prima);
    avanti?.addEventListener('click', dopo);
    pallini.forEach((p) => p.addEventListener('click', clicPallino));
    segna();
    return () => {
      nastro.removeEventListener('scroll', segna);
      nastro.removeEventListener('keydown', tasti);
      indietro?.removeEventListener('click', prima);
      avanti?.removeEventListener('click', dopo);
      pallini.forEach((p) => p.removeEventListener('click', clicPallino));
    };
  });
  return () => pulizie.forEach((f) => f());
}
