// Scorrimento morbido (Lenis) e link interni alla pagina che tengono conto della testata.
import Lenis from 'lenis';

const fermo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TESTATA = 48;
export let lenis = null;

if (!fermo()) {
  lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
  const passo = (t) => { lenis.raf(t); requestAnimationFrame(passo); };
  requestAnimationFrame(passo);
  document.addEventListener('astro:after-swap', () => { lenis.scrollTo(location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) ?? 0 : 0, { immediate: true, force: true, offset: -TESTATA + 1 }); lenis.resize(); });
}

export const vaiA = (bersaglio) => {
  if (lenis) lenis.scrollTo(bersaglio, { offset: bersaglio === 0 ? 0 : -TESTATA + 1 });
  else if (bersaglio === 0) window.scrollTo(0, 0);
  else bersaglio.scrollIntoView();
};

export function avvia() {
  const clic = (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const el = id === 'hero' || id === 'top' ? 0 : document.getElementById(id);
    if (el === null) return;
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('chiudi-menu'));
    vaiA(el);
    history.pushState(history.state, '', url.hash);
    if (el) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  };
  document.addEventListener('click', clic);
  lenis?.resize();
  return () => document.removeEventListener('click', clic);
}
