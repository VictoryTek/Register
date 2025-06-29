from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.models import UserRole, MovementType, PurchaseOrderStatus


# Base schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)
    role: UserRole = UserRole.USER
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Category schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Category(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Supplier schemas
class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    is_active: Optional[bool] = None


class Supplier(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Product schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    sku: Optional[str] = Field(None, max_length=50)
    barcode: Optional[str] = Field(None, max_length=50)
    unit_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    sku: Optional[str] = Field(None, max_length=50)
    barcode: Optional[str] = Field(None, max_length=50)
    unit_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    is_active: Optional[bool] = None


class Product(ProductBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None
    supplier: Optional[Supplier] = None

    class Config:
        from_attributes = True


# Location schemas
class LocationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: Optional[str] = None
    is_active: bool = True


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = None
    is_active: Optional[bool] = None


class Location(LocationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Tag schemas
class TagBase(BaseModel):
    name: str
    description: Optional[str] = None


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True


# Inventory schemas
class InventoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: int = Field(..., ge=0)
    min_stock_level: int = Field(10, ge=0)
    max_stock_level: int = Field(1000, ge=0)
    tags: Optional[List[Tag]] = []


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    tags: Optional[List[Tag]] = []


class Inventory(InventoryBase):
    id: int
    updated_at: Optional[datetime] = None
    tags: Optional[List[Tag]] = []

    class Config:
        from_attributes = True


# Inventory Movement schemas
class InventoryMovementBase(BaseModel):
    product_id: int
    movement_type: MovementType
    quantity: int = Field(..., ne=0)
    reference_number: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovement(InventoryMovementBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    product: Optional[Product] = None

    class Config:
        from_attributes = True


# Purchase Order schemas
class PurchaseOrderBase(BaseModel):
    supplier_id: int
    expected_date: Optional[datetime] = None
    notes: Optional[str] = None


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[int] = None
    status: Optional[PurchaseOrderStatus] = None
    expected_date: Optional[datetime] = None
    notes: Optional[str] = None


class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0, decimal_places=2)


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    total_price: Decimal
    product: Optional[Product] = None

    class Config:
        from_attributes = True


class PurchaseOrder(PurchaseOrderBase):
    id: int
    order_number: str
    status: PurchaseOrderStatus
    order_date: datetime
    total_amount: Optional[Decimal] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    supplier: Optional[Supplier] = None
    items: List[PurchaseOrderItem] = []

    class Config:
        from_attributes = True


# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Response schemas
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


# Inventory Group (container) schemas
class InventoryGroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class InventoryGroupCreate(InventoryGroupBase):
    pass


class InventoryGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class InventoryGroup(InventoryGroupBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Optionally include items: List[InventoryItem] = []
    class Config:
        from_attributes = True


# Inventory Item schemas
class InventoryItemBase(BaseModel):
    inventory_id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: int = Field(..., ge=0)
    min_stock_level: int = Field(10, ge=0)
    max_stock_level: int = Field(1000, ge=0)
    tags: Optional[List[Tag]] = []


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    min_stock_level: Optional[int] = Field(None, ge=0)
    max_stock_level: Optional[int] = Field(None, ge=0)
    tags: Optional[List[Tag]] = []


class InventoryItem(InventoryItemBase):
    id: int
    updated_at: Optional[datetime] = None
    tags: Optional[List[Tag]] = []
    class Config:
        from_attributes = True
