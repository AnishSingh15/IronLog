#!/bin/bash

# Render Zero-Workspace Build Script
# This completely isolates the build from any workspace detection

set -e

echo "🚀 Starting Zero-Workspace Render Build..."

# Step 1: Create a completely isolated build environment
BUILD_DIR="$(pwd)/isolated-build"
echo "📁 Creating isolated build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Step 2: Copy essential files to isolated directory
echo "📋 Copying files to isolated build environment..."
cp -r src "$BUILD_DIR/"
cp -r prisma "$BUILD_DIR/"
cp tsconfig.json "$BUILD_DIR/"

# Step 3: Create absolutely clean package.json with no workspace references
echo "📦 Creating clean package.json in isolated environment..."
cat > "$BUILD_DIR/package.json" << 'EOF'
{
  "name": "ironlog-server",
  "version": "1.0.0",
  "description": "IronLog Express API Server",
  "main": "dist/src/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/index.js"
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

# Step 4: Create clean .npmrc in isolated environment
cat > "$BUILD_DIR/.npmrc" << 'EOF'
package-lock=false
legacy-peer-deps=true
fund=false
audit=false
EOF

# Step 5: Change to isolated directory and run build
cd "$BUILD_DIR"

echo "📥 Installing dependencies in isolated environment..."
npm install --legacy-peer-deps

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Running database migration..."
npx prisma migrate deploy

echo "🔨 Building TypeScript..."
npx tsc

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️ Seeding failed or already done, continuing..."

# Step 6: Verify build
if [ -f "dist/src/index.js" ]; then
    echo "✅ Build successful! dist/src/index.js created"
    ls -la dist/src/
else
    echo "❌ Build failed! dist/src/index.js not found"
    echo "Build directory contents:"
    ls -la
    echo "Dist directory contents:"
    ls -la dist/ || echo "No dist directory"
    exit 1
fi

# Step 7: Copy built files back to original location
echo "📂 Copying built files back to original location..."
cd ..
rm -rf dist node_modules package-lock.json
cp -r "$BUILD_DIR/dist" .
cp -r "$BUILD_DIR/node_modules" .

# Step 8: Cleanup
echo "🧹 Cleaning up isolated build directory..."
rm -rf "$BUILD_DIR"

echo "🎉 Zero-Workspace Build completed successfully!"
echo "📝 Production files are ready!"
ls -la dist/src/
