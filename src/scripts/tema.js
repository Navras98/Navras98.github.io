// Tema chiaro o scuro: la scelta resta salvata nel browser.
const doc = document.documentElement;
const colore = () => document.querySelector('meta[name="theme-color"]')?.setAttribute('content', doc.dataset.theme === 'light' ? '#f2f1ee' : '#121316');

export function avvia() {
  colore();
  const bottoni = [...document.querySelectorAll('[data-tema]')];
  const cambia = () => {
    doc.classList.add('cambio-tema');
    doc.dataset.theme = doc.dataset.theme === 'light' ? 'dark' : 'light';
    colore();
    try { localStorage.setItem('tema', doc.dataset.theme); } catch (e) { /* niente */ }
    setTimeout(() => doc.classList.remove('cambio-tema'), 450);
  };
  bottoni.forEach((b) => b.addEventListener('click', cambia));
  return () => bottoni.forEach((b) => b.removeEventListener('click', cambia));
}
