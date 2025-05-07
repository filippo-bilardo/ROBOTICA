# Servizi e Scaling in Docker Swarm

## Introduzione

In questo esempio pratico, esploreremo come deployare, gestire e scalare servizi in un cluster Docker Swarm. I servizi sono l'unità principale di lavoro in Swarm e rappresentano la definizione di un'attività che deve essere eseguita nel cluster.

## Obiettivi

- Creare e gestire servizi in Docker Swarm
- Comprendere i diversi tipi di servizi (replicated e global)
- Implementare strategie di scaling manuale e automatico
- Configurare vincoli di posizionamento per i servizi
- Gestire gli aggiornamenti dei servizi

## Prerequisiti

- Un cluster Docker Swarm funzionante (vedi [Esempio 1: Cluster Swarm Base](../01-ClusterSwarmBase/README.md))
- Conoscenza base dei comandi Docker e Swarm

## Concetti Chiave

### Servizi in Docker Swarm

Un servizio in Docker Swarm è una definizione dichiarativa dello stato desiderato per un'applicazione containerizzata. Include informazioni come:

- Quale immagine container utilizzare
- Quante repliche eseguire
- Quali porte esporre
- Quali reti utilizzare
- Come gestire gli aggiornamenti

### Tipi di Servizi

Docker Swarm supporta due tipi di servizi:

1. **Servizi Replicated**: Il servizio viene eseguito con un numero specifico di repliche distribuite tra i nodi disponibili
2. **Servizi Global**: Il servizio viene eseguito su ogni nodo del cluster (utile per agenti di monitoraggio, proxy, etc.)

## Passi

### 1. Creare un Servizio Replicated

```bash
# Creare un servizio web con 3 repliche
docker service create --name webserver \
  --replicas 3 \
  --publish 80:80 \
  nginx:latest
```

Questo comando crea un servizio chiamato "webserver" con 3 repliche del container nginx, pubblicando la porta 80.

### 2. Visualizzare i Servizi

```bash
# Elencare tutti i servizi
docker service ls

# Visualizzare i dettagli di un servizio
docker service inspect --pretty webserver

# Visualizzare i task (container) di un servizio
docker service ps webserver
```

### 3. Scalare un Servizio

```bash
# Scalare manualmente un servizio a 5 repliche
docker service scale webserver=5

# Scalare più servizi contemporaneamente
docker service scale webserver=3 database=2
```

### 4. Creare un Servizio Global

```bash
# Creare un servizio di monitoraggio che viene eseguito su ogni nodo
docker service create --name monitoring \
  --mode global \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  prom/node-exporter
```

### 5. Configurare Vincoli di Posizionamento

I vincoli di posizionamento permettono di controllare su quali nodi vengono eseguiti i container:

```bash
# Creare un servizio che viene eseguito solo su nodi manager
docker service create --name management \
  --constraint node.role==manager \
  --publish 8080:8080 \
  portainer/portainer

# Creare un servizio che viene eseguito su nodi con una specifica etichetta
docker service create --name frontend \
  --constraint node.labels.region==north \
  nginx:latest
```

### 6. Configurare Preferenze di Posizionamento

Le preferenze di posizionamento sono simili ai vincoli, ma non sono obbligatorie:

```bash
# Creare un servizio con preferenza di posizionamento
docker service create --name database \
  --placement-pref 'spread=node.labels.zone' \
  mysql:5.7
```

### 7. Aggiornare un Servizio

```bash
# Aggiornare l'immagine di un servizio
docker service update --image nginx:alpine webserver

# Aggiornare più parametri contemporaneamente
docker service update \
  --image nginx:alpine \
  --publish-add 443:443 \
  --replicas 7 \
  webserver
```

### 8. Configurare Aggiornamenti Rolling

Gli aggiornamenti rolling permettono di aggiornare un servizio senza downtime:

```bash
# Creare un servizio con configurazione di aggiornamento rolling
docker service create --name webapp \
  --replicas 5 \
  --update-delay 10s \
  --update-parallelism 2 \
  --update-failure-action rollback \
  nginx:latest

# Aggiornare un servizio esistente con configurazione di aggiornamento rolling
docker service update \
  --update-delay 30s \
  --update-parallelism 1 \
  --update-failure-action rollback \
  webapp
```

Parametri di aggiornamento:
- `--update-delay`: Tempo di attesa tra l'aggiornamento di gruppi di task
- `--update-parallelism`: Quanti task aggiornare contemporaneamente
- `--update-failure-action`: Cosa fare in caso di fallimento (continue, pause, rollback)
- `--update-monitor`: Tempo di monitoraggio per determinare se un aggiornamento è fallito
- `--update-order`: Ordine di aggiornamento (start-first o stop-first)

### 9. Rollback di un Servizio

```bash
# Eseguire il rollback di un servizio alla versione precedente
docker service update --rollback webapp
```

### 10. Rimuovere un Servizio

```bash
# Rimuovere un servizio
docker service rm webserver
```

## Esempio Pratico: Applicazione Multi-Servizio

Creiamo un'applicazione composta da un frontend web e un backend database:

```bash
# Creare una rete overlay per la comunicazione tra servizi
docker network create --driver overlay app-network

# Creare il servizio database
docker service create --name db \
  --network app-network \
  --env MYSQL_ROOT_PASSWORD=secret \
  --env MYSQL_DATABASE=myapp \
  --mount type=volume,source=db-data,target=/var/lib/mysql \
  --constraint node.labels.db==true \
  mysql:5.7

# Creare il servizio web frontend
docker service create --name web \
  --network app-network \
  --replicas 3 \
  --publish 80:80 \
  --env DATABASE_HOST=db \
  --env DATABASE_USER=root \
  --env DATABASE_PASSWORD=secret \
  --env DATABASE_NAME=myapp \
  myapp/web:latest
```

## Scaling Automatico (Avanzato)

Docker Swarm non include funzionalità native di auto-scaling, ma è possibile implementarlo utilizzando strumenti esterni come:

- Docker Flow Monitor con Prometheus
- Traefik con Prometheus e Alert Manager
- Script personalizzati che utilizzano l'API Docker

Un esempio semplice di script di auto-scaling potrebbe monitorare l'utilizzo delle risorse e scalare i servizi di conseguenza.

## Conclusione

In questo esempio, abbiamo esplorato come creare, gestire e scalare servizi in Docker Swarm. Abbiamo visto come configurare diversi tipi di servizi, implementare vincoli di posizionamento e gestire gli aggiornamenti rolling.

I servizi sono il cuore dell'orchestrazione in Docker Swarm, permettendo di definire in modo dichiarativo lo stato desiderato delle applicazioni e lasciando a Swarm il compito di mantenere questo stato.

Nel prossimo esempio, esploreremo come gestire reti e secrets in Docker Swarm per costruire applicazioni più complesse e sicure.

## Navigazione

- [⬅️ Esempio precedente: Cluster Swarm Base](../01-ClusterSwarmBase/README.md)
- [➡️ Prossimo esempio: Reti e Secrets](../03-RetiSecrets/README.md)
- [📑 Torna all'indice del modulo](../../README.md)