// Test script to verify the UUID issue and solution
const fetch = require('node-fetch');

async function testUUIDIssue() {
  const authServiceUrl = 'http://localhost:3001'; // Adjust port if needed
  
  console.log('=== Testing UUID Issue ===\n');
  
  // Test 1: Try with fake UUID (current broken behavior)
  const fakeUUID = '00000000-0000-0000-0000-000000000015';
  console.log('Test 1: Fetching user with FAKE UUID:', fakeUUID);
  try {
    const res1 = await fetch(`${authServiceUrl}/api/auth/users/${fakeUUID}`);
    console.log('Status:', res1.status);
    if (res1.ok) {
      const data1 = await res1.json();
      console.log('Result:', JSON.stringify(data1, null, 2));
    } else {
      console.log('Error: User not found with fake UUID');
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Try with actual integer ID (should work)
  const actualId = '15';
  console.log('Test 2: Fetching user with ACTUAL ID:', actualId);
  try {
    const res2 = await fetch(`${authServiceUrl}/api/auth/users/${actualId}`);
    console.log('Status:', res2.status);
    if (res2.ok) {
      const data2 = await res2.json();
      console.log('Result:', JSON.stringify(data2, null, 2));
      console.log('\n✅ This should work! Email:', data2.email);
    } else {
      console.log('Error: User not found');
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testUUIDIssue();
