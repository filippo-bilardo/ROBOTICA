# Resilienza e Tolleranza ai Guasti

## Introduzione

In un'architettura a microservizi, i guasti sono inevitabili. Con decine o centinaia di servizi in esecuzione, è statisticamente certo che alcuni di essi falliranno in qualsiasi momento. La resilienza, ovvero la capacità di un sistema di continuare a funzionare nonostante i guasti, diventa quindi una caratteristica fondamentale. In questo documento esploreremo le strategie e i pattern per costruire microservizi resilienti e tolleranti ai guasti.

## Principi di Resilienza

### 1. Progettare per il Fallimento

Il primo principio della resilienza è accettare che i guasti accadranno e progettare il sistema di conseguenza.

**Strategie chiave:**
- Assumere che qualsiasi chiamata remota possa fallire
- Progettare ogni componente per degradarsi in modo elegante
- Testare regolarmente la resilienza del sistema (Chaos Engineering)

### 2. Isolamento dei Guasti

I guasti in un servizio non dovrebbero propagarsi ad altri servizi o compromettere l'intero sistema.

**Tecniche di isolamento:**
- Bulkhead Pattern (compartimentazione)
- Circuit Breaker Pattern
- Timeout e retry con backoff esponenziale

### 3. Ridondanza

La ridondanza prevede la duplicazione di componenti critici per eliminare single point of failure.

**Tipi di ridondanza:**
- Ridondanza attiva-passiva
- Ridondanza attiva-attiva
- Ridondanza N+1

## Pattern di Resilienza

### 1. Circuit Breaker

![Circuit Breaker Pattern](https://via.placeholder.com/600x300?text=Circuit+Breaker+Pattern)

**Descrizione:**
- Monitora il numero di chiamate fallite a un servizio
- Quando il tasso di errore supera una soglia, "apre il circuito"
- Le chiamate successive falliscono rapidamente senza tentare la chiamata reale
- Dopo un periodo di timeout, il circuito si "semi-apre" per testare se il servizio è tornato disponibile

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con Circuit Breaker
version: '3'
services:
  api-gateway:
    image: api-gateway
    ports:
      - "8080:8080"
    environment:
      - SERVICE_A_URL=http://service-a:8080
      - SERVICE_B_URL=http://service-b:8080
      - CIRCUIT_BREAKER_THRESHOLD=50
      - CIRCUIT_BREAKER_TIMEOUT=5000
    networks:
      - microservices-network
  
  service-a:
    image: service-a
    networks:
      - microservices-network
  
  service-b:
    image: service-b
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Previene il sovraccarico di servizi già in difficoltà
- Fail-fast per chiamate destinate a fallire
- Consente il recupero graduale dei servizi

### 2. Bulkhead

![Bulkhead Pattern](https://via.placeholder.com/600x300?text=Bulkhead+Pattern)

**Descrizione:**
- Isola le risorse per diversi consumatori o operazioni
- Limita l'impatto di un guasto a un sottoinsieme del sistema
- Ispirato ai compartimenti stagni delle navi

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con Bulkhead
version: '3'
services:
  api-gateway:
    image: api-gateway
    ports:
      - "8080:8080"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    networks:
      - microservices-network
  
  critical-service:
    image: critical-service
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
      replicas: 3
    networks:
      - microservices-network
  
  non-critical-service:
    image: non-critical-service
    deploy:
      resources:
        limits:
          cpus: '0.3'
          memory: 256M
      replicas: 2
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Previene il fallimento a cascata
- Garantisce risorse per funzionalità critiche
- Migliora la stabilità complessiva del sistema

### 3. Retry con Backoff Esponenziale

![Retry Pattern](https://via.placeholder.com/600x300?text=Retry+Pattern)

**Descrizione:**
- Ritenta automaticamente le operazioni fallite
- Aumenta progressivamente il tempo tra i tentativi (backoff esponenziale)
- Aggiunge un elemento casuale (jitter) per evitare picchi di carico

**Implementazione:**
```java
// Esempio di implementazione di retry con backoff esponenziale
public Response executeWithRetry(Request request) {
    int maxRetries = 5;
    int retryCount = 0;
    int baseWaitTimeMs = 100;
    
    while (retryCount < maxRetries) {
        try {
            return executeRequest(request);
        } catch (Exception e) {
            retryCount++;
            if (retryCount >= maxRetries) {
                throw e;
            }
            
            // Calcolo del tempo di attesa con backoff esponenziale e jitter
            long waitTime = baseWaitTimeMs * (long) Math.pow(2, retryCount);
            waitTime = waitTime + (new Random().nextInt((int) (waitTime * 0.2)));
            
            Thread.sleep(waitTime);
        }
    }
    
    throw new RuntimeException("Max retries exceeded");
}
```

**Vantaggi:**
- Gestisce automaticamente guasti temporanei
- Riduce il carico sui servizi durante i periodi di stress
- Migliora la probabilità di successo delle operazioni

### 4. Timeout

**Descrizione:**
- Imposta un limite di tempo massimo per le operazioni
- Previene il blocco indefinito delle risorse
- Spesso combinato con retry

**Implementazione:**
```java
// Esempio di implementazione di timeout
public Response executeWithTimeout(Request request, long timeoutMs) {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    Future<Response> future = executor.submit(() -> executeRequest(request));
    
    try {
        return future.get(timeoutMs, TimeUnit.MILLISECONDS);
    } catch (TimeoutException e) {
        future.cancel(true);
        throw new ServiceTimeoutException("Service call timed out after " + timeoutMs + " ms");
    } finally {
        executor.shutdownNow();
    }
}
```

**Vantaggi:**
- Previene il blocco delle risorse
- Migliora la responsività del sistema
- Consente di gestire proattivamente i guasti

### 5. Fallback

![Fallback Pattern](https://via.placeholder.com/600x300?text=Fallback+Pattern)

**Descrizione:**
- Fornisce un'alternativa quando un'operazione fallisce
- Può restituire dati cached, valori predefiniti o funzionalità ridotte
- Consente al sistema di continuare a funzionare in modo degradato

**Implementazione:**
```java
// Esempio di implementazione di fallback
public ProductInfo getProductInfo(String productId) {
    try {
        return productService.getProductInfo(productId);
    } catch (Exception e) {
        log.warn("Failed to get product info from service, using cached data", e);
        return cacheService.getProductInfo(productId);
    }
}
```

**Vantaggi:**
- Migliora la disponibilità del sistema
- Fornisce un'esperienza utente accettabile anche in caso di guasti
- Riduce l'impatto dei guasti sui clienti

## Implementazione della Resilienza con Docker

Docker e i container offrono diversi strumenti per migliorare la resilienza:

### 1. Health Check

```dockerfile
# Esempio di Dockerfile con health check
FROM node:14-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

```yaml
# Esempio di docker-compose.yml con health check
version: '3'
services:
  api-service:
    build: ./api-service
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 2. Restart Policy

```yaml
# Esempio di docker-compose.yml con restart policy
version: '3'
services:
  critical-service:
    image: critical-service
    restart: always
    deploy:
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s
```

### 3. Replica e Load Balancing

```yaml
# Esempio di docker-compose.yml con replica
version: '3'
services:
  web-service:
    image: web-service
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
```

## Monitoraggio e Osservabilità

La resilienza richiede un monitoraggio efficace per rilevare e rispondere rapidamente ai guasti.

### 1. Logging Distribuito

```yaml
# Esempio di docker-compose.yml con ELK stack
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
  
  logstash:
    image: docker.elastic.co/logstash/logstash:7.10.0
    depends_on:
      - elasticsearch
  
  kibana:
    image: docker.elastic.co/kibana/kibana:7.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
  
  filebeat:
    image: docker.elastic.co/beats/filebeat:7.10.0
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro

volumes:
  elasticsearch-data:
```

### 2. Metriche e Alerting

```yaml
# Esempio di docker-compose.yml con Prometheus e Grafana
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    depends_on:
      - prometheus
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
  
  alertmanager:
    image: prom/alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml

volumes:
  prometheus-data:
  grafana-data:
```

### 3. Distributed Tracing

```yaml
# Esempio di docker-compose.yml con Jaeger
version: '3'
services:
  jaeger:
    image: jaegertracing/all-in-one:1.21
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"
      - "14268:14268"
      - "14250:14250"
    environment:
      - COLLECTOR_ZIPKIN_HTTP_PORT=9411
```

## Best Practices

1. **Testare la resilienza**
   - Implementare Chaos Engineering
   - Simulare guasti in produzione controllata
   - Testare regolarmente i meccanismi di failover

2. **Degradare gradualmente**
   - Progettare funzionalità non critiche che possono essere disabilitate
   - Implementare modalità di funzionamento ridotte
   - Prioritizzare le funzionalità critiche

3. **Automatizzare il ripristino**
   - Implementare self-healing quando possibile
   - Automatizzare le procedure di ripristino
   - Ridurre la necessità di intervento manuale

4. **Monitorare proattivamente**
   - Implementare alerting basato su anomalie
   - Monitorare trend e pattern, non solo valori assoluti
   - Utilizzare metriche che indicano la qualità del servizio percepita dagli utenti

## Navigazione

- [Indice del Modulo](../README.md)
- Precedente: [Gestione dei Dati nei Microservizi](./05-GestioneDati.md)