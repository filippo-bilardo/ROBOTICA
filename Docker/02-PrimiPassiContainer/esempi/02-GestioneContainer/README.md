# Gestione Avanzata dei Container

## Obiettivo
Imparare a gestire il ciclo di vita completo dei container Docker: start, stop, restart, pause, rename e remove.

## Prerequisiti
- Completato: [01-EseguireContainer](../01-EseguireContainer/)
- Docker in esecuzione sul sistema

## Esercizi Pratici

### Esercizio 1: Ciclo di Vita Base

Creiamo e gestiamo container attraverso tutti gli stati:

```bash
# 1. Crea container senza avviarlo
docker create --name lifecycle-demo nginx:alpine
echo "Container creato:"
docker ps -a --filter name=lifecycle-demo

# 2. Avvia il container
docker start lifecycle-demo
echo "Container avviato:"
docker ps --filter name=lifecycle-demo

# 3. Pausa il container
docker pause lifecycle-demo
echo "Container in pausa:"
docker ps --filter name=lifecycle-demo

# 4. Riprendi il container
docker unpause lifecycle-demo
echo "Container ripreso:"
docker ps --filter name=lifecycle-demo

# 5. Ferma il container gradualmente
docker stop lifecycle-demo
echo "Container fermato:"
docker ps -a --filter name=lifecycle-demo

# 6. Riavvia il container
docker restart lifecycle-demo
echo "Container riavviato:"
docker ps --filter name=lifecycle-demo

# 7. Ferma forzatamente
docker kill lifecycle-demo
echo "Container killato:"
docker ps -a --filter name=lifecycle-demo

# 8. Rimuovi il container
docker rm lifecycle-demo
echo "Container rimosso:"
docker ps -a --filter name=lifecycle-demo
```

### Esercizio 2: Gestione Container Multipli

Gestiamo più container contemporaneamente:

```bash
# Crea una serie di container web
for i in {1..3}; do
  docker run -d --name web-$i -p $((8080+i)):80 nginx:alpine
done

echo "=== Container creati ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Testa che tutti siano raggiungibili
for i in {1..3}; do
  echo "Testing web-$i on port $((8080+i)):"
  curl -s http://localhost:$((8080+i)) | grep -o "<title>.*</title>"
done

# Ferma tutti i container web
echo -e "\n=== Fermando tutti i container web ==="
docker stop web-1 web-2 web-3

# Verifica stato
docker ps -a --filter name=web- --format "table {{.Names}}\t{{.Status}}"

# Riavvia solo alcuni
echo -e "\n=== Riavviando web-1 e web-3 ==="
docker start web-1 web-3

# Rimuovi tutti
echo -e "\n=== Pulizia ==="
docker rm -f web-1 web-2 web-3
```

### Esercizio 3: Rename e Update Container

Modifichiamo container esistenti:

```bash
# Crea un container con configurazione iniziale
docker run -d \
  --name original-app \
  --memory=128m \
  --cpus="0.5" \
  nginx:alpine

echo "=== Container originale ==="
docker ps --format "table {{.Names}}\t{{.Status}}" --filter name=original-app
docker stats original-app --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Rinomina il container
docker rename original-app production-web
echo -e "\n=== Container rinominato ==="
docker ps --format "table {{.Names}}\t{{.Status}}" --filter name=production-web

# Aggiorna configurazione runtime
docker update --memory=256m --cpus="1.0" production-web
echo -e "\n=== Container aggiornato ==="
docker stats production-web --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Aggiorna policy di restart
docker update --restart=always production-web
echo -e "\n=== Restart policy aggiornata ==="
docker inspect production-web --format='{{.HostConfig.RestartPolicy.Name}}'

# Pulizia
docker rm -f production-web
```

### Esercizio 4: Gestione con Filtri

Utilizziamo filtri avanzati per gestire gruppi di container:

```bash
# Crea container con diversi label e stati
docker run -d --name app-frontend --label tier=frontend --label env=prod nginx:alpine
docker run -d --name app-backend --label tier=backend --label env=prod alpine sleep 3600
docker run -d --name test-db --label tier=database --label env=test postgres:alpine -c 'shared_preload_libraries=pg_stat_statements'

# Crea alcuni container fermati
docker run --name stopped-1 --label env=dev alpine echo "test"
docker run --name stopped-2 --label env=dev alpine echo "test"

echo "=== Tutti i container ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Label \"tier\"}}\t{{.Label \"env\"}}"

# Filtra per label
echo -e "\n=== Container di produzione ==="
docker ps --filter label=env=prod --format "table {{.Names}}\t{{.Label \"tier\"}}"

echo -e "\n=== Container frontend ==="
docker ps --filter label=tier=frontend --format "table {{.Names}}\t{{.Status}}"

# Ferma container di produzione
echo -e "\n=== Fermando container di produzione ==="
docker stop $(docker ps -q --filter label=env=prod)

# Rimuovi container di dev fermati
echo -e "\n=== Rimuovendo container dev fermati ==="
docker rm $(docker ps -aq --filter label=env=dev --filter status=exited)

# Pulizia
docker rm -f $(docker ps -aq --filter label=tier)
```

### Esercizio 5: Monitoraggio Avanzato

Implementiamo monitoraggio e troubleshooting:

```bash
# Crea un container per test intensivo
docker run -d \
  --name resource-test \
  --memory=200m \
  --cpus="0.5" \
  alpine sh -c "
    # Simula carico CPU
    while true; do
      dd if=/dev/zero of=/dev/null bs=1024 count=1024 2>/dev/null
      sleep 0.1
    done
  "

# Monitora in tempo reale (per 10 secondi)
echo "=== Monitoraggio risorse (10 secondi) ==="
timeout 10 docker stats resource-test --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Informazioni dettagliate
echo -e "\n=== Informazioni dettagliate container ==="
docker inspect resource-test --format='
Container: {{.Name}}
Status: {{.State.Status}}
PID: {{.State.Pid}}
Started: {{.State.StartedAt}}
Memory Limit: {{.HostConfig.Memory}}
CPU Period: {{.HostConfig.CpuPeriod}}
CPU Quota: {{.HostConfig.CpuQuota}}
'

# Processi nel container
echo -e "\n=== Processi nel container ==="
docker top resource-test

# Eventi del container
echo -e "\n=== Eventi recenti ==="
docker events --filter container=resource-test --since="$(date -d '1 minute ago' -Iseconds)" --until="$(date -Iseconds)" &
EVENTS_PID=$!
sleep 2
docker restart resource-test
sleep 3
kill $EVENTS_PID 2>/dev/null

# Pulizia
docker rm -f resource-test
```

### Esercizio 6: Script di Automazione

Creiamo uno script per gestione automatizzata:

```bash
# Crea script di gestione container
cat > container-manager.sh << 'EOF'
#!/bin/bash

# Script di gestione container
SCRIPT_NAME=$(basename $0)

usage() {
    echo "Uso: $SCRIPT_NAME <comando> [opzioni]"
    echo ""
    echo "Comandi disponibili:"
    echo "  status          - Mostra stato di tutti i container"
    echo "  health          - Controlla health status"
    echo "  cleanup         - Rimuove container fermati"
    echo "  stop-all        - Ferma tutti i container"
    echo "  start-all       - Avvia tutti i container fermati"
    echo "  monitor <name>  - Monitora container specifico"
    echo "  backup <name>   - Crea backup del container"
}

show_status() {
    echo "=== STATUS CONTAINER ==="
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}"
    echo ""
    echo "=== UTILIZZO RISORSE ==="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

check_health() {
    echo "=== HEALTH CHECK ==="
    docker ps --format "table {{.Names}}\t{{.Status}}" | while read line; do
        if [[ $line == *"NAME"* ]]; then
            echo "$line"
            continue
        fi
        name=$(echo $line | awk '{print $1}')
        health=$(docker inspect $name --format='{{.State.Health.Status}}' 2>/dev/null)
        echo "$line Health: ${health:-"N/A"}"
    done
}

cleanup_containers() {
    echo "=== PULIZIA CONTAINER ==="
    echo "Container fermati da rimuovere:"
    docker ps -a --filter status=exited --format "table {{.Names}}\t{{.Status}}"
    read -p "Confermi rimozione? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        docker container prune -f
        echo "Pulizia completata."
    fi
}

stop_all() {
    echo "=== FERMANDO TUTTI I CONTAINER ==="
    containers=$(docker ps -q)
    if [ ! -z "$containers" ]; then
        docker stop $containers
        echo "Tutti i container fermati."
    else
        echo "Nessun container in esecuzione."
    fi
}

start_all() {
    echo "=== AVVIANDO CONTAINER FERMATI ==="
    containers=$(docker ps -aq --filter status=exited)
    if [ ! -z "$containers" ]; then
        docker start $containers
        echo "Container avviati."
    else
        echo "Nessun container da avviare."
    fi
}

monitor_container() {
    if [ -z "$2" ]; then
        echo "Errore: specificare nome container"
        exit 1
    fi
    
    echo "=== MONITORAGGIO $2 ==="
    echo "Premi Ctrl+C per uscire"
    docker stats $2
}

backup_container() {
    if [ -z "$2" ]; then
        echo "Errore: specificare nome container"
        exit 1
    fi
    
    backup_name="backup-$2-$(date +%Y%m%d-%H%M%S)"
    echo "=== BACKUP $2 -> $backup_name ==="
    docker commit $2 $backup_name
    echo "Backup creato: $backup_name"
}

case "$1" in
    status)     show_status ;;
    health)     check_health ;;
    cleanup)    cleanup_containers ;;
    stop-all)   stop_all ;;
    start-all)  start_all ;;
    monitor)    monitor_container "$@" ;;
    backup)     backup_container "$@" ;;
    *)          usage ;;
esac
EOF

chmod +x container-manager.sh

# Test dello script
echo "=== TESTING SCRIPT DI GESTIONE ==="

# Crea alcuni container di test
docker run -d --name test-web nginx:alpine
docker run -d --name test-app alpine sleep 3600
docker run --name test-completed alpine echo "completed"

# Testa le funzioni dello script
echo -e "\n--- Status ---"
./container-manager.sh status

echo -e "\n--- Health Check ---"
./container-manager.sh health

echo -e "\n--- Backup ---"
./container-manager.sh backup test-web

echo -e "\n--- Cleanup (automatico) ---"
echo "y" | ./container-manager.sh cleanup

# Pulizia finale
docker rm -f test-web test-app 2>/dev/null
docker rmi backup-test-web-* 2>/dev/null
rm container-manager.sh
```

## Esercizio Avanzato: Sistema di Monitoraggio

Implementiamo un sistema completo di monitoraggio:

```bash
# Sistema di monitoraggio container
cat > monitor-system.sh << 'EOF'
#!/bin/bash

# Configurazione
MONITOR_INTERVAL=5
LOG_FILE="/tmp/container-monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=80

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_container_health() {
    log_message "=== HEALTH CHECK AUTOMATICO ==="
    
    docker ps --format "{{.Names}}" | while read container; do
        # Status check
        status=$(docker inspect $container --format='{{.State.Status}}')
        health=$(docker inspect $container --format='{{.State.Health.Status}}' 2>/dev/null)
        
        # Resource check
        stats=$(docker stats $container --no-stream --format "{{.CPUPerc}},{{.MemPerc}}")
        cpu_perc=$(echo $stats | cut -d',' -f1 | sed 's/%//')
        mem_perc=$(echo $stats | cut -d',' -f2 | sed 's/%//')
        
        # Alerting
        if (( $(echo "$cpu_perc > $ALERT_THRESHOLD_CPU" | bc -l) )); then
            log_message "ALERT: $container CPU usage: ${cpu_perc}%"
        fi
        
        if (( $(echo "$mem_perc > $ALERT_THRESHOLD_MEM" | bc -l) )); then
            log_message "ALERT: $container Memory usage: ${mem_perc}%"
        fi
        
        if [ "$health" = "unhealthy" ]; then
            log_message "ALERT: $container is unhealthy"
        fi
        
        log_message "Container: $container | Status: $status | Health: ${health:-N/A} | CPU: ${cpu_perc}% | Memory: ${mem_perc}%"
    done
}

# Avvia monitoring
log_message "Starting container monitoring system..."
log_message "Check interval: ${MONITOR_INTERVAL}s"
log_message "CPU alert threshold: ${ALERT_THRESHOLD_CPU}%"
log_message "Memory alert threshold: ${ALERT_THRESHOLD_MEM}%"

# Monitoraggio continuo (30 secondi per demo)
end_time=$((SECONDS + 30))
while [ $SECONDS -lt $end_time ]; do
    check_container_health
    sleep $MONITOR_INTERVAL
done

log_message "Monitoring session ended"
EOF

chmod +x monitor-system.sh

# Crea container di test con diversi carichi
echo "=== AVVIO SISTEMA DI MONITORAGGIO ==="
docker run -d --name high-cpu alpine sh -c "while true; do :; done"
docker run -d --name normal-app nginx:alpine
docker run -d --name memory-test alpine sh -c "
    # Alloca memoria gradualmente
    for i in {1..100}; do
        dd if=/dev/zero of=/tmp/file$i bs=1M count=1 2>/dev/null
        sleep 1
    done
"

echo "Container avviati per test monitoraggio"
echo "Avvio monitoraggio automatico..."

# Esegui monitoring
./monitor-system.sh

echo -e "\n=== LOG MONITORAGGIO ==="
cat /tmp/container-monitor.log

# Pulizia
docker rm -f high-cpu normal-app memory-test 2>/dev/null
rm monitor-system.sh /tmp/container-monitor.log 2>/dev/null
```

## Verifica Apprendimento

### Sfida Pratica

**Scenario**: Gestisci un ambiente di sviluppo con 3 servizi:
1. Database PostgreSQL (production)
2. API Backend (staging) 
3. Frontend Web (development)

**Compiti**:
1. Crea i container con label appropriati per ambiente e tier
2. Implementa health check per tutti i servizi
3. Configura restart policy differenti per ambiente
4. Crea uno script che mostri status e health di tutti i servizi
5. Simula un problema e dimostra recovery automatico

<details>
<summary>Soluzione Guidata</summary>

```bash
# 1. Crea i servizi
docker run -d \
  --name postgres-prod \
  --label env=production \
  --label tier=database \
  --restart=always \
  --health-cmd="pg_isready -U postgres" \
  --health-interval=30s \
  -e POSTGRES_PASSWORD=secret \
  postgres:13-alpine

docker run -d \
  --name api-staging \
  --label env=staging \
  --label tier=backend \
  --restart=on-failure:3 \
  --health-cmd="curl -f http://localhost:3000/health || exit 1" \
  --health-interval=30s \
  -p 3000:3000 \
  node:16-alpine sh -c "
    echo 'const express = require(\"express\"); const app = express(); app.get(\"/health\", (req,res) => res.json({status:\"ok\"})); app.listen(3000);' > app.js &&
    npm init -y && npm install express && node app.js
  "

docker run -d \
  --name web-dev \
  --label env=development \
  --label tier=frontend \
  --restart=unless-stopped \
  --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s \
  -p 8080:80 \
  nginx:alpine

# 2. Script di monitoraggio
cat > service-monitor.sh << 'EOF'
#!/bin/bash
echo "=== SERVICE STATUS ==="
docker ps --filter label=env --format "table {{.Names}}\t{{.Status}}\t{{.Label \"env\"}}\t{{.Label \"tier\"}}"
echo -e "\n=== HEALTH STATUS ==="
for container in $(docker ps --filter label=env -q); do
    name=$(docker inspect $container --format='{{.Name}}' | sed 's/\///')
    health=$(docker inspect $container --format='{{.State.Health.Status}}' 2>/dev/null)
    env=$(docker inspect $container --format='{{index .Config.Labels "env"}}')
    tier=$(docker inspect $container --format='{{index .Config.Labels "tier"}}')
    echo "$name | $env | $tier | Health: ${health:-N/A}"
done
EOF

chmod +x service-monitor.sh
./service-monitor.sh

# 3. Simula problema e recovery
echo -e "\n=== SIMULAZIONE PROBLEMA ==="
docker kill api-staging
sleep 5
./service-monitor.sh

echo -e "\n=== DOPO RECOVERY AUTOMATICO ==="
sleep 10
./service-monitor.sh

# Pulizia
docker rm -f postgres-prod api-staging web-dev
rm service-monitor.sh
```
</details>

## Conclusioni

Hai imparato a:
- ✅ Gestire il ciclo di vita completo dei container
- ✅ Utilizzare filtri avanzati per operazioni batch
- ✅ Implementare monitoraggio e alerting automatico
- ✅ Creare script di automazione per la gestione
- ✅ Risolvere problemi comuni di gestione container

**Prossimi passi**: Nel prossimo esempio imparerai come interagire con container running attraverso exec, logs e networking.
