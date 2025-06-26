// Debug API client locally
const API_BASE_URL = 'http://localhost:3001';

// Simulate the API client constructor logic
function testAPIConstruction(baseURL) {
  const cleanBaseURL = baseURL.replace(/\/api\/v1\/?$/, '');
  const finalBaseURL = `${cleanBaseURL}/api/v1`;

  console.log('🔍 API Construction Test:', {
    originalBaseURL: baseURL,
    cleanBaseURL,
    finalBaseURL,
  });

  // Test endpoint construction
  const endpoint = '/auth/login';
  const finalURL = `${finalBaseURL}${endpoint}`;

  console.log('🔍 Final URL:', finalURL);

  return finalURL;
}

// Test different scenarios
console.log('=== Testing API URL Construction ===');
testAPIConstruction('http://localhost:3001');
testAPIConstruction('http://localhost:3001/api/v1');
testAPIConstruction('https://ironlog.onrender.com');
testAPIConstruction('https://ironlog.onrender.com/api/v1');
