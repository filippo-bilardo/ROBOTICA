# Teoria: Best Practices e Sicurezza Dockerfile

## Principi Fondamentali

### 1. Principio del Minimo Privilegio

Il principio di sicurezza più importante in Docker è eseguire container con i privilegi minimi necessari.

#### Utenti Non-Root

```dockerfile
# ❌ Esecuzione come root (default)
FROM ubuntu:20.04
COPY app /app
CMD ["/app"]

# ✅ Creazione e utilizzo utente dedicato
FROM ubuntu:20.04

# Metodo 1: Utente semplice
RUN useradd -m -s /bin/bash appuser
USER appuser

# Metodo 2: Utente con ID specifico
RUN groupadd -r -g 1001 appgroup && \
    useradd -r -u 1001 -g appgroup appuser

# Metodo 3: Alpine Linux
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

COPY --chown=appuser:appgroup app /app
USER appuser
CMD ["/app"]
```

#### Gestione Permessi

```dockerfile
FROM node:16-alpine

# Crea directory con permessi corretti
RUN mkdir -p /app && \
    addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs && \
    chown -R nodejs:nodejs /app

WORKDIR /app

# Copia file con ownership corretto
COPY --chown=nodejs:nodejs package*.json ./
RUN npm ci --only=production

COPY --chown=nodejs:nodejs . .

# Switch a utente non privilegiato
USER nodejs

EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Gestione Sicura dei Segreti

#### Build-time Secrets con BuildKit

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine:latest

# ❌ MAI fare così - segreti in environment
ENV API_KEY=secret123

# ❌ MAI fare così - segreti in layer
RUN echo "secret123" > /tmp/secret
RUN process_secret.sh
RUN rm /tmp/secret  # Il segreto rimane nel layer!

# ✅ Usa BuildKit secrets
RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && \
    configure_app.sh "$API_KEY"

# ✅ Multi-stage per segreti build-time
FROM alpine:latest AS secrets
RUN --mount=type=secret,id=api_key \
    process_secrets.sh /run/secrets/api_key > /tmp/config

FROM alpine:latest AS final
COPY --from=secrets /tmp/config /app/config
```

#### Runtime Secrets

```dockerfile
FROM alpine:latest

# Configurazione per segreti runtime
RUN mkdir -p /run/secrets && \
    chown 1001:1001 /run/secrets

# Script di inizializzazione che gestisce segreti
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["app"]
```

Script `docker-entrypoint.sh`:
```bash
#!/bin/sh
set -e

# Carica segreti da file se presenti
if [ -f /run/secrets/db_password ]; then
    export DB_PASSWORD=$(cat /run/secrets/db_password)
fi

if [ -f /run/secrets/api_key ]; then
    export API_KEY=$(cat /run/secrets/api_key)
fi

# Esegui comando principale
exec "$@"
```

### 3. Scanning Vulnerabilità

#### Dockerfile per Security Scanning

```dockerfile
FROM alpine:3.18

# Metadati per security scanning
LABEL security.scan="enabled"
LABEL security.policy="strict"
LABEL org.opencontainers.image.vendor="MyCompany"
LABEL org.opencontainers.image.title="Secure App"

# Aggiornamenti sicurezza
RUN apk update && \
    apk upgrade && \
    apk add --no-cache ca-certificates tzdata && \
    rm -rf /var/cache/apk/*

# Installazione pacchetti con versioni specifiche
RUN apk add --no-cache \
    curl=8.0.1-r0 \
    openssl=3.1.0-r4

# Verifica integrità certificati
RUN update-ca-certificates

# Non-root user con ID fisso
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Directory con permessi restrittivi
RUN mkdir -p /app && \
    chown appuser:appgroup /app && \
    chmod 750 /app

WORKDIR /app
USER appuser

# Health check per monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
```

#### Integrazione con Scanner

```bash
# Trivy scanning
trivy image myapp:latest

# Anchore scanning
anchore-cli image add myapp:latest
anchore-cli image wait myapp:latest
anchore-cli image vuln myapp:latest all

# Docker Scout (nuovo)
docker scout cves myapp:latest
```

## Ottimizzazione delle Performance

### 1. Gestione Layer e Cache

#### Strategia di Layering Ottimale

```dockerfile
FROM node:16-alpine

# Layer 1: Metadati (raramente cambiano)
LABEL maintainer="dev@company.com"
LABEL version="1.0.0"

# Layer 2: Dipendenze sistema (rare modifiche)
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Layer 3: Configurazione applicazione (modifiche moderate)
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# Layer 4: Dipendenze applicazione (modifiche frequenti dependencies)
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Layer 5: Codice applicazione (modifiche molto frequenti)
COPY . .

# Layer 6: Configurazione runtime
USER node
EXPOSE 3000
CMD ["dumb-init", "node", "server.js"]
```

#### Cache Mount per Dipendenze

```dockerfile
# syntax=docker/dockerfile:1
FROM node:16-alpine

WORKDIR /app

# Cache npm per builds multiple
RUN --mount=type=cache,target=/root/.npm \
    npm set cache /root/.npm

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

COPY . .
CMD ["npm", "start"]
```

### 2. Immagini Distroless

```dockerfile
# Multi-stage con immagine distroless
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Immagine finale distroless
FROM gcr.io/distroless/nodejs16-debian11

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["dist/server.js"]
```

### 3. Ottimizzazione Dimensioni

#### .dockerignore Avanzato

```dockerignore
# File di sviluppo
*.md
.git
.gitignore
.dockerignore

# Dependencies
node_modules
npm-debug.log*

# Testing
coverage/
.nyc_output
test/
tests/
*.test.js
*.spec.js

# Environment files
.env*
!.env.example

# Documentation
docs/
*.md
README*

# CI/CD
.github/
.gitlab-ci.yml
Jenkinsfile

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Cache
.cache/
.tmp/
```

#### Cleanup Automatico

```dockerfile
FROM ubuntu:20.04

# Single RUN con cleanup completo
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        build-essential \
    && \
    # Operazioni che richiedono build tools
    curl -o app.tar.gz https://example.com/app.tar.gz && \
    tar -xzf app.tar.gz && \
    cd app && \
    make install && \
    # Cleanup completo nello stesso layer
    cd / && \
    rm -rf app app.tar.gz && \
    apt-get remove -y build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

## Patterns di Sicurezza Avanzati

### 1. Init Systems

```dockerfile
FROM alpine:latest

# Installa dumb-init per gestione processi
RUN apk add --no-cache dumb-init

# Crea utente non privilegiato
RUN adduser -D -s /bin/sh appuser

COPY app /usr/local/bin/app
RUN chmod +x /usr/local/bin/app

USER appuser

# dumb-init gestisce segnali e processi zombie
ENTRYPOINT ["dumb-init", "--"]
CMD ["app"]
```

### 2. Read-only Root Filesystem

```dockerfile
FROM alpine:latest

RUN adduser -D appuser && \
    mkdir -p /app /tmp/app-cache && \
    chown appuser:appuser /app /tmp/app-cache

COPY --chown=appuser:appuser app /app/

USER appuser
WORKDIR /app

# Filesystem read-only con tmpfs per cache
# docker run --read-only --tmpfs /tmp myapp
```

### 3. Capabilities Dropping

```dockerfile
FROM alpine:latest

# Installazione con capabilities minime
RUN apk add --no-cache libcap

COPY app /usr/local/bin/app
RUN setcap 'cap_net_bind_service=+ep' /usr/local/bin/app

RUN adduser -D appuser
USER appuser

# Container può bindare porte privilegiate senza root
EXPOSE 80
CMD ["app"]
```

## Monitoring e Observability

### 1. Health Checks Avanzati

```dockerfile
FROM node:16-alpine

# Installazione curl per health checks
RUN apk add --no-cache curl

COPY . /app
WORKDIR /app
RUN npm ci --only=production

# Health check multi-level
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js

CMD ["npm", "start"]
```

Script `healthcheck.js`:
```javascript
const http = require('http');
const process = require('process');

const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    timeout: 5000
};

const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        console.error(`Health check failed with status: ${res.statusCode}`);
        process.exit(1);
    }
});

req.on('error', (err) => {
    console.error(`Health check error: ${err.message}`);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('Health check timed out');
    req.destroy();
    process.exit(1);
});

req.end();
```

### 2. Logging Structured

```dockerfile
FROM node:16-alpine

# Configurazione logging
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json

COPY . /app
WORKDIR /app
RUN npm ci --only=production

# Non-root user
RUN adduser -D appuser
USER appuser

# Structured logging su stdout
CMD ["npm", "start"]
```

### 3. Metrics Endpoint

```dockerfile
FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/app .

# Prometheus metrics endpoint
EXPOSE 8080 9090

CMD ["./app"]
```

## Testing e Validazione

### 1. Container Structure Tests

```dockerfile
FROM node:16-alpine

# Metadati per testing
LABEL test.user="appuser"
LABEL test.port="3000"
LABEL test.healthcheck="/health"

RUN adduser -D appuser
COPY --chown=appuser:appuser . /app
WORKDIR /app
RUN npm ci --only=production

USER appuser
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/health
CMD ["npm", "start"]
```

File `container-structure-test.yaml`:
```yaml
schemaVersion: '2.0.0'

metadataTest:
  labels:
    - key: 'test.user'
      value: 'appuser'
    - key: 'test.port'
      value: '3000'

fileExistenceTests:
  - name: 'app files'
    path: '/app/package.json'
    shouldExist: true
  - name: 'no root files'
    path: '/root'
    shouldExist: false

commandTests:
  - name: 'user check'
    command: 'whoami'
    expectedOutput: ['appuser']
    
  - name: 'port listening'
    setup: [['npm', 'start']]
    command: 'netstat'
    expectedOutput: ['3000']
```

### 2. Hadolint Configuration

File `.hadolint.yaml`:
```yaml
rules:
  DL3008:
    level: error
  DL3009:
    level: error
  DL3015:
    level: info
  DL3025:
    level: error
  DL4006:
    level: error

ignored:
  - DL3016  # Pin versions in npm
  - DL3059  # Multiple consecutive RUN

trustedRegistries:
  - docker.io
  - gcr.io
  - quay.io
```

## Conclusioni

Le best practices per Dockerfile sicuri e performanti includono:

### Checklist Sicurezza
- [ ] Utente non-root con UID/GID fissi
- [ ] Gestione sicura dei segreti
- [ ] Immagini base aggiornate e verified
- [ ] Scanning vulnerabilità automatico
- [ ] Capabilities minime necessarie
- [ ] Read-only filesystem quando possibile

### Checklist Performance
- [ ] Ottimizzazione ordine layer
- [ ] Cache mount per dipendenze
- [ ] .dockerignore completo
- [ ] Cleanup in single RUN
- [ ] Multi-stage builds
- [ ] Immagini Alpine o distroless

### Checklist Observability
- [ ] Health checks significativi
- [ ] Structured logging
- [ ] Metrics endpoint
- [ ] Proper signal handling
- [ ] Container structure tests

Il prossimo step è implementare questi principi negli esempi pratici e nei multi-stage builds avanzati.
