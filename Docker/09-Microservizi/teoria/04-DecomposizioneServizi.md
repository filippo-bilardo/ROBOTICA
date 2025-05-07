# Decomposizione dei Servizi

## Introduzione

La decomposizione dei servizi è uno degli aspetti più critici nella progettazione di un'architettura a microservizi. Decidere come suddividere un'applicazione in servizi più piccoli richiede un'attenta analisi del dominio e delle responsabilità funzionali. In questo documento esploreremo le strategie e i principi per una decomposizione efficace.

## Strategie di Decomposizione

### 1. Decomposizione per Capacità di Business

![Decomposizione per Business Capability](https://via.placeholder.com/600x300?text=Business+Capability+Decomposition)

**Descrizione:**
- I servizi sono organizzati attorno alle capacità di business dell'organizzazione
- Ogni servizio rappresenta una funzionalità di business specifica
- Allineamento con la struttura organizzativa dell'azienda

**Esempio:**
- In un e-commerce: gestione ordini, gestione catalogo, gestione clienti, pagamenti

**Vantaggi:**
- Allineamento con gli obiettivi di business
- Stabilità nel tempo (le capacità di business cambiano più lentamente della tecnologia)
- Facilita la comunicazione tra team tecnici e business

### 2. Decomposizione per Sottodominio (Domain-Driven Design)

![Decomposizione per Sottodominio](https://via.placeholder.com/600x300?text=Subdomain+Decomposition)

**Descrizione:**
- Basata sui principi del Domain-Driven Design (DDD)
- Identifica i bounded contexts all'interno del dominio
- Ogni servizio corrisponde a un bounded context

**Esempio:**
- In un sistema bancario: gestione conti, prestiti, investimenti, compliance

**Vantaggi:**
- Modello di dominio coeso all'interno di ogni servizio
- Riduzione delle dipendenze tra servizi
- Facilita l'evoluzione indipendente dei servizi

### 3. Decomposizione per Caso d'Uso

![Decomposizione per Caso d'Uso](https://via.placeholder.com/600x300?text=Use+Case+Decomposition)

**Descrizione:**
- I servizi sono organizzati attorno a specifici casi d'uso o user journey
- Ogni servizio implementa un flusso completo di interazione utente

**Esempio:**
- In un'app di prenotazione viaggi: ricerca voli, prenotazione hotel, noleggio auto

**Vantaggi:**
- Ottimizzazione per specifici flussi utente
- Riduzione della latenza per operazioni frequenti
- Facilita l'implementazione di nuovi casi d'uso

## Principi di Decomposizione

### 1. Single Responsibility Principle

Ogni servizio dovrebbe avere una sola responsabilità, un solo motivo per cambiare. Questo principio aiuta a mantenere i servizi focalizzati e coesi.

**Esempio pratico:**
- Un servizio di autenticazione gestisce solo l'autenticazione e l'autorizzazione
- Un servizio di notifiche gestisce solo l'invio di notifiche

### 2. Alta Coesione, Basso Accoppiamento

- **Alta coesione**: Le funzionalità all'interno di un servizio sono strettamente correlate
- **Basso accoppiamento**: Le dipendenze tra servizi sono minimizzate

**Tecniche per ridurre l'accoppiamento:**
- Comunicazione asincrona tramite eventi
- API ben definite e stabili
- Evitare dipendenze cicliche tra servizi

### 3. Autonomia dei Servizi

I servizi dovrebbero essere il più possibile autonomi, in grado di funzionare indipendentemente dagli altri servizi.

**Caratteristiche di un servizio autonomo:**
- Database dedicato
- Logica di business autocontenuta
- Capacità di prendere decisioni senza consultare altri servizi

### 4. Dimensione Appropriata

Non esiste una dimensione "giusta" per un microservizio, ma ci sono alcune linee guida:

- Abbastanza piccolo da essere gestito da un team piccolo (2-pizza team)
- Abbastanza grande da fornire un valore di business significativo
- Abbastanza semplice da poter essere riscritto in 2-3 settimane se necessario

## Antipattern nella Decomposizione

### 1. Nanoservizi

**Descrizione:**
- Servizi troppo piccoli con responsabilità minime
- Eccessiva granularità che aumenta la complessità distribuita

**Problemi:**
- Overhead di comunicazione eccessivo
- Difficoltà nella gestione e nel monitoraggio
- Complessità operativa sproporzionata rispetto ai benefici

### 2. Servizi Anemic

**Descrizione:**
- Servizi che contengono principalmente CRUD operations
- Mancanza di logica di business significativa

**Problemi:**
- Non sfruttano i vantaggi dei microservizi
- Creano dipendenze non necessarie
- Aumentano la complessità senza aggiungere valore

### 3. Decomposizione per Layer Tecnologici

**Descrizione:**
- Servizi organizzati per layer tecnologici (UI, business logic, data)
- Ogni servizio rappresenta un layer orizzontale

**Problemi:**
- Forte accoppiamento tra servizi
- Difficoltà nell'evoluzione indipendente
- Deployment complesso e rischioso

## Implementazione con Docker

Docker facilita l'implementazione di servizi decompositi attraverso:

### 1. Containerizzazione Indipendente

```dockerfile
# Esempio di Dockerfile per un microservizio
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Orchestrazione con Docker Compose

```yaml
# Esempio di docker-compose.yml per servizi decompositi
version: '3'
services:
  auth-service:
    build: ./auth-service
    ports:
      - "3001:3000"
    environment:
      - DB_HOST=auth-db
    depends_on:
      - auth-db
    networks:
      - microservices-network
  
  product-service:
    build: ./product-service
    ports:
      - "3002:3000"
    environment:
      - DB_HOST=product-db
    depends_on:
      - product-db
    networks:
      - microservices-network
  
  order-service:
    build: ./order-service
    ports:
      - "3003:3000"
    environment:
      - DB_HOST=order-db
      - PRODUCT_SERVICE_URL=http://product-service:3000
      - AUTH_SERVICE_URL=http://auth-service:3000
    depends_on:
      - order-db
      - product-service
      - auth-service
    networks:
      - microservices-network
  
  auth-db:
    image: mongo:4
    volumes:
      - auth-data:/data/db
    networks:
      - microservices-network
  
  product-db:
    image: mongo:4
    volumes:
      - product-data:/data/db
    networks:
      - microservices-network
  
  order-db:
    image: mongo:4
    volumes:
      - order-data:/data/db
    networks:
      - microservices-network

networks:
  microservices-network:

volumes:
  auth-data:
  product-data:
  order-data:
```

## Processo di Decomposizione

### 1. Analisi del Dominio

- Identificare le capacità di business e i sottodomini
- Creare una mappa del dominio (domain map)
- Identificare i bounded contexts

### 2. Definizione dei Confini dei Servizi

- Identificare le responsabilità di ciascun servizio
- Definire le API e i contratti tra servizi
- Identificare i dati necessari a ciascun servizio

### 3. Evoluzione Incrementale

- Iniziare con una decomposizione grossolana
- Raffinare i confini dei servizi nel tempo
- Essere pronti a rifattorizzare quando necessario

## Navigazione

- [Indice del Modulo](../README.md)
- Precedente: [Pattern di Comunicazione](./03-PatternComunicazione.md)
- Prossimo: [Gestione dei Dati nei Microservizi](./05-GestioneDati.md)