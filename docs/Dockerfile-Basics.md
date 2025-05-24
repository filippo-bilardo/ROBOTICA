# Le Basi di Dockerfile

Il Dockerfile è il cuore della creazione di immagini Docker personalizzate. È uno script di testo che contiene una sequenza di istruzioni, eseguite in ordine, per assemblare automaticamente un'immagine Docker.

## Cos'è un Dockerfile?

*   **Definizione:** Un Dockerfile è un file di testo, solitamente chiamato `Dockerfile` (senza estensione), che contiene una serie di comandi che il client Docker (`docker`) invia al Docker Daemon per costruire un'immagine. Ogni comando (o istruzione) nel Dockerfile crea un nuovo layer nell'immagine.
*   **Scopo:**
    *   **Automazione:** Automatizza il processo di creazione delle immagini, rendendolo ripetibile e meno soggetto a errori manuali.
    *   **Riproducibilità:** Garantisce che, partendo dallo stesso Dockerfile e dallo stesso contesto di build, si ottenga sempre la stessa immagine (o un'immagine con le stesse caratteristiche).
    *   **Versionabilità:** I Dockerfile possono (e dovrebbero) essere versionati insieme al codice sorgente dell'applicazione (es. in Git), permettendo di tracciare le modifiche alla configurazione dell'immagine nel tempo.
    *   **Documentazione:** Il Dockerfile stesso funge da documentazione su come l'ambiente dell'applicazione è costruito.

## Struttura e Sintassi di Base

Un Dockerfile ha una struttura semplice:
*   **Formato:** Generalmente, ogni riga contiene un'istruzione seguita dai suoi argomenti: `ISTRUZIONE argomento`.
*   **Commenti:** Le righe che iniziano con un carattere `#` sono considerate commenti e vengono ignorate dal builder, a meno che non siano direttive speciali del parser (come `# syntax=...`).
*   **Convenzione (non obbligatoria ma raccomandata):** Le istruzioni Dockerfile sono scritte in MAIUSCOLO per distinguerle dagli argomenti (es. `FROM ubuntu` invece di `from ubuntu`).

Il Docker Daemon esegue le istruzioni del Dockerfile una dopo l'altra, dall'alto verso il basso. La prima istruzione deve essere `FROM` (a meno di direttive del parser).

## Le Istruzioni Principali del Dockerfile

Ecco le istruzioni più comuni e fondamentali utilizzate in un Dockerfile:

### `FROM <immagine>[:<tag>]`
Specifica l'**immagine base** (parent image) da cui la nuova immagine verrà costruita. Deve essere la prima istruzione valida in un Dockerfile.
*   Esempio:
    ```dockerfile
    FROM ubuntu:22.04
    FROM python:3.9-slim
    ```

### `RUN <comando>` (shell form) / `RUN ["eseguibile", "param1", "param2"]` (exec form)
Esegue qualsiasi comando all'interno di un nuovo layer sopra l'immagine corrente e committa i risultati. Il layer risultante viene utilizzato per l'istruzione successiva nel Dockerfile. È comunemente usato per installare pacchetti software, creare directory, configurare l'ambiente, ecc.
*   **Shell Form:** `RUN apt-get update && apt-get install -y python3`
    *   Il comando viene eseguito in una shell, che di default è `/bin/sh -c` su Linux o `cmd /S /C` su Windows.
*   **Exec Form:** `RUN ["apt-get", "install", "-y", "nginx"]`
    *   Il comando viene eseguito direttamente senza una shell. Questa forma è preferita quando non si necessitano delle funzionalità della shell (come l'espansione di variabili d'ambiente della shell).
*   Ogni istruzione `RUN` crea un nuovo layer. Per questo motivo, è buona pratica concatenare comandi correlati (specialmente comandi `apt-get`) per ridurre il numero di layer e ottimizzare la dimensione dell'immagine.
    ```dockerfile
    # Buona pratica: comandi concatenati
    RUN apt-get update && apt-get install -y \
        package1 \
        package2 \
        && rm -rf /var/lib/apt/lists/* # Pulizia cache apt per ridurre dimensione layer

    # Meno ottimale: comandi separati (crea più layer)
    # RUN apt-get update
    # RUN apt-get install -y package1
    # RUN apt-get install -y package2
    ```

### `COPY <src>... <dest>`
Copia file o directory dal **contesto di build** (la directory sorgente specificata quando si esegue `docker build`) nel filesystem dell'immagine alla destinazione `<dest>`.
*   `<src>` deve essere un percorso relativo al contesto di build.
*   `<dest>` è un percorso assoluto all'interno dell'immagine, o un percorso relativo alla `WORKDIR`.
*   Se `<dest>` non esiste, viene creata.
*   Esempio:
    ```dockerfile
    # Copia il file app.py dalla directory corrente (contesto di build) a /app/app.py nell'immagine
    COPY app.py /app/app.py

    # Copia tutto il contenuto della directory 'config' (relativa al contesto) in /etc/myapp/config nell'immagine
    COPY config/ /etc/myapp/config/
    ```

### `ADD <src>... <dest>`
Simile a `COPY`, ma con alcune funzionalità aggiuntive:
1.  **Estrazione automatica di archivi:** Se `<src>` è un archivio compresso locale in un formato riconosciuto (es. `.tar`, `.tar.gz`, `.zip`), viene estratto nella destinazione `<dest>`.
2.  **Download da URL:** Se `<src>` è un URL, Docker scaricherà il file e lo copierà in `<dest>`. *Questa funzionalità è generalmente sconsigliata.* È preferibile usare `curl` o `wget` all'interno di un'istruzione `RUN` per maggiore controllo, visibilità degli errori e pulizia.

**Quando usare `COPY` vs `ADD`:**
La best practice generale è **preferire `COPY` a meno che non si necessiti specificamente della funzionalità di auto-estrazione di `ADD` per archivi locali**. `COPY` è più trasparente e prevedibile. Per scaricare file da URL, usare `RUN curl ...` o `RUN wget ...`.

*   Esempio (`ADD` per estrazione):
    ```dockerfile
    ADD myapp.tar.gz /opt/
    ```

### `WORKDIR /percorso/nella/immagine`
Imposta la **directory di lavoro** per tutte le istruzioni successive (`RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD`). Se la directory non esiste, viene creata. Può essere usata più volte in un Dockerfile.
*   Esempio:
    ```dockerfile
    WORKDIR /app
    COPY . .  # Copia il contesto di build in /app nell'immagine
    RUN make   # Esegue 'make' all'interno di /app
    WORKDIR /app/src
    CMD ["./run-my-app"] # Esegue ./run-my-app da /app/src
    ```

### `EXPOSE <porta> [<porta>/<protocollo>...]`
Documenta le porte di rete su cui il container ascolterà quando è in esecuzione. Non pubblica effettivamente la porta; serve come documentazione per l'utente che esegue il container e come informazione per il sistema Docker. Per pubblicare la porta e renderla accessibile dall'host, si usa l'opzione `-p` (o `-P`) con `docker run`.
*   Il protocollo predefinito è TCP. Si può specificare UDP (es. `EXPOSE 53/udp`).
*   Esempio:
    ```dockerfile
    EXPOSE 80
    EXPOSE 8080/tcp
    EXPOSE 53/udp
    ```

### `ENV <chiave>=<valore>` o `ENV <chiave> <valore>`
Imposta una **variabile d'ambiente** persistente. Questa variabile sarà disponibile per tutte le istruzioni successive nel Dockerfile e anche per l'applicazione in esecuzione nel container.
*   Esempio:
    ```dockerfile
    ENV APP_VERSION="1.0"
    ENV APP_HOME /opt/myapp
    ENV DEBUG_MODE=true
    ```

### `ARG <nome>[=<valore_predefinito>]`
Definisce una **variabile di build**. Queste variabili sono disponibili solo *durante il processo di build dell'immagine* e non nei container in esecuzione derivati dall'immagine (a meno che non vengano esplicitamente usate per impostare una `ENV`). Il loro valore può essere passato al momento della build usando l'opzione `--build-arg <nome>=<valore>` del comando `docker build`.
*   Esempio:
    ```dockerfile
    ARG USER_ID=1000
    ARG APP_BUILD_VERSION
    RUN echo "User ID for build is ${USER_ID}"
    RUN echo "App build version is ${APP_BUILD_VERSION:-default_version}" # Usa un valore di fallback se non fornito
    ```

### `CMD ["eseguibile","param1","param2"]` (exec form, preferita) / `CMD comando param1 param2` (shell form) / `CMD ["param1","param2"]` (parametri per `ENTRYPOINT`)
Specifica il **comando predefinito** da eseguire quando un container viene avviato dall'immagine.
*   Ci può essere **solo un'istruzione `CMD`** in un Dockerfile. Se ce ne sono di più, solo l'ultima ha effetto.
*   Se l'utente specifica un comando quando esegue `docker run <immagine> <altro_comando>`, quel comando sovrascriverà il `CMD` dell'immagine.
*   **Exec Form (preferita):** `CMD ["python", "app.py"]`
*   **Shell Form:** `CMD python app.py` (eseguito come `/bin/sh -c "python app.py"`)
*   **Parametri per `ENTRYPOINT`:** Se usato in combinazione con `ENTRYPOINT` (exec form), `CMD` fornisce i parametri di default per l' `ENTRYPOINT`.
    ```dockerfile
    ENTRYPOINT ["/usr/sbin/nginx"]
    CMD ["-g", "daemon off;"] # Parametri di default per nginx
    ```

### `ENTRYPOINT ["eseguibile","param1","param2"]` (exec form, preferita) / `ENTRYPOINT comando param1 param2` (shell form)
Configura il container per essere eseguito come se fosse un **eseguibile**.
*   A differenza di `CMD`, i parametri passati a `docker run <immagine> [params...]` vengono **aggiunti come argomenti** all'`ENTRYPOINT` (nella sua forma exec), invece di sovrascriverlo. Per sovrascrivere l'`ENTRYPOINT` si deve usare l'opzione `--entrypoint` di `docker run`.
*   Se si usa la forma exec di `ENTRYPOINT` (es. `ENTRYPOINT ["myapp", "--opt"]`), si può usare `CMD` per specificare i parametri di default che possono essere facilmente sovrascritti.
*   Come per `CMD`, solo l'ultima istruzione `ENTRYPOINT` ha effetto.
*   **Best Practice:** Usare `ENTRYPOINT` per specificare l'eseguibile principale dell'immagine e `CMD` per fornire i parametri di default.
    ```dockerfile
    ENTRYPOINT ["python", "app.py"] # L'eseguibile principale
    CMD ["--port", "8080", "--debug"] # Parametri di default, sovrascrivibili
    ```
    Se si esegue `docker run my-image --port 9000`, il container eseguirà `python app.py --port 9000`.

## Esempio Pratico di Dockerfile Semplice (Python Flask)

```dockerfile
# Usa un'immagine base ufficiale di Python con una versione specifica
FROM python:3.9-slim

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file dei requisiti prima del resto del codice per sfruttare la cache
# Se requirements.txt non cambia, questo layer non verrà ricostruito
COPY requirements.txt .

# Installa le dipendenze Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia il resto del codice sorgente dell'applicazione nella directory di lavoro (/app)
COPY . .

# Imposta una variabile d'ambiente (opzionale)
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Documenta la porta su cui l'applicazione Flask ascolterà
EXPOSE 5000

# Comando per eseguire l'applicazione quando il container viene avviato
# Usa la forma exec per CMD
CMD ["flask", "run"]
```
Per questo esempio, `requirements.txt` potrebbe contenere:
```
Flask
```
E `app.py` potrebbe essere:
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, Docker!'

if __name__ == '__main__':
    # FLASK_RUN_HOST è già impostato dalla ENV, quindi Flask ascolterà su tutte le interfacce
    app.run()
```

## Il Processo di Build: `docker build`

Per costruire un'immagine da un Dockerfile, si usa il comando `docker build`.
*   **Sintassi:** `docker build [OPZIONI] /percorso/al/contesto`
    *   `-t nomeimmagine:tag` (o `--tag`): Assegna un nome e un tag all'immagine (es. `my-app:1.0`). È una best practice taggare sempre le immagini.
    *   `/percorso/al/contesto`: Questo è il **contesto di build**. È una directory locale i cui contenuti vengono inviati al Docker daemon per permettere l'accesso ai file referenziati nelle istruzioni `COPY` o `ADD`. Solitamente si usa `.` per indicare la directory corrente.

*   **Il File `.dockerignore`:**
    Simile a `.gitignore`, il file `.dockerignore` (nella root del contesto di build) permette di specificare un elenco di file e directory da escludere dall'invio al daemon. Questo aiuta a ridurre la dimensione del contesto, a velocizzare la build e a evitare di copiare file sensibili nell'immagine.
    Esempio di `.dockerignore`:
    ```
    .git
    *.log
    node_modules/
    Dockerfile
    .dockerignore
    ```

## Best Practice Fondamentali per Dockerfile Semplici

*   **Immagini Base Minimali:** Iniziare con l'immagine base più piccola e appropriata possibile (es. `alpine`, `slim`, `distroless`) per ridurre la superficie d'attacco e la dimensione dell'immagine finale.
*   **Raggruppare Comandi `RUN`:** Concatenare comandi `RUN` correlati (es. installazione di pacchetti e pulizia della cache) in una singola istruzione `RUN` usando `&&` per ridurre il numero di layer.
*   **Ordinare per la Cache:** Mettere le istruzioni che cambiano meno frequentemente (come `FROM`, installazione di dipendenze stabili) prima di quelle che cambiano più spesso (come `COPY` del codice sorgente) per massimizzare l'utilizzo della cache di build.
*   **`COPY` > `ADD`:** Preferire `COPY` a `ADD` per file e directory locali, a meno che non si necessiti specificamente della funzionalità di estrazione automatica di `ADD`.
*   **Chiarezza e Leggibilità:** Mantenere i Dockerfile puliti, ben formattati e commentati per facilitare la comprensione e la manutenzione.
*   **Pulizia nello Stesso Layer:** Quando si installano pacchetti o si scaricano file, pulire gli artefatti non necessari (come file temporanei, cache dei package manager tipo `/var/lib/apt/lists/*`) nello stesso layer `RUN` in cui sono stati creati per ridurre effettivamente la dimensione del layer.

## Conclusione

Il Dockerfile è uno strumento potente e flessibile per definire e automatizzare la creazione di immagini Docker. Comprendere le sue istruzioni principali e le best practice per la sua scrittura è essenziale per creare immagini efficienti, sicure e manutenibili, che sono alla base di un deployment containerizzato di successo.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Container Docker](./Docker-Containers.md)
- [➡️ Scaricare Immagini da Docker Hub](./Pulling-Images-from-Docker-Hub.md)
