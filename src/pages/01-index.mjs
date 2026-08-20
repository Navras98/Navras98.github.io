import { next } from '../layout.mjs';

export default {
  file: 'index.html',
  title: 'Home',
  description:
    'Progetto sistemi di agenti AI per le aziende: più agenti coordinati, confini di sicurezza imposti dal sistema, risposte sui dati che si possono verificare.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Sistemi di agenti AI</p>
      <h1>Andrea Sforna</h1>
      <p class="head__lede">Progetto sistemi di agenti che lavorano dentro il processo di un'azienda: più agenti coordinati invece di un assistente solo, confini imposti dal sistema invece che raccomandati a parole, e risposte sui dati che si possono verificare una per una.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <p class="eyebrow" data-reveal>Tre cose su cui vale la pena entrare nel merito</p>
      <div class="doors" style="margin-top:1.6rem">
        <a class="door" href="sicurezza.html" data-reveal="stagger">
          <span class="door__num">01</span>
          <span class="door__title">Architettura e sicurezza degli agenti</span>
          <span class="door__line">Le istruzioni sono un consiglio, il sistema è un vincolo. Cosa cambia quando a un agente si tolgono gli strumenti invece di spiegargli come non usarli.</span>
          <span class="door__go">Apri la pagina <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="door" href="dati.html" data-reveal="stagger">
          <span class="door__num">02</span>
          <span class="door__title">Dati e risposte deterministiche</span>
          <span class="door__line">Un numero che nel database non c'è non deve diventare un numero plausibile. Tre esiti dichiarati: c'è questo, non c'è niente, si è rotto qualcosa.</span>
          <span class="door__go">Apri la pagina <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="door" href="modelli.html" data-reveal="stagger">
          <span class="door__num">03</span>
          <span class="door__title">Modelli, anche in locale</span>
          <span class="door__line">Quando un modello sulla macchina del cliente ha senso e quando è solo un costo. E come si sceglie: per compito, non per fedeltà a un fornitore.</span>
          <span class="door__go">Apri la pagina <span aria-hidden="true">&rarr;</span></span>
        </a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="blocks">
        <article class="block" data-reveal>
          <p class="block__num block__num--text">Chi sono</p>
          <div class="block__body">
          <p class="pull" style="margin-bottom:1.6rem">Da quando esistono modelli abbastanza capaci da lavorare, il mio mestiere non è più usarli: è farli lavorare insieme.</p>
          <p>Seguo l'intelligenza artificiale da quando è nata, molto prima che diventasse un prodotto di massa. Non sono arrivato con l'ondata: ho visto passare le generazioni di modelli una dopo l'altra e le ho provate mentre uscivano. Da quando esistono modelli abbastanza capaci da lavorare, il mio lavoro non è più usarli, ma farli lavorare insieme: dargli strumenti, limiti, e un modo per dimostrare quello che dicono.</p>
          <p>È un cambio di mestiere più grande di quanto sembri. Chi usa un modello giudica una risposta alla volta e se ne accorge quando è sbagliata. Chi lo fa lavorare deve decidere prima cosa succede quando la risposta è sbagliata e nessuno sta guardando: quali strumenti l'agente ha in mano in quel momento, quali dati può toccare, e se il danno si ferma da solo. È un lavoro di confini, più che di istruzioni.</p>
          <p>Per questo la parte che mi interessa non è la conversazione, ma quello che le sta sotto. Come si divide un compito fra più agenti senza che si diano ragione a vicenda. Dove conviene togliere una capacità invece di raccomandare di non usarla. Come si fa in modo che un dato letto da un archivio arrivi alla persona esattamente come era scritto, e che un dato assente venga dichiarato assente.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Il lavoro che accetto</h2>
        <p>Aziende che hanno già un processo in piedi — fatto a mano, magari male, ma reale — e vogliono affidarne una parte a un sistema di agenti che regga anche i mesi dopo la consegna. Il punto di partenza non è mai lo strumento: è il lavoro che oggi qualcuno fa a mano, con le sue eccezioni e i suoi casi che non tornano.</p>
        <p>Non faccio dimostrazioni pensate per una riunione. Un sistema che funziona una volta sola, davanti alle persone giuste, non è un lavoro consegnato: è una scena. Quello che consegno ha una verifica per ogni pezzo e un modo per accorgersi, dopo, che ha smesso di fare il suo mestiere.</p>
        <p>Se avete in mente un processo da raccontare, <a href="contatti.html">scrivetemi</a>: bastano quattro righe su chi lo fa oggi e su cosa succede quando un'informazione manca.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'competenze.html',
        label: 'Cosa so fare',
        line: 'Orchestrazione di più agenti, agenti costruiti sul processo di un’azienda, modelli locali e adattamento al dominio, memoria e richiamo della conoscenza.',
      })}
    </div>
  </section>
`,
};
