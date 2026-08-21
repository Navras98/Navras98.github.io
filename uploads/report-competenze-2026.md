# Andrea Sforna — Report approfondito di competenze e architettura

> Report ricavato dal sistema reale in data 21 agosto 2026. Tutti i dati sono verificati
> sulla configurazione installata (OpenClaw 2026.7.1-2), sulla struttura dei progetti,
> sui workflow n8n e sugli esempi reali di sessione. Nessun dato sensibile o privato è
> incluso: niente chiavi, token, indirizzi personali, credenziali o contenuti riservati.

---

## 1. Chi sono e cosa faccio

Progetto e costruisco **architetture di agenti AI per uso aziendale**: sistemi che
automatizzano lavoro reale, non demo. La differenza rispetto a chi "usa ChatGPT" è che ogni
componente del mio stack è **installato, configurato, verificato e misurato** — spesso
smontato e rimontato finché non regge.

Non sono uno che scrive "ho esperienza con l'AI": ho un'infrastruttura completa che gira sul
mio hardware, con agenti specializzati che lavorano in squadra, un sistema di memoria che
persiste tra le sessioni, automazioni programmate, e un controllo rigido sulla veridicità
delle risposte.

**Le tre cose che mi caratterizzano:**

1. **Verifico, non presumo.** Prima di rispondere leggo la documentazione, controllo la
   configurazione reale, guardo il codice. Una risposta inventata per me è un fallimento.
2. **Costruisco sistemi, non script usa-e-getta.** Ogni componente ha un ruolo, uno stato,
   una ragione di esistere e un modo per essere controllato.
3. **Privilegio il deterministico.** Dove serve una risposta certa, non lascio l'AI a
   decidere da sola: la blindo dietro controlli, schemi e logica verificata.

---

## 2. Il cuore: OpenClaw

**OpenClaw 2026.7.1-2** è il mio orchestratore centrale. È il cervello operativo: riceve i
messaggi, decide quale agente usa, richiama i tool, gestisce memoria e automazioni.

### Gli agenti che ho costruito (10 ruoli)

Ho definito una **squadra di agenti specializzati** nella configurazione. Ognuno ha un
profilo di permessi calibrato — non tutti possono fare tutto:

| Agente | Ruolo | Caratteristica chiave |
|---|---|---|
| **main** | L'assistente principale, quello con cui parlo ogni giorno | Profilo completo, risponde su Telegram/WhatsApp |
| **Coding** | Scrittura e modifica del codice | Tool di coding + browser + gateway |
| **OpenClaw Heart** | Il cuore del sistema | Profilo completo |
| **Extreme Privacy** | Sicurezza e privacy | Anche web search e browser |
| **Graphene OS Agent** | Gestione telefono GrapheneOS | Controllo remoto del Pixel 7a |
| **Worker — Esecutore Tecnico** | Esegue compiti tecnici | Nessuna delega ad altri agenti |
| **Designer — UI/UX** | Design e grafica | Nessuna delega |
| **Reviewer — QA e Test** | Verifica e revisione | **Non può scrivere**: solo controllare |
| **Coordinatore** | Coordina la squadra | Rileva i loop: avvisa a 8 giri, critico a 16 |
| **Broker — Analisi Finanziaria** | Dati e analisi finanziarie | Profilo completo |

Il principio è chiaro: **la revisione e la scrittura sono separate**. Il Reviewer non può
toccare i file — può solo giudicarli. È una barriera reale contro l'errore, non un
gentleman's agreement.

### Il team CrewAI (squadra/)

Oltre agli agenti nativi di OpenClaw ho una **squadra multi-agente con CrewAI**: quattro
ruoli in fila `coordinatore → design → worker → revisore`, motore mimo-v2.5 su
opencode-go. Testata dal vivo: 4 compiti, 4 chiamate, 18.205 token in ~2 minuti. Il punto
notevole: **il revisore ha bocciato il lavoro del worker con tre difetti concreti** — cioè
l'architettura di controllo funziona davvero, non firma per cortesia.

### I modelli (45+ provider configurati)

Ho configurato un'infrastruttura multi-modello con **oltre 45 provider/plugin**:
DeepSeek, Anthropic (Claude), OpenAI, xAI (Grok), Google, Mistral, Cohere, Groq, NVIDIA,
Together, MiniMax, Alibaba (Qwen), Meta, Microsoft, OpenRouter, più stack locali
(Ollama, LM Studio, vLLM, SGLang) e servizi di generazione (Runway, Comfy, ElephantLabs,
Deepgram, Azure/Voice).

Non sono "providers installati per sfoggio": ognuno serve a un caso d'uso. Per esempio:

- **DeepSeek V4 Flash** è il modello di default — il miglior rapporto costo/prestazioni.
- I modelli **locali** (Ollama, LM Studio) girano senza lasciare la macchina: embedding,
  privacy, quando non serve la nuvola.
- Il routing con **fallback automatici**: se il modello primario cade, un secondo lo
  sostituisce senza interruzioni.

Questa varietà mi permette di **scegliere il modello giusto per il compito**, una delle
competenze più sottovalutate e più richieste.

### I server MCP (Model Context Protocol)

Ho **10 server MCP configurati** che danno agli agenti accesso calibrato a dati e
strumenti: n8n, notes-reminders, shortcuts, sqlite, tracking, trenitalia, meta-dev,
paperclip-board, proto-data, dati-azienda. Il principio (verificato nella mia doc
aziendale): **per l'accesso ai dati, un server MCP con operazioni parametrizzate batte un
plugin tool proprio**, perché l'isolamento di processo è la garanzia più forte.

---

## 3. Gli altri agenti e tool che uso

Non vivo di solo OpenClaw. Integro (o ho integrato) i principali agenti di coding del
mercato, ognuno con il suo punto di forza:

- **Claude Code** (via CLI) — coding, audit di progetto, roadmap. L'ho usato per progetti
  complessi come una "Control Room desktop".
- **Codex** (OpenAI, modello gpt-5.6-sol) — coding.
- **Gemini CLI** — generazione, sintesi, agenti.
- **PyAgenr / agenti Python (CrewAI)** — la squadra multi-agente sopra.
- **OpenCode / opencode-go** — la piattaforma del modello di default.
- **DeepSeek** — sia come modello (API) sia come backbone del flusso principale.

L'elenco preciso di quello installato lo vedi sopra; il punto è la **capacità di far
collaborare strumenti diversi** anziché essere prigioniero di un solo vendor.

---

## 4. Automazione e workflow: n8n

Ho una piena installazione di **n8n** (2.30.7, editor locale) con **10 workflow
dimostrativi di casi aziendali reali**, tutti verificati:

| # | Workflow | Stato | Cosa fa |
|---|---|---|---|
| 01 | **Lead capture, scoring e routing** | ATTIVO | Valida un lead, calcola un punteggio 0-100 su 5 dimensioni pesate, assegna un tier e instrada con SLA differenziati |
| 02 | **Monitoraggio cambio EUR + alert** | su richiesta | Legge i tassi BCE, confronta, alerta solo se varia >0,5% |
| 03 | **Fatture fornitori: validazione e anomalie** | ATTIVO | Checksum partita IVA, coerenza imponibile+IVA, rileva duplicati, confronta con la mediana storica |
| 04 | **Triage ticket support** | — | Classifica e instrada i ticket |
| 05 | **Analisi PDF con AI** | — | PDF → report |
| 06 | **Bozze email con AI** | — | Genera bozze email |
| 07 | **Smistatore documenti** (con AI) | — | Smista i documenti |
| 08 | **Smistatore documenti** (senza AI) | — | La versione deterministica |
| 10 | **Archivio documenti** | — | Archivia |

Il dettaglio che dimostra la competenza: **le stesse automazioni esistono in versione "con
AI" e "senza AI" (deterministica)**. So quando conviene l'una e quando l'altra — questa è
l'esperienza che un cliente paga.

Esempio concreto (workflow lead): un lead enterprise arriva con dati completi → punteggio
100, tier "hot", "chiamata entro 2 ore". Un lead studente con email gmail → punteggio 25,
tier "cold", nurturing automatico. E l'output spiega **il perché** di ogni punteggio.

### PaperClip

Ho integrato anche **PaperClip** (board multi-agente) come infrastruttura di coordinamento
tra agenti, con chiave API dedicata e agenti che ci lavorano sopra.

---

## 5. Memoria persistente: come "ricordo"

Ho costruito un sistema di memoria che sopravvive al riavvio — il mio modo di non
ripartire da zero a ogni sessione:

- **Diario giornaliero** (`memory/YYYY-MM-DD.md`): log grezzo di ciò che accade ogni giorno.
- **Memoria lunga** (`MEMORY.md`): i paletti stabili e le preferenze, distillati.
- **Wiki compilata** (`~/.openclaw/wiki`): entità, concetti, sintesi con prove e origine.
- **Ricerca semantica** su tutto, con embedding locale (Ollama, nomic-embed-text) che non
  lasciano la macchina.
- **Sistema "Dreaming"**: di notte un processo sintetizza i ricordi a breve termine in
  regole durature, con cicli light → REM → deep.
- **Decadimento temporale**: le note datate invecchiano, quelle tematiche restano.
  Un'appunto di luglio non compete a peso pieno con una regola di oggi.

Il banco di collaudo (`banco_memoria.py`) fa 24 domande vere e misura quante centrano:
**ultimo esito 24 su 24**. Non dico "la memoria funziona" — lo misuro.

---

## 6. Competenze per dominio

### Sicurezza e privacy
- **Extreme Privacy** come agente dedicato; regola fissa: niente esfiltrazione di dati.
- Eliminazione automatica dei media inbound (privacy), cron-sweep ogni 120s.
- Gestione GrapheneOS (telefono de-Googlizzato, controllato da remoto via ADB+Tailscale).

### Creazione contenuti
- **Caroselli e storie Instagram** (5 schermate / 3 schermate 9:16) via n8n.
- **Newsletter AI** con anteprime e conferma prima della pubblicazione.
- **Report PDF automatici** dai documenti sul Desktop.

### Domotica e dispositivi
- Controllo TV (Samsung salone e camera, Hisense), robot Dreame L10s, luci Philips Hue,
  comandi vocali (ElevenLabs Lily), webcam Mac. Ogni dispositivo ha il suo controllo
  verificato e catalogo comandi testato.

### Portafoglio e finanza
- Bot Telegram dedicato con prezzi, report e alert su soglia.

### Sviluppo siti web
- Costruzione di questo stesso sito: 9 pagine generate da sorgenti, con collaudo dal vivo
  su browser a 5 larghezze × 2 temi, contrasto AA misurato su ogni nodo, navigazione
  da tastiera verificata, scena 3D con ripieghi.

---

## 7. Esempi concreti di come lavoro (dalle sessioni reali)

### Esempio A — Ripristino dopo un "non mi piace"
Utente: *"Non mi piace, rimettilo come era prima."*

Risposta (sintetizzata): *"Fatto. Ho annullato il commit delle tre varianti con un revert:
l'albero è ora identico byte per byte allo stato precedente (nessuna differenza).
Pubblicato online e verificato dal vivo: `/a/`, `/b/`, `/c/` rispondono 404, la home e le
nove pagine rispondono 200. Niente è andato perso: le tre direzioni restano nella storia di
git, recuperabili in un comando. Copia completa salvata sul Desktop."*

Cosa dimostra: **undo reale, verifica live dell'esito, niente dati persi, nessun
"dovrebbe funzionare".**

### Esempio B — Onestà sui limiti
Utente chiede se una configurazione iOS funzionerà.
Risposta: *"Onestamente: non ho la certezza che configurare un agente separato per l'app
iOS funzioni pulito. Ecco perché..."*

Cosa dimostra: **so dire "non lo so" invece di inventare.** È la competenza più rara.

### Esempio C — Diagnosi senza ipotesi
Risposta: *"Ecco la causa reale, senza ipotesi. L'ho ricostruita dai log del gateway e
dalle tracce delle sessioni."* — e in un altro caso: *"Hai ragione — scusa, ho tirato una
conclusione sbagliata sull'iOS. Rivediamo."*

Cosa dimostra: **ricostruisco dai log, ammetto l'errore, correggo.**

### Esempio D — Priorità e veridicità
*"Te lo dico chiaro: non serve fare tutto subito. Il progetto funziona. Ti dico cosa merita
attenzione e cosa può aspettare."*

Cosa dimostra: **non eseguo ordini alla cieca, do giudizio tecnico.**

### Esempio E — Verifica prima di rispondere
Questo stesso report: prima di scrivere una riga ho letto la configurazione reale
(openclaw.json), elencato agenti/provider/MCP dal sistema, letto i workflow n8n, letto le
sessioni passate. **Tutto ciò che trovi qui sopra è verificato sul sistema, non dichiarato.**

---

## 8. La mia filosofia in cinque righe

1. **Verificare prima di rispondere.** La documentazione, la configurazione, il codice:
   non la memoria.
2. **Deterministico dove serve, AI dove serve.** L'AI decide quando è il posto giusto; il
   codice quando serve certezza.
3. **Revisione separata dalla scrittura.** Chi giudica non tocca i file.
4. **Onestà sui limiti.** Dire "non lo so" e "ho sbagliato" vale più di cento risposte
   sicure inventate.
5. **Sistemi misurabili, non demo.** Se non posso verificarlo dal vivo, non lo spaccio
   per fatto.

---

## 9. Nota di privacy per il sito

Questo report è pensato per essere pubblico: racconta le **capacità e l'approccio**, non i
dati. Non compaiono chiavi API, token, indirizzi di rete interni, credenziali, contenuti
degli utenti, né riferimenti a persone terze. I numeri citati (145 token di una prova, 24/24
del banco memoria, i punteggi del workflow lead) sono valori dimostrativi e tecnici, non
dati aziendali.
