#!/bin/bash

# Database Migration Script for Distributed Persistence Example
# This script handles database migrations across all services

set -e

echo "🚀 Starting database migrations for Distributed Persistence example..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if services are running
check_service() {
    local service=$1
    local port=$2
    local host=${3:-localhost}
    
    print_status "Checking if $service is running on $host:$port..."
    
    if nc -z $host $port 2>/dev/null; then
        print_success "$service is running"
        return 0
    else
        print_error "$service is not running on $host:$port"
        return 1
    fi
}

# Wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local host=${3:-localhost}
    local timeout=${4:-60}
    
    print_status "Waiting for $service to be ready..."
    
    local count=0
    while ! nc -z $host $port 2>/dev/null; do
        if [ $count -gt $timeout ]; then
            print_error "Timeout waiting for $service"
            exit 1
        fi
        sleep 2
        count=$((count + 2))
    done
    
    print_success "$service is ready"
}

# PostgreSQL migrations
migrate_postgresql() {
    print_status "Running PostgreSQL migrations..."
    
    wait_for_service "PostgreSQL" 5432
    
    # Apply additional migrations
    docker exec -i $(docker ps -qf "name=postgres") psql -U postgres -d users_db << 'EOF'
-- Additional PostgreSQL migrations for production readiness

-- Create additional indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_partial 
ON users.users (email) WHERE active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_events_user_timestamp 
ON users.user_events (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_store_stream_version 
ON events.event_store (stream_id, version);

-- Create partitions for event_store table (monthly partitions)
CREATE TABLE IF NOT EXISTS events.event_store_y2024m01 
PARTITION OF events.event_store 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS events.event_store_y2024m02 
PARTITION OF events.event_store 
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS events.event_store_y2024m03 
PARTITION OF events.event_store 
FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- Update statistics
ANALYZE users.users;
ANALYZE users.user_events;
ANALYZE events.event_store;

-- Create stored procedures for common operations
CREATE OR REPLACE FUNCTION events.append_events(
    p_stream_id UUID,
    p_events JSONB[]
) RETURNS INTEGER AS $$
DECLARE
    current_version INTEGER;
    new_version INTEGER;
    event_data JSONB;
BEGIN
    -- Get current version
    SELECT COALESCE(MAX(version), 0) INTO current_version
    FROM events.event_store 
    WHERE stream_id = p_stream_id;
    
    new_version := current_version;
    
    -- Insert events
    FOREACH event_data IN ARRAY p_events
    LOOP
        new_version := new_version + 1;
        
        INSERT INTO events.event_store (
            stream_id, version, event_type, event_data, metadata
        ) VALUES (
            p_stream_id,
            new_version,
            event_data->>'type',
            event_data->'data',
            event_data->'metadata'
        );
    END LOOP;
    
    RETURN new_version;
END;
$$ LANGUAGE plpgsql;

-- Function to rebuild projections
CREATE OR REPLACE FUNCTION projections.rebuild_user_projection(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    event_record RECORD;
    projection_data JSONB := '{}';
BEGIN
    -- Clear existing projection
    DELETE FROM projections.user_projections WHERE user_id = p_user_id;
    
    -- Replay events
    FOR event_record IN 
        SELECT event_type, event_data, created_at
        FROM events.event_store 
        WHERE stream_id = p_user_id 
        ORDER BY version
    LOOP
        -- Apply event to projection
        CASE event_record.event_type
            WHEN 'UserCreated' THEN
                projection_data := projection_data || event_record.event_data;
            WHEN 'UserUpdated' THEN
                projection_data := projection_data || event_record.event_data;
            WHEN 'UserActivated' THEN
                projection_data := jsonb_set(projection_data, '{active}', 'true');
            WHEN 'UserDeactivated' THEN
                projection_data := jsonb_set(projection_data, '{active}', 'false');
        END CASE;
    END LOOP;
    
    -- Insert rebuilt projection
    INSERT INTO projections.user_projections (
        user_id, projection_data, last_processed_version, updated_at
    )
    SELECT 
        p_user_id,
        projection_data,
        COALESCE(MAX(version), 0),
        NOW()
    FROM events.event_store 
    WHERE stream_id = p_user_id;
    
END;
$$ LANGUAGE plpgsql;

\echo 'PostgreSQL migrations completed successfully'
EOF

    print_success "PostgreSQL migrations completed"
}

# MongoDB migrations
migrate_mongodb() {
    print_status "Running MongoDB migrations..."
    
    wait_for_service "MongoDB" 27017
    
    # Apply additional MongoDB configurations
    docker exec -i $(docker ps -qf "name=mongodb") mongosh mongodb://admin:password@localhost:27017/orders_db --authenticationDatabase admin << 'EOF'
// Additional MongoDB migrations

// Create additional indexes
db.orders.createIndex(
    { "user_id": 1, "created_at": -1 },
    { 
        name: "idx_orders_user_created",
        background: true 
    }
);

db.order_events.createIndex(
    { "order_id": 1, "version": 1 },
    { 
        name: "idx_order_events_order_version",
        unique: true,
        background: true 
    }
);

db.event_store.createIndex(
    { "stream_id": 1, "version": 1 },
    { 
        name: "idx_event_store_stream_version",
        unique: true,
        background: true 
    }
);

// Create TTL index for temporary collections
db.session_data.createIndex(
    { "expires_at": 1 },
    { 
        name: "idx_session_expires",
        expireAfterSeconds: 0 
    }
);

// Create text indexes for search
db.orders.createIndex(
    { 
        "items.name": "text",
        "shipping_address.city": "text",
        "shipping_address.country": "text"
    },
    {
        name: "idx_orders_text_search"
    }
);

// Create geospatial index
db.orders.createIndex(
    { "shipping_address.location": "2dsphere" },
    { 
        name: "idx_orders_location",
        background: true 
    }
);

// Update validation schemas with additional rules
db.runCommand({
    collMod: "orders",
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "user_id", "status", "items", "total_amount", "created_at"],
            properties: {
                _id: { bsonType: "objectId" },
                user_id: { bsonType: "string" },
                status: { 
                    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]
                },
                items: {
                    bsonType: "array",
                    minItems: 1,
                    items: {
                        bsonType: "object",
                        required: ["product_id", "name", "quantity", "price"],
                        properties: {
                            product_id: { bsonType: "string" },
                            name: { bsonType: "string" },
                            quantity: { bsonType: "int", minimum: 1 },
                            price: { bsonType: "decimal" }
                        }
                    }
                },
                total_amount: { bsonType: "decimal" },
                currency: { 
                    bsonType: "string",
                    enum: ["USD", "EUR", "GBP", "CAD"]
                },
                created_at: { bsonType: "date" },
                updated_at: { bsonType: "date" }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

// Create MongoDB functions for common operations
db.system.js.save({
    _id: "appendOrderEvents",
    value: function(orderId, events) {
        const session = db.getMongo().startSession();
        
        try {
            session.startTransaction();
            
            const eventsCollection = session.getDatabase("orders_db").order_events;
            const currentVersion = eventsCollection.findOne(
                { order_id: orderId },
                { sort: { version: -1 } }
            );
            
            let nextVersion = currentVersion ? currentVersion.version + 1 : 1;
            
            events.forEach(event => {
                eventsCollection.insertOne({
                    order_id: orderId,
                    version: nextVersion++,
                    event_type: event.type,
                    event_data: event.data,
                    metadata: event.metadata || {},
                    created_at: new Date()
                });
            });
            
            session.commitTransaction();
            return nextVersion - 1;
            
        } catch (error) {
            session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
});

db.system.js.save({
    _id: "rebuildOrderProjection",
    value: function(orderId) {
        const events = db.order_events.find(
            { order_id: orderId }
        ).sort({ version: 1 });
        
        let projection = {};
        
        events.forEach(event => {
            switch(event.event_type) {
                case 'OrderCreated':
                    projection = event.event_data;
                    break;
                case 'OrderStatusChanged':
                    projection.status = event.event_data.status;
                    break;
                case 'ItemAdded':
                    if (!projection.items) projection.items = [];
                    projection.items.push(event.event_data.item);
                    break;
                case 'ItemRemoved':
                    projection.items = projection.items.filter(
                        item => item.product_id !== event.event_data.product_id
                    );
                    break;
            }
        });
        
        db.order_projections.replaceOne(
            { order_id: orderId },
            {
                order_id: orderId,
                projection_data: projection,
                last_processed_version: events.count(),
                updated_at: new Date()
            },
            { upsert: true }
        );
    }
});

print("MongoDB migrations completed successfully");
EOF

    print_success "MongoDB migrations completed"
}

# Elasticsearch migrations
migrate_elasticsearch() {
    print_status "Running Elasticsearch migrations..."
    
    wait_for_service "Elasticsearch" 9200
    
    # Apply index templates and mappings
    curl -X PUT "localhost:9200/_index_template/products_template" \
        -H "Content-Type: application/json" \
        -d @infrastructure/databases/elasticsearch/mappings.json \
        --silent --show-error
    
    # Create initial indices
    curl -X PUT "localhost:9200/products" --silent --show-error
    curl -X PUT "localhost:9200/categories" --silent --show-error
    curl -X PUT "localhost:9200/search_logs-000001" \
        -H "Content-Type: application/json" \
        -d '{
            "aliases": {
                "search_logs": {
                    "is_write_index": true
                }
            }
        }' --silent --show-error
    
    print_success "Elasticsearch migrations completed"
}

# ClickHouse migrations
migrate_clickhouse() {
    print_status "Running ClickHouse migrations..."
    
    wait_for_service "ClickHouse" 8123
    
    # Apply additional ClickHouse configurations
    docker exec -i $(docker ps -qf "name=clickhouse") clickhouse-client --query "
    -- Create additional tables for analytics
    
    CREATE TABLE IF NOT EXISTS analytics_db.user_segments (
        user_id String,
        segment LowCardinality(String),
        score Float32,
        updated_at DateTime DEFAULT now()
    ) ENGINE = ReplacingMergeTree(updated_at)
    ORDER BY user_id;
    
    CREATE TABLE IF NOT EXISTS analytics_db.product_recommendations (
        user_id String,
        product_id String,
        score Float32,
        algorithm LowCardinality(String),
        created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(created_at)
    ORDER BY (user_id, score DESC)
    TTL created_at + INTERVAL 30 DAY;
    
    -- Create dictionary for fast lookups
    CREATE DICTIONARY IF NOT EXISTS analytics_db.product_categories_dict (
        product_id String,
        category String,
        subcategory String
    )
    PRIMARY KEY product_id
    SOURCE(CLICKHOUSE(
        HOST 'localhost'
        PORT 9000
        USER 'default'
        PASSWORD ''
        DB 'analytics_db'
        TABLE 'product_view_events'
    ))
    LAYOUT(HASHED())
    LIFETIME(MIN 600 MAX 900);
    
    -- Create materialized views for real-time aggregations
    CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_db.hourly_sales_mv
    TO analytics_db.sales_daily_aggregation AS
    SELECT 
        toDate(event_timestamp) as date,
        count(*) as total_orders,
        sum(total_amount) as total_revenue,
        avg(total_amount) as avg_order_value,
        uniq(user_id) as unique_customers,
        0 as new_customers,  -- This would be calculated differently
        '' as top_category,
        '' as top_product_id,
        0 as conversion_rate,
        0 as bounce_rate
    FROM analytics_db.order_events
    WHERE event_type = 'order_created'
    GROUP BY date;
    "
    
    print_success "ClickHouse migrations completed"
}

# Redis migrations (setup)
migrate_redis() {
    print_status "Setting up Redis..."
    
    wait_for_service "Redis" 6379
    
    # Pre-populate some cache keys
    docker exec -i $(docker ps -qf "name=redis") redis-cli << 'EOF'
-- Set up Redis keyspace notifications
CONFIG SET notify-keyspace-events Ex

-- Create some initial cache keys for testing
HSET config:cache_ttl products 3600
HSET config:cache_ttl categories 7200
HSET config:cache_ttl user_sessions 1800

-- Set up rate limiting keys structure
HSET rate_limits:api_gateway default 1000
HSET rate_limits:user_service default 500
HSET rate_limits:order_service default 300

ECHO "Redis setup completed"
EOF

    print_success "Redis setup completed"
}

# EventStore migrations
migrate_eventstore() {
    print_status "Setting up EventStore..."
    
    wait_for_service "EventStore" 2113
    
    print_success "EventStore setup completed"
}

# Kafka topic creation
setup_kafka() {
    print_status "Setting up Kafka topics..."
    
    wait_for_service "Kafka" 9092
    
    # Create topics
    docker exec -i $(docker ps -qf "name=kafka") kafka-topics.sh \
        --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 \
        --topic user.events --if-not-exists
    
    docker exec -i $(docker ps -qf "name=kafka") kafka-topics.sh \
        --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 \
        --topic order.events --if-not-exists
    
    docker exec -i $(docker ps -qf "name=kafka") kafka-topics.sh \
        --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 3 \
        --topic product.events --if-not-exists
    
    docker exec -i $(docker ps -qf "name=kafka") kafka-topics.sh \
        --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 \
        --topic elasticsearch-dlq --if-not-exists
    
    print_success "Kafka topics created"
}

# Main migration function
run_migrations() {
    print_status "Starting database migrations..."
    
    # Run migrations in order
    migrate_postgresql
    migrate_mongodb
    migrate_elasticsearch
    migrate_clickhouse
    migrate_redis
    migrate_eventstore
    setup_kafka
    
    print_success "All database migrations completed successfully!"
}

# Rollback function (basic)
rollback_migrations() {
    print_warning "Rolling back migrations..."
    
    # This is a basic rollback - in production you'd want more sophisticated rollback mechanisms
    print_warning "Manual rollback required. Check each database for recent changes."
}

# Health check function
health_check() {
    print_status "Running health checks..."
    
    local failures=0
    
    # Check each service
    check_service "PostgreSQL" 5432 || ((failures++))
    check_service "MongoDB" 27017 || ((failures++))
    check_service "Elasticsearch" 9200 || ((failures++))
    check_service "ClickHouse" 8123 || ((failures++))
    check_service "Redis" 6379 || ((failures++))
    check_service "EventStore" 2113 || ((failures++))
    check_service "Kafka" 9092 || ((failures++))
    
    if [ $failures -eq 0 ]; then
        print_success "All services are healthy"
        return 0
    else
        print_error "$failures service(s) failed health check"
        return 1
    fi
}

# Main script logic
case "${1:-migrate}" in
    "migrate")
        run_migrations
        ;;
    "rollback")
        rollback_migrations
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {migrate|rollback|health}"
        echo "  migrate  - Run all database migrations"
        echo "  rollback - Rollback recent migrations"
        echo "  health   - Check service health"
        exit 1
        ;;
esac
