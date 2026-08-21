/* Scena dell'apertura: il sistema di agenti, in tempo reale.
 *
 * Cosa rappresenta, perché non è un gadget:
 *  - tre piani sovrapposti sono i confini di sicurezza; un nodo non attraversa
 *    un piano se non passando da un collegamento dichiarato;
 *  - i nodi sono gli agenti, e la loro dimensione dice quanti collegamenti hanno;
 *  - gli impulsi che corrono lungo i collegamenti sono i compiti che passano di
 *    mano, e viaggiano in un verso solo: chi verifica non rimanda indietro il lavoro.
 *
 * Vincoli rispettati, in ordine di importanza:
 *  1. il testo non aspetta la scena: questo file è differito e non blocca nulla;
 *  2. si spegne con prefers-reduced-motion e non parte affatto;
 *  3. si mette in pausa fuori dallo schermo e in scheda nascosta;
 *  4. misura i fotogrammi e scende di complessità da sola invece di arrancare;
 *  5. se WebGL manca o la scena non regge, resta il disegno statico che c'è già
 *     nel documento: la pagina non perde niente.
 */

const root = document.documentElement;
const guscio = document.querySelector('[data-scena]');

if (guscio && root.classList.contains('moto')) {
  /* Prima il contenuto, poi la scena. Sette centesimi di libreria non devono
     stare sulla strada della prima pittura: si aspetta che la pagina abbia
     finito di caricare, che il processore sia libero, e che l'apertura sia
     davvero sullo schermo. Chi arriva su una pagina interna non scarica niente. */
  const quandoLibero = (f) =>
    'requestIdleCallback' in window ? requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 400);

  const quandoVisibile = () => {
    const occhio = new IntersectionObserver((voci) => {
      if (!voci[0].isIntersecting) return;
      occhio.disconnect();
      quandoLibero(() => avvia().catch(() => spegni('errore')));
    }, { rootMargin: '200px' });
    occhio.observe(guscio);
  };

  if (document.readyState === 'complete') quandoVisibile();
  else window.addEventListener('load', quandoVisibile, { once: true });
}

function spegni(motivo) {
  if (!guscio) return;
  guscio.setAttribute('data-scena-stato', motivo);
}

function colore(nome, fallback) {
  const v = getComputedStyle(root).getPropertyValue(nome).trim();
  return v || fallback;
}

async function avvia() {
  /* Chi ha chiesto al telefono di risparmiare dati non scarica una libreria da
     settecento chilobyte per un elemento decorativo. È una richiesta esplicita
     della persona, e viene prima di qualunque effetto. */
  if (navigator.connection && navigator.connection.saveData) return spegni('risparmio-dati');

  /* Prova WebGL prima di scaricare la libreria a chi non può usarla. */
  const prova = document.createElement('canvas');
  const gl = prova.getContext('webgl2') || prova.getContext('webgl');
  if (!gl) return spegni('niente-webgl');
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  if (!maxTex || maxTex < 2048) return spegni('gpu-debole');

  const THREE = await import('../vendor/three.module.min.js');

  const stretto = window.matchMedia('(max-width: 48rem)').matches;
  const memoria = navigator.deviceMemory || 8;
  const nuclei = navigator.hardwareConcurrency || 8;
  /* Tre livelli di complessità. Si parte da quello che il dispositivo dichiara
     di reggere, poi i fotogrammi misurati possono farlo scendere ancora. */
  let livello = stretto || memoria <= 4 || nuclei <= 4 ? 0 : memoria <= 8 ? 1 : 2;

  const PIANI = [
    { y: -1.55, nodi: [5, 6, 7], eti: 'dati' },
    { y: 0, nodi: [7, 9, 11], eti: 'esecuzione' },
    { y: 1.55, nodi: [4, 5, 6], eti: 'verifica' },
  ];

  const canvas = document.createElement('canvas');
  canvas.className = 'scena__tela';
  canvas.setAttribute('aria-hidden', 'true');
  guscio.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: livello > 0,
    alpha: true,
    /* mezza precisione: sulle schede dei telefoni compila prima e la differenza
       su solidi piatti e linee sottili non si vede */
    precision: livello > 1 ? 'highp' : 'mediump',
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, livello > 0 ? 2 : 1.5));

  const scena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.5, 8.4);

  const gruppo = new THREE.Group();
  scena.add(gruppo);

  /* I colori vengono dal foglio di stile: il tema chiaro e quello scuro cambiano
     le variabili, la scena si riallinea e non esiste una seconda palette da tenere
     d'accordo con la prima. */
  let tinte = leggiTinte();
  function leggiTinte() {
    return {
      nodo: new THREE.Color(colore('--scena-nodo', '#c8d2dd')),
      nodoAlto: new THREE.Color(colore('--scena-nodo-alto', '#ffffff')),
      linea: new THREE.Color(colore('--scena-linea', '#39424e')),
      accento: new THREE.Color(colore('--scena-accento', '#ff5c2b')),
      piano: new THREE.Color(colore('--scena-piano', '#232b34')),
      nebbia: new THREE.Color(colore('--scena-nebbia', '#0b0e12')),
    };
  }

  scena.fog = new THREE.Fog(tinte.nebbia, 8, 17);

  const chiaro = () => root.getAttribute('data-tema') === 'chiaro';
  const ambiente = new THREE.HemisphereLight(0xffffff, 0x202833, 0.55);
  scena.add(ambiente);
  const chiave = new THREE.DirectionalLight(0xffffff, 1.35);
  chiave.position.set(3.2, 5, 4.5);
  scena.add(chiave);
  const contro = new THREE.DirectionalLight(tinte.accento.getHex(), 0.5);
  contro.position.set(-4.5, -2, -3);
  scena.add(contro);

  /* ---------------------------------------------------------------- i piani */

  const cornici = [];
  const cornice_opacita = [];
  for (const piano of PIANI) {
    const g = new THREE.BufferGeometry();
    const L = 3.15;
    const P = 2.15;
    const v = [];
    v.push(-L, 0, -P, L, 0, -P, L, 0, -P, L, 0, P, L, 0, P, -L, 0, P, -L, 0, P, -L, 0, -P);
    const passo = livello > 0 ? 6 : 4;
    for (let i = 1; i < passo; i++) {
      const x = -L + (2 * L * i) / passo;
      v.push(x, 0, -P, x, 0, P);
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    const m = new THREE.LineBasicMaterial({
      color: tinte.piano,
      transparent: true,
      opacity: 0.55,
    });
    cornice_opacita.push(m);
    const linee = new THREE.LineSegments(g, m);
    linee.position.y = piano.y;
    gruppo.add(linee);
    cornici.push(m);
  }

  /* ---------------------------------------------------------------- i nodi */

  const nodi = [];
  for (let p = 0; p < PIANI.length; p++) {
    const quanti = PIANI[p].nodi[livello];
    for (let i = 0; i < quanti; i++) {
      /* disposizione a spirale invece che casuale: nessun grumo, nessun vuoto,
         e soprattutto la stessa immagine a ogni caricamento */
      const t = (i + 0.5) / quanti;
      const ang = t * Math.PI * 2 * 1.618 + p * 2.1;
      const r = 0.55 + t * 2.15;
      nodi.push({
        piano: p,
        base: new THREE.Vector3(Math.cos(ang) * r, PIANI[p].y, Math.sin(ang) * r * 0.68),
        fase: t * 6.28 + p,
        grado: 0,
      });
    }
  }

  /* collegamenti: dal basso verso l'alto, e qualcuno dentro lo stesso piano */
  const archi = [];
  for (let a = 0; a < nodi.length; a++) {
    for (let b = 0; b < nodi.length; b++) {
      if (a === b) continue;
      const salto = nodi[b].piano - nodi[a].piano;
      if (salto !== 1) continue;
      const d = nodi[a].base.distanceTo(nodi[b].base);
      if (d < 1.95) archi.push({ a, b, d });
    }
  }
  /* qualche scambio laterale nel piano di mezzo: gli agenti che eseguono si
     passano il lavoro, quelli che verificano no */
  for (let a = 0; a < nodi.length; a++) {
    if (nodi[a].piano !== 1) continue;
    for (let b = a + 1; b < nodi.length; b++) {
      if (nodi[b].piano !== 1) continue;
      const d = nodi[a].base.distanceTo(nodi[b].base);
      if (d < 1.15) archi.push({ a, b, d });
    }
  }
  for (const arco of archi) {
    nodi[arco.a].grado++;
    nodi[arco.b].grado++;
  }

  const geoNodo = new THREE.OctahedronGeometry(1, 0);
  /* Il colore del materiale moltiplica quello dell'istanza: se li si tinge tutti
     e due, le due tinte si moltiplicano fra loro e i solidi diventano quasi neri.
     Il materiale resta bianco, la tinta la porta l'istanza. */
  /* Su un solido sfaccettato la differenza fra un materiale fisico completo e uno
     con riflesso semplice non si vede, mentre il programma di disegno da compilare
     è una frazione: su un telefono lento è la voce di costo più grossa dell'intera
     scena, e si paga una volta sola ma in un momento pessimo, mentre la persona
     sta leggendo la prima riga. */
  const matNodo = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 18,
    specular: 0x2a3038,
    flatShading: true,
  });
  const mesh = new THREE.InstancedMesh(geoNodo, matNodo, nodi.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(nodi.length * 3), 3);
  gruppo.add(mesh);

  const dummy = new THREE.Object3D();
  const tintaNodo = new THREE.Color();
  for (let i = 0; i < nodi.length; i++) {
    nodi[i].scala = 0.075 + Math.min(nodi[i].grado, 5) * 0.021;
    tintaNodo.copy(nodi[i].piano === 2 ? tinte.nodoAlto : tinte.nodo);
    mesh.setColorAt(i, tintaNodo);
  }

  const geoLinee = new THREE.BufferGeometry();
  const posLinee = new Float32Array(archi.length * 6);
  geoLinee.setAttribute('position', new THREE.BufferAttribute(posLinee, 3));
  const matLinee = new THREE.LineBasicMaterial({
    color: tinte.linea,
    transparent: true,
    opacity: 0.72,
  });
  gruppo.add(new THREE.LineSegments(geoLinee, matLinee));

  /* --------------------------------------------------------- gli impulsi */

  const quantiImpulsi = [3, 5, 7][livello];
  const geoImp = new THREE.SphereGeometry(1, 8, 6);
  const matImp = new THREE.MeshBasicMaterial({ color: tinte.accento });
  const impulsi = new THREE.InstancedMesh(geoImp, matImp, quantiImpulsi);
  impulsi.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  gruppo.add(impulsi);

  const corse = [];
  for (let i = 0; i < quantiImpulsi; i++) {
    corse.push({ arco: (i * 7) % Math.max(archi.length, 1), t: i / quantiImpulsi, v: 0.22 });
  }

  /* ------------------------------------------------ cursore, scorrimento */

  const punt = { x: 0, y: 0, bx: 0, by: 0 };
  const grosso = window.matchMedia('(pointer: coarse)').matches;
  if (!grosso) {
    window.addEventListener(
      'pointermove',
      (e) => {
        punt.x = (e.clientX / window.innerWidth - 0.5) * 2;
        punt.y = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  let scorrimento = 0;
  let scorrimentoLisciato = 0;
  const osservaScorrimento = () => {
    const h = guscio.offsetHeight || window.innerHeight;
    scorrimento = Math.min(1, Math.max(0, window.scrollY / h));
  };
  window.addEventListener('scroll', osservaScorrimento, { passive: true });
  osservaScorrimento();

  /* ------------------------------------------------------ misura e pausa */

  let visibile = true;
  const occhio = new IntersectionObserver(
    (voci) => {
      visibile = voci[0].isIntersecting;
      if (visibile && !girando) gira();
    },
    { threshold: 0 }
  );
  occhio.observe(guscio);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visibile && !girando) gira();
  });

  function misura() {
    const r = guscio.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* la distanza si calcola sulla forma del contenitore, non sulla larghezza
       della finestra: sulla fascia bassa del telefono il riquadro è largo e basso */
    const rapporto = w / h;
    camera.position.z = rapporto > 1.9 ? 7.4 : rapporto > 1.2 ? 8.4 : 10.4;
    /* Sugli schermi larghi la scena vive nella metà destra: la colonna di
       lettura sta a sinistra e non deve avere niente dietro. */
    gruppo.position.x = w > 1000 ? 1.75 : 0;
    camera.updateProjectionMatrix();
  }
  const ridimensiona = new ResizeObserver(misura);
  ridimensiona.observe(guscio);
  misura();

  /* Il tema cambia le variabili CSS: la scena si riallinea invece di restare
     con la palette di prima. */
  new MutationObserver(() => {
    tinte = leggiTinte();
    scena.fog.color.copy(tinte.nebbia);
    matLinee.color.copy(tinte.linea);
    matImp.color.copy(tinte.accento);
    contro.color.copy(tinte.accento);
    for (const m of cornici) m.color.copy(tinte.piano);
    /* sulla carta chiara i solidi vanno schiariti e smaterializzati, altrimenti
       diventano macchie nere che pesano più del testo */
    ambiente.intensity = chiaro() ? 1.15 : 0.55;
    chiave.intensity = chiaro() ? 0.75 : 1.35;
    matNodo.roughness = chiaro() ? 0.62 : 0.34;
    matNodo.metalness = chiaro() ? 0.02 : 0.12;
    matNodo.needsUpdate = true;
    for (let i = 0; i < nodi.length; i++) {
      tintaNodo.copy(nodi[i].piano === 2 ? tinte.nodoAlto : tinte.nodo);
      mesh.setColorAt(i, tintaNodo);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    taraPerTema();
  }).observe(root, { attributes: true, attributeFilter: ['data-tema'] });

  /* --------------------------------------------------------------- il giro */

  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const P = new THREE.Vector3();
  let girando = false;
  let ultimo = performance.now();
  let orologio = 0;
  let lenti = 0;
  let campione = 0;
  let sommaDt = 0;

  function taraPerTema() {
    const c = chiaro();
    ambiente.intensity = c ? 1.05 : 0.55;
    chiave.intensity = c ? 0.9 : 1.35;
    contro.intensity = c ? 0.28 : 0.5;
    matNodo.shininess = c ? 6 : 18;
    matNodo.specular.setHex(c ? 0x1a1a18 : 0x2a3038);
    matNodo.needsUpdate = true;
    for (const m of cornice_opacita) m.opacity = c ? 0.85 : 0.55;
    matLinee.opacity = c ? 0.9 : 0.72;
  }
  taraPerTema();

  /* Un compito lungo tiene fermo il dito sullo schermo anche se la scena non si
     vede ancora. Si lascia respirare il processo prima del primo disegno, che è
     il passaggio che compila i programmi grafici. */
  await new Promise((r) => setTimeout(r, 0));

  guscio.setAttribute('data-scena-stato', 'viva');

  function gira() {
    girando = true;
    requestAnimationFrame(passo);
  }

  function passo(ora) {
    if (!visibile || document.hidden) {
      girando = false;
      return;
    }
    requestAnimationFrame(passo);

    let dt = (ora - ultimo) / 1000;
    ultimo = ora;
    if (dt > 0.1) dt = 0.1; /* dopo una pausa non si recupera il tempo perso */
    orologio += dt;

    /* Fotogrammi misurati su una finestra, non sul singolo salto: un intoppo
       isolato non deve far scendere di livello tutta la scena. */
    sommaDt += dt;
    campione++;
    if (campione >= 45) {
      const fps = campione / sommaDt;
      if (fps < 46 && livello > 0) {
        lenti++;
        if (lenti >= 2) {
          livello--;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
          matNodo.flatShading = true;
          matNodo.needsUpdate = true;
          guscio.setAttribute('data-scena-stato', 'ridotta');
          lenti = 0;
        }
      } else if (fps >= 52) {
        lenti = 0;
      }
      campione = 0;
      sommaDt = 0;
    }

    punt.bx += (punt.x - punt.bx) * Math.min(1, dt * 2.4);
    punt.by += (punt.y - punt.by) * Math.min(1, dt * 2.4);
    scorrimentoLisciato += (scorrimento - scorrimentoLisciato) * Math.min(1, dt * 2.8);

    gruppo.rotation.y = orologio * 0.055 + punt.bx * 0.42;
    gruppo.rotation.x = -0.22 + punt.by * 0.16 + scorrimentoLisciato * 0.34;
    gruppo.position.y = scorrimentoLisciato * 1.1;

    for (let i = 0; i < nodi.length; i++) {
      const n = nodi[i];
      const su = Math.sin(orologio * 0.7 + n.fase) * 0.055;
      dummy.position.set(n.base.x, n.base.y + su, n.base.z);
      dummy.rotation.set(orologio * 0.28 + n.fase, orologio * 0.34, 0);
      dummy.scale.setScalar(n.scala);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      n.attuale = dummy.position.clone();
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    for (let i = 0; i < archi.length; i++) {
      const a = nodi[archi[i].a].attuale;
      const b = nodi[archi[i].b].attuale;
      posLinee.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    }
    geoLinee.attributes.position.needsUpdate = true;

    for (let i = 0; i < corse.length; i++) {
      const c = corse[i];
      c.t += dt * c.v;
      if (c.t >= 1) {
        c.t = 0;
        /* il compito riparte da un altro collegamento: il passaggio successivo
           non è mai lo stesso due volte di fila */
        c.arco = (c.arco + 3 + i) % Math.max(archi.length, 1);
        c.v = 0.17 + ((i * 37) % 11) / 55;
      }
      const arco = archi[c.arco];
      if (!arco) continue;
      A.copy(nodi[arco.a].attuale);
      B.copy(nodi[arco.b].attuale);
      /* accelera in mezzo e rallenta agli estremi: un compito parte e arriva,
         non scorre a velocità costante come una pallina su un binario */
      const e = c.t * c.t * (3 - 2 * c.t);
      P.lerpVectors(A, B, e);
      dummy.position.copy(P);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.035 * (0.5 + Math.sin(c.t * Math.PI) * 0.9));
      dummy.updateMatrix();
      impulsi.setMatrixAt(i, dummy.matrix);
    }
    impulsi.instanceMatrix.needsUpdate = true;

    renderer.render(scena, camera);
  }

  gira();
}
