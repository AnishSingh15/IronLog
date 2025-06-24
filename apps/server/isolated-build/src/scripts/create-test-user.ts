import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('👤 Creating test user...');

  try {
    const hashedPassword = await bcrypt.hash('testpass123', 12);

    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: hashedPassword,
      },
    });

    console.log(`✅ Test user created/updated:`);
    console.log(`   Email: test@example.com`);
    console.log(`   Password: testpass123`);
    console.log(`   User ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser().catch(error => {
  console.error('User creation failed:', error);
  process.exit(1);
});
