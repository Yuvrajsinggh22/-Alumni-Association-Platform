const axios = require('axios');

const testRegistration = async () => {
  console.log('🔍 Debugging Registration Issue\n');

  // Test data that matches our validation schema
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.test@example.com',
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
    console.log('📡 Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is healthy:', healthResponse.data);

    console.log('\n📝 Sending registration request...');
    console.log('Data being sent:', JSON.stringify(testUser, null, 2));

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ Registration failed!');
    
    if (error.response) {
      console.log('Status Code:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('Network Error - No response received');
      console.log('Request details:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testRegistration();
