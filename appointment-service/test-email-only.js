async function testEmailOnlyNotification() {
  try {
    console.log('🧪 Testing email-only notification (no SMS)...\n');
    
    const response = await fetch('http://localhost:3000/api/notifications/appointment-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientEmail: 'amashakav23@gmail.com',
        patientPhone: '',  // No SMS
        patientName: 'Test Patient',
        doctorEmail: 'amashakav23@gmail.com',
        doctorPhone: '',  // No SMS
        doctorName: 'Test Doctor',
        appointmentId: 'test-email-only-123',
        appointmentDate: 'April 29, 2026',
        appointmentTime: '11:00 AM',
        amount: 1500
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));
    console.log('\n📧 Check your email at: amashakav23@gmail.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmailOnlyNotification();
