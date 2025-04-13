// Test script for Health Insights Navigator API
async function testApiConnection() {
  console.log('Testing API connection...');
  
  let API_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  
  // Ensure API_URL is absolute
  if (!API_URL.startsWith('http')) {
    API_URL = `http://localhost:5001${API_URL.startsWith('/') ? API_URL : `/${API_URL}`}`;
  }
  
  console.log(`Using API URL: ${API_URL}`);
  
  try {
    // Test health endpoint
    console.log(`Testing health endpoint: ${API_URL}/health`);
    const healthResponse = await fetch(`${API_URL}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('Health check successful:', healthData);
    
    // Test login endpoint
    console.log(`Testing login endpoint: ${API_URL}/users/login`);
    const loginResponse = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login test failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login test successful:', loginData);
    
    console.log('\nAll tests passed! API is working correctly.');
  } catch (error) {
    console.error('\nAPI test failed:', error.message);
    process.exit(1);
  }
}

testApiConnection(); 