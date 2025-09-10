const axios = require('axios');

const testRegistration = async () => {
  console.log('🧪 Testing Alumni Platform Registration...\n');

  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    phone: '+1234567890',
    graduationYear: 2020,
    degree: 'B.Tech',
    branch: 'Computer Science',
    rollNumber: 'CS2020001',
    currentPosition: 'Software Engineer',
    currentCompany: 'Tech Corp',
    location: 'San Francisco, CA'
  };

  try {
    console.log('📡 Sending registration request...');
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('✅ Registration successful!');
    console.log('📋 Response:', {
      success: response.data.success,
      message: response.data.message,
      userId: response.data.user?.id,
      email: response.data.user?.email
    });

    // Test login with the same credentials
    console.log('\n🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });

    console.log('✅ Login successful!');
    console.log('📋 Login Response:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      hasToken: !!loginResponse.data.token
    });

  } catch (error) {
    console.log('❌ Test failed!');
    if (error.response) {
      console.log('📋 Error Response:', {
        status: error.response.status,
        message: error.response.data?.error || error.response.data?.message,
        details: error.response.data?.details
      });
    } else if (error.request) {
      console.log('📋 Network Error: Could not connect to server');
      console.log('   Make sure the backend server is running on http://localhost:5000');
    } else {
      console.log('📋 Error:', error.message);
    }
  }
};

// Test server health first
const testServerHealth = async () => {
  try {
    console.log('🏥 Checking server health...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is healthy!');
    console.log('📋 Health check:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server health check failed!');
    console.log('   Make sure the backend server is running on http://localhost:5000');
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Alumni Platform Registration Test\n');
  
  const serverHealthy = await testServerHealth();
  if (serverHealthy) {
    console.log('\n' + '='.repeat(50));
    await testRegistration();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test completed!');
};

runTests();
