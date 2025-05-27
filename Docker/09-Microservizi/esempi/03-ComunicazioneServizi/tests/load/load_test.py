#!/usr/bin/env python3
"""
Load testing script for microservices communication example.
Simulates realistic traffic patterns and measures performance.
"""

import os
import sys
import time
import json
import asyncio
import aiohttp
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from uuid import uuid4
import statistics

# Load test configuration
BASE_URL = os.getenv('BASE_URL', 'http://localhost')
USER_SERVICE_URL = f"{BASE_URL}:3002"
ORDER_SERVICE_URL = f"{BASE_URL}:3001"
PAYMENT_SERVICE_URL = f"{BASE_URL}:3003"

class LoadTestMetrics:
    """Collect and report load test metrics."""
    
    def __init__(self):
        self.requests = []
        self.errors = []
        self.start_time = None
        self.end_time = None
    
    def add_request(self, endpoint, duration, status_code, error=None):
        """Add a request result to metrics."""
        self.requests.append({
            'endpoint': endpoint,
            'duration': duration,
            'status_code': status_code,
            'timestamp': time.time(),
            'error': error
        })
        
        if error:
            self.errors.append({
                'endpoint': endpoint,
                'error': str(error),
                'timestamp': time.time()
            })
    
    def get_report(self):
        """Generate performance report."""
        if not self.requests:
            return "No requests completed"
        
        durations = [r['duration'] for r in self.requests]
        successful_requests = [r for r in self.requests if 200 <= r['status_code'] < 400]
        
        total_duration = self.end_time - self.start_time if self.start_time and self.end_time else 0
        
        report = f"""
Load Test Report
================
Test Duration: {total_duration:.2f} seconds
Total Requests: {len(self.requests)}
Successful Requests: {len(successful_requests)}
Failed Requests: {len(self.errors)}
Success Rate: {len(successful_requests) / len(self.requests) * 100:.2f}%

Response Times:
- Average: {statistics.mean(durations):.3f}s
- Median: {statistics.median(durations):.3f}s
- 95th Percentile: {statistics.quantiles(durations, n=20)[18]:.3f}s
- Min: {min(durations):.3f}s
- Max: {max(durations):.3f}s

Throughput: {len(self.requests) / total_duration:.2f} requests/second

Errors by Endpoint:
"""
        
        # Group errors by endpoint
        error_by_endpoint = {}
        for error in self.errors:
            endpoint = error['endpoint']
            if endpoint not in error_by_endpoint:
                error_by_endpoint[endpoint] = []
            error_by_endpoint[endpoint].append(error['error'])
        
        for endpoint, errors in error_by_endpoint.items():
            report += f"- {endpoint}: {len(errors)} errors\n"
        
        return report

class MicroservicesLoadTester:
    """Load tester for microservices communication patterns."""
    
    def __init__(self, concurrent_users=10, test_duration=60):
        self.concurrent_users = concurrent_users
        self.test_duration = test_duration
        self.metrics = LoadTestMetrics()
        self.session = None
    
    async def create_session(self):
        """Create aiohttp session with proper configuration."""
        timeout = aiohttp.ClientTimeout(total=30)
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=20)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector
        )
    
    async def close_session(self):
        """Close aiohttp session."""
        if self.session:
            await self.session.close()
    
    async def create_user(self):
        """Create a test user."""
        user_data = {
            "email": f"load.test.{uuid4()}@example.com",
            "username": f"loadtest_{uuid4().hex[:8]}",
            "password": "loadtest123",
            "first_name": "Load",
            "last_name": "Test"
        }
        
        start_time = time.time()
        try:
            async with self.session.post(
                f"{USER_SERVICE_URL}/api/users",
                json=user_data
            ) as response:
                duration = time.time() - start_time
                result = await response.json() if response.content_type == 'application/json' else {}
                self.metrics.add_request('create_user', duration, response.status)
                
                if response.status == 201:
                    return result.get('id')
                else:
                    return None
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.add_request('create_user', duration, 0, error=e)
            return None
    
    async def create_order(self, user_id):
        """Create an order for a user."""
        order_data = {
            "userId": user_id,
            "items": [
                {
                    "productId": f"load-test-{uuid4().hex[:8]}",
                    "quantity": 2,
                    "price": 29.99
                }
            ]
        }
        
        start_time = time.time()
        try:
            async with self.session.post(
                f"{ORDER_SERVICE_URL}/api/orders",
                json=order_data
            ) as response:
                duration = time.time() - start_time
                result = await response.json() if response.content_type == 'application/json' else {}
                self.metrics.add_request('create_order', duration, response.status)
                
                if response.status == 201:
                    return result.get('id')
                else:
                    return None
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.add_request('create_order', duration, 0, error=e)
            return None
    
    async def process_payment(self, order_id, user_id):
        """Process payment for an order."""
        payment_data = {
            "orderId": order_id,
            "userId": user_id,
            "amount": 59.98,
            "currency": "USD",
            "paymentMethod": {
                "type": "credit_card",
                "cardNumber": "4111111111111111",
                "expiryMonth": "12",
                "expiryYear": "2025",
                "cvv": "123"
            }
        }
        
        start_time = time.time()
        try:
            async with self.session.post(
                f"{PAYMENT_SERVICE_URL}/api/payments",
                json=payment_data
            ) as response:
                duration = time.time() - start_time
                result = await response.json() if response.content_type == 'application/json' else {}
                self.metrics.add_request('process_payment', duration, response.status)
                
                if response.status == 201:
                    return result.get('id')
                else:
                    return None
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.add_request('process_payment', duration, 0, error=e)
            return None
    
    async def get_user(self, user_id):
        """Get user details."""
        start_time = time.time()
        try:
            async with self.session.get(
                f"{USER_SERVICE_URL}/api/users/{user_id}"
            ) as response:
                duration = time.time() - start_time
                self.metrics.add_request('get_user', duration, response.status)
                return response.status == 200
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.add_request('get_user', duration, 0, error=e)
            return False
    
    async def get_order(self, order_id):
        """Get order details."""
        start_time = time.time()
        try:
            async with self.session.get(
                f"{ORDER_SERVICE_URL}/api/orders/{order_id}"
            ) as response:
                duration = time.time() - start_time
                self.metrics.add_request('get_order', duration, response.status)
                return response.status == 200
        except Exception as e:
            duration = time.time() - start_time
            self.metrics.add_request('get_order', duration, 0, error=e)
            return False
    
    async def health_check_all_services(self):
        """Check health of all services."""
        services = [
            (USER_SERVICE_URL, 'user_service_health'),
            (ORDER_SERVICE_URL, 'order_service_health'),
            (PAYMENT_SERVICE_URL, 'payment_service_health')
        ]
        
        for service_url, metric_name in services:
            start_time = time.time()
            try:
                async with self.session.get(f"{service_url}/health") as response:
                    duration = time.time() - start_time
                    self.metrics.add_request(metric_name, duration, response.status)
            except Exception as e:
                duration = time.time() - start_time
                self.metrics.add_request(metric_name, duration, 0, error=e)
    
    async def user_journey_scenario(self):
        """Simulate a complete user journey."""
        # Create user
        user_id = await self.create_user()
        if not user_id:
            return
        
        # Small delay to simulate user thinking
        await asyncio.sleep(0.5)
        
        # Create order
        order_id = await self.create_order(user_id)
        if not order_id:
            return
        
        # Small delay
        await asyncio.sleep(0.3)
        
        # Process payment
        payment_id = await self.process_payment(order_id, user_id)
        if not payment_id:
            return
        
        # Check results
        await asyncio.sleep(1)  # Wait for async processing
        await self.get_user(user_id)
        await self.get_order(order_id)
    
    async def mixed_load_scenario(self):
        """Simulate mixed read/write operations."""
        # 70% reads, 30% writes pattern
        import random
        
        if random.random() < 0.7:
            # Read operations
            await self.health_check_all_services()
        else:
            # Write operations (user journey)
            await self.user_journey_scenario()
    
    async def run_user_simulation(self, user_id, scenario_func):
        """Run simulation for a single virtual user."""
        end_time = time.time() + self.test_duration
        
        while time.time() < end_time:
            await scenario_func()
            # Random delay between 1-3 seconds
            await asyncio.sleep(1 + (time.time() % 2))
    
    async def run_load_test(self, scenario='mixed'):
        """Run the load test with specified scenario."""
        print(f"Starting load test with {self.concurrent_users} concurrent users for {self.test_duration} seconds")
        print(f"Scenario: {scenario}")
        print("=" * 60)
        
        await self.create_session()
        
        # Choose scenario function
        scenario_func = {
            'user_journey': self.user_journey_scenario,
            'mixed': self.mixed_load_scenario,
            'health_check': self.health_check_all_services
        }.get(scenario, self.mixed_load_scenario)
        
        self.metrics.start_time = time.time()
        
        # Create tasks for concurrent users
        tasks = []
        for user_id in range(self.concurrent_users):
            task = asyncio.create_task(
                self.run_user_simulation(user_id, scenario_func)
            )
            tasks.append(task)
        
        # Wait for all tasks to complete
        await asyncio.gather(*tasks, return_exceptions=True)
        
        self.metrics.end_time = time.time()
        
        await self.close_session()
        
        # Print results
        print("\n" + "=" * 60)
        print(self.metrics.get_report())

def main():
    """Main function for load testing."""
    parser = argparse.ArgumentParser(description='Load test microservices communication')
    parser.add_argument('--users', type=int, default=10, help='Number of concurrent users')
    parser.add_argument('--duration', type=int, default=60, help='Test duration in seconds')
    parser.add_argument('--scenario', choices=['user_journey', 'mixed', 'health_check'], 
                       default='mixed', help='Test scenario to run')
    
    args = parser.parse_args()
    
    # Create and run load tester
    load_tester = MicroservicesLoadTester(
        concurrent_users=args.users,
        test_duration=args.duration
    )
    
    try:
        asyncio.run(load_tester.run_load_test(args.scenario))
        print("\n🎉 Load test completed successfully!")
        return 0
    except KeyboardInterrupt:
        print("\n⏹️  Load test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Load test failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
