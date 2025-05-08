# Pattern di Comunicazione tra Microservizi

## Introduzione

La comunicazione efficace tra microservizi è fondamentale per il corretto funzionamento di un'architettura distribuita. Esistono diversi pattern di comunicazione, ciascuno con caratteristiche specifiche adatte a diversi scenari. In questo documento esploreremo i principali pattern di comunicazione e come implementarli utilizzando Docker.

## Pattern di Comunicazione Sincrona

### 1. Request/Response

![Request/Response Pattern](https://via.placeholder.com/600x300?text=Request+Response+Pattern)

**Descrizione:**
- Un servizio invia una richiesta a un altro servizio e attende una risposta
- Comunicazione tipicamente basata su HTTP/REST o gRPC
- Il chiamante si blocca in attesa della risposta

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml per servizi REST
version: '3'
services:
  service-a:
    image: service-a
    ports:
      - "8080:8080"
    networks:
      - microservices-network
  
  service-b:
    image: service-b
    ports:
      - "8081:8081"
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Semplice da implementare e comprendere
- Feedback immediato sullo stato della richiesta
- Adatto per operazioni che richiedono risposta immediata

**Svantaggi:**
- Accoppiamento temporale (il chiamante deve attendere)
- Minore resilienza (se il servizio chiamato è inattivo, fallisce anche il chiamante)
- Scalabilità limitata a causa della natura sincrona

### 2. API Gateway

![API Gateway Pattern](https://via.placeholder.com/600x300?text=API+Gateway+Pattern)

**Descrizione:**
- Un servizio centralizzato che funge da punto di ingresso per le richieste client
- Instrada le richieste ai microservizi appropriati
- Può aggregare risposte da più servizi

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con API Gateway
version: '3'
services:
  api-gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
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
- Nasconde la complessità interna ai client
- Centralizza funzionalità trasversali (autenticazione, logging)
- Riduce il numero di chiamate client-server

**Svantaggi:**
- Potenziale single point of failure
- Può diventare un collo di bottiglia
- Aggiunge latenza alle richieste

## Pattern di Comunicazione Asincrona

### 1. Publish/Subscribe (Pub/Sub)

![Publish/Subscribe Pattern](https://via.placeholder.com/600x300?text=Publish+Subscribe+Pattern)

**Descrizione:**
- I servizi pubblicano eventi su un broker di messaggi
- Altri servizi si sottoscrivono agli eventi di interesse
- Comunicazione disaccoppiata e asincrona

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con RabbitMQ
version: '3'
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"  # AMQP port
      - "15672:15672"  # Management UI
    networks:
      - microservices-network
  
  publisher-service:
    image: publisher-service
    depends_on:
      - rabbitmq
    networks:
      - microservices-network
  
  subscriber-service-1:
    image: subscriber-service
    depends_on:
      - rabbitmq
    networks:
      - microservices-network
  
  subscriber-service-2:
    image: subscriber-service
    depends_on:
      - rabbitmq
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Disaccoppiamento completo tra produttori e consumatori
- Maggiore resilienza (i servizi possono funzionare indipendentemente)
- Migliore scalabilità grazie alla natura asincrona

**Svantaggi:**
- Maggiore complessità nell'implementazione
- Difficoltà nel debugging e nel tracciamento
- Gestione della consistenza dei dati più complessa

### 2. Event Sourcing

![Event Sourcing Pattern](https://via.placeholder.com/600x300?text=Event+Sourcing+Pattern)

**Descrizione:**
- Lo stato dell'applicazione è determinato da una sequenza di eventi
- Gli eventi vengono memorizzati in un event store immutabile
- I servizi possono ricostruire lo stato riproducendo gli eventi

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con Event Store
version: '3'
services:
  eventstore:
    image: eventstore/eventstore
    ports:
      - "2113:2113"  # HTTP API
      - "1113:1113"  # TCP API
    networks:
      - microservices-network
  
  service-a:
    image: service-a
    depends_on:
      - eventstore
    networks:
      - microservices-network
  
  service-b:
    image: service-b
    depends_on:
      - eventstore
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Audit trail completo delle modifiche
- Possibilità di ricostruire stati passati
- Facilita l'implementazione di CQRS (Command Query Responsibility Segregation)

**Svantaggi:**
- Complessità elevata
- Potenziali problemi di prestazioni con molti eventi
- Curva di apprendimento ripida

## Pattern di Comunicazione Ibridi

### 1. Backend for Frontend (BFF)

![Backend for Frontend Pattern](https://via.placeholder.com/600x300?text=Backend+For+Frontend+Pattern)

**Descrizione:**
- API Gateway specializzato per un tipo specifico di client
- Ottimizza le richieste e le risposte per le esigenze del client
- Può combinare chiamate sincrone e asincrone

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con BFF
version: '3'
services:
  mobile-bff:
    image: mobile-bff
    ports:
      - "8080:8080"
    networks:
      - microservices-network
  
  web-bff:
    image: web-bff
    ports:
      - "8081:8081"
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
- Ottimizzazione per specifici client
- Riduzione del traffico di rete
- Migliore esperienza utente

**Svantaggi:**
- Duplicazione di codice tra diversi BFF
- Maggiore complessità nell'architettura
- Più componenti da mantenere

### 2. Saga

![Saga Pattern](https://via.placeholder.com/600x300?text=Saga+Pattern)

**Descrizione:**
- Gestisce transazioni distribuite tra più servizi
- Sequenza di transazioni locali con compensazioni in caso di fallimento
- Può essere implementato con orchestrazione o coreografia

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml per Saga con orchestratore
version: '3'
services:
  saga-orchestrator:
    image: saga-orchestrator
    networks:
      - microservices-network
  
  order-service:
    image: order-service
    networks:
      - microservices-network
  
  payment-service:
    image: payment-service
    networks:
      - microservices-network
  
  inventory-service:
    image: inventory-service
    networks:
      - microservices-network
  
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - microservices-network

networks:
  microservices-network:
```

**Vantaggi:**
- Mantiene la consistenza dei dati in sistemi distribuiti
- Gestisce il rollback in caso di errori
- Adatto per transazioni che coinvolgono più servizi

**Svantaggi:**
- Complessità elevata nell'implementazione
- Difficoltà nel debugging
- Overhead di prestazioni

## Considerazioni sulla Scelta del Pattern

La scelta del pattern di comunicazione dipende da diversi fattori:

1. **Requisiti di accoppiamento**
   - Quanto è importante il disaccoppiamento tra i servizi?
   - È accettabile una dipendenza temporale?

2. **Requisiti di latenza**
   - L'operazione richiede una risposta immediata?
   - È accettabile una risposta ritardata?

3. **Requisiti di resilienza**
   - Quanto è critica la disponibilità del sistema?
   - Come deve comportarsi il sistema in caso di guasti?

4. **Complessità accettabile**
   - Qual è il livello di complessità che il team può gestire?
   - Ci sono vincoli di tempo per l'implementazione?

5. **Consistenza dei dati**
   - È richiesta una consistenza forte o è accettabile una consistenza eventuale?

## Navigazione

- [Indice del Modulo](../README.md)
- Precedente: [Architetture a Microservizi](./02-ArchitettureMicroservizi.md)
- Prossimo: [Decomposizione dei Servizi](./04-DecomposizioneServizi.md)