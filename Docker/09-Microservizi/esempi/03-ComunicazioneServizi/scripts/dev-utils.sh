#!/bin/bash

# Development utility script for microservices communication example
# Provides commands for development tasks like building, testing, debugging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build specific service
build_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_error "Please specify a service to build"
        echo "Available services: user-service, order-service, payment-service, notification-service"
        exit 1
    fi
    
    if [ ! -d "services/$service" ]; then
        log_error "Service directory 'services/$service' not found"
        exit 1
    fi
    
    log_info "Building $service..."
    docker-compose build "$service"
    log_success "$service built successfully"
}

# Run specific service in development mode
dev_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_error "Please specify a service to run in dev mode"
        echo "Available services: user-service, order-service, payment-service, notification-service"
        exit 1
    fi
    
    # Start dependencies first
    log_info "Starting dependencies for $service..."
    
    case $service in
        user-service)
            docker-compose up -d postgres redis rabbitmq
            ;;
        order-service)
            docker-compose up -d mongo redis rabbitmq
            ;;
        payment-service)
            docker-compose up -d redis rabbitmq
            ;;
        notification-service)
            docker-compose up -d rabbitmq mailhog
            ;;
        *)
            log_error "Unknown service: $service"
            exit 1
            ;;
    esac
    
    # Wait a bit for dependencies
    sleep 5
    
    log_info "Starting $service in development mode..."
    docker-compose up "$service"
}

# Debug specific service
debug_service() {
    local service=$1
    
    if [ -z "$service" ]; then
        log_error "Please specify a service to debug"
        exit 1
    fi
    
    log_info "Starting debug session for $service..."
    
    # Start dependencies
    case $service in
        user-service)
            docker-compose up -d postgres redis rabbitmq
            ;;
        order-service)
            docker-compose up -d mongo redis rabbitmq
            ;;
        payment-service)
            docker-compose up -d redis rabbitmq
            ;;
        notification-service)
            docker-compose up -d rabbitmq mailhog
            ;;
    esac
    
    # Run service with debug ports exposed
    log_info "Service $service is ready for debugging"
    log_info "Connect your debugger to the appropriate port"
    docker-compose -f docker-compose.yml -f docker-compose.debug.yml up "$service"
}

# Generate API documentation
generate_docs() {
    log_info "Generating API documentation..."
    
    # Create docs directory if it doesn't exist
    mkdir -p docs
    
    # Generate OpenAPI specs for each service
    services=("user-service" "order-service" "payment-service")
    
    for service in "${services[@]}"; do
        log_info "Generating docs for $service..."
        
        case $service in
            user-service)
                # Python FastAPI auto-generates OpenAPI
                curl -s "http://localhost:3002/openapi.json" > "docs/${service}-openapi.json" 2>/dev/null || true
                ;;
            order-service)
                # Node.js with Swagger
                curl -s "http://localhost:3001/api-docs.json" > "docs/${service}-openapi.json" 2>/dev/null || true
                ;;
            payment-service)
                # Go with custom OpenAPI
                curl -s "http://localhost:3003/swagger.json" > "docs/${service}-openapi.json" 2>/dev/null || true
                ;;
        esac
    done
    
    log_success "API documentation generated in docs/ directory"
}

# Run security scan
security_scan() {
    log_info "Running security scan on Docker images..."
    
    # Build images first
    docker-compose build
    
    # Scan each service image
    services=("user-service" "order-service" "payment-service" "notification-service")
    
    for service in "${services[@]}"; do
        log_info "Scanning $service..."
        
        # Use Docker Scout if available, otherwise use basic docker scan
        if command -v docker-scout &> /dev/null; then
            docker scout cves "microservices-communication_${service}:latest" || true
        elif docker scan --help &> /dev/null; then
            docker scan "microservices-communication_${service}:latest" || true
        else
            log_warning "No security scanner found. Install Docker Scout or enable Docker scan."
        fi
    done
    
    log_success "Security scan completed"
}

# Lint code in all services
lint() {
    log_info "Running code linting..."
    
    # User Service (Python)
    if [ -d "services/user-service" ]; then
        log_info "Linting user-service (Python)..."
        cd services/user-service
        python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
        python -m flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics || true
        cd ../..
    fi
    
    # Order Service (Node.js)
    if [ -d "services/order-service" ]; then
        log_info "Linting order-service (Node.js)..."
        cd services/order-service
        npm run lint || true
        cd ../..
    fi
    
    # Payment Service (Go)
    if [ -d "services/payment-service" ]; then
        log_info "Linting payment-service (Go)..."
        cd services/payment-service
        go fmt ./... || true
        go vet ./... || true
        cd ../..
    fi
    
    # Notification Service (Python)
    if [ -d "services/notification-service" ]; then
        log_info "Linting notification-service (Python)..."
        cd services/notification-service
        python -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
        cd ../..
    fi
    
    log_success "Code linting completed"
}

# Run unit tests for all services
unit_tests() {
    log_info "Running unit tests for all services..."
    
    # User Service (Python)
    if [ -d "services/user-service" ]; then
        log_info "Testing user-service..."
        cd services/user-service
        python -m pytest tests/ -v || true
        cd ../..
    fi
    
    # Order Service (Node.js)
    if [ -d "services/order-service" ]; then
        log_info "Testing order-service..."
        cd services/order-service
        npm test || true
        cd ../..
    fi
    
    # Payment Service (Go)
    if [ -d "services/payment-service" ]; then
        log_info "Testing payment-service..."
        cd services/payment-service
        go test ./... -v || true
        cd ../..
    fi
    
    log_success "Unit tests completed"
}

# Benchmark services
benchmark() {
    local service=$1
    local endpoint=$2
    
    if [ -z "$service" ] || [ -z "$endpoint" ]; then
        log_error "Usage: benchmark <service> <endpoint>"
        echo "Example: benchmark user-service /api/users"
        exit 1
    fi
    
    # Determine port based on service
    local port
    case $service in
        user-service) port=3002 ;;
        order-service) port=3001 ;;
        payment-service) port=3003 ;;
        *)
            log_error "Unknown service: $service"
            exit 1
            ;;
    esac
    
    log_info "Benchmarking $service$endpoint..."
    
    # Use Apache Bench if available
    if command -v ab &> /dev/null; then
        ab -n 1000 -c 10 "http://localhost:$port$endpoint"
    # Use curl if ab is not available
    elif command -v curl &> /dev/null; then
        log_info "Using curl for basic benchmarking..."
        for i in {1..10}; do
            curl -w "Response time: %{time_total}s\n" -s -o /dev/null "http://localhost:$port$endpoint"
        done
    else
        log_error "No benchmarking tool found. Install apache2-utils for 'ab' command."
        exit 1
    fi
}

# Show service metrics
metrics() {
    log_info "Fetching service metrics..."
    
    services=("user-service:3002" "order-service:3001" "payment-service:3003")
    
    for service in "${services[@]}"; do
        service_name=${service%:*}
        port=${service#*:}
        
        log_info "Metrics for $service_name:"
        curl -s "http://localhost:$port/metrics" | grep -E "(http_requests|response_time|errors)" | head -10 || true
        echo
    done
}

# Database operations
db_ops() {
    local operation=$1
    local service=$2
    
    case $operation in
        backup)
            log_info "Creating database backup..."
            case $service in
                user-service)
                    docker exec postgres pg_dump -U postgres users > "backup_users_$(date +%Y%m%d_%H%M%S).sql"
                    ;;
                order-service)
                    docker exec mongodb mongodump --db orders --out "/tmp/backup_$(date +%Y%m%d_%H%M%S)"
                    ;;
                *)
                    log_error "Specify service: user-service or order-service"
                    exit 1
                    ;;
            esac
            ;;
        restore)
            log_warning "Database restore functionality - implement based on your backup strategy"
            ;;
        migrate)
            log_info "Running database migrations..."
            case $service in
                user-service)
                    docker-compose exec user-service python -c "from app import create_tables; create_tables()"
                    ;;
                order-service)
                    log_info "MongoDB doesn't require explicit migrations"
                    ;;
            esac
            ;;
        *)
            log_error "Unknown database operation: $operation"
            echo "Available operations: backup, restore, migrate"
            exit 1
            ;;
    esac
}

# Show help
help() {
    echo "Microservices Communication Development Utilities"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Build Commands:"
    echo "  build <service>         Build specific service"
    echo "  dev <service>          Run service in development mode"
    echo "  debug <service>        Start service with debugging enabled"
    echo
    echo "Quality Commands:"
    echo "  lint                   Run code linting on all services"
    echo "  test                   Run unit tests for all services"
    echo "  security-scan          Run security scan on Docker images"
    echo
    echo "Documentation:"
    echo "  docs                   Generate API documentation"
    echo
    echo "Performance:"
    echo "  benchmark <service> <endpoint>  Benchmark specific endpoint"
    echo "  metrics                Show current service metrics"
    echo
    echo "Database:"
    echo "  db backup <service>    Backup database"
    echo "  db migrate <service>   Run database migrations"
    echo
    echo "Examples:"
    echo "  $0 build user-service           # Build only user service"
    echo "  $0 dev order-service            # Run order service in dev mode"
    echo "  $0 benchmark user-service /api/users  # Benchmark user endpoint"
    echo "  $0 db backup user-service       # Backup user database"
    echo
}

# Main execution
main() {
    local command=$1
    shift
    
    case $command in
        build)
            build_service "$@"
            ;;
        dev)
            dev_service "$@"
            ;;
        debug)
            debug_service "$@"
            ;;
        lint)
            lint
            ;;
        test)
            unit_tests
            ;;
        security-scan)
            security_scan
            ;;
        docs)
            generate_docs
            ;;
        benchmark)
            benchmark "$@"
            ;;
        metrics)
            metrics
            ;;
        db)
            db_ops "$@"
            ;;
        help|--help|-h)
            help
            ;;
        *)
            if [ -z "$command" ]; then
                help
            else
                log_error "Unknown command: $command"
                echo
                help
                exit 1
            fi
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
