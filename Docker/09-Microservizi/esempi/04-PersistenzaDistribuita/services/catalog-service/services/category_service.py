from typing import List, Dict, Any, Optional
import structlog
from elasticsearch import AsyncElasticsearch
from datetime import datetime

from config import settings
from models import CategoryResponse

logger = structlog.get_logger()

class CategoryService:
    """Service for managing product categories"""
    
    def __init__(self):
        self.es: Optional[AsyncElasticsearch] = None
        self.product_index = "products"
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
    
    async def get_all_categories(self) -> List[CategoryResponse]:
        """Get all categories with product counts"""
        try:
            es = await self.get_elasticsearch()
            
            # Get categories aggregation from products index
            search_body = {
                "aggs": {
                    "categories": {
                        "terms": {
                            "field": "category.keyword",
                            "size": 1000,
                            "order": {"_count": "desc"}
                        },
                        "aggs": {
                            "avg_price": {
                                "avg": {"field": "price"}
                            },
                            "min_price": {
                                "min": {"field": "price"}
                            },
                            "max_price": {
                                "max": {"field": "price"}
                            },
                            "avg_rating": {
                                "avg": {"field": "rating"}
                            }
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            categories = []
            for bucket in response["aggregations"]["categories"]["buckets"]:
                category = CategoryResponse(
                    name=bucket["key"],
                    product_count=bucket["doc_count"],
                    average_price=round(bucket["avg_price"]["value"] or 0, 2),
                    min_price=round(bucket["min_price"]["value"] or 0, 2),
                    max_price=round(bucket["max_price"]["value"] or 0, 2),
                    average_rating=round(bucket["avg_rating"]["value"] or 0, 2)
                )
                categories.append(category)
            
            logger.info("Categories retrieved", count=len(categories))
            return categories
            
        except Exception as e:
            logger.error("Get categories error", error=str(e))
            return []
    
    async def get_category_details(self, category_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed category information"""
        try:
            es = await self.get_elasticsearch()
            
            # Get category statistics
            search_body = {
                "query": {
                    "term": {"category.keyword": category_name}
                },
                "aggs": {
                    "stats": {
                        "stats": {"field": "price"}
                    },
                    "rating_stats": {
                        "stats": {"field": "rating"}
                    },
                    "brands": {
                        "terms": {
                            "field": "brand.keyword",
                            "size": 20,
                            "order": {"_count": "desc"}
                        }
                    },
                    "price_ranges": {
                        "range": {
                            "field": "price",
                            "ranges": [
                                {"key": "under_50", "to": 50},
                                {"key": "50_100", "from": 50, "to": 100},
                                {"key": "100_200", "from": 100, "to": 200},
                                {"key": "200_500", "from": 200, "to": 500},
                                {"key": "over_500", "from": 500}
                            ]
                        }
                    },
                    "availability": {
                        "terms": {"field": "availability.keyword"}
                    },
                    "popular_tags": {
                        "terms": {
                            "field": "tags.keyword",
                            "size": 10,
                            "order": {"_count": "desc"}
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            if response["hits"]["total"]["value"] == 0:
                return None
            
            aggs = response["aggregations"]
            
            # Process brands
            brands = []
            for bucket in aggs["brands"]["buckets"]:
                brands.append({
                    "name": bucket["key"],
                    "product_count": bucket["doc_count"]
                })
            
            # Process price ranges
            price_ranges = {}
            for bucket in aggs["price_ranges"]["buckets"]:
                price_ranges[bucket["key"]] = bucket["doc_count"]
            
            # Process availability
            availability = {}
            for bucket in aggs["availability"]["buckets"]:
                availability[bucket["key"]] = bucket["doc_count"]
            
            # Process popular tags
            tags = []
            for bucket in aggs["popular_tags"]["buckets"]:
                tags.append({
                    "name": bucket["key"],
                    "usage_count": bucket["doc_count"]
                })
            
            category_details = {
                "name": category_name,
                "total_products": response["hits"]["total"]["value"],
                "price_statistics": {
                    "min": round(aggs["stats"]["min"] or 0, 2),
                    "max": round(aggs["stats"]["max"] or 0, 2),
                    "avg": round(aggs["stats"]["avg"] or 0, 2),
                    "sum": round(aggs["stats"]["sum"] or 0, 2)
                },
                "rating_statistics": {
                    "min": round(aggs["rating_stats"]["min"] or 0, 2),
                    "max": round(aggs["rating_stats"]["max"] or 0, 2),
                    "avg": round(aggs["rating_stats"]["avg"] or 0, 2)
                },
                "brands": brands,
                "price_ranges": price_ranges,
                "availability": availability,
                "popular_tags": tags
            }
            
            logger.debug("Category details retrieved", category=category_name)
            return category_details
            
        except Exception as e:
            logger.error("Get category details error", category=category_name, error=str(e))
            return None
    
    async def get_category_hierarchy(self) -> Dict[str, Any]:
        """Get category hierarchy (assuming categories have parent/child relationships)"""
        try:
            es = await self.get_elasticsearch()
            
            # This is a simplified version - in a real system, you might have
            # a dedicated categories index with hierarchy information
            search_body = {
                "aggs": {
                    "categories": {
                        "terms": {
                            "field": "category.keyword",
                            "size": 1000
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            # Build a simple hierarchy based on category names
            # This assumes categories are named like "Electronics > Smartphones"
            hierarchy = {}
            
            for bucket in response["aggregations"]["categories"]["buckets"]:
                category_path = bucket["key"]
                product_count = bucket["doc_count"]
                
                # Split category path
                parts = [part.strip() for part in category_path.split(">")]
                
                # Navigate/create hierarchy
                current_level = hierarchy
                for i, part in enumerate(parts):
                    if part not in current_level:
                        current_level[part] = {
                            "name": part,
                            "full_path": " > ".join(parts[:i+1]),
                            "product_count": 0,
                            "children": {},
                            "level": i
                        }
                    
                    # Add product count to leaf node
                    if i == len(parts) - 1:
                        current_level[part]["product_count"] = product_count
                    
                    current_level = current_level[part]["children"]
            
            logger.debug("Category hierarchy built", total_categories=len(hierarchy))
            return hierarchy
            
        except Exception as e:
            logger.error("Get category hierarchy error", error=str(e))
            return {}
    
    async def get_trending_categories(self, days: int = 7, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending categories based on recent search activity"""
        try:
            es = await self.get_elasticsearch()
            
            # Calculate date range
            from datetime import datetime, timedelta
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get recent search logs grouped by category
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
                    "trending_categories": {
                        "terms": {
                            "field": "filters.category.keyword",
                            "size": limit,
                            "order": {"_count": "desc"}
                        }
                    }
                },
                "size": 0
            }
            
            try:
                response = await es.search(
                    index="search_logs",
                    body=search_body
                )
                
                trending = []
                for bucket in response["aggregations"]["trending_categories"]["buckets"]:
                    if bucket["key"]:  # Skip empty categories
                        trending.append({
                            "category": bucket["key"],
                            "search_count": bucket["doc_count"]
                        })
                
                logger.debug("Trending categories retrieved", count=len(trending), days=days)
                return trending
                
            except Exception:
                # Fallback to product-based trending (by recent product views/searches)
                return await self._get_trending_categories_fallback(limit)
            
        except Exception as e:
            logger.error("Get trending categories error", days=days, error=str(e))
            return []
    
    async def _get_trending_categories_fallback(self, limit: int) -> List[Dict[str, Any]]:
        """Fallback method for trending categories using product data"""
        try:
            es = await self.get_elasticsearch()
            
            # Get categories sorted by total search/view counts
            search_body = {
                "aggs": {
                    "trending_categories": {
                        "terms": {
                            "field": "category.keyword",
                            "size": limit,
                            "order": {"total_activity": "desc"}
                        },
                        "aggs": {
                            "total_activity": {
                                "sum": {
                                    "script": {
                                        "source": "(doc['search_count'].size() > 0 ? doc['search_count'].value : 0) + (doc['view_count'].size() > 0 ? doc['view_count'].value : 0)"
                                    }
                                }
                            }
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            trending = []
            for bucket in response["aggregations"]["trending_categories"]["buckets"]:
                trending.append({
                    "category": bucket["key"],
                    "activity_score": int(bucket["total_activity"]["value"] or 0)
                })
            
            return trending
            
        except Exception as e:
            logger.error("Trending categories fallback error", error=str(e))
            return []
    
    async def get_category_recommendations(self, category_name: str, limit: int = 5) -> List[str]:
        """Get related category recommendations"""
        try:
            es = await self.get_elasticsearch()
            
            # Find products in the given category
            search_body = {
                "query": {
                    "term": {"category.keyword": category_name}
                },
                "aggs": {
                    "related_brands": {
                        "terms": {
                            "field": "brand.keyword",
                            "size": 10
                        }
                    },
                    "related_tags": {
                        "terms": {
                            "field": "tags.keyword",
                            "size": 20
                        }
                    }
                },
                "size": 0
            }
            
            response = await es.search(
                index=self.product_index,
                body=search_body
            )
            
            if response["hits"]["total"]["value"] == 0:
                return []
            
            # Extract brands and tags to find related categories
            brands = [bucket["key"] for bucket in response["aggregations"]["related_brands"]["buckets"]]
            tags = [bucket["key"] for bucket in response["aggregations"]["related_tags"]["buckets"]]
            
            # Find categories that share these brands or tags
            related_search_body = {
                "query": {
                    "bool": {
                        "should": [
                            {"terms": {"brand.keyword": brands}},
                            {"terms": {"tags.keyword": tags}}
                        ],
                        "must_not": [
                            {"term": {"category.keyword": category_name}}
                        ]
                    }
                },
                "aggs": {
                    "related_categories": {
                        "terms": {
                            "field": "category.keyword",
                            "size": limit,
                            "order": {"_count": "desc"}
                        }
                    }
                },
                "size": 0
            }
            
            related_response = await es.search(
                index=self.product_index,
                body=related_search_body
            )
            
            recommendations = []
            for bucket in related_response["aggregations"]["related_categories"]["buckets"]:
                recommendations.append(bucket["key"])
            
            logger.debug("Category recommendations generated", 
                        category=category_name, 
                        recommendations_count=len(recommendations))
            
            return recommendations
            
        except Exception as e:
            logger.error("Category recommendations error", category=category_name, error=str(e))
            return []
    
    async def update_category_metadata(self, category_name: str, metadata: Dict[str, Any]) -> bool:
        """Update category metadata (if using dedicated category index)"""
        try:
            es = await self.get_elasticsearch()
            
            # Check if category index exists
            if not await es.indices.exists(index=self.category_index):
                await self._create_category_index()
            
            # Upsert category metadata
            doc = {
                "name": category_name,
                "metadata": metadata,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            await es.index(
                index=self.category_index,
                id=category_name,
                body=doc
            )
            
            logger.info("Category metadata updated", category=category_name)
            return True
            
        except Exception as e:
            logger.error("Category metadata update error", 
                        category=category_name, error=str(e))
            return False
    
    async def _create_category_index(self):
        """Create dedicated category index"""
        try:
            es = await self.get_elasticsearch()
            
            mapping = {
                "mappings": {
                    "properties": {
                        "name": {
                            "type": "text",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "metadata": {"type": "object"},
                        "created_at": {"type": "date"},
                        "updated_at": {"type": "date"}
                    }
                }
            }
            
            await es.indices.create(
                index=self.category_index,
                body=mapping,
                ignore=[400]
            )
            
            logger.info("Category index created")
            
        except Exception as e:
            logger.error("Category index creation error", error=str(e))
            raise
    
    async def close(self):
        """Close Elasticsearch connection"""
        if self.es:
            await self.es.close()
            self.es = None
            logger.info("Category service connection closed")
