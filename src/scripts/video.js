// Video delle sezioni: partono quando sono visibili e si fermano fuori schermo.
// Con «riduci movimento» o «risparmio dati» resta la copertina. I video dell'apertura li guida apertura.js.
export const fermo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;

export const suona = (v) => {
  if (fermo()) return;
  const p = v.play();
  if (p) p.catch(() => { /* il browser può rifiutare: resta la copertina */ });
};

export function avvia() {
  const video = [...document.querySelectorAll('video[data-video]:not([data-attesa])')];
  if (!video.length || fermo()) return;
  const visibili = new Set();
  const io = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (v.isIntersecting) { visibili.add(v.target); suona(v.target); }
      else { visibili.delete(v.target); v.target.pause(); }
    }
  }, { threshold: 0.25 });
  video.forEach((v) => io.observe(v));
  const nascosta = () => (document.hidden ? video.forEach((v) => v.pause()) : visibili.forEach(suona));
  document.addEventListener('visibilitychange', nascosta);
  return () => { io.disconnect(); document.removeEventListener('visibilitychange', nascosta); video.forEach((v) => v.pause()); };
}
