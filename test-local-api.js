// Simple test to verify API paths
// Using built-in fetch (Node 18+)

async function testLocalAPI() {
  const baseURL = 'http://localhost:3001';
  const testURLs = [`${baseURL}/health`, `${baseURL}/api/v1/exercises`];

  console.log('Testing local API endpoints...');

  for (const url of testURLs) {
    try {
      console.log(`\n🔍 Testing: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`Status: ${response.status}`);
      if (response.status < 500) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testLocalAPI();
