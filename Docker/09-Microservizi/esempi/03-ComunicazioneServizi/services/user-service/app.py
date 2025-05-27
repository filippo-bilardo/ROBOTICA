import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional

import redis.asyncio as redis
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@postgres:5432/users")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# SQLAlchemy setup
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

# Redis client
redis_client = None

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    verified: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserEvent(BaseModel):
    event_type: str
    user_id: int
    data: dict
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()

# Event Bus
class EventBus:
    def __init__(self, redis_client):
        self.redis_client = redis_client
        self.stream_name = "events"

    async def publish_event(self, event_type: str, user_id: int, data: dict):
        """Publish user event to the event stream"""
        try:
            event = {
                'type': event_type,
                'user_id': str(user_id),
                'data': json.dumps(data),
                'timestamp': datetime.utcnow().isoformat(),
                'service': 'user-service'
            }
            
            await self.redis_client.xadd(self.stream_name, event)
            logger.info(f"📤 Event published: {event_type} for user {user_id}")
        except Exception as e:
            logger.error(f"❌ Failed to publish event {event_type}: {e}")

    async def subscribe_to_events(self):
        """Subscribe to events from other services"""
        try:
            consumer_group = "user-service"
            consumer_name = "user-worker"
            
            # Create consumer group if it doesn't exist
            try:
                await self.redis_client.xgroup_create(
                    self.stream_name, consumer_group, id='0', mkstream=True
                )
            except redis.ResponseError as e:
                if "BUSYGROUP" not in str(e):
                    raise e

            logger.info(f"📥 Starting event consumer: {consumer_group}")
            
            while True:
                try:
                    # Read from stream
                    result = await self.redis_client.xreadgroup(
                        consumer_group, consumer_name, {self.stream_name: '>'},
                        count=10, block=1000
                    )
                    
                    for stream, messages in result:
                        for message_id, fields in messages:
                            await self.process_event(message_id, fields)
                            # Acknowledge message
                            await self.redis_client.xack(self.stream_name, consumer_group, message_id)
                            
                except Exception as e:
                    logger.error(f"❌ Error consuming events: {e}")
                    await asyncio.sleep(5)
                    
        except Exception as e:
            logger.error(f"❌ Failed to setup event consumer: {e}")

    async def process_event(self, message_id: str, fields: dict):
        """Process incoming events"""
        try:
            event_type = fields.get(b'type', b'').decode()
            user_id = fields.get(b'user_id', b'').decode()
            service = fields.get(b'service', b'').decode()
            
            logger.info(f"📨 Processing event: {event_type} from {service}")
            
            # Process specific events
            if event_type == "order.created" and user_id:
                await self.handle_order_created(int(user_id), fields)
            elif event_type == "payment.completed" and user_id:
                await self.handle_payment_completed(int(user_id), fields)
                
        except Exception as e:
            logger.error(f"❌ Error processing event {message_id}: {e}")

    async def handle_order_created(self, user_id: int, fields: dict):
        """Handle order created event"""
        try:
            # Update user activity or send notification
            logger.info(f"👤 User {user_id} created an order")
            
            # Could update user statistics, send notification, etc.
            await self.publish_event("user.order_activity", user_id, {
                "activity": "order_created",
                "timestamp": datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            logger.error(f"❌ Error handling order created for user {user_id}: {e}")

    async def handle_payment_completed(self, user_id: int, fields: dict):
        """Handle payment completed event"""
        try:
            logger.info(f"👤 User {user_id} completed payment")
            
            # Update user verification status or loyalty points
            async with async_session() as session:
                user = await session.get(User, user_id)
                if user and not user.verified:
                    user.verified = True
                    await session.commit()
                    
                    await self.publish_event("user.verified", user_id, {
                        "verification_method": "payment_completion"
                    })
                    
        except Exception as e:
            logger.error(f"❌ Error handling payment completed for user {user_id}: {e}")

# Event bus instance
event_bus = None

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global redis_client, event_bus
    
    # Initialize Redis
    redis_client = redis.from_url(REDIS_URL)
    event_bus = EventBus(redis_client)
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Start event consumer in background
    asyncio.create_task(event_bus.subscribe_to_events())
    
    logger.info("🚀 User Service started")
    yield
    
    # Shutdown
    await redis_client.close()
    await engine.dispose()
    logger.info("👋 User Service stopped")

# FastAPI app
app = FastAPI(
    title="User Service",
    description="Microservice for user management",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
async def root():
    return {"service": "user-service", "status": "running", "timestamp": datetime.utcnow()}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        
        # Check Redis connection
        await redis_client.ping()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow(),
            "dependencies": {
                "database": "healthy",
                "redis": "healthy"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow(),
            "error": str(e)
        }

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user"""
    try:
        # Check if user exists
        result = await db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": user.email}
        )
        if result.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        db_user = User(name=user.name, email=user.email)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        
        # Publish event
        await event_bus.publish_event("user.created", db_user.id, {
            "name": db_user.name,
            "email": db_user.email
        })
        
        logger.info(f"👤 User created: {db_user.id} - {db_user.email}")
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get user by ID"""
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/users", response_model=List[UserResponse])
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List users with pagination"""
    try:
        result = await db.execute(
            text("SELECT * FROM users ORDER BY id LIMIT :limit OFFSET :skip"),
            {"limit": limit, "skip": skip}
        )
        users = []
        for row in result:
            user = User()
            for key, value in row._mapping.items():
                setattr(user, key, value)
            users.append(user)
        
        return users
        
    except Exception as e:
        logger.error(f"❌ Error listing users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user"""
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields
        if user_update.name is not None:
            user.name = user_update.name
        if user_update.verified is not None:
            old_verified = user.verified
            user.verified = user_update.verified
            
            # Publish verification event if status changed
            if not old_verified and user_update.verified:
                await event_bus.publish_event("user.verified", user_id, {
                    "verification_method": "manual"
                })
        
        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        
        # Publish update event
        await event_bus.publish_event("user.updated", user_id, {
            "changes": user_update.dict(exclude_unset=True)
        })
        
        logger.info(f"👤 User updated: {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete user"""
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        await db.delete(user)
        await db.commit()
        
        # Publish deletion event
        await event_bus.publish_event("user.deleted", user_id, {
            "email": user.email
        })
        
        logger.info(f"👤 User deleted: {user_id}")
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/users/{user_id}/verify")
async def verify_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Verify user manually"""
    try:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.verified:
            return {"message": "User already verified"}
        
        user.verified = True
        user.updated_at = datetime.utcnow()
        await db.commit()
        
        # Publish verification event
        await event_bus.publish_event("user.verified", user_id, {
            "verification_method": "manual"
        })
        
        logger.info(f"✅ User verified: {user_id}")
        return {"message": "User verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/metrics")
async def get_metrics():
    """Basic metrics endpoint"""
    try:
        async with async_session() as session:
            # Count total users
            total_result = await session.execute(text("SELECT COUNT(*) FROM users"))
            total_users = total_result.scalar()
            
            # Count verified users
            verified_result = await session.execute(text("SELECT COUNT(*) FROM users WHERE verified = true"))
            verified_users = verified_result.scalar()
            
            return {
                "total_users": total_users,
                "verified_users": verified_users,
                "unverified_users": total_users - verified_users,
                "verification_rate": (verified_users / total_users * 100) if total_users > 0 else 0
            }
            
    except Exception as e:
        logger.error(f"❌ Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=3000,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info"
    )
