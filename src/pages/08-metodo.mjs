import { avanti } from '../layout.mjs';
import { diagrammaFasi } from '../diagrammi.mjs';

const regole = [
  [
    'Il deterministico prima del modello',
    `<p>Ogni volta che ho affidato a un modello un passaggio che aveva una regola chiara, ho ottenuto un risultato più caro, più lento e ogni tanto diverso da quello del giorno prima. Nessuno di quei tre difetti era colpa del modello: era colpa mia, che gli avevo dato il lavoro sbagliato.</p>
    <p>Prima di scrivere un'istruzione mi chiedo se quel passaggio si può scrivere come regola. Se si può, si scrive come regola, e al modello resta la parte che una regola non copre, che è sempre meno di quanto sembrasse all'inizio.</p>`,
  ],
  [
    'Niente si dichiara fatto senza una prova grezza',
    `<p>Un sistema di agenti produce con enorme facilità la descrizione di un lavoro compiuto: è testo, ed è più facile del lavoro. Per questo "fatto" richiede qualcosa che si possa guardare, prodotto in quel momento: la superficie vera che si comporta come deve, o un controllo che sarebbe fallito se la cosa non funzionasse.</p>
    <p>Vale soprattutto per le verifiche indirette, che sono le più insidiose. Che una ricerca torni con dei risultati non prova che la risposta fosse dentro quei risultati, e che un comando finisca senza errori non prova che abbia fatto il suo lavoro.</p>`,
  ],
  [
    'Meglio un errore visibile che una risposta plausibile e sbagliata',
    `<p>Un guasto rumoroso costa un'ora e si chiude. Una risposta plausibile e sbagliata costa il tempo di chi ci lavora sopra, più il tempo per capire da dove veniva, più la fiducia nel sistema per i mesi successivi.</p>
    <p>In pratica: nessun ramo che fallisce in silenzio, nessun valore di ripiego che somiglia a un dato vero, e un'assenza dichiarata come assenza invece che restituita come elenco vuoto. La terza la dimenticano quasi tutti, ed è quella che fa più danni.</p>`,
  ],
  [
    'Ogni agente ha solo i permessi che gli servono',
    `<p>Ogni strumento in mano a un agente è una cosa che può succedere. Si parte da niente e si aggiunge quello che il compito richiede, mai il contrario, perché togliere un permesso a un sistema in esercizio è una cosa che nessuno fa volentieri.</p>
    <p>È anche il modo più rapido per accorgersi che un compito è stato definito male: se per svolgerlo servono permessi larghi, quasi sempre il permesso largo sta coprendo un'indecisione.</p>`,
  ],
  [
    'Si misura il bersaglio vero, non un suo parente comodo',
    `<p>È facilissimo costruire una prova che dà i numeri che piacciono, e quasi sempre lo si fa in buona fede: si sceglie la misura più facile da eseguire, e quella somiglia al compito senza esserlo. Il numero sale mentre il comportamento reale peggiora, e si sceglie il cambiamento sbagliato con la coscienza a posto.</p>
    <p>La misura che serve è meno comoda: le stesse condizioni del lavoro vero, lette dalla configurazione reale invece che decise dentro lo strumento di misura. Un test surrogato serve a scartare, mai a decidere chi vince.</p>`,
  ],
  [
    "Una prova che non si è mai vista fallire non dimostra niente",
    `<p>Prima di dichiarare superato un controllo, si rompe apposta la cosa che quel controllo deve rilevare, e si pretende che diventi rosso. Se resta verde, quel controllo non stava guardando: era un ornamento, e per mesi ha dato una sicurezza che non aveva.</p>
    <p>Da qui esce un metodo intero, che uso quando la posta è alta: si toglie una difesa alla volta e si pretende che qualcosa diventi rosso. Una difesa che si può cancellare senza far diventare rosso niente non è protetta.</p>`,
  ],
  [
    'Una prova ha tre esiti, non due',
    `<p>Atteso, guasto del sistema, guasto della prova. Se una prova non ha prodotto nemmeno una riga di risultato misurabile, l'esito non è "rosso": è "rotto", e la distinzione è tutto, perché una prova che muore prima di arrivare alla difesa lascia il banco verde.</p>
    <p>Vale anche per il singolo controllo: uno che ha perso il bersaglio non è verde e non è un difetto trovato, è "non ho guardato". Va contato in una terza casella e detto a parole, invece di uscire con un codice di errore muto che si scambia per un difetto del prodotto.</p>`,
  ],
  [
    'I dati del cliente restano del cliente',
    `<p>Cosa esce e cosa non esce si decide all'inizio, e l'architettura viene dopo quella decisione. Il confine di ingresso dei dati si progetta prima di scegliere i modelli.</p>
    <p>Alla fine del lavoro il cliente ha in mano il proprio sistema e i propri dati, senza dipendere da un accesso mio. Se per lavorare mi serve un accesso ai vostri sistemi, si concede il minimo indispensabile per il tempo necessario e si revoca alla fine: è la stessa regola che applico agli agenti, e non vedo perché dovrebbe valere meno per me.</p>`,
  ],
  [
    'Un sistema conta se resta in piedi nel tempo',
    `<p>Il giorno della dimostrazione è il più facile: tutto è fresco e chi mostra sa dove non premere. Quello che conta è il terzo mese, quando i modelli sono stati aggiornati e le persone lo usano in modi che nessuno aveva previsto.</p>
    <p>Per questo consegno con controlli che possono fallire davvero e con un allarme che parte quando un esito atteso smette di arrivare: è l'unica differenza concreta fra un sistema e una scena.</p>`,
  ],
];

export default {
  file: 'metodo.html',
  title: 'Metodo e filosofia',
  description:
    'Nove regole di lavoro, ognuna con la situazione da cui viene, e il modo in cui si svolge un progetto: dal processo che oggi si fa a mano fino a un sistema che funziona anche senza di me.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Metodo</p>
        <div class="blk__body">
          <h1>Regole che vengono da lavori veri</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Non sono principi generali. Ognuna viene da una situazione precisa in cui la scelta opposta è costata tempo, e ognuna cambia qualcosa di concreto nel modo in cui un sistema viene costruito.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="regole">
${regole
  .map(
    ([t, c]) => `        <article class="regola" data-reveal>
          <div class="regola__corpo">
            <h2 class="regola__titolo">${t}</h2>
${c
  .trim()
  .split('\n')
  .map((r) => '            ' + r.trim())
  .join('\n')}
          </div>
        </article>`
  )
  .join('\n')}
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      ${diagrammaFasi()}

      <div class="blocchi" style="margin-top:var(--s16)">
        <article class="blk" data-reveal>
          <p class="blk__ann ann">Come si lavora</p>
          <div class="blk__body">
            <h2>Come si svolge un lavoro con me</h2>
            <h3>Si guarda il processo esistente</h3>
            <p>Prima di parlare di strumenti guardo il lavoro come viene fatto oggi: chi lo fa, con quali informazioni davanti, quante volte, e cosa succede quando qualcosa manca. È la parte meno tecnica di tutte ed è quella che decide se il resto ha senso. Da qui viene anche l'unica stima onesta possibile del guadagno: se non si sa quante volte al giorno accade una cosa, non si sa quanto vale automatizzarla.</p>

            <h3>Si decide cosa affidare a un agente e cosa no</h3>
            <p>Il processo si divide nelle tre colonne della pagina sull'<a href="automazione.html">automazione</a>: regola fissa, modello, persona. Molto di ciò che sembrava lavoro da agente finisce nella prima colonna, ed è una buona notizia.</p>
            <p>Insieme a questo si scrive la matrice degli accessi: chi può vedere cosa, chi può modificare cosa. Si compila e si firma prima di toccare un server, perché ogni riga con un "no" diventa una prova obbligatoria alla fine, e perché è il momento in cui emergono le tre domande che nessuno ha voglia di fare. Chi è l'amministratore di sistema, che vede tutto per definizione. Se i dati possono uscire dall'azienda. Chi risponde in caso di incidente.</p>

            <h3>Si costruisce un pezzo alla volta, con una verifica per ogni pezzo</h3>
            <p>Ogni pezzo entra in servizio insieme al modo di controllare che stia facendo il suo lavoro, e quel controllo deve poter fallire. Un pezzo senza verifica non è finito, è soltanto scritto. Costruire così è più lento all'inizio e molto più rapido dal terzo pezzo in avanti, perché quando qualcosa si rompe si sa subito dove.</p>

            <h3>Si collauda provando quello che deve essere vietato</h3>
            <p>La parte del collaudo che conta non è la prova che tutto funzioni: è la prova che le cose vietate siano davvero impedite. Ogni divieto della matrice diventa un tentativo vero, fatto con le credenziali del ruolo che non dovrebbe poterlo fare, e il rifiuto deve arrivare dal livello giusto. Un rifiuto qualsiasi non è una prova: un tentativo può essere respinto per un motivo che non c'entra con quello che doveva misurare. Queste prove girano in isolamento, con un'impronta del sistema calcolata prima e dopo, e se l'isolamento non c'è la prova non si esegue.</p>

            <h3>Si consegna qualcosa che funziona anche senza di me</h3>
            <p>Alla fine il cliente ha un sistema che si può leggere, un modo per sapere se sta andando, e la libertà di cambiare fornitore di modelli senza rifare l'architettura. Se per andare avanti serve richiamarmi, il lavoro non è finito bene: la dipendenza da chi ha costruito è un difetto di progetto, non un modello di business.</p>
            <p>I lavori si svolgono a pezzi, e quando un pezzo è in servizio si decide se il successivo serve davvero. Capita che dopo il primo la risposta sia no, perché il problema che sembrava grosso era concentrato lì.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'contatti.html',
  titolo: 'Contatti',
  riga: 'Il modo più utile per cominciare è raccontare il lavoro che oggi in azienda si fa a mano.',
})}
    </div>
  </section>
`,
};
