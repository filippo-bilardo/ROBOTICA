# Cluster Swarm Base

## Introduzione

In questo esempio pratico, impareremo a creare e gestire un cluster Docker Swarm di base. Docker Swarm è la soluzione di orchestrazione nativa di Docker che permette di gestire un gruppo di macchine Docker come un singolo sistema virtuale.

## Obiettivi

- Inizializzare un cluster Swarm
- Aggiungere nodi al cluster
- Gestire i nodi (promozione, degradazione, drenaggio)
- Ispezionare lo stato del cluster
- Comprendere la tolleranza ai guasti del cluster

## Prerequisiti

- Docker installato su tutte le macchine che parteciperanno al cluster
- Connettività di rete tra le macchine (porte TCP 2377, 7946 e UDP 7946, 4789 aperte)
- Conoscenza base dei comandi Docker

## Configurazione dell'Ambiente

Per questo esempio, utilizzeremo Docker in modalità Swarm su una singola macchina con più container che simulano nodi diversi. In un ambiente di produzione, utilizzeresti macchine fisiche o virtuali separate.

### Utilizzo di Docker Machine (opzionale)

Se desideri testare con macchine virtuali separate, puoi utilizzare Docker Machine:

```bash
# Creare macchine virtuali
docker-machine create -d virtualbox manager1
docker-machine create -d virtualbox worker1
docker-machine create -d virtualbox worker2

# Connettere al manager
docker-machine ssh manager1
```

## Passi

### 1. Inizializzare il Cluster Swarm

Sul nodo che diventerà il manager principale:

```bash
# Inizializzare Swarm specificando l'indirizzo IP del manager
docker swarm init --advertise-addr <IP-MANAGER>
```

Questo comando inizializza un nuovo cluster Swarm e configura il nodo corrente come manager. L'output includerà un comando `docker swarm join` con un token che può essere utilizzato per aggiungere worker al cluster.

### 2. Aggiungere Worker al Cluster

Sui nodi che diventeranno worker:

```bash
# Unirsi al cluster come worker usando il token fornito dal comando init
docker swarm join --token <TOKEN> <IP-MANAGER>:2377
```

Se hai perso il token, puoi generarlo nuovamente sul manager:

```bash
# Generare token per worker
docker swarm join-token worker

# Generare token per manager aggiuntivi
docker swarm join-token manager
```

### 3. Visualizzare i Nodi nel Cluster

Sul manager:

```bash
# Elencare tutti i nodi nel cluster
docker node ls
```

Questo comando mostra tutti i nodi nel cluster, il loro ruolo (manager o worker), lo stato e la disponibilità.

### 4. Gestire i Ruoli dei Nodi

```bash
# Promuovere un worker a manager
docker node promote <NODE-ID>

# Degradare un manager a worker
docker node demote <NODE-ID>
```

### 5. Gestire la Disponibilità dei Nodi

```bash
# Mettere un nodo in modalità di drenaggio (drain)
# I container esistenti verranno spostati su altri nodi e nessun nuovo container verrà schedulato
docker node update --availability drain <NODE-ID>

# Rendere un nodo nuovamente attivo
docker node update --availability active <NODE-ID>

# Mettere un nodo in pausa (nessun nuovo container verrà schedulato)
docker node update --availability pause <NODE-ID>
```

### 6. Ispezionare un Nodo

```bash
# Visualizzare informazioni dettagliate su un nodo
docker node inspect <NODE-ID>

# Visualizzare informazioni in formato più leggibile
docker node inspect --pretty <NODE-ID>
```

### 7. Aggiungere Etichette ai Nodi

Le etichette possono essere utilizzate per controllare dove vengono eseguiti i servizi:

```bash
# Aggiungere un'etichetta a un nodo
docker node update --label-add region=north <NODE-ID>
```

### 8. Lasciare il Cluster

Su un nodo worker che vuoi rimuovere dal cluster:

```bash
# Lasciare il cluster
docker swarm leave
```

Su un nodo manager:

```bash
# Lasciare il cluster forzatamente (solo se è l'ultimo manager)
docker swarm leave --force
```

### 9. Rimuovere un Nodo dal Cluster

Sul manager, dopo che un nodo ha lasciato il cluster:

```bash
# Rimuovere un nodo dal cluster
docker node rm <NODE-ID>
```

## Tolleranza ai Guasti

Docker Swarm utilizza l'algoritmo Raft per il consenso distribuito tra i manager. Per garantire la tolleranza ai guasti, è consigliabile avere un numero dispari di manager:

- 1 manager: nessuna tolleranza ai guasti
- 3 manager: tolleranza a 1 guasto
- 5 manager: tolleranza a 2 guasti
- 7 manager: tolleranza a 3 guasti

La formula è `(N-1)/2`, dove N è il numero di manager. Non è consigliabile avere più di 7 manager a causa dell'overhead di comunicazione.

## Conclusione

In questo esempio, abbiamo imparato a creare e gestire un cluster Docker Swarm di base. Abbiamo visto come inizializzare un cluster, aggiungere nodi, gestire i ruoli e la disponibilità dei nodi, e comprendere la tolleranza ai guasti.

Nel prossimo esempio, esploreremo come deployare e scalare servizi all'interno del nostro cluster Swarm.

## Navigazione

- [⬅️ Torna all'indice del modulo](../../README.md)
- [➡️ Prossimo esempio: Servizi e Scaling](../02-ServiziScaling/README.md)