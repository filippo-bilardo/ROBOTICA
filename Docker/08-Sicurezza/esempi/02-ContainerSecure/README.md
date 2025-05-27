# Container Sicuri: Configurazione e Best Practice

## Introduzione

In questo esempio pratico, impareremo a configurare container Docker con elevati standard di sicurezza. Esploreremo le migliori pratiche per creare, configurare e eseguire container che minimizzano i rischi di sicurezza.

## Obiettivi

- Implementare il principio del privilegio minimo
- Configurare container senza root
- Utilizzare immagini base sicure
- Implementare controlli di accesso e limitazioni delle risorse
- Configurare reti sicure

## Dockerfile Sicuro

### Esempio di Dockerfile NON Sicuro

```dockerfile
# ❌ ESEMPIO DA NON SEGUIRE
FROM ubuntu:latest

# Esecuzione come root
USER root

# Installazione di pacchetti non necessari
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    sudo \
    ssh \
    gcc \
    make

# Esposizione di porte non necessarie
EXPOSE 22 80 443 8080

# File con permessi troppo aperti
COPY app.jar /app/
RUN chmod 777 /app/app.jar

# Comando eseguito come root
CMD ["java", "-jar", "/app/app.jar"]
```

### Dockerfile Sicuro Migliorato

```dockerfile
# ✅ ESEMPIO SICURO
# Usare immagini specifiche e aggiornate
FROM openjdk:17-jre-slim

# Creare un utente non privilegiato
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser

# Installare solo pacchetti necessari e pulire la cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Creare directory con permessi appropriati
RUN mkdir -p /app && chown -R appuser:appgroup /app

# Copiare file con utente specifico
COPY --chown=appuser:appgroup app.jar /app/

# Cambiare all'utente non privilegiato
USER appuser

# Esporre solo la porta necessaria
EXPOSE 8080

# Configurare health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando eseguito come utente non privilegiato
CMD ["java", "-jar", "/app/app.jar"]
```

## Configurazione Runtime Sicura

### 1. Limitazione delle Risorse

```bash
# Limitare memoria e CPU
docker run -d \
    --name secure-app \
    --memory="512m" \
    --cpus="1.0" \
    --memory-swap="512m" \
    myapp:secure
```

### 2. Sicurezza del Filesystem

```bash
# Filesystem di sola lettura
docker run -d \
    --name secure-app \
    --read-only \
    --tmpfs /tmp:rw,size=100m \
    --tmpfs /var/log:rw,size=50m \
    myapp:secure
```

### 3. Limitazione delle Capabilities

```bash
# Rimuovere tutte le capabilities non necessarie
docker run -d \
    --name secure-app \
    --cap-drop=ALL \
    --cap-add=NET_BIND_SERVICE \
    myapp:secure
```

### 4. Security Options

```bash
# Configurazioni di sicurezza avanzate
docker run -d \
    --name secure-app \
    --security-opt=no-new-privileges:true \
    --security-opt=apparmor:docker-default \
    --security-opt=seccomp:seccomp-profile.json \
    myapp:secure
```

## Multi-Stage Build Sicuro

```dockerfile
# Stage 1: Build environment
FROM node:18-alpine AS builder

WORKDIR /build

# Copiare solo i file necessari per il build
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
RUN npm run build

# Stage 2: Runtime environment (immagine finale)
FROM node:18-alpine AS runtime

# Installare dumb-init per gestione sicura dei processi
RUN apk add --no-cache dumb-init

# Creare utente non privilegiato
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Creare directory con permessi appropriati
WORKDIR /app
RUN chown nextjs:nodejs /app

# Copiare solo i file necessari dal builder
COPY --from=builder --chown=nextjs:nodejs /build/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /build/node_modules ./node_modules

# Cambiare all'utente non privilegiato
USER nextjs

# Esporre solo la porta necessaria
EXPOSE 3000

# Usare dumb-init per gestione sicura dei processi
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

## Esempio Pratico: Applicazione Web Sicura

### 1. Applicazione Node.js

```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware di sicurezza
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100 // massimo 100 richieste per IP ogni 15 minuti
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Applicazione sicura!',
        user: process.getuid(),
        group: process.getgid()
    });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server in ascolto sulla porta ${port}`);
    console.log(`UID: ${process.getuid()}, GID: ${process.getgid()}`);
});
```

### 2. Package.json

```json
{
    "name": "secure-app",
    "version": "1.0.0",
    "description": "Applicazione Node.js sicura",
    "main": "app.js",
    "scripts": {
        "start": "node app.js",
        "audit": "npm audit",
        "audit-fix": "npm audit fix"
    },
    "dependencies": {
        "express": "^4.18.2",
        "helmet": "^7.0.0",
        "express-rate-limit": "^6.8.1"
    }
}
```

### 3. Dockerfile Completo

```dockerfile
FROM node:18-alpine AS base

# Installare dumb-init per gestione sicura dei processi
RUN apk add --no-cache dumb-init

# Creare utente non privilegiato
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

FROM base AS deps

WORKDIR /app

# Copiare file di dipendenze
COPY package*.json ./

# Installare dipendenze con controlli di sicurezza
RUN npm ci --only=production && npm cache clean --force

# Eseguire audit di sicurezza
RUN npm audit --audit-level moderate

FROM base AS runtime

WORKDIR /app

# Copiare dipendenze dal stage precedente
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiare codice applicazione
COPY --chown=nodejs:nodejs app.js package.json ./

# Cambiare all'utente non privilegiato
USER nodejs

# Esporre porta applicazione
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Usare dumb-init per gestione sicura dei processi
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
```

## Configurazione Docker Compose Sicura

```yaml
# docker-compose.secure.yml
version: '3.8'

services:
  web:
    build: .
    container_name: secure-web
    restart: unless-stopped
    
    # Limitazioni delle risorse
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    
    # Configurazioni di sicurezza
    read_only: true
    security_opt:
      - no-new-privileges:true
      - apparmor:docker-default
    
    # Rimozione capabilities
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    
    # Filesystem temporanei
    tmpfs:
      - /tmp:rw,size=100m
      - /var/log:rw,size=50m
    
    # Variabili d'ambiente sicure
    environment:
      - NODE_ENV=production
      - PORT=3000
    
    # Rete personalizzata
    networks:
      - secure-network
    
    # Health check
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

  reverse-proxy:
    image: nginx:alpine
    container_name: secure-proxy
    restart: unless-stopped
    
    read_only: true
    security_opt:
      - no-new-privileges:true
    
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
      - CHOWN
      - SETGID
      - SETUID
    
    ports:
      - "80:80"
      - "443:443"
    
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    
    tmpfs:
      - /var/cache/nginx:rw,size=50m
      - /var/run:rw,size=10m
    
    networks:
      - secure-network
    
    depends_on:
      web:
        condition: service_healthy

networks:
  secure-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Script di Sicurezza e Controlli

### 1. Script di Verifica Sicurezza

```bash
#!/bin/bash
# security-check.sh

CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ]; then
    echo "Uso: $0 <nome-container>"
    exit 1
fi

echo "🔍 Controlli di sicurezza per $CONTAINER_NAME"
echo "================================================"

# Verifica utente non root
echo "👤 Controllo utente:"
RUNNING_USER=$(docker exec $CONTAINER_NAME id -u)
if [ "$RUNNING_USER" = "0" ]; then
    echo "❌ Container in esecuzione come root (UID: $RUNNING_USER)"
else
    echo "✅ Container in esecuzione come utente non privilegiato (UID: $RUNNING_USER)"
fi

# Verifica capabilities
echo ""
echo "🔐 Controllo capabilities:"
docker exec $CONTAINER_NAME capsh --print | grep "Current:"

# Verifica filesystem read-only
echo ""
echo "📁 Controllo filesystem:"
READONLY=$(docker inspect $CONTAINER_NAME | jq -r '.[0].HostConfig.ReadonlyRootfs')
if [ "$READONLY" = "true" ]; then
    echo "✅ Filesystem root in sola lettura"
else
    echo "❌ Filesystem root scrivibile"
fi

# Verifica limiti risorse
echo ""
echo "⚡ Controllo limiti risorse:"
MEMORY_LIMIT=$(docker inspect $CONTAINER_NAME | jq -r '.[0].HostConfig.Memory')
CPU_LIMIT=$(docker inspect $CONTAINER_NAME | jq -r '.[0].HostConfig.CpuQuota')

if [ "$MEMORY_LIMIT" != "0" ]; then
    echo "✅ Limite memoria impostato: $(($MEMORY_LIMIT / 1024 / 1024))MB"
else
    echo "❌ Nessun limite memoria impostato"
fi

if [ "$CPU_LIMIT" != "0" ]; then
    echo "✅ Limite CPU impostato"
else
    echo "❌ Nessun limite CPU impostato"
fi

echo ""
echo "🔍 Controllo completato!"
```

### 2. Dockerfile Linter

```bash
#!/bin/bash
# dockerfile-security-lint.sh

DOCKERFILE=${1:-Dockerfile}

echo "🔍 Analisi sicurezza per $DOCKERFILE"
echo "===================================="

# Controlla se viene usato USER
if ! grep -q "^USER " "$DOCKERFILE"; then
    echo "❌ Nessuna istruzione USER trovata - container eseguito come root"
else
    echo "✅ Istruzione USER presente"
fi

# Controlla se vengono installati pacchetti non necessari
DANGEROUS_PACKAGES=("ssh" "sudo" "telnet" "ftp")
for package in "${DANGEROUS_PACKAGES[@]}"; do
    if grep -q "$package" "$DOCKERFILE"; then
        echo "⚠️  Pacchetto potenzialmente pericoloso trovato: $package"
    fi
done

# Controlla se viene usata l'immagine latest
if grep -q ":latest" "$DOCKERFILE"; then
    echo "⚠️  Uso di tag 'latest' trovato - specificare versioni esatte"
fi

# Controlla HEALTHCHECK
if ! grep -q "HEALTHCHECK" "$DOCKERFILE"; then
    echo "❌ Nessun HEALTHCHECK configurato"
else
    echo "✅ HEALTHCHECK configurato"
fi

echo "✅ Analisi completata!"
```

## Esercizi Pratici

### Esercizio 1: Migrazione da Root a Non-Root

1. Prendere un Dockerfile esistente che usa root
2. Modificarlo per usare un utente non privilegiato
3. Testare che l'applicazione funzioni correttamente
4. Verificare i permessi con lo script di controllo

### Esercizio 2: Implementazione Multi-Stage

1. Creare un'applicazione che richiede strumenti di build
2. Implementare multi-stage build
3. Confrontare le dimensioni delle immagini
4. Scansionare entrambe per vulnerabilità

### Esercizio 3: Configurazione Completa

1. Configurare un'applicazione web con database
2. Implementare tutte le best practice di sicurezza
3. Creare script di monitoraggio sicurezza
4. Documentare la configurazione

## Monitoraggio e Logging Sicuro

### Configurazione Logging

```yaml
# docker-compose con logging sicuro
services:
  app:
    image: myapp:secure
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service,version"
        env: "ENVIRONMENT"
    labels:
      - "service=myapp"
      - "version=1.0"
```

### Monitoraggio Runtime

```bash
# Monitoraggio eventi di sicurezza
docker events --filter container=secure-app --filter event=start --filter event=die

# Controllo processi in esecuzione
docker exec secure-app ps aux

# Verifica connessioni di rete
docker exec secure-app netstat -tuln
```

## Conclusioni

La sicurezza dei container richiede un approccio olistico che include:

1. **Build-time security**: Dockerfile sicuri, immagini base aggiornate
2. **Runtime security**: Limitazioni risorse, utenti non privilegiati
3. **Network security**: Isolamento, controllo traffico
4. **Monitoring**: Logging, auditing, alerting

Implementando queste pratiche, è possibile ridurre significativamente i rischi di sicurezza nei deploy Docker.

## Risorse Aggiuntive

- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [NIST Container Security Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-190.pdf)

## Navigazione

- [⬅️ Esempio precedente: Scansione Sicurezza](../01-ScansioneSicurezza/README.md)
- [➡️ Prossimo esempio: Secrets Management](../03-SecretsManagement/README.md)
- [🏠 Torna al modulo Sicurezza](../README.md)
