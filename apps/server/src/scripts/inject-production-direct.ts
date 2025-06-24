#!/usr/bin/env node

// Direct database injection script with proper connection handling
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma client with production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://ironlog_owner:7mFNjV12DzFk@ep-fancy-bar-a5mz4bk8.us-east-2.aws.neon.tech/ironlog?sslmode=require&connection_limit=1&pool_timeout=20&connect_timeout=60'
    }
  }
});

// Your workout history data
const workoutHistory = [
  {
    date: '2025-06-18',
    split: 'Chest + Triceps',
    exercises: [
      { name: 'Incline Barbell Press', sets: [{w:70,r:8},{w:70,r:5},{w:60,r:6},{w:40,r:9}],
        description: 'Compound chest press. Aim 6-10 reps, 2-3 min rest.' },
      { name: 'Cable Fly', sets: [{w:45,r:18},{w:45,r:15},{w:45,r:15}],
        description: 'Isolation fly. 12-20 reps, slow eccentric, 60-90 s rest.' },
      { name: 'Incline Dumbbell Press', sets: [{w:30,r:8},{w:25,r:12},{w:25,r:10}],
        description: 'Compound press (dumbbell). 8-12 reps, 2 min rest.' },
      { name: 'Tricep Push-down', sets: [{w:60,r:15},{w:60,r:10},{w:60,r:5},{w:45,r:10},{w:30,r:10},{w:30,r:5}],
        description: 'Cable isolation. 10-15 reps, 45-75 s rest. Add drops.' },
      { name: 'Overhead DB Extension', sets: [{w:25,r:15},{w:25,r:13},{w:25,r:10},{w:20,r:5}],
        description: 'Long-head triceps stretch. 10-15 reps, 60-90 s rest.' }
    ]
  },
  {
    date: '2025-06-20',
    split: 'Back + Biceps',
    exercises: [
      { name: 'Barbell Row', sets: [{w:112,r:8},{w:112,r:6}],
        description: 'Heavy compound pull. 6-8 reps, 2-3 min rest.' },
      { name: 'Lat Pullover', sets: [{w:90,r:12},{w:90,r:12},{w:105,r:10}],
        description: 'Stretch isolation. 10-15 reps, 60-90 s rest.' },
      { name: 'Seated Row (R)', sets: [{w:55,r:10},{w:35,r:5}],
        description: 'Unilateral row. 8-12 reps, 90 s rest.' },
      { name: 'Seated Row (L)', sets: [{w:55,r:10},{w:35,r:5}],
        description: 'Unilateral row. 8-12 reps, 90 s rest.' },
      { name: 'Seated Row (Bil)', sets: [{w:70,r:10}],
        description: 'Bilateral row opener.' },
      { name: 'Incline DB Curl', sets: [{w:15,r:10},{w:15,r:5},{w:15,r:5},{w:10,r:2},{w:7.5,r:5}],
        description: 'Long-head biceps. 8-12 reps, 60-90 s rest. Drop sets ok.' }
    ]
  },
  {
    date: '2025-06-21',
    split: 'Legs + Shoulders',
    exercises: [
      { name: 'Smith Squat', sets: [{w:70,r:9},{w:70,r:6},{w:70,r:5}],
        description: 'Compound squat. 6-10 reps, 2-3 min rest.' },
      { name: 'Hamstring Curl', sets: [{w:60,r:12},{w:60,r:9},{w:60,r:8},{w:40,r:3}],
        description: 'Isolation curl. 8-12 reps, 60-90 s rest.' },
      { name: 'Leg Extension', sets: [{w:20,r:12},{w:30,r:12}],
        description: 'Quad finisher. 12-15 reps, 45-60 s rest.' },
      { name: 'DB Shoulder Press', sets: [{w:25,r:10},{w:30,r:6},{w:25,r:3},{w:30,r:6},{w:25,r:3}],
        description: 'Compound press. 6-10 reps, 2 min rest.' },
      { name: 'DB Lateral Raise', sets: [{w:15,r:10},{w:10,r:5},{w:10,r:12},{w:7.5,r:3},{w:10,r:12},{w:7.5,r:3}],
        description: 'Side-delt isolation. 12-15 reps, 45-60 s rest.' },
      { name: 'Cable Lateral Raise (R)', sets: [{w:15,r:7}], description: 'One-arm lateral, 6-10 reps.' },
      { name: 'Cable Lateral Raise (L)', sets: [{w:15,r:7}], description: 'One-arm lateral, 6-10 reps.' },
      { name: 'Reverse Pec Deck (Bil)', sets: [{w:40,r:12},{w:40,r:12}], description: 'Rear delts. 12-15 reps.' },
      { name: 'Reverse Pec Deck (R)', sets: [{w:30,r:13},{w:20,r:5}], description: 'Rear delts single-arm.' },
      { name: 'Reverse Pec Deck (L)', sets: [{w:20,r:13},{w:30,r:5}], description: 'Rear delts single-arm.' }
    ]
  }
];

// Extract muscle groups from exercise descriptions and names
function getMuscleGroup(exerciseName: string, description: string): string {
  const name = exerciseName.toLowerCase();
  const desc = description.toLowerCase();
  
  if (name.includes('chest') || name.includes('press') && (desc.includes('chest') || name.includes('incline'))) return 'Chest';
  if (name.includes('tricep') || desc.includes('tricep')) return 'Triceps';
  if (name.includes('back') || name.includes('row') || name.includes('lat') || desc.includes('pull')) return 'Back';
  if (name.includes('bicep') || name.includes('curl') && desc.includes('bicep')) return 'Biceps';
  if (name.includes('squat') || name.includes('leg') || name.includes('hamstring') || desc.includes('quad')) return 'Legs';
  if (name.includes('shoulder') || name.includes('lateral') || name.includes('pec deck') || desc.includes('delt')) return 'Shoulders';
  
  return 'Other';
}

async function injectAnishWorkoutsProduction() {
  try {
    console.log('🚀 Starting production workout injection for Anish...');

    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connection established');

    // 1. Find or create Anish's user account
    let user = await prisma.user.findUnique({
      where: { email: 'anish15may@gmail.com' }
    });

    if (!user) {
      console.log('👤 Creating user account for anish15may@gmail.com...');
      const hashedPassword = await bcrypt.hash('Qaz@1234', 12);
      
      user = await prisma.user.create({
        data: {
          email: 'anish15may@gmail.com',
          name: 'Anish Singh',
          passwordHash: hashedPassword,
        }
      });
      console.log('✅ User created successfully');
    } else {
      console.log('👤 User account found');
    }

    // 2. Extract unique exercises and create/update exercise templates
    console.log('💪 Processing exercise templates...');
    const uniqueExercises = new Map<string, {name: string, description: string, muscleGroup: string}>();
    
    for (const workout of workoutHistory) {
      for (const exercise of workout.exercises) {
        const muscleGroup = getMuscleGroup(exercise.name, exercise.description);
        uniqueExercises.set(exercise.name, {
          name: exercise.name,
          description: exercise.description,
          muscleGroup
        });
      }
    }

    // Create/update exercises in database
    for (const [name, exerciseData] of uniqueExercises) {
      await prisma.exercise.upsert({
        where: { name },
        update: {
          muscleGroup: exerciseData.muscleGroup
        },
        create: {
          name: exerciseData.name,
          muscleGroup: exerciseData.muscleGroup,
          defaultSets: 3,
          defaultReps: 10
        }
      });
    }
    console.log(`✅ Processed ${uniqueExercises.size} exercise templates`);

    // 3. Create workout days and set records for Anish
    console.log('📅 Creating workout history...');
    
    for (const workout of workoutHistory) {
      const workoutDate = new Date(workout.date + 'T05:00:00.000Z'); // 5 AM UTC

      // Create or find workout day
      let workoutDay = await prisma.workoutDay.findFirst({
        where: {
          userId: user.id,
          date: workoutDate
        }
      });

      if (!workoutDay) {
        workoutDay = await prisma.workoutDay.create({
          data: {
            userId: user.id,
            date: workoutDate,
            completed: true
          }
        });
      }

      // Create set records for each exercise
      for (const exercise of workout.exercises) {
        const exerciseRecord = await prisma.exercise.findUnique({
          where: { name: exercise.name }
        });

        if (exerciseRecord) {
          // Create set records for each set
          for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
            const set = exercise.sets[setIndex];
            
            if (set && set.w !== undefined && set.r !== undefined) {
              await prisma.setRecord.create({
                data: {
                  workoutDayId: workoutDay.id,
                  exerciseId: exerciseRecord.id,
                  setIndex: setIndex,
                  plannedWeight: set.w,
                  plannedReps: set.r,
                  actualWeight: set.w,
                  actualReps: set.r,
                  secondsRest: 120
                }
              });
            }
          }
        }
      }

      console.log(`✅ Created workout for ${workout.date} - ${workout.split}`);
    }

    console.log('🎉 Production workout injection completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - User: ${user.email}`);
    console.log(`   - Exercises created: ${uniqueExercises.size}`);
    console.log(`   - Workout days: ${workoutHistory.length}`);
    
    const totalSets = workoutHistory.reduce((total, workout) => 
      total + workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0), 0);
    console.log(`   - Total sets: ${totalSets}`);

  } catch (error) {
    console.error('❌ Error injecting production workouts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  injectAnishWorkoutsProduction()
    .then(() => {
      console.log('✅ Production injection script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Production injection script failed:', error);
      process.exit(1);
    });
}

export default injectAnishWorkoutsProduction;
