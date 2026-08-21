import { avanti } from '../layout.mjs';
import { scenaFerma } from '../diagrammi.mjs';

export default {
  file: 'index.html',
  title: 'Home',
  scena: true,
  description:
    'Progetto architetture di agenti AI per le aziende: più agenti coordinati con ruoli separati, confini imposti dal sistema e non dalle istruzioni, risposte sui dati che si possono verificare valore per valore.',
  body: `  <section class="apertura">
    <div class="scena" data-scena data-scena-stato="fermo">
${scenaFerma()}
    </div>
    <div class="apertura__inner">
      <div class="apertura__testo" data-reveal>
        <p class="ann ann--accento">Architetture di agenti AI</p>
        <h1>Andrea Sforna</h1>
        <p class="apertura__riga">Progetto sistemi in cui più agenti lavorano dentro il processo di un'azienda: ruoli separati per costruzione, confini imposti dal sistema operativo e dal database, e risposte sui dati che si possono confrontare con quello che è stato davvero letto.</p>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <p class="ann" data-reveal>Tre cose su cui vale la pena entrare nel merito</p>
      <div class="porte">
        <a class="porta" href="architettura.html" data-reveal="scala">
          <p class="ann">01</p>
          <span class="porta__titolo">Architettura dei sistemi di agenti</span>
          <span class="porta__riga">Un assistente solo che fa tutto si perde, si ripete e dichiara concluso quello che non ha fatto. La parte difficile non è farli parlare: è impedire che si diano ragione a vicenda.</span>
          <span class="porta__vai">Apri <span aria-hidden="true">&#8594;</span></span>
        </a>
        <a class="porta" href="sicurezza.html" data-reveal="scala">
          <p class="ann">02</p>
          <span class="porta__titolo">Sicurezza e isolamento</span>
          <span class="porta__riga">Le istruzioni sono un consiglio, il sistema è un vincolo. I livelli di controllo hanno una robustezza diversa, e un divieto che vive solo nei due più fragili per il cliente non esiste.</span>
          <span class="porta__vai">Apri <span aria-hidden="true">&#8594;</span></span>
        </a>
        <a class="porta" href="dati.html" data-reveal="scala">
          <p class="ann">03</p>
          <span class="porta__titolo">Dati e risposte deterministiche</span>
          <span class="porta__riga">Un numero che nel database non c'è non deve diventare un numero plausibile. Tre esiti dichiarati, mai due: ecco i dati, non c'è niente, non ho potuto leggere.</span>
          <span class="porta__vai">Apri <span aria-hidden="true">&#8594;</span></span>
        </a>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">
        <article class="blk" data-reveal>
          <p class="blk__ann ann">Chi sono</p>
          <div class="blk__body">
            <p class="tesi">Da quando esistono modelli capaci di lavorare davvero, il mio mestiere non è più usarli. È farli lavorare insieme.</p>
            <p>Seguo l'intelligenza artificiale da quando è nata, molto prima che diventasse un prodotto di massa. Non sono arrivato con l'ondata: ho visto passare le generazioni di modelli una dopo l'altra e le ho provate mentre uscivano. Da quando esistono modelli capaci di lavorare davvero, il mio mestiere non è più usarli, è farli lavorare insieme: dargli strumenti, limiti, e un modo per dimostrare quello che dicono. Studio ogni giorno, sul campo, su sistemi che restano accesi e che devono funzionare anche quando non sto guardando.</p>
            <p>È un cambio di mestiere più grande di quanto sembri. Chi usa un modello giudica una risposta alla volta e se ne accorge quando è sbagliata. Chi lo fa lavorare deve decidere prima che cosa succede quando la risposta è sbagliata e nessuno sta guardando: quali strumenti l'agente ha in mano in quel momento, quali dati può toccare, e se il danno si ferma da solo. È un lavoro di confini, molto più che di istruzioni.</p>
            <p>Per questo la parte che mi interessa non è la conversazione, è quello che le sta sotto. Come si divide un compito fra più agenti senza che si coprano a vicenda. Dove conviene togliere una capacità invece di raccomandare di non usarla. Come si fa in modo che un dato letto da un archivio arrivi alla persona esattamente come era scritto, e che un dato assente venga dichiarato assente invece di essere ricostruito.</p>
            <p>Il metro con cui giudico un sistema non è il giorno della dimostrazione, è il terzo mese: quando i modelli sono stati aggiornati, i documenti hanno cambiato forma e le persone lo usano in modi che nessuno aveva previsto. Quasi tutto quello che ho imparato viene da lì, e quasi niente da un manuale.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">
        <article class="blk" data-reveal>
          <p class="blk__ann ann">Il lavoro che accetto</p>
          <div class="blk__body">
            <h2>Aziende con un processo già in piedi</h2>
            <p>Lavoro con chi ha un processo reale, fatto a mano, magari male, e vuole affidarne una parte a un sistema di agenti che regga anche i mesi dopo la consegna. Il punto di partenza non è mai lo strumento: è il lavoro che oggi qualcuno fa a mano, con le sue eccezioni e i casi che non tornano. Se dalla prima conversazione viene fuori che il problema si risolve senza agenti, lo dico, perché scoprirlo a metà progetto costa molto di più.</p>
            <p>Non faccio dimostrazioni pensate per una riunione. Un sistema che funziona una volta sola, davanti alle persone giuste, non è un lavoro consegnato. Quello che consegno ha una verifica per ogni pezzo, un modo per accorgersi che ha smesso di fare il suo mestiere, e nessuna dipendenza da me per restare in funzione.</p>
            <p><a href="contatti.html">Scrivetemi</a> raccontando il processo che oggi si fa a mano: chi lo fa, quante volte, e cosa succede quando un'informazione manca.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'architettura.html',
  titolo: 'Architettura dei sistemi di agenti',
  riga: 'Perché un assistente unico non regge, come si divide il lavoro fra ruoli che non possono coprirsi, e cosa cambia quando i compiti dipendono l’uno dall’altro.',
})}
    </div>
  </section>
`,
};
