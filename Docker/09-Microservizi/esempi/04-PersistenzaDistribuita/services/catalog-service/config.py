from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Elasticsearch settings
    ELASTICSEARCH_HOST: str = "elasticsearch"
    ELASTICSEARCH_PORT: int = 9200
    ELASTICSEARCH_USER: Optional[str] = None
    ELASTICSEARCH_PASSWORD: Optional[str] = None
    ELASTICSEARCH_INDEX_PREFIX: str = "catalog"
    
    # Redis settings
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 1
    REDIS_PASSWORD: Optional[str] = None
    REDIS_TTL: int = 3600  # 1 hour default TTL
    
    # Kafka settings
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC_PREFIX: str = "microservices"
    
    # Monitoring settings
    JAEGER_HOST: str = "jaeger"
    JAEGER_PORT: int = 6831
    
    # Service settings
    SERVICE_NAME: str = "catalog-service"
    LOG_LEVEL: str = "INFO"
    
    # Search settings
    SEARCH_MAX_RESULTS: int = 1000
    SEARCH_DEFAULT_SIZE: int = 20
    AUTOCOMPLETE_MAX_SUGGESTIONS: int = 10
    
    @property
    def elasticsearch_url(self) -> str:
        auth = ""
        if self.ELASTICSEARCH_USER and self.ELASTICSEARCH_PASSWORD:
            auth = f"{self.ELASTICSEARCH_USER}:{self.ELASTICSEARCH_PASSWORD}@"
        return f"http://{auth}{self.ELASTICSEARCH_HOST}:{self.ELASTICSEARCH_PORT}"
    
    @property
    def redis_url(self) -> str:
        auth = f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
        return f"redis://{auth}{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    class Config:
        env_file = ".env"

settings = Settings()
