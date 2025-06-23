from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.models.models import Inventory, Product, Location, User
from app.schemas.schemas import Inventory as InventorySchema, InventoryCreate, InventoryUpdate
from app.utils.auth import get_current_active_user, require_manager_or_admin

router = APIRouter()


@router.get("", response_model=List[InventorySchema])
def get_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    product_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get inventory items with optional filtering"""
    query = db.query(Inventory)
    
    if product_id is not None:
        query = query.filter(Inventory.product_id == product_id)
    
    if location_id is not None:
        query = query.filter(Inventory.location_id == location_id)
    
    if low_stock:
        query = query.filter(Inventory.quantity <= Inventory.min_stock_level)
    
    inventory_items = query.offset(skip).limit(limit).all()
    return inventory_items


@router.post("", response_model=InventorySchema)
def create_inventory_item(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Create a new inventory item"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == inventory.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if location exists
    location = db.query(Location).filter(Location.id == inventory.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Check if inventory item already exists for this product-location combination
    existing = db.query(Inventory).filter(
        Inventory.product_id == inventory.product_id,
        Inventory.location_id == inventory.location_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Inventory item already exists for this product-location combination"
        )
    
    db_inventory = Inventory(**inventory.dict())
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


@router.get("/{inventory_id}", response_model=InventorySchema)
def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific inventory item by ID"""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return inventory


@router.put("/{inventory_id}", response_model=InventorySchema)
def update_inventory_item(
    inventory_id: int,
    inventory_update: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Update an inventory item"""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = inventory_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inventory, field, value)
    
    db.commit()
    db.refresh(inventory)
    return inventory


@router.delete("/{inventory_id}")
def delete_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin)
):
    """Delete an inventory item"""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(inventory)
    db.commit()
    return {"message": "Inventory item deleted successfully"}


@router.get("/low-stock", response_model=List[InventorySchema])
def get_low_stock_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get items with low stock levels"""
    low_stock_items = db.query(Inventory).filter(
        Inventory.quantity <= Inventory.min_stock_level
    ).all()
    return low_stock_items
