import asyncio
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from database import get_db_session, init_db
from models import UserCreate, UserResponse, UserUpdate
from services.user_service import UserService
from services.event_store import EventStore
from services.projection_service import ProjectionService
from config import settings

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Configure OpenTelemetry
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name=settings.JAEGER_HOST,
    agent_port=settings.JAEGER_PORT,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Prometheus metrics
REQUEST_COUNT = Counter('user_service_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('user_service_request_duration_seconds', 'Request duration')
EVENT_COUNT = Counter('user_service_events_total', 'Total events', ['event_type'])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Starting User Service")
    
    # Initialize database
    await init_db()
    
    # Start projection service
    projection_service = ProjectionService()
    projection_task = asyncio.create_task(projection_service.start())
    
    yield
    
    # Cleanup
    projection_task.cancel()
    try:
        await projection_task
    except asyncio.CancelledError:
        pass
    
    logger.info("User Service stopped")

app = FastAPI(
    title="User Service",
    description="Microservice for user management with Event Sourcing and CQRS",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI with OpenTelemetry
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument()

async def get_user_service():
    """Dependency to get UserService instance"""
    async with get_db_session() as session:
        event_store = EventStore(session)
        return UserService(event_store)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    """Middleware to collect metrics"""
    with REQUEST_DURATION.time():
        response = await call_next(request)
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
    return response

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "user-service"}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user"""
    with tracer.start_as_current_span("create_user") as span:
        try:
            span.set_attribute("user.email", user_data.email)
            user = await user_service.create_user(user_data)
            EVENT_COUNT.labels(event_type="user_created").inc()
            logger.info("User created", user_id=user.id, email=user.email)
            return user
        except ValueError as e:
            logger.warning("User creation failed", error=str(e))
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error("User creation error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Get user by ID"""
    with tracer.start_as_current_span("get_user") as span:
        span.set_attribute("user.id", user_id)
        user = await user_service.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """Update user"""
    with tracer.start_as_current_span("update_user") as span:
        try:
            span.set_attribute("user.id", user_id)
            user = await user_service.update_user(user_id, user_data)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            EVENT_COUNT.labels(event_type="user_updated").inc()
            logger.info("User updated", user_id=user_id)
            return user
        except ValueError as e:
            logger.warning("User update failed", error=str(e))
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error("User update error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Delete user"""
    with tracer.start_as_current_span("delete_user") as span:
        try:
            span.set_attribute("user.id", user_id)
            success = await user_service.delete_user(user_id)
            if not success:
                raise HTTPException(status_code=404, detail="User not found")
            EVENT_COUNT.labels(event_type="user_deleted").inc()
            logger.info("User deleted", user_id=user_id)
        except Exception as e:
            logger.error("User deletion error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service)
):
    """List users with pagination"""
    with tracer.start_as_current_span("list_users") as span:
        span.set_attribute("pagination.skip", skip)
        span.set_attribute("pagination.limit", limit)
        users = await user_service.list_users(skip, limit)
        return users

@app.get("/api/users/{user_id}/events")
async def get_user_events(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """Get user event history"""
    with tracer.start_as_current_span("get_user_events") as span:
        span.set_attribute("user.id", user_id)
        events = await user_service.get_user_events(user_id)
        return {"user_id": user_id, "events": events}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
