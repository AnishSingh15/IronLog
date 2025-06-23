#!/bin/bash

# IronLog - One-shot initialization script
# This script sets up the entire development environment

set -e

echo "🚀 IronLog Setup Starting..."
echo "================================"

# Check if required tools are installed
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Installing pnpm..."; npm install -g pnpm; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker not found. Some features may not work."; }

echo "✅ Prerequisites check complete"

# Install root dependencies
echo "📦 Installing root dependencies..."
pnpm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
pnpm install --recursive

# Set up environment files
echo "🔧 Setting up environment files..."

if [ ! -f apps/server/.env ]; then
    cp apps/server/.env.example apps/server/.env
    echo "✅ Created server .env file"
fi

if [ ! -f apps/web/.env.local ]; then
    cat > apps/web/.env.local << EOL
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
EOL
    echo "✅ Created web .env.local file"
fi

# Start PostgreSQL if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check if PostgreSQL is running
    if docker-compose ps postgres | grep -q "Up"; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ Failed to start PostgreSQL. Please check Docker logs."
        exit 1
    fi
else
    echo "⚠️  Docker not available. Please ensure PostgreSQL is running manually."
    echo "   Connection: postgresql://ironlog:password@localhost:5432/ironlog"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd apps/server
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with default data..."
pnpm db:seed

cd ../..

# Build packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "🚀 To start development servers:"
echo "   pnpm dev"
echo ""
echo "🌐 Your applications will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📊 Database:"
echo "   Studio:   pnpm --filter server db:studio"
echo "   URL:      postgresql://ironlog:password@localhost:5432/ironlog"
echo ""
echo "🧪 Testing:"
echo "   Unit:     pnpm test"
echo "   E2E:      pnpm test:e2e"
echo ""
echo "📚 Documentation:"
echo "   README:   ./README.md"
echo "   API:      http://localhost:3001/health"
echo ""

# Optional: Start development servers
read -p "🤔 Would you like to start the development servers now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development servers..."
    pnpm dev
else
    echo "👍 You can start the servers later with: pnpm dev"
fi
