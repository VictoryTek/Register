from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.base import create_tables
from app.routers import auth, products, inventory, inventories

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="A modern inventory management system built with FastAPI",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    products.router,
    prefix=f"{settings.API_V1_STR}/products",
    tags=["Products"]
)

app.include_router(
    inventory.router,
    prefix=f"{settings.API_V1_STR}/inventory",
    tags=["Inventory"]
)

app.include_router(
    inventories.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["Inventories"]
)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    create_tables()


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Register Inventory Management System",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
