# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available

### Deployment Commands

#### 1. Clone and Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables as needed
# At minimum, change the SECRET_KEY for production
```

#### 2. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# Initialize the database
docker-compose exec backend python init_db.py
```

#### 3. Access the Application
- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: PostgreSQL on localhost:5432

#### 4. Default Login
- Username: `admin`
- Password: `password`

## Service Management

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Rebuild Services
```bash
# Rebuild and restart specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

## Production Deployment

### Environment Configuration
For production, update the `.env` file:

```env
# Database
DATABASE_URL=postgresql://register_user:STRONG_PASSWORD@db:5432/register_db
POSTGRES_PASSWORD=STRONG_PASSWORD

# Security
SECRET_KEY=your-very-strong-secret-key-here
ENVIRONMENT=production

# CORS (update with your domain)
ALLOWED_ORIGINS=["https://yourdomain.com"]

# Frontend API URL (update with your domain)
REACT_APP_API_URL=https://api.yourdomain.com
```

### Production Compose Override
Create `docker-compose.prod.yml`:

```yaml
services:
  backend:
    environment:
      - ENVIRONMENT=production
    restart: always
    
  frontend:
    build:
      target: production
    restart: always
    
  db:
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

Deploy with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Backup and Maintenance

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U register_user register_db > backup.sql

# Restore backup
docker-compose exec -T db psql -U register_user register_db < backup.sql
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Run any new migrations if needed
docker-compose exec backend alembic upgrade head
```

### Clean Up
```bash
# Remove stopped containers
docker-compose down

# Remove images (careful in production)
docker system prune -a

# Remove volumes (THIS WILL DELETE DATA)
docker-compose down -v
```

## Monitoring

### Health Checks
```bash
# Check if services are healthy
docker-compose ps

# Backend health
curl http://localhost:8000/health

# Database health
docker-compose exec db pg_isready -U register_user
```

### Resource Usage
```bash
# View container resource usage
docker stats

# View logs with timestamps
docker-compose logs -f -t
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8000, and 5432 are not in use
2. **Database connection**: Check if database is healthy with `docker-compose ps`
3. **Build failures**: Clear Docker cache with `docker system prune -a`
4. **Permission errors**: Ensure Docker has proper permissions

### Debug Commands
```bash
# Enter backend container
docker-compose exec backend bash

# Enter database container
docker-compose exec db psql -U register_user register_db

# View detailed logs
docker-compose logs --tail=100 backend
```

## Architecture

The application consists of:

- **Frontend**: React with TypeScript (Port 3000)
- **Backend**: FastAPI with Python (Port 8000)
- **Database**: PostgreSQL 15 (Port 5432)
- **File Storage**: Local volume mounts for uploads

All services are connected via Docker network and can communicate using service names.
