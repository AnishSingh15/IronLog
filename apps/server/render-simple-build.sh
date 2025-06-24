#!/bin/bash

# Simple Render build script without workspace detection
echo "🚀 Starting Render build..."

# Remove any potential workspace files
rm -f package-lock.json pnpm-lock.yaml yarn.lock

# Set environment to explicitly disable workspace detection
export NPM_CONFIG_WORKSPACES=false

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-fund --no-audit

# Check if node_modules was created
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not created"
    exit 1
fi

# Generate Prisma client using direct path
echo "🔄 Generating Prisma client..."
./node_modules/.bin/prisma generate

# Run database migrations using direct path
echo "🗄️ Running database migrations..."
./node_modules/.bin/prisma migrate deploy

# Seed database if requested using direct path
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    ./node_modules/.bin/prisma db seed
fi

# Build TypeScript using direct path
echo "🔨 Building application..."
./node_modules/.bin/tsc

# Check if build was successful
if [ ! -f "dist/src/index.js" ]; then
    echo "❌ TypeScript build failed - dist/src/index.js not found"
    echo "📂 Checking dist contents:"
    ls -la dist/ || echo "No dist directory"
    echo "📂 Checking if tsc exists:"
    ls -la node_modules/.bin/tsc || echo "No tsc found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📂 Build output:"
ls -la dist/src/
