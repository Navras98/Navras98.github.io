import { avanti, blocco } from '../layout.mjs';
import { diagrammaLivelli } from '../diagrammi.mjs';

export default {
  file: 'sicurezza.html',
  title: 'Sicurezza e isolamento',
  description:
    'La sicurezza di un agente non può stare nelle sue istruzioni: i livelli di controllo dal database al testo, minimo privilegio, isolamento dell’esecuzione, custodia dei segreti, tracciabilità e approvazione umana.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Sicurezza</p>
        <div class="blk__body">
          <h1>Le istruzioni sono un consiglio. Il sistema è un vincolo.</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Un agente non è un programma che fa sempre la stessa cosa: è un programma che decide, e decide leggendo del testo. Tutta la sicurezza sta nello stabilire cosa può succedere quando quella decisione è quella sbagliata.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Il principio',
  titolo: 'Perché un divieto scritto non è un divieto',
  corpo: `
<p>La sicurezza di un agente non può stare nelle sue istruzioni. Un'istruzione è testo che il modello legge insieme a tutto il resto, e il resto comprende quello che gli scrive un utente, il contenuto di un documento che apre, il testo di una pagina che gli è stato chiesto di leggere. In quella lista l'istruzione di sicurezza non ha nessuno stato speciale: è una frase che compete con altre frasi.</p>
<p>Qui sta la differenza fra un consiglio e un vincolo. "Non cancellare niente" è un consiglio: vale finché il modello se lo ricorda e finché nessuno lo convince che questo è il caso eccezionale. Un agente che non possiede il permesso di scrittura non cancella, e non perché ha deciso di non farlo. Il primo dipende dal comportamento, il secondo dalla struttura, e solo il secondo continua a valere il giorno in cui il comportamento cambia.</p>
<p>Le istruzioni servono, e indirizzano il comportamento normale. Vanno solo messe sopra il vincolo, mai al posto suo. La domanda con cui provo un'architettura è sempre la stessa: se il modello facesse esattamente la cosa peggiore che gli viene in mente, cosa succederebbe? Se la risposta dipende da come è scritto il testo delle istruzioni, il progetto non è finito.</p>`,
})}

${blocco({
  ann: 'I livelli',
  titolo: 'Dove passa davvero il confine',
  corpo: `
<p>I controlli non sono tutti uguali. In ordine di robustezza: il database, che separa fino alla singola colonna e alla singola riga e non chiede il permesso a nessuno; il sistema operativo, con utenze, permessi e liste di accesso; l'esecuzione isolata, che vede solo quello che le è stato montato; la configurazione dell'applicazione; e infine il testo delle istruzioni.</p>
<p>Da questa scala esce la regola più utile che conosca per leggere un progetto altrui. Se un divieto promesso a un cliente esiste solo ai due livelli più fragili, per quel cliente non esiste. Ogni riga di divieto in un contratto deve avere una corrispondenza ai primi tre, e se non ce l'ha va riscritta la riga, non rinforzata l'istruzione.</p>
<p>I livelli poi si sovrappongono di proposito. Lo stesso divieto conviene imporlo tre volte da componenti indipendenti: quel campo non compare nella vista che quel ruolo interroga, la cartella non gli è raggiungibile sul disco, e l'esecuzione isolata non se la vede montata. Non è ridondanza inutile: è la ragione per cui un errore di configurazione resta un errore invece di diventare una fuga.</p>`,
})}

      </div>

      ${diagrammaLivelli()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Minimo privilegio',
  titolo: 'Togliere uno strumento batte spiegare di non usarlo',
  corpo: `
<p>Ogni agente ha solo gli strumenti che servono al suo compito, perché togliere elimina una possibilità mentre spiegare la scoraggia. Un agente che deve leggere e riassumere non ha bisogno di poter scrivere; se non può, l'intera categoria di guasti in cui scrive qualcosa di sbagliato smette di esistere, e non va nemmeno più sorvegliata.</p>
<p>Nascondere una capacità non è la stessa cosa che impedirla. Non elencare uno strumento, o dichiararlo non disponibile, lascia il sistema in grado di eseguirlo: se per una configurazione cambiata o un aggiornamento la richiesta arriva lo stesso, viene eseguita. Uno strumento negato davvero non esiste per quel modello, quindi non può nemmeno essere convinto a usarlo.</p>
<p>C'è anche un vantaggio in tempo di pace: un agente con pochi strumenti sbaglia meno. La maggior parte degli errori seri non nasce da un abuso, nasce da uno strumento potente usato nel momento sbagliato.</p>`,
})}

${blocco({
  ann: 'Confini',
  titolo: 'Un confine per mansione, non per persona',
  corpo: `
<p>In un'azienda ognuno vede una parte: l'amministrazione vede gli importi, chi risponde ai clienti vede i contatti e non i margini. Un sistema di agenti deve riprodurre la stessa divisione, altrimenti la prima domanda curiosa fatta a un assistente diventa un accesso che quella persona non aveva, senza che nessuno abbia forzato niente.</p>
<p>Il dimensionamento giusto non è né un confine per persona né uno per tutti: è un confine per ogni gruppo che può legittimamente vedere le stesse cose. Se fra due persone deve poter esistere un segreto, servono due confini, perché chi condivide un confine condivide i poteri. E chi legge messaggi da mittenti sconosciuti va isolato dagli altri ruoli, perché tratta contenuto non fidato per mestiere.</p>
<p>La divisione non si ottiene chiedendo al modello di non rispondere. Un modello che ha davanti il dato e l'istruzione di non rivelarlo è comunque un modello che quel dato ce l'ha: basta chiederlo in un'altra forma, un riassunto, un totale, un confronto, e ne esce una parte. Il ruolo si impone prima, decidendo cosa arriva al modello, e la selezione la fa chi serve i dati, non chi li riceve.</p>`,
})}

${blocco({
  ann: 'Isolamento',
  titolo: 'Esecuzione chiusa, niente rete, niente porte',
  corpo: `
<p>Gli strumenti che eseguono qualcosa girano in un ambiente che vede solo ciò che gli è stato montato. Nessuna porta esposta verso l'esterno: i motori ascoltano solo sulla macchina, l'ambiente isolato non ha rete, e l'unica uscita verso il mondo è quella del processo che chiama il modello. La conseguenza vale la pena dirla per intero: un agente manipolato da un testo ostile non può spedire dati fuori nemmeno volendo, perché non ha una strada per farlo.</p>
<p>È l'unico modo serio di trattare l'iniezione di istruzioni ostili, che è la minaccia specifica di questa tecnologia. Qualunque testo che un agente legge può contenere ordini: una pagina, un allegato, il corpo di un messaggio, un commento dentro un documento. Non si risolve con il prompt, perché il prompt è testo e sta nella stessa lista. Si risolve togliendo il privilegio: se l'agente che legge posta sconosciuta non ha né rete né scrittura, il testo ostile ottiene al massimo una risposta strana.</p>
<p>Due dettagli che fanno fallire un'installazione in silenzio, e che si imparano solo mettendoci le mani. I permessi vanno dati all'utenza e non al gruppo, perché dentro un'esecuzione isolata senza privilegi i gruppi supplementari possono non essere mappati. E vanno impostati anche per i file che nasceranno domani, altrimenti si ottiene il caso classico in cui funzionava e poi ha smesso.</p>`,
})}

${blocco({
  ann: 'Segreti',
  titolo: 'Le credenziali non stanno nei file di progetto',
  corpo: `
<p>Non in chiaro, non per ora, non in un file che tanto non finisce da nessuna parte. I file di progetto vengono copiati, condivisi, versionati e allegati, e un segreto scritto lì dentro viaggia con loro senza che nessuno se ne accorga. Le custodisce il sistema, e chi ne ha bisogno le chiede nel momento in cui le usa.</p>
<p>Cambia anche il modo in cui si rimedia: con le credenziali in un archivio, sostituirne una è un'operazione sola e ha effetto ovunque; sparse nei file, significa cercarle tutte e sperare di averle trovate tutte. La differenza si vede il giorno in cui bisogna fare in fretta. Lo stesso vale verso i modelli: quello che entra in una conversazione con un modello remoto esce dall'azienda, quindi la chiave la conosce chi esegue l'operazione, non chi la richiede.</p>
<p>Una superficie che quasi tutti trascurano: un indirizzo di attivazione con dentro una parte casuale è a tutti gli effetti una chiave, perché conoscerlo basta per far partire quello che avvia. I filtri automatici sui segreti non lo riconoscono, perché sembra un indirizzo qualunque.</p>`,
})}

${blocco({
  ann: 'Tracciabilità',
  titolo: 'Un registro che si può solo allungare',
  corpo: `
<p>Serve un registro di quello che è successo: chi ha chiesto, quale operazione, con quali parametri, cosa è tornato indietro. Non per sorvegliare le persone, ma perché senza registro un sistema di agenti non è verificabile. Va scritto in modo che non si possa riscrivere a posteriori: solo in aggiunta, con ogni riga legata alla precedente perché togliere qualcosa nel mezzo si veda, e fuori dalla portata degli agenti di cui tiene traccia.</p>
<p>Qui va detta una cosa scomoda invece di lasciarla intendere: un registro custodito dalla stessa macchina che lo produce è cooperativo, non forense. Serve a capire cosa è successo quando tutti sono in buona fede, e va dichiarato per quello che è. Diventa una prova solo quando ogni riga viene spedita fuori appena scritta, e il riferimento diventa la copia esterna.</p>
<p>Accanto sta l'approvazione umana esplicita per le operazioni che modificano dati. E qui va fatta una scelta con la testa, perché un sistema che chiede conferma per tutto viene approvato senza guardare, e a quel punto la conferma non protegge più nessuno: è diventata un clic. Le conferme si chiedono poche volte e nei punti giusti, quelli irreversibili o visibili all'esterno.</p>`,
})}

${blocco({
  ann: 'Manutenzione',
  titolo: 'Un guasto silenzioso è peggio di un guasto rumoroso',
  corpo: `
<p>Un guasto rumoroso è un buon guasto: si vede, si data, si ripara. Il problema è quello silenzioso, e qui ne esistono di specifici. Il passaggio che fallisce e restituisce un risultato vuoto, letto a valle come "nessun risultato". L'agente che continua a rispondere mentre la sua fonte non risponde più. La verifica che ha smesso di verificare e approva tutto. Da fuori sono indistinguibili dal funzionamento normale, e si scoprono mesi dopo.</p>
<p>Per questo la sorveglianza controlla il mestiere e non l'accensione: controlli che possono fallire davvero, e un allarme che parte quando un esito atteso smette di arrivare. Un pannello tutto verde vale qualcosa solo se qualcuno, almeno una volta, ha visto quel verde diventare rosso. Le scelte di architettura e i confini del mio sistema li ho messi per iscritto in guide che uso come riferimento quando progetto per qualcun altro.</p>
<div class="limite">
  <p class="ann">Limiti dichiarati</p>
  <p>Tre cose vanno dette al cliente prima del contratto. Un motore di conversazione non è un confine di sicurezza fra utenti reciprocamente ostili: è progettato per un operatore fidato, e ciò che separa davvero due ruoli sono i permessi del database e del sistema operativo. L'identità su una chat è instradamento, non autorizzazione: dice dove va il messaggio, non se chi lo manda ne abbia diritto, e chi ha in mano il telefono sbloccato di un dipendente parla con l'agente di quel dipendente. E chi amministra la macchina vede tutto, per definizione: è un ruolo da nominare e scrivere nel contratto, non un difetto da nascondere sotto un livello in più.</p>
</div>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'dati.html',
  titolo: 'Dati e risposte deterministiche',
  riga: 'Il confine dice cosa un agente può toccare. Il passo successivo è garantire che quello che riferisce sia davvero quello che ha letto.',
})}
    </div>
  </section>
`,
};
