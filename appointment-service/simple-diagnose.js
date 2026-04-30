// Simple diagnostic using node-fetch
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function makePostRequest(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function diagnoseNotifications() {
  console.log('🔍 NOTIFICATION DIAGNOSTIC TOOL\n');
  console.log('='.repeat(60));
  
  const authServiceUrl = 'http://localhost:3001';
  const notificationServiceUrl = 'http://localhost:3000';
  const appointmentServiceUrl = 'http://localhost:3004';
  
  // Test 1: Check Auth Service
  console.log('\n📋 TEST 1: Auth Service Status');
  console.log('-'.repeat(60));
  try {
    const authHealth = await makeRequest(`${authServiceUrl}/health`);
    console.log(`Auth Service Status: ${authHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
    
    if (authHealth.status === 200) {
      // Try to fetch your user (ID: 15)
      const userRes = await makeRequest(`${authServiceUrl}/api/auth/users/15`);
      if (userRes.status === 200) {
        const user = userRes.data;
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
    console.log(`   Make sure auth-service is running on port 3001`);
  }
  
  // Test 2: Check Notification Service
  console.log('\n📋 TEST 2: Notification Service Status');
  console.log('-'.repeat(60));
  try {
    const notifHealth = await makeRequest(`${notificationServiceUrl}/health`);
    console.log(`Notification Service Status: ${notifHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
    if (notifHealth.status === 200) {
      console.log(`   Health Data: ${JSON.stringify(notifHealth.data)}`);
    }
  } catch (err) {
    console.log(`❌ Notification Service Error: ${err.message}`);
    console.log(`   Make sure notification-service is running on port 3000`);
  }
  
  // Test 3: Check Appointment Service
  console.log('\n📋 TEST 3: Appointment Service Status');
  console.log('-'.repeat(60));
  try {
    const apptHealth = await makeRequest(`${appointmentServiceUrl}/health`);
    console.log(`Appointment Service Status: ${apptHealth.status === 200 ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
  } catch (err) {
    console.log(`❌ Appointment Service Error: ${err.message}`);
    console.log(`   Make sure appointment-service is running on port 3004`);
  }
  
  // Test 4: Direct Notification Test
  console.log('\n📋 TEST 4: Direct Email Notification Test');
  console.log('-'.repeat(60));
  try {
    // First get your email from auth service
    const userRes = await makeRequest(`${authServiceUrl}/api/auth/users/15`);
    if (userRes.status === 200) {
      const user = userRes.data;
      
      console.log(`Sending test email to: ${user.email}`);
      
      const testNotif = await makePostRequest(`${notificationServiceUrl}/api/notifications/appointment-booking`, {
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
      });
      
      if (testNotif.status === 200 || testNotif.status === 201) {
        console.log('✅ Test notification sent successfully!');
        console.log(`   Response: ${JSON.stringify(testNotif.data, null, 2)}`);
        console.log('\n📧 CHECK YOUR EMAIL (including spam folder):');
        console.log(`   ${user.email}`);
      } else {
        console.log('❌ Failed to send test notification');
        console.log(`   Status: ${testNotif.status}`);
        console.log(`   Response: ${JSON.stringify(testNotif.data)}`);
      }
    } else {
      console.log('❌ Cannot get user email - auth service issue');
    }
  } catch (err) {
    console.log(`❌ Test notification error: ${err.message}`);
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
