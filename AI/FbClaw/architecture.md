# Architettura

## Struttura del progetto

```
FbClaw/
├── restart.sh                  # Script per avviare/riavviare il servizio
├── requirements.txt
├── .env                        # Variabili d'ambiente (non committare)
├── .env.example                # Template delle variabili richieste
├── docs/                       # Questa documentazione
├── scripts/
│   └── show_db.py              # Script CLI per ispezionare agents.db
├── tmp/                        # Log, PID e DB (ignorato da git)
│   ├── fbclaw.log              # Log rotante (max 5 MB × 3 backup)
│   ├── fbclaw.pid              # PID del processo corrente
│   └── agents.db               # SQLite — memoria persistente sessioni + preferenze utente
└── src/fbclaw/
    ├── main.py                 # App FastAPI + lifespan
    ├── config.py               # Settings da .env via pydantic-settings
    ├── context.py              # ContextVar per bot/chat_id (iniezione async-safe nei tool)
    ├── log_config.py           # Logging con livello TRACE e rotazione file
    ├── transcription.py        # Trascrizione audio via Groq Whisper
    ├── bot/
    │   ├── telegram_bot.py     # TelegramBot: registra webhook, smista gli update
    │   ├── handler.py          # Gestione messaggi di testo
    │   ├── voice_handler.py    # Gestione messaggi vocali/audio
    │   ├── attachment_handler.py # Gestione immagini, PDF, CSV
    │   ├── commands.py         # Comandi: /reset
    │   ├── telegram_tools.py   # Toolkit agno: send_file()
    │   └── utils.py            # reply_long() — gestisce risposte > 4096 caratteri
    └── agent/
        └── agent.py            # Agente AI (Mistral) con tutti i tool registrati
```

## Flusso messaggi di testo

```
Telegram
  → POST /webhook/telegram
  → TelegramBot.process_update()
  → handle_message()           # filtra per user_id
  → run_agent(testo, session_id=chat_id, bot=bot)
  → reply_long()               # spezza se > 4096 caratteri
```

## Flusso messaggi vocali/audio

```
Telegram (voice/audio)
  → handle_voice()             # filtra per user_id
  → download OGG da Telegram
  → transcribe_audio()         # Groq Whisper → testo
  → 🎙️ risposta con trascrizione
  → run_agent(testo, session_id=chat_id, bot=bot)
  → reply_long()
```

## Flusso allegati (immagini, PDF, CSV)

```
Telegram (photo/document)
  → handle_attachment()        # filtra per user_id
  → download file da Telegram
  → immagine  → run_agent_with_image()    (Pixtral)
  → PDF       → _extract_pdf() → run_agent_with_document()
  → CSV       → _read_csv()    → run_agent_with_document()
  → reply_long()
```

## Componenti principali

### `main.py`
Entry point FastAPI. Gestisce il ciclo di vita del bot tramite `lifespan`. Espone:
- `POST /webhook/telegram` — riceve gli update da Telegram (valida il secret token). L'update viene processato con `asyncio.create_task()` in background: il `200` viene restituito immediatamente a Telegram, evitando reinvii durante operazioni lunghe (retry rate-limit).
- `GET /health` — health check

### `config.py`
Tutte le variabili di configurazione centralizzate tramite `pydantic-settings`. Accedere sempre con `from fbclaw.config import settings`.

### `context.py`
Definisce `current_bot` e `current_chat_id` come `ContextVar`. Prima di ogni `agent.arun()` vengono impostati con il bot e il chat_id correnti, così i tool Telegram possono inviare messaggi senza che il bot venga passato esplicitamente lungo tutta la call stack.

### `log_config.py`
- Livello **TRACE** (5) aggiunto come livello custom
- Formato: `YYYY-MM-DD HH:MM:SS.mmm [LEVEL] modulo: messaggio`
- File rotante: max 5 MB, 3 backup in `tmp/`
- Livello configurabile via `LOG_LEVEL` nel `.env`

### `agent.py`
Punto centrale di integrazione con l'AI. Espone:
- `run_agent(input, session_id, user_id, bot)` — testo
- `run_agent_with_image(input, image_bytes, session_id, user_id, bot)` — immagine
- `run_agent_with_document(input, text, filename, session_id, user_id, bot)` — documenti

### `transcription.py`
Usa il client asincrono Groq per trascrivere audio OGG con `whisper-large-v3-turbo`.

### `bot/utils.py`
`reply_long(message, text)` — invia il testo in chunk da 4096 caratteri.

### `scripts/show_db.py`
Ispeziona il database SQLite da riga di comando:
```bash
python3 scripts/show_db.py              # tutto
python3 scripts/show_db.py --sessions   # solo sessioni
python3 scripts/show_db.py --memories  # solo memorie utente
```

## Skill dell'agente

Le skill sono pacchetti di istruzioni specializzate caricate da `.agents/skills/`. L'agente le usa tramite i tool `get_skill_instructions`, `get_skill_reference`, `get_skill_script`.

| Skill | Quando si attiva |
|---|---|
| `docx` | Creazione/lettura/modifica documenti Word (.docx) |
| `pdf` | Lettura, estrazione, creazione, unione, compilazione moduli PDF |
| `pptx` | Creazione/lettura/modifica presentazioni PowerPoint (.pptx) |
| `xlsx` | Lettura/creazione/modifica fogli Excel (.xlsx, .csv, .tsv) |

Le skill includono script pronti all'uso in `.agents/skills/<nome>/scripts/` e documentazione in `.agents/skills/<nome>/references/`.

## Tool dell'agente

L'agente dispone dei seguenti tool, tutti registrati in `agent.py`:

| Tool | Classe agno | Funzioni principali |
|---|---|---|
| **Telegram** | `TelegramToolkit` | `send_file(path, caption)` — invia file all'utente |
| **Web Search** | `WebSearchTools` | `web_search(query)`, `search_news(query)` via DuckDuckGo |
| **Website** | `WebsiteTools` | `read_url(url)` — legge il contenuto di una pagina web |
| **CSV** | `CsvTools` | `read_csv_file`, `list_csv_files`, `get_columns`, `query_csv_file` |
| **File** | `FileTools` | `read_file`, `save_file`, `list_files`, `search_files`, `search_content` |
| **Shell** | `ShellTools` (subclass) | `run_shell_command(cmd)` — esegue comandi bash; `tail: Optional[int]` per tollerare `tail=None` dal LLM |
| **Local FS** | `LocalFileSystemTools` | `write_file(path, content)` — scrittura file |
| **Python** | `PythonTools` | `run_python_code`, `save_to_file_and_run`, `pip_install_package` |

`FileTools`, `ShellTools` e `PythonTools` hanno la `base_dir` impostata alla root del progetto (`FbClaw/`).

## Memoria persistente

Il DB `tmp/agents.db` contiene due aree distinte:

| Tabella | Contenuto |
|---|---|
| `agent_sessions` | Cronologia conversazioni per `session_id` (= `chat_id` Telegram) |
| `user_memories` | Preferenze e informazioni utente per `user_id` (= Telegram user ID) |

- Sessione = conversazione per singola chat; sopravvive ai riavvii
- Memoria utente = preferenze agentic (lingua, nome, interessi, abitudini) condivise tra sessioni
- `/reset` cancella sia la sessione che le memorie utente
