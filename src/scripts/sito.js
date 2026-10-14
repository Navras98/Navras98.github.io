// Avvio degli script a ogni pagina (anche dopo le transizioni tra pagine di Astro) e pulizia prima del cambio.
import * as tema from './tema.js';
import * as scorrimento from './scorrimento.js';
import * as menu from './menu.js';
import * as rivela from './rivela.js';
import * as apertura from './apertura.js';
import * as indice from './indice.js';
import * as video from './video.js';
import * as moduli from './moduli.js';
import * as caroselli from './caroselli.js';
import * as copia from './copia.js';
import * as fasi from './fasi.js';

const moduliPagina = [tema, scorrimento, menu, rivela, apertura, indice, video, moduli, caroselli, copia, fasi];
let pulizie = [];

document.addEventListener('astro:page-load', () => {
  pulizie = moduliPagina.map((m) => m.avvia()).filter(Boolean);
});
document.addEventListener('astro:before-preparation', () => document.documentElement.classList.add('cambio-pagina'));
document.addEventListener('astro:after-swap', () => document.documentElement.classList.remove('cambio-pagina'));
document.addEventListener('astro:before-swap', (e) => {
  pulizie.forEach((f) => f());
  pulizie = [];
  // la nuova pagina conserva il tema scelto e la classe js
  e.newDocument.documentElement.dataset.theme = document.documentElement.dataset.theme;
  e.newDocument.documentElement.classList.add('js');
});
