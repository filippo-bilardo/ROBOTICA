#!/bin/bash

# Deployment and management script for microservices communication example
# This script provides easy commands to deploy, manage, and monitor the system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="microservices-communication"

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

# Check if Docker and Docker Compose are installed
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "All requirements satisfied"
}

# Deploy the entire system
deploy() {
    log_info "Deploying microservices communication example..."
    
    # Build and start all services
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    
    log_info "Waiting for services to be healthy..."
    wait_for_services
    
    log_success "Deployment completed successfully!"
    show_endpoints
}

# Wait for all services to be healthy
wait_for_services() {
    local max_attempts=60
    local attempt=1
    
    services=("user-service:3002" "order-service:3001" "payment-service:3003")
    
    for service in "${services[@]}"; do
        log_info "Waiting for $service to be ready..."
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f -s "http://localhost:${service##*:}/health" > /dev/null 2>&1; then
                log_success "$service is ready"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "$service failed to start within timeout"
                return 1
            fi
            
            sleep 2
            attempt=$((attempt + 1))
        done
        attempt=1
    done
}

# Show service endpoints
show_endpoints() {
    echo
    log_info "=== SERVICE ENDPOINTS ==="
    echo "🔵 User Service:        http://localhost:3002"
    echo "🔵 Order Service:       http://localhost:3001"
    echo "🔵 Payment Service:     http://localhost:3003"
    echo "🔵 Notification UI:     http://localhost:8025 (MailHog)"
    echo "🔵 RabbitMQ Management: http://localhost:15672 (admin/admin)"
    echo "🔵 Prometheus:          http://localhost:9090"
    echo "🔵 Grafana:             http://localhost:3000 (admin/admin)"
    echo "🔵 Jaeger:              http://localhost:16686"
    echo
}

# Stop all services
stop() {
    log_info "Stopping all services..."
    docker-compose -f $COMPOSE_FILE down
    log_success "All services stopped"
}

# Stop and remove all data
destroy() {
    log_warning "This will stop all services and remove all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Destroying all services and data..."
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        log_success "All services and data destroyed"
    else
        log_info "Operation cancelled"
    fi
}

# Show service status
status() {
    log_info "Service Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo
    
    log_info "Health Checks:"
    endpoints=("3002/health" "3001/health" "3003/health")
    services=("User Service" "Order Service" "Payment Service")
    
    for i in "${!endpoints[@]}"; do
        if curl -f -s "http://localhost:${endpoints[$i]}" > /dev/null 2>&1; then
            log_success "${services[$i]} is healthy"
        else
            log_error "${services[$i]} is unhealthy"
        fi
    done
}

# Show logs for all services or specific service
logs() {
    local service=$1
    
    if [ -n "$service" ]; then
        log_info "Showing logs for $service..."
        docker-compose -f $COMPOSE_FILE logs -f "$service"
    else
        log_info "Showing logs for all services..."
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

# Run integration tests
test() {
    log_info "Running integration tests..."
    
    # Check if services are running
    if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_error "Services are not running. Please deploy first."
        exit 1
    fi
    
    # Install test dependencies
    if [ ! -d "venv" ]; then
        log_info "Creating virtual environment for tests..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r tests/requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Run tests
    cd tests
    python integration/test_microservices_flow.py
    cd ..
    
    deactivate
}

# Run load tests
load_test() {
    local users=${1:-10}
    local duration=${2:-60}
    
    log_info "Running load test with $users users for $duration seconds..."
    
    # Check if services are running
    if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_error "Services are not running. Please deploy first."
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Run load test
    cd tests
    python load/load_test.py --users "$users" --duration "$duration"
    cd ..
    
    deactivate
}

# Monitor services
monitor() {
    log_info "Opening monitoring dashboards..."
    
    # Check if services are running
    if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_error "Services are not running. Please deploy first."
        exit 1
    fi
    
    echo "Opening monitoring tools..."
    echo "📊 Grafana: http://localhost:3000"
    echo "📈 Prometheus: http://localhost:9090" 
    echo "🔍 Jaeger: http://localhost:16686"
    echo "📧 MailHog: http://localhost:8025"
    echo "🐰 RabbitMQ: http://localhost:15672"
    
    # Try to open in default browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000"
    elif command -v open &> /dev/null; then
        open "http://localhost:3000"
    fi
}

# Clean up resources
cleanup() {
    log_info "Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Show help
help() {
    echo "Microservices Communication Deployment Script"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  deploy              Deploy all services"
    echo "  stop                Stop all services"
    echo "  destroy             Stop services and remove all data"
    echo "  status              Show service status"
    echo "  logs [SERVICE]      Show logs (all services or specific service)"
    echo "  test                Run integration tests"
    echo "  load-test [USERS] [DURATION]  Run load tests"
    echo "  monitor             Open monitoring dashboards"
    echo "  cleanup             Clean up Docker resources"
    echo "  help                Show this help message"
    echo
    echo "Examples:"
    echo "  $0 deploy                    # Deploy all services"
    echo "  $0 logs user-service         # Show logs for user service"
    echo "  $0 load-test 20 120         # Load test with 20 users for 120 seconds"
    echo "  $0 status                    # Check service health"
    echo
}

# Main execution
main() {
    local command=$1
    shift
    
    case $command in
        deploy)
            check_requirements
            deploy
            ;;
        stop)
            stop
            ;;
        destroy)
            destroy
            ;;
        status)
            status
            ;;
        logs)
            logs "$@"
            ;;
        test)
            test
            ;;
        load-test)
            load_test "$@"
            ;;
        monitor)
            monitor
            ;;
        cleanup)
            cleanup
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
