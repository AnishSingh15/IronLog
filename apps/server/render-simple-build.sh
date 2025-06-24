#!/bin/bash

# Aggressive Render build script - complete workspace isolation
echo "🚀 Starting Render build..."

# Print debugging info
echo "📍 Current directory: $(pwd)"
echo "📂 Current contents:"
ls -la

# Remove any potential workspace files
rm -f package-lock.json pnpm-lock.yaml yarn.lock

# Create a completely isolated package.json for installation
echo "📝 Creating isolated package.json..."
cp package.json package.json.backup

# Create a clean package.json without any potential workspace references
cat > package.json << 'EOF'
{
  "name": "ironlog-server-isolated",
  "version": "1.0.0",
  "description": "IronLog Express API Server - Isolated Build",
  "main": "dist/src/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/index.js"
  },
  "prisma": {
    "seed": "tsx src/scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "express": "^5.0.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "prisma": "^5.7.1",
    "tsx": "^4.6.2",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Set environment to explicitly disable workspace detection
export NPM_CONFIG_WORKSPACES=false
export NPM_CONFIG_WORKSPACE=false
unset PNPM_HOME
unset npm_config_workspaces

# Create clean .npmrc
echo "📝 Creating clean .npmrc..."
cat > .npmrc << 'EOF'
workspaces=false
package-lock=false
legacy-peer-deps=true
fund=false
audit=false
EOF

# Install dependencies with clean package.json
echo "📦 Installing dependencies with isolated package.json..."
npm install --legacy-peer-deps --no-fund --no-audit

# Check if node_modules was created
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not created, trying alternative approach..."
    echo "📋 Restoring original package.json and trying yarn..."
    mv package.json.backup package.json
    
    # Try with yarn as last resort
    npm install -g yarn
    yarn install --no-lockfile --legacy-peer-deps
    
    if [ ! -d "node_modules" ]; then
        echo "❌ Both npm and yarn failed"
        exit 1
    fi
else
    echo "✅ npm install succeeded with isolated package.json"
    # Restore original package.json for build process
    mv package.json.backup package.json
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
