const axios = require('axios');

const testConnection = async () => {
  console.log('🔧 Testing Frontend-Backend Connection\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Registration with correct fields
    console.log('\n2️⃣ Testing registration with updated fields...');
    const testUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe.test@example.com',
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

    const regResponse = await axios.post('http://localhost:5000/api/auth/register', testUser);
    console.log('✅ Registration successful:', {
      success: regResponse.data.success,
      message: regResponse.data.message,
      userId: regResponse.data.user?.id
    });

    // Test 3: Login
    console.log('\n3️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', {
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token
    });

    // Test 4: Protected route access
    console.log('\n4️⃣ Testing protected route access...');
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('✅ Profile access successful:', {
      userId: profileResponse.data.user?.id,
      email: profileResponse.data.user?.email
    });

    console.log('\n🎉 All tests passed! Frontend-Backend connection is working properly.');

  } catch (error) {
    console.log('❌ Test failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data?.error || error.response.data?.message);
      if (error.response.data?.details) {
        console.log('Details:', JSON.stringify(error.response.data.details, null, 2));
      }
    } else if (error.request) {
      console.log('Network Error: Could not connect to server');
    } else {
      console.log('Error:', error.message);
    }
  }
};

testConnection();
