import { PrismaClient } from '@prisma/client';
import { Response, Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/v1/set-records
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const setRecords = await prisma.setRecord.findMany({
      where: {
        workoutDay: {
          userId,
        },
        actualWeight: {
          not: null,
        },
        actualReps: {
          not: null,
        },
      },
      include: {
        exercise: true,
        workoutDay: {
          select: {
            date: true,
          },
        },
      },
      orderBy: [
        { workoutDay: { date: 'desc' } },
        { exercise: { name: 'asc' } },
        { setIndex: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: setRecords,
    });
  } catch (error) {
    console.error('Get set records error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// Validation schema
const setRecordSchema = z.object({
  workoutDayId: z.string(),
  exerciseId: z.string(),
  setIndex: z.number().int().positive(),
  plannedWeight: z.number().optional().nullable(),
  plannedReps: z.number().int().positive().optional().nullable(),
  actualWeight: z.number().optional().nullable(),
  actualReps: z.number().int().positive().optional().nullable(),
  secondsRest: z.number().int().positive().optional().nullable(),
});

// POST /api/v1/set-records
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const data = setRecordSchema.parse(req.body);

    // Verify that the workout day belongs to the user
    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: data.workoutDayId,
        userId,
      },
    });

    if (!workoutDay) {
      return res.status(404).json({
        success: false,
        error: { message: 'Workout day not found' },
      });
    }

    // Create or update set record
    const setRecord = await prisma.setRecord.upsert({
      where: {
        workoutDayId_exerciseId_setIndex: {
          workoutDayId: data.workoutDayId,
          exerciseId: data.exerciseId,
          setIndex: data.setIndex,
        },
      },
      create: data,
      update: {
        plannedWeight: data.plannedWeight,
        plannedReps: data.plannedReps,
        actualWeight: data.actualWeight,
        actualReps: data.actualReps,
        secondsRest: data.secondsRest,
      },
      include: {
        exercise: true,
        workoutDay: true,
      },
    });

    // Check if all sets are completed and auto-complete workout
    if (data.actualWeight !== null && data.actualReps !== null) {
      const allSetRecords = await prisma.setRecord.findMany({
        where: { workoutDayId: data.workoutDayId },
      });

      const completedSets = allSetRecords.filter(
        set => set.actualWeight !== null && set.actualReps !== null
      );

      if (completedSets.length === allSetRecords.length) {
        await prisma.workoutDay.update({
          where: { id: data.workoutDayId },
          data: { completed: true },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: { setRecord },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: error.errors },
      });
    }

    console.error('Set record error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// PATCH /api/v1/set-records/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const setRecordId = req.params.id;
    
    if (!setRecordId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Set record ID is required' },
      });
    }
    
    const updateSchema = z.object({
      actualWeight: z.number().nullable().optional(),
      actualReps: z.number().int().positive().nullable().optional(),
    });
    
    const data = updateSchema.parse(req.body);

    // Verify that the set record belongs to a workout day owned by the user
    const setRecord = await prisma.setRecord.findFirst({
      where: {
        id: setRecordId,
        workoutDay: {
          userId,
        },
      },
      include: {
        workoutDay: true,
        exercise: true,
      },
    });

    if (!setRecord) {
      return res.status(404).json({
        success: false,
        error: { message: 'Set record not found' },
      });
    }

    // Update the set record
    const updatedSetRecord = await prisma.setRecord.update({
      where: { id: setRecordId },
      data: {
        actualWeight: data.actualWeight ?? setRecord.actualWeight,
        actualReps: data.actualReps ?? setRecord.actualReps,
      },
      include: {
        exercise: true,
        workoutDay: true,
      },
    });

    // Check if all sets are now completed and auto-complete workout
    if (updatedSetRecord.actualWeight !== null && updatedSetRecord.actualReps !== null) {
      const allSetRecords = await prisma.setRecord.findMany({
        where: { workoutDayId: setRecord.workoutDayId },
      });

      const completedSets = allSetRecords.filter(
        set => (set.id === setRecordId && updatedSetRecord.actualWeight !== null && updatedSetRecord.actualReps !== null) ||
               (set.id !== setRecordId && set.actualWeight !== null && set.actualReps !== null)
      );

      if (completedSets.length === allSetRecords.length) {
        await prisma.workoutDay.update({
          where: { id: setRecord.workoutDayId },
          data: { completed: true },
        });
      }
    }

    return res.json({
      success: true,
      data: { setRecord: updatedSetRecord },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data', details: error.errors },
      });
    }

    console.error('Set record update error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

// GET /api/v1/set-records
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const setRecords = await prisma.setRecord.findMany({
      where: {
        workoutDay: {
          userId,
        },
        actualWeight: {
          not: null,
        },
        actualReps: {
          not: null,
        },
      },
      include: {
        exercise: true,
        workoutDay: {
          select: {
            date: true,
          },
        },
      },
      orderBy: [
        { workoutDay: { date: 'desc' } },
        { exercise: { name: 'asc' } },
        { setIndex: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: setRecords,
    });
  } catch (error) {
    console.error('Get set records error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' },
    });
  }
});

export default router;
