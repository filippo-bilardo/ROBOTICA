import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from database import Event, Snapshot
from models import UserEvent
import structlog

logger = structlog.get_logger()

class EventStore:
    """Event Store implementation for storing and retrieving domain events"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def append_event(
        self,
        aggregate_id: str,
        aggregate_type: str,
        event_type: str,
        event_data: Dict[str, Any],
        expected_version: int,
        event_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Append an event to the event store with optimistic concurrency control
        """
        try:
            # Check current version for concurrency control
            current_version = await self._get_current_version(aggregate_id)
            
            if current_version != expected_version:
                raise ConcurrencyError(
                    f"Expected version {expected_version}, but current version is {current_version}"
                )
            
            # Create new event
            event = Event(
                id=uuid.uuid4(),
                aggregate_id=aggregate_id,
                aggregate_type=aggregate_type,
                event_type=event_type,
                event_data=event_data,
                event_metadata=event_metadata or {},
                version=expected_version + 1,
                occurred_at=datetime.utcnow()
            )
            
            self.session.add(event)
            await self.session.commit()
            
            logger.info(
                "Event appended",
                event_id=str(event.id),
                aggregate_id=aggregate_id,
                event_type=event_type,
                version=event.version
            )
            
            return str(event.id)
            
        except Exception as e:
            await self.session.rollback()
            logger.error("Failed to append event", error=str(e))
            raise
    
    async def get_events(
        self,
        aggregate_id: str,
        from_version: int = 0
    ) -> List[UserEvent]:
        """
        Get events for an aggregate from a specific version
        """
        try:
            stmt = select(Event).where(
                and_(
                    Event.aggregate_id == aggregate_id,
                    Event.version > from_version
                )
            ).order_by(Event.version)
            
            result = await self.session.execute(stmt)
            events = result.scalars().all()
            
            return [
                UserEvent(
                    id=event.id,
                    aggregate_id=event.aggregate_id,
                    aggregate_type=event.aggregate_type,
                    event_type=event.event_type,
                    event_data=event.event_data,
                    event_metadata=event.event_metadata,
                    version=event.version,
                    occurred_at=event.occurred_at
                )
                for event in events
            ]
            
        except Exception as e:
            logger.error("Failed to get events", error=str(e))
            raise
    
    async def get_all_events(
        self,
        event_types: Optional[List[str]] = None,
        from_time: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[UserEvent]:
        """
        Get all events with optional filtering
        """
        try:
            stmt = select(Event)
            
            conditions = []
            if event_types:
                conditions.append(Event.event_type.in_(event_types))
            if from_time:
                conditions.append(Event.occurred_at >= from_time)
            
            if conditions:
                stmt = stmt.where(and_(*conditions))
            
            stmt = stmt.order_by(Event.occurred_at).limit(limit)
            
            result = await self.session.execute(stmt)
            events = result.scalars().all()
            
            return [
                UserEvent(
                    id=event.id,
                    aggregate_id=event.aggregate_id,
                    aggregate_type=event.aggregate_type,
                    event_type=event.event_type,
                    event_data=event.event_data,
                    event_metadata=event.event_metadata,
                    version=event.version,
                    occurred_at=event.occurred_at
                )
                for event in events
            ]
            
        except Exception as e:
            logger.error("Failed to get all events", error=str(e))
            raise
    
    async def save_snapshot(
        self,
        aggregate_id: str,
        aggregate_type: str,
        data: Dict[str, Any],
        version: int
    ):
        """
        Save an aggregate snapshot for performance optimization
        """
        try:
            snapshot = Snapshot(
                aggregate_id=aggregate_id,
                aggregate_type=aggregate_type,
                data=data,
                version=version,
                created_at=datetime.utcnow()
            )
            
            self.session.add(snapshot)
            await self.session.commit()
            
            logger.info(
                "Snapshot saved",
                aggregate_id=aggregate_id,
                version=version
            )
            
        except Exception as e:
            await self.session.rollback()
            logger.error("Failed to save snapshot", error=str(e))
            raise
    
    async def get_snapshot(
        self,
        aggregate_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get the latest snapshot for an aggregate
        """
        try:
            stmt = select(Snapshot).where(
                Snapshot.aggregate_id == aggregate_id
            ).order_by(Snapshot.version.desc()).limit(1)
            
            result = await self.session.execute(stmt)
            snapshot = result.scalar_one_or_none()
            
            if snapshot:
                return {
                    "data": snapshot.data,
                    "version": snapshot.version,
                    "created_at": snapshot.created_at
                }
            
            return None
            
        except Exception as e:
            logger.error("Failed to get snapshot", error=str(e))
            raise
    
    async def _get_current_version(self, aggregate_id: str) -> int:
        """
        Get the current version of an aggregate
        """
        stmt = select(Event.version).where(
            Event.aggregate_id == aggregate_id
        ).order_by(Event.version.desc()).limit(1)
        
        result = await self.session.execute(stmt)
        version = result.scalar_one_or_none()
        
        return version or 0

class ConcurrencyError(Exception):
    """Raised when there's a concurrency conflict in the event store"""
    pass
