#!/bin/bash

echo "🚀 Configurazione Kong API Gateway..."

# Attendi che Kong sia pronto
echo "⏳ Attendo che Kong sia pronto..."
until curl -f http://localhost:8001/status > /dev/null 2>&1; do
    sleep 2
done

echo "✅ Kong è pronto!"

# Configura servizio Users
echo "📝 Configurazione User Service..."
curl -i -X POST http://localhost:8001/services/ \
  --data name=user-service \
  --data url=http://user-service:3000

curl -i -X POST http://localhost:8001/services/user-service/routes \
  --data paths[]=/users \
  --data methods[]=GET \
  --data methods[]=POST \
  --data methods[]=PUT \
  --data methods[]=DELETE

# Configura servizio Products
echo "📝 Configurazione Product Service..."
curl -i -X POST http://localhost:8001/services/ \
  --data name=product-service \
  --data url=http://product-service:3000

curl -i -X POST http://localhost:8001/services/product-service/routes \
  --data paths[]=/products \
  --data methods[]=GET \
  --data methods[]=POST \
  --data methods[]=PUT \
  --data methods[]=DELETE

# Configura servizio Orders
echo "📝 Configurazione Order Service..."
curl -i -X POST http://localhost:8001/services/ \
  --data name=order-service \
  --data url=http://order-service:3000

curl -i -X POST http://localhost:8001/services/order-service/routes \
  --data paths[]=/orders \
  --data methods[]=GET \
  --data methods[]=POST \
  --data methods[]=PUT \
  --data methods[]=DELETE

# Configura Rate Limiting
echo "🛡️ Configurazione Rate Limiting..."
curl -i -X POST http://localhost:8001/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.hour=1000 \
  --data config.policy=local

# Configura CORS
echo "🌐 Configurazione CORS..."
curl -i -X POST http://localhost:8001/plugins \
  --data name=cors \
  --data config.origins=* \
  --data config.methods=GET,POST,PUT,DELETE,OPTIONS \
  --data config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token

# Configura Request Logging
echo "📊 Configurazione Request Logging..."
curl -i -X POST http://localhost:8001/plugins \
  --data name=file-log \
  --data config.path=/tmp/access.log

# Configura Prometheus metrics
echo "📈 Configurazione Prometheus Metrics..."
curl -i -X POST http://localhost:8001/plugins \
  --data name=prometheus

echo "✅ Configurazione Kong completata!"
echo ""
echo "🔗 URL utili:"
echo "   - API Gateway: http://localhost:8000"
echo "   - Admin API: http://localhost:8001"
echo "   - Admin GUI: http://localhost:8002"
echo ""
echo "🧪 Test delle API:"
echo "   curl http://localhost:8000/users"
echo "   curl http://localhost:8000/products"
echo "   curl http://localhost:8000/orders"
