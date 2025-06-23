import { PrismaClient, Exercise } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const exercises = [
  // Chest
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', defaultSets: 4, defaultReps: 8 },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 10 },
  { name: 'Dumbbell Flyes', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 12 },
  { name: 'Cable Crossovers', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 15 },

  // Triceps
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: 10 },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: 12 },
  { name: 'Tricep Pushdowns', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: 15 },

  // Back
  { name: 'Pull-ups', muscleGroup: 'Back', defaultSets: 4, defaultReps: 8 },
  { name: 'Deadlifts', muscleGroup: 'Back', defaultSets: 4, defaultReps: 6 },
  { name: 'Lat Pulldowns', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10 },
  { name: 'Cable Rows', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10 },

  // Biceps
  { name: 'Barbell Curls', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: 10 },
  { name: 'Hammer Curls', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: 12 },
  { name: 'Cable Curls', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: 15 },

  // Legs
  { name: 'Squats', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 8 },
  { name: 'Leg Press', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Leg Curls', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Leg Extensions', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 15 },
  { name: 'Walking Lunges', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },

  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 8 },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 12 },
  { name: 'Rear Delt Flyes', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15 },
  { name: 'Shrugs', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15 },
];

const SPLITS: Record<string, { groups: string[]; maxPerGroup: number }> = {
  Monday: { groups: ['Chest', 'Triceps'], maxPerGroup: 3 },
  Tuesday: { groups: ['Back', 'Biceps'], maxPerGroup: 3 },
  Wednesday: { groups: ['Legs', 'Shoulders'], maxPerGroup: 3 },
  Thursday: { groups: ['Chest', 'Triceps'], maxPerGroup: 3 },
  Friday: { groups: ['Back', 'Biceps'], maxPerGroup: 3 },
  Saturday: { groups: ['Legs', 'Shoulders'], maxPerGroup: 3 },
  Sunday: { groups: [], maxPerGroup: 0 },
};

async function main() {
  console.log('🌱 Seeding database...');

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }

  const hashedPassword = await bcrypt.hash('Qaz@1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'anish15may@gmail.com' },
    update: {},
    create: {
      email: 'anish15may@gmail.com',
      name: 'Anish Singh',
      passwordHash: hashedPassword,
    },
  });

  const allExercises = await prisma.exercise.findMany();
  const today = new Date();
  const sampleDays = [-6, -4, -2, -1, 0]; // Mon to today (5 workouts)

  for (const offset of sampleDays) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    const split = SPLITS[weekday];
    if (!split || split.groups.length === 0) continue;

    const workoutDay = await prisma.workoutDay.create({
      data: {
        userId: user.id,
        date,
        completed: offset !== 0,
      },
    });

    const selectedExercises: typeof allExercises = [];
    for (const group of split.groups) {
      const groupEx = allExercises.filter((e: Exercise) => e.muscleGroup === group);
      const chosen = groupEx.slice(0, split.maxPerGroup);
      selectedExercises.push(...chosen);
    }

    for (const exercise of selectedExercises) {
      for (let setIndex = 0; setIndex < exercise.defaultSets; setIndex++) {
        await prisma.setRecord.create({
          data: {
            workoutDayId: workoutDay.id,
            exerciseId: exercise.id,
            setIndex,
            plannedWeight: 100,
            plannedReps: exercise.defaultReps,
            actualWeight: offset !== 0 ? 100 : null,
            actualReps: offset !== 0 ? exercise.defaultReps : null,
            secondsRest: 90,
          },
        });
      }
    }

    console.log(`✅ Created ${weekday}'s workout (${selectedExercises.length} exercises)`);
  }

  console.log('🎉 Done!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
