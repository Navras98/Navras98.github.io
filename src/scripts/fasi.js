// Pagina Metodo: il palco fisso a destra mostra la fase che si sta leggendo, e solo il suo video gira.
import { fermo, suona } from './video.js';

export function avvia() {
  const radice = document.querySelector('[data-fasi]');
  const palco = radice?.querySelector('[data-fasi-palco]');
  if (!radice || !palco) return;
  const fasi = [...radice.querySelectorAll('[data-fase]')];
  const voci = [...palco.querySelectorAll('[data-voce]')];
  let attiva = 0, visibile = false;
  const aggiorna = () => {
    fasi.forEach((f, i) => f.toggleAttribute('data-attiva', i === attiva));
    // il palco prende la luce del colore della fase in lettura
    const colore = voci[attiva] && getComputedStyle(voci[attiva]).getPropertyValue('--app').trim();
    if (colore) palco.style.setProperty('--app', colore);
    voci.forEach((v, i) => {
      v.toggleAttribute('data-attiva', i === attiva);
      const video = v.querySelector('video');
      if (!video) return;
      if (i === attiva && visibile && !document.hidden && getComputedStyle(palco).display !== 'none') suona(video);
      else video.pause();
    });
  };
  // la fase attiva è quella che attraversa la fascia centrale dello schermo
  const io = new IntersectionObserver((voci) => {
    for (const v of voci) if (v.isIntersecting) attiva = Number(v.target.dataset.fase);
    aggiorna();
  }, { rootMargin: '-45% 0px -45% 0px' });
  fasi.forEach((f) => io.observe(f));
  const vista = new IntersectionObserver(([v]) => { visibile = v.isIntersecting && !fermo(); aggiorna(); }, { threshold: 0.05 });
  vista.observe(palco);
  const nascosta = () => aggiorna();
  document.addEventListener('visibilitychange', nascosta);
  aggiorna();
  return () => { io.disconnect(); vista.disconnect(); document.removeEventListener('visibilitychange', nascosta); voci.forEach((v) => v.querySelector('video')?.pause()); };
}
