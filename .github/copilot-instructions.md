<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# IronLog Project Context

This is a production-ready fitness tracking application built as a monorepo with the following architecture:

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Node.js 18, Express 5, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + MUI v6 + shadcn/ui
- **State**: Zustand for client-side state management
- **Auth**: JWT with httpOnly refresh tokens
- **Testing**: Vitest + Supertest + Playwright

## Code Style & Patterns

- Use TypeScript strict mode
- Follow React best practices with Server Components
- Implement mobile-first responsive design
- Use Tailwind utility classes with MUI theming
- Apply framer-motion for animations (easeOut, 0.25s)
- Ensure accessibility with aria-labels
- Follow REST API conventions for Express routes

## Project Structure

- `apps/web`: Next.js frontend with App Router
- `apps/server`: Express API server
- `packages/ui`: Shared shadcn/ui components

## Database Schema

- User: authentication and profile
- WorkoutDay: daily workout sessions
- Exercise: predefined exercise templates
- SetRecord: individual set tracking with actual vs planned metrics

## Key Features

- JWT authentication with secure refresh tokens
- Auto-generating workout days at 5 AM
- Real-time set timer with Zustand state
- Calendar heatmap for progress visualization
- Mobile-optimized accordion UI for workout tracking

When generating code:

1. Use TypeScript with proper type definitions
2. Follow the established component patterns
3. Implement proper error handling
4. Add appropriate tests for new features
5. Ensure mobile responsiveness
6. Apply consistent styling with the established theme
