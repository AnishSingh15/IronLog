import { PrismaClient, Exercise } from '@prisma/client';
import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/exercises
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });

    // Group exercises by muscle group
    const exercisesByMuscleGroup = exercises.reduce(
      (acc: Record<string, Exercise[]>, exercise: Exercise) => {
        const muscleGroup = exercise.muscleGroup;
        if (!acc[muscleGroup]) {
          acc[muscleGroup] = [];
        }
        acc[muscleGroup]!.push(exercise);
        return acc;
      },
      {} as Record<string, Exercise[]>
    );

    res.json({
      success: true,
      data: {
        exercises,
        exercisesByMuscleGroup,
      },
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
