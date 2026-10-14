// Entrate allo scroll come ArtCraft: un elemento entra quando il suo bordo superiore arriva all'85% della finestra;
// nelle griglie ogni scheda ritarda in base alla sua posizione orizzontale (al massimo 0,18 s, da sinistra a destra).
export function avvia() {
  const ritardo = (el) => {
    const g = el.parentElement;
    if (!g || getComputedStyle(g).display !== 'grid') return 0;
    const r = g.getBoundingClientRect();
    const x = el.getBoundingClientRect().left - r.left;
    return r.width > 0 ? Math.max(0, Math.min(0.18, (x / r.width) * 0.18)) : 0;
  };
  const osserva = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (!v.isIntersecting) continue;
      const el = v.target;
      if (el.matches('.sezione')) el.classList.add('disegnata');
      else { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--ritardo', `${ritardo(el).toFixed(3)}s`); el.classList.add('visibile'); }
      osserva.unobserve(el);
    }
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });
  document.querySelectorAll('[data-rivela], .sezione').forEach((el) => osserva.observe(el));
  return () => osserva.disconnect();
}
