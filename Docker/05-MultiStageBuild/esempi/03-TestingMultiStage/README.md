# Esempi: Testing con Multi-stage Builds

## Introduzione

Questa sezione dimostra come integrare testing completi nei multi-stage builds, implementando:

- **Test automatizzati**: Unit test, integration test, e2e test
- **Quality gates**: Code coverage, linting, security scanning
- **Test parallelization**: Esecuzione parallela di test suite diverse
- **Test artifacts**: Raccolta e preservazione dei risultati
- **CI/CD integration**: Integrazione con pipeline automatiche

## Esempi Inclusi

### 1. Node.js con Test Suite Completa
- Unit test con Jest
- Integration test con Supertest
- Code coverage reporting
- Linting e formatting

### 2. Python con Testing Avanzato
- Pytest con fixtures
- Code coverage con pytest-cov
- Security testing con bandit
- Type checking con mypy

### 3. Go con Benchmark e Test
- Unit test standard
- Benchmark testing
- Race condition detection
- Test coverage analysis

### 4. Full-stack Testing Pipeline
- Frontend unit test (React)
- Backend API test
- Database migration test
- E2E test con Cypress

---

## 1. Node.js Test Suite Completa

### Struttura Directory
```
01-nodejs-testing/
├── Dockerfile.test
├── Dockerfile.ci
├── package.json
├── jest.config.js
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── services/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .eslintrc.js
└── scripts/
    ├── test-all.sh
    └── coverage-report.sh
```

### Dockerfile con Test Completi

```dockerfile
# Dockerfile.test
# syntax=docker/dockerfile:1

# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache git curl

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Linting stage
FROM dependencies AS linter
COPY . .
RUN npm run lint -- --format=json --output-file=lint-results.json
RUN npm run format:check

# Unit testing stage
FROM dependencies AS unit-tests
COPY . .
# Run unit tests with coverage
RUN npm run test:unit -- --coverage --coverageReporters=json-summary --coverageReporters=lcov
# Ensure minimum coverage
RUN npm run test:coverage-check

# Integration testing stage  
FROM dependencies AS integration-tests
COPY . .
# Setup test database
RUN npm run db:test:setup
# Run integration tests
RUN npm run test:integration
# Cleanup test database
RUN npm run db:test:teardown

# Security testing stage
FROM dependencies AS security-tests
COPY . .
# Dependency security audit
RUN npm audit --audit-level=moderate
# Security vulnerability scanning
RUN npm run security:scan
# SAST analysis
RUN npm run security:sast

# Performance testing stage
FROM dependencies AS performance-tests
COPY . .
# Build production version for testing
RUN npm run build:prod
# Load testing
RUN npm run test:load
# Memory leak detection
RUN npm run test:memory

# Build stage (only if all tests pass)
FROM dependencies AS builder
# Copy from test stages to ensure they completed successfully
COPY --from=linter /app/lint-results.json /tmp/
COPY --from=unit-tests /app/coverage/ /tmp/coverage/
COPY --from=integration-tests /app/test-results/ /tmp/test-results/
COPY --from=security-tests /app/security-report.json /tmp/
COPY --from=performance-tests /app/performance-report.json /tmp/

COPY . .
RUN npm run build:prod

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/app.js"]
```

### CI/CD Optimized Testing

```dockerfile
# Dockerfile.ci
# syntax=docker/dockerfile:1

FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache git

# Dependencies with cache
FROM base AS dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --frozen-lockfile

# Parallel test execution
FROM dependencies AS test-runner

# Copy source code
COPY . .

# Create test script that runs all tests in parallel
RUN cat > run-tests.sh << 'EOF'
#!/bin/sh
set -e

echo "🧪 Starting parallel test execution..."

# Start all test suites in background
npm run test:unit > unit-test.log 2>&1 &
UNIT_PID=$!

npm run test:integration > integration-test.log 2>&1 &
INTEGRATION_PID=$!

npm run lint > lint.log 2>&1 &
LINT_PID=$!

npm run security:scan > security.log 2>&1 &
SECURITY_PID=$!

# Wait for all tests to complete
wait $UNIT_PID
UNIT_EXIT=$?

wait $INTEGRATION_PID
INTEGRATION_EXIT=$?

wait $LINT_PID
LINT_EXIT=$?

wait $SECURITY_PID
SECURITY_EXIT=$?

# Check results
echo "📊 Test Results:"
echo "Unit Tests: $([ $UNIT_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Integration Tests: $([ $INTEGRATION_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Linting: $([ $LINT_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Security: $([ $SECURITY_EXIT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"

# Exit with error if any test failed
if [ $UNIT_EXIT -ne 0 ] || [ $INTEGRATION_EXIT -ne 0 ] || [ $LINT_EXIT -ne 0 ] || [ $SECURITY_EXIT -ne 0 ]; then
  echo "💥 Some tests failed!"
  exit 1
fi

echo "🎉 All tests passed!"
EOF

RUN chmod +x run-tests.sh && ./run-tests.sh

# Collect test artifacts
RUN mkdir -p /app/test-artifacts && \
    cp coverage/lcov.info /app/test-artifacts/ && \
    cp test-results.xml /app/test-artifacts/ && \
    cp lint-results.json /app/test-artifacts/ && \
    cp security-report.json /app/test-artifacts/

# Production build stage
FROM dependencies AS production-build
COPY --from=test-runner /app/test-artifacts /tmp/test-artifacts
COPY . .
RUN npm run build:prod

# Final production image
FROM node:18-alpine AS production
WORKDIR /app

# Copy production dependencies and build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=production-build /app/dist ./dist
COPY package.json ./

# Add test artifacts metadata
COPY --from=test-runner /app/test-artifacts/lcov.info /tmp/
RUN echo "BUILD_TESTED=true" > /app/.build-info

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

EXPOSE 3000
CMD ["node", "dist/app.js"]
```

---

## 2. Python Testing Avanzato

### Struttura Directory
```
02-python-testing/
├── Dockerfile.test
├── requirements.txt
├── requirements-test.txt
├── pyproject.toml
├── pytest.ini
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   └── services/
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── scripts/
    ├── test-ci.sh
    └── quality-check.sh
```

### Python Multi-stage Testing

```dockerfile
# Dockerfile.test
# syntax=docker/dockerfile:1

# Base Python image
FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    git \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Test dependencies stage
FROM base AS test-dependencies

# Copy requirements
COPY requirements.txt requirements-test.txt ./

# Install all dependencies
RUN pip install --no-cache-dir -r requirements.txt -r requirements-test.txt

# Code quality stage
FROM test-dependencies AS quality-check

COPY . .

# Type checking with mypy
RUN mypy app/ --ignore-missing-imports --strict

# Code formatting check
RUN black --check app/ tests/

# Import sorting check  
RUN isort --check-only app/ tests/

# Linting with flake8
RUN flake8 app/ tests/

# Security checking with bandit
RUN bandit -r app/ -f json -o security-report.json

# Unit testing stage
FROM test-dependencies AS unit-tests

COPY . .

# Run unit tests with coverage
RUN pytest tests/unit/ \
    --cov=app \
    --cov-report=xml \
    --cov-report=html \
    --cov-report=term \
    --cov-fail-under=80 \
    --junitxml=unit-test-results.xml

# Integration testing stage
FROM test-dependencies AS integration-tests

COPY . .

# Setup test environment
ENV TESTING=true
ENV DATABASE_URL=sqlite:///test.db

# Run database migrations for testing
RUN python -m app.migrations.run

# Run integration tests
RUN pytest tests/integration/ \
    --junitxml=integration-test-results.xml \
    -v

# Cleanup test database
RUN rm -f test.db

# Performance testing stage
FROM test-dependencies AS performance-tests

COPY . .

# Install performance testing tools
RUN pip install --no-cache-dir locust pytest-benchmark

# Run performance tests
RUN pytest tests/performance/ \
    --benchmark-only \
    --benchmark-json=benchmark-results.json

# Memory profiling
RUN python -m memory_profiler tests/memory_test.py > memory-profile.txt

# Production dependencies stage
FROM base AS prod-dependencies

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Final testing verification
FROM prod-dependencies AS test-verification

# Copy from all test stages to ensure they passed
COPY --from=quality-check /app/security-report.json /tmp/
COPY --from=unit-tests /app/htmlcov/ /tmp/coverage/
COPY --from=integration-tests /app/integration-test-results.xml /tmp/
COPY --from=performance-tests /app/benchmark-results.json /tmp/

# Copy application
COPY app/ ./app/

# Verify application can start
RUN python -c "from app.main import app; print('✅ Application import successful')"

# Production stage
FROM python:3.11-slim AS production

WORKDIR /app

# Copy production dependencies
COPY --from=prod-dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy application
COPY app/ ./app/

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

EXPOSE 8000
CMD ["python", "-m", "app.main"]
```

---

## 3. Go Testing e Benchmarking

### Struttura Directory
```
03-golang-testing/
├── Dockerfile.test
├── go.mod
├── go.sum
├── main.go
├── cmd/
├── internal/
├── pkg/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── benchmarks/
└── scripts/
    ├── test-all.sh
    └── benchmark.sh
```

### Go Multi-stage Testing

```dockerfile
# Dockerfile.test
# syntax=docker/dockerfile:1

# Base Go image
FROM golang:1.21-alpine AS base
WORKDIR /app
RUN apk add --no-cache git gcc musl-dev

# Dependencies stage
FROM base AS dependencies
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Linting stage
FROM dependencies AS linter
# Install golangci-lint
RUN go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

COPY . .

# Run comprehensive linting
RUN golangci-lint run --out-format json > lint-report.json

# Vet check
RUN go vet ./...

# Format check
RUN test -z "$(gofmt -l .)"

# Unit testing stage
FROM dependencies AS unit-tests

COPY . .

# Run unit tests with coverage
RUN go test -v \
    -race \
    -coverprofile=coverage.out \
    -covermode=atomic \
    -coverpkg=./... \
    ./...

# Generate coverage report
RUN go tool cover -html=coverage.out -o coverage.html
RUN go tool cover -func=coverage.out > coverage.txt

# Check coverage threshold
RUN coverage=$(go tool cover -func=coverage.out | grep total | awk '{print substr($3, 1, length($3)-1)}' | head -n 1); \
    if [ "$(echo "$coverage < 80" | bc -l)" -eq 1 ]; then \
        echo "❌ Coverage $coverage% is below 80% threshold"; \
        exit 1; \
    else \
        echo "✅ Coverage $coverage% meets threshold"; \
    fi

# Benchmark testing stage
FROM dependencies AS benchmark-tests

COPY . .

# Run benchmarks
RUN go test -bench=. -benchmem -benchtime=5s ./... > benchmark-results.txt

# CPU profiling
RUN go test -bench=. -cpuprofile=cpu.prof ./...

# Memory profiling
RUN go test -bench=. -memprofile=mem.prof ./...

# Integration testing stage
FROM dependencies AS integration-tests

COPY . .

# Install test database (SQLite for simplicity)
RUN apk add --no-cache sqlite

# Run integration tests
RUN go test -v -tags=integration ./tests/integration/...

# Security testing stage
FROM dependencies AS security-tests

# Install security tools
RUN go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest

COPY . .

# Security scanning
RUN gosec -fmt json -out security-report.json ./...

# Dependency vulnerability check
RUN go list -json -m all | nancy sleuth

# Build stage (only after all tests pass)
FROM dependencies AS builder

# Ensure all test stages completed
COPY --from=linter /app/lint-report.json /tmp/
COPY --from=unit-tests /app/coverage.out /tmp/
COPY --from=benchmark-tests /app/benchmark-results.txt /tmp/
COPY --from=integration-tests /app/integration-results.txt /tmp/
COPY --from=security-tests /app/security-report.json /tmp/

COPY . .

# Build optimized binary
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o app \
    ./cmd/main.go

# Verify binary
RUN ./app --version

# Production stage
FROM scratch AS production

# Copy CA certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy binary
COPY --from=builder /app/app /app

# Copy test artifacts metadata
COPY --from=builder /tmp/coverage.out /tmp/
COPY --from=builder /tmp/security-report.json /tmp/

EXPOSE 8080
ENTRYPOINT ["/app"]
```

---

## 4. Full-stack Testing Pipeline

### Struttura Directory
```
04-fullstack-testing/
├── Dockerfile.fullstack
├── frontend/
│   ├── package.json
│   ├── src/
│   ├── tests/
│   └── cypress/
├── backend/
│   ├── package.json
│   ├── src/
│   └── tests/
├── database/
│   ├── migrations/
│   └── seeds/
└── docker-compose.test.yml
```

### Full-stack Testing

```dockerfile
# Dockerfile.fullstack
# syntax=docker/dockerfile:1

# Frontend testing stage
FROM node:18-alpine AS frontend-tests

WORKDIR /app/frontend

# Copy frontend dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Run frontend tests
RUN npm run test:unit -- --coverage --watchAll=false
RUN npm run lint
RUN npm run type-check

# Build frontend
RUN npm run build

# Backend testing stage  
FROM node:18-alpine AS backend-tests

WORKDIR /app/backend

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ ./

# Run backend tests
RUN npm run test:unit -- --coverage
RUN npm run test:integration
RUN npm run lint
RUN npm run security:scan

# Database testing stage
FROM postgres:15-alpine AS database-tests

# Copy database migrations and seeds
COPY database/ /docker-entrypoint-initdb.d/

# Initialize test database
ENV POSTGRES_DB=testdb
ENV POSTGRES_USER=testuser  
ENV POSTGRES_PASSWORD=testpass

# E2E testing stage
FROM cypress/included:latest AS e2e-tests

WORKDIR /app

# Copy full application
COPY . .

# Install dependencies
RUN cd frontend && npm ci
RUN cd backend && npm ci

# Start services and run E2E tests
RUN cat > run-e2e.sh << 'EOF'
#!/bin/bash
set -e

# Start backend in background
cd backend && npm start &
BACKEND_PID=$!

# Start frontend in background  
cd ../frontend && npm start &
FRONTEND_PID=$!

# Wait for services to be ready
sleep 30

# Run Cypress tests
cd ../frontend && npm run test:e2e

# Cleanup
kill $BACKEND_PID $FRONTEND_PID || true
EOF

RUN chmod +x run-e2e.sh && ./run-e2e.sh

# Final integration stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy from test stages to ensure they passed
COPY --from=frontend-tests /app/frontend/dist ./frontend/dist
COPY --from=frontend-tests /app/frontend/coverage ./test-reports/frontend-coverage
COPY --from=backend-tests /app/backend/dist ./backend/dist  
COPY --from=backend-tests /app/backend/coverage ./test-reports/backend-coverage
COPY --from=e2e-tests /app/frontend/cypress/results ./test-reports/e2e-results

# Install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy production files
COPY backend/dist ./backend/dist
COPY frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["node", "backend/dist/app.js"]
```

---

## Scripts di Testing

### Script Test Completo

```bash
#!/bin/bash
# scripts/test-all.sh

set -e

echo "🧪 Starting comprehensive test suite..."

# Build test image
DOCKER_BUILDKIT=1 docker build \
  --target=test-verification \
  --tag=app:test \
  -f Dockerfile.test \
  .

echo "📊 Extracting test results..."

# Create results directory
mkdir -p test-results

# Extract test artifacts
docker run --rm -v $(pwd)/test-results:/output app:test sh -c "
  cp /tmp/coverage/* /output/ 2>/dev/null || true
  cp /tmp/test-results/* /output/ 2>/dev/null || true
  cp /tmp/security-report.json /output/ 2>/dev/null || true
"

echo "📈 Test Results Summary:"
echo "========================"

# Coverage summary
if [ -f test-results/coverage.xml ]; then
  coverage=$(grep -o 'line-rate="[^"]*"' test-results/coverage.xml | head -1 | cut -d'"' -f2)
  coverage_percent=$(echo "$coverage * 100" | bc -l)
  echo "Code Coverage: ${coverage_percent%.*}%"
fi

# Security summary
if [ -f test-results/security-report.json ]; then
  vulnerabilities=$(jq '.summary.total' test-results/security-report.json)
  echo "Security Issues: $vulnerabilities"
fi

echo "✅ All tests completed successfully!"
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Multi-stage Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Run multi-stage tests
      run: |
        DOCKER_BUILDKIT=1 docker build \
          --target=test-verification \
          --cache-from=type=gha \
          --cache-to=type=gha,mode=max \
          -f Dockerfile.test \
          .
    
    - name: Extract test results
      run: |
        docker run --rm -v ${{ github.workspace }}/test-results:/output \
          $(docker build -q --target=test-verification -f Dockerfile.test .) \
          sh -c "cp -r /tmp/test-artifacts/* /output/"
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: test-results/coverage.xml
        
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results/
```

## Best Practices per Testing

### 1. Test Isolation
```dockerfile
# ✅ Ogni stage di test è isolato
FROM dependencies AS unit-tests
# Test isolati senza dipendenze esterne

FROM dependencies AS integration-tests  
# Setup proprio ambiente di test
```

### 2. Parallel Execution
```dockerfile
# ✅ Test paralleli per velocità
RUN npm run test:unit & \
    npm run test:integration & \
    npm run lint & \
    wait
```

### 3. Quality Gates
```dockerfile
# ✅ Soglie di qualità obbligatorie
RUN coverage=$(get_coverage); \
    if [ "$coverage" -lt 80 ]; then exit 1; fi
```

## Conclusioni

Le strategie di testing multi-stage permettono di:

1. **Validazione Completa**: Test di tutti gli aspetti dell'applicazione
2. **Feedback Rapido**: Identificazione precoce dei problemi  
3. **Quality Assurance**: Soglie di qualità automatiche
4. **CI/CD Integration**: Integrazione seamless con pipeline
5. **Artifact Collection**: Raccolta centralizzata dei risultati

Questo approccio garantisce che solo codice testato e verificato raggiunga la produzione.
