/* Punto unico di verità per head, menu e piede.
   Le pagine .html in radice sono generate da build.mjs: il sito servito è statico. */

export const SITE = {
  name: 'Andrea Sforna',
  origin: 'https://navras98.github.io',
  email: 'andrea.sforna@gmail.com',
  instagram: 'https://www.instagram.com/andreasfornaai/',
  instagramHandle: '@andreasfornaai',
  locale: 'it_IT',
};

export const NAV = [
  { file: 'index.html', label: 'Home' },
  { file: 'competenze.html', label: 'Competenze' },
  { file: 'sicurezza.html', label: 'Sicurezza' },
  { file: 'dati.html', label: 'Dati' },
  { file: 'modelli.html', label: 'Modelli' },
  { file: 'metodo.html', label: 'Metodo' },
  { file: 'contatti.html', label: 'Contatti' },
];

const YEAR = 2026;

function navMarkup(current) {
  return NAV.map((item) => {
    const active = item.file === current;
    return `          <li><a class="nav__link${active ? ' is-current' : ''}" href="${item.file}"${
      active ? ' aria-current="page"' : ''
    }>${item.label}</a></li>`;
  }).join('\n');
}

function header(current) {
  return `  <a class="skip" href="#main">Vai al contenuto</a>

  <div class="progress" aria-hidden="true"><span class="progress__fill" data-progress></span></div>

  <header class="site-head">
    <div class="shell site-head__inner">
      <a class="brand" href="index.html">
        <span class="brand__mark" aria-hidden="true">AS</span>
        <span class="brand__name">Andrea Sforna</span>
      </a>

      <nav class="nav" aria-label="Navigazione principale">
        <ul class="nav__list">
${navMarkup(current)}
        </ul>
      </nav>

      <button class="burger" type="button" aria-expanded="false" aria-controls="menu-mobile" data-burger>
        <span class="burger__lines" aria-hidden="true"><i></i><i></i></span>
        <span class="burger__label">Menu</span>
      </button>
    </div>
  </header>

  <!-- fuori da .site-head di proposito: il backdrop-filter dell'intestazione
       farebbe da blocco contenitore e schiaccerebbe il pannello a altezza zero -->
  <div class="menu" id="menu-mobile" data-menu hidden>
      <nav class="menu__inner shell" aria-label="Navigazione mobile">
        <ul class="menu__list">
${NAV.map(
  (item, i) =>
    `          <li style="--i:${i}"><a class="menu__link${
      item.file === current ? ' is-current' : ''
    }" href="${item.file}"${item.file === current ? ' aria-current="page"' : ''}>${
      item.label
    }</a></li>`
).join('\n')}
        </ul>
        <p class="menu__foot"><a href="mailto:${SITE.email}">${SITE.email}</a></p>
      </nav>
    </div>`;
}

function footer() {
  return `  <footer class="site-foot">
    <div class="shell site-foot__inner">
      <div class="site-foot__block">
        <p class="site-foot__name">Andrea Sforna</p>
        <p class="site-foot__line">Progettazione, sicurezza e manutenzione di sistemi di agenti AI.</p>
      </div>
      <div class="site-foot__block">
        <ul class="site-foot__links">
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="${SITE.instagram}" rel="me noopener" target="_blank">Instagram ${SITE.instagramHandle}</a></li>
        </ul>
      </div>
      <div class="site-foot__block site-foot__block--end">
        <ul class="site-foot__links site-foot__links--nav">
${NAV.filter((n) => n.file !== 'index.html')
  .map((n) => `          <li><a href="${n.file}">${n.label}</a></li>`)
  .join('\n')}
        </ul>
      </div>
    </div>
    <div class="shell site-foot__base">
      <p>&copy; ${YEAR} Andrea Sforna</p>
      <p><a href="#top">Torna su</a></p>
    </div>
  </footer>`;
}

/* Blocco finale che porta alla pagina successiva. */
export function next({ file, label, line }) {
  const nav = NAV.find((n) => n.file === file);
  return `<aside class="next" data-reveal>
  <p class="next__label">Pagina successiva</p>
  <a class="next__link" href="${file}">
    <span class="next__title">${label || (nav && nav.label) || ''}</span>
    <span class="next__arrow" aria-hidden="true">&rarr;</span>
  </a>
  <p class="next__line">${line}</p>
</aside>`;
}

export function render(page) {
  const canonical = `${SITE.origin}/${page.file === 'index.html' ? '' : page.file}`;
  const title =
    page.file === 'index.html'
      ? `${SITE.name} — sistemi di agenti AI`
      : `${page.title} — ${SITE.name}`;

  const jsonld =
    page.file === 'index.html'
      ? `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andrea Sforna",
    "url": "${SITE.origin}/",
    "email": "mailto:${SITE.email}",
    "sameAs": ["${SITE.instagram}"],
    "jobTitle": "Progettista di sistemi di agenti AI",
    "knowsAbout": [
      "Orchestrazione di agenti AI",
      "Sicurezza degli agenti AI",
      "Accesso deterministico ai dati",
      "Modelli linguistici in locale",
      "Memoria e richiamo della conoscenza"
    ]
  }
  </script>`
      : '';

  return `<!doctype html>
<html lang="it" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${canonical}">
  <meta name="author" content="Andrea Sforna">
  <meta name="theme-color" content="#fbfbf9">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Andrea Sforna">
  <meta property="og:locale" content="${SITE.locale}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE.origin}/assets/img/anteprima.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="${SITE.origin}/assets/img/anteprima.png">

  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/img/icona-180.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
  <link rel="stylesheet" href="assets/css/site.css">${jsonld}
  <script>
    (function () {
      var d = document.documentElement;
      d.classList.add('js');
      try {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('motion');
      } catch (e) {}
    })();
  </script>
</head>
<body class="page-${page.file.replace('.html', '')}">
${header(page.file)}

  <main id="main">
${page.body}
  </main>

${footer()}

  <script src="assets/js/site.js" defer></script>
</body>
</html>
`;
}
