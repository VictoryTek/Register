from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.base import get_db
from app.models.models import InventoryGroup
from app.schemas.schemas import InventoryGroup, InventoryGroupCreate, InventoryGroupUpdate
from app.utils.auth import get_current_active_user, require_manager_or_admin

router = APIRouter(prefix="/inventories", tags=["inventories"])

@router.get("", response_model=List[InventoryGroup])
def list_inventories(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    return db.query(InventoryGroup).all()

@router.post("", response_model=InventoryGroup)
def create_inventory(
    inventory: InventoryGroupCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    db_inventory = InventoryGroup(**inventory.dict())
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory

@router.get("/{inventory_id}", response_model=InventoryGroup)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    inventory = db.query(InventoryGroup).filter(InventoryGroup.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inventory

@router.put("/{inventory_id}", response_model=InventoryGroup)
def update_inventory(
    inventory_id: int,
    inventory_update: InventoryGroupUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    inventory = db.query(InventoryGroup).filter(InventoryGroup.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    for k, v in inventory_update.dict(exclude_unset=True).items():
        setattr(inventory, k, v)
    db.commit()
    db.refresh(inventory)
    return inventory

@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager_or_admin)
):
    inventory = db.query(InventoryGroup).filter(InventoryGroup.id == inventory_id).first()
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    db.delete(inventory)
    db.commit()
    return {"detail": "Inventory deleted"}
