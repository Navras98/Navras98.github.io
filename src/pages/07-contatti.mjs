import { SITE, next } from '../layout.mjs';

export default {
  file: 'contatti.html',
  title: 'Contatti',
  description:
    'Scrivimi raccontando il lavoro che oggi in azienda si fa a mano: chi lo fa, quante volte, e cosa succede quando un’informazione manca.',
  body: `  <section class="head">
    <div class="shell head__inner">
      <p class="eyebrow">Contatti</p>
      <h1>Parliamone</h1>
      <p class="head__lede">Il modo più utile per cominciare è raccontarmi il lavoro che oggi in azienda si fa a mano: quello ripetitivo, quello che nessuno vuole fare, quello che dipende da una persona sola.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="contact-card" data-reveal>
        <div class="contact-row">
          <a class="contact-mail" href="mailto:${SITE.email}">${SITE.email}</a>
          <button class="copy" type="button" data-copy="${SITE.email}">Copia indirizzo</button>
        </div>
        <div class="contact-row">
          <a class="contact-ig" href="${SITE.instagram}" rel="me noopener" target="_blank">Instagram ${SITE.instagramHandle}</a>
        </div>
      </div>
      <p class="eyebrow eyebrow--col" style="margin-top:1.2rem" data-reveal>Nessun modulo da compilare: si scrive e basta.</p>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="prose" data-reveal>
        <h2>Cosa scrivere</h2>
        <p>Non serve un capitolato, e nemmeno un'idea di quale tecnologia usare: quella è la parte che tocca a me. La cosa più utile che possiate mettere in una mail è la descrizione di un processo che esiste già: chi lo fa, quante volte alla settimana, quali informazioni ha davanti mentre lo fa, e cosa fa quando un'informazione manca. Da quattro righe così si capisce più che da una pagina di requisiti, perché dicono se il processo è reale oppure se è ancora un'intenzione.</p>
        <p>Se avete già provato a risolverlo in qualche modo — un foglio di calcolo, una procedura scritta, un assistente commerciale che non ha retto — raccontatelo. Sapere dove un tentativo precedente si è fermato accorcia il lavoro più di qualsiasi altra informazione: quasi sempre indica il punto esatto in cui il processo ha un'eccezione che nessuno aveva messo per iscritto.</p>

        <h2>Cosa succede dopo</h2>
        <p>Rispondo con quello che ho capito e con le domande che restano aperte. Riguardano quasi sempre i dati: dove stanno, in che forma, chi li può vedere e se possono uscire dall'azienda. Sono domande noiose e vengono prima di tutto il resto, perché dalla risposta dipende l'architettura intera — dove girano i modelli, come si separano i ruoli, cosa può restare in memoria.</p>
        <p>Se dalle risposte viene fuori che il problema si risolve senza agenti, lo dico. Capita più spesso di quanto sembri: certi processi hanno bisogno di una regola scritta bene e di dati messi in ordine, non di un modello. È comunque un risultato utile, e costa molto meno di scoprirlo a metà di un progetto.</p>

        <h2>Il lavoro che accetto</h2>
        <p>Aziende con un processo già in piedi che vogliono affidarne una parte a un sistema di agenti, e che accettano l'idea che il sistema vada sorvegliato anche dopo. Lavori in cui c'è qualcosa da misurare: un tempo che si accorcia, un lavoro ripetitivo che non occupa più una persona, una risposta che oggi arriva il giorno dopo e potrebbe arrivare in un minuto.</p>
        <p>Va bene anche il lavoro piccolo e ben delimitato: un pezzo solo, costruito bene e consegnato con la sua verifica, è quasi sempre il modo migliore per capire se ha senso proseguire. Preferisco cominciare da lì che da un piano di dodici mesi scritto quando ancora non si conosce il materiale.</p>

        <h2>Il lavoro che non accetto</h2>
        <p>Sistemi pensati per far credere a una persona che sta parlando con un'altra persona. Installazioni «chiavi in mano» da lasciare senza nessuno che le guardi, perché so come vanno a finire e non voglio consegnare qualcosa che si degrada in silenzio. Progetti in cui la decisione su dove possono andare i dati viene rimandata a dopo: quella decisione è la prima, non l'ultima, e rimandarla significa rifare il lavoro.</p>
        <p>E non accetto lavori in cui il risultato atteso è una dimostrazione per una riunione. Un sistema che funziona una volta sola, davanti alle persone giuste, non è un lavoro consegnato.</p>

        <h2>Tempi e modo di lavorare</h2>
        <p>Non lavoro a molti progetti insieme, per un motivo pratico: la parte che richiede attenzione non è scrivere il sistema, è capire il processo di chi lo userà, e quella parte non si può fare distrattamente. Di solito questo significa che una richiesta trova spazio nel giro di poche settimane, e che vale la pena scrivere anche se il progetto non parte domani.</p>
        <p>I lavori si svolgono a pezzi, ognuno con un risultato che si può guardare e una verifica che lo accompagna. Quando un pezzo è in servizio si decide se il successivo serve davvero: capita che dopo il primo la risposta sia no, perché il problema che sembrava grosso era concentrato lì. Trovo che sia il modo più rispettoso di spendere un budget, e certamente il modo in cui vorrei che qualcuno spendesse il mio.</p>

        <h2>Riservatezza</h2>
        <p>Quello che mi raccontate resta tra noi, e vale anche per il primo scambio di mail. Non uso il materiale di un cliente per un altro. Se per lavorare serve un accesso ai vostri sistemi, si concede il minimo indispensabile per il tempo necessario e si revoca alla fine: è la stessa regola che applico agli agenti, e non vedo perché dovrebbe valere meno per me.</p>
        <p>Lavoro da remoto e in italiano. Se preferite una chiamata, scrivetemi due righe prima su cosa vi serve: arrivare alla telefonata sapendo già di cosa si parla fa risparmiare tempo a tutti e due.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      ${next({
        file: 'index.html',
        label: 'Torna all’inizio',
        line: 'Oppure ripartite dalle pagine dense: sicurezza degli agenti, dati deterministici, modelli e strumenti.',
      })}
    </div>
  </section>
`,
};
