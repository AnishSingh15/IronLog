import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // Chest
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 80,
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 30,
  },
  {
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
  },
  {
    name: 'Cable Crossovers',
    muscleGroup: 'Chest',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 15,
  },

  // Triceps
  {
    name: 'Close-Grip Bench Press',
    muscleGroup: 'Triceps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 60,
  },
  {
    name: 'Overhead Tricep Extension',
    muscleGroup: 'Triceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25,
  },
  {
    name: 'Tricep Pushdowns',
    muscleGroup: 'Triceps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 30,
  },

  // Back
  { name: 'Pull-ups', muscleGroup: 'Back', defaultSets: 4, defaultReps: 8, defaultWeight: 0 },
  { name: 'Deadlifts', muscleGroup: 'Back', defaultSets: 4, defaultReps: 6, defaultWeight: 100 },
  {
    name: 'Lat Pulldowns',
    muscleGroup: 'Back',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 70,
  },
  { name: 'Cable Rows', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10, defaultWeight: 60 },

  // Biceps
  {
    name: 'Barbell Curls',
    muscleGroup: 'Biceps',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 40,
  },
  {
    name: 'Hammer Curls',
    muscleGroup: 'Biceps',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
  },
  {
    name: 'Cable Curls',
    muscleGroup: 'Biceps',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 25,
  },

  // Legs
  { name: 'Squats', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 8, defaultWeight: 100 },
  { name: 'Leg Press', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12, defaultWeight: 150 },
  { name: 'Leg Curls', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
  {
    name: 'Leg Extensions',
    muscleGroup: 'Legs',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 40,
  },
  {
    name: 'Walking Lunges',
    muscleGroup: 'Legs',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
  },

  // Shoulders
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 50,
  },
  {
    name: 'Lateral Raises',
    muscleGroup: 'Shoulders',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 15,
  },
  {
    name: 'Rear Delt Flyes',
    muscleGroup: 'Shoulders',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 12,
  },
  { name: 'Shrugs', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
];

async function seedExercises() {
  console.log('🏋️ Seeding exercises...');

  try {
    // Create exercises
    await prisma.exercise.createMany({
      data: exercises,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${exercises.length} exercises`);
    console.log('🎯 Database is ready for your custom seed data!');
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
