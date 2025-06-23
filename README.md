# IronLog - Production-Ready Fitness Tracking App

[![CI](https://github.com/ironlog/ironlog/workflows/CI/badge.svg)](https://github.com/ironlog/ironlog/actions)
[![Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)](https://github.com/ironlog/ironlog)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive fitness tracking application built with modern web technologies. Track your workouts, monitor progress, and stay motivated with IronLog.

## 🚀 Features

- **Smart Workout Tracking**: Pre-defined splits (Chest+Triceps, Back+Biceps, Legs+Shoulders)
- **Rest Timer**: Built-in timer with automatic logging
- **Progress Analytics**: Visual progress tracking with calendar heatmaps
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Secure Authentication**: JWT with refresh tokens
- **Real-time Updates**: Live workout progress tracking

## 🛠 Tech Stack

### Frontend

- **Next.js 14** (App Router, React 18, TypeScript)
- **Tailwind CSS** + **MUI v6** + **shadcn/ui**
- **Zustand** for state management
- **Framer Motion** for animations

### Backend

- **Node.js 18** + **Express 5**
- **TypeScript** + **Prisma ORM**
- **PostgreSQL** database
- **JWT Authentication** with httpOnly cookies

### Testing & Quality

- **Vitest** (unit testing)
- **Supertest** (API testing)
- **Playwright** (E2E testing)
- **ESLint** + **Prettier** + **Husky**

### DevOps

- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD
- **Turbo** monorepo tooling

## 📁 Project Structure

```
ironlog/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── server/       # Express.js backend API
├── packages/
│   └── ui/           # Shared UI components (shadcn/ui)
├── docker-compose.yml
├── Dockerfile
└── init.sh           # One-shot setup script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Option 1: One-Shot Setup (Recommended)

```bash
./init.sh
```

This script will:

- Install all dependencies
- Set up the database
- Run migrations and seed data
- Start all development servers

### Option 2: Manual Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment setup**

   ```bash
   cp apps/server/.env.example apps/server/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. **Database setup**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres

   # Run migrations
   pnpm db:migrate

   # Seed initial data
   pnpm db:seed
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

## 🔧 Environment Variables

### Backend (.env)

```bash
DATABASE_URL="postgresql://ironlog:password@localhost:5432/ironlog"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
NODE_ENV="development"
PORT=3001
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm build            # Build all applications
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with initial data

# Utilities
pnpm clean            # Clean all build artifacts
pnpm type-check       # TypeScript type checking
```

## 🧪 Testing

- **Unit Tests**: `pnpm test` (≥80% coverage required)
- **API Tests**: Included in unit test suite with Supertest
- **E2E Tests**: `pnpm test:e2e` with Playwright

## 🐳 Docker Development

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up postgres
docker-compose up web
docker-compose up server
```

## 📸 Screenshots

![Dashboard](docs/images/dashboard.png)
![Workout Timer](docs/images/timer.png)
![Progress History](docs/images/history.png)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@ironlog.app
- 💬 Discord: [Join our community](https://discord.gg/ironlog)
- 📚 Documentation: [docs.ironlog.app](https://docs.ironlog.app)

---

Built with ❤️ by the IronLog team
