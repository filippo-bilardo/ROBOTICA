# Il Tuo Primo Container Docker

Questa esercitazione ti guiderà attraverso i passaggi per eseguire il tuo primo container Docker reale e interagire con esso.

## Obiettivi

- Eseguire un container Docker basato su un'immagine Linux
- Interagire con un container in esecuzione
- Comprendere i concetti di base del ciclo di vita di un container

## Prerequisiti

- Docker installato e funzionante (verificato con l'esercitazione [01-VerificaInstallazione](../01-VerificaInstallazione/))

## Passaggi

### 1. Scaricare un'Immagine Linux

Per prima cosa, scaricheremo un'immagine di Ubuntu dal Docker Hub:

```bash
docker pull ubuntu:20.04
```

Questo comando scarica l'immagine Ubuntu 20.04 LTS dal Docker Hub.

### 2. Verificare che l'Immagine sia Stata Scaricata

Esegui il seguente comando per visualizzare le immagini disponibili localmente:

```bash
docker images
```

Dovresti vedere l'immagine "ubuntu" nell'elenco.

### 3. Eseguire un Container Interattivo

Ora eseguiremo un container basato sull'immagine Ubuntu in modalità interattiva:

```bash
docker run -it --name mio_ubuntu ubuntu:20.04 bash
```

Questo comando:
- `-it`: Esegue il container in modalità interattiva con un terminale
- `--name mio_ubuntu`: Assegna il nome "mio_ubuntu" al container
- `ubuntu:20.04`: Specifica l'immagine da utilizzare
- `bash`: Specifica il comando da eseguire all'interno del container

Ora dovresti trovarti all'interno di una shell bash nel container Ubuntu.

### 4. Esplorare il Container

All'interno del container, puoi eseguire comandi Linux come faresti in un normale sistema Ubuntu. Prova alcuni di questi comandi:

```bash
cat /etc/os-release  # Visualizza informazioni sulla versione del sistema operativo
ls -la               # Elenca i file nella directory corrente
apt update           # Aggiorna l'indice dei pacchetti
apt install -y nano  # Installa l'editor di testo nano
```

### 5. Uscire dal Container

Per uscire dal container, digita:

```bash
exit
```

Questo ti riporterà al terminale del tuo sistema host e fermerà il container.

### 6. Verificare lo Stato del Container

Esegui il seguente comando per visualizzare tutti i container, inclusi quelli fermati:

```bash
docker ps -a
```

Dovresti vedere il container "mio_ubuntu" nell'elenco con lo stato "Exited".

### 7. Riavviare e Ricollegarsi al Container

Per riavviare il container fermato:

```bash
docker start mio_ubuntu
```

Per collegarti nuovamente al container in esecuzione:

```bash
docker exec -it mio_ubuntu bash
```

Ora sei di nuovo all'interno del container e puoi continuare a lavorare.

### 8. Eseguire un Container in Background

Esci dal container con `exit` e poi esegui un nuovo container in modalità detached (background):

```bash
docker run -d --name server_web nginx
```

Questo comando esegue un server web Nginx in background.

### 9. Verificare i Container in Esecuzione

```bash
docker ps
```

Dovresti vedere il container "server_web" in esecuzione.

### 10. Visualizzare i Log del Container

```bash
docker logs server_web
```

Questo comando mostra i log del server Nginx.

### 11. Fermare e Rimuovere i Container

Per fermare i container in esecuzione:

```bash
docker stop mio_ubuntu server_web
```

Per rimuovere i container fermati:

```bash
docker rm mio_ubuntu server_web
```

## Esercizi Aggiuntivi

1. Esegui un container Ubuntu in background che esegue un comando semplice come `ping google.com`
2. Visualizza i log di questo container
3. Esegui un container con un server web (come Nginx o Apache) e mappa una porta per accedervi dal browser

## Conclusione

Hai imparato a:
- Scaricare immagini Docker
- Eseguire container in modalità interattiva e in background
- Interagire con i container in esecuzione
- Gestire il ciclo di vita dei container (avvio, arresto, rimozione)

## Prossimi Passi

Procedi con l'esercitazione [03-EsplorazioneComandi](../03-EsplorazioneComandi/) per approfondire i comandi Docker.

## Navigazione
- [⬅️ Esercitazione precedente: Verifica Installazione](../01-VerificaInstallazione/README.md)
- [📑 Torna all'indice delle esercitazioni](../../README.md)
- [➡️ Prossima esercitazione: Esplorazione Comandi](../03-EsplorazioneComandi/README.md)