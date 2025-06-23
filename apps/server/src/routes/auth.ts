import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Helper functions
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: { message: 'User already exists' },
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          details: (error as unknown as { errors: unknown }).errors,
        },
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid input data',
          details: (error as unknown as { errors: unknown }).errors,
        },
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { message: 'Refresh token not found' },
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' },
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

// DELETE /api/v1/auth/account
router.delete('/account', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' },
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    // Delete user and all associated data (cascading delete)
    // Prisma will handle the cascading deletion based on the schema
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      data: { message: 'Account deleted successfully' },
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete account' },
    });
  }
});

export default router;
