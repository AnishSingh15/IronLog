#!/bin/bash

# Render deployment script for IronLog
echo "🚀 Starting Render deployment for IronLog..."

# Set the working directory to the server app
cd apps/server

# Install dependencies (Render does this automatically but ensuring we have them)
echo "📦 Installing dependencies..."
npm install

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

echo "✅ Render deployment completed successfully!"
