# Esempio 2: Dockerfile Ottimizzati

## Obiettivi
- Ottimizzare le performance di build e runtime
- Ridurre dimensioni delle immagini Docker
- Implementare strategie di cache efficaci
- Applicare best practices per Dockerfile production-ready

## Prerequisiti
- Esempio 1 completato
- Comprensione dei layer Docker
- Familiarità con gestione dipendenze

## Parte 1: Ottimizzazione Layer e Cache

### 1.1 Dockerfile Non Ottimizzato vs Ottimizzato

**❌ Approccio Inefficiente:**
```dockerfile
# File: Dockerfile.inefficient
FROM node:16

# ❌ Invalida cache ad ogni modifica del codice
COPY . /app
WORKDIR /app

# ❌ Reinstalla tutto ad ogni build
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
```

**✅ Approccio Ottimizzato:**
```dockerfile
# File: Dockerfile.optimized
FROM node:16-alpine

# ✅ Metadata prima (cambia raramente)
LABEL maintainer="developer@example.com"
LABEL version="1.0.0"

# ✅ Working directory prima di tutto
WORKDIR /app

# ✅ Dipendenze prima del codice (cache più persistente)
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# ✅ Codice per ultimo (cache più volatile)
COPY . .

# ✅ Non-root user per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# ✅ Health check per monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### 1.2 Confronto Performance

Creare file di test per misurare l'impatto:

**package.json:**
```json
{
  "name": "optimized-app",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.0",
    "morgan": "^1.10.0",
    "helmet": "^6.0.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

**server.js:**
```javascript
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Optimized Docker App',
    hostname: require('os').hostname(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
```

**Script di test performance:**
```bash
#!/bin/bash
# File: test-performance.sh

set -e

echo "=== Docker Build Performance Test ==="

# Test build inefficiente
echo "Building inefficient Dockerfile..."
time docker build -f Dockerfile.inefficient -t test-inefficient .

# Test build ottimizzato
echo "Building optimized Dockerfile..."
time docker build -f Dockerfile.optimized -t test-optimized .

# Confronto dimensioni
echo "=== Image Size Comparison ==="
docker images | grep "test-"

# Test rebuild (per cache)
echo "=== Testing Cache Efficiency ==="

# Modifica minore al codice
echo "// Cache test comment" >> server.js

echo "Rebuilding inefficient (should be slow)..."
time docker build -f Dockerfile.inefficient -t test-inefficient .

echo "Rebuilding optimized (should be fast)..."
time docker build -f Dockerfile.optimized -t test-optimized .

# Rimuovi modifica
git checkout server.js 2>/dev/null || sed -i '$ d' server.js

echo "Performance test completed!"
```

## Parte 2: Riduzione Dimensioni Immagini

### 2.1 Scelta Immagine Base Ottimale

```dockerfile
# File: Dockerfile.size-comparison
# Esempi per confrontare dimensioni

# ❌ Immagine completa (grande)
FROM node:16 AS full-version
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]

# ✅ Immagine Alpine (piccola)
FROM node:16-alpine AS alpine-version
RUN apk add --no-cache curl  # Solo per health check
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
CMD ["npm", "start"]

# ✅ Immagine Distroless (minimale)
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs:16 AS distroless-version
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["server.js"]
```

### 2.2 Cleanup Avanzato

```dockerfile
# File: Dockerfile.cleanup
FROM node:16-alpine

# ✅ Single RUN con cleanup completo
RUN apk add --no-cache --virtual .build-deps \
        python3 \
        make \
        g++ \
    && apk add --no-cache \
        curl \
        tini \
    && npm config set unsafe-perm true

WORKDIR /app

# Dependencies con cleanup
COPY package*.json ./
RUN npm ci --only=production \
    && npm cache clean --force \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/tmp/* /root/.npm

# Application files
COPY . .

# Multi-stage file size optimization
RUN find . -name "*.md" -delete \
    && find . -name "*.txt" -delete \
    && find . -name ".git*" -delete \
    && find . -name "test*" -type d -exec rm -rf {} + 2>/dev/null || true

# Security: non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 \
    && chown -R nodejs:nodejs /app

USER nodejs

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000
CMD ["npm", "start"]
```

### 2.3 .dockerignore Ottimizzato

```dockerignore
# File: .dockerignore

# Development files
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn

# Testing
coverage/
.nyc_output
test/
tests/
*.test.js
*.spec.js
__tests__/

# Documentation
*.md
!README.md
docs/
LICENSE

# Version control
.git
.gitignore
.gitattributes

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Environment files
.env*
!.env.example

# Build artifacts
dist/
build/
.cache/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Dependency directories
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# ESLint cache
.eslintcache

# Webpack
.webpack/

# Docker
Dockerfile*
docker-compose*
.dockerignore
```

## Parte 3: Ottimizzazioni Specifiche per Linguaggi

### 3.1 Python Flask Ottimizzato

```dockerfile
# File: Dockerfile.python-optimized
FROM python:3.11-slim AS base

# System optimization
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# ✅ Dependencies layer (stable)
FROM base AS dependencies

WORKDIR /app

# System dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libc6-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc libc6-dev

# ✅ Application layer (volatile)
FROM dependencies AS application

# Non-root user
RUN useradd --create-home --shell /bin/bash app
USER app
WORKDIR /home/app

# Application code
COPY --chown=app:app . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
    CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
CMD ["python", "app.py"]
```

**requirements.txt:**
```txt
Flask==2.3.3
gunicorn==21.2.0
psutil==5.9.5
```

**app.py:**
```python
from flask import Flask, jsonify
import psutil
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Optimized Python App',
        'python_version': os.sys.version,
        'memory_usage': psutil.virtual_memory()._asdict(),
        'cpu_percent': psutil.cpu_percent()
    })

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### 3.2 Go Application Ottimizzato

```dockerfile
# File: Dockerfile.go-optimized
FROM golang:1.20-alpine AS builder

# Build optimization
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# ✅ Dependencies first (cache optimization)
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# ✅ Application code
COPY . .

# ✅ Optimized build
RUN go build -ldflags='-w -s -extldflags "-static"' -a -installsuffix cgo -o app .

# ✅ Minimal runtime
FROM scratch

# Copy certificates and timezone data
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy binary
COPY --from=builder /app/app /app

EXPOSE 8080

# Health check using the app itself
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD ["/app", "healthcheck"]

ENTRYPOINT ["/app"]
```

**main.go:**
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "runtime"
    "time"
)

type HealthResponse struct {
    Status    string    `json:"status"`
    Timestamp time.Time `json:"timestamp"`
    Memory    runtime.MemStats `json:"memory"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    var m runtime.MemStats
    runtime.ReadMemStats(&m)
    
    response := HealthResponse{
        Status:    "ok",
        Timestamp: time.Now(),
        Memory:    m,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func main() {
    if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
        resp, err := http.Get("http://localhost:8080/health")
        if err != nil || resp.StatusCode != 200 {
            os.Exit(1)
        }
        os.Exit(0)
    }
    
    http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Optimized Go App - %s", time.Now().Format(time.RFC3339))
    })
    
    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

**go.mod:**
```go
module optimized-go-app

go 1.20
```

## Parte 4: Cache Optimization Avanzata

### 4.1 Cache Mount per Dependencies

```dockerfile
# File: Dockerfile.cache-mount
# syntax=docker/dockerfile:1

FROM node:16-alpine

WORKDIR /app

# ✅ Cache mount per npm
RUN --mount=type=cache,target=/root/.npm \
    npm set cache /root/.npm

COPY package*.json ./

# ✅ Shared cache across builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

COPY . .

CMD ["npm", "start"]
```

### 4.2 Multi-stage con Cache Condivisa

```dockerfile
# File: Dockerfile.shared-cache
FROM node:16-alpine AS base

WORKDIR /app
RUN npm config set cache /tmp/.npm

# ✅ Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/tmp/.npm \
    npm ci

# ✅ Build stage
FROM dependencies AS builder
COPY . .
RUN npm run build

# ✅ Test stage (parallel)
FROM dependencies AS tester
COPY . .
RUN npm test

# ✅ Production stage
FROM base AS production
COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules

CMD ["npm", "start"]
```

## Parte 5: Monitoring e Debugging

### 5.1 Dockerfile con Monitoring Integrato

```dockerfile
# File: Dockerfile.monitoring
FROM node:16-alpine

# ✅ Monitoring tools
RUN apk add --no-cache \
        curl \
        htop \
        procps \
        net-tools

WORKDIR /app

# Application setup
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# ✅ Monitoring script
RUN cat > /monitor.sh << 'EOF'
#!/bin/sh
while true; do
    echo "=== $(date) ==="
    echo "Memory: $(free -m | grep Mem)"
    echo "CPU: $(cat /proc/loadavg)"
    echo "Disk: $(df -h / | tail -1)"
    echo "Processes: $(ps aux | wc -l)"
    echo "Network: $(netstat -i | grep eth0 || echo 'N/A')"
    echo "---"
    sleep 60
done
EOF

RUN chmod +x /monitor.sh

# ✅ Health check con monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
    CMD curl -f http://localhost:3000/health && \
        [ $(ps aux | wc -l) -lt 50 ] && \
        [ $(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1) -lt 80 ]

EXPOSE 3000

# ✅ Supervisor script
RUN cat > /start.sh << 'EOF'
#!/bin/sh
echo "Starting monitoring..."
/monitor.sh &

echo "Starting application..."
npm start
EOF

RUN chmod +x /start.sh

CMD ["/start.sh"]
```

### 5.2 Build Analysis Tools

```bash
#!/bin/bash
# File: analyze-build.sh

set -e

IMAGE_NAME="$1"
if [ -z "$IMAGE_NAME" ]; then
    echo "Usage: $0 <image-name>"
    exit 1
fi

echo "=== Docker Image Analysis ==="

# Dimensioni layer
echo "Layer sizes:"
docker history "$IMAGE_NAME" --format "table {{.CreatedBy}}\t{{.Size}}" | head -20

echo -e "\n=== Image Information ==="
docker inspect "$IMAGE_NAME" | jq '.[0] | {
    Id: .Id,
    Size: .Size,
    Architecture: .Architecture,
    Os: .Os,
    Created: .Created,
    Author: .Author,
    Config: .Config
}'

echo -e "\n=== Security Analysis ==="
# Se disponibile, usa dive per analisi
if command -v dive >/dev/null; then
    echo "Running dive analysis..."
    dive "$IMAGE_NAME" --ci
else
    echo "Install 'dive' for detailed layer analysis"
    echo "wget https://github.com/wagoodman/dive/releases/download/v0.10.0/dive_0.10.0_linux_amd64.deb"
    echo "sudo apt install ./dive_0.10.0_linux_amd64.deb"
fi

echo -e "\n=== Vulnerability Scan ==="
if command -v trivy >/dev/null; then
    trivy image "$IMAGE_NAME"
else
    echo "Install 'trivy' for vulnerability scanning"
fi
```

## Parte 6: Benchmark e Comparison

### 6.1 Script di Benchmark Completo

```bash
#!/bin/bash
# File: benchmark-dockerfiles.sh

set -e

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Array di Dockerfile da testare
DOCKERFILES=(
    "Dockerfile.inefficient:test-inefficient"
    "Dockerfile.optimized:test-optimized"
    "Dockerfile.cleanup:test-cleanup"
    "Dockerfile.python-optimized:test-python"
    "Dockerfile.go-optimized:test-go"
    "Dockerfile.cache-mount:test-cache"
)

# Risultati
RESULTS_FILE="benchmark_results.json"
echo "[]" > "$RESULTS_FILE"

# Funzione di benchmark
benchmark_dockerfile() {
    local dockerfile="$1"
    local image_name="$2"
    
    log_step "Benchmarking $dockerfile"
    
    # Clean build
    docker rmi "$image_name" 2>/dev/null || true
    
    # Time build
    local start_time=$(date +%s.%N)
    docker build -f "$dockerfile" -t "$image_name" . >/dev/null 2>&1
    local end_time=$(date +%s.%N)
    local build_time=$(echo "$end_time - $start_time" | bc)
    
    # Get image size
    local size_bytes=$(docker inspect "$image_name" --format='{{.Size}}')
    local size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc)
    
    # Test rebuild (cache test)
    echo "// Cache test" >> server.js 2>/dev/null || touch cache_test_file
    local rebuild_start=$(date +%s.%N)
    docker build -f "$dockerfile" -t "$image_name" . >/dev/null 2>&1
    local rebuild_end=$(date +%s.%N)
    local rebuild_time=$(echo "$rebuild_end - $rebuild_start" | bc)
    
    # Cleanup test modification
    git checkout server.js 2>/dev/null || rm -f cache_test_file
    
    # Layer count
    local layer_count=$(docker history "$image_name" --format="{{.ID}}" | wc -l)
    
    # Save results
    local result=$(jq -n \
        --arg dockerfile "$dockerfile" \
        --arg image "$image_name" \
        --arg build_time "$build_time" \
        --arg rebuild_time "$rebuild_time" \
        --arg size_mb "$size_mb" \
        --arg layers "$layer_count" \
        '{
            dockerfile: $dockerfile,
            image: $image,
            build_time_seconds: ($build_time | tonumber),
            rebuild_time_seconds: ($rebuild_time | tonumber),
            size_mb: ($size_mb | tonumber),
            layer_count: ($layers | tonumber),
            cache_efficiency: (($build_time | tonumber) / ($rebuild_time | tonumber))
        }')
    
    # Append to results
    jq ". += [$result]" "$RESULTS_FILE" > tmp.json && mv tmp.json "$RESULTS_FILE"
    
    log_info "Build time: ${build_time}s, Size: ${size_mb}MB, Layers: $layer_count"
}

# Main execution
log_info "Starting Dockerfile benchmark"

for dockerfile_pair in "${DOCKERFILES[@]}"; do
    IFS=':' read -r dockerfile image_name <<< "$dockerfile_pair"
    
    if [[ -f "$dockerfile" ]]; then
        benchmark_dockerfile "$dockerfile" "$image_name"
    else
        echo "Skipping $dockerfile (not found)"
    fi
    echo
done

# Generate report
log_step "Generating benchmark report"

cat > benchmark_report.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Docker Benchmark Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .chart-container { width: 800px; height: 400px; margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .best { background-color: #d4edda; }
        .worst { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>Docker Benchmark Results</h1>
    
    <div class="chart-container">
        <canvas id="buildTimeChart"></canvas>
    </div>
    
    <div class="chart-container">
        <canvas id="sizeChart"></canvas>
    </div>
    
    <table id="resultsTable">
        <thead>
            <tr>
                <th>Dockerfile</th>
                <th>Build Time (s)</th>
                <th>Rebuild Time (s)</th>
                <th>Size (MB)</th>
                <th>Layers</th>
                <th>Cache Efficiency</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <script>
        // Load results and create charts
        fetch('benchmark_results.json')
            .then(response => response.json())
            .then(data => {
                createCharts(data);
                createTable(data);
            });

        function createCharts(data) {
            // Build time chart
            new Chart(document.getElementById('buildTimeChart'), {
                type: 'bar',
                data: {
                    labels: data.map(d => d.dockerfile),
                    datasets: [{
                        label: 'Build Time (seconds)',
                        data: data.map(d => d.build_time_seconds),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            // Size chart
            new Chart(document.getElementById('sizeChart'), {
                type: 'bar',
                data: {
                    labels: data.map(d => d.dockerfile),
                    datasets: [{
                        label: 'Image Size (MB)',
                        data: data.map(d => d.size_mb),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        function createTable(data) {
            const tbody = document.querySelector('#resultsTable tbody');
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.dockerfile}</td>
                    <td>${row.build_time_seconds.toFixed(2)}</td>
                    <td>${row.rebuild_time_seconds.toFixed(2)}</td>
                    <td>${row.size_mb.toFixed(2)}</td>
                    <td>${row.layer_count}</td>
                    <td>${row.cache_efficiency.toFixed(2)}x</td>
                `;
                tbody.appendChild(tr);
            });
        }
    </script>
</body>
</html>
EOF

log_info "Benchmark completed! Results saved to:"
log_info "- benchmark_results.json (raw data)"
log_info "- benchmark_report.html (visual report)"

# Summary
echo -e "\n=== Quick Summary ==="
jq -r '.[] | "\(.dockerfile): \(.build_time_seconds | tostring | .[0:4])s build, \(.size_mb | tostring | .[0:5])MB"' "$RESULTS_FILE"
```

## Esercizi Pratici

### Esercizio 1: Cache Optimization
1. Prendi un Dockerfile esistente
2. Identifica layer che cambiano frequentemente
3. Riorganizza per ottimizzare cache
4. Misura miglioramento performance

### Esercizio 2: Size Reduction
1. Parti da immagine full (ubuntu/centos)
2. Migra ad Alpine
3. Implementa multi-stage
4. Confronta dimensioni finali

### Esercizio 3: Language-Specific Optimization
1. Scegli un linguaggio (Python/Java/Go/Rust)
2. Implementa tutte le ottimizzazioni specifiche
3. Aggiungi monitoring
4. Crea benchmark personalizzato

## Verifica Conoscenze

### Quiz Avanzato
1. Qual è l'ordine ottimale per layer in un Dockerfile?
2. Come funziona il cache mount in BuildKit?
3. Quali sono i vantaggi di immagini distroless?
4. Come ottimizzare per linguaggi compilati vs interpretati?

### Soluzioni
1. Metadata → Sistema → Dipendenze → Configurazione → Codice
2. Persiste cache tra build usando mount type=cache
3. Nessun OS, superficie attacco ridotta, dimensioni minime
4. Compilati: multi-stage con builder. Interpretati: cache deps

## Pulizia

```bash
# Cleanup completo
docker rmi $(docker images | grep "test-" | awk '{print $3}') 2>/dev/null || true
rm -f benchmark_results.json benchmark_report.html

echo "✅ Esempio 2 completato!"
```

## Prossimi Passi
- Completare Esempio 3: Dockerfile Sicuri
- Implementare supply chain security
- Esplorare advanced BuildKit features

---

**Nota**: Le ottimizzazioni in questo esempio possono ridurre i tempi di build del 60-80% e le dimensioni delle immagini del 50-70%, fondamentali per deployment efficienti in produzione.
