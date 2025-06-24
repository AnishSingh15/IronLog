#!/usr/bin/env node

// Run the injection script against production database
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runProductionInjection() {
  try {
    console.log('🚀 Running workout injection against production database...');
    
    // Set production DATABASE_URL environment variable
    const productionDbUrl = 'postgresql://ironlog_owner:7mFNjV12DzFk@ep-fancy-bar-a5mz4bk8.us-east-2.aws.neon.tech/ironlog?sslmode=require';
    
    const command = `DATABASE_URL="${productionDbUrl}" node dist/scripts/inject-anish-workouts.js`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log('✅ Stdout:', stdout);
    }
    
    if (stderr) {
      console.log('⚠️ Stderr:', stderr);
    }
    
    console.log('🎉 Production injection completed!');
    
  } catch (error) {
    console.error('❌ Error running production injection:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runProductionInjection()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export default runProductionInjection;
