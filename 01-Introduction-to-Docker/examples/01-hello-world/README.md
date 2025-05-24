# Esempio 01: Hello World

Questo è il primo e più semplice esempio per verificare che la tua installazione Docker funzioni correttamente.

## Esecuzione

Apri un terminale ed esegui il seguente comando:

```bash
docker run hello-world
```

## Cosa Succede?

Quando esegui questo comando, Docker compie i seguenti passi:
1.  **Verifica Locale:** Il client Docker (la CLI) contatta il Docker Daemon.
2.  **Ricerca Immagine:** Il Docker Daemon verifica se l'immagine `hello-world` è presente localmente.
3.  **Download (Pull):** Se l'immagine non è locale, il Daemon la scarica (effettua un "pull") dal registro predefinito, Docker Hub. Vedrai un output simile a:
    ```
    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    Digest: sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    Status: Downloaded newer image for hello-world:latest
    ```
4.  **Creazione ed Esecuzione Container:** Una volta che l'immagine è disponibile, il Daemon crea un nuovo container basato su quell'immagine ed esegue il comando predefinito specificato nell'immagine `hello-world`.
5.  **Output:** Il container `hello-world` è programmato per stampare un messaggio di saluto e alcune informazioni su Docker, e poi terminare. L'output che vedrai sarà simile a:
    ```
    Hello from Docker!
    This message shows that your installation appears to be working correctly.

    To generate this message, Docker took the following steps:
     1. The Docker client contacted the Docker daemon.
     2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
        (amd64)
     3. The Docker daemon created a new container from that image which runs the
        executable that produces the output you are currently reading.
     4. The Docker daemon streamed that output to the Docker client, which sent it
        to your terminal.
    ```

Questo semplice test conferma che tutti i componenti di Docker sono installati e funzionano come previsto!
