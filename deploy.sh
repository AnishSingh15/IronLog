#!/bin/bash

# IronLog Production Deployment Script
# This script sets up and deploys IronLog to production

set -e

echo "🚀 Starting IronLog Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log_warn ".env.production not found. Copying from example..."
    cp .env.production.example .env.production
    log_error "Please edit .env.production with your actual values before continuing."
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

log_info "Environment loaded from .env.production"

# Validate required environment variables
required_vars=("DATABASE_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set in .env.production"
        exit 1
    fi
done

log_info "Environment validation passed"

# Build and start services
log_info "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

log_info "Starting database..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
log_info "Waiting for database to be ready..."
timeout=60
counter=0
while ! docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U ironlog -d ironlog > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        log_error "Database failed to start within $timeout seconds"
        exit 1
    fi
done

log_info "Database is ready"

# Run database migrations
log_info "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm server npm run db:migrate

# Seed database with initial data
log_info "Seeding database..."
docker-compose -f docker-compose.prod.yml run --rm server npm run db:seed

# Start all services
log_info "Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Check service health
services=("server" "web")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' | grep -q "healthy"; then
        log_info "$service is healthy"
    else
        log_warn "$service health check failed or not configured"
    fi
done

# Display deployment information
log_info "🎉 Deployment completed successfully!"
echo
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo
echo "🌐 Application URLs:"
echo "  Frontend: http://localhost:3000"
echo "  API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/health"

echo
echo "📝 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  Update application: ./deploy.sh"

echo
log_info "Deployment script completed!"

# Optional: Set up SSL certificates (uncomment if using Let's Encrypt)
# if [ "$NODE_ENV" = "production" ] && [ ! -z "$DOMAIN" ]; then
#     log_info "Setting up SSL certificates..."
#     docker run --rm \
#         -v /etc/letsencrypt:/etc/letsencrypt \
#         -v /var/lib/letsencrypt:/var/lib/letsencrypt \
#         -p 80:80 \
#         certbot/certbot certonly --standalone \
#         --email $SSL_EMAIL \
#         --agree-tos \
#         --no-eff-email \
#         -d $DOMAIN
#
#     # Copy certificates to nginx volume
#     sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
#     sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
#
#     # Restart nginx with SSL
#     docker-compose -f docker-compose.prod.yml up -d nginx
# fi
