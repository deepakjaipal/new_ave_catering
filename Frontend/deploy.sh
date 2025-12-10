#!/bin/bash

# Wholesale Market Client Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="wholesale-market-client"

echo "🚀 Deploying Wholesale Market Client to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required files exist
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the client directory."
    exit 1
fi

# Environment-specific deployment
case $ENVIRONMENT in
    "development")
        print_status "Starting development environment..."
        npm run dev
        ;;
    "production")
        print_status "Building and starting production environment..."
        docker-compose up -d --build
        ;;
    "staging")
        print_status "Building and starting staging environment..."
        docker-compose up -d --build
        ;;
    *)
        print_error "Invalid environment. Use: development, staging, or production"
        exit 1
        ;;
esac

# Wait for services to be ready
if [ "$ENVIRONMENT" != "development" ]; then
    print_status "Waiting for services to start..."
    sleep 10

    # Health checks
    print_status "Performing health checks..."

    # Check Client health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "✅ Client is healthy"
    else
        print_warning "⚠️  Client health check failed"
    fi

    # Display service URLs
    echo ""
    print_status "🎉 Client deployment completed successfully!"
    echo ""
    echo "📱 Service URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Nginx: http://localhost:80"
    echo ""
    echo "📊 Docker Services:"
    docker-compose ps
    echo ""
    echo "📝 Logs:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo ""
fi
