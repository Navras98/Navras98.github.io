/* Andrea Sforna — comportamenti condivisi.
   Nessuna libreria: menu, comparse allo scroll, avanzamento di lettura,
   copia dell'indirizzo, transizione fra pagine. Tutto degrada senza JS. */

(function () {
  'use strict';

  var root = document.documentElement;
  var motion = root.classList.contains('motion');

  /* ---------------------------------------------------------- menu mobile */

  var burger = document.querySelector('[data-burger]');
  var menu = document.querySelector('[data-menu]');
  var lastFocus = null;

  function openMenu() {
    if (!menu || !burger) return;
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('is-locked');
    burger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    var first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(restore) {
    if (!menu || !burger) return;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    var done = function () {
      menu.hidden = true;
    };
    if (motion) window.setTimeout(done, 300);
    else done();
    if (restore && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeMenu(true);
      else openMenu();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (burger.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });

    var mq = window.matchMedia('(min-width: 61.3125rem)');
    var onChange = function (e) {
      if (e.matches && burger.getAttribute('aria-expanded') === 'true') closeMenu(false);
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);

    /* il fuoco resta dentro il pannello aperto */
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = menu.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------ comparse allo scroll */

  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (!motion) {
    revealables.forEach(function (el) {
      el.classList.add('is-in');
    });
  } else {
    /* Setaccio a ogni scroll invece di un osservatore: un salto istantaneo in fondo
       alla pagina non fa mai intersecare i blocchi di mezzo, che resterebbero
       invisibili per sempre. Qui conta se il blocco è entrato o già passato. */
    var pending = revealables.slice();

    revealables.forEach(function (el, i) {
      if (el.getAttribute('data-reveal') === 'stagger') {
        el.style.setProperty('--d', (i % 4) * 90 + 'ms');
      }
    });

    var sweep = function () {
      var soglia = window.innerHeight * 0.92;
      var restano = [];
      for (var i = 0; i < pending.length; i++) {
        var r = pending[i].getBoundingClientRect();
        if (r.top < soglia) pending[i].classList.add('is-in');
        else restano.push(pending[i]);
      }
      pending = restano;
      if (!pending.length) {
        window.removeEventListener('scroll', askSweep);
        window.removeEventListener('resize', askSweep);
      }
    };
    /* la strozzatura è a tempo, non su requestAnimationFrame: in una scheda che
       non disegna, rAF non viene mai chiamato e i blocchi resterebbero invisibili */
    var ultimo = 0;
    var attesa = null;
    var askSweep = function () {
      var ora = new Date().getTime();
      if (ora - ultimo > 70) {
        ultimo = ora;
        sweep();
      } else if (!attesa) {
        attesa = window.setTimeout(function () {
          attesa = null;
          ultimo = new Date().getTime();
          sweep();
        }, 70);
      }
    };

    window.addEventListener('scroll', askSweep, { passive: true });
    window.addEventListener('resize', askSweep);
    sweep();
    /* i caratteri che arrivano dopo spostano il testo: si ripassa qualche volta */
    [200, 700, 1600].forEach(function (ms) {
      window.setTimeout(sweep, ms);
    });
  }

  /* --------------------------------------------- avanzamento di lettura */

  var fill = document.querySelector('[data-progress]');

  if (fill) {
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 240 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    };
    var ultimoP = 0;
    var attesaP = null;
    var request = function () {
      var ora = new Date().getTime();
      if (ora - ultimoP > 40) {
        ultimoP = ora;
        update();
      } else if (!attesaP) {
        attesaP = window.setTimeout(function () {
          attesaP = null;
          ultimoP = new Date().getTime();
          update();
        }, 40);
      }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();
  }

  /* --------------------------------------------------- copia indirizzo */

  var copyBtn = document.querySelector('[data-copy]');

  if (copyBtn) {
    var etichetta = copyBtn.textContent;
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy') || '';
      var say = function (ok) {
        copyBtn.textContent = ok ? 'Copiato' : 'Copia non riuscita';
        copyBtn.classList.toggle('is-done', ok);
        window.setTimeout(function () {
          copyBtn.textContent = etichetta;
          copyBtn.classList.remove('is-done');
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () {
            say(true);
          },
          function () {
            say(false);
          }
        );
        return;
      }

      try {
        var tmp = document.createElement('textarea');
        tmp.value = value;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(tmp);
        say(ok);
      } catch (err) {
        say(false);
      }
    });
  }

  /* ------------------------------------------------ transizione di pagina */

  if (motion) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf(':') > -1) return;

      var url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      root.classList.add('is-leaving');
      window.setTimeout(function () {
        window.location.href = a.href;
      }, 190);
      /* se la navigazione non parte, la pagina torna visibile */
      window.setTimeout(function () {
        root.classList.remove('is-leaving');
      }, 2500);
    });

    window.addEventListener('pageshow', function () {
      root.classList.remove('is-leaving');
    });
  }
})();
