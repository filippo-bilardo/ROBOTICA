-- ClickHouse Analytics Database Initialization
-- Distributed Persistence Example - Analytics Service
-- Optimized for OLAP workloads and real-time analytics

-- Create main analytics database
CREATE DATABASE IF NOT EXISTS analytics_db;

USE analytics_db;

-- User Activity Events Table (Event Sourcing)
CREATE TABLE IF NOT EXISTS user_activity_events (
    event_id UUID DEFAULT generateUUIDv4(),
    user_id String,
    session_id String,
    event_type LowCardinality(String),
    event_timestamp DateTime64(3) DEFAULT now64(),
    event_data String,
    ip_address IPv4,
    user_agent String,
    country LowCardinality(String),
    city String,
    device_type LowCardinality(String),
    browser LowCardinality(String),
    os LowCardinality(String),
    referrer String,
    page_url String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_timestamp)
ORDER BY (event_timestamp, user_id, event_type)
TTL event_timestamp + INTERVAL 2 YEAR
SETTINGS index_granularity = 8192;

-- Order Events Table (CQRS Read Model)
CREATE TABLE IF NOT EXISTS order_events (
    event_id UUID DEFAULT generateUUIDv4(),
    order_id String,
    user_id String,
    event_type LowCardinality(String),
    event_timestamp DateTime64(3) DEFAULT now64(),
    order_status LowCardinality(String),
    total_amount Decimal(10,2),
    currency LowCardinality(String),
    payment_method LowCardinality(String),
    shipping_method LowCardinality(String),
    items_count UInt16,
    discount_amount Decimal(10,2),
    tax_amount Decimal(10,2),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_timestamp)
ORDER BY (event_timestamp, order_id, event_type)
TTL event_timestamp + INTERVAL 5 YEAR
SETTINGS index_granularity = 8192;

-- Product View Events Table
CREATE TABLE IF NOT EXISTS product_view_events (
    event_id UUID DEFAULT generateUUIDv4(),
    product_id String,
    user_id String,
    session_id String,
    view_timestamp DateTime64(3) DEFAULT now64(),
    category String,
    subcategory String,
    brand String,
    price Decimal(10,2),
    currency LowCardinality(String),
    source LowCardinality(String),
    device_type LowCardinality(String),
    country LowCardinality(String),
    duration_seconds UInt32,
    scroll_depth Float32,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(view_timestamp)
ORDER BY (view_timestamp, product_id, user_id)
TTL view_timestamp + INTERVAL 1 YEAR
SETTINGS index_granularity = 8192;

-- Search Events Table
CREATE TABLE IF NOT EXISTS search_events (
    event_id UUID DEFAULT generateUUIDv4(),
    user_id String,
    session_id String,
    search_timestamp DateTime64(3) DEFAULT now64(),
    query String,
    results_count UInt32,
    clicked_position UInt16,
    clicked_product_id String,
    filters String,
    sort_order String,
    response_time_ms UInt32,
    source LowCardinality(String),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(search_timestamp)
ORDER BY (search_timestamp, user_id, query)
TTL search_timestamp + INTERVAL 1 YEAR
SETTINGS index_granularity = 8192;

-- Sales Aggregation Table (Materialized View)
CREATE TABLE IF NOT EXISTS sales_daily_aggregation (
    date Date,
    total_orders UInt64,
    total_revenue Decimal(15,2),
    avg_order_value Decimal(10,2),
    unique_customers UInt64,
    new_customers UInt64,
    top_category String,
    top_product_id String,
    conversion_rate Float32,
    bounce_rate Float32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY date
SETTINGS index_granularity = 8192;

-- Product Performance Table
CREATE TABLE IF NOT EXISTS product_performance (
    date Date,
    product_id String,
    category String,
    brand String,
    views UInt64,
    unique_views UInt64,
    purchases UInt32,
    revenue Decimal(12,2),
    conversion_rate Float32,
    avg_view_duration Float32,
    bounce_rate Float32,
    search_impressions UInt64,
    search_clicks UInt32,
    cart_additions UInt32,
    wishlist_additions UInt32
) ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, product_id)
SETTINGS index_granularity = 8192;

-- User Behavior Analytics Table
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    date Date,
    user_id String,
    sessions_count UInt32,
    total_session_duration UInt64,
    pages_viewed UInt32,
    products_viewed UInt32,
    searches_count UInt32,
    orders_count UInt32,
    total_spent Decimal(12,2),
    avg_order_value Decimal(10,2),
    last_activity DateTime,
    device_types Array(String),
    favorite_categories Array(String),
    customer_segment LowCardinality(String)
) ENGINE = ReplacingMergeTree(last_activity)
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id)
SETTINGS index_granularity = 8192;

-- Real-time Metrics Table (For dashboards)
CREATE TABLE IF NOT EXISTS realtime_metrics (
    timestamp DateTime64(3) DEFAULT now64(),
    metric_name LowCardinality(String),
    metric_value Float64,
    dimensions Map(String, String),
    tags Array(String)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, metric_name)
TTL timestamp + INTERVAL 30 DAY
SETTINGS index_granularity = 8192;

-- Kafka Integration Tables
CREATE TABLE IF NOT EXISTS kafka_user_events (
    event_id String,
    user_id String,
    event_type String,
    event_timestamp DateTime64(3),
    event_data String,
    metadata String
) ENGINE = Kafka()
SETTINGS 
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'user.events',
    kafka_group_name = 'clickhouse_analytics',
    kafka_format = 'JSONEachRow',
    kafka_num_consumers = 2;

CREATE TABLE IF NOT EXISTS kafka_order_events (
    order_id String,
    user_id String,
    event_type String,
    event_timestamp DateTime64(3),
    order_data String,
    metadata String
) ENGINE = Kafka()
SETTINGS 
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'order.events',
    kafka_group_name = 'clickhouse_analytics',
    kafka_format = 'JSONEachRow',
    kafka_num_consumers = 2;

-- Materialized Views for Real-time Processing
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_activity 
TO user_activity_events AS
SELECT 
    event_id,
    user_id,
    '',  -- session_id will be extracted from event_data
    event_type,
    event_timestamp,
    event_data,
    toIPv4OrDefault(JSONExtractString(metadata, 'ip_address')),
    JSONExtractString(metadata, 'user_agent'),
    JSONExtractString(metadata, 'country'),
    JSONExtractString(metadata, 'city'),
    JSONExtractString(metadata, 'device_type'),
    JSONExtractString(metadata, 'browser'),
    JSONExtractString(metadata, 'os'),
    JSONExtractString(metadata, 'referrer'),
    JSONExtractString(metadata, 'page_url'),
    now()
FROM kafka_user_events;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_order_events
TO order_events AS
SELECT 
    generateUUIDv4() as event_id,
    order_id,
    user_id,
    event_type,
    event_timestamp,
    JSONExtractString(order_data, 'status'),
    toDecimal64(JSONExtractFloat(order_data, 'total_amount'), 2),
    JSONExtractString(order_data, 'currency'),
    JSONExtractString(order_data, 'payment_method'),
    JSONExtractString(order_data, 'shipping_method'),
    toUInt16(JSONExtractInt(order_data, 'items_count')),
    toDecimal64(JSONExtractFloat(order_data, 'discount_amount'), 2),
    toDecimal64(JSONExtractFloat(order_data, 'tax_amount'), 2),
    now()
FROM kafka_order_events;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_events (user_id) TYPE bloom_filter GRANULARITY 3;
CREATE INDEX IF NOT EXISTS idx_user_activity_event_type ON user_activity_events (event_type) TYPE set(100) GRANULARITY 3;

CREATE INDEX IF NOT EXISTS idx_order_events_user_id ON order_events (user_id) TYPE bloom_filter GRANULARITY 3;
CREATE INDEX IF NOT EXISTS idx_order_events_status ON order_events (order_status) TYPE set(20) GRANULARITY 3;

CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_view_events (product_id) TYPE bloom_filter GRANULARITY 3;
CREATE INDEX IF NOT EXISTS idx_product_views_category ON product_view_events (category) TYPE set(1000) GRANULARITY 3;

-- Insert sample data for testing
INSERT INTO user_activity_events (
    user_id, session_id, event_type, event_timestamp, event_data, 
    ip_address, user_agent, country, city, device_type, browser, os
) VALUES 
('user_001', 'sess_001', 'page_view', '2024-01-15 10:00:00', '{"page": "/home"}', 
 '192.168.1.100', 'Mozilla/5.0...', 'US', 'New York', 'desktop', 'Chrome', 'Windows'),
('user_002', 'sess_002', 'product_view', '2024-01-15 10:15:00', '{"product_id": "prod_001"}', 
 '192.168.1.101', 'Mozilla/5.0...', 'US', 'Los Angeles', 'mobile', 'Safari', 'iOS'),
('user_001', 'sess_001', 'add_to_cart', '2024-01-15 10:30:00', '{"product_id": "prod_001", "quantity": 2}', 
 '192.168.1.100', 'Mozilla/5.0...', 'US', 'New York', 'desktop', 'Chrome', 'Windows');

INSERT INTO order_events (
    order_id, user_id, event_type, event_timestamp, order_status, 
    total_amount, currency, payment_method, items_count
) VALUES 
('order_001', 'user_001', 'order_created', '2024-01-15 11:00:00', 'pending', 
 299.99, 'USD', 'credit_card', 2),
('order_001', 'user_001', 'payment_processed', '2024-01-15 11:02:00', 'paid', 
 299.99, 'USD', 'credit_card', 2),
('order_002', 'user_002', 'order_created', '2024-01-15 12:00:00', 'pending', 
 149.99, 'USD', 'paypal', 1);

INSERT INTO product_view_events (
    product_id, user_id, session_id, category, brand, price, currency, source, device_type, country
) VALUES 
('prod_001', 'user_001', 'sess_001', 'Electronics', 'TechBrand', 149.99, 'USD', 'organic', 'desktop', 'US'),
('prod_002', 'user_002', 'sess_002', 'Electronics', 'TechBrand', 199.99, 'USD', 'search', 'mobile', 'US'),
('prod_001', 'user_003', 'sess_003', 'Electronics', 'TechBrand', 149.99, 'USD', 'social', 'tablet', 'CA');

INSERT INTO search_events (
    user_id, session_id, query, results_count, clicked_position, clicked_product_id, response_time_ms
) VALUES 
('user_001', 'sess_001', 'wireless headphones', 45, 1, 'prod_001', 150),
('user_002', 'sess_002', 'bluetooth speaker', 23, 3, 'prod_002', 200),
('user_003', 'sess_003', 'gaming mouse', 67, 2, 'prod_003', 120);

-- Create functions for common analytics calculations
CREATE OR REPLACE FUNCTION calculateConversionRate(views UInt64, purchases UInt32) -> Float32 AS
CASE 
    WHEN views > 0 THEN (purchases / views) * 100
    ELSE 0
END;

CREATE OR REPLACE FUNCTION getCustomerSegment(total_spent Decimal(12,2), orders_count UInt32) -> String AS
CASE 
    WHEN total_spent >= 1000 AND orders_count >= 5 THEN 'VIP'
    WHEN total_spent >= 500 AND orders_count >= 3 THEN 'Premium'
    WHEN total_spent >= 100 AND orders_count >= 1 THEN 'Regular'
    ELSE 'New'
END;

-- Create view for daily sales summary
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    toDate(event_timestamp) as date,
    count(*) as total_orders,
    sum(total_amount) as total_revenue,
    avg(total_amount) as avg_order_value,
    uniq(user_id) as unique_customers
FROM order_events 
WHERE event_type = 'order_created'
GROUP BY date
ORDER BY date DESC;

-- Create view for product performance analysis
CREATE OR REPLACE VIEW product_performance_view AS
SELECT 
    pv.product_id,
    pv.category,
    pv.brand,
    count(*) as total_views,
    uniq(pv.user_id) as unique_viewers,
    countIf(oe.order_id IS NOT NULL) as purchases,
    sum(oe.total_amount) as revenue,
    calculateConversionRate(count(*), countIf(oe.order_id IS NOT NULL)) as conversion_rate
FROM product_view_events pv
LEFT JOIN order_events oe ON pv.user_id = oe.user_id 
    AND toDate(pv.view_timestamp) = toDate(oe.event_timestamp)
GROUP BY pv.product_id, pv.category, pv.brand
ORDER BY revenue DESC;

-- Create view for user behavior analysis
CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
    user_id,
    uniq(session_id) as sessions_count,
    count(*) as total_events,
    countIf(event_type = 'page_view') as page_views,
    countIf(event_type = 'product_view') as product_views,
    countIf(event_type = 'add_to_cart') as cart_additions,
    max(event_timestamp) as last_activity,
    groupArray(DISTINCT device_type) as devices_used,
    getCustomerSegment(0, 0) as segment  -- This would be calculated with order data
FROM user_activity_events
GROUP BY user_id
ORDER BY last_activity DESC;

-- System tables for monitoring
SHOW TABLES;
