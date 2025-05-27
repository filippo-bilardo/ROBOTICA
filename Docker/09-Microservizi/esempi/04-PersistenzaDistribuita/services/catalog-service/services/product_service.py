import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from elasticsearch import AsyncElasticsearch
import structlog

from database import get_elasticsearch
from models import (
    Product, ProductCreate, ProductUpdate, ProductSearch, 
    ProductSearchResponse, ProductResponse, StockUpdate, 
    PriceUpdate, AnalyticsEvent
)

logger = structlog.get_logger()

class ProductService:
    def __init__(self):
        self.index_name = "products"

    async def create_product(self, product_data: ProductCreate, correlation_id: Optional[str] = None) -> ProductResponse:
        """Create a new product"""
        es = await get_elasticsearch()
        
        try:
            product_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            # Prepare product document
            product_doc = {
                "id": product_id,
                **product_data.dict(),
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "view_count": 0,
                "purchase_count": 0,
                "rating": None,
                "review_count": 0
            }
            
            # Add suggestion field for autocomplete
            product_doc["suggest"] = {
                "input": [product_data.name, product_data.brand] if product_data.brand else [product_data.name],
                "contexts": {
                    "category": [product_data.category_id]
                }
            }
            
            # Index the product
            await es.index(
                index=self.index_name,
                id=product_id,
                body=product_doc,
                refresh=True
            )
            
            logger.info("Product created", 
                       product_id=product_id, 
                       name=product_data.name,
                       correlation_id=correlation_id)
            
            return ProductResponse(**product_doc)
            
        except Exception as e:
            logger.error("Error creating product", error=str(e), correlation_id=correlation_id)
            raise

    async def get_product(self, product_id: str) -> Optional[ProductResponse]:
        """Get product by ID"""
        es = await get_elasticsearch()
        
        try:
            result = await es.get(index=self.index_name, id=product_id)
            if result["found"]:
                product_data = result["_source"]
                return ProductResponse(**product_data)
            return None
            
        except Exception as e:
            if "not_found" not in str(e).lower():
                logger.error("Error getting product", product_id=product_id, error=str(e))
            return None

    async def update_product(self, product_id: str, product_data: ProductUpdate, correlation_id: Optional[str] = None) -> Optional[ProductResponse]:
        """Update product"""
        es = await get_elasticsearch()
        
        try:
            # Get existing product
            existing = await es.get(index=self.index_name, id=product_id)
            if not existing["found"]:
                return None
            
            # Prepare update data
            update_data = {k: v for k, v in product_data.dict().items() if v is not None}
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Update suggestion if name or brand changed
            if "name" in update_data or "brand" in update_data:
                current_data = existing["_source"]
                name = update_data.get("name", current_data.get("name"))
                brand = update_data.get("brand", current_data.get("brand"))
                category_id = update_data.get("category_id", current_data.get("category_id"))
                
                update_data["suggest"] = {
                    "input": [name, brand] if brand else [name],
                    "contexts": {
                        "category": [category_id]
                    }
                }
            
            # Update document
            await es.update(
                index=self.index_name,
                id=product_id,
                body={"doc": update_data},
                refresh=True
            )
            
            # Get updated document
            updated = await es.get(index=self.index_name, id=product_id)
            
            logger.info("Product updated", 
                       product_id=product_id,
                       fields=list(update_data.keys()),
                       correlation_id=correlation_id)
            
            return ProductResponse(**updated["_source"])
            
        except Exception as e:
            logger.error("Error updating product", product_id=product_id, error=str(e), correlation_id=correlation_id)
            raise

    async def delete_product(self, product_id: str, correlation_id: Optional[str] = None) -> bool:
        """Delete product"""
        es = await get_elasticsearch()
        
        try:
            result = await es.delete(
                index=self.index_name,
                id=product_id,
                refresh=True
            )
            
            logger.info("Product deleted", 
                       product_id=product_id,
                       correlation_id=correlation_id)
            
            return result["result"] == "deleted"
            
        except Exception as e:
            if "not_found" not in str(e).lower():
                logger.error("Error deleting product", product_id=product_id, error=str(e), correlation_id=correlation_id)
            return False

    async def search_products(self, search_params: ProductSearch) -> ProductSearchResponse:
        """Search products with filters and pagination"""
        es = await get_elasticsearch()
        
        try:
            # Build Elasticsearch query
            query = self._build_search_query(search_params)
            
            # Calculate pagination
            from_offset = (search_params.page - 1) * search_params.size
            
            # Execute search
            result = await es.search(
                index=self.index_name,
                body={
                    "query": query,
                    "from": from_offset,
                    "size": search_params.size,
                    "sort": self._build_sort_query(search_params.sort_by),
                    "aggs": self._build_aggregations()
                }
            )
            
            # Process results
            products = []
            for hit in result["hits"]["hits"]:
                product_data = hit["_source"]
                products.append(ProductResponse(**product_data))
            
            total = result["hits"]["total"]["value"]
            total_pages = (total + search_params.size - 1) // search_params.size
            
            # Process facets
            facets = self._process_aggregations(result.get("aggregations", {}))
            
            # Log search analytics
            await self._log_search_analytics(search_params, total)
            
            return ProductSearchResponse(
                products=products,
                total=total,
                page=search_params.page,
                size=search_params.size,
                total_pages=total_pages,
                facets=facets
            )
            
        except Exception as e:
            logger.error("Error searching products", error=str(e), search_params=search_params.dict())
            raise

    async def get_product_suggestions(self, query: str, category_id: Optional[str] = None, size: int = 10) -> List[str]:
        """Get product name suggestions for autocomplete"""
        es = await get_elasticsearch()
        
        try:
            suggest_query = {
                "suggest": {
                    "product_suggest": {
                        "prefix": query,
                        "completion": {
                            "field": "suggest",
                            "size": size
                        }
                    }
                }
            }
            
            # Add category context if provided
            if category_id:
                suggest_query["suggest"]["product_suggest"]["completion"]["contexts"] = {
                    "category": [category_id]
                }
            
            result = await es.search(index=self.index_name, body=suggest_query)
            
            suggestions = []
            for option in result["suggest"]["product_suggest"][0]["options"]:
                suggestions.append(option["text"])
            
            return suggestions
            
        except Exception as e:
            logger.error("Error getting suggestions", query=query, error=str(e))
            return []

    async def update_stock(self, stock_update: StockUpdate, correlation_id: Optional[str] = None) -> bool:
        """Update product stock quantity"""
        es = await get_elasticsearch()
        
        try:
            # Get current product
            product = await es.get(index=self.index_name, id=stock_update.product_id)
            if not product["found"]:
                logger.warning("Product not found for stock update", product_id=stock_update.product_id)
                return False
            
            current_stock = product["_source"].get("stock_quantity", 0)
            new_stock = max(0, current_stock + stock_update.quantity_change)
            
            # Update stock
            await es.update(
                index=self.index_name,
                id=stock_update.product_id,
                body={
                    "doc": {
                        "stock_quantity": new_stock,
                        "updated_at": datetime.utcnow().isoformat()
                    }
                },
                refresh=True
            )
            
            logger.info("Stock updated", 
                       product_id=stock_update.product_id,
                       old_stock=current_stock,
                       new_stock=new_stock,
                       change=stock_update.quantity_change,
                       reason=stock_update.reason,
                       correlation_id=correlation_id)
            
            return True
            
        except Exception as e:
            logger.error("Error updating stock", 
                        product_id=stock_update.product_id, 
                        error=str(e), 
                        correlation_id=correlation_id)
            return False

    async def update_price(self, price_update: PriceUpdate, correlation_id: Optional[str] = None) -> bool:
        """Update product price"""
        es = await get_elasticsearch()
        
        try:
            update_data = {
                "price": price_update.new_price,
                "currency": price_update.currency,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            await es.update(
                index=self.index_name,
                id=price_update.product_id,
                body={"doc": update_data},
                refresh=True
            )
            
            logger.info("Price updated", 
                       product_id=price_update.product_id,
                       new_price=price_update.new_price,
                       currency=price_update.currency,
                       reason=price_update.reason,
                       correlation_id=correlation_id)
            
            return True
            
        except Exception as e:
            logger.error("Error updating price", 
                        product_id=price_update.product_id, 
                        error=str(e), 
                        correlation_id=correlation_id)
            return False

    async def increment_view_count(self, product_id: str) -> bool:
        """Increment product view count"""
        es = await get_elasticsearch()
        
        try:
            await es.update(
                index=self.index_name,
                id=product_id,
                body={
                    "script": {
                        "source": "ctx._source.view_count += 1",
                        "lang": "painless"
                    }
                }
            )
            return True
            
        except Exception as e:
            logger.error("Error incrementing view count", product_id=product_id, error=str(e))
            return False

    async def increment_purchase_count(self, product_id: str, quantity: int = 1) -> bool:
        """Increment product purchase count"""
        es = await get_elasticsearch()
        
        try:
            await es.update(
                index=self.index_name,
                id=product_id,
                body={
                    "script": {
                        "source": f"ctx._source.purchase_count += {quantity}",
                        "lang": "painless"
                    }
                }
            )
            return True
            
        except Exception as e:
            logger.error("Error incrementing purchase count", product_id=product_id, error=str(e))
            return False

    def _build_search_query(self, search_params: ProductSearch) -> Dict[str, Any]:
        """Build Elasticsearch query from search parameters"""
        must_clauses = []
        filter_clauses = []
        
        # Text search
        if search_params.query:
            must_clauses.append({
                "multi_match": {
                    "query": search_params.query,
                    "fields": ["name^3", "description", "brand^2", "tags"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            })
        
        # Filters
        if search_params.category_id:
            filter_clauses.append({"term": {"category_id": search_params.category_id}})
        
        if search_params.brand:
            filter_clauses.append({"term": {"brand.keyword": search_params.brand}})
        
        if search_params.status:
            filter_clauses.append({"term": {"status": search_params.status}})
        
        if search_params.tags:
            filter_clauses.append({"terms": {"tags": search_params.tags}})
        
        if search_params.in_stock_only:
            filter_clauses.append({"range": {"stock_quantity": {"gt": 0}}})
        
        # Price range
        if search_params.min_price is not None or search_params.max_price is not None:
            price_range = {}
            if search_params.min_price is not None:
                price_range["gte"] = search_params.min_price
            if search_params.max_price is not None:
                price_range["lte"] = search_params.max_price
            filter_clauses.append({"range": {"price": price_range}})
        
        # Build final query
        if must_clauses or filter_clauses:
            query = {"bool": {}}
            if must_clauses:
                query["bool"]["must"] = must_clauses
            if filter_clauses:
                query["bool"]["filter"] = filter_clauses
        else:
            query = {"match_all": {}}
        
        return query

    def _build_sort_query(self, sort_by: str) -> List[Dict[str, Any]]:
        """Build sort query"""
        sort_mapping = {
            "relevance": ["_score"],
            "price_asc": [{"price": {"order": "asc"}}],
            "price_desc": [{"price": {"order": "desc"}}],
            "created_at": [{"created_at": {"order": "desc"}}],
            "popularity": [{"purchase_count": {"order": "desc"}}, {"view_count": {"order": "desc"}}],
            "rating": [{"rating": {"order": "desc", "missing": "_last"}}],
            "name": [{"name.keyword": {"order": "asc"}}]
        }
        
        return sort_mapping.get(sort_by, ["_score"])

    def _build_aggregations(self) -> Dict[str, Any]:
        """Build aggregations for faceted search"""
        return {
            "categories": {
                "terms": {"field": "category_id", "size": 20}
            },
            "brands": {
                "terms": {"field": "brand.keyword", "size": 20}
            },
            "price_ranges": {
                "range": {
                    "field": "price",
                    "ranges": [
                        {"to": 25},
                        {"from": 25, "to": 50},
                        {"from": 50, "to": 100},
                        {"from": 100, "to": 200},
                        {"from": 200}
                    ]
                }
            },
            "status": {
                "terms": {"field": "status"}
            },
            "in_stock": {
                "range": {
                    "field": "stock_quantity",
                    "ranges": [
                        {"from": 1, "key": "in_stock"},
                        {"to": 1, "key": "out_of_stock"}
                    ]
                }
            }
        }

    def _process_aggregations(self, aggregations: Dict[str, Any]) -> Dict[str, Any]:
        """Process aggregation results into facets"""
        facets = {}
        
        for agg_name, agg_data in aggregations.items():
            if "buckets" in agg_data:
                facets[agg_name] = [
                    {"key": bucket["key"], "count": bucket["doc_count"]}
                    for bucket in agg_data["buckets"]
                ]
        
        return facets

    async def _log_search_analytics(self, search_params: ProductSearch, results_count: int):
        """Log search analytics for reporting"""
        try:
            es = await get_elasticsearch()
            
            analytics_doc = {
                "query": search_params.query,
                "category_filter": search_params.category_id,
                "brand_filter": search_params.brand,
                "price_filter": {
                    "min": search_params.min_price,
                    "max": search_params.max_price
                } if search_params.min_price or search_params.max_price else None,
                "tag_filters": search_params.tags,
                "in_stock_only": search_params.in_stock_only,
                "sort_by": search_params.sort_by,
                "results_count": results_count,
                "timestamp": datetime.utcnow().isoformat(),
                "page": search_params.page,
                "size": search_params.size
            }
            
            await es.index(
                index="search_logs",
                body=analytics_doc
            )
            
        except Exception as e:
            logger.error("Error logging search analytics", error=str(e))
    
    # Event Consumer Integration Methods
    
    async def update_product_stock(self, product_id: str, new_stock: int) -> bool:
        """Update product stock quantity"""
        try:
            es = await self.get_elasticsearch()
            
            response = await es.update(
                index="products",
                id=product_id,
                body={
                    "doc": {
                        "stock_quantity": new_stock,
                        "availability": "in_stock" if new_stock > 0 else "out_of_stock",
                        "updated_at": datetime.utcnow().isoformat()
                    }
                },
                ignore=[404]
            )
            
            if response.get("result") == "updated":
                logger.info("Product stock updated", product_id=product_id, new_stock=new_stock)
                return True
            
            return False
            
        except Exception as e:
            logger.error("Product stock update error", product_id=product_id, error=str(e))
            return False
    
    async def reserve_product_stock(self, product_id: str, quantity: int) -> bool:
        """Reserve product stock for orders"""
        try:
            es = await self.get_elasticsearch()
            
            # Get current product
            response = await es.get(index="products", id=product_id, ignore=[404])
            if not response.get("found"):
                return False
            
            current_product = response["_source"]
            current_stock = current_product.get("stock_quantity", 0)
            reserved_stock = current_product.get("reserved_stock", 0)
            
            # Check if enough stock available
            available_stock = current_stock - reserved_stock
            if available_stock < quantity:
                logger.warning("Insufficient stock for reservation", 
                              product_id=product_id, 
                              requested=quantity, 
                              available=available_stock)
                return False
            
            # Update reserved stock
            await es.update(
                index="products",
                id=product_id,
                body={
                    "doc": {
                        "reserved_stock": reserved_stock + quantity,
                        "updated_at": datetime.utcnow().isoformat()
                    }
                }
            )
            
            logger.info("Product stock reserved", product_id=product_id, quantity=quantity)
            return True
            
        except Exception as e:
            logger.error("Product stock reservation error", product_id=product_id, error=str(e))
            return False
    
    async def release_product_stock(self, product_id: str, quantity: int) -> bool:
        """Release reserved product stock"""
        try:
            es = await self.get_elasticsearch()
            
            # Get current product
            response = await es.get(index="products", id=product_id, ignore=[404])
            if not response.get("found"):
                return False
            
            current_product = response["_source"]
            reserved_stock = current_product.get("reserved_stock", 0)
            
            # Release stock
            new_reserved = max(0, reserved_stock - quantity)
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "doc": {
                        "reserved_stock": new_reserved,
                        "updated_at": datetime.utcnow().isoformat()
                    }
                }
            )
            
            logger.info("Product stock released", product_id=product_id, quantity=quantity)
            return True
            
        except Exception as e:
            logger.error("Product stock release error", product_id=product_id, error=str(e))
            return False
    
    async def update_product_price(self, product_id: str, new_price: float) -> bool:
        """Update product price"""
        try:
            es = await self.get_elasticsearch()
            
            response = await es.update(
                index="products",
                id=product_id,
                body={
                    "doc": {
                        "price": new_price,
                        "updated_at": datetime.utcnow().isoformat()
                    }
                },
                ignore=[404]
            )
            
            if response.get("result") == "updated":
                logger.info("Product price updated", product_id=product_id, new_price=new_price)
                return True
            
            return False
            
        except Exception as e:
            logger.error("Product price update error", product_id=product_id, error=str(e))
            return False
    
    async def increment_view_count(self, product_id: str) -> bool:
        """Increment product view count"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "script": {
                        "source": "ctx._source.view_count = (ctx._source.view_count ?: 0) + 1"
                    }
                },
                ignore=[404]
            )
            
            logger.debug("Product view count incremented", product_id=product_id)
            return True
            
        except Exception as e:
            logger.error("Product view count increment error", product_id=product_id, error=str(e))
            return False
    
    async def record_purchase(self, product_id: str, quantity: int) -> bool:
        """Record product purchase for analytics"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "script": {
                        "source": """
                            ctx._source.purchase_count = (ctx._source.purchase_count ?: 0) + params.quantity;
                            ctx._source.total_sales = (ctx._source.total_sales ?: 0) + params.quantity;
                        """,
                        "params": {"quantity": quantity}
                    }
                },
                ignore=[404]
            )
            
            logger.info("Product purchase recorded", product_id=product_id, quantity=quantity)
            return True
            
        except Exception as e:
            logger.error("Product purchase recording error", product_id=product_id, error=str(e))
            return False
    
    async def record_return(self, product_id: str, quantity: int) -> bool:
        """Record product return"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "script": {
                        "source": """
                            ctx._source.return_count = (ctx._source.return_count ?: 0) + params.quantity;
                            ctx._source.stock_quantity = (ctx._source.stock_quantity ?: 0) + params.quantity;
                        """,
                        "params": {"quantity": quantity}
                    }
                },
                ignore=[404]
            )
            
            logger.info("Product return recorded", product_id=product_id, quantity=quantity)
            return True
            
        except Exception as e:
            logger.error("Product return recording error", product_id=product_id, error=str(e))
            return False
    
    async def increment_favorite_count(self, product_id: str) -> bool:
        """Increment product favorite count"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "script": {
                        "source": "ctx._source.favorite_count = (ctx._source.favorite_count ?: 0) + 1"
                    }
                },
                ignore=[404]
            )
            
            logger.debug("Product favorite count incremented", product_id=product_id)
            return True
            
        except Exception as e:
            logger.error("Product favorite count increment error", product_id=product_id, error=str(e))
            return False
    
    async def decrement_favorite_count(self, product_id: str) -> bool:
        """Decrement product favorite count"""
        try:
            es = await self.get_elasticsearch()
            
            await es.update(
                index="products",
                id=product_id,
                body={
                    "script": {
                        "source": "if (ctx._source.favorite_count > 0) { ctx._source.favorite_count -= 1 }"
                    }
                },
                ignore=[404]
            )
            
            logger.debug("Product favorite count decremented", product_id=product_id)
            return True
            
        except Exception as e:
            logger.error("Product favorite count decrement error", product_id=product_id, error=str(e))
            return False
    
    async def update_trending_products(self, trending_products: List[Dict[str, Any]]) -> bool:
        """Update trending status for products"""
        try:
            es = await self.get_elasticsearch()
            
            # First, clear all trending flags
            await es.update_by_query(
                index="products",
                body={
                    "script": {
                        "source": "ctx._source.is_trending = false"
                    },
                    "query": {"match_all": {}}
                }
            )
            
            # Set trending flag for trending products
            for product_data in trending_products:
                product_id = product_data.get("product_id")
                trend_score = product_data.get("trend_score", 0)
                
                if product_id:
                    await es.update(
                        index="products",
                        id=product_id,
                        body={
                            "doc": {
                                "is_trending": True,
                                "trend_score": trend_score,
                                "updated_at": datetime.utcnow().isoformat()
                            }
                        },
                        ignore=[404]
                    )
            
            logger.info("Trending products updated", count=len(trending_products))
            return True
            
        except Exception as e:
            logger.error("Trending products update error", error=str(e))
            return False
    
    async def apply_external_updates(self, product_id: str, updates: Dict[str, Any]) -> bool:
        """Apply external updates to product"""
        try:
            es = await self.get_elasticsearch()
            
            # Add timestamp to updates
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            response = await es.update(
                index="products",
                id=product_id,
                body={"doc": updates},
                ignore=[404]
            )
            
            if response.get("result") == "updated":
                logger.info("External product updates applied", 
                           product_id=product_id, 
                           updates=list(updates.keys()))
                return True
            
            return False
            
        except Exception as e:
            logger.error("External product updates error", product_id=product_id, error=str(e))
            return False
    
    async def handle_product_deletion(self, product_id: str) -> bool:
        """Handle product deletion from external event"""
        try:
            # Remove from search index
            search_deleted = await self.search_service.delete_product(product_id)
            
            # Remove from cache
            cache_keys = [f"product:{product_id}"]
            cache_deleted = await self.cache_service.delete_pattern(f"product:{product_id}")
            
            logger.info("Product deletion handled", 
                       product_id=product_id,
                       search_deleted=search_deleted,
                       cache_deleted=cache_deleted)
            
            return search_deleted
            
        except Exception as e:
            logger.error("Product deletion handling error", product_id=product_id, error=str(e))
            return False
    
    async def close(self):
        """Close service connections"""
        try:
            if hasattr(self, 'cache_service') and self.cache_service:
                await self.cache_service.close()
            
            if hasattr(self, 'search_service') and self.search_service:
                await self.search_service.close()
            
            logger.info("Product service connections closed")
            
        except Exception as e:
            logger.error("Product service close error", error=str(e))
