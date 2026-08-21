/* Comportamenti condivisi: tema, menu, comparse, avanzamento, copia, transizione.
   Nessuna libreria. Tutto degrada: senza questo file il sito resta navigabile. */

(function () {
  'use strict';

  var root = document.documentElement;
  var moto = root.classList.contains('moto');

  /* ------------------------------------------------------------------ tema */

  var tastoTema = document.querySelector('[data-theme-toggle]');
  var etichettaTema = document.querySelector('[data-theme-label]');

  function scriviTema(nome) {
    root.setAttribute('data-tema', nome);
    if (etichettaTema) etichettaTema.textContent = nome === 'scuro' ? 'Scuro' : 'Chiaro';
    if (tastoTema) {
      tastoTema.setAttribute(
        'aria-label',
        nome === 'scuro' ? 'Tema scuro attivo, passa al chiaro' : 'Tema chiaro attivo, passa allo scuro'
      );
    }
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', nome === 'scuro' ? '#0b0e12' : '#f2efe9');
  }

  scriviTema(root.getAttribute('data-tema') || 'scuro');

  if (tastoTema) {
    tastoTema.addEventListener('click', function () {
      var nuovo = root.getAttribute('data-tema') === 'scuro' ? 'chiaro' : 'scuro';
      /* La transizione dei colori si accende solo qui: se restasse sempre attiva,
         ogni comparsa allo scroll trascinerebbe dietro un fondo che sfuma. */
      root.classList.add('cambio-tema');
      scriviTema(nuovo);
      try {
        localStorage.setItem('tema', nuovo);
      } catch (e) {}
      window.setTimeout(function () {
        root.classList.remove('cambio-tema');
      }, 420);
    });
  }

  /* Se la persona non ha mai scelto, il sito segue il sistema anche a pagina aperta. */
  try {
    var mqTema = window.matchMedia('(prefers-color-scheme: light)');
    var seguiSistema = function (e) {
      if (localStorage.getItem('tema')) return;
      scriviTema(e.matches ? 'chiaro' : 'scuro');
    };
    if (mqTema.addEventListener) mqTema.addEventListener('change', seguiSistema);
  } catch (e) {}

  /* ------------------------------------------------------------ menu mobile */

  var burger = document.querySelector('[data-burger]');
  var drawer = document.querySelector('[data-menu]');
  var fuocoPrima = null;

  function apriMenu() {
    fuocoPrima = document.activeElement;
    drawer.hidden = false;
    /* un fotogramma di stacco: senza, il pannello nasce già aperto e la
       transizione non parte mai */
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
    });
    document.body.classList.add('bloccato');
    burger.setAttribute('aria-expanded', 'true');
    var primo = drawer.querySelector('a');
    if (primo) primo.focus({ preventScroll: true });
  }

  function chiudiMenu(riporta) {
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('bloccato');
    var fine = function () {
      drawer.hidden = true;
    };
    if (moto) window.setTimeout(fine, 280);
    else fine();
    if (riporta && fuocoPrima && fuocoPrima.focus) fuocoPrima.focus({ preventScroll: true });
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') chiudiMenu(true);
      else apriMenu();
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) chiudiMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') chiudiMenu(true);
    });

    var largo = window.matchMedia('(min-width: 62rem)');
    var alCambio = function (e) {
      if (e.matches && burger.getAttribute('aria-expanded') === 'true') chiudiMenu(false);
    };
    if (largo.addEventListener) largo.addEventListener('change', alCambio);

    /* il fuoco resta dentro il pannello finché è aperto */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault();
        burger.focus();
      }
    });
  }

  /* -------------------------------------------------- comparse allo scroll */

  var comparse = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (!moto) {
    comparse.forEach(function (el) {
      el.classList.add('is-in');
    });
  } else {
    comparse.forEach(function (el, i) {
      if (el.getAttribute('data-reveal') === 'scala') el.style.setProperty('--d', (i % 4) * 80 + 'ms');
    });

    /* Un osservatore di intersezione non basta: un salto istantaneo in fondo alla
       pagina non fa mai intersecare i blocchi di mezzo, che resterebbero invisibili
       per sempre. Qui conta se il blocco è entrato oppure è già passato. */
    var attesa = comparse.slice();
    var setaccio = function () {
      var soglia = window.innerHeight * 0.9;
      var restano = [];
      for (var i = 0; i < attesa.length; i++) {
        if (attesa[i].getBoundingClientRect().top < soglia) attesa[i].classList.add('is-in');
        else restano.push(attesa[i]);
      }
      attesa = restano;
      if (!attesa.length) {
        window.removeEventListener('scroll', chiediSetaccio);
        window.removeEventListener('resize', chiediSetaccio);
      }
    };
    /* strozzatura a tempo e non su requestAnimationFrame: in una scheda che non
       disegna, rAF non viene mai chiamato e i blocchi resterebbero invisibili */
    var ultimoS = 0;
    var pendenteS = null;
    var chiediSetaccio = function () {
      var ora = new Date().getTime();
      if (ora - ultimoS > 80) {
        ultimoS = ora;
        setaccio();
      } else if (!pendenteS) {
        pendenteS = window.setTimeout(function () {
          pendenteS = null;
          ultimoS = new Date().getTime();
          setaccio();
        }, 80);
      }
    };
    window.addEventListener('scroll', chiediSetaccio, { passive: true });
    window.addEventListener('resize', chiediSetaccio);
    setaccio();
    /* i caratteri che arrivano dopo spostano il testo: si ripassa qualche volta */
    [220, 800, 1800].forEach(function (ms) {
      window.setTimeout(setaccio, ms);
    });
  }

  /* --------------------------------------------------- avanzamento lettura */

  var barra = document.querySelector('[data-progress]');
  if (barra) {
    var aggiorna = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var q = max > 320 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      barra.style.transform = 'scaleX(' + q.toFixed(4) + ')';
    };
    var ultimoP = 0;
    var pendenteP = null;
    var chiedi = function () {
      var ora = new Date().getTime();
      if (ora - ultimoP > 40) {
        ultimoP = ora;
        aggiorna();
      } else if (!pendenteP) {
        pendenteP = window.setTimeout(function () {
          pendenteP = null;
          ultimoP = new Date().getTime();
          aggiorna();
        }, 40);
      }
    };
    window.addEventListener('scroll', chiedi, { passive: true });
    window.addEventListener('resize', chiedi);
    aggiorna();
  }

  /* ------------------------------------------------------- copia indirizzo */

  var tastoCopia = document.querySelector('[data-copy]');
  if (tastoCopia) {
    var etichetta = tastoCopia.textContent;
    tastoCopia.addEventListener('click', function () {
      var valore = tastoCopia.getAttribute('data-copy') || '';
      var esito = function (ok) {
        tastoCopia.textContent = ok ? 'Copiato' : 'Copia non riuscita';
        tastoCopia.setAttribute('data-esito', ok ? 'ok' : 'no');
        window.setTimeout(function () {
          tastoCopia.textContent = etichetta;
          tastoCopia.removeAttribute('data-esito');
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valore).then(
          function () {
            esito(true);
          },
          function () {
            esito(false);
          }
        );
        return;
      }
      try {
        var t = document.createElement('textarea');
        t.value = valore;
        t.setAttribute('readonly', '');
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(t);
        esito(ok);
      } catch (err) {
        esito(false);
      }
    });
  }

  /* ---------------------------------------------------- transizione pagina */

  if (moto) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf(':') > -1) return;
      var url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      e.preventDefault();
      root.classList.add('in-uscita');
      window.setTimeout(function () {
        window.location.href = a.href;
      }, 180);
      /* se la navigazione non parte, la pagina torna visibile invece di restare bianca */
      window.setTimeout(function () {
        root.classList.remove('in-uscita');
      }, 2400);
    });

    window.addEventListener('pageshow', function () {
      root.classList.remove('in-uscita');
    });
  }
})();
