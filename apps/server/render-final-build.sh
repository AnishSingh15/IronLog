#!/bin/bash

# Render Final Build Script - Complete workspace isolation
# This script creates a completely clean environment for Render deployment

set -e  # Exit on any error

echo "🚀 Starting Render Final Build Process..."

# Step 1: Backup original files
echo "📦 Backing up original files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || echo "No package-lock.json to backup"

# Step 2: Create completely clean package.json without workspace references
echo "🧹 Creating clean package.json..."
cat > package.json << 'EOF'
{
  "name": "ironlog-server",
  "version": "1.0.0",
  "description": "IronLog Express API Server",
  "main": "dist/src/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/index.js",
    "postinstall": "npx prisma generate"
  },
  "prisma": {
    "seed": "npx tsx src/scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "5.7.1",
    "bcryptjs": "2.4.3",
    "cookie-parser": "1.4.6",
    "cors": "2.8.5",
    "express": "5.0.0",
    "helmet": "7.1.0",
    "jsonwebtoken": "9.0.2",
    "morgan": "1.10.0",
    "zod": "3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "2.4.6",
    "@types/cookie-parser": "1.4.6",
    "@types/cors": "2.8.17",
    "@types/express": "4.17.21",
    "@types/jsonwebtoken": "9.0.5",
    "@types/morgan": "1.9.9",
    "@types/node": "20.10.5",
    "prisma": "5.7.1",
    "tsx": "4.6.2",
    "typescript": "5.3.3"
  }
}
EOF

# Step 3: Create clean .npmrc
echo "⚙️ Creating clean .npmrc..."
cat > .npmrc << 'EOF'
package-lock=false
legacy-peer-deps=true
fund=false
audit=false
EOF

# Step 4: Remove all lock files and node_modules
echo "🗑️ Cleaning existing files..."
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock

# Step 5: Fresh install
echo "📥 Installing dependencies..."
npm install --no-package-lock --legacy-peer-deps

# Step 6: Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Step 7: Run database migration
echo "🗄️ Running database migration..."
npx prisma migrate deploy

# Step 8: Seed database (optional, may fail if already seeded)
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️ Seeding failed or already done, continuing..."

# Step 9: Build TypeScript
echo "🔨 Building TypeScript..."
npx tsc

# Step 10: Verify build
echo "✅ Verifying build..."
if [ -f "dist/src/index.js" ]; then
    echo "✅ Build successful! dist/src/index.js created"
    ls -la dist/src/
else
    echo "❌ Build failed! dist/src/index.js not found"
    echo "Current directory contents:"
    ls -la
    echo "Dist directory contents:"
    ls -la dist/ || echo "No dist directory"
    exit 1
fi

# Step 11: Restore original files for development
echo "🔄 Restoring original files..."
mv package.json.backup package.json
mv package-lock.json.backup package-lock.json 2>/dev/null || echo "No package-lock.json to restore"

echo "🎉 Render build completed successfully!"
echo "📝 To deploy on Render, use these settings:"
echo "   Root Directory: apps/server"
echo "   Build Command: chmod +x render-final-build.sh && ./render-final-build.sh"
echo "   Start Command: node dist/src/index.js"
