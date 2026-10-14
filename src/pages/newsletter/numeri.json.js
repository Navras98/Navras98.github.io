// /newsletter/numeri.json: l'elenco dei numeri nel formato di sempre (lo leggono l'automazione e chi lo usava già).
import { numeri } from '../../lib/contenuti.js';

export async function GET() {
  const elenco = await numeri();
  const corpo = {
    aggiornato: elenco[0]?.data ?? null,
    numeri: elenco.map((n) => ({ numero: n.numero, data: n.data, slug: n.slug, titolo: n.titolo, sommario: n.sommario, ...(n.lancio ? { lancio: n.lancio } : {}) })),
  };
  return new Response(JSON.stringify(corpo, null, 1) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
