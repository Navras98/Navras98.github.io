import { avanti, blocco } from '../layout.mjs';
import { diagrammaRuoli } from '../diagrammi.mjs';

export default {
  file: 'architettura.html',
  title: 'Architettura dei sistemi di agenti',
  description:
    'Perché un assistente unico non regge, come si separano chi coordina, chi esegue e chi verifica, e perché la parte difficile non è farli parlare ma impedire che si diano ragione a vicenda.',
  body: `  <section class="sez">
    <div class="guscio">
      <div class="blk" data-reveal>
        <p class="blk__ann ann">Architettura</p>
        <div class="blk__body">
          <h1>Più agenti, ruoli separati</h1>
          <p class="apertura__riga" style="margin-top:var(--s6)">Un sistema di agenti non è un assistente più bravo. È un'organizzazione in miniatura, e come ogni organizzazione vive o muore su come sono divise le responsabilità.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
      <div class="blocchi">

${blocco({
  ann: 'Il limite del singolo',
  titolo: 'Perché un assistente unico non regge',
  corpo: `
<p>Un solo assistente a cui si chiede tutto funziona finché il compito sta in una risposta. Appena il lavoro ha più passaggi succedono tre cose, con una regolarità che non dipende da quanto è bravo il modello. Perde il filo di quello che aveva già fatto. Ripete un passaggio che aveva chiuso. E, la peggiore, dichiara concluso qualcosa che non ha fatto.</p>
<p>La terza merita una spiegazione, perché non è disonestà ed è prevedibile. Per un modello, il testo che descrive un lavoro compiuto è enormemente più facile da produrre del lavoro. Se obiettivo, esecuzione e giudizio stanno nella stessa testa, il racconto del risultato compete con il risultato, e vince quasi sempre: è più corto, più coerente e più gratificante da scrivere. Non serve nessun difetto del modello perché accada.</p>
<p>C'è poi una degenerazione più silenziosa. Un agente che porta con sé tutta la storia di quello che ha fatto comincia a rispondere alla propria storia invece che al compito: il contesto che si è costruito diventa il suo mondo, e il mondo esterno passa in secondo piano. È il motivo per cui gli agenti che deleghi a un altro agente non ereditano il contesto del chiamante, ma solo il mandato. Il contesto ereditato sembra un regalo e produce confusione di ruolo e sconfinamenti che nessuno ha chiesto.</p>`,
})}

${blocco({
  ann: 'La divisione',
  titolo: 'Non per argomento, per responsabilità',
  corpo: `
<p>La divisione che funziona non è per materia. Fare un agente delle fatture e un agente dei contratti sposta il problema senza risolverlo, perché ognuno dei due resta un piccolo assistente che fa tutto nel suo settore. La divisione utile è per responsabilità, e si legge nei permessi prima che nelle istruzioni.</p>
<p>Chi coordina legge e delega, e non scrive. Il suo mestiere è scegliere chi fa cosa e pretendere la prova della consegna, non mettere le mani nel lavoro. Chi esegue ha gli strumenti per agire e un mandato stretto. Chi verifica riceve il risultato e il criterio, e la sua unica uscita possibile è un giudizio: non ha né la scrittura né gli strumenti, quindi non ha modo di aggiustare ciò che sta giudicando. È esattamente questo che lo rende utile.</p>
<p>La differenza fra scrivere questa divisione in un documento e imporla nella configurazione è tutta la differenza che conta. La prima si può ignorare, e prima o poi qualcuno la ignora, di solito con una buona ragione. La seconda no. Un verificatore che non possiede lo strumento di scrittura non corregge il lavoro nemmeno se è convinto che sia la cosa giusta da fare.</p>`,
})}

      </div>

      ${diagrammaRuoli()}

      <div class="blocchi" style="margin-top:var(--s16)">

${blocco({
  ann: 'Il consenso',
  titolo: 'Impedire che si diano ragione a vicenda',
  corpo: `
<p>La parte difficile non è farli parlare. Farli parlare è la parte gratis. La parte difficile è impedire che si diano ragione a vicenda, perché il consenso fra due modelli non costa niente ed è indistinguibile dalla correttezza finché qualcuno non va a guardare.</p>
<p>Il meccanismo è meno misterioso di quanto sembri. Un verificatore che riceve la conclusione insieme alla domanda tende a confermarla, perché il testo dell'altro funziona da suggerimento: è la risposta più probabile che ha davanti. Le contromisure sono di progetto, non di istruzioni. Dare il criterio prima del risultato. Chiedere la prova contraria invece del consenso, cioè assegnare il compito di smontare e non quello di approvare. Usare più giudici con punti di vista diversi quando la cosa da valutare può fallire in modi diversi, e prendere per buona solo una maggioranza.</p>
<p>Sopra tutto questo sta il contratto di consegna, che vale per ogni agente e anche per me. Niente si dichiara fatto senza l'output grezzo prodotto in quel turno: non il riassunto di quello che è stato fatto, la cosa. Per un'interfaccia, un conteggio di byte non è una prova che la pagina si veda. Un verificatore che dice sempre sì costa esattamente quanto uno che serve, e non protegge da niente.</p>`,
})}

${blocco({
  ann: 'Le dipendenze',
  titolo: 'Cosa va in fila e cosa va in parallelo',
  corpo: `
<p>Finché i compiti sono indipendenti, il tempo totale è quello del più lento e conviene lanciarli insieme. Il momento interessante è quando smettono di esserlo. Se il secondo ha bisogno di quello che produce il primo, metterli in parallelo non li rende veloci: li rende sbagliati, perché il secondo lavora su un dato che ancora non esiste e produce comunque una risposta, con la stessa sicurezza di sempre.</p>
<p>Riconoscere quali passaggi sono davvero in catena, e accettare che la catena imponga il ritmo, è metà del progetto. L'altra metà è non mettere in fila cose che potevano andare insieme, perché lì si paga attesa senza guadagnare niente. Fra i due errori il primo è molto più costoso, e molto più difficile da vedere: produce risultati plausibili invece di produrre un guasto.</p>
<p>C'è anche una conseguenza sul modo di consegnare. Un lavoro diviso in pezzi indipendenti si può fermare a metà e riprendere; un lavoro tutto in catena, no. Quando ho la scelta preferisco pagare qualche minuto in più e avere pezzi che si reggono da soli, perché è la differenza fra un intoppo e un ricominciamento.</p>`,
})}

${blocco({
  ann: 'Il silenzio',
  titolo: 'Un processo fermo e uno morto si assomigliano',
  corpo: `
<p>Questo è il problema che si scopre solo mandando in esercizio un sistema, e che non compare mai in una dimostrazione. Visti da fuori, un processo che sta macinando e un processo morto sono la stessa identica cosa: niente. Nel dubbio si aspetta, e aspettare sembra gratis, quindi si aspetta troppo.</p>
<p>La difesa è di forma, non di fortuna. Ogni giro lungo scrive dove è arrivato a ogni passo, così il silenzio diventa un'informazione invece che un'assenza di informazioni. E il verdetto "interrotto" si calcola da fuori, da qualcosa che sta ancora in piedi, perché un processo ucciso non fa in tempo a confessare di essere morto. Un limite di tempo che scade non è un'approvazione: è un terzo esito, e va trattato come tale.</p>
<p>Vale anche al contrario, sui giri a vuoto. Un agente che ritenta senza cambiare approccio brucia soldi e tempo con una regolarità impressionante. Il tetto di tentativi va dichiarato prima, e superato quello si ferma e segnala. Salire a uno strumento più potente o più caro è una decisione di chi paga, non un'iniziativa di chi esegue.</p>`,
})}

${blocco({
  ann: 'Esercizio',
  titolo: 'La demo e il terzo mese',
  corpo: `
<p>Il giorno della dimostrazione è il giorno più facile che quel sistema vivrà. Tutto è fresco, i dati sono quelli su cui è stato costruito, e chi mostra sa dove non premere. È una condizione che non si ripeterà più.</p>
<p>Quello che conta è il terzo mese. I modelli sono stati aggiornati e a parità di istruzioni si comportano diversamente. I servizi esterni hanno cambiato il formato di una risposta. I documenti aziendali hanno cambiato forma perché qualcuno ha rifatto un modulo. E le persone lo usano in modi che nessuno aveva previsto il primo mese, che è la cosa più sana che possa succedere e insieme quella che rompe di più.</p>
<p>Per questo un sistema di agenti non è un'installazione, è qualcosa che si sorveglia. E la sorveglianza non guarda se il servizio è acceso: guarda se sta ancora facendo il suo mestiere. Controlli che possono fallire davvero, e un allarme che parte quando un esito atteso smette di arrivare.</p>
<div class="limite">
  <p class="ann">Limite dichiarato</p>
  <p>La separazione dei ruoli riduce gli errori che nascono dal conflitto di interessi dentro un singolo agente. Non li elimina, e soprattutto non protegge da un criterio di verifica sbagliato: se il metro è sbagliato, tre giudici indipendenti sbagliano insieme e con più autorevolezza di uno. La qualità del criterio resta un lavoro umano, e non c'è architettura che la sostituisca.</p>
</div>`,
})}

      </div>
    </div>
  </section>

  <section class="sez">
    <div class="guscio">
${avanti({
  file: 'sicurezza.html',
  titolo: 'Sicurezza e isolamento',
  riga: 'I ruoli separati dicono chi fa cosa. Il passo successivo è imporli con qualcosa che un modello non possa discutere.',
})}
    </div>
  </section>
`,
};
