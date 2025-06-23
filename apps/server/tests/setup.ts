import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from 'vitest';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/test',
    },
  },
});

beforeAll(async () => {
  // Ensure test database is clean
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
