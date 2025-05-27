# Esempi: Multi-stage Builds Ottimizzati

## Introduzione

Questa sezione presenta tecniche avanzate di ottimizzazione per multi-stage builds, concentrandosi su:

- **Cache optimization**: Strategie per massimizzare il riutilizzo della cache
- **Layer reduction**: Minimizzazione del numero di layer
- **Parallel builds**: Costruzione parallela di stage indipendenti
- **Selective copying**: Copia ottimizzata di artefatti tra stage
- **Build time reduction**: Tecniche per velocizzare le build

## Esempi Inclusi

### 1. Node.js con Cache Avanzata
- Cache separata per dipendenze dev/prod
- Build paralleli per test e produzione
- Ottimizzazione bundle size

### 2. Go con Vendoring Ottimizzato
- Cache dei moduli Go
- Cross-compilation efficiente
- Binary stripping automatico

### 3. Python con Wheels Pre-compilate
- Cache delle dipendenze compilate
- Separazione runtime/build dependencies
- Ottimizzazione per ML libraries

### 4. Frontend Build Ottimizzata
- Cache node_modules intelligente
- Asset optimization pipeline
- CDN preparation

---

## 1. Node.js Ottimizzato

### Struttura Directory
```
01-nodejs-optimized/
├── Dockerfile.optimized
├── Dockerfile.parallel
├── package.json
├── package-lock.json
├── src/
│   ├── app.js
│   ├── routes/
│   └── utils/
├── tests/
│   └── app.test.js
├── webpack.config.js
└── scripts/
    ├── build.sh
    └── benchmark.sh
```

### Dockerfile con Cache Ottimizzata

```dockerfile
# syntax=docker/dockerfile:1
# Dockerfile.optimized

# Stage di base con cache condivisa
FROM node:18-alpine AS base
WORKDIR /app
# Installa dipendenze di sistema una volta sola
RUN apk add --no-cache tini curl

# Stage per dependencies di produzione
FROM base AS deps-prod
COPY package*.json ./
# Cache layer separato per prod deps
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# Stage per dependencies di sviluppo
FROM base AS deps-dev
COPY package*.json ./
# Cache layer separato per dev deps
RUN npm ci --frozen-lockfile && \
    npm cache clean --force

# Stage di build
FROM deps-dev AS builder
COPY . .
# Build ottimizzata con parallel processing
RUN npm run build:prod -- --max-old-space-size=4096
# Cleanup build artifacts non necessari
RUN rm -rf src/ tests/ webpack.config.js

# Stage finale ottimizzato
FROM base AS production

# Copia solo dipendenze prod (già installate)
COPY --from=deps-prod /app/node_modules ./node_modules
# Copia solo build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

# Health check ottimizzato
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/app.js"]
```

### Build Paralleli

```dockerfile
# Dockerfile.parallel
# syntax=docker/dockerfile:1

FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Build stage (può girare in parallelo con test)
FROM dependencies AS builder
COPY src/ ./src/
COPY webpack.config.js ./
RUN npm run build

# Test stage (parallelo con builder)
FROM dependencies AS tester
COPY . .
RUN npm test
RUN npm run lint

# Security scanner (parallelo)
FROM dependencies AS security
COPY . .
RUN npm audit --audit-level=moderate
RUN npm run security:check

# Final stage che aspetta tutti i precedenti
FROM base AS production
# Verifica che test e security siano passati
COPY --from=tester /app/test-results.xml /tmp/
COPY --from=security /app/security-report.json /tmp/
# Copia build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

EXPOSE 3000
CMD ["node", "dist/app.js"]
```

---

## 2. Go Build Ottimizzato

### Struttura Directory
```
02-golang-optimized/
├── Dockerfile.optimized
├── Dockerfile.cross-compile
├── go.mod
├── go.sum
├── main.go
├── cmd/
├── internal/
├── pkg/
└── scripts/
    ├── build-all.sh
    └── benchmark.sh
```

### Go Multi-stage Ottimizzato

```dockerfile
# Dockerfile.optimized
# syntax=docker/dockerfile:1

# Stage per cache dei moduli Go
FROM golang:1.21-alpine AS modules
WORKDIR /app
# Copia solo i file di dipendenze per cache ottimale
COPY go.mod go.sum ./
# Download moduli in layer separato
RUN go mod download && \
    go mod verify

# Stage di build ottimizzato
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Installa strumenti di build necessari
RUN apk add --no-cache git ca-certificates tzdata

# Copia cache moduli dal stage precedente
COPY --from=modules /go/pkg /go/pkg
COPY --from=modules /app/go.mod /app/go.sum ./

# Copia sorgenti
COPY . .

# Build con ottimizzazioni aggressive
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -a -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -tags netgo \
    -o app \
    ./cmd/main.go

# Verifica il binary
RUN ./app --version

# Stage finale ultra-minimale
FROM scratch AS production

# Certificati SSL per HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# Timezone data
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
# Binary ottimizzato
COPY --from=builder /app/app /app

# Metadata
LABEL maintainer="dev@example.com" \
      version="1.0" \
      description="Optimized Go application"

EXPOSE 8080
ENTRYPOINT ["/app"]
```

### Cross-compilation per Multiple Architectures

```dockerfile
# Dockerfile.cross-compile
# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM golang:1.21-alpine AS builder

# Install cross-compilation tools
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build arguments for cross-compilation
ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT

COPY . .

# Cross-compile per target platform
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build \
    -ldflags='-w -s' \
    -o app-$TARGETOS-$TARGETARCH \
    ./cmd/main.go

# Multi-arch final stage
FROM scratch
ARG TARGETOS
ARG TARGETARCH

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/app-$TARGETOS-$TARGETARCH /app

EXPOSE 8080
ENTRYPOINT ["/app"]
```

---

## 3. Python ML Ottimizzato

### Struttura Directory
```
03-python-ml-optimized/
├── Dockerfile.optimized
├── Dockerfile.wheels
├── requirements.txt
├── requirements-dev.txt
├── app.py
├── models/
├── data/
├── scripts/
│   ├── build-wheels.sh
│   └── test-performance.sh
└── wheels/
```

### Python con Wheels Pre-compilate

```dockerfile
# Dockerfile.optimized
# syntax=docker/dockerfile:1

# Stage per building wheels custom
FROM python:3.11-slim AS wheel-builder

# Installa compiler e build tools
RUN apt-get update && apt-get install -y \
    gcc g++ \
    libblas-dev liblapack-dev \
    gfortran \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /wheels

# Copia requirements
COPY requirements.txt ./

# Build wheels per tutte le dipendenze
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

# Stage per runtime ottimizzato
FROM python:3.11-slim AS runtime-base

# Installa solo runtime dependencies
RUN apt-get update && apt-get install -y \
    libblas3 liblapack3 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Stage per dependencies
FROM runtime-base AS dependencies

# Copia e installa wheels pre-compilate
COPY --from=wheel-builder /wheels /wheels
COPY requirements.txt ./

# Installazione veloce da wheels
RUN pip install --no-cache-dir --no-index --find-links /wheels -r requirements.txt && \
    rm -rf /wheels

# Stage finale
FROM runtime-base AS production

WORKDIR /app

# Copia dependencies installate
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copia applicazione
COPY app.py ./
COPY models/ ./models/

# Security: non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Health check per ML apps
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

EXPOSE 8000
CMD ["python", "app.py"]
```

### Wheels con Cache Avanzata

```dockerfile
# Dockerfile.wheels
# syntax=docker/dockerfile:1

# Stage per cache dei wheels
FROM python:3.11 AS wheel-cache

# Mount cache per pip wheels
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    pip wheel --wheel-dir=/wheels -r requirements.txt

# Stage per applicazione
FROM python:3.11-slim AS application

# Installa wheels dalla cache
COPY --from=wheel-cache /wheels /tmp/wheels
COPY requirements.txt .

RUN pip install --no-index --find-links /tmp/wheels -r requirements.txt && \
    rm -rf /tmp/wheels

WORKDIR /app
COPY . .

# Pre-compile Python bytecode
RUN python -m compileall .

EXPOSE 8000
CMD ["python", "app.py"]
```

---

## 4. Frontend Build Ottimizzata

### Struttura Directory
```
04-frontend-optimized/
├── Dockerfile.optimized
├── Dockerfile.cdn-ready
├── package.json
├── webpack.config.js
├── src/
├── public/
├── nginx.conf
└── scripts/
    ├── optimize-assets.sh
    └── cdn-deploy.sh
```

### Frontend Multi-stage Ottimizzato

```dockerfile
# Dockerfile.optimized
# syntax=docker/dockerfile:1

# Stage base con Node.js
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache git

# Stage per dipendenze con cache intelligente
FROM base AS dependencies

# Copia solo file di dipendenze per cache ottimale
COPY package*.json ./
COPY yarn.lock* ./

# Cache mount per node_modules
RUN --mount=type=cache,target=/app/node_modules \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --production=false

# Stage di build con ottimizzazioni
FROM dependencies AS builder

# Copia sorgenti
COPY . .

# Build con ottimizzazioni aggressive
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

RUN --mount=type=cache,target=/app/node_modules \
    yarn build

# Ottimizzazione assets post-build
RUN npx imagemin 'build/static/media/*.{jpg,png}' --out-dir=build/static/media/ && \
    find build -name "*.js" -exec gzip -k {} \; && \
    find build -name "*.css" -exec gzip -k {} \;

# Stage per server di produzione
FROM nginx:alpine AS production

# Configurazione Nginx ottimizzata
COPY nginx.conf /etc/nginx/nginx.conf

# Copia assets ottimizzati
COPY --from=builder /app/build /usr/share/nginx/html

# Security headers e ottimizzazioni
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
        \
        # Cache statico \
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
            expires 1y; \
            add_header Cache-Control "public, immutable"; \
        } \
        \
        # Gzip pre-compressed \
        location ~* \.(js|css)$ { \
            gzip_static on; \
        } \
    } \
}' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
```

### CDN-Ready Build

```dockerfile
# Dockerfile.cdn-ready
# syntax=docker/dockerfile:1

FROM node:18-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build stage con CDN optimization
FROM dependencies AS builder
COPY . .

# Build per CDN con asset optimization
ENV REACT_APP_CDN_URL=https://cdn.example.com
ENV PUBLIC_URL=https://cdn.example.com

RUN npm run build

# Asset optimization per CDN
RUN npx webpack-bundle-analyzer build/static/js/*.js --mode static --report build/bundle-report.html && \
    npx imagemin 'build/**/*.{jpg,png,gif}' --out-dir=build-optimized/ && \
    find build -name "*.js" -size +100k -exec echo "Large bundle warning: {}" \;

# CDN preparation stage
FROM alpine:latest AS cdn-prep

RUN apk add --no-cache aws-cli curl

WORKDIR /assets

# Copia assets ottimizzati
COPY --from=builder /app/build ./

# Script per upload CDN
COPY scripts/cdn-deploy.sh ./
RUN chmod +x cdn-deploy.sh

# Genera manifest per cache invalidation
RUN find . -type f -name "*.js" -o -name "*.css" | \
    xargs md5sum > asset-manifest.txt

# Local serve stage per testing
FROM nginx:alpine AS local-serve
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

---

## Scripts di Build e Testing

### Script di Build Ottimizzato

```bash
#!/bin/bash
# scripts/build-optimized.sh

set -e

echo "🚀 Starting optimized multi-stage build..."

# Build con cache
DOCKER_BUILDKIT=1 docker build \
  --target=production \
  --cache-from=myapp:cache \
  --cache-to=myapp:cache \
  --tag=myapp:optimized \
  -f Dockerfile.optimized \
  .

# Build time comparison
echo "📊 Build time comparison:"
time DOCKER_BUILDKIT=1 docker build --no-cache -t myapp:no-cache .
time DOCKER_BUILDKIT=1 docker build --cache-from=myapp:cache -t myapp:cached .

# Image size analysis
echo "📏 Image size analysis:"
docker images myapp --format "table {{.Tag}}\t{{.Size}}"

echo "✅ Build completed successfully!"
```

### Benchmark Performance

```bash
#!/bin/bash
# scripts/benchmark.sh

echo "🔍 Performance benchmarking..."

# Build time benchmark
echo "⏱️  Build time comparison:"
for dockerfile in Dockerfile.basic Dockerfile.optimized Dockerfile.parallel; do
  echo "Testing $dockerfile..."
  time DOCKER_BUILDKIT=1 docker build -f $dockerfile -t test:$dockerfile . > /dev/null
done

# Runtime performance
echo "🏃 Runtime performance:"
docker run --rm myapp:optimized time node -e "console.log('Startup time test')"

# Memory usage
echo "💾 Memory analysis:"
docker stats --no-stream myapp:optimized

echo "✅ Benchmarking completed!"
```

## Best Practices per Ottimizzazione

### 1. Cache Strategy

```dockerfile
# ✅ Layer caching ottimale
COPY package*.json ./          # Cache layer 1
RUN npm install               # Cache layer 2
COPY src/ ./src/             # Cache layer 3
RUN npm run build            # Cache layer 4

# ❌ Cache invalidation frequente
COPY . .                     # Invalida cache ad ogni cambio
RUN npm install && npm run build
```

### 2. Parallel Builds

```yaml
# docker-compose.yml per build paralleli
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.parallel
      target: production
  
  test:
    build:
      context: .
      dockerfile: Dockerfile.parallel
      target: tester
  
  security:
    build:
      context: .
      dockerfile: Dockerfile.parallel
      target: security
```

### 3. Build Args per Ottimizzazione

```dockerfile
ARG BUILD_ENV=production
ARG OPTIMIZE_LEVEL=2
ARG ENABLE_CACHE=true

# Conditional optimization
RUN if [ "$BUILD_ENV" = "production" ]; then \
      npm run build:prod --optimization-level=$OPTIMIZE_LEVEL; \
    else \
      npm run build:dev; \
    fi
```

## Conclusioni

Le tecniche di ottimizzazione per multi-stage builds includono:

1. **Cache Intelligente**: Separazione dei layer per massimizzare riutilizzo
2. **Build Paralleli**: Esecuzione simultanea di stage indipendenti  
3. **Asset Optimization**: Compressione e ottimizzazione automatica
4. **Selective Copying**: Copia solo degli artefatti necessari
5. **Performance Monitoring**: Benchmark e analisi continue

Queste ottimizzazioni possono ridurre i tempi di build del 50-80% e le dimensioni delle immagini del 30-60%.
