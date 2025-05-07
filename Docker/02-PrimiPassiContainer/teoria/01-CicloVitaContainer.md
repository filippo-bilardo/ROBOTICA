# Ciclo di vita dei container Docker

Comprendere il ciclo di vita dei container Docker è fondamentale per gestirli in modo efficace. In questo articolo, esploreremo i vari stati in cui può trovarsi un container e come passare da uno stato all'altro.

## Stati di un container Docker

Un container Docker può trovarsi in uno dei seguenti stati:

### 1. Creato (Created)

Quando un container viene creato ma non ancora avviato, si trova nello stato "Created". In questo stato, il container esiste nel sistema ma non è in esecuzione.

```bash
docker create nginx
```

Il comando sopra crea un container basato sull'immagine nginx, ma non lo avvia.

### 2. In esecuzione (Running)

Un container in esecuzione è attivo e sta eseguendo il processo specificato come entrypoint o comando.

```bash
docker run nginx
# oppure
docker start <container_id>
```

### 3. In pausa (Paused)

Un container può essere messo in pausa, sospendendo temporaneamente tutti i processi al suo interno.

```bash
docker pause <container_id>
```

### 4. Fermato (Stopped)

Un container fermato ha completato l'esecuzione del suo processo principale o è stato fermato manualmente. Il container non è più in esecuzione, ma il suo stato e file system sono ancora disponibili.

```bash
docker stop <container_id>
```

### 5. Rimosso (Removed)

Un container rimosso è stato completamente eliminato dal sistema. Il suo file system e metadati non sono più disponibili.

```bash
docker rm <container_id>
```

## Transizioni tra stati

Il seguente diagramma illustra le possibili transizioni tra i vari stati di un container:

```
Created ──────► Running ──────► Stopped
    │               │               │
    │               ▼               │
    │            Paused             │
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
                 Removed
```

## Comandi per gestire il ciclo di vita

### Creazione di un container

```bash
# Crea un container senza avviarlo
docker create [opzioni] <immagine>

# Crea e avvia un container
docker run [opzioni] <immagine>
```

### Gestione di container esistenti

```bash
# Avvia un container fermato
docker start <container_id>

# Ferma un container in esecuzione
docker stop <container_id>

# Riavvia un container
docker restart <container_id>

# Mette in pausa un container
docker pause <container_id>

# Riprende l'esecuzione di un container in pausa
docker unpause <container_id>

# Rimuove un container
docker rm <container_id>
```

## Visualizzazione dello stato dei container

Per visualizzare lo stato di tutti i container sul sistema:

```bash
# Mostra solo i container in esecuzione
docker ps

# Mostra tutti i container (in esecuzione, fermati, ecc.)
docker ps -a
```

## Timeout e segnali

Quando si ferma un container, Docker invia inizialmente un segnale SIGTERM al processo principale, dando al container la possibilità di terminare in modo pulito. Se il container non si ferma entro un timeout predefinito (10 secondi di default), Docker invia un segnale SIGKILL per forzare la terminazione.

```bash
# Ferma un container con un timeout personalizzato (es. 20 secondi)
docker stop --time=20 <container_id>

# Ferma immediatamente un container (equivalente a SIGKILL)
docker kill <container_id>
```

## Container effimeri vs persistenti

### Container effimeri

I container effimeri sono progettati per essere temporanei. Vengono creati, eseguono un compito specifico e poi vengono rimossi. Questo approccio è comune nei pipeline CI/CD e in ambienti serverless.

```bash
# Esegue un container e lo rimuove automaticamente dopo l'esecuzione
docker run --rm alpine echo "Hello, World!"
```

### Container persistenti

I container persistenti sono progettati per rimanere in esecuzione per lunghi periodi, come server web o database. Questi container vengono generalmente riavviati automaticamente in caso di errori o riavvio del sistema.

```bash
# Esegue un container che si riavvia automaticamente in caso di errore
docker run --restart=unless-stopped nginx
```

## Best practice

1. **Usa l'opzione `--rm` per container temporanei**: Questo aiuta a mantenere pulito il sistema rimuovendo automaticamente i container dopo l'uso.

2. **Imposta politiche di riavvio appropriate**: Per servizi che devono rimanere attivi, usa `--restart=always` o `--restart=unless-stopped`.

3. **Gestisci correttamente i segnali**: Assicurati che la tua applicazione gestisca correttamente i segnali SIGTERM per permettere uno shutdown pulito.

4. **Monitora lo stato dei container**: Usa strumenti come `docker ps` o soluzioni di monitoraggio più avanzate per tenere traccia dello stato dei tuoi container.

## Conclusione

Comprendere il ciclo di vita dei container Docker è essenziale per gestirli in modo efficace. Conoscere i vari stati e come passare da uno all'altro ti permette di controllare meglio il comportamento dei tuoi container e di risolvere eventuali problemi.

Nel prossimo articolo, esploreremo in dettaglio come eseguire container in diverse modalità e con varie opzioni.

## Navigazione del Corso
- [📑 Indice](../../README.md)
- [📑 Indice Modulo](../README.md)
- [➡️ Esecuzione dei container](./02-EsecuzioneContainer.md)