@echo off
REM Smart Docker rebuild script for Windows

echo 🔍 Checking what needs rebuilding...

REM Check if containers exist
docker-compose ps > nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 No containers found - full build needed
    goto :full_build
)

REM Check for package.json changes in frontend
for /f %%i in ('powershell -command "if (Test-Path './frontend/package.json') { (Get-Item './frontend/package.json').LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss') }"') do set pkg_time=%%i
echo Frontend package.json last modified: %pkg_time%

REM Simple rebuild strategy for Windows
echo.
echo Choose rebuild option:
echo [1] Normal restart (code changes only)
echo [2] Rebuild frontend (package.json or config changes)
echo [3] Rebuild backend  
echo [4] Full rebuild (nuclear option)
echo [5] Clean rebuild (--no-cache)

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto :normal
if "%choice%"=="2" goto :rebuild_frontend
if "%choice%"=="3" goto :rebuild_backend
if "%choice%"=="4" goto :full_build
if "%choice%"=="5" goto :clean_build

:normal
echo 🚀 Normal restart - using existing containers
docker-compose restart
goto :status

:rebuild_frontend
echo 🔨 Rebuilding frontend only...
docker-compose build frontend
docker-compose up -d frontend
goto :status

:rebuild_backend
echo 🔨 Rebuilding backend only...
docker-compose build backend
docker-compose up -d backend
goto :status

:full_build
echo 🔨 Full rebuild with cache...
docker-compose down
docker-compose build
docker-compose up -d
goto :status

:clean_build
echo 🧹 Clean rebuild (--no-cache) - this will take several minutes...
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up -d
goto :status

:status
echo.
echo 📊 Service status:
docker-compose ps

echo.
echo 🌐 Access your app:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   Database: localhost:5432
