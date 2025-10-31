#!/bin/bash
# Production Docker deployment script

set -e

echo "🚀 Deploying EmEnTech in production mode..."

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "❌ Error: .env.docker file not found!"
    echo "   Please create .env.docker from .env.docker.example"
    exit 1
fi

# Load environment variables
export $(cat .env.docker | grep -v '^#' | xargs)

# Validate required variables
required_vars=("MONGODB_URI" "JWT_SECRET" "MPESA_CONSUMER_KEY" "VITE_API_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required variable $var is not set in .env.docker"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Pull latest images (if using registry)
# docker-compose -f docker-compose.prod.yml pull

# Build and start services
echo "🔨 Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "✅ Production deployment completed!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Access URLs:"
echo "   Application: http://your-domain.com"
echo "   Backend API: http://your-domain.com/api"
echo ""
echo "📝 View logs:      docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "🔄 Restart:        docker-compose -f docker-compose.prod.yml restart [service-name]"
echo "🛑 Stop all:       docker-compose -f docker-compose.prod.yml down"
echo "📈 Service stats:  docker stats"
