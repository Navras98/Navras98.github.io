import { avanti, blocco } from '../layout.mjs';
import { diagrammaPercorso, diagrammaEsiti } from '../diagrammi.mjs';

export default {
  file: 'dati.html',
  title: 'Dati e risposte deterministiche',
  description:
    'Un dato che non esiste non deve diventare un dato plausibile: operazioni dichiarate in anticipo, tre esiti mai confusi, provenienza riga per riga, cancello sui valori in uscita, scritture in due tempi.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Dati</p>
        <div class="blk__body">
          <h1>Un dato che non c'è non deve diventare un dato plausibile</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Se chiedi a un agente il numero di telefono di un cliente e quel numero nel database non c'è, il rischio non è che sbagli. È che te ne dia uno plausibile.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Il problema',
  titolo: "L'errore che non ha una firma",
  corpo: `
<p>Un numero inventato da un modello ha il prefisso giusto, la lunghezza giusta e la forma di un numero vero. Nessuno lo guarda due volte. È l'errore peggiore da gestire proprio perché non lascia traccia di sé: nessun messaggio, nessun rosso, nessun momento in cui il sistema ammette di non sapere.</p>
<p>Un sistema che va in errore lo dichiara e qualcuno interviene. Un sistema che inventa produce un dato che entra nel lavoro di qualcun altro: viene copiato in un'offerta, chiamato, scritto in un contratto, riportato a un cliente. Viene scoperto quando fa danno, non quando nasce, e la distanza fra i due momenti è il vero costo.</p>
<p>E succede per come funziona un modello, non per un difetto riparabile: produce la continuazione più probabile di un testo, e alla domanda "qual è il numero" la continuazione più probabile è un numero. L'assenza non è una continuazione probabile di niente. Va imposta da fuori, da qualcosa che non sta scrivendo testo.</p>`,
})}

${blocco({
  ann: 'La strada sbagliata',
  titolo: 'Perché non si risolve chiedendo di non inventare',
  corpo: `
<p>Aggiungere "non inventare, se non lo sai dillo" riduce la frequenza. Non elimina il caso. Vale come tutte le istruzioni: sposta il comportamento medio. Ma quando un dato deve essere corretto tutte le volte, il comportamento medio non è il criterio con cui si giudica, e la differenza fra quasi sempre e sempre è il punto in cui l'azienda decide se può fidarsi.</p>
<p>C'è poi un problema di fondo, più semplice di quanto sembri: chi non deve inventare è lo stesso che dovrebbe accorgersene. Si chiede a un componente di sorvegliare sé stesso usando lo stesso meccanismo che ha prodotto il problema. Non è una questione di quanto è bravo il modello.</p>
<p>E più si insiste su quel divieto, più il modello diventa prudente anche quando il dato c'è, e comincia a rispondere "non risulta" su informazioni che sono lì. Si scambia un errore con un altro: il secondo è più facile da notare e non è meno costoso, perché un sistema che nega informazioni presenti viene abbandonato in fretta.</p>`,
})}

      </div>

      ${diagrammaPercorso()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'La soluzione',
  titolo: 'Il modello non tocca i dati',
  corpo: `
<p>Il modello non compone interrogazioni. Sceglie da un insieme chiuso di operazioni dichiarate in anticipo, ognuna con un nome, i parametri che accetta e la forma di quello che restituisce. Il modello sceglie e compila i parametri; l'esecuzione la fa il sistema, che li controlla prima e rifiuta tutto quello che non rientra nel contratto. In questa architettura il modello non ha accesso ai dati: ha accesso a un citofono.</p>
<p>Il componente che parla con i dati è un processo separato, non un pezzo che gira dentro il motore di conversazione: tutto il valore dell'impianto sta nell'essere isolato. Chi legge non scrive, con credenziali distinte, e la sola lettura va provata con una scrittura vera che il motore deve respingere: una sonda che si limita a chiedere se può scrivere può ottenere un sì innocuo, e a quel punto la verifica dice il falso.</p>
<p>Ogni risposta porta con sé da dove viene: fonte, tabella, chiave e valore della chiave riga per riga, momento della lettura. La portano anche le risposte vuote e quelle in errore, che sono i due casi in cui serve di più. Questa provenienza si deriva dall'istruzione e dallo schema invece di essere scritta a mano nel contratto, dove invecchierebbe in silenzio alla prima modifica.</p>`,
})}

${blocco({
  ann: 'Gli esiti',
  titolo: 'Tre, mai due',
  corpo: `
<p>Ho guardato ed ecco i dati. Ho guardato e non c'è niente. Non ho potuto guardare. Sono tre stati diversi e non vanno confusi in nessun punto della catena; il secondo è quello che quasi sempre manca. "Non c'è" è una risposta corretta: la domanda è stata capita, la ricerca è stata fatta, il risultato è vuoto. Va detta così alla persona, senza giri di parole che la facciano somigliare a un dubbio.</p>
<p>La distanza fra il secondo e il terzo esito è tutta la partita. Se il servizio che tiene i dati non risponde e il sistema restituisce un elenco vuoto, chi legge conclude che quel cliente non esiste. Un guasto travestito da assenza è la stessa bugia di prima, arrivata da un'altra strada. È anche la ragione per cui diffido dei rami che catturano un errore e restituiscono un valore neutro: sembra robustezza, ed è il modo più comune in cui un guasto entra nel sistema travestito da dato.</p>`,
})}

      </div>

      ${diagrammaEsiti()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Il cancello',
  titolo: 'Il controllo sui valori in uscita',
  corpo: `
<p>Prima che una risposta arrivi alla persona, quello che contiene si confronta con quello che è stato davvero letto in quel turno. Ogni numero, data, codice, importo, indirizzo che compare nel testo deve corrispondere a un valore restituito da un'operazione. Se compare qualcosa che nessuno ha letto, la risposta non parte.</p>
<p>È confronto fra stringhe, non giudizio di un altro modello, e questa è la parte che conta: un giudice che valuta se la risposta sembra corretta ha lo stesso difetto di quello che l'ha scritta. Le famiglie di valori non si mescolano, perché un codice e una quantità possono avere le stesse cifre e significati opposti, e lo zero iniziale distingue un identificativo da un numero.</p>
<p>Dove si mette il cancello ha conseguenze grosse: va sull'ultimo passaggio prima dell'uscita. Gli agganci intermedi di revisione cedono in molti modi che nessuno prevede, un'eccezione, un limite di tempo, un tetto di tentativi raggiunto, e un cancello che cede è un cancello aperto che non lo dice a nessuno.</p>
<p>Cosa fare quando scatta si decide insieme al cliente: rifare la risposta con un vincolo più stretto, restituire i dati grezzi senza prosa, oppure dichiarare che non è stato possibile rispondere. Tutte e tre sono accettabili perché tutte e tre sono visibili. L'unica che non lo è è lasciar passare la risposta con un avviso in fondo che nessuno legge.</p>`,
})}

${blocco({
  ann: 'Le scritture',
  titolo: 'Si preparano, non si applicano',
  corpo: `
<p>Un'operazione che modifica un dato viene preparata e mostrata in chiaro a chi decide, non eseguita. Il modello può proporre; la conferma e l'applicazione stanno fuori da lui, e restano fuori anche quando il sistema è in funzione da un anno e sembra affidabile.</p>
<p>L'approvazione arriva da un canale che l'agente non può raggiungere, e il processo che la raccoglie non è a sua volta un agente: non ha nessun modello dentro e non interpreta niente, perché un componente che interpreta si può convincere. La decisione si esegue con i parametri della richiesta originale, mai con quelli del messaggio di risposta. Chi può approvare sta in un elenco chiuso, la scadenza è reale, un secondo tocco non approva due volte. E se il canale è spento la richiesta scade e nega, invece di restare appesa: un'attesa infinita è il modo in cui un'operazione irreversibile finisce approvata da chi ha fretta.</p>`,
})}

${blocco({
  ann: 'Costo',
  titolo: 'Il vantaggio economico che nessuno racconta',
  corpo: `
<p>La parte deterministica non consuma il modello. Un'interrogazione che restituisce le fatture aperte di un cliente è codice: costa una frazione, risponde in un tempo che non dipende dal carico di un fornitore, e domani dà lo stesso risultato di oggi. È raro che tre grandezze migliorino nella stessa direzione, e qui succede solo perché si sta togliendo un lavoro a chi non doveva farlo.</p>
<p>La quota di lavoro che si può trattare così, nei sistemi aziendali, è più grande di quanto si immagini: il modello serve per capire cosa è stato chiesto e per scrivere la risposta in una lingua umana, e in mezzo la parte che tocca i dati non ha bisogno di lui. Conta anche più del risparmio l'effetto sulla ripetibilità: la stessa domanda posta due volte restituisce lo stesso dato, e un sistema su cui qualcuno deve poter contare non può cambiare risposta perché è cambiata la versione di un modello.</p>`,
})}

${blocco({
  ann: 'Portata',
  titolo: 'Vale per qualsiasi fonte',
  corpo: `
<p>Il principio non cambia con la fonte: un database, il gestionale, il CRM, un servizio esterno, un archivio di documenti. Cambia chi esegue l'operazione e come viene dichiarata; restano fissi i tre pilastri. L'accesso passa da un insieme chiuso di operazioni con parametri controllati. L'assenza è un esito e non un silenzio. L'uscita si confronta con quello che è stato letto.</p>
<p>È anche il motivo per cui questa impostazione invecchia bene. Cambiare gestionale significa riscrivere le operazioni, non ripensare il sistema; cambiare modello significa sostituire chi sceglie l'operazione, mentre i controlli restano dove sono. Le due cose che in un progetto cambiano più spesso sono anche le due che questa architettura rende sostituibili.</p>
<div class="limite">
  <p class="ann">Limiti dichiarati</p>
  <p>Il cancello sull'uscita confronta valori, quindi vede le cifre inventate e non vede le relazioni sbagliate: se il testo attribuisce a un cliente un importo che appartiene davvero a un altro cliente letto nello stesso turno, tutti i valori risultano presenti e la risposta passa. Contro questo servono operazioni che restituiscano già la relazione, invece di lasciarla ricostruire alla prosa. E se tutti i componenti girano con la stessa utenza di sistema, tenere il processo dei dati separato toglie l'incidente ma non l'attacco: l'unico confine vero è un'utenza distinta per chi approva.</p>
</div>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'privacy.html',
  titolo: 'Privacy e dati sensibili',
  riga: 'Un dato letto correttamente resta un dato di una persona. La domanda successiva è se possa uscire dall’azienda, e a quali condizioni.',
})}
    </div>
  </section>
`,
};
