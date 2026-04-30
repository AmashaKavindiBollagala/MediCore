// Test notification via API
const axios = require('axios');

const TEST_EMAIL = 'amashakav23@gmail.com'; // Change this to your email

async function testNotification() {
  try {
    console.log('📧 Sending test notification...');
    
    const response = await axios.post(
      'http://localhost:3000/api/notifications/email/appointment-confirmation',
      {
        to: TEST_EMAIL,
        patientName: 'Test Patient',
        doctorName: 'Test Doctor',
        date: 'April 28, 2026',
        time: '10:00 AM',
        appointmentId: 'test-123'
      }
    );
    
    console.log('✅ Response:', response.data);
    console.log(`\n📧 Check your email at: ${TEST_EMAIL}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNotification();
