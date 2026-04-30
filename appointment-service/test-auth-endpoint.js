async function testAuthEndpoint() {
  try {
    console.log('🧪 Testing auth-service /users/:id endpoint...\n');
    
    const userId = '00000000-0000-0000-0000-000000000015';
    const url = `http://localhost:3001/api/auth/users/${userId}`;
    
    console.log(`URL: ${url}\n`);
    
    const response = await fetch(url);
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! User data retrieved:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Phone: ${data.phone || 'NOT SET'}`);
      console.log(`   Role: ${data.role}`);
      console.log('\n🎉 Auth-service is working! Notifications should now work.');
    } else {
      const errorData = await response.json();
      console.log('\n❌ Failed!');
      console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      console.log('\n💡 Make sure you restarted auth-service after the fix!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Is auth-service running on port 3001?');
  }
}

testAuthEndpoint();
