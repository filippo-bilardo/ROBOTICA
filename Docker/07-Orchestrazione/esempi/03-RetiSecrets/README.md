# Reti e Secrets in Docker Swarm

## Introduzione

In questo esempio pratico, esploreremo come configurare e gestire reti e secrets in un ambiente Docker Swarm. Le reti permettono la comunicazione tra servizi, mentre i secrets consentono di gestire in modo sicuro informazioni sensibili come password, token e certificati.

## Obiettivi

- Comprendere i diversi tipi di reti in Docker Swarm
- Creare e gestire reti overlay per la comunicazione tra servizi
- Implementare il service discovery
- Creare e utilizzare secrets per gestire informazioni sensibili
- Applicare best practice per la sicurezza in un ambiente Swarm

## Prerequisiti

- Un cluster Docker Swarm funzionante (vedi [Esempio 1: Cluster Swarm Base](../01-ClusterSwarmBase/README.md))
- Conoscenza dei servizi in Docker Swarm (vedi [Esempio 2: Servizi e Scaling](../02-ServiziScaling/README.md))

## Reti in Docker Swarm

### Tipi di Reti

Docker Swarm supporta diversi tipi di reti:

1. **Bridge**: Rete locale su un singolo host (non utilizzata per la comunicazione tra nodi)
2. **Overlay**: Rete che si estende su più nodi, permettendo la comunicazione tra container su host diversi
3. **Macvlan**: Assegna indirizzi MAC ai container, facendoli apparire come dispositivi fisici sulla rete
4. **Host**: Il container utilizza direttamente lo stack di rete dell'host

Per l'orchestrazione in Swarm, le reti overlay sono le più importanti.

### Reti Overlay

Docker Swarm crea automaticamente due reti overlay quando si inizializza un cluster:

1. **ingress**: Rete utilizzata per il traffico di controllo del cluster e per pubblicare porte dei servizi
2. **docker_gwbridge**: Bridge che connette gli overlay network all'interfaccia fisica dell'host

## Passi

### 1. Creare una Rete Overlay

```bash
# Creare una rete overlay per la comunicazione tra servizi
docker network create --driver overlay --attachable app-network
```

L'opzione `--attachable` permette di collegare container standalone alla rete, utile per il debug.

### 2. Visualizzare le Reti

```bash
# Elencare tutte le reti
docker network ls

# Visualizzare i dettagli di una rete
docker network inspect app-network
```

### 3. Creare Servizi che Utilizzano la Rete Overlay

```bash
# Creare un servizio backend
docker service create --name backend \
  --network app-network \
  --replicas 2 \
  myapp/backend:latest

# Creare un servizio frontend che comunica con il backend
docker service create --name frontend \
  --network app-network \
  --replicas 3 \
  --publish 80:80 \
  --env BACKEND_HOST=backend \
  myapp/frontend:latest
```

I container del servizio `frontend` possono comunicare con i container del servizio `backend` utilizzando il nome del servizio come hostname (`backend` in questo caso).

### 4. Utilizzare Più Reti

I servizi possono essere collegati a più reti overlay:

```bash
# Creare una seconda rete overlay
docker network create --driver overlay db-network

# Creare un servizio database
docker service create --name db \
  --network db-network \
  --env MYSQL_ROOT_PASSWORD=secret \
  mysql:5.7

# Collegare il servizio backend alla rete del database
docker service update --network-add db-network backend
```

Ora il servizio `backend` può comunicare sia con `frontend` (tramite `app-network`) che con `db` (tramite `db-network`), mentre `frontend` e `db` non possono comunicare direttamente tra loro.

### 5. Service Discovery

Docker Swarm include un sistema di service discovery integrato che utilizza DNS. Ogni servizio è registrato con il suo nome e può essere raggiunto da altri servizi utilizzando quel nome.

Per testare il service discovery:

```bash
# Eseguire un container interattivo collegato alla rete app-network
docker run -it --rm --network app-network alpine sh

# All'interno del container, provare a risolvere i nomi dei servizi
ping backend
ping frontend
```

## Secrets in Docker Swarm

I secrets in Docker Swarm permettono di gestire in modo sicuro informazioni sensibili come password, token OAuth, certificati TLS o qualsiasi altro dato che non dovrebbe essere memorizzato in chiaro.

### Caratteristiche dei Secrets

- Memorizzati nel database Raft dei manager (crittografati a riposo)
- Trasmessi ai container solo quando necessario (crittografati in transito)
- Montati come file in `/run/secrets/<secret_name>` all'interno dei container
- Disponibili solo ai servizi a cui sono stati esplicitamente assegnati

### 1. Creare un Secret

I secrets possono essere creati da file o da standard input:

```bash
# Creare un secret da un file
echo "mypassword" > password.txt
docker secret create db_password password.txt
rm password.txt  # Rimuovere il file dopo la creazione del secret

# Creare un secret da standard input
echo "api_token_value" | docker secret create api_token -
```

### 2. Visualizzare i Secrets

```bash
# Elencare tutti i secrets
docker secret ls

# Visualizzare i dettagli di un secret
docker secret inspect db_password
```

Nota: non è possibile visualizzare il contenuto di un secret dopo la sua creazione.

### 3. Utilizzare Secrets nei Servizi

```bash
# Creare un servizio che utilizza un secret
docker service create --name db \
  --secret db_password \
  --env MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_password \
  mysql:5.7
```

Molte immagini Docker ufficiali supportano la lettura di password e altre informazioni sensibili da file, utilizzando variabili d'ambiente con suffisso `_FILE`.

### 4. Utilizzare Più Secrets

```bash
# Creare un servizio con più secrets
docker service create --name backend \
  --secret db_password \
  --secret api_token \
  --secret source=ssl_cert,target=cert.pem \
  myapp/backend:latest
```

L'opzione `source=X,target=Y` permette di specificare un nome diverso per il file all'interno del container.

### 5. Aggiornare i Secrets di un Servizio

I secrets non possono essere aggiornati direttamente. Per aggiornare un secret, è necessario:

1. Creare un nuovo secret
2. Aggiornare il servizio per utilizzare il nuovo secret
3. Rimuovere il vecchio secret

```bash
# Creare un nuovo secret
echo "newpassword" | docker secret create db_password_v2 -

# Aggiornare il servizio per utilizzare il nuovo secret
docker service update \
  --secret-rm db_password \
  --secret-add db_password_v2 \
  db

# Rimuovere il vecchio secret (opzionale, solo se non utilizzato da altri servizi)
docker secret rm db_password
```

### 6. Rimuovere un Secret

```bash
# Rimuovere un secret
docker secret rm api_token
```

Nota: non è possibile rimuovere un secret utilizzato da un servizio.

## Esempio Pratico: Applicazione Sicura Multi-Servizio

Creiamo un'applicazione composta da un frontend web, un backend API e un database, utilizzando reti e secrets per garantire la sicurezza:

```bash
# Creare le reti
docker network create --driver overlay frontend-network
docker network create --driver overlay backend-network

# Creare i secrets
echo "rootpassword" | docker secret create db_root_password -
echo "userpassword" | docker secret create db_user_password -
echo "apikey12345" | docker secret create api_key -

# Creare il servizio database
docker service create --name db \
  --network backend-network \
  --secret db_root_password \
  --secret db_user_password \
  --env MYSQL_ROOT_PASSWORD_FILE=/run/secrets/db_root_password \
  --env MYSQL_PASSWORD_FILE=/run/secrets/db_user_password \
  --env MYSQL_USER=appuser \
  --env MYSQL_DATABASE=appdb \
  --mount type=volume,source=db-data,target=/var/lib/mysql \
  mysql:5.7

# Creare il servizio backend API
docker service create --name api \
  --network frontend-network \
  --network backend-network \
  --secret db_user_password \
  --secret api_key \
  --env DB_HOST=db \
  --env DB_USER=appuser \
  --env DB_PASSWORD_FILE=/run/secrets/db_user_password \
  --env API_KEY_FILE=/run/secrets/api_key \
  myapp/api:latest

# Creare il servizio frontend
docker service create --name web \
  --network frontend-network \
  --replicas 3 \
  --publish 80:80 \
  --env API_HOST=api \
  myapp/web:latest
```

In questo esempio:

1. Il servizio `db` è accessibile solo dalla rete `backend-network`
2. Il servizio `api` può comunicare sia con `db` (tramite `backend-network`) che con `web` (tramite `frontend-network`)
3. Il servizio `web` può comunicare solo con `api` (tramite `frontend-network`) e non ha accesso diretto a `db`
4. I secrets sono distribuiti solo ai servizi che ne hanno bisogno

## Best Practice per la Sicurezza

1. **Principio del privilegio minimo**: Assegnare a ciascun servizio solo i secrets e l'accesso alle reti di cui ha effettivamente bisogno
2. **Segmentazione della rete**: Utilizzare più reti overlay per isolare i diversi livelli dell'applicazione
3. **Rotazione dei secrets**: Aggiornare periodicamente i secrets, specialmente in caso di cambio del personale
4. **Monitoraggio**: Implementare sistemi di monitoraggio per rilevare attività sospette
5. **Aggiornamenti regolari**: Mantenere aggiornate le immagini Docker per correggere vulnerabilità di sicurezza

## Conclusione

In questo esempio, abbiamo esplorato come configurare e gestire reti e secrets in Docker Swarm. Le reti overlay permettono la comunicazione sicura tra servizi distribuiti su più nodi, mentre i secrets forniscono un meccanismo per gestire informazioni sensibili in modo sicuro.

La combinazione di reti e secrets è fondamentale per costruire applicazioni containerizzate sicure e scalabili in un ambiente di produzione.

Nel prossimo esempio, esploreremo le strategie di aggiornamento rolling per implementare modifiche alle applicazioni senza downtime.

## Navigazione

- [⬅️ Esempio precedente: Servizi e Scaling](../02-ServiziScaling/README.md)
- [➡️ Prossimo esempio: Aggiornamenti Rolling](../04-AggiornamentoRolling/README.md)
- [📑 Torna all'indice del modulo](../../README.md)