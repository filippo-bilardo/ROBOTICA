# Esempio 02: Server Nginx Semplice

Questo esempio mostra come creare una semplice immagine Docker personalizzata per eseguire un server web Nginx con una pagina HTML di benvenuto modificata.

## File Inclusi

- `Dockerfile`: Le istruzioni per costruire la nostra immagine Nginx personalizzata.
- `index.html`: La pagina HTML personalizzata che verrà servita da Nginx.

## Passaggi

1.  **Costruire l'Immagine Docker (Build):**
    Apri un terminale nella directory `01-Introduction-to-Docker/examples/02-simple-nginx/` ed esegui il comando:
    ```bash
    docker build -t il-mio-nginx-semplice .
    ```
    - `docker build`: Il comando per costruire un'immagine da un Dockerfile.
    - `-t il-mio-nginx-semplice`: Assegna un nome (tag) "il-mio-nginx-semplice" all'immagine che stiamo creando.
    - `.`: Indica che il contesto di build (inclusi il Dockerfile e `index.html`) si trova nella directory corrente.

    Vedrai Docker eseguire i passaggi definiti nel Dockerfile.

2.  **Eseguire il Container Docker:**
    Una volta che l'immagine è stata costruita con successo, esegui un container basato su di essa:
    ```bash
    docker run -d -p 8080:80 --name webserver-nginx il-mio-nginx-semplice
    ```
    - `docker run`: Il comando per creare ed avviare un nuovo container.
    - `-d`: Esegue il container in modalità "detached" (in background).
    - `-p 8080:80`: Mappa la porta 8080 del tuo computer (host) alla porta 80 del container (dove Nginx è in ascolto).
    - `--name webserver-nginx`: Assegna un nome "webserver-nginx" al container per identificarlo facilmente.
    - `il-mio-nginx-semplice`: Il nome dell'immagine da cui creare il container.

3.  **Verificare:**
    Apri il tuo browser web e vai a `http://localhost:8080`. Dovresti vedere la pagina "Ciao da Nginx in Docker!".

## Comandi Utili

-   Per fermare il container:
    ```bash
    docker stop webserver-nginx
    ```
-   Per rimuovere il container (dopo averlo fermato):
    ```bash
    docker rm webserver-nginx
    ```
-   Per listare le immagini:
    ```bash
    docker images
    ```
-   Per listare i container in esecuzione:
    ```bash
    docker ps
    ```
