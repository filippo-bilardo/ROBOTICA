# Teoria: Fondamenti dei Dockerfile

## Introduzione ai Dockerfile

Un **Dockerfile** è un file di testo che contiene una serie di istruzioni per costruire automaticamente un'immagine Docker. È il cuore dell'approccio "Infrastructure as Code" di Docker, permettendo di definire l'ambiente applicativo in modo riproducibile e versionabile.

## Struttura di Base

### Anatomia di un Dockerfile

```dockerfile
# Commento: definisce l'immagine base
FROM ubuntu:20.04

# Metadati dell'immagine
LABEL maintainer="developer@example.com"
LABEL version="1.0"

# Variabili d'ambiente
ENV NODE_VERSION=16.0.0
ENV APP_HOME=/app

# Esecuzione comandi durante la build
RUN apt-get update && apt-get install -y nodejs npm

# Definizione directory di lavoro
WORKDIR $APP_HOME

# Copia file dall'host al container
COPY package.json .
COPY src/ ./src/

# Installazione dipendenze
RUN npm install

# Esposizione porte
EXPOSE 3000

# Comando di default
CMD ["npm", "start"]
```

## Istruzioni Principali

### 1. FROM - Immagine Base

L'istruzione `FROM` definisce l'immagine base da cui partire:

```dockerfile
# Immagine specifica con tag
FROM node:16-alpine

# Immagine con digest per sicurezza
FROM node@sha256:abc123...

# Multi-stage build
FROM node:16 AS builder
```

**Best Practices:**
- Usa immagini ufficiali quando possibile
- Preferisci tag specifici invece di `latest`
- Considera immagini Alpine per dimensioni ridotte

### 2. RUN - Esecuzione Comandi

Esegue comandi durante la fase di build:

```dockerfile
# Comando singolo
RUN npm install

# Comandi multipli (inefficiente)
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# Comandi concatenati (efficiente)
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

**Best Practices:**
- Raggruppa comandi correlati in una singola istruzione RUN
- Pulisci cache e file temporanei nella stessa istruzione
- Usa backslash per migliorare leggibilità

### 3. COPY vs ADD

#### COPY - Copia Semplice
```dockerfile
# Copia file specifico
COPY package.json /app/

# Copia directory
COPY src/ /app/src/

# Copia con pattern
COPY *.json /app/
```

#### ADD - Copia Avanzata
```dockerfile
# Funzionalità di COPY + estrazione archivi
ADD archive.tar.gz /app/

# Download da URL (sconsigliato)
ADD https://example.com/file.tar.gz /app/
```

**Best Practices:**
- Preferisci COPY ad ADD per operazioni semplici
- Usa ADD solo per estrazione automatica di archivi
- Evita ADD per download URL

### 4. WORKDIR - Directory di Lavoro

```dockerfile
# Imposta directory corrente
WORKDIR /app

# Equivalente a mkdir + cd
WORKDIR /path/to/workdir

# Usa variabili d'ambiente
ENV APP_HOME=/app
WORKDIR $APP_HOME
```

### 5. ENV - Variabili d'Ambiente

```dockerfile
# Singola variabile
ENV NODE_ENV=production

# Multiple variabili
ENV NODE_ENV=production \
    PORT=3000 \
    DEBUG=false

# Utilizzabile in altre istruzioni
ENV APP_HOME=/app
WORKDIR $APP_HOME
```

### 6. EXPOSE - Documentazione Porte

```dockerfile
# Documenta porte utilizzate
EXPOSE 3000
EXPOSE 8080/tcp
EXPOSE 8081/udp

# Multiple porte
EXPOSE 3000 8080 9000
```

**Nota:** EXPOSE è solo documentale, non pubblica automaticamente le porte.

### 7. CMD vs ENTRYPOINT

#### CMD - Comando Predefinito
```dockerfile
# Forma array (preferita)
CMD ["npm", "start"]

# Forma shell
CMD npm start

# Può essere sovrascritta
docker run image command
```

#### ENTRYPOINT - Punto di Ingresso Fisso
```dockerfile
# Sempre eseguito
ENTRYPOINT ["node"]

# Combinato con CMD
ENTRYPOINT ["node"]
CMD ["app.js"]

# Script di inizializzazione
ENTRYPOINT ["./docker-entrypoint.sh"]
```

#### Combinazione ENTRYPOINT + CMD
```dockerfile
ENTRYPOINT ["node"]
CMD ["app.js"]

# Esecuzione: node app.js
# Con override: docker run image server.js -> node server.js
```

## Ottimizzazione delle Immagini

### 1. Layering Strategy

Ogni istruzione crea un layer. Ordina le istruzioni per massimizzare cache:

```dockerfile
# ❌ Inefficiente - invalida cache ad ogni modifica codice
FROM node:16
COPY . /app
WORKDIR /app
RUN npm install

# ✅ Efficiente - cache npm install finché package.json non cambia
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
```

### 2. Multi-stage Builds Preview

```dockerfile
# Stage 1: Build
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 3. Riduzione Dimensioni

```dockerfile
# Usa immagini Alpine
FROM node:16-alpine

# Rimuovi cache in stesso layer
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Usa .dockerignore
# File .dockerignore:
node_modules
.git
*.log
```

## Sicurezza nei Dockerfile

### 1. Utenti Non-Root

```dockerfile
# Crea utente non privilegiato
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Cambia proprietà file
RUN chown -R appuser:appuser /app

# Switch a utente non-root
USER appuser
```

### 2. Gestione Segreti

```dockerfile
# ❌ Non fare mai così
ENV SECRET_KEY=my-secret-key

# ✅ Usa build-time secrets (BuildKit)
# docker build --secret id=mysecret,src=./secret.txt .
RUN --mount=type=secret,id=mysecret \
    SECRET=$(cat /run/secrets/mysecret) && \
    echo "Using secret: $SECRET"
```

### 3. Vulnerabilità Scanning

```dockerfile
# Aggiungi metadata per scanning
LABEL security.scan=enabled
LABEL security.policy=strict

# Mantieni sistema aggiornato
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean
```

## Best Practices Avanzate

### 1. Dockerfile Linting

Usa `hadolint` per validare Dockerfile:

```bash
# Installazione hadolint
wget -O hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
chmod +x hadolint

# Controllo Dockerfile
./hadolint Dockerfile
```

### 2. Determinismo delle Build

```dockerfile
# Usa versioni specifiche
FROM node:16.14.2-alpine

# Hash specifici per pacchetti
RUN npm install package@1.2.3

# Date fisse per riproducibilità
ENV BUILD_DATE=2024-01-15
```

### 3. Gestione Dipendenze

```dockerfile
# Lock file per riproducibilità
COPY package-lock.json ./

# Clean install per CI/CD
RUN npm ci --only=production

# Verifica integrità
RUN npm audit --audit-level moderate
```

## Debugging e Troubleshooting

### 1. Build Context

```dockerfile
# Controlla dimensione build context
# docker build . --no-cache --progress=plain

# Usa .dockerignore per escludere file
# .dockerignore:
.git
node_modules
*.log
.DS_Store
```

### 2. Intermediate Layers

```dockerfile
# Debug layer specifico
RUN echo "Debug point 1" && ls -la
COPY . .
RUN echo "Debug point 2" && ls -la /app
```

### 3. Build Cache

```bash
# Build senza cache
docker build --no-cache .

# Build con cache specifico
docker build --cache-from=myimage:latest .

# Analisi layer
docker history myimage:latest
```

## Patterns Comuni

### 1. Node.js Application

```dockerfile
FROM node:16-alpine

# Security: non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Dependencies first (cache optimization)
COPY package*.json ./
RUN npm ci --only=production

# Application code
COPY --chown=nextjs:nodejs . .

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Python Application

```dockerfile
FROM python:3.9-slim

# System dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application
WORKDIR /app
COPY . .

# Non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

CMD ["python", "app.py"]
```

### 3. Static Website

```dockerfile
FROM nginx:alpine

# Custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Static files
COPY dist/ /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
```

## Conclusioni

Un Dockerfile ben strutturato è fondamentale per:

1. **Riproducibilità**: Stesso ambiente in dev, test e produzione
2. **Sicurezza**: Pratiche sicure e utenti non privilegiati
3. **Performance**: Immagini leggere e build cache ottimizzate
4. **Manutenibilità**: Codice pulito e documentato

### Checklist Dockerfile

- [ ] Usa immagine base ufficiale con tag specifico
- [ ] Ordina istruzioni per ottimizzare cache
- [ ] Raggruppa comandi RUN correlati
- [ ] Crea utente non-root
- [ ] Usa .dockerignore
- [ ] Aggiungi HEALTHCHECK
- [ ] Documenta con LABEL
- [ ] Testa con hadolint

Il prossimo step è padroneggiare i Multi-stage builds per ottimizzazioni avanzate e separazione delle fasi di build e runtime.
