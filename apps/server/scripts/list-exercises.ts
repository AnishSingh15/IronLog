#!/usr/bin/env npx tsx

/**
 * Script to list all exercises and find Cable Fly variants
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listExercises() {
  try {
    console.log('🔍 Listing all exercises...');

    const exercises = await prisma.exercise.findMany({
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });

    console.log(`\n📋 Found ${exercises.length} exercises:`);

    // Group by muscle group
    const grouped = exercises.reduce(
      (acc, exercise) => {
        if (!acc[exercise.muscleGroup]) {
          acc[exercise.muscleGroup] = [];
        }
        acc[exercise.muscleGroup].push(exercise);
        return acc;
      },
      {} as Record<string, typeof exercises>
    );

    Object.entries(grouped).forEach(([muscleGroup, exercises]) => {
      console.log(`\n🏋️ ${muscleGroup} (${exercises.length} exercises):`);
      exercises.forEach(exercise => {
        console.log(`  - ${exercise.name} (ID: ${exercise.id})`);
      });
    });

    // Look for exercises containing "fly" or "cable"
    const flyExercises = exercises.filter(
      ex => ex.name.toLowerCase().includes('fly') || ex.name.toLowerCase().includes('cable')
    );

    if (flyExercises.length > 0) {
      console.log('\n🔍 Exercises containing "fly" or "cable":');
      flyExercises.forEach(exercise => {
        console.log(`  - ${exercise.name} (${exercise.muscleGroup}) - ID: ${exercise.id}`);
      });
    }
  } catch (error) {
    console.error('❌ Error listing exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
listExercises().catch(console.error);
