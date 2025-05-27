import asyncio
import json
import logging
import os
import signal
import sys
import time
from datetime import datetime
from typing import Dict, Any
import threading

import pika
import redis
from jinja2 import Environment, FileSystemLoader
from prometheus_client import Counter, Histogram, start_http_server

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Metrics
notifications_sent = Counter('notifications_sent_total', 'Total notifications sent', ['type', 'channel'])
notification_processing_time = Histogram('notification_processing_seconds', 'Time spent processing notifications')
events_processed = Counter('events_processed_total', 'Total events processed', ['event_type'])

class NotificationService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379/2")
        self.rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
        self.smtp_server = os.getenv("SMTP_SERVER", "mailhog")
        self.smtp_port = int(os.getenv("SMTP_PORT", "1025"))
        self.from_email = os.getenv("FROM_EMAIL", "noreply@microservices.local")
        
        self.redis_client = None
        self.rabbitmq_connection = None
        self.rabbitmq_channel = None
        self.template_env = None
        self.running = True
        
        # User cache for demo purposes
        self.user_cache = {}
        
        logger.info("🔔 Notification Service initialized")

    def setup_redis(self):
        """Setup Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url)
            self.redis_client.ping()
            logger.info("✅ Connected to Redis")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise

    def setup_rabbitmq(self):
        """Setup RabbitMQ connection and consumers"""
        try:
            self.rabbitmq_connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.rabbitmq_channel = self.rabbitmq_connection.channel()
            
            # Declare exchange and queues
            self.rabbitmq_channel.exchange_declare(
                exchange='notifications',
                exchange_type='topic',
                durable=True
            )
            
            # Queue for user events
            self.rabbitmq_channel.queue_declare(
                queue='notifications.users',
                durable=True
            )
            self.rabbitmq_channel.queue_bind(
                exchange='users',
                queue='notifications.users',
                routing_key='user.*'
            )
            
            # Queue for order events
            self.rabbitmq_channel.queue_declare(
                queue='notifications.orders',
                durable=True
            )
            self.rabbitmq_channel.queue_bind(
                exchange='orders',
                queue='notifications.orders',
                routing_key='order.*'
            )
            
            # Queue for payment events
            self.rabbitmq_channel.queue_declare(
                queue='notifications.payments',
                durable=True
            )
            self.rabbitmq_channel.queue_bind(
                exchange='payments',
                queue='notifications.payments',
                routing_key='payment.*'
            )
            
            logger.info("✅ Connected to RabbitMQ")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    def setup_templates(self):
        """Setup Jinja2 templates"""
        try:
            template_dir = os.path.join(os.path.dirname(__file__), 'templates')
            if not os.path.exists(template_dir):
                os.makedirs(template_dir)
                self.create_default_templates(template_dir)
            
            self.template_env = Environment(loader=FileSystemLoader(template_dir))
            logger.info("✅ Templates loaded")
            
        except Exception as e:
            logger.error(f"❌ Failed to setup templates: {e}")
            raise

    def create_default_templates(self, template_dir):
        """Create default email templates"""
        templates = {
            'order_created.html': '''
            <h2>Order Confirmation</h2>
            <p>Dear {{ user_name }},</p>
            <p>Your order <strong>{{ order_id }}</strong> has been created successfully!</p>
            <p><strong>Order Details:</strong></p>
            <ul>
                <li>Order ID: {{ order_id }}</li>
                <li>Total Amount: ${{ total }}</li>
                <li>Items: {{ item_count }} items</li>
            </ul>
            <p>We'll notify you when your order is processed.</p>
            <p>Thank you for your business!</p>
            ''',
            
            'payment_completed.html': '''
            <h2>Payment Confirmation</h2>
            <p>Dear {{ user_name }},</p>
            <p>Your payment for order <strong>{{ order_id }}</strong> has been processed successfully!</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
                <li>Payment ID: {{ payment_id }}</li>
                <li>Amount: ${{ amount }}</li>
                <li>Method: {{ method }}</li>
                <li>Status: {{ status }}</li>
            </ul>
            <p>Your order will be shipped soon.</p>
            ''',
            
            'payment_failed.html': '''
            <h2>Payment Failed</h2>
            <p>Dear {{ user_name }},</p>
            <p>Unfortunately, we were unable to process your payment for order <strong>{{ order_id }}</strong>.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Reason: {{ reason }}</li>
                <li>Amount: ${{ amount }}</li>
                <li>Attempted Method: {{ method }}</li>
            </ul>
            <p>Please try again or contact support.</p>
            ''',
            
            'user_verified.html': '''
            <h2>Account Verified</h2>
            <p>Dear {{ user_name }},</p>
            <p>Your account has been successfully verified!</p>
            <p>You now have access to all features of our platform.</p>
            <p>Welcome aboard!</p>
            '''
        }
        
        for filename, content in templates.items():
            with open(os.path.join(template_dir, filename), 'w') as f:
                f.write(content.strip())

    def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """Get user information from cache or user service"""
        # Check cache first
        if user_id in self.user_cache:
            return self.user_cache[user_id]
        
        # In a real implementation, you would call the user service
        # For demo purposes, we'll create mock user data
        user_info = {
            'id': user_id,
            'name': f'User {user_id}',
            'email': f'user{user_id}@example.com'
        }
        
        # Cache the user info
        self.user_cache[user_id] = user_info
        return user_info

    def send_email_notification(self, to_email: str, subject: str, template_name: str, context: Dict[str, Any]):
        """Send email notification using template"""
        try:
            with notification_processing_time.time():
                # Render template
                template = self.template_env.get_template(template_name)
                html_content = template.render(**context)
                
                # For demo purposes, we'll just log the email
                # In production, you would use SMTP or an email service
                logger.info(f"📧 Sending email to {to_email}")
                logger.info(f"📧 Subject: {subject}")
                logger.info(f"📧 Content preview: {html_content[:100]}...")
                
                # Store notification in Redis for audit
                notification_record = {
                    'to_email': to_email,
                    'subject': subject,
                    'template': template_name,
                    'context': context,
                    'sent_at': datetime.utcnow().isoformat(),
                    'status': 'sent'
                }
                
                self.redis_client.lpush(
                    'notifications:sent',
                    json.dumps(notification_record)
                )
                
                # Trim list to keep only last 1000 notifications
                self.redis_client.ltrim('notifications:sent', 0, 999)
                
                notifications_sent.labels(type='email', channel='smtp').inc()
                logger.info(f"✅ Email sent successfully to {to_email}")
                
        except Exception as e:
            logger.error(f"❌ Failed to send email to {to_email}: {e}")
            notifications_sent.labels(type='email', channel='error').inc()

    def send_push_notification(self, user_id: str, title: str, message: str, data: Dict[str, Any] = None):
        """Send push notification (simulated)"""
        try:
            with notification_processing_time.time():
                # For demo purposes, we'll store in Redis
                notification = {
                    'user_id': user_id,
                    'title': title,
                    'message': message,
                    'data': data or {},
                    'sent_at': datetime.utcnow().isoformat(),
                    'type': 'push'
                }
                
                # Store in user-specific push notifications list
                self.redis_client.lpush(
                    f'notifications:push:{user_id}',
                    json.dumps(notification)
                )
                
                # Trim to keep only last 50 notifications per user
                self.redis_client.ltrim(f'notifications:push:{user_id}', 0, 49)
                
                notifications_sent.labels(type='push', channel='mobile').inc()
                logger.info(f"📱 Push notification sent to user {user_id}: {title}")
                
        except Exception as e:
            logger.error(f"❌ Failed to send push notification to user {user_id}: {e}")
            notifications_sent.labels(type='push', channel='error').inc()

    def process_order_created(self, event_data: Dict[str, Any]):
        """Process order created event"""
        try:
            order_id = event_data.get('order_id')
            user_id = str(event_data.get('user_id', ''))
            total = event_data.get('total', 0)
            items = event_data.get('items', [])
            
            user_info = self.get_user_info(user_id)
            
            # Email notification
            context = {
                'user_name': user_info['name'],
                'order_id': order_id,
                'total': total,
                'item_count': len(items)
            }
            
            self.send_email_notification(
                to_email=user_info['email'],
                subject=f'Order Confirmation - {order_id}',
                template_name='order_created.html',
                context=context
            )
            
            # Push notification
            self.send_push_notification(
                user_id=user_id,
                title='Order Confirmed',
                message=f'Your order {order_id} has been confirmed!',
                data={'order_id': order_id, 'total': total}
            )
            
            events_processed.labels(event_type='order.created').inc()
            
        except Exception as e:
            logger.error(f"❌ Error processing order created event: {e}")

    def process_payment_completed(self, event_data: Dict[str, Any]):
        """Process payment completed event"""
        try:
            payment_id = event_data.get('payment_id')
            order_id = event_data.get('order_id')
            user_id = str(event_data.get('user_id', ''))
            amount = event_data.get('amount', 0)
            method = event_data.get('method', 'Unknown')
            
            user_info = self.get_user_info(user_id)
            
            # Email notification
            context = {
                'user_name': user_info['name'],
                'payment_id': payment_id,
                'order_id': order_id,
                'amount': amount,
                'method': method,
                'status': 'Completed'
            }
            
            self.send_email_notification(
                to_email=user_info['email'],
                subject=f'Payment Confirmation - Order {order_id}',
                template_name='payment_completed.html',
                context=context
            )
            
            # Push notification
            self.send_push_notification(
                user_id=user_id,
                title='Payment Successful',
                message=f'Payment of ${amount} processed successfully!',
                data={'payment_id': payment_id, 'order_id': order_id}
            )
            
            events_processed.labels(event_type='payment.completed').inc()
            
        except Exception as e:
            logger.error(f"❌ Error processing payment completed event: {e}")

    def process_payment_failed(self, event_data: Dict[str, Any]):
        """Process payment failed event"""
        try:
            payment_id = event_data.get('payment_id')
            order_id = event_data.get('order_id')
            user_id = str(event_data.get('user_id', ''))
            amount = event_data.get('amount', 0)
            method = event_data.get('method', 'Unknown')
            reason = event_data.get('reason', 'Unknown error')
            
            user_info = self.get_user_info(user_id)
            
            # Email notification
            context = {
                'user_name': user_info['name'],
                'order_id': order_id,
                'amount': amount,
                'method': method,
                'reason': reason
            }
            
            self.send_email_notification(
                to_email=user_info['email'],
                subject=f'Payment Failed - Order {order_id}',
                template_name='payment_failed.html',
                context=context
            )
            
            # Push notification
            self.send_push_notification(
                user_id=user_id,
                title='Payment Failed',
                message=f'Payment for order {order_id} failed. Please try again.',
                data={'order_id': order_id, 'reason': reason}
            )
            
            events_processed.labels(event_type='payment.failed').inc()
            
        except Exception as e:
            logger.error(f"❌ Error processing payment failed event: {e}")

    def process_user_verified(self, event_data: Dict[str, Any]):
        """Process user verified event"""
        try:
            user_id = str(event_data.get('user_id', ''))
            verification_method = event_data.get('verification_method', 'Unknown')
            
            user_info = self.get_user_info(user_id)
            
            # Email notification
            context = {
                'user_name': user_info['name'],
                'verification_method': verification_method
            }
            
            self.send_email_notification(
                to_email=user_info['email'],
                subject='Account Verified Successfully',
                template_name='user_verified.html',
                context=context
            )
            
            # Push notification
            self.send_push_notification(
                user_id=user_id,
                title='Account Verified',
                message='Your account has been verified successfully!',
                data={'verification_method': verification_method}
            )
            
            events_processed.labels(event_type='user.verified').inc()
            
        except Exception as e:
            logger.error(f"❌ Error processing user verified event: {e}")

    def process_rabbitmq_message(self, ch, method, properties, body):
        """Process message from RabbitMQ"""
        try:
            event = json.loads(body.decode('utf-8'))
            event_type = event.get('type')
            data = event.get('data', {})
            
            # Add user_id to data if available in event
            if 'user_id' in event:
                data['user_id'] = event['user_id']
            if 'order_id' in event:
                data['order_id'] = event['order_id']
            if 'payment_id' in event:
                data['payment_id'] = event['payment_id']
            
            logger.info(f"📨 Processing RabbitMQ event: {event_type}")
            
            if event_type == 'order.created':
                self.process_order_created(data)
            elif event_type == 'payment.completed':
                self.process_payment_completed(data)
            elif event_type == 'payment.failed':
                self.process_payment_failed(data)
            elif event_type == 'user.verified':
                self.process_user_verified(data)
            else:
                logger.warning(f"⚠️ Unknown event type: {event_type}")
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error(f"❌ Error processing RabbitMQ message: {e}")
            # Reject and don't requeue to avoid infinite loop
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def process_redis_stream(self):
        """Process events from Redis streams"""
        consumer_group = 'notification-service'
        consumer_name = 'notification-worker'
        stream_name = 'events'
        
        try:
            # Create consumer group
            try:
                self.redis_client.xgroup_create(stream_name, consumer_group, id='0', mkstream=True)
            except redis.ResponseError as e:
                if "BUSYGROUP" not in str(e):
                    raise e
            
            logger.info(f"📥 Starting Redis stream consumer: {consumer_group}")
            
            while self.running:
                try:
                    # Read from stream
                    result = self.redis_client.xreadgroup(
                        consumer_group, consumer_name,
                        {stream_name: '>'},
                        count=10, block=1000
                    )
                    
                    for stream, messages in result:
                        for message_id, fields in messages:
                            self.process_redis_event(message_id, fields)
                            # Acknowledge message
                            self.redis_client.xack(stream_name, consumer_group, message_id)
                            
                except redis.ResponseError as e:
                    if self.running:
                        logger.error(f"❌ Redis stream error: {e}")
                        time.sleep(5)
                except Exception as e:
                    if self.running:
                        logger.error(f"❌ Error consuming from Redis stream: {e}")
                        time.sleep(5)
                        
        except Exception as e:
            logger.error(f"❌ Failed to setup Redis stream consumer: {e}")

    def process_redis_event(self, message_id: str, fields: dict):
        """Process individual Redis stream event"""
        try:
            event_type = fields.get(b'type', b'').decode()
            service = fields.get(b'service', b'').decode()
            user_id = fields.get(b'user_id', b'').decode()
            order_id = fields.get(b'order_id', b'').decode()
            payment_id = fields.get(b'payment_id', b'').decode()
            data_str = fields.get(b'data', b'{}').decode()
            
            # Skip our own events
            if service == 'notification-service':
                return
            
            logger.info(f"📨 Processing Redis event: {event_type} from {service}")
            
            # Parse data
            try:
                data = json.loads(data_str)
            except:
                data = {}
            
            # Add IDs to data
            if user_id:
                data['user_id'] = user_id
            if order_id:
                data['order_id'] = order_id
            if payment_id:
                data['payment_id'] = payment_id
            
            # Process event
            if event_type == 'order.created':
                self.process_order_created(data)
            elif event_type == 'payment.completed':
                self.process_payment_completed(data)
            elif event_type == 'payment.failed':
                self.process_payment_failed(data)
            elif event_type == 'user.verified':
                self.process_user_verified(data)
            else:
                logger.debug(f"🔍 Ignoring event type: {event_type}")
                
        except Exception as e:
            logger.error(f"❌ Error processing Redis event {message_id}: {e}")

    def consume_rabbitmq_events(self):
        """Start consuming from RabbitMQ queues"""
        try:
            # Set up consumers for different queues
            queues = ['notifications.users', 'notifications.orders', 'notifications.payments']
            
            for queue in queues:
                self.rabbitmq_channel.basic_consume(
                    queue=queue,
                    on_message_callback=self.process_rabbitmq_message
                )
            
            logger.info("📥 Starting RabbitMQ consumers...")
            self.rabbitmq_channel.start_consuming()
            
        except Exception as e:
            logger.error(f"❌ Error starting RabbitMQ consumers: {e}")

    def start_metrics_server(self):
        """Start Prometheus metrics server"""
        try:
            port = int(os.getenv("METRICS_PORT", "8000"))
            start_http_server(port)
            logger.info(f"📊 Metrics server started on port {port}")
        except Exception as e:
            logger.error(f"❌ Failed to start metrics server: {e}")

    def shutdown_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info("🛑 Shutdown signal received")
        self.running = False
        
        if self.rabbitmq_channel:
            self.rabbitmq_channel.stop_consuming()
        
        sys.exit(0)

    def run(self):
        """Main run loop"""
        try:
            # Setup signal handlers
            signal.signal(signal.SIGINT, self.shutdown_handler)
            signal.signal(signal.SIGTERM, self.shutdown_handler)
            
            # Initialize connections
            self.setup_redis()
            self.setup_rabbitmq()
            self.setup_templates()
            
            # Start metrics server
            self.start_metrics_server()
            
            logger.info("🚀 Notification Service started")
            
            # Start Redis stream consumer in background thread
            redis_thread = threading.Thread(target=self.process_redis_stream)
            redis_thread.daemon = True
            redis_thread.start()
            
            # Start RabbitMQ consumers (blocking)
            self.consume_rabbitmq_events()
            
        except KeyboardInterrupt:
            logger.info("👋 Notification Service stopped by user")
        except Exception as e:
            logger.error(f"❌ Notification Service error: {e}")
        finally:
            self.cleanup()

    def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Cleaning up resources...")
        
        if self.redis_client:
            self.redis_client.close()
        
        if self.rabbitmq_channel:
            self.rabbitmq_channel.close()
        
        if self.rabbitmq_connection:
            self.rabbitmq_connection.close()

if __name__ == "__main__":
    service = NotificationService()
    service.run()
