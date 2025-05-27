# Teoria: Multi-stage Builds - Fondamenti

## Introduzione ai Multi-stage Builds

I **Multi-stage builds** rappresentano una delle feature più potenti di Docker, introdotta nella versione 17.05. Permettono di utilizzare multiple immagini `FROM` in un singolo Dockerfile, consentendo di separare nettamente le fasi di build da quelle di runtime.

## Problemi Risolti

### 1. Dimensioni Immagini Eccessive

**Problema Tradizionale:**
```dockerfile
# ❌ Approccio monolitico - Immagine finale molto grande
FROM node:16

WORKDIR /app

# Dipendenze di build E runtime nella stessa immagine
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    curl

COPY package*.json ./
RUN npm install  # Include devDependencies

COPY . .
RUN npm run build

# L'immagine finale contiene tutti i tool di build inutili
CMD ["npm", "start"]
```

**Soluzione Multi-stage:**
```dockerfile
# ✅ Separazione build e runtime
FROM node:16 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install  # Include devDependencies per build

COPY . .
RUN npm run build

# Immagine finale leggera
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Solo dipendenze runtime

# Copia solo artefatti necessari dal builder
COPY --from=builder /app/dist ./dist

CMD ["npm", "start"]
```

### 2. Gestione Dipendenze Complesse

**Scenario:** Applicazione che richiede compilazione nativa ma runtime minimale.

```dockerfile
# Stage 1: Ambiente di compilazione completo
FROM golang:1.19-alpine AS builder

# Installazione tool di build
RUN apk add --no-cache git gcc musl-dev

WORKDIR /app

# Dipendenze Go
COPY go.mod go.sum ./
RUN go mod download

# Compilazione
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o app .

# Stage 2: Runtime minimale
FROM alpine:latest

# Solo certificati SSL necessari
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Solo il binario compilato
COPY --from=builder /app/app .

CMD ["./app"]
```

## Anatomia Multi-stage Build

### Struttura Base

```dockerfile
# Stage 1: Build environment
FROM base-image:tag AS stage-name

# Istruzioni per il build
RUN build-commands
COPY source-files destination

# Stage 2: Test environment (opzionale)
FROM another-image:tag AS tester

COPY --from=stage-name /path/to/artifacts /test/
RUN test-commands

# Stage 3: Production environment
FROM minimal-image:tag

# Copia artefatti da stage precedenti
COPY --from=stage-name /built/app /app/
COPY --from=tester /test/results /app/test-results

CMD ["run-app"]
```

### Naming Strategies

```dockerfile
# Naming descrittivo degli stage
FROM node:16 AS dependencies
FROM node:16-alpine AS builder  
FROM nginx:alpine AS runtime

# Oppure per funzione
FROM ubuntu:20.04 AS compile-env
FROM ubuntu:20.04 AS test-env
FROM gcr.io/distroless/base AS production
```

## Patterns Fondamentali

### 1. Builder Pattern

**Caso d'uso:** Separare strumenti di build da runtime

```dockerfile
# === STAGE 1: BUILD ===
FROM rust:1.70 AS builder

WORKDIR /usr/src/app

# Ottimizzazione: cache dipendenze
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -f target/release/deps/myapp*

# Build applicazione reale
COPY src ./src
RUN cargo build --release

# === STAGE 2: RUNTIME ===
FROM debian:bookworm-slim

# Dipendenze runtime minime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m -s /bin/bash appuser

# Solo il binario necessario
COPY --from=builder /usr/src/app/target/release/myapp /usr/local/bin/

USER appuser
CMD ["myapp"]
```

### 2. Testing Pattern

**Caso d'uso:** Eseguire test durante build senza includerli nel finale

```dockerfile
# === STAGE 1: DEPENDENCIES ===
FROM node:16 AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# === STAGE 2: BUILD ===
FROM deps AS builder

COPY . .
RUN npm run build

# === STAGE 3: TESTING ===
FROM deps AS tester

COPY . .
RUN npm run test
RUN npm run lint
RUN npm run security-audit

# === STAGE 4: PRODUCTION ===
FROM node:16-alpine

WORKDIR /app

# Solo dipendenze runtime
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Artefatti build (esclusi test)
COPY --from=builder /app/dist ./dist

# Risultati test come metadata (opzionale)
COPY --from=tester /app/coverage ./coverage

USER node
CMD ["npm", "start"]
```

### 3. Development vs Production

**Caso d'uso:** Stessa base, target diversi

```dockerfile
# === BASE COMUNE ===
FROM python:3.11-slim AS base

WORKDIR /app
COPY requirements.txt ./

# === DEVELOPMENT ===
FROM base AS development

# Tool di sviluppo
RUN pip install -r requirements.txt && \
    pip install debugpy pytest black flake8

# Hot reload e debugging
COPY . .
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "app.py"]

# === PRODUCTION ===
FROM base AS production

# Solo dipendenze production
RUN pip install --no-cache-dir -r requirements.txt

# Non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

COPY --chown=app:app . .

# Configurazione production
ENV FLASK_ENV=production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

## Tecniche Avanzate

### 1. External Stage References

```dockerfile
# Referenziare immagini esterne come stage
FROM myregistry/build-tools:latest AS external-builder

# Usare artefatti da immagine esterna
FROM alpine:latest
COPY --from=external-builder /usr/local/bin/tool /usr/local/bin/
```

### 2. Conditional Stages

```dockerfile
FROM node:16 AS base

# Stage condizionale basato su ARG
ARG BUILD_MODE=production

FROM base AS development
RUN npm install

FROM base AS production  
RUN npm ci --only=production

# Selezione dinamica
FROM ${BUILD_MODE} AS final
COPY . .
CMD ["npm", "start"]
```

Build con target specifico:
```bash
# Development build
docker build --target development .

# Production build (default)
docker build .

# Conditional build
docker build --build-arg BUILD_MODE=development .
```

### 3. Parallel Builds

```dockerfile
# === PARALLEL STAGE 1 ===
FROM node:16 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# === PARALLEL STAGE 2 ===
FROM golang:1.19 AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o api

# === STAGE FINALE ===
FROM nginx:alpine

# Combina artefatti paralleli
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-builder /app/backend/api /usr/local/bin/

# Configurazione per SPA + API
COPY nginx.conf /etc/nginx/nginx.conf
```

## Ottimizzazioni Specifiche

### 1. Cache Layer Optimization

```dockerfile
# ❌ Cache invalidation frequente
FROM node:16 AS builder
COPY . /app
WORKDIR /app
RUN npm install && npm run build

# ✅ Cache optimization
FROM node:16 AS deps
WORKDIR /app
# Solo files di dipendenze (cache longeva)
COPY package*.json ./
RUN npm ci

FROM deps AS builder
# Codice sorgente (cache volatile)
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 2. Shared Dependencies

```dockerfile
# Base condivisa per multiple immagini
FROM node:16 AS node-base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Service 1
FROM node-base AS service1-builder
COPY service1/ .
RUN npm run build:service1

# Service 2  
FROM node-base AS service2-builder
COPY service2/ .
RUN npm run build:service2

# Deploy service 1
FROM node:16-alpine AS service1
COPY --from=service1-builder /app/dist ./
CMD ["npm", "start:service1"]

# Deploy service 2
FROM node:16-alpine AS service2
COPY --from=service2-builder /app/dist ./
CMD ["npm", "start:service2"]
```

### 3. Size Optimization Chain

```dockerfile
# === STAGE 1: FULL BUILD ENVIRONMENT ===
FROM ubuntu:20.04 AS full-builder

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    python3 \
    python3-pip

WORKDIR /build
COPY . .
RUN ./configure && make

# === STAGE 2: MINIMAL BUILDER ===
FROM alpine:latest AS minimal-builder

# Solo tool essenziali
RUN apk add --no-cache gcc musl-dev

COPY --from=full-builder /build/configured-source ./
RUN make install

# === STAGE 3: DISTROLESS RUNTIME ===
FROM gcr.io/distroless/base

# Solo binario finale
COPY --from=minimal-builder /usr/local/bin/app /app

ENTRYPOINT ["/app"]
```

## Debugging Multi-stage

### 1. Inspect Intermediate Stages

```bash
# Build fino a stage specifico
docker build --target builder -t myapp:builder .

# Debug dello stage
docker run -it myapp:builder /bin/bash

# Analizza layer
docker history myapp:builder
```

### 2. Multi-target Builds

```dockerfile
FROM node:16 AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM deps AS dev
COPY . .
CMD ["npm", "run", "dev"]

FROM deps AS test  
COPY . .
RUN npm test

FROM deps AS build
COPY . .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
```

Script di build:
```bash
#!/bin/bash

# Build tutti i target
docker build --target dev -t myapp:dev .
docker build --target test -t myapp:test .
docker build --target prod -t myapp:prod .

# Test
docker run myapp:test

# Deploy
docker run -p 80:80 myapp:prod
```

## Performance Considerations

### 1. Build Context Optimization

```dockerignore
# .dockerignore per multi-stage
**/node_modules
**/.git
**/coverage
**/dist
*.log

# Ma includi file necessari per build
!package*.json
!src/**
!public/**
```

### 2. Parallel Execution

```dockerfile
# Layout per massimo parallelismo
FROM base AS stage1
# Operazioni indipendenti

FROM base AS stage2  
# Operazioni indipendenti

FROM base AS stage3
# Operazioni indipendenti

# Combinazione finale
FROM final-base
COPY --from=stage1 /output1 ./
COPY --from=stage2 /output2 ./
COPY --from=stage3 /output3 ./
```

## Conclusioni

I Multi-stage builds sono essenziali per:

1. **Riduzione dimensioni**: Separazione build tools da runtime
2. **Sicurezza**: Esclusione tools potenzialmente pericolosi
3. **Performance**: Ottimizzazione cache e builds paralleli
4. **Flessibilità**: Target multipli da stesso Dockerfile
5. **Separazione responsabilità**: Build, test, deploy isolati

### Quando Usare Multi-stage

- ✅ Applicazioni che richiedono compilazione
- ✅ Linguaggi con build tools pesanti (Node.js, Java, .NET)
- ✅ Separazione environment dev/prod
- ✅ Pipeline CI/CD integrate
- ✅ Ottimizzazione dimensioni immagini

### Best Practices

- Ordina stage per frequenza di cambiamento
- Usa nomi descrittivi per gli stage
- Ottimizza per cache Docker
- Minimizza quello che copi tra stage
- Documenta dipendenze tra stage

Il prossimo step è esplorare pattern avanzati e casi d'uso specifici per framework popolari.
