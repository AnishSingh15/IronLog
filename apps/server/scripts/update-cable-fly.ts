#!/usr/bin/env npx tsx

/**
 * Script to update "Cable Fly" exercise muscle group from "Other" to "Chest"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCableFly() {
  try {
    console.log('🔍 Looking for Cable Fly exercise...');

    // Find the Cable Fly exercise
    const cableFly = await prisma.exercise.findFirst({
      where: {
        name: {
          contains: 'Cable Fly',
          mode: 'insensitive',
        },
      },
    });

    if (!cableFly) {
      console.log('❌ Cable Fly exercise not found');
      return;
    }

    console.log(`✅ Found Cable Fly exercise:`, {
      id: cableFly.id,
      name: cableFly.name,
      currentMuscleGroup: cableFly.muscleGroup,
    });

    if (cableFly.muscleGroup === 'Chest') {
      console.log('✅ Cable Fly is already categorized as Chest exercise');
      return;
    }

    // Update the muscle group to Chest
    const updatedExercise = await prisma.exercise.update({
      where: { id: cableFly.id },
      data: { muscleGroup: 'Chest' },
    });

    console.log('✅ Successfully updated Cable Fly exercise:', {
      id: updatedExercise.id,
      name: updatedExercise.name,
      newMuscleGroup: updatedExercise.muscleGroup,
    });
  } catch (error) {
    console.error('❌ Error updating Cable Fly exercise:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
updateCableFly().catch(console.error);
