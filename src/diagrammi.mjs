/* Diagrammi disegnati a mano in SVG. Nessuna libreria, nessuna immagine:
   ereditano i colori dal tema con currentColor e le variabili, quindi passando
   dal tema scuro al chiaro non c'è una seconda versione da tenere allineata.
   Il testo dentro un diagramma è testo vero: si seleziona, si legge da uno
   schermo braille e si trova con la ricerca della pagina. */

/* ---------------------------------------------------------------------------
   1. Il percorso di una richiesta, dalla domanda alla risposta.
   Ogni riquadro è un passaggio; i due cancelli sono i punti in cui qualcosa
   può fermarsi. Serve a far vedere che il modello sta agli estremi e non in mezzo.
--------------------------------------------------------------------------- */

export function diagrammaPercorso() {
  const tappe = [
    ['Domanda', 'in lingua umana'],
    ['Scelta', 'fra operazioni note'],
    ['Esecuzione', 'la fa il sistema'],
    ['Cancello', 'confronto dei valori'],
    ['Risposta', 'oppure non parte'],
  ];
  const w = 940;
  const h = 260;
  const bw = 156;
  const gap = (w - 40 - bw * 5) / 4;
  const y = 96;

  const riquadri = tappe
    .map((t, i) => {
      const x = 20 + i * (bw + gap);
      const cancello = i === 3;
      const modello = i === 0 || i === 1 || i === 4;
      return `
    <g class="dia__nodo${cancello ? ' dia__nodo--cancello' : ''}">
      <rect x="${x}" y="${y}" width="${bw}" height="72" class="dia__scatola"/>
      <text x="${x + 14}" y="${y + 29}" class="dia__eti">${String(i + 1).padStart(2, '0')}</text>
      <text x="${x + 14}" y="${y + 48}" class="dia__forte">${t[0]}</text>
      <text x="${x + 14}" y="${y + 64}" class="dia__min">${t[1]}</text>
      ${
        modello
          ? `<rect x="${x}" y="${y - 26}" width="${bw}" height="16" class="dia__fascia"/>
      <text x="${x + 6}" y="${y - 14}" class="dia__tag">modello</text>`
          : `<rect x="${x}" y="${y - 26}" width="${bw}" height="16" class="dia__fascia dia__fascia--det"/>
      <text x="${x + 6}" y="${y - 14}" class="dia__tag dia__tag--det">deterministico</text>`
      }
    </g>`;
    })
    .join('');

  const frecce = tappe
    .slice(1)
    .map((_, i) => {
      const x1 = 20 + i * (bw + gap) + bw;
      const x2 = x1 + gap;
      return `<path d="M${x1 + 4} ${y + 36} H${x2 - 8}" class="dia__filo" marker-end="url(#punta)"/>`;
    })
    .join('\n      ');

  return svg(
    w,
    h,
    'Il percorso di una richiesta: domanda, scelta di un’operazione dichiarata, esecuzione fatta dal sistema, cancello che confronta i valori, risposta. Il modello interviene solo al primo, al secondo e all’ultimo passaggio.',
    `
      ${frecce}
      ${riquadri}
      <path d="M20 ${y + 118} H${w - 20}" class="dia__base"/>
      <text x="20" y="${y + 140}" class="dia__min">Il modello capisce la domanda e scrive la risposta. In mezzo non tocca i dati.</text>`
  );
}

/* ---------------------------------------------------------------------------
   2. I livelli di controllo, dal più robusto al più fragile.
   La larghezza della barra dice quanto quel livello tiene: è l'unico dato
   grafico che il diagramma trasporta, ed è la ragione per cui esiste.
--------------------------------------------------------------------------- */

export function diagrammaLivelli() {
  const livelli = [
    ['Database', 'permessi fino alla colonna e alla riga', 100, 'forte'],
    ['Sistema operativo', 'utenze, permessi, liste di accesso', 88, 'forte'],
    ['Esecuzione isolata', 'vede solo ciò che le è stato montato', 76, 'forte'],
    ['Configurazione', 'elenco di ciò che è permesso', 48, 'medio'],
    ['Istruzioni', 'un consiglio, non una garanzia', 20, 'debole'],
  ];
  const w = 940;
  const rh = 58;
  const h = livelli.length * rh + 92;
  const bx = 250;
  const bw = w - bx - 30;

  const righe = livelli
    .map((l, i) => {
      const y = 56 + i * rh;
      return `
    <g class="dia__liv dia__liv--${l[3]}">
      <text x="20" y="${y + 22}" class="dia__forte">${l[0]}</text>
      <text x="20" y="${y + 38}" class="dia__min">${l[1]}</text>
      <rect x="${bx}" y="${y + 8}" width="${bw}" height="26" class="dia__traccia"/>
      <rect x="${bx}" y="${y + 8}" width="${(bw * l[2]) / 100}" height="26" class="dia__riempi"/>
      <text x="${bx + (bw * l[2]) / 100 + 10}" y="${y + 26}" class="dia__tag">${l[3]}</text>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'I livelli di controllo dal più robusto al più fragile: database, sistema operativo, esecuzione isolata, configurazione dell’applicazione, istruzioni date al modello. Un divieto che vive solo negli ultimi due livelli, per chi lo ha chiesto non esiste.',
    `
      <text x="20" y="30" class="dia__eti">dal più robusto al più fragile</text>
      ${righe}
      <path d="M20 ${h - 34} H${w - 20}" class="dia__base"/>
      <text x="20" y="${h - 12}" class="dia__min">Un divieto che vive solo negli ultimi due livelli, per chi lo ha chiesto non esiste.</text>`
  );
}

/* ---------------------------------------------------------------------------
   3. I tre esiti di una lettura sui dati.
   Il diagramma esiste per una ragione sola: far vedere che gli esiti sono tre,
   e che schiacciare il terzo sul secondo è il difetto che genera le invenzioni.
--------------------------------------------------------------------------- */

export function diagrammaEsiti() {
  const esiti = [
    ['01', 'Ho guardato,', 'ecco i dati', 'la risposta porta con sé da dove viene', 'ok'],
    ['02', 'Ho guardato,', 'non c’è niente', 'l’assenza è una risposta corretta', 'vuoto'],
    ['03', 'Non ho', 'potuto guardare', 'un guasto non è un’assenza', 'rotto'],
  ];
  const w = 940;
  const h = 268;
  const cw = 288;
  const gap = (w - 40 - cw * 3) / 2;

  const carte = esiti
    .map((e, i) => {
      const x = 20 + i * (cw + gap);
      return `
    <g class="dia__esito dia__esito--${e[4]}">
      <rect x="${x}" y="56" width="${cw}" height="150" class="dia__scatola"/>
      <rect x="${x}" y="56" width="${cw}" height="4" class="dia__cima"/>
      <text x="${x + 18}" y="88" class="dia__eti">${e[0]}</text>
      <text x="${x + 18}" y="122" class="dia__grande">${e[1]}</text>
      <text x="${x + 18}" y="148" class="dia__grande">${e[2]}</text>
      <text x="${x + 18}" y="182" class="dia__min">${e[3]}</text>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'I tre esiti di una lettura sui dati: ho guardato ed ecco i dati; ho guardato e non c’è niente; non ho potuto guardare. Il secondo e il terzo non devono somigliarsi in nessun punto della catena.',
    `
      <text x="20" y="30" class="dia__eti">tre esiti, mai due</text>
      ${carte}
      <path d="M20 236 H${w - 20}" class="dia__base"/>
      <text x="20" y="258" class="dia__min">Confondere il secondo con il terzo è il difetto che genera le invenzioni.</text>`
  );
}

/* ---------------------------------------------------------------------------
   4. La divisione del lavoro fra agenti.
   Due colonne di poteri, non tre riquadri decorativi: quello che conta è la
   colonna dei permessi, perché è lì che si vede che la separazione è vera.
--------------------------------------------------------------------------- */

export function diagrammaRuoli() {
  const ruoli = [
    ['Chi coordina', 'legge, delega, pretende la prova', ['legge', 'delega'], ['scrive']],
    ['Chi esegue', 'ha gli strumenti e un mandato stretto', ['legge', 'scrive', 'strumenti'], ['giudica']],
    ['Chi verifica', 'riceve il criterio prima del risultato', ['legge', 'giudica'], ['scrive', 'strumenti']],
  ];
  const w = 940;
  const rh = 92;
  const h = ruoli.length * rh + 86;

  const righe = ruoli
    .map((r, i) => {
      const y = 52 + i * rh;
      const si = r[2]
        .map((t, k) => `<g class="dia__perm dia__perm--si"><rect x="${430 + k * 108}" y="${y + 34}" width="98" height="24"/><text x="${430 + k * 108 + 10}" y="${y + 50}">${t}</text></g>`)
        .join('');
      const no = r[3]
        .map((t, k) => `<g class="dia__perm dia__perm--no"><rect x="${430 + k * 108}" y="${y + 4}" width="98" height="24"/><text x="${430 + k * 108 + 10}" y="${y + 20}">${t}</text></g>`)
        .join('');
      return `
    <g class="dia__ruolo">
      <text x="20" y="${y + 30}" class="dia__forte">${r[0]}</text>
      <text x="20" y="${y + 50}" class="dia__min">${r[1]}</text>
      ${no}
      ${si}
      <path d="M20 ${y + 76} H${w - 20}" class="dia__base"/>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'La divisione del lavoro fra agenti. Chi coordina legge e delega ma non scrive. Chi esegue ha gli strumenti ma non giudica. Chi verifica giudica ma non ha né scrittura né strumenti.',
    `
      <text x="20" y="26" class="dia__eti">ruolo</text>
      <text x="430" y="26" class="dia__eti">permessi negati, sopra. concessi, sotto.</text>
      ${righe}`
  );
}

/* ---------------------------------------------------------------------------
   5. Il ciclo della sostituzione dei dati personali.
   Il punto del disegno è che il valore vero non attraversa mai la linea
   tratteggiata, che è il confine dell'azienda.
--------------------------------------------------------------------------- */

export function diagrammaPrivacy() {
  const w = 940;
  const h = 300;
  const passi = [
    [30, 'Testo con i dati reali', 'sul computer di chi lavora'],
    [30, 'Riconoscimento a strati', 'regole, lingua, modello leggero'],
    [30, 'Segnaposto numerati', 'il valore resta in casa'],
  ];
  const dentro = passi
    .map((p, i) => {
      const y = 66 + i * 66;
      return `
    <g class="dia__nodo">
      <rect x="30" y="${y}" width="330" height="50" class="dia__scatola"/>
      <text x="46" y="${y + 22}" class="dia__forte">${p[1]}</text>
      <text x="46" y="${y + 39}" class="dia__min">${p[2]}</text>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'Il ciclo della sostituzione: il testo con i dati reali resta sul computer, il riconoscimento a strati individua i dati personali, i segnaposto numerati escono verso il modello, la risposta rientra e i valori veri vengono rimessi. Il valore reale non attraversa mai il confine.',
    `
      <text x="30" y="34" class="dia__eti">dentro l’azienda</text>
      <text x="${w - 250}" y="34" class="dia__eti">fuori</text>
      ${dentro}
      <path d="M420 20 V ${h - 30}" class="dia__confine"/>
      <text x="430" y="${h - 12}" class="dia__min">confine</text>

      <g class="dia__nodo">
        <rect x="${w - 330}" y="132" width="300" height="50" class="dia__scatola dia__scatola--fuori"/>
        <text x="${w - 314}" y="154" class="dia__forte">Il modello vede i segnaposto</text>
        <text x="${w - 314}" y="171" class="dia__min">non può risalire al valore, nemmeno provandoci</text>
      </g>

      <path d="M368 ${66 + 132 + 25} H${w - 338}" class="dia__filo" marker-end="url(#punta)"/>
      <path d="M${w - 338} 196 H480 V ${66 + 25} H368" class="dia__filo dia__filo--ritorno" marker-end="url(#punta)"/>
      <text x="500" y="212" class="dia__min">la risposta rientra e i valori veri tornano al loro posto</text>`
  );
}

/* ---------------------------------------------------------------------------
   6. Le tre colonne di un processo.
   Non è un elenco messo in orizzontale: la colonna di sinistra è larga il doppio
   perché è dove finisce la maggior parte del lavoro, ed è il punto del disegno.
--------------------------------------------------------------------------- */

export function diagrammaColonne() {
  const colonne = [
    ['Regola fissa', 'criterio chiaro e sempre valido', ['costa una frazione', 'non cambia idea', 'si legge e si discute'], 420],
    ['Modello', 'criterio che esiste ma non è scrivibile', ['capire un documento', 'riassumere per decidere', 'notare un caso fuori previsione'], 250],
    ['Persona', 'decisioni con conseguenze', ['ciò che va firmato', 'ciò che è irreversibile'], 200],
  ];
  const w = 940;
  const h = 268;
  let x = 20;

  const celle = colonne
    .map((c, i) => {
      const cx = x;
      x += c[3] + 15;
      const voci = c[2]
        .map((v, k) => `<text x="${cx + 18}" y="${152 + k * 24}" class="dia__min">${v}</text>`)
        .join('');
      return `
    <g class="dia__col dia__col--${i}">
      <rect x="${cx}" y="56" width="${c[3]}" height="164" class="dia__scatola"/>
      <rect x="${cx}" y="56" width="${c[3]}" height="3" class="dia__cima"/>
      <text x="${cx + 18}" y="94" class="dia__grande">${c[0]}</text>
      <text x="${cx + 18}" y="120" class="dia__eti">${c[1]}</text>
      ${voci}
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'Le tre colonne in cui si divide un processo: regola fissa, modello, persona. La prima è la più larga perché è dove finisce la maggior parte del lavoro.',
    `
      <text x="20" y="30" class="dia__eti">dove finisce ogni passaggio di un processo</text>
      ${celle}
      <path d="M20 240 H${w - 20}" class="dia__base"/>
      <text x="20" y="260" class="dia__min">La prima colonna è la più larga perché è quella dove finisce la maggior parte del lavoro.</text>`
  );
}

/* ---------------------------------------------------------------------------
   7. Come si sceglie un modello.
   Due assi veri, non un elenco: quante volte gira e quanto costa sbagliare.
   Serve a far vedere che tre quadranti su quattro non chiedono la fascia alta.
--------------------------------------------------------------------------- */

export function diagrammaScelta() {
  const w = 940;
  const h = 360;
  const x0 = 210;
  const y0 = 50;
  const lato = 250;
  const quad = [
    [0, 0, 'Economico e veloce', 'il lavoro continuo vive qui'],
    [1, 0, 'Economico, con verifica', 'ripetuto e poco costoso da sbagliare'],
    [0, 1, 'Fascia alta, chiamata', 'raro e caro da sbagliare'],
    [1, 1, 'Fascia alta, sempre', 'quasi nessun compito sta qui'],
  ];

  const celle = quad
    .map(([cx, cy, t, s]) => {
      const x = x0 + cx * lato;
      const y = y0 + (1 - cy) * lato;
      const alta = cy === 1;
      return `
    <g class="dia__quad${alta ? ' dia__quad--alta' : ''}">
      <rect x="${x}" y="${y}" width="${lato}" height="${lato}" class="dia__scatola"/>
      <text x="${x + 18}" y="${y + 40}" class="dia__forte">${t}</text>
      <text x="${x + 18}" y="${y + 62}" class="dia__min">${s}</text>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'Come si sceglie un modello: sull’asse orizzontale quante volte gira il compito, sull’asse verticale quanto costa sbagliarlo. La fascia alta serve solo dove il compito è raro e l’errore costoso.',
    `
      <text x="20" y="${y0 + 20}" class="dia__eti">costa molto sbagliare</text>
      <text x="20" y="${y0 + lato * 2 - 6}" class="dia__eti">costa poco</text>
      <path d="M${x0 - 14} ${y0} V${y0 + lato * 2}" class="dia__filo"/>
      ${celle}
      <text x="${x0}" y="${y0 + lato * 2 + 26}" class="dia__eti">gira di rado</text>
      <text x="${x0 + lato * 2 - 130}" y="${y0 + lato * 2 + 26}" class="dia__eti">gira di continuo</text>`
  );
}

/* ---------------------------------------------------------------------------
   8. Le fasi di un lavoro.
   Una scala, non una fila: ogni gradino porta un esito che si può guardare,
   e il gradino del collaudo è l'unico che può mandare indietro.
--------------------------------------------------------------------------- */

export function diagrammaFasi() {
  const fasi = [
    ['Processo', 'chi lo fa oggi, quante volte, cosa succede se manca un dato'],
    ['Divisione', 'tre colonne, e la matrice degli accessi firmata'],
    ['Costruzione', 'un pezzo alla volta, ognuno con la sua verifica'],
    ['Collaudo', 'si prova ciò che deve essere vietato'],
    ['Consegna', 'funziona anche senza di me'],
  ];
  const w = 940;
  const rh = 62;
  const h = fasi.length * rh + 76;

  const righe = fasi
    .map((f, i) => {
      const y = 46 + i * rh;
      const larg = 300 + i * 118;
      return `
    <g class="dia__fase${i === 3 ? ' dia__fase--gate' : ''}">
      <rect x="20" y="${y}" width="${larg}" height="44" class="dia__scatola"/>
      <text x="38" y="${y + 20}" class="dia__forte">${f[0]}</text>
      <text x="38" y="${y + 36}" class="dia__min">${f[1]}</text>
    </g>`;
    })
    .join('');

  return svg(
    w,
    h,
    'Le cinque fasi di un lavoro: processo, divisione, costruzione, collaudo, consegna. Il collaudo è l’unica fase che può rimandare indietro.',
    `
      <text x="20" y="26" class="dia__eti">ogni gradino lascia un esito che si può guardare</text>
      ${righe}
      <path d="M${20 + 300 + 3 * 118 + 24} ${46 + 3 * rh + 22} H${w - 40} V${46 + 2 * rh + 22} H${20 + 300 + 2 * 118 + 8}" class="dia__filo dia__filo--ritorno" marker-end="url(#punta)"/>
      <text x="${w - 250}" y="${46 + 2 * rh + 14}" class="dia__min">il collaudo rimanda indietro</text>`
  );
}

/* ---------------------------------------------------------------------------
   9. Il primo scambio.
   Tre passaggi e due esiti possibili, incluso quello in cui il lavoro non parte:
   è la parte che nessun sito mette nel disegno, ed è quella che dice come lavoro.
--------------------------------------------------------------------------- */

export function diagrammaPrimoScambio() {
  const w = 940;
  const h = 250;
  const passi = [
    ['Voi', 'quattro righe su un processo che esiste'],
    ['Io', 'quello che ho capito, e le domande sui dati'],
  ];
  const bw = 250;

  const scatole = passi
    .map((p, i) => {
      const x = 20 + i * (bw + 40);
      return `
    <g class="dia__nodo">
      <rect x="${x}" y="70" width="${bw}" height="62" class="dia__scatola"/>
      <text x="${x + 18}" y="96" class="dia__forte">${p[0]}</text>
      <text x="${x + 18}" y="116" class="dia__min">${p[1]}</text>
    </g>`;
    })
    .join('');

  const esiti = [
    ['Si parte da un pezzo', 'piccolo, con la sua verifica', 40],
    ['Non serve un agente', 'lo dico, e costa molto meno scoprirlo ora', 130],
  ];

  return svg(
    w,
    h,
    'Il primo scambio: voi descrivete un processo, io rispondo con quello che ho capito e con le domande sui dati. Da lì escono due esiti: si parte da un pezzo piccolo, oppure il problema si risolve senza agenti.',
    `
      <text x="20" y="34" class="dia__eti">primo scambio</text>
      ${scatole}
      <path d="M${20 + bw + 6} 101 H${20 + bw + 32}" class="dia__filo" marker-end="url(#punta)"/>
      ${esiti
        .map(
          (e, i) => `
      <g class="dia__esito dia__esito--${i === 0 ? 'ok' : 'vuoto'}">
        <rect x="${20 + 2 * (bw + 40)}" y="${e[2]}" width="${w - 40 - 2 * (bw + 40)}" height="62" class="dia__scatola"/>
        <rect x="${20 + 2 * (bw + 40)}" y="${e[2]}" width="3" height="62" class="dia__cima"/>
        <text x="${20 + 2 * (bw + 40) + 18}" y="${e[2] + 26}" class="dia__forte">${e[0]}</text>
        <text x="${20 + 2 * (bw + 40) + 18}" y="${e[2] + 46}" class="dia__min">${e[1]}</text>
      </g>`
        )
        .join('')}
      <path d="M${20 + 2 * bw + 46} 101 H${20 + 2 * (bw + 40) - 22} V71 H${20 + 2 * (bw + 40) - 6}" class="dia__filo" marker-end="url(#punta)"/>
      <path d="M${20 + 2 * (bw + 40) - 22} 101 V161 H${20 + 2 * (bw + 40) - 6}" class="dia__filo" marker-end="url(#punta)"/>
      <path d="M20 ${h - 26} H${w - 20}" class="dia__base"/>
      <text x="20" y="${h - 6}" class="dia__min">Il secondo esito capita più spesso di quanto sembri, ed è comunque un risultato utile.</text>`
  );
}

/* ---------------------------------------------------------------------------
   10. Il disegno statico dell'apertura.
   Sta sempre nel documento e viene tolto solo quando la scena in tempo reale è
   viva: chi non ha WebGL, chi ha chiesto meno movimento e chi ha un dispositivo
   che non regge vedono comunque la stessa idea, tre piani e i passaggi fra loro.
--------------------------------------------------------------------------- */

export function scenaFerma() {
  const piani = [
    { y: 300, dx: 0, nodi: [0.16, 0.38, 0.55, 0.74, 0.9], eti: 'dati' },
    { y: 220, dx: 26, nodi: [0.1, 0.28, 0.44, 0.6, 0.72, 0.86], eti: 'esecuzione' },
    { y: 140, dx: 52, nodi: [0.22, 0.46, 0.66, 0.84], eti: 'verifica' },
  ];
  const L = 660;
  const x0 = 90;

  const punto = (p, t) => [x0 + p.dx + t * L, p.y - t * 42];

  const cornici = piani
    .map((p) => {
      const [ax, ay] = punto(p, 0);
      const [bx, by] = punto(p, 1);
      return `<path d="M${ax} ${ay} L${bx} ${by} L${bx + 96} ${by + 54} L${ax + 96} ${ay + 54} Z" class="fermo__piano"/>
      <text x="${ax - 12}" y="${ay + 34}" class="fermo__eti" text-anchor="end">${p.eti}</text>`;
    })
    .join('\n      ');

  let fili = '';
  for (let i = 0; i < piani.length - 1; i++) {
    for (const t of piani[i].nodi) {
      const vicino = piani[i + 1].nodi.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a));
      if (Math.abs(vicino - t) > 0.22) continue;
      const [ax, ay] = punto(piani[i], t);
      const [bx, by] = punto(piani[i + 1], vicino);
      fili += `<path d="M${ax + 48} ${ay + 27} L${bx + 48} ${by + 27}" class="fermo__filo"/>\n      `;
    }
  }

  const nodi = piani
    .map((p, i) =>
      p.nodi
        .map((t, k) => {
          const [x, y] = punto(p, t);
          const r = 5 + ((i + k) % 3);
          const vivo = i === 1 && k === 2;
          return `<rect x="${x + 48 - r}" y="${y + 27 - r}" width="${r * 2}" height="${r * 2}" transform="rotate(45 ${x + 48} ${y + 27})" class="fermo__nodo${vivo ? ' fermo__nodo--vivo' : ''}"/>`;
        })
        .join('')
    )
    .join('');

  return `<div class="scena__fermo" aria-hidden="true">
  <svg viewBox="0 0 880 400" preserveAspectRatio="xMidYMid meet">
      ${cornici}
      ${fili}
      ${nodi}
  </svg>
</div>`;
}

/* --------------------------------------------------------------- involucro */

function svg(w, h, descrizione, dentro) {
  /* Su schermo stretto il diagramma si scorre in orizzontale invece di
     rimpicciolire il testo fino a renderlo illeggibile. Un'area che scorre deve
     essere raggiungibile anche da tastiera, quindi porta tabindex e un nome. */
  return `<figure class="dia" data-reveal tabindex="0" role="group" aria-label="${descrizione}">
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${descrizione}" preserveAspectRatio="xMidYMid meet" focusable="false">
    <defs>
      <marker id="punta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 z" class="dia__punta"/>
      </marker>
    </defs>${dentro}
  </svg>
</figure>`;
}
