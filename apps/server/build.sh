#!/bin/bash
# Simple Render Build Script
# This works with Render's npm install process

set -e

echo "🚀 Starting Simple Render Build..."

# Step 1: Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Step 2: Run database migration
echo "🗄️ Running database migration..."
npx prisma migrate deploy

# Step 3: Seed database (optional)
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️ Seeding skipped"

# Step 4: Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Step 5: Verify build
if [ -f "dist/src/index.js" ]; then
    echo "✅ Build completed successfully!"
    ls -la dist/src/
else
    echo "❌ Build failed - dist/src/index.js not found"
    exit 1
fi

echo "🎉 Ready for production!"
