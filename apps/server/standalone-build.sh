#!/bin/bash

# Render deployment script for IronLog - Standalone approach
echo "🚀 Starting Render deployment for IronLog..."

# Print current directory for debugging
echo "📍 Current directory: $(pwd)"
echo "📂 Contents:"
ls -la

# Ensure we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in current directory"
    exit 1
fi

# Remove ALL potential workspace/lock files
echo "🧹 Cleaning up workspace and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml
rm -f yarn.lock
rm -f .pnpmfile.cjs

# Set environment variables to disable workspace detection
export NPM_CONFIG_WORKSPACES=false
export NPM_CONFIG_WORKSPACE_ROOT=false
unset PNPM_HOME
unset PNPM_VERSION

# Create isolated npm configuration
echo "📝 Creating isolated npm configuration..."
cat > .npmrc << EOF
workspaces=false
package-lock=false
save-exact=true
engine-strict=true
legacy-peer-deps=true
fund=false
audit=false
EOF

# Install dependencies with explicit workspace disabling
echo "📦 Installing dependencies (isolated mode)..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
./node_modules/.bin/prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
./node_modules/.bin/prisma migrate deploy

# Build the TypeScript application
echo "🔨 Building TypeScript application..."
./node_modules/.bin/prisma generate && ./node_modules/.bin/tsc

# Seed the database (optional, only for initial deployment)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  ./node_modules/.bin/prisma db seed
fi

echo "✅ Build completed successfully!"
echo "📂 Final build contents:"
ls -la dist/
