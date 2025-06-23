import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Delete in the correct order due to foreign key constraints
    console.log('Deleting SetRecords...');
    await prisma.setRecord.deleteMany({});

    console.log('Deleting WorkoutDays...');
    await prisma.workoutDay.deleteMany({});

    console.log('Deleting Exercises...');
    await prisma.exercise.deleteMany({});

    console.log('Deleting Users...');
    await prisma.user.deleteMany({});

    console.log('✅ Database cleanup completed successfully!');
    console.log('📊 All tables have been cleared.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
