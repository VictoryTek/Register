from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.models.models import InventoryItem, Tag, InventoryGroup
from app.schemas.schemas import InventoryItem, InventoryItemCreate, InventoryItemUpdate, Tag as TagSchema
from app.utils.auth import get_current_active_user, require_manager_or_admin

router = APIRouter(prefix="/inventories/{inventory_id}/items", tags=["inventory_items"])

@router.get("", response_model=List[InventoryItem])
def list_items(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    items = db.query(InventoryItem).filter(InventoryItem.inventory_id == inventory_id).all()
    return items

@router.post("", response_model=InventoryItem)
def create_item(
    inventory_id: int,
    item: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    tags = []
    if item.tags:
        for tag_data in item.tags:
            tag = db.query(Tag).filter(Tag.name == tag_data.name).first()
            if not tag:
                tag = Tag(name=tag_data.name, description=tag_data.description)
                db.add(tag)
                db.flush()
            tags.append(tag)
    db_item = InventoryItem(
        inventory_id=inventory_id,
        name=item.name,
        description=item.description,
        category=item.category,
        quantity=item.quantity,
        min_stock_level=item.min_stock_level,
        max_stock_level=item.max_stock_level,
        tags=tags
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=InventoryItem)
def get_item(
    inventory_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    item = db.query(InventoryItem).filter(InventoryItem.inventory_id == inventory_id, InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=InventoryItem)
def update_item(
    inventory_id: int,
    item_id: int,
    item_update: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.inventory_id == inventory_id, InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in item_update.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(
    inventory_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    item = db.query(InventoryItem).filter(InventoryItem.inventory_id == inventory_id, InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Item deleted"}
