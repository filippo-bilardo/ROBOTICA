# Teoria: Pattern Avanzati Multi-stage

## Pattern Architetturali

### 1. Microservices Multi-stage

**Scenario:** Monorepo con multiple applicazioni

```dockerfile
# === BASE CONDIVISA ===
FROM node:16-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# === SHARED DEPENDENCIES ===
FROM base AS shared-deps
COPY package*.json lerna.json ./
COPY packages/shared/package*.json ./packages/shared/
RUN npm ci --workspace=shared

# === API SERVICE ===
FROM shared-deps AS api-builder
COPY packages/api/package*.json ./packages/api/
RUN npm ci --workspace=api
COPY packages/shared ./packages/shared
COPY packages/api ./packages/api
RUN npm run build --workspace=api

FROM base AS api-runtime
COPY --from=api-builder /app/packages/api/dist ./api
COPY --from=api-builder /app/node_modules ./node_modules
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api/server.js"]

# === WORKER SERVICE ===
FROM shared-deps AS worker-builder
COPY packages/worker/package*.json ./packages/worker/
RUN npm ci --workspace=worker
COPY packages/shared ./packages/shared
COPY packages/worker ./packages/worker
RUN npm run build --workspace=worker

FROM base AS worker-runtime
COPY --from=worker-builder /app/packages/worker/dist ./worker
COPY --from=worker-builder /app/node_modules ./node_modules
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "worker/index.js"]

# === WEB FRONTEND ===
FROM shared-deps AS web-builder
COPY packages/web/package*.json ./packages/web/
RUN npm ci --workspace=web
COPY packages/shared ./packages/shared
COPY packages/web ./packages/web
RUN npm run build --workspace=web

FROM nginx:alpine AS web-runtime
COPY --from=web-builder /app/packages/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

Build script per microservices:
```bash
#!/bin/bash

# Build specifico per servizio
SERVICE=$1

case $SERVICE in
  "api")
    docker build --target api-runtime -t myapp/api:latest .
    ;;
  "worker")
    docker build --target worker-runtime -t myapp/worker:latest .
    ;;
  "web")
    docker build --target web-runtime -t myapp/web:latest .
    ;;
  "all")
    docker build --target api-runtime -t myapp/api:latest .
    docker build --target worker-runtime -t myapp/worker:latest .
    docker build --target web-runtime -t myapp/web:latest .
    ;;
  *)
    echo "Usage: $0 {api|worker|web|all}"
    exit 1
    ;;
esac
```

### 2. Full-Stack Application Pattern

```dockerfile
# === DATABASE MIGRATION ===
FROM postgres:15-alpine AS db-migrator
COPY migrations/ /docker-entrypoint-initdb.d/
RUN apk add --no-cache postgresql-client

# === BACKEND BUILD ===
FROM maven:3.9-openjdk-17 AS backend-builder

WORKDIR /app
COPY backend/pom.xml ./
RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn clean package -DskipTests

# === FRONTEND BUILD ===
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# === TESTING STAGE ===
FROM backend-builder AS tester

# Test backend
RUN mvn test

# Integration tests
COPY --from=frontend-builder /app/dist ./src/test/resources/static
RUN mvn verify -Pintegration-tests

# === PRODUCTION BACKEND ===
FROM openjdk:17-jre-slim AS backend-prod

RUN useradd -r -u 1001 appuser
WORKDIR /app

COPY --from=backend-builder /app/target/*.jar app.jar
RUN chown appuser:appuser app.jar

USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

CMD ["java", "-jar", "app.jar"]

# === PRODUCTION FRONTEND ===
FROM nginx:alpine AS frontend-prod

# Custom nginx config
COPY nginx/default.conf /etc/nginx/conf.d/
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Health check page
RUN echo '{"status":"ok","service":"frontend"}' > /usr/share/nginx/html/health.json

HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost/health.json || exit 1

EXPOSE 80
```

### 3. Multi-Architecture Pattern

```dockerfile
# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM golang:1.20-alpine AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /app

# Platform-specific optimization
RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Cross-compilation
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -ldflags '-w -s' -o app .

# === RUNTIME ===
FROM scratch

# Copy timezone data e certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /app/app /app

EXPOSE 8080
ENTRYPOINT ["/app"]
```

Build multi-architettura:
```bash
# Setup buildx
docker buildx create --name multiarch --use

# Build per multiple architetture
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag myapp:latest \
  --push .
```

## Performance Optimization Patterns

### 1. Cache Optimization Layer Pattern

```dockerfile
# === LAYER 1: Sistema base (cache molto longeva) ===
FROM ubuntu:22.04 AS system-base

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# === LAYER 2: Runtime dependencies (cache longeva) ===
FROM system-base AS runtime-deps

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g pm2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# === LAYER 3: Application dependencies (cache media) ===
FROM runtime-deps AS app-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# === LAYER 4: Build dependencies (cache media) ===
FROM runtime-deps AS build-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# === LAYER 5: Build stage (cache volatile) ===
FROM build-deps AS builder

COPY . .
RUN npm run build && \
    npm run test

# === LAYER 6: Production (cache molto volatile) ===
FROM app-deps AS production

# Copy only built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Runtime configuration
COPY ecosystem.config.js ./
USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["pm2-runtime", "ecosystem.config.js"]
```

### 2. Conditional Dependencies Pattern

```dockerfile
FROM node:18-alpine AS base

ARG BUILD_MODE=production
ARG INCLUDE_DEVTOOLS=false

WORKDIR /app

# === PRODUCTION DEPENDENCIES ===
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --only=production

# === DEVELOPMENT DEPENDENCIES ===
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

# === DEV TOOLS (CONDITIONAL) ===
FROM alpine:latest AS devtools-false
RUN echo "No dev tools" > /tmp/devtools

FROM alpine:latest AS devtools-true
RUN apk add --no-cache \
    curl \
    htop \
    vim \
    bash

FROM devtools-${INCLUDE_DEVTOOLS} AS devtools

# === BUILD STAGE ===
FROM dev-deps AS builder
COPY . .
RUN npm run build

# === FINAL STAGE ===
FROM base AS final

# Conditional dependency copying
COPY --from=prod-deps /app/node_modules ./node_modules

# Development tools (if enabled)
COPY --from=devtools /usr/bin/* /usr/bin/ 2>/dev/null || true

# Application code
COPY --from=builder /app/dist ./dist
COPY package.json ./

CMD ["npm", "start"]
```

### 3. Parallel Processing Pattern

```dockerfile
# === PARALLEL BUILDS ===
FROM node:18 AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM golang:1.20 AS backend-deps  
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download

FROM python:3.11 AS ml-deps
WORKDIR /app/ml
COPY ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# === PARALLEL PROCESSING ===
FROM frontend-deps AS frontend-builder
COPY frontend/ .
RUN npm run build

FROM backend-deps AS backend-builder
COPY backend/ .
RUN CGO_ENABLED=0 go build -o api

FROM ml-deps AS ml-builder
COPY ml/ .
RUN python -m compileall .

# === TESTING PARALLEL ===
FROM frontend-builder AS frontend-tester
RUN npm run test

FROM backend-builder AS backend-tester
RUN go test ./...

FROM ml-builder AS ml-tester
RUN python -m pytest

# === INTEGRATION ===
FROM nginx:alpine AS final

# Collect all artifacts
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-builder /app/backend/api /usr/local/bin/
COPY --from=ml-builder /app/ml /opt/ml

# Test results metadata
COPY --from=frontend-tester /app/frontend/coverage ./coverage/frontend
COPY --from=backend-tester /app/backend/coverage.out ./coverage/
COPY --from=ml-tester /app/ml/htmlcov ./coverage/ml

# Configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
```

## Advanced Security Patterns

### 1. Secrets Management Pattern

```dockerfile
# syntax=docker/dockerfile:1

# === SECRETS BUILDER ===
FROM alpine:latest AS secrets-builder

# Build-time secrets using mount
RUN --mount=type=secret,id=api_key \
    --mount=type=secret,id=db_password \
    API_KEY=$(cat /run/secrets/api_key) && \
    DB_PASSWORD=$(cat /run/secrets/db_password) && \
    echo "API_KEY_HASH=$(echo -n $API_KEY | sha256sum | cut -d' ' -f1)" > /tmp/config && \
    echo "DB_CONFIG=encrypted_$(echo -n $DB_PASSWORD | base64)" >> /tmp/config

# === APPLICATION BUILDER ===
FROM node:18-alpine AS app-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Use processed secrets
COPY --from=secrets-builder /tmp/config ./config/secrets.env
RUN npm run build

# === PRODUCTION ===
FROM node:18-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Only production artifacts
COPY --from=app-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=app-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=app-builder --chown=nodejs:nodejs /app/config ./config

USER nodejs

# Runtime secrets handling
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
```

### 2. Supply Chain Security Pattern

```dockerfile
# === VERIFICATION STAGE ===
FROM alpine:latest AS verifier

# Install verification tools
RUN apk add --no-cache \
    cosign \
    curl \
    gnupg

# Verify base images
COPY verify-images.sh ./
RUN ./verify-images.sh

# === SECURE BASE ===
FROM node:18-alpine@sha256:specific-hash AS secure-base

# Verify Node.js integrity
RUN node --version > /tmp/node-version && \
    sha256sum /usr/local/bin/node > /tmp/node-checksum

# === DEPENDENCY SCANNER ===
FROM secure-base AS scanner

WORKDIR /app
COPY package*.json ./

# Audit dependencies
RUN npm audit --audit-level=moderate
RUN npm ci

# Vulnerability scanning
COPY --from=aquasec/trivy:latest /usr/local/bin/trivy /usr/local/bin/
RUN trivy fs --exit-code 1 --severity HIGH,CRITICAL .

# === BUILDER ===
FROM scanner AS builder

COPY . .
RUN npm run build

# SBOM generation
RUN npm run generate-sbom

# === PRODUCTION ===
FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /app

# Copy verified artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/sbom.json ./

# Metadata for tracking
LABEL org.opencontainers.image.source="https://github.com/company/app"
LABEL org.opencontainers.image.revision="$COMMIT_SHA"
LABEL security.scan.passed="true"
LABEL sbom.available="true"

CMD ["dist/server.js"]
```

## CI/CD Integration Patterns

### 1. Pipeline-Optimized Pattern

```dockerfile
# === BASE FOR CI ===
FROM node:18-alpine AS ci-base

# CI tools
RUN apk add --no-cache \
    git \
    bash \
    curl \
    jq

WORKDIR /app

# === DEPENDENCY CACHE ===
FROM ci-base AS deps

COPY package*.json ./
RUN npm ci --cache /tmp/.npm-cache

# === LINTING ===
FROM deps AS linter

COPY . .
RUN npm run lint:ci

# === TESTING ===
FROM deps AS tester

COPY . .
RUN npm run test:ci

# === SECURITY SCANNING ===
FROM deps AS security

COPY . .
RUN npm audit --audit-level=moderate
RUN npm run security:check

# === BUILD ===
FROM deps AS builder

COPY . .
RUN npm run build

# === QUALITY GATES ===
FROM alpine:latest AS quality-gate

COPY --from=linter /app/lint-results.xml ./reports/
COPY --from=tester /app/coverage ./reports/coverage/
COPY --from=security /app/security-report.json ./reports/
COPY --from=builder /app/dist ./artifacts/

# Quality checks
COPY quality-check.sh ./
RUN ./quality-check.sh

# === PRODUCTION ===
FROM node:18-alpine AS production

RUN adduser -D appuser
WORKDIR /app

COPY --from=quality-gate /artifacts ./
COPY package.json ./

USER appuser
CMD ["npm", "start"]
```

### 2. Environment-Specific Pattern

```dockerfile
ARG TARGET_ENV=production
ARG VERSION=latest

# === BASE ===
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./

# === DEVELOPMENT ===
FROM base AS development

RUN npm ci
COPY . .

# Development tools
RUN npm install -g nodemon concurrently

ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# === STAGING ===
FROM base AS staging

RUN npm ci --only=production
COPY . .

# Staging-specific config
ENV NODE_ENV=staging
ENV LOG_LEVEL=debug

HEALTHCHECK --interval=15s --timeout=5s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]

# === PRODUCTION ===
FROM base AS production

RUN npm ci --only=production && \
    npm cache clean --force

COPY . .

# Production optimizations
ENV NODE_ENV=production
ENV LOG_LEVEL=info

RUN adduser -D appuser && \
    chown -R appuser:appuser /app

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]

# === FINAL SELECTION ===
FROM ${TARGET_ENV} AS final
```

Build per environment:
```bash
# Development
docker build --target development -t myapp:dev .

# Staging
docker build --target staging -t myapp:staging .

# Production
docker build --target production -t myapp:prod .

# Environment variabile
docker build --build-arg TARGET_ENV=staging -t myapp:staging .
```

## Debugging e Observability

### 1. Debug-Enabled Pattern

```dockerfile
# === BASE ===
FROM node:18-alpine AS base
WORKDIR /app

# === PRODUCTION BUILD ===
FROM base AS production-builder
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# === DEBUG BUILD ===
FROM base AS debug-builder
COPY package*.json ./
RUN npm ci  # Include dev dependencies
COPY . .
RUN npm run build:debug

# === PRODUCTION ===
FROM node:18-alpine AS production
COPY --from=production-builder /app/dist ./dist
COPY --from=production-builder /app/node_modules ./node_modules
CMD ["npm", "start"]

# === DEBUG ===
FROM node:18-alpine AS debug

# Debug tools
RUN apk add --no-cache \
    bash \
    curl \
    htop \
    strace

COPY --from=debug-builder /app ./
# Debug port
EXPOSE 9229
CMD ["npm", "run", "debug"]
```

### 2. Monitoring Integration

```dockerfile
# === METRICS COLLECTOR ===
FROM prom/node-exporter:latest AS metrics-base

# === APPLICATION ===
FROM node:18-alpine AS app

WORKDIR /app

# Application code
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Monitoring agent
COPY --from=metrics-base /bin/node_exporter /usr/local/bin/

# Monitoring configuration
COPY monitoring/ ./monitoring/

# Multi-process startup
COPY start-with-monitoring.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-with-monitoring.sh

# Ports
EXPOSE 3000 9100

# Health checks
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/health && \
      curl -f http://localhost:9100/metrics || exit 1

CMD ["/usr/local/bin/start-with-monitoring.sh"]
```

## Conclusioni

I pattern avanzati multi-stage permettono di:

### Architettura
- **Microservices**: Build condivisi, deploy separati
- **Full-stack**: Coordinazione frontend/backend/database
- **Multi-arch**: Deploy universali

### Performance
- **Cache optimization**: Layer strategici per build veloci
- **Parallel processing**: Builds simultanei
- **Conditional builds**: Ottimizzazione basata su contesto

### Sicurezza
- **Secrets management**: Gestione sicura credenziali
- **Supply chain**: Verifica integrità dipendenze
- **Vulnerability scanning**: Controlli automatici

### CI/CD
- **Pipeline integration**: Ottimizzazione per automazione
- **Environment parity**: Stesso processo, contesti diversi
- **Quality gates**: Controlli qualità integrati

### Best Practices Pattern
1. **Separazione responsabilità** per stage
2. **Naming consistency** per manutenibilità
3. **Cache strategy** per performance
4. **Security by default** in ogni stage
5. **Observability** integrata

Il prossimo step è implementare questi pattern in esempi pratici con casi d'uso reali.
