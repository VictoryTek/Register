# Register - Inventory Management System

A modern, full-stack inventory management application built with Python FastAPI backend, React TypeScript frontend, PostgreSQL database, and Docker deployment.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role management
- **Product Management** - CRUD operations for products with categories
- **Inventory Tracking** - Real-time stock levels and low stock alerts
- **Supplier Management** - Manage supplier information and relationships
- **Purchase Orders** - Create and track purchase orders
- **Sales Tracking** - Monitor sales and inventory movements
- **Multi-location Support** - Manage inventory across multiple locations
- **Reporting & Analytics** - Generate reports and view analytics
- **Modern UI** - Responsive, sleek design with Material-UI
- **Real-time Updates** - WebSocket connections for live data
- **API Documentation** - Auto-generated OpenAPI/Swagger docs

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Robust relational database
- **Alembic** - Database migration tool
- **JWT** - JSON Web Tokens for authentication
- **Pydantic** - Data validation using Python type annotations

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - React component library
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Query** - Server state management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Register
   ```

2. **Deploy with Docker**
   ```bash
   # Option 1: Use deployment script
   ./deploy.sh        # Linux/Mac
   deploy.bat         # Windows
   
   # Option 2: Manual deployment
   cp .env.example .env
   docker-compose up -d --build
   docker-compose exec backend python init_db.py
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Login**
   - Username: `admin`
   - Password: `password`

### Docker Management

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update application
docker-compose up -d --build
```

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md).

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🗄️ Database Schema

The application uses the following main entities:
- Users (authentication and authorization)
- Categories (product categorization)
- Products (inventory items)
- Inventory (stock levels and locations)
- Suppliers (vendor management)
- Purchase Orders (procurement tracking)
- Sales Orders (sales tracking)

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 📦 Deployment

The application is containerized and can be deployed using Docker Compose or Kubernetes.

### Production Deployment
1. Update environment variables in `.env`
2. Run with production configuration:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.