import { next } from '../layout.mjs';

export default {
  file: 'competenze.html',
  title: 'Competenze',
  description:
    'Orchestrazione di più agenti, agenti costruiti sul processo di un’azienda, modelli locali e adattamento al dominio, memoria e richiamo della conoscenza.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Competenze</p>
      <h1>Cosa so fare</h1>
      <p class="head__lede">Quattro aree, non un elenco di parole chiave. Sono le cose su cui ho passato abbastanza tempo da sapere dove si rompono, e dove la differenza tra una scelta e l'altra si vede solo dopo qualche mese di esercizio.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="blocks">

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Orchestrazione di più agenti</h2>
            <p>Un solo assistente a cui si chiede tutto regge finché il compito sta in una risposta. Appena il lavoro ha più passaggi succedono tre cose, con regolarità: perde il filo di quello che aveva già fatto, ripete un passaggio che aveva chiuso e — la peggiore — dichiara completato qualcosa che non ha fatto, perché il testo che descrive un lavoro è più facile da produrre del lavoro. Nessuna delle tre è colpa di un modello scarso: è la conseguenza di tenere obiettivo, esecuzione e giudizio nella stessa testa.</p>
            <p>La divisione utile non è per argomento, è per responsabilità. L'agente che esegue ha gli strumenti per agire e un compito stretto. L'agente che verifica non ha quegli strumenti: riceve il risultato e il criterio, e la sua unica uscita possibile è un giudizio. Separarli significa che chi giudica non ha modo di aggiustare ciò che sta giudicando, ed è esattamente quello che lo rende utile.</p>
            <p>La parte difficile non è farli parlare: è impedire che si diano ragione a vicenda. Un verificatore che riceve la conclusione insieme alla domanda tende a confermarla, perché il testo dell'altro funziona da suggerimento. Le contromisure sono di progetto e non di istruzioni: dare il criterio prima del risultato, chiedere la prova contraria invece del consenso, usare più giudici con punti di vista diversi quando la cosa da valutare può fallire in modi diversi, e prendere per buona solo una maggioranza. Un verificatore che dice sempre sì costa quanto uno che serve, e non protegge da niente.</p>
            <p>Poi c'è il momento in cui i compiti smettono di essere indipendenti. Finché sono paralleli, il tempo totale è quello del più lento. Quando il secondo ha bisogno di ciò che produce il primo, metterli in parallelo non li rende veloci: li rende sbagliati, perché il secondo lavora su un dato che non esiste ancora. Riconoscere quali passaggi sono davvero in catena — e accettare che la catena imponga il ritmo — è metà del progetto. L'altra metà è non mettere in fila cose che potevano andare insieme: lì si paga attesa senza guadagnare niente.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Agenti costruiti sul processo di un'azienda</h2>
            <p>Si parte dal lavoro, non dallo strumento. La prima domanda non è quale modello, ma: chi lo fa oggi, quante volte al giorno, con quali informazioni davanti e cosa fa quando un'informazione manca. Quel «cosa fa quando manca» è quasi sempre la parte che nessuno ha mai messo per iscritto, e quasi sempre è quella che decide se un agente è possibile.</p>
            <p>Non tutto merita un agente. Un passaggio con una regola chiara e sempre valida va scritto come regola: costa una frazione, non cambia idea, e chiunque può leggerla e discuterla. Al modello conviene lasciare il passaggio dove il criterio esiste ma non è scrivibile in dieci righe: capire di cosa parla un documento scritto in un linguaggio non standard, riassumere per qualcuno che deve decidere, accorgersi che una richiesta non rientra in nessuna categoria prevista. E resta una terza colonna, che è giusto lasciare a una persona: le decisioni con conseguenze, quelle che qualcuno deve firmare.</p>
            <p>Il confine di ingresso dei dati è la prima decisione di progetto, non l'ultima. Prima di scegliere i modelli va deciso quali informazioni entrano nel sistema, chi vede cosa, e cosa può uscire dall'azienda. Deciderlo dopo vuol dire rifare l'architettura, perché da quella risposta dipende tutto il resto: dove girano i modelli, come sono separati i ruoli, cosa può restare in memoria e cosa no.</p>
            <p>Un agente aziendale utile non è quello che sa rispondere a tutto: è quello che conosce il vocabolario interno. In ogni azienda ci sono parole che significano una cosa precisa e che nessun modello generico può indovinare — lo stato di una pratica, un tipo di cliente, una sigla che distingue due processi quasi uguali. Un sistema che non conosce quelle parole dà risposte corrette in generale e inutili lì dentro, ed è il modo più comune in cui un progetto sembra funzionare in prova e non regge in reparto.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Modelli locali e adattamento al dominio</h2>
            <p>Il discriminante vero è se i dati possono uscire, non l'entusiasmo per il locale. Se esiste un vincolo — contrattuale, normativo, o semplicemente una decisione presa — per cui certi documenti non lasciano l'azienda, il modello va dove sono i dati e tutto il resto è conseguenza. Se quel vincolo non c'è, il locale va giustificato con altri argomenti: continuità del servizio, costo prevedibile, indipendenza dalle condizioni di un fornitore. «Ce l'abbiamo in casa», da solo, non è un motivo: è una spesa.</p>
            <p>Cosa si guadagna e cosa si perde, detto senza sconti. Si guadagna che i dati non attraversano nessuna rete, che il costo diventa una macchina invece di un consumo variabile, e che nessuno cambia il modello sotto i piedi da un giorno all'altro. Si perde capacità: sui compiti che richiedono ragionamento lungo o conoscenza ampia un modello grande via rete resta avanti, e non di poco. Si perde anche prontezza quando le richieste arrivano tutte insieme, perché una macchina sola serve una coda. La scelta ragionevole è quasi sempre mista: locale per il lavoro continuo e riservato, remoto per i passaggi rari e difficili, con l'architettura che tiene i due intercambiabili.</p>
            <p>Poi c'è l'adattamento al dominio. Un modello di base parla la lingua di tutti; l'azienda parla la sua. Adattarlo serve a insegnargli come si chiamano le cose lì dentro, che forma hanno i documenti che vedrà ogni giorno, e con che tono si scrive a un cliente in quel settore. Fatto su materiale vero, è quello che trasforma un assistente generico in uno che sembra aver lavorato in quell'ufficio.</p>
            <p>E qui va detta la parte che di solito non si dice: prima di addestrare conviene sempre verificare se il problema si risolve con i dati che sono già a portata di mano. Molto di ciò che sembra conoscenza mancante è materiale che in azienda esiste e non arriva al modello nel momento giusto — documenti mai indicizzati, la parte utile sepolta in un allegato, la domanda posta senza il contesto che serviva. Recuperare bene quel materiale costa meno di un addestramento, si aggiorna il giorno stesso in cui un documento cambia, e si può correggere. L'addestramento conviene quando il problema è di forma e di linguaggio, non di informazione assente: ed è una cosa che si scopre provando, non decidendo prima.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Memoria e conoscenza</h2>
            <p>Un sistema che ricorda tutto ricorda anche le cose superate. Immagazzinare è la parte facile e costa poco; il problema vero è far uscire la versione giusta al momento giusto. Una nota scritta a marzo e una scritta a settembre possono contraddirsi, e se il sistema le restituisce insieme, con la stessa autorevolezza, chi legge non ha modo di sapere quale delle due vale ancora.</p>
            <p>Per questo serve distinguere ciò che vale per sempre da ciò che vale per un giorno. Una decisione presa e un appunto di cronaca non hanno lo stesso tempo di vita: tenerli mescolati significa che il rumore recente scavalca le regole stabili, e che il sistema risponde con l'ultima cosa scritta invece che con quella giusta. Nella pratica si ottiene separando i due materiali già da come vengono raccolti, facendo invecchiare solo ciò che deve invecchiare, e riscrivendo la parte durevole in una forma stabile invece di lasciarla a competere con il diario.</p>
            <p>C'è poi una proprietà pericolosa e poco discussa: un sistema di richiamo restituisce sempre qualcosa. La ricerca per somiglianza ordina i risultati, e anche a una domanda che non ha risposta qualcosa somiglia più del resto e viene fuori. Se a valle non c'è nulla che distingua «questo è pertinente» da «questo è solo il meno lontano», il modello riceve materiale plausibile e ci costruisce sopra una risposta sicura di sé. Un sistema di memoria deve poter dire non lo so, e quel non lo so va progettato come esito previsto, non come guasto.</p>
            <p>Infine, il richiamo si misura sul bersaglio vero. È facilissimo costruire una prova che dà i numeri che piacciono: domande scritte con le stesse parole dei documenti, o valutate contando quante volte compare un termine. Quel tipo di misura sale mentre il comportamento reale peggiora, e porta a scegliere il cambiamento sbagliato con la coscienza a posto. La misura che serve è meno comoda: domande formulate come le farebbe qualcuno che quei documenti non li ha scritti, un esito dichiarato per ognuna, e dentro l'elenco anche domande che non hanno risposta, per vedere se il sistema le riconosce. Un banco di prova che non può bocciare non sta misurando niente.</p>
          </div>
        </article>

      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'sicurezza.html',
        label: 'Architettura e sicurezza degli agenti',
        line: 'Perché la sicurezza di un agente non può stare nelle sue istruzioni, e dove passa invece il confine che tiene.',
      })}
    </div>
  </section>
`,
};
