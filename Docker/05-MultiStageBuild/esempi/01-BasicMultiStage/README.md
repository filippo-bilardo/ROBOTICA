# Esempi Pratici: Multi-stage Builds di Base

## Introduzione

Questa sezione contiene esempi pratici di multi-stage builds di base, dimostrando i concetti fondamentali e i vantaggi immediati di questa tecnica.

## 1. Node.js Application Build

### Problema Risolto
Separare fase di build (con devDependencies) dalla fase runtime (solo produzione).

#### Dockerfile Single-stage (Inefficiente)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install  # Include dev dependencies
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Problemi:**
- Immagine finale include devDependencies (~200MB extra)
- Tool di build presenti in produzione
- Superficie di attacco maggiore

#### Dockerfile Multi-stage (Ottimizzato)
```dockerfile
# Stage 1: Build
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install  # Include dev dependencies per build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:16-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Solo prod dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
USER node
EXPOSE 3000
CMD ["npm", "start"]
```

**Vantaggi:**
- Riduzione ~60% dimensione immagine
- Solo dipendenze produzione
- Maggiore sicurezza

### Esempio Completo: React App

#### package.json
```json
{
  "name": "react-multistage-demo",
  "version": "1.0.0",
  "scripts": {
    "build": "react-scripts build",
    "start": "serve -s build",
    "dev": "react-scripts start"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "serve": "^14.2.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

#### Dockerfile
```dockerfile
# Stage 1: Build Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build Application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci  # Include dev dependencies
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy built application
COPY --from=builder /app/build ./build
# Copy package.json for scripts
COPY package*.json ./

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build e Test
```bash
# Build immagine
docker build -t react-multistage .

# Confronto dimensioni
docker images | grep react

# Test applicazione
docker run -p 3000:3000 react-multistage
```

## 2. Go Application Build

### Vantaggi per Go
- Binario statico finale
- Immagine runtime minimale
- Eliminazione tool chain Go

#### Dockerfile
```dockerfile
# Stage 1: Build
FROM golang:1.19-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 2: Production
FROM alpine:latest AS production

# Install CA certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Create non-root user
RUN adduser -D -s /bin/sh appuser
USER appuser

EXPOSE 8080

CMD ["./main"]
```

#### Esempio App Go
```go
// main.go
package main

import (
    "fmt"
    "net/http"
    "log"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from Multi-stage Go App!")
    })

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

#### go.mod
```go
module multistage-go-demo

go 1.19
```

#### Risultato
```bash
# Build
docker build -t go-multistage .

# Dimensioni
docker images go-multistage
# REPOSITORY     TAG       SIZE
# go-multistage  latest    7.5MB (vs 300MB+ single-stage)
```

## 3. Python Application con Dependencies

### Problema
- Build dependencies pesanti (gcc, headers)
- Cleanup manuale complesso
- Gestione virtual environment

#### Dockerfile Multi-stage
```dockerfile
# Stage 1: Build Dependencies
FROM python:3.9-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.9-slim AS production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
WORKDIR /home/app

# Copy application
COPY --chown=app:app . .

USER app

EXPOSE 8000

CMD ["python", "app.py"]
```

#### requirements.txt
```txt
flask==2.3.3
psycopg2==2.9.7
gunicorn==21.2.0
```

#### Esempio Flask App
```python
# app.py
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Multi-stage Python App!"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

## 4. Static Website con Build Process

### Caso d'uso
- Site generator (Hugo, Jekyll, Gatsby)
- Preprocessori CSS/JS
- Ottimizzazione assets

#### Dockerfile per Hugo Site
```dockerfile
# Stage 1: Build Site
FROM klakegg/hugo:alpine AS builder

WORKDIR /src

# Copy source
COPY . .

# Build static site
RUN hugo --minify --environment production

# Stage 2: Web Server
FROM nginx:alpine AS production

# Copy built site
COPY --from=builder /src/public /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 5. Multi-language Build (Frontend + Backend)

### Scenario
- Frontend React
- Backend Node.js API
- Build separati ma coordinati

#### Dockerfile
```dockerfile
# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Backend Build
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend .
COPY backend/ .

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public

# Create user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

## 6. Build con Cache Ottimizzato

### Tecnica Layer Caching
```dockerfile
# Stage 1: Dependencies Cache
FROM node:18-alpine AS deps
WORKDIR /app
# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build Cache
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
# Copy source only after deps are cached
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY package*.json ./

USER 1001
EXPOSE 3000
CMD ["npm", "start"]
```

## Best Practices per Multi-stage Builds

### 1. Naming Strategy
```dockerfile
# Use descriptive stage names
FROM node:18 AS dependencies
FROM node:18 AS builder  
FROM node:18 AS development
FROM nginx:alpine AS production
```

### 2. Selective Copying
```dockerfile
# Copy only what's needed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Don't copy entire directory unless necessary
# COPY --from=builder /app .  # ❌ Too broad
```

### 3. Build Targets
```dockerfile
# Support multiple targets
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

```bash
# Build specific target
docker build --target development -t app:dev .
docker build --target production -t app:prod .
```

## Esercizi Pratici

### Esercizio 1: Ottimizzazione Java
Converti questa build single-stage in multi-stage:

```dockerfile
FROM openjdk:11
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package
CMD ["java", "-jar", "target/app.jar"]
```

### Esercizio 2: Database Migration
Crea un multi-stage build che:
1. Scarica tool di migration
2. Esegue migrations
3. Produce immagine finale senza tool

### Esercizio 3: Asset Optimization
Build un'app con:
- Compilazione TypeScript
- Bundling JavaScript
- Ottimizzazione immagini
- Server nginx finale

## Conclusioni

I multi-stage builds di base offrono vantaggi immediati:

- **Riduzione dimensioni**: 50-80% in meno
- **Sicurezza**: Eliminazione tool di build
- **Performance**: Cache layers ottimizzati
- **Semplicità**: Pattern riutilizzabili

### Risultati Tipici
- Node.js: da 800MB a 200MB
- Go: da 300MB a 10MB
- Python: da 500MB a 150MB
- Java: da 600MB a 180MB

Il prossimo step è imparare pattern avanzati per scenari complessi e ottimizzazioni specifiche.
