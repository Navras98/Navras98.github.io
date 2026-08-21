# Glossario e regole di traduzione (italiano → inglese)

Vale per tutte le pagine. La coerenza fra pagine conta quanto la qualità della
singola frase: due pagine che traducono "confini" in due modi diversi fanno
sembrare il sito tradotto a macchina.

## Voce

Sobria, tecnica, in prima persona singolare (è il sito di una persona, non di
un'agenzia). Frasi brevi, affermative, verificabili. Inglese britannico-neutro,
senza americanismi da marketing.

**Vietato:** superlativi ("cutting-edge", "state-of-the-art", "seamless",
"revolutionary", "unlock", "empower", "leverage", "robust"), esclamativi,
emoji, promesse assolute, punto e virgola decorativo.

**Vietato il trattino lungo (—) nel testo del corpo.** Nei `<title>` resta
com'è in italiano. Nel corpo si riscrive con due frasi, una virgola o i due
punti.

## Termini fissi

| italiano | inglese |
|---|---|
| agenti AI | AI agents |
| sistema di agenti | agent system |
| confini | boundaries |
| limite dichiarato | Stated limit |
| Progettazione | Design |
| Sicurezza (sezione) | Security |
| Manutenzione | Maintenance |
| Modelli in locale | Local models |
| Privacy Bridge | Privacy Bridge (invariato) |
| Formazione | Training |
| Casi | Case studies |
| Strumenti | Tools |
| Metodo | Method |
| Automazione | Automation |
| Architettura | Architecture |
| Dati | Data |
| Contatti | Contact |
| Salta al contenuto | Skip to content |
| Menu | Menu |
| Apri il menu | Open the menu |
| Chiaro / Scuro (tema) | Light / Dark |
| Scorri | Scroll |
| Come lavoro | How I work |
| indice di intelligenza | intelligence index |
| indice agenti di codice | coding agents index |
| costo per compito | cost per task |
| prova / collaudo | test |
| in funzione | in service / running |
| processo aziendale | business process |
| passaggio (di un flusso) | step |
| in casa / in locale | on-premises / local |
| esce di mano | leaves the building |

## Cosa NON si traduce, mai

- Nomi propri e di prodotto: Andrea Sforna, Andrea Sforna AI, Claude, Opus,
  Sonnet, Haiku, Anthropic, OpenAI, GPT, Gemini, Google, DeepSeek, Qwen,
  Alibaba, Kimi, Moonshot AI, Mistral AI, OpenClaw, Hermes Agent, Higgsfield,
  n8n, Ollama, LM Studio, MCP, Telegram, WhatsApp, GitHub, macOS, Docker.
- Numeri, percentuali, valute, unità, date, versioni. Devono restare **identici
  cifra per cifra**: `63`, `$2,34`, `8,17`, `113`, `27 KB`.
  Non convertire la virgola decimale italiana in punto: i numeri sono verificati
  contro la fonte da uno strumento automatico, e cambiarli fa fallire il collaudo.
- Frammenti di codice, nomi di file, comandi, indirizzi web.
- Entità HTML: `&nbsp;` `&#183;` `&#8217;` `&#8595;` `&amp;` vanno **ricopiate
  identiche**, nella stessa posizione logica della frase.
- Pezzi che sono una sola lettera (`A`, `n`, `d`, ...): sono il nome animato
  lettera per lettera. Si ricopiano identici.
- Sigle di sezione come `01`, `02`, `03`.

## Frasi spezzate

Molti pezzi sono metà di una frase, perché in mezzo c'era un tag (`<strong>`,
`<a>`, un a capo). Si vede dai pezzi vicini nella lista. Traduci il pezzo in
modo che **rimontato con i vicini nello stesso ordine** dia una frase inglese
corretta. Non spostare parole da un pezzo all'altro: ogni numero deve restare
al suo posto, e nessun pezzo può restare vuoto.

## Formato della risposta

Un solo file JSON, `<nome>.en.json`, con esattamente questa forma:

```json
{
  "pezzi": { "0": "...", "1": "...", "2": "..." },
  "schema": [ { "campo.puntato": "..." } ]
}
```

`pezzi` deve contenere **tutte** le chiavi presenti nel file di partenza, senza
buchi. `schema` è una lista con lo stesso numero di elementi di `schema` nel
file di partenza, e ogni elemento ha le stesse chiavi puntate.
