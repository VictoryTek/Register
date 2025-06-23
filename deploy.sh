#!/bin/bash

# Register Inventory Management System - Docker Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🚀 Deploying Register Inventory Management System with Docker..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding."
    echo "Press any key to continue after editing .env..."
    read -n 1 -s
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if database is healthy
echo "🔍 Checking database health..."
while ! docker-compose exec -T db pg_isready -U register_user >/dev/null 2>&1; do
    echo "⏳ Waiting for database to be ready..."
    sleep 5
done

# Initialize database
echo "💾 Initializing database..."
docker-compose exec backend python init_db.py

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Default login credentials:"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "🔧 Useful commands:"
echo "   Stop services: docker-compose down"
echo "   View logs: docker-compose logs -f"
echo "   Restart services: docker-compose restart"
echo "   Update application: docker-compose up -d --build"
echo ""
echo "📖 For more information, see DOCKER_DEPLOYMENT.md"
