# Costruire Immagini Personalizzate con Dockerfile

Abbiamo visto le basi del Dockerfile. Ora approfondiamo come costruire immagini personalizzate in modo efficiente, sicuro e ottimizzato, concentrandoci su tecniche avanzate come i multi-stage build e le strategie di caching.

## Introduzione: Perché Costruire Immagini Personalizzate?

*   **Recap del Ruolo del Dockerfile:**
    Come discusso in precedenza, il Dockerfile è uno script che automatizza la creazione di immagini Docker. Contiene una serie di istruzioni che definiscono l'ambiente dell'applicazione, dalle dipendenze di sistema al codice sorgente e alla configurazione di runtime.

*   **Motivazioni per Immagini Personalizzate:**
    Sebbene Docker Hub offra una vasta gamma di immagini predefinite, spesso è necessario o preferibile costruire le proprie immagini personalizzate per vari motivi:
    1.  **Includere la Propria Applicazione:** Il motivo più ovvio è impacchettare la propria applicazione (codice sorgente, binari compilati, script) all'interno dell'immagine.
    2.  **Configurazioni Specifiche:** Applicare configurazioni personalizzate per l'applicazione o per i servizi che esegue (es. file `nginx.conf` personalizzato, variabili d'ambiente specifiche).
    3.  **Ottimizzazione (Dimensioni, Sicurezza):**
        *   **Dimensioni:** Le immagini predefinite possono contenere molti tool e librerie non necessari per la propria applicazione. Creare un'immagine personalizzata permette di includere solo lo stretto indispensabile, riducendo significativamente le dimensioni dell'immagine finale. Questo si traduce in download più veloci, minore spazio su disco utilizzato e una potenziale riduzione della superficie d'attacco.
        *   **Sicurezza:** Rimuovere software non necessario riduce il numero di potenziali vulnerabilità. È possibile anche applicare patch di sicurezza specifiche o configurazioni di hardening.
    4.  **Standardizzazione:** Definire un ambiente standard e controllato per l'applicazione, garantendo che si comporti in modo consistente ovunque venga eseguita.
    5.  **Controllo delle Dipendenze:** Avere un controllo preciso sulle versioni delle librerie di sistema e delle dipendenze dell'applicazione.

## Multi-Stage Builds (Build Multi-Stadio)

Una delle tecniche più potenti per creare immagini Docker ottimizzate è il **multi-stage build**.

*   **Problema:**
    Spesso, l'ambiente necessario per **costruire** un'applicazione (es. compilare codice sorgente, eseguire test, scaricare dipendenze di build) è molto diverso dall'ambiente necessario per **eseguirla** in produzione. Le immagini di build possono contenere compilatori (GCC, JDK), SDK, tool di build (Maven, Gradle, Node.js con tutte le `devDependencies`), librerie di test, ecc., che sono superflui e potenzialmente insicuri nell'immagine di produzione finale. Questo porta a immagini di produzione inutilmente grandi.

*   **Soluzione: Multi-Stage Builds:**
    Un multi-stage build utilizza più istruzioni `FROM` all'interno dello stesso Dockerfile. Ogni istruzione `FROM` inizia un nuovo **stadio (stage)** di build e può utilizzare un'immagine base completamente diversa. Gli stadi successivi possono copiare selettivamente gli artefatti (es. binari compilati, file JAR, asset statici) dagli stadi precedenti, scartando tutto il resto.

*   **Assegnare Nomi agli Stadi:**
    Per facilitare il riferimento agli stadi precedenti, è possibile assegnare loro un nome utilizzando la sintassi `AS <nome_stadio>`:
    ```dockerfile
    FROM ubuntu:22.04 AS builder
    # ... comandi per costruire l'applicazione ...

    FROM alpine:latest
    # ... copia artefatti dallo stadio "builder" ...
    ```

*   **Copiare Artefatti da Stadi Precedenti:**
    L'istruzione `COPY` può essere utilizzata con l'opzione `--from=<nome_stadio_sorgente_o_indice>` per copiare file o directory da uno stadio precedente al corrente stadio:
    ```dockerfile
    COPY --from=builder /app/artefatto-compilato /app/
    ```
    È possibile referenziare gli stadi anche tramite il loro indice numerico (a partire da 0 per il primo `FROM`).

*   **Benefici:**
    *   **Immagini Finali Drasticamente Più Piccole:** L'immagine finale contiene solo gli artefatti di runtime e le dipendenze strettamente necessarie, escludendo tutti i tool e le dipendenze di build.
    *   **Maggiore Sicurezza:** Una superficie d'attacco ridotta, poiché i tool di sviluppo e le librerie non necessarie non sono presenti nell'immagine di produzione.
    *   **Dockerfile Più Organizzati:** Mantengono la logica di build e la logica di runtime separate ma nello stesso file, rendendo il Dockerfile più leggibile e manutenibile per build complesse.

*   **Esempio Pratico Commentato (Applicazione Go):**
    Supponiamo di avere una semplice applicazione Go (`main.go`):
    ```go
    package main
    import "fmt"
    func main() {
        fmt.Println("Ciao dal Multi-Stage Build!")
    }
    ```

    Dockerfile con multi-stage build:
    ```dockerfile
    # --- Stadio 1: Build ---
    # Utilizza un'immagine Go ufficiale come stadio di build
    FROM golang:1.19 AS builder

    # Imposta la directory di lavoro
    WORKDIR /app

    # Copia il codice sorgente Go
    COPY main.go .

    # Compila l'applicazione Go
    # CGO_ENABLED=0 disabilita cgo, creando un binario statico
    # -o /app/myapp specifica il nome e il percorso dell'output
    RUN CGO_ENABLED=0 go build -o /app/myapp .

    # --- Stadio 2: Produzione ---
    # Utilizza un'immagine base minimale (Alpine è molto piccola)
    FROM alpine:latest

    # Imposta la directory di lavoro
    WORKDIR /root/

    # Copia SOLO il binario compilato dallo stadio 'builder'
    # Non vengono copiate le dipendenze di Go, l'SDK Go, o il codice sorgente
    COPY --from=builder /app/myapp .

    # Comando per eseguire l'applicazione quando il container viene avviato
    CMD ["./myapp"]
    ```
    In questo esempio:
    1.  Lo stadio `builder` usa l'immagine `golang:1.19` (relativamente grande) per compilare l'applicazione Go.
    2.  Lo stadio finale (di produzione) parte da un'immagine `alpine:latest` (molto piccola).
    3.  Solo il binario compilato `/app/myapp` viene copiato dallo stadio `builder` all'immagine finale.
    L'immagine risultante sarà estremamente piccola, contenendo solo il binario e le dipendenze minime di Alpine.

## Ottimizzazione della Cache di Build di Docker

Docker utilizza una cache per accelerare il processo di `docker build`. Quando si costruisce un'immagine, Docker cerca di riutilizzare i layer delle build precedenti se determina che non sono necessarie modifiche.

*   **Funzionamento della Cache:**
    Per ogni istruzione nel Dockerfile, Docker confronta l'istruzione (e i file a cui fa riferimento, es. per `COPY`) con i layer presenti nella sua cache.
    *   Se trova un layer corrispondente (l'istruzione è la stessa e, per `COPY`/`ADD`, i metadati e il contenuto dei file sono identici), riutilizza quel layer e passa all'istruzione successiva. Questo è un "cache hit".
    *   Se non trova una corrispondenza, o se un'istruzione precedente ha invalidato la cache (un "cache miss"), Docker esegue l'istruzione corrente e tutte le istruzioni successive, creando nuovi layer.

*   **Strategie Chiave per Ottimizzare la Cache:**

    1.  **Ordinare le Istruzioni Correttamente:**
        Mettere le istruzioni che cambiano meno frequentemente **all'inizio** del Dockerfile. Le istruzioni che cambiano più spesso (come `COPY` del codice sorgente dell'applicazione) dovrebbero trovarsi il più **tardi** possibile.
        ```dockerfile
        # Meno frequente -> più in alto
        FROM ubuntu:22.04
        RUN apt-get update && apt-get install -y curl

        # Copia delle dipendenze (cambia meno spesso del codice sorgente)
        COPY requirements.txt /app/
        RUN pip install -r /app/requirements.txt

        # Copia del codice sorgente (cambia più spesso)
        COPY src/ /app/src/

        CMD ["python", "/app/src/main.py"]
        ```

    2.  **Specificità del `COPY`:**
        Essere il più specifici possibile con i comandi `COPY`. Invece di un generico `COPY . .` (che copia l'intero contesto di build), copiare solo i file o le directory effettivamente necessari per quel particolare stadio o set di istruzioni.
        Un `COPY . .` invalida la cache se *qualsiasi* file nel contesto di build cambia. Un `COPY specifico_file .` invalida la cache solo se `specifico_file` cambia.

    3.  **Installazione Efficiente delle Dipendenze:**
        Questo è un caso specifico dell'ordinamento delle istruzioni. Per applicazioni che hanno file di definizione delle dipendenze (es. `requirements.txt` per Python, `package.json` per Node.js, `pom.xml` per Maven, `Gemfile` per Ruby):
        *   Copiare **prima** solo il file delle dipendenze.
        *   Eseguire il comando per installare le dipendenze.
        *   **Poi** copiare il resto del codice sorgente.
        In questo modo, se si modifica il codice sorgente ma non le dipendenze, Docker può riutilizzare il layer (potenzialmente grande e lento da creare) dell'installazione delle dipendenze.

        Esempio (Python):
        ```dockerfile
        WORKDIR /app
        COPY requirements.txt .
        RUN pip install -r requirements.txt # Questo layer viene messo in cache
        COPY . . # Copia il resto dell'app. Se solo i file .py cambiano, il RUN sopra è riutilizzato
        CMD ["python", "app.py"]
        ```

    4.  **Invalidare la Cache con `ARG`:**
        Le variabili `ARG` definite prima di un'istruzione `FROM` possono essere usate nell'istruzione `FROM` stessa. Se il valore di tale `ARG` cambia tra una build e l'altra, invaliderà la cache per l'istruzione `FROM` e tutte quelle successive. Un `ARG` definito *dopo* un `FROM` non invalida la cache del `FROM`.

    5.  **Minimizzare il Numero di Layer Modificati:**
        Ogni istruzione nel Dockerfile potenzialmente crea un layer. Anche se raggruppare i comandi `RUN` è importante, essere consapevoli che ogni modifica a un file copiato o ogni modifica a un'istruzione invalida la cache da quel punto in poi.

## Best Practice Avanzate per Dockerfile

Oltre all'ottimizzazione della cache e ai multi-stage build, ci sono altre best practice importanti:

*   **`.dockerignore`:**
    È un file fondamentale da includere nella root del contesto di build. Simile a `.gitignore`, specifica file e directory da **escludere** dall'invio al daemon Docker.
    *   **Benefici:**
        *   **Riduce le Dimensioni del Contesto:** Meno dati inviati al daemon, build più veloci.
        *   **Evita Invalidazioni di Cache Inutili:** Se file non rilevanti per l'immagine (es. `.git/`, `README.md`) cambiano, non invalidano la cache per le istruzioni `COPY . .`.
        *   **Sicurezza:** Previene la copia accidentale di file sensibili (es. credenziali, chiavi private) nell'immagine.
    *   Esempio di `.dockerignore`:
        ```
        .git
        .vscode
        *.log
        node_modules/
        target/
        build/
        Dockerfile
        .dockerignore
        ```

*   **Combinare Comandi `RUN` con Logica e Pulizia:**
    Come già accennato, unire comandi `RUN` con `&&` per creare un singolo layer logico. È cruciale includere la pulizia degli artefatti temporanei **nello stesso layer `RUN`** in cui sono stati creati.
    Esempio (installazione `apt`):
    ```dockerfile
    RUN apt-get update && \
        apt-get install -y --no-install-recommends package1 package2 && \
        # Pulizia della cache di apt per ridurre le dimensioni del layer
        rm -rf /var/lib/apt/lists/*
    ```
    Se `rm -rf /var/lib/apt/lists/*` fosse in un `RUN` separato, i file della cache esisterebbero ancora nel layer precedente, e la dimensione totale dell'immagine non diminuirebbe come previsto.

*   **Principio del Minimo Privilegio:**
    *   **Non Eseguire come `root`:** Per impostazione predefinita, i container Docker e i comandi al loro interno vengono eseguiti come utente `root`. Questa è una cattiva pratica di sicurezza. È fortemente raccomandato creare un utente non privilegiato e passare a quell'utente usando l'istruzione `USER`.
        ```dockerfile
        # ... altre istruzioni ...
        RUN groupadd -r myuser && useradd --no-log-init -r -g myuser myuser
        # ... copia file dell'applicazione e imposta permessi se necessario ...
        USER myuser
        # Le istruzioni successive (CMD, ENTRYPOINT) verranno eseguite come 'myuser'
        CMD ["./my-app"]
        ```
    *   **Installare Solo i Pacchetti Necessari:** Ogni pacchetto aggiunto aumenta la superficie d'attacco. Includere solo ciò che è strettamente necessario per l'esecuzione dell'applicazione. L'opzione `--no-install-recommends` con `apt-get` è utile per evitare dipendenze non essenziali.

*   **Parametrizzazione con `ARG` vs `ENV`:**
    *   `ARG`: Variabili disponibili **solo durante la build** dell'immagine. Non sono persistenti nell'immagine finale o disponibili a runtime nel container (a meno che non vengano usate per impostare una `ENV`). Utili per passare informazioni al processo di build (es. versioni di dipendenze, UID/GID). Possono avere un valore di default.
    *   `ENV`: Variabili d'ambiente che sono disponibili **sia durante la build** (se definite prima del loro uso nelle istruzioni successive) **sia a runtime** all'interno del container.
    *   **Sicurezza:** Non usare `ARG` per passare segreti (password, token API) al processo di build, poiché i valori degli `ARG` possono essere ispezionati tramite il comando `docker image history`. Per i segreti di build, usare meccanismi più sicuri come i "build secrets" (disponibili con BuildKit) o secret mount.

*   **`LABEL` per Metadati:**
    Usare l'istruzione `LABEL` per aggiungere metadati all'immagine. È utile per organizzazione, automazione e documentazione. Si raccomanda di seguire lo standard OCI (Open Container Initiative) per le etichette predefinite.
    ```dockerfile
    LABEL maintainer="tuonome@example.com" \
          org.opencontainers.image.title="La Mia Fantastica Applicazione" \
          org.opencontainers.image.version="1.0.0" \
          org.opencontainers.image.description="Questa è un'applicazione che fa cose fantastiche." \
          org.opencontainers.image.url="https://example.com/myapp" \
          org.opencontainers.image.source="https://github.com/tuonome/myapp"
    ```

*   **Scelta dell'Immagine Base:**
    La scelta dell'immagine base ha un impatto significativo sulle dimensioni e sulla sicurezza dell'immagine finale.
    *   **Immagini Ufficiali:** Generalmente ben mantenute e affidabili.
    *   **Immagini Minimali:**
        *   `alpine`: Basate su Alpine Linux, estremamente leggere (pochi MB). Richiedono `musl libc` invece di `glibc`, il che può causare problemi di compatibilità con alcuni software precompilati.
        *   `slim`: Molte immagini ufficiali (es. Python, Node) offrono varianti `slim` che sono più piccole delle versioni standard perché omettono alcuni pacchetti non essenziali.
        *   `distroless`: Immagini di Google che contengono solo l'applicazione e le sue dipendenze di runtime, senza shell o altri tool di sistema operativo. Ottime per la sicurezza e le dimensioni, ma possono rendere il debug più difficile.

*   **No `dist-upgrade` in `RUN`:**
    Evitare di eseguire `apt-get dist-upgrade` o comandi equivalenti per altre distribuzioni. Questo può portare a modifiche sostanziali e impreviste nell'immagine base, potenzialmente rompendo la compatibilità o introducendo instabilità. È responsabilità del maintainer dell'immagine base fornire aggiornamenti e patch di sicurezza. Se è necessario un pacchetto più recente, considerare l'uso di un'immagine base più recente o l'installazione specifica di quel pacchetto.

*   **Chiarezza e Commenti:**
    Un Dockerfile ben scritto è facile da capire e mantenere. Usare commenti per spiegare scelte complesse o non ovvie. Formattare il Dockerfile in modo leggibile.

## Approfondimento sul Contesto di Build

Quando si esegue `docker build [OPZIONI] PATH | URL`, la `PATH` (o `URL`) specificata è il **contesto di build**.
*   Se è una `PATH` locale, il client Docker crea un archivio (tarball) dell'intero contenuto di quella directory (rispettando `.dockerignore`) e lo invia al Docker Daemon.
*   Il Daemon utilizza questo contesto per accedere ai file referenziati nelle istruzioni `COPY` o `ADD`.
*   È importante mantenere il contesto di build il più piccolo possibile per velocizzare il trasferimento al daemon e ridurre la possibilità di invalidare la cache inutilmente.

## Linting dei Dockerfile

Strumenti come **Hadolint** possono analizzare staticamente il tuo Dockerfile e fornire suggerimenti per migliorarlo, basati su best practice consolidate. Integrare un linter nel proprio workflow di sviluppo può aiutare a prevenire errori comuni e a scrivere Dockerfile più robusti e ottimizzati.
Hadolint può essere eseguito localmente o integrato in pipeline CI/CD.

## Conclusione

Costruire immagini personalizzate con Dockerfile è un'arte che bilancia funzionalità, dimensioni, sicurezza e manutenibilità. Tecniche come i multi-stage build, l'ottimizzazione della cache e l'adesione alle best practice permettono di creare immagini Docker che sono leggere, sicure, efficienti e facili da gestire, gettando le basi per un processo di containerizzazione di successo.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Scaricare Immagini da Docker Hub](./Pulling-Images-from-Docker-Hub.md)
- [➡️ Il Comando \`docker run\`](./Docker-Run-Command.md)
