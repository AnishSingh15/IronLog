#!/usr/bin/env node

// Script to inject workout data via API endpoints
import fetch from 'node-fetch';

const API_BASE = 'https://ironlog.onrender.com/api/v1';

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

async function injectWorkoutsViaAPI() {
  try {
    console.log('🚀 Starting API-based workout injection...');

    // 1. Login to get JWT token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'anish15may@gmail.com',
        password: 'Qaz@1234'
      })
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json() as any;
    const token = loginData.data.accessToken;
    console.log('✅ Login successful');

    // 2. Create exercise templates first
    console.log('💪 Creating exercise templates...');
    const uniqueExercises = new Map();
    
    for (const workout of workoutHistory) {
      for (const exercise of workout.exercises) {
        const muscleGroup = getMuscleGroup(exercise.name, exercise.description);
        uniqueExercises.set(exercise.name, {
          name: exercise.name,
          muscleGroup,
          defaultSets: 3,
          defaultReps: 10
        });
      }
    }

    // Create exercises via API
    for (const [name, exerciseData] of uniqueExercises) {
      try {
        const createExerciseResponse = await fetch(`${API_BASE}/exercises`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(exerciseData)
        });
        
        if (createExerciseResponse.ok) {
          console.log(`✅ Created exercise: ${name}`);
        } else {
          console.log(`⚠️ Exercise may already exist: ${name}`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating exercise ${name}:`, error);
      }
    }

    console.log('🎉 Workout injection completed via API!');
    console.log(`📊 Summary:`);
    console.log(`   - Exercise templates created: ${uniqueExercises.size}`);
    console.log(`   - Ready for workout creation via frontend`);

  } catch (error) {
    console.error('❌ Error in API injection:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  injectWorkoutsViaAPI()
    .then(() => {
      console.log('✅ API injection completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ API injection failed:', error);
      process.exit(1);
    });
}

export default injectWorkoutsViaAPI;
