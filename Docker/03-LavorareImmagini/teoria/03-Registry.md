# Registry e Condivisione Immagini

In questa sezione esploreremo come gestire, archiviare e condividere le immagini Docker attraverso i registry, comprendendo i concetti fondamentali e le operazioni più comuni.

## Cos'è un Registry Docker

Un registry Docker è un servizio di archiviazione e distribuzione per immagini Docker. Funziona come un repository centralizzato dove è possibile caricare (push) e scaricare (pull) immagini Docker.

## Tipi di Registry

### Docker Hub

Docker Hub è il registry pubblico ufficiale di Docker, che ospita migliaia di immagini pronte all'uso.

**Caratteristiche principali**:
- Repository pubblici gratuiti
- Repository privati (con limiti nel piano gratuito)
- Immagini ufficiali verificate
- Integrazione con GitHub e Bitbucket

### Registry Privati

Per esigenze aziendali o di sicurezza, è possibile utilizzare registry privati:

- **Docker Registry**: implementazione open-source di Docker
- **Docker Trusted Registry**: soluzione enterprise di Docker
- **Registry di terze parti**: AWS ECR, Google Container Registry, Azure Container Registry, GitHub Container Registry, ecc.

### Registry Locale

È possibile eseguire un registry Docker in locale per test o ambienti isolati:

```bash
docker run -d -p 5000:5000 --name registry registry:2
```

## Operazioni Fondamentali

### Autenticazione

Per interagire con registry che richiedono autenticazione:

```bash
# Login a Docker Hub
docker login

# Login a registry personalizzato
docker login registry.example.com
```

### Pull di Immagini

Scaricare un'immagine da un registry:

```bash
# Da Docker Hub
docker pull nginx:latest

# Da registry personalizzato
docker pull registry.example.com/myapp:1.0
```

### Push di Immagini

Caricare un'immagine su un registry:

```bash
# Taggare un'immagine locale per un registry
docker tag myapp:latest username/myapp:latest

# Push su Docker Hub
docker push username/myapp:latest

# Push su registry personalizzato
docker push registry.example.com/myapp:1.0
```

## Gestione delle Immagini

### Tagging

Il tagging è fondamentale per organizzare e versionare le immagini:

```bash
# Formato: docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
docker tag myapp:latest myapp:1.0.0
docker tag myapp:latest registry.example.com/myapp:latest
```

**Convenzioni comuni per i tag**:
- `latest`: versione più recente (attenzione: può cambiare nel tempo)
- `stable`: versione stabile
- Versioni semantiche: `1.0.0`, `2.1.3`
- Varianti: `alpine`, `slim`

### Ricerca di Immagini

Cercare immagini su Docker Hub:

```bash
docker search nginx
```

### Ispezione di Immagini Remote

Visualizzare i metadati di un'immagine senza scaricarla completamente:

```bash
docker manifest inspect nginx:latest
```

## Sicurezza delle Immagini

### Scansione delle Vulnerabilità

Verificare la presenza di vulnerabilità nelle immagini:

```bash
# Con Docker Desktop
docker scan nginx:latest

# Con strumenti di terze parti come Trivy
trivy image nginx:latest
```

### Firma delle Immagini

Docker Content Trust permette di firmare e verificare le immagini:

```bash
# Abilitare Docker Content Trust
export DOCKER_CONTENT_TRUST=1

# Push di un'immagine firmata
docker push username/myapp:latest
```

## Registry Privato con Docker Compose

Esempio di configurazione di un registry privato con autenticazione e TLS:

```yaml
version: '3'

services:
  registry:
    image: registry:2
    ports:
      - "5000:5000"
    environment:
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: "Registry Realm"
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd
      REGISTRY_HTTP_TLS_CERTIFICATE: /certs/domain.crt
      REGISTRY_HTTP_TLS_KEY: /certs/domain.key
    volumes:
      - ./auth:/auth
      - ./certs:/certs
      - ./data:/var/lib/registry
```

## Pulizia delle Immagini

### Garbage Collection

I registry Docker accumulano dati nel tempo. La garbage collection permette di rimuovere layer non utilizzati:

```bash
# Per registry locale
docker exec -it registry bin/registry garbage-collect /etc/docker/registry/config.yml
```

### Politiche di Retention

È possibile configurare politiche per mantenere solo un certo numero di versioni o rimuovere immagini non utilizzate da un certo periodo.

## Automazione con CI/CD

Integrare la gestione delle immagini nei pipeline CI/CD:

1. **Build dell'immagine** durante il processo di CI
2. **Tagging automatico** basato su branch, tag git o versioni
3. **Push al registry** dopo test superati
4. **Deploy** basato sulle nuove immagini

Esempio con GitHub Actions:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: username/myapp:latest
```

## Best Practices

1. **Utilizzare tag specifici** invece di `latest`
2. **Implementare CI/CD** per automatizzare build e push
3. **Scansionare regolarmente** le immagini per vulnerabilità
4. **Utilizzare registry privati** per immagini sensibili
5. **Implementare politiche di retention** per gestire lo spazio
6. **Documentare** le immagini con README e metadati

## Conclusione

I registry Docker sono componenti fondamentali nell'ecosistema Docker, permettendo di archiviare, versionare e distribuire immagini in modo efficiente. La scelta del registry giusto e l'implementazione di buone pratiche di gestione sono essenziali per un flusso di lavoro Docker efficace e sicuro.

Nella prossima sezione, esploreremo come utilizzare Docker Compose per gestire applicazioni multi-container.

## Navigazione
- [⬅️ Dockerfile: Istruzioni e Best Practices](./02-Dockerfile.md)
- [📑 Torna all'indice](../README.md)