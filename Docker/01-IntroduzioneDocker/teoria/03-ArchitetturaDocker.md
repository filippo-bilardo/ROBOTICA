# Architettura di Docker

In questa sezione esploreremo l'architettura di Docker, comprendendo i suoi componenti principali e come interagiscono tra loro per fornire la funzionalità di containerizzazione.

## Panoramica dell'Architettura

Docker utilizza un'architettura client-server. Il client Docker comunica con il demone Docker (server), che si occupa di costruire, eseguire e distribuire i container Docker.

## Componenti Principali

### 1. Docker Client

Il Docker Client è lo strumento principale con cui gli utenti interagiscono con Docker. Quando esegui comandi come `docker run` o `docker build`, il client invia queste richieste al demone Docker, che le esegue.

**Funzioni principali:**
- Interpretare i comandi dell'utente
- Comunicare con il demone Docker
- Gestire il Docker Registry

### 2. Docker Daemon (dockerd)

Il demone Docker è un servizio in esecuzione sul sistema host che gestisce la creazione, l'esecuzione e il monitoraggio dei container. Ascolta le richieste API e gestisce gli oggetti Docker come immagini, container, reti e volumi.

**Funzioni principali:**
- Gestire il ciclo di vita dei container
- Costruire e memorizzare le immagini
- Gestire le risorse del sistema

### 3. Docker Registry

Un Docker Registry è un repository per le immagini Docker. Docker Hub è un registry pubblico che chiunque può utilizzare, ma molte organizzazioni creano registry privati per archiviare e gestire le proprie immagini.

**Funzioni principali:**
- Archiviare le immagini Docker
- Consentire la condivisione delle immagini
- Gestire le versioni delle immagini

### 4. Docker Objects

Docker crea e utilizza diversi oggetti durante il suo funzionamento:

#### Immagini

Un'immagine è un template di sola lettura con istruzioni per creare un container Docker. Spesso, un'immagine è basata su un'altra immagine, con alcune personalizzazioni aggiuntive.

**Caratteristiche:**
- Immutabili (non possono essere modificate dopo la creazione)
- Composte da layer
- Definite tramite un Dockerfile

#### Container

Un container è un'istanza eseguibile di un'immagine. Puoi creare, avviare, fermare, spostare o eliminare un container utilizzando l'API o l'interfaccia a riga di comando di Docker.

**Caratteristiche:**
- Isolati dal sistema host e da altri container
- Contengono tutto il necessario per eseguire un'applicazione
- Possono essere connessi a una o più reti
- Possono avere storage associato

#### Volumi

I volumi sono il meccanismo preferito per persistere i dati generati e utilizzati dai container Docker.

**Vantaggi:**
- Indipendenti dal ciclo di vita del container
- Possono essere condivisi tra container
- Più facili da eseguire backup o migrazioni

#### Reti

Docker include supporto per la rete, permettendo ai container di comunicare tra loro e con il mondo esterno.

**Tipi di rete:**
- Bridge: rete predefinita per i container
- Host: rimuove l'isolamento di rete tra container e host
- Overlay: connette container Docker su host diversi
- Macvlan: assegna un indirizzo MAC ai container
- None: disabilita tutte le reti

## Flusso di Lavoro di Docker

1. **Build**: Il client Docker invia il contesto di build (Dockerfile e file associati) al demone Docker, che costruisce l'immagine.
2. **Ship**: L'immagine viene caricata su un registry per la distribuzione.
3. **Run**: Il client richiede al demone di creare un container basato sull'immagine specificata.

## Architettura a Livello di Container

Docker utilizza diverse tecnologie del kernel Linux per fornire la funzionalità dei container:

### Namespaces

I namespaces forniscono il primo livello di isolamento. Docker utilizza i seguenti namespaces:

- **pid**: Isolamento dei processi
- **net**: Gestione delle interfacce di rete
- **ipc**: Gestione dell'accesso alla memoria condivisa
- **mnt**: Gestione dei punti di montaggio del filesystem
- **uts**: Isolamento del kernel e della versione
- **user**: Isolamento degli utenti e dei gruppi

### Control Groups (cgroups)

I cgroups limitano le risorse che un container può utilizzare, come CPU, memoria, I/O del disco e rete.

### Union File System

Docker utilizza Union File Systems per fornire i blocchi di costruzione per i container. Questi file system operano creando layer, permettendo a più file system di essere montati contemporaneamente ma apparendo come un unico file system.

## Sicurezza in Docker

Docker implementa diverse misure di sicurezza:

1. **Isolamento**: I container sono isolati l'uno dall'altro e dalla macchina host.
2. **Capabilities**: Docker limita le capabilities del kernel disponibili per i container.
3. **Seccomp**: Filtra le system call disponibili per i container.
4. **AppArmor/SELinux**: Fornisce un controllo di accesso obbligatorio per i container.

## Conclusione

L'architettura di Docker è progettata per essere modulare, scalabile e sicura. Comprendere come questi componenti interagiscono è fondamentale per utilizzare Docker in modo efficace e per risolvere eventuali problemi che potrebbero sorgere.

Nella prossima sezione, vedremo come installare Docker su diversi sistemi operativi.

## Navigazione
- [⬅️ Container vs Macchine Virtuali](./02-ContainerVsVM.md)
- [➡️ Installazione di Docker](./04-InstallazioneDocker.md)
- [📑 Torna all'indice](../README.md)