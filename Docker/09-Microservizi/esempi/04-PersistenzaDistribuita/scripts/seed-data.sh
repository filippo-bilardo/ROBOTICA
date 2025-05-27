#!/bin/bash

# Data Seeding Script for Distributed Persistence Example
# This script populates all databases with sample data for testing

set -e

echo "🌱 Starting data seeding for Distributed Persistence example..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# PostgreSQL sample data
seed_postgresql() {
    print_status "Seeding PostgreSQL with sample data..."
    
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d users_db << 'EOF'
-- Insert sample users
INSERT INTO users.users (id, email, first_name, last_name, password_hash, active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John', 'Doe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj48t1QkJkme', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane', 'Smith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj48t1QkJkme', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'bob.wilson@example.com', 'Bob', 'Wilson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj48t1QkJkme', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'alice.brown@example.com', 'Alice', 'Brown', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj48t1QkJkme', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'charlie.davis@example.com', 'Charlie', 'Davis', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj48t1QkJkme', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert user events
INSERT INTO users.user_events (user_id, event_type, event_data, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user_created', '{"email": "john.doe@example.com", "name": "John Doe"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440001', 'profile_updated', '{"field": "phone", "value": "+1-555-0123"}', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440001', 'login', '{"ip": "192.168.1.100", "user_agent": "Chrome/91.0"}', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'user_created', '{"email": "jane.smith@example.com", "name": "Jane Smith"}', NOW() - INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440002', 'login', '{"ip": "192.168.1.101", "user_agent": "Safari/14.0"}', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440003', 'user_created', '{"email": "bob.wilson@example.com", "name": "Bob Wilson"}', NOW() - INTERVAL '10 days');

-- Insert event store entries
INSERT INTO events.event_store (stream_id, version, event_type, event_data, metadata, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'UserRegistered', 
 '{"userId": "550e8400-e29b-41d4-a716-446655440001", "email": "john.doe@example.com", "firstName": "John", "lastName": "Doe"}', 
 '{"source": "user-service", "correlationId": "reg-001"}', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440001', 2, 'ProfileUpdated', 
 '{"userId": "550e8400-e29b-41d4-a716-446655440001", "field": "phone", "value": "+1-555-0123"}', 
 '{"source": "user-service", "correlationId": "upd-001"}', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440002', 1, 'UserRegistered', 
 '{"userId": "550e8400-e29b-41d4-a716-446655440002", "email": "jane.smith@example.com", "firstName": "Jane", "lastName": "Smith"}', 
 '{"source": "user-service", "correlationId": "reg-002"}', NOW() - INTERVAL '7 days');

-- Insert projections
INSERT INTO projections.user_projections (user_id, projection_data, last_processed_version, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 '{"id": "550e8400-e29b-41d4-a716-446655440001", "email": "john.doe@example.com", "firstName": "John", "lastName": "Doe", "phone": "+1-555-0123", "active": true}', 
 2, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 
 '{"id": "550e8400-e29b-41d4-a716-446655440002", "email": "jane.smith@example.com", "firstName": "Jane", "lastName": "Smith", "active": true}', 
 1, NOW());

\echo 'PostgreSQL seeding completed'
EOF

    print_success "PostgreSQL seeding completed"
}

# MongoDB sample data
seed_mongodb() {
    print_status "Seeding MongoDB with sample data..."
    
    docker exec -i $(docker ps -qf "name=mongodb") mongosh mongodb://admin:password@localhost:27017/orders_db --authenticationDatabase admin << 'EOF'
// Insert sample orders
db.orders.insertMany([
    {
        _id: ObjectId("65a1234567890123456789ab"),
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        status: "delivered",
        items: [
            {
                product_id: "prod_001",
                name: "Wireless Bluetooth Headphones",
                quantity: 1,
                price: NumberDecimal("149.99"),
                category: "Electronics"
            },
            {
                product_id: "prod_002",
                name: "USB-C Cable",
                quantity: 2,
                price: NumberDecimal("19.99"),
                category: "Accessories"
            }
        ],
        total_amount: NumberDecimal("189.97"),
        currency: "USD",
        payment_method: "credit_card",
        payment_status: "completed",
        shipping_address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip_code: "10001",
            country: "USA",
            location: {
                type: "Point",
                coordinates: [-73.935242, 40.730610]
            }
        },
        shipping_method: "standard",
        tracking_number: "TRK123456789",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)  // 5 days ago
    },
    {
        _id: ObjectId("65a1234567890123456789ac"),
        user_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "processing",
        items: [
            {
                product_id: "prod_003",
                name: "Mechanical Keyboard",
                quantity: 1,
                price: NumberDecimal("89.99"),
                category: "Electronics"
            }
        ],
        total_amount: NumberDecimal("89.99"),
        currency: "USD",
        payment_method: "paypal",
        payment_status: "completed",
        shipping_address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zip_code: "90210",
            country: "USA",
            location: {
                type: "Point",
                coordinates: [-118.243685, 34.052234]
            }
        },
        shipping_method: "express",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
    },
    {
        _id: ObjectId("65a1234567890123456789ad"),
        user_id: "550e8400-e29b-41d4-a716-446655440003",
        status: "pending",
        items: [
            {
                product_id: "prod_004",
                name: "Gaming Mouse",
                quantity: 1,
                price: NumberDecimal("59.99"),
                category: "Electronics"
            },
            {
                product_id: "prod_005",
                name: "Mouse Pad",
                quantity: 1,
                price: NumberDecimal("12.99"),
                category: "Accessories"
            }
        ],
        total_amount: NumberDecimal("72.98"),
        currency: "USD",
        payment_method: "credit_card",
        payment_status: "pending",
        shipping_address: {
            street: "789 Pine St",
            city: "Chicago",
            state: "IL",
            zip_code: "60601",
            country: "USA",
            location: {
                type: "Point",
                coordinates: [-87.623177, 41.881832]
            }
        },
        shipping_method: "standard",
        created_at: new Date(),
        updated_at: new Date()
    }
]);

// Insert order events
db.order_events.insertMany([
    {
        order_id: "65a1234567890123456789ab",
        version: 1,
        event_type: "OrderCreated",
        event_data: {
            user_id: "550e8400-e29b-41d4-a716-446655440001",
            total_amount: NumberDecimal("189.97"),
            currency: "USD",
            payment_method: "credit_card"
        },
        metadata: {
            source: "order-service",
            correlation_id: "ord-001"
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
        order_id: "65a1234567890123456789ab",
        version: 2,
        event_type: "PaymentProcessed",
        event_data: {
            payment_id: "pay_123456",
            amount: NumberDecimal("189.97"),
            status: "completed"
        },
        metadata: {
            source: "payment-service",
            correlation_id: "ord-001"
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000)
    },
    {
        order_id: "65a1234567890123456789ab",
        version: 3,
        event_type: "OrderShipped",
        event_data: {
            tracking_number: "TRK123456789",
            carrier: "FedEx",
            estimated_delivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        metadata: {
            source: "shipping-service",
            correlation_id: "ord-001"
        },
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
        order_id: "65a1234567890123456789ab",
        version: 4,
        event_type: "OrderDelivered",
        event_data: {
            delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            signature: "J. Doe"
        },
        metadata: {
            source: "shipping-service",
            correlation_id: "ord-001"
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
]);

// Insert event store entries
db.event_store.insertMany([
    {
        stream_id: "order-65a1234567890123456789ab",
        version: 1,
        event_type: "OrderCreated",
        event_data: {
            orderId: "65a1234567890123456789ab",
            userId: "550e8400-e29b-41d4-a716-446655440001",
            items: [
                { productId: "prod_001", quantity: 1, price: NumberDecimal("149.99") },
                { productId: "prod_002", quantity: 2, price: NumberDecimal("19.99") }
            ],
            totalAmount: NumberDecimal("189.97")
        },
        metadata: {
            source: "order-service",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
]);

// Insert projections
db.order_projections.insertMany([
    {
        order_id: "65a1234567890123456789ab",
        projection_data: {
            orderId: "65a1234567890123456789ab",
            userId: "550e8400-e29b-41d4-a716-446655440001",
            status: "delivered",
            totalAmount: NumberDecimal("189.97"),
            currency: "USD",
            itemCount: 3,
            lastStatusChange: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        last_processed_version: 4,
        updated_at: new Date()
    }
]);

// Insert analytics aggregations
db.analytics_aggregations.insertMany([
    {
        date: new Date(new Date().setHours(0,0,0,0)),
        type: "daily_sales",
        data: {
            total_orders: 15,
            total_revenue: NumberDecimal("2847.85"),
            avg_order_value: NumberDecimal("189.86"),
            unique_customers: 12,
            top_category: "Electronics"
        },
        updated_at: new Date()
    },
    {
        date: new Date(new Date().setHours(0,0,0,0) - 24*60*60*1000),
        type: "daily_sales",
        data: {
            total_orders: 18,
            total_revenue: NumberDecimal("3124.67"),
            avg_order_value: NumberDecimal("173.59"),
            unique_customers: 15,
            top_category: "Electronics"
        },
        updated_at: new Date()
    }
]);

print("MongoDB seeding completed successfully");
EOF

    print_success "MongoDB seeding completed"
}

# Elasticsearch sample data
seed_elasticsearch() {
    print_status "Seeding Elasticsearch with sample data..."
    
    # Wait a moment for Elasticsearch to be ready
    sleep 5
    
    # Insert sample products
    curl -X POST "localhost:9200/products/_doc/prod_001" \
        -H "Content-Type: application/json" \
        -d '{
            "id": "prod_001",
            "name": "Wireless Bluetooth Headphones",
            "description": "Premium noise-cancelling wireless headphones with 30-hour battery life",
            "category": "electronics",
            "subcategory": "audio",
            "brand": "TechSound",
            "sku": "TS-WH-001",
            "price": 149.99,
            "original_price": 199.99,
            "discount_percentage": 25.0,
            "currency": "USD",
            "availability": {
                "in_stock": true,
                "stock_quantity": 50,
                "warehouse_location": "US-WEST"
            },
            "attributes": {
                "color": "black",
                "weight": 250.0,
                "dimensions": {
                    "length": 18.0,
                    "width": 16.0,
                    "height": 8.0,
                    "unit": "cm"
                }
            },
            "ratings": {
                "average": 4.5,
                "count": 127
            },
            "tags": ["wireless", "bluetooth", "noise-cancelling", "premium"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-10T12:00:00Z",
            "status": "active",
            "visibility": "public"
        }' --silent

    curl -X POST "localhost:9200/products/_doc/prod_002" \
        -H "Content-Type: application/json" \
        -d '{
            "id": "prod_002",
            "name": "USB-C Cable Premium",
            "description": "High-speed USB-C to USB-C cable with 100W power delivery",
            "category": "accessories",
            "subcategory": "cables",
            "brand": "TechConnect",
            "sku": "TC-UC-002",
            "price": 19.99,
            "original_price": 24.99,
            "discount_percentage": 20.0,
            "currency": "USD",
            "availability": {
                "in_stock": true,
                "stock_quantity": 200,
                "warehouse_location": "US-EAST"
            },
            "attributes": {
                "color": "black",
                "length": 2.0,
                "material": "braided nylon"
            },
            "ratings": {
                "average": 4.2,
                "count": 85
            },
            "tags": ["usb-c", "cable", "fast-charging", "durable"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-08T12:00:00Z",
            "status": "active",
            "visibility": "public"
        }' --silent

    curl -X POST "localhost:9200/products/_doc/prod_003" \
        -H "Content-Type: application/json" \
        -d '{
            "id": "prod_003",
            "name": "Mechanical Gaming Keyboard",
            "description": "RGB backlit mechanical keyboard with blue switches",
            "category": "electronics",
            "subcategory": "peripherals",
            "brand": "GamePro",
            "sku": "GP-MK-003",
            "price": 89.99,
            "original_price": 89.99,
            "discount_percentage": 0.0,
            "currency": "USD",
            "availability": {
                "in_stock": true,
                "stock_quantity": 75,
                "warehouse_location": "US-CENTRAL"
            },
            "attributes": {
                "color": "black",
                "switch_type": "blue",
                "backlight": "RGB",
                "connectivity": "wired"
            },
            "ratings": {
                "average": 4.7,
                "count": 203
            },
            "tags": ["mechanical", "gaming", "rgb", "keyboard"],
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-12T12:00:00Z",
            "status": "active",
            "visibility": "public"
        }' --silent

    # Insert sample categories
    curl -X POST "localhost:9200/categories/_doc/cat_electronics" \
        -H "Content-Type: application/json" \
        -d '{
            "id": "cat_electronics",
            "name": "Electronics",
            "slug": "electronics",
            "parent_id": null,
            "level": 1,
            "path": "/electronics",
            "description": "Electronic devices and accessories",
            "product_count": 1250,
            "featured": true,
            "sort_order": 1,
            "status": "active"
        }' --silent

    # Insert sample search logs
    curl -X POST "localhost:9200/search_logs/_doc" \
        -H "Content-Type: application/json" \
        -d '{
            "timestamp": "2024-01-15T10:30:00Z",
            "user_id": "550e8400-e29b-41d4-a716-446655440001",
            "session_id": "sess_001",
            "query": "wireless headphones",
            "results_count": 45,
            "response_time_ms": 150,
            "clicked_products": ["prod_001"],
            "ip_address": "192.168.1.100"
        }' --silent

    print_success "Elasticsearch seeding completed"
}

# ClickHouse sample data
seed_clickhouse() {
    print_status "Seeding ClickHouse with sample data..."
    
    docker exec -i $(docker ps -qf "name=clickhouse") clickhouse-client --query "
    -- Insert additional sample data for testing
    
    INSERT INTO analytics_db.user_activity_events (
        user_id, session_id, event_type, event_timestamp, event_data,
        ip_address, country, city, device_type, browser, os
    ) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'page_view', '2024-01-15 10:00:00', '{\"page\": \"/products\"}', 
     '192.168.1.100', 'US', 'New York', 'desktop', 'Chrome', 'Windows'),
    ('550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'product_view', '2024-01-15 10:15:00', '{\"product_id\": \"prod_001\"}', 
     '192.168.1.100', 'US', 'New York', 'desktop', 'Chrome', 'Windows'),
    ('550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'add_to_cart', '2024-01-15 10:30:00', '{\"product_id\": \"prod_001\", \"quantity\": 1}', 
     '192.168.1.100', 'US', 'New York', 'desktop', 'Chrome', 'Windows'),
    ('550e8400-e29b-41d4-a716-446655440002', 'sess_002', 'search', '2024-01-15 11:00:00', '{\"query\": \"mechanical keyboard\"}', 
     '192.168.1.101', 'US', 'Los Angeles', 'mobile', 'Safari', 'iOS'),
    ('550e8400-e29b-41d4-a716-446655440002', 'sess_002', 'product_view', '2024-01-15 11:15:00', '{\"product_id\": \"prod_003\"}', 
     '192.168.1.101', 'US', 'Los Angeles', 'mobile', 'Safari', 'iOS');
    
    INSERT INTO analytics_db.product_view_events (
        product_id, user_id, session_id, category, brand, price, currency, source, device_type, country
    ) VALUES 
    ('prod_001', '550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'Electronics', 'TechSound', 149.99, 'USD', 'organic', 'desktop', 'US'),
    ('prod_003', '550e8400-e29b-41d4-a716-446655440002', 'sess_002', 'Electronics', 'GamePro', 89.99, 'USD', 'search', 'mobile', 'US'),
    ('prod_002', '550e8400-e29b-41d4-a716-446655440003', 'sess_003', 'Accessories', 'TechConnect', 19.99, 'USD', 'social', 'tablet', 'CA');
    
    INSERT INTO analytics_db.search_events (
        user_id, session_id, query, results_count, clicked_position, clicked_product_id, response_time_ms
    ) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'wireless headphones', 45, 1, 'prod_001', 150),
    ('550e8400-e29b-41d4-a716-446655440002', 'sess_002', 'mechanical keyboard', 23, 1, 'prod_003', 180),
    ('550e8400-e29b-41d4-a716-446655440003', 'sess_003', 'usb cable', 67, 3, 'prod_002', 120);
    
    INSERT INTO analytics_db.realtime_metrics (
        metric_name, metric_value, dimensions, tags
    ) VALUES 
    ('active_users', 156, map('region', 'us-east', 'device', 'desktop'), ['real-time']),
    ('page_views_per_minute', 1247, map('page', '/products'), ['real-time']),
    ('conversion_rate', 3.45, map('funnel', 'checkout'), ['business']),
    ('avg_response_time', 245.7, map('service', 'catalog-service'), ['performance']),
    ('error_rate', 0.02, map('service', 'order-service', 'status', '5xx'), ['alerts']);
    "
    
    print_success "ClickHouse seeding completed"
}

# Redis sample data
seed_redis() {
    print_status "Seeding Redis with sample data..."
    
    docker exec -i $(docker ps -qf "name=redis") redis-cli << 'EOF'
-- Cache some user sessions
HSET user:session:550e8400-e29b-41d4-a716-446655440001 user_id "550e8400-e29b-41d4-a716-446655440001" email "john.doe@example.com" first_name "John" last_name "Doe" active "true"
EXPIRE user:session:550e8400-e29b-41d4-a716-446655440001 3600

HSET user:session:550e8400-e29b-41d4-a716-446655440002 user_id "550e8400-e29b-41d4-a716-446655440002" email "jane.smith@example.com" first_name "Jane" last_name "Smith" active "true"
EXPIRE user:session:550e8400-e29b-41d4-a716-446655440002 3600

-- Cache popular products
ZADD popular:products 4.5 prod_001 4.7 prod_003 4.2 prod_002

-- Cache category counts
HSET category:counts electronics 1250 accessories 350 clothing 800

-- Cache recent searches
LPUSH recent:searches "wireless headphones" "mechanical keyboard" "usb cable" "gaming mouse" "laptop stand"
LTRIM recent:searches 0 99

-- Shopping cart data
HSET cart:550e8400-e29b-41d4-a716-446655440001 prod_001 1 prod_002 2
EXPIRE cart:550e8400-e29b-41d4-a716-446655440001 86400

-- Rate limiting counters
SET ratelimit:api:550e8400-e29b-41d4-a716-446655440001:minute 15
EXPIRE ratelimit:api:550e8400-e29b-41d4-a716-446655440001:minute 60

-- Feature flags
HSET features new_checkout_flow true personalized_recommendations true enhanced_search false

ECHO "Redis seeding completed"
EOF

    print_success "Redis seeding completed"
}

# Main seeding function
seed_all_databases() {
    print_status "Starting data seeding for all databases..."
    
    # Check if services are running first
    if ! docker ps | grep -q postgres; then
        print_error "PostgreSQL container not running. Please start services first."
        exit 1
    fi
    
    # Run seeding in order
    seed_postgresql
    seed_mongodb
    seed_elasticsearch
    seed_clickhouse
    seed_redis
    
    print_success "All databases seeded successfully!"
    print_status "Sample data overview:"
    echo "  📊 PostgreSQL: 5 users, user events, event store entries"
    echo "  📄 MongoDB: 3 orders, order events, projections"
    echo "  🔍 Elasticsearch: Products, categories, search logs"
    echo "  📈 ClickHouse: Analytics events, metrics, aggregations"
    echo "  ⚡ Redis: User sessions, caches, rate limits"
}

# Cleanup function
cleanup_data() {
    print_warning "Cleaning up all sample data..."
    
    # PostgreSQL cleanup
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d users_db << 'EOF'
TRUNCATE users.users CASCADE;
TRUNCATE users.user_events CASCADE;
TRUNCATE events.event_store CASCADE;
TRUNCATE projections.user_projections CASCADE;
\echo 'PostgreSQL cleanup completed'
EOF

    # MongoDB cleanup
    docker exec -i $(docker ps -qf "name=mongodb") mongosh mongodb://admin:password@localhost:27017/orders_db --authenticationDatabase admin << 'EOF'
db.orders.deleteMany({});
db.order_events.deleteMany({});
db.event_store.deleteMany({});
db.order_projections.deleteMany({});
db.analytics_aggregations.deleteMany({});
print("MongoDB cleanup completed");
EOF

    # Elasticsearch cleanup
    curl -X POST "localhost:9200/products/_delete_by_query" \
        -H "Content-Type: application/json" \
        -d '{"query": {"match_all": {}}}' --silent
    
    curl -X POST "localhost:9200/categories/_delete_by_query" \
        -H "Content-Type: application/json" \
        -d '{"query": {"match_all": {}}}' --silent

    # ClickHouse cleanup
    docker exec -i $(docker ps -qf "name=clickhouse") clickhouse-client --query "
    TRUNCATE analytics_db.user_activity_events;
    TRUNCATE analytics_db.order_events;
    TRUNCATE analytics_db.product_view_events;
    TRUNCATE analytics_db.search_events;
    TRUNCATE analytics_db.realtime_metrics;
    "

    # Redis cleanup
    docker exec -i $(docker ps -qf "name=redis") redis-cli FLUSHDB

    print_success "All sample data cleaned up"
}

# Main script logic
case "${1:-seed}" in
    "seed")
        seed_all_databases
        ;;
    "cleanup")
        cleanup_data
        ;;
    "postgresql"|"postgres")
        seed_postgresql
        ;;
    "mongodb"|"mongo")
        seed_mongodb
        ;;
    "elasticsearch"|"es")
        seed_elasticsearch
        ;;
    "clickhouse"|"ch")
        seed_clickhouse
        ;;
    "redis")
        seed_redis
        ;;
    *)
        echo "Usage: $0 {seed|cleanup|postgresql|mongodb|elasticsearch|clickhouse|redis}"
        echo "  seed         - Seed all databases with sample data"
        echo "  cleanup      - Remove all sample data"
        echo "  postgresql   - Seed only PostgreSQL"
        echo "  mongodb      - Seed only MongoDB"
        echo "  elasticsearch- Seed only Elasticsearch"
        echo "  clickhouse   - Seed only ClickHouse"
        echo "  redis        - Seed only Redis"
        exit 1
        ;;
esac
