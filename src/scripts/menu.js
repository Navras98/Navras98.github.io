// Menu mobile (pannello) e tendina dei progetti.
import { lenis } from './scorrimento.js';

export function avvia() {
  const testata = document.querySelector('[data-testata]');
  const bottone = document.querySelector('[data-menu]');
  const pannello = document.querySelector('[data-menu-mobile]');
  const tendine = [...document.querySelectorAll('[data-tendina]')];
  const chiudiTendine = () => tendine.forEach((t) => { t.classList.remove('aperta'); t.querySelector('[data-tendina-bottone]')?.setAttribute('aria-expanded', 'false'); });
  const chiudi = () => {
    if (!testata?.classList.contains('aperta')) return;
    testata.classList.remove('aperta');
    bottone.setAttribute('aria-expanded', 'false');
    bottone.setAttribute('aria-label', bottone.dataset.apri);
    pannello.setAttribute('inert', '');
    lenis?.start();
  };
  const apri = () => {
    testata.classList.add('aperta');
    bottone.setAttribute('aria-expanded', 'true');
    bottone.setAttribute('aria-label', bottone.dataset.chiudi);
    pannello.removeAttribute('inert');
    lenis?.stop();
    pannello.querySelector('a')?.focus();
  };
  const alClic = () => (testata.classList.contains('aperta') ? chiudi() : apri());
  const nelPannello = (e) => { if (e.target.closest('a')) chiudi(); };
  const tasto = (e) => {
    if (e.key !== 'Escape') return;
    if (testata?.classList.contains('aperta')) { chiudi(); bottone.focus(); }
    const aperta = tendine.find((t) => t.classList.contains('aperta'));
    if (aperta) { chiudiTendine(); aperta.querySelector('[data-tendina-bottone]')?.focus(); }
  };
  const fuori = (e) => { if (!e.target.closest('[data-tendina]')) chiudiTendine(); };
  const largo = window.matchMedia('(min-width: 1100px)');
  bottone?.addEventListener('click', alClic);
  pannello?.addEventListener('click', nelPannello);
  document.addEventListener('keydown', tasto);
  document.addEventListener('click', fuori);
  document.addEventListener('chiudi-menu', chiudi);
  largo.addEventListener('change', chiudi);
  const pulizieTendine = tendine.map((t) => {
    const b = t.querySelector('[data-tendina-bottone]');
    const commuta = () => { const aperta = !t.classList.contains('aperta'); chiudiTendine(); t.classList.toggle('aperta', aperta); b.setAttribute('aria-expanded', String(aperta)); };
    const esci = (e) => { if (!t.contains(e.relatedTarget)) { t.classList.remove('aperta'); b.setAttribute('aria-expanded', 'false'); } };
    // frecce su e giù tra le voci della tendina
    const frecce = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const voci = [...t.querySelectorAll('.tendina a')];
      const i = voci.indexOf(document.activeElement);
      e.preventDefault();
      if (!t.classList.contains('aperta')) { chiudiTendine(); t.classList.add('aperta'); b.setAttribute('aria-expanded', 'true'); }
      const prossimo = e.key === 'ArrowDown' ? (i + 1) % voci.length : (i <= 0 ? voci.length - 1 : i - 1);
      voci[prossimo]?.focus();
    };
    b.addEventListener('click', commuta);
    t.addEventListener('focusout', esci);
    t.addEventListener('keydown', frecce);
    return () => { b.removeEventListener('click', commuta); t.removeEventListener('focusout', esci); t.removeEventListener('keydown', frecce); };
  });
  return () => {
    chiudi();
    bottone?.removeEventListener('click', alClic);
    pannello?.removeEventListener('click', nelPannello);
    document.removeEventListener('keydown', tasto);
    document.removeEventListener('click', fuori);
    document.removeEventListener('chiudi-menu', chiudi);
    largo.removeEventListener('change', chiudi);
    pulizieTendine.forEach((f) => f());
  };
}
