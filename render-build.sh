#!/bin/bash

# Render deployment script for IronLog
echo "🚀 Starting Render deployment for IronLog..."

# Ensure we're in the right directory
cd apps/server || exit 1

# Remove any existing lock files to avoid workspace conflicts
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock

# Force npm to ignore any workspace configurations
echo "📦 Installing dependencies with npm..."
npm install --no-package-lock --ignore-workspace-root-check

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the TypeScript application
echo "🔨 Building TypeScript application..."
npm run build

# Seed the database (optional, only for initial deployment)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

echo "✅ Build completed successfully!"

echo "✅ Render deployment completed successfully!"
