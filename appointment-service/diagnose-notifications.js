// Comprehensive notification diagnostic script
const fetch = require('node-fetch');

// Polyfill fetch for older Node.js versions
globalThis.fetch = globalThis.fetch || fetch;

async function diagnoseNotifications() {
  console.log('🔍 NOTIFICATION DIAGNOSTIC TOOL\n');
  console.log('='.repeat(60));
  
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
  const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3004';
  
  // Test 1: Check Auth Service
  console.log('\n📋 TEST 1: Auth Service Status');
  console.log('-'.repeat(60));
  try {
    const authHealth = await fetch(`${authServiceUrl}/health`);
    console.log(`Auth Service Status: ${authHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
    
    if (authHealth.ok) {
      // Try to fetch your user (ID: 15)
      const userRes = await fetch(`${authServiceUrl}/api/auth/users/15`);
      if (userRes.ok) {
        const user = await userRes.json();
        console.log(`✅ User Found: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'NOT SET'}`);
        console.log(`   Role: ${user.role}`);
      } else {
        console.log(`❌ User ID 15 NOT FOUND`);
      }
    }
  } catch (err) {
    console.log(`❌ Auth Service Error: ${err.message}`);
  }
  
  // Test 2: Check Notification Service
  console.log('\n📋 TEST 2: Notification Service Status');
  console.log('-'.repeat(60));
  try {
    const notifHealth = await fetch(`${notificationServiceUrl}/health`);
    console.log(`Notification Service Status: ${notifHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
    if (notifHealth.ok) {
      const healthData = await notifHealth.json();
      console.log(`   Health Data: ${JSON.stringify(healthData)}`);
    }
  } catch (err) {
    console.log(`❌ Notification Service Error: ${err.message}`);
  }
  
  // Test 3: Check Appointment Service
  console.log('\n📋 TEST 3: Appointment Service Status');
  console.log('-'.repeat(60));
  try {
    const apptHealth = await fetch(`${appointmentServiceUrl}/health`);
    console.log(`Appointment Service Status: ${apptHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
  } catch (err) {
    console.log(`❌ Appointment Service Error: ${err.message}`);
  }
  
  // Test 4: Direct Notification Test
  console.log('\n📋 TEST 4: Direct Email Notification Test');
  console.log('-'.repeat(60));
  try {
    // First get your email from auth service
    const userRes = await fetch(`${authServiceUrl}/api/auth/users/15`);
    if (userRes.ok) {
      const user = await userRes.json();
      
      console.log(`Sending test email to: ${user.email}`);
      
      const testNotif = await fetch(`${notificationServiceUrl}/api/notifications/appointment-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: user.email,
          patientPhone: user.phone || '+94711234567',
          patientName: user.name,
          doctorEmail: 'testdoctor@example.com',
          doctorPhone: '+94771234567',
          doctorName: 'Test Doctor',
          appointmentId: 'test-diagnostic-123',
          appointmentDate: 'April 30, 2026',
          appointmentTime: '10:00 AM',
          amount: 3000
        })
      });
      
      if (testNotif.ok) {
        const result = await testNotif.json();
        console.log('✅ Test notification sent successfully!');
        console.log(`   Jobs Queued: ${result.jobsQueued}`);
        console.log(`   Details: ${JSON.stringify(result.jobs, null, 2)}`);
        console.log('\n📧 CHECK YOUR EMAIL (including spam folder):');
        console.log(`   ${user.email}`);
      } else {
        const errorText = await testNotif.text();
        console.log('❌ Failed to send test notification');
        console.log(`   Error: ${errorText}`);
      }
    } else {
      console.log('❌ Cannot get user email - auth service issue');
    }
  } catch (err) {
    console.log(`❌ Test notification error: ${err.message}`);
  }
  
  // Test 5: Check Recent Appointments
  console.log('\n📋 TEST 5: Recent Appointments for User 15');
  console.log('-'.repeat(60));
  try {
    // This would need a valid token, so we'll skip it
    console.log('⚠️  Skipping - requires authentication token');
    console.log('   To check your appointments, login and view them in the app');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DIAGNOSIS COMPLETE\n');
  
  console.log('NEXT STEPS:');
  console.log('1. If Auth Service is ❌ - Start auth-service');
  console.log('2. If Notification Service is ❌ - Start notification-service');
  console.log('3. If Test Email failed - Check notification service logs');
  console.log('4. If Test Email succeeded but no email received - Check email configuration');
  console.log('5. Book a new appointment and watch the appointment-service logs');
}

diagnoseNotifications();
