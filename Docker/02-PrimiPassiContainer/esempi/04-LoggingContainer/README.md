# Esempio 4: Logging e Monitoraggio Container

## Obiettivi
- Comprendere il sistema di logging di Docker
- Imparare a monitorare le prestazioni dei container
- Configurare logging driver personalizzati
- Implementare strategie di debugging avanzate

## Prerequisiti
- Esempi 1, 2, 3 completati
- Familiarità con comandi Docker di base
- Conoscenza base di log analysis

## Parte 1: Fondamenti del Logging Docker

### 1.1 Visualizzazione Log di Base

```bash
# Avviare un container che genera log
docker run -d --name log-demo nginx:latest

# Visualizzare i log
docker logs log-demo

# Log con timestamp
docker logs -t log-demo

# Seguire i log in tempo reale
docker logs -f log-demo

# Limitare il numero di righe
docker logs --tail 10 log-demo

# Log da un momento specifico
docker logs --since "2024-01-01T10:00:00" log-demo
```

### 1.2 Container che Genera Log Attivi

```bash
# Container che genera log continui
docker run -d --name log-generator \
  alpine:latest \
  sh -c 'while true; do echo "Log entry $(date): Random number $RANDOM"; sleep 2; done'

# Monitorare i log in tempo reale
docker logs -f log-generator

# Fermare il monitoraggio con Ctrl+C
# Pulire
docker stop log-generator
docker rm log-generator
```

## Parte 2: Configurazione Logging Driver

### 2.1 Logging Driver JSON-File (Default)

```bash
# Container con configurazione logging esplicita
docker run -d --name json-logger \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  alpine:latest \
  sh -c 'for i in $(seq 1 100); do echo "Message $i: $(date)"; sleep 1; done'

# Verificare la configurazione
docker inspect json-logger | jq '.[0].HostConfig.LogConfig'

# Trovare i file di log
sudo find /var/lib/docker/containers -name "*-json.log" | head -1

# Pulire
docker stop json-logger
docker rm json-logger
```

### 2.2 Logging Driver Syslog

```bash
# Container con syslog driver
docker run -d --name syslog-demo \
  --log-driver syslog \
  --log-opt syslog-address=udp://localhost:514 \
  --log-opt tag="docker/{{.Name}}" \
  alpine:latest \
  sh -c 'while true; do logger "Container message: $(date)"; sleep 5; done'

# Verificare nei log di sistema (se disponibile)
# sudo tail -f /var/log/syslog | grep docker

# Pulire
docker stop syslog-demo
docker rm syslog-demo
```

## Parte 3: Monitoraggio delle Prestazioni

### 3.1 Statistiche di Base

```bash
# Avviare un container per il monitoraggio
docker run -d --name performance-demo \
  --memory=512m \
  --cpus=1.0 \
  nginx:latest

# Visualizzare statistiche in tempo reale
docker stats performance-demo

# Statistiche senza stream (una volta sola)
docker stats --no-stream performance-demo

# Statistiche formattate
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### 3.2 Monitoraggio Avanzato con Script

```bash
# Creare script di monitoraggio
cat > monitor-container.sh << 'EOF'
#!/bin/bash

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

CONTAINER_NAME=$1
LOG_FILE="monitoring-$(date +%Y%m%d-%H%M%S).log"

if [ -z "$CONTAINER_NAME" ]; then
    echo -e "${RED}Uso: $0 <nome_container>${NC}"
    exit 1
fi

# Verificare che il container esista
if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo -e "${RED}Container $CONTAINER_NAME non trovato o non in esecuzione${NC}"
    exit 1
fi

echo -e "${GREEN}Iniziando monitoraggio di $CONTAINER_NAME${NC}"
echo -e "${BLUE}Log salvato in: $LOG_FILE${NC}"

# Header del log
echo "Timestamp,CPU%,Memory Usage,Memory Limit,Memory%,Network I/O,Block I/O,PIDs" > "$LOG_FILE"

# Funzione per raccogliere metriche
collect_metrics() {
    while true; do
        # Raccogliere statistiche
        STATS=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}},{{.PIDs}}" "$CONTAINER_NAME" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
            
            # Estrarre valori individuali
            CPU=$(echo "$STATS" | cut -d',' -f1)
            MEM_USAGE=$(echo "$STATS" | cut -d',' -f2)
            MEM_PERC=$(echo "$STATS" | cut -d',' -f3)
            NET_IO=$(echo "$STATS" | cut -d',' -f4)
            BLOCK_IO=$(echo "$STATS" | cut -d',' -f5)
            PIDS=$(echo "$STATS" | cut -d',' -f6)
            
            # Calcolare memoria separata
            MEM_USED=$(echo "$MEM_USAGE" | cut -d'/' -f1 | tr -d ' ')
            MEM_LIMIT=$(echo "$MEM_USAGE" | cut -d'/' -f2 | tr -d ' ')
            
            # Salvare nel log
            echo "$TIMESTAMP,$CPU,$MEM_USED,$MEM_LIMIT,$MEM_PERC,$NET_IO,$BLOCK_IO,$PIDS" >> "$LOG_FILE"
            
            # Output a schermo
            echo -e "${YELLOW}$TIMESTAMP${NC} - CPU: ${GREEN}$CPU${NC} | Mem: ${BLUE}$MEM_PERC${NC} ($MEM_USAGE) | PIDs: $PIDS"
            
            # Controllo soglie
            CPU_NUM=$(echo "$CPU" | sed 's/%//')
            MEM_NUM=$(echo "$MEM_PERC" | sed 's/%//')
            
            if (( $(echo "$CPU_NUM > 80" | bc -l) )); then
                echo -e "${RED}⚠️  ALERT: CPU usage alto: $CPU${NC}"
            fi
            
            if (( $(echo "$MEM_NUM > 80" | bc -l) )); then
                echo -e "${RED}⚠️  ALERT: Memory usage alto: $MEM_PERC${NC}"
            fi
        else
            echo -e "${RED}Errore nel raccogliere statistiche per $CONTAINER_NAME${NC}"
            break
        fi
        
        sleep 5
    done
}

# Gestire interruzione
trap 'echo -e "\n${GREEN}Monitoraggio fermato. Log salvato in $LOG_FILE${NC}"; exit 0' INT

# Iniziare monitoraggio
collect_metrics
EOF

chmod +x monitor-container.sh
```

### 3.3 Test del Sistema di Monitoraggio

```bash
# Avviare un container di test
docker run -d --name stress-test \
  --memory=256m \
  --cpus=0.5 \
  alpine:latest \
  sh -c 'while true; do dd if=/dev/zero of=/tmp/test bs=1M count=100 2>/dev/null; rm /tmp/test; sleep 2; done'

# Avviare il monitoraggio in background
./monitor-container.sh stress-test &
MONITOR_PID=$!

# Lasciare girare per 30 secondi
sleep 30

# Fermare il monitoraggio
kill $MONITOR_PID 2>/dev/null || true

# Analizzare il log
echo "Analisi del log di monitoraggio:"
if [ -f monitoring-*.log ]; then
    LOG_FILE=$(ls monitoring-*.log | tail -1)
    echo "Massimo utilizzo CPU: $(tail -n +2 "$LOG_FILE" | cut -d',' -f2 | sed 's/%//' | sort -n | tail -1)%"
    echo "Numero di campioni raccolti: $(($(wc -l < "$LOG_FILE") - 1))"
fi

# Pulire
docker stop stress-test
docker rm stress-test
```

## Parte 4: Debugging Avanzato

### 4.1 Analisi dei Processi nei Container

```bash
# Container per debugging
docker run -d --name debug-demo \
  ubuntu:latest \
  sh -c 'sleep 3600'

# Visualizzare processi nel container
docker exec debug-demo ps aux

# Visualizzare processi dall'host (se disponibile)
docker top debug-demo

# Informazioni dettagliate sul container
docker inspect debug-demo | jq '.[]| {
  Name: .Name,
  State: .State.Status,
  PID: .State.Pid,
  Memory: .HostConfig.Memory,
  CPU: .HostConfig.CpuShares
}'

# Pulire
docker stop debug-demo
docker rm debug-demo
```

### 4.2 Debugging di Rete

```bash
# Container con strumenti di rete
docker run -d --name network-debug \
  --cap-add=NET_ADMIN \
  nicolaka/netshoot:latest \
  sleep 3600

# Test di connettività
docker exec network-debug ping -c 3 google.com

# Visualizzare interfacce di rete
docker exec network-debug ip addr show

# Test DNS
docker exec network-debug nslookup google.com

# Scan porte (esempio)
docker exec network-debug nmap -p 80,443 google.com

# Pulire
docker stop network-debug
docker rm network-debug
```

## Parte 5: Centralized Logging

### 5.1 Setup ELK Stack Semplificato

```bash
# Creare network per ELK
docker network create elk-network

# Elasticsearch
docker run -d --name elasticsearch \
  --network elk-network \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  docker.elastic.co/elasticsearch/elasticsearch:7.15.0

# Attendere che Elasticsearch si avvii
sleep 30

# Verificare Elasticsearch
curl -X GET "localhost:9200/_cluster/health?pretty"

# Kibana
docker run -d --name kibana \
  --network elk-network \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:7.15.0

echo "🔍 Kibana sarà disponibile su http://localhost:5601 (attendere alcuni minuti)"
```

### 5.2 Configurazione Logging verso ELK

```bash
# Container con logging verso ELK
docker run -d --name app-with-elk-logs \
  --network elk-network \
  --log-driver json-file \
  alpine:latest \
  sh -c 'while true; do 
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"info\",\"message\":\"Application running\",\"pid\":$$}";
    echo "{\"timestamp\":\"$(date -Iseconds)\",\"level\":\"debug\",\"message\":\"Debug info: $RANDOM\",\"pid\":$$}";
    sleep 5;
  done'

# Monitorare i log
docker logs -f app-with-elk-logs
```

## Parte 6: Sistema di Alerting

### 6.1 Script di Alerting

```bash
# Creare sistema di alerting
cat > alert-system.sh << 'EOF'
#!/bin/bash

# Configurazione soglie
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=90

# File di configurazione per notifiche
ALERT_LOG="alerts.log"
EMAIL_ENABLED=false
WEBHOOK_URL=""

# Funzione per inviare alert
send_alert() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log locale
    echo "[$timestamp] $level: $message" | tee -a "$ALERT_LOG"
    
    # Notifica email (se configurata)
    if [ "$EMAIL_ENABLED" = true ] && command -v mail >/dev/null; then
        echo "$message" | mail -s "Docker Alert: $level" admin@example.com
    fi
    
    # Webhook (se configurato)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
          -H "Content-Type: application/json" \
          -d "{\"level\":\"$level\",\"message\":\"$message\",\"timestamp\":\"$timestamp\"}" \
          >/dev/null 2>&1
    fi
}

# Funzione per controllare un container
check_container() {
    local container=$1
    
    # Verificare che il container sia in esecuzione
    if ! docker ps -q -f name="$container" | grep -q .; then
        send_alert "CRITICAL" "Container $container non è in esecuzione"
        return 1
    fi
    
    # Raccogliere metriche
    local stats=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemPerc}}" "$container" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        send_alert "ERROR" "Impossibile raccogliere statistiche per $container"
        return 1
    fi
    
    local cpu_perc=$(echo "$stats" | cut -d',' -f1 | sed 's/%//')
    local mem_perc=$(echo "$stats" | cut -d',' -f2 | sed 's/%//')
    
    # Controllo soglie CPU
    if (( $(echo "$cpu_perc > $CPU_THRESHOLD" | bc -l) )); then
        send_alert "WARNING" "Container $container: CPU usage alto ($cpu_perc%)"
    fi
    
    # Controllo soglie Memory
    if (( $(echo "$mem_perc > $MEMORY_THRESHOLD" | bc -l) )); then
        send_alert "WARNING" "Container $container: Memory usage alto ($mem_perc%)"
    fi
    
    # Controllo health status
    local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
    if [ "$health" = "unhealthy" ]; then
        send_alert "CRITICAL" "Container $container non è healthy"
    fi
}

# Controllo tutti i container in esecuzione
check_all_containers() {
    local containers=$(docker ps --format "{{.Names}}")
    
    if [ -z "$containers" ]; then
        send_alert "INFO" "Nessun container in esecuzione"
        return 0
    fi
    
    while IFS= read -r container; do
        check_container "$container"
    done <<< "$containers"
}

# Controllo spazio disco Docker
check_docker_space() {
    local docker_root=$(docker info --format '{{.DockerRootDir}}')
    local usage=$(df "$docker_root" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if (( usage > DISK_THRESHOLD )); then
        send_alert "WARNING" "Spazio disco Docker alto: ${usage}%"
    fi
}

# Esecuzione controlli
echo "Avvio controlli di sistema $(date)"
check_all_containers
check_docker_space
echo "Controlli completati"
EOF

chmod +x alert-system.sh

# Testare il sistema di alerting
./alert-system.sh
```

## Parte 7: Dashboard di Monitoraggio

### 7.1 Script Dashboard

```bash
# Creare dashboard testuale
cat > dashboard.sh << 'EOF'
#!/bin/bash

# Pulire schermo
clear

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funzione per mostrare header
show_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                               ${CYAN}🐳 DOCKER MONITORING DASHBOARD 🐳${NC}                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                    $(date '+%Y-%m-%d %H:%M:%S')                                    ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Funzione per mostrare informazioni Docker
show_docker_info() {
    echo -e "${YELLOW}📊 Docker System Info:${NC}"
    echo -e "   Version: $(docker version --format '{{.Server.Version}}')"
    echo -e "   Containers: $(docker ps -q | wc -l) running / $(docker ps -aq | wc -l) total"
    echo -e "   Images: $(docker images -q | wc -l) total"
    echo -e "   Networks: $(docker network ls -q | wc -l) total"
    echo -e "   Volumes: $(docker volume ls -q | wc -l) total"
    echo
}

# Funzione per mostrare container attivi
show_running_containers() {
    echo -e "${GREEN}🏃 Running Containers:${NC}"
    
    if [ $(docker ps -q | wc -l) -eq 0 ]; then
        echo -e "   ${RED}No containers running${NC}"
    else
        docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | while IFS= read -r line; do
            if [[ $line == *"NAMES"* ]]; then
                echo -e "   ${BLUE}$line${NC}"
            else
                echo -e "   $line"
            fi
        done
    fi
    echo
}

# Funzione per mostrare statistiche
show_stats() {
    echo -e "${PURPLE}📈 Container Statistics:${NC}"
    
    if [ $(docker ps -q | wc -l) -eq 0 ]; then
        echo -e "   ${RED}No containers to monitor${NC}"
    else
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | while IFS= read -r line; do
            if [[ $line == *"NAME"* ]]; then
                echo -e "   ${BLUE}$line${NC}"
            else
                # Colorare in base all'utilizzo
                cpu_usage=$(echo "$line" | awk '{print $2}' | sed 's/%//')
                if (( $(echo "$cpu_usage > 80" | bc -l) 2>/dev/null )); then
                    echo -e "   ${RED}$line${NC}"
                elif (( $(echo "$cpu_usage > 50" | bc -l) 2>/dev/null )); then
                    echo -e "   ${YELLOW}$line${NC}"
                else
                    echo -e "   ${GREEN}$line${NC}"
                fi
            fi
        done
    fi
    echo
}

# Funzione per mostrare spazio disco
show_disk_usage() {
    echo -e "${CYAN}💾 Docker Disk Usage:${NC}"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
    echo
}

# Funzione per mostrare log recenti
show_recent_logs() {
    echo -e "${YELLOW}📝 Recent Container Logs (last 5 minutes):${NC}"
    
    local containers=$(docker ps --format "{{.Names}}")
    if [ -z "$containers" ]; then
        echo -e "   ${RED}No containers running${NC}"
    else
        while IFS= read -r container; do
            echo -e "   ${BLUE}--- $container ---${NC}"
            docker logs --since "5m" --tail 3 "$container" 2>/dev/null | sed 's/^/   /' || echo -e "   ${RED}No logs available${NC}"
        done <<< "$containers"
    fi
    echo
}

# Dashboard principale
show_dashboard() {
    while true; do
        clear
        show_header
        show_docker_info
        show_running_containers
        show_stats
        show_disk_usage
        show_recent_logs
        
        echo -e "${BLUE}Press Ctrl+C to exit, refreshing in 10 seconds...${NC}"
        sleep 10
    done
}

# Gestire interruzione
trap 'echo -e "\n${GREEN}Dashboard closed.${NC}"; exit 0' INT

# Avviare dashboard
show_dashboard
EOF

chmod +x dashboard.sh

# Avviare la dashboard (esempio)
# ./dashboard.sh
```

## Esercizi Pratici

### Esercizio 1: Analisi Log Personalizzata
1. Creare un'applicazione che genera log strutturati
2. Configurare logging driver personalizzato
3. Analizzare i pattern nei log
4. Implementare filtri per errori

### Esercizio 2: Sistema di Monitoraggio
1. Implementare un sistema di monitoraggio personalizzato
2. Configurare soglie di alert personalizzate
3. Creare report di utilizzo risorse
4. Implementare rotazione automatica dei log

### Esercizio 3: Debugging Avanzato
1. Simulare un'applicazione con problemi di performance
2. Utilizzare gli strumenti di debugging per identificare i problemi
3. Implementare soluzioni di monitoraggio proattivo
4. Documentare il processo di troubleshooting

## Verifica Conoscenze

### Quiz di Monitoraggio
1. Quali sono i logging driver disponibili in Docker?
2. Come si limitano le dimensioni dei file di log?
3. Qual è la differenza tra `docker logs` e `docker stats`?
4. Come si configurano gli alert automatici?

### Soluzioni
1. json-file, syslog, journald, gelf, fluentd, awslogs, etc.
2. Con `--log-opt max-size` e `--log-opt max-file`
3. `logs` mostra output, `stats` mostra metriche di performance
4. Script personalizzati, ELK stack, Prometheus/Grafana

## Pulizia e Cleanup

```bash
# Fermare ELK stack se avviato
docker stop elasticsearch kibana app-with-elk-logs 2>/dev/null || true
docker rm elasticsearch kibana app-with-elk-logs 2>/dev/null || true
docker network rm elk-network 2>/dev/null || true

# Rimuovere script
rm -f monitor-container.sh alert-system.sh dashboard.sh

# Rimuovere log files
rm -f monitoring-*.log alerts.log

# Cleanup generale
docker container prune -f
docker image prune -f
docker volume prune -f

echo "✅ Esempio 4 completato e sistema pulito!"
```

## Prossimi Passi
- Passare al Modulo 3: Gestione Immagini
- Esplorare strumenti di monitoraggio avanzati come Prometheus
- Implementare logging centralizzato in produzione

---

**Nota**: Questo esempio copre gli aspetti fondamentali del logging e monitoraggio in Docker. Una comprensione solida di questi concetti è essenziale per la gestione di container in ambiente di produzione.
