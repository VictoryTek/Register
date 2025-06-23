#!/bin/bash

# Register Inventory Management System - Development Setup Script

echo "🚀 Starting Register Inventory Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding."
    read -p "Press Enter to continue after editing .env file..."
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Initialize database
echo "💾 Initializing database..."
docker-compose exec backend python init_db.py

echo "✅ Setup complete!"
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
