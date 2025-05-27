import uuid
import hashlib
from datetime import datetime
from typing import List, Optional
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from models import UserCreate, UserUpdate, UserResponse, UserAggregate
from database import UserProjection
from services.event_store import EventStore, ConcurrencyError
from services.kafka_publisher import KafkaPublisher
import structlog

logger = structlog.get_logger()

class UserService:
    """User service implementing CQRS and Event Sourcing patterns"""
    
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.kafka_publisher = KafkaPublisher()
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Create a new user using event sourcing
        """
        try:
            user_id = str(uuid.uuid4())
            password_hash = self.pwd_context.hash(user_data.password)
            
            # Create user created event
            event_data = {
                "id": user_id,
                "email": user_data.email,
                "username": user_data.username,
                "password_hash": password_hash,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "is_active": True,
                "is_verified": False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "profile_data": user_data.profile_data or {},
                "version": 1
            }
            
            # Append event to event store
            event_id = await self.event_store.append_event(
                aggregate_id=user_id,
                aggregate_type="User",
                event_type="UserCreated",
                event_data=event_data,
                expected_version=0,
                event_metadata={
                    "source": "user-service",
                    "correlation_id": str(uuid.uuid4())
                }
            )
            
            # Publish integration event
            await self.kafka_publisher.publish_event(
                topic="user.created",
                event_data={
                    "user_id": user_id,
                    "email": user_data.email,
                    "username": user_data.username,
                    "created_at": event_data["created_at"]
                }
            )
            
            logger.info("User created", user_id=user_id, event_id=event_id)
            
            # Return user response
            return UserResponse(
                id=user_id,
                email=user_data.email,
                username=user_data.username,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                is_active=True,
                is_verified=False,
                created_at=datetime.fromisoformat(event_data["created_at"]),
                updated_at=datetime.fromisoformat(event_data["updated_at"]),
                profile_data=user_data.profile_data or {},
                version=1
            )
            
        except ConcurrencyError:
            logger.error("Concurrency error creating user")
            raise ValueError("User creation failed due to concurrency conflict")
        except Exception as e:
            logger.error("Error creating user", error=str(e))
            raise
    
    async def get_user(self, user_id: str) -> Optional[UserResponse]:
        """
        Get user by ID from read model (query side)
        """
        try:
            async with self.event_store.session as session:
                stmt = select(UserProjection).where(UserProjection.id == user_id)
                result = await session.execute(stmt)
                user_projection = result.scalar_one_or_none()
                
                if user_projection:
                    return UserResponse.from_orm(user_projection)
                
                # If not found in projection, try to rebuild from events
                return await self._rebuild_user_from_events(user_id)
                
        except Exception as e:
            logger.error("Error getting user", user_id=user_id, error=str(e))
            raise
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[UserResponse]:
        """
        Update user using event sourcing
        """
        try:
            # Get current user to check version
            current_user = await self._get_user_aggregate(user_id)
            if not current_user:
                return None
            
            # Prepare update data
            update_data = {}
            if user_data.username is not None:
                update_data["username"] = user_data.username
            if user_data.first_name is not None:
                update_data["first_name"] = user_data.first_name
            if user_data.last_name is not None:
                update_data["last_name"] = user_data.last_name
            if user_data.profile_data is not None:
                update_data["profile_data"] = user_data.profile_data
            if user_data.is_active is not None:
                update_data["is_active"] = user_data.is_active
            
            if not update_data:
                return await self.get_user(user_id)
            
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Append update event
            event_id = await self.event_store.append_event(
                aggregate_id=user_id,
                aggregate_type="User",
                event_type="UserUpdated",
                event_data=update_data,
                expected_version=current_user.version,
                event_metadata={
                    "source": "user-service",
                    "correlation_id": str(uuid.uuid4())
                }
            )
            
            # Publish integration event
            await self.kafka_publisher.publish_event(
                topic="user.updated",
                event_data={
                    "user_id": user_id,
                    "updated_fields": list(update_data.keys()),
                    "updated_at": update_data["updated_at"]
                }
            )
            
            logger.info("User updated", user_id=user_id, event_id=event_id)
            
            # Return updated user
            return await self.get_user(user_id)
            
        except ConcurrencyError:
            logger.error("Concurrency error updating user", user_id=user_id)
            raise ValueError("User update failed due to concurrency conflict")
        except Exception as e:
            logger.error("Error updating user", user_id=user_id, error=str(e))
            raise
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Soft delete user using event sourcing
        """
        try:
            # Get current user to check version
            current_user = await self._get_user_aggregate(user_id)
            if not current_user:
                return False
            
            # Append delete event
            event_data = {
                "deleted_at": datetime.utcnow().isoformat(),
                "is_active": False
            }
            
            event_id = await self.event_store.append_event(
                aggregate_id=user_id,
                aggregate_type="User",
                event_type="UserDeleted",
                event_data=event_data,
                expected_version=current_user.version,
                event_metadata={
                    "source": "user-service",
                    "correlation_id": str(uuid.uuid4())
                }
            )
            
            # Publish integration event
            await self.kafka_publisher.publish_event(
                topic="user.deleted",
                event_data={
                    "user_id": user_id,
                    "deleted_at": event_data["deleted_at"]
                }
            )
            
            logger.info("User deleted", user_id=user_id, event_id=event_id)
            return True
            
        except ConcurrencyError:
            logger.error("Concurrency error deleting user", user_id=user_id)
            raise ValueError("User deletion failed due to concurrency conflict")
        except Exception as e:
            logger.error("Error deleting user", user_id=user_id, error=str(e))
            raise
    
    async def list_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """
        List users from read model with pagination
        """
        try:
            async with self.event_store.session as session:
                stmt = select(UserProjection).where(
                    UserProjection.is_active == True
                ).offset(skip).limit(limit).order_by(UserProjection.created_at.desc())
                
                result = await session.execute(stmt)
                user_projections = result.scalars().all()
                
                return [UserResponse.from_orm(projection) for projection in user_projections]
                
        except Exception as e:
            logger.error("Error listing users", error=str(e))
            raise
    
    async def get_user_events(self, user_id: str) -> List[dict]:
        """
        Get user event history
        """
        try:
            events = await self.event_store.get_events(user_id)
            return [
                {
                    "id": str(event.id),
                    "event_type": event.event_type,
                    "event_data": event.event_data,
                    "version": event.version,
                    "occurred_at": event.occurred_at.isoformat()
                }
                for event in events
            ]
        except Exception as e:
            logger.error("Error getting user events", user_id=user_id, error=str(e))
            raise
    
    async def _get_user_aggregate(self, user_id: str) -> Optional[UserAggregate]:
        """
        Rebuild user aggregate from events
        """
        try:
            # Try to get from snapshot first
            snapshot = await self.event_store.get_snapshot(user_id)
            
            if snapshot:
                user = UserAggregate(**snapshot["data"])
                from_version = snapshot["version"]
            else:
                user = None
                from_version = 0
            
            # Get events since snapshot
            events = await self.event_store.get_events(user_id, from_version)
            
            # Apply events to rebuild aggregate
            for event in events:
                if user is None and event.event_type == "UserCreated":
                    user = UserAggregate(**event.event_data)
                elif user is not None:
                    user = user.apply_event({
                        "event_type": event.event_type,
                        "event_data": event.event_data
                    })
            
            # Save snapshot periodically (every 10 events)
            if user and len(events) >= 10:
                await self.event_store.save_snapshot(
                    aggregate_id=user_id,
                    aggregate_type="User",
                    data=user.dict(),
                    version=user.version
                )
            
            return user
            
        except Exception as e:
            logger.error("Error rebuilding user aggregate", user_id=user_id, error=str(e))
            return None
    
    async def _rebuild_user_from_events(self, user_id: str) -> Optional[UserResponse]:
        """
        Rebuild user from events if not found in projection
        """
        user_aggregate = await self._get_user_aggregate(user_id)
        
        if user_aggregate and user_aggregate.is_active:
            return UserResponse(
                id=user_aggregate.id,
                email=user_aggregate.email,
                username=user_aggregate.username,
                first_name=user_aggregate.first_name,
                last_name=user_aggregate.last_name,
                is_active=user_aggregate.is_active,
                is_verified=user_aggregate.is_verified,
                created_at=user_aggregate.created_at,
                updated_at=user_aggregate.updated_at,
                last_login=user_aggregate.last_login,
                profile_data=user_aggregate.profile_data,
                version=user_aggregate.version
            )
        
        return None
