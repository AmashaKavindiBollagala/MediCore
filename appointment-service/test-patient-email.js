async function testSinglePatientEmail() {
  try {
    console.log('🧪 Testing SINGLE patient email only...\n');
    
    const response = await fetch('http://localhost:3000/api/notifications/email/appointment-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'amashakav23@gmail.com',
        patientName: 'Test Patient',
        doctorName: 'Test Doctor',
        date: 'April 29, 2026',
        time: '12:00 PM',
        appointmentId: 'single-test-789'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(data, null, 2));
    console.log('\n📧 Check your email at: amashakav23@gmail.com');
    console.log('📋 Watch the notification service terminal for processing logs...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSinglePatientEmail();
