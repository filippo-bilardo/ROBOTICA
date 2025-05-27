# Gestione dei Container Docker

## Introduzione

La gestione efficace dei container è fondamentale per mantenere un ambiente Docker pulito e organizzato. In questo capitolo esploreremo tutte le operazioni di gestione del ciclo di vita dei container.

## Stati del Container

Un container Docker può trovarsi in diversi stati durante il suo ciclo di vita:

### Stati Principali
- **Created**: Container creato ma non avviato
- **Running**: Container in esecuzione
- **Paused**: Container in pausa (processo sospeso)
- **Stopped**: Container fermato (processo terminato)
- **Deleted**: Container rimosso dal sistema

### Visualizzare lo Stato
```bash
# Visualizza container in esecuzione
docker ps

# Visualizza tutti i container (inclusi quelli fermati)
docker ps -a

# Visualizza solo gli ID dei container
docker ps -q

# Visualizza container con filtri
docker ps --filter status=running
docker ps --filter name=web
```

## Operazioni di Base

### Avviare Container

#### Nuovo Container
```bash
# Crea e avvia un nuovo container
docker run nginx

# Con parametri specifici
docker run -d --name web-server -p 8080:80 nginx
```

#### Container Esistente
```bash
# Avvia un container fermato
docker start container-name

# Avvia e collega al terminale
docker start -a container-name

# Avvia in modalità interattiva
docker start -ai container-name
```

### Fermare Container

#### Stop Graduale
```bash
# Invia SIGTERM e attende shutdown graceful
docker stop container-name

# Con timeout personalizzato (default 10s)
docker stop -t 30 container-name

# Ferma tutti i container running
docker stop $(docker ps -q)
```

#### Stop Forzato
```bash
# Invia SIGKILL (terminazione immediata)
docker kill container-name

# Kill con segnale specifico
docker kill -s SIGUSR1 container-name
```

### Riavviare Container
```bash
# Riavvia container
docker restart container-name

# Con timeout personalizzato
docker restart -t 30 container-name

# Riavvia tutti i container
docker restart $(docker ps -aq)
```

### Pausa e Ripresa
```bash
# Pausa un container (sospende tutti i processi)
docker pause container-name

# Riprende un container in pausa
docker unpause container-name
```

## Rimozione Container

### Rimozione Singola
```bash
# Rimuovi container fermato
docker rm container-name

# Forza rimozione di container running
docker rm -f container-name

# Rimuovi container e volumi associati
docker rm -v container-name
```

### Rimozione Multipla
```bash
# Rimuovi tutti i container fermati
docker container prune

# Rimuovi tutti i container (fermati e running)
docker rm -f $(docker ps -aq)

# Rimuovi container con filtro
docker rm $(docker ps -q --filter status=exited)
```

### Auto-rimozione
```bash
# Container che si auto-rimuove alla fine
docker run --rm -it ubuntu bash
```

## Monitoraggio Container

### Informazioni Dettagliate
```bash
# Informazioni complete del container
docker inspect container-name

# Estrai informazioni specifiche
docker inspect --format='{{.State.Status}}' container-name
docker inspect --format='{{.NetworkSettings.IPAddress}}' container-name
```

### Utilizzo Risorse
```bash
# Statistiche in tempo reale
docker stats

# Statistiche specifiche
docker stats container-name

# Una volta sola (non continuo)
docker stats --no-stream
```

### Processi in Esecuzione
```bash
# Lista processi nel container
docker top container-name

# Con formato personalizzato
docker top container-name aux
```

## Interazione con Container Running

### Eseguire Comandi
```bash
# Esegui comando in container running
docker exec container-name ls -la

# Sessione interattiva
docker exec -it container-name bash

# Come utente specifico
docker exec -u root -it container-name bash

# Con variabili d'ambiente
docker exec -e VAR=value container-name printenv
```

### Copiare File
```bash
# Da host a container
docker cp /host/file.txt container-name:/container/path/

# Da container a host
docker cp container-name:/container/file.txt /host/path/

# Copia directory
docker cp /host/dir container-name:/container/
```

## Gestione Avanzata

### Rename Container
```bash
# Rinomina container
docker rename old-name new-name
```

### Update Container
```bash
# Aggiorna configurazione runtime
docker update --memory=1g container-name

# Aggiorna policy di restart
docker update --restart=always container-name

# Aggiorna limiti CPU
docker update --cpus="2.0" container-name
```

### Commit Changes
```bash
# Crea immagine da container modificato
docker commit container-name new-image:tag

# Con messaggio e autore
docker commit -m "Added nginx config" -a "author" container-name new-image:tag
```

## Best Practices di Gestione

### 1. Denominazione Consistente
```bash
# ✅ Usa nomi descrittivi
docker run --name web-frontend-prod nginx
docker run --name db-postgres-dev postgres
```

### 2. Pulizia Regolare
```bash
# Script di pulizia settimanale
#!/bin/bash
# Rimuovi container fermati
docker container prune -f

# Rimuovi immagini inutilizzate
docker image prune -f

# Rimuovi volumi non utilizzati
docker volume prune -f
```

### 3. Monitoraggio Proattivo
```bash
# Script di monitoraggio
#!/bin/bash
# Controlla container non sani
docker ps --filter health=unhealthy

# Controlla container con restart frequenti
docker ps --filter status=restarting
```

### 4. Backup Prima di Modifiche
```bash
# Backup container prima di modifiche
docker commit my-container backup-$(date +%Y%m%d)
```

### 5. Gestione Graceful Shutdown
```bash
# Implementa signal handling nel container
# Usa stop invece di kill per shutdown pulito
docker stop --time=30 my-app
```

## Troubleshooting Comune

### Container Non Si Avvia
```bash
# Controlla logs
docker logs container-name

# Controlla configurazione
docker inspect container-name

# Verifica risorse disponibili
docker system df
```

### Container Si Ferma Inaspettatamente
```bash
# Controlla exit code
docker ps -a --format "table {{.Names}}\t{{.Status}}"

# Analizza logs con timestamp
docker logs -t container-name

# Verifica limiti di risorse
docker stats --no-stream
```

### Problemi di Performance
```bash
# Monitora utilizzo risorse
docker stats

# Controlla processi nel container
docker top container-name

# Verifica configurazione sistema
docker system info
```

## Script di Automazione

### Script di Gestione Container
```bash
#!/bin/bash
# container-manager.sh

ACTION=$1
CONTAINER=$2

case $ACTION in
  "start")
    docker start $CONTAINER && echo "Container $CONTAINER started"
    ;;
  "stop")
    docker stop $CONTAINER && echo "Container $CONTAINER stopped"
    ;;
  "restart")
    docker restart $CONTAINER && echo "Container $CONTAINER restarted"
    ;;
  "status")
    docker ps --filter name=$CONTAINER --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    ;;
  "logs")
    docker logs -f $CONTAINER
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs} container-name"
    ;;
esac
```

### Script di Health Check
```bash
#!/bin/bash
# health-check.sh

CONTAINERS=$(docker ps --format "{{.Names}}")

for container in $CONTAINERS; do
  health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null)
  status=$(docker inspect --format='{{.State.Status}}' $container)
  
  echo "Container: $container"
  echo "  Status: $status"
  echo "  Health: ${health:-"N/A"}"
  echo "---"
done
```

## Conclusioni

La gestione efficace dei container è essenziale per mantenere un ambiente Docker stabile e performante. L'automazione delle operazioni comuni attraverso script e la pulizia regolare delle risorse aiutano a prevenire problemi e ottimizzare l'utilizzo delle risorse.

Nel prossimo capitolo esploreremo come interagire in modo più avanzato con i container running, incluso l'utilizzo di networking e volumi per comunicazione e persistenza dati.
