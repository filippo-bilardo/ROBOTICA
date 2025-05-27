import json
import asyncio
from typing import Dict, Any
from aiokafka import AIOKafkaProducer
from config import settings
import structlog

logger = structlog.get_logger()

class KafkaPublisher:
    """Kafka publisher for sending integration events"""
    
    def __init__(self):
        self.producer = None
        self._initialized = False
    
    async def _ensure_initialized(self):
        """Ensure the producer is initialized"""
        if not self._initialized:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                compression_type="gzip",
                acks='all',  # Wait for all replicas
                retries=3,
                request_timeout_ms=30000,
                retry_backoff_ms=1000
            )
            await self.producer.start()
            self._initialized = True
            logger.info("Kafka producer initialized")
    
    async def publish_event(self, topic: str, event_data: Dict[str, Any], key: str = None):
        """Publish an event to Kafka topic"""
        try:
            await self._ensure_initialized()
            
            # Add topic prefix if configured
            full_topic = f"{settings.KAFKA_TOPIC_PREFIX}.{topic}" if settings.KAFKA_TOPIC_PREFIX else topic
            
            # Send message
            await self.producer.send_and_wait(
                topic=full_topic,
                value=event_data,
                key=key.encode('utf-8') if key else None
            )
            
            logger.info("Event published", topic=full_topic, event_data=event_data)
            
        except Exception as e:
            logger.error("Error publishing event", error=str(e), topic=topic, event_data=event_data)
            raise
    
    async def close(self):
        """Close the producer"""
        if self.producer:
            await self.producer.stop()
            self._initialized = False
            logger.info("Kafka producer closed")
