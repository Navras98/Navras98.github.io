import { avanti, blocco } from '../layout.mjs';
import { diagrammaPrivacy } from '../diagrammi.mjs';

export default {
  file: 'privacy.html',
  title: 'Privacy e dati sensibili',
  description:
    'Quando un agente lavora su dati reali, quei dati possono uscire verso il fornitore del modello. Le tre strade possibili, e un’applicazione desktop che sostituisce i dati personali prima dell’invio e li rimette nella risposta.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Privacy</p>
        <div class="blk__body">
          <h1>Dove vanno i dati delle persone</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Nel momento in cui un agente lavora su dati veri, quei dati possono uscire verso il fornitore del modello. Chi tratta dati di persone deve decidere questo prima, non dopo, perché è la decisione da cui dipende tutta l'architettura.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'La decisione',
  titolo: 'Il confine di ingresso dei dati viene prima',
  corpo: `
<p>Prima di scegliere i modelli va deciso quali informazioni entrano nel sistema, chi vede cosa, e cosa può uscire dall'azienda. Deciderlo dopo significa rifare l'architettura, perché da quella risposta dipende dove girano i modelli, come sono separati i ruoli, cosa può restare in memoria e cosa no, e perfino il dimensionamento della macchina.</p>
<p>È anche la domanda che nessuno ha voglia di affrontare all'inizio, perché è noiosa e non produce niente di dimostrabile. Nella mia esperienza è l'unica che, rimandata, costa un progetto: tutto il resto si aggiusta strada facendo, questo no.</p>
<p>Le strade sono tre, e vanno messe sul tavolo per quello che sono. Un modello che gira dentro l'azienda, sulla macchina del cliente, e allora i dati non attraversano nessuna rete. Una riduzione dei dati prima dell'invio, cioè far uscire il testo senza le informazioni che identificano le persone. Oppure una scelta consapevole di mandare i dati fuori, messa per iscritto, con il fornitore nominato e le condizioni verificate. Le prime due sono lavoro; la terza è una decisione, e va presa da chi ne risponde.</p>`,
})}

${blocco({
  ann: 'Lo strumento',
  titolo: 'PrivacyBridge',
  corpo: `
<p>Per la seconda strada ho costruito un'applicazione desktop. Riconosce i dati personali dentro un testo o un documento, li sostituisce prima che il testo raggiunga il modello, e rimette i valori veri quando la risposta torna indietro. Gira in locale: non è un servizio a cui si manda il testo, e non è un pezzo di rete che si mette in mezzo alle comunicazioni.</p>
<p>La scelta più discussa è che il passaggio verso il modello resta un gesto della persona: si trasforma il testo, lo si porta all'assistente, si riporta indietro la risposta. Rallenta, ed è esattamente il punto. Un'integrazione automatica sarebbe più comoda e renderebbe possibile l'invio accidentale di testo non filtrato, che è precisamente il rischio che lo strumento esiste per togliere. Ogni trasformazione resta visibile invece di avvenire da qualche parte.</p>
<p>Il riconoscimento è a strati, e nessuno strato basta da solo. Regole deterministiche con validazione aritmetica per gli identificatori che hanno una struttura nota. Riconoscimento linguistico per i nomi di persona e di organizzazione, che una regola non può prendere. E un modello specializzato leggero per alzare il recupero su quello che sfugge ai primi due. La validazione con il carattere di controllo è ciò che rende usabile una regola larga: senza, la stessa espressione produce una valanga di falsi positivi e lo strumento diventa inservibile.</p>`,
})}

      </div>

      ${diagrammaPrivacy()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'La sostituzione',
  titolo: 'Segnaposto, non cifratura',
  corpo: `
<p>I valori riconosciuti vengono sostituiti da segnaposto numerati per famiglia, così il testo resta comprensibile: chi legge sa che quella è una persona, quello un indirizzo, quello un conto, e il modello può ragionarci sopra. Il valore reale resta in un deposito locale, legato alla sessione di lavoro.</p>
<p>Va detto con precisione: i segnaposto non sono cifratura. Non c'è nessuna chiave che permetta di tornare indietro, quindi chi riceve il testo non può risalire al valore neanche provandoci. Il prezzo di questa proprietà è che il ciclo va chiuso senza perdere la sessione, perché la mappatura vive lì e non è ricostruibile. È un compromesso, ed è più sicuro dell'alternativa reversibile.</p>
<p>Il deposito locale è protetto dai permessi del sistema e non è cifrato. È una cosa da dichiarare all'utente invece di lasciarla intendere, perché cambia il modello di minaccia: protegge da quello che esce verso il fornitore del modello, non da chi ha già accesso a quel computer.</p>`,
})}

${blocco({
  ann: 'La lingua',
  titolo: "Perché è tarato sull'italiano",
  corpo: `
<p>Non è una traduzione dell'interfaccia. È il motivo per cui esiste. Gli identificatori fiscali e societari italiani non hanno un equivalente anglosassone, e i riconoscitori generici semplicemente non li conoscono: passano attraverso il filtro come se fossero parole qualunque. I formati bancari arrivano con spaziature variabili e con conti esteri dentro documenti italiani. I nomi e i cognomi italiani vengono scambiati per parole comuni dai modelli addestrati su altra lingua, e sono tanti i cognomi che sono anche mestieri, luoghi o colori. Gli indirizzi con via, numero civico, codice postale e provincia hanno una struttura che i riconoscitori generici smontano male, prendendo il pezzo sbagliato. I numeri di telefono compaiono con spaziature interne irregolari che una regola rigida non tollera.</p>
<p>Il criterio che guida tutto è togliere solo ciò che è davvero un dato personale. Uno strumento che cancella tutto quello che comincia per maiuscola produce un testo che il modello non può più usare, e a quel punto la persona lo disattiva. Un filtro troppo aggressivo è un filtro spento.</p>
<p>La lezione più costosa di questo lavoro riguarda il metro di misura. Su un materiale costruito apposta i risultati erano ottimi; sui documenti veri no. I testi veri hanno ortografia irregolare, scansioni imperfette, formati misti e campi compilati da persone diverse in dieci anni. Il metro deve essere il documento vero, altrimenti si sta misurando la propria fantasia.</p>`,
})}

${blocco({
  ann: 'Il controllo',
  titolo: "La revisione umana è dentro il flusso, non a valle",
  corpo: `
<p>Una tabella mostra riga per riga cosa è stato sostituito, e si corregge a mano. Il pannello con il testo originale non viene mai sovrascritto, perché serve al confronto: la persona deve poter vedere la stessa frase nelle due versioni, non fidarsi di un elenco. Prima di copiare, se restano sospetti, lo strumento lo dice invece di lasciar passare in silenzio.</p>
<p>È proprio la tabella visibile a rendere accettabile spingere sul recupero. Senza revisione conviene un filtro prudente che perde qualcosa; con la revisione conviene un filtro largo che ogni tanto esagera, perché l'eccesso si toglie con un clic mentre l'omissione non si vede. Il compromesso di fondo è questo: mancare un dato è un danno di privacy, esagerare è un danno d'uso, e la scelta fra i due dipende da chi guarda il risultato prima che parta.</p>
<div class="limite">
  <p class="ann">Limiti dichiarati</p>
  <p>Nessun sistema di riconoscimento è perfetto, e questo non fa eccezione: la revisione umana resta parte del processo, non un passaggio facoltativo. Sui documenti scansionati il riconoscimento cala in modo netto, perché un identificatore letto male dal riconoscimento ottico non supera più la validazione aritmetica e passa come testo qualunque. E lo strumento protegge il testo che si manda a un modello: non protegge il computer su cui gira, non sostituisce le decisioni di conformità e non rende automaticamente lecito un trattamento che non lo era.</p>
</div>`,
})}

${blocco({
  ann: 'Il guasto',
  titolo: 'Un componente che smette di lavorare senza dirlo',
  corpo: `
<p>Un principio generale, che qui ha una forma particolarmente sgradevole. Se un componente di riconoscimento fallisce e l'errore viene inghiottito, il sistema continua a funzionare con gli strati che restano e ogni tanto lascia passare un nome. Non si spegne niente, non compare nessun messaggio: il risultato somiglia moltissimo a quello giusto, e la differenza si vede solo su casi specifici, quando ormai il testo è già uscito.</p>
<p>La difesa è di forma, e vale ben oltre questo strumento. Non si inghiotte mai un'eccezione. E all'avvio si verifica che ogni componente produca davvero qualcosa, invece di dare per scontato che sia partito perché non ha protestato. Un componente che non protesta e non lavora è il guasto più caro che conosca.</p>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'automazione.html',
  titolo: 'Automazione e contenuti',
  riga: 'Decisi i confini dei dati, resta da capire quale lavoro conviene mettere su un binario e quale è meglio lasciare a una persona.',
})}
    </div>
  </section>
`,
};
