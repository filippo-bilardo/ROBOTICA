-- PostgreSQL Initialization Script for User Service
-- Implements Database per Service pattern with Event Sourcing support

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create database and schemas
CREATE DATABASE users_db;
\c users_db;

-- Create schemas for separation of concerns
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS projections;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set search path
SET search_path TO users, events, projections, audit, public;

-- ============================================================================
-- USERS SCHEMA - Main transactional data
-- ============================================================================

-- Users table with JSONB support for flexible profiles
CREATE TABLE users.users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- User sessions for tracking
CREATE TABLE users.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE users.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users.user_roles (
    user_id INTEGER REFERENCES users.users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES users.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by INTEGER REFERENCES users.users(id),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- EVENTS SCHEMA - Event Sourcing implementation
-- ============================================================================

-- Event store for all user-related events
CREATE TABLE events.user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(100) UNIQUE NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL, -- Can be user_id or other aggregate
    aggregate_type VARCHAR(50) NOT NULL DEFAULT 'User',
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    version INTEGER NOT NULL,
    position BIGSERIAL,
    timestamp TIMESTAMP DEFAULT NOW(),
    correlation_id UUID,
    causation_id UUID,
    user_id INTEGER -- For authorization
);

-- Event snapshots for performance optimization
CREATE TABLE events.user_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    snapshot_data JSONB NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Event subscriptions for projections
CREATE TABLE events.event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_name VARCHAR(100) UNIQUE NOT NULL,
    last_processed_position BIGINT DEFAULT 0,
    last_processed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PROJECTIONS SCHEMA - CQRS Read Models
-- ============================================================================

-- User profile projection optimized for queries
CREATE TABLE projections.user_profiles (
    user_id INTEGER PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(200),
    website VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    status VARCHAR(20) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- User activity summary
CREATE TABLE projections.user_activity_summary (
    user_id INTEGER PRIMARY KEY,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    average_session_duration INTERVAL,
    last_order_date TIMESTAMP,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    favorite_categories JSONB DEFAULT '[]',
    last_activity TIMESTAMP,
    activity_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User notifications preferences
CREATE TABLE projections.user_notifications (
    user_id INTEGER PRIMARY KEY,
    email_notifications JSONB DEFAULT '{}',
    push_notifications JSONB DEFAULT '{}',
    sms_notifications JSONB DEFAULT '{}',
    marketing_consent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AUDIT SCHEMA - Audit trail and compliance
-- ============================================================================

-- Audit log for all user actions
CREATE TABLE audit.user_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    session_id UUID
);

-- GDPR compliance tracking
CREATE TABLE audit.data_processing_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users.users(id),
    processing_type VARCHAR(50) NOT NULL, -- 'access', 'export', 'delete', 'update'
    legal_basis VARCHAR(50), -- 'consent', 'contract', 'legal_obligation', etc.
    purpose TEXT,
    data_categories JSONB, -- Categories of personal data processed
    retention_period INTERVAL,
    processor_name VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed'
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_username ON users.users(username);
CREATE INDEX idx_users_uuid ON users.users(uuid);
CREATE INDEX idx_users_status ON users.users(status);
CREATE INDEX idx_users_email_verified ON users.users(email_verified);
CREATE INDEX idx_users_created_at ON users.users(created_at);
CREATE INDEX idx_users_profile_gin ON users.users USING GIN(profile);

-- Events table indexes
CREATE INDEX idx_user_events_aggregate_id ON events.user_events(aggregate_id);
CREATE INDEX idx_user_events_event_type ON events.user_events(event_type);
CREATE INDEX idx_user_events_position ON events.user_events(position);
CREATE INDEX idx_user_events_timestamp ON events.user_events(timestamp);
CREATE INDEX idx_user_events_correlation_id ON events.user_events(correlation_id);
CREATE INDEX idx_user_events_aggregate_version ON events.user_events(aggregate_id, version);

-- Projections indexes
CREATE INDEX idx_user_profiles_email ON projections.user_profiles(email);
CREATE INDEX idx_user_profiles_username ON projections.user_profiles(username);
CREATE INDEX idx_user_profiles_status ON projections.user_profiles(status);
CREATE INDEX idx_user_profiles_created_at ON projections.user_profiles(created_at);

-- Audit indexes
CREATE INDEX idx_audit_user_id ON audit.user_audit_log(user_id);
CREATE INDEX idx_audit_action ON audit.user_audit_log(action);
CREATE INDEX idx_audit_timestamp ON audit.user_audit_log(timestamp);
CREATE INDEX idx_audit_resource ON audit.user_audit_log(resource_type, resource_id);

-- ============================================================================
-- TRIGGERS for Data Consistency
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_subscriptions_updated_at BEFORE UPDATE ON events.event_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Version increment trigger
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_users_version BEFORE UPDATE ON users.users
    FOR EACH ROW EXECUTE FUNCTION increment_version();

-- Event position trigger
CREATE OR REPLACE FUNCTION assign_event_position()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure events are processed in order
    IF NEW.position IS NULL THEN
        SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
        FROM events.user_events;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER assign_user_events_position BEFORE INSERT ON events.user_events
    FOR EACH ROW EXECUTE FUNCTION assign_event_position();

-- ============================================================================
-- VIEWS for Common Queries
-- ============================================================================

-- Active users with latest activity
CREATE VIEW users.active_users_view AS
SELECT 
    u.id,
    u.uuid,
    u.username,
    u.email,
    u.status,
    u.last_login,
    u.login_count,
    u.created_at,
    EXTRACT(DAYS FROM NOW() - u.last_login) as days_since_login,
    COALESCE(uas.activity_score, 0) as activity_score
FROM users.users u
LEFT JOIN projections.user_activity_summary uas ON u.id = uas.user_id
WHERE u.status = 'active'
    AND u.email_verified = true
ORDER BY u.last_login DESC;

-- Recent user events
CREATE VIEW events.recent_user_events AS
SELECT 
    ue.event_id,
    ue.aggregate_id,
    ue.event_type,
    ue.event_data,
    ue.timestamp,
    u.username,
    u.email
FROM events.user_events ue
LEFT JOIN users.users u ON u.id::text = ue.aggregate_id
WHERE ue.timestamp >= NOW() - INTERVAL '7 days'
ORDER BY ue.timestamp DESC;

-- ============================================================================
-- FUNCTIONS for Business Logic
-- ============================================================================

-- Function to get user by email or username
CREATE OR REPLACE FUNCTION users.get_user_by_login(login_identifier TEXT)
RETURNS users.users AS $$
DECLARE
    user_record users.users%ROWTYPE;
BEGIN
    SELECT * INTO user_record
    FROM users.users
    WHERE email = login_identifier OR username = login_identifier
    LIMIT 1;
    
    RETURN user_record;
END;
$$ LANGUAGE plpgsql;

-- Function to create event with validation
CREATE OR REPLACE FUNCTION events.append_user_event(
    p_aggregate_id VARCHAR(100),
    p_event_type VARCHAR(100),
    p_event_data JSONB,
    p_metadata JSONB DEFAULT '{}',
    p_expected_version INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    current_version INTEGER;
    new_event_id UUID;
    new_position BIGINT;
BEGIN
    -- Get current version
    SELECT COALESCE(MAX(version), 0) INTO current_version
    FROM events.user_events
    WHERE aggregate_id = p_aggregate_id;
    
    -- Check expected version for optimistic concurrency
    IF p_expected_version IS NOT NULL AND current_version != p_expected_version THEN
        RAISE EXCEPTION 'Concurrency conflict: expected version %, current version %', 
            p_expected_version, current_version;
    END IF;
    
    -- Generate new event ID
    new_event_id := uuid_generate_v4();
    
    -- Insert event
    INSERT INTO events.user_events (
        event_id,
        aggregate_id,
        event_type,
        event_data,
        metadata,
        version
    ) VALUES (
        new_event_id::text,
        p_aggregate_id,
        p_event_type,
        p_event_data,
        p_metadata,
        current_version + 1
    );
    
    RETURN new_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default roles
INSERT INTO users.roles (name, description, permissions) VALUES
('admin', 'System administrator', '["user:*", "order:*", "system:*"]'),
('user', 'Regular user', '["user:read", "user:update_own", "order:create", "order:read_own"]'),
('moderator', 'Content moderator', '["user:read", "user:moderate", "content:moderate"]'),
('support', 'Customer support', '["user:read", "user:help", "order:read", "order:help"]');

-- Insert sample users
INSERT INTO users.users (email, username, password_hash, profile, status, email_verified) VALUES
('admin@example.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgEZWpVOksyIkme', 
 '{"firstName": "Admin", "lastName": "User", "role": "administrator"}', 'active', true),
('john.doe@example.com', 'johndoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgEZWpVOksyIkme',
 '{"firstName": "John", "lastName": "Doe", "bio": "Software developer", "location": "San Francisco"}', 'active', true),
('jane.smith@example.com', 'janesmith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgEZWpVOksyIkme',
 '{"firstName": "Jane", "lastName": "Smith", "bio": "Product manager", "location": "New York"}', 'active', true),
('test.user@example.com', 'testuser', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgEZWpVOksyIkme',
 '{"firstName": "Test", "lastName": "User", "bio": "Test account"}', 'active', false);

-- Assign roles to users
INSERT INTO users.user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> admin role
(2, 2), -- johndoe -> user role
(3, 2), -- janesmith -> user role
(4, 2); -- testuser -> user role

-- Insert sample events
SELECT events.append_user_event('1', 'UserCreated', 
    '{"email": "admin@example.com", "username": "admin", "role": "admin"}',
    '{"timestamp": "' || NOW() || '", "source": "system"}'
);

SELECT events.append_user_event('2', 'UserCreated', 
    '{"email": "john.doe@example.com", "username": "johndoe"}',
    '{"timestamp": "' || NOW() || '", "source": "registration"}'
);

SELECT events.append_user_event('2', 'ProfileUpdated', 
    '{"changes": {"bio": "Software developer", "location": "San Francisco"}}',
    '{"timestamp": "' || NOW() || '", "source": "profile_update"}'
);

-- Insert projection data
INSERT INTO projections.user_profiles (
    user_id, uuid, username, email, display_name, first_name, last_name,
    status, email_verified, created_at, updated_at
)
SELECT 
    u.id, u.uuid, u.username, u.email,
    COALESCE(u.profile->>'firstName' || ' ' || u.profile->>'lastName', u.username),
    u.profile->>'firstName', u.profile->>'lastName',
    u.status, u.email_verified, u.created_at, u.updated_at
FROM users.users u;

-- Insert default event subscriptions
INSERT INTO events.event_subscriptions (subscription_name, last_processed_position) VALUES
('user-profile-projection', 0),
('user-activity-projection', 0),
('analytics-export', 0),
('audit-logger', 0);

-- ============================================================================
-- GRANTS and Permissions
-- ============================================================================

-- Create application role
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';

-- Grant schema permissions
GRANT USAGE ON SCHEMA users TO app_user;
GRANT USAGE ON SCHEMA events TO app_user;
GRANT USAGE ON SCHEMA projections TO app_user;
GRANT USAGE ON SCHEMA audit TO app_user;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA users TO app_user;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA events TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA projections TO app_user;
GRANT INSERT ON ALL TABLES IN SCHEMA audit TO app_user;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA users TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA events TO app_user;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA users TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA events TO app_user;

COMMIT;
