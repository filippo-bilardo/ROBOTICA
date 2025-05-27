import asyncio
from typing import Dict, List, Any, Optional
import structlog
from elasticsearch import AsyncElasticsearch
from datetime import datetime, timedelta

from config import settings

logger = structlog.get_logger()

class SearchService:
    """Service for Elasticsearch search operations"""
    
    def __init__(self):
        self.es: Optional[AsyncElasticsearch] = None
        self.product_index = "products"
        self.search_logs_index = "search_logs"
        self.category_index = "categories"
    
    async def get_elasticsearch(self) -> AsyncElasticsearch:
        """Get Elasticsearch connection"""
        if self.es is None:
            self.es = AsyncElasticsearch(
                hosts=[f"http://{settings.ELASTICSEARCH_HOST}:{settings.ELASTICSEARCH_PORT}"],
                retry_on_timeout=True,
                max_retries=3,
                timeout=30
            )
        return self.es
    
    async def search_products(
        self, 
        query: str, 
        filters: Dict[str, Any] = None,
        sort: List[Dict[str, str]] = None,
        size: int = 50,
        from_: int = 0
    ) -> Dict[str, Any]:
        """Advanced product search with filters and sorting"""
        try:
            es = await self.get_elasticsearch()
            
            # Build search query
            search_body = {
                "query": self._build_search_query(query, filters),
                "size": size,
                "from": from_,
                "highlight": {
                    "fields": {
                        "name": {},
                        "description": {},
                        "brand": {}
                    }
                },
                "aggs": {
                    "categories": {
                        "terms": {"field": "category.keyword", "size": 20}
                    },
                    "brands": {
                        "terms": {"field": "brand.keyword", "size": 20}
                    },
                    "price_ranges": {
                        "range": {
                            "field": "price",
                            "ranges": [
                                {"to": 50},
                                {"from": 50, "to": 100},
                                {"from": 100, "to": 200},
                                {"from": 200, "to": 500},
                                {"from": 500}
                            ]
                        }
                    },
                    "availability": {
                        "terms": {"field": "availability.keyword"}
                    }
                }
            }
            
            # Add sorting if specified
            if sort:
                search_body["sort"] = sort
            else:
                # Default sort by relevance and rating
                search_body["sort"] = [
                    {"_score": {"order": "desc"}},
                    {"rating": {"order": "desc"}},
                    {"created_at": {"order": "desc"}}
                ]
            
            # Log search query for analytics
            await self._log_search(query, filters)
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            # Process results
            products = []
            for hit in response["hits"]["hits"]:
                product = hit["_source"]
                product["id"] = hit["_id"]
                product["score"] = hit["_score"]
                
                # Add highlights if available
                if "highlight" in hit:
                    product["highlights"] = hit["highlight"]
                
                products.append(product)
            
            result = {
                "products": products,
                "total": response["hits"]["total"]["value"],
                "aggregations": response.get("aggregations", {}),
                "took": response["took"]
            }
            
            logger.info("Product search completed", 
                       query=query, 
                       filters=filters,
                       total_results=result["total"],
                       took_ms=result["took"])
            
            return result
            
        except Exception as e:
            logger.error("Product search error", query=query, filters=filters, error=str(e))
            raise
    
    def _build_search_query(self, query: str, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Build Elasticsearch query with filters"""
        must_clauses = []
        filter_clauses = []
        
        # Text search
        if query and query.strip():
            must_clauses.append({
                "multi_match": {
                    "query": query,
                    "fields": [
                        "name^3",           # Name has highest boost
                        "description^2",    # Description has medium boost
                        "brand^2",         # Brand has medium boost
                        "category",        # Category normal weight
                        "tags",           # Tags normal weight
                        "sku"            # SKU exact match
                    ],
                    "type": "best_fields",
                    "fuzziness": "AUTO",
                    "operator": "and"
                }
            })
        else:
            # If no query, match all
            must_clauses.append({"match_all": {}})
        
        # Apply filters
        if filters:
            # Category filter
            if "category" in filters and filters["category"]:
                filter_clauses.append({
                    "term": {"category.keyword": filters["category"]}
                })
            
            # Brand filter
            if "brand" in filters and filters["brand"]:
                if isinstance(filters["brand"], list):
                    filter_clauses.append({
                        "terms": {"brand.keyword": filters["brand"]}
                    })
                else:
                    filter_clauses.append({
                        "term": {"brand.keyword": filters["brand"]}
                    })
            
            # Price range filter
            if "price_min" in filters or "price_max" in filters:
                price_range = {}
                if "price_min" in filters:
                    price_range["gte"] = filters["price_min"]
                if "price_max" in filters:
                    price_range["lte"] = filters["price_max"]
                
                filter_clauses.append({
                    "range": {"price": price_range}
                })
            
            # Rating filter
            if "min_rating" in filters and filters["min_rating"]:
                filter_clauses.append({
                    "range": {"rating": {"gte": filters["min_rating"]}}
                })
            
            # Availability filter
            if "availability" in filters and filters["availability"]:
                filter_clauses.append({
                    "term": {"availability.keyword": filters["availability"]}
                })
            
            # In stock filter
            if "in_stock" in filters and filters["in_stock"]:
                filter_clauses.append({
                    "range": {"stock_quantity": {"gt": 0}}
                })
            
            # Tags filter
            if "tags" in filters and filters["tags"]:
                if isinstance(filters["tags"], list):
                    filter_clauses.append({
                        "terms": {"tags.keyword": filters["tags"]}
                    })
                else:
                    filter_clauses.append({
                        "term": {"tags.keyword": filters["tags"]}
                    })
            
            # Date range filter
            if "created_after" in filters or "created_before" in filters:
                date_range = {}
                if "created_after" in filters:
                    date_range["gte"] = filters["created_after"]
                if "created_before" in filters:
                    date_range["lte"] = filters["created_before"]
                
                filter_clauses.append({
                    "range": {"created_at": date_range}
                })
        
        # Build final query
        if filter_clauses:
            return {
                "bool": {
                    "must": must_clauses,
                    "filter": filter_clauses
                }
            }
        else:
            return {
                "bool": {
                    "must": must_clauses
                }
            }
    
    async def get_suggestions(self, query: str, size: int = 10) -> List[str]:
        """Get search suggestions using completion suggester"""
        try:
            es = await self.get_elasticsearch()
            
            suggest_body = {
                "suggest": {
                    "product_suggest": {
                        "prefix": query,
                        "completion": {
                            "field": "suggest",
                            "size": size,
                            "skip_duplicates": True
                        }
                    }
                }
            }
            
            response = await es.search(
                index=self.product_index,
                body=suggest_body
            )
            
            suggestions = []
            for option in response["suggest"]["product_suggest"][0]["options"]:
                suggestions.append(option["text"])
            
            logger.debug("Search suggestions generated", query=query, count=len(suggestions))
            return suggestions
            
        except Exception as e:
            logger.error("Search suggestions error", query=query, error=str(e))
            return []
    
    async def get_trending_searches(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending search queries from logs"""
        try:
            es = await self.get_elasticsearch()
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            search_body = {
                "query": {
                    "range": {
                        "timestamp": {
                            "gte": start_date.isoformat(),
                            "lte": end_date.isoformat()
                        }
                    }
                },
                "aggs": {
                    "trending_queries": {
                        "terms": {
                            "field": "query.keyword",
                            "size": limit,
                            "order": {"_count": "desc"}
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.search_logs_index,
                body=search_body
            )
            
            trending = []
            for bucket in response["aggregations"]["trending_queries"]["buckets"]:
                trending.append({
                    "query": bucket["key"],
                    "count": bucket["doc_count"]
                })
            
            logger.debug("Trending searches retrieved", count=len(trending), days=days)
            return trending
            
        except Exception as e:
            logger.error("Trending searches error", days=days, error=str(e))
            return []
    
    async def get_popular_products(self, category: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get popular products based on search activity and ratings"""
        try:
            es = await self.get_elasticsearch()
            
            # Build query
            query = {"match_all": {}}
            if category:
                query = {
                    "term": {"category.keyword": category}
                }
            
            search_body = {
                "query": query,
                "sort": [
                    {"search_count": {"order": "desc"}},
                    {"rating": {"order": "desc"}},
                    {"view_count": {"order": "desc"}}
                ],
                "size": limit
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            products = []
            for hit in response["hits"]["hits"]:
                product = hit["_source"]
                product["id"] = hit["_id"]
                products.append(product)
            
            logger.debug("Popular products retrieved", category=category, count=len(products))
            return products
            
        except Exception as e:
            logger.error("Popular products error", category=category, error=str(e))
            return []
    
    async def _log_search(self, query: str, filters: Dict[str, Any] = None):
        """Log search query for analytics"""
        try:
            es = await self.get_elasticsearch()
            
            log_doc = {
                "query": query,
                "filters": filters or {},
                "timestamp": datetime.utcnow().isoformat(),
                "user_agent": "",  # Could be extracted from request
                "ip_address": ""   # Could be extracted from request
            }
            
            await es.index(
                index=self.search_logs_index,
                body=log_doc
            )
            
        except Exception as e:
            logger.warning("Search logging failed", query=query, error=str(e))
    
    async def update_product_search_count(self, product_id: str):
        """Increment search count for a product"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index=self.product_index,
                id=product_id,
                body={
                    "script": {
                        "source": "ctx._source.search_count = (ctx._source.search_count ?: 0) + 1"
                    }
                },
                ignore=[404]
            )
            
        except Exception as e:
            logger.warning("Product search count update failed", 
                          product_id=product_id, error=str(e))
    
    async def bulk_index_products(self, products: List[Dict[str, Any]]) -> bool:
        """Bulk index products to Elasticsearch"""
        try:
            es = await self.get_elasticsearch()
            
            # Prepare bulk operations
            operations = []
            for product in products:
                # Add suggest field for autocompletion
                product["suggest"] = [
                    product.get("name", ""),
                    product.get("brand", ""),
                    product.get("category", "")
                ]
                
                operations.append({
                    "index": {
                        "_index": self.product_index,
                        "_id": product.get("id")
                    }
                })
                operations.append(product)
            
            if operations:
                response = await es.bulk(operations=operations)
                
                # Check for errors
                if response.get("errors"):
                    logger.warning("Bulk index had errors", 
                                  errors=[item for item in response["items"] if "error" in item])
                else:
                    logger.info("Bulk index completed", count=len(products))
                
                return not response.get("errors", False)
            
            return True
            
        except Exception as e:
            logger.error("Bulk index error", count=len(products), error=str(e))
            return False
    
    async def delete_product(self, product_id: str) -> bool:
        """Delete product from search index"""
        try:
            es = await self.get_elasticsearch()
            
            response = await es.delete(
                index=self.product_index,
                id=product_id,
                ignore=[404]
            )
            
            logger.debug("Product deleted from search index", product_id=product_id)
            return response.get("result") == "deleted"
            
        except Exception as e:
            logger.error("Product deletion from search index error", 
                        product_id=product_id, error=str(e))
            return False
    
    async def create_search_indices(self):
        """Create search indices with proper mappings"""
        try:
            es = await self.get_elasticsearch()
            
            # Create products index
            products_mapping = {
                "mappings": {
                    "properties": {
                        "name": {
                            "type": "text",
                            "analyzer": "standard",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "description": {"type": "text"},
                        "category": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "brand": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "price": {"type": "float"},
                        "rating": {"type": "float"},
                        "stock_quantity": {"type": "integer"},
                        "availability": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "tags": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "created_at": {"type": "date"},
                        "updated_at": {"type": "date"},
                        "search_count": {"type": "integer"},
                        "view_count": {"type": "integer"},
                        "suggest": {
                            "type": "completion",
                            "analyzer": "simple",
                            "preserve_separators": True,
                            "preserve_position_increments": True,
                            "max_input_length": 50
                        }
                    }
                }
            }
            
            await es.indices.create(
                index=self.product_index,
                body=products_mapping,
                ignore=[400]
            )
            
            # Create search logs index
            logs_mapping = {
                "mappings": {
                    "properties": {
                        "query": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "filters": {"type": "object"},
                        "timestamp": {"type": "date"},
                        "user_agent": {"type": "keyword"},
                        "ip_address": {"type": "ip"}
                    }
                }
            }
            
            await es.indices.create(
                index=self.search_logs_index,
                body=logs_mapping,
                ignore=[400]
            )
            
            logger.info("Search indices created successfully")
            
        except Exception as e:
            logger.error("Search indices creation error", error=str(e))
            raise
    
    async def close(self):
        """Close Elasticsearch connection"""
        if self.es:
            await self.es.close()
            self.es = None
            logger.info("Search service connection closed")
