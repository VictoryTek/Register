from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.models.models import Inventory, User, Tag
from app.schemas.schemas import Inventory as InventorySchema, InventoryCreate, InventoryUpdate, Tag as TagSchema
from app.utils.auth import get_current_active_user, require_manager_or_admin

router = APIRouter()


@router.get("", response_model=List[InventorySchema])
def get_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get inventory items with optional filtering"""
    query = db.query(Inventory)
    
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
    """Create a new inventory item with tags"""
    tags = []
    if inventory.tags:
        for tag_data in inventory.tags:
            tag = db.query(Tag).filter(Tag.name == tag_data.name).first()
            if not tag:
                tag = Tag(name=tag_data.name, description=tag_data.description)
                db.add(tag)
                db.flush()
            tags.append(tag)
    db_inventory = Inventory(
        name=inventory.name,
        description=inventory.description,
        category=inventory.category,
        quantity=inventory.quantity,
        min_stock_level=inventory.min_stock_level,
        max_stock_level=inventory.max_stock_level,
        tags=tags
    )
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
    """Update an inventory item and its tags"""
    inventory = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = inventory_update.dict(exclude_unset=True)
    if "tags" in update_data:
        tags = []
        for tag_data in update_data["tags"]:
            tag = db.query(Tag).filter(Tag.name == tag_data.name).first()
            if not tag:
                tag = Tag(name=tag_data.name, description=tag_data.description)
                db.add(tag)
                db.flush()
            tags.append(tag)
        inventory.tags = tags
        del update_data["tags"]
    
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
