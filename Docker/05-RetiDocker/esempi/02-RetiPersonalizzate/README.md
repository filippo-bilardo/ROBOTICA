# Esempio: Reti Personalizzate

Questo esempio dimostra come creare e utilizzare reti Docker personalizzate per migliorare la comunicazione tra container.

## Prerequisiti

- Docker installato sul tuo sistema
- Conoscenza di base dei comandi Docker

## Obiettivi

- Creare una rete bridge personalizzata
- Verificare la risoluzione DNS automatica tra container
- Comprendere i vantaggi delle reti personalizzate rispetto alla rete bridge predefinita

## Passaggi

### 1. Crea una Rete Bridge Personalizzata

Creaimo una rete bridge personalizzata:

```bash
docker network create --driver bridge mia-rete
```

Puoi anche specificare una subnet e un gateway personalizzati:

```bash
docker network create --driver bridge --subnet=172.20.0.0/16 --gateway=172.20.0.1 mia-rete-custom
```

### 2. Verifica la Creazione della Rete

Verifichiamo che la rete sia stata creata correttamente:

```bash
docker network ls
```

E ispezionamo i dettagli della rete:

```bash
docker network inspect mia-rete
```

### 3. Avvia Container sulla Rete Personalizzata

Avviamo due container sulla rete personalizzata:

```bash
# Avvia un container web
docker run -d --name web-server --network mia-rete nginx:alpine

# Avvia un container database
docker run -d --name database --network mia-rete postgres:alpine
```

### 4. Verifica la Risoluzione DNS

Avviamo un container client sulla stessa rete per testare la comunicazione:

```bash
docker run -it --name client --network mia-rete alpine sh
```

Dal container client, verifichiamo la risoluzione DNS e la comunicazione:

```bash
# Installa ping e curl
apk add --no-cache iputils curl

# Ping dei container usando i loro nomi
ping -c 2 web-server
ping -c 2 database

# Accedi al web server usando il nome
curl http://web-server
```

A differenza della rete bridge predefinita, nelle reti personalizzate i container possono comunicare tra loro usando i nomi come hostname.

### 5. Collega un Container Esistente alla Rete

Puoi anche collegare un container esistente a una rete personalizzata:

```bash
# Crea un nuovo container sulla rete bridge predefinita
docker run -d --name standalone nginx:alpine

# Collega il container alla rete personalizzata
docker network connect mia-rete standalone
```

Ora il container `standalone` è collegato sia alla rete bridge predefinita che alla rete personalizzata `mia-rete`.

### 6. Verifica la Connettività Multi-Rete

Dal container client, verifichiamo che possiamo comunicare con il container standalone:

```bash
ping -c 2 standalone
curl http://standalone
```

### 7. Disconnetti un Container da una Rete

Puoi disconnettere un container da una rete:

```bash
docker network disconnect mia-rete standalone
```

Verifica che il container non sia più accessibile dalla rete personalizzata:

```bash
# Dal container client
ping -c 2 standalone  # Questo dovrebbe fallire ora
```

### 8. Pulisci l'Ambiente

Al termine dell'esperimento, rimuovi i container e le reti create:

```bash
# Ferma e rimuovi i container
docker stop web-server database client standalone
docker rm web-server database client standalone

# Rimuovi le reti personalizzate
docker network rm mia-rete mia-rete-custom
```

## Conclusioni

In questo esempio, hai imparato:

1. Come creare reti Docker personalizzate
2. Come i container su reti personalizzate possono comunicare usando i nomi come hostname (risoluzione DNS automatica)
3. Come collegare e disconnettere container da reti esistenti
4. I vantaggi delle reti personalizzate rispetto alla rete bridge predefinita

Le reti personalizzate offrono maggiore flessibilità, isolamento e funzionalità rispetto alla rete bridge predefinita, rendendole ideali per applicazioni multi-container.

## Navigazione
- [⬅️ Esempio precedente: Rete Bridge Predefinita](../01-ReteBridgePredefinita/README.md)
- [➡️ Esempio successivo: Comunicazione tra Container](../03-ComunicazioneContainer/README.md)
- [📑 Torna al README del modulo](../../README.md)