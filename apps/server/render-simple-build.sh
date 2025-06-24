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

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed database if requested
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

# Build TypeScript
echo "🔨 Building application..."
npm run build

echo "✅ Build completed!"
