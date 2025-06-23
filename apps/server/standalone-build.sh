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

# Check for any workspace configuration in parent directories
echo "🔍 Debugging workspace detection..."
echo "Current directory: $(pwd)"
echo "Parent directories content:"
ls -la ../
ls -la ../../
echo "Environment variables:"
env | grep -i workspace || echo "No workspace env vars found"
env | grep -i pnpm || echo "No pnpm env vars found"

# Set environment variables to disable workspace detection
export NPM_CONFIG_WORKSPACES=false
export NPM_CONFIG_WORKSPACE_ROOT=false
export NPM_CONFIG_WORKSPACE=false
unset PNPM_HOME
unset PNPM_VERSION
unset npm_config_workspace
unset npm_config_workspaces

# Create isolated npm configuration
echo "📝 Creating isolated npm configuration..."
cat > .npmrc << EOF
workspaces=false
workspace=false
package-lock=false
save-exact=true
engine-strict=true
legacy-peer-deps=true
fund=false
audit=false
prefer-offline=false
EOF

# Also create a package-lock.json stub to prevent workspace detection
echo '{"lockfileVersion": 1}' > package-lock.json

# Install dependencies with maximum isolation
echo "📦 Installing dependencies (trying yarn as fallback)..."
if NPM_CONFIG_WORKSPACES=false NPM_CONFIG_WORKSPACE=false npm install --legacy-peer-deps --no-fund --no-audit; then
    echo "✅ npm install succeeded"
else
    echo "⚠️ npm install failed, trying yarn..."
    # Try with yarn as a fallback
    npm install -g yarn
    yarn install --no-lockfile
fi

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
