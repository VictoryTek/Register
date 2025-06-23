from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.models.models import Product, User
from app.schemas.schemas import Product as ProductSchema, ProductCreate, ProductUpdate
from app.utils.auth import get_current_active_user, require_manager_or_admin

router = APIRouter()


@router.get("", response_model=List[ProductSchema])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all products with optional filtering"""
    query = db.query(Product)
    
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") |
            Product.description.ilike(f"%{search}%") |
            Product.sku.ilike(f"%{search}%") |
            Product.barcode.ilike(f"%{search}%")
        )
    
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.post("", response_model=ProductSchema)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create a new product"""
    # Check if SKU already exists
    if product.sku:
        db_product = db.query(Product).filter(Product.sku == product.sku).first()
        if db_product:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Check if barcode already exists
    if product.barcode:
        db_product = db.query(Product).filter(Product.barcode == product.barcode).first()
        if db_product:
            raise HTTPException(status_code=400, detail="Barcode already exists")
    
    db_product = Product(
        **product.dict(),
        created_by=current_user.id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/{product_id}", response_model=ProductSchema)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductSchema)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update a product"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check SKU uniqueness if updating
    if product_update.sku and product_update.sku != product.sku:
        existing = db.query(Product).filter(Product.sku == product_update.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
    
    # Check barcode uniqueness if updating
    if product_update.barcode and product_update.barcode != product.barcode:
        existing = db.query(Product).filter(Product.barcode == product_update.barcode).first()
        if existing:
            raise HTTPException(status_code=400, detail="Barcode already exists")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Delete a product (soft delete by setting is_active to False)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = False
    db.commit()
    return {"message": "Product deleted successfully"}
