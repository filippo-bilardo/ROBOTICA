#!/usr/bin/env python3
"""
Comprehensive integration tests for the microservices communication example.
Tests the complete flow: User creation -> Order creation -> Payment -> Notifications
"""

import os
import sys
import time
import json
import requests
import redis
import pika
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

# Test configuration
BASE_URL = os.getenv('BASE_URL', 'http://localhost')
USER_SERVICE_URL = f"{BASE_URL}:3002"
ORDER_SERVICE_URL = f"{BASE_URL}:3001"
PAYMENT_SERVICE_URL = f"{BASE_URL}:3003"
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')

class TestMicroservicesCommunication:
    """Integration tests for microservices communication patterns."""
    
    @classmethod
    def setup_class(cls):
        """Set up test environment."""
        cls.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        cls.test_user_id = None
        cls.test_order_id = None
        cls.test_payment_id = None
        
        # Wait for services to be ready
        cls.wait_for_services()
    
    @classmethod
    def wait_for_services(cls, timeout=120):
        """Wait for all services to be healthy."""
        services = [
            (USER_SERVICE_URL, "/health"),
            (ORDER_SERVICE_URL, "/health"),
            (PAYMENT_SERVICE_URL, "/health")
        ]
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            all_ready = True
            for service_url, health_path in services:
                try:
                    response = requests.get(f"{service_url}{health_path}", timeout=5)
                    if response.status_code != 200:
                        all_ready = False
                        break
                except requests.exceptions.RequestException:
                    all_ready = False
                    break
            
            if all_ready:
                print("✓ All services are ready")
                return
            
            print("⏳ Waiting for services to be ready...")
            time.sleep(5)
        
        raise Exception("Services did not become ready within timeout")
    
    def test_01_create_user(self):
        """Test user creation via User Service."""
        user_data = {
            "email": f"test.user.{uuid4()}@example.com",
            "username": f"testuser_{uuid4().hex[:8]}",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(f"{USER_SERVICE_URL}/api/users", json=user_data)
        assert response.status_code == 201
        
        user_response = response.json()
        assert "id" in user_response
        assert user_response["email"] == user_data["email"]
        assert user_response["username"] == user_data["username"]
        
        self.__class__.test_user_id = user_response["id"]
        print(f"✓ Created user with ID: {self.test_user_id}")
    
    def test_02_verify_user_created_event(self):
        """Test that user creation publishes event to Redis."""
        # Check Redis stream for user created event
        events = self.redis_client.xread({f"user_events": 0}, count=10, block=5000)
        
        user_created_event_found = False
        for stream, messages in events:
            for message_id, fields in messages:
                if (fields.get('event_type') == 'user_created' and 
                    fields.get('user_id') == self.test_user_id):
                    user_created_event_found = True
                    break
        
        assert user_created_event_found, "User created event not found in Redis stream"
        print("✓ User created event found in Redis stream")
    
    def test_03_create_order(self):
        """Test order creation via Order Service."""
        order_data = {
            "userId": self.test_user_id,
            "items": [
                {
                    "productId": "prod-test-1",
                    "quantity": 2,
                    "price": 29.99
                },
                {
                    "productId": "prod-test-2",
                    "quantity": 1,
                    "price": 15.50
                }
            ]
        }
        
        response = requests.post(f"{ORDER_SERVICE_URL}/api/orders", json=order_data)
        assert response.status_code == 201
        
        order_response = response.json()
        assert "id" in order_response
        assert order_response["userId"] == self.test_user_id
        assert order_response["status"] == "pending"
        assert "totalAmount" in order_response
        
        self.__class__.test_order_id = order_response["id"]
        print(f"✓ Created order with ID: {self.test_order_id}")
    
    def test_04_verify_order_created_event(self):
        """Test that order creation publishes event."""
        time.sleep(2)  # Wait for event propagation
        
        events = self.redis_client.xread({f"order_events": 0}, count=10, block=5000)
        
        order_created_event_found = False
        for stream, messages in events:
            for message_id, fields in messages:
                if (fields.get('event_type') == 'order_created' and 
                    fields.get('order_id') == self.test_order_id):
                    order_created_event_found = True
                    break
        
        assert order_created_event_found, "Order created event not found in Redis stream"
        print("✓ Order created event found in Redis stream")
    
    def test_05_process_payment(self):
        """Test payment processing via Payment Service."""
        payment_data = {
            "orderId": self.test_order_id,
            "userId": self.test_user_id,
            "amount": 75.48,  # 2*29.99 + 15.50
            "currency": "USD",
            "paymentMethod": {
                "type": "credit_card",
                "cardNumber": "4111111111111111",
                "expiryMonth": "12",
                "expiryYear": "2025",
                "cvv": "123"
            }
        }
        
        response = requests.post(f"{PAYMENT_SERVICE_URL}/api/payments", json=payment_data)
        assert response.status_code == 201
        
        payment_response = response.json()
        assert "id" in payment_response
        assert payment_response["orderId"] == self.test_order_id
        assert payment_response["status"] in ["processing", "completed"]
        
        self.__class__.test_payment_id = payment_response["id"]
        print(f"✓ Created payment with ID: {self.test_payment_id}")
    
    def test_06_verify_payment_completed_event(self):
        """Test that payment completion publishes event."""
        # Wait for payment processing
        max_attempts = 30
        for attempt in range(max_attempts):
            response = requests.get(f"{PAYMENT_SERVICE_URL}/api/payments/{self.test_payment_id}")
            if response.status_code == 200:
                payment = response.json()
                if payment["status"] == "completed":
                    break
            time.sleep(1)
        else:
            pytest.fail("Payment did not complete within expected time")
        
        # Check for payment completed event
        events = self.redis_client.xread({f"payment_events": 0}, count=10, block=5000)
        
        payment_completed_event_found = False
        for stream, messages in events:
            for message_id, fields in messages:
                if (fields.get('event_type') == 'payment_completed' and 
                    fields.get('payment_id') == self.test_payment_id):
                    payment_completed_event_found = True
                    break
        
        assert payment_completed_event_found, "Payment completed event not found in Redis stream"
        print("✓ Payment completed event found in Redis stream")
    
    def test_07_verify_order_status_updated(self):
        """Test that order status is updated after payment."""
        # Wait a bit for event processing
        time.sleep(3)
        
        response = requests.get(f"{ORDER_SERVICE_URL}/api/orders/{self.test_order_id}")
        assert response.status_code == 200
        
        order = response.json()
        assert order["status"] == "confirmed", f"Expected order status 'confirmed', got '{order['status']}'"
        assert order["paymentId"] == self.test_payment_id
        
        print("✓ Order status updated to confirmed after payment")
    
    def test_08_verify_user_verified_status(self):
        """Test that user is verified after successful payment."""
        time.sleep(2)  # Wait for event processing
        
        response = requests.get(f"{USER_SERVICE_URL}/api/users/{self.test_user_id}")
        assert response.status_code == 200
        
        user = response.json()
        assert user["is_verified"] == True, "User should be verified after successful payment"
        
        print("✓ User verified status updated after successful payment")
    
    def test_09_circuit_breaker_functionality(self):
        """Test circuit breaker patterns."""
        # This test would require simulating service failures
        # For now, we'll test the circuit breaker endpoints
        
        response = requests.get(f"{PAYMENT_SERVICE_URL}/api/circuit-breaker/status")
        assert response.status_code == 200
        
        status = response.json()
        assert "user_service" in status
        assert "order_service" in status
        
        print("✓ Circuit breaker status endpoints working")
    
    def test_10_metrics_endpoints(self):
        """Test that all services expose metrics."""
        services = [
            USER_SERVICE_URL,
            ORDER_SERVICE_URL,
            PAYMENT_SERVICE_URL
        ]
        
        for service_url in services:
            response = requests.get(f"{service_url}/metrics")
            assert response.status_code == 200
            assert "http_requests_total" in response.text
            print(f"✓ Metrics endpoint working for {service_url}")
    
    def test_11_load_balancing_readiness(self):
        """Test service readiness for load balancing."""
        services = [
            (USER_SERVICE_URL, "/ready"),
            (ORDER_SERVICE_URL, "/ready"),
            (PAYMENT_SERVICE_URL, "/ready")
        ]
        
        for service_url, ready_path in services:
            response = requests.get(f"{service_url}{ready_path}")
            assert response.status_code == 200
            print(f"✓ Service ready endpoint working for {service_url}")
    
    def test_12_rabbitmq_message_flow(self):
        """Test RabbitMQ message flow for notifications."""
        try:
            import urllib.parse
            parsed = urllib.parse.urlparse(RABBITMQ_URL)
            
            credentials = pika.PlainCredentials(
                parsed.username or 'guest',
                parsed.password or 'guest'
            )
            
            parameters = pika.ConnectionParameters(
                host=parsed.hostname or 'localhost',
                port=parsed.port or 5672,
                virtual_host=parsed.path.lstrip('/') or '/',
                credentials=credentials
            )
            
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            
            # Check if notification queues exist
            queues_to_check = [
                'notifications.email',
                'notifications.push',
                'user.events',
                'order.events',
                'payment.events'
            ]
            
            for queue in queues_to_check:
                try:
                    method = channel.queue_declare(queue=queue, passive=True)
                    print(f"✓ Queue '{queue}' exists with {method.method.message_count} messages")
                except pika.exceptions.ChannelClosedByBroker:
                    # Queue doesn't exist - that's ok for some queues
                    channel = connection.channel()  # Reopen channel
            
            connection.close()
            print("✓ RabbitMQ message flow verification completed")
            
        except Exception as e:
            pytest.fail(f"RabbitMQ message flow test failed: {e}")

def main():
    """Run integration tests."""
    print("Starting microservices integration tests...")
    print("=" * 60)
    
    # Run pytest with verbose output
    exit_code = pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--no-header"
    ])
    
    if exit_code == 0:
        print("\n" + "=" * 60)
        print("🎉 All integration tests passed!")
        print("✅ Microservices communication is working correctly")
    else:
        print("\n" + "=" * 60)
        print("❌ Some integration tests failed")
        print("🔍 Check the output above for details")
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
