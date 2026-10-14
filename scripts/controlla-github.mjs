// A1 — Ogni contributo citato nel sito ha link, data e stato verificati con gh oggi:
// integrata = PR integrata (data = integrazione), in revisione = PR aperta (data = apertura),
// proposta = PR chiusa senza integrazione (data = chiusura). Le prove (commenti, note di rilascio) si ricontrollano
// alla fonte: autore e data del commento, presenza di Navras98 nella riga delle note di rilascio.
// Controlla anche i numeri della fascia in home. Serve gh autenticato.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { load } from 'js-yaml';

const gh = (...a) => JSON.parse(execFileSync('gh', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const giorno = (t) => (t ? new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }) : null);
const os = load(fs.readFileSync('src/content/pagine/open-source.yml', 'utf8'));
const home = load(fs.readFileSync('src/content/pagine/home.yml', 'utf8'));
const errori = [];
const righe = [];
const pr = new Map();
const vediPr = (repo, n) => {
  const k = `${repo}#${n}`;
  if (!pr.has(k)) pr.set(k, gh('pr', 'view', String(n), '-R', repo, '--json', 'state,mergedAt,closedAt,createdAt,author,url'));
  return pr.get(k);
};
const atteso = (p) => (p.state === 'MERGED' ? ['integrata', giorno(p.mergedAt)] : p.state === 'OPEN' ? ['in revisione', giorno(p.createdAt)] : ['proposta', giorno(p.closedAt)]);

for (const c of os.contributi.voci) {
  const m = c.link.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
  if (!m) { errori.push(`contributo ${c.numero}: link non a una PR (${c.link})`); continue; }
  const p = vediPr(m[1], m[2]);
  const [stato, data] = atteso(p);
  const ok = stato === c.stato && data === c.data && Number(m[2]) === c.numero;
  if (!ok) errori.push(`contributo ${m[1]}#${m[2]}: nel sito «${c.stato}» del ${c.data}, su GitHub «${stato}» del ${data}`);
  righe.push(`  ${ok ? '✓' : '✗'} ${m[1]}#${m[2]} ${c.stato} ${c.data} (GitHub: ${p.state} ${data}, autore ${p.author.login})`);
}
for (const v of os.prove.voci) {
  let ok = true, dettaglio = '';
  const commento = v.link.match(/github\.com\/([^/]+\/[^/]+)\/(?:pull|issues)\/(\d+)#issuecomment-(\d+)/);
  const prUrl = v.link.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)(\/commits)?$/);
  const riga = v.link.match(/github\.com\/([^/]+\/[^/]+)\/blob\/([0-9a-f]{40})\/(.+?)\?plain=1#L(\d+)(?:-L(\d+))?/);
  if (commento) {
    const c = gh('api', `repos/${commento[1]}/issues/comments/${commento[3]}`);
    dettaglio = `commento di ${c.user.login} del ${giorno(c.created_at)}`;
    // la data della prova è quella dell'esito (integrazione); il commento può essere dello stesso giorno o di prima
    ok = c.user.login === 'steipete' && giorno(c.created_at) <= v.data && /navras98|thank/i.test(c.body);
  } else if (prUrl) {
    const p = vediPr(prUrl[1], prUrl[2]);
    dettaglio = `PR ${p.state} del ${giorno(p.mergedAt)}`;
    ok = p.state === 'MERGED' && giorno(p.mergedAt) === v.data;
    if (prUrl[3]) {
      const commits = gh('api', `repos/${prUrl[1]}/pulls/${prUrl[2]}/commits`);
      const coautore = commits.some((x) => /Co-authored-by: Andrea Sforna/i.test(x.commit.message));
      dettaglio += coautore ? ', co-autore Andrea Sforna' : ', CO-AUTORE ASSENTE';
      ok &&= coautore;
    }
  } else if (riga) {
    const r = await fetch(`https://raw.githubusercontent.com/${riga[1]}/${riga[2]}/${riga[3]}`);
    const testo = (await r.text()).split('\n');
    const da = Number(riga[4]), a = Number(riga[5] ?? riga[4]);
    const pezzo = testo.slice(da - 1, a).join('\n');
    ok = /navras98/i.test(pezzo);
    dettaglio = `riga ${da}${a !== da ? '-' + a : ''} di ${riga[3]}: ${ok ? 'cita navras98' : 'NON cita navras98'}`;
  } else { ok = false; dettaglio = 'link non riconosciuto'; }
  if (v.stato !== 'integrata') { ok = false; dettaglio += ' (una prova deve riguardare un contributo integrato)'; }
  if (!ok) errori.push(`prova ${v.codice}: ${dettaglio}`);
  righe.push(`  ${ok ? '✓' : '✗'} prova ${v.codice}: ${dettaglio}`);
}
// i numeri della fascia in home
const mie = gh('pr', 'list', '-R', 'openclaw/openclaw', '--author', 'Navras98', '--state', 'merged', '--json', 'number', '--limit', '100').length;
const coautore = os.contributi.voci.filter((c) => c.stato === 'integrata' && vediPr('openclaw/openclaw', c.numero).author.login !== 'Navras98').length;
const fascia = home.prove.voci.find((v) => /OpenClaw/.test(v.testo) && /integrat/i.test(v.stato));
// contributi integrati = PR di Navras98 integrate + PR integrate da altri con Navras98 coautore
const attesoFascia = `${mie + coautore} integrati`;
const okFascia = fascia?.stato === attesoFascia;
if (!okFascia) errori.push(`fascia in home: «${fascia?.stato}» invece di «${attesoFascia}»`);
righe.push(`  ${okFascia ? '✓' : '✗'} fascia in home: «${fascia?.stato}» (GitHub: ${mie} PR di Navras98 integrate in OpenClaw, ${coautore} integrata da co-autore)`);
const rilasci = new Set(os.prove.voci.filter((v) => v.codice.startsWith('rilascio-')).map((v) => v.codice));
const fasciaRil = home.prove.voci.find((v) => /aggiornament|note di rilascio/i.test(`${v.testo} ${v.stato}`));
const okRil = new RegExp(`\\b${rilasci.size}\\b`).test(fasciaRil?.stato ?? '');
if (!okRil) errori.push(`fascia in home: note di rilascio «${fasciaRil?.stato}», prove ${rilasci.size}`);
righe.push(`  ${okRil ? '✓' : '✗'} fascia in home: «${fasciaRil?.stato}» (${rilasci.size} righe di note di rilascio verificate)`);
console.log(righe.join('\n'));
console.log(`A1: ${os.contributi.voci.length} proposte e ${os.prove.voci.length} prove verificate con gh il ${giorno(new Date())}, ${errori.length} discrepanze`);
if (errori.length) { console.log(errori.map((e) => '  ✗ ' + e).join('\n')); process.exit(1); }
