#!/bin/bash
# Verification script to ensure you're getting fresh data

echo "🔍 Verifying fresh deployment..."

# Check container creation times
echo "📦 Container ages:"
docker-compose ps -q | xargs docker inspect --format='{{.Name}}: Created {{.Created}} ({{.State.StartedAt}})' | sed 's|/||g'

echo ""
echo "🔧 Build information:"
# Check image build times
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep register

echo ""
echo "📊 Volume mounts (for live reload):"
docker-compose config --services | xargs -I {} docker-compose exec {} df -h /app 2>/dev/null || true

echo ""
echo "🌡️  Health check:"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "Not responding")"
echo "Backend:  $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs 2>/dev/null || echo "Not responding")"
