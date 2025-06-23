#!/usr/bin/env python3
"""
Database initialization script for Register Inventory Management System
Creates initial admin user and sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.base import engine, create_tables
from app.models.models import User, Category, Supplier, Location
from app.utils.auth import get_password_hash


def create_admin_user(db: Session):
    """Create default admin user"""
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        admin_user = User(
            username="admin",
            email="admin@register.com",
            hashed_password=get_password_hash("password"),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        print("✓ Created admin user (username: admin, password: password)")
    else:
        print("✓ Admin user already exists")


def create_sample_categories(db: Session):
    """Create sample categories"""
    categories = [
        {"name": "Electronics", "description": "Electronic devices and components"},
        {"name": "Office Supplies", "description": "Office equipment and supplies"},
        {"name": "Books", "description": "Books and publications"},
        {"name": "Furniture", "description": "Office and home furniture"},
        {"name": "Clothing", "description": "Clothing and apparel"},
    ]
    
    for cat_data in categories:
        category = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not category:
            category = Category(**cat_data)
            db.add(category)
    
    print("✓ Created sample categories")


def create_sample_suppliers(db: Session):
    """Create sample suppliers"""
    suppliers = [
        {
            "name": "TechCorp Ltd",
            "contact_person": "John Smith",
            "email": "john@techcorp.com",
            "phone": "+1-555-0101",
            "address": "123 Tech Street, Silicon Valley, CA"
        },
        {
            "name": "Office Plus",
            "contact_person": "Jane Doe",
            "email": "jane@officeplus.com",
            "phone": "+1-555-0102",
            "address": "456 Business Ave, New York, NY"
        },
        {
            "name": "Book World",
            "contact_person": "Bob Johnson",
            "email": "bob@bookworld.com",
            "phone": "+1-555-0103",
            "address": "789 Reading Blvd, Boston, MA"
        },
    ]
    
    for sup_data in suppliers:
        supplier = db.query(Supplier).filter(Supplier.name == sup_data["name"]).first()
        if not supplier:
            supplier = Supplier(**sup_data)
            db.add(supplier)
    
    print("✓ Created sample suppliers")


def create_sample_locations(db: Session):
    """Create sample locations"""
    locations = [
        {
            "name": "Main Warehouse",
            "address": "100 Storage Way, Warehouse District"
        },
        {
            "name": "Retail Store",
            "address": "200 Shopping Center, Downtown"
        },
        {
            "name": "Office Location",
            "address": "300 Corporate Plaza, Business District"
        },
    ]
    
    for loc_data in locations:
        location = db.query(Location).filter(Location.name == loc_data["name"]).first()
        if not location:
            location = Location(**loc_data)
            db.add(location)
    
    print("✓ Created sample locations")


def main():
    """Initialize database with sample data"""
    print("🚀 Initializing Register Inventory Management Database...")
    
    # Create tables
    create_tables()
    print("✓ Database tables created")
    
    # Create session
    db = Session(engine)
    
    try:
        # Create initial data
        create_admin_user(db)
        create_sample_categories(db)
        create_sample_suppliers(db)
        create_sample_locations(db)
        
        # Commit changes
        db.commit()
        print("✅ Database initialization completed successfully!")
        print("\n📋 Login credentials:")
        print("   Username: admin")
        print("   Password: password")
        print("\n🌐 Access the application:")
        print("   Frontend: http://localhost:3000")
        print("   API Docs: http://localhost:8000/docs")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during initialization: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
