# Esempio di Semplice Dockerfile

Questo esempio mostra come creare un'immagine Docker per un sito web statico utilizzando Nginx come server web.

## Struttura del Progetto

```
01-SempliceDockerfile/
├── Dockerfile        # Definizione dell'immagine Docker
└── html/             # Directory contenente i file del sito web
    └── index.html    # Pagina web di esempio
```

## Il Dockerfile Spiegato

Il Dockerfile in questo esempio:

1. Utilizza `nginx:alpine` come immagine base (leggera e sicura)
2. Aggiunge metadati all'immagine tramite etichette (LABEL)
3. Copia i file HTML nella directory corretta di Nginx
4. Espone la porta 80 per il traffico HTTP

## Istruzioni per l'Utilizzo

### 1. Costruire l'Immagine

Esegui il seguente comando nella directory contenente il Dockerfile:

```bash
docker build -t sito-web-statico .
```

Questo comando costruisce un'immagine Docker e la etichetta come `sito-web-statico`.

### 2. Verificare la Creazione dell'Immagine

```bash
docker images
```

Dovresti vedere la tua nuova immagine `sito-web-statico` nell'elenco.

### 3. Eseguire un Container

```bash
docker run -d -p 8080:80 --name mio-sito sito-web-statico
```

Questo comando:
- Avvia un container in background (`-d`)
- Mappa la porta 8080 del tuo computer alla porta 80 del container (`-p 8080:80`)
- Assegna il nome `mio-sito` al container

### 4. Accedere al Sito Web

Apri il browser e vai all'indirizzo:

```
http://localhost:8080
```

Dovresti vedere la pagina web di esempio.

### 5. Fermare e Rimuovere il Container

```bash
docker stop mio-sito
docker rm mio-sito
```

## Esercizi Aggiuntivi

1. Modifica il file `html/index.html` e ricostruisci l'immagine. Osserva come i cambiamenti vengono riflessi nel container.

2. Aggiungi altri file HTML o CSS nella directory `html/` e ricostruisci l'immagine.

3. Modifica il Dockerfile per utilizzare un'immagine base diversa, come `httpd:alpine` (Apache) invece di Nginx, e adatta il percorso di copia dei file.

## Concetti Appresi

- Creazione di un Dockerfile di base
- Utilizzo dell'istruzione FROM per specificare un'immagine base
- Utilizzo dell'istruzione COPY per aggiungere file all'immagine
- Utilizzo dell'istruzione EXPOSE per documentare le porte utilizzate
- Processo di build ed esecuzione di un'immagine Docker