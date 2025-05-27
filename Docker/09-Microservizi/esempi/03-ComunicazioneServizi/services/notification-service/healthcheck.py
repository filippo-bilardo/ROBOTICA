#!/usr/bin/env python3
"""
Health check script for notification service.
This script verifies the notification worker is running properly.
"""

import sys
import os
import time
import json
import redis
import pika
from datetime import datetime

def check_redis_connection():
    """Check Redis connection for event bus."""
    try:
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        r = redis.from_url(redis_url, decode_responses=True)
        
        # Test basic connectivity
        r.ping()
        
        # Test stream operations (used for events)
        test_key = f"healthcheck:{int(time.time())}"
        r.xadd(test_key, {"status": "test"})
        r.delete(test_key)
        
        print("✓ Redis connection healthy")
        return True
    except Exception as e:
        print(f"✗ Redis connection failed: {e}")
        return False

def check_rabbitmq_connection():
    """Check RabbitMQ connection for message queuing."""
    try:
        rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')
        
        # Parse URL to get connection parameters
        import urllib.parse
        parsed = urllib.parse.urlparse(rabbitmq_url)
        
        credentials = pika.PlainCredentials(
            parsed.username or 'guest',
            parsed.password or 'guest'
        )
        
        parameters = pika.ConnectionParameters(
            host=parsed.hostname or 'localhost',
            port=parsed.port or 5672,
            virtual_host=parsed.path.lstrip('/') or '/',
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        # Test queue operations
        test_queue = f"healthcheck_{int(time.time())}"
        channel.queue_declare(queue=test_queue, durable=False, auto_delete=True)
        channel.queue_delete(queue=test_queue)
        
        connection.close()
        print("✓ RabbitMQ connection healthy")
        return True
    except Exception as e:
        print(f"✗ RabbitMQ connection failed: {e}")
        return False

def check_notification_templates():
    """Check if notification templates exist and are readable."""
    try:
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        
        if not os.path.exists(template_dir):
            print(f"✗ Template directory not found: {template_dir}")
            return False
        
        required_templates = [
            'user_created.html',
            'user_verified.html',
            'order_created.html',
            'payment_completed.html',
            'payment_failed.html'
        ]
        
        missing_templates = []
        for template in required_templates:
            template_path = os.path.join(template_dir, template)
            if not os.path.exists(template_path):
                missing_templates.append(template)
        
        if missing_templates:
            print(f"✗ Missing templates: {', '.join(missing_templates)}")
            return False
        
        print("✓ All notification templates found")
        return True
    except Exception as e:
        print(f"✗ Template check failed: {e}")
        return False

def check_environment_variables():
    """Check required environment variables."""
    required_vars = [
        'RABBITMQ_URL',
        'SMTP_HOST',
        'SMTP_PORT'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"✗ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✓ All required environment variables set")
    return True

def check_metrics_endpoint():
    """Check if metrics endpoint is accessible."""
    try:
        import requests
        metrics_port = os.getenv('METRICS_PORT', '8000')
        response = requests.get(f'http://localhost:{metrics_port}/metrics', timeout=5)
        
        if response.status_code == 200:
            print("✓ Metrics endpoint healthy")
            return True
        else:
            print(f"✗ Metrics endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Metrics endpoint check failed: {e}")
        return False

def main():
    """Run all health checks."""
    print(f"Starting notification service health check at {datetime.now()}")
    print("=" * 50)
    
    checks = [
        check_environment_variables,
        check_redis_connection,
        check_rabbitmq_connection,
        check_notification_templates,
        check_metrics_endpoint
    ]
    
    all_passed = True
    for check in checks:
        try:
            if not check():
                all_passed = False
        except Exception as e:
            print(f"✗ Health check failed with exception: {e}")
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("✅ All health checks passed - Notification service is healthy")
        sys.exit(0)
    else:
        print("❌ Some health checks failed - Notification service is unhealthy")
        sys.exit(1)

if __name__ == "__main__":
    main()
