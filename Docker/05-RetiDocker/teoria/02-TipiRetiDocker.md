# Tipi di Reti in Docker

In questa sezione, esploreremo in dettaglio i diversi tipi di reti disponibili in Docker, le loro caratteristiche e i casi d'uso appropriati per ciascuna.

## Panoramica dei Tipi di Rete

Docker offre diversi tipi di reti per soddisfare varie esigenze di comunicazione e isolamento. Ogni tipo di rete ha caratteristiche specifiche che la rendono adatta a determinati scenari.

## Reti Predefinite

Come abbiamo visto nella sezione precedente, Docker crea automaticamente tre reti predefinite: bridge, host e none. Vediamo ora in maggiore dettaglio ciascuna di queste reti.

### 1. Rete Bridge

La rete bridge è il tipo di rete predefinito in Docker. Quando avvii un container senza specificare una rete, viene automaticamente collegato alla rete bridge predefinita.

**Funzionamento:**
- Crea un bridge virtuale sul sistema host
- Assegna indirizzi IP ai container dalla subnet del bridge
- Implementa NAT per la comunicazione con l'esterno

**Vantaggi:**
- Isolamento di base tra container e host
- Facile da configurare e utilizzare
- Supporta la mappatura delle porte per l'accesso esterno

**Limitazioni:**
- La rete bridge predefinita non supporta la risoluzione DNS tra container (i container personalizzati sì)
- Richiede mappature di porte esplicite per l'accesso dall'esterno
- Prestazioni leggermente inferiori rispetto alla rete host

**Casi d'uso:**
- Applicazioni semplici con pochi container
- Ambienti di sviluppo
- Quando è necessario un isolamento di base

**Esempio di utilizzo:**
```bash
# Avvio di un container sulla rete bridge predefinita
docker run -d --name web nginx

# Avvio di un container con mappatura delle porte
docker run -d --name web -p 8080:80 nginx
```

### 2. Rete Host

La rete host rimuove l'isolamento di rete tra il container e il sistema host, consentendo al container di utilizzare direttamente lo stack di rete dell'host.

**Funzionamento:**
- Il container condivide lo spazio dei nomi di rete con l'host
- Non viene eseguito NAT o mappatura delle porte
- I container utilizzano direttamente le interfacce di rete dell'host

**Vantaggi:**
- Prestazioni di rete migliori (nessun overhead di NAT)
- Non richiede mappature di porte
- Accesso diretto alle interfacce di rete dell'host

**Limitazioni:**
- Nessun isolamento di rete tra container e host
- Potenziali conflitti di porte con servizi in esecuzione sull'host
- Minore sicurezza a causa del ridotto isolamento

**Casi d'uso:**
- Applicazioni che richiedono prestazioni di rete ottimali
- Quando è necessario accedere direttamente alle interfacce di rete dell'host
- Scenari in cui l'isolamento di rete non è una preoccupazione

**Esempio di utilizzo:**
```bash
# Avvio di un container sulla rete host
docker run -d --network host --name web nginx
```

### 3. Rete None

La rete none disabilita completamente la rete per un container, isolandolo completamente dal punto di vista della rete.

**Funzionamento:**
- Il container ha solo l'interfaccia di loopback
- Nessuna connettività con l'esterno o con altri container

**Vantaggi:**
- Massimo isolamento di rete
- Sicurezza migliorata per container che non richiedono rete
- Riduzione della superficie di attacco

**Limitazioni:**
- Nessuna comunicazione di rete possibile
- Limitato a operazioni che non richiedono rete

**Casi d'uso:**
- Elaborazione batch che non richiede connettività di rete
- Container che lavorano esclusivamente con file locali
- Ambienti ad alta sicurezza dove l'isolamento è critico

**Esempio di utilizzo:**
```bash
# Avvio di un container senza rete
docker run -d --network none --name batch-job my-batch-processor
```

## Reti Personalizzate

Oltre alle reti predefinite, Docker permette di creare reti personalizzate con diverse configurazioni e driver.

### 1. Reti Bridge Personalizzate

Le reti bridge personalizzate offrono funzionalità aggiuntive rispetto alla rete bridge predefinita.

**Funzionalità aggiuntive:**
- Risoluzione DNS automatica tra container
- Migliore isolamento (i container su reti bridge diverse non possono comunicare direttamente)
- Possibilità di configurare opzioni avanzate

**Esempio di creazione e utilizzo:**
```bash
# Creazione di una rete bridge personalizzata
docker network create --driver bridge mia-rete

# Avvio di container sulla rete personalizzata
docker run -d --network mia-rete --name web nginx
docker run -d --network mia-rete --name db postgres

# I container possono comunicare usando i nomi come hostname
# Ad esempio, 'web' può connettersi a 'db' usando il nome 'db'
```

### 2. Reti Overlay

Le reti overlay permettono la comunicazione tra container in esecuzione su host Docker diversi, facilitando la creazione di applicazioni distribuite.

**Funzionamento:**
- Crea una rete virtuale che si estende su più host Docker
- Utilizza VXLAN per incapsulare il traffico tra host
- Supporta la risoluzione DNS tra container su host diversi

**Casi d'uso:**
- Cluster Docker Swarm
- Applicazioni distribuite su più host
- Microservizi che richiedono comunicazione tra nodi

**Esempio di creazione e utilizzo:**
```bash
# Inizializzare Docker Swarm (necessario per le reti overlay)
docker swarm init

# Creazione di una rete overlay
docker network create --driver overlay mia-rete-overlay

# Avvio di un servizio sulla rete overlay
docker service create --network mia-rete-overlay --name web nginx
```

### 3. Reti Macvlan

Le reti macvlan assegnano un indirizzo MAC e IP univoco a ciascun container, facendoli apparire come dispositivi fisici sulla rete.

**Funzionamento:**
- Assegna un indirizzo MAC univoco a ciascun container
- I container appaiono come dispositivi fisici sulla rete
- Permette ai container di ricevere indirizzi IP dalla rete fisica

**Casi d'uso:**
- Migrazione di applicazioni legacy che richiedono connessione diretta alla rete fisica
- Quando i container devono apparire come dispositivi fisici sulla rete
- Scenari in cui è necessario bypassare NAT

**Esempio di creazione e utilizzo:**
```bash
# Creazione di una rete macvlan
docker network create --driver macvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 mia-rete-macvlan

# Avvio di un container sulla rete macvlan con IP specifico
docker run -d --network mia-rete-macvlan --ip=192.168.1.10 --name web nginx
```

### 4. Reti IPvlan

Simile a macvlan, ma condivide l'indirizzo MAC dell'interfaccia principale mentre assegna indirizzi IP univoci.

**Funzionamento:**
- Tutti i container condividono lo stesso indirizzo MAC
- Ogni container riceve un indirizzo IP univoco
- Supporta modalità L2 (livello 2) e L3 (livello 3)

**Vantaggi rispetto a macvlan:**
- Funziona in ambienti che limitano il numero di indirizzi MAC (alcuni switch cloud)
- Riduce il carico sul switch di rete (nessun apprendimento MAC aggiuntivo)

**Esempio di creazione e utilizzo:**
```bash
# Creazione di una rete ipvlan in modalità L2
docker network create --driver ipvlan \
  --subnet=192.168.1.0/24 \
  --gateway=192.168.1.1 \
  -o parent=eth0 \
  -o ipvlan_mode=l2 mia-rete-ipvlan

# Avvio di un container sulla rete ipvlan
docker run -d --network mia-rete-ipvlan --name web nginx
```

## Confronto tra i Tipi di Rete

| Tipo di Rete | Isolamento | Prestazioni | Facilità d'Uso | Casi d'Uso Tipici |
|--------------|------------|-------------|----------------|-------------------|
| Bridge (default) | Medio | Buone | Alta | Sviluppo, applicazioni semplici |
| Bridge (personalizzata) | Medio-Alto | Buone | Alta | Microservizi, ambienti multi-container |
| Host | Basso | Ottime | Media | Applicazioni ad alte prestazioni |
| None | Massimo | N/A | Alta | Batch processing, massima sicurezza |
| Overlay | Alto | Buone | Media | Cluster distribuiti, Docker Swarm |
| Macvlan | Basso | Ottime | Bassa | Integrazione con reti fisiche |
| IPvlan | Basso | Ottime | Bassa | Ambienti con limitazioni MAC |

## Conclusione

La scelta del tipo di rete appropriato in Docker dipende dalle specifiche esigenze dell'applicazione, dai requisiti di sicurezza e dalle caratteristiche dell'ambiente di deployment. Docker offre una gamma flessibile di opzioni di rete che possono essere adattate a quasi tutti gli scenari.

Nella prossima sezione, esploreremo configurazioni avanzate delle reti Docker e come risolvere problemi comuni.

## Navigazione
- [⬅️ Introduzione alle Reti Docker](./01-IntroduzioneRetiDocker.md)
- [➡️ Configurazione Avanzata delle Reti](./03-ConfigurazioneAvanzata.md)
- [📑 Torna all'indice del modulo](../README.md)