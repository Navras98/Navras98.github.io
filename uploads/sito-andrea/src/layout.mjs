/* Punto unico di verità per testa, menu, piede e metadati.
   Le pagine .html in radice sono generate da build.mjs; il sito servito è statico. */

export const SITE = {
  name: 'Andrea Sforna',
  ruolo: 'Architetture di agenti AI',
  origin: 'https://navras98.github.io',
  email: 'andrea.sforna@gmail.com',
  instagram: 'https://www.instagram.com/andreasfornaai/',
  instagramHandle: '@andreasfornaai',
  locale: 'it_IT',
};

export const NAV = [
  { file: 'index.html', label: 'Home', menu: 'Home' },
  { file: 'architettura.html', label: 'Architettura dei sistemi di agenti', menu: 'Architettura' },
  { file: 'sicurezza.html', label: 'Sicurezza e isolamento', menu: 'Sicurezza' },
  { file: 'dati.html', label: 'Dati e risposte deterministiche', menu: 'Dati' },
  { file: 'privacy.html', label: 'Privacy e dati sensibili', menu: 'Privacy' },
  { file: 'automazione.html', label: 'Automazione e contenuti', menu: 'Automazione' },
  { file: 'stack.html', label: 'Modelli, agenti e strumenti', menu: 'Stack' },
  { file: 'metodo.html', label: 'Metodo e filosofia', menu: 'Metodo' },
  { file: 'contatti.html', label: 'Contatti', menu: 'Contatti' },
];

const ANNO = 2026;

function voci(current, classe) {
  return NAV.map((item) => {
    const attiva = item.file === current;
    return `<li><a class="${classe}${attiva ? ' is-current' : ''}" href="${item.file}"${
      attiva ? ' aria-current="page"' : ''
    }>${item.menu}</a></li>`;
  }).join('\n            ');
}

function testa(current) {
  return `  <a class="skip" href="#main">Vai al contenuto</a>

  <div class="progress" aria-hidden="true"><i class="progress__fill" data-progress></i></div>

  <header class="topbar">
    <div class="topbar__inner">
      <a class="mark" href="index.html">
        <span class="mark__glyph" aria-hidden="true">AS</span>
        <span class="mark__name">Andrea Sforna</span>
      </a>

      <nav class="nav" aria-label="Navigazione principale">
        <ul class="nav__list">
            ${voci(current, 'nav__link')}
        </ul>
      </nav>

      <div class="topbar__end">
        <button class="theme" type="button" data-theme-toggle aria-live="polite">
          <span class="theme__dot" aria-hidden="true"></span>
          <span class="theme__label" data-theme-label>Tema</span>
        </button>
        <button class="burger" type="button" aria-expanded="false" aria-controls="menu-mobile" data-burger>
          <span class="burger__bars" aria-hidden="true"><i></i><i></i></span>
          <span class="burger__label">Menu</span>
        </button>
      </div>
    </div>
  </header>

  <!-- fuori dalla barra di proposito: il filtro sullo sfondo dell'intestazione
       farebbe da blocco contenitore e schiaccerebbe il pannello ad altezza zero -->
  <div class="drawer" id="menu-mobile" data-menu hidden>
    <nav class="drawer__inner" aria-label="Navigazione mobile">
      <ul class="drawer__list">
            ${voci(current, 'drawer__link')}
      </ul>
      <p class="drawer__foot"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
    </nav>
  </div>`;
}

function piede() {
  return `  <footer class="foot">
    <div class="foot__inner">
      <div class="foot__block">
        <p class="foot__name">Andrea Sforna</p>
        <p class="foot__line">Architetture di agenti AI: progettazione, confini di sicurezza, accesso verificabile ai dati.</p>
      </div>
      <div class="foot__block">
        <p class="ann">Contatti</p>
        <ul class="foot__links">
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="${SITE.instagram}" rel="me noopener" target="_blank">Instagram ${SITE.instagramHandle}</a></li>
        </ul>
      </div>
      <div class="foot__block">
        <p class="ann">Pagine</p>
        <ul class="foot__links foot__links--nav">
${NAV.filter((n) => n.file !== 'index.html')
  .map((n) => `          <li><a href="${n.file}">${n.menu}</a></li>`)
  .join('\n')}
        </ul>
      </div>
    </div>
    <div class="foot__base">
      <p>&copy; ${ANNO} Andrea Sforna</p>
      <p><a href="#top">Torna su</a></p>
    </div>
  </footer>`;
}

/* Passaggio finale che porta alla pagina successiva. */
export function avanti({ file, titolo, riga }) {
  const voce = NAV.find((n) => n.file === file);
  return `      <aside class="next" data-reveal>
        <p class="ann">Pagina successiva</p>
        <a class="next__link" href="${file}">
          <span class="next__title">${titolo || (voce && voce.label) || ''}</span>
          <span class="next__arrow" aria-hidden="true">&#8594;</span>
        </a>
        <p class="next__line">${riga}</p>
      </aside>`;
}

/* Blocco di testo con annotazione tecnica nella colonna di sinistra. */
export function blocco({ ann, titolo, corpo, id }) {
  return `        <article class="blk" data-reveal${id ? ` id="${id}"` : ''}>
          <p class="blk__ann ann">${ann}</p>
          <div class="blk__body">
            <h2>${titolo}</h2>
${corpo
  .trim()
  .split('\n')
  .map((r) => '            ' + r.trim())
  .join('\n')}
          </div>
        </article>`;
}

export function render(page) {
  const canonical = `${SITE.origin}/${page.file === 'index.html' ? '' : page.file}`;
  const titolo =
    page.file === 'index.html'
      ? `${SITE.name} · architetture di agenti AI`
      : `${page.title} · ${SITE.name}`;

  const jsonld =
    page.file === 'index.html'
      ? `
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "${SITE.origin}/#andrea",
      "name": "Andrea Sforna",
      "url": "${SITE.origin}/",
      "email": "mailto:${SITE.email}",
      "sameAs": ["${SITE.instagram}"],
      "jobTitle": "Progettista di architetture di agenti AI",
      "knowsAbout": [
        "Architetture multi-agente",
        "Sicurezza degli agenti AI",
        "Accesso deterministico ai dati",
        "Privacy e trattamento dei dati personali",
        "Modelli linguistici eseguiti in locale",
        "Automazione dei processi"
      ]
    },
    {
      "@type": "ProfessionalService",
      "name": "Andrea Sforna — architetture di agenti AI",
      "url": "${SITE.origin}/",
      "provider": { "@id": "${SITE.origin}/#andrea" },
      "areaServed": "IT",
      "availableLanguage": "it",
      "serviceType": [
        "Progettazione di sistemi multi-agente",
        "Sicurezza e isolamento degli agenti",
        "Accesso deterministico ai dati aziendali",
        "Trattamento dei dati personali nei flussi AI",
        "Automazione dei processi"
      ]
    }
  ]
}
  </script>`
      : '';

  const scena =
    page.scena === true
      ? `
  <script type="module" src="assets/js/scena.js" defer></script>`
      : '';

  return `<!doctype html>
<html lang="it" id="top" data-tema="scuro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titolo}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${canonical}">
<meta name="author" content="Andrea Sforna">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#0b0e12" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f2efe9" media="(prefers-color-scheme: light)">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Andrea Sforna">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:title" content="${titolo}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.origin}/assets/img/anteprima.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titolo}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${SITE.origin}/assets/img/anteprima.png">

<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="alternate icon" href="assets/img/favicon.png">
<link rel="apple-touch-icon" href="assets/img/icona-180.png">
<link rel="manifest" href="site.webmanifest">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- i caratteri non bloccano la prima pittura: il testo compare subito con i
     ripieghi dichiarati nel foglio, e cambia carattere quando arrivano -->
<link rel="preload" as="style" href="${FONTS}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<link rel="stylesheet" href="assets/css/site.css">${jsonld}
<script>
/* Prima della prima pittura: tema salvato o preferenza di sistema, e la classe
   che abilita il movimento. Senza questo blocco il tema chiaro lampeggerebbe scuro. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var s = localStorage.getItem('tema');
    var scuro = s ? s === 'scuro' : !window.matchMedia('(prefers-color-scheme: light)').matches;
    d.setAttribute('data-tema', scuro ? 'scuro' : 'chiaro');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('moto');
  } catch (e) {}
})();
</script>
</head>
<body class="p-${page.file.replace('.html', '')}">
${testa(page.file)}

  <main id="main">
${page.body}
  </main>

${piede()}

<script src="assets/js/site.js" defer></script>${scena}
</body>
</html>
`;
}

/* Il foglio dei caratteri sta in una costante sola: cambiarli è una riga. */
export const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Literata:opsz,wght@7..72,300..600&display=swap';
