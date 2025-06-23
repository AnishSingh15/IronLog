import { SetRecord, WorkoutDay, Exercise } from '@prisma/client';
import { Response, Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { workoutService } from '../services/workout.service';

// Type for workout with relations
type WorkoutWithSetRecords = WorkoutDay & {
  setRecords: (SetRecord & {
    exercise: Exercise;
  })[];
};

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// POST /api/v1/workouts/start
router.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const startWorkoutSchema = z.object({
      splitKey: z.enum(['CHEST_TRI', 'BACK_BI', 'LEGS_SHO']),
    });

    const { splitKey } = startWorkoutSchema.parse(req.body);

    const workoutDay = await workoutService.startWorkout(userId, splitKey);

    if (!workoutDay) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create workout' },
      });
    }

    // Calculate completion percentage
    const totalSets = workoutDay.setRecords.length;
    const completedSets = workoutDay.setRecords.filter(
      (set: SetRecord) => set.actualWeight !== null && set.actualReps !== null
    ).length;
    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return res.status(201).json({
      success: true,
      data: {
        workoutDay,
        completionPercentage,
        splitName: workoutService.getSplitName(workoutDay.setRecords),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: error.errors },
      });
    }

    console.error('Start workout error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// GET /api/v1/workouts/today
router.get('/today', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const workoutDay = await workoutService.getTodayWorkout(userId);

    if (!workoutDay) {
      return res.status(404).json({
        success: false,
        error: { message: 'No workout found for today' },
      });
    }

    // Calculate completion percentage
    const totalSets = workoutDay.setRecords.length;
    const completedSets = workoutDay.setRecords.filter(
      (set: SetRecord) => set.actualWeight !== null && set.actualReps !== null
    ).length;
    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return res.json({
      success: true,
      data: {
        workoutDay,
        completionPercentage,
        splitName: workoutService.getSplitName(workoutDay.setRecords),
      },
    });
  } catch (error) {
    console.error('Get today workout error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// PATCH /api/v1/workouts/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const workoutDayId = req.params.id;

    if (!workoutDayId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Workout day ID is required' },
      });
    }

    const updatedWorkoutDay = await workoutService.completeWorkout(userId, workoutDayId);

    return res.json({
      success: true,
      data: { workoutDay: updatedWorkoutDay },
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    if (error instanceof Error && error.message === 'Workout day not found') {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// GET /api/v1/workouts/history
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const workoutHistory = await workoutService.getWorkoutHistory(
      userId,
      startDate as string,
      endDate as string
    );

    // Calculate completion percentage for each workout
    const workoutsWithCompletion = workoutHistory.map((workout: WorkoutWithSetRecords) => {
      const totalSets = workout.setRecords.length;
      const completedSets = workout.setRecords.filter(
        (set: SetRecord) => set.actualWeight !== null && set.actualReps !== null
      ).length;
      const completionPercentage =
        totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

      return {
        ...workout,
        completionPercentage,
        splitName: workoutService.getSplitName(workout.setRecords),
      };
    });

    res.json({
      success: true,
      data: workoutsWithCompletion,
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// GET /api/v1/workouts/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const stats = await workoutService.getWorkoutStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// POST /api/v1/workouts/custom
router.post('/custom', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const createCustomWorkoutSchema = z.object({
      exerciseIds: z.array(z.string()).min(1, 'At least one exercise is required'),
      customSets: z.record(z.string(), z.number().min(1).max(10)).optional(),
    });

    const { exerciseIds, customSets } = createCustomWorkoutSchema.parse(req.body);

    const workoutDay = await workoutService.createCustomWorkout(userId, exerciseIds, customSets);

    if (!workoutDay) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create custom workout' },
      });
    }

    // Calculate completion percentage
    const totalSets = workoutDay.setRecords.length;
    const completedSets = workoutDay.setRecords.filter(
      (set: SetRecord) => set.actualWeight !== null && set.actualReps !== null
    ).length;
    const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return res.status(201).json({
      success: true,
      data: {
        workoutDay,
        completionPercentage,
        splitName: workoutService.getSplitName(workoutDay.setRecords),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: error.errors },
      });
    }

    console.error('Error creating custom workout:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
