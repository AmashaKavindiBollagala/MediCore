async function testDirectNotification() {
  try {
    console.log('🧪 Testing direct notification to notification service...\n');
    
    const response = await fetch('http://localhost:3000/api/notifications/appointment-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientEmail: 'amashakav23@gmail.com',
        patientPhone: '+94711234567',
        patientName: 'Test Patient',
        doctorEmail: 'testdoctor@example.com',
        doctorPhone: '+94771234567',
        doctorName: 'Test Doctor',
        appointmentId: 'test-appointment-123',
        appointmentDate: 'April 29, 2026',
        appointmentTime: '10:30 AM',
        amount: 1500
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));
    console.log('\n📧 Check your email and phone for notifications!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectNotification();
