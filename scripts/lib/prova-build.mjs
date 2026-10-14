// Costruisce il sito in una cartella a parte (non tocca dist/) e restituisce esito e messaggi.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function costruisci(cartella = fs.mkdtempSync(path.join(os.tmpdir(), 'sito-prova-'))) {
  const r = spawnSync('npx', ['astro', 'build', '--outDir', cartella], { encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } });
  return { ok: r.status === 0, uscita: (r.stdout ?? '') + (r.stderr ?? ''), cartella };
}

// Cambia un file per il tempo di una prova e poi lo rimette com'era (anche se qualcosa va storto).
export async function conModifica(file, cambia, prova) {
  const originale = fs.existsSync(file) ? fs.readFileSync(file) : null;
  try {
    if (cambia === null) fs.unlinkSync(file); else fs.writeFileSync(file, typeof cambia === 'function' ? cambia(originale.toString('utf8')) : cambia);
    return await prova();
  } finally {
    if (originale === null) { if (fs.existsSync(file)) fs.unlinkSync(file); } else fs.writeFileSync(file, originale);
  }
}
