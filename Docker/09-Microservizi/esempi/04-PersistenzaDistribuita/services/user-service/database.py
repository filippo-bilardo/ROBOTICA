from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
from config import settings
import uuid

Base = declarative_base()

class Event(Base):
    """Event Store table for storing domain events"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aggregate_id = Column(String(255), nullable=False, index=True)
    aggregate_type = Column(String(255), nullable=False)
    event_type = Column(String(255), nullable=False)
    event_data = Column(JSONB, nullable=False)
    event_metadata = Column(JSONB)
    version = Column(Integer, nullable=False)
    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index('idx_aggregate_version', 'aggregate_id', 'version', unique=True),
        Index('idx_event_type_occurred', 'event_type', 'occurred_at'),
    )

class UserProjection(Base):
    """Read model for User queries (CQRS Query side)"""
    __tablename__ = "user_projections"
    
    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    last_login = Column(DateTime)
    profile_data = Column(JSONB)
    version = Column(Integer, nullable=False, default=1)
    
    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),
        Index('idx_user_created_at', 'created_at'),
    )

class Snapshot(Base):
    """Snapshots for aggregate reconstruction optimization"""
    __tablename__ = "snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aggregate_id = Column(String(255), nullable=False, index=True)
    aggregate_type = Column(String(255), nullable=False)
    data = Column(JSONB, nullable=False)
    version = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index('idx_snapshot_aggregate_version', 'aggregate_id', 'version', unique=True),
    )

# Database connection
engine = create_async_engine(
    settings.database_url,
    echo=settings.LOG_LEVEL == "DEBUG",
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    pool_recycle=300,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db_session():
    """Get database session"""
    async with async_session() as session:
        yield session

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
