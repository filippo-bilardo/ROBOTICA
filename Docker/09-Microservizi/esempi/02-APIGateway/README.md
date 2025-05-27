# API Gateway per Microservizi

Questo esempio dimostra l'implementazione di un API Gateway utilizzando diverse tecnologie (Kong, Nginx, Traefik) per gestire la comunicazione verso i microservizi.

## 🎯 Obiettivi

- Implementare un API Gateway con Kong
- Configurare routing e load balancing
- Gestire autenticazione e rate limiting
- Monitorare il traffico API
- Confrontare diversi gateway

## 📋 Prerequisiti

- Docker e Docker Compose
- Curl per testing
- Comprensione base di REST API

## 🏗️ Architettura

```
Client → API Gateway → Microservizi
         (Kong)       ├── User Service
                      ├── Product Service
                      └── Order Service
```

## 🚀 Esempi Implementati

### 1. Kong API Gateway
- Gateway enterprise-grade
- Plugin ecosystem ricco
- Database-driven configuration

### 2. Nginx come API Gateway
- Configurazione lightweight
- High performance
- Custom logic con Lua

### 3. Traefik
- Auto-discovery
- Load balancing automatico
- Integrazione Docker nativa

## 📁 Struttura del Progetto

```
02-APIGateway/
├── README.md
├── kong-gateway/
│   ├── docker-compose.yml
│   ├── kong.conf
│   └── setup-kong.sh
├── nginx-gateway/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── api-routes.conf
├── traefik-gateway/
│   ├── docker-compose.yml
│   ├── traefik.yml
│   └── dynamic-config.yml
├── services/
│   ├── user-service/
│   ├── product-service/
│   └── order-service/
└── tests/
    ├── api-tests.sh
    └── load-test.js

```

## 🔧 Setup e Esecuzione

### Kong Gateway

```bash
# Avvia Kong con database PostgreSQL
cd kong-gateway
docker-compose up -d

# Configura i servizi e route
./setup-kong.sh

# Test delle API
curl http://localhost:8000/users
curl http://localhost:8000/products
curl http://localhost:8000/orders
```

### Nginx Gateway

```bash
# Avvia Nginx API Gateway
cd nginx-gateway
docker-compose up -d

# Test routing
curl http://localhost:8080/api/v1/users
curl http://localhost:8080/api/v1/products
```

### Traefik Gateway

```bash
# Avvia Traefik con auto-discovery
cd traefik-gateway
docker-compose up -d

# Accedi al dashboard
open http://localhost:8080

# Test delle API
curl http://localhost/users
curl http://localhost/products
```

## 🧪 Test e Monitoraggio

### Performance Testing

```bash
# Load testing con artillery
cd tests
npm install artillery
artillery run load-test.js
```

### Health Checks

```bash
# Script di test automatico
./tests/api-tests.sh
```

### Monitoring

- Kong Admin API: http://localhost:8001
- Traefik Dashboard: http://localhost:8080
- Nginx status: http://localhost:8080/nginx_status

## 🛡️ Features Avanzate

### Rate Limiting

```yaml
# Kong plugin
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
```

### Authentication

```yaml
# JWT Authentication
plugins:
  - name: jwt
    config:
      secret_is_base64: false
```

### Circuit Breaker

```nginx
# Nginx upstream health check
upstream backend {
    server service1:3000 max_fails=3 fail_timeout=30s;
    server service2:3000 max_fails=3 fail_timeout=30s;
}
```

## 📊 Comparazione Gateway

| Feature | Kong | Nginx | Traefik |
|---------|------|-------|---------|
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Ease of Use | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Plugin Ecosystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Auto-discovery | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Enterprise Features | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎓 Esercizi Pratici

1. **Gateway Routing**: Implementa routing basato su path e header
2. **Load Balancing**: Configura algoritmi di bilanciamento diversi
3. **API Versioning**: Gestisci multiple versioni API
4. **Security**: Implementa authentication e authorization
5. **Monitoring**: Aggiungi metriche e logging centralizzato

## 📚 Risorse Aggiuntive

- [Kong Documentation](https://docs.konghq.com/)
- [Nginx API Gateway Guide](https://www.nginx.com/solutions/api-gateway/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [API Gateway Patterns](https://microservices.io/patterns/apigateway.html)

## 🔗 Link Utili

- Modulo precedente: [01-AppMicroservizi](../01-AppMicroservizi/)
- Modulo successivo: [03-ComunicazioneServizi](../03-ComunicazioneServizi/)
- [Teoria Microservizi](../../teoria/)
