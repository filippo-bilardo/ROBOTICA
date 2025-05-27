# Esempio 1: Dockerfile Base

## Obiettivi
- Creare i primi Dockerfile funzionanti
- Comprendere le istruzioni fondamentali
- Sperimentare con diversi tipi di applicazioni
- Imparare il processo di build e debug

## Prerequisiti
- Docker installato e funzionante
- Conoscenza base di terminal/bash
- Editor di testo

## Parte 1: Hello World Container

### 1.1 Dockerfile Minimale

```dockerfile
# File: Dockerfile.hello
FROM alpine:latest

# Comando semplice
CMD ["echo", "Hello Docker!"]
```

```bash
# Build e test
docker build -f Dockerfile.hello -t hello-docker .
docker run hello-docker

# Output: Hello Docker!
```

### 1.2 Dockerfile con Script Personalizzato

```dockerfile
# File: Dockerfile.script
FROM alpine:latest

# Aggiungere bash per script più complessi
RUN apk add --no-cache bash

# Creare script inline
RUN echo '#!/bin/bash' > /hello.sh && \
    echo 'echo "Benvenuto in Docker!"' >> /hello.sh && \
    echo 'echo "Container ID: $(hostname)"' >> /hello.sh && \
    echo 'echo "Data: $(date)"' >> /hello.sh && \
    chmod +x /hello.sh

CMD ["/hello.sh"]
```

```bash
# Build e test
docker build -f Dockerfile.script -t hello-script .
docker run hello-script
```

## Parte 2: Applicazione Web Semplice

### 2.1 Dockerfile per Server HTTP Python

```dockerfile
# File: Dockerfile.python-web
FROM python:3.11-alpine

# Documentazione
LABEL maintainer="developer@example.com"
LABEL description="Simple Python web server"

# Directory di lavoro
WORKDIR /app

# Creare file HTML semplice
RUN echo '<html><body><h1>Hello from Python Docker!</h1><p>Server running on port 8000</p></body></html>' > index.html

# Esporre porta
EXPOSE 8000

# Comando per avviare server
CMD ["python", "-m", "http.server", "8000"]
```

```bash
# Build e test
docker build -f Dockerfile.python-web -t python-web .
docker run -p 8080:8000 python-web

# Testare su http://localhost:8080
curl http://localhost:8080
```

### 2.2 Dockerfile per Server Node.js

Creare file `package.json`:
```json
{
  "name": "docker-node-app",
  "version": "1.0.0",
  "description": "Simple Node.js app for Docker",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

Creare file `app.js`:
```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>Hello from Node.js Docker!</h1>
    <p>Container hostname: ${require('os').hostname()}</p>
    <p>Node version: ${process.version}</p>
    <p>Time: ${new Date().toISOString()}</p>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App listening at http://0.0.0.0:${port}`);
});
```

```dockerfile
# File: Dockerfile.node-web
FROM node:18-alpine

# Metadati
LABEL maintainer="developer@example.com"
LABEL description="Simple Node.js Express app"

# Directory di lavoro
WORKDIR /app

# Copiare file di configurazione
COPY package.json .

# Installare dipendenze
RUN npm install

# Copiare codice applicazione
COPY app.js .

# Esporre porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando di avvio
CMD ["npm", "start"]
```

```bash
# Build e test
docker build -f Dockerfile.node-web -t node-web .
docker run -p 3000:3000 node-web

# Test
curl http://localhost:3000
curl http://localhost:3000/health
```

## Parte 3: Applicazione con Dati Persistenti

### 3.1 Dockerfile per Database SQLite

```dockerfile
# File: Dockerfile.sqlite
FROM alpine:latest

# Installare SQLite
RUN apk add --no-cache sqlite

# Creare directory per database
RUN mkdir -p /data

# Script di inizializzazione database
RUN echo 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);' > /init.sql && \
    echo 'INSERT INTO users (name, email) VALUES ("Alice", "alice@example.com");' >> /init.sql && \
    echo 'INSERT INTO users (name, email) VALUES ("Bob", "bob@example.com");' >> /init.sql

# Inizializzare database
RUN sqlite3 /data/app.db < /init.sql

# Script per query
RUN echo '#!/bin/sh' > /query.sh && \
    echo 'echo "=== Database Users ==="' >> /query.sh && \
    echo 'sqlite3 /data/app.db "SELECT * FROM users;"' >> /query.sh && \
    echo 'echo "=== New User: $1 ==="' >> /query.sh && \
    echo 'sqlite3 /data/app.db "INSERT INTO users (name, email) VALUES (\"$1\", \"$1@example.com\");"' >> /query.sh && \
    echo 'sqlite3 /data/app.db "SELECT * FROM users WHERE name=\"$1\";"' >> /query.sh && \
    chmod +x /query.sh

# Volume per persistenza
VOLUME ["/data"]

# Comando di default
CMD ["/query.sh", "guest"]
```

```bash
# Build e test
docker build -f Dockerfile.sqlite -t sqlite-app .

# Test base
docker run sqlite-app

# Test con nome personalizzato
docker run sqlite-app /query.sh "Charlie"

# Test con volume persistente
docker run -v $(pwd)/data:/data sqlite-app /query.sh "David"
```

## Parte 4: Gestione Configurazione e Environment

### 4.1 Dockerfile con Variabili d'Ambiente

```dockerfile
# File: Dockerfile.config
FROM alpine:latest

# Installare curl per testing
RUN apk add --no-cache curl

# Variabili d'ambiente con valori default
ENV APP_NAME="ConfigApp"
ENV APP_PORT=8080
ENV APP_ENV="development"
ENV DEBUG="true"

# Script di configurazione
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "=== Application Configuration ==="' >> /start.sh && \
    echo 'echo "App Name: $APP_NAME"' >> /start.sh && \
    echo 'echo "Port: $APP_PORT"' >> /start.sh && \
    echo 'echo "Environment: $APP_ENV"' >> /start.sh && \
    echo 'echo "Debug: $DEBUG"' >> /start.sh && \
    echo 'echo "=== Starting Application ==="' >> /start.sh && \
    echo 'while true; do' >> /start.sh && \
    echo '  echo "$(date): $APP_NAME running on port $APP_PORT"' >> /start.sh && \
    echo '  sleep 10' >> /start.sh && \
    echo 'done' >> /start.sh && \
    chmod +x /start.sh

EXPOSE $APP_PORT

CMD ["/start.sh"]
```

```bash
# Build
docker build -f Dockerfile.config -t config-app .

# Test con configurazione default
docker run config-app

# Test con configurazione personalizzata
docker run -e APP_NAME="MyCustomApp" -e APP_PORT=9000 -e APP_ENV="production" -e DEBUG="false" config-app

# Test con file di configurazione
echo "APP_NAME=FileConfigApp" > app.env
echo "APP_PORT=7000" >> app.env
echo "APP_ENV=testing" >> app.env
echo "DEBUG=true" >> app.env

docker run --env-file app.env config-app
```

### 4.2 Dockerfile con Configurazione Avanzata

```dockerfile
# File: Dockerfile.advanced-config
FROM alpine:latest

# Tool necessari
RUN apk add --no-cache bash jq curl

# Configurazione multi-layer
ENV CONFIG_DIR="/etc/app"
ENV DATA_DIR="/var/app"
ENV LOG_DIR="/var/log/app"

# Creare directory
RUN mkdir -p $CONFIG_DIR $DATA_DIR $LOG_DIR

# Configurazione JSON di default
RUN echo '{"server": {"port": 8080, "host": "0.0.0.0"}, "database": {"type": "sqlite", "path": "/var/app/app.db"}, "logging": {"level": "info", "file": "/var/log/app/app.log"}}' > $CONFIG_DIR/config.json

# Script di gestione configurazione
RUN cat > /config-manager.sh << 'EOF'
#!/bin/bash

CONFIG_FILE="${CONFIG_DIR}/config.json"
LOG_FILE="${LOG_DIR}/app.log"

# Funzione per log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Funzione per leggere configurazione
get_config() {
    jq -r ".$1" "$CONFIG_FILE"
}

# Funzione per aggiornare configurazione
set_config() {
    local key="$1"
    local value="$2"
    local tmp_file=$(mktemp)
    
    jq ".$key = \"$value\"" "$CONFIG_FILE" > "$tmp_file" && mv "$tmp_file" "$CONFIG_FILE"
    log "Configuration updated: $key = $value"
}

# Override da environment variables
if [ ! -z "$SERVER_PORT" ]; then
    set_config "server.port" "$SERVER_PORT"
fi

if [ ! -z "$SERVER_HOST" ]; then
    set_config "server.host" "$SERVER_HOST"
fi

if [ ! -z "$LOG_LEVEL" ]; then
    set_config "logging.level" "$LOG_LEVEL"
fi

# Mostra configurazione corrente
log "=== Current Configuration ==="
cat "$CONFIG_FILE" | tee -a "$LOG_FILE"

# Avvia applicazione mock
PORT=$(get_config "server.port")
HOST=$(get_config "server.host")

log "Starting application on $HOST:$PORT"

while true; do
    log "Application heartbeat - listening on $HOST:$PORT"
    sleep 30
done
EOF

RUN chmod +x /config-manager.sh

# Volume per persistenza
VOLUME ["$DATA_DIR", "$LOG_DIR"]

EXPOSE 8080

CMD ["/config-manager.sh"]
```

```bash
# Build
docker build -f Dockerfile.advanced-config -t advanced-config .

# Test base
docker run advanced-config

# Test con override
docker run -e SERVER_PORT=9000 -e LOG_LEVEL=debug advanced-config

# Test con volumi persistenti
mkdir -p data logs
docker run -v $(pwd)/data:/var/app -v $(pwd)/logs:/var/log/app advanced-config
```

## Parte 5: Script di Automazione

### 5.1 Script di Build e Test

```bash
#!/bin/bash
# File: build-and-test.sh

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funzioni helper
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Array dei Dockerfile da testare
DOCKERFILES=(
    "Dockerfile.hello:hello-docker"
    "Dockerfile.script:hello-script"
    "Dockerfile.python-web:python-web"
    "Dockerfile.node-web:node-web"
    "Dockerfile.sqlite:sqlite-app"
    "Dockerfile.config:config-app"
    "Dockerfile.advanced-config:advanced-config"
)

# Funzione per build e test
build_and_test() {
    local dockerfile="$1"
    local image_name="$2"
    
    log_step "Building $dockerfile -> $image_name"
    
    if docker build -f "$dockerfile" -t "$image_name" .; then
        log_info "Build successful: $image_name"
        
        # Test di base
        log_step "Testing $image_name"
        if docker run --rm "$image_name" --version 2>/dev/null || docker run --rm "$image_name" echo "Test OK" 2>/dev/null; then
            log_info "Test successful: $image_name"
        else
            log_warn "Test might have issues: $image_name"
        fi
    else
        log_error "Build failed: $dockerfile"
        return 1
    fi
}

# Main execution
log_info "Starting Docker build and test automation"

for dockerfile_pair in "${DOCKERFILES[@]}"; do
    IFS=':' read -r dockerfile image_name <<< "$dockerfile_pair"
    
    if [[ -f "$dockerfile" ]]; then
        build_and_test "$dockerfile" "$image_name"
    else
        log_warn "Dockerfile not found: $dockerfile"
    fi
    
    echo
done

# Mostra immagini create
log_step "Docker images created:"
docker images | grep -E "(hello-|python-|node-|sqlite-|config-)"

log_info "Build and test automation completed"
```

### 5.2 Script di Cleanup

```bash
#!/bin/bash
# File: cleanup.sh

set -e

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Fermare tutti i container in esecuzione
log_info "Stopping running containers..."
docker stop $(docker ps -q) 2>/dev/null || log_warn "No running containers to stop"

# Rimuovere container fermati
log_info "Removing stopped containers..."
docker container prune -f

# Rimuovere immagini del tutorial
log_info "Removing tutorial images..."
docker rmi $(docker images | grep -E "(hello-|python-|node-|sqlite-|config-)" | awk '{print $3}') 2>/dev/null || log_warn "No tutorial images to remove"

# Rimuovere immagini unused
log_info "Removing unused images..."
docker image prune -f

# Rimuovere volumi unused
log_info "Removing unused volumes..."
docker volume prune -f

# Rimuovere network unused
log_info "Removing unused networks..."
docker network prune -f

# Cleanup file locali
log_info "Cleaning up local files..."
rm -f app.env
rm -rf data logs

log_info "Cleanup completed!"

# Mostra stato finale
echo
log_info "Final Docker status:"
echo "Images: $(docker images -q | wc -l)"
echo "Containers: $(docker ps -aq | wc -l)"
echo "Volumes: $(docker volume ls -q | wc -l)"
echo "Networks: $(docker network ls -q | wc -l)"
```

## Esercizi Pratici

### Esercizio 1: Dockerfile Personalizzato
1. Creare un Dockerfile per un'applicazione che:
   - Usa un'immagine base a scelta
   - Installa un tool specifico (es. git, vim, htop)
   - Configura un utente non-root
   - Ha un comando personalizzato

### Esercizio 2: Web Application
1. Creare un server web che serve file statici
2. Aggiungere health check
3. Configurare logging
4. Testare con diversi tipi di contenuto

### Esercizio 3: Environment Configuration
1. Creare un'applicazione che legge configurazione da:
   - Variabili d'ambiente
   - File di configurazione
   - Argumenti da linea di comando
2. Implementare override gerarchico

## Verifica Conoscenze

### Quiz Base
1. Qual è la differenza tra `RUN`, `CMD` e `ENTRYPOINT`?
2. Quando usare `COPY` vs `ADD`?
3. Come si gestiscono le variabili d'ambiente?
4. Cosa fa l'istruzione `WORKDIR`?

### Soluzioni
1. `RUN` esegue durante build, `CMD` comando default, `ENTRYPOINT` sempre eseguito
2. `COPY` per file semplici, `ADD` per archivi o URL
3. Con `ENV` in Dockerfile, `-e` in docker run, `--env-file`
4. Imposta directory corrente per comandi successivi

## Troubleshooting Comune

### Build Failures
```bash
# Debug build step-by-step
docker build --no-cache --progress=plain .

# Build fino a step specifico
docker build --target step-name .

# Analizzare layer
docker history image-name
```

### Permission Issues
```bash
# Verificare user nel container
docker run image-name whoami

# Verificare file permissions
docker run image-name ls -la /path/
```

### Network Issues
```bash
# Test connettività
docker run --rm image-name curl -v http://example.com

# Verificare porte
docker run --rm image-name netstat -tlnp
```

## Pulizia

```bash
# Eseguire script di cleanup
chmod +x cleanup.sh
./cleanup.sh

echo "✅ Esempio 1 completato!"
```

## Prossimi Passi
- Completare Esempio 2: Dockerfile Ottimizzati
- Studiare layer caching
- Implementare best practices di sicurezza

---

**Nota**: Questo esempio introduce i concetti base per creare Dockerfile funzionali. È fondamentale per costruire una solida comprensione prima di passare alle ottimizzazioni avanzate.
