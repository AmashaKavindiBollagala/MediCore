// Test script to check doctor profile endpoint
const axios = require('axios');

async function testDoctorProfile() {
  try {
    console.log('Testing doctor profile endpoint...\n');
    
    // First, login as a doctor
    console.log('Step 1: Logging in as doctor...');
    const loginRes = await axios.post('http://localhost:8080/auth/login', {
      email: 'sss@gmail.com',
      password: 'sss123'  // You may need to use the actual password
    });
    
    console.log('Login response status:', loginRes.status);
    const token = loginRes.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('User:', loginRes.data.user);
    
    // Now fetch profile
    console.log('\nStep 2: Fetching doctor profile...');
    const profileRes = await axios.get('http://localhost:8080/doctors/me/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Profile response status:', profileRes.status);
    console.log('Profile data:', profileRes.data);
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDoctorProfile();
