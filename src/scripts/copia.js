// Bottone «copia link» delle pagine progetto.
export function avvia() {
  const bottoni = [...document.querySelectorAll('[data-copia]')];
  const copia = async (e) => {
    const b = e.currentTarget;
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      const t = b.querySelector('span'); const prima = t.textContent;
      t.textContent = b.dataset.copiato; setTimeout(() => (t.textContent = prima), 1600);
    } catch (err) { /* niente */ }
  };
  bottoni.forEach((b) => b.addEventListener('click', copia));
  return () => bottoni.forEach((b) => b.removeEventListener('click', copia));
}
