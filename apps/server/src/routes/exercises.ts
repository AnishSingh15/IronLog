import { PrismaClient } from '@prisma/client';
import { Response, Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/v1/exercises
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });

    // Group exercises by muscle group
    const exercisesByMuscleGroup = exercises.reduce(
      (acc, exercise) => {
        if (!acc[exercise.muscleGroup]) {
          acc[exercise.muscleGroup] = [];
        }
        acc[exercise.muscleGroup].push(exercise);
        return acc;
      },
      {} as Record<string, typeof exercises>
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
