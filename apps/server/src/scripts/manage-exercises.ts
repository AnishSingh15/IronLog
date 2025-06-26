#!/usr/bin/env node

// Script to manage exercises in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ ADD NEW EXERCISES HERE
const EXERCISES_TO_ADD = [
  // Chest
  { name: 'Push-ups', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 15 },
  { name: 'Chest Dips', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 12 },
  { name: 'Decline Bench Press', muscleGroup: 'Chest', defaultSets: 3, defaultReps: 10 },

  // Back
  { name: 'Barbell Rows', muscleGroup: 'Back', defaultSets: 4, defaultReps: 8 },
  { name: 'T-Bar Rows', muscleGroup: 'Back', defaultSets: 3, defaultReps: 10 },
  { name: 'Face Pulls', muscleGroup: 'Back', defaultSets: 3, defaultReps: 15 },

  // Legs
  { name: 'Romanian Deadlifts', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 10 },
  { name: 'Bulgarian Split Squats', muscleGroup: 'Legs', defaultSets: 3, defaultReps: 12 },
  { name: 'Calf Raises', muscleGroup: 'Legs', defaultSets: 4, defaultReps: 20 },

  // Shoulders
  { name: 'Upright Rows', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 12 },
  { name: 'Front Raises', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 12 },
  { name: 'Arnold Press', muscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 10 },

  // Arms
  { name: 'Preacher Curls', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: 10 },
  { name: 'Concentration Curls', muscleGroup: 'Biceps', defaultSets: 3, defaultReps: 12 },
  { name: 'Diamond Push-ups', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: 10 },
  { name: 'Tricep Dips', muscleGroup: 'Triceps', defaultSets: 3, defaultReps: 12 },
];

// ❌ REMOVE EXERCISES HERE (by exact name)
const EXERCISES_TO_REMOVE: string[] = [
  // 'Cable Crossovers',  // Example: uncomment to remove
  // 'Shrugs',           // Example: uncomment to remove
];

async function manageExercises() {
  try {
    console.log('🏋️ Starting exercise management...');
    await prisma.$connect();

    // ➕ ADD NEW EXERCISES
    if (EXERCISES_TO_ADD.length > 0) {
      console.log(`\n➕ Adding ${EXERCISES_TO_ADD.length} new exercises...`);

      for (const exercise of EXERCISES_TO_ADD) {
        // Check if exercise already exists
        const existing = await prisma.exercise.findUnique({
          where: { name: exercise.name },
        });

        if (existing) {
          console.log(`⚠️  ${exercise.name} already exists, skipping...`);
        } else {
          await prisma.exercise.create({
            data: exercise,
          });
          console.log(`✅ Added: ${exercise.name} (${exercise.muscleGroup})`);
        }
      }
    }

    // ➖ REMOVE EXERCISES
    if (EXERCISES_TO_REMOVE.length > 0) {
      console.log(`\n➖ Removing ${EXERCISES_TO_REMOVE.length} exercises...`);

      for (const exerciseName of EXERCISES_TO_REMOVE) {
        // Check if exercise exists
        const existing = await prisma.exercise.findUnique({
          where: { name: exerciseName },
        });

        if (!existing) {
          console.log(`⚠️  ${exerciseName} not found, skipping...`);
        } else {
          // Check if exercise is used in any workouts
          const usageCount = await prisma.setRecord.count({
            where: { exerciseId: existing.id },
          });

          if (usageCount > 0) {
            console.log(`⚠️  ${exerciseName} is used in ${usageCount} sets, skipping removal...`);
          } else {
            await prisma.exercise.delete({
              where: { name: exerciseName },
            });
            console.log(`❌ Removed: ${exerciseName}`);
          }
        }
      }
    }

    // 📊 SHOW FINAL STATS
    console.log('\n📊 Final Exercise Stats:');
    const stats = await prisma.exercise.groupBy({
      by: ['muscleGroup'],
      _count: { muscleGroup: true },
      orderBy: { muscleGroup: 'asc' },
    });

    stats.forEach(stat => {
      console.log(`   ${stat.muscleGroup}: ${stat._count.muscleGroup} exercises`);
    });

    const totalExercises = await prisma.exercise.count();
    console.log(`   Total: ${totalExercises} exercises`);

    console.log('\n🎉 Exercise management completed!');
  } catch (error) {
    console.error('❌ Error managing exercises:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  manageExercises()
    .then(() => {
      console.log('✅ Exercise management script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Exercise management script failed:', error);
      process.exit(1);
    });
}

export default manageExercises;
