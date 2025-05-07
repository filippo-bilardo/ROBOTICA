# Docker CLI: comandi base

In questa sezione, esploreremo i comandi base della Docker Command Line Interface (CLI) che ti permetteranno di iniziare a lavorare con i container Docker.

## Panoramica della Docker CLI

La Docker CLI è lo strumento principale per interagire con Docker. Attraverso la riga di comando, puoi gestire immagini, container, reti, volumi e altri oggetti Docker.

## Sintassi di Base

I comandi Docker seguono generalmente questa sintassi:

```bash
docker [opzioni] comando [argomenti]
```

Dove:
- `docker` è il comando base
- `[opzioni]` sono flag opzionali che modificano il comportamento del comando
- `comando` è il comando specifico da eseguire
- `[argomenti]` sono i parametri specifici per il comando

## Comandi per la Gestione delle Immagini

### Cercare Immagini

```bash
docker search ubuntu
```

Questo comando cerca le immagini con il nome "ubuntu" nel Docker Hub.

### Scaricare Immagini

```bash
docker pull ubuntu:20.04
```

Questo comando scarica l'immagine Ubuntu 20.04 dal Docker Hub. Se non specifichi un tag (come `:20.04`), Docker scaricherà l'immagine con il tag `latest`.

### Elencare le Immagini

```bash
docker images
# oppure
docker image ls
```

Questo comando mostra tutte le immagini Docker presenti sul tuo sistema.

### Rimuovere Immagini

```bash
docker rmi ubuntu:20.04
# oppure
docker image rm ubuntu:20.04
```

Questo comando rimuove l'immagine specificata dal tuo sistema.

## Comandi per la Gestione dei Container

### Creare ed Eseguire un Container

```bash
docker run -it ubuntu:20.04 bash
```

Questo comando crea ed esegue un container basato sull'immagine Ubuntu 20.04 e avvia una shell bash interattiva.

Opzioni comuni per `docker run`:
- `-i` o `--interactive`: mantiene lo STDIN aperto
- `-t` o `--tty`: alloca uno pseudo-TTY
- `-d` o `--detach`: esegue il container in background
- `-p` o `--publish`: mappa le porte (es. `-p 8080:80`)
- `-v` o `--volume`: monta un volume (es. `-v /host/path:/container/path`)
- `--name`: assegna un nome al container
- `--rm`: rimuove automaticamente il container quando si ferma

### Elencare i Container

```bash
docker ps
# oppure
docker container ls
```

Questo comando mostra i container in esecuzione. Aggiungi l'opzione `-a` per vedere anche i container fermati.

### Avviare, Fermare e Riavviare Container

```bash
docker start container_id_o_nome
docker stop container_id_o_nome
docker restart container_id_o_nome
```

Questi comandi avviano, fermano e riavviano un container esistente.

### Eseguire Comandi in un Container in Esecuzione

```bash
docker exec -it container_id_o_nome bash
```

Questo comando esegue una shell bash interattiva in un container in esecuzione.

### Visualizzare i Log di un Container

```bash
docker logs container_id_o_nome
```

Questo comando mostra i log di un container. Aggiungi l'opzione `-f` per seguire i log in tempo reale.

### Rimuovere Container

```bash
docker rm container_id_o_nome
# oppure
docker container rm container_id_o_nome
```

Questo comando rimuove un container fermato. Aggiungi l'opzione `-f` per forzare la rimozione di un container in esecuzione.

## Comandi per la Gestione dei Volumi

### Creare un Volume

```bash
docker volume create mio_volume
```

Questo comando crea un nuovo volume Docker.

### Elencare i Volumi

```bash
docker volume ls
```

Questo comando mostra tutti i volumi Docker presenti sul tuo sistema.

### Rimuovere un Volume

```bash
docker volume rm mio_volume
```

Questo comando rimuove un volume Docker.

## Comandi per la Gestione delle Reti

### Creare una Rete

```bash
docker network create mia_rete
```

Questo comando crea una nuova rete Docker.

### Elencare le Reti

```bash
docker network ls
```

Questo comando mostra tutte le reti Docker presenti sul tuo sistema.

### Connettere un Container a una Rete

```bash
docker network connect mia_rete container_id_o_nome
```

Questo comando connette un container esistente a una rete.

### Rimuovere una Rete

```bash
docker network rm mia_rete
```

Questo comando rimuove una rete Docker.

## Comandi per la Gestione del Sistema

### Visualizzare Informazioni sul Sistema Docker

```bash
docker info
```

Questo comando mostra informazioni dettagliate sul sistema Docker.

### Visualizzare l'Utilizzo delle Risorse

```bash
docker stats
```

Questo comando mostra l'utilizzo in tempo reale delle risorse (CPU, memoria, rete, I/O) dei container in esecuzione.

### Pulire le Risorse non Utilizzate

```bash
docker system prune
```

Questo comando rimuove tutti i container fermati, le reti non utilizzate, le immagini dangling e la cache di build.

Aggiungi l'opzione `-a` per rimuovere anche tutte le immagini non utilizzate.

## Comandi per la Costruzione di Immagini

### Costruire un'Immagine da un Dockerfile

```bash
docker build -t nome_immagine:tag .
```

Questo comando costruisce un'immagine dal Dockerfile nella directory corrente e la etichetta con il nome e il tag specificati.

### Visualizzare la Storia di un'Immagine

```bash
docker history nome_immagine:tag
```

Questo comando mostra la storia di un'immagine, inclusi i layer e i comandi utilizzati per crearla.

## Comandi di Aiuto

### Ottenere Aiuto Generale

```bash
docker --help
```

Questo comando mostra l'aiuto generale per Docker.

### Ottenere Aiuto per un Comando Specifico

```bash
docker comando --help
# esempio
docker run --help
```

Questo comando mostra l'aiuto per un comando specifico, incluse tutte le opzioni disponibili.

## Esempi Pratici

### Eseguire un Server Web Nginx

```bash
docker run -d -p 8080:80 --name mio_nginx nginx
```

Questo comando esegue un container Nginx in background, mappa la porta 8080 dell'host alla porta 80 del container e assegna il nome "mio_nginx" al container.

### Eseguire un Database MySQL

```bash
docker run -d -p 3306:3306 --name mio_mysql -e MYSQL_ROOT_PASSWORD=password mysql:5.7
```

Questo comando esegue un container MySQL 5.7 in background, mappa la porta 3306 e imposta la password di root.

### Eseguire un'Applicazione con Volumi

```bash
docker run -d -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html --name mio_sito nginx
```

Questo comando esegue un container Nginx e monta la directory locale "html" nella directory "/usr/share/nginx/html" del container.

## Conclusione

Questi sono solo alcuni dei comandi base della Docker CLI. Man mano che acquisirai familiarità con Docker, scoprirai molti altri comandi e opzioni che ti permetteranno di gestire i tuoi container in modo più efficiente.

Nella prossima sezione, metteremo in pratica questi comandi con alcune esercitazioni pratiche.

## Navigazione
- [⬅️ Installazione di Docker](./04-InstallazioneDocker.md)
- [📑 Torna all'indice](../README.md)