from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None

class UserCreate(UserBase):
    """User creation model"""
    password: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v
    
    @validator('password')
    def password_validation(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserUpdate(BaseModel):
    """User update model"""
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_data: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if v is not None and not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        if v is not None and len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        return v

class UserResponse(BaseModel):
    """User response model"""
    id: UUID
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile_data: Optional[Dict[str, Any]] = None
    version: int
    
    class Config:
        from_attributes = True

class UserEvent(BaseModel):
    """User domain event model"""
    id: UUID
    aggregate_id: str
    aggregate_type: str
    event_type: str
    event_data: Dict[str, Any]
    event_metadata: Optional[Dict[str, Any]] = None
    version: int
    occurred_at: datetime
    
    class Config:
        from_attributes = True

class UserAggregate(BaseModel):
    """User aggregate model for event sourcing"""
    id: UUID
    email: str
    username: str
    password_hash: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile_data: Optional[Dict[str, Any]] = None
    version: int = 1
    
    def apply_event(self, event: Dict[str, Any]) -> "UserAggregate":
        """Apply an event to the aggregate"""
        event_type = event["event_type"]
        event_data = event["event_data"]
        
        if event_type == "UserCreated":
            # For creation, return new aggregate
            return UserAggregate(**event_data)
        elif event_type == "UserUpdated":
            # Update specific fields
            for field, value in event_data.items():
                if hasattr(self, field):
                    setattr(self, field, value)
            self.version += 1
            self.updated_at = datetime.utcnow()
        elif event_type == "UserDeleted":
            self.is_active = False
            self.version += 1
            self.updated_at = datetime.utcnow()
        elif event_type == "UserLoggedIn":
            self.last_login = event_data.get("login_time", datetime.utcnow())
            self.version += 1
        elif event_type == "UserVerified":
            self.is_verified = True
            self.version += 1
            self.updated_at = datetime.utcnow()
        
        return self
