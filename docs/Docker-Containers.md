# Container Docker

Se le immagini Docker sono i "blueprint", i **Container Docker** sono le "case" costruite a partire da quei blueprint. Un container è un'istanza **eseguibile**, viva e isolata di un'immagine Docker. È l'unità in cui un'applicazione viene effettivamente eseguita.

## Cosa Sono i Container Docker?

*   **Definizione:** Un container è un processo (o un gruppo di processi) che esegue l'applicazione definita nell'immagine Docker. È un ambiente runtime standardizzato e portabile.
*   **Relazione con le Immagini:** Ogni container è creato **da un'immagine Docker specifica**. L'immagine fornisce il filesystem read-only iniziale e la configurazione di base. Quando un container viene avviato, Docker aggiunge un layer scrivibile sopra l'immagine, permettendo al container di modificare file, scrivere log, ecc., senza alterare l'immagine originale.
*   **Isolamento:** I container forniscono un elevato grado di isolamento grazie a funzionalità del kernel Linux come i **namespaces** (per isolare PID, rete, utenti, mount point, IPC) e i **cgroups** (per limitare e monitorare l'uso delle risorse come CPU, memoria, I/O). Questo significa che:
    *   Ogni container ha il proprio **filesystem** isolato, derivato dall'immagine ma con un layer scrivibile.
    *   Ogni container ha il proprio **stack di rete** isolato (indirizzo IP, tabelle di routing, porte).
    *   I processi all'interno di un container sono isolati dai processi dell'host e degli altri container.

## Il Ciclo di Vita di un Container

Un container Docker attraversa diversi stati durante la sua esistenza. Comprendere questo ciclo di vita è fondamentale per la gestione dei container.

1.  **`created` (Creato):**
    *   Il container è stato creato (`docker create NOME_IMMAGINE`) ma non è ancora stato avviato. Le risorse di base sono state allocate, ma il comando principale dell'immagine non è in esecuzione.
    *   Comando per creare: `docker create my-image`

2.  **`running` (In Esecuzione):**
    *   Il container è stato avviato (`docker start ID_O_NOME_CONTAINER` o direttamente con `docker run NOME_IMMAGINE`) e il processo principale specificato nell'immagine è in esecuzione.
    *   Comando per avviare (se già creato): `docker start my-container`
    *   Comando per creare e avviare: `docker run my-image`

3.  **`paused` (In Pausa):**
    *   Tutti i processi all'interno del container sono stati sospesi (`docker pause ID_O_NOME_CONTAINER`) utilizzando i cgroups freezer. Lo stato del container è preservato in memoria.
    *   Comando per mettere in pausa: `docker pause my-container`
    *   Comando per riprendere: `docker unpause my-container`

4.  **`stopped` (Fermato):**
    *   Il container non è più in esecuzione (`docker stop ID_O_NOME_CONTAINER`). Questo può avvenire perché il processo principale è terminato con successo, ha incontrato un errore, o è stato inviato un segnale di stop. Lo stato del filesystem del container (il suo layer scrivibile) è preservato.
    *   Comando per fermare: `docker stop my-container` (invia SIGTERM, poi SIGKILL dopo un timeout)

5.  **`exited` (Uscito/Terminato):**
    *   Questo è uno stato intermedio dopo `stopped`. Indica che il processo principale del container è terminato. È ancora possibile ispezionare il container, vedere i log, o riavviarlo (`docker start`). Se il container è stato eseguito con l'opzione `--rm`, passerà direttamente alla rimozione.
    *   Comando per riavviare (se fermato): `docker restart my-container`

6.  **`dead` (Morto):**
    *   Questo stato indica che il container non può essere eseguito o è stato rimosso. Solitamente non è uno stato che si gestisce direttamente; il container viene rimosso.
    *   Comando per rimuovere (se fermato o uscito): `docker rm my-container`

## Comandi Essenziali per la Gestione dei Container

Docker fornisce una ricca CLI per interagire con i container:

*   **`docker run [OPZIONI] IMMAGINE [COMANDO] [ARG...]`**: È il comando più utilizzato. Crea un nuovo container da un'immagine specificata e lo avvia.
    *   `-d` o `--detach`: Esegue il container in background (modalità "detached"). Stampa l'ID del container.
    *   `-it` (`-i` per interactive, `-t` per TTY): Mantiene lo STDIN aperto e alloca uno pseudo-TTY, necessario per shell interattive.
    *   `--name NOME_CONTAINER`: Assegna un nome personalizzato al container per una facile referenziazione.
    *   `-p HOST_PORT:CONTAINER_PORT`: Mappa una porta dell'host Docker alla porta del container (es. `-p 8080:80`).
    *   `-v HOST_PATH:CONTAINER_PATH` o `NOME_VOLUME:CONTAINER_PATH`: Monta un volume. `HOST_PATH` è un percorso sull'host, `NOME_VOLUME` è un volume gestito da Docker. (Approfondito nel modulo Volumi).
    *   `--rm`: Rimuove automaticamente il container quando esce (termina). Utile per task temporanei.
    *   `--network NOME_RETE`: Connette il container a una rete specificata. (Approfondito nel modulo Networking).
    *   Esempio: `docker run -d -p 80:80 --name webserver nginx`

*   **`docker ps`** (o `docker container ls`): Lista i container attualmente in esecuzione.
    *   `docker ps -a`: Lista tutti i container, inclusi quelli fermati (stato `exited`).

*   **`docker stop ID_CONTAINER_O_NOME`**: Ferma uno o più container in esecuzione. Invia un segnale SIGTERM al processo principale del container, e se non termina entro un periodo di grazia (default 10 secondi), invia SIGKILL.

*   **`docker start ID_CONTAINER_O_NOME`**: Avvia uno o più container precedentemente creati e fermati.

*   **`docker restart ID_CONTAINER_O_NOME`**: Riavvia un container. Equivale a un `docker stop` seguito da `docker start`.

*   **`docker rm ID_CONTAINER_O_NOME`**: Rimuove uno o più container **fermati**. Il layer scrivibile del container viene eliminato.
    *   `docker rm -f ID_CONTAINER_O_NOME`: Forza la rimozione di un container (anche se è in esecuzione, inviando prima SIGKILL).
    *   `docker container prune`: Rimuove tutti i container fermati. Utile per fare pulizia.

*   **`docker logs ID_CONTAINER_O_NOME`**: Recupera i log (output standard stdout/stderr) di un container.
    *   `-f` o `--follow`: Segue l'output dei log in tempo reale.
    *   `--tail N`: Mostra le ultime N righe di log (es. `--tail 50`).

*   **`docker inspect ID_CONTAINER_O_NOME`**: Fornisce informazioni dettagliate a basso livello su un container in formato JSON, inclusa la sua configurazione, lo stato della rete, i volumi montati, ecc.

*   **`docker exec [OPZIONI] ID_CONTAINER_O_NOME COMANDO [ARG...]`**: Esegue un nuovo comando all'interno di un container **già in esecuzione**. Utile per debug o per eseguire task di amministrazione.
    *   `docker exec -it ID_CONTAINER_O_NOME /bin/bash` (o `sh` per immagini minimali): Apre una shell interattiva all'interno del container.

## Immagini vs. Container: Le Differenze Chiave

È cruciale distinguere tra immagini e container:

| Caratteristica     | Immagine Docker                                  | Container Docker                                                |
| ------------------ | ------------------------------------------------ | --------------------------------------------------------------- |
| **Stato**          | Read-only (immutabile)                           | Read-write (ha un layer scrivibile aggiuntivo)                 |
| **Natura**         | Template, blueprint, definizione                 | Istanza eseguibile di un'immagine, processo vivo                |
| **Ciclo di Vita**  | Costruita (build), archiviata (stored)           | Creato, avviato, fermato, messo in pausa, rimosso              |
| **Persistenza**    | Persistente finché non rimossa dal registro/locale | Effimero per design; le modifiche nel layer scrivibile vengono perse con `docker rm` a meno che non si usino i volumi. |
| **Contenuto**      | Codice, runtime, librerie, variabili d'ambiente  | Esegue l'applicazione definita nell'immagine, ha uno stato      |

## Cenni sul Networking dei Container

Per impostazione predefinita, ogni container Docker ha il proprio **stack di rete isolato**. Questo significa che un container non può "vedere" direttamente i processi o le porte di altri container o dell'host, a meno che non venga configurato diversamente.

Per permettere a un servizio in esecuzione all'interno di un container di essere accessibile dall'esterno (dall'host Docker o da altre macchine in rete), è necessario **esporre e mappare le porte**. Questo si fa con l'opzione `-p` (o `--publish`) del comando `docker run`:
`-p HOST_PORT:CONTAINER_PORT`

Ad esempio, `-p 8080:80` mappa la porta 8080 dell'host Docker alla porta 80 del container. Il traffico che arriva sull'host alla porta 8080 viene inoltrato al container sulla porta 80. (Il networking verrà trattato in dettaglio in un modulo successivo).

## Interazione Avanzata con i Container

*   **`docker attach ID_CONTAINER_O_NOME`**:
    Questo comando si collega (attacca) agli stream standard di input (stdin), output (stdout) e error (stderr) del processo principale (PID 1) in esecuzione all'interno del container. È utile se il container è stato avviato in modalità interattiva (`-i`) e si vuole interagire con esso, o per vedere l'output di un container avviato in modalità detached (`-d`) se il suo processo principale scrive su stdout/stderr.
    **Attenzione:** Se ci si attacca a un container e si usa `Ctrl-C`, questo invierà un segnale SIGINT al processo principale del container, che potrebbe terminarlo (e quindi fermare il container se non gestisce SIGINT). Per staccarsi senza fermare il container, si usa la sequenza di escape `Ctrl-P` seguita da `Ctrl-Q`.

*   **Differenza tra `attach` ed `exec`:**
    *   `docker attach`: Si collega al processo **principale** già in esecuzione nel container. Non avvia un nuovo processo.
    *   `docker exec`: Avvia un **nuovo processo** all'interno del namespace di un container esistente e già in esecuzione. Utile per debug, ispezione, o esecuzione di comandi ausiliari senza disturbare il processo principale.

## Conclusione

I container Docker sono le unità di esecuzione che danno vita alle applicazioni definite nelle immagini. La loro gestione attraverso il ciclo di vita, la comprensione dei comandi essenziali e la distinzione dalle immagini sono fondamentali per utilizzare Docker efficacemente. Mentre un container esegue ciò che è definito nell'immagine, il prossimo passo naturale è capire come definire queste immagini in modo personalizzato e riproducibile, ed è qui che entra in gioco il Dockerfile.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [⬅️ Immagini Docker](./Docker-Images.md)
- [➡️ Le Basi di Dockerfile](./Dockerfile-Basics.md)
