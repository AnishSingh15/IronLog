#!/usr/bin/env node

// Quick test to check if the uncomplete endpoint works
const API_BASE = 'http://localhost:3001/api/v1';

async function testUncompleteEndpoint() {
  try {
    console.log('🧪 Testing PATCH /workouts/:id/uncomplete endpoint...');

    // First, let's login to get a token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'anish15may@gmail.com',
        password: 'Qaz@1234',
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.data.tokens.accessToken;
    console.log('✅ Login successful, got token');

    // Get today's workout
    const todayResponse = await fetch(`${API_BASE}/workouts/today`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let workoutId;
    if (todayResponse.status === 404) {
      console.log('📝 No workout today, creating one...');

      // Start a workout
      const startResponse = await fetch(`${API_BASE}/workouts/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          splitKey: 'CHEST_TRI',
        }),
      });

      if (!startResponse.ok) {
        console.log('❌ Failed to start workout:', startResponse.status);
        return;
      }

      const startData = await startResponse.json();
      workoutId = startData.data.workoutDay.id;
      console.log('✅ Workout started:', workoutId);
    } else {
      const todayData = await todayResponse.json();
      workoutId = todayData.data.workoutDay.id;
      console.log("✅ Found today's workout:", workoutId);
    }

    // Now test the uncomplete endpoint
    console.log('🔄 Testing uncomplete endpoint...');
    const uncompleteResponse = await fetch(`${API_BASE}/workouts/${workoutId}/uncomplete`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (uncompleteResponse.ok) {
      const uncompleteData = await uncompleteResponse.json();
      console.log('✅ Uncomplete endpoint works!');
      console.log('Response:', JSON.stringify(uncompleteData, null, 2));
    } else {
      console.log('❌ Uncomplete endpoint failed:', uncompleteResponse.status);
      const errorText = await uncompleteResponse.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUncompleteEndpoint();
