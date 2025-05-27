import asyncio
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.elasticsearch import ElasticsearchInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from config import settings
from database import init_elasticsearch, init_redis
from models import ProductCreate, ProductResponse, ProductUpdate, ProductSearch, CategoryResponse
from services.product_service import ProductService
from services.cache_service import CacheService
from services.search_service import SearchService
from services.category_service import CategoryService
from services.event_consumer import EventConsumer

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
REQUEST_COUNT = Counter('catalog_service_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('catalog_service_request_duration_seconds', 'Request duration')
SEARCH_COUNT = Counter('catalog_service_searches_total', 'Total searches', ['query_type'])
CACHE_HITS = Counter('catalog_service_cache_hits_total', 'Cache hits', ['cache_type'])
CACHE_MISSES = Counter('catalog_service_cache_misses_total', 'Cache misses', ['cache_type'])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("Starting Catalog Service")
    
    # Initialize connections
    await init_elasticsearch()
    await init_redis()
    
    # Start event consumer
    event_consumer = EventConsumer()
    consumer_task = asyncio.create_task(event_consumer.start())
    
    yield
    
    # Cleanup
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        pass
    
    logger.info("Catalog Service stopped")

app = FastAPI(
    title="Catalog Service",
    description="Product catalog microservice with Elasticsearch and Redis caching",
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
ElasticsearchInstrumentor().instrument()

async def get_product_service():
    """Dependency to get ProductService instance"""
    cache_service = CacheService()
    search_service = SearchService()
    return ProductService(cache_service, search_service)

async def get_category_service():
    """Dependency to get CategoryService instance"""
    return CategoryService()

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
    return {"status": "healthy", "service": "catalog-service"}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

@app.post("/api/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    product_service: ProductService = Depends(get_product_service)
):
    """Create a new product"""
    with tracer.start_as_current_span("create_product") as span:
        try:
            span.set_attribute("product.name", product_data.name)
            span.set_attribute("product.category", product_data.category)
            product = await product_service.create_product(product_data)
            logger.info("Product created", product_id=product.id, name=product.name)
            return product
        except ValueError as e:
            logger.warning("Product creation failed", error=str(e))
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error("Product creation error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    product_service: ProductService = Depends(get_product_service)
):
    """Get product by ID"""
    with tracer.start_as_current_span("get_product") as span:
        span.set_attribute("product.id", product_id)
        product = await product_service.get_product(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

@app.put("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    product_service: ProductService = Depends(get_product_service)
):
    """Update product"""
    with tracer.start_as_current_span("update_product") as span:
        try:
            span.set_attribute("product.id", product_id)
            product = await product_service.update_product(product_id, product_data)
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            logger.info("Product updated", product_id=product_id)
            return product
        except ValueError as e:
            logger.warning("Product update failed", error=str(e))
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error("Product update error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    product_service: ProductService = Depends(get_product_service)
):
    """Delete product"""
    with tracer.start_as_current_span("delete_product") as span:
        try:
            span.set_attribute("product.id", product_id)
            success = await product_service.delete_product(product_id)
            if not success:
                raise HTTPException(status_code=404, detail="Product not found")
            logger.info("Product deleted", product_id=product_id)
        except Exception as e:
            logger.error("Product deletion error", error=str(e))
            raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/products", response_model=list[ProductResponse])
async def list_products(
    category: str = Query(None, description="Filter by category"),
    skip: int = Query(0, description="Number of products to skip"),
    limit: int = Query(100, description="Maximum number of products to return"),
    product_service: ProductService = Depends(get_product_service)
):
    """List products with optional filtering and pagination"""
    with tracer.start_as_current_span("list_products") as span:
        span.set_attribute("pagination.skip", skip)
        span.set_attribute("pagination.limit", limit)
        if category:
            span.set_attribute("filter.category", category)
        products = await product_service.list_products(category, skip, limit)
        return products

@app.post("/api/products/search", response_model=list[ProductResponse])
async def search_products(
    search_request: ProductSearch,
    product_service: ProductService = Depends(get_product_service)
):
    """Search products using Elasticsearch"""
    with tracer.start_as_current_span("search_products") as span:
        try:
            span.set_attribute("search.query", search_request.query)
            span.set_attribute("search.filters", str(search_request.filters))
            
            SEARCH_COUNT.labels(query_type="text_search").inc()
            
            products = await product_service.search_products(search_request)
            logger.info("Product search completed", 
                       query=search_request.query, 
                       results_count=len(products))
            return products
        except Exception as e:
            logger.error("Product search error", error=str(e))
            raise HTTPException(status_code=500, detail="Search failed")

@app.get("/api/products/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., description="Search query for suggestions"),
    product_service: ProductService = Depends(get_product_service)
):
    """Get search suggestions"""
    with tracer.start_as_current_span("get_suggestions") as span:
        try:
            span.set_attribute("search.query", query)
            SEARCH_COUNT.labels(query_type="suggestions").inc()
            suggestions = await product_service.get_search_suggestions(query)
            return {"suggestions": suggestions}
        except Exception as e:
            logger.error("Search suggestions error", error=str(e))
            raise HTTPException(status_code=500, detail="Failed to get suggestions")

@app.get("/api/categories", response_model=list[CategoryResponse])
async def list_categories(
    category_service: CategoryService = Depends(get_category_service)
):
    """List all product categories"""
    with tracer.start_as_current_span("list_categories") as span:
        categories = await category_service.get_all_categories()
        return categories

@app.get("/api/products/category/{category_name}", response_model=list[ProductResponse])
async def get_products_by_category(
    category_name: str,
    skip: int = Query(0, description="Number of products to skip"),
    limit: int = Query(100, description="Maximum number of products to return"),
    product_service: ProductService = Depends(get_product_service)
):
    """Get products by category"""
    with tracer.start_as_current_span("get_products_by_category") as span:
        span.set_attribute("category.name", category_name)
        span.set_attribute("pagination.skip", skip)
        span.set_attribute("pagination.limit", limit)
        products = await product_service.get_products_by_category(category_name, skip, limit)
        return products

@app.get("/api/categories/{category_name}/details")
async def get_category_details(
    category_name: str,
    category_service: CategoryService = Depends(get_category_service)
):
    """Get detailed category information"""
    with tracer.start_as_current_span("get_category_details") as span:
        span.set_attribute("category.name", category_name)
        details = await category_service.get_category_details(category_name)
        if not details:
            raise HTTPException(status_code=404, detail="Category not found")
        return details

@app.get("/api/categories/trending")
async def get_trending_categories(
    days: int = Query(7, description="Number of days to look back"),
    limit: int = Query(10, description="Number of trending categories to return"),
    category_service: CategoryService = Depends(get_category_service)
):
    """Get trending categories"""
    with tracer.start_as_current_span("get_trending_categories") as span:
        span.set_attribute("days", days)
        span.set_attribute("limit", limit)
        trending = await category_service.get_trending_categories(days, limit)
        return {"trending_categories": trending}

@app.get("/api/categories/{category_name}/recommendations")
async def get_category_recommendations(
    category_name: str,
    limit: int = Query(5, description="Number of recommendations to return"),
    category_service: CategoryService = Depends(get_category_service)
):
    """Get related category recommendations"""
    with tracer.start_as_current_span("get_category_recommendations") as span:
        span.set_attribute("category.name", category_name)
        span.set_attribute("limit", limit)
        recommendations = await category_service.get_category_recommendations(category_name, limit)
        return {"recommendations": recommendations}

@app.get("/api/products/trending")
async def get_trending_products(
    limit: int = Query(10, description="Number of trending products to return"),
    product_service: ProductService = Depends(get_product_service)
):
    """Get trending products based on search activity"""
    with tracer.start_as_current_span("get_trending_products") as span:
        span.set_attribute("limit", limit)
        products = await product_service.get_trending_products(limit)
        return {"trending_products": products}

@app.post("/api/cache/invalidate")
async def invalidate_cache(
    cache_keys: list[str] = None,
    product_service: ProductService = Depends(get_product_service)
):
    """Invalidate cache entries"""
    with tracer.start_as_current_span("invalidate_cache") as span:
        try:
            await product_service.invalidate_cache(cache_keys)
            logger.info("Cache invalidated", cache_keys=cache_keys)
            return {"message": "Cache invalidated successfully"}
        except Exception as e:
            logger.error("Cache invalidation error", error=str(e))
            raise HTTPException(status_code=500, detail="Cache invalidation failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
