# Applicazione a Microservizi con Docker

## Introduzione

In questo esempio pratico, costruiremo un'applicazione e-commerce completa utilizzando un'architettura a microservizi con Docker. L'applicazione sarà composta da diversi servizi indipendenti che comunicano tra loro, ognuno con la propria responsabilità specifica.

## Obiettivi

- Implementare un'architettura a microservizi completa
- Configurare comunicazione tra servizi
- Gestire database distribuiti
- Implementare service discovery
- Configurare load balancing e resilienza
- Monitorare l'intera applicazione

## Architettura dell'Applicazione

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (React)       │────│   (Express)     │────│   (Node.js)     │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ├─────────────────┬─────────────────┐
                              │                 │                 │
                    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                    │  Product Service│ │  Order Service  │ │ Payment Service │
                    │   (Node.js)     │ │   (Python)      │ │   (Go)          │
                    │   Port: 3002    │ │   Port: 3003    │ │   Port: 3004    │
                    └─────────────────┘ └─────────────────┘ └─────────────────┘
                              │                 │                 │
                    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                    │  Products DB    │ │   Orders DB     │ │  Payments DB    │
                    │  (PostgreSQL)   │ │   (MongoDB)     │ │   (PostgreSQL)  │
                    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Struttura del Progetto

```
ecommerce-microservices/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── services/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── src/
│   └── payment-service/
│       ├── Dockerfile
│       ├── go.mod
│       └── src/
├── infrastructure/
│   ├── nginx/
│   ├── monitoring/
│   └── logging/
└── scripts/
    ├── build.sh
    ├── deploy.sh
    └── health-check.sh
```

## 1. Auth Service (Node.js)

### Dockerfile

```dockerfile
# services/auth-service/Dockerfile
FROM node:18-alpine

RUN addgroup -g 1001 -S authgroup && \
    adduser -S authuser -u 1001 -G authgroup

WORKDIR /app
RUN chown authuser:authgroup /app

COPY --chown=authuser:authgroup package*.json ./
USER authuser
RUN npm ci --only=production

COPY --chown=authuser:authgroup src/ ./src/

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node src/health.js

CMD ["node", "src/app.js"]
```

### Applicazione

```javascript
// services/auth-service/src/app.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100
});
app.use(limiter);

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'auth-db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'auth',
    user: process.env.DB_USER || 'auth',
    password: process.env.DB_PASSWORD || 'password'
});

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, hashedPassword, name]
        );
        
        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Find user
        const result = await pool.query(
            'SELECT id, email, name, password FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token endpoint
app.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        res.json({ valid: true, user: decoded });
        
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', service: 'auth-service' });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Auth service listening on port ${port}`);
});
```

## 2. Product Service (Node.js)

```javascript
// services/product-service/src/app.js
const express = require('express');
const { Pool } = require('pg');
const Redis = require('redis');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'products-db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'products',
    user: process.env.DB_USER || 'products',
    password: process.env.DB_PASSWORD || 'password'
});

// Redis for caching
const redis = Redis.createClient({
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
});

redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

// Middleware per autenticazione
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verifica token con auth service
        const response = await fetch(`http://auth-service:3001/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const userData = await response.json();
        req.user = userData.user;
        next();
        
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Get all products
app.get('/products', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        // Check cache first
        const cacheKey = `products:${category || 'all'}:${search || ''}:${page}:${limit}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            query += ` AND category = $${paramIndex++}`;
            params.push(category);
        }
        
        if (search) {
            query += ` AND (name ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;
        
        if (category) {
            countQuery += ` AND category = $${countParamIndex++}`;
            countParams.push(category);
        }
        
        if (search) {
            countQuery += ` AND (name ILIKE $${countParamIndex++} OR description ILIKE $${countParamIndex++})`;
            countParams.push(`%${search}%`, `%${search}%`);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);
        
        const response = {
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
        
        // Cache for 5 minutes
        await redis.setEx(cacheKey, 300, JSON.stringify(response));
        
        res.json(response);
        
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check cache
        const cacheKey = `product:${id}`;
        const cached = await redis.get(cacheKey);
        
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = result.rows[0];
        
        // Cache for 10 minutes
        await redis.setEx(cacheKey, 600, JSON.stringify(product));
        
        res.json(product);
        
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create product (admin only)
app.post('/products', authenticate, async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await pool.query(
            'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, category, stock || 0]
        );
        
        const product = result.rows[0];
        
        // Invalidate cache
        await redis.del('products:*');
        
        res.status(201).json(product);
        
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        await redis.ping();
        res.json({ status: 'healthy', service: 'product-service' });
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
    }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Product service listening on port ${port}`);
});
```

## 3. Order Service (Python/FastAPI)

```python
# services/order-service/src/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import json
from datetime import datetime

app = FastAPI(title="Order Service")
security = HTTPBearer()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://orders-db:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "orders")

client = AsyncIOMotorClient(MONGO_URL)
database = client[DATABASE_NAME]
orders_collection = database.orders

# Models
class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    shipping_address: str

class Order(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total_amount: float
    shipping_address: str
    status: str
    created_at: datetime
    updated_at: datetime

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://auth-service:3001/verify",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_data = response.json()
            return user_data["user"]
            
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service unavailable"
            )

# Helper functions
def serialize_order(order):
    """Convert MongoDB document to serializable format"""
    order["id"] = str(order["_id"])
    del order["_id"]
    return order

async def get_product_details(product_id: str):
    """Fetch product details from product service"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"http://product-service:3002/products/{product_id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()
            return None
            
        except httpx.RequestError:
            return None

# Routes
@app.post("/orders", response_model=Order)
async def create_order(
    order_request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate products and calculate total
        total_amount = 0
        validated_items = []
        
        for item in order_request.items:
            product = await get_product_details(item.product_id)
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found"
                )
            
            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product {item.product_id}"
                )
            
            item_total = product["price"] * item.quantity
            total_amount += item_total
            
            validated_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": product["price"]
            })
        
        # Create order
        order_data = {
            "user_id": current_user["userId"],
            "items": validated_items,
            "total_amount": total_amount,
            "shipping_address": order_request.shipping_address,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await orders_collection.insert_one(order_data)
        
        # Retrieve created order
        created_order = await orders_collection.find_one({"_id": result.inserted_id})
        
        return serialize_order(created_order)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@app.get("/orders", response_model=List[Order])
async def get_user_orders(
    current_user: dict = Depends(get_current_user)
):
    try:
        cursor = orders_collection.find({"user_id": current_user["userId"]})
        orders = await cursor.to_list(length=100)
        
        return [serialize_order(order) for order in orders]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve orders"
        )

@app.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        order = await orders_collection.find_one({
            "_id": ObjectId(order_id),
            "user_id": current_user["userId"]
        })
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return serialize_order(order)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve order"
        )

@app.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status"
            )
        
        result = await orders_collection.update_one(
            {"_id": ObjectId(order_id), "user_id": current_user["userId"]},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return {"message": "Order status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        await database.command("ping")
        return {"status": "healthy", "service": "order-service"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3003)
```

## 4. Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - AUTH_SERVICE_URL=http://auth-service:3001
      - PRODUCT_SERVICE_URL=http://product-service:3002
      - ORDER_SERVICE_URL=http://order-service:3003
      - PAYMENT_SERVICE_URL=http://payment-service:3004
    depends_on:
      - auth-service
      - product-service
      - order-service
      - payment-service
    networks:
      - microservices-network

  # Auth Service
  auth-service:
    build: ./services/auth-service
    environment:
      - NODE_ENV=development
      - DB_HOST=auth-db
      - DB_NAME=auth
      - DB_USER=auth
      - DB_PASSWORD=password
      - JWT_SECRET=your-jwt-secret-key
    depends_on:
      - auth-db
    networks:
      - microservices-network
      - auth-network

  auth-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=auth
      - POSTGRES_USER=auth
      - POSTGRES_PASSWORD=password
    volumes:
      - auth_db_data:/var/lib/postgresql/data
      - ./services/auth-service/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - auth-network

  # Product Service
  product-service:
    build: ./services/product-service
    environment:
      - NODE_ENV=development
      - DB_HOST=products-db
      - DB_NAME=products
      - DB_USER=products
      - DB_PASSWORD=password
      - REDIS_HOST=redis
    depends_on:
      - products-db
      - redis
    networks:
      - microservices-network
      - products-network

  products-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=products
      - POSTGRES_USER=products
      - POSTGRES_PASSWORD=password
    volumes:
      - products_db_data:/var/lib/postgresql/data
      - ./services/product-service/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - products-network

  # Order Service
  order-service:
    build: ./services/order-service
    environment:
      - MONGO_URL=mongodb://orders-db:27017
      - DATABASE_NAME=orders
    depends_on:
      - orders-db
    networks:
      - microservices-network
      - orders-network

  orders-db:
    image: mongo:6
    volumes:
      - orders_db_data:/data/db
    networks:
      - orders-network

  # Payment Service
  payment-service:
    build: ./services/payment-service
    environment:
      - DB_HOST=payments-db
      - DB_NAME=payments
      - DB_USER=payments
      - DB_PASSWORD=password
      - STRIPE_SECRET_KEY=sk_test_your_stripe_key
    depends_on:
      - payments-db
    networks:
      - microservices-network
      - payments-network

  payments-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=payments
      - POSTGRES_USER=payments
      - POSTGRES_PASSWORD=password
    volumes:
      - payments_db_data:/var/lib/postgresql/data
    networks:
      - payments-network

  # Redis for caching
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - microservices-network

  # Frontend
  frontend:
    build: ./services/frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080
    depends_on:
      - api-gateway
    networks:
      - microservices-network

networks:
  microservices-network:
    driver: bridge
  auth-network:
    driver: bridge
  products-network:
    driver: bridge
  orders-network:
    driver: bridge
  payments-network:
    driver: bridge

volumes:
  auth_db_data:
  products_db_data:
  orders_db_data:
  payments_db_data:
  redis_data:
```

## 5. API Gateway

```javascript
// services/api-gateway/src/app.js
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 1000 // richieste per IP
});
app.use(limiter);

// Service URLs
const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    products: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    orders: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
    payments: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004'
};

// Circuit breaker simple implementation
const circuitBreakers = new Map();

function createCircuitBreaker(serviceName, threshold = 5, timeout = 30000) {
    return {
        failures: 0,
        lastFailTime: null,
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        threshold,
        timeout
    };
}

// Initialize circuit breakers
Object.keys(services).forEach(service => {
    circuitBreakers.set(service, createCircuitBreaker(service));
});

// Proxy middleware with circuit breaker
const createProxyMiddleware = (service, target) => {
    return (req, res, next) => {
        const breaker = circuitBreakers.get(service);
        
        // Check circuit breaker state
        if (breaker.state === 'OPEN') {
            const now = Date.now();
            if (now - breaker.lastFailTime < breaker.timeout) {
                return res.status(503).json({
                    error: `Service ${service} is currently unavailable`
                });
            } else {
                breaker.state = 'HALF_OPEN';
            }
        }
        
        const proxy = httpProxy.createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^/${service}`]: '',
            },
            onError: (err, req, res) => {
                console.error(`Proxy error for ${service}:`, err.message);
                
                // Update circuit breaker
                breaker.failures++;
                breaker.lastFailTime = Date.now();
                
                if (breaker.failures >= breaker.threshold) {
                    breaker.state = 'OPEN';
                    console.log(`Circuit breaker opened for ${service}`);
                }
                
                res.status(503).json({
                    error: `Service ${service} is unavailable`,
                    message: err.message
                });
            },
            onProxyRes: (proxyRes, req, res) => {
                const breaker = circuitBreakers.get(service);
                
                // Reset circuit breaker on successful response
                if (proxyRes.statusCode < 500) {
                    breaker.failures = 0;
                    breaker.state = 'CLOSED';
                }
            }
        });
        
        proxy(req, res, next);
    };
};

// Health check endpoint
app.get('/health', async (req, res) => {
    const healthChecks = {};
    
    for (const [serviceName, serviceUrl] of Object.entries(services)) {
        try {
            const response = await fetch(`${serviceUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            healthChecks[serviceName] = {
                status: response.ok ? 'healthy' : 'unhealthy',
                responseTime: response.headers.get('response-time') || 'N/A'
            };
        } catch (error) {
            healthChecks[serviceName] = {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
    
    const overallStatus = Object.values(healthChecks).every(
        check => check.status === 'healthy'
    ) ? 'healthy' : 'degraded';
    
    res.json({
        status: overallStatus,
        services: healthChecks,
        timestamp: new Date().toISOString()
    });
});

// Service routes
app.use('/auth', createProxyMiddleware('auth', services.auth));
app.use('/products', createProxyMiddleware('products', services.products));
app.use('/orders', createProxyMiddleware('orders', services.orders));
app.use('/payments', createProxyMiddleware('payments', services.payments));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({
        error: 'Internal gateway error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
    console.log('Service mappings:', services);
});
```

## 6. Scripts di Gestione

```bash
#!/bin/bash
# scripts/build.sh

set -e

echo "🏗️  Building microservices..."

# Build all services
services=("auth-service" "product-service" "order-service" "payment-service" "api-gateway" "frontend")

for service in "${services[@]}"; do
    echo "Building $service..."
    docker build -t "ecommerce/$service:latest" "./services/$service"
done

echo "✅ All services built successfully!"
```

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-development}

echo "🚀 Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
./scripts/health-check.sh

echo "✅ Deployment completed!"
```

```bash
#!/bin/bash
# scripts/health-check.sh

echo "🔍 Checking service health..."

API_GATEWAY_URL=${1:-http://localhost:8080}

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_GATEWAY_URL/health")

if [ "$response" = "200" ]; then
    echo "✅ All services are healthy!"
    
    # Detailed health check
    curl -s "$API_GATEWAY_URL/health" | jq .
    
    exit 0
else
    echo "❌ Health check failed (HTTP $response)"
    exit 1
fi
```

## Conclusioni

Questa implementazione fornisce:

1. **Separazione delle responsabilità**: Ogni servizio ha una funzione specifica
2. **Comunicazione asincrona**: API Gateway per routing e load balancing
3. **Resilienza**: Circuit breakers e health checks
4. **Scalabilità**: Servizi indipendenti e database dedicati
5. **Sicurezza**: Autenticazione centralizzata e isolamento dei servizi
6. **Monitoring**: Health checks e logging strutturato

## Prossimi Passi

1. Implementare service discovery (Consul, etcd)
2. Aggiungere monitoring (Prometheus, Grafana)
3. Implementare logging centralizzato (ELK Stack)
4. Configurare CI/CD pipeline
5. Aggiungere testing end-to-end

## Navigazione

- [⬅️ Torna al modulo Microservizi](../README.md)
- [➡️ Prossimo esempio: API Gateway](../02-APIGateway/README.md)
