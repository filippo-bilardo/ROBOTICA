from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"

class Category(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    level: int = 0
    path: str  # e.g., "electronics/computers/laptops"

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    parent_id: Optional[str] = None

class CategoryResponse(Category):
    created_at: datetime
    updated_at: datetime
    product_count: Optional[int] = 0

class ProductAttribute(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None

class ProductVariant(BaseModel):
    sku: str
    name: str
    price: float = Field(..., gt=0)
    currency: str = "EUR"
    stock_quantity: int = Field(..., ge=0)
    attributes: Dict[str, str] = {}

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category_id: str
    brand: Optional[str] = Field(None, max_length=100)
    price: float = Field(..., gt=0)
    currency: str = "EUR"
    stock_quantity: int = Field(..., ge=0)
    sku: str = Field(..., min_length=1, max_length=100)
    images: List[str] = []
    attributes: List[ProductAttribute] = []
    variants: List[ProductVariant] = []
    tags: List[str] = []
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None
    status: ProductStatus = ProductStatus.ACTIVE

    @validator('sku')
    def validate_sku(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('SKU must contain only alphanumeric characters, hyphens, and underscores')
        return v.upper()

    @validator('tags')
    def validate_tags(cls, v):
        return [tag.strip().lower() for tag in v if tag.strip()]

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category_id: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: Optional[List[str]] = None
    attributes: Optional[List[ProductAttribute]] = None
    variants: Optional[List[ProductVariant]] = None
    tags: Optional[List[str]] = None
    weight: Optional[float] = Field(None, gt=0)
    dimensions: Optional[Dict[str, float]] = None
    status: Optional[ProductStatus] = None

    @validator('tags')
    def validate_tags(cls, v):
        if v is not None:
            return [tag.strip().lower() for tag in v if tag.strip()]
        return v

class Product(ProductCreate):
    id: str
    created_at: datetime
    updated_at: datetime
    view_count: int = 0
    purchase_count: int = 0
    rating: Optional[float] = None
    review_count: int = 0

class ProductResponse(Product):
    category: Optional[CategoryResponse] = None
    variants_count: int = 0
    in_stock: bool = True

class ProductSearch(BaseModel):
    query: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, gt=0)
    tags: Optional[List[str]] = []
    status: Optional[ProductStatus] = None
    in_stock_only: bool = False
    sort_by: str = "relevance"  # relevance, price_asc, price_desc, created_at, popularity
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)

    @validator('max_price')
    def validate_price_range(cls, v, values):
        if v is not None and 'min_price' in values and values['min_price'] is not None:
            if v <= values['min_price']:
                raise ValueError('max_price must be greater than min_price')
        return v

class ProductSearchResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    size: int
    total_pages: int
    facets: Dict[str, Any] = {}

class ProductEvent(BaseModel):
    event_type: str
    product_id: str
    data: Dict[str, Any]
    timestamp: datetime
    correlation_id: Optional[str] = None

class StockUpdate(BaseModel):
    product_id: str
    sku: Optional[str] = None
    quantity_change: int
    reason: str
    reference_id: Optional[str] = None  # order_id, return_id, etc.

class PriceUpdate(BaseModel):
    product_id: str
    new_price: float = Field(..., gt=0)
    currency: str = "EUR"
    effective_date: Optional[datetime] = None
    reason: Optional[str] = None

class BulkOperation(BaseModel):
    operation: str  # create, update, delete
    products: List[Dict[str, Any]]

class AnalyticsEvent(BaseModel):
    event_type: str  # view, search, purchase, add_to_cart
    product_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    search_query: Optional[str] = None
    category_id: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any] = {}

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
    dependencies: Dict[str, str]
