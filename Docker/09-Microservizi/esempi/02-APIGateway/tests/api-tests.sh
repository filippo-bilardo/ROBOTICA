#!/bin/bash

echo "🧪 Testing API Gateway endpoints..."

# Configuration
API_BASE_URL=${API_BASE_URL:-"http://localhost:8000"}
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    
    echo -n "Testing $method $endpoint... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            --max-time $TIMEOUT \
            "$API_BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method \
            --max-time $TIMEOUT \
            "$API_BASE_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $status_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        return 1
    fi
}

# Wait for API Gateway to be ready
echo "⏳ Waiting for API Gateway to be ready..."
until curl -f --max-time 5 $API_BASE_URL/health > /dev/null 2>&1; do
    echo "Waiting..."
    sleep 2
done

echo -e "${GREEN}✅ API Gateway is ready!${NC}"
echo ""

# Test results counter
PASSED=0
FAILED=0

# Health checks
echo "🏥 Health Check Tests"
test_endpoint "GET" "/health" "200" && ((PASSED++)) || ((FAILED++))
echo ""

# User Service Tests
echo "👤 User Service Tests"
test_endpoint "GET" "/users" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/users/1" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/users/999" "404" && ((PASSED++)) || ((FAILED++))
test_endpoint "POST" "/users" "201" '{"name":"Test User","email":"test@example.com"}' && ((PASSED++)) || ((FAILED++))
test_endpoint "POST" "/users" "400" '{"name":"Test User"}' && ((PASSED++)) || ((FAILED++))
echo ""

# Product Service Tests
echo "🛍️ Product Service Tests"
test_endpoint "GET" "/products" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/products/1" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/products/999" "404" && ((PASSED++)) || ((FAILED++))
test_endpoint "POST" "/products" "201" '{"name":"Test Product","price":99.99,"category":"test"}' && ((PASSED++)) || ((FAILED++))
echo ""

# Order Service Tests
echo "📦 Order Service Tests"
test_endpoint "GET" "/orders" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/orders/1" "200" && ((PASSED++)) || ((FAILED++))
test_endpoint "GET" "/orders/999" "404" && ((PASSED++)) || ((FAILED++))
test_endpoint "POST" "/orders" "201" '{"userId":1,"productId":1,"quantity":2}' && ((PASSED++)) || ((FAILED++))
echo ""

# Rate Limiting Tests (Kong specific)
if [[ $API_BASE_URL == *":8000"* ]]; then
    echo "🛡️ Rate Limiting Tests (Kong)"
    echo "Testing rate limiting (this may take a moment)..."
    
    # Send multiple requests quickly
    for i in {1..10}; do
        curl -s "$API_BASE_URL/users" > /dev/null
    done
    
    # This should still work (within rate limit)
    test_endpoint "GET" "/users" "200" && ((PASSED++)) || ((FAILED++))
    echo ""
fi

# Summary
echo "📊 Test Summary"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}😞 Some tests failed.${NC}"
    exit 1
fi
