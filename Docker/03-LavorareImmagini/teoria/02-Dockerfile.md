# Dockerfile: Istruzioni e Best Practices

In questa sezione esploreremo come creare immagini Docker personalizzate utilizzando i Dockerfile, comprendendo le istruzioni disponibili e le migliori pratiche da seguire.

## Cos'è un Dockerfile

Un Dockerfile è un file di testo che contiene una serie di istruzioni per costruire automaticamente un'immagine Docker. Funziona come una "ricetta" che specifica tutti i componenti e le configurazioni necessarie per l'immagine.

## Struttura Base di un Dockerfile

Un Dockerfile tipico segue questa struttura:

```dockerfile
# Commento
ISTRUZIONE argomenti
```

Le istruzioni vengono eseguite in ordine dall'alto verso il basso, e ogni istruzione crea un nuovo layer nell'immagine.

## Istruzioni Principali

### FROM

Specifica l'immagine base da cui partire. È quasi sempre la prima istruzione in un Dockerfile.

```dockerfile
FROM ubuntu:20.04
```

È possibile utilizzare `FROM scratch` per creare un'immagine da zero, senza base.

### RUN

Esegue comandi all'interno dell'immagine durante il processo di build.

```dockerfile
RUN apt-get update && apt-get install -y nginx
```

**Best practice**: Combinare più comandi RUN con `&&` per ridurre il numero di layer.

### COPY e ADD

Copiano file dalla macchina host all'immagine.

```dockerfile
COPY ./app /app
ADD ./archive.tar.gz /opt/
```

**Differenze**:
- `COPY`: semplice copia di file e directory
- `ADD`: come COPY, ma può anche estrarre archivi e scaricare file da URL

**Best practice**: Preferire COPY quando non è necessaria l'estrazione di archivi.

### WORKDIR

Imposta la directory di lavoro per le istruzioni successive.

```dockerfile
WORKDIR /app
```

**Best practice**: Usare WORKDIR invece di `RUN cd /app`.

### ENV

Imposta variabili d'ambiente.

```dockerfile
ENV NODE_ENV=production PORT=3000
```

### EXPOSE

Informa Docker che il container ascolterà su porte specifiche a runtime.

```dockerfile
EXPOSE 80 443
```

**Nota**: Non pubblica effettivamente le porte, serve solo come documentazione.

### CMD e ENTRYPOINT

Specificano il comando da eseguire quando il container viene avviato.

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
ENTRYPOINT ["nginx"]
```

**Differenze**:
- `CMD`: può essere sovrascritto dalla riga di comando
- `ENTRYPOINT`: definisce il comando principale, con CMD come argomenti predefiniti

**Best practice**: Usare la forma exec (array JSON) invece della forma shell.

### VOLUME

Crea un punto di montaggio per volumi esterni.

```dockerfile
VOLUME ["/data"]
```

### USER

Imposta l'utente per le istruzioni successive e per il container in esecuzione.

```dockerfile
USER nginx
```

**Best practice**: Non eseguire applicazioni come root.

### ARG

Definisce variabili utilizzabili durante il build.

```dockerfile
ARG VERSION=latest
FROM nginx:${VERSION}
```

## Multi-stage Builds

I build multi-stage permettono di utilizzare più istruzioni FROM nello stesso Dockerfile, consentendo di copiare artefatti da uno stage all'altro, riducendo significativamente la dimensione dell'immagine finale.

```dockerfile
# Stage di build
FROM node:14 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage di produzione
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Best Practices

### Ottimizzazione della Cache

1. **Ordine delle istruzioni**: Posizionare le istruzioni che cambiano meno frequentemente all'inizio del Dockerfile.
2. **Minimizzare il numero di layer**: Combinare comandi RUN correlati.

### Dimensione dell'Immagine

1. **Utilizzare immagini base leggere**: Alpine Linux invece di Ubuntu quando possibile.
2. **Pulire dopo l'installazione**: Rimuovere cache e file temporanei nello stesso layer.

```dockerfile
RUN apt-get update && \
    apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*
```

3. **Multi-stage builds**: Separare build e runtime.

### Sicurezza

1. **Non eseguire come root**: Utilizzare l'istruzione USER.
2. **Minimizzare i pacchetti installati**: Installare solo ciò che è necessario.
3. **Utilizzare versioni specifiche**: Evitare tag come `latest`.

### Riproducibilità

1. **Specificare versioni esatte**: Per immagini base e dipendenze.
2. **Utilizzare .dockerignore**: Escludere file non necessari.

## .dockerignore

Il file `.dockerignore` permette di escludere file e directory dal contesto di build, migliorando le prestazioni e prevenendo l'inclusione accidentale di file sensibili.

```
node_modules
.git
.env
*.log
```

## Esempio Completo

Ecco un esempio di Dockerfile ottimizzato per un'applicazione Node.js:

```dockerfile
# Stage di build
FROM node:14-alpine AS builder

WORKDIR /app

# Installa dipendenze
COPY package*.json ./
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Compila l'applicazione
RUN npm run build

# Stage di produzione
FROM node:14-alpine

WORKDIR /app

# Crea un utente non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Imposta variabili d'ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Copia solo i file necessari dal builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Espone la porta
EXPOSE 3000

# Imposta l'utente non-root
USER appuser

# Comando di avvio
CMD ["node", "dist/index.js"]
```

## Strumenti di Ottimizzazione

Esistono strumenti che possono aiutare a ottimizzare i Dockerfile:

- **docker-slim**: Riduce automaticamente la dimensione delle immagini
- **hadolint**: Linter per Dockerfile che verifica le best practices
- **dive**: Analizza i layer delle immagini Docker

## Conclusione

Creare Dockerfile efficienti è un'arte che richiede pratica. Seguendo le best practices, è possibile creare immagini Docker che sono leggere, sicure e facili da mantenere.

Nella prossima sezione, esploreremo come gestire e condividere le immagini Docker attraverso i registry.

## Navigazione
- [⬅️ Anatomia di un'Immagine Docker](./01-AnatomiaImmagine.md)
- [➡️ Registry e Condivisione Immagini](./03-Registry.md)
- [📑 Torna all'indice](../README.md)