# Esempi Pratici: Dockerfile Avanzati

## Panoramica
Questa sezione presenta esempi avanzati di Dockerfile che implementano pattern architetturali complessi, ottimizzazioni specifiche e tecniche avanzate per scenari di produzione enterprise.

---

## Esempio 1: Dockerfile con BuildKit Avanzato

### Build Condizionali e Cache Mount

```dockerfile
# 01-buildkit-advanced/Dockerfile
# syntax=docker/dockerfile:1.7

# Build arguments per personalizzazione
ARG NODE_VERSION=18
ARG BUILD_ENV=production
ARG ENABLE_DEBUG=false

# Stage base condizionale
FROM node:${NODE_VERSION}-alpine AS base

# Installa strumenti di sistema necessari
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --update --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Crea utente non-privilegiato
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Stage per dipendenze con cache intelligente
FROM base AS dependencies

# Cache mount per npm
RUN --mount=type=cache,target=/root/.npm \
    npm config set cache /root/.npm

# Copia file di configurazione
COPY package*.json ./

# Install condizionale basato su BUILD_ENV
RUN --mount=type=cache,target=/root/.npm \
    if [ "$BUILD_ENV" = "development" ]; then \
        npm ci; \
    else \
        npm ci --only=production; \
    fi

# Stage per build dell'applicazione
FROM dependencies AS builder

# Cache mount per build assets
RUN --mount=type=cache,target=/app/.next/cache \
    --mount=type=bind,source=.,target=/build-context,readonly \
    cp -r /build-context/src ./src && \
    cp -r /build-context/public ./public && \
    cp /build-context/next.config.js ./next.config.js && \
    npm run build

# Stage condizionale per debug
FROM base AS debug
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    strace \
    gdb \
    htop

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY . .

USER nextjs
CMD ["npm", "run", "dev"]

# Stage di produzione
FROM base AS production

# Copia solo artefatti necessari
COPY --from=dependencies --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs public ./public

# Rimuovi file non necessari in produzione
RUN npm prune --production && \
    rm -rf .next/cache

USER nextjs

EXPOSE 3000

# Health check avanzato con retry logic
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

# Stage finale basato su BUILD_ENV
FROM ${BUILD_ENV} AS final
```

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // Ottimizzazioni di produzione
  compress: true,
  poweredByHeader: false,
  // Health check endpoint
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
}

module.exports = nextConfig;
```

**Script di build avanzato**
```bash
#!/bin/bash
# advanced-build.sh

set -e

# Configurazione
IMAGE_NAME="advanced-webapp"
BUILD_ENV=${1:-production}
NODE_VERSION=${2:-18}
ENABLE_DEBUG=${3:-false}

echo "=== Building with advanced BuildKit features ==="
echo "Environment: $BUILD_ENV"
echo "Node Version: $NODE_VERSION"
echo "Debug: $ENABLE_DEBUG"

# Abilita BuildKit features
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# Build con build args e target specifico
docker build \
  --target final \
  --build-arg NODE_VERSION=$NODE_VERSION \
  --build-arg BUILD_ENV=$BUILD_ENV \
  --build-arg ENABLE_DEBUG=$ENABLE_DEBUG \
  --cache-from $IMAGE_NAME:buildcache \
  --cache-to type=registry,ref=$IMAGE_NAME:buildcache,mode=max \
  --tag $IMAGE_NAME:$BUILD_ENV-latest \
  --tag $IMAGE_NAME:$BUILD_ENV-$(git rev-parse --short HEAD) \
  .

echo "=== Analyzing build cache usage ==="
docker buildx du

echo "=== Testing built image ==="
docker run --rm -d --name test-$BUILD_ENV \
  -p 3000:3000 \
  $IMAGE_NAME:$BUILD_ENV-latest

sleep 10

# Test health endpoint
curl -f http://localhost:3000/api/health

# Cleanup
docker stop test-$BUILD_ENV

echo "=== Build completed successfully ==="
```

---

## Esempio 2: Dockerfile per Microservices

### Gateway API con Service Discovery

```dockerfile
# 02-microservices-gateway/Dockerfile
# syntax=docker/dockerfile:1

# Multi-stage build per microservices
FROM golang:1.21-alpine AS base

# Installa dipendenze per tutti i servizi
RUN apk add --no-cache git ca-certificates tzdata make

# Stage per service discovery
FROM base AS service-discovery
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

COPY cmd/discovery ./cmd/discovery
COPY internal ./internal
COPY pkg ./pkg

RUN CGO_ENABLED=0 go build -ldflags='-w -s' \
    -o discovery ./cmd/discovery

# Stage per API Gateway
FROM base AS gateway
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

COPY cmd/gateway ./cmd/gateway
COPY internal ./internal
COPY pkg ./pkg

RUN CGO_ENABLED=0 go build -ldflags='-w -s' \
    -o gateway ./cmd/gateway

# Stage per User Service
FROM base AS user-service
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

COPY cmd/userservice ./cmd/userservice
COPY internal ./internal
COPY pkg ./pkg

RUN CGO_ENABLED=0 go build -ldflags='-w -s' \
    -o userservice ./cmd/userservice

# Stage runtime condiviso
FROM alpine:3.18 AS runtime-base
RUN apk add --no-cache ca-certificates tzdata curl
RUN adduser -D -g '' appuser

# Service Discovery finale
FROM runtime-base AS discovery-final
COPY --from=service-discovery /build/discovery /app/discovery
USER appuser
EXPOSE 8500
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8500/health || exit 1
CMD ["/app/discovery"]

# Gateway finale
FROM runtime-base AS gateway-final
COPY --from=gateway /build/gateway /app/gateway
COPY config/gateway.yml /app/config/gateway.yml
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
CMD ["/app/gateway", "-config", "/app/config/gateway.yml"]

# User Service finale
FROM runtime-base AS userservice-final
COPY --from=user-service /build/userservice /app/userservice
USER appuser
EXPOSE 9001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:9001/health || exit 1
CMD ["/app/userservice"]

# Default: Gateway
FROM gateway-final
```

**docker-compose.microservices.yml**
```yaml
version: '3.8'

services:
  # Service Discovery
  discovery:
    build:
      context: .
      target: discovery-final
    ports:
      - "8500:8500"
    environment:
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8500/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - microservices

  # API Gateway
  gateway:
    build:
      context: .
      target: gateway-final
    ports:
      - "8080:8080"
    environment:
      - DISCOVERY_URL=http://discovery:8500
      - LOG_LEVEL=info
    depends_on:
      discovery:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - microservices

  # User Service
  userservice:
    build:
      context: .
      target: userservice-final
    environment:
      - DISCOVERY_URL=http://discovery:8500
      - DB_URL=postgresql://user:pass@postgres:5432/userdb
      - LOG_LEVEL=info
    depends_on:
      discovery:
        condition: service_healthy
      postgres:
        condition: service_healthy
    deploy:
      replicas: 2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - microservices

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=userdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d userdb"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - microservices

networks:
  microservices:
    driver: bridge

volumes:
  postgres_data:
```

---

## Esempio 3: Dockerfile per Machine Learning

### Pipeline ML con GPU Support

```dockerfile
# 03-ml-pipeline/Dockerfile
# syntax=docker/dockerfile:1

# Base image con CUDA support
ARG CUDA_VERSION=11.8
ARG UBUNTU_VERSION=22.04
FROM nvidia/cuda:${CUDA_VERSION}-devel-ubuntu${UBUNTU_VERSION} AS cuda-base

# Installa Python e dipendenze sistema
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Stage per data processing
FROM cuda-base AS data-processor

WORKDIR /app

# Installa dipendenze per data processing
COPY requirements-data.txt .
RUN pip install --no-cache-dir -r requirements-data.txt

COPY src/data_processing ./data_processing
COPY config/data_config.yml ./config/

# Health check per data processor
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=3 \
  CMD python3 -c "import data_processing; print('Data processor healthy')" || exit 1

CMD ["python3", "-m", "data_processing.main"]

# Stage per training
FROM cuda-base AS trainer

WORKDIR /app

# Installa dipendenze ML
COPY requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt

# Installa PyTorch con CUDA support
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

COPY src/training ./training
COPY src/models ./models
COPY config/training_config.yml ./config/

# Health check per trainer
HEALTHCHECK --interval=300s --timeout=60s --start-period=300s --retries=2 \
  CMD python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')" || exit 1

CMD ["python3", "-m", "training.train"]

# Stage per inference
FROM cuda-base AS inference

WORKDIR /app

# Installa solo dipendenze per inference
COPY requirements-inference.txt .
RUN pip install --no-cache-dir -r requirements-inference.txt

# Copia modelli pre-addestrati
COPY --from=trainer /app/models ./models
COPY src/inference ./inference

# Esponi API inference
EXPOSE 8000

# Health check per inference API
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python3", "-m", "inference.api"]

# Stage di sviluppo con Jupyter
FROM cuda-base AS development

WORKDIR /app

# Installa tutte le dipendenze
COPY requirements*.txt ./
RUN pip install --no-cache-dir \
    -r requirements-data.txt \
    -r requirements-ml.txt \
    -r requirements-inference.txt \
    jupyter \
    jupyterlab \
    tensorboard

# Installa PyTorch
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Copia tutto il codice
COPY . .

# Configura Jupyter
RUN jupyter lab --generate-config && \
    echo "c.ServerApp.ip = '0.0.0.0'" >> ~/.jupyter/jupyter_lab_config.py && \
    echo "c.ServerApp.allow_root = True" >> ~/.jupyter/jupyter_lab_config.py && \
    echo "c.ServerApp.token = ''" >> ~/.jupyter/jupyter_lab_config.py

EXPOSE 8888 6006 8000

CMD ["jupyter", "lab"]

# Default: inference
FROM inference
```

**requirements-ml.txt**
```txt
torch>=2.0.0
torchvision>=0.15.0
torchaudio>=2.0.0
transformers>=4.30.0
datasets>=2.14.0
accelerate>=0.21.0
tensorboard>=2.13.0
wandb>=0.15.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.15.0
```

**Script ML Pipeline**
```bash
#!/bin/bash
# ml-pipeline.sh

set -e

STAGE=${1:-inference}
GPU_SUPPORT=${2:-true}

echo "=== Building ML Pipeline - Stage: $STAGE ==="

# Configurazione GPU
if [ "$GPU_SUPPORT" = "true" ]; then
    RUNTIME_FLAGS="--gpus all"
    echo "GPU support enabled"
else
    RUNTIME_FLAGS=""
    echo "CPU only mode"
fi

case $STAGE in
    "data")
        echo "Building data processing stage..."
        docker build --target data-processor -t ml-pipeline:data .
        docker run --rm $RUNTIME_FLAGS \
            -v $(pwd)/data:/app/data \
            -v $(pwd)/output:/app/output \
            ml-pipeline:data
        ;;
    
    "train")
        echo "Building training stage..."
        docker build --target trainer -t ml-pipeline:train .
        docker run --rm $RUNTIME_FLAGS \
            -v $(pwd)/data:/app/data \
            -v $(pwd)/models:/app/models \
            -v $(pwd)/logs:/app/logs \
            ml-pipeline:train
        ;;
    
    "inference")
        echo "Building inference stage..."
        docker build --target inference -t ml-pipeline:inference .
        docker run -d --name ml-api $RUNTIME_FLAGS \
            -p 8000:8000 \
            -v $(pwd)/models:/app/models \
            ml-pipeline:inference
        
        # Test API
        sleep 10
        curl -f http://localhost:8000/health
        echo "ML API is running on http://localhost:8000"
        ;;
    
    "dev")
        echo "Starting development environment..."
        docker build --target development -t ml-pipeline:dev .
        docker run -d --name ml-dev $RUNTIME_FLAGS \
            -p 8888:8888 \
            -p 6006:6006 \
            -v $(pwd):/app \
            ml-pipeline:dev
        
        echo "Jupyter Lab available at http://localhost:8888"
        echo "TensorBoard available at http://localhost:6006"
        ;;
    
    *)
        echo "Unknown stage: $STAGE"
        echo "Available stages: data, train, inference, dev"
        exit 1
        ;;
esac

echo "=== ML Pipeline stage '$STAGE' completed ==="
```

---

## Esempio 4: Dockerfile per CI/CD Integration

### Build Ottimizzato per Pipeline

```dockerfile
# 04-cicd-optimized/Dockerfile
# syntax=docker/dockerfile:1

# Build arguments per CI/CD
ARG BUILDPLATFORM
ARG TARGETPLATFORM
ARG CI_COMMIT_SHA
ARG CI_COMMIT_REF
ARG BUILD_NUMBER

# Base image con metadata CI/CD
FROM --platform=$BUILDPLATFORM node:18-alpine AS ci-base

# Metadata per tracking builds
LABEL ci.commit.sha=${CI_COMMIT_SHA} \
      ci.commit.ref=${CI_COMMIT_REF} \
      ci.build.number=${BUILD_NUMBER} \
      ci.build.platform=${TARGETPLATFORM}

# Installa dipendenze CI/CD
RUN apk add --no-cache \
    git \
    curl \
    jq \
    make

# Stage per code quality
FROM ci-base AS quality-check

WORKDIR /app

# Installa strumenti di analisi
RUN npm install -g \
    eslint \
    prettier \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin

COPY package*.json ./
COPY .eslintrc.js ./
COPY .prettierrc ./
COPY tsconfig.json ./

RUN npm ci --only=dev

COPY src ./src

# Esegui controlli qualità
RUN npm run lint && \
    npm run format:check && \
    npm run type-check

# Stage per testing
FROM ci-base AS testing

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Esegui test con coverage
RUN npm run test:coverage && \
    npm run test:e2e

# Salva report di test
RUN mkdir -p /test-results && \
    cp -r coverage /test-results/ && \
    cp -r test-results /test-results/

# Stage per security scanning
FROM ci-base AS security-scan

WORKDIR /app

# Installa strumenti di sicurezza
RUN npm install -g \
    audit-ci \
    snyk

COPY package*.json ./
RUN npm ci

# Audit dipendenze
RUN npm audit --audit-level=high && \
    audit-ci --moderate

# Snyk security scan
ARG SNYK_TOKEN
RUN if [ -n "$SNYK_TOKEN" ]; then \
        snyk auth $SNYK_TOKEN && \
        snyk test; \
    fi

# Stage per build ottimizzato
FROM ci-base AS optimized-build

WORKDIR /app

# Cache mount per npm
RUN --mount=type=cache,target=/root/.npm \
    npm config set cache /root/.npm

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

COPY . .

# Build con ottimizzazioni
RUN npm run build:prod && \
    npm prune --production

# Stage finale per deployment
FROM alpine:3.18 AS deployment

# Installa runtime
RUN apk add --no-cache nodejs npm curl

# Crea utente non-privilegiato
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copia artefatti dai stage precedenti
COPY --from=optimized-build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=optimized-build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=optimized-build --chown=nextjs:nodejs /app/package.json ./package.json

# Metadata deployment
LABEL deployment.version=${CI_COMMIT_SHA} \
      deployment.environment="production" \
      deployment.build.number=${BUILD_NUMBER}

USER nextjs

EXPOSE 3000

# Health check avanzato
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

**Pipeline CI/CD Script**
```bash
#!/bin/bash
# cicd-pipeline.sh

set -e

STAGE=${1:-all}
CI_COMMIT_SHA=${CI_COMMIT_SHA:-$(git rev-parse HEAD)}
CI_COMMIT_REF=${CI_COMMIT_REF:-$(git branch --show-current)}
BUILD_NUMBER=${BUILD_NUMBER:-local-$(date +%s)}

echo "=== CI/CD Pipeline - Stage: $STAGE ==="
echo "Commit: $CI_COMMIT_SHA"
echo "Branch: $CI_COMMIT_REF"
echo "Build: $BUILD_NUMBER"

export DOCKER_BUILDKIT=1

# Funzione per eseguire stage specifico
run_stage() {
    local stage=$1
    local target=$2
    
    echo "Running stage: $stage"
    
    docker build \
        --target $target \
        --build-arg CI_COMMIT_SHA=$CI_COMMIT_SHA \
        --build-arg CI_COMMIT_REF=$CI_COMMIT_REF \
        --build-arg BUILD_NUMBER=$BUILD_NUMBER \
        --build-arg SNYK_TOKEN=$SNYK_TOKEN \
        --tag cicd-app:$stage-$BUILD_NUMBER \
        --cache-from cicd-app:$stage-cache \
        --cache-to type=registry,ref=cicd-app:$stage-cache,mode=max \
        .
}

case $STAGE in
    "quality")
        run_stage quality quality-check
        ;;
    
    "test")
        run_stage test testing
        
        # Estrai risultati test
        container_id=$(docker create cicd-app:test-$BUILD_NUMBER)
        docker cp $container_id:/test-results ./test-results
        docker rm $container_id
        ;;
    
    "security")
        run_stage security security-scan
        ;;
    
    "build")
        run_stage build optimized-build
        ;;
    
    "deploy")
        run_stage deploy deployment
        
        # Tag per deployment
        docker tag cicd-app:deploy-$BUILD_NUMBER cicd-app:latest
        docker tag cicd-app:deploy-$BUILD_NUMBER cicd-app:$CI_COMMIT_SHA
        ;;
    
    "all")
        echo "Running complete pipeline..."
        
        # Quality check
        run_stage quality quality-check
        
        # Testing
        run_stage test testing
        container_id=$(docker create cicd-app:test-$BUILD_NUMBER)
        docker cp $container_id:/test-results ./test-results
        docker rm $container_id
        
        # Security scan
        run_stage security security-scan
        
        # Build
        run_stage build optimized-build
        
        # Deploy
        run_stage deploy deployment
        docker tag cicd-app:deploy-$BUILD_NUMBER cicd-app:latest
        
        echo "Pipeline completed successfully!"
        ;;
    
    *)
        echo "Unknown stage: $STAGE"
        echo "Available stages: quality, test, security, build, deploy, all"
        exit 1
        ;;
esac

echo "=== Stage '$STAGE' completed successfully ==="
```

---

## Strumenti di Analisi e Monitoring

### Dockerfile per Monitoring Stack

```dockerfile
# 05-monitoring-stack/Dockerfile
FROM prom/prometheus:latest AS prometheus
COPY config/prometheus.yml /etc/prometheus/prometheus.yml

FROM grafana/grafana:latest AS grafana
COPY config/grafana /etc/grafana

FROM alpine:3.18 AS monitoring-agent
RUN apk add --no-cache curl jq
COPY scripts/monitoring-agent.sh /usr/local/bin/
CMD ["/usr/local/bin/monitoring-agent.sh"]
```

**Script di Analisi Performance**
```bash
#!/bin/bash
# performance-analysis.sh

IMAGE_NAME=${1:-"advanced-app:latest"}

echo "=== Analyzing Docker image performance ==="

# Analisi dimensioni layer
echo "Layer analysis:"
docker history $IMAGE_NAME --human --format "table {{.CreatedBy}}\t{{.Size}}"

# Analisi vulnerabilità
echo "Security scan:"
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy:latest image --severity HIGH,CRITICAL $IMAGE_NAME

# Test performance runtime
echo "Runtime performance test:"
docker run --rm \
    --memory=512m \
    --cpus=1 \
    -e NODE_ENV=production \
    $IMAGE_NAME /usr/local/bin/performance-test.sh

echo "=== Analysis completed ==="
```

Questi esempi avanzati mostrano come implementare Dockerfile per scenari complessi di produzione, integrando best practices per performance, sicurezza e maintainability.
