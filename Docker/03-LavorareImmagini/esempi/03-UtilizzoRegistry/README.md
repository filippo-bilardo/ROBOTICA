# Esempio di Utilizzo dei Registry Docker

Questo esempio dimostra come utilizzare i registry Docker per archiviare e condividere le immagini Docker, concentrandosi su Docker Hub e registry locali.

## Prerequisiti

- Docker installato e funzionante
- Un account Docker Hub (per il push su Docker Hub)

## Struttura del Progetto

```
03-UtilizzoRegistry/
├── README.md        # Questo file di istruzioni
├── Dockerfile       # Definizione dell'immagine Docker di esempio
└── app/             # Directory contenente l'applicazione di esempio
    └── index.html   # Pagina web di esempio
```

## Parte 1: Utilizzo di Docker Hub

### 1. Costruire un'Immagine Locale

Prima di tutto, costruiamo un'immagine Docker utilizzando il Dockerfile fornito:

```bash
docker build -t mia-app:1.0 .
```

### 2. Taggare l'Immagine per Docker Hub

Per caricare un'immagine su Docker Hub, è necessario taggarla con il tuo nome utente:

```bash
# Sostituisci "username" con il tuo nome utente Docker Hub
docker tag mia-app:1.0 username/mia-app:1.0
```

### 3. Autenticarsi su Docker Hub

```bash
docker login
```

Inserisci le tue credenziali Docker Hub quando richiesto.

### 4. Caricare l'Immagine su Docker Hub

```bash
# Sostituisci "username" con il tuo nome utente Docker Hub
docker push username/mia-app:1.0
```

### 5. Verificare il Caricamento

Visita `https://hub.docker.com/r/username/mia-app` nel tuo browser per verificare che l'immagine sia stata caricata correttamente.

### 6. Scaricare l'Immagine da Docker Hub

Per simulare il download dell'immagine da un altro computer, rimuovi prima l'immagine locale:

```bash
docker rmi username/mia-app:1.0
docker rmi mia-app:1.0
```

Poi scarica l'immagine da Docker Hub:

```bash
docker pull username/mia-app:1.0
```

## Parte 2: Utilizzo di un Registry Locale

### 1. Avviare un Registry Docker Locale

```bash
docker run -d -p 5000:5000 --name registry registry:2
```

Questo comando avvia un registry Docker locale sulla porta 5000.

### 2. Taggare l'Immagine per il Registry Locale

```bash
docker tag mia-app:1.0 localhost:5000/mia-app:1.0
```

### 3. Caricare l'Immagine sul Registry Locale

```bash
docker push localhost:5000/mia-app:1.0
```

### 4. Verificare le Immagini nel Registry Locale

```bash
curl http://localhost:5000/v2/_catalog
```

Questo comando dovrebbe mostrare un elenco di repository nel registry locale, incluso `mia-app`.

### 5. Scaricare l'Immagine dal Registry Locale

Per simulare il download dell'immagine, rimuovi prima l'immagine locale:

```bash
docker rmi localhost:5000/mia-app:1.0
```

Poi scarica l'immagine dal registry locale:

```bash
docker pull localhost:5000/mia-app:1.0
```

## Parte 3: Gestione delle Immagini

### 1. Visualizzare le Immagini Locali

```bash
docker images
```

### 2. Ispezionare un'Immagine

```bash
docker inspect mia-app:1.0
```

### 3. Visualizzare la Storia di un'Immagine

```bash
docker history mia-app:1.0
```

### 4. Eliminare un'Immagine

```bash
docker rmi mia-app:1.0
```

## Parte 4: Pulizia

### 1. Fermare e Rimuovere il Registry Locale

```bash
docker stop registry
docker rm registry
```

### 2. Logout da Docker Hub

```bash
docker logout
```

## Concetti Appresi

- Tagging delle immagini Docker
- Autenticazione e interazione con Docker Hub
- Configurazione e utilizzo di un registry Docker locale
- Gestione delle immagini Docker

## Note Importanti

- Per ambienti di produzione, è consigliabile configurare il registry locale con TLS e autenticazione
- Docker Hub ha limiti di download per account gratuiti
- Per progetti aziendali, considerare servizi come AWS ECR, Google Container Registry o Azure Container Registry