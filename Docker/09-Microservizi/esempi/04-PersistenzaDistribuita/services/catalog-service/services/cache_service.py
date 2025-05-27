import json
import asyncio
from typing import Optional, Dict, Any, List
import structlog
from redis.asyncio import Redis

from config import settings

logger = structlog.get_logger()

class CacheService:
    """Service for managing Redis cache operations"""
    
    def __init__(self):
        self.redis: Optional[Redis] = None
        self.default_ttl = 3600  # 1 hour
        self.key_prefix = "catalog:"
    
    async def get_redis(self) -> Redis:
        """Get Redis connection"""
        if self.redis is None:
            self.redis = Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                decode_responses=True,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={}
            )
        return self.redis
    
    def _get_key(self, key: str) -> str:
        """Get prefixed cache key"""
        return f"{self.key_prefix}{key}"
    
    async def get(self, key: str) -> Optional[Dict[Any, Any]]:
        """Get value from cache"""
        try:
            redis = await self.get_redis()
            cache_key = self._get_key(key)
            value = await redis.get(cache_key)
            
            if value:
                logger.debug("Cache hit", key=key)
                return json.loads(value)
            
            logger.debug("Cache miss", key=key)
            return None
            
        except Exception as e:
            logger.error("Cache get error", key=key, error=str(e))
            return None
    
    async def set(self, key: str, value: Dict[Any, Any], ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            redis = await self.get_redis()
            cache_key = self._get_key(key)
            ttl = ttl or self.default_ttl
            
            serialized_value = json.dumps(value, default=str)
            await redis.setex(cache_key, ttl, serialized_value)
            
            logger.debug("Cache set", key=key, ttl=ttl)
            return True
            
        except Exception as e:
            logger.error("Cache set error", key=key, error=str(e))
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            redis = await self.get_redis()
            cache_key = self._get_key(key)
            result = await redis.delete(cache_key)
            
            logger.debug("Cache delete", key=key, deleted=bool(result))
            return bool(result)
            
        except Exception as e:
            logger.error("Cache delete error", key=key, error=str(e))
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        try:
            redis = await self.get_redis()
            cache_pattern = self._get_key(pattern)
            
            # Use SCAN to find matching keys
            keys = []
            async for key in redis.scan_iter(match=cache_pattern):
                keys.append(key)
            
            if keys:
                deleted_count = await redis.delete(*keys)
                logger.debug("Cache pattern delete", pattern=pattern, deleted_count=deleted_count)
                return deleted_count
            
            return 0
            
        except Exception as e:
            logger.error("Cache pattern delete error", pattern=pattern, error=str(e))
            return 0
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            redis = await self.get_redis()
            cache_key = self._get_key(key)
            result = await redis.exists(cache_key)
            return bool(result)
            
        except Exception as e:
            logger.error("Cache exists error", key=key, error=str(e))
            return False
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment numeric value in cache"""
        try:
            redis = await self.get_redis()
            cache_key = self._get_key(key)
            result = await redis.incrby(cache_key, amount)
            
            logger.debug("Cache increment", key=key, amount=amount, new_value=result)
            return result
            
        except Exception as e:
            logger.error("Cache increment error", key=key, error=str(e))
            return None
    
    async def set_with_expiry(self, key: str, value: Dict[Any, Any], seconds: int) -> bool:
        """Set value with specific expiry time"""
        return await self.set(key, value, ttl=seconds)
    
    async def get_multiple(self, keys: List[str]) -> Dict[str, Optional[Dict[Any, Any]]]:
        """Get multiple values from cache"""
        try:
            redis = await self.get_redis()
            cache_keys = [self._get_key(key) for key in keys]
            values = await redis.mget(cache_keys)
            
            result = {}
            for i, (original_key, value) in enumerate(zip(keys, values)):
                if value:
                    try:
                        result[original_key] = json.loads(value)
                        logger.debug("Cache multi hit", key=original_key)
                    except json.JSONDecodeError:
                        result[original_key] = None
                        logger.warning("Cache multi json decode error", key=original_key)
                else:
                    result[original_key] = None
                    logger.debug("Cache multi miss", key=original_key)
            
            return result
            
        except Exception as e:
            logger.error("Cache get multiple error", keys=keys, error=str(e))
            return {key: None for key in keys}
    
    async def set_multiple(self, data: Dict[str, Dict[Any, Any]], ttl: Optional[int] = None) -> bool:
        """Set multiple values in cache"""
        try:
            redis = await self.get_redis()
            ttl = ttl or self.default_ttl
            
            # Use pipeline for efficiency
            pipe = redis.pipeline()
            
            for key, value in data.items():
                cache_key = self._get_key(key)
                serialized_value = json.dumps(value, default=str)
                pipe.setex(cache_key, ttl, serialized_value)
            
            await pipe.execute()
            
            logger.debug("Cache set multiple", count=len(data), ttl=ttl)
            return True
            
        except Exception as e:
            logger.error("Cache set multiple error", count=len(data), error=str(e))
            return False
    
    async def get_or_set(self, key: str, fetch_func, ttl: Optional[int] = None) -> Optional[Dict[Any, Any]]:
        """Get from cache or fetch and set if not exists"""
        try:
            # Try to get from cache first
            cached_value = await self.get(key)
            if cached_value is not None:
                return cached_value
            
            # Fetch new value
            if asyncio.iscoroutinefunction(fetch_func):
                value = await fetch_func()
            else:
                value = fetch_func()
            
            if value is not None:
                # Set in cache
                await self.set(key, value, ttl)
                return value
            
            return None
            
        except Exception as e:
            logger.error("Cache get or set error", key=key, error=str(e))
            return None
    
    async def invalidate_cache(self, keys: Optional[List[str]] = None) -> bool:
        """Invalidate cache entries"""
        try:
            if keys:
                # Delete specific keys
                success = True
                for key in keys:
                    result = await self.delete(key)
                    success = success and result
                return success
            else:
                # Delete all catalog cache entries
                deleted_count = await self.delete_pattern("*")
                logger.info("Cache invalidated", deleted_count=deleted_count)
                return True
                
        except Exception as e:
            logger.error("Cache invalidation error", keys=keys, error=str(e))
            return False
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            redis = await self.get_redis()
            info = await redis.info()
            
            return {
                "memory_used": info.get("used_memory_human", "unknown"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get("total_commands_processed", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
            }
            
        except Exception as e:
            logger.error("Cache stats error", error=str(e))
            return {}
    
    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            self.redis = None
            logger.info("Cache service connection closed")
