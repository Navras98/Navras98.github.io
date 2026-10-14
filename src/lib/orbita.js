// Orbita dell'apertura: un anello inclinato attorno al nome. Le carte sono equidistanti e girano insieme, a due
// profondità alternate (raggio pieno o ridotto): così non si coprono mai fra loro.
// Lo usano Hero.astro (posizione iniziale, già giusta prima che parta lo script) e apertura.js (movimento).
// quota = quante carte prende l'anello rispetto agli altri; rx e ry = raggi in frazioni di larghezza e altezza;
// inclina = rotazione dell'ellisse in gradi; giro = secondi per un giro completo; verso = 1 orario, -1 antiorario.
export const ANELLI = [
  { quota: 1, rx: 0.5, ry: 0.42, inclina: -6, giro: 110, verso: 1 },
]

const GRADI = Math.PI / 180;

// Posizione di una carta al tempo t (secondi) per una finestra larga vw e un'apertura alta vh.
export function posto(anello, fase, t, vw, vh, raggio = 1) {
  const r = ANELLI[anello];
  const mobile = vw < 640;
  const medio = vw < 1100;
  const a = fase + r.verso * (t / r.giro) * Math.PI * 2;
  const larghezza = Math.min(vw, 1600) * (mobile ? 1.5 : medio ? 1.1 : 1);
  // sopra i 1100 px l'anello è un po' più stretto: meno carte tagliate dal bordo dello schermo
  const ex = Math.cos(a) * r.rx * (medio ? 1 : 0.88) * larghezza * raggio;
  const ey = Math.sin(a) * r.ry * vh * (mobile ? 1.5 : medio ? 1.06 : 1) * raggio;
  const i = r.inclina * GRADI;
  const x = ex * Math.cos(i) - ey * Math.sin(i);
  const y = ex * Math.sin(i) + ey * Math.cos(i);
  const prof = (Math.sin(a) + 1) / 2; // 1 = davanti (in basso), 0 = dietro (in alto)
  const scala = (0.7 + prof * 0.42) * (mobile ? 0.82 : medio ? 0.84 : 1);
  const ry = -Math.cos(a) * 20;
  const rz = Math.cos(a) * 2.2 + r.inclina * 0.12;
  return { x, y, ry, rz, scala, prof, z: 10 + Math.round(prof * 20) };
}

export const trasforma = ({ x, y, ry, rz, scala }) =>
  `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${scala.toFixed(3)})`;
