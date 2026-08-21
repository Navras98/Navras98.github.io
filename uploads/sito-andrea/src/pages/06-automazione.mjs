import { avanti, blocco } from '../layout.mjs';
import { diagrammaColonne } from '../diagrammi.mjs';

export default {
  file: 'automazione.html',
  title: 'Automazione e contenuti',
  description:
    'Agenti agganciati ai processi e ai flussi di lavoro: cosa conviene automatizzare, dove il modello interviene davvero, e le regole che tengono in piedi un automatismo dopo il primo mese.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Automazione</p>
        <div class="blk__body">
          <h1>Mettere il lavoro su un binario</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Si automatizza ciò che è ripetitivo e verificabile. Dove serve giudizio resta una persona. La parte difficile non è costruire l'automatismo: è tenerlo in piedi quando il materiale del giorno non è quello previsto.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Il criterio',
  titolo: 'Tre colonne, non due',
  corpo: `
<p>Guardando un processo, il lavoro si divide in tre colonne. Quello che ha una regola chiara e sempre valida va scritto come regola: costa una frazione, non cambia idea, e chiunque può leggerla e discuterla. Quello dove il criterio esiste ma non è scrivibile in dieci righe va al modello: capire di cosa parla un documento scritto in un linguaggio non standard, riassumere per qualcuno che deve decidere, accorgersi che una richiesta non rientra in nessuna categoria prevista. E resta una terza colonna, che è giusto lasciare a una persona: le decisioni con conseguenze, quelle che qualcuno deve firmare.</p>
<p>Molto di quello che sembrava lavoro da agente finisce nella prima colonna, ed è una buona notizia. Una divisione fatta bene qui vale più di qualsiasi scelta di modello fatta dopo, e si vede sul conto a fine mese come si vede sulla stabilità.</p>
<p>Il modo di capire in quale colonna sta un passaggio è una domanda sola: cosa fa oggi la persona quando un'informazione manca. Quel "cosa fa quando manca" è quasi sempre la parte che nessuno ha mai messo per iscritto, ed è quella che decide se un agente è possibile.</p>`,
})}

      </div>

      ${diagrammaColonne()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Contenuti',
  titolo: 'Agenti che producono e pubblicano',
  corpo: `
<p>Fra le automazioni che ho costruito ci sono agenti che producono contenuti per i canali social e li pubblicano: raccolgono il materiale, lo selezionano, scrivono i testi, compongono le immagini e mandano in pubblicazione. È un buon banco di prova, perché ha tutte le caratteristiche di un processo aziendale vero, con la differenza che gli errori sono visibili a tutti.</p>
<p>Il principio che regge quel sistema è che l'automazione fa tutto tranne partire. Nessun orario fisso: l'avvio è un gesto umano. Non è pigrizia, è una lezione. Una cadenza promessa e non mantenuta è peggio dell'assenza di cadenza, e un sistema che pubblica da solo pubblica anche nei giorni in cui non c'era niente da dire. Le cose si fanno quando ha senso farle.</p>
<p>Le fasi sono separate e visibili, una per passaggio, invece di essere una scatola nera che o funziona o no. Quando qualcosa cade si vede dove, e si riprende da lì invece di rifare tutto. Il modello interviene in un punto solo, la scrittura dei testi: raccolta, selezione, immagini, impaginazione e controlli sono deterministici e non consumano niente. Questa separazione è anche ciò che rende il costo prevedibile.</p>`,
})}

${blocco({
  ann: 'Doppioni',
  titolo: 'Un registro che si scrive al momento giusto',
  corpo: `
<p>Un dettaglio piccolo che cambia il comportamento di tutto il sistema: il registro di quello che è già stato trattato si scrive al momento della proposta, non al momento dell'accettazione. Se si scrive solo quando qualcosa viene accettato, chi lancia, scarta e rilancia riceve di nuovo la stessa cosa, e resta convinto che il sistema sia rotto.</p>
<p>Il confronto poi non si fa sul testo prodotto, si fa sull'origine e sui titoli, perché la stessa notizia ripresa da un'altra fonte è comunque un doppione. E la fusione delle cose gemelle va fatta seguendo la catena dei collegamenti, non a coppie: due titoli sullo stesso fatto possono non avere nessuna parola in comune, e confrontandoli due a due non si incontrano mai.</p>
<p>La conseguenza si accetta consapevolmente: consumare in fretta il materiale disponibile impoverisce quello che resta, e scartare un giro non libera ciò che quel giro ha già consumato. È il motivo per cui la frequenza non è una manopola da alzare.</p>`,
})}

${blocco({
  ann: 'Robustezza',
  titolo: 'Quattro guasti che si scoprono solo in esercizio',
  corpo: `
<p><strong>Un indirizzo che avvia lavoro non deve rispondere a una richiesta di sola lettura.</strong> Mezzo internet visita i collegamenti per curiosità, a partire dalle anteprime che i programmi di messaggistica generano da soli. Un avvio agganciato a una semplice visita produce lavori fantasma che nessuno ha chiesto, e per un po' nessuno capisce da dove arrivino.</p>
<p><strong>Un parametro che arriva da fuori non entra mai dentro un comando di sistema.</strong> Interpolarlo è esecuzione di comandi da remoto, con tutte le lettere. Il filtro va messo due volte, nel passaggio che riceve e nello script che esegue, così la protezione sopravvive a chi domani rimetterà mano ai passaggi senza sapere perché erano fatti così.</p>
<p><strong>Un comando riuscito non è un lavoro riuscito.</strong> L'esito di un comando dice solo che è partito. Il vero esito sta in quello che ha scritto mentre lavorava, e un ramo che può fallire senza parlare è un guasto silenzioso anche quando il codice è corretto.</p>
<p><strong>Un'operazione irreversibile si segna come già fatta prima di poter essere ripetuta.</strong> Una pagina che si fa aspettare verrà ripremuta, quindi si risponde subito e l'esito arriva su un altro canale. E si pubblica prima e si archivia dopo, mai il contrario, perché l'archiviazione svuota la sorgente da cui il servizio esterno sta ancora scaricando.</p>`,
})}

${blocco({
  ann: 'Fragilità',
  titolo: 'I flussi a passaggi collegati',
  corpo: `
<p>Gli strumenti che costruiscono flussi collegando passaggi hanno una fragilità strutturale che vale la pena conoscere prima di sceglierli: inserire un passaggio in mezzo rompe i riferimenti di tutti quelli a valle, perché ciascuno legge dal vicino. La regola che ne discende è leggere sempre dal passaggio di origine chiamandolo per nome, anche dove oggi sarebbero attaccati direttamente. Costa qualche parola in più e toglie una classe intera di guasti che si presentano settimane dopo, mentre si aggiunge una funzione.</p>
<p>Sull'uscita del modello serve un guardiano, e non un'istruzione. La lingua di un testo non si garantisce chiedendola: si verifica sul testo prodotto. Un modello economico che scrive un testo lungo può infilare parole di un'altra lingua, e chiederglielo gentilmente non basta. Il controllo sta a valle, guarda quello che è stato scritto, e se non va rifà il pezzo.</p>
<p>Infine gli esiti, anche qui tre e non due: fatto e archiviato, fatto ma non archiviato, non fatto. Schiacciare il secondo sul terzo fa ripetere un'operazione già andata a buon fine, ed è il modo più comune in cui un automatismo produce un duplicato che poi qualcuno toglie a mano.</p>
<div class="limite">
  <p class="ann">Limite dichiarato</p>
  <p>Un automatismo si prova sul materiale che gli passa davanti oggi, e il materiale di domani è diverso. Un insieme di controlli tutti verdi non copre i casi che dipendono dal contenuto del giorno, quindi va dichiarato anche cosa non è stato provato. E una cosa che non si prova mai con parametri validi è la pubblicazione: un filtro che ripulisce l'input sporco lo rende legittimo, e la prova finisce davvero sul canale.</p>
</div>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'stack.html',
  titolo: 'Modelli, agenti e strumenti',
  riga: 'Quali modelli uso e dove, quali agenti di sviluppo, e con che criterio si sceglie e si sostituisce un modello.',
})}
    </div>
  </section>
`,
};
