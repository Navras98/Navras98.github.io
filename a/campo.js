/* VARIANTE A - il campo continuo.
   Uno strato solo, nessun oggetto: un campo di rumore con doppia deformazione del
   dominio, illuminato di taglio dalla derivata della propria altezza. Il testo non ci
   sta sopra e basta: la sua copertura entra nel campo di altezza prima
   dell'illuminazione, quindi la materia si incava e si calma sotto le lettere. */

const radice = document.documentElement;
const tela = document.getElementById('campo');

/* ------------------------------------------------------------ colori
   Il campo non ha una tavolozza sua: legge le stesse variabili del CSS, quindi
   cambiare tema cambia lo shader senza duplicare un solo valore. */

const COL = { fondo: [0.01, 0.012, 0.016], materia: [0.03, 0.035, 0.045], lume: [1, 1, 1], accento: [0.7, 0.08, 0.04],
  base: 0.34, luce: 0.62, spinta: 0.42 };

function esaAvec(s) {
  const v = s.trim().replace('#', '');
  const n = parseInt(v.length === 3 ? v.replace(/./g, '$&$&') : v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
}

function leggiColori() {
  const s = getComputedStyle(radice);
  const chiaro = radice.dataset.tema === 'chiaro';
  COL.fondo = esaAvec(s.getPropertyValue('--fondo') || '#0A0C10');
  COL.materia = chiaro ? esaAvec('#C9C4BA') : esaAvec('#2F3945');
  COL.lume = chiaro ? esaAvec('#FFFFFF') : esaAvec('#BCD0E6');
  COL.accento = esaAvec(s.getPropertyValue('--accento') || '#F0503C');
  COL.base = parseFloat(s.getPropertyValue('--campo-base')) || 0.09;
  COL.luce = parseFloat(s.getPropertyValue('--campo-luce')) || 0.62;
  COL.spinta = chiaro ? 1.20 : 0.28;
}

/* ---------------------------------------------------------------- tema */

const tasto = document.querySelector('[data-tema-tasto]');
const etichetta = document.querySelector('[data-tema-testo]');

function scriviTema(t) {
  radice.dataset.tema = t;
  if (etichetta) etichetta.textContent = t === 'scuro' ? 'Chiaro' : 'Scuro';
  if (tasto) tasto.setAttribute('aria-pressed', String(t === 'chiaro'));
  try { localStorage.setItem('tema-a', t); } catch (e) {}
  leggiColori();
}
scriviTema(radice.dataset.tema || 'scuro');

if (tasto) {
  tasto.addEventListener('click', () => {
    scriviTema(radice.dataset.tema === 'scuro' ? 'chiaro' : 'scuro');
  });
}

/* --------------------------------------------------- nome a tutta larghezza */

const nome = document.querySelector('[data-adatta]');

function adatta() {
  if (!nome) return;
  const genitore = nome.parentElement;
  const stile = getComputedStyle(genitore);
  const disponibile =
    genitore.clientWidth - parseFloat(stile.paddingLeft) - parseFloat(stile.paddingRight);
  if (disponibile <= 0) return;
  nome.style.fontSize = '100px';
  /* la larghezza vera del testo, non quella della scatola: con nowrap
     scrollWidth puo restituire la scatola e il titolo resta piccolo */
  const gamma = document.createRange();
  gamma.selectNodeContents(nome);
  const largo = gamma.getBoundingClientRect().width;
  if (!largo) return;
  /* tetto in altezza: il nome non deve mai spingere la guida fuori schermo */
  const tetto = window.innerHeight * 0.34;
  nome.style.fontSize = Math.min((100 * disponibile) / largo, tetto) + 'px';
}

/* ---------------------------------------------------------- comparse */

const daRivelare = document.querySelectorAll('[data-entra]');
if (daRivelare.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const oss = new IntersectionObserver(
    (voci) => {
      voci.forEach((v) => {
        if (v.isIntersecting) {
          v.target.dataset.visto = '';
          oss.unobserve(v.target);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px' }
  );
  daRivelare.forEach((el) => oss.observe(el));
} else {
  daRivelare.forEach((el) => (el.dataset.visto = ''));
}

/* ------------------------------------------------------------- WebGL */

const vertice = `#version 300 es
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/* Campo di flusso a bassa risoluzione, in ping-pong fra due buffer.
   Serve a una cosa sola: legare il movimento alla VELOCITA del puntatore invece
   che alla sua posizione. Lo splat e una distanza da un segmento, non da un punto:
   con un cerchio, a puntatore veloce la scia si spezza in perle. */
const flusso = `#version 300 es
precision highp float;
out vec4 esito;

uniform sampler2D uPrec;
uniform vec2  uRes;
uniform vec2  uOra;
uniform vec2  uPrima;
uniform float uRapp;
uniform float uDiss;
uniform float uRaggio;
uniform float uForza;

float sdSeg(vec2 p, vec2 a, vec2 b, float r){
  p.x *= r; a.x *= r; b.x *= r;
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 tex = 1.0 / uRes;

  /* advezione semi-lagrangiana: il campo si trasporta da solo all'indietro */
  vec2 v0 = texture(uPrec, uv).xy;
  vec2 dove = uv - v0 * tex * 26.0;
  vec2 v = texture(uPrec, dove).xy * uDiss;

  float d = sdSeg(uv, uPrima, uOra, uRapp);
  float peso = exp(-(d * d) / (uRaggio * uRaggio));
  v += (uOra - uPrima) * peso * uForza;

  esito = vec4(clamp(v, -6.0, 6.0), 0.0, 1.0);
}`;

const frammento = `#version 300 es
precision highp float;
out vec4 esito;

uniform sampler2D uFlusso;
uniform float uPesoFlusso;
uniform vec2  uRes;
uniform float uT;
uniform vec2  uPtr;
uniform sampler2D uMasc;
uniform vec3  uFondo;
uniform vec3  uMateria;
uniform vec3  uLume;
uniform vec3  uAccento;
uniform float uBase;
uniform float uLuce;
uniform float uSpinta;

float sporco(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

/* rumore a gradiente, non a valore: il rumore a valore fa cemento granuloso,
   e le sue derivate sono spigolose, quindi la luce ne esce sporca */
vec2 gradiente(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float rumore(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(dot(gradiente(i + vec2(0,0)), f - vec2(0,0)),
                 dot(gradiente(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(gradiente(i + vec2(0,1)), f - vec2(0,1)),
                 dot(gradiente(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}

const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++){ s += a * rumore(p); p = ROT * p * 2.07; a *= 0.5; }
  return s;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float rapporto = uRes.x / uRes.y;

  /* poche strutture, molto grandi: e la scala a decidere se sembra fumo denso
     o nebbia sottile. Sopra 2.0 diventa nebbia */
  vec2 p = vec2(uv.x * rapporto, uv.y) * 1.45;

  /* la deriva lenta viene dalla posizione interpolata; la reazione viva
     viene dal campo di flusso, cioe dalla velocita */
  p += (uPtr - 0.5) * 0.22;

  vec2 flu = texture(uFlusso, uv).xy * uPesoFlusso;
  p += flu * 2.2;

  float t = uT * 0.045;

  /* doppia deformazione del dominio. Una sola passata da nuvole */
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.62));
  vec2 r = vec2(fbm(p + 1.55 * q + vec2(1.7, 9.2) + t * 0.38),
                fbm(p + 1.55 * q + vec2(8.3, 2.8) - t * 0.27));
  float h = fbm(p + 1.45 * r) * 0.5 + 0.5;

  /* dove e appena passato il puntatore la materia si solleva e resta calda,
     poi si riassorbe con la dissipazione del campo */
  h += length(flu) * 0.55;

  float masc = texture(uMasc, uv).r;

  /* la copertura del testo entra PRIMA della luce: la materia si incava,
     e il bordo dell'incavo prende luce come qualsiasi altra piega */
  h -= masc * 0.26;

  /* normale dalla derivata dell'altezza, non da un secondo campionamento */
  vec3 n = normalize(vec3(-dFdx(h) * uRes.x * 0.017, -dFdy(h) * uRes.y * 0.017, 1.0));
  vec3 L = normalize(vec3(-0.86, 0.30, 0.42));

  /* luce di taglio: solo i fianchi ripidi la prendono, il resto affonda */
  float diff = pow(max(dot(n, L), 0.0), 2.4);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 64.0);

  /* rampa larga: un lato illuminato, l'altro nel buio. Senza questa il campo
     resta un grigio uniforme, che e il difetto tipico del rumore a schermo intero */
  float taglio = smoothstep(1.20, -0.10, uv.x * 0.80 + (1.0 - uv.y) * 0.32);

  float corpo = clamp(uBase + (h - 0.5) * 0.92, 0.0, 2.0);

  /* la materia non e il fondo della pagina: se lo fosse, un fondo quasi nero
     schiaccerebbe tutto il rilievo a zero e resterebbe solo grana */
  vec3 col = uFondo + uMateria * (0.22 + 1.60 * corpo);
  col += uLume * diff * uLuce * (0.14 + 0.90 * h) * (0.26 + 1.05 * taglio);
  col += uLume * spec * 0.62 * taglio;

  /* la rampa vale su tutto, non solo sulla luce: senza, il campo resta
     un grigio uniforme che e il difetto tipico del rumore a schermo intero */
  col *= 0.26 + 1.05 * taglio;

  /* una sola brace nell'angolo buio: e tutto quello che l'accento fa qui */
  col += uAccento * pow(1.0 - taglio, 2.2) * (0.10 + 0.55 * corpo) * 0.11;

  /* sotto il testo il campo si calma e si stacca dalla lettura */
  col = mix(col, uFondo * uSpinta, masc * 0.90);

  vec2 c = uv - 0.5; c.x *= rapporto;
  col *= 1.0 - dot(c, c) * 0.26;

  /* grana disegnata, non scaricata. Sotto lo 0.02 non si vede, sopra lo 0.04 sabbia */
  col += (sporco(gl_FragCoord.xy + fract(uT) * vec2(37.0, 17.0)) - 0.5)
       * 0.030 * (0.30 + 0.95 * corpo);

  col = max(col, 0.0);
  esito = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

function compila(gl, tipo, sorgente) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, sorgente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || 'shader');
  }
  return s;
}

/* ------------------------------------------------------ maschera del testo */

const mascheraTela = document.createElement('canvas');
const mctx = mascheraTela.getContext('2d', { willReadFrequently: false });
const haSpaziatura = mctx && 'letterSpacing' in mctx;

function disegnaMaschera(largo, alto) {
  if (!mctx) return;
  const passo = 3;
  mascheraTela.width = Math.max(2, Math.round(largo / passo));
  mascheraTela.height = Math.max(2, Math.round(alto / passo));
  const k = 1 / passo;

  mctx.setTransform(1, 0, 0, 1, 0, 0);
  mctx.fillStyle = '#000';
  mctx.fillRect(0, 0, mascheraTela.width, mascheraTela.height);
  mctx.fillStyle = '#fff';

  const sfoca = mctx.filter !== undefined;

  /* il nome, lettera per lettera: e l'unico blocco che merita la maschera esatta */
  if (nome) {
    const st = getComputedStyle(nome);
    const r = nome.getBoundingClientRect();
    if (r.width > 0) {
      if (sfoca) mctx.filter = 'blur(' + Math.max(2, r.height * k * 0.09) + 'px)';
      if (haSpaziatura) mctx.letterSpacing = parseFloat(st.letterSpacing || '0') * k + 'px';
      mctx.font = st.fontWeight + ' ' + parseFloat(st.fontSize) * k + 'px ' + st.fontFamily;
      mctx.textBaseline = 'alphabetic';
      /* la linea di base non e nota dal rect: si ricava dall'interlinea reale */
      const interlinea = parseFloat(st.lineHeight) || parseFloat(st.fontSize) * 1.2;
      const base = (r.top + (interlinea + parseFloat(st.fontSize) * 0.72) / 2) * k;
      mctx.fillText(nome.textContent.trim(), r.left * k, base);
      if (haSpaziatura) mctx.letterSpacing = '0px';
    }
  }

  /* Gli altri blocchi non hanno bisogno della forma delle lettere, ma nemmeno
     della scatola: un paragrafo e largo quanto la colonna anche quando la sua
     ultima riga e corta, e una fascia larga tutta la colonna si vede come un
     rettangolo scuro appiccicato sopra il campo. Si prendono le righe vere. */
  function fascia(r, morbido) {
    if (r.width <= 1 || r.bottom < -40 || r.top > alto + 40) return;
    const cx = Math.max(10, r.height * 0.45);
    const cy = r.height * (morbido ? 0.75 : 0.12) + (morbido ? 8 : 4);
    if (sfoca) mctx.filter = 'blur(' + Math.max(4, cy * k * 0.95) + 'px)';
    mctx.globalAlpha = morbido ? 0.92 : 1;
    mctx.fillRect((r.left - cx) * k, (r.top - cy) * k,
                  (r.width + cx * 2) * k, (r.height + cy * 2) * k);
    mctx.globalAlpha = 1;
  }

  document.querySelectorAll('.ruolo, .guida, .bio').forEach((el) => {
    const g = document.createRange();
    g.selectNodeContents(el);
    const righe = g.getClientRects();
    if (!righe.length) fascia(el.getBoundingClientRect(), true);
    for (let i = 0; i < righe.length; i++) fascia(righe[i], true);
  });

  /* i pannelli invece hanno una scatola vera, e la loro scatola e giusta */
  document.querySelectorAll('.tre, .piede, .barra').forEach((el) => {
    fascia(el.getBoundingClientRect(), false);
  });

  if (sfoca) mctx.filter = 'none';
}

/* ------------------------------------------------------------- ciclo */

function avvia() {
  if (!tela) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const conn = navigator.connection;
  if (conn && conn.saveData) return; /* chi risparmia dati non scarica un campo */

  let gl;
  try {
    gl = tela.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
  } catch (e) { return; }
  if (!gl) return;

  function programma(sorgente) {
    const pr = gl.createProgram();
    gl.attachShader(pr, compila(gl, gl.VERTEX_SHADER, vertice));
    gl.attachShader(pr, compila(gl, gl.FRAGMENT_SHADER, sorgente));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
    return pr;
  }

  let prog, progF;
  try {
    prog = programma(frammento);
    progF = programma(flusso);
  } catch (e) { return; }

  const u = {};
  ['uRes', 'uT', 'uPtr', 'uMasc', 'uFlusso', 'uPesoFlusso', 'uFondo', 'uMateria', 'uLume',
    'uAccento', 'uBase', 'uLuce', 'uSpinta'].forEach((k) => (u[k] = gl.getUniformLocation(prog, k)));
  const f = {};
  ['uPrec', 'uRes', 'uOra', 'uPrima', 'uRapp', 'uDiss', 'uRaggio', 'uForza'].forEach(
    (k) => (f[k] = gl.getUniformLocation(progF, k))
  );

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  /* --- maschera del testo, unita 0 --- */
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  /* la maschera arriva dal DOM in coordinate schermo: l'asse verticale va ribaltato */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  /* --- campo di flusso, unita 1: due buffer a mezza virgola in ping-pong --- */
  const LATO = 176;
  const mezzo = gl.getExtension('EXT_color_buffer_float');
  let coppia = null;

  if (mezzo) {
    coppia = [0, 1].map(() => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RG16F, LATO, LATO);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      const stato = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return stato === gl.FRAMEBUFFER_COMPLETE ? { t, fb } : null;
    });
    if (coppia.some((c) => !c)) coppia = null;
  }

  gl.useProgram(prog);
  gl.uniform1i(u.uMasc, 0);
  gl.uniform1i(u.uFlusso, 1);
  gl.uniform1f(u.uPesoFlusso, coppia ? 1 : 0);

  let scala = Math.min(0.75, 1.6 / Math.max(1, window.devicePixelRatio || 1));
  let largo = 0, alto = 0;

  function ridimensiona() {
    largo = window.innerWidth;
    alto = window.innerHeight;
    tela.width = Math.max(2, Math.round(largo * scala));
    tela.height = Math.max(2, Math.round(alto * scala));
    adatta();
    disegnaMaschera(largo, alto);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mascheraTela);
  }

  const ptr = { x: 0.5, y: 0.55, bx: 0.5, by: 0.55, px: 0.5, py: 0.55, tocco: false };
  window.addEventListener(
    'pointermove',
    (e) => {
      ptr.bx = e.clientX / window.innerWidth;
      ptr.by = 1 - e.clientY / window.innerHeight;
      ptr.tocco = true;
    },
    { passive: true }
  );

  let t0 = performance.now();
  let ultimo = t0;
  let campione = 0, somma = 0;
  let fermo = false;
  let alterna = 0;

  function giro(ora) {
    if (fermo) return;
    requestAnimationFrame(giro);
    const dt = ora - ultimo;
    ultimo = ora;

    /* deriva lenta: interpolazione a coefficiente basso, ecco la massa */
    ptr.x += (ptr.bx - ptr.x) * 0.018;
    ptr.y += (ptr.by - ptr.y) * 0.018;

    /* passata 1: il campo di flusso, alla sua risoluzione */
    if (coppia) {
      const da = coppia[alterna], a = coppia[1 - alterna];
      gl.useProgram(progF);
      gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb);
      gl.viewport(0, 0, LATO, LATO);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, da.t);
      gl.uniform1i(f.uPrec, 1);
      gl.uniform2f(f.uRes, LATO, LATO);
      gl.uniform2f(f.uOra, ptr.bx, ptr.by);
      gl.uniform2f(f.uPrima, ptr.px, ptr.py);
      gl.uniform1f(f.uRapp, largo / Math.max(1, alto));
      /* dissipazione alta: la scia resta viva qualche secondo, non un lampo */
      gl.uniform1f(f.uDiss, 0.982);
      gl.uniform1f(f.uRaggio, 0.055);
      gl.uniform1f(f.uForza, ptr.tocco ? 22 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, a.t);
      alterna = 1 - alterna;
    }
    ptr.px = ptr.bx;
    ptr.py = ptr.by;

    /* passata 2: il campo visibile */
    gl.useProgram(prog);
    gl.viewport(0, 0, tela.width, tela.height);
    gl.uniform2f(u.uRes, tela.width, tela.height);
    gl.uniform1f(u.uT, (ora - t0) / 1000);
    gl.uniform2f(u.uPtr, ptr.x, ptr.y);
    gl.uniform3fv(u.uFondo, COL.fondo);
    gl.uniform3fv(u.uMateria, COL.materia);
    gl.uniform3fv(u.uLume, COL.lume);
    gl.uniform3fv(u.uAccento, COL.accento);
    gl.uniform1f(u.uBase, COL.base);
    gl.uniform1f(u.uLuce, COL.luce);
    gl.uniform1f(u.uSpinta, COL.spinta);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* se non regge, la complessita scende da sola invece di far scattare i fotogrammi */
    if (dt < 120) { somma += dt; campione++; }
    if (campione >= 90) {
      const medio = somma / campione;
      somma = 0; campione = 0;
      if (medio > 19.5 && scala > 0.34) { scala = Math.max(0.34, scala * 0.76); ridimensiona(); }
      else if (medio < 12.5 && scala < 0.75) { scala = Math.min(0.75, scala * 1.12); ridimensiona(); }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { fermo = true; }
    else if (fermo) { fermo = false; ultimo = performance.now(); requestAnimationFrame(giro); }
  });

  let attesa;
  window.addEventListener('resize', () => {
    clearTimeout(attesa);
    attesa = setTimeout(ridimensiona, 120);
  });

  ridimensiona();
  tela.dataset.acceso = '';
  requestAnimationFrame(giro);
}

/* il testo prima degli effetti, sempre */
function quandoLibero(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1200 });
  else setTimeout(fn, 300);
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { adatta(); });
}
adatta();
window.addEventListener('resize', adatta, { passive: true });

if (document.readyState === 'complete') quandoLibero(avvia);
else window.addEventListener('load', () => quandoLibero(avvia));
