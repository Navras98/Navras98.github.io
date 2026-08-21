import { avanti, blocco } from '../layout.mjs';
import { diagrammaScelta } from '../diagrammi.mjs';

const modelli = [
  [
    'ChatGPT',
    'Il riferimento con cui quasi tutti confrontano il resto. Lo uso per testi rivolti a persone e per il ragionamento generale, e soprattutto come secondo parere quando la risposta di un altro modello mi convince troppo in fretta.',
  ],
  [
    'Claude',
    'Lavoro lungo su materiale strutturato: testi tecnici, codice, revisione di quello che ha scritto qualcun altro. Tiene il filo su compiti a più passaggi meglio di quanto si veda in uno scambio singolo, ed è dove la costanza conta più della brillantezza.',
  ],
  [
    'DeepSeek',
    'Il rapporto fra capacità e costo che regge il lavoro continuo. È quello che tengo acceso quando un compito si ripete molte volte al giorno e non ha bisogno del massimo: usare qui la fascia alta è una spesa che si paga ogni giorno senza guadagnare qualità.',
  ],
  [
    'Gemini',
    'Contesti molto lunghi e materiale misto, documenti, immagini e tabelle nella stessa richiesta. Lo chiamo quando il problema non è la difficoltà del ragionamento ma far entrare tutto insieme senza tagliare.',
  ],
  [
    'GLM, Qwen, MiniMax',
    'Coprono la fascia intermedia con vincoli di costo o di collocazione. Qwen in particolare per le taglie piccole: sono quelle che girano su una macchina normale dando un risultato onesto, ed è il punto in cui il locale smette di essere una dichiarazione di principio.',
  ],
  [
    'Llama e modelli aperti',
    'La scelta quando i dati non possono uscire. Il peso si sceglie a partire dalla macchina disponibile e dal tipo di compito, non dal nome: un modello piccolo che risponde in fretta su un compito stretto batte un modello grande che fa aspettare una coda.',
  ],
  [
    'Modelli di rappresentazione',
    'Non scrivono niente, servono a trovare. La qualità del richiamo dipende più da loro e da come è tagliato il materiale che dal modello che poi formula la risposta, ed è il pezzo che viene sistematicamente sottovalutato quando un sistema di conoscenza non funziona.',
  ],
  [
    'Adattamento al dominio',
    'Un modello di base parla la lingua di tutti, l\'azienda parla la sua. Adattarlo serve a insegnargli come si chiamano le cose lì dentro. Ma prima conviene sempre verificare se il problema si risolve con i dati che sono già a portata di mano: molto di ciò che sembra conoscenza mancante è materiale che esiste e non arriva al modello nel momento giusto.',
  ],
];

const ambienti = [
  [
    'Claude Code',
    'Lavoro su un progetto vero, con molti file che si toccano fra loro. È dove serve che l\'agente legga prima di scrivere, e dove una modifica va giudicata per gli effetti che ha altrove.',
  ],
  [
    'Codex',
    'Compiti circoscritti e seconda opinione. Farlo lavorare sullo stesso problema di un altro agente serve proprio a vedere dove i due divergono: è lì che di solito c\'è qualcosa che non era stato deciso.',
  ],
  [
    'OpenCode',
    'Ambiente aperto, comodo per portare modelli diversi dentro lo stesso flusso di lavoro senza cambiare abitudini né riscrivere gli strumenti attorno.',
  ],
  [
    'Ambienti su modelli economici',
    'Dove conta il costo per esecuzione: i lavori ripetuti, quelli che girano molte volte e devono restare economici anche quando il volume cresce.',
  ],
  [
    'Protocolli per collegare strumenti',
    'Il modo ormai standard per dare a un agente operazioni dichiarate invece di accesso libero. È la forma concreta di quello che descrivo nella pagina sui <a href="dati.html">dati</a>, e il motivo per cui quel principio non richiede di costruire tutto da zero.',
  ],
  [
    'Automazione dei flussi',
    'La parte deterministica dei processi: attese, passaggi fissi, invii, condizioni. Tutto ciò che ha una regola chiara sta qui e non chiede niente a un modello.',
  ],
  [
    'Canali di messaggistica',
    'Spesso sono l\'interfaccia giusta, perché sono già aperti sul telefono di chi deve rispondere. Con un avvertimento che ripeto sempre: l\'identità su una chat è instradamento, non autorizzazione.',
  ],
];

function elenco(voci) {
  return voci
    .map(
      ([k, v]) => `        <div class="giudizio">
          <p class="giudizio__chiave">${k}</p>
          <p class="giudizio__val">${v}</p>
        </div>`
    )
    .join('\n');
}

export default {
  file: 'stack.html',
  title: 'Modelli, agenti e strumenti',
  description:
    'Non un muro di loghi: per ogni famiglia di modelli e per ogni ambiente di sviluppo un giudizio pratico, e il criterio con cui un modello si sceglie e si sostituisce.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Stack</p>
        <div class="blk__body">
          <h1>Quello che uso, e dove</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Non un elenco di loghi. Per ogni famiglia c'è un giudizio pratico: dove la uso, cosa le riesce meglio, e cosa mi costringe a lasciarla fuori da un certo tipo di lavoro.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <p class="ann" data-reveal>Modelli</p>
      <div class="prosa" style="margin-top:var(--s4)" data-reveal>
        <p>Li tengo tutti in esercizio, e non per collezionismo: la differenza fra due modelli non si legge in una scheda tecnica, si vede su un compito ripetuto molte volte, e cambia di mese in mese. Quello che segue è il posto che ciascuno ha nel mio lavoro, oggi.</p>
      </div>
      <div class="giudizi" data-reveal>
${elenco(modelli)}
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <p class="ann" data-reveal>Agenti di sviluppo, ambienti, integrazioni</p>
      <div class="prosa" style="margin-top:var(--s4)" data-reveal>
        <p>Gli agenti che scrivono codice hanno cambiato il modo in cui costruisco, ma non il criterio con cui giudico il risultato: quello che producono vale quanto la verifica che gli sta accanto. Li uso in parallelo di proposito, perché sbagliano in modi diversi e il disaccordo fra due è un'informazione.</p>
      </div>
      <div class="giudizi" data-reveal>
${elenco(ambienti)}
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Come scelgo',
  titolo: 'Per compito e per costo, non per fedeltà',
  corpo: `
<p>Un lavoro che gira tutto il giorno su testi brevi non ha bisogno del modello più capace del momento. Ne ha bisogno il compito raro e difficile, quello dove un errore costa una giornata. Tenere la fascia alta su tutto è come mandare l'ingegnere a cambiare le lampadine: funziona, e si paga ogni giorno.</p>
<p>La regola operativa è semplice: economico e veloce per il lavoro continuo, fascia alta chiamata quando serve davvero, e un punto solo del sistema in cui quella scelta è scritta. Se la scelta è scritta in un posto solo, cambiarla è una riga. Se è sparsa dentro venti pezzi, cambiarla diventa un progetto, quindi non si fa, e il sistema resta legato a una decisione presa un anno prima per motivi che non valgono più.</p>
<p>Il modello si sceglie per compito, non per turno. Alternare motori a ogni messaggio ha un costo che non si vede subito: rompe la cache del fornitore e finisce per costare di più di quello che si voleva risparmiare. Uno strumento più potente entra per un lavoro, non per una battuta. E nel ripiego automatico stanno solo motori più economici, mai più cari: il ripiego serve alla resilienza, non alla qualità, e un ripiego che spende di più è una sorpresa in fattura.</p>`,
})}

      </div>

      ${diagrammaScelta()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Sicurezza',
  titolo: 'Per certi agenti la scelta del modello non è di prezzo',
  corpo: `
<p>Un agente che ha strumenti in mano, o che legge contenuto non fidato, non si sceglie con lo stesso criterio di un agente che riassume. Lì la domanda non è quanto scrive bene: è quanto è difficile convincerlo a fare una cosa che non doveva fare, e quanto tiene le istruzioni di sistema quando il testo che legge le contraddice.</p>
<p>È una decisione di sicurezza, e va presa con la stessa serietà con cui si sceglie chi ha le chiavi di un magazzino. Detto questo, resta il principio della pagina sulla <a href="sicurezza.html">sicurezza</a>: se la garanzia dipende da quale modello si è scelto, il progetto non è finito. Il modello robusto riduce la frequenza; il privilegio tolto elimina la possibilità.</p>`,
})}

${blocco({
  ann: 'Sostituzione',
  titolo: 'Si misura sul compito vero',
  corpo: `
<p>Quando un modello va sostituito, il confronto si fa sul lavoro reale. Una prova comoda, che al compito vero solo somiglia, dice quasi sempre la cosa sbagliata: mostra un miglioramento netto che sul lavoro vero diventa un peggioramento. Mi è successo, e la lezione è costata più del tempo che avevo risparmiato.</p>
<p>E si misura con lo stesso metro prima e dopo. Cambiare il modello e il criterio di valutazione nello stesso momento rende impossibile sapere cosa ha mosso il risultato: si resta con un numero diverso e nessuna spiegazione. Tenere sempre pronto un banco di prova sul compito vero è la condizione che rende possibile accorgersene: senza, un peggioramento resta in esercizio travestito da miglioramento, e nessuno lo cerca perché tutti sono convinti di aver fatto un passo avanti.</p>
<p>Un'altra verifica che quasi nessuno fa, e che conviene fare prima di promettere un costo: l'uso automatico di un abbonamento può uscire dal forfait e finire su tariffe piene. È una riga di contratto, non una questione tecnica, ed è meglio scoprirla prima.</p>`,
})}

      </div>

      <div class="blocchi" style="margin-top:var(--s16)">
        <article class="blk" data-reveal>
          <p class="blk__ann ann">Chiusura</p>
          <div class="blk__body">
            <p class="tesi">Nessun cliente resta legato a una scelta che ho fatto io.</p>
            <p>L'architettura tiene il modello sostituibile: le operazioni sui dati, i confini di sicurezza e i controlli sull'uscita non cambiano quando cambia il modello. Se fra un anno esce qualcosa di più capace o più economico, si sostituisce un pezzo e si rifà la misura, non si rifà il sistema.</p>
            <p>E sto dietro a ogni generazione nuova mentre esce, non a distanza di tempo. Non è entusiasmo: in questo settore un anno di ritardo è un'era, e chi valuta un modello sulla base di com'era sei mesi fa sta valutando un altro modello.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'metodo.html',
  titolo: 'Metodo e filosofia',
  riga: 'Le regole con cui prendo queste decisioni, e come si svolge un lavoro dal processo esistente alla consegna.',
})}
    </div>
  </section>
`,
};
