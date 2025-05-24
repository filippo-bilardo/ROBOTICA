# Immagini Docker

Le immagini Docker sono il mattone fondamentale della containerizzazione. Possiamo pensarle come dei **blueprint** o template **read-only** (sola lettura) che contengono tutte le istruzioni e le dipendenze necessarie per creare un container Docker funzionante. Un'immagine è essenzialmente uno **snapshot** dell'applicazione e del suo ambiente di esecuzione.

Quando parliamo del contenuto di un'immagine, ci riferiamo a:
*   **Codice dell'applicazione:** Il software che vogliamo eseguire.
*   **Runtime:** L'ambiente necessario per eseguire il codice (es. JRE/JDK per Java, interprete Python, Node.js).
*   **Librerie:** Tutte le librerie e i pacchetti da cui l'applicazione dipende.
*   **Variabili d'ambiente:** Valori di configurazione necessari all'applicazione.
*   **Configurazioni:** File di configurazione specifici dell'applicazione o del sistema.
*   **Metadati:** Informazioni aggiuntive come le porte da esporre, i volumi da montare, ecc.

## Il Concetto di Layer (Livelli)

Una delle caratteristiche più potenti e ingegnose delle immagini Docker è la loro **struttura a livelli (layers)**. Ogni immagine è composta da una serie di layer sovrapposti, e ogni layer rappresenta una modifica o un'aggiunta incrementale rispetto al layer precedente. Questo è reso possibile da un **Union File System** (come AUFS, OverlayFS), che permette di unire più filesystem (i layer) in uno solo visibile dal container.

Quando si costruisce un'immagine da un Dockerfile, **ogni istruzione nel Dockerfile crea un nuovo layer**. Ad esempio, un'istruzione `COPY` per copiare file, un'istruzione `RUN` per eseguire un comando, o un'istruzione `ADD` per aggiungere file, generano ciascuna un nuovo layer.

### Vantaggi dei Layer

Questa architettura a livelli offre numerosi vantaggi:

*   **Efficienza nello Storage:** I layer sono condivisi tra le immagini. Se più immagini si basano sullo stesso layer (ad esempio, un'immagine base di Ubuntu), quel layer viene memorizzato una sola volta sul disco dell'host Docker. Questo riduce significativamente lo spazio occupato.
*   **Efficienza nella Distribuzione:** Quando si scarica (pull) o si carica (push) un'immagine da/verso un registro, Docker trasferisce solo i layer che non sono già presenti localmente o nel registro. Questo accelera notevolmente il trasferimento delle immagini.
*   **Cache per Build più Veloci:** Durante il processo di `docker build`, Docker utilizza una cache per i layer. Se un'istruzione nel Dockerfile e i file associati non sono cambiati rispetto a una build precedente, Docker riutilizza il layer dalla cache invece di ricrearlo, rendendo le build successive molto più rapide.
*   **Organizzazione e Versionamento:** Ogni layer ha un identificatore univoco (un hash), il che facilita il tracciamento delle modifiche e il versionamento.

È importante notare che tutti i layer di un'immagine sono **read-only**. Quando un container viene avviato da un'immagine, Docker aggiunge un **layer scrivibile** (chiamato "container layer" o "writable layer") sopra i layer dell'immagine. Tutte le modifiche apportate dal container in esecuzione (creazione, modifica, eliminazione di file) avvengono in questo layer scrivibile, lasciando l'immagine sottostante immutata.

## Costruire le Immagini

Le immagini Docker vengono tipicamente costruite automaticamente leggendo le istruzioni da un file speciale chiamato **Dockerfile**. Un Dockerfile è uno script di testo che contiene una sequenza di comandi che Docker esegue per assemblare l'immagine strato dopo strato.

Il comando principale per costruire un'immagine da un Dockerfile è:
```bash
docker build -t NOME_IMMAGINE:TAG .
```
(Il comando `docker build` e la sintassi del Dockerfile verranno approfonditi nel modulo dedicato al Dockerfile.)

## Registri Docker (Image Registries)

Un Registro Docker (o Image Registry) è un **repository centralizzato** per lo storage, la gestione e la distribuzione delle immagini Docker. Permette agli sviluppatori di condividere le proprie immagini o di utilizzare immagini create da altri.

### Docker Hub

**Docker Hub** ([hub.docker.com](https://hub.docker.com/)) è il registro pubblico predefinito e il più grande repository di immagini Docker. Contiene:
*   **Immagini Ufficiali:** Immagini curate e mantenute da Docker Inc. o dai vendor di software (es. `ubuntu`, `nginx`, `python`, `node`).
*   **Immagini Verificate:** Immagini pubblicate da partner verificati.
*   **Immagini della Community:** Milioni di immagini caricate da utenti e organizzazioni.

È possibile cercare immagini su Docker Hub direttamente dal sito web o tramite la riga di comando:
```bash
docker search NOME_TERMINE_DI_RICERCA
```

### Registri Privati

Per molte organizzazioni, specialmente per immagini proprietarie o che contengono codice sensibile, è necessario utilizzare **registri privati**. Questi possono essere:
*   **Ospitati On-Premise:** Utilizzando software come Docker Trusted Registry o Harbor.
*   **Servizi Cloud-Based:**
    *   Amazon Elastic Container Registry (AWS ECR)
    *   Google Artifact Registry (precedentemente Google Container Registry - GCR)
    *   Azure Container Registry (ACR)
    *   GitLab Container Registry
    *   GitHub Container Registry

### Comandi Principali per la Gestione delle Immagini

Ecco i comandi Docker più comuni per interagire con le immagini e i registri:

*   **Scaricare un'immagine:**
    ```bash
    docker pull NOME_IMMAGINE[:TAG]
    ```
    Esempio: `docker pull nginx:latest`

*   **Caricare un'immagine su un registro:** (Prima è necessario autenticarsi con `docker login NOME_REGISTRO`)
    ```bash
    docker push NOME_IMMAGINE[:TAG]
    ```
    Esempio: `docker push myusername/my-custom-app:1.0`

*   **Listare le immagini locali:**
    ```bash
    docker images
    # o in alternativa
    docker image ls
    ```

*   **Rimuovere un'immagine locale:**
    ```bash
    docker rmi NOME_IMMAGINE[:TAG]
    # o in alternativa
    docker image rm NOME_IMMAGINE[:TAG]
    ```
    Nota: Non è possibile rimuovere un'immagine se è utilizzata da un container (anche se fermo). Bisogna prima rimuovere il container.

## Tagging e Versioning

Le immagini Docker sono identificate da un **nome** e un **tag**, nel formato `NOME_IMMAGINE:TAG`.
*   **Nome Immagine:** Generalmente indica il software o l'applicazione contenuta (es. `nginx`, `python`, `mia-applicazione`). Può includere un namespace, come `nomeutente/mia-applicazione` per Docker Hub o `indirizzo.registro/repo/mia-applicazione` per registri privati.
*   **Tag:** Specifica una particolare versione o variante dell'immagine (es. `latest`, `1.21.6`, `3.9-slim`, `alpine`).

Il tagging è cruciale per il **versioning**. Permette di distinguere tra diverse release di un'immagine.

Il tag `latest` è una convenzione. Se non si specifica un tag quando si fa il pull di un'immagine, Docker di default assume `:latest`. Tuttavia, `latest` è un tag mobile che punta solitamente alla versione più recente pubblicata. **In produzione, è una best practice evitare `latest` e utilizzare tag specifici e immutabili** (come versioni semantiche `1.2.3`, hash di commit Git, o timestamp) per garantire build riproducibili e prevenire sorprese dovute ad aggiornamenti automatici non controllati.

## Immagini Ufficiali vs. Immagini della Community/Autoprodotte

*   **Immagini Ufficiali:** Sono una selezione di immagini curate e validate, mantenute direttamente da Docker Inc. o dai vendor del software (es. l'immagine ufficiale di Python è mantenuta dal team Python). Sono generalmente considerate sicure e ben mantenute. Si trovano su Docker Hub senza un namespace utente (es. `python` invece di `utente/python`).
*   **Immagini Verificate:** Sono immagini pubblicate da partner di Docker che hanno superato un processo di verifica.
*   **Immagini della Community/Autoprodotte:** Qualsiasi utente può creare e caricare immagini su Docker Hub o altri registri. Quando si utilizzano queste immagini, è importante considerare la fiducia nella fonte, la frequenza degli aggiornamenti e le pratiche di sicurezza adottate dall'autore, poiché potrebbero non essere state sottoposte a controlli rigorosi.

## Brevi Cenni sulla Sicurezza delle Immagini

La sicurezza delle immagini è un aspetto critico. Un'immagine può contenere vulnerabilità note nel sistema operativo base, nelle librerie o nel codice dell'applicazione. È fondamentale:
*   Utilizzare **immagini base minime e affidabili** (es. `alpine` o versioni `slim` delle immagini ufficiali).
*   Mantenere le immagini **aggiornate** regolarmente.
*   **Scansionare le immagini** per individuare vulnerabilità note utilizzando strumenti appositi.
(Questi argomenti verranno trattati in dettaglio nel modulo dedicato alla Sicurezza Docker).

## Conclusione

Le immagini Docker sono il cuore della containerizzazione, fornendo un modo portabile ed efficiente per impacchettare e distribuire applicazioni. La loro architettura a livelli e l'ecosistema dei registri facilitano lo sviluppo, il test e il deployment. Comprendere come funzionano le immagini è essenziale prima di passare a esplorare come vengono eseguite, ovvero i container Docker.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Cos'è Docker?](./What-is-Docker.md)
- [➡️ Container Docker](./Docker-Containers.md)
