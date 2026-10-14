// E3 — axe: 0 violazioni su tutte le pagine nei due temi (regole WCAG 2.0/2.1/2.2 A e AA e buone pratiche),
// a 1440 e a 390 px, con la pagina scorsa tutta (comparse visibili).
import fs from 'node:fs';
import { serviDist, pagineDist } from './lib/server.mjs';
import { apri, pagina, scorriTutta } from './lib/browser.mjs';

const AXE = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const { base, chiudi } = await serviDist();
const browser = await apri();
const violazioni = [];
let prove = 0, incomplete = 0;
for (const u of pagineDist()) {
  for (const tema of ['dark', 'light']) {
    for (const w of [1440, 390]) {
      const { p, ctx } = await pagina(browser, base + u, { larghezza: w, tema, movimento: 'reduce' });
      await scorriTutta(p);
      await p.addScriptTag({ content: AXE });
      const r = await p.evaluate(async () => {
        const esito = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations', 'incomplete'] });
        return { v: esito.violations.map((x) => ({ id: x.id, n: x.nodes.length, esempio: x.nodes[0]?.target.join(' '), msg: x.nodes[0]?.failureSummary?.split('\n')[1]?.trim() })), i: esito.incomplete.length };
      });
      prove++; incomplete += r.i;
      for (const v of r.v) violazioni.push(`${u} (${tema}, ${w}px): ${v.id} ×${v.n} — ${v.esempio} — ${v.msg}`);
      await ctx.close();
    }
  }
}
await browser.close();
await chiudi();
if (violazioni.length) console.log(violazioni.map((x) => '  ✗ ' + x).join('\n'));
console.log(`E3: ${prove} prove (pagine × 2 temi × 2 larghezze), ${violazioni.length} violazioni axe (${incomplete} voci «da verificare a mano»)`);
process.exit(violazioni.length ? 1 : 0);
