/* Andrea Sforna — motion & rail
   lenis (scroll) → gsap + ScrollTrigger (reveal, registro di lettura) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- rail: registro di lettura (sempre attivo, anche senza gsap) ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rail__item'));
  var sections = items
    .map(function (li) { return document.getElementById(li.dataset.rail); })
    .filter(Boolean);
  var bar = document.querySelector('.railbar__fill');
  var dark = document.getElementById('metodo');

  function updateRail() {
    var mid = window.scrollY + window.innerHeight * 0.42;
    var active = 0;
    sections.forEach(function (sec, i) {
      if (sec.offsetTop <= mid) active = i;
    });
    items.forEach(function (li, i) {
      li.classList.toggle('is-here', i === active);
      li.classList.toggle('is-seen', i < active);
    });

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0) + '%';
    }

    if (dark) {
      var r = dark.getBoundingClientRect();
      var probe = window.innerHeight / 2;
      document.body.classList.toggle('rail-invert', r.top < probe && r.bottom > probe);
    }
  }

  /* ---------- lenis ---------- */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', function () {
      if (hasGSAP) window.ScrollTrigger.update();
      updateRail();
    });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ancore: passa da lenis quando c'è, altrimenti scroll nativo */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  window.addEventListener('scroll', updateRail, { passive: true });
  window.addEventListener('resize', updateRail);
  updateRail();

  /* ---------- reveal ---------- */
  if (!hasGSAP || reduce) {
    document.querySelectorAll('.js-rise,.js-word,.js-rule,.js-area').forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    document.querySelectorAll('.rule__mark').forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  /* apertura: sequenza orchestrata al caricamento */
  var intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });
  intro
    .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.7 })
    .to('.hero__name .js-word', { y: '0%', duration: 1.05, stagger: 0.09, ease: 'expo.out' }, '-=0.35')
    .to('.hero__rule', { scaleX: 1, duration: 1.1, ease: 'power4.inOut' }, '-=0.75')
    .to('.hero__thesis, .hero__sub, .hero__cta', { opacity: 1, y: 0, duration: 0.8, stagger: 0.11 }, '-=0.8');

  /* sezioni: risalita alla comparsa */
  gsap.utils.toArray('.band .js-rise').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* competenze: le nove aree entrano in fila */
  gsap.utils.toArray('.areas').forEach(function (list) {
    gsap.to(list.querySelectorAll('.js-area'), {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: list, start: 'top 78%' }
    });
  });

  /* metodo: ogni regola si segna quando è stata letta */
  gsap.utils.toArray('.rule').forEach(function (rule) {
    var mark = rule.querySelector('.rule__mark');
    gsap.timeline({ scrollTrigger: { trigger: rule, start: 'top 72%' } })
      .from(rule.querySelectorAll('.rule__claim, .rule__gloss'), {
        opacity: 0, y: 14, duration: 0.7, ease: 'power3.out', stagger: 0.08
      })
      .to(mark, {
        opacity: 1, scale: 1, rotate: 45, backgroundColor: '#3E7A65',
        duration: 0.5, ease: 'back.out(2)'
      }, '-=0.45');
  });

  window.ScrollTrigger.addEventListener('refresh', updateRail);
  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
