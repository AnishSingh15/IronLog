import { PrismaClient } from '@prisma/client';

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
