#!/bin/bash

# Simple Production Build Script for Render
# Focuses on getting the server running without seeding complications

set -e

echo "🚀 Starting Production Build..."

# Step 1: Create isolated build directory
BUILD_DIR="$(pwd)/prod-build"
echo "📁 Creating production build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Step 2: Copy essential files
echo "📋 Copying files to production build environment..."
cp -r src "$BUILD_DIR/"
cp -r prisma "$BUILD_DIR/"

# Create production tsconfig.json without test dependencies
echo "📝 Creating production tsconfig.json..."
cat > "$BUILD_DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noUncheckedIndexedAccess": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

# Step 3: Create production package.json
echo "📦 Creating production package.json..."
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
  "dependencies": {
    "@prisma/client": "6.10.1",
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
    "prisma": "6.10.1",
    "typescript": "5.3.3"
  }
}
EOF

# Step 4: Create clean .npmrc
cat > "$BUILD_DIR/.npmrc" << 'EOF'
package-lock=false
legacy-peer-deps=true
fund=false
audit=false
EOF

# Step 5: Change to build directory and run build
cd "$BUILD_DIR"

# Ensure devDependencies are installed
export NODE_ENV=development

echo "📥 Installing dependencies..."
npm install --legacy-peer-deps --include=dev

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Running database migration..."
npx prisma migrate deploy

echo "🔨 Building TypeScript..."
# Verify TypeScript is available
if [ ! -f "node_modules/.bin/tsc" ]; then
    echo "❌ TypeScript compiler not found, installing globally..."
    npm install -g typescript
fi
npx tsc

# Step 6: Verify build
if [ -f "dist/src/index.js" ]; then
    echo "✅ Build successful! dist/src/index.js created"
    ls -la dist/src/
else
    echo "❌ Build failed! dist/src/index.js not found"
    exit 1
fi

# Step 7: Copy built files back
echo "📂 Copying production files back..."
cd ..
rm -rf dist node_modules
cp -r "$BUILD_DIR/dist" .
cp -r "$BUILD_DIR/node_modules" .

# Step 8: Cleanup
echo "🧹 Cleaning up build directory..."
rm -rf "$BUILD_DIR"

echo "🎉 Production Build completed successfully!"
echo "📝 Server is ready to start!"
ls -la dist/src/
