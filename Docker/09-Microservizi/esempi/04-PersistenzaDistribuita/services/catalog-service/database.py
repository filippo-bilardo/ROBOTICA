import asyncio
from typing import Optional
from elasticsearch import AsyncElasticsearch
from redis.asyncio import Redis
import structlog

from config import settings

logger = structlog.get_logger()

# Global connections
elasticsearch_client: Optional[AsyncElasticsearch] = None
redis_client: Optional[Redis] = None

async def init_elasticsearch() -> AsyncElasticsearch:
    """Initialize Elasticsearch connection"""
    global elasticsearch_client
    
    try:
        elasticsearch_client = AsyncElasticsearch(
            hosts=[{
                'host': settings.ELASTICSEARCH_HOST,
                'port': settings.ELASTICSEARCH_PORT,
                'scheme': 'http'
            }],
            timeout=30,
            max_retries=3,
            retry_on_timeout=True
        )
        
        # Test connection
        await elasticsearch_client.ping()
        
        # Ensure indices exist
        await create_indices()
        
        logger.info("Elasticsearch connected successfully", 
                   host=settings.ELASTICSEARCH_HOST, 
                   port=settings.ELASTICSEARCH_PORT)
        
        return elasticsearch_client
    except Exception as e:
        logger.error("Failed to connect to Elasticsearch", error=str(e))
        raise

async def init_redis() -> Redis:
    """Initialize Redis connection"""
    global redis_client
    
    try:
        redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            encoding='utf-8',
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
            max_connections=20
        )
        
        # Test connection
        await redis_client.ping()
        
        logger.info("Redis connected successfully", 
                   host=settings.REDIS_HOST, 
                   port=settings.REDIS_PORT)
        
        return redis_client
    except Exception as e:
        logger.error("Failed to connect to Redis", error=str(e))
        raise

async def create_indices():
    """Create Elasticsearch indices if they don't exist"""
    try:
        # Products index
        products_mapping = {
            "mappings": {
                "properties": {
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "suggest": {"type": "completion"}
                        }
                    },
                    "description": {
                        "type": "text",
                        "analyzer": "standard"
                    },
                    "category_id": {"type": "keyword"},
                    "category_path": {"type": "keyword"},
                    "brand": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword"}}
                    },
                    "price": {"type": "float"},
                    "currency": {"type": "keyword"},
                    "stock_quantity": {"type": "integer"},
                    "sku": {"type": "keyword"},
                    "status": {"type": "keyword"},
                    "tags": {"type": "keyword"},
                    "attributes": {
                        "type": "nested",
                        "properties": {
                            "name": {"type": "keyword"},
                            "value": {"type": "keyword"},
                            "unit": {"type": "keyword"}
                        }
                    },
                    "variants": {
                        "type": "nested",
                        "properties": {
                            "sku": {"type": "keyword"},
                            "name": {"type": "text"},
                            "price": {"type": "float"},
                            "stock_quantity": {"type": "integer"}
                        }
                    },
                    "rating": {"type": "float"},
                    "review_count": {"type": "integer"},
                    "view_count": {"type": "integer"},
                    "purchase_count": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "suggest": {
                        "type": "completion",
                        "analyzer": "simple",
                        "contexts": [
                            {
                                "name": "category",
                                "type": "category"
                            }
                        ]
                    }
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "product_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop", "snowball"]
                        }
                    }
                }
            }
        }

        # Categories index
        categories_mapping = {
            "mappings": {
                "properties": {
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"},
                            "suggest": {"type": "completion"}
                        }
                    },
                    "description": {"type": "text"},
                    "parent_id": {"type": "keyword"},
                    "level": {"type": "integer"},
                    "path": {"type": "keyword"},
                    "product_count": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"}
                }
            }
        }

        # Search logs index for analytics
        search_logs_mapping = {
            "mappings": {
                "properties": {
                    "query": {"type": "text"},
                    "user_id": {"type": "keyword"},
                    "session_id": {"type": "keyword"},
                    "results_count": {"type": "integer"},
                    "clicked_products": {"type": "keyword"},
                    "category_filter": {"type": "keyword"},
                    "price_filter": {
                        "type": "object",
                        "properties": {
                            "min": {"type": "float"},
                            "max": {"type": "float"}
                        }
                    },
                    "timestamp": {"type": "date"},
                    "response_time": {"type": "integer"},
                    "filters_applied": {"type": "keyword"}
                }
            }
        }

        # Create indices
        indices = [
            ("products", products_mapping),
            ("categories", categories_mapping),
            ("search_logs", search_logs_mapping)
        ]

        for index_name, mapping in indices:
            if not await elasticsearch_client.indices.exists(index=index_name):
                await elasticsearch_client.indices.create(
                    index=index_name,
                    body=mapping
                )
                logger.info(f"Created Elasticsearch index: {index_name}")
            else:
                logger.info(f"Elasticsearch index already exists: {index_name}")

    except Exception as e:
        logger.error("Error creating Elasticsearch indices", error=str(e))
        raise

async def get_elasticsearch() -> AsyncElasticsearch:
    """Get Elasticsearch client"""
    if elasticsearch_client is None:
        raise RuntimeError("Elasticsearch not initialized")
    return elasticsearch_client

async def get_redis() -> Redis:
    """Get Redis client"""
    if redis_client is None:
        raise RuntimeError("Redis not initialized")
    return redis_client

async def close_connections():
    """Close all database connections"""
    global elasticsearch_client, redis_client
    
    try:
        if elasticsearch_client:
            await elasticsearch_client.close()
            elasticsearch_client = None
            logger.info("Elasticsearch connection closed")
        
        if redis_client:
            await redis_client.close()
            redis_client = None
            logger.info("Redis connection closed")
    except Exception as e:
        logger.error("Error closing database connections", error=str(e))

async def health_check() -> dict:
    """Check health of all database connections"""
    health = {}
    
    # Check Elasticsearch
    try:
        if elasticsearch_client:
            await elasticsearch_client.ping()
            health['elasticsearch'] = 'healthy'
        else:
            health['elasticsearch'] = 'not_connected'
    except Exception as e:
        health['elasticsearch'] = f'unhealthy: {str(e)}'
    
    # Check Redis
    try:
        if redis_client:
            await redis_client.ping()
            health['redis'] = 'healthy'
        else:
            health['redis'] = 'not_connected'
    except Exception as e:
        health['redis'] = f'unhealthy: {str(e)}'
    
    return health
