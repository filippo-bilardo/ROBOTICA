# Aggiornamenti Rolling in Docker Swarm

## Introduzione

In questo esempio pratico, esploreremo come implementare aggiornamenti rolling in Docker Swarm. Gli aggiornamenti rolling permettono di aggiornare i servizi in un cluster senza causare downtime, sostituendo gradualmente i container con versioni più recenti mentre si mantiene l'applicazione disponibile.

## Obiettivi

- Comprendere il concetto di aggiornamento rolling
- Configurare strategie di aggiornamento per i servizi
- Implementare aggiornamenti graduali di applicazioni
- Gestire fallimenti durante gli aggiornamenti
- Eseguire rollback in caso di problemi

## Prerequisiti

- Un cluster Docker Swarm funzionante (vedi [Esempio 1: Cluster Swarm Base](../01-ClusterSwarmBase/README.md))
- Conoscenza dei servizi in Docker Swarm (vedi [Esempio 2: Servizi e Scaling](../02-ServiziScaling/README.md))

## Concetti Chiave

### Aggiornamento Rolling

Un aggiornamento rolling è una strategia di deployment che aggiorna gradualmente le istanze di un'applicazione con una nuova versione. In Docker Swarm, questo significa sostituire i container di un servizio uno alla volta (o in piccoli gruppi) con container basati su una nuova immagine o configurazione.

I vantaggi principali degli aggiornamenti rolling sono:

1. **Zero downtime**: L'applicazione rimane disponibile durante l'aggiornamento
2. **Rischio ridotto**: I problemi vengono rilevati prima che tutti i container siano aggiornati
3. **Possibilità di rollback**: È possibile tornare alla versione precedente in caso di problemi

### Parametri di Aggiornamento

Docker Swarm offre diversi parametri per configurare gli aggiornamenti rolling:

- **Parallelism**: Quanti container aggiornare contemporaneamente
- **Delay**: Tempo di attesa tra l'aggiornamento di gruppi di container
- **Failure action**: Cosa fare in caso di fallimento (continue, pause, rollback)
- **Monitor**: Periodo di monitoraggio per determinare se un aggiornamento è fallito
- **Order**: Ordine di aggiornamento (start-first o stop-first)

## Passi

### 1. Creare un Servizio con Configurazione di Aggiornamento

```bash
# Creare un servizio web con configurazione di aggiornamento
docker service create --name webapp \
  --replicas 4 \
  --publish 80:80 \
  --update-parallelism 1 \
  --update-delay 30s \
  --update-failure-action rollback \
  --update-monitor 15s \
  --update-order start-first \
  nginx:1.19
```

Questo comando crea un servizio con 4 repliche di nginx versione 1.19, configurato per aggiornamenti rolling con le seguenti caratteristiche:

- Aggiorna 1 container alla volta (`--update-parallelism 1`)
- Attende 30 secondi tra gli aggiornamenti (`--update-delay 30s`)
- Esegue il rollback automatico in caso di fallimento (`--update-failure-action rollback`)
- Monitora ogni container aggiornato per 15 secondi (`--update-monitor 15s`)
- Avvia il nuovo container prima di fermare quello vecchio (`--update-order start-first`)

### 2. Visualizzare la Configurazione di Aggiornamento

```bash
# Visualizzare i dettagli del servizio, inclusa la configurazione di aggiornamento
docker service inspect --pretty webapp
```

### 3. Eseguire un Aggiornamento Rolling

```bash
# Aggiornare il servizio a una nuova versione dell'immagine
docker service update --image nginx:1.20 webapp
```

Questo comando avvia un aggiornamento rolling del servizio, sostituendo gradualmente i container basati su nginx:1.19 con container basati su nginx:1.20, seguendo la configurazione di aggiornamento specificata.

### 4. Monitorare l'Aggiornamento

```bash
# Visualizzare lo stato dell'aggiornamento
docker service ps webapp
```

L'output mostrerà i container in esecuzione, quelli in fase di aggiornamento e quelli già aggiornati.

### 5. Modificare la Configurazione di Aggiornamento

```bash
# Modificare la configurazione di aggiornamento di un servizio esistente
docker service update \
  --update-parallelism 2 \
  --update-delay 15s \
  webapp
```

Questo comando modifica la configurazione di aggiornamento del servizio, aumentando il parallelismo a 2 container e riducendo il delay a 15 secondi.

### 6. Eseguire un Rollback

```bash
# Eseguire il rollback di un servizio alla versione precedente
docker service update --rollback webapp
```

Questo comando esegue il rollback del servizio alla versione precedente, seguendo la stessa configurazione di aggiornamento ma in ordine inverso.

### 7. Aggiornare Altri Parametri del Servizio

Gli aggiornamenti rolling non si limitano solo all'immagine, ma possono includere qualsiasi parametro del servizio:

```bash
# Aggiornare più parametri contemporaneamente
docker service update \
  --image nginx:1.20 \
  --publish-add 443:443 \
  --env-add NGINX_HOST=example.com \
  --replicas 6 \
  webapp
```

## Strategie di Aggiornamento

### Start-First vs Stop-First

Docker Swarm supporta due strategie di aggiornamento:

1. **Start-First (default)**: Avvia il nuovo container prima di fermare quello vecchio
   - Vantaggi: Zero downtime, sempre la capacità completa
   - Svantaggi: Richiede più risorse durante l'aggiornamento

2. **Stop-First**: Ferma il container vecchio prima di avviare quello nuovo
   - Vantaggi: Utilizza meno risorse durante l'aggiornamento
   - Svantaggi: Capacità ridotta durante l'aggiornamento

```bash
# Configurare un servizio con strategia stop-first
docker service create --name api \
  --replicas 3 \
  --update-order stop-first \
  myapp/api:1.0
```

### Health Check per Aggiornamenti Sicuri

Per garantire che i nuovi container siano sani prima di procedere con l'aggiornamento, è consigliabile configurare health check:

```bash
# Creare un servizio con health check
docker service create --name webapp \
  --replicas 4 \
  --health-cmd "curl -f http://localhost/ || exit 1" \
  --health-interval 5s \
  --health-retries 3 \
  --health-timeout 2s \
  --update-failure-action rollback \
  nginx:latest
```

Con questa configurazione, Docker Swarm considererà un container sano solo se il comando di health check ha successo, e procederà con l'aggiornamento solo se i nuovi container sono sani.

## Esempio Pratico: Aggiornamento di un'Applicazione Multi-Servizio

Creiamo un'applicazione composta da un frontend e un backend, e implementiamo una strategia di aggiornamento coordinata:

```bash
# Creare una rete per la comunicazione tra servizi
docker network create --driver overlay app-network

# Creare il servizio backend
docker service create --name backend \
  --network app-network \
  --replicas 3 \
  --update-parallelism 1 \
  --update-delay 30s \
  --update-failure-action rollback \
  myapp/backend:1.0

# Creare il servizio frontend
docker service create --name frontend \
  --network app-network \
  --replicas 5 \
  --publish 80:80 \
  --update-parallelism 2 \
  --update-delay 15s \
  --update-failure-action rollback \
  --env BACKEND_URL=http://backend:8080 \
  myapp/frontend:1.0
```

Per aggiornare l'applicazione, seguiamo una strategia "backend-first":

```bash
# 1. Aggiornare prima il backend
docker service update --image myapp/backend:1.1 backend

# 2. Attendere che l'aggiornamento del backend sia completato
docker service ps backend

# 3. Aggiornare il frontend
docker service update --image myapp/frontend:1.1 frontend
```

Questa strategia garantisce che il backend sia completamente aggiornato prima di aggiornare il frontend, evitando problemi di compatibilità.

## Best Practice per gli Aggiornamenti Rolling

1. **Immagini immutabili**: Utilizzare tag specifici per le versioni invece di `latest`
2. **Health check**: Configurare health check appropriati per verificare che i nuovi container funzionino correttamente
3. **Parallelismo conservativo**: Iniziare con un parallelismo basso (1 o 2) per ridurre il rischio
4. **Monitoraggio**: Monitorare attentamente le metriche durante gli aggiornamenti
5. **Compatibilità API**: Assicurarsi che le nuove versioni siano compatibili con le vecchie
6. **Strategia di rollback**: Avere sempre un piano di rollback in caso di problemi
7. **Test preliminari**: Testare gli aggiornamenti in ambienti di staging prima della produzione

## Conclusione

In questo esempio, abbiamo esplorato come implementare aggiornamenti rolling in Docker Swarm. Gli aggiornamenti rolling sono fondamentali per mantenere le applicazioni disponibili durante gli aggiornamenti, riducendo il rischio e permettendo di tornare rapidamente a versioni precedenti in caso di problemi.

La configurazione appropriata degli aggiornamenti rolling, combinata con health check e una strategia di aggiornamento ben pianificata, permette di implementare un processo di continuous delivery sicuro ed efficiente.

## Navigazione

- [⬅️ Esempio precedente: Reti e Secrets](../03-RetiSecrets/README.md)
- [📑 Torna all'indice del modulo](../../README.md)