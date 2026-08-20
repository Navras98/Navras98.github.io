import { next } from '../layout.mjs';

export default {
  file: 'metodo.html',
  title: 'Come lavoro',
  description:
    'Sei regole di lavoro e il modo in cui si svolge un progetto: dal processo che oggi si fa a mano fino a un sistema che funziona anche senza di me.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Metodo</p>
      <h1>Come lavoro</h1>
      <p class="head__lede">Sei regole. Non sono principi generali: ognuna viene da una situazione precisa in cui la scelta opposta è costata tempo, e ognuna cambia qualcosa di concreto nel modo in cui un sistema viene costruito.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="rules">

        <article class="rule" data-reveal>
          <h2 class="rule__title">Il deterministico prima del modello</h2>
          <p>Ogni volta che ho affidato a un modello un passaggio che aveva una regola chiara, ho ottenuto un risultato più caro, più lento e ogni tanto diverso da quello di ieri. In pratica: prima di scrivere un'istruzione mi chiedo se quel passaggio si può scrivere come regola. Se si può, si scrive come regola — e al modello resta la parte che una regola non copre, che è sempre meno di quanto sembrasse all'inizio.</p>
        </article>

        <article class="rule" data-reveal>
          <h2 class="rule__title">Niente si dichiara fatto senza una prova</h2>
          <p>Un sistema di agenti produce con enorme facilità la descrizione di un lavoro compiuto: è testo, ed è più facile del lavoro. Per questo «fatto» richiede qualcosa che si possa guardare — la superficie vera che si comporta come deve, o un controllo che sarebbe fallito se la cosa non funzionasse. Vale anche per me, e vale anche per le verifiche indirette: che una ricerca torni con dei risultati non prova che la risposta fosse dentro quei risultati.</p>
        </article>

        <article class="rule" data-reveal>
          <h2 class="rule__title">Meglio un errore visibile che una risposta plausibile e sbagliata</h2>
          <p>Un guasto rumoroso costa un'ora e si chiude. Una risposta plausibile e sbagliata costa il tempo di chi ci lavora sopra, più il tempo per capire da dove veniva, più la fiducia nel sistema per i mesi successivi. In pratica significa: nessun ramo che fallisce in silenzio, nessun valore di ripiego che somiglia a un dato vero, e un'assenza dichiarata come assenza invece che restituita come elenco vuoto.</p>
        </article>

        <article class="rule" data-reveal>
          <h2 class="rule__title">Permessi minimi per ogni agente</h2>
          <p>Ogni strumento in mano a un agente è una cosa che può succedere. Si parte da niente e si aggiunge quello che il compito richiede, mai il contrario. È anche il modo più rapido per accorgersi che un compito è stato definito male: se per svolgerlo servono permessi larghi, quasi sempre è perché non si è ancora deciso davvero cosa deve fare.</p>
        </article>

        <article class="rule" data-reveal>
          <h2 class="rule__title">I dati del cliente restano del cliente</h2>
          <p>Cosa esce e cosa non esce si decide all'inizio, e l'architettura viene dopo quella decisione, non prima. Significa che il confine di ingresso dei dati si progetta prima di scegliere i modelli, che le credenziali stanno in un archivio protetto e non nei file, e che alla fine del lavoro il cliente ha in mano il proprio sistema e i propri dati senza dipendere da un accesso mio.</p>
        </article>

        <article class="rule" data-reveal>
          <h2 class="rule__title">Un sistema conta se resta in piedi nel tempo</h2>
          <p>Il giorno della dimostrazione è il giorno più facile: tutto è fresco e chi mostra sa dove non premere. Quello che conta è il terzo mese, quando i modelli sono stati aggiornati, i documenti hanno cambiato forma e le persone lo usano in modi che nessuno aveva previsto. Per questo consegno con controlli che possono fallire davvero e con un allarme che parte quando un esito atteso smette di arrivare: è l'unica differenza concreta tra un sistema e una scena.</p>
        </article>

      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Come si svolge un lavoro con me</h2>
        <p>Si guarda il processo esistente. Prima di parlare di strumenti guardo il lavoro come viene fatto oggi: chi lo fa, con quali informazioni davanti, quante volte, quanto tempo ci mette e cosa succede quando qualcosa manca. È la parte meno tecnica di tutte ed è quella che decide se il resto ha senso. Da qui viene anche l'unica stima onesta possibile del guadagno: se non si sa quante volte al giorno accade una cosa, non si sa nemmeno quanto vale automatizzarla.</p>
        <p>Si decide cosa affidare a un agente. Il processo si divide in tre colonne: quello che diventa una regola fissa, quello che ha bisogno di un modello, quello che resta a una persona perché ha conseguenze e va firmato. Molto di ciò che sembrava lavoro da agente finisce nella prima colonna, ed è una buona notizia: costa meno, è più veloce e non va sorvegliato allo stesso modo. Una divisione fatta bene qui vale più di qualsiasi scelta di modello fatta dopo.</p>
        <p>Si costruisce un pezzo alla volta, con una verifica per ogni pezzo. Ogni pezzo entra in servizio insieme al modo di controllare che stia facendo il suo lavoro, e quel controllo deve poter fallire: se non è mai stato visto fallire, non si sa se sta guardando qualcosa. Un pezzo senza verifica non è finito, è soltanto scritto. Costruire così è più lento all'inizio e molto più rapido dal terzo pezzo in avanti, perché quando qualcosa si rompe si sa subito dove.</p>
        <p>Si consegna qualcosa che funziona anche senza di me. Alla fine il cliente ha un sistema che si può leggere, un modo per sapere se sta andando, e la libertà di cambiare fornitore di modelli senza rifare l'architettura. Se per andare avanti serve richiamarmi, il lavoro non è finito bene: la dipendenza da chi ha costruito è un difetto di progetto, non un modello di business.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'contatti.html',
        label: 'Contatti',
        line: 'Il modo più utile per cominciare è raccontare il lavoro che oggi in azienda si fa a mano.',
      })}
    </div>
  </section>
`,
};
