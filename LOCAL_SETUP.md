# 🚀 How to Start IronLog Locally

## Prerequisites

- **Node.js 18+**
- **pnpm** (recommended): `npm install -g pnpm`
- **PostgreSQL** (installed locally or Docker)

## 🐳 Option 1: Quick Start with Docker (Recommended)

```bash
# 1. Navigate to project root
cd /Users/anishsingh/Desktop/IronLog

# 2. Start PostgreSQL with Docker
docker run --name ironlog-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=ironlog \
  -e POSTGRES_DB=ironlog \
  -p 5432:5432 \
  -d postgres:15-alpine

# 3. Install dependencies
pnpm install

# 4. Set up environment variables
cp apps/server/.env.example apps/server/.env

# 5. Set up database schema (wait 10 seconds for PostgreSQL to start)
sleep 10
cd apps/server && pnpm db:push && pnpm db:seed

# 6. Start the backend server (in one terminal)
cd apps/server && pnpm dev
# Server will start at http://localhost:3001

# 7. Start the frontend (in another terminal)
cd apps/web && pnpm dev
# Frontend will start at http://localhost:3000
```

## 🛠️ Option 2: Using Turbo (Monorepo Method)

```bash
# 1. Navigate to project root
cd /Users/anishsingh/Desktop/IronLog

# 2. Start PostgreSQL with Docker
docker run --name ironlog-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=ironlog \
  -e POSTGRES_DB=ironlog \
  -p 5432:5432 \
  -d postgres:15-alpine

# 3. Install dependencies
pnpm install

# 4. Set up environment variables
cp apps/server/.env.example apps/server/.env

# 5. Set up database (after PostgreSQL starts)
sleep 10
pnpm db:push
pnpm db:seed

# 6. Start both frontend and backend together
pnpm dev
```

## 🗄️ Option 3: Local PostgreSQL (If you have PostgreSQL installed)

```bash
# 1. Create database
createdb ironlog

# 2. Create user (if needed)
psql postgres -c "CREATE USER ironlog WITH PASSWORD 'password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE ironlog TO ironlog;"

# 3. Update .env file in apps/server/.env
DATABASE_URL="postgresql://ironlog:password@localhost:5432/ironlog"

# 4. Install dependencies and run
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

## 🚀 Access the Application

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👤 Test User Credentials

The database comes with a seeded admin user:

- **Email**: admin@ironlog.com
- **Password**: admin123

## 🧪 Running Tests

```bash
# E2E Tests with Playwright
cd apps/web
pnpm test:e2e

# Backend Tests
cd apps/server
pnpm test
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connection
docker exec -it ironlog-postgres psql -U ironlog -d ironlog -c "SELECT 1;"

# Reset database if needed
docker exec -it ironlog-postgres psql -U ironlog -d ironlog -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd apps/server && pnpm db:push && pnpm db:seed
```

### Port Conflicts

If ports 3000 or 3001 are in use:

```bash
# For frontend (change in apps/web/package.json)
"dev": "next dev -p 3002"

# For backend (change PORT in apps/server/.env)
PORT=3003
```

### Clean Install

```bash
# Clean everything and start fresh
pnpm clean
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## 🌟 Features to Test

1. **Authentication**

   - Register new account at `/register`
   - Login at `/login`
   - Use test credentials: admin@ironlog.com / admin123

2. **Dashboard**

   - View today's workout
   - Complete sets with weight/reps
   - Use the rest timer
   - Track progress

3. **History**

   - View calendar heatmap
   - Navigate between months
   - Click on days to see workout details

4. **Profile**

   - Edit profile information
   - Change password
   - Manage account settings

5. **Mobile Experience**
   - Test on mobile viewport
   - Use bottom navigation
   - Responsive design

## 📱 Mobile Testing

The app is mobile-first responsive. Test these screen sizes:

- iPhone 12: 390x844
- iPad: 768x1024
- Desktop: 1920x1080

## 🎯 Key Features

- ✅ JWT Authentication with refresh tokens
- ✅ Real-time workout timer with Zustand
- ✅ Calendar heatmap for progress visualization
- ✅ Mobile-optimized responsive design
- ✅ Professional UI with MUI + Tailwind
- ✅ Comprehensive E2E testing with Playwright
- ✅ Production-ready Docker deployment
