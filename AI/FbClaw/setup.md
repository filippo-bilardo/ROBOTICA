# Setup e Configurazione

Per realizzare questo agente AI personale ho preso spunto da questo video:
[Simone Rizzo - Ho rifatto OpenClaw… ed è stato troppo facile](https://www.youtube.com/watch?v=YKO-BPogmY0&t=1249s)

## Requisiti

- Python 3.10+
- Un bot Telegram (creato con @BotFather)
- API key Mistral (per l'agente AI)
- API key Groq (per la trascrizione audio)
- URL pubblico HTTPS (per il webhook Telegram)

## 1. Clona e installa le dipendenze

```bash
pip install -r requirements.txt
```

## 2. Crea il bot Telegram

1. Apri Telegram e cerca **@BotFather**
2. Invia `/newbot` e segui le istruzioni
3. Copia il **token** ricevuto

## 3. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Modifica `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_WEBHOOK_SECRET=stringa-segreta-casuale
WEBHOOK_BASE_URL=https://tuo-dominio.com

MISTRAL_API_KEY=...        # da console.mistral.ai
GROQ_API_KEY=gsk_...       # da console.groq.com

LOG_LEVEL=INFO             # TRACE | DEBUG | INFO | WARNING | ERROR
```

### Dove ottenere le API key

| Chiave | Link | Note |
|---|---|---|
| `MISTRAL_API_KEY` | [console.mistral.ai](https://console.mistral.ai) | Tier gratuito disponibile |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | Gratuito, 14.400 req/giorno |

## 4. Esponi il servizio (sviluppo locale)

Il webhook Telegram richiede HTTPS. In sviluppo usa **ngrok**:

```bash
ngrok http 3009
# copia l'URL https://xxxx.ngrok.io → impostalo come WEBHOOK_BASE_URL
```

## 5. Avvia il servizio

```bash
./restart.sh
```

Lo script:
- Ferma il processo esistente (se presente)
- Avvia uvicorn sulla porta **3009**
- Verifica che il servizio risponda
- Mostra il log in tempo reale (`Ctrl+C` per uscire, il servizio continua)

Il webhook viene registrato automaticamente su Telegram all'avvio.

## 6. Verifica

```bash
curl https://tuo-dominio.com/health
# → {"status":"ok"}
```

## Livelli di log disponibili

| Livello | Valore | Uso |
|---|---|---|
| TRACE | 5 | Payload raw, input/output funzioni |
| DEBUG | 10 | Flusso interno |
| INFO | 20 | Default — eventi normali |
| WARNING | 30 | Anomalie non bloccanti |
| ERROR | 40 | Errori gestiti |
| CRITICAL | 50 | Errori fatali |

## Dipendenze notevoli

| Pacchetto | Uso |
|---|---|
| `agno` | Framework agente AI |
| `mistralai` | Modello LLM (`mistral-large-latest`, `pixtral-large-latest`) |
| `groq` | Trascrizione audio (Whisper) |
| `ddgs` | DuckDuckGo search (nessuna API key richiesta) |
| `duckdb` | Query SQL su file CSV |
| `pypdf` | Estrazione testo da PDF |
| `beautifulsoup4` | Parsing HTML per `WebsiteTools.read_url` |
| `sqlalchemy` + `aiosqlite` | Memoria persistente SQLite |
| `python-telegram-bot` | Client Telegram webhook |
| `fastapi` + `uvicorn` | Server HTTP |

## Comandi disponibili su Telegram

| Comando | Funzione |
|---|---|
| `/reset` | Cancella la sessione corrente e le memorie utente |

## Esempi d'uso con i tool

L'agente riconosce automaticamente quando usare i tool. Esempi di prompt:

```
"Cerca le ultime notizie su Python 3.13"
→ usa web_search / search_news

"Leggi il contenuto di https://docs.python.org"
→ usa read_url

"Esegui questo codice Python: print(2**10)"
→ usa run_python_code

"Elenca i file nella cartella src/"
→ usa list_files / run_shell_command

"Inviami il file docs/README.md"
→ usa send_file
```

