# Scaricare Immagini da Docker Hub

Docker Hub è il punto di partenza più comune per trovare e ottenere immagini Docker. Questa guida spiega cos'è Docker Hub, come cercare immagini e come scaricarle (effettuare un "pull") sul tuo sistema locale.

## Introduzione a Docker Hub

*   **Cos'è Docker Hub:**
    Docker Hub ([hub.docker.com](https://hub.docker.com/)) è il **registro pubblico ufficiale e più grande per le immagini Docker**, gestito da Docker, Inc. Funge da repository centralizzato dove milioni di sviluppatori e organizzazioni possono archiviare, condividere e distribuire immagini Docker.

*   **Cosa Offre:**
    *   **Milioni di Immagini:** Una vasta libreria di immagini che spaziano da sistemi operativi base (come Ubuntu, Alpine), a runtime di linguaggi (Python, Node.js, Java), a software applicativi (nginx, MongoDB, WordPress).
    *   **Repository Pubblici:** Chiunque può creare repository pubblici per condividere le proprie immagini. Questi sono gratuiti.
    *   **Repository Privati:** Per immagini proprietarie o che non si desidera rendere pubbliche, Docker Hub offre piani a pagamento per repository privati.
    *   **Immagini Ufficiali:** Immagini curate e mantenute direttamente da Docker Inc. o dai vendor del software, considerate affidabili e aggiornate.
    *   **Immagini Verificate dal Publisher:** Immagini pubblicate da partner tecnologici di Docker che hanno superato un processo di verifica, garantendo autenticità e qualità.
    *   **Build Automatiche (Automated Builds):** Docker Hub può essere collegato a repository di codice sorgente (come GitHub o Bitbucket) per costruire automaticamente nuove versioni di immagini Docker ogni volta che il codice sorgente viene aggiornato (cenni, poiché la configurazione dettagliata esula da questa guida base).

*   **Importanza di un Account Docker ID:**
    Sebbene sia possibile cercare e scaricare immagini pubbliche senza un account, avere un Docker ID (un account su Docker Hub) è necessario per:
    *   Caricare (push) le proprie immagini.
    *   Creare repository pubblici o privati.
    *   Lasciare commenti o stelle sulle immagini.
    *   In alcuni casi, per superare limiti di rate limiting sullo scaricamento anonimo di immagini.
    È consigliabile creare un Docker ID per un'esperienza completa.

## Navigare e Cercare Immagini su Docker Hub

Ci sono due modi principali per trovare immagini su Docker Hub:

### Interfaccia Web

Visitando [hub.docker.com](https://hub.docker.com/), puoi:
*   **Cercare:** Utilizzare la barra di ricerca per trovare immagini per nome o parola chiave.
*   **Filtrare:** I risultati della ricerca possono essere filtrati per:
    *   **Verificate dal Publisher (Verified Publisher):** Immagini da partner tecnologici verificati.
    *   **Immagini Ufficiali Docker (Official Images):** Immagini curate direttamente da Docker o dai maintainer ufficiali del software.
*   **Esplorare le Pagine delle Immagini:** Ogni immagine ha una pagina dedicata che fornisce:
    *   **Descrizione:** Informazioni sull'immagine, come usarla, e le versioni disponibili.
    *   **Tag Disponibili (Tags):** Un elenco di tutti i tag (versioni) disponibili per quell'immagine.
    *   **Statistiche di Pull:** Il numero di volte che l'immagine è stata scaricata, un indicatore della sua popolarità.
    *   **Dockerfile (spesso):** Molte immagini ufficiali mostrano il Dockerfile usato per costruirle.

### Comando `docker search`

Puoi cercare immagini direttamente dalla riga di comando:

*   **Sintassi:**
    ```bash
    docker search [OPZIONI] TERMINE_DI_RICERCA
    ```

*   **Opzioni Utili:**
    *   `--limit N`: Limita il numero di risultati mostrati (default 25). Esempio: `docker search --limit 10 python`
    *   `--filter "is-official=true"`: Mostra solo immagini ufficiali. Esempio: `docker search --filter "is-official=true" nginx`
    *   `--filter "stars=X"`: Mostra solo immagini con almeno X stelle. Esempio: `docker search --filter "stars=100" alpine`

*   **Interpretare l'Output:**
    Il comando `docker search` restituisce una tabella con le seguenti colonne:
    *   `NAME`: Il nome dell'immagine.
    *   `DESCRIPTION`: Una breve descrizione dell'immagine.
    *   `STARS`: Il numero di stelle (un'indicazione di popolarità/utilità).
    *   `OFFICIAL`: `[OK]` se l'immagine è ufficiale, altrimenti vuoto.
    *   `AUTOMATED`: `[OK]` se l'immagine è costruita tramite build automatiche, altrimenti vuoto.

    Esempio:
    ```bash
    $ docker search --limit 3 python
    NAME                DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
    python              Python is an interpreted, interactive, obj…   10000+    [OK]
    django              Django is a high-level Python Web framework…  2000+     [OK]
    pypy                PyPy is a fast, compliant alternative impl…   200+      [OK]
    ```

## Anatomia di un Nome di Immagine Docker

Per scaricare e gestire le immagini, è fondamentale comprendere la struttura completa del loro nome:

`[REGISTRY_HOST[:PORT]/][NAMESPACE/]NOME_IMMAGINE[:TAG][@DIGEST]`

*   **`REGISTRY_HOST[:PORT]`** (Opzionale):
    *   Indica l'host del registro dove risiede l'immagine. Se omesso, Docker assume `docker.io` (Docker Hub).
    *   Esempi: `gcr.io` (Google Container Registry), `quay.io`, `ghcr.io` (GitHub Container Registry), `localhost:5000` (un registro locale).
    *   La porta è necessaria solo se il registro non è in ascolto sulla porta standard (443 per HTTPS).

*   **`NAMESPACE/`** (Opzionale):
    *   Identifica un utente o un'organizzazione sul registro. Su Docker Hub, questo è spesso il nome utente Docker ID o il nome dell'organizzazione (es. `bitnami/nginx`, `continuumio/miniconda`).
    *   Per le **immagini ufficiali** su Docker Hub, il namespace è implicitamente `library/` e può (e di solito viene) omesso. Quindi, `nginx` è in realtà `library/nginx`, e `python` è `library/python`.

*   **`NOME_IMMAGINE`** (Obbligatorio):
    *   Il nome effettivo dell'immagine (es. `nginx`, `ubuntu`, `python`, `my-custom-app`).

*   **`:TAG`** (Opzionale):
    *   Specifica una particolare versione o variante dell'immagine. I tag sono stringhe che possono rappresentare versioni semantiche (`1.21.0`), nomi di codice (`buster`), varianti (`slim`, `alpine`), o qualsiasi altra convenzione scelta dal maintainer.
    *   Se il tag è omesso, Docker di default utilizza il tag `latest`.
    *   Esempi: `:latest`, `:3.9-slim`, `:1.21`, `:stable-alpine`.

*   **`@DIGEST`** (Opzionale):
    *   Un digest è un hash SHA256 del contenuto del manifest dell'immagine (es. `@sha256:f8f4ffc8092cacab951676100590c030a039cb3398a549990835174f85244281`).
    *   Il digest identifica univocamente e immutabilmente una specifica versione dell'immagine. A differenza dei tag (che possono essere spostati per puntare a immagini diverse), un digest garantisce che si stia utilizzando sempre la stessa identica build dell'immagine. È il modo più sicuro per referenziare un'immagine.

## Il Comando `docker pull`

Una volta identificata l'immagine desiderata, si usa il comando `docker pull` per scaricarla sul proprio sistema locale.

*   **Sintassi:**
    ```bash
    docker pull NOME_IMMAGINE[:TAG|@DIGEST]
    ```
    Se si specifica solo `NOME_IMMAGINE`, Docker assume implicitamente il registry `docker.io` e il tag `latest`.

*   **Funzionamento:**
    1.  Il client Docker contatta il Docker Daemon.
    2.  Il Docker Daemon contatta il registry specificato (o Docker Hub di default).
    3.  Il registry verifica l'esistenza dell'immagine e del tag/digest.
    4.  Docker verifica quali layer dell'immagine sono già presenti localmente (nella cache delle immagini).
    5.  Vengono scaricati solo i layer mancanti. Questo rende i pull successivi di immagini che condividono layer di base molto più veloci.
    6.  Una volta scaricati tutti i layer, l'immagine viene assemblata e resa disponibile localmente.

*   **Esempi:**
    *   Scaricare l'ultima versione di Ubuntu:
        ```bash
        docker pull ubuntu
        # Equivalente a: docker pull ubuntu:latest
        # Equivalente a: docker pull docker.io/library/ubuntu:latest
        ```
    *   Scaricare una versione specifica di Python basata su Alpine:
        ```bash
        docker pull python:3.9-alpine
        ```
    *   Scaricare Nginx usando il suo digest (garantisce una versione specifica e immutabile):
        ```bash
        docker pull nginx@sha256:f8f4ffc8092cacab951676100590c030a039cb3398a549990835174f85244281 
        # (Il digest qui è solo un esempio, usare un digest valido)
        ```
    *   Scaricare un'immagine da un registro privato (previa autenticazione con `docker login my.registry.com`):
        ```bash
        docker pull my.registry.com/my-org/my-app:1.0.2
        ```

*   **Output del Comando:**
    Durante il pull, Docker mostrerà lo stato del download per ogni layer dell'immagine:
    ```
    Using default tag: latest
    latest: Pulling from library/ubuntu
    a31c7b29b713: Pull complete
    d6350919b170: Pull complete
    4ce53903ac4a: Pull complete
    Digest: sha256:7f5cbd2cc91333d69959c9a799969125941009045338586f5756a1c666c3f1ca
    Status: Downloaded newer image for ubuntu:latest
    docker.io/library/ubuntu:latest
    ```

## Gestire le Immagini Scaricate Localmente

Una volta scaricate, le immagini sono memorizzate localmente e possono essere gestite con i seguenti comandi:

*   **`docker images`** o **`docker image ls`**:
    Elenca tutte le immagini Docker presenti sulla macchina locale. L'output include:
    *   `REPOSITORY`: Il nome del repository dell'immagine (es. `ubuntu`, `python`, `my-user/my-app`).
    *   `TAG`: Il tag dell'immagine.
    *   `IMAGE ID`: Un identificatore univoco (prime 12 cifre di un hash SHA256) per l'immagine.
    *   `CREATED`: Quanto tempo fa l'immagine è stata creata (o il suo ultimo layer).
    *   `SIZE`: La dimensione dell'immagine (somma delle dimensioni dei suoi layer unici).

*   **`docker image inspect NOME_IMMAGINE[:TAG]`**:
    Mostra informazioni dettagliate su un'immagine specifica in formato JSON. Include dettagli sui layer, variabili d'ambiente, comando di avvio, architettura, ecc.

*   **`docker image history NOME_IMMAGINE[:TAG]`**:
    Mostra i layer che compongono l'immagine, l'ID di ogni layer, quando è stato creato, la sua dimensione e il comando Dockerfile che ha creato quel layer. È utile per capire come un'immagine è stata costruita.

## Considerazioni Importanti

*   **Affidabilità e Sicurezza:**
    *   **Preferire immagini ufficiali o da publisher verificati** quando possibile, poiché sono generalmente ben mantenute e scansionate per vulnerabilità.
    *   Per altre immagini, controllare la reputazione del maintainer, la frequenza degli aggiornamenti e se il Dockerfile è disponibile per l'ispezione.
    *   È buona pratica scansionare le immagini (anche quelle ufficiali) per vulnerabilità note utilizzando strumenti come Docker Scout, Trivy, Clair, ecc. (argomento trattato nel modulo Sicurezza).

*   **Dimensioni delle Immagini:**
    *   Immagini più piccole significano tempi di download più rapidi, minore spazio su disco utilizzato e una superficie d'attacco ridotta.
    *   Cercare varianti di immagini ottimizzate, spesso con tag come `slim` o `alpine` (basate su Alpine Linux, una distribuzione molto leggera).

*   **Tag `latest`:**
    *   Il tag `latest` è una convenzione e di solito punta alla versione più recente e stabile di un'immagine. Tuttavia, **è un tag mobile**, il che significa che l'immagine a cui punta può cambiare nel tempo senza preavviso.
    *   Per lo sviluppo e il testing può essere comodo, ma **in produzione è fortemente consigliato utilizzare tag specifici e immutabili** (es. `python:3.9.7-slim`, `nginx:1.21.6`) o, per la massima garanzia, i **digest** (`@sha256:...`) per assicurare build riproducibili e prevenire aggiornamenti imprevisti che potrebbero introdurre breaking changes o vulnerabilità.

## Conclusione

Docker Hub serve come un vasto ecosistema per la condivisione e il recupero di immagini Docker. Il comando `docker pull` è lo strumento principale per scaricare queste immagini sul tuo sistema locale, rendendole disponibili per creare e avviare container. Comprendere come cercare, nominare e scaricare immagini in modo efficace, tenendo conto della sicurezza e del versioning, è un'abilità fondamentale per qualsiasi utente Docker.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Le Basi di Dockerfile](./Dockerfile-Basics.md)
- [➡️ Costruire Immagini Personalizzate con Dockerfile](./Building-Custom-Images-with-Dockerfile.md)
