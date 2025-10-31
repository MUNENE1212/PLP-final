#!/bin/bash
# Development Docker deployment script

set -e

echo "🐳 Starting EmEnTech in development mode..."

# Load environment variables
if [ -f .env.docker ]; then
    export $(cat .env.docker | grep -v '^#' | xargs)
else
    echo "⚠️  .env.docker not found. Using defaults..."
fi

# Build and start services
docker-compose up --build -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-5000}"
echo "   MongoDB:  mongodb://localhost:27017"
echo "   Redis:    redis://localhost:6379"
echo ""
echo "📝 View logs: docker-compose logs -f [service-name]"
echo "🛑 Stop all:  docker-compose down"
echo "🗑️  Clean up: docker-compose down -v (removes volumes)"
