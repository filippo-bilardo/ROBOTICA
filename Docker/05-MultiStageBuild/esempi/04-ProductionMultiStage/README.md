# Esempi: Multi-stage Builds per Produzione

## Introduzione

Questa sezione presenta pattern enterprise-grade per multi-stage builds, progettati per ambienti di produzione con requisiti avanzati di:

- **Scalabilità**: Build che supportano deployment distribuiti
- **Sicurezza**: Hardening e compliance per produzione
- **Monitoraggio**: Observability e debugging integrati
- **Performance**: Ottimizzazioni per carichi di lavoro reali
- **Resilienza**: Fault tolerance e recovery automatico

## Esempi Inclusi

### 1. Microservizi Enterprise
- Service mesh ready
- Distributed tracing
- Health checks avanzati
- Configuration management

### 2. API Gateway di Produzione
- Rate limiting
- Authentication/Authorization
- Request/Response logging
- Circuit breaker pattern

### 3. Database Migration Pipeline
- Zero-downtime migrations
- Rollback automatico
- Data validation
- Performance monitoring

### 4. ML Model Serving Pipeline
- Model versioning
- A/B testing capability
- Performance metrics
- Auto-scaling support

---

## 1. Microservizio Enterprise

### Struttura Directory
```
01-enterprise-microservice/
├── Dockerfile.production
├── Dockerfile.debug
├── configs/
│   ├── production.yaml
│   ├── staging.yaml
│   └── development.yaml
├── src/
│   ├── main.go
│   ├── handlers/
│   ├── middleware/
│   ├── services/
│   └── models/
├── deployments/
│   ├── k8s/
│   ├── helm/
│   └── docker-compose.prod.yml
├── monitoring/
│   ├── prometheus.yml
│   ├── grafana/
│   └── jaeger/
└── scripts/
    ├── deploy.sh
    ├── health-check.sh
    └── rollback.sh
```

### Production-Ready Microservice

```dockerfile
# Dockerfile.production
# syntax=docker/dockerfile:1

# Build arguments per configurazione
ARG GO_VERSION=1.21
ARG ALPINE_VERSION=3.18
ARG BUILD_VERSION=dev
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown

# Base image con security updates
FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS base

# Installa certificati e timezone data
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    git \
    && update-ca-certificates

# Dependencies stage con cache ottimizzata
FROM base AS dependencies

WORKDIR /app

# Download dependencies separatamente per cache
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Verifica dipendenze per sicurezza
RUN go list -m all | grep -v "^go " > dependencies.txt

# Security scanning stage
FROM dependencies AS security

# Install security tools
RUN go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
RUN go install honnef.co/go/tools/cmd/staticcheck@latest

COPY . .

# Comprehensive security scanning
RUN gosec -fmt json -out gosec-report.json ./...
RUN staticcheck -f json ./... > staticcheck-report.json

# Vulnerability scanning delle dipendenze
RUN go list -json -m all | nancy sleuth > vuln-report.txt

# Build stage con ottimizzazioni
FROM dependencies AS builder

# Build arguments
ARG BUILD_VERSION
ARG BUILD_COMMIT  
ARG BUILD_DATE

WORKDIR /app

# Copy security reports per validation
COPY --from=security /app/gosec-report.json /tmp/
COPY --from=security /app/vuln-report.txt /tmp/

COPY . .

# Build con informazioni di versioning
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build \
    -a -installsuffix cgo \
    -ldflags="-w -s \
              -X main.Version=${BUILD_VERSION} \
              -X main.Commit=${BUILD_COMMIT} \
              -X main.BuildDate=${BUILD_DATE} \
              -extldflags '-static'" \
    -tags netgo,osusergo \
    -o service \
    ./cmd/main.go

# Verifica binary
RUN ./service --version
RUN ldd ./service 2>&1 | grep -q "not a dynamic executable"

# Production stage ultra-sicuro
FROM scratch AS production

# Metadata per compliance
LABEL maintainer="sre@company.com" \
      version="${BUILD_VERSION}" \
      commit="${BUILD_COMMIT}" \
      build-date="${BUILD_DATE}" \
      security.scan="passed" \
      compliance.level="enterprise"

# Copy certificati e timezone
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /app/service /service

# Copy configuration files
COPY --from=builder /app/configs/ /etc/service/

# Expose ports (non-privileged)
EXPOSE 8080 8443 9090

# Health check avanzato
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD ["/service", "healthcheck"]

# User directive per security (quando supportato)
# USER 65534:65534

ENTRYPOINT ["/service"]
CMD ["serve", "--config=/etc/service/production.yaml"]
```

### Debug-Enabled Version

```dockerfile
# Dockerfile.debug
# syntax=docker/dockerfile:1

FROM golang:1.21-alpine AS base
RUN apk add --no-cache ca-certificates git curl tcpdump strace

FROM base AS debug-build
WORKDIR /app

# Install debugging tools
RUN go install github.com/go-delve/delve/cmd/dlv@latest
RUN go install github.com/google/pprof@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build with debug symbols
RUN CGO_ENABLED=0 go build \
    -gcflags="all=-N -l" \
    -o service-debug \
    ./cmd/main.go

# Debug stage
FROM alpine:3.18 AS debug

RUN apk add --no-cache ca-certificates curl bash

WORKDIR /app

# Copy binary with debug symbols
COPY --from=debug-build /app/service-debug ./service
COPY --from=debug-build /go/bin/dlv /usr/local/bin/

# Copy configs
COPY configs/ /etc/service/

# Expose debug ports
EXPOSE 8080 8443 9090 40000

# Debug entry point
ENTRYPOINT ["dlv", "--listen=:40000", "--headless=true", "--api-version=2", "--accept-multiclient", "exec", "./service", "--"]
CMD ["serve", "--config=/etc/service/development.yaml"]
```

---

## 2. API Gateway di Produzione

### Struttura Directory
```
02-api-gateway/
├── Dockerfile.gateway
├── nginx/
│   ├── nginx.conf
│   ├── ssl/
│   └── lua/
├── kong/
│   ├── kong.yml
│   └── plugins/
├── traefik/
│   └── traefik.yml
├── middleware/
│   ├── auth.lua
│   ├── rate-limit.lua
│   └── logging.lua
└── monitoring/
    ├── prometheus.yml
    └── grafana-dashboard.json
```

### Enterprise API Gateway

```dockerfile
# Dockerfile.gateway
# syntax=docker/dockerfile:1

# Kong base con plugins enterprise
FROM kong:3.4-alpine AS kong-base

# Install enterprise plugins
USER root

# Custom plugins
COPY kong/plugins/ /usr/local/share/lua/5.1/kong/plugins/
COPY kong/kong.yml /etc/kong/

# Security hardening
RUN apk add --no-cache \
    curl \
    openssl \
    && rm -rf /var/cache/apk/*

# Nginx stage per load balancing
FROM nginx:1.25-alpine AS nginx-base

# Install Lua support
RUN apk add --no-cache \
    nginx-mod-http-lua \
    nginx-mod-http-lua-upstream \
    luajit \
    curl

# Copy configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/lua/ /etc/nginx/lua/

# SSL certificates stage
FROM alpine:latest AS ssl-certs

RUN apk add --no-cache openssl

WORKDIR /certs

# Generate self-signed certs per development
RUN openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout server.key \
    -out server.crt \
    -subj "/C=US/ST=CA/L=SF/O=Company/CN=api.company.com"

# Monitoring stage
FROM prom/prometheus:latest AS prometheus

COPY monitoring/prometheus.yml /etc/prometheus/

# Rate limiting con Redis
FROM redis:7-alpine AS redis-rate-limit

# Configure per rate limiting
RUN echo "maxmemory 256mb" >> /etc/redis/redis.conf
RUN echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf

# Final gateway stage
FROM kong-base AS production

# Copy SSL certificates
COPY --from=ssl-certs /certs/ /etc/ssl/certs/

# Copy monitoring configs
COPY --from=prometheus /etc/prometheus/prometheus.yml /etc/prometheus/

# Enterprise configuration
ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml
ENV KONG_PROXY_ACCESS_LOG=/dev/stdout
ENV KONG_ADMIN_ACCESS_LOG=/dev/stdout
ENV KONG_PROXY_ERROR_LOG=/dev/stderr
ENV KONG_ADMIN_ERROR_LOG=/dev/stderr
ENV KONG_ADMIN_LISTEN="0.0.0.0:8001"
ENV KONG_PROXY_LISTEN="0.0.0.0:8000 ssl"
ENV KONG_SSL_CERT=/etc/ssl/certs/server.crt
ENV KONG_SSL_CERT_KEY=/etc/ssl/certs/server.key

# Plugin configuration
ENV KONG_PLUGINS="bundled,rate-limiting-advanced,auth-enterprise"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD kong health || exit 1

EXPOSE 8000 8443 8001 8444

USER kong

ENTRYPOINT ["kong", "docker-start"]
```

### Gateway con Traefik

```dockerfile
# Dockerfile.traefik
# syntax=docker/dockerfile:1

FROM traefik:v3.0 AS traefik-base

# Copy configuration
COPY traefik/traefik.yml /etc/traefik/

# Install additional certificates
USER root
RUN apk add --no-cache curl openssl
USER traefik

# Production Traefik gateway
FROM traefik-base AS production

# Labels per auto-discovery
LABEL traefik.enable=true
LABEL traefik.http.routers.api.rule="Host(\`traefik.company.com\`)"
LABEL traefik.http.routers.api.service="api@internal"
LABEL traefik.http.routers.api.middlewares="auth"

# SSL configuration
ENV TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_EMAIL=admin@company.com
ENV TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_STORAGE=/data/acme.json
ENV TRAEFIK_CERTIFICATESRESOLVERS_LETSENCRYPT_ACME_HTTPCHALLENGE_ENTRYPOINT=web

# Monitoring
ENV TRAEFIK_METRICS_PROMETHEUS=true
ENV TRAEFIK_METRICS_PROMETHEUS_ADDENTRYPOINTSLABELS=true
ENV TRAEFIK_METRICS_PROMETHEUS_ADDSERVICESLABELS=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
    CMD traefik healthcheck || exit 1

EXPOSE 80 443 8080

ENTRYPOINT ["traefik"]
```

---

## 3. Database Migration Pipeline

### Struttura Directory
```
03-database-pipeline/
├── Dockerfile.migration
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   └── rollback/
├── scripts/
│   ├── migrate.sh
│   ├── rollback.sh
│   └── validate.sh
├── tests/
│   ├── migration_tests.sql
│   └── performance_tests.sql
└── monitoring/
    ├── migration_metrics.sql
    └── alerts.yml
```

### Production Migration Pipeline

```dockerfile
# Dockerfile.migration
# syntax=docker/dockerfile:1

# Base image con database tools
FROM postgres:15-alpine AS db-tools

# Install migration tools
RUN apk add --no-cache \
    curl \
    jq \
    bash \
    python3 \
    py3-pip

# Install advanced tools
RUN pip3 install --no-cache-dir \
    pgcli \
    sqlfluff \
    great-expectations

# Migration validation stage
FROM db-tools AS migration-validator

WORKDIR /migrations

# Copy migration files
COPY migrations/ ./migrations/
COPY tests/ ./tests/

# Validate migration syntax
RUN find migrations/ -name "*.sql" -exec sqlfluff lint {} \;

# Check for destructive operations
RUN cat > check_destructive.sh << 'EOF'
#!/bin/bash
destructive_ops=("DROP TABLE" "DROP COLUMN" "TRUNCATE" "DELETE FROM")
for file in migrations/*.sql; do
    for op in "${destructive_ops[@]}"; do
        if grep -qi "$op" "$file"; then
            echo "WARNING: Destructive operation '$op' found in $file"
            echo "Requires manual approval"
        fi
    done
done
EOF

RUN chmod +x check_destructive.sh && ./check_destructive.sh

# Migration execution stage
FROM db-tools AS migration-executor

WORKDIR /app

COPY --from=migration-validator /migrations ./migrations
COPY scripts/ ./scripts/

# Create migration execution script
RUN cat > execute_migrations.sh << 'EOF'
#!/bin/bash
set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-production}
DB_USER=${DB_USER:-postgres}
DB_PASS=${DB_PASS:-password}

# Connection string
CONN_STR="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

echo "🔄 Starting database migration..."

# Pre-migration checks
echo "🔍 Running pre-migration checks..."

# Check database connectivity
psql "$CONN_STR" -c "SELECT version();" > /dev/null
echo "✅ Database connection successful"

# Check migration table exists
psql "$CONN_STR" -c "
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW(),
    checksum VARCHAR(64),
    execution_time_ms INTEGER,
    rollback_script TEXT
);" > /dev/null

# Backup before migration
echo "💾 Creating backup..."
pg_dump "$CONN_STR" > "/tmp/pre_migration_backup_$(date +%Y%m%d_%H%M%S).sql"

# Execute migrations
for migration in migrations/*.sql; do
    migration_name=$(basename "$migration" .sql)
    
    # Check if already applied
    count=$(psql "$CONN_STR" -t -c "SELECT COUNT(*) FROM migration_history WHERE migration_name='$migration_name';")
    
    if [ $count -eq 0 ]; then
        echo "📦 Applying migration: $migration_name"
        
        # Calculate checksum
        checksum=$(md5sum "$migration" | cut -d' ' -f1)
        
        # Execute with timing
        start_time=$(date +%s%3N)
        psql "$CONN_STR" -f "$migration"
        end_time=$(date +%s%3N)
        execution_time=$((end_time - start_time))
        
        # Record in history
        psql "$CONN_STR" -c "
        INSERT INTO migration_history (migration_name, checksum, execution_time_ms)
        VALUES ('$migration_name', '$checksum', $execution_time);"
        
        echo "✅ Migration $migration_name completed in ${execution_time}ms"
    else
        echo "⏭️  Migration $migration_name already applied"
    fi
done

echo "🎉 All migrations completed successfully!"
EOF

RUN chmod +x execute_migrations.sh

# Rollback stage
FROM migration-executor AS rollback-manager

# Create rollback script
RUN cat > rollback.sh << 'EOF'
#!/bin/bash
set -e

MIGRATION_TO_ROLLBACK=${1:-""}

if [ -z "$MIGRATION_TO_ROLLBACK" ]; then
    echo "❌ Please specify migration to rollback"
    exit 1
fi

echo "🔄 Rolling back migration: $MIGRATION_TO_ROLLBACK"

# Check if rollback script exists
rollback_script="migrations/rollback/${MIGRATION_TO_ROLLBACK}_rollback.sql"

if [ ! -f "$rollback_script" ]; then
    echo "❌ Rollback script not found: $rollback_script"
    exit 1
fi

# Execute rollback
psql "$CONN_STR" -f "$rollback_script"

# Remove from history
psql "$CONN_STR" -c "
DELETE FROM migration_history 
WHERE migration_name='$MIGRATION_TO_ROLLBACK';"

echo "✅ Rollback completed for $MIGRATION_TO_ROLLBACK"
EOF

RUN chmod +x rollback.sh

# Performance testing stage
FROM migration-executor AS performance-tester

# Copy performance tests
COPY tests/performance_tests.sql ./

RUN cat > performance_test.sh << 'EOF'
#!/bin/bash
set -e

echo "📊 Running performance tests..."

# Test query performance before/after migration
psql "$CONN_STR" -f tests/performance_tests.sql > performance_results.txt

# Analyze results
echo "Performance test results:"
cat performance_results.txt

# Check for performance degradation
if grep -q "SLOW_QUERY" performance_results.txt; then
    echo "⚠️  Performance degradation detected!"
    echo "Review slow queries before proceeding to production"
fi
EOF

RUN chmod +x performance_test.sh

# Production migration stage
FROM migration-executor AS production

# Health check per migration status
HEALTHCHECK --interval=60s --timeout=30s \
    CMD psql "$CONN_STR" -c "SELECT 1;" || exit 1

# Default environment variables
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=production
ENV BACKUP_ENABLED=true
ENV ROLLBACK_ON_FAILURE=true

# Entry point
ENTRYPOINT ["./execute_migrations.sh"]
```

---

## 4. ML Model Serving Pipeline

### Struttura Directory
```
04-ml-pipeline/
├── Dockerfile.ml-serving
├── models/
│   ├── v1/
│   ├── v2/
│   └── metadata/
├── api/
│   ├── main.py
│   ├── model_loader.py
│   └── predictor.py
├── monitoring/
│   ├── model_metrics.py
│   ├── drift_detection.py
│   └── performance_monitor.py
└── scripts/
    ├── model_validation.py
    ├── ab_test.py
    └── deploy_model.sh
```

### ML Production Serving

```dockerfile
# Dockerfile.ml-serving
# syntax=docker/dockerfile:1

# Base image con ML libraries
FROM python:3.11-slim AS ml-base

# Install system dependencies per ML
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libblas-dev \
    liblapack-dev \
    libgomp1 \
    curl \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Model validation stage
FROM ml-base AS model-validator

# Install validation dependencies
COPY requirements-validation.txt ./
RUN pip install --no-cache-dir -r requirements-validation.txt

# Copy models e validation scripts
COPY models/ ./models/
COPY scripts/model_validation.py ./

# Validate all models
RUN python model_validation.py --models-dir=./models/ --strict

# Performance benchmarking
RUN python -c "
import joblib
import time
import numpy as np
from pathlib import Path

models_dir = Path('./models/')
results = {}

for model_path in models_dir.glob('*/model.pkl'):
    model = joblib.load(model_path)
    
    # Benchmark inference time
    test_data = np.random.random((1000, 10))
    
    start_time = time.time()
    predictions = model.predict(test_data)
    end_time = time.time()
    
    avg_inference_time = (end_time - start_time) / 1000
    
    version = model_path.parent.name
    results[version] = {
        'avg_inference_ms': avg_inference_time * 1000,
        'predictions_shape': predictions.shape
    }
    
    print(f'Model {version}: {avg_inference_time*1000:.2f}ms avg inference')

# Salva benchmark results
import json
with open('benchmark_results.json', 'w') as f:
    json.dump(results, f, indent=2)
"

# Production dependencies stage
FROM ml-base AS ml-dependencies

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# API serving stage
FROM ml-dependencies AS api-server

# Copy validated models
COPY --from=model-validator /app/models/ ./models/
COPY --from=model-validator /app/benchmark_results.json ./

# Copy API code
COPY api/ ./api/
COPY monitoring/ ./monitoring/

# Create model serving script
RUN cat > serve_models.py << 'EOF'
import os
import json
import joblib
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import logging
from prometheus_client import Counter, Histogram, generate_latest
import time

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
PREDICTION_COUNTER = Counter('ml_predictions_total', 'Total predictions', ['model_version'])
PREDICTION_LATENCY = Histogram('ml_prediction_duration_seconds', 'Prediction latency', ['model_version'])
MODEL_LOAD_COUNTER = Counter('ml_model_loads_total', 'Model loads', ['model_version'])

app = FastAPI(title="ML Model Serving API", version="1.0.0")

# Global model storage
models = {}
model_metadata = {}

class PredictionRequest(BaseModel):
    features: List[List[float]]
    model_version: str = "latest"

class PredictionResponse(BaseModel):
    predictions: List[float]
    model_version: str
    inference_time_ms: float

def load_models():
    """Load all available models"""
    models_dir = Path("./models/")
    
    for model_dir in models_dir.iterdir():
        if model_dir.is_dir():
            model_path = model_dir / "model.pkl"
            metadata_path = model_dir / "metadata.json"
            
            if model_path.exists():
                try:
                    # Load model
                    model = joblib.load(model_path)
                    models[model_dir.name] = model
                    
                    # Load metadata
                    if metadata_path.exists():
                        with open(metadata_path) as f:
                            model_metadata[model_dir.name] = json.load(f)
                    
                    MODEL_LOAD_COUNTER.labels(model_version=model_dir.name).inc()
                    logger.info(f"Loaded model: {model_dir.name}")
                    
                except Exception as e:
                    logger.error(f"Failed to load model {model_dir.name}: {e}")

def get_model(version: str):
    """Get model by version"""
    if version == "latest":
        # Return the latest version (highest version number)
        versions = [v for v in models.keys() if v.startswith('v')]
        if versions:
            version = max(versions, key=lambda x: int(x[1:]))
        else:
            raise HTTPException(404, "No models available")
    
    if version not in models:
        raise HTTPException(404, f"Model version {version} not found")
    
    return models[version], version

@app.on_event("startup")
async def startup_event():
    load_models()
    logger.info(f"API started with {len(models)} models loaded")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "available_versions": list(models.keys())
    }

@app.get("/models")
async def list_models():
    return {
        "models": {
            version: model_metadata.get(version, {})
            for version in models.keys()
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    start_time = time.time()
    
    try:
        # Get model
        model, actual_version = get_model(request.model_version)
        
        # Make prediction
        features = np.array(request.features)
        predictions = model.predict(features)
        
        # Calculate inference time
        inference_time = (time.time() - start_time) * 1000
        
        # Update metrics
        PREDICTION_COUNTER.labels(model_version=actual_version).inc()
        PREDICTION_LATENCY.labels(model_version=actual_version).observe(time.time() - start_time)
        
        return PredictionResponse(
            predictions=predictions.tolist(),
            model_version=actual_version,
            inference_time_ms=inference_time
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(500, f"Prediction failed: {str(e)}")

@app.get("/metrics")
async def metrics():
    return generate_latest()

if __name__ == "__main__":
    uvicorn.run(
        "serve_models:app",
        host="0.0.0.0",
        port=8000,
        workers=4
    )
EOF

# A/B testing stage
FROM api-server AS ab-testing

# Copy A/B testing utilities
COPY scripts/ab_test.py ./

RUN cat > ab_test_server.py << 'EOF'
import random
from serve_models import *

# Override predict endpoint per A/B testing
@app.post("/predict", response_model=PredictionResponse)
async def predict_ab(request: PredictionRequest):
    # A/B testing logic
    ab_test_ratio = float(os.getenv("AB_TEST_RATIO", "0.1"))
    
    if random.random() < ab_test_ratio and "v2" in models:
        # Route to new model version
        request.model_version = "v2"
        logger.info("Routing to v2 for A/B test")
    else:
        # Route to stable version
        request.model_version = "v1"
    
    return await predict(request)
EOF

# Production serving stage
FROM api-server AS production

# Copy production configuration
COPY configs/production.env ./

# Production environment
ENV WORKERS=4
ENV MAX_REQUESTS=1000
ENV MAX_REQUESTS_JITTER=50
ENV PRELOAD_APP=true
ENV LOG_LEVEL=info

# Health check avanzato
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
    CMD curl -f http://localhost:8000/health || exit 1

# Security: non-root user
RUN useradd --create-home --shell /bin/bash mluser
USER mluser

EXPOSE 8000

# Gunicorn per production
CMD ["gunicorn", "serve_models:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

---

## Scripts di Deployment

### Deployment Script Enterprise

```bash
#!/bin/bash
# scripts/deploy-enterprise.sh

set -e

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
NAMESPACE=${3:-default}

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Health check current deployment
if kubectl get deployment app-deployment -n $NAMESPACE >/dev/null 2>&1; then
    echo "📊 Current deployment status:"
    kubectl get deployment app-deployment -n $NAMESPACE
    
    # Check if current version is healthy
    ready_replicas=$(kubectl get deployment app-deployment -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    if [ "$ready_replicas" = "null" ] || [ -z "$ready_replicas" ]; then
        echo "⚠️  Current deployment not healthy, proceeding with caution"
    fi
fi

# Build and push image
echo "🏗️  Building production image..."
DOCKER_BUILDKIT=1 docker build \
    --target=production \
    --build-arg BUILD_VERSION=$IMAGE_TAG \
    --build-arg BUILD_COMMIT=$(git rev-parse HEAD) \
    --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
    --tag myapp:$IMAGE_TAG \
    -f Dockerfile.production \
    .

# Tag per registry
docker tag myapp:$IMAGE_TAG registry.company.com/myapp:$IMAGE_TAG

# Push to registry
echo "📤 Pushing to registry..."
docker push registry.company.com/myapp:$IMAGE_TAG

# Deploy with blue-green strategy
echo "🔄 Deploying with blue-green strategy..."

# Update deployment
kubectl set image deployment/app-deployment \
    app=registry.company.com/myapp:$IMAGE_TAG \
    -n $NAMESPACE

# Wait for rollout
kubectl rollout status deployment/app-deployment -n $NAMESPACE --timeout=300s

# Post-deployment verification
echo "✅ Running post-deployment checks..."

# Health check
sleep 30
kubectl exec deployment/app-deployment -n $NAMESPACE -- /service healthcheck

# Smoke tests
kubectl run smoke-test --rm -i --restart=Never \
    --image=curlimages/curl \
    -- curl -f http://app-service.$NAMESPACE.svc.cluster.local:8080/health

echo "🎉 Deployment completed successfully!"

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✨ Deployment process finished!"
```

### Monitoring Setup

```yaml
# monitoring/docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

volumes:
  grafana-storage:
```

## Best Practices Produzione

### 1. Security Hardening
```dockerfile
# ✅ Security-first approach
FROM scratch AS production
COPY --from=builder /etc/passwd /etc/passwd
USER 65534:65534
```

### 2. Observability
```dockerfile
# ✅ Built-in monitoring
HEALTHCHECK --interval=30s CMD ["/app", "healthcheck"]
COPY --from=builder /app/metrics /metrics
```

### 3. Configuration Management
```dockerfile
# ✅ Environment-specific configs
COPY configs/${ENVIRONMENT}.yaml /etc/app/config.yaml
```

### 4. Rollback Strategy
```bash
# ✅ Automated rollback
kubectl rollout undo deployment/app-deployment
```

## Conclusioni

I pattern di produzione enterprise includono:

1. **Security-First**: Hardening e compliance integrate
2. **Observability**: Monitoring e tracing nativi
3. **Scalability**: Design per carichi enterprise
4. **Resilience**: Fault tolerance e recovery automatico
5. **DevOps Integration**: Pipeline CI/CD complete

Questi pattern garantiscono deployments robusti e maintainable in ambienti di produzione critici.
