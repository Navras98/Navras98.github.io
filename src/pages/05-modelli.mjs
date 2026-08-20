import { next } from '../layout.mjs';

export default {
  file: 'modelli.html',
  title: 'Modelli e strumenti',
  description:
    'Quali modelli uso e dove, quali agenti di sviluppo, e con che criterio si sceglie e si sostituisce un modello: per compito e per costo, misurando sul lavoro vero.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Strumenti</p>
      <h1>Modelli e strumenti</h1>
      <p class="head__lede">Non un elenco di loghi. Per ogni famiglia c'è un giudizio pratico: dove la uso, cosa le riesce meglio, e cosa mi costringe a lasciarla fuori da un certo tipo di lavoro.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Modelli</h2>
        <p>Li tengo tutti in esercizio, e non per collezionismo: la differenza tra due modelli non si legge in una scheda tecnica, si vede su un compito ripetuto molte volte. Quello che segue è il posto che ciascuno ha nel mio lavoro, oggi.</p>
      </div>
      <ul class="list" style="margin-top:2rem" data-reveal>
        <li><span class="list__key">ChatGPT</span><span class="list__val">Il riferimento con cui quasi tutti confrontano il resto. Lo uso per testi rivolti a persone e per il ragionamento generale, e soprattutto come secondo parere quando una risposta di un altro modello mi convince troppo in fretta.</span></li>
        <li><span class="list__key">Claude</span><span class="list__val">Lavoro lungo su materiale strutturato: testi tecnici, codice, revisione di quello che ha scritto qualcun altro. Tiene il filo su compiti a più passaggi meglio di quanto si veda in uno scambio singolo, ed è dove la costanza conta più della brillantezza.</span></li>
        <li><span class="list__key">DeepSeek</span><span class="list__val">Il rapporto tra capacità e costo che regge il lavoro continuo. È il modello che tengo acceso quando un compito si ripete molte volte al giorno e non ha bisogno del massimo: usare qui la fascia alta è una spesa che si paga ogni giorno senza guadagnare qualità.</span></li>
        <li><span class="list__key">Gemini</span><span class="list__val">Contesti molto lunghi e materiale misto — documenti, immagini, tabelle nella stessa richiesta. Lo chiamo quando il problema non è la difficoltà del ragionamento ma far entrare tutto insieme senza tagliare.</span></li>
        <li><span class="list__key">GLM, Qwen, MiniMax</span><span class="list__val">Famiglie che coprono la fascia intermedia con vincoli di costo o di collocazione. Qwen in particolare per le taglie piccole: sono quelle che girano su una macchina normale dando un risultato onesto, ed è il punto in cui il locale smette di essere una dichiarazione di principio.</span></li>
        <li><span class="list__key">Llama e modelli aperti</span><span class="list__val">La scelta quando i dati non possono uscire. Il peso si sceglie a partire dalla macchina disponibile e dal tipo di compito, non dal nome: un modello piccolo che risponde in fretta su un compito stretto batte un modello grande che fa aspettare.</span></li>
        <li><span class="list__key">Modelli di embedding</span><span class="list__val">Non scrivono niente: servono a trovare. La qualità del richiamo dipende più da loro e da come è tagliato il materiale che dal modello che poi formula la risposta, ed è il pezzo che viene sistematicamente sottovalutato quando un sistema di conoscenza non funziona.</span></li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Agenti di sviluppo e ambienti</h2>
        <p>Gli agenti che scrivono codice hanno cambiato il modo in cui costruisco, ma non il criterio con cui giudico il risultato: quello che producono vale quanto la verifica che gli sta accanto. Li uso in parallelo di proposito, perché sbagliano in modi diversi e il disaccordo tra due è un'informazione.</p>
      </div>
      <ul class="list" style="margin-top:2rem" data-reveal>
        <li><span class="list__key">Claude Code</span><span class="list__val">Lavoro su un progetto vero, con molti file che si toccano fra loro. È dove serve che l'agente legga prima di scrivere, e dove una modifica va giudicata per gli effetti che ha altrove.</span></li>
        <li><span class="list__key">Codex</span><span class="list__val">Compiti circoscritti e seconda opinione. Farlo lavorare sullo stesso problema di un altro agente serve proprio a vedere dove i due divergono: è lì che di solito c'è qualcosa di non deciso.</span></li>
        <li><span class="list__key">OpenCode</span><span class="list__val">Ambiente aperto, comodo per portare modelli diversi dentro lo stesso flusso di lavoro senza cambiare abitudini né riscrivere gli strumenti attorno.</span></li>
        <li><span class="list__key">Harness DeepSeek</span><span class="list__val">Dove conta il costo per esecuzione: i lavori ripetuti, quelli che girano tante volte e devono restare economici anche quando il volume cresce.</span></li>
        <li><span class="list__key">Protocolli per collegare agenti e strumenti</span><span class="list__val">Il modo ormai standard per dare a un agente operazioni definite invece di accesso libero: è la forma concreta di quello che descrivo nella pagina sui <a href="dati.html">dati</a>, e il motivo per cui quel principio non richiede di costruire tutto da zero.</span></li>
        <li><span class="list__key">Automazione dei processi</span><span class="list__val">La parte deterministica dei flussi: attese, passaggi fissi, invii, condizioni. Tutto ciò che ha una regola chiara sta qui e non chiede niente a un modello.</span></li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Come scelgo</h2>
        <p>Il modello si sceglie per compito e per costo, non per fedeltà. Un lavoro che gira tutto il giorno su testi brevi non ha bisogno del modello più capace del momento; ne ha bisogno il compito raro e difficile, quello dove un errore costa una giornata di qualcuno. Tenere la fascia alta su tutto è come mandare l'ingegnere a cambiare le lampadine: funziona, e si paga ogni giorno.</p>
        <p>La regola operativa che uso è semplice: economico e veloce per il lavoro continuo, fascia alta chiamata quando serve davvero, e un punto solo del sistema in cui quella scelta è scritta. Se la scelta è scritta in un posto solo, cambiarla è una riga; se è sparsa dentro venti pezzi, cambiarla diventa un progetto e quindi non si fa, e il sistema resta legato a una decisione presa un anno prima per motivi che non valgono più.</p>
        <p>Quando un modello va sostituito, si misura sul compito vero. Un confronto fatto su una prova comoda — costruita per essere facile da eseguire, e che al compito reale solo somiglia — dice quasi sempre la cosa sbagliata: mostra un miglioramento netto che sul lavoro vero diventa un peggioramento. Una prova surrogata serve a scartare i candidati chiaramente inadatti, mai a decidere chi vince.</p>
        <p>E si misura con lo stesso metro prima e dopo. Cambiare il modello e il criterio di valutazione nello stesso momento rende impossibile sapere che cosa ha mosso il risultato: si resta con un numero diverso e nessuna spiegazione. È un errore che si fa per fretta, e costa più tempo di quanto ne faccia risparmiare.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="note" data-reveal>
        <p>Nessun cliente resta legato a una scelta che ho fatto io. L'architettura tiene il modello sostituibile: le operazioni sui dati, i confini di sicurezza e i controlli sull'uscita non cambiano quando cambia il modello. Se fra un anno esce qualcosa di più capace o più economico, si sostituisce un pezzo e si rifà la misura — non si rifà il sistema.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'metodo.html',
        label: 'Come lavoro',
        line: 'Sei regole che vengono da lavori veri, e come si svolge un progetto dal processo esistente alla consegna.',
      })}
    </div>
  </section>
`,
};
