# Gestione dei Dati nei Microservizi

## Introduzione

La gestione dei dati è una delle sfide più complesse nelle architetture a microservizi. A differenza delle applicazioni monolitiche, dove tutti i dati sono gestiti da un unico database centralizzato, nei microservizi ogni servizio gestisce tipicamente i propri dati in modo autonomo. Questo approccio, sebbene offra numerosi vantaggi in termini di scalabilità e indipendenza, introduce sfide significative nella gestione della consistenza, delle transazioni e delle query che coinvolgono più servizi.

## Pattern di Gestione dei Dati

### 1. Database per Servizio

![Database per Servizio](https://via.placeholder.com/600x300?text=Database+Per+Service+Pattern)

**Descrizione:**
- Ogni microservizio ha il proprio database dedicato
- Il database è accessibile solo dal servizio proprietario
- Altri servizi accedono ai dati tramite API

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con database dedicati
version: '3'
services:
  customer-service:
    image: customer-service
    depends_on:
      - customer-db
    environment:
      - DB_HOST=customer-db
    networks:
      - microservices-network
  
  customer-db:
    image: postgres:13
    volumes:
      - customer-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=customer_user
      - POSTGRES_PASSWORD=customer_pass
      - POSTGRES_DB=customer_db
    networks:
      - microservices-network
  
  order-service:
    image: order-service
    depends_on:
      - order-db
    environment:
      - DB_HOST=order-db
    networks:
      - microservices-network
  
  order-db:
    image: postgres:13
    volumes:
      - order-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=order_user
      - POSTGRES_PASSWORD=order_pass
      - POSTGRES_DB=order_db
    networks:
      - microservices-network

networks:
  microservices-network:

volumes:
  customer-data:
  order-data:
```

**Vantaggi:**
- Disaccoppiamento completo tra servizi
- Possibilità di scegliere il database più adatto per ogni servizio
- Scalabilità indipendente

**Svantaggi:**
- Difficoltà nelle query che coinvolgono più servizi
- Sfide nella gestione delle transazioni distribuite
- Potenziale duplicazione dei dati

### 2. Shared Database

![Shared Database](https://via.placeholder.com/600x300?text=Shared+Database+Pattern)

**Descrizione:**
- Più servizi condividono lo stesso database
- Ogni servizio accede solo alle proprie tabelle
- Approccio pragmatico per la migrazione da monoliti

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con database condiviso
version: '3'
services:
  customer-service:
    image: customer-service
    depends_on:
      - shared-db
    environment:
      - DB_HOST=shared-db
      - DB_SCHEMA=customer_schema
    networks:
      - microservices-network
  
  order-service:
    image: order-service
    depends_on:
      - shared-db
    environment:
      - DB_HOST=shared-db
      - DB_SCHEMA=order_schema
    networks:
      - microservices-network
  
  shared-db:
    image: postgres:13
    volumes:
      - shared-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin_pass
      - POSTGRES_DB=shared_db
    networks:
      - microservices-network

networks:
  microservices-network:

volumes:
  shared-data:
```

**Vantaggi:**
- Semplifica le query che coinvolgono più servizi
- Transazioni ACID all'interno del database
- Migrazione più semplice da un monolite

**Svantaggi:**
- Forte accoppiamento tra servizi
- Rischio di violare l'autonomia dei servizi
- Difficoltà nella scalabilità indipendente

### 3. Event Sourcing

![Event Sourcing](https://via.placeholder.com/600x300?text=Event+Sourcing+Pattern)

**Descrizione:**
- Lo stato dell'applicazione è determinato da una sequenza di eventi
- Gli eventi sono memorizzati in un event store immutabile
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
    volumes:
      - eventstore-data:/var/lib/eventstore
    networks:
      - microservices-network
  
  customer-service:
    image: customer-service
    depends_on:
      - eventstore
    environment:
      - EVENTSTORE_HOST=eventstore
    networks:
      - microservices-network
  
  order-service:
    image: order-service
    depends_on:
      - eventstore
    environment:
      - EVENTSTORE_HOST=eventstore
    networks:
      - microservices-network

networks:
  microservices-network:

volumes:
  eventstore-data:
```

**Vantaggi:**
- Audit trail completo delle modifiche
- Possibilità di ricostruire stati passati
- Facilita l'implementazione di CQRS

**Svantaggi:**
- Complessità elevata nell'implementazione
- Curva di apprendimento ripida
- Potenziali problemi di prestazioni con molti eventi

### 4. Command Query Responsibility Segregation (CQRS)

![CQRS Pattern](https://via.placeholder.com/600x300?text=CQRS+Pattern)

**Descrizione:**
- Separazione tra operazioni di scrittura (comandi) e lettura (query)
- Modelli di dati diversi per scrittura e lettura
- Spesso utilizzato insieme a Event Sourcing

**Implementazione con Docker:**
```yaml
# Esempio di docker-compose.yml con CQRS
version: '3'
services:
  command-service:
    image: command-service
    depends_on:
      - command-db
      - message-broker
    networks:
      - microservices-network
  
  command-db:
    image: postgres:13
    volumes:
      - command-data:/var/lib/postgresql/data
    networks:
      - microservices-network
  
  query-service:
    image: query-service
    depends_on:
      - query-db
      - message-broker
    ports:
      - "8080:8080"
    networks:
      - microservices-network
  
  query-db:
    image: mongodb:4
    volumes:
      - query-data:/data/db
    networks:
      - microservices-network
  
  message-broker:
    image: rabbitmq:3-management
    networks:
      - microservices-network

networks:
  microservices-network:

volumes:
  command-data:
  query-data:
```

**Vantaggi:**
- Ottimizzazione separata per operazioni di lettura e scrittura
- Scalabilità indipendente per letture e scritture
- Modelli di dati specializzati per diversi casi d'uso

**Svantaggi:**
- Complessità dell'architettura
- Consistenza eventuale tra modelli di lettura e scrittura
- Overhead di sviluppo e manutenzione

## Sfide nella Gestione dei Dati

### 1. Consistenza dei Dati

Nei sistemi distribuiti, è spesso necessario accettare una consistenza eventuale invece di una consistenza forte.

**Strategie per gestire la consistenza:**
- **Saga Pattern**: Sequenza di transazioni locali con compensazioni
- **Eventual Consistency**: Accettare che i dati saranno consistenti nel tempo
- **Compensating Transactions**: Operazioni che annullano gli effetti di transazioni fallite

### 2. Transazioni Distribuite

Le transazioni ACID tradizionali sono difficili da implementare in un'architettura distribuita.

**Approcci per gestire le transazioni distribuite:**
- **Two-Phase Commit (2PC)**: Protocollo per garantire che tutti i partecipanti completino la transazione
- **Saga Pattern**: Sequenza di transazioni locali con compensazioni
- **Outbox Pattern**: Garantisce la consistenza tra database e messaggi

### 3. Query Distribuite

Le query che coinvolgono dati da più servizi sono complesse da implementare.

**Soluzioni per le query distribuite:**
- **API Composition**: Combinare i dati a livello di API
- **CQRS**: Mantenere viste denormalizzate per query complesse
- **Data Replication**: Replicare i dati necessari in ogni servizio

## Implementazione con Docker

Docker facilita la gestione dei dati nei microservizi attraverso:

### 1. Volumi per la Persistenza

```yaml
# Esempio di volumi Docker per persistenza dei dati
volumes:
  postgres-data:
    driver: local
  mongodb-data:
    driver: local
  redis-data:
    driver: local
```

### 2. Reti per l'Isolamento

```yaml
# Esempio di reti Docker per isolamento dei servizi
networks:
  frontend-network:
  backend-network:
  database-network:
```

### 3. Secrets per Credenziali

```yaml
# Esempio di secrets Docker per credenziali database
secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

## Best Practices

1. **Progettare per il fallimento**
   - Assumere che i servizi e le connessioni possano fallire
   - Implementare meccanismi di retry, circuit breaker e fallback

2. **Minimizzare la duplicazione dei dati**
   - Identificare chiaramente il servizio proprietario di ciascun dato
   - Replicare solo i dati necessari per l'autonomia del servizio

3. **Utilizzare il database più adatto**
   - Scegliere il tipo di database in base alle esigenze del servizio
   - Considerare database SQL, NoSQL, in-memory o specializzati

4. **Implementare la consistenza eventuale dove possibile**
   - Accettare che i dati possano essere temporaneamente inconsistenti
   - Progettare l'interfaccia utente per gestire la consistenza eventuale

5. **Monitorare attentamente**
   - Implementare logging e metriche dettagliate
   - Monitorare la latenza, gli errori e la consistenza dei dati

## Navigazione

- [Indice del Modulo](../README.md)
- Precedente: [Decomposizione dei Servizi](./04-DecomposizioneServizi.md)
- Prossimo: [Resilienza e Tolleranza ai Guasti](./06-ResilienzaTolleranza.md)