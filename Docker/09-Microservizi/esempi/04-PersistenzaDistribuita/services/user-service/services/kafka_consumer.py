import json
import asyncio
from typing import Dict, Any, Callable
from aiokafka import AIOKafkaConsumer
from config import settings
import structlog

logger = structlog.get_logger()

class KafkaConsumer:
    """Kafka consumer for handling integration events"""
    
    def __init__(self):
        self.consumer = None
        self.running = False
    
    async def start_consuming(self, topics: list, event_handler: Callable):
        """Start consuming messages from Kafka topics"""
        try:
            self.consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                group_id=f"{settings.SERVICE_NAME}-consumer-group",
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            
            await self.consumer.start()
            self.running = True
            
            logger.info("Kafka consumer started", topics=topics)
            
            async for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    await event_handler(message.value)
                except Exception as e:
                    logger.error(
                        "Error processing message",
                        error=str(e),
                        topic=message.topic,
                        partition=message.partition,
                        offset=message.offset
                    )
                    
        except Exception as e:
            logger.error("Error in Kafka consumer", error=str(e))
        finally:
            if self.consumer:
                await self.consumer.stop()
    
    async def stop(self):
        """Stop the Kafka consumer"""
        self.running = False
        if self.consumer:
            await self.consumer.stop()
        logger.info("Kafka consumer stopped")
