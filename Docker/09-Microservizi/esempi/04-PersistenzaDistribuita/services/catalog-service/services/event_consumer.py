import asyncio
import json
from typing import Dict, Any, Optional
import structlog
from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaError

from config import settings
from services.product_service import ProductService
from services.cache_service import CacheService
from services.search_service import SearchService

logger = structlog.get_logger()

class EventConsumer:
    """Kafka event consumer for catalog service"""
    
    def __init__(self):
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.running = False
        self.product_service: Optional[ProductService] = None
        
        # Event handlers mapping
        self.event_handlers = {
            "inventory.stock.updated": self._handle_stock_updated,
            "inventory.stock.reserved": self._handle_stock_reserved,
            "inventory.stock.released": self._handle_stock_released,
            "order.product.purchased": self._handle_product_purchased,
            "order.product.returned": self._handle_product_returned,
            "pricing.price.updated": self._handle_price_updated,
            "user.product.viewed": self._handle_product_viewed,
            "user.product.favorited": self._handle_product_favorited,
            "analytics.product.trending": self._handle_product_trending,
            "catalog.product.updated": self._handle_product_updated,
            "catalog.product.deleted": self._handle_product_deleted
        }
    
    async def start(self):
        """Start the event consumer"""
        try:
            # Initialize services
            cache_service = CacheService()
            search_service = SearchService()
            self.product_service = ProductService(cache_service, search_service)
            
            # Initialize Kafka consumer
            self.consumer = AIOKafkaConsumer(
                *settings.KAFKA_TOPICS,
                bootstrap_servers=f"{settings.KAFKA_HOST}:{settings.KAFKA_PORT}",
                group_id=settings.KAFKA_CONSUMER_GROUP,
                auto_offset_reset="latest",
                enable_auto_commit=True,
                auto_commit_interval_ms=1000,
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                key_deserializer=lambda x: x.decode('utf-8') if x else None
            )
            
            await self.consumer.start()
            self.running = True
            
            logger.info("Event consumer started", 
                       topics=settings.KAFKA_TOPICS,
                       group_id=settings.KAFKA_CONSUMER_GROUP)
            
            # Start consuming messages
            await self._consume_messages()
            
        except Exception as e:
            logger.error("Event consumer start error", error=str(e))
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the event consumer"""
        self.running = False
        
        if self.consumer:
            try:
                await self.consumer.stop()
            except Exception as e:
                logger.warning("Consumer stop error", error=str(e))
        
        # Close service connections
        if self.product_service:
            await self.product_service.close()
        
        logger.info("Event consumer stopped")
    
    async def _consume_messages(self):
        """Main message consumption loop"""
        try:
            async for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    await self._process_message(message)
                except Exception as e:
                    logger.error("Message processing error", 
                                topic=message.topic,
                                partition=message.partition,
                                offset=message.offset,
                                error=str(e))
                    
        except asyncio.CancelledError:
            logger.info("Message consumption cancelled")
        except KafkaError as e:
            logger.error("Kafka error during consumption", error=str(e))
        except Exception as e:
            logger.error("Unexpected error during consumption", error=str(e))
    
    async def _process_message(self, message):
        """Process individual Kafka message"""
        try:
            # Extract event information
            event_type = message.headers.get("event_type")
            if isinstance(event_type, bytes):
                event_type = event_type.decode('utf-8')
            
            correlation_id = message.headers.get("correlation_id")
            if isinstance(correlation_id, bytes):
                correlation_id = correlation_id.decode('utf-8')
            
            # Log message received
            logger.debug("Event received",
                        topic=message.topic,
                        event_type=event_type,
                        correlation_id=correlation_id,
                        partition=message.partition,
                        offset=message.offset)
            
            # Get event handler
            handler = self.event_handlers.get(event_type)
            if not handler:
                logger.warning("No handler for event type", event_type=event_type)
                return
            
            # Process event
            await handler(message.value, {
                "event_type": event_type,
                "correlation_id": correlation_id,
                "topic": message.topic,
                "partition": message.partition,
                "offset": message.offset,
                "timestamp": message.timestamp
            })
            
            logger.debug("Event processed successfully",
                        event_type=event_type,
                        correlation_id=correlation_id)
            
        except Exception as e:
            logger.error("Message processing failed",
                        topic=message.topic,
                        error=str(e),
                        message_value=message.value)
            raise
    
    async def _handle_stock_updated(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle inventory stock update event"""
        try:
            product_id = event_data.get("product_id")
            new_stock = event_data.get("stock_quantity")
            
            if not product_id or new_stock is None:
                logger.warning("Invalid stock update event", event_data=event_data)
                return
            
            # Update product stock in Elasticsearch
            await self.product_service.update_product_stock(product_id, new_stock)
            
            # Invalidate related cache entries
            cache_keys = [
                f"product:{product_id}",
                f"products:*",  # Clear list cache
                f"category:*"  # Clear category cache
            ]
            await self.product_service.invalidate_cache(cache_keys)
            
            logger.info("Stock updated", 
                       product_id=product_id, 
                       new_stock=new_stock,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Stock update handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_stock_reserved(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle inventory stock reservation event"""
        try:
            product_id = event_data.get("product_id")
            reserved_quantity = event_data.get("quantity")
            
            if not product_id or not reserved_quantity:
                logger.warning("Invalid stock reservation event", event_data=event_data)
                return
            
            # Update available stock (reduce by reserved amount)
            await self.product_service.reserve_product_stock(product_id, reserved_quantity)
            
            logger.info("Stock reserved", 
                       product_id=product_id, 
                       reserved_quantity=reserved_quantity,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Stock reservation handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_stock_released(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle inventory stock release event"""
        try:
            product_id = event_data.get("product_id")
            released_quantity = event_data.get("quantity")
            
            if not product_id or not released_quantity:
                logger.warning("Invalid stock release event", event_data=event_data)
                return
            
            # Update available stock (increase by released amount)
            await self.product_service.release_product_stock(product_id, released_quantity)
            
            logger.info("Stock released", 
                       product_id=product_id, 
                       released_quantity=released_quantity,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Stock release handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_price_updated(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle price update event"""
        try:
            product_id = event_data.get("product_id")
            new_price = event_data.get("price")
            
            if not product_id or new_price is None:
                logger.warning("Invalid price update event", event_data=event_data)
                return
            
            # Update product price
            await self.product_service.update_product_price(product_id, new_price)
            
            # Invalidate cache
            cache_keys = [f"product:{product_id}", "products:*", "category:*"]
            await self.product_service.invalidate_cache(cache_keys)
            
            logger.info("Price updated", 
                       product_id=product_id, 
                       new_price=new_price,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Price update handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_viewed(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product view event"""
        try:
            product_id = event_data.get("product_id")
            user_id = event_data.get("user_id")
            
            if not product_id:
                logger.warning("Invalid product view event", event_data=event_data)
                return
            
            # Increment view count
            await self.product_service.increment_view_count(product_id)
            
            # Update search service for analytics
            search_service = self.product_service.search_service
            await search_service.update_product_search_count(product_id)
            
            logger.debug("Product viewed", 
                        product_id=product_id, 
                        user_id=user_id,
                        correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Product view handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_purchased(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product purchase event"""
        try:
            product_id = event_data.get("product_id")
            quantity = event_data.get("quantity", 1)
            
            if not product_id:
                logger.warning("Invalid product purchase event", event_data=event_data)
                return
            
            # Update purchase analytics
            await self.product_service.record_purchase(product_id, quantity)
            
            logger.info("Product purchased", 
                       product_id=product_id, 
                       quantity=quantity,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Product purchase handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_returned(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product return event"""
        try:
            product_id = event_data.get("product_id")
            quantity = event_data.get("quantity", 1)
            
            if not product_id:
                logger.warning("Invalid product return event", event_data=event_data)
                return
            
            # Update return analytics and stock
            await self.product_service.record_return(product_id, quantity)
            
            logger.info("Product returned", 
                       product_id=product_id, 
                       quantity=quantity,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Product return handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_favorited(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product favorited event"""
        try:
            product_id = event_data.get("product_id")
            user_id = event_data.get("user_id")
            action = event_data.get("action", "added")  # added or removed
            
            if not product_id or not user_id:
                logger.warning("Invalid product favorite event", event_data=event_data)
                return
            
            # Update favorite count
            if action == "added":
                await self.product_service.increment_favorite_count(product_id)
            elif action == "removed":
                await self.product_service.decrement_favorite_count(product_id)
            
            logger.debug("Product favorited", 
                        product_id=product_id, 
                        user_id=user_id,
                        action=action,
                        correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Product favorite handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_trending(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product trending analytics event"""
        try:
            trending_products = event_data.get("trending_products", [])
            
            if not trending_products:
                logger.warning("Invalid trending products event", event_data=event_data)
                return
            
            # Update trending status for products
            await self.product_service.update_trending_products(trending_products)
            
            logger.info("Trending products updated", 
                       count=len(trending_products),
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Trending products handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_updated(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product update event from other services"""
        try:
            product_id = event_data.get("product_id")
            updates = event_data.get("updates", {})
            
            if not product_id:
                logger.warning("Invalid product update event", event_data=event_data)
                return
            
            # Apply updates to product
            await self.product_service.apply_external_updates(product_id, updates)
            
            # Invalidate cache
            cache_keys = [f"product:{product_id}", "products:*"]
            await self.product_service.invalidate_cache(cache_keys)
            
            logger.info("Product updated from external event", 
                       product_id=product_id, 
                       updates=list(updates.keys()),
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("External product update handling error", 
                        event_data=event_data, error=str(e))
    
    async def _handle_product_deleted(self, event_data: Dict[str, Any], metadata: Dict[str, Any]):
        """Handle product deletion event"""
        try:
            product_id = event_data.get("product_id")
            
            if not product_id:
                logger.warning("Invalid product deletion event", event_data=event_data)
                return
            
            # Remove product from search index and cache
            await self.product_service.handle_product_deletion(product_id)
            
            logger.info("Product deleted from catalog", 
                       product_id=product_id,
                       correlation_id=metadata.get("correlation_id"))
            
        except Exception as e:
            logger.error("Product deletion handling error", 
                        event_data=event_data, error=str(e))
