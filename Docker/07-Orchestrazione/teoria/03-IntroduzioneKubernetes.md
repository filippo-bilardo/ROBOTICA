# Introduzione a Kubernetes

## Cos'è Kubernetes

Kubernetes (spesso abbreviato come K8s) è una piattaforma open source per l'orchestrazione di container, originariamente sviluppata da Google e ora mantenuta dalla Cloud Native Computing Foundation (CNCF). Kubernetes automatizza il deployment, il scaling e la gestione di applicazioni containerizzate, fornendo un framework per eseguire sistemi distribuiti in modo resiliente.

A differenza di Docker Swarm, che è focalizzato sulla semplicità e sull'integrazione con Docker, Kubernetes è progettato per essere una piattaforma completa e altamente estensibile, capace di gestire deployment complessi su larga scala.

## Architettura di Kubernetes

L'architettura di Kubernetes è composta da diversi componenti che lavorano insieme per fornire un sistema di orchestrazione robusto:

### Control Plane (Master)

Il Control Plane è responsabile della gestione globale del cluster e delle decisioni di orchestrazione:

- **kube-apiserver**: Espone l'API Kubernetes, il punto di ingresso per tutti i comandi
- **etcd**: Database distribuito che memorizza lo stato del cluster
- **kube-scheduler**: Assegna i pod ai nodi in base alle risorse disponibili e ai vincoli
- **kube-controller-manager**: Esegue i controller che regolano lo stato del cluster
- **cloud-controller-manager**: Integra con i provider cloud (se applicabile)

### Nodi (Worker)

I nodi sono le macchine (fisiche o virtuali) che eseguono le applicazioni containerizzate:

- **kubelet**: Agente che assicura che i container siano in esecuzione in un pod
- **kube-proxy**: Gestisce le regole di rete per i servizi
- **Container Runtime**: Software che esegue i container (Docker, containerd, CRI-O, etc.)

## Concetti Fondamentali

### Pod

Il pod è l'unità di base in Kubernetes, rappresenta uno o più container che condividono storage e rete. I container in un pod sono sempre co-localizzati e co-schedulati, e condividono lo stesso ciclo di vita.

### Deployment

Un Deployment è una risorsa che gestisce il ciclo di vita dei pod e dei ReplicaSet, fornendo aggiornamenti dichiarativi per i pod. I Deployment sono utilizzati per:

- Creare nuovi ReplicaSet
- Dichiarare lo stato desiderato dell'applicazione
- Aggiornare i pod con nuove versioni
- Rollback a versioni precedenti

### Service

Un Service è un'astrazione che definisce un insieme logico di pod e una politica per accedervi. I Service permettono la comunicazione tra diverse parti dell'applicazione, fornendo un nome DNS stabile e un indirizzo IP per un gruppo di pod.

Tipi principali di Service:

- **ClusterIP**: Espone il servizio su un IP interno al cluster
- **NodePort**: Espone il servizio su una porta specifica su ogni nodo
- **LoadBalancer**: Espone il servizio utilizzando un load balancer esterno
- **ExternalName**: Mappa il servizio a un nome DNS esterno

### Namespace

I Namespace forniscono un meccanismo per isolare gruppi di risorse all'interno di un singolo cluster. Sono utili in ambienti con molti utenti distribuiti su più team o progetti.

### ConfigMap e Secret

- **ConfigMap**: Memorizza dati di configurazione non sensibili
- **Secret**: Memorizza dati sensibili come password, token e chiavi

### Volume

I Volume permettono ai container di accedere a storage persistente o condiviso, superando la natura effimera dei container.

### Ingress

L'Ingress gestisce l'accesso esterno ai servizi nel cluster, tipicamente HTTP, fornendo load balancing, terminazione SSL e virtual hosting basato su nome.

## Kubernetes vs Docker Swarm

### Punti di Forza di Kubernetes

1. **Scalabilità**: Progettato per gestire cluster molto grandi (migliaia di nodi)
2. **Flessibilità**: Altamente configurabile e adattabile a diversi scenari
3. **Ecosistema ricco**: Ampia gamma di strumenti, estensioni e integrazioni
4. **Auto-healing**: Capacità avanzate di rilevamento e recupero da guasti
5. **Gestione delle risorse**: Controllo dettagliato sull'allocazione di CPU e memoria
6. **Deployment complessi**: Supporto per strategie di deployment avanzate

### Punti di Forza di Docker Swarm

1. **Semplicità**: Più facile da configurare e utilizzare
2. **Integrazione Docker**: Perfettamente integrato con l'ecosistema Docker
3. **Curva di apprendimento**: Più rapido da imparare per chi conosce già Docker
4. **Leggerezza**: Meno overhead e complessità per cluster piccoli

### Quando Scegliere Kubernetes

- Applicazioni complesse con molti microservizi
- Ambienti di produzione su larga scala
- Necessità di funzionalità avanzate di orchestrazione
- Team con risorse dedicate per la gestione dell'infrastruttura
- Deployment multi-cloud o ibridi

### Quando Scegliere Docker Swarm

- Applicazioni più semplici con pochi servizi
- Team più piccoli con risorse limitate
- Necessità di una soluzione rapida da implementare
- Familiarità con Docker e preferenza per la stessa interfaccia
- Ambienti di sviluppo o test

## Strumenti per Lavorare con Kubernetes

### kubectl

`kubectl` è lo strumento da riga di comando per interagire con cluster Kubernetes. Permette di deployare applicazioni, ispezionare e gestire risorse del cluster, e visualizzare log.

Esempi di comandi base:

```bash
# Visualizzare i nodi del cluster
kubectl get nodes

# Deployare un'applicazione
kubectl apply -f deployment.yaml

# Visualizzare i pod in esecuzione
kubectl get pods

# Visualizzare i log di un pod
kubectl logs <pod-name>

# Eseguire un comando in un container
kubectl exec -it <pod-name> -- /bin/bash

# Scalare un deployment
kubectl scale deployment <deployment-name> --replicas=5
```

### Helm

Helm è un gestore di pacchetti per Kubernetes che semplifica l'installazione e la gestione di applicazioni. Utilizza "chart" che sono pacchetti di risorse Kubernetes pre-configurate.

### Dashboard

Kubernetes Dashboard è un'interfaccia utente web per gestire e monitorare le applicazioni e il cluster stesso.

### Minikube e kind

- **Minikube**: Strumento che permette di eseguire un cluster Kubernetes locale su una singola macchina
- **kind (Kubernetes IN Docker)**: Esegue cluster Kubernetes locali utilizzando container Docker come nodi

## Distribuzioni Kubernetes

Esistono diverse distribuzioni di Kubernetes, ognuna con caratteristiche specifiche:

- **Kubernetes vanilla**: La versione standard di Kubernetes
- **OpenShift (Red Hat)**: Aggiunge funzionalità enterprise e sicurezza
- **Rancher**: Semplifica la gestione di cluster Kubernetes
- **Google Kubernetes Engine (GKE)**: Servizio gestito su Google Cloud
- **Amazon Elastic Kubernetes Service (EKS)**: Servizio gestito su AWS
- **Azure Kubernetes Service (AKS)**: Servizio gestito su Microsoft Azure

## Conclusione

Kubernetes rappresenta lo stato dell'arte nell'orchestrazione di container, offrendo un sistema potente e flessibile per gestire applicazioni containerizzate su larga scala. Sebbene abbia una curva di apprendimento più ripida rispetto a Docker Swarm, le sue capacità avanzate lo rendono la scelta preferita per molte organizzazioni che necessitano di scalabilità, resilienza e flessibilità.

In questo modulo, ci siamo concentrati principalmente su Docker Swarm come soluzione di orchestrazione nativa di Docker, ma è importante conoscere anche Kubernetes come alternativa più potente per scenari più complessi.

## Navigazione

- [⬅️ Precedente: Docker Swarm](./02-DockerSwarm.md)
- [📑 Torna all'indice del modulo](../README.md)