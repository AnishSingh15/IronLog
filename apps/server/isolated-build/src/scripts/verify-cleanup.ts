import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCleanup() {
  console.log('🔍 Verifying database cleanup...');

  try {
    const userCount = await prisma.user.count();
    const exerciseCount = await prisma.exercise.count();
    const workoutDayCount = await prisma.workoutDay.count();
    const setRecordCount = await prisma.setRecord.count();

    console.log(`👥 Users: ${userCount}`);
    console.log(`🏋️ Exercises: ${exerciseCount}`);
    console.log(`📅 WorkoutDays: ${workoutDayCount}`);
    console.log(`📊 SetRecords: ${setRecordCount}`);

    if (userCount === 0 && exerciseCount === 0 && workoutDayCount === 0 && setRecordCount === 0) {
      console.log('✅ Database is completely clean and ready for fresh data!');
    } else {
      console.log('⚠️ Some data still exists in the database.');
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCleanup();
