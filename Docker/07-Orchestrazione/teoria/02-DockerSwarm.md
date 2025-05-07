# Docker Swarm

## Introduzione a Docker Swarm

Docker Swarm è la soluzione di orchestrazione nativa integrata direttamente nel Docker Engine. Fornisce funzionalità per gestire un cluster di nodi Docker, permettendo di distribuire e scalare applicazioni containerizzate su più macchine fisiche o virtuali.

Una delle principali caratteristiche di Docker Swarm è la sua semplicità: utilizza la stessa interfaccia a riga di comando di Docker, rendendo la curva di apprendimento molto più dolce per chi ha già familiarità con Docker.

## Architettura di Docker Swarm

Un cluster Swarm è composto da due tipi di nodi:

### Nodi Manager

I nodi Manager sono responsabili della gestione del cluster e delle decisioni di orchestrazione:

- **Gestione dello stato del cluster**: Mantengono lo stato desiderato del cluster
- **Scheduling dei servizi**: Assegnano i container ai nodi worker
- **API Swarm**: Espongono l'API per interagire con il cluster
- **Raft Consensus**: Utilizzano l'algoritmo Raft per mantenere lo stato distribuito e garantire l'alta disponibilità

È consigliabile avere un numero dispari di manager (3, 5, 7) per garantire la tolleranza ai guasti. Un cluster può tollerare la perdita di `(N-1)/2` manager, dove N è il numero totale di manager.

### Nodi Worker

I nodi Worker eseguono i container assegnati dai manager:

- **Esecuzione dei task**: Eseguono i container assegnati dal manager
- **Reporting**: Riportano lo stato dei container ai manager

Un nodo può essere sia manager che worker contemporaneamente, anche se in cluster di grandi dimensioni è consigliabile separare i ruoli.

## Concetti Fondamentali

### Servizi

In Docker Swarm, un servizio è la definizione di un'attività da eseguire nel cluster. Specifica quale immagine container utilizzare, quante repliche eseguire, le porte da esporre, le reti da utilizzare e altre configurazioni.

Esistono due tipi di servizi:

1. **Servizi Replicated**: Il servizio viene eseguito su un numero specifico di nodi worker (il più comune)
2. **Servizi Global**: Il servizio viene eseguito su tutti i nodi disponibili nel cluster

### Task

Un task è l'unità di scheduling in Swarm, rappresenta un singolo container. Quando si crea un servizio con 3 repliche, Swarm crea 3 task, ognuno dei quali esegue un container.

### Stack

Uno stack è un gruppo di servizi correlati che condividono dipendenze e possono essere scalati, aggiornati e gestiti insieme. Gli stack in Docker Swarm sono definiti utilizzando file Docker Compose, rendendo semplice il passaggio da un ambiente di sviluppo a un ambiente di produzione orchestrato.

## Funzionalità Principali

### Service Discovery

Docker Swarm include un sistema di service discovery integrato che permette ai container di trovare e comunicare con altri servizi utilizzando i nomi dei servizi. Questo è implementato attraverso un DNS interno che risolve i nomi dei servizi agli indirizzi IP dei container.

### Load Balancing

Swarm fornisce due tipi di load balancing:

1. **Load balancing interno**: Distribuisce le richieste tra i container di un servizio all'interno della rete overlay
2. **Ingress load balancing**: Distribuisce il traffico esterno ai servizi pubblicati su porte specifiche

### Reti Overlay

Le reti overlay permettono la comunicazione sicura tra container distribuiti su diversi nodi fisici. Swarm crea automaticamente una rete overlay chiamata `ingress` per gestire il traffico in entrata verso i servizi pubblicati.

### Secrets Management

Docker Swarm include un sistema per gestire informazioni sensibili come password, token OAuth, chiavi SSH o qualsiasi altro dato che non dovrebbe essere memorizzato in chiaro. I secrets vengono memorizzati nel database Raft dei manager e vengono distribuiti solo ai container che ne hanno bisogno.

### Aggiornamenti Rolling

Swarm supporta gli aggiornamenti rolling, permettendo di aggiornare i servizi senza downtime. Durante un aggiornamento, Swarm sostituisce gradualmente i container con la nuova versione, monitorando lo stato di salute e tornando alla versione precedente in caso di problemi.

## Comandi Base di Docker Swarm

### Inizializzazione e Gestione del Cluster

```bash
# Inizializzare un nuovo cluster Swarm
docker swarm init --advertise-addr <IP-MANAGER>

# Generare token per aggiungere worker
docker swarm join-token worker

# Generare token per aggiungere manager
docker swarm join-token manager

# Unirsi a un cluster come worker
docker swarm join --token <TOKEN> <IP-MANAGER>:2377

# Visualizzare i nodi nel cluster
docker node ls

# Promuovere un worker a manager
docker node promote <NODE-ID>

# Degradare un manager a worker
docker node demote <NODE-ID>
```

### Gestione dei Servizi

```bash
# Creare un servizio
docker service create --name <SERVICE-NAME> --replicas <NUM> <IMAGE>

# Elencare i servizi
docker service ls

# Visualizzare dettagli di un servizio
docker service inspect <SERVICE-NAME>

# Visualizzare i task di un servizio
docker service ps <SERVICE-NAME>

# Scalare un servizio
docker service scale <SERVICE-NAME>=<NUM>

# Aggiornare un servizio
docker service update --image <NEW-IMAGE> <SERVICE-NAME>

# Rimuovere un servizio
docker service rm <SERVICE-NAME>
```

### Gestione degli Stack

```bash
# Deployare uno stack da un file compose
docker stack deploy -c <COMPOSE-FILE> <STACK-NAME>

# Elencare gli stack
docker stack ls

# Elencare i servizi in uno stack
docker stack services <STACK-NAME>

# Rimuovere uno stack
docker stack rm <STACK-NAME>
```

## Vantaggi di Docker Swarm

1. **Semplicità**: Facile da configurare e utilizzare, specialmente per chi ha già familiarità con Docker
2. **Integrazione nativa**: Parte del Docker Engine, non richiede installazioni aggiuntive
3. **Interfaccia familiare**: Utilizza la stessa CLI di Docker
4. **Curva di apprendimento ridotta**: Più semplice da imparare rispetto ad altre soluzioni come Kubernetes
5. **Sicurezza integrata**: TLS automatico per la comunicazione tra nodi, rotazione dei certificati, etc.

## Limitazioni di Docker Swarm

1. **Funzionalità limitate**: Meno funzionalità avanzate rispetto a Kubernetes
2. **Ecosistema più piccolo**: Meno strumenti e integrazioni di terze parti
3. **Scalabilità**: Può gestire centinaia di nodi, ma potrebbe avere difficoltà con migliaia di nodi
4. **Gestione delle risorse**: Opzioni limitate per la gestione dettagliata delle risorse

## Casi d'Uso Ideali

Docker Swarm è particolarmente adatto per:

1. **Piccoli e medi cluster**: Team con risorse limitate o applicazioni di media complessità
2. **Ambienti di sviluppo e test**: Dove la semplicità è più importante delle funzionalità avanzate
3. **Transizione da Docker Compose**: Passaggio graduale da ambienti di sviluppo a produzione
4. **Team con esperienza Docker**: Organizzazioni che hanno già competenze Docker ma sono nuove all'orchestrazione

## Conclusione

Docker Swarm rappresenta un'ottima soluzione di orchestrazione per chi cerca un approccio semplice ma potente alla gestione di cluster Docker. La sua integrazione nativa con l'ecosistema Docker e la familiare interfaccia a riga di comando lo rendono una scelta eccellente per iniziare con l'orchestrazione di container.

Nel prossimo capitolo, esploreremo i concetti base di Kubernetes, la piattaforma di orchestrazione più diffusa e potente, per comprendere le differenze e i casi d'uso più adatti a ciascuna soluzione.

## Navigazione

- [⬅️ Precedente: Introduzione all'Orchestrazione](./01-IntroduzioneOrchestrazione.md)
- [➡️ Prossimo: Introduzione a Kubernetes](./03-IntroduzioneKubernetes.md)
- [📑 Torna all'indice del modulo](../README.md)