@echo off
REM Register Inventory Management System - Development Setup Script for Windows

echo 🚀 Starting Register Inventory Management System...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📄 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your configuration before proceeding.
    pause
)

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose up -d --build

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Initialize database
echo 💾 Initializing database...
docker-compose exec backend python init_db.py

echo ✅ Setup complete!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo 📋 Default login credentials:
echo    Username: admin
echo    Password: password
echo.
echo 🔧 Useful commands:
echo    Stop services: docker-compose down
echo    View logs: docker-compose logs -f
echo    Restart services: docker-compose restart

pause
