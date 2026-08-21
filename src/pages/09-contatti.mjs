import { SITE, avanti, blocco } from '../layout.mjs';
import { diagrammaPrimoScambio } from '../diagrammi.mjs';

export default {
  file: 'contatti.html',
  title: 'Contatti',
  description:
    'Scrivetemi raccontando il lavoro che oggi in azienda si fa a mano: chi lo fa, quante volte, e cosa succede quando un’informazione manca. Nessun modulo da compilare.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Contatti</p>
        <div class="blk__body">
          <h1>Raccontatemi il lavoro che oggi si fa a mano</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Quello ripetitivo, quello che nessuno vuole fare, quello che dipende da una persona sola. È il punto di partenza più utile, molto più di un'idea di quale tecnologia usare.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="contatto" data-reveal>
        <div class="contatto__riga">
          <a class="contatto__mail" href="mailto:${SITE.email}">${SITE.email}</a>
          <button class="copia" type="button" data-copy="${SITE.email}">Copia indirizzo</button>
        </div>
        <div class="contatto__riga">
          <a class="contatto__ig" href="${SITE.instagram}" rel="me noopener" target="_blank">Instagram ${SITE.instagramHandle}</a>
        </div>
      </div>
      <p class="ann" style="margin-top:var(--s4)" data-reveal>Nessun modulo da compilare. Si scrive e basta.</p>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Cosa scrivere',
  titolo: 'Quattro righe su un processo che esiste già',
  corpo: `
<p>Non serve un capitolato, e nemmeno un'idea di quale tecnologia usare: quella è la parte che tocca a me. La cosa più utile che possiate mettere in una mail è la descrizione di un processo che esiste: chi lo fa, quante volte alla settimana, quali informazioni ha davanti mentre lo fa, e cosa fa quando un'informazione manca. Da quattro righe così si capisce più che da una pagina di requisiti, perché dicono se il processo è reale oppure se è ancora un'intenzione.</p>
<p>Se avete già provato a risolverlo in qualche modo, un foglio di calcolo, una procedura scritta, un assistente commerciale che non ha retto, raccontatelo. Sapere dove un tentativo precedente si è fermato accorcia il lavoro più di qualsiasi altra informazione: quasi sempre indica il punto esatto in cui il processo ha un'eccezione che nessuno aveva messo per iscritto.</p>`,
})}

${blocco({
  ann: 'Cosa succede dopo',
  titolo: 'Rispondo con quello che ho capito e con le domande che restano',
  corpo: `
<p>Le domande riguardano quasi sempre i dati: dove stanno, in che forma, chi li può vedere e se possono uscire dall'azienda. Sono domande noiose e vengono prima di tutto il resto, perché dalla risposta dipende l'architettura intera: dove girano i modelli, come si separano i ruoli, cosa può restare in memoria.</p>
<p>Se dalle risposte viene fuori che il problema si risolve senza agenti, lo dico. Capita più spesso di quanto sembri: certi processi hanno bisogno di una regola scritta bene e di dati messi in ordine, non di un modello. È comunque un risultato utile, e costa molto meno di scoprirlo a metà di un progetto.</p>`,
})}

      </div>

      ${diagrammaPrimoScambio()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Il lavoro che accetto',
  titolo: 'Processi in piedi, risultati misurabili, pezzi piccoli',
  corpo: `
<p>Aziende con un processo già in funzione che vogliono affidarne una parte a un sistema di agenti, e che accettano l'idea che il sistema vada sorvegliato anche dopo. Lavori in cui c'è qualcosa da misurare: un tempo che si accorcia, un lavoro ripetitivo che non occupa più una persona, una risposta che oggi arriva il giorno dopo e potrebbe arrivare in un minuto.</p>
<p>Va bene anche il lavoro piccolo e ben delimitato. Un pezzo solo, costruito bene e consegnato con la sua verifica, è quasi sempre il modo migliore per capire se ha senso proseguire. Preferisco cominciare da lì che da un piano di dodici mesi scritto quando ancora non si conosce il materiale.</p>`,
})}

${blocco({
  ann: 'Il lavoro che non accetto',
  titolo: 'Quattro cose su cui non tratto',
  corpo: `
<p>Sistemi pensati per far credere a una persona che sta parlando con un'altra persona.</p>
<p>Installazioni consegnate e lasciate senza nessuno che le guardi, perché so come vanno a finire e non voglio consegnare qualcosa che si degrada in silenzio.</p>
<p>Progetti in cui la decisione su dove possono andare i dati viene rimandata a dopo. Quella decisione è la prima, non l'ultima, e rimandarla significa rifare il lavoro.</p>
<p>Lavori in cui il risultato atteso è una dimostrazione per una riunione. Un sistema che funziona una volta sola, davanti alle persone giuste, non è un lavoro consegnato.</p>`,
})}

${blocco({
  ann: 'Modo di lavorare',
  titolo: 'Pochi progetti insieme, e in italiano',
  corpo: `
<p>Non lavoro a molti progetti insieme, per un motivo pratico: la parte che richiede attenzione non è scrivere il sistema, è capire il processo di chi lo userà, e quella parte non si può fare distrattamente. Di solito questo significa che una richiesta trova spazio nel giro di poche settimane, e che vale la pena scrivere anche se il progetto non parte domani.</p>
<p>Lavoro da remoto e in italiano. Se preferite una chiamata, scrivetemi due righe prima su cosa vi serve: arrivare alla telefonata sapendo già di cosa si parla fa risparmiare tempo a tutti e due.</p>
<p>Quello che mi raccontate resta fra noi, e vale anche per il primo scambio di mail. Non uso il materiale di un cliente per un altro.</p>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'index.html',
  titolo: "Torna all'inizio",
  riga: 'Oppure ripartite dalle pagine dense: architettura dei sistemi, sicurezza e isolamento, dati e risposte deterministiche.',
})}
    </div>
  </section>
`,
};
