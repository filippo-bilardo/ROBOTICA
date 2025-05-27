import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from sqlalchemy.exc import IntegrityError

from database import UserProjection, get_db_session
from services.event_store import EventStore
from services.kafka_consumer import KafkaConsumer
import structlog

logger = structlog.get_logger()

class ProjectionService:
    """Service for maintaining read model projections from events"""
    
    def __init__(self):
        self.kafka_consumer = KafkaConsumer()
        self.running = False
    
    async def start(self):
        """Start the projection service"""
        self.running = True
        logger.info("Starting projection service")
        
        # Start consuming events from Kafka
        await self.kafka_consumer.start_consuming([
            "user.created",
            "user.updated", 
            "user.deleted",
            "user.verified"
        ], self._handle_event)
    
    async def stop(self):
        """Stop the projection service"""
        self.running = False
        await self.kafka_consumer.stop()
        logger.info("Projection service stopped")
    
    async def _handle_event(self, event_data: Dict[str, Any]):
        """Handle incoming events and update projections"""
        try:
            event_type = event_data.get("event_type")
            
            if event_type == "UserCreated":
                await self._handle_user_created(event_data)
            elif event_type == "UserUpdated":
                await self._handle_user_updated(event_data)
            elif event_type == "UserDeleted":
                await self._handle_user_deleted(event_data)
            elif event_type == "UserVerified":
                await self._handle_user_verified(event_data)
            else:
                logger.warning("Unknown event type", event_type=event_type)
                
        except Exception as e:
            logger.error("Error handling event", error=str(e), event_data=event_data)
    
    async def _handle_user_created(self, event_data: Dict[str, Any]):
        """Handle UserCreated event"""
        try:
            async with get_db_session() as session:
                data = event_data["event_data"]
                
                user_projection = UserProjection(
                    id=data["id"],
                    email=data["email"],
                    username=data["username"],
                    first_name=data.get("first_name"),
                    last_name=data.get("last_name"),
                    is_active=data.get("is_active", True),
                    is_verified=data.get("is_verified", False),
                    created_at=datetime.fromisoformat(data["created_at"]),
                    updated_at=datetime.fromisoformat(data["updated_at"]),
                    profile_data=data.get("profile_data", {}),
                    version=data.get("version", 1)
                )
                
                session.add(user_projection)
                await session.commit()
                
                logger.info("User projection created", user_id=data["id"])
                
        except IntegrityError:
            # User projection already exists
            logger.warning("User projection already exists", user_id=event_data["event_data"]["id"])
        except Exception as e:
            logger.error("Error creating user projection", error=str(e))
    
    async def _handle_user_updated(self, event_data: Dict[str, Any]):
        """Handle UserUpdated event"""
        try:
            async with get_db_session() as session:
                aggregate_id = event_data["aggregate_id"]
                data = event_data["event_data"]
                
                # Prepare update data
                update_data = {}
                if "username" in data:
                    update_data["username"] = data["username"]
                if "first_name" in data:
                    update_data["first_name"] = data["first_name"]
                if "last_name" in data:
                    update_data["last_name"] = data["last_name"]
                if "is_active" in data:
                    update_data["is_active"] = data["is_active"]
                if "profile_data" in data:
                    update_data["profile_data"] = data["profile_data"]
                if "updated_at" in data:
                    update_data["updated_at"] = datetime.fromisoformat(data["updated_at"])
                
                update_data["version"] = event_data.get("version", 1)
                
                stmt = update(UserProjection).where(
                    UserProjection.id == aggregate_id
                ).values(**update_data)
                
                await session.execute(stmt)
                await session.commit()
                
                logger.info("User projection updated", user_id=aggregate_id)
                
        except Exception as e:
            logger.error("Error updating user projection", error=str(e))
    
    async def _handle_user_deleted(self, event_data: Dict[str, Any]):
        """Handle UserDeleted event"""
        try:
            async with get_db_session() as session:
                aggregate_id = event_data["aggregate_id"]
                
                stmt = update(UserProjection).where(
                    UserProjection.id == aggregate_id
                ).values(
                    is_active=False,
                    version=event_data.get("version", 1),
                    updated_at=datetime.utcnow()
                )
                
                await session.execute(stmt)
                await session.commit()
                
                logger.info("User projection marked as deleted", user_id=aggregate_id)
                
        except Exception as e:
            logger.error("Error deleting user projection", error=str(e))
    
    async def _handle_user_verified(self, event_data: Dict[str, Any]):
        """Handle UserVerified event"""
        try:
            async with get_db_session() as session:
                aggregate_id = event_data["aggregate_id"]
                
                stmt = update(UserProjection).where(
                    UserProjection.id == aggregate_id
                ).values(
                    is_verified=True,
                    version=event_data.get("version", 1),
                    updated_at=datetime.utcnow()
                )
                
                await session.execute(stmt)
                await session.commit()
                
                logger.info("User projection verified", user_id=aggregate_id)
                
        except Exception as e:
            logger.error("Error verifying user projection", error=str(e))
    
    async def rebuild_projections(self):
        """Rebuild all projections from event store"""
        try:
            logger.info("Starting projection rebuild")
            
            async with get_db_session() as session:
                # Clear existing projections
                await session.execute("DELETE FROM user_projections")
                
                # Get event store and replay all events
                event_store = EventStore(session)
                events = await event_store.get_all_events(
                    event_types=["UserCreated", "UserUpdated", "UserDeleted", "UserVerified"]
                )
                
                # Group events by aggregate
                aggregates = {}
                for event in events:
                    if event.aggregate_id not in aggregates:
                        aggregates[event.aggregate_id] = []
                    aggregates[event.aggregate_id].append(event)
                
                # Rebuild each aggregate projection
                for aggregate_id, aggregate_events in aggregates.items():
                    # Sort events by version
                    aggregate_events.sort(key=lambda x: x.version)
                    
                    # Apply events to rebuild projection
                    for event in aggregate_events:
                        await self._handle_event({
                            "event_type": event.event_type,
                            "aggregate_id": event.aggregate_id,
                            "event_data": event.event_data,
                            "version": event.version
                        })
                
                await session.commit()
                logger.info("Projection rebuild completed", total_aggregates=len(aggregates))
                
        except Exception as e:
            logger.error("Error rebuilding projections", error=str(e))
            raise
