# Esempi Pratici: Dockerfile Sicuri

## Panoramica
Questa sezione presenta esempi pratici per creare Dockerfile sicuri, implementando le best practices di sicurezza e principi di difesa in profondità.

---

## Esempio 1: Dockerfile Base Sicuro

### Applicazione Web Node.js Sicura

```dockerfile
# 03-secure-webapp/Dockerfile
# Usa immagine base ufficiale e specifica
FROM node:18-alpine3.18

# Installa dumb-init per gestione corretta processi
RUN apk add --no-cache dumb-init

# Crea utente non-privilegiato
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Imposta directory di lavoro
WORKDIR /app

# Copia e installa dipendenze come root (per npm install)
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copia codice applicazione
COPY --chown=nextjs:nodejs . .

# Cambia a utente non-privilegiato
USER nextjs

# Esponi porta non-privilegiata
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Usa dumb-init come entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Comando sicuro
CMD ["node", "server.js"]
```

### File di supporto

**package.json**
```json
{
  "name": "secure-webapp",
  "version": "1.0.0",
  "description": "Secure web application example",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**server.js**
```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware di sicurezza
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Endpoint principale
app.get('/', (req, res) => {
  res.json({ 
    message: 'Secure Docker Application',
    user: process.getuid(),
    group: process.getgid()
  });
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure server running on port ${PORT}`);
  console.log(`Running as user: ${process.getuid()}, group: ${process.getgid()}`);
});
```

**Script di build e test**
```bash
#!/bin/bash
# build-secure.sh

echo "Building secure Docker image..."
docker build -t secure-webapp:latest .

echo "Running security scan..."
docker scout cves secure-webapp:latest

echo "Testing security configurations..."
docker run --rm -d --name secure-test \
  -p 3000:3000 \
  -e NODE_ENV=production \
  secure-webapp:latest

# Verifica che il container non sia root
echo "Checking user privileges..."
docker exec secure-test whoami
docker exec secure-test id

# Test health check
sleep 5
curl -f http://localhost:3000/health

# Cleanup
docker stop secure-test
```

---

## Esempio 2: Dockerfile con Gestione Segreti

### Applicazione con Database e Segreti

```dockerfile
# 04-secrets-management/Dockerfile
FROM python:3.11-slim

# Installa dipendenze di sistema necessarie
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crea utente non-privilegiato
RUN useradd --create-home --shell /bin/bash app

# Imposta directory di lavoro
WORKDIR /app

# Copia requirements e installa dipendenze Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia codice applicazione
COPY --chown=app:app . .

# Cambia a utente non-privilegiato
USER app

# Esponi porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Comando sicuro
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "app:app"]
```

**requirements.txt**
```txt
flask==2.3.3
gunicorn==21.2.0
psycopg2-binary==2.9.7
cryptography==41.0.4
python-dotenv==1.0.0
```

**app.py**
```python
import os
import logging
from flask import Flask, jsonify, request
from cryptography.fernet import Fernet
import psycopg2
from dotenv import load_dotenv

# Carica variabili ambiente
load_dotenv()

app = Flask(__name__)

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurazione sicura
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

# Gestione segreti
def get_db_connection():
    """Connessione sicura al database"""
    try:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            database=os.environ.get('DB_NAME', 'testdb'),
            user=os.environ.get('DB_USER', 'user'),
            password=os.environ.get('DB_PASSWORD', 'password'),
            sslmode='require'
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'user_id': os.getuid(),
        'group_id': os.getgid()
    })

@app.route('/')
def home():
    """Endpoint principale"""
    return jsonify({
        'message': 'Secure Flask Application',
        'version': '1.0.0'
    })

@app.route('/secure-data')
def secure_data():
    """Endpoint con dati sensibili (esempio)"""
    # Simulazione accesso sicuro ai dati
    encryption_key = os.environ.get('ENCRYPTION_KEY')
    if not encryption_key:
        return jsonify({'error': 'Encryption key not configured'}), 500
    
    try:
        cipher_suite = Fernet(encryption_key.encode())
        # Esempio di decrittazione
        encrypted_data = b'gAAAAABhZ...'  # Dato criptato esempio
        # decrypted_data = cipher_suite.decrypt(encrypted_data)
        
        return jsonify({'message': 'Secure data access successful'})
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        return jsonify({'error': 'Security operation failed'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
```

**docker-compose.secure.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=postgres
      - DB_NAME=securedb
      - DB_USER=appuser
    secrets:
      - db_password
      - secret_key
      - encryption_key
    depends_on:
      - postgres
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=securedb
      - POSTGRES_USER=appuser
    secrets:
      - source: db_password
        target: /run/secrets/postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true

secrets:
  db_password:
    file: ./secrets/db_password.txt
  secret_key:
    file: ./secrets/secret_key.txt
  encryption_key:
    file: ./secrets/encryption_key.txt

volumes:
  postgres_data:
```

---

## Esempio 3: Dockerfile con Scansione Vulnerabilità

### Configurazione per Security Scanning

```dockerfile
# 05-vulnerability-scanning/Dockerfile
FROM ubuntu:22.04

# Metadati per tracking sicurezza
LABEL maintainer="security-team@company.com"
LABEL security.scan-policy="strict"
LABEL security.update-frequency="weekly"

# Aggiorna sistema e installa solo pacchetti necessari
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Crea utente non-privilegiato
RUN useradd --create-home --shell /bin/bash --uid 1000 appuser

# Crea virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Installa dipendenze Python sicure
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /tmp/requirements.txt && \
    rm /tmp/requirements.txt

# Copia applicazione
WORKDIR /app
COPY --chown=appuser:appuser . .

# Cambia a utente non-privilegiato
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python3 -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

EXPOSE 8000

CMD ["python3", "app.py"]
```

**Script di security scanning**
```bash
#!/bin/bash
# security-scan.sh

set -e

IMAGE_NAME="vulnerable-app:latest"

echo "=== Building image ==="
docker build -t $IMAGE_NAME .

echo "=== Running Trivy vulnerability scan ==="
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $HOME/Library/Caches:/root/.cache/ \
  aquasec/trivy:latest image --severity HIGH,CRITICAL $IMAGE_NAME

echo "=== Running Docker Bench Security ==="
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /etc:/etc:ro \
  -v /usr/bin/containerd:/usr/bin/containerd:ro \
  -v /usr/bin/runc:/usr/bin/runc:ro \
  -v /usr/lib/systemd:/usr/lib/systemd:ro \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security

echo "=== Running container security check ==="
docker run --rm -d --name security-test \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --read-only \
  --tmpfs /tmp \
  -p 8000:8000 \
  $IMAGE_NAME

sleep 5

# Test che il container non abbia privilegi root
echo "Checking user privileges:"
docker exec security-test whoami
docker exec security-test id

# Test che l'applicazione sia funzionante
echo "Testing application:"
curl -f http://localhost:8000/health

# Cleanup
docker stop security-test

echo "=== Security scan completed ==="
```

---

## Esempio 4: Dockerfile Multi-Architecture Sicuro

### Build per Multiple Architetture

```dockerfile
# 06-multi-arch-secure/Dockerfile
# syntax=docker/dockerfile:1

# Supporta multiple architetture
FROM --platform=$BUILDPLATFORM golang:1.21-alpine AS builder

# Installa dipendenze build sicure
RUN apk add --no-cache git ca-certificates tzdata

# Crea utente per build
RUN adduser -D -g '' appuser

# Imposta working directory
WORKDIR /build

# Copia e scarica dipendenze Go
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copia source code
COPY . .

# Build dell'applicazione per target architecture
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo -o app ./cmd/main.go

# Stage finale - minimal runtime
FROM scratch

# Importa utente e certificati dal builder
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copia binary dell'applicazione
COPY --from=builder /build/app /app

# Usa utente non-privilegiato
USER appuser

# Esponi porta
EXPOSE 8080

# Health check (nota: scratch non ha curl, usa l'app stessa)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/app", "-health-check"]

# Comando finale
ENTRYPOINT ["/app"]
```

**main.go (esempio)**
```go
package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/user"
    "runtime"
    "time"
)

var (
    healthCheck = flag.Bool("health-check", false, "Perform health check")
    port        = flag.String("port", "8080", "Server port")
)

type Response struct {
    Message      string `json:"message"`
    Architecture string `json:"architecture"`
    OS           string `json:"os"`
    User         string `json:"user"`
    Time         string `json:"time"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
        "time":   time.Now().Format(time.RFC3339),
    })
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
    currentUser, _ := user.Current()
    
    resp := Response{
        Message:      "Secure Multi-Architecture Application",
        Architecture: runtime.GOARCH,
        OS:           runtime.GOOS,
        User:         currentUser.Username,
        Time:         time.Now().Format(time.RFC3339),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func main() {
    flag.Parse()
    
    // Health check mode
    if *healthCheck {
        resp, err := http.Get("http://localhost:" + *port + "/health")
        if err != nil || resp.StatusCode != 200 {
            os.Exit(1)
        }
        os.Exit(0)
    }
    
    // Server mode
    http.HandleFunc("/", rootHandler)
    http.HandleFunc("/health", healthHandler)
    
    log.Printf("Starting secure server on port %s", *port)
    log.Printf("Architecture: %s, OS: %s", runtime.GOARCH, runtime.GOOS)
    
    if err := http.ListenAndServe(":"+*port, nil); err != nil {
        log.Fatal(err)
    }
}
```

**Script di build multi-arch**
```bash
#!/bin/bash
# build-multiarch.sh

set -e

IMAGE_NAME="secure-multiarch-app"
TAG="latest"

echo "=== Setting up buildx ==="
docker buildx create --name multiarch-builder --use || true
docker buildx inspect --bootstrap

echo "=== Building for multiple architectures ==="
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag $IMAGE_NAME:$TAG \
  --push \
  .

echo "=== Verifying multi-arch manifest ==="
docker buildx imagetools inspect $IMAGE_NAME:$TAG

echo "=== Testing on current architecture ==="
docker run --rm -p 8080:8080 -d --name multiarch-test $IMAGE_NAME:$TAG

sleep 5

# Test dell'applicazione
curl -f http://localhost:8080/
curl -f http://localhost:8080/health

# Cleanup
docker stop multiarch-test

echo "=== Multi-architecture build completed ==="
```

---

## Verifica e Testing

### Script di Verifica Sicurezza Completa

```bash
#!/bin/bash
# comprehensive-security-test.sh

set -e

echo "=== Comprehensive Security Testing ==="

# Test 1: Build Security
echo "1. Testing build security..."
./build-secure.sh

# Test 2: Runtime Security
echo "2. Testing runtime security..."
docker run --rm --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --read-only \
  --tmpfs /tmp \
  secure-webapp:latest /bin/sh -c "whoami && id"

# Test 3: Network Security
echo "3. Testing network security..."
docker network create test-network
docker run --rm -d --name security-test \
  --network test-network \
  --no-new-privileges \
  secure-webapp:latest

# Test connettività limitata
docker run --rm --network test-network alpine ping -c 1 security-test

# Cleanup
docker stop security-test
docker network rm test-network

# Test 4: Resource Limits
echo "4. Testing resource limits..."
docker run --rm \
  --memory=128m \
  --cpus=0.5 \
  --security-opt=no-new-privileges:true \
  secure-webapp:latest /bin/sh -c "echo 'Resource limits applied'"

# Test 5: Vulnerability Scan
echo "5. Running vulnerability scan..."
./security-scan.sh

echo "=== All security tests completed ==="
```

---

## Best Practices Implementate

### Checklist Sicurezza Dockerfile

- ✅ **Immagini Base**: Usa immagini ufficiali e specifiche
- ✅ **Utenti Non-Privilegiati**: Non eseguire mai come root
- ✅ **Principio Minimo Privilegio**: Rimuovi capabilities non necessarie
- ✅ **Gestione Segreti**: Usa Docker secrets o variabili ambiente sicure
- ✅ **Health Checks**: Implementa monitoring della salute
- ✅ **Resource Limits**: Imposta limiti di memoria e CPU
- ✅ **Read-only Filesystem**: Monta filesystem in sola lettura quando possibile
- ✅ **Security Scanning**: Integra scansione vulnerabilità nella CI/CD
- ✅ **Multi-Architecture**: Supporta diverse architetture in modo sicuro
- ✅ **Logging Sicuro**: Non loggare informazioni sensibili
- ✅ **Network Security**: Limita l'esposizione di porte e servizi

### Metriche di Sicurezza

```bash
# Verifica configurazioni sicurezza
docker inspect secure-webapp:latest | jq '.[0].Config.User'
docker inspect secure-webapp:latest | jq '.[0].Config.SecurityOpt'
docker history secure-webapp:latest --no-trunc
```

Questi esempi forniscono una base solida per implementare Dockerfile sicuri in ambienti di produzione, seguendo le best practices dell'industria e implementando difese multiple.
