#!/usr/bin/env node

// Simple JavaScript test script to verify API paths are working
const API_BASE = 'https://ironlog.onrender.com/api/v1';

async function testAPI() {
  try {
    console.log('🔐 Testing login API...');
    
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
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', loginResponse.status, errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    const token = loginData.data.accessToken;
    
    // Test exercises endpoint
    console.log('📋 Testing exercises API...');
    const exercisesResponse = await fetch(`${API_BASE}/exercises`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!exercisesResponse.ok) {
      console.log('❌ Failed to fetch exercises:', exercisesResponse.status);
      return;
    }

    const exercisesData = await exercisesResponse.json();
    console.log('✅ Exercises fetched successfully:', exercisesData.data.exercises.length, 'exercises');
    
    console.log('🎉 All API endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
