#!/bin/bash
# Smart Docker rebuild script

echo "🔍 Checking what needs rebuilding..."

# Function to check if rebuild is needed
check_rebuild_needed() {
    local service=$1
    local context_dir=$2
    
    # Check if service exists
    if ! docker-compose ps | grep -q "$service"; then
        echo "📦 $service: Container doesn't exist - full build needed"
        return 0
    fi
    
    # Check if package.json changed recently
    if find "$context_dir" -name "package*.json" -newer "$(docker-compose ps -q $service | xargs docker inspect --format='{{.Created}}' | head -1)" 2>/dev/null | grep -q .; then
        echo "📦 $service: package.json changed - rebuild needed"
        return 0
    fi
    
    # Check if Dockerfile changed
    if [ "$context_dir/Dockerfile" -nt "$(docker-compose ps -q $service | xargs docker inspect --format='{{.Created}}' | head -1)" ] 2>/dev/null; then
        echo "🐳 $service: Dockerfile changed - rebuild needed"
        return 0
    fi
    
    echo "✅ $service: Up to date"
    return 1
}

# Check each service
rebuild_frontend=false
rebuild_backend=false

if check_rebuild_needed "frontend" "./frontend"; then
    rebuild_frontend=true
fi

if check_rebuild_needed "backend" "./backend"; then
    rebuild_backend=true
fi

# Perform selective rebuilds
if [ "$rebuild_frontend" = true ] || [ "$rebuild_backend" = true ]; then
    echo ""
    echo "🔨 Rebuilding services..."
    
    if [ "$rebuild_frontend" = true ]; then
        echo "🔨 Rebuilding frontend..."
        docker-compose build frontend
    fi
    
    if [ "$rebuild_backend" = true ]; then
        echo "🔨 Rebuilding backend..."
        docker-compose build backend
    fi
    
    echo "🚀 Starting services..."
    docker-compose up -d
else
    echo ""
    echo "🚀 All services up to date, just starting..."
    docker-compose up -d
fi

echo ""
echo "📊 Service status:"
docker-compose ps
