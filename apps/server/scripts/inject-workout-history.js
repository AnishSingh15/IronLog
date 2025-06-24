#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Script to inject complete workout history via API endpoints
const node_fetch_1 = require("node-fetch");
const API_BASE = 'https://ironlog.onrender.com/api/v1';
// Helper function to convert lbs to kg for display
function lbsToKg(lbs) {
    return Math.round((lbs * 0.453592) * 10) / 10; // Round to 1 decimal place
}
// Helper function to format weight display as "lbs (kg)"
function formatWeight(lbs) {
    return `${lbs}lbs (${lbsToKg(lbs)}kg)`;
}
const workoutHistory = [
    {
        date: '2024-06-18',
        split: 'Chest + Triceps',
        exercises: [
            { name: 'Incline Barbell Press', sets: [{ w: 70, r: 8 }, { w: 70, r: 5 }, { w: 60, r: 6 }, { w: 40, r: 9 }],
                description: 'Compound chest press. Aim 6-10 reps, 2-3 min rest.' },
            { name: 'Cable Fly', sets: [{ w: 45, r: 18 }, { w: 45, r: 15 }, { w: 45, r: 15 }],
                description: 'Isolation fly. 12-20 reps, slow eccentric, 60-90 s rest.' },
            { name: 'Incline Dumbbell Press', sets: [{ w: 30, r: 8 }, { w: 25, r: 12 }, { w: 25, r: 10 }],
                description: 'Compound press (dumbbell). 8-12 reps, 2 min rest.' },
            { name: 'Tricep Push-down', sets: [{ w: 60, r: 15 }, { w: 60, r: 10 }, { w: 60, r: 5 }, { w: 45, r: 10 }, { w: 30, r: 10 }, { w: 30, r: 5 }],
                description: 'Cable isolation. 10-15 reps, 45-75 s rest. Add drops.' },
            { name: 'Overhead DB Extension', sets: [{ w: 25, r: 15 }, { w: 25, r: 13 }, { w: 25, r: 10 }, { w: 20, r: 5 }],
                description: 'Long-head triceps stretch. 10-15 reps, 60-90 s rest.' }
        ]
    },
    {
        date: '2024-06-20',
        split: 'Back + Biceps',
        exercises: [
            { name: 'Barbell Row', sets: [{ w: 112, r: 8 }, { w: 112, r: 6 }],
                description: 'Heavy compound pull. 6-8 reps, 2-3 min rest.' },
            { name: 'Lat Pullover', sets: [{ w: 90, r: 12 }, { w: 90, r: 12 }, { w: 105, r: 10 }],
                description: 'Stretch isolation. 10-15 reps, 60-90 s rest.' },
            { name: 'Seated Row (R)', sets: [{ w: 55, r: 10 }, { w: 35, r: 5 }],
                description: 'Unilateral row. 8-12 reps, 90 s rest.' },
            { name: 'Seated Row (L)', sets: [{ w: 55, r: 10 }, { w: 35, r: 5 }],
                description: 'Unilateral row. 8-12 reps, 90 s rest.' },
            { name: 'Seated Row (Bil)', sets: [{ w: 70, r: 10 }],
                description: 'Bilateral row opener.' },
            { name: 'Incline DB Curl', sets: [{ w: 15, r: 10 }, { w: 15, r: 5 }, { w: 15, r: 5 }, { w: 10, r: 2 }, { w: 7.5, r: 5 }],
                description: 'Long-head biceps. 8-12 reps, 60-90 s rest. Drop sets ok.' }
        ]
    },
    {
        date: '2024-06-21',
        split: 'Legs + Shoulders',
        exercises: [
            { name: 'Smith Squat', sets: [{ w: 70, r: 9 }, { w: 70, r: 6 }, { w: 70, r: 5 }],
                description: 'Compound squat. 6-10 reps, 2-3 min rest.' },
            { name: 'Hamstring Curl', sets: [{ w: 60, r: 12 }, { w: 60, r: 9 }, { w: 60, r: 8 }, { w: 40, r: 3 }],
                description: 'Isolation curl. 8-12 reps, 60-90 s rest.' },
            { name: 'Leg Extension', sets: [{ w: 20, r: 12 }, { w: 30, r: 12 }],
                description: 'Quad finisher. 12-15 reps, 45-60 s rest.' },
            { name: 'DB Shoulder Press', sets: [{ w: 25, r: 10 }, { w: 30, r: 6 }, { w: 25, r: 3 }, { w: 30, r: 6 }, { w: 25, r: 3 }],
                description: 'Compound press. 6-10 reps, 2 min rest.' },
            { name: 'DB Lateral Raise', sets: [{ w: 15, r: 10 }, { w: 10, r: 5 }, { w: 10, r: 12 }, { w: 7.5, r: 3 }, { w: 10, r: 12 }, { w: 7.5, r: 3 }],
                description: 'Side-delt isolation. 12-15 reps, 45-60 s rest.' },
            { name: 'Cable Lateral Raise (R)', sets: [{ w: 15, r: 7 }], description: 'One-arm lateral, 6-10 reps.' },
            { name: 'Cable Lateral Raise (L)', sets: [{ w: 15, r: 7 }], description: 'One-arm lateral, 6-10 reps.' },
            { name: 'Reverse Pec Deck (Bil)', sets: [{ w: 40, r: 12 }, { w: 40, r: 12 }], description: 'Rear delts. 12-15 reps.' },
            { name: 'Reverse Pec Deck (R)', sets: [{ w: 30, r: 13 }, { w: 20, r: 5 }], description: 'Rear delts single-arm.' },
            { name: 'Reverse Pec Deck (L)', sets: [{ w: 20, r: 13 }, { w: 30, r: 5 }], description: 'Rear delts single-arm.' }
        ]
    }
];
async function injectWorkoutHistoryViaAPI() {
    try {
        console.log('🚀 Starting complete workout history injection...');
        // 1. Login to get JWT token
        console.log('🔐 Logging in...');
        const loginResponse = await (0, node_fetch_1.default)(`${API_BASE}/auth/login`, {
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
        const loginData = await loginResponse.json();
        const token = loginData.data.accessToken;
        console.log('✅ Login successful');
        // 2. Get all exercises to map names to IDs
        console.log('📋 Fetching exercise list...');
        const exercisesResponse = await (0, node_fetch_1.default)(`${API_BASE}/exercises`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!exercisesResponse.ok) {
            console.log('❌ Failed to fetch exercises');
            return;
        }
        const exercisesData = await exercisesResponse.json();
        const exercises = exercisesData.data.exercises;
        // Create exercise name to ID mapping
        const exerciseMap = new Map();
        exercises.forEach((exercise) => {
            exerciseMap.set(exercise.name, exercise.id);
        });
        console.log(`✅ Found ${exercises.length} exercises`);
        // 3. Check existing workout days to avoid duplicates
        console.log('📅 Checking existing workout days...');
        const workoutDaysResponse = await (0, node_fetch_1.default)(`${API_BASE}/workout-days`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let existingDates = new Set();
        if (workoutDaysResponse.ok) {
            const workoutDaysData = await workoutDaysResponse.json();
            const workoutDays = workoutDaysData.data.workoutDays || [];
            workoutDays.forEach((day) => {
                existingDates.add(day.date.split('T')[0]); // Extract date part
            });
            console.log(`✅ Found ${existingDates.size} existing workout days`);
        }
        // 4. Create workout days and set records
        console.log('💪 Creating workout history...');
        for (const workout of workoutHistory) {
            console.log(`\n📅 Processing workout: ${workout.date} - ${workout.split}`);
            // Skip if workout day already exists
            if (existingDates.has(workout.date)) {
                console.log(`⏭️ Skipping ${workout.date} - already exists`);
                continue;
            }
            // Create workout day
            const createWorkoutDayResponse = await (0, node_fetch_1.default)(`${API_BASE}/workout-days`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: workout.date + 'T05:00:00.000Z', // 5 AM UTC
                    completed: true
                })
            });
            if (!createWorkoutDayResponse.ok) {
                console.log(`❌ Failed to create workout day for ${workout.date}`);
                continue;
            }
            const workoutDayData = await createWorkoutDayResponse.json();
            const workoutDayId = workoutDayData.data.workoutDay.id;
            console.log(`✅ Created workout day: ${workoutDayId}`);
            // Create set records for each exercise
            for (const exercise of workout.exercises) {
                const exerciseId = exerciseMap.get(exercise.name);
                if (!exerciseId) {
                    console.log(`⚠️ Exercise not found: ${exercise.name}`);
                    continue;
                }
                // Create sets for this exercise
                for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
                    const set = exercise.sets[setIndex];
                    if (!set || set.w === undefined || set.r === undefined) {
                        console.log(`  ⚠️ Skipping invalid set ${setIndex + 1} for ${exercise.name}`);
                        continue;
                    }
                    const createSetResponse = await (0, node_fetch_1.default)(`${API_BASE}/set-records`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            workoutDayId: workoutDayId,
                            exerciseId: exerciseId,
                            setIndex: setIndex,
                            plannedWeight: set.w,
                            plannedReps: set.r,
                            actualWeight: set.w,
                            actualReps: set.r,
                            secondsRest: 120
                        })
                    });
                    if (createSetResponse.ok) {
                        console.log(`  ✅ Created set ${setIndex + 1} for ${exercise.name}: ${formatWeight(set.w)} x ${set.r} reps`);
                    }
                    else {
                        console.log(`  ❌ Failed to create set ${setIndex + 1} for ${exercise.name}`);
                    }
                }
            }
        }
        console.log('\n🎉 Workout history injection completed!');
        console.log(`📊 Final Summary:`);
        console.log(`   - User: anish15may@gmail.com`);
        console.log(`   - Exercise templates: ${exerciseMap.size}`);
        console.log(`   - Historical workouts: ${workoutHistory.length}`);
        const totalSets = workoutHistory.reduce((total, workout) => total + workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0), 0);
        console.log(`   - Total sets: ${totalSets}`);
    }
    catch (error) {
        console.error('❌ Error in workout history injection:', error);
        throw error;
    }
}
// Run the script
if (require.main === module) {
    injectWorkoutHistoryViaAPI()
        .then(() => {
        console.log('✅ Workout history injection completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Workout history injection failed:', error);
        process.exit(1);
    });
}
exports.default = injectWorkoutHistoryViaAPI;
