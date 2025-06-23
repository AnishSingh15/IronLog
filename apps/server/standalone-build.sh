#!/bin/bash

# Render deployment script for IronLog - Complete isolation approach
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

# Create a completely isolated build directory
echo "🏗️ Creating isolated build environment..."
BUILD_DIR="/tmp/ironlog-build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy only the server files we need
echo "� Copying server files to isolated directory..."
cp package.json "$BUILD_DIR/"
cp -r src "$BUILD_DIR/"
cp -r prisma "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/" 2>/dev/null || echo "No tsconfig.json found"
cp .env "$BUILD_DIR/" 2>/dev/null || echo "No .env found"

# Change to the isolated directory
cd "$BUILD_DIR"

echo "📍 Now in isolated directory: $(pwd)"
echo "📂 Isolated directory contents:"
ls -la

# Create a clean npm environment
echo "📝 Creating clean npm configuration..."
cat > .npmrc << EOF
package-lock=false
save-exact=true
engine-strict=true
legacy-peer-deps=true
fund=false
audit=false
EOF

# Install dependencies in the isolated environment
echo "📦 Installing dependencies in isolated environment..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ npm install failed even in isolated environment"
    exit 1
fi

echo "✅ npm install succeeded in isolated environment"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the TypeScript application
echo "🔨 Building TypeScript application..."
npx tsc

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ TypeScript build failed - no dist directory created"
    exit 1
fi

# Seed the database (optional, only for initial deployment)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

# Copy the built files back to the original location
echo "📋 Copying built files back to original location..."
cp -r dist/* /opt/render/project/src/apps/server/dist/ 2>/dev/null || mkdir -p /opt/render/project/src/apps/server/dist && cp -r dist/* /opt/render/project/src/apps/server/dist/
cp -r node_modules /opt/render/project/src/apps/server/

echo "✅ Build completed successfully!"
echo "📂 Final build contents:"
ls -la dist/
echo "📂 Original location contents:"
ls -la /opt/render/project/src/apps/server/dist/ || echo "Could not access original dist directory"
