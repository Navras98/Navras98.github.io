# Direzione visiva

Scritta prima del CSS. Ogni valore qui dentro esiste una volta sola nel foglio di stile,
come variabile: se un componente scrive un colore o una spaziatura a mano, è un errore.

## 0. Lettura del progetto

Sito personale di chi progetta architetture di agenti AI, rivolto a chi in azienda decide
su tecnologia, sicurezza e trattamento dei dati. Registro: **strumentazione**, non
fantascienza. Deve sembrare il quadro di controllo di uno studio di ingegneria, non un
portfolio creativo e non una piattaforma di formazione.

Manopole: variazione compositiva **7**, movimento **6**, densità **5**.

## 1. Riferimenti letti, e cosa ho preso da ognuno

I valori sotto vengono dal CSS di produzione dei siti citati, non da uno screenshot.

| Riferimento | Cosa ho preso |
|---|---|
| linear.app | scala di elevazioni a passo di 4-5 punti esadecimali; filetto a `.5px`; tratteggio fatto con un gradiente ripetuto invece che con `border-style: dashed` |
| cursor.com | la ricetta esatta dell'etichetta tecnica: mono, maiuscolo, `letter-spacing .06em`, peso 500, colore terziario; e il fondo scuro con una temperatura dichiarata invece del nero |
| vercel.com | il monospaziato come **scala tipografica propria**, con interlinea diversa fra etichetta e prosa; `tnum` sui numeri |
| darkroom.engineering | la grana fatta con `repeating-linear-gradient` e non con una PNG di rumore; il dimensionamento fluido per formula invece che a soglie |
| basement.studio | la tela 3D fuori dall'albero del contenuto, con un solo giro di animazione condiviso |
| stripe.com | il raggio zero come token di prima classe, non come assenza di token |

## 2. I cinque principi che applico

1. **L'etichetta monospaziata è un'annotazione, non un titolino.** 12px, peso 500,
   maiuscolo, `letter-spacing .06em`, colore terziario, mai il colore del testo primario,
   con `font-variant-numeric: tabular-nums`. Sta **nella colonna di sinistra** accanto al
   blocco che annota, come su un disegno tecnico, non centrata sopra il titolo.
2. **Niente nero pieno, niente bianco pieno.** Il fondo ha una temperatura dichiarata; le
   superfici salgono a passi di 4-6 punti esadecimali; i bordi vivono fra il 6% e il 14%;
   il filetto è `.5px` dove lo schermo lo regge. Il tema chiaro non è l'inverso del tema
   scuro: è una seconda palette con lo stesso rapporto di contrasto.
3. **La grana si disegna, non si scarica.** Righe da 1px ogni 3px con un gradiente
   ripetuto, opacità sotto il 4%, su uno strato fisso e non cliccabile. Zero byte di
   immagine, zero ridisegno durante lo scorrimento.
4. **La crenatura dei titoli è negativa e proporzionale alla dimensione**, l'interlinea dei
   display sta sotto 1, quella del testo lungo a 1.62. Il dimensionamento è una formula
   fluida, non una serie di soglie: nessun salto fra desktop e telefono.
5. **La tela 3D vive fuori dal flusso del contenuto**, con un solo giro di animazione;
   cursore e scorrimento non si assegnano ai parametri della scena, ci si interpolano
   dentro con un coefficiente fra 0.08 e 0.12, perché è l'interpolazione a dare la
   sensazione di massa.

## 3. Colore

Una sola tinta d'accento su tutto il sito. Un secondo colore esiste solo per i limiti
dichiarati e gli avvisi.

### Tema scuro (predefinito)

```
--fondo            #0B0E12   fondo profondo, leggermente freddo
--sup-1            #12161C   superficie a un gradino
--sup-2            #171C23   superficie a due gradini
--sup-3            #1D232B   superficie a tre gradini
--filo-1           #FFFFFF12   bordo tenue      (7%)
--filo-2           #FFFFFF24   bordo netto      (14%)
--testo-1          #EDF0F3   primario, mai bianco pieno
--testo-2          #AEB6C0   secondario
--testo-3          #7A838F   terziario, colore delle annotazioni
--accento          #F0503C   rosso segnale
--accento-tenue    #F0503C1F  fondo dell'accento
--avviso           #E8A22A   ambra, solo limiti e avvisi
```

### Tema chiaro

```
--fondo            #F2EFE9   carta calda, mai bianco pieno
--sup-1            #EDE9E1
--sup-2            #E7E2D9
--sup-3            #E0DACF
--filo-1           #1A1A1A1A   (10%)
--filo-2           #1A1A1A33   (20%)
--testo-1          #16181B
--testo-2          #4A4F57
--testo-3          #6E747D
--accento          #C7301C   stessa tinta, portata al contrasto della carta
--accento-tenue    #C7301C14
--avviso           #8A5A06
```

### Perché questa combinazione

Le due combinazioni che il settore usa oggi sono l'indaco-pervinca dei prodotti per
sviluppatori e l'arancio saturo intorno a `#ff4d00`, su cui almeno due studi noti sono
arrivati indipendentemente. Il nero con verde acido è il cliché più vecchio dei tre. Il
**rosso segnale** viene da un'altra tradizione: è il colore con cui si marcano le revisioni
su un disegno tecnico e i comandi di sicurezza su un impianto. Non decora, marca. È coerente
con un sito che parla di confini e di verifiche, ed è la tinta che nessuno dei riferimenti
letti sta usando.

**Conseguenza contro-intuitiva, dichiarata di proposito:** se il rosso è la marca, il rosso
non può essere anche l'errore. Gli avvisi e i limiti dichiarati sono in **ambra**. È una
convenzione ribaltata rispetto all'abitudine, quindi va scritta qui e rispettata ovunque,
altrimenti diventa un'incoerenza.

Il fondo scuro è freddo e il rosso è caldo: il contrasto di temperatura fa il lavoro che
altrove fanno i bagliori, senza usarne nessuno.

## 4. Tipografia

| Ruolo | Famiglia | Perché |
|---|---|---|
| Display | **Bricolage Grotesque** variabile (`opsz 12..96`, `wdth 75..100`, `wght 400..800`) | tre assi in un file solo: ad `opsz` alto le forme diventano irregolari e spigolose, ad `opsz` basso si normalizzano. Un carattere che cambia carattere con la dimensione, invece di essere solo ingrandito |
| Lettura | **Literata** variabile (`opsz 7..72`, `wght 300..600`) | disegnata per la lettura su schermo. Ha un asse ottico vero, quindi a 18px resta un carattere da leggere e non un carattere da interfaccia. Regge il fondo scuro senza assottigliarsi |
| Tecnico | **monospaziato di sistema** | `ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, monospace`. È la stessa impostazione che usa il sito ufficiale di OpenClaw, letta dal suo foglio di stile: pesi 500-700, dimensione 0.75rem sulle etichette, maiuscolo. Zero byte di rete, zero salto di impaginazione, e su ogni sistema è il carattere che quel sistema usa per il codice |

Il monospaziato ha una **scala propria**, con interlinea diversa da quella del display alla
stessa dimensione: è una famiglia con un ruolo, non una variante.

Scala fluida per formula, ancorata a 1440px di larghezza di progetto, con un minimo e un
massimo. Crenatura: `-0.045em` sopra i 44px, `-0.03em` fra 24 e 44px, `0` sotto i 18px.
Interlinea: `0.94` sui display, `1.62` sul testo lungo, `1.35` sulle annotazioni.

Colonna di lettura: **68 caratteri**. Le pagine dense hanno una colonna stretta con
l'annotazione tecnica a sinistra, non testo a tutta larghezza.

## 5. Griglia, forma, spazio

- Contenitore massimo **1360px**, con margini che crescono per formula.
- Impianto a due colonne sulle pagine interne: annotazione (fissa, `position: sticky`) e
  corpo. Sotto i 62rem le due colonne diventano una sola e l'annotazione va sopra il titolo.
- **Raggio zero ovunque.** Non è l'assenza di una scelta, è la scelta: `--raggio: 0`
  esiste come token e vale per riquadri, tasti, campi e immagini.
- Bordi da 1px (`.5px` dove lo schermo lo regge), mai ombre proiettate. La profondità la
  fanno le superfici, non il buio sotto gli oggetti.
- Scala di spaziatura a un solo passo di base (`0.25rem`), usata a multipli: 2, 3, 4, 6, 8,
  12, 16, 24, 32.

## 6. Movimento

- Ingressi allo scorrimento: opacità e traslazione di 18px, durata 0.7s, curva
  `cubic-bezier(.16,1,.3,1)`. Sfalsamento massimo 80ms, e solo dentro un gruppo.
- Transizione fra pagine: dissolvenza in uscita di 180ms. Se la navigazione non parte entro
  2.4s la pagina torna visibile invece di restare vuota.
- Barra di avanzamento della lettura in cima, alta 2px, in accento.
- Tela 3D: rotazione lenta continua, deriva col cursore e con lo scorrimento, interpolate.
- `prefers-reduced-motion`: nessun ingresso, nessuna transizione, **la scena 3D non parte
  affatto** e resta il disegno statico. Ogni contenuto è visibile senza eccezioni.

## 7. Cosa è vietato su questo sito

Deriva dalla lettura del mercato: la posizione da occupare è quella dell'ingegneria e della
verifica, e certe forme appartengono al registro della formazione o al gergo dei prodotti.

- Nessuna percentuale, nessun moltiplicatore, nessun numero senza metodo. Se un numero non
  può portare con sé fonte, data e campione, non esiste.
- Nessuna prova sociale da divulgazione: niente conteggi di pubblico, niente stelline,
  niente testimonianze entusiaste, niente loghi di clienti.
- Nessun registro dell'urgenza: niente "non restare indietro", niente conto alla rovescia.
- Nessun titolo di studio, certificazione, premio o cliente inventato.
- Nessuna emoji, nessun superlativo, nessuna promessa assoluta. La formula corretta è
  "imposto dal database e dal sistema operativo", mai "inviolabile".
- Nessun trattino lungo nel testo visibile. Due frasi con il punto, oppure una virgola.
- Niente scritte di scorrimento, niente numeri di sezione decorativi, niente pallini di
  stato, niente strisce di città e orario, niente finte schermate di prodotto.
- Ogni pagina tecnica dichiara almeno un limite. Dire cosa un sistema non garantisce è la
  ragione per cui si può credere al resto.
