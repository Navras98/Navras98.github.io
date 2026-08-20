import { next } from '../layout.mjs';

export default {
  file: 'sicurezza.html',
  title: 'Architettura e sicurezza degli agenti',
  description:
    'La sicurezza di un agente non sta nelle sue istruzioni: separazione dei ruoli, minimo privilegio, isolamento dei processi, custodia dei segreti, tracciabilità e manutenzione nel tempo.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Architettura</p>
      <h1>Sicurezza degli agenti</h1>
      <p class="head__lede">Un agente non è un programma che fa sempre la stessa cosa: è un programma che decide, e che decide leggendo del testo. Tutta la sicurezza di un sistema di agenti sta nel decidere cosa può succedere quando quella decisione è quella sbagliata.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="blocks">

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Le istruzioni sono un consiglio, il sistema è un vincolo</h2>
            <p>La sicurezza di un agente non può stare nelle sue istruzioni. Un'istruzione è un testo che il modello legge insieme a tutto il resto, e il resto comprende quello che gli scrive un utente, il contenuto di un documento che apre, il testo di una pagina che gli è stato chiesto di leggere. In quella lista l'istruzione di sicurezza non ha uno stato speciale: è una frase che compete con altre frasi.</p>
            <p>Qui sta la differenza tra un consiglio e un vincolo. «Non cancellare niente» è un consiglio: vale finché il modello se lo ricorda e finché nessuno lo convince che questo è il caso eccezionale. Un agente che non ha il permesso di scrittura non cancella, e non perché ha deciso di non farlo. Il primo dipende dal comportamento, il secondo dalla struttura, e solo il secondo continua a valere il giorno in cui il comportamento cambia.</p>
            <p>Un agente convinto a parole è un agente che prima o poi fa il contrario, e non serve niente di sofisticato: basta una richiesta insistente, un caso limite che somiglia a un'eccezione legittima, o un testo scritto da qualcun altro che l'agente legge come se fosse un ordine. Le istruzioni servono, e servono davvero: indirizzano il comportamento normale, che è la gran parte del tempo. Vanno solo messe dove stanno, cioè sopra il vincolo, mai al posto suo.</p>
            <p>La domanda con cui provo un'architettura è sempre la stessa: se il modello facesse esattamente la cosa peggiore che gli viene in mente, cosa succederebbe? Se la risposta dipende da come è scritto il testo delle istruzioni, il progetto non è finito.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Separazione dei ruoli</h2>
            <p>In un'azienda con più persone ognuna vede una parte. L'amministrazione vede gli importi, chi sta in produzione vede le lavorazioni, chi risponde ai clienti vede i contatti e non i margini. Un sistema di agenti che serve quell'azienda deve riprodurre la stessa divisione: altrimenti la prima domanda curiosa fatta a un assistente diventa un accesso che quella persona non aveva, senza che nessuno abbia forzato niente.</p>
            <p>La divisione non si ottiene chiedendo al modello di non rispondere. Un modello che ha davanti il dato e l'istruzione di non rivelarlo è comunque un modello che quel dato ce l'ha: basta chiederlo in un'altra forma — un riassunto, un totale, un confronto — perché ne esca una parte. Il ruolo si impone prima, decidendo cosa arriva al modello: agenti distinti per funzione, ognuno con la propria vista sui dati, e la selezione fatta da chi serve i dati, non da chi li riceve.</p>
            <p>Lo stesso divieto conviene applicarlo su più livelli indipendenti, così un errore di configurazione non diventa automaticamente una fuga. Se un ruolo non deve vedere gli importi: quel campo non compare nella vista che quel ruolo interroga, la cartella dei documenti relativi non gli è raggiungibile, e il permesso di lettura gli è negato a monte. Tre controlli che dicono la stessa cosa non sono ridondanza inutile: sono la ragione per cui una svista resta una svista invece di diventare un incidente.</p>
            <p>Va detta anche la parte scomoda: chi amministra il sistema vede tutto, per definizione. Non è un difetto da nascondere sotto un livello in più, è un ruolo da nominare — assegnato a una persona precisa e scritto nel contratto. Un'architettura che fa finta che quel ruolo non esista non lo sta eliminando: sta solo evitando di dire chi ce l'ha.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Minimo privilegio e isolamento dei processi</h2>
            <p>Ogni agente ha solo gli strumenti che servono al suo compito. È la regola che rende di più rispetto a quanto costa: togliere uno strumento è più efficace di mille righe di istruzioni su come non usarlo, perché elimina la possibilità invece di scoraggiarla. Un agente che deve leggere e riassumere non ha bisogno di poter scrivere; se non può, l'intera categoria di guasti in cui scrive qualcosa di sbagliato smette di esistere, e non va nemmeno più sorvegliata.</p>
            <p>Nascondere una capacità non è la stessa cosa che impedirla. Non elencare uno strumento, o dichiararlo non disponibile, lascia comunque il sistema in grado di eseguirlo: se per qualsiasi ragione la richiesta arriva lo stesso — una configurazione cambiata, un percorso alternativo, un aggiornamento che sposta i valori predefiniti — viene eseguita. Il confine deve stare dove non dipende da quello che il modello sa: nell'elenco di ciò che è permesso, applicato da chi esegue e non da chi chiede.</p>
            <p>Il confine vero passa dal sistema operativo. Un processo che gira con un'identità che non ha accesso a una cartella non ci accede, qualunque cosa gli venga chiesta, e continua a non accedervi anche il giorno in cui la configurazione dell'agente viene modificata per sbaglio. Le liste di permessi dentro l'applicazione sono utili e vanno tenute, ma stanno un livello sopra: se il livello sotto è aperto, garantiscono meno di quanto sembrano. Il controllo va messo dove sta la garanzia, mai un piano più su.</p>
            <p>C'è anche un vantaggio che si vede subito, senza scomodare nessun attacco: un agente con pochi strumenti sbaglia meno anche in tempo di pace. La maggior parte degli errori seri non nasce da un abuso, ma da uno strumento potente usato nel momento sbagliato. Restringere il perimetro migliora il comportamento di tutti i giorni, non solo la resistenza al caso peggiore.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Segreti</h2>
            <p>Le credenziali non stanno nei file di progetto. Non in chiaro, non «per ora», non in un file che tanto non finisce da nessuna parte: i file di progetto vengono copiati, condivisi, versionati e allegati, e un segreto scritto lì dentro viaggia con loro senza che nessuno se ne accorga. Le custodisce il sistema, in un archivio pensato per quello, e chi ne ha bisogno le chiede nel momento in cui le usa.</p>
            <p>Cambia anche il modo in cui si rimedia, che è la parte pratica. Con le credenziali in un archivio, sostituirne una è un'operazione sola e ha effetto ovunque; con le credenziali sparse nei file, sostituirne una significa cercarle tutte e sperare di averle trovate tutte. La differenza non si vede il giorno dell'installazione: si vede il giorno in cui bisogna fare in fretta.</p>
            <p>Lo stesso vale verso i modelli. Quello che entra in una conversazione con un modello remoto esce dall'azienda, e un segreto messo lì «perché serviva» è un segreto uscito. Se un agente deve usare un servizio, deve poterlo usare senza che la chiave passi mai dal testo che il modello legge: la chiave la conosce chi esegue l'operazione, non chi la richiede.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Tracciabilità e approvazione umana</h2>
            <p>Serve un registro di quello che è successo: chi ha chiesto, che operazione è stata eseguita, con quali parametri, cosa è tornato indietro. Non per sorvegliare le persone, ma perché senza registro un sistema di agenti non è verificabile. Quando qualcosa non torna, l'alternativa al registro è la ricostruzione a memoria di chi c'era, che è esattamente il metodo che nessuno accetterebbe in nessun'altra parte dell'azienda.</p>
            <p>Il registro va scritto in modo che non si possa riscrivere a posteriori. Un registro modificabile dallo stesso sistema che descrive è una cronaca gentile: racconta quello che il sistema crede di aver fatto. Il valore sta nell'essere solo in aggiunta, ordinato nel tempo e fuori dalla portata degli agenti di cui tiene traccia.</p>
            <p>Poi l'approvazione umana esplicita per le operazioni che modificano dati. La lettura può essere libera; la scrittura, la cancellazione e l'invio verso l'esterno passano da un momento in cui una persona vede in chiaro cosa sta per succedere e dice sì. Il punto non è rallentare: è che un'operazione irreversibile abbia sempre un nome accanto.</p>
            <p>E qui va fatta una scelta con la testa, perché un sistema che chiede conferma per tutto viene approvato senza guardare, e a quel punto la conferma non protegge più nessuno: è diventata un clic. Le conferme vanno chieste poche volte e nei punti giusti — quelli irreversibili o visibili all'esterno — e questa è una decisione di progetto, non un'impostazione da lasciare al valore predefinito.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Manutenzione: un sistema si sorveglia</h2>
            <p>Un sistema di agenti non è un'installazione, è qualcosa che va sorvegliato. Non perché sia fragile, ma perché tutto ciò su cui poggia cambia sotto: i modelli vengono aggiornati e a parità di istruzioni si comportano in modo diverso, i servizi esterni modificano le loro risposte, i documenti aziendali cambiano forma, e le persone cominciano a usarlo in modi che nessuno aveva previsto il primo mese.</p>
            <p>Un guasto rumoroso è un buon guasto: si vede, si data, si ripara. Il problema è il guasto silenzioso — il passaggio che fallisce e restituisce un risultato vuoto che a valle viene letto come «nessun risultato», l'agente che continua a rispondere mentre la sua fonte di dati non risponde più, la verifica che ha smesso di verificare e approva tutto quello che le passa davanti. Visti da fuori sono indistinguibili dal funzionamento normale, e si scoprono mesi dopo, quando qualcuno nota che una risposta era sbagliata da parecchio tempo.</p>
            <p>Per questo la sorveglianza non guarda se il servizio è acceso, ma se sta ancora facendo il suo mestiere: controlli che possono fallire davvero, prove che passano per un motivo verificabile e non per caso, e un allarme che parte quando un esito atteso smette di arrivare. Un pannello tutto verde vale qualcosa solo se qualcuno, almeno una volta, ha visto quel verde diventare rosso.</p>
            <p>Le scelte di architettura e i confini di sicurezza del mio sistema li ho messi per iscritto in guide che uso come riferimento quando progetto per qualcun altro: sono la ragione per cui, davanti a un caso nuovo, non ricomincio da capo e non decido a intuito.</p>
          </div>
        </article>

      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'dati.html',
        label: 'Dati e risposte deterministiche',
        line: 'Il confine di sicurezza dice cosa un agente può toccare. Il passo successivo è garantire che quello che riferisce sia davvero quello che ha letto.',
      })}
    </div>
  </section>
`,
};
