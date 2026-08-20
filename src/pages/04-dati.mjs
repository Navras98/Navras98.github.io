import { next } from '../layout.mjs';

export default {
  file: 'dati.html',
  title: 'Dati e risposte deterministiche',
  description:
    'Un dato che non esiste non deve diventare un dato plausibile: operazioni definite in anticipo, tre esiti dichiarati, controllo dei valori in uscita.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Dati</p>
      <h1>Risposte deterministiche</h1>
      <p class="head__lede">Il problema in una frase: se chiedi a un agente il numero di telefono di un cliente e quel numero nel database non c'è, il rischio non è che sbagli. È che te ne dia uno plausibile.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="blocks">

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>L'errore che non ha una firma</h2>
            <p>Un numero inventato da un modello ha il prefisso giusto, la lunghezza giusta e la forma di un numero vero. Nessuno lo guarda due volte, perché non ha niente di strano. È il tipo di errore peggiore da gestire proprio perché non lascia traccia di sé: non c'è un messaggio, non c'è un rosso da nessuna parte, non c'è un momento in cui il sistema ammette di non sapere.</p>
            <p>Un sistema che va in errore lo dichiara e qualcuno interviene. Un sistema che inventa produce un dato che entra nel lavoro di qualcun altro: viene copiato in un'offerta, chiamato, scritto in un contratto, riportato a un cliente. Viene scoperto quando fa danno, non quando nasce, e la distanza tra i due momenti è il vero costo.</p>
            <p>E succede per come funziona un modello, non per un difetto riparabile: produce la continuazione più probabile di un testo. Alla domanda «qual è il numero» la continuazione più probabile è un numero. L'assenza non è una continuazione probabile di niente: va imposta da fuori, da qualcosa che non sta scrivendo testo.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Perché non si risolve chiedendo di non inventare</h2>
            <p>Aggiungere «non inventare, se non lo sai dillo» riduce la frequenza. Non elimina il caso. Vale come tutte le istruzioni: sposta il comportamento medio. Ma quando un dato deve essere corretto tutte le volte, il comportamento medio non è il criterio con cui si giudica, e la differenza tra «quasi sempre» e «sempre» è precisamente il punto in cui l'azienda decide se può fidarsi di quel sistema.</p>
            <p>C'è anche un effetto meno ovvio: più si insiste su quel divieto, più il modello diventa prudente anche quando il dato c'è, e comincia a rispondere «non risulta» su informazioni che sono lì. Si scambia un errore con un altro. Il secondo è più facile da notare, ma non è meno costoso: un sistema che nega informazioni presenti viene abbandonato in fretta, e viene abbandonato senza che nessuno ne discuta.</p>
            <p>La domanda giusta, quindi, non è come convincere il modello. È come fare in modo che il modello non sia il posto in cui il dato viene deciso.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Come si risolve davvero</h2>
            <p>Il modello non tocca i dati. Li chiede, attraverso un elenco chiuso di operazioni definite in anticipo: ognuna con un nome, i parametri che accetta, il tipo di ogni parametro e la forma di quello che restituisce. Il modello sceglie l'operazione e compila i parametri; l'esecuzione la fa il sistema, che controlla i parametri prima di eseguire e rifiuta tutto quello che non rientra nel contratto. Il modello, in questa architettura, non ha accesso ai dati: ha accesso a un citofono.</p>
            <p>Gli esiti sono tre, distinti e dichiarati: c'è questo, non c'è niente, si è rotto qualcosa. Sono tre stati diversi che non vanno mai confusi, e il secondo è quello che quasi sempre manca. «Non c'è» è una risposta corretta: significa che la domanda è stata capita, che la ricerca è stata fatta e che il risultato è vuoto. Va restituita così dal sistema e va detta così alla persona, senza giri di parole che la facciano somigliare a un dubbio.</p>
            <p>La distanza tra il secondo e il terzo esito è tutta la partita. Se il servizio che tiene i dati non risponde e il sistema restituisce un elenco vuoto, chi legge conclude che quel cliente non esiste. Un guasto travestito da assenza è la stessa bugia di prima, arrivata da un'altra strada: per questo un risultato vuoto e un errore devono avere forme diverse fin dall'origine, e nessun passaggio intermedio ha il permesso di trasformare il secondo nel primo.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Il controllo sull'uscita</h2>
            <p>Prima che una risposta arrivi alla persona, quello che contiene si confronta con quello che è stato davvero letto. Ogni numero, data, codice, importo, indirizzo che compare nel testo deve corrispondere a un valore restituito da un'operazione. Se compare qualcosa che nessuno ha letto, la risposta non parte.</p>
            <p>Non è un controllo di stile, ed è il punto in cui il sistema smette di fidarsi del modello anche dopo avergli messo davanti i dati giusti. Perché avere il dato corretto sotto gli occhi non garantisce che venga riportato: una cifra si trasforma, due righe si fondono in una, un totale viene ricalcolato a mente invece che copiato. Sono errori piccoli e sono esattamente quelli che nessuno rilegge.</p>
            <p>Cosa fare quando il controllo scatta è una decisione di progetto, e va presa insieme al cliente: rifare la risposta con un vincolo più stretto, restituire i dati grezzi senza prosa, oppure dichiarare che non è stato possibile rispondere. Tutte e tre sono scelte accettabili, perché tutte e tre sono visibili. L'unica che non lo è è lasciar passare la risposta con un avviso in fondo che nessuno legge.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Il vantaggio economico che nessuno racconta</h2>
            <p>La parte deterministica non consuma il modello. Un'interrogazione che restituisce le fatture aperte di un cliente è codice: costa una frazione, risponde in un tempo che non dipende dal carico di un fornitore, e domani dà lo stesso risultato di oggi. Ogni pezzo di lavoro che si sposta dal modello a un'operazione definita è un pezzo che diventa più economico, più veloce e più prevedibile nello stesso momento.</p>
            <p>La quota di lavoro che si può trattare così, nei sistemi aziendali, è più grande di quanto si immagini. Il modello serve per capire cosa è stato chiesto e per scrivere la risposta in una lingua umana; in mezzo, la parte che tocca i dati non ha bisogno di lui. Restringerlo ai due estremi è raro come miglioramento, perché tre grandezze migliorano nella stessa direzione — e succede solo perché si sta togliendo un lavoro a chi non doveva farlo.</p>
            <p>C'è poi un effetto sulla ripetibilità che conta più del risparmio: la stessa domanda posta due volte restituisce lo stesso dato. Un sistema su cui qualcuno deve poter contare non può cambiare risposta perché è cambiata la versione di un modello o perché quel giorno era più creativo del solito.</p>
          </div>
        </article>

        <article class="block" data-reveal>
          <p class="block__num"></p>
          <div class="block__body">
            <h2>Vale per qualsiasi fonte</h2>
            <p>Il principio non cambia con la fonte: un database, il gestionale, il CRM, un servizio esterno, un archivio di documenti. Cambia chi esegue l'operazione e come viene dichiarata; restano fissi i tre pilastri — l'accesso passa da un elenco chiuso di operazioni con parametri controllati, l'assenza è un esito e non un silenzio, l'uscita si confronta con quello che è stato letto.</p>
            <p>Anche le scritture seguono la stessa forma, con un passaggio in più: l'operazione che modifica un dato viene preparata, mostrata in chiaro a chi decide, e applicata solo dopo un sì esplicito. Il modello può proporre la modifica; la conferma e l'applicazione stanno fuori da lui, e restano fuori anche quando il sistema è in funzione da un anno e sembra affidabile.</p>
            <p>È il motivo per cui questa impostazione invecchia bene. Cambiare gestionale significa riscrivere le operazioni, non ripensare il sistema. Cambiare modello significa sostituire chi sceglie l'operazione, mentre i controlli restano dove sono. Le due cose che in un progetto cambiano più spesso sono anche le due che questa architettura rende sostituibili.</p>
          </div>
        </article>

      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'modelli.html',
        label: 'Modelli e strumenti',
        line: 'Se i controlli stanno fuori dal modello, il modello diventa un pezzo sostituibile. Ecco quali uso, dove, e con che criterio li cambio.',
      })}
    </div>
  </section>
`,
};
