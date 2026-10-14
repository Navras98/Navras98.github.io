// Moduli: contatti (Web3Forms) e iscrizione alla newsletter. I testi arrivano dagli attributi data-*.
const valida = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

async function inviaContatto(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const esito = f.querySelector('[data-esito]');
  const bottone = f.querySelector('button[type=submit]');
  bottone.disabled = true;
  try {
    const r = await fetch(f.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
    const j = await r.json();
    if (!j.success) throw new Error('rifiutato');
    f.reset();
    esito.textContent = f.dataset.inviato;
    f.dataset.stato = 'inviato';
  } catch (err) {
    esito.textContent = f.dataset.errore;
    f.dataset.stato = 'errore';
  } finally {
    bottone.disabled = false;
  }
}

async function iscrivi(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const esito = f.querySelector('[data-esito]');
  const campo = f.querySelector('input[name=email]');
  const bottone = f.querySelector('button[type=submit]');
  const email = campo.value.trim();
  if (!valida(email)) { esito.textContent = f.dataset.nonValido; f.dataset.stato = 'errore'; campo.focus(); return; }
  const indirizzo = f.dataset.indirizzo;
  if (!indirizzo) {
    // senza indirizzo pubblico: si apre un'email di iscrizione già pronta
    location.href = `mailto:${f.dataset.email}?subject=${encodeURIComponent(f.dataset.oggetto)}&body=${encodeURIComponent(email)}`;
    return;
  }
  bottone.disabled = true;
  esito.textContent = f.dataset.attesa;
  f.dataset.stato = 'attesa';
  try {
    const r = await fetch(indirizzo, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, azienda: '' }) });
    if (!r.ok) throw new Error('rifiutata');
    // la conferma è il corpo {ok:true}: un 200 vuoto vuol dire che il flusso si è fermato a metà
    const j = JSON.parse((await r.text()) || 'null');
    if (!j || j.ok !== true) throw new Error('rifiutata');
    esito.textContent = f.dataset.fatto;
    f.dataset.stato = 'fatto';
    campo.value = '';
  } catch (err) {
    esito.textContent = f.dataset.errore;
    f.dataset.stato = 'errore';
  } finally {
    bottone.disabled = false;
  }
}

export function avvia() {
  const contatti = [...document.querySelectorAll('form[data-modulo]')];
  const iscrizioni = [...document.querySelectorAll('form[data-iscrizione]')];
  contatti.forEach((f) => f.addEventListener('submit', inviaContatto));
  iscrizioni.forEach((f) => f.addEventListener('submit', iscrivi));
  return () => {
    contatti.forEach((f) => f.removeEventListener('submit', inviaContatto));
    iscrizioni.forEach((f) => f.removeEventListener('submit', iscrivi));
  };
}
