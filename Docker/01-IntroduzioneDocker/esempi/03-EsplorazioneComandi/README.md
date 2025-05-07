# Esplorazione dei Comandi Docker

Questa esercitazione ti guiderà attraverso l'esplorazione dei comandi più comuni di Docker, permettendoti di acquisire familiarità con la Docker CLI.

## Obiettivi

- Esplorare i comandi principali della Docker CLI
- Comprendere come gestire immagini, container, volumi e reti
- Imparare a utilizzare i comandi di sistema e di debug

## Prerequisiti

- Docker installato e funzionante
- Completamento delle esercitazioni [01-VerificaInstallazione](../01-VerificaInstallazione/) e [02-PrimoContainer](../02-PrimoContainer/)

## Comandi per la Gestione delle Immagini

### 1. Cercare Immagini nel Docker Hub

```bash
# Cerca immagini di PostgreSQL nel Docker Hub
docker search postgres
```

### 2. Scaricare Immagini

```bash
# Scarica l'immagine Alpine Linux (una distribuzione leggera)
docker pull alpine:latest

# Scarica una versione specifica di Node.js
docker pull node:14
```

### 3. Elencare le Immagini

```bash
# Visualizza tutte le immagini
docker images

# Formato alternativo
docker image ls

# Visualizza solo gli ID delle immagini
docker images -q
```

### 4. Ispezionare un'Immagine

```bash
# Visualizza informazioni dettagliate su un'immagine
docker inspect alpine:latest

# Visualizza la storia di un'immagine (i layer)
docker history alpine:latest
```

## Comandi per la Gestione dei Container

### 1. Eseguire Container in Diversi Modi

```bash
# Esegui un container interattivo
docker run -it --name alpine_test alpine:latest sh

# Esegui un container in background
docker run -d --name web_server nginx

# Esegui un container che si elimina automaticamente dopo l'esecuzione
docker run --rm alpine:latest echo "Hello, Docker!"

# Esegui un container con mappatura delle porte
docker run -d -p 8080:80 --name nginx_server nginx
```

### 2. Gestire i Container in Esecuzione

```bash
# Elenca i container in esecuzione
docker ps

# Elenca tutti i container (anche quelli fermati)
docker ps -a

# Ferma un container
docker stop web_server

# Avvia un container fermato
docker start web_server

# Riavvia un container
docker restart web_server
```

### 3. Interagire con i Container

```bash
# Esegui un comando in un container in esecuzione
docker exec -it web_server bash

# Visualizza i log di un container
docker logs web_server

# Segui i log in tempo reale
docker logs -f web_server

# Copia file da/verso un container
docker cp ./file.txt web_server:/usr/share/nginx/html/
docker cp web_server:/etc/nginx/nginx.conf ./nginx.conf
```

### 4. Monitorare le Risorse

```bash
# Visualizza le statistiche di utilizzo delle risorse
docker stats

# Visualizza i processi in esecuzione in un container
docker top web_server
```

## Comandi per la Gestione dei Volumi

### 1. Creare e Gestire Volumi

```bash
# Crea un nuovo volume
docker volume create mio_volume

# Elenca tutti i volumi
docker volume ls

# Ispeziona un volume
docker volume inspect mio_volume

# Rimuovi un volume
docker volume rm mio_volume
```

### 2. Utilizzare i Volumi con i Container

```bash
# Esegui un container con un volume
docker run -d --name db -v mio_volume:/var/lib/postgresql/data postgres:13

# Utilizza un bind mount (directory dell'host)
docker run -d --name web -v $(pwd)/html:/usr/share/nginx/html nginx
```

## Comandi per la Gestione delle Reti

### 1. Creare e Gestire Reti

```bash
# Crea una nuova rete bridge
docker network create mia_rete

# Elenca tutte le reti
docker network ls

# Ispeziona una rete
docker network inspect mia_rete

# Rimuovi una rete
docker network rm mia_rete
```

### 2. Connettere Container alle Reti

```bash
# Esegui un container connesso a una rete specifica
docker run -d --name db --network mia_rete postgres:13

# Connetti un container esistente a una rete
docker network connect mia_rete web_server

# Disconnetti un container da una rete
docker network disconnect mia_rete web_server
```

## Comandi di Sistema

### 1. Informazioni di Sistema

```bash
# Visualizza informazioni sul sistema Docker
docker info

# Visualizza la versione di Docker
docker version
```

### 2. Pulizia del Sistema

```bash
# Rimuovi tutti i container fermati
docker container prune

# Rimuovi tutte le immagini dangling (senza tag)
docker image prune

# Rimuovi tutti i volumi non utilizzati
docker volume prune

# Rimuovi tutte le reti non utilizzate
docker network prune

# Rimuovi tutto ciò che non è in uso
docker system prune

# Rimuovi tutto, incluse le immagini non utilizzate
docker system prune -a
```

## Esercizi Pratici

### Esercizio 1: Gestione Completa di un Container

1. Scarica l'immagine `httpd` (Apache)
2. Esegui un container basato su questa immagine in background, mappando la porta 8080 dell'host alla porta 80 del container
3. Crea un file HTML semplice e copialo nel container nella directory `/usr/local/apache2/htdocs/`
4. Verifica che il sito web sia accessibile all'indirizzo `http://localhost:8080`
5. Visualizza i log del container
6. Ferma e rimuovi il container

### Esercizio 2: Lavorare con Volumi e Reti

1. Crea una rete Docker chiamata `app_network`
2. Crea un volume Docker chiamato `db_data`
3. Esegui un container MySQL connesso alla rete `app_network` e utilizzando il volume `db_data`
4. Esegui un container phpMyAdmin connesso alla stessa rete e configurato per connettersi al container MySQL
5. Accedi a phpMyAdmin tramite il browser e crea un database di esempio
6. Ferma e rimuovi entrambi i container, ma mantieni il volume e la rete

## Conclusione

Hai esplorato i comandi principali della Docker CLI e hai imparato a gestire immagini, container, volumi e reti. Questi comandi costituiscono la base per lavorare efficacemente con Docker.

## Prossimi Passi

Ora che hai completato le esercitazioni introduttive, puoi passare al modulo successivo per approfondire l'utilizzo di Docker.

## Navigazione
- [⬅️ Esercitazione precedente: Primo Container](../02-PrimoContainer/README.md)
- [📑 Torna all'indice delle esercitazioni](../../README.md)
- [➡️ Prossimo modulo: Primi passi con i container](../../../02-PrimiPassiContainer/README.md)